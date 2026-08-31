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

// WSD Speed Dial - grup seridinde surukleyerek siralama
//
// Kok grup ("Ana Sayfa") tasinamaz ve yerine birakilamaz: o klasorun
// kendisi, siralamada yeri sabit.

import { sirayiUygula, kokKlasoruAl } from './yerimi.js';

let tasinan = null;
let kokId = null;

export async function grupSuruklemeKur(bitince) {
    kokId = await kokKlasoruAl();
    const serit = document.getElementById('grupSeridi');
    if (!serit) return;

    serit.addEventListener('dragstart', e => {
        const sekme = e.target.closest('.grupSekme');
        if (!sekme || sekme.dataset.grupId === kokId) return e.preventDefault();
        tasinan = sekme;
        sekme.classList.add('tasiniyor');
        e.dataTransfer.effectAllowed = 'move';
        // Bazi tarayicilar veri olmadan suruklemeyi baslatmiyor
        e.dataTransfer.setData('text/plain', sekme.dataset.grupId);
    });

    serit.addEventListener('dragend', async () => {
        if (!tasinan) return;
        tasinan.classList.remove('tasiniyor');
        isaretiTemizle();
        tasinan = null;
        await sirayiKaydet(bitince);
    });

    serit.addEventListener('dragover', e => {
        if (!tasinan) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        const hedef = e.target.closest('.grupSekme');
        if (!hedef || hedef === tasinan) return;
        if (hedef.dataset.grupId === kokId) return;   // kokun soluna gecilemez

        // Imlec sekmenin sag yarisindaysa sagina, solundaysa soluna
        const k = hedef.getBoundingClientRect();
        const sagda = e.clientX > k.left + k.width / 2;

        isaretiTemizle();
        hedef.classList.add(sagda ? 'birakSag' : 'birakSol');

        hedef.parentNode.insertBefore(tasinan, sagda ? hedef.nextSibling : hedef);
    });

    serit.addEventListener('drop', e => e.preventDefault());
}

function isaretiTemizle() {
    for (const s of document.querySelectorAll('.grupSekme')) {
        s.classList.remove('birakSol', 'birakSag');
    }
}

async function sirayiKaydet(bitince) {
    import('./arayuz.js').then(m => m.tazelemeyiBastir(2000)).catch(() => {});
    const serit = document.getElementById('grupSeridi');
    // Kok her zaman ilk sirada kalir; digerlerinin sirasi DOM'dan okunuyor
    const idler = [...serit.children]
        .map(s => s.dataset.grupId)
        .filter(id => id && id !== kokId);

    try {
        await sirayiUygula(kokId, idler);
        if (bitince) await bitince();
    } catch (e) {
        console.log('[WSD] grup sirasi kaydedilemedi:', e);
    }
}
