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

// WSD Speed Dial - kart notlari
// Ayri depo anahtari: { [normalUrl]: 'metin' }

const ANAHTAR = 'kartNotlari';
let onbellek = null;

export async function notlariAl() {
    if (onbellek) return onbellek;
    try {
        const d = await chrome.storage.local.get(ANAHTAR);
        onbellek = d[ANAHTAR] || {};
    } catch (e) {
        onbellek = {};
    }
    return onbellek;
}

export async function notYaz(url, metin) {
    const hepsi = await notlariAl();
    if (metin && metin.trim()) hepsi[url] = metin.trim();
    else delete hepsi[url];             // bos not kayit tutmuyor
    onbellek = hepsi;
    await chrome.storage.local.set({ [ANAHTAR]: hepsi });
}

export async function notAl(url) {
    return (await notlariAl())[url] || '';
}

chrome.storage.onChanged.addListener((d, alan) => {
    if (alan === 'local' && d[ANAHTAR]) onbellek = null;
});
