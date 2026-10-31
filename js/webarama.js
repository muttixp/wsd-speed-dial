/**
 * WEB ARAMA KUTUSU (1.5.5)
 *
 * Yalnizca Ana Sayfa'da, kartlarin ustunde. Varsayilan motor TARAYICININ
 * kendi arama motoru (chrome.search - kullanicinin tarayici ayarindaki
 * motor). Soldaki simgeden baska bir motor yalnizca o arama icin
 * secilebiliyor; listedeki raptiye o motoru kalici varsayilan yapiyor.
 * "g kelime", "yt kelime" gibi kisayollar da var.
 *
 * Diger motorlar yalnizca o motorun arama sayfasina GIDIS: tarayicinin
 * arama ayarina dokunulmuyor, adrese ortaklik/izleme kodu eklenmiyor,
 * yazarken hicbir yere istek gitmiyor.
 *
 * ARAMA ONERILERI (1.6.1): istege bagli, varsayilan KAPALI. Acilinca
 * yazilan metin secili motorun oneri servisine gider (motorun kendi
 * servisi yoksa Google; Rusca arayuzde Yandex). Cerez gonderilmez.
 */
import { c } from './dil.js';
import { ayarlariAl, ayarYaz } from './ayar.js';

const el = id => document.getElementById(id);

function wikiDili() {
    try { return (chrome.i18n.getUILanguage() || 'en').slice(0, 2).toLowerCase(); }
    catch (e) { return 'en'; }
}

// Yandex dile gore (1.6.1): herkes yandex.com.tr'ye gidiyordu - Rusca
// kullanici Turkce sonuc goruyordu
function yandexAlani() {
    const d = wikiDili();
    if (['ru', 'be', 'kk'].includes(d)) return 'yandex.ru';
    if (d === 'tr') return 'yandex.com.tr';
    return 'yandex.com';
}

// kisa: kisayol oneki ("g kelime"). renk: harf rozeti.
const MOTORLAR = [
    { id: 'tarayici',   ad: null,          kisa: '',   renk: '' },
    { id: 'google',     ad: 'Google',      kisa: 'g',  renk: '#4285f4', adres: 'https://www.google.com/search?q=%s' },
    { id: 'bing',       ad: 'Bing',        kisa: 'b',  renk: '#00809d', adres: 'https://www.bing.com/search?q=%s' },
    { id: 'duckduckgo', ad: 'DuckDuckGo',  kisa: 'd',  renk: '#de5833', adres: 'https://duckduckgo.com/?q=%s' },
    { id: 'yandex',     ad: 'Yandex',      kisa: 'y',  renk: '#fc3f1d', adres: () => `https://${yandexAlani()}/search/?text=%s` },
    { id: 'brave',      ad: 'Brave Search', kisa: 'br', renk: '#fb542b', adres: 'https://search.brave.com/search?q=%s' },
    { id: 'ecosia',     ad: 'Ecosia',      kisa: 'e',  renk: '#36acb8', adres: 'https://www.ecosia.org/search?q=%s' },
    { id: 'startpage',  ad: 'Startpage',   kisa: 's',  renk: '#6573ff', adres: 'https://www.startpage.com/do/search?query=%s' },
    { id: 'wikipedia',  ad: 'Wikipedia',   kisa: 'w',  renk: '#636466', adres: () => `https://${wikiDili()}.wikipedia.org/w/index.php?search=%s` },
    { id: 'youtube',    ad: 'YouTube',     kisa: 'yt', renk: '#ff0000', adres: 'https://www.youtube.com/results?search_query=%s' },
    { id: 'github',     ad: 'GitHub',      kisa: 'gh', renk: '#6e5494', adres: 'https://github.com/search?q=%s' },

    // YAPAY ZEKA (1.6.2): soruyu dogrudan o hizmete gotururlar; listede ayri
    // bolumde, en altta. Oneri servisleri yok - yazarken oneri istenmez.
    { id: 'perplexity', ad: 'Perplexity',  kisa: 'px', renk: '#20808d', grup: 'yz', adres: 'https://www.perplexity.ai/search?q=%s' },
    { id: 'chatgpt',    ad: 'ChatGPT',     kisa: 'gpt', renk: '#10a37f', grup: 'yz', adres: 'https://chatgpt.com/?q=%s&hints=search' },
    { id: 'claude',     ad: 'Claude',      kisa: 'cl', renk: '#d97757', grup: 'yz', adres: 'https://claude.ai/new?q=%s' },
    { id: 'copilot',    ad: 'Copilot',     kisa: 'co', renk: '#2b6be6', grup: 'yz', adres: 'https://copilot.microsoft.com/?q=%s' },

    // BOLGESEL (bolge): yalnizca o bolgedeki kullanicida listelenir.
    // kapali: ilk kurulumda listede KAPALI gelir, kullanici acar.
    { id: 'sahibinden',  ad: 'Sahibinden',  kisa: 'sh', renk: '#d4a900', bolge: 'tr', kapali: true, adres: 'https://www.sahibinden.com/arama?query_text=%s' },
    { id: 'trendyol',    ad: 'Trendyol',    kisa: 'ty', renk: '#f27a1a', bolge: 'tr', kapali: true, adres: 'https://www.trendyol.com/sr?q=%s' },
    { id: 'hepsiburada', ad: 'Hepsiburada', kisa: 'hb', renk: '#ff6000', bolge: 'tr', kapali: true, adres: 'https://www.hepsiburada.com/ara?q=%s' },
    { id: 'webtecity',   ad: 'WEBTE City',  kisa: 'wc', renk: '#1e6fd0', bolge: 'tr', kapali: true, adres: 'https://webtecity.com/index.php?option=com_webtebusiness&view=businesses&q=%s' },
    { id: 'avito',       ad: 'Avito',       kisa: 'av', renk: '#00aaff', bolge: 'ru', kapali: true, adres: 'https://www.avito.ru/all?q=%s' },
    { id: 'ozon',        ad: 'Ozon',        kisa: 'oz', renk: '#005bff', bolge: 'ru', kapali: true, adres: 'https://www.ozon.ru/search/?text=%s' },
    { id: 'wildberries', ad: 'Wildberries', kisa: 'wb', renk: '#cb11ab', bolge: 'ru', kapali: true, adres: 'https://www.wildberries.ru/catalog/0/search.aspx?search=%s' },
    { id: 'yamarket',    ad: 'Яндекс Маркет', kisa: 'ym', renk: '#f5b400', bolge: 'ru', kapali: true, adres: 'https://market.yandex.ru/search?text=%s' },
];

