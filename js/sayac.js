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

import { c } from './dil.js';
// WSD Speed Dial - kart tiklama sayaci
// { [normalUrl]: { adet, son } }  son = ISO tarih

const ANAHTAR = 'kartSayaclari';
let onbellek = null;

export async function sayaclariAl() {
    if (onbellek) return onbellek;
    try {
        const d = await chrome.storage.local.get(ANAHTAR);
        onbellek = d[ANAHTAR] || {};
    } catch (e) {
        onbellek = {};
    }
    return onbellek;
}

export async function sayacArtir(url) {
    const hepsi = await sayaclariAl();
    const mevcut = hepsi[url] || { adet: 0, son: null };
    hepsi[url] = { adet: mevcut.adet + 1, son: new Date().toISOString() };
    onbellek = hepsi;
    await chrome.storage.local.set({ [ANAHTAR]: hepsi });
}

export async function sayacAl(url) {
    return (await sayaclariAl())[url] || { adet: 0, son: null };
}

export async function sayacSifirla(url) {
    const hepsi = await sayaclariAl();
    delete hepsi[url];
    onbellek = hepsi;
    await chrome.storage.local.set({ [ANAHTAR]: hepsi });
}

/** "3 gün önce" gibi okunur tarih. */
export function tarihMetni(iso) {
    if (!iso) return '';
    const fark = Date.now() - new Date(iso).getTime();
    const dk = Math.floor(fark / 60000);
    if (dk < 1)  return c('azOnce');
    if (dk < 60) return c('nDakikaOnce', dk);
    const sa = Math.floor(dk / 60);
    if (sa < 24) return c('nSaatOnce', sa);
    const gun = Math.floor(sa / 24);
    if (gun === 1) return c('dun');
    if (gun < 30) return c('nGunOnce', gun);
    const ay = Math.floor(gun / 30);
    if (ay < 12) return c('nAyOnce', ay);
    return c('nYilOnce', Math.floor(ay / 12));
}

chrome.storage.onChanged.addListener((d, alan) => {
    if (alan === 'local' && d[ANAHTAR]) onbellek = d[ANAHTAR].newValue || null;
});
