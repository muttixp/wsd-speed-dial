/**
 * TEMA (1.5.5)
 *
 * Mod: Koyu / Acik / Sistem (isletim sisteminin koyu-acik ayarina uyar).
 * Sablon: renk ayarlarinin HAZIR TAKIMI - tek tikla zemin, kart, grup
 * menusu, baslik renklerini birlikte ayarlar. Ayarlarin kendisi yerinde
 * kaliyor; sablondan sonra istenen renk tek tek degistirilebilir (o zaman
 * sablon adinin yaninda "degistirildi" cikar).
 *
 * Her modun renkleri AYRI saklaniyor: koyudan aciga gecip donunce koyuda
 * elle yaptigin degisiklikler geri geliyor.
 */
import { c } from './dil.js';
import { ayarlariAl, ayarYaz } from './ayar.js';

const el = id => document.getElementById(id);

/** Sablonun degistirdigi ayarlar (baska hicbir ayara dokunulmuyor) */
export const TEMA_ANAHTARLARI = [
    'zeminRengi', 'metinRengi', 'kartZeminRengi', 'kartCerceveRengi', 'kartCerceveHoverRengi',
    'grupIkonRengi', 'grupZeminRengi', 'grupZeminOpaklik', 'grupAktifRengi', 'grupAktifOpaklik',
    'grupYaziRengi', 'grupAktifYaziRengi', 'baslikRengi', 'baslikGolge', 'baslikGolgeRengi',
    'duvarVarsayilan',
];

const koyu = (o) => ({
    grupZeminRengi: '#ffffff', grupZeminOpaklik: 6, grupAktifOpaklik: 100,
    grupYaziRengi: '', grupAktifYaziRengi: '', baslikRengi: '', baslikGolge: true, ...o,
});
const acik = (o) => ({
    // Acik zemin hap: hem acik zeminde hem koyu duvar kagidinda okunur
    grupZeminRengi: '#ffffff', grupZeminOpaklik: 82, grupAktifOpaklik: 100,
    grupYaziRengi: '', grupAktifYaziRengi: '', baslikRengi: '', baslikGolge: false,
    baslikGolgeRengi: '#ffffff', ...o,
});

