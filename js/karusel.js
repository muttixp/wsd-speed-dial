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

// WSD Speed Dial - duzenle penceresindeki gorsel karuseli
//
// Adaylar: yakalamadan gelen ekran goruntusu + sayfa gorselleri.
// Kullanici kendi dosyasini/URL'sini de ekleyebiliyor; o da listeye giriyor.

import { gorselAl } from './gorsel.js';

let adaylar = [];
let secim = 0;
let zemin = null;

const el = id => document.getElementById(id);

export function karuseliKur() {
    el('kpOnceki')?.addEventListener('click', () => kaydir(-1));
    el('kpSonraki')?.addEventListener('click', () => kaydir(1));

    // Ok tuslariyla da gezinilsin
    el('kpOnizleme')?.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft')  kaydir(-1);
        if (e.key === 'ArrowRight') kaydir(1);
    });
}

/** Pencere acilirken cagriliyor. */
export async function karuseliYukle(anahtar) {
    adaylar = [];
    secim = 0;
    zemin = null;

    if (anahtar) {
        const kayit = (await gorselAl(anahtar))[anahtar];
        if (kayit) {
            zemin = kayit.zemin || null;
            if (Array.isArray(kayit.adaylar) && kayit.adaylar.length) {
                adaylar = [...kayit.adaylar];
                secim = Math.min(kayit.secim || 0, adaylar.length - 1);
            } else if (kayit.gorsel) {
                adaylar = [kayit.gorsel];       // eski kayit - tek gorsel
            }
        }
    }
    ciz();
}

/** Disaridan gorsel ekler (dosya secimi / URL) ve ona gecer. */
export function adayEkle(dataUri) {
    if (!dataUri) return;
    const mevcut = adaylar.indexOf(dataUri);
    if (mevcut >= 0) {
        secim = mevcut;
    } else {
        adaylar.push(dataUri);
        secim = adaylar.length - 1;
    }
    ciz();
}

export function zeminAyarla(renk) {
    zemin = renk;
    ciz();
}

export function secimDurumu() {
    return { adaylar, secim, zemin, gorsel: adaylar[secim] || null };
}

function kaydir(yon) {
    if (adaylar.length < 2) return;
    // Dairesel: sondan ilkine, ilkten sona
    secim = (secim + yon + adaylar.length) % adaylar.length;
    ciz();
}

function ciz() {
    const onizleme = el('kpOnizleme');
    const noktalar = el('kpNoktalar');
    if (!onizleme || !noktalar) return;

    const su = adaylar[secim];
    onizleme.style.backgroundImage = su ? `url('${su}')` : 'none';
    onizleme.style.backgroundColor = zemin || '#ffffff';

    // Oklar tek aday varken anlamsiz
    const tek = adaylar.length < 2;
    el('kpOnceki').disabled = tek;
    el('kpSonraki').disabled = tek;

    noktalar.textContent = '';
    if (tek) return;
    adaylar.forEach((_, i) => {
        const n = document.createElement('button');
        n.type = 'button';
        n.className = 'karuselNokta' + (i === secim ? ' secili' : '');
        n.addEventListener('click', () => { secim = i; ciz(); });
        noktalar.appendChild(n);
    });
}
