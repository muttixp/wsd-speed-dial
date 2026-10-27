// WSD Speed Dial - Copyright (C) 2026 muttixp
//
// Bu program ozgur yazilimdir: Free Software Foundation tarafindan
// yayimlanan GNU Genel Kamu Lisansi'nin 3. surumu ya da (tercihinize
// bagli olarak) daha sonraki bir surumu kosullariyla yeniden
// dagitabilir ve/veya degistirebilirsiniz.
//
// Bu program faydali olacagi umuduyla dagitilmaktadir; ancak HICBIR
// GARANTI VERILMEZ. Ayrintilar icin GNU Genel Kamu Lisansi'na bakin.
// Lisans metni: LICENSE dosyasi - https://www.gnu.org/licenses/

// WSD Speed Dial - kucuk resim yakalama
//
// Iki yol var, sirayla deneniyor:
//   1) SAYFA ETIKETLERI - og:image / twitter:image. Hizli (tek fetch),
//      cogu sitede kaliteli sonuc veriyor.
//   2) EKRAN GORUNTUSU - etiket yoksa sayfa gorunmez bir pencerede acilip
//      yakalaniyor. Yavas (saniyeler) ama her sitede calisiyor.
//
// Yakalama SIRALI kuyrukta yapiliyor. Es zamanli calistirmak cazip ama her
// yakalama gercek bir pencere aciyor; toplu istekte tarayici bogulup cogunu
// atliyor.

import { ayarlariAl } from './ayar.js';
import { c } from './dil.js';

const YAKALAMA_ARASI_MS = 700;
const ZAMAN_ASIMI_MS = 15000;

/** Tek bir yakalama isinin en fazla suresi. Asilirsa is atlaniyor. */
const YAKALAMA_TAVANI_MS = 45000;

/**
 * Sozu zaman asimina baglar. chrome.debugger komutlari ve
 * captureVisibleTab bazi sayfalarda HIC yanit vermiyor; kuyruk orada
 * duruyor, acilan sekme/pencere kapanmiyordu.
 */
function zamanAsimli(soz, ms, etiket = 'islem') {
    return Promise.race([
        soz,
        new Promise((_, at) => setTimeout(() => at(new Error(etiket + ' zaman asimi')), ms))
    ]);
}

/**
 * fetch + ZAMAN ASIMI (1.5.2). Baglantiyi kabul edip hic yanit vermeyen
 * sunucuda `fetch` sonsuza kadar bekliyor; "oto" yontemde sayfa gorseli
 * aranirken kuyruk o kartta takilip kaliyordu.
 */
async function sureliFetch(adres, secenek = {}, ms = 12000) {
    const kontrol = new AbortController();
    const sayac = setTimeout(() => kontrol.abort(), ms);
    try {
        return await fetch(adres, { ...secenek, signal: kontrol.signal });
    } finally {
        clearTimeout(sayac);
    }
}

// KUYRUK DEPODA da tutuluyor.
//
// MV3'te servis iscisi kalici degil: bosta kalinca tarayici sonlandiriyor
// ve bellekteki kuyruk yok oluyor. 30 kartlik bir yenilemede ilk 10-15
// tanesi yenilenip gerisi SESSIZCE kaliyordu.
//
// Cozum: kalan is listesi her adimda depoya yaziliyor ve bir alarm
// iscisi periyodik uyandiriyor. Isci uyansa bile kaldigi yerden devam
// ediyor. Kuyruk bitince alarm kapaniyor.
const KUYRUK_ANAHTARI = 'yakalamaKuyrugu';
const ALARM_ADI = 'wsdYakalama';

const kuyruk = [];
let calisiyor = false;
let iptal = false;
let biterken = null;

// IPTAL ANINDA KAPAT (1.5.4): "Bekleyenleri iptal et" yalnizca SIRADAKI
// isleri siliyordu; o an islenen kart (gizli sekme ya da pencere,
// gizli olmazsa pencere kipiyle ikinci deneme - 150 sn'ye kadar)
// sonuna kadar suruyordu ve kullanici iptal olmadi saniyordu. Acik
// yakalama sekme/pencereleri burada tutuluyor, iptalde kapatiliyor;
// islenen kartin beklemesi de hemen bitiriliyor.
const acikSekmeler = new Set();
const acikPencereler = new Set();
let iptalCoz = null;        // depodan devam ederken kullanilacak geri cagirma

// TAKILMA BEKCISI (1.5.2). Dongu bir `await`te sonsuza kadar kalirsa
// `calisiyor` hep true kaliyor ve kuyruk bir daha baslamiyordu. Her
// kartta zaman damgasi basiliyor; alarm (dakikada bir) damga cok eskiyse
// yeni bir dongu baslatiyor. Eski dongu sonradan uyanirsa `nesil`
// tutmadigi icin kendiliginden cikiyor.
let nesil = 0;
let sonIlerleme = 0;
const TAKILMA_MS = 3 * 60 * 1000;
/** Bir kartin TUM islemi icin ust sinir (sayfa gorselleri + ekran + kayit). */
const IS_TAVANI_MS = 150000;

// ISCI UYUMASIN: MV3 iscisi 30 sn olay gelmezse sonlandiriliyor. Uzun
// suren tek bir yakalamada (zaman asimi bekleyen kart) isci olup kuyruk
// alarm gelene kadar duruyordu. Dongu surerken 20 sn'de bir ucuz bir
// API cagrisi bosta sayacini sifirliyor.
let canliTut = null;
function canliTutmayiAc() {
    if (canliTut) return;
    canliTut = setInterval(() => { chrome.runtime.getPlatformInfo(() => void chrome.runtime.lastError); }, 20000);
}
function canliTutmayiKapat() { clearInterval(canliTut); canliTut = null; }

// ISLENENLER: kuyruktan cikip su an islenen url'ler.
// Sadece `kuyruk` kontrol edilirse, isleme baslamis bir url icin gelen
// ikinci istek gecip IKINCI BIR POPUP aciyordu (sag tik menusu + bookmarks
// .onCreated ayni karti iki kez tetikliyor).
const islenenler = new Set();

/** Kuyruga ekler. Ayni url bekliyorsa ya da isleniyorsa tekrar girmez. */
/**
 * @param oncelik  KULLANICININ istedigi yenileme (kart/grup "Yenile").
 *   Arka plandaki birikmis islerin (yeni eklenen yer imleri, onceki
 *   toplu yenilemenin kalani) ONUNE geciyor; kendi aralarinda istek
 *   sirasini koruyor. Once hep sona ekleniyordu: X grubunu yenileyince
 *   donenceler X'te donuyor ama kuyruk once baska kartlari isliyordu.
 */
export function yakalamayaEkle(url, bitince, oncelik = false, kip = null) {
    if (!url) return;
    if (islenenler.has(url)) return;

    const mevcut = kuyruk.findIndex(i => i.url === url);
    if (mevcut >= 0) {
        // Zaten bekliyor: oncelikli istendiyse one al
        if (!oncelik || kuyruk[mevcut].oncelik) return;
        kuyruk.splice(mevcut, 1);
    }

    iptal = false;             // yeni is geldi - iptal bayragi sifirlansin
    // kip: 'gizli' -> ayardan bagimsiz pencere acmadan (ice aktarma sorusu, 1.5.5)
    const is = { url, bitince, oncelik, kip };
    if (oncelik) {
        const ilkSiradan = kuyruk.findIndex(i => !i.oncelik);
        if (ilkSiradan < 0) kuyruk.push(is);
        else kuyruk.splice(ilkSiradan, 0, is);
    } else {
        kuyruk.push(is);
    }
    biterken = bitince || biterken;
    kuyrugaYaz();
    alarmiKur();

    if (!calisiyor) kuyruguIsle();
}

/** Kalan isleri depoya yazar - isci olurse buradan devam edilecek. */
function kuyrugaYaz() {
    // Oncelik de yaziliyor: kullanicinin baslattigi yenileme (o: 1) isci
    // yeniden baslayinca "cok buyuk kuyruk" sinirina takilip iptal olmasin
    const liste = kuyruk.map(i => (i.oncelik || i.kip
        ? { u: i.url, ...(i.oncelik ? { o: 1 } : {}), ...(i.kip ? { k: i.kip } : {}) }
        : i.url));
    chrome.storage.local.set({ [KUYRUK_ANAHTARI]: liste }).catch(() => {});
}

function alarmiKur() {
    // 1 dakika en kisa periyot; daha sik istenemiyor
    chrome.alarms.create(ALARM_ADI, { periodInMinutes: 1 });
}

function alarmiKapat() {
    chrome.alarms.clear(ALARM_ADI).catch(() => {});
    chrome.storage.local.remove(KUYRUK_ANAHTARI).catch(() => {});
}

/**
 * Isci uyandiginda cagriliyor: depoda bekleyen is varsa devam eder.
 * @param bitince  yakalama tamamlaninca cagrilacak fonksiyon
 */
/** Bekleyen tum yakalama islerini iptal eder. */
export async function kuyrugaTemizle() {
    const adet = kuyruk.length + islenenler.size;
    kuyruk.length = 0;
    iptal = true;              // isleme dongusu bir sonraki adimda cikar
    alarmiKapat();
    // Islenmekte olani da birak: bekleyen adimi bitir, sekme/pencereyi kapat
    if (iptalCoz) { try { iptalCoz(); } catch (e) { /* */ } iptalCoz = null; }
    for (const id of acikSekmeler) chrome.tabs.remove(id).catch(() => {});
    for (const id of acikPencereler) chrome.windows.remove(id).catch(() => {});
    acikSekmeler.clear();
    acikPencereler.clear();
    try {
        const d = await chrome.storage.local.get(KUYRUK_ANAHTARI);
        const depoda = Array.isArray(d[KUYRUK_ANAHTARI]) ? d[KUYRUK_ANAHTARI].length : 0;
        await chrome.storage.local.remove(KUYRUK_ANAHTARI);
        return Math.max(adet, depoda);
    } catch (e) {
        return adet;
    }
}

// Makul bir ust sinir. Bunun ustu kullanicinin baslattigi bir is degil,
// kazayla olusmus demektir (ornek: ice aktarmada her kart icin
// onCreated tetiklenmis). Sessizce dakikalarca pencere acmaktansa
// kuyrugu iptal edip haber veriyoruz.
const KUYRUK_SINIRI = 300;

export async function kuyrugaDevamEt(bitince) {
    try {
        const d = await chrome.storage.local.get(KUYRUK_ANAHTARI);
        const ham = d[KUYRUK_ANAHTARI];
        if (!Array.isArray(ham) || !ham.length) {
            if (!calisiyor) alarmiKapat();
            return;
        }
        // Eski bicim: duz url dizisi. Yeni: { u, o } (oncelikli) ya da url
        const kalan = ham.map(x => (typeof x === 'string' ? { url: x, oncelik: false }
                                                          : { url: x && x.u, oncelik: !!(x && x.o), kip: (x && x.k) || null }))
                         .filter(x => x.url);

        // SINIR YALNIZCA ARKA PLAN ISLERINE: kullanicinin "Gorselleri
        // yenile" dedigi kartlar (oncelikli) kac tane olursa olsun
        // islenir. Eskiden 300'den buyuk bir grup yenilenirken isci
        // yeniden baslarsa tum kuyruk sessizce iptal ediliyordu.
        const siradan = kalan.filter(x => !x.oncelik);
        let islenecek = kalan;
        if (siradan.length > KUYRUK_SINIRI) {
            console.log(`[WSD] arka plan kuyrugu cok buyuk (${siradan.length}) - o kisim iptal edildi`);
            islenecek = kalan.filter(x => x.oncelik);
        }

        for (const k of islenecek) {
            if (islenenler.has(k.url) || kuyruk.some(i => i.url === k.url)) continue;
            kuyruk.push({ url: k.url, bitince: bitince || biterken, oncelik: k.oncelik, kip: k.kip || null });
        }
        biterken = bitince || biterken;
        if (!kuyruk.length) { if (!calisiyor) alarmiKapat(); return; }

        if (!calisiyor) {
            console.log(`[WSD] kuyrukta ${kuyruk.length} is kaldi, devam ediliyor`);
            kuyruguIsle();
        } else if (Date.now() - sonIlerleme > TAKILMA_MS) {
            // Dongu calisiyor gorunuyor ama 3 dakikadir ilerlemedi: takildi
            console.log('[WSD] yakalama dongusu takilmis - yeniden baslatiliyor');
            islenenler.clear();
            kuyruguIsle();
        }
    } catch (e) {
        console.log('[WSD] kuyruk devami okunamadi:', e);
    }
}

/**
 * chrome:// edge:// about: gibi adresler yakalanamiyor: eklenti o
 * sayfalara ne enjekte edebiliyor ne de ekran goruntusu alabiliyor.
 * Bos kart yerine adresin kendisini yazan duz bir kart uretiyoruz.
 */
const YAKALANAMAZ_SEMA = /^(chrome|edge|brave|vivaldi|opera|about|chrome-extension|chrome-search|devtools|view-source):/i;

function semaKarti(url) {
    let sema = 'chrome', yol = url;
    try {
        const u = new URL(url);
        sema = u.protocol.replace(':', '');
        yol = (u.hostname || '') + (u.pathname === '/' ? '' : u.pathname);
    } catch (e) { /* cozulemedi - ham metin */ }

    const EN = 800, BOY = 500;
    const tuval = new OffscreenCanvas(EN, BOY);
    const ctx = tuval.getContext('2d');

    ctx.fillStyle = '#20242b';
    ctx.fillRect(0, 0, EN, BOY);

    // Ince cerceve - kart kenari belirsin
    ctx.strokeStyle = 'rgba(255,255,255,.10)';
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, EN - 6, BOY - 6);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Sema adi buyuk, yol kucuk
    ctx.fillStyle = '#5d93c2';
    ctx.font = 'bold 92px system-ui, sans-serif';
    ctx.fillText(sema + '://', EN / 2, BOY / 2 - 34);

    ctx.fillStyle = '#9aa3ad';
    ctx.font = '44px system-ui, sans-serif';
    const kisa = yol.length > 24 ? yol.slice(0, 23) + '…' : yol;
    ctx.fillText(kisa, EN / 2, BOY / 2 + 52);

    return tuval.convertToBlob({ type: 'image/png' }).then(blobDanDataUri);
}