export const SABLONLAR = {
    koyu: [
        { id: 'gece', r: koyu({ zeminRengi: '#14161a', metinRengi: '#e8eaed', kartZeminRengi: '#22262e',
            kartCerceveRengi: '#6a6a6a', kartCerceveHoverRengi: '#576a80', grupIkonRengi: '#9db4cc',
            grupAktifRengi: '#576a80', baslikGolgeRengi: '#4d4c4c',
            duvarVarsayilan: 'linear-gradient(135deg, #4aa3df, #2f6fd0)' }) },
        { id: 'grafit', r: koyu({ zeminRengi: '#111214', metinRengi: '#e6e6e6', kartZeminRengi: '#1d1e21',
            kartCerceveRengi: '#3a3b3f', kartCerceveHoverRengi: '#8a8d93', grupIkonRengi: '#b8bcc4',
            grupZeminOpaklik: 7, grupAktifRengi: '#4a4d55', baslikGolgeRengi: '#000000',
            duvarVarsayilan: 'linear-gradient(135deg, #2b2d33, #121316)' }) },
        { id: 'okyanus', r: koyu({ zeminRengi: '#0d1b26', metinRengi: '#e3f1fb', kartZeminRengi: '#12283a',
            kartCerceveRengi: '#24455f', kartCerceveHoverRengi: '#3fa7d6', grupIkonRengi: '#8fd0f2',
            grupZeminOpaklik: 8, grupAktifRengi: '#1f6f9f', baslikGolgeRengi: '#06121b',
            duvarVarsayilan: 'linear-gradient(135deg, #0f4c75, #0b2233)' }) },
        { id: 'orman', r: koyu({ zeminRengi: '#0f1a14', metinRengi: '#e4f1e8', kartZeminRengi: '#17271e',
            kartCerceveRengi: '#2d4a38', kartCerceveHoverRengi: '#5fb37c', grupIkonRengi: '#9fd3b0',
            grupZeminOpaklik: 7, grupAktifRengi: '#2f7a4d', baslikGolgeRengi: '#07110b',
            duvarVarsayilan: 'linear-gradient(135deg, #2f6b4a, #0e2418)' }) },
        { id: 'mor', r: koyu({ zeminRengi: '#16121f', metinRengi: '#ece6f7', kartZeminRengi: '#221b31',
            kartCerceveRengi: '#3d3157', kartCerceveHoverRengi: '#9a7cf0', grupIkonRengi: '#c3b2f2',
            grupZeminOpaklik: 7, grupAktifRengi: '#6a4fc4', baslikGolgeRengi: '#0b0812',
            duvarVarsayilan: 'linear-gradient(135deg, #5b3fa8, #1d1433)' }) },
        { id: 'gunbatimi', r: koyu({ zeminRengi: '#1a1214', metinRengi: '#f6e9e4', kartZeminRengi: '#2a1c1f',
            kartCerceveRengi: '#4b3036', kartCerceveHoverRengi: '#f08a5d', grupIkonRengi: '#f5b9a0',
            grupZeminOpaklik: 7, grupAktifRengi: '#c0563a', baslikGolgeRengi: '#0f0809',
            duvarVarsayilan: 'linear-gradient(135deg, #c0563a, #3a1a2a)' }) },
        // Grafit'in tersi: siyah zemin, aktif grup BEYAZ, yazisi siyah
        { id: 'kontrast', r: koyu({ zeminRengi: '#000000', metinRengi: '#ffffff', kartZeminRengi: '#0e0e0e',
            kartCerceveRengi: '#2c2c2c', kartCerceveHoverRengi: '#ffffff', grupIkonRengi: '#d6d6d6',
            grupZeminOpaklik: 8, grupAktifRengi: '#ffffff', grupAktifYaziRengi: '#000000',
            baslikGolgeRengi: '#000000',
            duvarVarsayilan: 'linear-gradient(135deg, #1c1c1c, #000000)' }) },
    ],
    acik: [
        { id: 'kagit', r: acik({ zeminRengi: '#f4f5f7', metinRengi: '#1f2329', kartZeminRengi: '#ffffff',
            kartCerceveRengi: '#d5d9e0', kartCerceveHoverRengi: '#4d7ea8', grupIkonRengi: '#4d6a86',
            grupAktifRengi: '#4d7ea8',
            duvarVarsayilan: 'linear-gradient(135deg, #f7f9fc, #dfe6ef)' }) },
        { id: 'kum', r: acik({ zeminRengi: '#f6f1e7', metinRengi: '#2d261c', kartZeminRengi: '#fffaf0',
            kartCerceveRengi: '#e2d6bf', kartCerceveHoverRengi: '#b8864b', grupIkonRengi: '#8a6a3e',
            grupAktifRengi: '#b8864b',
            duvarVarsayilan: 'linear-gradient(135deg, #fbf5ea, #eadcc2)' }) },
        { id: 'buz', r: acik({ zeminRengi: '#eef6fb', metinRengi: '#14324a', kartZeminRengi: '#ffffff',
            kartCerceveRengi: '#cfe3f0', kartCerceveHoverRengi: '#2f8fcf', grupIkonRengi: '#2f6f9f',
            grupAktifRengi: '#2f8fcf',
            duvarVarsayilan: 'linear-gradient(135deg, #f2f9fe, #cfe7f7)' }) },
        { id: 'nane', r: acik({ zeminRengi: '#eef8f3', metinRengi: '#173a2b', kartZeminRengi: '#ffffff',
            kartCerceveRengi: '#cde8da', kartCerceveHoverRengi: '#2f9d6a', grupIkonRengi: '#2f7d58',
            grupAktifRengi: '#2f9d6a',
            duvarVarsayilan: 'linear-gradient(135deg, #f3fbf7, #cdeedd)' }) },
        { id: 'pastel', r: acik({ zeminRengi: '#f6f2fb', metinRengi: '#2e2340', kartZeminRengi: '#ffffff',
            kartCerceveRengi: '#e1d7f0', kartCerceveHoverRengi: '#8b6cd6', grupIkonRengi: '#6f58b0',
            grupAktifRengi: '#8b6cd6',
            duvarVarsayilan: 'linear-gradient(135deg, #fbf3f7, #e4dcf7)' }) },
        // Acik modda tersi: beyaz zemin, aktif grup SIYAH, yazisi beyaz
        { id: 'murekkep', r: acik({ zeminRengi: '#ffffff', metinRengi: '#111111', kartZeminRengi: '#ffffff',
            kartCerceveRengi: '#d9d9d9', kartCerceveHoverRengi: '#111111', grupIkonRengi: '#3a3a3a',
            grupAktifRengi: '#111111', grupAktifYaziRengi: '#ffffff',
            duvarVarsayilan: 'linear-gradient(135deg, #ffffff, #e6e6e6)' }) },
    ],
};