/**
 * Kullanicinin bolgesi. Ulke bilgisi eklentiye gelmiyor; iki ipucu var:
 * tarayici dili ve saat dilimi. Biri tutarsa yeter (yurt disindaki Turkce
 * tarayici da, Ingilizce tarayicili Turkiye kullanicisi da gorsun).
 * Izin ya da ag istegi gerektirmiyor.
 */
const BOLGELER = new Set();
try {
    const dil = (chrome.i18n.getUILanguage() || '').toLowerCase();
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    // 1.6.1: TEK bolge - Turkiye ya da Rusya, ikisi birden asla; digerlerinde
    // ek motor yok. Once dil, dil belirleyici degilse saat dilimi.
    const RUSYA_TZ = /^(Europe\/(Moscow|Samara|Volgograd|Kaliningrad|Kirov|Astrakhan|Saratov|Ulyanovsk)|Asia\/(Yekaterinburg|Omsk|Novosibirsk|Barnaul|Tomsk|Novokuznetsk|Krasnoyarsk|Irkutsk|Chita|Yakutsk|Khandyga|Vladivostok|Ust-Nera|Magadan|Sakhalin|Srednekolymsk|Kamchatka|Anadyr))$/;
    if (dil.startsWith('tr')) BOLGELER.add('tr');
    else if (dil.startsWith('ru')) BOLGELER.add('ru');
    else if (tz === 'Europe/Istanbul') BOLGELER.add('tr');
    else if (RUSYA_TZ.test(tz)) BOLGELER.add('ru');
} catch (e) { /* bolge yok - yalnizca genel motorlar */ }

// Kullanicinin ekledigi motorlar ve listeden gizlenen yerlesikler
// ayarlarda: webOzelMotorlar [{id, ad, adres, kisa}], webGizliMotorlar [id]
let ozelMotorlar = [];
let gizliMotorlar = [];
let acikMotorlar = [];           // varsayilani kapali olup kullanicinin actiklari
let sira = [];                   // webMotorSirasi: kullanicinin dizdigi sira

