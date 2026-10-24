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
            grupAktifRengi: '#6f8fb8', baslikGolgeRengi: '#4d4c4c',
            duvarVarsayilan: 'radial-gradient(ellipse 60% 55% at 16% 18%, rgba(70,140,230,.38), transparent 70%), radial-gradient(ellipse 55% 60% at 88% 84%, rgba(120,80,220,.30), transparent 70%), radial-gradient(ellipse 38% 34% at 82% 10%, rgba(40,170,190,.20), transparent 70%), repeating-linear-gradient(135deg, rgba(255,255,255,.025) 0 1px, transparent 1px 14px), linear-gradient(135deg, #1a3a6e, #0d1730)' }) },
        { id: 'grafit', r: koyu({ zeminRengi: '#111214', metinRengi: '#e6e6e6', kartZeminRengi: '#1d1e21',
            kartCerceveRengi: '#3a3b3f', kartCerceveHoverRengi: '#8a8d93', grupIkonRengi: '#b8bcc4',
            grupZeminOpaklik: 7, grupAktifRengi: '#6e737e', baslikGolgeRengi: '#000000',
            duvarVarsayilan: 'radial-gradient(ellipse 60% 55% at 16% 18%, rgba(255,255,255,.09), transparent 70%), radial-gradient(ellipse 55% 60% at 88% 84%, rgba(130,140,160,.14), transparent 70%), radial-gradient(ellipse 38% 34% at 82% 10%, rgba(255,255,255,.05), transparent 70%), repeating-linear-gradient(135deg, rgba(255,255,255,.025) 0 1px, transparent 1px 14px), linear-gradient(135deg, #2b2d33, #121316)' }) },
        { id: 'okyanus', r: koyu({ zeminRengi: '#0d1b26', metinRengi: '#e3f1fb', kartZeminRengi: '#12283a',
            kartCerceveRengi: '#24455f', kartCerceveHoverRengi: '#3fa7d6', grupIkonRengi: '#8fd0f2',
            grupZeminOpaklik: 8, grupAktifRengi: '#2b8fca', baslikGolgeRengi: '#06121b',
            duvarVarsayilan: 'radial-gradient(ellipse 60% 55% at 16% 18%, rgba(63,167,214,.45), transparent 70%), radial-gradient(ellipse 55% 60% at 88% 84%, rgba(20,140,170,.35), transparent 70%), radial-gradient(ellipse 38% 34% at 82% 10%, rgba(140,220,240,.22), transparent 70%), repeating-linear-gradient(135deg, rgba(255,255,255,.03) 0 1px, transparent 1px 14px), linear-gradient(135deg, #0f4c75, #0b2233)' }) },
        { id: 'orman', r: koyu({ zeminRengi: '#0f1a14', metinRengi: '#e4f1e8', kartZeminRengi: '#17271e',
            kartCerceveRengi: '#2d4a38', kartCerceveHoverRengi: '#5fb37c', grupIkonRengi: '#9fd3b0',
            grupZeminOpaklik: 7, grupAktifRengi: '#3b9a62', baslikGolgeRengi: '#07110b',
            duvarVarsayilan: 'radial-gradient(ellipse 60% 55% at 16% 18%, rgba(95,179,124,.42), transparent 70%), radial-gradient(ellipse 55% 60% at 88% 84%, rgba(40,110,80,.40), transparent 70%), radial-gradient(ellipse 38% 34% at 82% 10%, rgba(210,225,130,.18), transparent 70%), repeating-linear-gradient(135deg, rgba(255,255,255,.03) 0 1px, transparent 1px 14px), linear-gradient(135deg, #2f6b4a, #0e2418)' }) },
        { id: 'mor', r: koyu({ zeminRengi: '#16121f', metinRengi: '#ece6f7', kartZeminRengi: '#221b31',
            kartCerceveRengi: '#3d3157', kartCerceveHoverRengi: '#9a7cf0', grupIkonRengi: '#c3b2f2',
            grupZeminOpaklik: 7, grupAktifRengi: '#6a4fc4', baslikGolgeRengi: '#0b0812',
            duvarVarsayilan: 'radial-gradient(ellipse 60% 55% at 16% 18%, rgba(154,124,240,.48), transparent 70%), radial-gradient(ellipse 55% 60% at 88% 84%, rgba(240,100,180,.26), transparent 70%), radial-gradient(ellipse 38% 34% at 82% 10%, rgba(110,170,255,.22), transparent 70%), repeating-linear-gradient(135deg, rgba(255,255,255,.03) 0 1px, transparent 1px 14px), linear-gradient(135deg, #5b3fa8, #1d1433)' }) },
        { id: 'gunbatimi', r: koyu({ zeminRengi: '#1a1214', metinRengi: '#f6e9e4', kartZeminRengi: '#2a1c1f',
            kartCerceveRengi: '#4b3036', kartCerceveHoverRengi: '#f08a5d', grupIkonRengi: '#f5b9a0',
            grupZeminOpaklik: 7, grupAktifRengi: '#e06a45', baslikGolgeRengi: '#0f0809',
            duvarVarsayilan: 'radial-gradient(ellipse 60% 55% at 16% 18%, rgba(255,175,95,.48), transparent 70%), radial-gradient(ellipse 55% 60% at 88% 84%, rgba(200,60,120,.36), transparent 70%), radial-gradient(ellipse 38% 34% at 82% 10%, rgba(255,220,150,.25), transparent 70%), repeating-linear-gradient(135deg, rgba(255,255,255,.03) 0 1px, transparent 1px 14px), linear-gradient(135deg, #c0563a, #3a1a2a)' }) },
        // Grafit'in tersi: siyah zemin, aktif grup BEYAZ, yazisi siyah
        { id: 'kontrast', r: koyu({ zeminRengi: '#000000', metinRengi: '#ffffff', kartZeminRengi: '#0e0e0e',
            kartCerceveRengi: '#2c2c2c', kartCerceveHoverRengi: '#ffffff', grupIkonRengi: '#d6d6d6',
            grupZeminOpaklik: 8, grupAktifRengi: '#ffffff', grupAktifYaziRengi: '#000000',
            baslikGolgeRengi: '#000000',
            duvarVarsayilan: 'radial-gradient(ellipse 60% 55% at 16% 18%, rgba(255,255,255,.07), transparent 70%), radial-gradient(ellipse 55% 60% at 88% 84%, rgba(255,255,255,.05), transparent 70%), radial-gradient(ellipse 38% 34% at 82% 10%, rgba(255,255,255,.04), transparent 70%), repeating-linear-gradient(135deg, rgba(255,255,255,.025) 0 1px, transparent 1px 14px), linear-gradient(135deg, #1c1c1c, #000000)' }) },
        // Kirmizi (1.5.6): yakut vurgu, koyu bordo zemin
        { id: 'yakut', r: koyu({ zeminRengi: '#190d10', metinRengi: '#f6e6e8', kartZeminRengi: '#2a1519',
            kartCerceveRengi: '#4d262d', kartCerceveHoverRengi: '#e5484d', grupIkonRengi: '#f2a1a6',
            grupZeminOpaklik: 7, grupAktifRengi: '#d0353c', baslikGolgeRengi: '#0d0507',
            duvarVarsayilan: 'radial-gradient(ellipse 60% 55% at 16% 18%, rgba(230,60,70,.40), transparent 70%), radial-gradient(ellipse 55% 60% at 88% 84%, rgba(150,30,70,.36), transparent 70%), radial-gradient(ellipse 38% 34% at 82% 10%, rgba(255,140,120,.16), transparent 70%), repeating-linear-gradient(135deg, rgba(255,255,255,.025) 0 1px, transparent 1px 14px), linear-gradient(135deg, #7a1820, #1c080c)' }) },
        // Sari (1.5.6): kehribar vurgu, aktif grup sari - yazisi koyu
        { id: 'kehribar', r: koyu({ zeminRengi: '#17140a', metinRengi: '#f5eedb', kartZeminRengi: '#262111',
            kartCerceveRengi: '#4a4020', kartCerceveHoverRengi: '#f2c230', grupIkonRengi: '#f0cf6a',
            grupZeminOpaklik: 7, grupAktifRengi: '#f2c230', grupAktifYaziRengi: '#1d1704', baslikGolgeRengi: '#0b0904',
            duvarVarsayilan: 'radial-gradient(ellipse 60% 55% at 16% 18%, rgba(255,190,50,.30), transparent 70%), radial-gradient(ellipse 55% 60% at 88% 84%, rgba(225,120,30,.24), transparent 70%), radial-gradient(ellipse 38% 34% at 82% 10%, rgba(255,230,140,.13), transparent 70%), repeating-linear-gradient(135deg, rgba(255,255,255,.025) 0 1px, transparent 1px 14px), linear-gradient(135deg, #5a4410, #15110a)' }) },
    ],
    acik: [
        { id: 'kagit', r: acik({ zeminRengi: '#f4f5f7', metinRengi: '#1f2329', kartZeminRengi: '#ffffff',
            kartCerceveRengi: '#d5d9e0', kartCerceveHoverRengi: '#4d7ea8', grupIkonRengi: '#4d6a86',
            grupAktifRengi: '#4a79a1',
            duvarVarsayilan: 'radial-gradient(ellipse 60% 55% at 16% 18%, rgba(130,170,230,.28), transparent 70%), radial-gradient(ellipse 55% 60% at 88% 84%, rgba(190,170,240,.22), transparent 70%), radial-gradient(ellipse 38% 34% at 82% 10%, rgba(120,210,220,.18), transparent 70%), repeating-linear-gradient(135deg, rgba(0,0,0,.022) 0 1px, transparent 1px 14px), linear-gradient(135deg, #f7f9fc, #dfe6ef)' }) },
        { id: 'kum', r: acik({ zeminRengi: '#f6f1e7', metinRengi: '#2d261c', kartZeminRengi: '#fffaf0',
            kartCerceveRengi: '#e2d6bf', kartCerceveHoverRengi: '#b8864b', grupIkonRengi: '#8a6a3e',
            grupAktifRengi: '#956c3b',
            duvarVarsayilan: 'radial-gradient(ellipse 60% 55% at 16% 18%, rgba(240,190,120,.30), transparent 70%), radial-gradient(ellipse 55% 60% at 88% 84%, rgba(200,150,100,.22), transparent 70%), radial-gradient(ellipse 38% 34% at 82% 10%, rgba(255,220,170,.28), transparent 70%), repeating-linear-gradient(135deg, rgba(0,0,0,.022) 0 1px, transparent 1px 14px), linear-gradient(135deg, #fbf5ea, #eadcc2)' }) },
        { id: 'buz', r: acik({ zeminRengi: '#eef6fb', metinRengi: '#14324a', kartZeminRengi: '#ffffff',
            kartCerceveRengi: '#cfe3f0', kartCerceveHoverRengi: '#2f8fcf', grupIkonRengi: '#2f6f9f',
            grupAktifRengi: '#2879b0',
            duvarVarsayilan: 'radial-gradient(ellipse 60% 55% at 16% 18%, rgba(120,190,240,.30), transparent 70%), radial-gradient(ellipse 55% 60% at 88% 84%, rgba(150,170,240,.22), transparent 70%), radial-gradient(ellipse 38% 34% at 82% 10%, rgba(170,235,245,.30), transparent 70%), repeating-linear-gradient(135deg, rgba(0,0,0,.02) 0 1px, transparent 1px 14px), linear-gradient(135deg, #f2f9fe, #cfe7f7)' }) },
        { id: 'nane', r: acik({ zeminRengi: '#eef8f3', metinRengi: '#173a2b', kartZeminRengi: '#ffffff',
            kartCerceveRengi: '#cde8da', kartCerceveHoverRengi: '#2f9d6a', grupIkonRengi: '#2f7d58',
            grupAktifRengi: '#278359',
            duvarVarsayilan: 'radial-gradient(ellipse 60% 55% at 16% 18%, rgba(110,200,150,.28), transparent 70%), radial-gradient(ellipse 55% 60% at 88% 84%, rgba(90,180,190,.20), transparent 70%), radial-gradient(ellipse 38% 34% at 82% 10%, rgba(200,240,170,.28), transparent 70%), repeating-linear-gradient(135deg, rgba(0,0,0,.02) 0 1px, transparent 1px 14px), linear-gradient(135deg, #f3fbf7, #cdeedd)' }) },
        { id: 'pastel', r: acik({ zeminRengi: '#f6f2fb', metinRengi: '#2e2340', kartZeminRengi: '#ffffff',
            kartCerceveRengi: '#e1d7f0', kartCerceveHoverRengi: '#8b6cd6', grupIkonRengi: '#6f58b0',
            grupAktifRengi: '#8260d3',
            duvarVarsayilan: 'radial-gradient(ellipse 60% 55% at 16% 18%, rgba(240,160,200,.28), transparent 70%), radial-gradient(ellipse 55% 60% at 88% 84%, rgba(160,140,240,.26), transparent 70%), radial-gradient(ellipse 38% 34% at 82% 10%, rgba(255,210,170,.24), transparent 70%), repeating-linear-gradient(135deg, rgba(0,0,0,.02) 0 1px, transparent 1px 14px), linear-gradient(135deg, #fbf3f7, #e4dcf7)' }) },
        // Kirmizi (1.5.6): acik pembe-beyaz zemin, aktif grup kirmizi
        { id: 'gul', r: acik({ zeminRengi: '#fcf1f2', metinRengi: '#3a1418', kartZeminRengi: '#ffffff',
            kartCerceveRengi: '#f0d2d5', kartCerceveHoverRengi: '#d0353c', grupIkonRengi: '#b0262d',
            grupAktifRengi: '#d0353c',
            duvarVarsayilan: 'radial-gradient(ellipse 60% 55% at 16% 18%, rgba(240,110,120,.26), transparent 70%), radial-gradient(ellipse 55% 60% at 88% 84%, rgba(220,90,140,.20), transparent 70%), radial-gradient(ellipse 38% 34% at 82% 10%, rgba(255,190,170,.28), transparent 70%), repeating-linear-gradient(135deg, rgba(0,0,0,.02) 0 1px, transparent 1px 14px), linear-gradient(135deg, #fff6f6, #f3d3d7)' }) },
        // Sari (1.5.6): limon zemin, aktif grup sari - yazisi koyu
        { id: 'gunes', r: acik({ zeminRengi: '#fdf8e4', metinRengi: '#2e2708', kartZeminRengi: '#fffdf3',
            kartCerceveRengi: '#ece0a6', kartCerceveHoverRengi: '#d9a300', grupIkonRengi: '#8a6a00',
            grupAktifRengi: '#f2c230', grupAktifYaziRengi: '#2a2104',
            duvarVarsayilan: 'radial-gradient(ellipse 60% 55% at 16% 18%, rgba(255,215,70,.38), transparent 70%), radial-gradient(ellipse 55% 60% at 88% 84%, rgba(250,170,60,.24), transparent 70%), radial-gradient(ellipse 38% 34% at 82% 10%, rgba(255,240,160,.34), transparent 70%), repeating-linear-gradient(135deg, rgba(0,0,0,.022) 0 1px, transparent 1px 14px), linear-gradient(135deg, #fffbe8, #f6e3a0)' }) },
        // Acik modda tersi: beyaz zemin, aktif grup SIYAH, yazisi beyaz
        { id: 'murekkep', r: acik({ zeminRengi: '#ffffff', metinRengi: '#111111', kartZeminRengi: '#ffffff',
            kartCerceveRengi: '#d9d9d9', kartCerceveHoverRengi: '#111111', grupIkonRengi: '#3a3a3a',
            grupAktifRengi: '#111111', grupAktifYaziRengi: '#ffffff',
            duvarVarsayilan: 'radial-gradient(ellipse 60% 55% at 16% 18%, rgba(0,0,0,.05), transparent 70%), radial-gradient(ellipse 55% 60% at 88% 84%, rgba(0,0,0,.06), transparent 70%), radial-gradient(ellipse 38% 34% at 82% 10%, rgba(0,0,0,.03), transparent 70%), repeating-linear-gradient(135deg, rgba(0,0,0,.025) 0 1px, transparent 1px 14px), linear-gradient(135deg, #ffffff, #e6e6e6)' }) },
    ],
};