const VARSAYILAN_SABLON = { koyu: 'gece', acik: 'kagit' };
/** Kullanicinin kaydettigi temalar: ayarlar.temaOzel [{id, ad, mod, r}] */
let ozelTemalar = [];
const OZEL_SINIR = 24;
/** Bir modun tum sablonlari: hazirlar + kullanicinin kaydettikleri */
const sablonlar = mod => [...SABLONLAR[mod], ...ozelTemalar.filter(t => t.mod === mod)];
const sablonBul = (mod, id) => sablonlar(mod).find(s => s.id === id);
const sablonAdi = s => s.ad || c('tema_' + s.id);
function ozelleriOku(ayar) {
    ozelTemalar = (Array.isArray(ayar.temaOzel) ? ayar.temaOzel : [])
        .filter(t => t && t.id && t.r && (t.mod === 'koyu' || t.mod === 'acik'))
        .map(t => ({ ...t, ozel: true }));
}

const sistemKoyu = () => {
    try { return matchMedia('(prefers-color-scheme: dark)').matches; } catch (e) { return true; }
};

/** Gecerli mod: 'koyu' | 'acik' */
export function etkinMod(ayar) {
    const m = ayar?.temaModu || 'koyu';
    if (m === 'sistem') return sistemKoyu() ? 'koyu' : 'acik';
    return m === 'acik' ? 'acik' : 'koyu';
}

/** html sinifini ayarlar; erken.js bir sonraki acilista beyaz/koyu parlamasin diye */
export function moduSinifla(ayar) {
    const mod = etkinMod(ayar);
    document.documentElement.classList.toggle('acikMod', mod === 'acik');
    try { localStorage.setItem('wsdTemaModu', ayar?.temaModu || 'koyu'); } catch (e) { /* */ }
}

const renkleriAl = ayar => Object.fromEntries(TEMA_ANAHTARLARI.map(k => [k, ayar[k]]));

const esitMi = (a, b) => String(a ?? '').toLowerCase() === String(b ?? '').toLowerCase();

/** Kullanici sablondan sonra renk degistirdi mi */
function degistirildiMi(ayar, sablon) {
    if (!sablon) return true;
    return TEMA_ANAHTARLARI.some(k => !esitMi(ayar[k], sablon.r[k]));
}

function tazeleIste() {
    document.dispatchEvent(new CustomEvent('wsd-ayar-tazele'));
}

/**
 * Etkin mod degistiyse (dugme, ya da "Sistem"de isletim sistemi) renk
 * takimini degistir: cikilan modun renkleri saklanir, girilen modun
 * saklanmis renkleri (yoksa varsayilan sablonu) yuklenir.
 */