/** Tum motorlar, kullanicinin sirasinda. Tarayici motoru hep basta. */
function tumMotorlar() {
    const digerleri = [...MOTORLAR.slice(1).filter(m => !m.bolge || BOLGELER.has(m.bolge)), ...ozelMotorlar];
    const yer = (m, i) => { const k = sira.indexOf(m.id); return k < 0 ? 1000 + i : k; };
    const sirali = digerleri.map((m, i) => [yer(m, i), m]).sort((a, b) => a[0] - b[0]).map(x => x[1]);
    return [MOTORLAR[0], ...sirali];
}
/** Kutudaki listede gorunenler (tarayici motoru hep var) */
const gizliMi = m => m.kapali ? !acikMotorlar.includes(m.id) : gizliMotorlar.includes(m.id);
const gorunenMotorlar = () => tumMotorlar().filter(m => m.id === 'tarayici' || !gizliMi(m));
const motorBul = id => tumMotorlar().find(m => m.id === id) || MOTORLAR[0];
const motorAdi = m => m.ad || c('webTarayiciMotoru');

let varsayilanId = 'tarayici';
let anlikId = null;              // yalnizca bu arama icin secilen

function ozelRenk(ad) {
    let h = 0;
    for (const ch of ad) h = (h * 31 + ch.charCodeAt(0)) % 360;
    return `hsl(${h} 55% 45%)`;
}

async function ayarlariOku() {
    const a = await ayarlariAl();
    ozelMotorlar = (Array.isArray(a.webOzelMotorlar) ? a.webOzelMotorlar : [])
        .filter(m => m && m.id && m.ad && m.adres)
        .map(m => ({ ...m, renk: ozelRenk(m.ad), ozel: true }));
    gizliMotorlar = Array.isArray(a.webGizliMotorlar) ? a.webGizliMotorlar : [];
    sira = Array.isArray(a.webMotorSirasi) ? a.webMotorSirasi : [];
    acikMotorlar = Array.isArray(a.webAcikMotorlar) ? a.webAcikMotorlar : [];
    varsayilanId = motorBul(a.webMotoru).id;
    // Varsayilan gizlenmisse/silinmisse tarayici motoruna dus
    if (varsayilanId !== 'tarayici' && gizliMi(motorBul(varsayilanId))) varsayilanId = 'tarayici';
    if (anlikId && !gorunenMotorlar().some(m => m.id === anlikId)) anlikId = null;
    oneriAcik = a.webOneriler === true;
    if (!oneriAcik) oneriKapat();
    document.body.classList.toggle('webAramaKapali', a.webAramaGoster === false);
    const yer = ['anaSayfa', 'ilkGrup', 'hepsi'].includes(a.webAramaYeri) ? a.webAramaYeri : 'anaSayfa';
    document.body.classList.toggle('webYerAna', yer === 'anaSayfa');
    document.body.classList.toggle('webYerIlk', yer === 'ilkGrup');
    document.body.classList.toggle('webYerHepsi', yer === 'hepsi');
}

function simgeHTML(m) {
    if (m.id === 'tarayici') {
        return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';
    }
    const ikon = ikonlar[motorKoken(m)]?.d;
    if (ikon) return `<img class="webIkon" src="${ikon}" alt="">`;
    ikonIste(m);
    const harf = (m.ad || '?').trim()[0] || '?';
    const span = document.createElement('span');
    span.className = 'webRozet';
    span.style.background = m.renk;
    span.textContent = harf.toUpperCase();
    return span.outerHTML;
}

/* ---------- Site simgeleri (favicon) ----------
 * Motorun kendi sitesinden BIR KEZ alinip yerelde saklaniyor
 * ('webMotorIkonlari': { koken: { d: dataUri | '', t: zaman } }).
 * Cerez gonderilmiyor. Alinamazsa harf rozeti kaliyor; 7 gun sonra
 * yeniden deneniyor.
 */
const IKON_ANAHTARI = 'webMotorIkonlari';
const IKON_TEKRAR_MS = 7 * 24 * 3600 * 1000;
let ikonlar = {};
const istenen = new Set();

function motorKoken(m) {
    if (!m || m.id === 'tarayici') return '';
    try {
        const sablon = typeof m.adres === 'function' ? m.adres() : m.adres;
        return new URL(sablon.replaceAll('%s', 'x')).origin;
    } catch (e) { return ''; }
}

