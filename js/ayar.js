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

// WSD Speed Dial - ayarlar
//
// Tek kaynak: varsayilanlar burada. Depoda eksik anahtar olabilir (eski
// kurulum, yeni surum), o yuzden okuma HER ZAMAN varsayilanla birlestiriyor.

function rusArayuz() {
    try { return /^ru\b/i.test(chrome.i18n.getUILanguage() || ''); } catch (e) { return false; }
}

export const VARSAYILAN = {
    // Yakalama
    // Varsayilan EKRAN GORUNTUSU. Sayfa etiketleri (og:image) cogu sitede
    // sabit logo/afis donduruyor ve karti temsil etmiyor.
    yakalamaYontemi: 'ekran',    // 'ekran' | 'oto'
    yakalamaEn: 1024,
    yakalamaBoy: 768,
    yakalamaKaydirma: 0,         // px - sayfa basindan ne kadar asagi kaydirilsin
    yakalamaBekleme: 2500,       // ms - render icin ek sure
    gorselBicimi: 'jpeg',        // 'jpeg' | 'png'
    jpegKalitesi: 85,
    yakalamaKucuk: false,       // pencere kipi: yari boyutta, sag alt kosede, %50 yakinlastirma (1.5.5)
    yakalamaOneAl: false,       // odaksiz yakalama basarisizsa pencereyi one al
    yakalamaKipi: 'pencere',    // 'pencere' | 'gizli' (debugger ile, pencere hic gorunmez)
    aktarimdaYakala: true,      // ice aktarma / yedek yukleme bitince eksik gorselleri kendiliginden yakala

    // Gorunum
    duvarAcik: true,
    duvarGorsel: null,          // data URI - yoksa varsayilan gradyan
    zeminRengi: '#14161a',      // duvar kagidi kapaliyken kullanilan renk

    // Zemin renklendirme (ayri acma/kapama anahtari YOK; notr degerler
    // - ton 0, doygunluk 0, aciklik 0 - zaten "kapali" demek)
    filtreYontemi: 'ton',       // 'ton' | 'iki'
    colorize: false,            // tek tona indir (grayscale -> sepia -> ton)
    ton: 0,                     // -180..180 derece
    doygunluk: 0,               // -100..100 fark
    aciklik: 0,                 // -100..100 fark
    golgeRengi: '#1b2430',
    isikRengi: '#7fd4e8',
    siddet: 100,                // 0..100
    metinRengi: '#e8eaed',
    baslikBoyut: 13,
    // Kart/klasor basligi (1.5.2). baslikRengi bos = genel metin rengi
    baslikRengi: '',
    baslikStili: 'normal',      // 'normal' | 'kalin' | 'italik' | 'kalinItalik'
    baslikGolge: true,          // text-shadow: 1px 1px 2px <renk>
    baslikGolgeRengi: '#4d4c4c',
    // Kartlar
    kartOrani: 'o1610',         // 'o43' | 'o1610' | 'o169'
    gorselYerlesim: 'cover',    // 'cover' (kırp) | 'contain' (sığdır)
    maxSutun: 0,                // 0 = sinir yok, ekrana sigan kadar
    kartHizalama: 'orta',       // 'orta' | 'sol' - satirlar (son satir dahil) ortalanir (1.5.6)
    kartZeminRengi: '#22262e',
    kartEn: 250,
    kartBoslukYatay: 3,
    kartBoslukDikey: 12,
    kartCerceve: 1,
    kartCerceveRengi: '#6a6a6a',
    kartCerceveHoverRengi: '#576a80',
    baslikGoster: true,
    kartAcilis: 'ayni',         // 'ayni' | 'yeni' | 'arkaplan'
    sagTikMenu: 'pencere',      // sayfada sag tik: 'pencere' | 'agac' | 'gruplar' (1.5.2)
    otomatikYedek: false,       // gunde 1 kez yedek dosyasi indir
    kartAraclariGoster: true,   // kart uzerine gelince cikan buton seridi
    ekleKartiGoster: true,      // izgaradaki "+" karti
    yanPanelGizle: true,        // sagdaki serit kenara cekili, fare yaklasinca acilir (1.5.1)

    // Grup seridi
    grupGosterim: 'ikon_yazi',  // 'ikon' | 'ikon_yazi' | 'yazi'
    grupIkonRengi: '#9db4cc',
    grupZeminRengi: '#ffffff',
    grupZeminOpaklik: 6,        // % - pasif sekme zemini
    grupAktifRengi: '#576a80',
    grupAktifOpaklik: 100,      // % - aktif sekme zemini
    grupYaziRengi: '',          // bos = genel metin rengi (soluk); 1.5.2
    grupAktifYaziRengi: '',     // bos = genel metin rengi; acik renkli aktif sekmede okunmasi icin
    grupAktifIkonRengi: '',     // bos = aktif sekme yazi rengi (zemine gore) - 1.5.5
    grupKose: 9,                // grup sekmesi kose yaricapi
    grupBoyut: 100,             // sekme olcegi (%) - yazi, ikon ve dolgu birlikte
    grubuHatirla: true,         // acilista son bakilan grup mu, Ana Sayfa mi

    // Uzanti simgesi - dort kare, capraz iki renk
    simgeRenkA: '#5d93c2',      // capraz 1 ve 4
    simgeRenkB: '#a8c8e4',      // sag kol
    simgeGolge: true,           // arac cubugu simgesinde golge
    simgeGolgeRengi: '#000000',
    simgeZemin: false,          // W'nin arkasinda dolu zemin
    simgeZeminRengi: '#1b2029',
    anaSayfaGoster: true,       // kok grup seritte ve menulerde gorunsun mu
    renkliSimgeler: true,       // ayar bolumleri ve yan serit simgeleri renkli (1.5.5)
    camGorunum: true,           // ust serit ve arama cubugu buzlu cam (1.5.5)

    // Tema (1.5.5) - tema.js
    temaModu: 'koyu',           // 'koyu' | 'acik' | 'sistem'
    tema: 'gece',               // secili sablon (renkler elle degisebilir)
    temaSonMod: 'koyu',         // en son uygulanan etkin mod
    temaRenkleri: {},           // { koyu: {tema, renkler}, acik: {...} } - mod gecisinde saklanan
    temaOzel: [],               // kullanicinin kaydettigi temalar [{ id, ad, mod, r }]
    temaFiltreleri: {},         // { temaId: {filtreYontemi, ton, ...} } - zemin renklendirme temaya ozel (1.5.6)
    duvarVarsayilan: 'radial-gradient(ellipse 60% 55% at 16% 18%, rgba(70,140,230,.38), transparent 70%), radial-gradient(ellipse 55% 60% at 88% 84%, rgba(120,80,220,.30), transparent 70%), radial-gradient(ellipse 38% 34% at 82% 10%, rgba(40,170,190,.20), transparent 70%), repeating-linear-gradient(135deg, rgba(255,255,255,.025) 0 1px, transparent 1px 14px), linear-gradient(135deg, #1a3a6e, #0d1730)',   // gorsel yokken duvar

    // Web arama cubugu (1.5.5) - yalnizca Ana Sayfa'da
    webAramaGoster: true,
    webAramaYeri: 'anaSayfa',   // 'anaSayfa' (Ana Sayfa gizliyse kutu da yok) | 'ilkGrup' | 'hepsi'
    // 'tarayici' = tarayicinin kendi arama motoru. Rusca arayuzde Yandex:
    // oradaki kullanicilarin aliskin oldugu varsayilan (1.5.5)
    webMotoru: rusArayuz() ? 'yandex' : 'tarayici',
    webGizliMotorlar: [],       // listeden kaldirilan yerlesik motorlar
    webOzelMotorlar: [],        // [{ id, ad, adres ('%s' iceren), kisa }]
    webMotorSirasi: [],         // motor id'leri, kullanicinin dizdigi sira
    webAcikMotorlar: [],        // varsayilani kapali (bolgesel) olup acilanlar
};