const VARSAYILAN_SABLON = { koyu: 'gece', acik: 'kagit' };

/* ESLER (1.6.0): modu degistirince secili hazir temanin diger moddaki
   karsiligi gelsin (Orman -> Nane, Okyanus -> Buz...). Eskiden diger
   modda en son secilen (yoksa ilk) tema geliyordu. */
const ESLER = {
    gece: 'kagit', grafit: 'kagit', okyanus: 'buz', orman: 'nane', mor: 'pastel',
    gunbatimi: 'kum', kontrast: 'murekkep', yakut: 'gul', kehribar: 'gunes',
    kagit: 'gece', kum: 'gunbatimi', buz: 'okyanus', nane: 'orman', pastel: 'mor',
    gul: 'yakut', gunes: 'kehribar', murekkep: 'kontrast',
};

/* DESENLI DUVARLAR (1.5.6): sablon duvarlari duz iki renkli gecisti;
   artik isik lekeleri + ince capraz cizgi dokusu. Eski degeri tasiyan
   kullanicilar "degistirildi" rozeti gormesin diye eski -> yeni goc. */
const ESKI_DUVARLAR = {"radial-gradient(ellipse 60% 55% at 16% 18%, rgba(120,195,255,.55), transparent 70%), radial-gradient(ellipse 55% 60% at 88% 84%, rgba(150,100,255,.42), transparent 70%), radial-gradient(ellipse 38% 34% at 82% 10%, rgba(60,220,230,.30), transparent 70%), repeating-linear-gradient(135deg, rgba(255,255,255,.035) 0 1px, transparent 1px 14px), linear-gradient(135deg, #2c7fd6, #1b3d8c)": "gece", "linear-gradient(135deg, #4aa3df, #2f6fd0)": "gece", "linear-gradient(135deg, #2b2d33, #121316)": "grafit", "linear-gradient(135deg, #0f4c75, #0b2233)": "okyanus", "linear-gradient(135deg, #2f6b4a, #0e2418)": "orman", "linear-gradient(135deg, #5b3fa8, #1d1433)": "mor", "linear-gradient(135deg, #c0563a, #3a1a2a)": "gunbatimi", "linear-gradient(135deg, #1c1c1c, #000000)": "kontrast", "linear-gradient(135deg, #f7f9fc, #dfe6ef)": "kagit", "linear-gradient(135deg, #fbf5ea, #eadcc2)": "kum", "linear-gradient(135deg, #f2f9fe, #cfe7f7)": "buz", "linear-gradient(135deg, #f3fbf7, #cdeedd)": "nane", "linear-gradient(135deg, #fbf3f7, #e4dcf7)": "pastel", "linear-gradient(135deg, #ffffff, #e6e6e6)": "murekkep"};
function duvarGoc(r) {
    const id = r && ESKI_DUVARLAR[r.duvarVarsayilan];
    if (!id) return null;
    const s = [...SABLONLAR.koyu, ...SABLONLAR.acik].find(x => x.id === id);
    return s ? s.r.duvarVarsayilan : null;
}
/* OKUNURLUK (1.5.6): acik sablonlarda aktif grup rengi beyaz yaziyla
   4.5:1'in altindaydi; biraz koyulasti. Sablonu degistirmemis kullanici
   "degistirildi" rozeti gormesin diye eski -> yeni. */
