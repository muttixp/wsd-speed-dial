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

// WSD Speed Dial - ADLI ETIKETLER (1.5.1)
//
// Renk etiketinden (renk.js, kart basina tek sabit renk) AYRI bir sey:
// kullanici "Yeni etiket" ile ad + renk veriyor, kart birden fazla adli
// etiket tasiyabiliyor. Ayni adla yeniden eklenen etiket yenisini
// acmiyor, var olani kullaniyor (buyuk/kucuk harf onemsiz).
//
// Depo:
//   etiketTanimlari: { [id]: { ad, renk } }
//   kartEtiketleri:  { [url]: [id, ...] }     url = urlNormalle
//
// Kartlarla hic baglantisi kalmayan tanim kendiliginden siliniyor:
// listede "0 kart" diye duran etiket gurultu.

const TANIM = 'etiketTanimlari';
const KART = 'kartEtiketleri';

let tanimOnbellek = null;
let kartOnbellek = null;

export async function etiketTanimlariAl() {
    if (tanimOnbellek) return tanimOnbellek;
    try { tanimOnbellek = (await chrome.storage.local.get(TANIM))[TANIM] || {}; }
    catch (e) { tanimOnbellek = {}; }
    return tanimOnbellek;
}

export async function kartEtiketleriAl() {
    if (kartOnbellek) return kartOnbellek;
    try { kartOnbellek = (await chrome.storage.local.get(KART))[KART] || {}; }
    catch (e) { kartOnbellek = {}; }
    return kartOnbellek;
}

const karsilastir = m => (m || '').trim().toLocaleLowerCase('tr').replace(/\s+/g, ' ');

/** Adla var olan tanimi bulur. */
export async function etiketBul(ad) {
    const t = await etiketTanimlariAl();
    const aranan = karsilastir(ad);
    const id = Object.keys(t).find(i => karsilastir(t[i].ad) === aranan);
    return id ? { id, ...t[id] } : null;
}

/** Adla bulur ya da olusturur; var olanin rengi verilen renge guncellenir. */
export async function etiketHazirla(ad, renk) {
    ad = (ad || '').trim().slice(0, 30);
    if (!ad) return null;
    const t = await etiketTanimlariAl();
    const var_ = await etiketBul(ad);
    const id = var_ ? var_.id : 'e' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    t[id] = { ad: var_ ? var_.ad : ad, renk: renk || (var_ && var_.renk) || '#3a86e8' };
    tanimOnbellek = t;
    await chrome.storage.local.set({ [TANIM]: t });
    return { id, ...t[id] };
}

/** Kartin etiket listesini yazar ve bosta kalan tanimlari temizler. */
export async function kartEtiketleriniYaz(url, idler) {
    const k = await kartEtiketleriAl();
    const temiz = [...new Set((idler || []).filter(Boolean))];
    if (temiz.length) k[url] = temiz;
    else delete k[url];
    kartOnbellek = k;
    await chrome.storage.local.set({ [KART]: k });
    await bostakileriTemizle();
}

/** Kart adresi degisince etiketler yeni adrese gecsin. */
export async function etiketleriTasi(eskiUrl, yeniUrl) {
    if (!eskiUrl || eskiUrl === yeniUrl) return;
    const k = await kartEtiketleriAl();
    if (!k[eskiUrl]) return;
    k[yeniUrl] = [...new Set([...(k[yeniUrl] || []), ...k[eskiUrl]])];
    delete k[eskiUrl];
    kartOnbellek = k;
    await chrome.storage.local.set({ [KART]: k });
}

/** Etiketi TUM kartlardan kaldirip tanimini siler. */
export async function etiketSil(id) {
    const k = await kartEtiketleriAl();
    for (const url of Object.keys(k)) {
        k[url] = k[url].filter(x => x !== id);
        if (!k[url].length) delete k[url];
    }
    const t = await etiketTanimlariAl();
    delete t[id];
    kartOnbellek = k; tanimOnbellek = t;
    await chrome.storage.local.set({ [KART]: k, [TANIM]: t });
}

async function bostakileriTemizle() {
    const k = await kartEtiketleriAl();
    const t = await etiketTanimlariAl();
    const kullanilan = new Set(Object.values(k).flat());
    let degisti = false;
    for (const id of Object.keys(t)) {
        if (!kullanilan.has(id)) { delete t[id]; degisti = true; }
    }
    if (degisti) {
        tanimOnbellek = t;
        await chrome.storage.local.set({ [TANIM]: t });
    }
}

/**
 * Kartin gorsel kutusunun sol altina adli etiketlerin renkli noktalari.
 * Ipucunda adlar. Etiket yoksa null.
 */
export function etiketNoktalari(idler, tanimlar) {
    const liste = (idler || []).map(id => tanimlar[id]).filter(Boolean);
    if (!liste.length) return null;
    const kap = document.createElement('span');
    kap.className = 'kartEtiketNoktalari';
    kap.title = liste.map(e => e.ad).join(', ');
    for (const e of liste.slice(0, 6)) {
        const n = document.createElement('span');
        n.style.backgroundColor = e.renk;
        kap.appendChild(n);
    }
    return kap;
}

/**
 * COP KUTUSU ICIN (1.5.1): kartin etiketleri id degil { ad, renk } olarak.
 * Kart copteyken etiket silinmis ya da temizlik calismis olabilir; geri
 * alirken adla yeniden kuruluyor.
 */
export async function etiketleriPaketle(url) {
    const k = await kartEtiketleriAl();
    const t = await etiketTanimlariAl();
    const liste = (k[url] || []).map(id => t[id]).filter(Boolean).map(e => ({ ad: e.ad, renk: e.renk }));
    return liste.length ? liste : null;
}

export async function etiketleriGeriYaz(url, liste) {
    if (!Array.isArray(liste) || !liste.length) return;
    const idler = [];
    for (const e of liste) {
        const h = await etiketHazirla(e.ad, e.renk);
        if (h) idler.push(h.id);
    }
    const k = await kartEtiketleriAl();
    await kartEtiketleriniYaz(url, [...(k[url] || []), ...idler]);
}

chrome.storage.onChanged.addListener((d, alan) => {
    if (alan !== 'local') return;
    if (d[TANIM]) tanimOnbellek = null;
    if (d[KART]) kartOnbellek = null;
});