let onbellek = null;

export async function ayarlariAl() {
    if (onbellek) return onbellek;
    try {
        const d = await chrome.storage.local.get('ayarlar');
        onbellek = { ...VARSAYILAN, ...(d.ayarlar || {}) };
        // 'etiket' secenegi kaldirildi; eski kayitlar varsayilana dussun
        if (!['ekran', 'oto'].includes(onbellek.yakalamaYontemi)) {
            onbellek.yakalamaYontemi = VARSAYILAN.yakalamaYontemi;
        }
        // "Zemini Renklendir" anahtari kaldirildi. Anahtari KAPALI olan
        // eski kayitlarda ton/renk degerleri saklidir; anahtar gidince
        // bunlar birden uygulanip zemin degisirdi. Bir kereye mahsus
        // notrleyip bayragi siliyoruz.
        if (onbellek.filtreAcik === false) {
            onbellek.filtreYontemi = 'ton';
            onbellek.colorize = false;
            onbellek.ton = 0;
            onbellek.doygunluk = 0;
            onbellek.aciklik = 0;
            delete onbellek.filtreAcik;
            chrome.storage.local.set({ ayarlar: onbellek }).catch(() => {});
        } else if ('filtreAcik' in onbellek) {
            delete onbellek.filtreAcik;
        }
    } catch (e) {
        onbellek = { ...VARSAYILAN };
    }
    return onbellek;
}

