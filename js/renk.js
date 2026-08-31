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

// WSD Speed Dial - kart renk etiketleri
//
// Renkler ayri bir depo anahtarinda: { [normalUrl]: '#rrggbb' }
// Yer imine yazilamiyor (yer imi sadece baslik + url tutuyor).

export const RENKLER = [
    { ad: 'yok',     deger: null },
    { ad: 'kirmizi', deger: '#e05c5c' },
    { ad: 'turuncu', deger: '#e8883a' },
    { ad: 'sari',    deger: '#e8c53a' },
    { ad: 'yesil',   deger: '#5cb85c' },
    { ad: 'mavi',    deger: '#3a86e8' },
    { ad: 'mor',     deger: '#9b59d0' },
    { ad: 'gri',     deger: '#6b7280' },
];

const ANAHTAR = 'kartRenkleri';
let onbellek = null;

export async function renkleriAl() {
    if (onbellek) return onbellek;
    try {
        const d = await chrome.storage.local.get(ANAHTAR);
        onbellek = d[ANAHTAR] || {};
    } catch (e) {
        onbellek = {};
    }
    return onbellek;
}

export async function renkYaz(url, renk) {
    const hepsi = await renkleriAl();
    if (renk) hepsi[url] = renk;
    else delete hepsi[url];          // "yok" secilince kayit tutmuyoruz
    onbellek = hepsi;
    await chrome.storage.local.set({ [ANAHTAR]: hepsi });
}

export async function renkSil(url) {
    await renkYaz(url, null);
}

chrome.storage.onChanged.addListener((degisenler, alan) => {
    if (alan === 'local' && degisenler[ANAHTAR]) onbellek = null;
});