function sureliFetch(adres, ms = 8000) {
    const k = new AbortController();
    const t = setTimeout(() => k.abort(), ms);
    return fetch(adres, { credentials: 'omit', signal: k.signal }).finally(() => clearTimeout(t));
}

/** Gorseli 32px PNG'ye indirger: depoda az yer tutsun, .ico/.svg da olsun */
function kucult(blob) {
    return new Promise(coz => {
        const u = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
            try {
                const N = 32, t = document.createElement('canvas');
                t.width = t.height = N;
                t.getContext('2d').drawImage(img, 0, 0, N, N);
                coz(img.naturalWidth ? t.toDataURL('image/png') : '');
            } catch (e) { coz(''); }
            URL.revokeObjectURL(u);
        };
        img.onerror = () => { URL.revokeObjectURL(u); coz(''); };
        img.src = u;
    });
}

async function ikonBul(koken) {
    const adaylar = [];
    try {
        const yanit = await sureliFetch(koken + '/');
        const html = await yanit.text();
        const belge = new DOMParser().parseFromString(html, 'text/html');
        const linkler = [...belge.querySelectorAll('link[rel][href]')]
            .filter(l => /(^|\s)(icon|apple-touch-icon)(\s|$)/i.test(l.rel));
        // Buyuk ve keskin olani once: apple-touch / sizes buyuk / svg
        const puan = l => {
            const b = parseInt((l.getAttribute('sizes') || '').split('x')[0], 10) || 0;
            return (/apple/i.test(l.rel) ? 300 : 0) + (/svg/i.test(l.type || l.href) ? 200 : 0) + Math.min(b, 192);
        };
        linkler.sort((a, b) => puan(b) - puan(a));
        for (const l of linkler) {
            try { adaylar.push(new URL(l.getAttribute('href'), yanit.url || koken).href); } catch (e) { /* */ }
        }
    } catch (e) { /* ana sayfa alinamadi - favicon.ico'yu dene */ }
    adaylar.push(koken + '/favicon.ico');

    for (const a of adaylar.slice(0, 4)) {
        try {
            const y = await sureliFetch(a);
            if (!y.ok) continue;
            const veri = await kucult(await y.blob());
            if (veri) return veri;
        } catch (e) { /* sonrakini dene */ }
    }
    return '';
}

async function ikonIste(m) {
    const koken = motorKoken(m);
    if (!koken || istenen.has(koken)) return;
    const kayit = ikonlar[koken];
    if (kayit && (kayit.d || Date.now() - kayit.t < IKON_TEKRAR_MS)) return;
    istenen.add(koken);
    const d = await ikonBul(koken).catch(() => '');
    ikonlar = { ...ikonlar, [koken]: { d, t: Date.now() } };
    try { await chrome.storage.local.set({ [IKON_ANAHTARI]: ikonlar }); } catch (e) { /* */ }
    istenen.delete(koken);
    if (d) hepsiniTazele();
}

let tazeZaman = null;
function hepsiniTazele() {
    clearTimeout(tazeZaman);
    tazeZaman = setTimeout(() => {
        simgeyiTazele();
        if (!el('webMotorListe').hidden) listeyiCiz();
        ayarPaneliniCiz();
    }, 100);
}

function simgeyiTazele() {
    const m = motorBul(anlikId || varsayilanId);
    el('webMotorSimge').innerHTML = simgeHTML(m);
    el('webMotorBtn').title = motorAdi(m);
    el('webAramaAlan').placeholder = m.id === 'tarayici' ? c('webAraYerTarayici') : c('webAraYer', motorAdi(m));
}

