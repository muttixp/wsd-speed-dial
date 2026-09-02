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

// WSD Speed Dial - grup ikon deposu
// { [grupId]: 'folder' | 'emoji:X' | 'favicon:https://...' }

const ANAHTAR = 'grupIkonlari';
const GORUNUM_ANAHTARI = 'grupGorunumleri';   // { [grupId]: {gosterim, renk} }
let onbellek = null;

export async function ikonlariAl() {
    if (onbellek) return onbellek;
    try {
        const d = await chrome.storage.local.get(ANAHTAR);
        onbellek = d[ANAHTAR] || {};
    } catch (e) {
        onbellek = {};
    }
    return onbellek;
}

export async function ikonYaz(grupId, deger) {
    const hepsi = await ikonlariAl();
    if (deger) hepsi[grupId] = deger;
    else delete hepsi[grupId];
    onbellek = hepsi;
    await chrome.storage.local.set({ [ANAHTAR]: hepsi });
}

chrome.storage.onChanged.addListener((d, alan) => {
    if (alan === 'local' && d[ANAHTAR]) {
        onbellek = d[ANAHTAR].newValue || null;
    }
});

/**
 * Gruba OZEL gorunum: { gosterim, renk, aciklama }
 * Bos deger = genel ayari kullan.
 */
let gorunumOnbellek = null;

export async function gorunumleriAl() {
    if (gorunumOnbellek) return gorunumOnbellek;
    try {
        const d = await chrome.storage.local.get(GORUNUM_ANAHTARI);
        gorunumOnbellek = d[GORUNUM_ANAHTARI] || {};
    } catch (e) {
        gorunumOnbellek = {};
    }
    return gorunumOnbellek;
}

export async function gorunumYaz(grupId, gorunum) {
    const hepsi = await gorunumleriAl();
    const temiz = {};
    if (gorunum && gorunum.gosterim) temiz.gosterim = gorunum.gosterim;
    if (gorunum && gorunum.renk)     temiz.renk = gorunum.renk;
    if (gorunum && gorunum.aciklama) temiz.aciklama = gorunum.aciklama;

    if (Object.keys(temiz).length) hepsi[grupId] = temiz;
    else delete hepsi[grupId];        // hepsi varsayilansa kayit tutma

    gorunumOnbellek = hepsi;
    await chrome.storage.local.set({ [GORUNUM_ANAHTARI]: hepsi });
}

chrome.storage.onChanged.addListener((d, alan) => {
    if (alan === 'local' && d[GORUNUM_ANAHTARI]) {
        gorunumOnbellek = d[GORUNUM_ANAHTARI].newValue || null;
    }
});
