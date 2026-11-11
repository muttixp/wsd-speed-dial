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

// WSD Speed Dial - ANA SAYFA GORUNUMU (1.7.0, Gelismis mod)
//
// Gelismis modda Ana Sayfa kendi duzeniyle (Klasik / Sade / Galeri)
// gorunebilir; gruplar genel ayarlarda kalir. Ayarlar degismiyor: Ana
// Sayfa aciktayken gorunumuUygula'ya "etkin ayar" veriliyor (genel ayar +
// duzen + boyut). Ana Sayfa'da klasor penceresi, "+" menusu ve klasor
// satiri Basit moddaki gibi calisir (body.anaDuzenli).

import { HAZIR_DUZENLER, HAZIR_BOYUTLAR } from './basitmod.js';

let anaSayfada = false;

/** grubuAc cagirir: Ana Sayfa'nin kendisi mi acik (klasor icinde degil) */
export function anaSayfadaYaz(deger) {
    const degisti = anaSayfada !== !!deger;
    anaSayfada = !!deger;
    return degisti;
}

/** Ana Sayfa duzeni su an gecerli mi */
export function anaDuzenGecerli(ayar) {
    return anaSayfada && ayar && ayar.basitMod !== true && !!HAZIR_DUZENLER[ayar.anaDuzen];
}

/** Gorunume verilecek ayar: Ana Sayfa duzeni gecerliyse ustune yazilmis kopya */
export function etkinAyar(ayar) {
    if (!anaDuzenGecerli(ayar)) return ayar;
    const d = { ...ayar, ...HAZIR_DUZENLER[ayar.anaDuzen], baslikKonum: 'alt' };
    const b = HAZIR_BOYUTLAR[ayar.anaBoyut];
    if (b) Object.assign(d, { kartEn: b.kartEn, kartOrani: b.kartOrani, gorselYerlesim: b.gorselYerlesim });
    // Kucuk simgede uzerine gelince cikan arac seridi kalabalik ediyor
    if (d.kartEn <= 100) d.kartAraclariGoster = false;
    return d;
}

/** Basit mod ya da Ana Sayfa duzeni: klasor penceresi, "+" menusu, 3x3 mozaik */
export function basitGibi() {
    const b = document.body.classList;
    return b.contains('basitMod') || b.contains('anaDuzenli');
}