function listeyiCiz() {
    const liste = el('webMotorListe');
    liste.textContent = '';
    const secili = anlikId || varsayilanId;
    const motorlar = gorunenMotorlar();
    const sirali = [...motorlar.filter(m => m.grup !== 'yz'), ...motorlar.filter(m => m.grup === 'yz')];
    let ayracKondu = false;
    for (const m of sirali) {
        if (m.grup === 'yz' && !ayracKondu) {
            ayracKondu = true;
            const a = document.createElement('li');
            a.className = 'webAyrac';
            a.setAttribute('role', 'separator');
            a.textContent = c('webYapayZeka');
            liste.appendChild(a);
        }
        const li = document.createElement('li');
        li.setAttribute('role', 'option');
        li.dataset.motor = m.id;
        li.className = 'webMotor' + (m.id === secili ? ' secili' : '');
        li.innerHTML = `<span class="webMotorSimge">${simgeHTML(m)}</span>`
            + `<span class="webMotorAd"></span>`
            + (m.kisa ? '<kbd class="webKisa"></kbd>' : '')
            + `<button type="button" class="webRaptiye${m.id === varsayilanId ? ' varsayilan' : ''}" title="${c('webVarsayilanYap')}">`
            + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 17v5"/><path d="M9 10.76V6h6v4.76l2 3.24H7z"/><path d="M8 2h8"/></svg></button>';
        li.querySelector('.webMotorAd').textContent = motorAdi(m);
        if (m.kisa) li.querySelector('.webKisa').textContent = m.kisa;
        liste.appendChild(li);
    }
}

function listeAc(ac) {
    const liste = el('webMotorListe');
    if (ac) listeyiCiz();
    liste.hidden = !ac;
    el('webMotorBtn').setAttribute('aria-expanded', String(ac));
}