export async function moduEsitle() {
    const ayar = await ayarlariAl();
    ozelleriOku(ayar);
    const mod = etkinMod(ayar);
    const onceki = ayar.temaSonMod || 'koyu';
    moduSinifla(ayar);
    if (onceki === mod) return false;

    const saklanan = ayar.temaRenkleri || {};
    saklanan[onceki] = { tema: ayar.tema || VARSAYILAN_SABLON[onceki], renkler: renkleriAl(ayar) };
    const hedef = saklanan[mod];
    const sablon = sablonBul(mod, hedef?.tema) || sablonBul(mod, VARSAYILAN_SABLON[mod]);
    await ayarYaz({
        ...(hedef?.renkler || sablon.r),
        tema: hedef?.tema || sablon.id,
        temaSonMod: mod,
        temaRenkleri: saklanan,
    });
    tazeleIste();
    return true;
}

async function sablonUygula(id) {
    const ayar = await ayarlariAl();
    ozelleriOku(ayar);
    const mod = etkinMod(ayar);
    const sablon = sablonBul(mod, id);
    if (!sablon) return;
    const geri = { ...renkleriAl(ayar), tema: ayar.tema };
    await ayarYaz({ ...sablon.r, tema: id, temaSonMod: mod });
    tazeleIste();
    const { bildir } = await import('./arayuz.js');
    bildir(c('temaUygulandi', sablonAdi(sablon)), {
        etiket: c('geriAl'),
        calistir: async () => { await ayarYaz(geri); tazeleIste(); },
    });
}

/* ---------- Ayar paneli ---------- */

function onizleme(r) {
    // Dort kare: zemin (duvar) | kart | aktif grup | metin
    return `<span class="temaOnizleme">`
        + `<i style="background:${r.duvarVarsayilan}"></i>`
        + `<i style="background:${r.kartZeminRengi}"></i>`
        + `<i style="background:${r.grupAktifRengi}"></i>`
        + `<i style="background:${r.metinRengi}"></i></span>`;
}

export async function temaPaneliniCiz() {
    const liste = el('ayTemaListe');
    if (!liste) return;
    const ayar = await ayarlariAl();
    const mod = etkinMod(ayar);

    for (const b of document.querySelectorAll('#ayTemaModu .segBtn')) {
        b.classList.toggle('secili', b.dataset.deger === (ayar.temaModu || 'koyu'));
    }

    ozelleriOku(ayar);
    liste.textContent = '';
    for (const s of sablonlar(mod)) {
        const secili = s.id === (ayar.tema || VARSAYILAN_SABLON[mod]);
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'temaKart' + (secili ? ' secili' : '');
        b.dataset.tema = s.id;
        b.innerHTML = onizleme(s.r) + '<span class="temaAd"></span>'
            + (secili && degistirildiMi(ayar, s) ? `<span class="temaDegisti">${c('temaDegistirildi')}</span>` : '');
        b.querySelector('.temaAd').textContent = sablonAdi(s);
        if (secili && degistirildiMi(ayar, s)) b.title = c('temaDegistirildiIpucu');
        if (s.ozel) {
            b.classList.add('ozel');
            const sil = document.createElement('span');
            sil.className = 'temaSil';
            sil.setAttribute('role', 'button');
            sil.title = c('sil');
            sil.textContent = '✕';
            b.appendChild(sil);
        }
        liste.appendChild(b);
    }

    // Son kutu: su anki renkleri yeni tema olarak kaydet
    const k = document.createElement('button');
    k.type = 'button';
    k.className = 'temaKart temaKaydet';
    k.title = c('temaKaydetIpucu');
    k.innerHTML = '<span class="temaKaydetSimge" aria-hidden="true">+</span><span class="temaAd"></span>';
    k.querySelector('.temaAd').textContent = c('temaKaydet');
    liste.appendChild(k);
}