/**
 * GORSEL ALINAMADIGINDA kart bomboş/siyah kaliyor ve kullanici
 * yakalamanin basarisiz oldugunu anlamiyordu. Adresi yazan sade bir
 * yer tutucu uretiyoruz; ekran goruntusuyle karismasin diye
 * "goruntu alinamadi" satiri da var.
 */
/**
 * YUMUSAK 404: sunucu 200 donuyor ama sayfa bombos (icerik silinmis,
 * yonlendirme yarim kalmis). HTTP koduna bakan tarama bunu goremiyor;
 * tek ipucu yakalanan karenin tek renk olmasi.
 *
 * Kare kucuk bir tuvale indirilip iki olcu birlikte araniyor:
 *   - farkli renk sayisi cok az
 *   - piksellerin ortalamadan sapmasi cok kucuk
 * Ikisi birden saglanmazsa dokunulmuyor; sade tasarimli siteler yanlis
 * yere bos sayilmasin.
 */
async function kareBosMu(dataUri) {
    try {
        const blob = await (await fetch(dataUri)).blob();
        const bmp = await createImageBitmap(blob);

        const N = 32;
        const t = new OffscreenCanvas(N, N);
        const x = t.getContext('2d', { willReadFrequently: true });
        x.drawImage(bmp, 0, 0, N, N);
        bmp.close();

        const p = x.getImageData(0, 0, N, N).data;
        const renkler = new Set();
        let toplam = 0;
        const parlaklik = [];

        for (let i = 0; i < p.length; i += 4) {
            // 16'sar basamak grupla: sikistirma gurultusu renk saymasin
            renkler.add((p[i] >> 4) + ',' + (p[i + 1] >> 4) + ',' + (p[i + 2] >> 4));
            const l = 0.2126 * p[i] + 0.7152 * p[i + 1] + 0.0722 * p[i + 2];
            parlaklik.push(l);
            toplam += l;
        }

        const ort = toplam / parlaklik.length;
        const sapma = Math.sqrt(
            parlaklik.reduce((a, l) => a + (l - ort) * (l - ort), 0) / parlaklik.length);

        return renkler.size <= 3 && sapma < 6;
    } catch (e) {
        return false;                 // olcemedik - dokunma
    }
}

async function yerTutucuKart(url) {
    let alan = url;
    try { alan = new URL(url).hostname.replace(/^www\./, ''); } catch (e) { /* ham metin */ }

    const EN = 800, BOY = 500;
    const tuval = new OffscreenCanvas(EN, BOY);
    const ctx = tuval.getContext('2d');

    ctx.fillStyle = '#23262c';
    ctx.fillRect(0, 0, EN, BOY);
    ctx.strokeStyle = 'rgba(255,255,255,.08)';
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, EN - 6, BOY - 6);

    // SIMGE: ustu cizili gorsel cercevesi. Metne ek olarak bir bakista
    // "burada goruntu yok" isareti veriyor.
    const sx = EN / 2, sy = BOY / 2 - 96, g = 54, y = 42;
    ctx.strokeStyle = '#7d8590';
    ctx.lineWidth = 5;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.roundRect(sx - g, sy - y, g * 2, y * 2, 8);       // cerceve
    ctx.stroke();
    ctx.beginPath();                                       // icindeki dag ve gunes
    ctx.moveTo(sx - g + 12, sy + y - 14);
    ctx.lineTo(sx - 8, sy - 2);
    ctx.lineTo(sx + 16, sy + y - 26);
    ctx.lineTo(sx + g - 12, sy + y - 14);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(sx + 20, sy - 14, 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();                                       // ustu cizik
    ctx.moveTo(sx - g - 10, sy + y + 10);
    ctx.lineTo(sx + g + 10, sy - y - 10);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = '#c9d1d9';
    ctx.font = 'bold 52px system-ui, sans-serif';
    const kisa = alan.length > 26 ? alan.slice(0, 25) + '…' : alan;
    ctx.fillText(kisa, EN / 2, BOY / 2 + 40);

    ctx.fillStyle = '#7d8590';
    ctx.font = '28px system-ui, sans-serif';
    ctx.fillText(c('goruntuAlinamadi'), EN / 2, BOY / 2 + 100);

    return tuval.convertToBlob({ type: 'image/png' }).then(blobDanDataUri);
}

async function kuyruguIsle() {
    const benimNeslim = ++nesil;
    calisiyor = true;
    sonIlerleme = Date.now();
    canliTutmayiAc();
    let basarisiz = 0;
    while (kuyruk.length) {
        if (benimNeslim !== nesil) return;      // bekci yeni dongu baslatmis
        if (iptal) {           // temizleme istendi - hemen cik
            kuyruk.length = 0;
            break;
        }
        const is = kuyruk.shift();
        sonIlerleme = Date.now();

        // KART HALA VAR MI? Kuyruk beklerken kart silinmis olabilir
        // ("her seyi sil" ya da tek kart silme). Yoksa sekme acip
        // gorsel yazmanin anlami yok; silinen kartin gorseli depoya
        // geri yaziliyordu.
        try {
            const dugumler = await zamanAsimli(chrome.bookmarks.search({ url: is.url }), 10000, 'yer imi arama');
            if (!dugumler.length) continue;
        } catch (e) { /* arama yapilamadi - islemeye devam */ }

        islenenler.add(is.url);

        // On yuze haber ver: kart donence gostersin.
        // Yeni eklenen kart bos bir kutu olarak duruyordu ve kullanici
        // bir sey olup olmadigini anlayamiyordu.
        chrome.runtime.sendMessage({
            hedef: 'sayfa', tur: 'yakalamaBasladi', url: is.url
        }).catch(() => {});
        let adaylar = [];
        try {
            // IS TAVANI (1.5.2): kartin TUM islemi (sayfa gorselleri +
            // ekran goruntusu + bos kare olcumu) tek sinir altinda. Icteki
            // adimlardan biri hic donmezse kuyruk o kartta kalmiyor.
            const iptalBekle = new Promise(coz => { iptalCoz = () => coz([]); });
            adaylar = await Promise.race([iptalBekle, zamanAsimli((async () => {
                const ayar = await ayarlariAl();
                const gizliKip = is.kip ? is.kip === 'gizli' : ayar.yakalamaKipi === 'gizli';

                // YONTEM AYARI:
                //   'ekran' -> yalnizca ekran goruntusu
                //   'oto'   -> once sayfa gorselleri (og:image / twitter:image),
                //              ardindan ekran goruntusu
                // Ayar okunmuyordu ve secim ne olursa olsun sayfa gorselleri
                // her zaman aliniyordu.
                let sayfadan = [];
                if (ayar.yakalamaYontemi === 'oto' && !YAKALANAMAZ_SEMA.test(is.url)) {
                    sayfadan = await sayfaGorselleriniAl(is.url);

                    // KART ORANINA EN YAKIN goruntu basa alinir. Film siteleri hem
                    // dikey afis hem yatay kapak sunuyor; kart yatay oldugu icin
                    // kapak dogru secim. Afis karuselde kalir, kullanici gecebilir.
                    sayfadan = await oranaGoreSirala(sayfadan, ayar);
                }

                // Yakalanamayan semalarda sekme acip goruntu alinamiyor -
                // adresi yazan duz bir kart uretiyoruz
                // TAVAN: tek bir kart yuzunden kuyruk sonsuza kadar
                // beklemesin; asilirsa o is atlanip digerlerine geciliyor
                let ekran = YAKALANAMAZ_SEMA.test(is.url)
                    ? await semaKarti(is.url)
                    : await (() => {
                        const durum = { iptal: false };
                        return zamanAsimli(
                            gizliKip
                                ? gizliYakala(is.url, ayar)
                                : ekranGoruntusuAl(is.url, ayar, durum),
                            YAKALAMA_TAVANI_MS, 'yakalama').catch(e => {
                                durum.iptal = true;      // arkada calismaya devam etmesin
                                console.log('[WSD] yakalama atlandi:', is.url, e.message);
                                return null;
                            });
                    })();

                // GIZLI KIP YEDEGI: arka plan sekmesinde Page.captureScreenshot
                // bazi sitelerde kare gelmedigi icin hic donmuyor (zaman asimi).
                // 1.5.4: yedek artik PENCERE KIPI DEGIL - kullanici gizliyi
                // secmisken ekranda pencere aciliyordu. Gizli kipte, sayfaya
                // daha uzun bekleme verilerek bir kez daha deneniyor; yine
                // olmazsa kart yer tutucuyla kaliyor (elle yenilenebilir).
                if (!ekran && !iptal && gizliKip && !YAKALANAMAZ_SEMA.test(is.url)) {
                    console.log('[WSD] gizli olmadi, gizli kipte bir kez daha deneniyor:', is.url);
                    const uzun = { ...ayar, yakalamaBekleme: Math.max(3000, (ayar.yakalamaBekleme || 0) * 2) };
                    ekran = await zamanAsimli(gizliYakala(is.url, uzun), YAKALAMA_TAVANI_MS, 'yakalama')
                        .catch(e => { console.log('[WSD] gizli ikinci deneme de olmadi:', is.url, e.message); return null; });
                }

                // Bombos kare (yumusak 404) kart olmasin
                const ekranGecerli = ekran && !(await kareBosMu(ekran));
                const liste = sayfadan.slice();
                if (ekranGecerli) liste.push(ekran);
                else if (ekran) console.log('[WSD] bos kare atlandi:', is.url);
                return liste;
            })(), IS_TAVANI_MS, 'kart islemi')]) || [];
            iptalCoz = null;
        } catch (e) {
            console.log('[WSD] yakalama hatasi:', is.url, e.message);
        }
        if (benimNeslim !== nesil) return;
        if (iptal) {                  // iptal edildi: yer tutucu da yazma
            islenenler.delete(is.url);
            kuyruk.length = 0;
            break;
        }

        // Hicbir gorsel alinamadiysa kart siyah kalmasin
        if (!adaylar.length) {
            basarisiz++;
            try { adaylar = [await zamanAsimli(yerTutucuKart(is.url), 10000, 'yer tutucu')]; } catch (e) { /* tuval yok */ }
        }
        try {
            // Kayit da sinirli: depo yazimi takilirsa kuyruk durmasin
            if (is.bitince) await zamanAsimli(Promise.resolve(is.bitince(is.url, adaylar)), 30000, 'gorsel kaydi');
        } catch (e) { /* geri cagirma patlarsa kuyruk durmasin */ }

        islenenler.delete(is.url);
        sonIlerleme = Date.now();
        kuyrugaYaz();                 // her adimdan sonra kalan liste guncel
        await bekle(YAKALAMA_ARASI_MS);
    }
    if (benimNeslim !== nesil) return;
    calisiyor = false;
    canliTutmayiKapat();
    alarmiKapat();                    // is bitti - bekciye gerek yok

    // Sessizce gecmesin: kac kartin gorseli alinamadi soylensin
    if (basarisiz) {
        chrome.runtime.sendMessage({
            hedef: 'sayfa', tur: 'yakalamaBitti', basarisiz
        }).catch(() => {});
    }
}

const bekle = ms => new Promise(r => setTimeout(r, ms));

/**
 * Adaylari KART ORANINA yakinliga gore siralar.
 *
 * Film siteleri hem dikey afis (0.67) hem yatay kapak (1.78) sunuyor;
 * kart yatay (16:10 = 1.6) oldugu icin kapak dogru secim ama og:image
 * afisi veriyor. Her adayin gercek oranini olcup karta en yakini basa
 * aliyoruz. Olculemeyenler (data hatasi) sona.
 */
const KART_ORANLARI = { o1610: 1.6, o169: 1.777, o43: 1.333, okare: 1 };

async function oranaGoreSirala(liste, ayar) {
    if (liste.length < 2) return liste;
    const hedef = KART_ORANLARI[ayar.kartOrani] || 1.6;

    const olculu = [];
    for (const uri of liste) {
        let oran = null, alan = 0, en = 0, boy = 0;
        try {
            const blob = await (await fetch(uri)).blob();
            const bmp = await createImageBitmap(blob);
            en = bmp.width; boy = bmp.height;
            oran = en / boy;
            alan = en * boy;
            bmp.close();
        } catch (e) { /* olculemedi */ }

        // PLACEHOLDER ELE: film seridi / "gorsel yok" ikonlari kare ve
        // kucuk oluyor (128x128, 256x256). Kare-ye yakin VE 90000px'den
        // kucuk olani aday sayma. Gercek kapaklar cok daha buyuk.
        const kareYakin = oran && Math.abs(oran - 1) < 0.15;
        if (kareYakin && alan < 90000) continue;

        // PUAN: orana yakinlik + cozunurluk. Dusuk = iyi.
        let puan;
        if (!oran) puan = Infinity;
        else {
            const oranFark = Math.abs(oran - hedef);
            const alanCeza = alan < 40000 ? (40000 - alan) / 40000 : 0;
            puan = oranFark + alanCeza * 0.5;
        }
        olculu.push({ uri, puan });
    }
    olculu.sort((a, b) => a.puan - b.puan);
    return olculu.slice(0, ADAY_SINIRI).map(x => x.uri);
}

/**
 * Sayfadan aday gorseller toplar: og:image, twitter:image, apple-touch-icon
 * ve sayfadaki buyuk <img>/<source srcset> ogeleri.
 *
 * INDIRME_SINIRI: kac gorsel indirilip DEGERLENDIRILECEK. En iyi aday
 * ham listede sonda olabilir (film siteleri kapagi placeholder'lardan
 * sonra veriyor); az indirirsek en iyiyi kaciriyoruz.
 * ADAY_SINIRI: siralamadan sonra depoya/karusele kac aday tutulacak.
 */
