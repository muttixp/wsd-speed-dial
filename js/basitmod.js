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
    klasorYeri: 'alt',          // 1.7.0: klasorler kartlarin altinda kendi satirinda
    anaSayfaGoster: true,       // 1.7.0: Basit'te Ana Sayfa merkez - gizlenemez
};

/* HAZIR DUZENLER (1.7.0, Basit mod): tek tikla sayfanin butun yerlesimi.
   Duvar kagidi, tema ve kartlar degismez; yalniz boyut/aralik/konum. */
export const HAZIR_DUZENLER = {
    // Ortada genis aralikli simgeler, klasorler altta kendi satirinda
    klasik: { kartEn: 76, kartOrani: 'okare', gorselYerlesim: 'contain', kartBoslukYatay: 64, kartBoslukDikey: 34,
              maxSutun: 6, kartDikey: 'orta', kartHizalama: 'orta', klasorYeri: 'alt' },
    // Ustte sik simgeler, klasorler en ustte
    sade:   { kartEn: 76, kartOrani: 'okare', gorselYerlesim: 'contain', kartBoslukYatay: 30, kartBoslukDikey: 22,
              maxSutun: 8, kartDikey: 'ust', kartHizalama: 'orta', klasorYeri: 'ust' },
    // Site goruntulu kartlar, klasorler kartlarla birlikte
    galeri: { kartEn: 160, kartOrani: 'o1610', gorselYerlesim: 'cover', kartBoslukYatay: 20, kartBoslukDikey: 20,
              maxSutun: 6, kartDikey: 'ust', kartHizalama: 'orta', klasorYeri: 'birlikte' },
};

/** Ayarlara uyan hazir duzen adi; uymuyorsa null */
export function hazirDuzenAdi(ayar) {
    for (const [ad, d] of Object.entries(HAZIR_DUZENLER)) {
        if (Object.entries(d).every(([k, v]) => (ayar[k] ?? null) === v)) return ad;
    }
    return null;
}

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
/* SIRA (1.7.1): ikinci cagri atlanmasin, beklesin. Paketleri arka arkaya
   ekleyince yalniz ilk klasorun logolari geliyordu; digerleri bos kaliyordu. */
let logoSirasi = Promise.resolve();
export function grubaLogoKoy(...a) {
    const is = logoSirasi.then(() => logoKoyIc(...a));
    logoSirasi = is.catch(() => {});
    return is;
}

