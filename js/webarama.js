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
 * yazarken hicbir yere istek gitmiyor (oneri listesi yok).
 */
import { c } from './dil.js';
import { ayarlariAl, ayarYaz } from './ayar.js';

const el = id => document.getElementById(id);

function wikiDili() {
    try { return (chrome.i18n.getUILanguage() || 'en').slice(0, 2).toLowerCase(); }
    catch (e) { return 'en'; }
}

// kisa: kisayol oneki ("g kelime"). renk: harf rozeti.
const MOTORLAR = [
    { id: 'tarayici',   ad: null,          kisa: '',   renk: '' },
    { id: 'google',     ad: 'Google',      kisa: 'g',  renk: '#4285f4', adres: 'https://www.google.com/search?q=%s' },
    { id: 'bing',       ad: 'Bing',        kisa: 'b',  renk: '#00809d', adres: 'https://www.bing.com/search?q=%s' },
    { id: 'duckduckgo', ad: 'DuckDuckGo',  kisa: 'd',  renk: '#de5833', adres: 'https://duckduckgo.com/?q=%s' },
    { id: 'yandex',     ad: 'Yandex',      kisa: 'y',  renk: '#fc3f1d', adres: 'https://yandex.com.tr/search/?text=%s' },
    { id: 'brave',      ad: 'Brave Search', kisa: 'br', renk: '#fb542b', adres: 'https://search.brave.com/search?q=%s' },
    { id: 'ecosia',     ad: 'Ecosia',      kisa: 'e',  renk: '#36acb8', adres: 'https://www.ecosia.org/search?q=%s' },
    { id: 'startpage',  ad: 'Startpage',   kisa: 's',  renk: '#6573ff', adres: 'https://www.startpage.com/do/search?query=%s' },
    { id: 'wikipedia',  ad: 'Wikipedia',   kisa: 'w',  renk: '#636466', adres: () => `https://${wikiDili()}.wikipedia.org/w/index.php?search=%s` },
    { id: 'youtube',    ad: 'YouTube',     kisa: 'yt', renk: '#ff0000', adres: 'https://www.youtube.com/results?search_query=%s' },
    { id: 'github',     ad: 'GitHub',      kisa: 'gh', renk: '#6e5494', adres: 'https://github.com/search?q=%s' },

    // BOLGESEL (bolge): yalnizca o bolgedeki kullanicida listelenir.
    // kapali: ilk kurulumda listede KAPALI gelir, kullanici acar.
    { id: 'sahibinden',  ad: 'Sahibinden',  kisa: 'sh', renk: '#d4a900', bolge: 'tr', kapali: true, adres: 'https://www.sahibinden.com/arama?query_text=%s' },
    { id: 'trendyol',    ad: 'Trendyol',    kisa: 'ty', renk: '#f27a1a', bolge: 'tr', kapali: true, adres: 'https://www.trendyol.com/sr?q=%s' },
    { id: 'hepsiburada', ad: 'Hepsiburada', kisa: 'hb', renk: '#ff6000', bolge: 'tr', kapali: true, adres: 'https://www.hepsiburada.com/ara?q=%s' },
    { id: 'webtecity',   ad: 'WEBTE City',  kisa: 'wc', renk: '#1e6fd0', bolge: 'tr', kapali: true, adres: 'https://webtecity.com/index.php?option=com_webtebusiness&view=businesses&q=%s' },
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
    if (dil.startsWith('tr') || tz === 'Europe/Istanbul') BOLGELER.add('tr');
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
    for (const m of gorunenMotorlar()) {
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

async function ara(yeniSekme) {
    const alan = el('webAramaAlan');
    let metin = alan.value.trim();
    if (!metin) return;

    let motor = motorBul(anlikId || varsayilanId);

    // Kisayol: "yt kedi" -> YouTube'da "kedi"
    const bosluk = metin.indexOf(' ');
    if (bosluk > 0) {
        const on = metin.slice(0, bosluk).toLowerCase();
        const kisa = gorunenMotorlar().find(m => m.kisa && m.kisa.toLowerCase() === on);
        const kalan = metin.slice(bosluk + 1).trim();
        if (kisa && kalan) { motor = kisa; metin = kalan; }
    }

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
    el('webAramaAlan').addEventListener('keydown', e => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey)) {
            e.preventDefault();
            ara(true);
        } else if (e.key === 'Escape') {
            if (!el('webMotorListe').hidden) listeAc(false);
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
