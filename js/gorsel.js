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

// WSD Speed Dial - gorsel deposu
//
// Karar: gorseller yer imlerinde DEGIL chrome.storage.local'da.
// Anahtar = normallestirilmis URL. Deger = { gorsel, zemin }.
//
// Boyut disiplini: her gorsel yazilmadan once kucultuluyor. Bu bastan
// uygulanmazsa depo hizla sisiyor ve yeni sekme acilisi yavasliyor.

export const HEDEF_EN   = 440;
export const HEDEF_BOY  = 248;
export const KALITE     = 0.87;
export const SISKIN_ESIK = 70000;

export async function gorselAl(anahtarlar) {
    const liste = Array.isArray(anahtarlar) ? anahtarlar : [anahtarlar];
    try {
        return await chrome.storage.local.get(liste);
    } catch (e) {
        return {};
    }
}

export async function gorselYaz(anahtar, dataUri, zemin) {
    const kucuk = await kucult(dataUri).catch(() => null);
    const mevcut = (await gorselAl(anahtar))[anahtar] || {};
    await chrome.storage.local.set({
        [anahtar]: { ...mevcut, gorsel: kucuk || dataUri, zemin: zemin ?? mevcut.zemin ?? null }
    });
}

/**
 * Kayit bicimi:
 *   { gorsel, adaylar: [dataUri...], secim: index, zemin }
 *
 * `gorsel` her zaman GOSTERILEN gorsel. `adaylar` karuselde gezilenler.
 * Ikisini ayri tutuyoruz cunku kullanici kendi dosyasini secebiliyor -
 * o durumda gorsel adaylar listesinde olmayabilir.
 */
export async function adaylariYaz(anahtar, adaylar, secim = 0) {
    if (!adaylar || !adaylar.length) return;
    const mevcut = (await gorselAl(anahtar))[anahtar] || {};
    await chrome.storage.local.set({
        [anahtar]: {
            ...mevcut,
            adaylar,
            secim,
            gorsel: adaylar[secim] || adaylar[0]
        }
    });
}

export async function secimiDegistir(anahtar, secim) {
    const kayit = (await gorselAl(anahtar))[anahtar];
    if (!kayit || !kayit.adaylar || !kayit.adaylar[secim]) return;
    await chrome.storage.local.set({
        [anahtar]: { ...kayit, secim, gorsel: kayit.adaylar[secim] }
    });
}

export async function zeminYaz(anahtar, zemin) {
    const kayit = (await gorselAl(anahtar))[anahtar] || {};
    await chrome.storage.local.set({ [anahtar]: { ...kayit, zemin } });
}

export async function gorselSil(anahtarlar) {
    const liste = Array.isArray(anahtarlar) ? anahtarlar : [anahtarlar];
    try { await chrome.storage.local.remove(liste); } catch (e) { /* yoktu */ }
}

/**
 * Gorseli kart olcusune indirir ve WebP'ye cevirir.
 *
 * OLCUYE GORE ATLAMA YOK: bir gorsel olcuce kucuk olup bayt olarak agir
 * olabiliyor (400x225 PNG = 400 KB gibi). Amac bayt kazanmak oldugu icin
 * olcut de bayt; kazanc yoksa null donuyor ve orijinal korunuyor.
 */
export function kucult(dataUri) {
    return new Promise(resolve => {
        if (!dataUri || typeof dataUri !== 'string') return resolve(null);
        if (dataUri.startsWith('data:image/svg+xml')) return resolve(null);

        const img = new Image();
        img.onerror = () => resolve(null);
        img.onload = function () {
            try {
                const kEn = this.naturalWidth, kBoy = this.naturalHeight;
                if (!kEn || !kBoy) return resolve(null);

                const olcek  = Math.min(1, HEDEF_EN / kEn, HEDEF_BOY / kBoy);
                const cEn    = Math.max(1, Math.round(kEn * olcek));
                const cBoy   = Math.max(1, Math.round(kBoy * olcek));

                const tuval = document.createElement('canvas');
                tuval.width = cEn;
                tuval.height = cBoy;
                const ctx = tuval.getContext('2d');
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(this, 0, 0, cEn, cBoy);

                const yeni = tuval.toDataURL('image/webp', KALITE);
                resolve(yeni && yeni.length < dataUri.length ? yeni : null);
            } catch (e) {
                resolve(null);
            }
        };
        img.src = dataUri;
    });
}