const INDIRME_SINIRI = 8;
const ADAY_SINIRI = 5;

async function sayfaGorselleriniAl(url) {
    const adresler = await gorselAdresleriniTopla(url);
    if (!Array.isArray(adresler)) return [];

    const cikti = [];
    for (const a of adresler) {
        if (cikti.length >= INDIRME_SINIRI) break;
        const veri = await gorseliIndir(a);
        if (veri && !cikti.includes(veri)) cikti.push(veri);
    }
    return cikti;
}

/**
 * YouTube video adresinden BANTSIZ kapak adresi uretir.
 *
 * YouTube'un og:image'i ve hqdefault.jpg'si 4:3 tuvale 16:9 goruntu
 * koyup ust-alta SIYAH BANT ekliyor. maxresdefault ve mqdefault
 * bantsiz. maxres her videoda yok, mqdefault her zaman var.
 * Ikisini de aday veriyoruz, on yuz yuklenen ilkini kullanir.
 */
function youtubeKapaklari(url) {
    let id = null;
    const m1 = url.match(/[?&]v=([\w-]{11})/);          // youtube.com/watch?v=ID
    const m2 = url.match(/youtu\.be\/([\w-]{11})/);      // youtu.be/ID
    const m3 = url.match(/\/(?:embed|shorts)\/([\w-]{11})/); // embed / shorts
    id = (m1 && m1[1]) || (m2 && m2[1]) || (m3 && m3[1]);
    if (!id) return [];
    return [
        `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,  // 1280x720, cogu videoda
        `https://i.ytimg.com/vi/${id}/mqdefault.jpg`        // 320x180, her videoda
    ];
}

