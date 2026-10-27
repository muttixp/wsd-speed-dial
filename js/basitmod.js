// WSD Speed Dial - Copyright (C) 2026 muttixp - GPL-3.0-or-later
//
// BASIT MOD (1.6.1, deneysel): tek dokunusla sade baslangic sayfasi -
// kucuk kare kartlar, altta baslik, ortada grup menusu, kisa ayar paneli.
// Yeni bir gorunum DEGIL: mevcut ayarlara hazir degerler veriliyor. Basit'e
// gecerken bu ayarlarin o anki degerleri saklaniyor, Gelismis'e donunce
// geri yukleniyor. Hicbir veri silinmiyor; gruplar, klasorler yerinde.
import { ayarlariAl, ayarYaz } from './ayar.js';
import { c } from './dil.js';

const HAZIR = {
    kartEn: 76,
    kartOrani: 'okare',
    gorselYerlesim: 'contain',
    baslikKonum: 'alt',
    baslikBoyut: 12,
    kartBoslukYatay: 30,
    kartBoslukDikey: 22,
    kartAraclariGoster: false,
    kartHizalama: 'orta',
    maxSutun: 8,
    yanPanelGizle: true,
    grupBoyut: 90,
    seritUstte: false,
};

/* HAZIR BOYUTLAR (Basit mod): Simge = kare kutuda logo; digerleri ekran
   goruntusu (16:10). Baslik hep altta. */
export const HAZIR_BOYUTLAR = {
    simge:   { kartEn: 76,  kartOrani: 'okare', gorselYerlesim: 'contain', kartBoslukYatay: 30, kartBoslukDikey: 22 },
    minik:   { kartEn: 120, kartOrani: 'o1610', gorselYerlesim: 'cover',   kartBoslukYatay: 18, kartBoslukDikey: 18 },
    kucuk:   { kartEn: 160, kartOrani: 'o1610', gorselYerlesim: 'cover',   kartBoslukYatay: 20, kartBoslukDikey: 20 },
    orta:    { kartEn: 210, kartOrani: 'o1610', gorselYerlesim: 'cover',   kartBoslukYatay: 22, kartBoslukDikey: 22 },
    buyuk:   { kartEn: 270, kartOrani: 'o1610', gorselYerlesim: 'cover',   kartBoslukYatay: 24, kartBoslukDikey: 24 },
    kocaman: { kartEn: 350, kartOrani: 'o1610', gorselYerlesim: 'cover',   kartBoslukYatay: 26, kartBoslukDikey: 26 },
};

/** Ayarlara uyan hazir boyut adi; uymuyorsa 'ozel' */
export function hazirBoyutAdi(ayar) {
    for (const [ad, d] of Object.entries(HAZIR_BOYUTLAR)) {
        if (d.kartEn === ayar.kartEn && d.kartOrani === ayar.kartOrani) return ad;
    }
    return 'ozel';
}

/** basit: true -> Basit, false -> Gelismis. Yazilan ayarlari dondurur. */
export async function moduDegistir(basit) {
    const ayar = await ayarlariAl();
    if (!!ayar.basitMod === basit) return ayar;
    if (basit) {
        const onceki = Object.fromEntries(Object.keys(HAZIR).map(k => [k, ayar[k]]));
        return ayarYaz({ ...HAZIR, basitMod: true, basitOnceki: onceki });
    }
    // Gelismis: Basit'teyken kullanicinin ELLE degistirdigi deger korunur,
    // yalnizca hazir degerde duranlar eski haline doner
    const geri = {};
    for (const [k, v] of Object.entries(ayar.basitOnceki || {})) {
        if (ayar[k] === HAZIR[k] && v !== undefined) geri[k] = v;
    }
    return ayarYaz({ ...geri, basitMod: false, basitOnceki: null });
}

let calisiyor = false;

/**
 * BU GRUBA LOGO KOY: gruptaki kartlara sitenin logosu. Mevcut gorsel
 * silinmiyor, karuselde aday olarak kaliyor (Duzenle'den geri secilebilir).
 * Elle konmus gorseller de dahil: kullanici acikca istedi, geri donulebilir.
 */