/** Su anki renkleri adiyla kaydeder; ayni modda ayni ad varsa ustune yazar */
async function temaKaydet() {
    const ayar = await ayarlariAl();
    ozelleriOku(ayar);
    const mod = etkinMod(ayar);
    const simdiki = ozelTemalar.find(t => t.id === ayar.tema);
    const { metinSor } = await import('./onay.js');
    const sayi = ozelTemalar.filter(t => t.mod === mod).length + 1;
    const ad = (await metinSor({
        baslik: c('temaKaydet'),
        metin: c('temaKaydetMetin'),
        deger: simdiki?.ad || c('temaOzelAd', String(sayi)),
        evet: c('kaydet'),
    }))?.trim?.();
    if (!ad) return;

    const liste = ozelTemalar.map(({ ozel, ...t }) => t);
    const ayni = liste.find(t => t.mod === mod && t.ad.toLowerCase() === ad.toLowerCase());
    const kayit = { id: ayni?.id || 'ozel_' + Date.now().toString(36), ad: ad.slice(0, 30), mod, r: renkleriAl(ayar) };
    if (ayni) Object.assign(ayni, kayit);
    else {
        if (liste.length >= OZEL_SINIR) {
            const { bildir } = await import('./arayuz.js');
            bildir(c('temaSinir', String(OZEL_SINIR)));
            return;
        }
        liste.push(kayit);
    }
    await ayarYaz({ temaOzel: liste, tema: kayit.id });
    const { bildir } = await import('./arayuz.js');
    bildir(c('temaKaydedildi', kayit.ad));
}

async function temaSil(id) {
    const ayar = await ayarlariAl();
    const eski = Array.isArray(ayar.temaOzel) ? ayar.temaOzel : [];
    const t = eski.find(x => x.id === id);
    if (!t) return;
    await ayarYaz({ temaOzel: eski.filter(x => x.id !== id), ...(ayar.tema === id ? { tema: '' } : {}) });
    const { bildir } = await import('./arayuz.js');
    bildir(c('temaSilindi', t.ad), {
        etiket: c('geriAl'),
        calistir: async () => {
            const a = await ayarlariAl();
            await ayarYaz({ temaOzel: [...(a.temaOzel || []), t], ...(ayar.tema === id ? { tema: id } : {}) });
        },
    });
}

export async function temayiKur() {
    await moduEsitle().catch(() => {});

    // "Sistem" modunda isletim sistemi degisince
    try {
        matchMedia('(prefers-color-scheme: dark)').addEventListener('change', async () => {
            const a = await ayarlariAl();
            if ((a.temaModu || 'koyu') === 'sistem') { await moduEsitle(); temaPaneliniCiz(); }
        });
    } catch (e) { /* */ }

    if (!el('ayTemaListe')) return;
    temaPaneliniCiz();

    el('ayTemaModu').addEventListener('click', async e => {
        const b = e.target.closest('.segBtn');
        if (!b) return;
        await ayarYaz({ temaModu: b.dataset.deger });
        await moduEsitle();
        temaPaneliniCiz();
    });

    el('ayTemaListe').addEventListener('click', async e => {
        if (e.target.closest('.temaSil')) {
            e.stopPropagation();
            await temaSil(e.target.closest('.temaKart').dataset.tema);
            temaPaneliniCiz();
            return;
        }
        const b = e.target.closest('.temaKart');
        if (!b) return;
        if (b.classList.contains('temaKaydet')) await temaKaydet();
        else await sablonUygula(b.dataset.tema);
        temaPaneliniCiz();
    });

    // Renk elle degisince "degistirildi" rozeti guncellensin
    chrome.storage.onChanged.addListener((d, alan) => {
        if (alan === 'local' && d.ayarlar) {
            clearTimeout(temayiKur.z);
            temayiKur.z = setTimeout(temaPaneliniCiz, 150);
        }
    });
}