export async function ayarYaz(degisiklikler) {
    const mevcut = await ayarlariAl();
    const yeni = { ...mevcut, ...degisiklikler };

    // YEREL DEGISKENDE tutuyoruz: `set` sirasinda storage.onChanged
    // tetikleniyor ve dinleyici onbellegi null yapiyor. Dogrudan
    // `onbellek`i dondurseydik cagirana null gidiyordu.
    onbellek = yeni;
    await chrome.storage.local.set({ ayarlar: yeni });
    onbellek = yeni;                 // dinleyici sifirladiysa geri koy
    return yeni;
}

/**
 * Tum ayarlari varsayilana dondurur.
 * Kartlara, gruplara ve gorsellere DOKUNMAZ - yalnizca gorunum ve
 * davranis ayarlari sifirlanir.
 */
export async function ayarlariSifirla() {
    // Kaydedilen temalar kullanicinin ESERI: sifirlamada kalir, yalnizca
    // tek tek silinir (1.5.6). Filtreleri de onlarla birlikte.
    const eski = (await chrome.storage.local.get('ayarlar')).ayarlar || {};
    const temaOzel = Array.isArray(eski.temaOzel) ? eski.temaOzel : [];
    const ids = new Set(temaOzel.map(t => t.id));
    const temaFiltreleri = Object.fromEntries(Object.entries(eski.temaFiltreleri || {}).filter(([k]) => ids.has(k)));
    onbellek = { ...VARSAYILAN, temaOzel, temaFiltreleri };
    await chrome.storage.local.set({ ayarlar: onbellek });
    return onbellek;
}

// Baska bir yerden degistirilirse onbellek bayatlamasin
// Baska bir sekme/pencere ayarlari degistirdiyse onbellegi tazele.
// Kendi yazdigimizda `onbellek` zaten guncel; yine de depodaki degeri
// alarak tek dogru kaynakta kaliyoruz.
chrome.storage.onChanged.addListener((degisenler, alan) => {
    if (alan === 'local' && degisenler.ayarlar) {
        const yeni = degisenler.ayarlar.newValue;
        onbellek = yeni ? { ...VARSAYILAN, ...yeni } : null;
    }
});