/** Yazilan bir adres mi? (bosluksuz, nokta iceren ya da semali) */
function adresMi(t) {
    if (/\s/.test(t)) return null;
    if (/^https?:\/\//i.test(t)) return t;
    if (/^localhost(:\d+)?(\/|$)/i.test(t)) return 'http://' + t;
    if (/^[\w-]+(\.[\w-]+)*\.[a-z]{2,}(:\d+)?(\/\S*)?$/i.test(t)) return 'https://' + t;
    return null;
}

/** Kisayol: "yt kedi" -> YouTube'da "kedi". onek: kisayol kismi ("yt ") */
function cozumle(metin) {
    let motor = motorBul(anlikId || varsayilanId);
    let onek = '';
    const bosluk = metin.indexOf(' ');
    if (bosluk > 0) {
        const on = metin.slice(0, bosluk).toLowerCase();
        const kisa = gorunenMotorlar().find(m => m.kisa && m.kisa.toLowerCase() === on);
        const kalan = metin.slice(bosluk + 1).trimStart();
        if (kisa && kalan.trim()) { motor = kisa; onek = metin.slice(0, bosluk + 1); metin = kalan.trim(); }
    }
    return { motor, metin, onek };
}

/* ---------- Arama onerileri (1.6.1) ---------- */
let oneriAcik = false;
const ONERI = {
    google:     q => `https://suggestqueries.google.com/complete/search?client=firefox&ie=utf-8&oe=utf-8&hl=${wikiDili()}&q=${q}`,
    youtube:    q => `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&ie=utf-8&oe=utf-8&hl=${wikiDili()}&q=${q}`,
    bing:       q => `https://api.bing.com/osjson.aspx?query=${q}`,
    duckduckgo: q => `https://duckduckgo.com/ac/?type=list&q=${q}`,
    yandex:     q => `https://suggest.yandex.ru/suggest-ff.cgi?part=${q}`,
    wikipedia:  q => `https://${wikiDili()}.wikipedia.org/w/api.php?action=opensearch&format=json&limit=8&search=${q}`,
};
const oneriAdresi = (motor, q) => (ONERI[motor.id] || (wikiDili() === 'ru' ? ONERI.yandex : ONERI.google))(encodeURIComponent(q));

let oneriSayac = 0, oneriBekle = null, oneriIstek = null, oneriSecili = -1, yazilan = '';

function oneriKapat() {
    clearTimeout(oneriBekle);
    oneriIstek?.abort();
    oneriSecili = -1;
    const l = document.getElementById('webOneriListe');
    if (l) { l.hidden = true; l.textContent = ''; }
}

function oneriIste() {
    clearTimeout(oneriBekle);
    if (!oneriAcik) return;
    const ham = el('webAramaAlan').value;
    yazilan = ham;
    const { motor, metin, onek } = cozumle(ham.trim() ? ham : '');
    if (!metin || metin.length > 120 || adresMi(metin) || motor.grup === 'yz') { oneriKapat(); return; }
    oneriBekle = setTimeout(async () => {
        const benim = ++oneriSayac;
        oneriIstek?.abort();
        oneriIstek = new AbortController();
        const t = setTimeout(() => oneriIstek?.abort(), 4000);
        try {
            const y = await fetch(oneriAdresi(motor, metin), { credentials: 'omit', signal: oneriIstek.signal });
            const d = JSON.parse(await y.text());
            const liste = (Array.isArray(d) && Array.isArray(d[1]) ? d[1] : [])
                .map(x => typeof x === 'string' ? x : x?.phrase).filter(Boolean)
                .filter(x => x.toLowerCase() !== metin.toLowerCase()).slice(0, 8);
            if (benim === oneriSayac && el('webAramaAlan').value === ham) oneriCiz(liste, onek);
        } catch (e) { /* ag yok / iptal - liste acilmaz */ }
        finally { clearTimeout(t); }
    }, 120);
}

function oneriCiz(liste, onek) {
    const l = el('webOneriListe');
    l.textContent = '';
    oneriSecili = -1;
    if (!liste.length || document.activeElement !== el('webAramaAlan')) { l.hidden = true; return; }
    for (const o of liste) {
        const li = document.createElement('li');
        li.className = 'webOneri';
        li.setAttribute('role', 'option');
        li.dataset.deger = onek + o;
        li.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><span></span>';
        li.querySelector('span').textContent = o;
        l.appendChild(li);
    }
    el('webMotorListe').hidden = true;
    l.hidden = false;
}

function oneriGez(yon) {
    const l = el('webOneriListe');
    const ogeler = [...l.querySelectorAll('.webOneri')];
    if (l.hidden || !ogeler.length) return false;
    oneriSecili += yon;
    if (oneriSecili < -1) oneriSecili = ogeler.length - 1;
    if (oneriSecili >= ogeler.length) oneriSecili = -1;
    ogeler.forEach((li, i) => li.classList.toggle('secili', i === oneriSecili));
    el('webAramaAlan').value = oneriSecili < 0 ? yazilan : ogeler[oneriSecili].dataset.deger;
    return true;
}

async function ara(yeniSekme) {
    const alan = el('webAramaAlan');
    let metin = alan.value.trim();
    if (!metin) return;

    oneriKapat();
    let motor;
    ({ motor, metin } = cozumle(metin));

    const git = adres => {
        if (yeniSekme) chrome.tabs.create({ url: adres, active: false }).catch(() => window.open(adres, '_blank'));
        else location.href = adres;
    };

    anlikId = null;
    if (yeniSekme) { alan.value = ''; simgeyiTazele(); }

    const adres = adresMi(metin);
    if (adres) { git(adres); return; }

    if (motor.id === 'tarayici') {
        if (chrome.search?.query) {
            try {
                await chrome.search.query({ text: metin, disposition: yeniSekme ? 'NEW_TAB' : 'CURRENT_TAB' });
                return;
            } catch (e) { console.log('[WSD] tarayici aramasi olmadi:', e.message); }
        }
        motor = motorBul('google');      // API yoksa
    }
    const sablon = typeof motor.adres === 'function' ? motor.adres() : motor.adres;
    git(sablon.replaceAll('%s', encodeURIComponent(metin)));
}

export async function webAramayiKur() {
    const kutu = el('webArama');
    if (!kutu) return;

    try { await ayarlariOku(); } catch (e) { /* */ }
    try { ikonlar = (await chrome.storage.local.get(IKON_ANAHTARI))[IKON_ANAHTARI] || {}; } catch (e) { /* */ }
    simgeyiTazele();

    // Ayar degisince (bu ya da baska sekmede) kutu ve ayar paneli tazelensin
    chrome.storage.onChanged.addListener(async (d, alan) => {
        if (alan !== 'local' || !d.ayarlar) return;
        await ayarlariOku().catch(() => {});
        simgeyiTazele();
        if (!el('webMotorListe').hidden) listeyiCiz();
        ayarPaneliniCiz();
    });
    ayarPaneliKur();

    kutu.addEventListener('submit', e => { e.preventDefault(); ara(false); });
    el('webAramaAlan').addEventListener('input', oneriIste);
    el('webAramaAlan').addEventListener('blur', () => setTimeout(oneriKapat, 150));
    el('webOneriListe').addEventListener('mousedown', e => {
        const li = e.target.closest('.webOneri');
        if (!li) return;
        e.preventDefault();                       // alan odagini kaybetmesin
        el('webAramaAlan').value = li.dataset.deger;
        ara(e.ctrlKey || e.metaKey || e.button === 1);
    });
    el('webAramaAlan').addEventListener('keydown', e => {
        if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && oneriGez(e.key === 'ArrowDown' ? 1 : -1)) {
            e.preventDefault();
        } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey)) {
            e.preventDefault();
            ara(true);
        } else if (e.key === 'Escape') {
            if (!el('webOneriListe').hidden) {
                e.preventDefault();               // arama alani Esc'de kendini temizliyor
                el('webAramaAlan').value = yazilan || el('webAramaAlan').value;
                oneriKapat();
            }
            else if (!el('webMotorListe').hidden) listeAc(false);
            else { e.target.value = ''; anlikId = null; simgeyiTazele(); e.target.blur(); }
        }
    });

    el('webMotorBtn').addEventListener('click', e => {
        e.stopPropagation();
        listeAc(el('webMotorListe').hidden);
    });

    el('webMotorListe').addEventListener('click', async e => {
        e.stopPropagation();
        const li = e.target.closest('.webMotor');
        if (!li) return;
        if (e.target.closest('.webRaptiye')) {
            varsayilanId = li.dataset.motor;
            anlikId = null;
            await ayarYaz({ webMotoru: varsayilanId }).catch(() => {});
        } else {
            anlikId = li.dataset.motor === varsayilanId ? null : li.dataset.motor;
        }
        simgeyiTazele();
        listeAc(false);
        el('webAramaAlan').focus();
    });

    document.addEventListener('click', e => {
        if (!el('webMotorListe').hidden && !e.target.closest('#webArama')) listeAc(false);
    });
}