const ESKI_AKTIF = { kagit: '#4d7ea8', kum: '#b8864b', buz: '#2f8fcf', nane: '#2f9d6a', pastel: '#8b6cd6',
    // 1.5.9: koyu temalarda aktif grup zeminle karisiyordu - daha parlak tonlar
    gece: '#576a80', grafit: '#4a4d55', okyanus: '#1f6f9f', orman: '#2f7a4d', gunbatimi: '#c0563a' };
function aktifGoc(r, temaId) {
    const eski = ESKI_AKTIF[temaId];
    if (!r || !eski || String(r.grupAktifRengi).toLowerCase() !== eski) return null;
    return [...SABLONLAR.koyu, ...SABLONLAR.acik].find(x => x.id === temaId)?.r.grupAktifRengi || null;
}
async function eskiDuvarlariTasi() {
    const a = await ayarlariAl();
    const yaz = {};
    const yeni = duvarGoc(a);
    if (yeni) yaz.duvarVarsayilan = yeni;
    const aktif = aktifGoc(a, a.tema);
    if (aktif) yaz.grupAktifRengi = aktif;
    if (a.temaRenkleri && typeof a.temaRenkleri === 'object') {
        let degisti = false;
        const tr = JSON.parse(JSON.stringify(a.temaRenkleri));
        for (const m of Object.values(tr)) {
            const r = m && (m.renkler || m.r || m);
            const y = duvarGoc(r);
            if (y) { r.duvarVarsayilan = y; degisti = true; }
            const ak = aktifGoc(r, m && m.tema);
            if (ak) { r.grupAktifRengi = ak; degisti = true; }
        }
        if (degisti) yaz.temaRenkleri = tr;
    }
    if (Object.keys(yaz).length) { await ayarYaz(yaz); tazeleIste(); }
}