async function logoKoyIc(grupId = null) {
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
        // Simge: kare logo. Gorunen oran (Ana Sayfa duzeni genel ayardan farkli olabilir)
        const kare = (await import('./gorsel.js')).kartOraniOku() === 1;
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

/** Dile gore bilinen siteler [baslik, url] (paketler bos Ana Sayfa'yi doldururken de) */
export function hizliSiteler() {
    let dil = 'en';
    try { dil = (chrome.i18n.getUILanguage() || 'en').slice(0, 2).toLowerCase(); } catch (e) { /* en */ }
    return HIZLI[dil] || HIZLI.en;
}

/* HIZLI BASLA KLASORLERI (1.7.1): 6 sitenin yaninda Ana Sayfa'ya 3 klasor
   (Sosyal / Haber / Alisveris; Turkcede Sosyal / Eglence / Teknoloji / Alisveris). Yeni kullanici bos ya da yarim sayfa
   gormesin; begenmedigini silsin. Klasorler Ana Sayfa klasoru olarak
   isaretlenir (grup seridine gitmez). */
const HIZLI_KLASOR = {
    tr: [['Sosyal', [['Instagram', 'https://www.instagram.com/'], ['X', 'https://x.com/'], ['Facebook', 'https://www.facebook.com/'],
                     ['TikTok', 'https://www.tiktok.com/'], ['LinkedIn', 'https://www.linkedin.com/'], ['Pinterest', 'https://www.pinterest.com/']]],
         ['Eğlence', [['Netflix', 'https://www.netflix.com/'], ['Spotify', 'https://open.spotify.com/'], ['Disney+', 'https://www.disneyplus.com/'],
                      ['Prime Video', 'https://www.primevideo.com/'], ['Twitch', 'https://www.twitch.tv/'], ['Steam', 'https://store.steampowered.com/']]],
         ['Teknoloji', [['Webtekno', 'https://www.webtekno.com/'], ['ShiftDelete.Net', 'https://shiftdelete.net/'], ['DonanımHaber', 'https://www.donanimhaber.com/'],
                        ['Technopat', 'https://www.technopat.net/'], ['Chip Online', 'https://www.chip.com.tr/'], ['LOG', 'https://www.log.com.tr/']]],
         ['Alışveriş', [['Trendyol', 'https://www.trendyol.com/'], ['Hepsiburada', 'https://www.hepsiburada.com/'], ['n11', 'https://www.n11.com/'],
                        ['Amazon Türkiye', 'https://www.amazon.com.tr/'], ['sahibinden.com', 'https://www.sahibinden.com/'], ['Çiçeksepeti', 'https://www.ciceksepeti.com/']]]],
    ru: [['Медиа', [['Rutube', 'https://rutube.ru/'], ['Кинопоиск', 'https://www.kinopoisk.ru/'], ['Яндекс Музыка', 'https://music.yandex.ru/'],
                    ['Дзен', 'https://dzen.ru/'], ['Одноклассники', 'https://ok.ru/'], ['Пикабу', 'https://pikabu.ru/']]],
         ['Новости', [['РБК', 'https://www.rbc.ru/'], ['Коммерсантъ', 'https://www.kommersant.ru/'], ['Интерфакс', 'https://www.interfax.ru/'],
                      ['Лента.ру', 'https://lenta.ru/'], ['ТАСС', 'https://tass.ru/'], ['Ведомости', 'https://www.vedomosti.ru/']]],
         ['Покупки', [['Ozon', 'https://www.ozon.ru/'], ['Wildberries', 'https://www.wildberries.ru/'], ['Яндекс Маркет', 'https://market.yandex.ru/'],
                      ['Авито', 'https://www.avito.ru/'], ['AliExpress', 'https://aliexpress.ru/'], ['Мегамаркет', 'https://megamarket.ru/']]]],
    uk: [['Соцмережі', [['Instagram', 'https://www.instagram.com/'], ['Facebook', 'https://www.facebook.com/'], ['Telegram', 'https://web.telegram.org/'],
                        ['TikTok', 'https://www.tiktok.com/'], ['X', 'https://x.com/'], ['LinkedIn', 'https://www.linkedin.com/']]],
         ['Новини', [['Українська правда', 'https://www.pravda.com.ua/'], ['Суспільне', 'https://suspilne.media/'], ['УНІАН', 'https://www.unian.ua/'],
                     ['Укрінформ', 'https://www.ukrinform.ua/'], ['НВ', 'https://nv.ua/'], ['BBC Україна', 'https://www.bbc.com/ukrainian']]],
         ['Покупки', [['Rozetka', 'https://rozetka.com.ua/'], ['Prom.ua', 'https://prom.ua/'], ['OLX', 'https://www.olx.ua/'],
                      ['Епіцентр', 'https://epicentrk.ua/'], ['Comfy', 'https://comfy.ua/'], ['Нова пошта', 'https://novaposhta.ua/']]]],
    es: [['Social', [['Facebook', 'https://www.facebook.com/'], ['X', 'https://x.com/'], ['TikTok', 'https://www.tiktok.com/'],
                     ['LinkedIn', 'https://www.linkedin.com/'], ['Pinterest', 'https://www.pinterest.com/'], ['Reddit', 'https://www.reddit.com/']]],
         ['Noticias', [['El País', 'https://elpais.com/'], ['BBC Mundo', 'https://www.bbc.com/mundo'], ['El Mundo', 'https://www.elmundo.es/'],
                       ['CNN en Español', 'https://cnnespanol.cnn.com/'], ['Infobae', 'https://www.infobae.com/'], ['20minutos', 'https://www.20minutos.es/']]],
         ['Compras', [['Amazon', 'https://www.amazon.es/'], ['Mercado Libre', 'https://www.mercadolibre.com/'], ['AliExpress', 'https://es.aliexpress.com/'],
                      ['eBay', 'https://www.ebay.es/'], ['El Corte Inglés', 'https://www.elcorteingles.es/'], ['Zara', 'https://www.zara.com/']]]],
    pt: [['Social', [['Facebook', 'https://www.facebook.com/'], ['X', 'https://x.com/'], ['TikTok', 'https://www.tiktok.com/'],
                     ['LinkedIn', 'https://www.linkedin.com/'], ['Pinterest', 'https://www.pinterest.com/'], ['Reddit', 'https://www.reddit.com/']]],
         ['Notícias', [['g1', 'https://g1.globo.com/'], ['UOL', 'https://www.uol.com.br/'], ['Folha', 'https://www.folha.uol.com.br/'],
                       ['Estadão', 'https://www.estadao.com.br/'], ['CNN Brasil', 'https://www.cnnbrasil.com.br/'], ['BBC Brasil', 'https://www.bbc.com/portuguese']]],
         ['Compras', [['Mercado Livre', 'https://www.mercadolivre.com.br/'], ['Amazon', 'https://www.amazon.com.br/'], ['Shopee', 'https://shopee.com.br/'],
                      ['Magalu', 'https://www.magazineluiza.com.br/'], ['AliExpress', 'https://pt.aliexpress.com/'], ['Americanas', 'https://www.americanas.com.br/']]]],
    zh: [['社交', [['QQ', 'https://www.qq.com/'], ['抖音', 'https://www.douyin.com/'], ['小红书', 'https://www.xiaohongshu.com/'],
                   ['豆瓣', 'https://www.douban.com/'], ['百度贴吧', 'https://tieba.baidu.com/'], ['微信网页版', 'https://wx.qq.com/']]],
         ['新闻', [['新浪', 'https://www.sina.com.cn/'], ['网易', 'https://www.163.com/'], ['腾讯新闻', 'https://news.qq.com/'],
                   ['凤凰网', 'https://www.ifeng.com/'], ['澎湃新闻', 'https://www.thepaper.cn/'], ['新华网', 'http://www.xinhuanet.com/']]],
         ['购物', [['天猫', 'https://www.tmall.com/'], ['拼多多', 'https://www.pinduoduo.com/'], ['苏宁易购', 'https://www.suning.com/'],
                   ['唯品会', 'https://www.vip.com/'], ['闲鱼', 'https://www.goofish.com/'], ['当当', 'https://www.dangdang.com/']]]],
    en: [['Social', [['Facebook', 'https://www.facebook.com/'], ['X', 'https://x.com/'], ['Reddit', 'https://www.reddit.com/'],
                     ['LinkedIn', 'https://www.linkedin.com/'], ['TikTok', 'https://www.tiktok.com/'], ['Pinterest', 'https://www.pinterest.com/']]],
         ['News', [['BBC News', 'https://www.bbc.com/news'], ['Reuters', 'https://www.reuters.com/'], ['AP News', 'https://apnews.com/'],
                   ['The Guardian', 'https://www.theguardian.com/'], ['CNN', 'https://www.cnn.com/'], ['NPR', 'https://www.npr.org/']]],
         ['Shopping', [['Amazon', 'https://www.amazon.com/'], ['eBay', 'https://www.ebay.com/'], ['Walmart', 'https://www.walmart.com/'],
                       ['AliExpress', 'https://www.aliexpress.com/'], ['Etsy', 'https://www.etsy.com/'], ['Best Buy', 'https://www.bestbuy.com/']]]],
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
    const klasorler = [];
    // Yakalama beklesin: logo konacak, pencere acilmasin
    await iceAktarimBaslat();
    try {
        for (const [baslik, url] of liste) await chrome.bookmarks.create({ parentId: kok, title: baslik, url });
        // Klasorler: ayni adli Ana Sayfa klasoru varsa (ikinci tiklama) eklenmez
        const { anaKlasorIdleri } = await import('./yerimi.js');
        const { gorunumYaz } = await import('./grupikon.js');
        const ana = await anaKlasorIdleri();
        const mevcut = new Set((await chrome.bookmarks.getChildren(kok)).filter(x => !x.url && ana.has(x.id)).map(x => x.title));
        for (const [ad, siteler] of HIZLI_KLASOR[dil] || HIZLI_KLASOR.en) {
            if (mevcut.has(ad)) continue;
            const k = await chrome.bookmarks.create({ parentId: kok, title: ad });
            await gorunumYaz(k.id, { anaKlasor: true });
            for (const [baslik, url] of siteler) await chrome.bookmarks.create({ parentId: k.id, title: baslik, url });
            klasorler.push(k.id);
        }
        chrome.storage.local.set({ klasorIpucuGecildi: true }).catch(() => {});
    } finally {
        await iceAktarimBitir([]);
        if (dugme) dugme.disabled = false;
    }
    const { arayuzuKur, grubuAc } = await import('./cizim.js');
    await arayuzuKur();
    await grubuAc(kok);
    await grubaLogoKoy(kok);
    for (const id of klasorler) await grubaLogoKoy(id);
}