/* ============ Ayar paneli: Ana Sayfa > Arama Cubugu ============ */

function ayarPaneliniCiz() {
    const sec = el('ayWebMotor');
    const liste = el('ayWebMotorlar');
    if (!sec || !liste) return;

    ayarlariAl().then(a => {
        el('ayWebArama').checked = a.webAramaGoster !== false;
        if (el('ayWebOneri')) el('ayWebOneri').checked = a.webOneriler === true;
        if (el('ayWebAramaYeri')) {
            el('ayWebAramaYeri').value = a.webAramaYeri || 'anaSayfa';
            el('ayWebAramaYeri').disabled = a.webAramaGoster === false;
        }
    }).catch(() => {});

    sec.textContent = '';
    for (const m of gorunenMotorlar()) {
        const o = document.createElement('option');
        o.value = m.id;
        o.textContent = motorAdi(m);
        sec.appendChild(o);
    }
    sec.value = varsayilanId;

    liste.textContent = '';
    for (const m of tumMotorlar()) {
        if (m.id === 'tarayici') continue;
        const li = document.createElement('li');
        li.dataset.motor = m.id;
        li.className = 'webMotorAyar';
        li.draggable = true;
        li.innerHTML = '<span class="webTutamac" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/></svg></span>'
            + '<input type="checkbox" class="anahtar">'
            + `<span class="webMotorSimge">${simgeHTML(m)}</span>`
            + '<span class="webMotorAd"></span>'
            + (m.kisa ? '<kbd class="webKisa"></kbd>' : '')
            + (m.ozel ? `<button type="button" class="webMotorSil" title="${c('sil')}">&#10005;</button>` : '');
        li.querySelector('input').checked = !gizliMi(m);
        li.querySelector('.webMotorAd').textContent = m.ad;
        li.querySelector('.webMotorAd').title = m.ozel ? m.adres : '';
        if (m.kisa) li.querySelector('.webKisa').textContent = m.kisa;
        liste.appendChild(li);
    }
}

