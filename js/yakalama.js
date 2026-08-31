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

const YAKALAMA_ARASI_MS = 700;
const ZAMAN_ASIMI_MS = 15000;

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
let biterken = null;        // depodan devam ederken kullanilacak geri cagirma

// ISLENENLER: kuyruktan cikip su an islenen url'ler.
// Sadece `kuyruk` kontrol edilirse, isleme baslamis bir url icin gelen
// ikinci istek gecip IKINCI BIR POPUP aciyordu (sag tik menusu + bookmarks
// .onCreated ayni karti iki kez tetikliyor).
const islenenler = new Set();

/** Kuyruga ekler. Ayni url bekliyorsa ya da isleniyorsa tekrar girmez. */
export function yakalamayaEkle(url, bitince) {
    if (!url) return;
    if (islenenler.has(url)) return;
    if (kuyruk.some(i => i.url === url)) return;

    iptal = false;             // yeni is geldi - iptal bayragi sifirlansin
    kuyruk.push({ url, bitince });
    biterken = bitince || biterken;
    kuyrugaYaz();
    alarmiKur();

    if (!calisiyor) kuyruguIsle();
}

/** Kalan isleri depoya yazar - isci olurse buradan devam edilecek. */
function kuyrugaYaz() {
    const urlIer = kuyruk.map(i => i.url);
    chrome.storage.local.set({ [KUYRUK_ANAHTARI]: urlIer }).catch(() => {});
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
    const adet = kuyruk.length;
    kuyruk.length = 0;
    iptal = true;              // isleme dongusu bir sonraki adimda cikar
    alarmiKapat();
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
        const kalan = d[KUYRUK_ANAHTARI];
        if (!Array.isArray(kalan) || !kalan.length) {
            alarmiKapat();
            return;
        }

        if (kalan.length > KUYRUK_SINIRI) {
            console.log(`[WSD] kuyruk cok buyuk (${kalan.length}) - iptal edildi`);
            await kuyrugaTemizle();
            return;
        }

        console.log(`[WSD] kuyrukta ${kalan.length} is kaldi, devam ediliyor`);
        for (const url of kalan) {
            if (islenenler.has(url) || kuyruk.some(i => i.url === url)) continue;
            kuyruk.push({ url, bitince: bitince || biterken });
        }
        if (!calisiyor) kuyruguIsle();
    } catch (e) {
        console.log('[WSD] kuyruk devami okunamadi:', e);
    }
}

async function kuyruguIsle() {
    calisiyor = true;
    while (kuyruk.length) {
        if (iptal) {           // temizleme istendi - hemen cik
            kuyruk.length = 0;
            break;
        }
        const is = kuyruk.shift();
        islenenler.add(is.url);

        // On yuze haber ver: kart donence gostersin.
        // Yeni eklenen kart bos bir kutu olarak duruyordu ve kullanici
        // bir sey olup olmadigini anlayamiyordu.
        chrome.runtime.sendMessage({
            hedef: 'sayfa', tur: 'yakalamaBasladi', url: is.url
        }).catch(() => {});
        let adaylar = [];
        try {
            const ayar = await ayarlariAl();

            // Ekran goruntusu HER ZAMAN ilk aday: sayfayi en dogru temsil
            // eden kare o. Sayfa gorselleri arkasina ekleniyor ki kullanici
            // karuselden secebilsin.
            const ekran = ayar.yakalamaKipi === 'gizli'
                ? await gizliYakala(is.url, ayar)
                : await ekranGoruntusuAl(is.url, ayar);
            if (ekran) adaylar.push(ekran);

            const sayfadan = await sayfaGorselleriniAl(is.url);
            adaylar = adaylar.concat(sayfadan);

        } catch (e) {
            console.log('[WSD] yakalama hatasi:', is.url, e.message);
        }
        try {
            if (is.bitince) await is.bitince(is.url, adaylar);
        } catch (e) { /* geri cagirma patlarsa kuyruk durmasin */ }

        islenenler.delete(is.url);
        kuyrugaYaz();                 // her adimdan sonra kalan liste guncel
        await bekle(YAKALAMA_ARASI_MS);
    }
    calisiyor = false;
    alarmiKapat();                    // is bitti - bekciye gerek yok
}

const bekle = ms => new Promise(r => setTimeout(r, ms));