async function gorselAdresleriniTopla(url) {
    // YouTube ise once bantsiz kapaklari dene - og:image bantli geliyor
    const yt = youtubeKapaklari(url);
    if (yt.length) return yt;

    let html;
    try {
        const yanit = await sureliFetch(url, { credentials: 'omit', redirect: 'follow' });
        if (!yanit.ok) return null;
        const tur = yanit.headers.get('content-type') || '';
        if (!tur.includes('text/html')) return null;
        // Govde de sinirli: basligi yollayip govdeyi akitmayan sunucular var
        html = await zamanAsimli(yanit.text(), 12000, 'sayfa govdesi');
    } catch (e) {
        return null;                       // CORS / ag hatasi - ekran goruntusune dus
    }

    const bulunan = [];
    const ekle = adres => {
        if (!adres) return;
        // Site sablonu gorsellerini ele: logo, favicon, footer, tema
        // varliklari. Bunlar sayfanin icerigi degil, cercevesi.
        if (/\/logo\/|logo\.|favicon|footer|header-|\/tema\/|\/theme\/|\/assets\/|sprite|placeholder/i.test(adres)) return;
        const mutlak = mutlakla(adres, url);
        if (!bulunan.includes(mutlak)) bulunan.push(mutlak);
    };

    // Meta etiketleri - genelde en temsili gorsel
    const metaKaliplari = [
        /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/gi,
        /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/gi,
        /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/gi,
        /<link[^>]+rel=["']apple-touch-icon[^"']*["'][^>]+href=["']([^"']+)["']/gi,
    ];
    for (const kalip of metaKaliplari) {
        for (const m of html.matchAll(kalip)) ekle(m[1]);
    }

    // <picture><source srcset> ve <img srcset> - responsive gorseller.
    // Oynatici kapaklari genelde burada; <img src> taramasi kaciriyordu
    // (film siteleri kapagi <picture> icinde veriyor).
    for (const m of html.matchAll(/<(?:source|img)[^>]+srcset=["']([^"']+)["']/gi)) {
        // srcset "url 768w, url2 1024w" olabilir - ilk url'yi al
        const ilk = m[1].split(',')[0].trim().split(/\s+/)[0];
        ekle(ilk);
    }

    // Sayfadaki <img> ogeleri - kucuk ikonlari eleyerek
    for (const m of html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)) {
        const etiket = m[0];
        const en  = +(etiket.match(/width=["']?(\d+)/i)?.[1] || 0);
        const boy = +(etiket.match(/height=["']?(\d+)/i)?.[1] || 0);
        // Olcu belirtilmisse kucukleri atla; belirtilmemisse sansini dene
        if ((en && en < 200) || (boy && boy < 120)) continue;
        if (/sprite|icon|logo-small|pixel|1x1|blank/i.test(m[1])) continue;
        ekle(m[1]);
        if (bulunan.length > 12) break;
    }

    return bulunan;
}

function mutlakla(adres, temel) {
    try { return new URL(adres, temel).href; } catch (e) { return adres; }
}

async function gorseliIndir(adres) {
    try {
        const yanit = await sureliFetch(adres, { credentials: 'omit' });
        if (!yanit.ok) return null;
        const blob = await zamanAsimli(yanit.blob(), 12000, 'gorsel govdesi');
        if (!blob.type.startsWith('image/')) return null;
        if (blob.size > 8 * 1024 * 1024) return null;   // asiri buyuk - atla

        // YouTube maxresdefault yoksa 404 DEGIL, 120x90 gri "yok"
        // gorseli donduruyor (~1-2 KB). Cok kucuk gorseli reddet ki
        // mqdefault'a dusulsun.
        if (/i\.ytimg\.com/.test(adres) && blob.size < 3000) return null;

        return await blobDanDataUri(blob);
    } catch (e) {
        return null;
    }
}

function blobDanDataUri(blob) {
    return new Promise((coz, red) => {
        const okuyucu = new FileReader();
        okuyucu.onload = () => coz(okuyucu.result);
        okuyucu.onerror = () => red(new Error('okunamadi'));
        okuyucu.readAsDataURL(blob);
    });
}

/**
 * Sayfayi gorunmez bir pencerede acip ekran goruntusu alir.
 *
 * Pencere 1x1 olusturulup ekran disina tasiniyor: gorunur olmadan render
 * ediliyor. Yakalama icin gecici olarak buyutuluyor.
 */
/**
 * Yakalama sirasinda okunan sayfa basliklari. Kart ilk eklendiginde
 * baslik o anki sekmeden aliniyor; site o an 404 verdiyse kartta
 * "Sayfa bulunamadi" kaliyor ve tazeleme bunu duzeltmiyordu.
 * Kuyruk bitince eski/bozuk basliklari bununla yeniliyoruz.
 */
export const sonBasliklar = new Map();

/**
 * @param durum  { iptal } - disaridaki tavan (45 sn) asilinca `iptal`
 *   true yapiliyor; islev bir sonraki adimda birakip penceresini kapatiyor.
 *   Eskiden tavan asilinca kuyruk siradaki karta geciyor ama bu islev
 *   arkada calismaya devam ediyordu: ayni anda iki yakalama penceresi.
 */
async function ekranGoruntusuAl(url, ayar, durum = null) {
    const birak = () => { if (durum && durum.iptal) throw new Error('tavan asildi, birakildi'); };
    let pencere = null;
    let sekmeId = null;
    // Kullanicinin AKTIF penceresini hatirliyoruz: yakalama sirasinda
    // odak kaymissa sonunda geri veriyoruz.
    let onceki = null;
    try { onceki = (await chrome.windows.getLastFocused()).id; } catch (e) { /* yok say */ }

    try {
        // Pencere once 1x1 aciliyor: kullanicinin ekraninda bir an bile
        // buyuk bir pencere parlamasin. Sonra gercek olcuye buyutuluyor.
        // KUCUK PENCERE (1.5.5, deneysel): yakalama penceresi yari boyutta,
        // kullanicinin penceresinin SAG ALT kosesinde aciliyor; sayfa %50
        // yakinlastirmayla ayni genislikte diziliyor (kare yari cozunurlukte,
        // kart icin yeterli). Arkada acmak denendi: Chrome ortulen pencereyi
        // cizmiyor, kare gelmiyordu.
        const kucuk = !!ayar.yakalamaKucuk;
        const en = kucuk ? Math.round(ayar.yakalamaEn / 2) : ayar.yakalamaEn;
        const boy = kucuk ? Math.round(ayar.yakalamaBoy / 2) : ayar.yakalamaBoy;
        let left = 0, top = 0;
        if (kucuk && onceki) {
            try {
                const w = await chrome.windows.get(onceki);
                left = Math.max(w.left, w.left + w.width - en - 12);
                top = Math.max(w.top, w.top + w.height - boy - 12);
            } catch (e) { /* kapanmis - sol ust */ }
        }

        pencere = await chrome.windows.create({
            url,
            type: 'popup',
            focused: false,
            width: 1,
            height: 1,
            left,
            top
        });
        acikPencereler.add(pencere.id);
        birak();

        sekmeId = pencere.tabs[0].id;

        await chrome.windows.update(pencere.id, {
            focused: false,
            width: en,
            height: boy,
            left,
            top
        });

        await sayfaStabilOlsun(sekmeId);
        birak();

        // Yakinlastirma sayfa YUKLENDIKTEN sonra: yukleme sirasinda verilince
        // gezinmeyle sifirlaniyordu. per-tab: kullanicinin o site icin
        // kayitli yakinlastirmasi degismesin.
        if (kucuk) {
            try {
                await chrome.tabs.setZoomSettings(sekmeId, { mode: 'automatic', scope: 'per-tab' });
                await chrome.tabs.setZoom(sekmeId, 0.5);
                await bekle(300);
            } catch (e) { console.log('[WSD] yakinlastirma olmadi:', e.message); }
        }

        // Sayfa yuklendikten SONRA baslik dogru olanidir
        try {
            const s = await chrome.tabs.get(sekmeId);
            if (s && s.title) sonBasliklar.set(url, s.title);
        } catch (e) { /* sekme kapanmis */ }
        await bekle(ayar.yakalamaBekleme);

        // Kaydirma: ust kisimda cerez bandi / sabit baslik olan sitelerde
        // yakalanan kare sayfayi temsil etmiyor.
        if (ayar.yakalamaKaydirma > 0) {
            try {
                await chrome.scripting.executeScript({
                    target: { tabId: sekmeId },
                    func: px => window.scrollTo(0, px),
                    args: [ayar.yakalamaKaydirma]
                });
                await bekle(500);
            } catch (e) { /* betik calismadi - kaydirmasiz devam */ }
        }

        const secenek = { format: ayar.gorselBicimi };
        if (ayar.gorselBicimi === 'jpeg') secenek.quality = ayar.jpegKalitesi;
        birak();

        // SEKMENIN GERCEK PENCERESI (1.5.2). Bazi tarayicilar (Vivaldi'nin
        // "acilir pencereleri sekmede ac" ayari gibi) actigimiz pencereyi
        // baska bir pencereye SEKME olarak tasiyor; `pencere.id` artik yok
        // ("No window with id"). Sekme hangi penceredeyse onu yakaliyoruz -
        // ama yalnizca o pencerede ETKIN sekmeyse: degilse kullanicinin
        // baktigi sayfa yakalanirdi.
        // ORTULU PENCERE (1.5.5): Chrome (Windows) odaksiz acilan pencereyi
        // kullanicinin penceresinin ARKASINA koyabiliyor; ortulen pencere
        // cizilmiyor, yakalama bos/eski kare donduruyordu (pencereye
        // tiklayinca aliniyordu). Sayfa kendini gizli sayiyorsa pencereyi
        // kisa sureligine one aliyoruz; odak sonda kullaniciya geri donuyor.
        // Gorunur acilan tarayicilarda (Vivaldi) bu adim hic calismiyor.
        try {
            const [r] = await chrome.scripting.executeScript({
                target: { tabId: sekmeId }, func: () => document.visibilityState
            });
            if (r && r.result === 'hidden') {
                console.log('[WSD] yakalama penceresi ortulu - one aliniyor');
                const s = await chrome.tabs.get(sekmeId);
                await chrome.windows.update(s.windowId, { focused: true });
                await bekle(600);
            }
        } catch (e) { /* betik calismadi (ozel sayfa) - dogrudan dene */ }
        birak();

        const yakala = async () => {
            const s = await chrome.tabs.get(sekmeId);
            if (!s.active) throw new Error('yakalama sekmesi etkin degil');
            return zamanAsimli(chrome.tabs.captureVisibleTab(s.windowId, secenek), 15000, 'captureVisibleTab');
        };

        let veri = null;
        try {
            try {
                veri = await yakala();
            } catch (e0) {
                // Sayfa henuz gelmemis (adres bos): bir kez daha bekleyip dene
                if (!/Cannot access contents of url/i.test(e0.message)) throw e0;
                console.log('[WSD] sayfa henuz yuklenmemis, tekrar bekleniyor:', url);
                await sayfaStabilOlsun(sekmeId);
                birak();
                await bekle(1000);
                veri = await yakala();
            }
        } catch (e) {
            // Odaksiz pencerede yakalama reddedilebiliyor.
            // One almak calisiyor ama ekranda goz kirpmaya yol aciyor,
            // bu yuzden AYARA bagli: varsayilan KAPALI.
            if (!ayar.yakalamaOneAl) {
                console.log('[WSD] odaksiz yakalama olmadi, atlandi:', e.message);
            } else {
                console.log('[WSD] odaksiz yakalama olmadi, one aliniyor:', e.message);
                try {
                    await chrome.windows.update(pencere.id, { focused: true });
                    await bekle(400);
                    veri = await chrome.tabs.captureVisibleTab(pencere.id, secenek);
                } catch (e2) {
                    console.log('[WSD] yakalama basarisiz:', e2.message);
                }
            }
        }

        return veri || null;

    } catch (e) {
        console.log('[WSD] ekran goruntusu alinamadi:', url, e.message);
        return null;
    } finally {
        // Once SEKME: pencere baska bir pencereye sekme olarak tasinmissa
        // `windows.remove` onu bulamiyor ve acik bir sekme kaliyordu
        if (sekmeId != null) {
            try { await chrome.tabs.remove(sekmeId); } catch (e) { /* kapanmisti */ }
        }
        if (pencere) {
            acikPencereler.delete(pencere.id);
            try { await chrome.windows.remove(pencere.id); } catch (e) { /* kapanmisti */ }
        }
        // Odak kullaniciya geri donsun - yakalama penceresi one gelmis
        // olabilir ve kullanici yazdigi yerden kopmasin
        if (onceki) {
            try { await chrome.windows.update(onceki, { focused: true }); } catch (e) { /* kapanmis */ }
        }
    }
}

/**
 * ELLE yakalama: kullanici sahneyi kendisi seciyor.
 *
 * Kart Duzenle'deki "Sahne Yakala" dugmesinden cagriliyor. Sayfa
 * gorunur sekmede aciliyor; kullanici videoyu istedigi ana getirip
 * duraklatip "Çek" diyor. Cekilen kare data URI olarak donuyor,
 * Duzenle penceresi karusele aday olarak ekliyor.
 *
 * Islem bitince WSD SEKMESINE geri donuluyor - tarayici normalde
 * onceki sekmeye doner, WSD'ye degil.
 */
/**
 * Devam eden elle yakalamayi iptal etmek icin. Onceki cagri bir sekilde
 * asili kaldiysa (sekme kapanmis, mesaj gelmemis) dugme kilitli kaliyor
 * ve ancak sayfa yenilenince acilıyordu; yeni istek gelince eskisini
 * kapatiyoruz.
 */
let elleIptal = null;

export function elleYakala(url) {
    if (elleIptal) { try { elleIptal(); } catch (e) { /* zaten bitmis */ } }

    return new Promise(async (coz) => {
        let sekme = null;
        // Su an WSD sekmesi - islem sonunda buraya donecegiz
        let wsdSekme = null;
        try {
            const aktif = await chrome.tabs.query({ active: true, currentWindow: true });
            wsdSekme = aktif[0] || null;

            sekme = await chrome.tabs.create({ url, active: true });
            await sayfaStabilOlsun(sekme.id);

            const cubukMetni = [c('elleSahne'), c('cek'), c('alanSec'), c('uzunCekim'), c('vazgec')];
            const cubuguBas = () => chrome.scripting.executeScript({
                target: { tabId: sekme.id },
                func: elleCubukEnjekte,
                args: cubukMetni
            }).then(() => true).catch(() => false);   // sayfa henuz hazir degil

            // ERISILEMEYEN SAYFA (1.6.0): bazi siteler eklentilere kapali
            // (magaza sayfalari, tarayicinin kendi sayfalari, Edge'de bazi
            // Microsoft siteleri). Cubuk basilamayinca kullanici 5 dakika bos
            // sayfada bekliyordu; birkac denemeden sonra sekme kapatilip
            // haber veriliyor.
            let basildi = await cubuguBas();
            for (const ara of [800, 1500]) {
                if (basildi || !sekme) break;
                await bekle(ara);
                basildi = await cubuguBas();
            }
            if (!basildi) {
                if (sekme) { try { await chrome.tabs.remove(sekme.id); } catch (e) { /* kapanmis */ } }
                if (wsdSekme) { try { await chrome.tabs.update(wsdSekme.id, { active: true }); } catch (e) { /* */ } }
                coz({ kapali: true });
                return;
            }

            const mesajKarari = await new Promise(kararCoz => {
                let bitti = false;
                const temizle = () => {
                    if (bitti) return;
                    bitti = true;
                    elleIptal = null;
                    chrome.runtime.onMessage.removeListener(dinle);
                    chrome.tabs.onRemoved.removeListener(kapandi);
                    chrome.tabs.onUpdated.removeListener(guncellendi);
                    clearTimeout(sayac);
                };
                const dinle = (mesaj, gonderen) => {
                    if (gonderen.tab && gonderen.tab.id === sekme.id &&
                        mesaj && mesaj.tur === 'elleKarar') {
                        temizle();
                        kararCoz(mesaj);
                    }
                };
                // SEKME KAPATILDI: kullanici Vazgec'e basmadan kapatinca
                // karar mesaji hic gelmiyordu; dinleyici ve soz asili
                // kaliyor, dugme bir daha calismiyordu.
                const kapandi = id => {
                    if (id !== sekme.id) return;
                    sekme = null;                       // finally tekrar kapatmasin
                    temizle();
                    kararCoz({ karar: 'vazgec' });
                };
                // YONLENDIRME/YENIDEN YUKLEME: belge degisince cubuk
                // siliniyor - yeni belgeye tekrar basiyoruz.
                const guncellendi = (id, bilgi) => {
                    if (id === sekme?.id && bilgi.status === 'complete') cubuguBas();
                };
                const sayac = setTimeout(() => {        // unutulmus sekme
                    temizle();
                    kararCoz({ karar: 'vazgec' });
                }, 5 * 60 * 1000);

                chrome.runtime.onMessage.addListener(dinle);
                chrome.tabs.onRemoved.addListener(kapandi);
                chrome.tabs.onUpdated.addListener(guncellendi);

                // Yeni bir elle yakalama baslarsa bu cagri temiz kapansin
                elleIptal = () => { temizle(); kararCoz({ karar: 'vazgec' }); };
            });
            const karar = mesajKarari.karar;

            let veri = null;

            // ALAN SEC - kullanicinin cizdigi dikdortgen (fiziksel piksel)
            if (karar === 'alan' && mesajKarari.kutu) {
                await bekle(150);                       // katman/cubuk kalksin
                const pencere = await chrome.windows.get(sekme.windowId);
                const tamKare = await chrome.tabs.captureVisibleTab(pencere.id, { format: 'jpeg', quality: 92 });
                veri = await kareyiKirp(tamKare, mesajKarari.kutu);
            }

            // UZUN CEKIM - kaydirarak coklu kare + birlestirme
            if (karar === 'uzun') {
                await bekle(150);
                const pencere = await chrome.windows.get(sekme.windowId);
                veri = await uzunCekim(sekme.id, pencere.id);
            }

            if (karar === 'cek') {
                await chrome.scripting.executeScript({
                    target: { tabId: sekme.id },
                    func: () => { const c = document.getElementById('wsdElleCubuk'); if (c) c.style.display = 'none'; }
                });
                await bekle(120);
                // OYNATICI kutusunu al - kareyi ona kirpiyoruz ki YouTube
                // arayuzu, beyaz alanlar girmesin. Sadece video/iframe
                // bakiliyor: <img> taramasi sayfadaki rastgele bir gorsele
                // yapisiyordu.
                let kutu = null;
                try {
                    const [sonuc] = await chrome.scripting.executeScript({
                        target: { tabId: sekme.id },
                        func: oynaticiKutusu
                    });
                    kutu = sonuc && sonuc.result;
                } catch (e) { /* olculemedi - tam kare kalir */ }

                const pencere = await chrome.windows.get(sekme.windowId);
                const tamKare = await chrome.tabs.captureVisibleTab(pencere.id, { format: 'jpeg', quality: 92 });

                // Oynatici bulunduysa o bolgeyi kirp, yoksa tam kare
                veri = kutu ? await kareyiKirp(tamKare, kutu) : tamKare;
            }

            // sekme null olabilir: kullanici kendisi kapatmis olabilir
            if (sekme) { try { await chrome.tabs.remove(sekme.id); } catch (e) { /* kapanmis */ } }

            // WSD sekmesine geri don
            if (wsdSekme) {
                try { await chrome.tabs.update(wsdSekme.id, { active: true }); } catch (e) {}
            }
            coz(veri);
        } catch (e) {
            console.log('[WSD] elle yakalama basarisiz:', e.message);
            if (sekme) { try { await chrome.tabs.remove(sekme.id); } catch (e2) {} }
            if (wsdSekme) { try { await chrome.tabs.update(wsdSekme.id, { active: true }); } catch (e2) {} }
            coz(null);
        }
    });
}

/**
 * Sayfadaki en buyuk <video> (yoksa gomulu oynatici <iframe>) ogesinin
 * ekran konumunu dondurur. Sayfa baglaminda calisir (executeScript).
 *
 * <img> BILEREK TARANMIYOR: sayfadaki rastgele bir gorsele yapisip
 * yanlis bolgeyi kirpiyordu. Gorsel icin "Alan Sec" var.
 *
 * DEVICE PIXEL RATIO ile carpiyoruz: captureVisibleTab fiziksel
 * piksel donuyor, getBoundingClientRect CSS pikseli - HiDPI ekranda
 * ikisi farkli.
 */
function oynaticiKutusu() {
    const oy = window.devicePixelRatio || 1;
    const gorunurAlan = { w: window.innerWidth, h: window.innerHeight };

    // Ekranda GORUNEN kismi hesaba kat - sayfa disina tasan kisim sayilmaz
    const gorunurKesisim = r => {
        const x1 = Math.max(0, r.left), y1 = Math.max(0, r.top);
        const x2 = Math.min(gorunurAlan.w, r.right), y2 = Math.min(gorunurAlan.h, r.bottom);
        const w = x2 - x1, h = y2 - y1;
        return (w > 0 && h > 0) ? w * h : 0;
    };

    let en = null, enAlan = 0;
    const bak = sec => {
        for (const el of document.querySelectorAll(sec)) {
            const r = el.getBoundingClientRect();
            if (r.width < 160 || r.height < 90) continue;
            const alan = gorunurKesisim(r);      // GORUNUR alan onemli
            if (alan > enAlan) { enAlan = alan; en = r; }
        }
    };

    bak('video');
    if (!en) bak('iframe');       // YouTube embed, vimeo vb.
    if (!en) return null;         // oynatici yok - tam kare cekilecek

    // Kutuyu gorunur alana kirp (tasan kismi at) sonra fiziksel piksele cevir
    const left = Math.max(0, en.left), top = Math.max(0, en.top);
    const right = Math.min(gorunurAlan.w, en.right), bottom = Math.min(gorunurAlan.h, en.bottom);
    return {
        x: Math.round(left * oy),
        y: Math.round(top * oy),
        w: Math.round((right - left) * oy),
        h: Math.round((bottom - top) * oy)
    };
}

/** Data URI kareyi verilen kutuya kirpar (offscreen canvas). */
async function kareyiKirp(dataUri, kutu) {
    try {
        const blob = await (await fetch(dataUri)).blob();
        const bmp = await createImageBitmap(blob);
        // Kutu kare disina tasmasin
        const x = Math.min(kutu.x, bmp.width - 1);
        const y = Math.min(kutu.y, bmp.height - 1);
        const w = Math.min(kutu.w, bmp.width - x);
        const h = Math.min(kutu.h, bmp.height - y);
        if (w < 10 || h < 10) { bmp.close(); return dataUri; }

        const tuval = new OffscreenCanvas(w, h);
        const ctx = tuval.getContext('2d');
        ctx.drawImage(bmp, x, y, w, h, 0, 0, w, h);
        bmp.close();

        const kirpik = await tuval.convertToBlob({ type: 'image/jpeg', quality: 0.9 });
        return await blobDanDataUri(kirpik);
    } catch (e) {
        return dataUri;           // kirpma basarisizsa tam kare
    }
}

/**
 * UZUN (KAYDIRMALI) CEKIM - gorunur alana sigmayan sayfayi asagi
 * kaydirarak parca parca cekip tuvalde birlestirir.
 *
 * SINIRLAR:
 *  - Chrome captureVisibleTab'i saniyede ~2 cagriyla kisitliyor, bu
 *    yuzden kareler arasi BEKLEME var. Kisaltirsak cagri sessizce
 *    basarisiz olur.
 *  - Cok uzun sayfa dev bir data URI uretir (depo kotasi), bu yuzden
 *    kare ve boy tavani var.
 */
const UZUN_BEKLEME     = 550;      // ms - captureVisibleTab kisiti
const UZUN_EN_COK_KARE = 12;
const UZUN_EN_COK_BOY  = 20000;    // fiziksel piksel

async function uzunCekim(sekmeId, pencereId) {
    try {
        const [olculer] = await chrome.scripting.executeScript({
            target: { tabId: sekmeId }, func: uzunHazirla
        });
        const olcu = olculer && olculer.result;
        if (!olcu) return null;

        const kareler = [];
        let hedefY = olcu.baslangicY;

        for (let i = 0; i < UZUN_EN_COK_KARE; i++) {
            const [sonuc] = await chrome.scripting.executeScript({
                target: { tabId: sekmeId }, func: yeriKaydir, args: [hedefY]
            });
            // Sayfa istenen yere kaydiramayabilir (dip) - GERCEK konumu kullan
            const gercekY = (sonuc && typeof sonuc.result === 'number') ? sonuc.result : hedefY;

            await bekle(UZUN_BEKLEME);
            const kare = await chrome.tabs.captureVisibleTab(pencereId, { format: 'jpeg', quality: 88 });
            kareler.push({ kare, ust: (gercekY - olcu.baslangicY) * olcu.oy });

            const sonraki = gercekY + olcu.gorunurY;
            if (sonraki >= olcu.toplamY - 2) break;                              // sayfa bitti
            if ((sonraki - olcu.baslangicY) * olcu.oy >= UZUN_EN_COK_BOY) break; // tavan
            hedefY = sonraki;
        }
        return await kareleriBirlestir(kareler);
    } catch (e) {
        console.log('[WSD] uzun cekim basarisiz:', e.message);
        return null;
    } finally {
        try {
            await chrome.scripting.executeScript({ target: { tabId: sekmeId }, func: uzunBitir });
        } catch (e) { /* sekme kapanmis */ }
    }
}

/** Kareleri tek dikey tuvalde birlestirir. */
async function kareleriBirlestir(kareler) {
    if (!kareler.length) return null;
    if (kareler.length === 1) return kareler[0].kare;

    const bmpler = [];
    for (const k of kareler) {
        const blob = await (await fetch(k.kare)).blob();
        bmpler.push({ bmp: await createImageBitmap(blob), ust: k.ust });
    }
    const son = bmpler[bmpler.length - 1];
    const en  = bmpler[0].bmp.width;
    const boy = Math.min(Math.round(son.ust + son.bmp.height), UZUN_EN_COK_BOY);

    const tuval = new OffscreenCanvas(en, boy);
    const ctx = tuval.getContext('2d');
    for (const b of bmpler) {
        ctx.drawImage(b.bmp, 0, Math.round(b.ust));   // ust uste binen kisim ayni icerik
        b.bmp.close();
    }
    const cikti = await tuval.convertToBlob({ type: 'image/jpeg', quality: 0.88 });
    return await blobDanDataUri(cikti);
}

/**
 * Sayfa baglaminda: olculeri dondurur, SABIT/YAPISKAN ogeleri gizler.
 * Gizlemezsek her karede tekrar ederler (menu cubugu 12 kez alt alta).
 * Eski durum yalitilmis dunyada window'da tutuluyor, uzunBitir geri alir.
 */
function uzunHazirla() {
    const g = document.scrollingElement || document.documentElement;
    const gizlenen = [];
    for (const el of document.querySelectorAll('body *')) {
        const k = getComputedStyle(el).position;
        if (k === 'fixed' || k === 'sticky') {
            gizlenen.push([el, el.style.visibility]);
            el.style.setProperty('visibility', 'hidden', 'important');
        }
    }
    window.__wsdGizlenen  = gizlenen;
    window.__wsdEskiY     = g.scrollTop;
    window.__wsdEskiKayma = g.style.scrollBehavior;
    g.style.scrollBehavior = 'auto';           // yumusak kaydirma kareyi bulanik yakalar
    return {
        oy: window.devicePixelRatio || 1,
        gorunurY: window.innerHeight,
        toplamY: g.scrollHeight,
        baslangicY: g.scrollTop                // MEVCUT konumdan asagi cekiyoruz
    };
}

function yeriKaydir(y) {
    const g = document.scrollingElement || document.documentElement;
    g.scrollTop = y;
    return g.scrollTop;
}

function uzunBitir() {
    const g = document.scrollingElement || document.documentElement;
    for (const [el, eski] of (window.__wsdGizlenen || [])) el.style.visibility = eski || '';
    g.style.scrollBehavior = window.__wsdEskiKayma || '';
    g.scrollTop = window.__wsdEskiY || 0;
    delete window.__wsdGizlenen; delete window.__wsdEskiY; delete window.__wsdEskiKayma;
}

/**
 * SITE LOGOSU - ekran goruntusu yerine sitenin kendi logosunu duz
 * zemine ortalar. Eski surumdeki davranis; kart oranina (16:10) uygun
 * cikti verir. Logo kare oldugu icin normal aday siralamasindan
 * (oranaGoreSirala) geciremiyoruz, bu yuzden ayri yol.
 */
const LOGO_EN = 800, LOGO_BOY = 500;

/**
 * BRANDFETCH marka logosu servisi. Sitelerin HTML'inde temiz bir logo
 * cogu zaman YOK; bu servis elle derlenmis, seffaf zeminli 512 px
 * logolari alan adina gore veriyor. Eski YASD'nin logo basarisi
 * tamamen buradan geliyordu.
 *
 * Kullanmak icin brandfetch.com/developers adresinden UCRETSIZ bir
 * istemci kimligi alip asagiya yaz. BOS birakilirsa bu adim atlanir
 * ve yalnizca sayfadan toplanan adaylar kullanilir.
 *
 * NOT: kimlik konursa ziyaret edilen sitenin ALAN ADI bu servise
 * gidiyor - magaza gizlilik metnine yazilmasi gerekir.
 */
const BRANDFETCH_KIMLIK = '1idhC5cn-BGJBC895QM';

function brandfetchAdaylari(url) {
    if (!BRANDFETCH_KIMLIK) return [];
    try {
        const alan = new URL(url).hostname.replace(/^www\./, '');
        const k = encodeURIComponent(BRANDFETCH_KIMLIK);
        return [
            `https://cdn.brandfetch.io/domain/${alan}/w/512/logo/fallback/404/?c=${k}`,
            `https://cdn.brandfetch.io/domain/${alan}/w/512/icon/fallback/404/?c=${k}`
        ];
    } catch (e) {
        return [];
    }
}

/** kare: kare kart icin kare tuval (1.6.1) - logo kutuyu doldurur, bant kalmaz */
/**
 * GIRIS SAYFASI ADRESI (1.6.1): kart "accounts.google.com/...service=mail"
 * gibi bir oturum acma sayfasina gidiyorsa logo o sayfadan degil, asil
 * hizmetten aranir (Gmail, YouTube, Drive...). Yoksa adres aynen kalir.
 */
const GOOGLE_HIZMET = {
    mail: 'https://mail.google.com/', youtube: 'https://www.youtube.com/',
    wise: 'https://drive.google.com/', writely: 'https://docs.google.com/',
    cl: 'https://calendar.google.com/', lh2: 'https://photos.google.com/',
};
function logoIcinAdres(url) {
    try {
        const u = new URL(url);
        if (u.hostname !== 'accounts.google.com') return url;
        const devam = u.searchParams.get('continue');
        if (devam && /^https:\/\//i.test(devam)) return new URL(devam).origin + '/';
        return GOOGLE_HIZMET[u.searchParams.get('service')] || url;
    } catch (e) { return url; }
}

export async function logoYakala(url, enCok = 8, kare = false) {
    url = logoIcinAdres(url);
    // ONCE CANLI SAYFA: sunucudan gelen ham HTML cogu sitede bos
    // (Nuxt/React gibi cerceveler logoyu tarayicida ciziyor) - bu yuzden
    // sayfayi arka planda acip GERCEK DOM'a bakiyoruz. Basarisiz olursa
    // ham HTML yoluna dusuluyor.
    let bilgi = await sekmedenLogoTopla(url);
    if (!bilgi || !bilgi.adresler.length) bilgi = await logoAdresleriniTopla(url);
    if (!bilgi) bilgi = { adresler: [], zemin: null };

    // Marka servisi once - ALT ALAN ADI haric (1.6.1): mail.google.com icin
    // servis ana markayi (Google) veriyor, Gmail'in kendi logosu degil.
    // Alt alanda once sayfanin kendi logosu, marka servisi en sonda.
    const altAlan = (() => {
        try {
            const p = new URL(url).hostname.replace(/^www\./, '').split('.');
            // com.tr, gov.tr, co.uk gibi ikinci duzey uzantilar alt alan sayilmaz
            const ikiDuzey = p.length > 2 && p.at(-1).length === 2
                && /^(com|gov|org|net|edu|co|gen|bel|av|k12|ac|biz|info|web|tv|pol|tsk)$/.test(p.at(-2));
            return p.length > (ikiDuzey ? 3 : 2);
        } catch (e) { return false; }
    })();
    bilgi.adresler = altAlan ? [...bilgi.adresler, ...brandfetchAdaylari(url)]
                             : [...brandfetchAdaylari(url), ...bilgi.adresler];
    if (!bilgi.adresler.length) return [];

    const kartlar = [];
    const gorulen = new Set();
    for (const adres of bilgi.adresler) {
        if (kartlar.length >= enCok) break;

        // AYNI LOGONUN FARKLI OLCUSU/ADRESI: logo-200x50.png ile
        // logo-400x100.png ayni gorsel. Adres parmak izi + indirilen
        // BAYT BOYUTU ile eliyoruz - karusel ayni logoyla dolmasin.
        const iz = logoParmakIzi(adres);
        if (gorulen.has(iz)) continue;
        gorulen.add(iz);

        // Once fetch; olmazsa <img> yolu. Brandfetch gibi servisler
        // baglantinin GORSEL ETIKETIYLE cagrilmasini ve Referer
        // basligini bekliyor - duz fetch'e 403 donebiliyorlar.
        const veri = await gorseliIndir(adres) || await gorseliImgIleAl(adres);
        if (!veri) continue;

        const boyIz = 'b' + veri.length;
        if (gorulen.has(veri) || gorulen.has(boyIz)) continue;
        gorulen.add(veri);
        gorulen.add(boyIz);

        const kart = await logoyuBestele(veri, null, kare);
        if (!kart) continue;
        kartlar.push(kart.veri);

        // Saydam logo + sitenin marka rengi -> bir de RENKLI varyant.
        // Sozcu'nun kirmizi zeminli hali boyle cikiyor.
        const markaRengi = bilgi.zemin || bilgi.markaZemin;
        if (kart.saydam && markaRengi && kartlar.length < enCok) {
            const renkli = await logoyuBestele(veri, markaRengi, kare);
            if (renkli) kartlar.push(renkli.veri);
        }
    }
    return kartlar;
}

/**
 * Sayfayi ARKA PLANDA acip canli DOM'dan logo adaylarini toplar.
 * Sekme gorunmuyor (active:false), is bitince kapaniyor.
 */
async function sekmedenLogoTopla(url) {
    let sekme = null;
    try {
        sekme = await chrome.tabs.create({ url, active: false });
        await sayfaStabilOlsun(sekme.id);
        const [sonuc] = await chrome.scripting.executeScript({
            target: { tabId: sekme.id },
            func: sayfadaLogoAra
        });
        return (sonuc && sonuc.result) || null;
    } catch (e) {
        console.log('[WSD] canli logo taramasi basarisiz:', e.message);
        return null;
    } finally {
        if (sekme) { try { await chrome.tabs.remove(sekme.id); } catch (e) { /* kapanmis */ } }
    }
}

/**
 * SAYFA BAGLAMINDA calisir. Ekranda GERCEKTEN gorunen logoyu ariyor:
 * ust bolgedeki (top < 800px) yeterince buyuk <img>/<svg> ogeleri,
 * CSS background-image logolari, sonra link ikonlari.
 *
 * <img> icin currentSrc kullaniliyor - srcset ve tembel yukleme
 * cozulmus hali bu. Inline <svg> kopyalanip serilestiriliyor;
 * rengi CSS'ten geliyorsa kaybolmasin diye hesaplanmis renk
 * kopyanin uzerine yaziliyor.
 */
function sayfadaLogoAra() {
    const cikti = [];
    const ekle = a => { if (a && !cikti.includes(a)) cikti.push(a); };
    const mutlak = a => { try { return new URL(a, location.href).href; } catch (e) { return null; } };

    const logoMu = el => {
        const ad = [el.getAttribute('class'), el.id, el.getAttribute('alt'),
                    el.getAttribute('aria-label'), el.getAttribute('src')]
            .filter(Boolean).join(' ').toLowerCase();
        return /logo|brand|marka/.test(ad);
    };

    let ilkLogoOgesi = null;                 // marka rengini bunun seridinden alacagiz

    const adaylar = new Set();
    const topla = sec => document.querySelectorAll(sec).forEach(e => adaylar.add(e));
    topla('header img, header svg, nav img, nav svg');
    topla('a[href="/"] img, a[href="/"] svg');
    document.querySelectorAll('img, svg').forEach(e => { if (logoMu(e)) adaylar.add(e); });

    /**
     * PUANLAMA - "header icindeki her svg" cok genis bir agdi; tik
     * isareti, kullanici simgesi gibi arayuz ikonlari da geliyordu.
     * Logo olma ihtimalini puanliyoruz, sifir ve altini atiyoruz.
     */
    const anaSayfaBaglantisi = el => {
        const a = el.closest && el.closest('a');
        if (!a) return false;
        const h = a.getAttribute('href') || '';
        return h === '/' || h === '' || h === '#' ||
               a.href === location.origin + '/' || a.href === location.origin;
    };
    // "Basinda biz / is ortaklarimiz" seritleri BASKA markalarin
    // logolarini tasiyor (Forbes, Lifehacker...). Dosya adlarinda da
    // "logo" geciyor, o yuzden baglama bakip eliyoruz.
    const YABANCI = /press|basin|partner|ortak|award|odul|featured|as-?seen|sponsor|client|musteri|review|testimonial|referans|marquee/i;
    const yabanciBaglam = el => {
        let n = el, derinlik = 0;
        while (n && derinlik++ < 5) {
            const ad = (n.getAttribute && ((n.getAttribute('class') || '') + ' ' + (n.id || ''))) || '';
            if (YABANCI.test(ad)) return true;
            n = n.parentElement;
        }
        return false;
    };

    const puanla = (el, r) => {
        let puan = 0;
        if (anaSayfaBaglantisi(el)) puan += 4;              // ustteki marka baglantisi
        if (logoMu(el)) puan += 3;
        const ust = el.parentElement;
        if (ust && logoMu(ust)) puan += 2;
        const oran = r.width / Math.max(1, r.height);
        if (oran >= 2.2) puan += 2;                         // yazi logosu genistir
        if (oran > 0.8 && oran < 1.25 && r.width < 64) puan -= 3;   // kare arayuz ikonu

        // KONUM artik kapi degil puan: sitenin kendi logosu en ustte olur,
        // basin seritleri sayfanin asagisinda.
        if (r.top <= 320) puan += 2;
        else if (r.top > 900) puan -= 3;

        if (yabanciBaglam(el)) puan -= 5;                   // baska markanin logosu
        return puan;
    };

    const puanli = [];
    for (const el of adaylar) {
        const r = el.getBoundingClientRect();
        if (r.width < 24 || r.height < 12) continue;             // gizli ya da minik
        if (r.top > 1400) continue;                               // sayfanin ust bolgesinde olmali
        const puan = puanla(el, r);
        if (puan <= 0) continue;                                  // arayuz ikonu - logo degil
        puanli.push({ el, r, puan });
    }
    // YEDEK TARAMA: puanli hicbir sey cikmadiysa olcu/konum sartlarini
    // birak, adresinde ya da alt metninde "logo" gecen her gorseli al.
    // openproxylist gibi logosunu hero'ya koyan siteler boyle kurtuluyor.
    if (!puanli.length) {
        for (const el of document.querySelectorAll('img[src*="logo" i], img[alt*="logo" i], img[data-src*="logo" i]')) {
            if (yabanciBaglam(el)) continue;                // basin/ortak seridi
            puanli.push({ el, r: el.getBoundingClientRect(), puan: 1 });
            if (puanli.length >= 4) break;
        }
    }

    puanli.sort((a, b) => b.puan - a.puan);

    for (const { el, r } of puanli) {
        if (cikti.length >= 10) break;
        if (!ilkLogoOgesi) ilkLogoOgesi = el;

        if (el.tagName === 'IMG') {
            const kaynak = el.currentSrc || el.src;
            // Tembel yukleme yer tutucusu (1x1 saydam GIF) - gercek gorsel degil
            if (!kaynak || /^data:image\/gif/i.test(kaynak)) continue;
            if (el.naturalWidth && el.naturalWidth < 24) continue;
            ekle(mutlak(kaynak));                                 // srcset/lazy cozulmus hali
            continue;
        }
        try {
            const kopya = el.cloneNode(true);
            const kutuEn  = Math.round(r.width)  || 512;
            const kutuBoy = Math.round(r.height) || 512;
            kopya.setAttribute('width', kutuEn);
            kopya.setAttribute('height', kutuBoy);
            if (!kopya.getAttribute('xmlns')) kopya.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            // Renk CSS sinifindan geliyorsa serilestirmede kaybolur
            const h = getComputedStyle(el);
            if (h.fill && h.fill !== 'none') kopya.setAttribute('fill', h.fill);
            if (h.color) kopya.style.color = h.color;
            const metin = new XMLSerializer().serializeToString(kopya);
            if (metin.length < 400000) {
                ekle('data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(metin))));
            }
        } catch (e) { /* serilestirilemedi */ }
    }

    // CSS background-image ile verilen logolar
    for (const el of document.querySelectorAll('header *, nav *, [class*="logo"], [id*="logo"]')) {
        if (cikti.length >= 14) break;
        const arka = getComputedStyle(el).backgroundImage;
        const m = arka && arka.match(/url\(["']?([^"')]+)["']?\)/);
        if (!m) continue;
        const r = el.getBoundingClientRect();
        if (r.width < 24 || r.top > 1400) continue;
        ekle(mutlak(m[1]));
    }

    // Site ikon bildirimleri - buyukten kucuge
    const ikonlar = [...document.querySelectorAll('link[rel*="icon"]')].map(l => ({
        href: l.href,
        boyut: +((l.getAttribute('sizes') || '0').split('x')[0]) || 0
    }));
    // En buyuk IKI ikon yeter; digerleri ayni simgenin kucuk kopyalari
    // ve gercek logonun yerini isgal ediyorlar.
    ikonlar.sort((a, b) => b.boyut - a.boyut).slice(0, 2).forEach(l => ekle(l.href));

    // META gorselleri - yalnizca adresinde logo/icon/brand gecenler.
    // puhutv gibi siteler logosunu og:image olarak veriyor.
    for (const sec of ['meta[property="og:image"]', 'meta[name="twitter:image"]',
                       'meta[name="msapplication-TileImage"]']) {
        const deger = document.querySelector(sec)?.content;
        if (deger && /logo|icon|brand/i.test(deger)) ekle(mutlak(deger));
    }

    // MARKA ZEMINI: theme-color cogu sitede yok. Logonun bulundugu
    // seridin (header/nav) hesaplanmis arka plan rengi gercek marka
    // rengini veriyor - Sozcu'nun kirmizisi buradan cikiyor.
    let markaZemin = null;
    for (let el = ilkLogoOgesi; el && el !== document.documentElement; el = el.parentElement) {
        const renk = getComputedStyle(el).backgroundColor;
        const m = renk && renk.match(/rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s]+([\d.]+))?/);
        if (!m) continue;
        if (m[4] !== undefined && parseFloat(m[4]) < 0.5) continue;      // saydam katman
        const [r, g, b] = [+m[1], +m[2], +m[3]];
        if (r === 255 && g === 255 && b === 255) break;                  // duz beyaz - marka rengi sayilmaz
        markaZemin = `rgb(${r},${g},${b})`;
        break;
    }

    const zemin = document.querySelector('meta[name="theme-color"]')?.content || null;
    return { adresler: cikti.slice(0, 16), zemin, markaZemin };
}

/**
 * Gorseli <img> etiketiyle yukleyip PNG data URI'ye cevirir.
 * fetch'in reddedildigi (Referer/hotlink kurali olan) servisler icin
 * yedek yol. DOM gerektirir - servis iscisinde calismaz.
 */
async function gorseliImgIleAl(adres) {
    if (typeof document === 'undefined') return null;
    try {
        const gorsel = new Image();
        gorsel.crossOrigin = 'anonymous';                  // tuval kirlenmesin
        gorsel.referrerPolicy = 'strict-origin-when-cross-origin';
        await new Promise((coz, at) => {
            gorsel.onload = coz;
            gorsel.onerror = () => at(new Error('yuklenemedi'));
            gorsel.src = adres;
        });
        const en = gorsel.naturalWidth, boy = gorsel.naturalHeight;
        if (!en || !boy || en < 24) return null;

        const tuval = document.createElement('canvas');
        tuval.width = en; tuval.height = boy;
        tuval.getContext('2d').drawImage(gorsel, 0, 0);
        return tuval.toDataURL('image/png');               // tuval kirliyse burada patlar
    } catch (e) {
        return null;
    }
}

/** Adresten olcu/surum rakamlarini atarak kaba bir kimlik uretir. */
function logoParmakIzi(adres) {
    try {
        const u = new URL(adres);
        return (u.hostname + u.pathname)
            .toLowerCase()
            .replace(/\d+/g, '')          // 200x50, @2x, v3, sz=128
            .replace(/[-_.]+/g, '');
    } catch (e) {
        return adres;
    }
}

/**
 * Sayfadaki inline <svg> logolarini data URI olarak dondurur.
 *
 * DOMParser yalnizca SAYFA baglaminda var (servis iscisinde yok);
 * logo yakalama Kart Duzenle penceresinden cagrildigi icin oradayiz.
 * Servis iscisinden cagrilirsa bu adim sessizce atlaniyor.
 */
function inlineSvgLogolari(html) {
    if (typeof DOMParser === 'undefined' || !html) return [];
    const cikti = [];
    try {
        const belge = new DOMParser().parseFromString(html, 'text/html');
        for (const svg of belge.querySelectorAll('svg')) {
            const kimlik = ((svg.getAttribute('class') || '') + ' ' + (svg.id || '') +
                            ' ' + (svg.getAttribute('aria-label') || '')).toLowerCase();
            if (!kimlik.includes('logo') && !kimlik.includes('brand')) continue;

            // Olcu yoksa viewBox'tan ver - olcusuz SVG tuvale cizilemiyor
            const kutu = (svg.getAttribute('viewBox') || '').split(/[\s,]+/);
            if (!svg.getAttribute('width') && kutu.length === 4) {
                svg.setAttribute('width', kutu[2]);
                svg.setAttribute('height', kutu[3]);
            }
            if (!svg.getAttribute('xmlns')) svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

            const metin = new XMLSerializer().serializeToString(svg);
            if (metin.length > 400000) continue;                 // asiri buyuk - atla
            cikti.push('data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(metin))));
            if (cikti.length >= 3) break;
        }
    } catch (e) { /* ayristirma basarisiz - digerleri var */ }
    return cikti;
}

/**
 * SVG'yi PNG blob'una cevirir. createImageBitmap SVG'yi cizemedigi
 * icin <img> + <canvas> yolu kullaniliyor - bu da yalnizca sayfa
 * baglaminda mumkun.
 */
async function svgiKareye(blob) {
    if (typeof document === 'undefined') return null;
    const adres = URL.createObjectURL(blob);
    try {
        const gorsel = new Image();
        await new Promise((coz, at) => {
            gorsel.onload = coz;
            gorsel.onerror = () => at(new Error('svg yuklenemedi'));
            gorsel.src = adres;
        });
        const en  = gorsel.naturalWidth  || 512;
        const boy = gorsel.naturalHeight || 512;
        // Vektor - buyutmek bedava. 160x27'lik logoyu oldugu gibi cizip
        // sonra karta buyutunce bulanik oluyordu.
        const olcek = Math.min(8, Math.max(1, 1024 / Math.max(en, boy)));
        const tuval = document.createElement('canvas');
        tuval.width = Math.round(en * olcek); tuval.height = Math.round(boy * olcek);
        tuval.getContext('2d').drawImage(gorsel, 0, 0, tuval.width, tuval.height);
        return await new Promise(coz => tuval.toBlob(coz, 'image/png'));
    } catch (e) {
        return null;
    } finally {
        URL.revokeObjectURL(adres);
    }
}

/**
 * Logo adaylari. Sirasi ONEMLI - once sitenin KENDI ILAN ETTIGI marka
 * gorselleri, en sonda sayfa icindeki <img> tahminleri.
 *
 *   1) web app manifest icons  - 192/512 px marka gorseli, en temizi
 *   2) apple-touch-icon        - genelde 180 px, her sitede var
 *   3) rel=icon (olculu)       - 96 px ve ustu
 *   4) JSON-LD Organization.logo
 *   5) basliktaki <img>        - sinif/kimlik/alt'inda TAM "logo" gecen
 *   6) favicon servisi         - son care
 *
 * Eski surumdeki basari buradan geliyordu: sayfadaki rastgele <img>
 * taramasi degil, sitenin ikon bildirimleri.
 */
async function logoAdresleriniTopla(url) {
    let html = '';
    try {
        const yanit = await fetch(url, { credentials: 'omit', redirect: 'follow' });
        if (yanit.ok && (yanit.headers.get('content-type') || '').includes('text/html')) {
            html = await yanit.text();
        }
    } catch (e) { /* CORS/ag - favicon servisine duseriz */ }

    const adresler = [];
    const ekle = a => {
        if (!a) return;
        if (/^data:/i.test(a)) return;             // inline SVG ayri yoldan giriyor
        const mutlak = mutlakla(a, url);
        if (!adresler.includes(mutlak)) adresler.push(mutlak);
    };
    const olculu = (kalip, enAz = 0) => {
        const bulunan = [];
        for (const m of html.matchAll(kalip)) {
            const href = m[0].match(/href=["']([^"']+)["']/i);
            if (!href) continue;
            const boyut = +(m[0].match(/sizes=["'](\d+)/i)?.[1] || 0);
            if (boyut && boyut < enAz) continue;
            bulunan.push({ href: href[1], boyut });
        }
        bulunan.sort((a, b) => b.boyut - a.boyut).forEach(x => ekle(x.href));
    };

    // 0) Sayfadaki INLINE <svg> logo. Bugun logolarin cogu boyle
    //    geliyor ve hicbir <link>/<img> icinde gorunmuyor. Sayfa
    //    baglaminda calisiyoruz (WSD sekmesi), DOMParser var.
    for (const veri of inlineSvgLogolari(html)) adresler.push(veri);

    // 1) Web app manifest ikonlari - en buyuk marka gorseli genelde burada
    const manifest = html.match(/<link[^>]+rel=["']manifest["'][^>]*>/i);
    const manifestHref = manifest && manifest[0].match(/href=["']([^"']+)["']/i)?.[1];
    if (manifestHref) {
        try {
            const my = await fetch(mutlakla(manifestHref, url), { credentials: 'omit' });
            if (my.ok) {
                const mj = await my.json();
                const ikonlar = Array.isArray(mj.icons) ? mj.icons.slice() : [];
                ikonlar.sort((a, b) =>
                    (+String(b.sizes || '0').split('x')[0] || 0) -
                    (+String(a.sizes || '0').split('x')[0] || 0));
                for (const i of ikonlar.slice(0, 4)) ekle(mutlakla(i.src, mutlakla(manifestHref, url)));
            }
        } catch (e) { /* manifest yok/bozuk */ }
    }

    // 2) apple-touch-icon (precomposed dahil), buyukten kucuge
    olculu(/<link[^>]+apple-touch-icon[^>]*>/gi);

    // 3) rel=icon - kucuk favicon'lari eleyerek
    olculu(/<link[^>]+rel=["'][^"']*\bicon\b[^"']*["'][^>]*>/gi, 96);

    // 4) JSON-LD Organization.logo
    for (const m of html.matchAll(/"logo"\s*:\s*(?:"([^"]+)"|\{[^{}]*"url"\s*:\s*"([^"]+)")/gi)) {
        ekle(m[1] || m[2]);
    }

    // 5) Sayfadaki logo <img>'leri - TAM "logo" kelimesi gecenler.
    //    Eskiden /logo|brand|marka/ genis kaliptı ve afis/kapak
    //    gorsellerine takiliyordu.
    for (const m of html.matchAll(/<img[^>]+>/gi)) {
        const etiket = m[0];
        const nitelikler = etiket.match(/(?:class|id|alt|title)=["']([^"']*)["']/gi)?.join(' ') || '';
        if (!/\blogos?\b/i.test(nitelikler) && !/\/logos?[-_.]/i.test(etiket)) continue;
        const srcset = etiket.match(/srcset=["']([^"']+)["']/i)?.[1];
        if (srcset) ekle(srcset.split(',').pop().trim().split(/\s+/)[0]);   // en buyuk olcu sonda
        ekle(etiket.match(/\ssrc=["']([^"']+)["']/i)?.[1]);
        ekle(etiket.match(/data-src=["']([^"']+)["']/i)?.[1]);
        if (adresler.length > 12) break;
    }

    // 5b) META gorselleri - adresinde logo gecenler (puhutv og:image'da veriyor)
    for (const m of html.matchAll(/<meta[^>]+(?:og:image|twitter:image|msapplication-TileImage)[^>]*>/gi)) {
        const deger = m[0].match(/content=["']([^"']+)["']/i)?.[1];
        if (deger && /logo|icon|brand/i.test(deger)) ekle(deger);
    }

    // 6) Son care: favicon servisi (her zaman PNG doner)
    try {
        adresler.push(`https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=256`);
    } catch (e) { /* gecersiz url */ }

    const zemin = html.match(/<meta[^>]+name=["']theme-color["'][^>]+content=["']([^"']+)["']/i)?.[1] || null;
    return { adresler, zemin };
}

/**
 * Logoyu 16:10 tuvale ortalar.
 *
 * ZEMIN: logonun KENDI zemini varsa (Sozcu'nun kirmizisi gibi) o renk.
 * Zemini yoksa tuval SAYDAM kaliyor - rengini kullanici "Arka Plan"
 * dugmesiyle secer. `zorlaZemin` verilirse (marka rengi varyanti) o
 * renk basiliyor.
 *
 * Cikti PNG: JPEG saydamligi tasimiyor.
 * Doner: { veri, saydam } ya da null.
 */
async function logoyuBestele(dataUri, zorlaZemin, kare = false) {
    try {
        let blob = await (await fetch(dataUri)).blob();
        if (/svg/i.test(blob.type)) {
            blob = await svgiKareye(blob);
            if (!blob) return null;                 // servis iscisi - SVG cizilemez
        }
        const bmp = await createImageBitmap(blob);

        // YAZI LOGOSU genis ve alcaktir (or. puhutv 160x27). Eskiden
        // "boy < 40" kontrolu tam da dogru adayi eliyordu. Artik uzun
        // kenara ve toplam alana bakiyoruz.
        if (Math.max(bmp.width, bmp.height) < 64 || bmp.width * bmp.height < 1200) {
            bmp.close();
            return null;
        }

        const ornek = zeminOrnekle(bmp);
        // SAYDAM LOGO DA ZEMINLI (1.6.1): saydam birakilinca kartin kendi zemini
        // gorunuyordu - koyu temada koyu yazili logolar (YouTube, Wikipedia)
        // kayboluyordu. Koyu logo beyaz, acik logo koyu zemine oturur.
        const zemin = zorlaZemin || ornek.renk;

        const W = kare ? LOGO_BOY : LOGO_EN, H = LOGO_BOY;
        const tuval = new OffscreenCanvas(W, H);
        const ctx = tuval.getContext('2d');
        if (zemin) { ctx.fillStyle = zemin; ctx.fillRect(0, 0, W, H); }

        const genis = !!zemin;                      // zeminli kartta logo buyuk dursun
        if (kare) {
            // KARE (Simge boyutu, 1.6.1): logonun cevresindeki kendi zemini
            // (genis gri bant gibi) kirpiliyor; zemin rengi kutunun tamamina
            // yayiliyor, logo kutuyu doldurur. Kucuk kutuda kucuk logo
            // secilmiyordu - oranlar buyuk.
            const k = icerikKutusu(bmp) || { x: 0, y: 0, w: bmp.width, h: bmp.height };
            const olcek = Math.min((W * 0.80) / k.w, (H * 0.80) / k.h);
            const en = k.w * olcek, boy = k.h * olcek;
            ctx.drawImage(bmp, k.x, k.y, k.w, k.h, (W - en) / 2, (H - boy) / 2, en, boy);
        } else {
            const olcek = Math.min((W * (genis ? 0.82 : 0.68)) / bmp.width, (H * (genis ? 0.72 : 0.58)) / bmp.height);
            const en = bmp.width * olcek, boy = bmp.height * olcek;
            ctx.drawImage(bmp, (W - en) / 2, (H - boy) / 2, en, boy);
        }
        bmp.close();

        const cikti = await tuval.convertToBlob({ type: 'image/png' });
        return { veri: await blobDanDataUri(cikti), saydam: ornek.saydam && !zorlaZemin };
    } catch (e) {
        return null;
    }
}

/**
 * Logonun DOLU kismi (1.6.1): sol ust kose rengiyle (ya da saydamla) ayni
 * olmayan piksellerin kutusu. Logonun cevresindeki genis zemin bandini
 * atmak icin. Bulunamazsa null (logonun tamami kullanilir).
 */
function icerikKutusu(bmp) {
    try {
        const o = Math.min(1, 300 / Math.max(bmp.width, bmp.height));
        const w = Math.max(1, Math.round(bmp.width * o)), h = Math.max(1, Math.round(bmp.height * o));
        const t = new OffscreenCanvas(w, h);
        const x = t.getContext('2d', { willReadFrequently: true });
        x.drawImage(bmp, 0, 0, w, h);
        const p = x.getImageData(0, 0, w, h).data;
        const zr = p[0], zg = p[1], zb = p[2], za = p[3];
        let x0 = w, y0 = h, x1 = -1, y1 = -1;
        for (let yy = 0; yy < h; yy++) {
            for (let xx = 0; xx < w; xx++) {
                const i = (yy * w + xx) * 4, a = p[i + 3];
                const dolu = za < 32 ? a > 32
                    : a > 32 && Math.abs(p[i] - zr) + Math.abs(p[i + 1] - zg) + Math.abs(p[i + 2] - zb) > 48;
                if (!dolu) continue;
                if (xx < x0) x0 = xx; if (xx > x1) x1 = xx;
                if (yy < y0) y0 = yy; if (yy > y1) y1 = yy;
            }
        }
        if (x1 < 0) return null;
        x0 = Math.max(0, x0 - 2); y0 = Math.max(0, y0 - 2);
        x1 = Math.min(w - 1, x1 + 2); y1 = Math.min(h - 1, y1 + 2);
        return { x: x0 / o, y: y0 / o, w: (x1 - x0 + 1) / o, h: (y1 - y0 + 1) / o };
    } catch (e) {
        return null;
    }
}

/**
 * Logonun zemin bilgisini cikarir.
 *
 *   saydam:false -> logonun kendi zemini var, rengi KOSE pikselinden
 *                   (ortalama, kirmizi zeminli beyaz yazida pembemsi
 *                   ara renk uretiyordu)
 *   saydam:true  -> zemini yok; logo ACIK renkse koyu, KOYU renkse
 *                   beyaz zemin. Eskiden hep beyaz koyuyorduk ve
 *                   beyaz yazili logolar gorunmez oluyordu.
 */
function zeminOrnekle(bmp) {
    try {
        const t = new OffscreenCanvas(24, 24);
        const x = t.getContext('2d', { willReadFrequently: true });
        x.drawImage(bmp, 0, 0, 24, 24);
        const p = x.getImageData(0, 0, 24, 24).data;
        const nokta = i => ({ r: p[i], g: p[i + 1], b: p[i + 2], a: p[i + 3] });
        const solUst = nokta(0);
        const sagUst = nokta(23 * 4);
        const sagAlt = nokta((23 * 24 + 23) * 4);

        // Gorunur piksellerin ortalama parlakligi
        let toplam = 0, sayi = 0, seffaf = 0;
        for (let i = 0; i < p.length; i += 4) {
            if (p[i + 3] < 32) { seffaf++; continue; }
            toplam += 0.2126 * p[i] + 0.7152 * p[i + 1] + 0.0722 * p[i + 2];
            sayi++;
        }
        const acikLogo = (sayi ? toplam / sayi : 255) > 140;

        const fark = (a, b) => Math.abs(a.r - b.r) + Math.abs(a.g - b.g) + Math.abs(a.b - b.b);
        const koseSeffaf  = solUst.a < 200 || sagAlt.a < 200 || sagUst.a < 200;
        const koseFarkli  = fark(solUst, sagAlt) > 60 || fark(solUst, sagUst) > 60;

        if (koseSeffaf || koseFarkli || seffaf > (p.length / 4) * 0.12) {
            return { saydam: true, acikLogo, renk: acikLogo ? '#16181d' : '#ffffff' };
        }
        return { saydam: false, acikLogo, renk: `rgb(${solUst.r},${solUst.g},${solUst.b})` };
    } catch (e) {
        return { saydam: true, acikLogo: false, renk: '#ffffff' };
    }
}

/** Renk metnini parlakliga cevirir (#abc, #aabbcc, rgb(...)). Cozulemezse null. */
function renkParlakligi(renk) {
    if (!renk) return null;
    let r, g, b;
    const h = renk.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (h) {
        const k = h[1].length === 3 ? h[1].split('').map(c => c + c).join('') : h[1];
        r = parseInt(k.slice(0, 2), 16); g = parseInt(k.slice(2, 4), 16); b = parseInt(k.slice(4, 6), 16);
    } else {
        const m = renk.match(/rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
        if (!m) return null;
        r = +m[1]; g = +m[2]; b = +m[3];
    }
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Sayfaya enjekte edilen karar cubugu (sayfa baglaminda calisir).
 *
 * Dort secenek:
 *   Cek       - ESKI DAVRANIS: gorunur kare, en buyuk video/img'ye kirpilir
 *   Alan Sec  - kullanici surukleyerek dikdortgen secer, o bolge kirpilir
 *   Uzun Cekim- sayfa kaydirilarak birden fazla kare cekilip birlestirilir
 *   Vazgec    - iptal
 */
function elleCubukEnjekte(mSahne, mCek, mAlan, mUzun, mVazgec) {
    if (document.getElementById('wsdElleCubuk')) return;

    // NOT: ogeler DOM ile kuruluyor ve stiller CSSOM'dan (el.style.x)
    // veriliyor. Once innerHTML + style="..." kullaniliyordu; KATI CSP
    // uygulayan sitelerde (or. base64encode.org) satir ici stil
    // oznitelikleri engellendigi icin cubuk gorunmez oluyordu.
    // CSSOM ile atanan stiller CSP'ye takilmiyor.
    const stil = (el, tanim) => { for (const a in tanim) el.style[a] = tanim[a]; };

    const cubuk = document.createElement('div');
    cubuk.id = 'wsdElleCubuk';
    stil(cubuk, {
        position: 'fixed', top: '12px', left: '50%', transform: 'translateX(-50%)',
        zIndex: '2147483647', display: 'flex', gap: '8px', alignItems: 'center',
        padding: '8px 12px', background: 'rgba(20,22,26,.96)',
        border: '1px solid rgba(255,255,255,.15)', borderRadius: '10px',
        boxShadow: '0 4px 20px rgba(0,0,0,.5)', font: '14px system-ui,sans-serif',
        color: '#e8eaed', margin: '0', width: 'auto', height: 'auto',
        visibility: 'visible', opacity: '1'
    });

    const etiket = document.createElement('span');
    etiket.textContent = mSahne;
    stil(etiket, { opacity: '.85', color: '#e8eaed', font: 'inherit' });
    cubuk.appendChild(etiket);

    const dugmeYap = (kimlik, metin, birincil) => {
        const b = document.createElement('button');
        b.id = kimlik;
        b.type = 'button';
        b.textContent = metin;
        stil(b, {
            borderRadius: '7px', font: 'inherit', cursor: 'pointer',
            padding: birincil ? '7px 14px' : '7px 12px',
            border: birincil ? '0' : '1px solid rgba(255,255,255,.2)',
            background: birincil ? '#5d93c2' : 'transparent',
            color: birincil ? '#fff' : '#e8eaed',
            fontWeight: birincil ? '600' : 'normal',
            margin: '0', minWidth: '0', lineHeight: 'normal'
        });
        cubuk.appendChild(b);
        return b;
    };

    dugmeYap('wsdCek', mCek, true);
    dugmeYap('wsdAlan', mAlan, false);
    dugmeYap('wsdUzun', mUzun, false);
    dugmeYap('wsdVazgec', mVazgec, false);

    document.body.appendChild(cubuk);

    // UST KATMAN: sayfadaki onay/reklam katmanlari da z-index 2147483647
    // kullaniyor ve bizden sonra eklendikleri icin ustte kaliyorlar;
    // cubuk gorunuyor ama tiklamayi onlar yutuyordu. Popover ust katmana
    // ciktigi icin hicbir sayfa katmani onune gecemiyor.
    try {
        if (typeof cubuk.showPopover === 'function') {
            cubuk.setAttribute('popover', 'manual');
            cubuk.style.inset = 'auto';
            cubuk.style.top = '12px';
            cubuk.style.left = '50%';
            cubuk.showPopover();
        }
    } catch (e) { /* eski tarayici - z-index ile idare */ }

    /**
     * CUBUGUN USTUNDEKI ORTULER
     *
     * Bazi sitelerde (cerez/onay katmanlari, reklam cerceveleri) ekrani
     * kaplayan SAYDAM bir oge duruyor ve cubugun tiklamasini yutuyor:
     * cubuk gorunuyor ama basilamiyor. Boyut/konum tahmini yerine
     * DOGRUDAN noktadan soruyoruz - her dugmenin merkezinde bizden
     * once hangi ogeler varsa onlarin fare olaylarini kapatiyoruz.
     * Cubuk kalkarken hepsi geri aciliyor.
     */
    const kapatilanlar = new Map();

    const ortuleriEtkisizlestir = () => {
        const dugmeler = [...cubuk.querySelectorAll('button'), cubuk];
        for (const hedef of dugmeler) {
            const r = hedef.getBoundingClientRect();
            if (!r.width) continue;
            const x = r.left + r.width / 2;
            const y = r.top + r.height / 2;

            for (const el of document.elementsFromPoint(x, y)) {
                if (el === cubuk || cubuk.contains(el)) break;   // bize ulastik, ustu bitti
                if (el === document.documentElement || el === document.body) continue;
                if (kapatilanlar.has(el)) continue;
                kapatilanlar.set(el, el.style.pointerEvents);
                el.style.setProperty('pointer-events', 'none', 'important');
            }
        }
    };

    /**
     * MODAL DIALOG: showModal() ile acilan bir <dialog> varsa sayfanin
     * geri kalani INERT oluyor; pointer-events ile asilamiyor, klavye
     * calisirken fare calismiyor. Cubuk acikken kapatip, is bitince
     * geri aciyoruz.
     */
    const kapatilanDialoglar = [];
    const modallariKapat = () => {
        for (const d of document.querySelectorAll('dialog[open]')) {
            try {
                if (d.matches(':modal')) { d.close(); kapatilanDialoglar.push(d); }
            } catch (e) { /* eski tarayici */ }
        }
        // Bazi siteler body'ye pointer-events:none koyuyor
        if (getComputedStyle(document.body).pointerEvents === 'none') {
            kapatilanlar.set(document.body, document.body.style.pointerEvents);
            document.body.style.setProperty('pointer-events', 'auto', 'important');
        }
    };

    const ortuleriGeriAc = () => {
        for (const [el, eski] of kapatilanlar) el.style.pointerEvents = eski || '';
        kapatilanlar.clear();
        for (const d of kapatilanDialoglar) { try { d.showModal(); } catch (e) { /* kapanmis */ } }
        kapatilanDialoglar.length = 0;
        clearInterval(sayac);
    };

    ortuleriEtkisizlestir();
    modallariKapat();
    // Onay katmani sonradan da yukleniyor - kisa sure boyunca tekrar bak
    let tur = 0;
    const sayac = setInterval(() => {
        ortuleriEtkisizlestir();
        modallariKapat();
        if (++tur > 10) clearInterval(sayac);      // ~5 saniye
    }, 500);

    const gonder = (karar, ek) => {
        ortuleriGeriAc();

        try {
            const p = chrome.runtime.sendMessage(Object.assign({ tur: 'elleKarar', karar }, ek || {}));
            if (p && p.catch) p.catch(() => { /* sekme kapanmis olabilir */ });
        } catch (e) { /* baglanti kopmus */ }
    };
    const cubuguKaldir = () => { const e = document.getElementById('wsdElleCubuk'); if (e) e.remove(); };

    // KLAVYE: bazi sayfalarda reklam/onay katmanlari tum ekrani kaplayan
    // saydam bir ortu koyuyor ve FARE tiklamasini yutuyor (or. Quantcast
    // CMP). Klavye olaylari bu ortulerden etkilenmedigi icin ayni
    // eylemler tuslarla da yapilabiliyor.
    const tus = e => {
        if (e.key === 'Enter')       { e.preventDefault(); temizleTus(); gonder('cek'); }
        else if (e.key === 'Escape') { e.preventDefault(); temizleTus(); cubuguKaldir(); gonder('vazgec'); }
        else if (e.key === 'a' || e.key === 'A' || e.key === 'ф') { e.preventDefault(); alanSecimiBaslat(); }
        else if (e.key === 'u' || e.key === 'U') { e.preventDefault(); temizleTus(); cubuguKaldir(); gonder('uzun'); }
    };
    const temizleTus = () => document.removeEventListener('keydown', tus, true);
    document.addEventListener('keydown', tus, true);

    document.getElementById('wsdCek').onclick    = () => { temizleTus(); gonder('cek'); };
    document.getElementById('wsdUzun').onclick   = () => { temizleTus(); cubuguKaldir(); gonder('uzun'); };
    document.getElementById('wsdVazgec').onclick = () => { temizleTus(); cubuguKaldir(); gonder('vazgec'); };

    // ALAN SEC: seffaf katman uzerinde surukleyerek dikdortgen. Shift ile
    // 16:10 kart oranina kilitlenir, ESC iptal eder. Olculer CSS pikselinden
    // FIZIKSEL piksele cevrilip gonderiliyor - captureVisibleTab fiziksel doner.
    document.getElementById('wsdAlan').onclick = () => alanSecimiBaslat();

    function alanSecimiBaslat() {
        temizleTus();
        ortuleriGeriAc();          // katman kendi ust katmaninda calisiyor
        cubuk.style.display = 'none';
        const oy = window.devicePixelRatio || 1;

        const katman = document.createElement('div');
        katman.id = 'wsdAlanKatman';
        stil(katman, { position: 'fixed', inset: '0', zIndex: '2147483647',
                       cursor: 'crosshair', background: 'rgba(0,0,0,.25)' });
        const secim = document.createElement('div');
        stil(secim, { position: 'fixed', border: '2px solid #5d93c2', display: 'none',
                      background: 'rgba(93,147,194,.15)', pointerEvents: 'none',
                      zIndex: '2147483647' });
        document.body.appendChild(katman);
        document.body.appendChild(secim);

        for (const el of [katman, secim]) {
            try {
                if (typeof el.showPopover === 'function') {
                    el.setAttribute('popover', 'manual');
                    el.showPopover();
                }
            } catch (e) { /* eski tarayici */ }
        }
        // Popover varsayilan kenarlik/dolgusunu temizle
        stil(katman, { margin: '0', padding: '0', border: '0', background: 'rgba(0,0,0,.25)',
                       inset: '0', width: '100%', height: '100%' });
        stil(secim, { margin: '0', padding: '0' });

        let x0 = 0, y0 = 0, ciziyor = false;
        const olc = e => {
            const x = Math.min(x0, e.clientX), y = Math.min(y0, e.clientY);
            const w = Math.abs(e.clientX - x0);
            const h = e.shiftKey ? w / 1.6 : Math.abs(e.clientY - y0);
            return { x, y, w, h };
        };
        const ciz = r => {
            secim.style.display = 'block';
            secim.style.left = r.x + 'px';  secim.style.top = r.y + 'px';
            secim.style.width = r.w + 'px'; secim.style.height = r.h + 'px';
        };
        const kapat = () => {
            katman.remove(); secim.remove();
            document.removeEventListener('keydown', esc, true);
        };
        const esc = e => { if (e.key === 'Escape') { kapat(); cubuk.style.display = 'flex'; } };
        document.addEventListener('keydown', esc, true);

        katman.onmousedown = e => { ciziyor = true; x0 = e.clientX; y0 = e.clientY; ciz(olc(e)); e.preventDefault(); };
        katman.onmousemove = e => { if (ciziyor) ciz(olc(e)); };
        katman.onmouseup = e => {
            if (!ciziyor) return;
            ciziyor = false;
            const r = olc(e);
            kapat();
            if (r.w < 24 || r.h < 24) { cubuk.style.display = 'flex'; return; }   // kaza tiklamasi
            cubuguKaldir();
            gonder('alan', {
                kutu: {
                    x: Math.round(r.x * oy), y: Math.round(r.y * oy),
                    w: Math.round(r.w * oy), h: Math.round(r.h * oy)
                }
            });
        };
    }
}

/**
 * GIZLI YAKALAMA - chrome.debugger ile.
 *
 * Sekme ARKA PLANDA aciliyor ve `Page.captureScreenshot` ile goruntu
 * aliniyor: pencere hic one gelmiyor, ekranda goz kirpma olmuyor.
 *
 * Bedeli: tarayici ustte "hata ayikliyor" cubugu gosteriyor.
 * Bu yuzden ayara bagli, varsayilan degil.
 */
async function gizliYakala(url, ayar) {
    let sekme = null;
    let baglandi = false;

    try {
        // Arka planda sekme - pencere acilmiyor.
        // NOT (1.5.3): olcuyu sayfa yuklenmeden ONCE ayarlamak (bos sekmeye
        // baglanip sonra adrese gitmek) denendi; Vivaldi'yi COKERTTI.
        // Hata ayiklayici bagliyken sekmede gezinme yapilmiyor.
        sekme = await chrome.tabs.create({ url, active: false });
        acikSekmeler.add(sekme.id);
        await sayfaStabilOlsun(sekme.id);
        // Gizli sekme cizilmiyor; bu bekleme agdan gelenler icin (yavas
        // sitelerde gerekli - kisaltinca basari dustu)
        await bekle(ayar.yakalamaBekleme);

        // Sekme arada kapanmis olabilir (kullanici kapatti, site yonlendirdi)
        try {
            await chrome.tabs.get(sekme.id);
        } catch (e) {
            return null;
        }

        const hedef = { tabId: sekme.id };
        await zamanAsimli(chrome.debugger.attach(hedef, '1.3'), 10000, 'debugger.attach');
        baglandi = true;

        // Gorunum olcusunu ayardan zorla: arka plan sekmesi kullanicinin
        // pencere olcusunu miras aliyor, biz sabit kare istiyoruz
        await zamanAsimli(chrome.debugger.sendCommand(hedef, 'Emulation.setDeviceMetricsOverride', {
            width: ayar.yakalamaEn,
            height: ayar.yakalamaBoy,
            deviceScaleFactor: 1,
            mobile: false
        }), 10000, 'setDeviceMetricsOverride');

        // GORUNUR SAYDIRMA (1.6.0): arka plan sekmesi gizli sayiliyor ve
        // tarayici onu hic cizmiyor; animasyonlar, kaydiricilar, sonradan
        // yuklenen icerik ancak sekmeye tiklayinca calisiyordu. Odak
        // benzetimi sekmeyi one getirmeden GORUNUR yapiyor (gercek tarayicida
        // olculdu: gizli/0 kare -> gorunur/60 kare). Olmazsa eskisi gibi devam.
        let gorunur = false;
        try {
            await zamanAsimli(chrome.debugger.sendCommand(hedef, 'Emulation.setFocusEmulationEnabled', { enabled: true }),
                5000, 'setFocusEmulationEnabled');
            gorunur = true;
        } catch (e) { console.log('[WSD] gorunur saydirma olmadi:', e.message); }

        // YENIDEN YERLESIM BEKLEMESI (1.5.3): olcu degisince site kendini
        // yeni genislige gore yeniden diziyor; duzenin oturmasi icin kisa bekleme.
        // Gorunur olunca acilis animasyonlari yeni basliyor: biraz daha uzun.
        await bekle(gorunur ? 1500 : 300);

        const bicim = ayar.gorselBicimi === 'png' ? 'png' : 'jpeg';
        const secenek = {
            format: bicim,
            quality: bicim === 'jpeg' ? ayar.jpegKalitesi : undefined
        };

        // KAYDIRMA `scrollTo` ILE DEGIL `clip` ILE.
        // `setDeviceMetricsOverride` gorunumu degistirirken kaydirmayi
        // sifirliyor, bu yuzden betikle kaydirmak ise yaramiyordu.
        // `clip` sayfanin istenen bolgesini dogrudan yakaliyor.
        if (ayar.yakalamaKaydirma > 0) {
            secenek.clip = {
                x: 0,
                y: ayar.yakalamaKaydirma,
                width: ayar.yakalamaEn,
                height: ayar.yakalamaBoy,
                scale: 1
            };
            // Gorunum disina cikan bolgeyi de yakalayabilmek icin sart
            secenek.captureBeyondViewport = true;
        } else {
            secenek.captureBeyondViewport = false;
        }

        // UYUYAN SEKME (1.5.5): arka plan sekmesi gizli sayiliyor ve tarayici
        // onu HIC CIZMIYOR - beklemenin yarari yok. "Loading" perdesini
        // kaldiran, icerigi beliren (fade-in) animasyonlar ancak ilk
        // cekimle basliyordu; tek kare cekince ya "Loading" ya da bos
        // (henuz saydam) sayfa geliyordu. Artik ilk cekim sayfayi UYANDIRIYOR,
        // animasyonlar ilerlesin diye aralikla birkac kare daha cekiliyor ve
        // SONUNCUSU aliniyor. Iki kare ayniysa sayfa oturmus demektir, durulur.
        // Cekim ara sira hic donmuyor (degisen bir sey yoksa kare uretilmiyor);
        // donmeyen cekimde eldeki kareyle bitiriliyor. ILK cekim (uyandirma)
        // eskisi gibi uzun sinirli: Vivaldi'de uyuyan sekmenin ilk karesi
        // gec geliyor, kisa sinirla hic kare alinamiyordu.
        const cek = ms => {
            const t = Date.now();
            return zamanAsimli(
                chrome.debugger.sendCommand(hedef, 'Page.captureScreenshot', secenek),
                ms, 'captureScreenshot').then(s => s?.data || null)
                .catch(e => { console.log('[WSD] gizli cekim:', e.message); return null; })
                .then(d => { console.log('[WSD] gizli cekim', url, (Date.now() - t) + 'ms', d ? 'kare' : 'YOK'); return d; });
        };
        let son = await cek(10000);
        for (const ara of [1200, 1500]) {
            await bekle(ara);
            // Donmeyen cekim = yeni kare yok = sayfada degisen bir sey yok;
            // eldeki kare son hal. Elde kare yoksa (uyandirma da dondu)
            // vazgecmeyip uzun sinirla bir daha deneniyor.
            const yeni = await cek(son ? 3000 : 8000);
            if (!yeni) { if (son) break; continue; }
            const ayni = yeni === son;
            son = yeni;
            if (ayni) break;
        }

        return son ? `data:image/${bicim};base64,${son}` : null;

    } catch (e) {
        console.log('[WSD] gizli yakalama basarisiz:', url, e.message);
        return null;
    } finally {
        if (baglandi && sekme) {
            try { await chrome.debugger.detach({ tabId: sekme.id }); } catch (e) { /* kopmus */ }
        }
        if (sekme) {
            acikSekmeler.delete(sekme.id);
            try { await chrome.tabs.remove(sekme.id); } catch (e) { /* kapanmis */ }
        }
    }
}

/**
 * Sayfa "complete" olduktan sonra IKI KEZ UST USTE dogrulaninca hazir sayilir.
 * Tek dogrulama yetmiyor: yonlendirme yapan siteler bir an complete olup
 * hemen yeniden yukleniyor ve o anda cekilen kare bos cikiyor.
 */
function sayfaStabilOlsun(sekmeId) {
    return new Promise(coz => {
        let ustUste = 0;
        const bitir = () => { clearInterval(sayac); clearTimeout(asim); coz(); };

        const sayac = setInterval(async () => {
            try {
                const s = await chrome.tabs.get(sekmeId);
                // Sekme once BOS SAYFAYLA (about:blank / "") "complete"
                // oluyor; site yavas yanit verince iki kontrol de ona denk
                // geliyordu ve bos sekme yakalanmaya calisiliyordu
                // ("Cannot access contents of url ''"). Gercek adres
                // gelmeden ve bekleyen gezinme bitmeden hazir sayilmaz.
                const gercekAdres = s.url && !/^about:blank/i.test(s.url) && !s.pendingUrl;
                if (s.status === 'complete' && gercekAdres) {
                    if (++ustUste >= 2) bitir();
                } else {
                    ustUste = 0;
                }
            } catch (e) {
                bitir();                      // sekme kapandi
            }
        }, 400);

        const asim = setTimeout(bitir, ZAMAN_ASIMI_MS);
    });
}