function ayarPaneliKur() {
    if (!el('ayWebMotor')) return;
    ayarPaneliniCiz();

    el('ayWebArama').addEventListener('change', e => {
        if (el('ayWebAramaYeri')) el('ayWebAramaYeri').disabled = !e.target.checked;
        ayarYaz({ webAramaGoster: e.target.checked }).catch(() => {});
    });
    el('ayWebAramaYeri')?.addEventListener('change', e => ayarYaz({ webAramaYeri: e.target.value }).catch(() => {}));
    el('ayWebOneri')?.addEventListener('change', e => ayarYaz({ webOneriler: e.target.checked }).catch(() => {}));
    el('ayWebMotor').addEventListener('change', e => ayarYaz({ webMotoru: e.target.value }).catch(() => {}));

    el('ayWebMotorlar').addEventListener('change', e => {
        const li = e.target.closest('.webMotorAyar');
        if (!li) return;
        const id = li.dataset.motor;
        if (motorBul(id).kapali) {
            // Varsayilani kapali olanlar ayri listede tutuluyor
            const yeni = acikMotorlar.filter(x => x !== id);
            if (e.target.checked) yeni.push(id);
            ayarYaz({ webAcikMotorlar: yeni }).catch(() => {});
            return;
        }
        const yeni = gizliMotorlar.filter(x => x !== id);
        if (!e.target.checked) yeni.push(id);
        ayarYaz({ webGizliMotorlar: yeni }).catch(() => {});
    });

    el('ayWebMotorlar').addEventListener('click', e => {
        const sil = e.target.closest('.webMotorSil');
        if (!sil) return;
        const id = sil.closest('.webMotorAyar').dataset.motor;
        ayarYaz({
            webOzelMotorlar: ozelMotorlar.filter(m => m.id !== id).map(({ id, ad, adres, kisa }) => ({ id, ad, adres, kisa })),
            webGizliMotorlar: gizliMotorlar.filter(x => x !== id),
            ...(varsayilanId === id ? { webMotoru: 'tarayici' } : {})
        }).catch(() => {});
    });

    // SIRALAMA: satirlari surukle-birak. Dis birakma modulu (disbirak.js)
    // bunu dosya birakma sanmasin diye govdeye isaret konuyor.
    const liste = el('ayWebMotorlar');
    let tasinan = null;
    liste.addEventListener('dragstart', e => {
        const li = e.target.closest('.webMotorAyar');
        if (!li || e.target.closest('input, button')) { e.preventDefault(); return; }
        tasinan = li;
        li.classList.add('tasiniyor');
        document.body.classList.add('icSurukleniyor');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', li.dataset.motor);
    });
    liste.addEventListener('dragover', e => {
        if (!tasinan) return;
        e.preventDefault();
        const hedef = e.target.closest('.webMotorAyar');
        if (!hedef || hedef === tasinan) return;
        const r = hedef.getBoundingClientRect();
        if (e.clientY > r.top + r.height / 2) hedef.after(tasinan);
        else hedef.before(tasinan);
    });
    const bitir = () => {
        if (!tasinan) return;
        tasinan.classList.remove('tasiniyor');
        tasinan = null;
        document.body.classList.remove('icSurukleniyor');
        const yeni = [...liste.querySelectorAll('.webMotorAyar')].map(li => li.dataset.motor);
        if (yeni.join() !== tumMotorlar().slice(1).map(m => m.id).join()) {
            ayarYaz({ webMotorSirasi: yeni }).catch(() => {});
        }
    };
    liste.addEventListener('drop', e => { if (tasinan) { e.preventDefault(); e.stopPropagation(); bitir(); } });
    liste.addEventListener('dragend', bitir);

    el('ayWebYeniEkle').addEventListener('click', async () => {
        const ad = el('ayWebYeniAd').value.trim();
        const adres = el('ayWebYeniAdres').value.trim();
        const kisa = el('ayWebYeniKisa').value.trim().toLowerCase();
        const { bildir } = await import('./arayuz.js').catch(() => ({}));
        const uyar = m => (bildir ? bildir(m) : alert(m));

        if (!ad) { uyar(c('webYeniAdGerek')); el('ayWebYeniAd').focus(); return; }
        if (!/^https?:\/\/\S+$/i.test(adres) || !adres.includes('%s')) {
            uyar(c('webYeniAdresGecersiz')); el('ayWebYeniAdres').focus(); return;
        }
        if (kisa && (/\s/.test(kisa) || tumMotorlar().some(m => m.kisa && m.kisa.toLowerCase() === kisa))) {
            uyar(c('webYeniKisaVar')); el('ayWebYeniKisa').focus(); return;
        }
        const yeni = { id: 'ozel_' + Date.now().toString(36), ad, adres, kisa };
        await ayarYaz({
            webOzelMotorlar: [...ozelMotorlar.map(({ id, ad, adres, kisa }) => ({ id, ad, adres, kisa })), yeni]
        }).catch(() => {});
        el('ayWebYeniAd').value = el('ayWebYeniAdres').value = el('ayWebYeniKisa').value = '';
        uyar(c('webYeniEklendi', ad));
    });
}