/**
 * ICE AKTARILAN RENKLER (1.5.6): yedekteki renkler hicbir temaya uymuyorsa
 * secili temanin ustune "degistirildi" olarak binmesin (Guncelle'ye basan
 * kendi temasini ezerdi) - "Ice aktarilan" adiyla YENI ozel tema olur.
 * Uyan tema varsa (once yedekte secili olan) o secilir. `birlesik`
 * yazilacak ayarlar; yerinde degistirilip donduruluyor.
 */
export function iceAktarilanTemayiAyarla(birlesik, gelen) {
    if (!gelen || !TEMA_ANAHTARLARI.some(k => k in gelen)) return birlesik;
    const yeniDuvar = duvarGoc(birlesik);
    if (yeniDuvar) birlesik.duvarVarsayilan = yeniDuvar;
    const mod = etkinMod(birlesik);
    const ozel = Array.isArray(birlesik.temaOzel) ? birlesik.temaOzel : [];
    const r = renkleriAl(birlesik);
    const uyar = s => s && s.r && !TEMA_ANAHTARLARI.some(k => !esitMi(r[k], s.r[k]));
    const adaylar = [...SABLONLAR[mod], ...ozel.filter(t => t.mod === mod)];
    const uyan = adaylar.find(s => s.id === gelen.tema && uyar(s)) || adaylar.find(uyar);
    if (uyan) { birlesik.tema = uyan.id; return birlesik; }

    const taban = c('temaIceAktarilan');
    let ad = taban, n = 2;
    while (ozel.some(t => (t.ad || '').toLowerCase() === ad.toLowerCase())) ad = `${taban} ${n++}`;
    const id = 'ozel_' + Date.now().toString(36);
    birlesik.temaOzel = [...ozel, { id, ad, mod, r }];
    birlesik.tema = id;
    const f = filtreleriAl(birlesik);
    if (!notrMu(f)) birlesik.temaFiltreleri = { ...(birlesik.temaFiltreleri || {}), [id]: f };
    return birlesik;
}

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