/**
 * Sayfadan aday gorseller toplar: og:image, twitter:image, apple-touch-icon
 * ve sayfadaki buyuk <img> ogeleri.
 *
 * En fazla ADAY_SINIRI kadar donduruyoruz; bir sayfada onlarca gorsel
 * olabiliyor ve hepsini indirmek hem yavas hem gereksiz.
 */
const ADAY_SINIRI = 4;

async function sayfaGorselleriniAl(url) {
    const adresler = await gorselAdresleriniTopla(url);
    const cikti = [];
    for (const a of adresler) {
        if (cikti.length >= ADAY_SINIRI) break;
        const veri = await gorseliIndir(a);
        if (veri && !cikti.includes(veri)) cikti.push(veri);
    }
    return cikti;
}

async function gorselAdresleriniTopla(url) {
    let html;
    try {
        const yanit = await fetch(url, { credentials: 'omit', redirect: 'follow' });
        if (!yanit.ok) return null;
        const tur = yanit.headers.get('content-type') || '';
        if (!tur.includes('text/html')) return null;
        html = await yanit.text();
    } catch (e) {
        return null;                       // CORS / ag hatasi - ekran goruntusune dus
    }

    const bulunan = [];
    const ekle = adres => {
        if (!adres) return;
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
        const yanit = await fetch(adres, { credentials: 'omit' });
        if (!yanit.ok) return null;
        const blob = await yanit.blob();
        if (!blob.type.startsWith('image/')) return null;
        if (blob.size > 8 * 1024 * 1024) return null;   // asiri buyuk - atla
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
async function ekranGoruntusuAl(url, ayar) {
    let pencere = null;
    // Kullanicinin AKTIF penceresini hatirliyoruz: yakalama sirasinda
    // odak kaymissa sonunda geri veriyoruz.
    let onceki = null;
    try { onceki = (await chrome.windows.getLastFocused()).id; } catch (e) { /* yok say */ }

    try {
        // Pencere once 1x1 aciliyor: kullanicinin ekraninda bir an bile
        // buyuk bir pencere parlamasin. Sonra gercek olcuye buyutuluyor.
        pencere = await chrome.windows.create({
            url,
            type: 'popup',
            focused: false,
            width: 1,
            height: 1,
            left: 0,
            top: 0
        });

        const sekmeId = pencere.tabs[0].id;

        await chrome.windows.update(pencere.id, {
            focused: false,
            width: ayar.yakalamaEn,
            height: ayar.yakalamaBoy,
            left: 0,
            top: 0
        });

        await sayfaStabilOlsun(sekmeId);
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

        let veri = null;
        try {
            veri = await chrome.tabs.captureVisibleTab(pencere.id, secenek);
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
        if (pencere) {
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
        // Arka planda sekme - pencere acilmiyor
        sekme = await chrome.tabs.create({ url, active: false });
        await sayfaStabilOlsun(sekme.id);
        await bekle(ayar.yakalamaBekleme);

        // Sekme arada kapanmis olabilir (kullanici kapatti, site yonlendirdi)
        try {
            await chrome.tabs.get(sekme.id);
        } catch (e) {
            return null;
        }

        const hedef = { tabId: sekme.id };
        await chrome.debugger.attach(hedef, '1.3');
        baglandi = true;

        // Gorunum olcusunu ayardan zorla: arka plan sekmesi kullanicinin
        // pencere olcusunu miras aliyor, biz sabit kare istiyoruz
        await chrome.debugger.sendCommand(hedef, 'Emulation.setDeviceMetricsOverride', {
            width: ayar.yakalamaEn,
            height: ayar.yakalamaBoy,
            deviceScaleFactor: 1,
            mobile: false
        });

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

        const sonuc = await chrome.debugger.sendCommand(hedef, 'Page.captureScreenshot', secenek);

        return sonuc && sonuc.data
            ? `data:image/${bicim};base64,${sonuc.data}`
            : null;

    } catch (e) {
        console.log('[WSD] gizli yakalama basarisiz:', url, e.message);
        return null;
    } finally {
        if (baglandi && sekme) {
            try { await chrome.debugger.detach({ tabId: sekme.id }); } catch (e) { /* kopmus */ }
        }
        if (sekme) {
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
                if (s.status === 'complete') {
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

