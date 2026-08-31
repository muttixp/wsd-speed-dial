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

// WSD Speed Dial - tutarlilik denetimi
//
// "Kart var ama gorunmuyor" gibi sorunlari tek seferde ortaya cikarir.
// Elle konsol komutu yazmak yerine Bakim bolumunden calistiriliyor.

import { gruplariAl, kartlariAl, urlNormalle } from './yerimi.js';
import { c } from './dil.js';

export async function denetle() {
    const rapor = {
        grup: 0, kart: 0,
        gorselsiz: [],      // yakalanmamis
        kopya: [],          // ayni adres birden cok kartta
        bosGrup: [],
        cizilmeyen: [],     // yer iminde var, ekranda yok
        ekranAtlandi: false,
        hata: null
    };

    try {
        const gruplar = await gruplariAl();
        rapor.grup = gruplar.length;

        const gorulen = new Map();          // url -> {baslik, gruplar[]}
        const anahtarlar = [];
        const kartHaritasi = new Map();     // grupId -> kartlar

        for (const g of gruplar) {
            const kartlar = await kartlariAl(g.id);
            kartHaritasi.set(g.id, kartlar);
            rapor.kart += kartlar.length;
            if (!kartlar.length) rapor.bosGrup.push(g.baslik);

            for (const k of kartlar) {
                const a = urlNormalle(k.url);
                anahtarlar.push(a);
                if (gorulen.has(a)) gorulen.get(a).gruplar.push(g.baslik);
                else gorulen.set(a, { baslik: k.baslik, gruplar: [g.baslik] });
            }
        }

        for (const [url, bilgi] of gorulen) {
            if (bilgi.gruplar.length > 1) {
                rapor.kopya.push({ url, baslik: bilgi.baslik, gruplar: bilgi.gruplar });
            }
        }

        // Gorseli olmayanlar - tek okumada
        const depo = await chrome.storage.local.get(anahtarlar);
        for (const g of gruplar) {
            for (const k of kartHaritasi.get(g.id)) {
                const a = urlNormalle(k.url);
                if (!depo[a] || !depo[a].gorsel) {
                    rapor.gorselsiz.push({ baslik: k.baslik, grup: g.baslik });
                }
            }
        }

        // EKRANDA olan kartlar.
        //
        // YALNIZCA normal izgara gorunumunde anlamli: arama, cop kutusu
        // ve yinelenen kartlar ekranlarinda izgarada baska kartlar var,
        // denetim bunlari "cizilmemis" sanip YANLIS ALARM veriyordu.
        const ozelEkran = ['aramaAcik', 'copAcik', 'kopyaAcik']
            .some(x => document.body.classList.contains(x));
        rapor.ekranAtlandi = ozelEkran;

        if (!ozelEkran) {
            const { aktifGrup } = await import('./cizim.js');
            const acik = gruplar.find(g => g.id === aktifGrup());
            if (acik) {
                const dom = new Set([...document.querySelectorAll('#kartKabi .kart:not(.ekleKart)')]
                    .map(a => a.dataset.kartId));
                for (const k of kartHaritasi.get(acik.id)) {
                    if (!dom.has(k.id)) {
                        rapor.cizilmeyen.push({ baslik: k.baslik, grup: acik.baslik });
                    }
                }
            }
        }
    } catch (e) {
        rapor.hata = String(e && e.message || e);
    }

    return rapor;
}

/**
 * Raporu HTML'e cevirir.
 *
 * Duz metin okunmuyordu: sorun, bilgi ve oneri ayni tonda alt alta
 * diziliyordu. Simdi her bulgu kendi kutusunda ve ONEM SIRASINA gore:
 * once sorunlar, sonra uyarilar, en sonda bilgiler.
 */
export function raporHTML(r) {
    if (r.hata) return kutu('sorun', c('denetimYapilamadi'), kacis(r.hata));

    let h = kutu('ozet', `${r.grup} grup · ${r.kart} kart`, '');
    let sorunVar = false;

    if (r.cizilmeyen.length) {
        sorunVar = true;
        h += kutu('sorun', c('nKartCizilmemis', r.cizilmeyen.length),
            liste(r.cizilmeyen.slice(0, 6).map(k => k.baslik), r.cizilmeyen.length - 6) +
            `<em>${c('sayfayiYenileyipDeneyin')}</em>`);
    }

    if (r.gorselsiz.length) {
        sorunVar = true;
        h += kutu('uyari', c('nKartinGorseliYok', r.gorselsiz.length),
            liste(r.gorselsiz.slice(0, 6).map(k => `${k.grup} › ${k.baslik}`),
                  r.gorselsiz.length - 6) +
            `<em>${c('grupMenusundenYenilenebilir')}</em>`);
    }

    if (r.kopya.length) {
        h += kutu('bilgi', `${r.kopya.length} adres birden fazla grupta`,
            `<em>${c('buKartlarPaylasir')}</em>` +
            '<button type="button" class="dnDugme" data-git="yinelenenler">' +
            c('yinelenenKartlariAc') + '</button>');
    }

    if (r.bosGrup.length) {
        h += kutu('bilgi', c('nBosGrup', r.bosGrup.length), liste(r.bosGrup));
    }

    if (r.ekranAtlandi) {
        h += kutu('bilgi', c('cizimKontroluAtlandi'),
            `<em>${c('ozelEkranAcikNormaleDonun')}</em>`);
    }

    if (!sorunVar) h += kutu('iyi', c('sorunBulunamadi'), '');
    return h;
}

function kutu(tur, baslik, govde) {
    const sinif = { sorun: 'dnSorun', uyari: 'dnUyari', bilgi: 'dnBilgi',
                    iyi: 'dnIyi', ozet: 'dnOzet' }[tur] || 'dnBilgi';
    return `<div class="dnKutu ${sinif}">` +
           `<div class="dnBaslik">${kacis(baslik)}</div>` +
           (govde ? `<div class="dnGovde">${govde}</div>` : '') +
           '</div>';
}

function liste(ogeler, kalan = 0) {
    let h = '<ul>' + ogeler.map(o => `<li>${kacis(o)}</li>`).join('');
    if (kalan > 0) h += `<li class="dnDaha">ve ${kalan} tane daha</li>`;
    return h + '</ul>';
}

function kacis(m) {
    return String(m ?? '').replace(/[&<>"]/g, c =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}