/* TEMAYA OZEL ZEMIN RENKLENDIRME (1.5.6): filtre her tema icin ayri
   hatirlaniyor (ayarlar.temaFiltreleri[temaId]). Tema degisince cikilanin
   filtresi saklanir, girilenin saklisi (yoksa notr) yuklenir. */
const FILTRE_NOTR = {
    filtreYontemi: 'ton', colorize: false, ton: 0, doygunluk: 0, aciklik: 0,
    golgeRengi: '#1b2430', isikRengi: '#7fd4e8', siddet: 100,
};
const filtreleriAl = ayar => Object.fromEntries(Object.keys(FILTRE_NOTR).map(k => [k, ayar[k] ?? FILTRE_NOTR[k]]));
const notrMu = f => Object.keys(FILTRE_NOTR).every(k => esitMi(f[k], FILTRE_NOTR[k]));
/** cikilanId'nin filtresini saklar, girilenId'ninkini dondurur (yazilacak ayarlar) */
function filtreGecisi(ayar, cikilanId, girilenId) {
    const tf = { ...(ayar.temaFiltreleri || {}) };
    if (cikilanId) {
        const f = filtreleriAl(ayar);
        if (notrMu(f)) delete tf[cikilanId]; else tf[cikilanId] = f;
    }
    return { ...FILTRE_NOTR, ...(tf[girilenId] || {}), temaFiltreleri: tf };
}

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
    // Hazir temanin esi varsa o; o modda ayni tema daha once secilip
    // renkleri degistirildiyse saklanan renkler korunur. Kendi kaydedilen
    // temalarin esi yok: diger modda en son secilen gelir.
    const es = sablonBul(mod, ESLER[ayar.tema]);
    const sablon = es || sablonBul(mod, hedef?.tema) || sablonBul(mod, VARSAYILAN_SABLON[mod]);
    const saklananRenk = hedef?.tema === sablon.id ? hedef.renkler : null;
    await ayarYaz({
        ...(saklananRenk || sablon.r),
        ...filtreGecisi(ayar, ayar.tema || VARSAYILAN_SABLON[onceki], sablon.id),
        tema: sablon.id,
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
    const geri = { ...renkleriAl(ayar), ...filtreleriAl(ayar), temaFiltreleri: ayar.temaFiltreleri || {}, tema: ayar.tema };
    await ayarYaz({ ...sablon.r, ...filtreGecisi(ayar, ayar.tema || VARSAYILAN_SABLON[mod], id), tema: id, temaSonMod: mod });
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
        const degisti = secili && degistirildiMi(ayar, s);
        // Ozel temada "degistirildi" yerine GUNCELLE: degisiklik tek tikla
        // o temaya yaziliyor (1.5.6). Hazir sablonlar degismez.
        b.innerHTML = onizleme(s.r) + '<span class="temaAd"></span>'
            + (degisti && s.ozel
                ? `<span class="temaDegisti temaGuncelle" role="button" title="${c('temaGuncelleIpucu')}">${c('temaGuncelle')}</span>`
                : degisti ? `<span class="temaDegisti">${c('temaDegistirildi')}</span>` : '');
        b.querySelector('.temaAd').textContent = sablonAdi(s);
        if (degisti && !s.ozel) b.title = c('temaDegistirildiIpucu');
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
    // Su anki filtre yeni temayla birlikte saklaniyor
    const tf = { ...(ayar.temaFiltreleri || {}) };
    const f = filtreleriAl(ayar);
    if (notrMu(f)) delete tf[kayit.id]; else tf[kayit.id] = f;
    await ayarYaz({ temaOzel: liste, tema: kayit.id, temaFiltreleri: tf });
    const { bildir } = await import('./arayuz.js');
    bildir(c('temaKaydedildi', kayit.ad));
}

/** Secili ozel temaya su anki renkleri (ve filtreyi) yazar */
async function temaGuncelle(id) {
    const ayar = await ayarlariAl();
    const liste = (Array.isArray(ayar.temaOzel) ? ayar.temaOzel : []).map(t => ({ ...t }));
    const t = liste.find(x => x.id === id);
    if (!t) return;
    t.r = renkleriAl(ayar);
    const tf = { ...(ayar.temaFiltreleri || {}) };
    const f = filtreleriAl(ayar);
    if (notrMu(f)) delete tf[id]; else tf[id] = f;
    await ayarYaz({ temaOzel: liste, temaFiltreleri: tf });
    const { bildir } = await import('./arayuz.js');
    bildir(c('temaKaydedildi', t.ad));
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
    await eskiDuvarlariTasi().catch(() => {});
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
        if (e.target.closest('.temaGuncelle')) {
            e.stopPropagation();
            await temaGuncelle(e.target.closest('.temaKart').dataset.tema);
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