export async function grubaLogoKoy(grupId = null) {
    if (calisiyor) return;
    calisiyor = true;
    const dugme = document.getElementById('ayLogoKoy');
    dugme?.classList.add('calisiyor');
    const { bildir } = await import('./arayuz.js');
    try {
        const { aktifGrup, kartGorseliniTazele } = await import('./cizim.js');
        const { kartlariAl, urlNormalle } = await import('./yerimi.js');
        const { logoYakala } = await import('./yakalama.js');
        const { gorselAl, adaylariYaz } = await import('./gorsel.js');
        const kartlar = (await kartlariAl(grupId || aktifGrup())).filter(k => /^https?:/i.test(k.url));
        const kare = (await ayarlariAl()).kartOrani === 'okare';   // Simge: kare logo
        if (!kartlar.length) { bildir(c('logoKartYok')); return; }
        let bulunan = 0;
        for (const [i, k] of kartlar.entries()) {
            bildir(c('logoIlerleme', i + 1, kartlar.length), { sure: 60000 });
            const anahtar = urlNormalle(k.url);
            const mevcut = (await gorselAl(anahtar))[anahtar] || {};
            let logo = null;
            try { [logo] = await logoYakala(k.url, 1, kare); } catch (e) { /* bulunamadi */ }
            if (!logo) continue;
            const eski = mevcut.adaylar?.length ? mevcut.adaylar : (mevcut.gorsel ? [mevcut.gorsel] : []);
            // elle=true: logo kullanicinin istegi; arka plandaki yakalama ezmesin
            await adaylariYaz(anahtar, [logo, ...eski.filter(x => x !== logo)].slice(0, 8), 0, true);
            await kartGorseliniTazele(anahtar).catch(() => {});
            bulunan++;
        }
        bildir(c('logoBitti', bulunan, kartlar.length));
    } finally {
        calisiyor = false;
        dugme?.classList.remove('calisiyor');
    }
}

/* HIZLI BASLA (1.6.1): karsilamada tek dokunus - dile gore 6 bilinen site
   Ana Sayfa'ya eklenir, hemen logolari konur. Ilk acilista sayfa bos
   kalmasin. Ekran goruntusu YAKALANMAZ (pencere acilmasin); logo
   bulunamayan kart icin kullanici sonra "Gorseli yenile" diyebilir. */
const HIZLI = {
    tr: [['Google', 'https://www.google.com/'], ['YouTube', 'https://www.youtube.com/'], ['Gmail', 'https://mail.google.com/'],
         ['Vikipedi', 'https://tr.wikipedia.org/'], ['e-Devlet', 'https://www.turkiye.gov.tr/'], ['WhatsApp', 'https://web.whatsapp.com/']],
    ru: [['Яндекс', 'https://ya.ru/'], ['ВКонтакте', 'https://vk.com/'], ['YouTube', 'https://www.youtube.com/'],
         ['Википедия', 'https://ru.wikipedia.org/'], ['Госуслуги', 'https://www.gosuslugi.ru/'], ['Telegram', 'https://web.telegram.org/']],
    uk: [['Google', 'https://www.google.com/'], ['YouTube', 'https://www.youtube.com/'], ['Gmail', 'https://mail.google.com/'],
         ['Вікіпедія', 'https://uk.wikipedia.org/'], ['Дія', 'https://diia.gov.ua/'], ['WhatsApp', 'https://web.whatsapp.com/']],
    es: [['Google', 'https://www.google.com/'], ['YouTube', 'https://www.youtube.com/'], ['Gmail', 'https://mail.google.com/'],
         ['Wikipedia', 'https://es.wikipedia.org/'], ['WhatsApp', 'https://web.whatsapp.com/'], ['Instagram', 'https://www.instagram.com/']],
    pt: [['Google', 'https://www.google.com/'], ['YouTube', 'https://www.youtube.com/'], ['Gmail', 'https://mail.google.com/'],
         ['Wikipédia', 'https://pt.wikipedia.org/'], ['WhatsApp', 'https://web.whatsapp.com/'], ['Instagram', 'https://www.instagram.com/']],
    zh: [['百度', 'https://www.baidu.com/'], ['哔哩哔哩', 'https://www.bilibili.com/'], ['知乎', 'https://www.zhihu.com/'],
         ['微博', 'https://weibo.com/'], ['淘宝', 'https://www.taobao.com/'], ['京东', 'https://www.jd.com/']],
    en: [['Google', 'https://www.google.com/'], ['YouTube', 'https://www.youtube.com/'], ['Gmail', 'https://mail.google.com/'],
         ['Wikipedia', 'https://en.wikipedia.org/'], ['WhatsApp', 'https://web.whatsapp.com/'], ['Instagram', 'https://www.instagram.com/']],
};

export async function hizliBasla() {
    if (calisiyor) return;
    let dil = 'en';
    try { dil = (chrome.i18n.getUILanguage() || 'en').slice(0, 2).toLowerCase(); } catch (e) { /* en */ }
    const liste = HIZLI[dil] || HIZLI.en;
    const dugme = document.getElementById('karsilamaHizli');
    if (dugme) dugme.disabled = true;
    const { kokKlasoruAl } = await import('./yerimi.js');
    const { iceAktarimBaslat, iceAktarimBitir } = await import('./iceaktarim.js');
    const kok = await kokKlasoruAl();
    // Yakalama beklesin: logo konacak, pencere acilmasin
    await iceAktarimBaslat();
    try {
        for (const [baslik, url] of liste) await chrome.bookmarks.create({ parentId: kok, title: baslik, url });
    } finally {
        await iceAktarimBitir([]);
        if (dugme) dugme.disabled = false;
    }
    const { arayuzuKur, grubuAc } = await import('./cizim.js');
    await arayuzuKur();
    await grubuAc(kok);
    await grubaLogoKoy(kok);
}
