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

// WSD Speed Dial - klasor penceresi (1.7.0)
//
// Klasore tiklayinca sayfa klasorun icine gecmek yerine klasor bir
// pencerede acilir; kapatinca kullanici oldugu yerde kalir. Kartlar ana
// izgarayla ayni cizimle (gorsel, renk, not, arac seridi) geliyor; tiklama,
// orta tik ve sag tik menusu etkilesim.js'teki ortak dinleyicilerden.
// Alt klasore tiklamak pencerenin icinde ilerler, "geri" ile donulur.

import { pencereAc, pencereKapat } from './arayuz.js';
import { c } from './dil.js';

const el = id => document.getElementById(id);
let yigin = [];
let bag = null;

/** Klasoru pencerede acar. `icerden`: pencere icinde alt klasore gecis. */
export async function klasorPenceresiAc(id, icerden = false) {
    if (!icerden) yigin = [];
    yigin.push(id);
    await ciz();
    if (el('klasorPencere').hidden) pencereAc('klasorPencere');
}

/** Izgara / liste (1.7.0): secim ayarda, pencere her acilista hatirlar */
async function gorunumuUygula(deger) {
    if (!deger) {
        try { deger = (await (await import('./ayar.js')).ayarlariAl()).kfpGorunum; } catch (e) { /* */ }
    }
    const liste = deger === 'liste';
    el('kfpKabi').classList.toggle('kfpListe', liste);
    for (const b of document.querySelectorAll('#klasorPencere .kfpGorunum .kfpDugme')) {
        b.classList.toggle('secili', b.dataset.gorunum === (liste ? 'liste' : 'izgara'));
        b.setAttribute('aria-pressed', String(b.classList.contains('secili')));
    }
}

async function ciz() {
    const id = yigin[yigin.length - 1];
    await gorunumuUygula();
    let baslik = '';
    try { baslik = (await chrome.bookmarks.get(id))[0].title || ''; } catch (e) { /* silinmis */ }
    el('kfpBaslik').textContent = baslik || '—';
    el('kfpGeri').hidden = yigin.length < 2;
    const { kabaCiz } = await import('./cizim.js');
    const { kartlar, klasorler } = await kabaCiz(el('kfpKabi'), id);
    el('kfpBos').hidden = kartlar.length + klasorler.length > 0;
    el('kfpKabi').appendChild(ekleDugmesi());
}

/** "+" (1.7.0): bu klasore site ekler. Ana izgaradaki ekle kartiyla ayni yapi */
function ekleDugmesi() {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'kart ekleKart kfpEkle';
    b.title = c('kartEkle');
    const govde = document.createElement('span');
    govde.className = 'kartGovde';
    const baslik = document.createElement('span');
    baslik.className = 'kartBaslik';
    baslik.textContent = c('kfpEkle');
    const kutu = document.createElement('span');
    kutu.className = 'ekleKutu';
    kutu.textContent = '+';
    govde.append(baslik, kutu);
    b.appendChild(govde);
    return b;
}

/** Pencerede acik klasor (yoksa null) */
export function acikKlasor() {
    return el('klasorPencere') && !el('klasorPencere').hidden && yigin.length ? yigin[yigin.length - 1] : null;
}

// Baska bir pencere (Kart Ekle, Duzenle, Not, Tasi, onay...) acilinca
// klasor penceresi gizlenir, o kapaninca geri gelir: yoksa yeni pencere
// klasor penceresinin ALTINDA kaliyordu.
let donulecek = null;
const digerPencereAcik = () =>
    [...document.querySelectorAll('.pencere')].some(p => p.id !== 'klasorPencere' && !p.hidden);
function gizle() {
    if (el('klasorPencere').hidden) return;
    donulecek = yigin.slice();
    el('klasorPencere').hidden = true;          // perde yeni pencereye kalsin
}
export function eklemeIcinGizle() { gizle(); }

/** Acik pencereyi tazeler (kart duzenlenip kaydedilince). */
export async function klasorPenceresiniTazele() {
    if (!el('klasorPencere') || el('klasorPencere').hidden || !yigin.length) return;
    await ciz();
}

/**
 * @param deps { grubuAc, klasorEylemi }
 */
export function klasorPenceresiKur(deps) {
    bag = deps;
    const kap = el('kfpKabi');

    // Alt klasor: pencerenin icinde ilerle (kartlar etkilesim.js'te)
    kap?.addEventListener('click', e => {
        const k = e.target.closest('.klasorKart');
        if (!k) return;
        e.preventDefault();
        e.stopPropagation();
        klasorPenceresiAc(k.dataset.klasorId, true);
    });
    kap?.addEventListener('keydown', e => {
        if (e.key !== 'Enter') return;
        const k = e.target.closest('.klasorKart');
        if (k) klasorPenceresiAc(k.dataset.klasorId, true);
    });

    el('kfpGeri')?.addEventListener('click', () => {
        if (yigin.length < 2) return;
        yigin.pop();
        ciz();
    });
    el('kfpIcineGir')?.addEventListener('click', () => {
        const id = yigin[yigin.length - 1];
        pencereKapat('klasorPencere');
        bag?.grubuAc(id);
    });
    el('kfpHepsiniAc')?.addEventListener('click', () => {
        bag?.klasorEylemi('klasorHepsiniAc', yigin[yigin.length - 1]);
    });
    el('kfpKapat')?.addEventListener('click', () => pencereKapat('klasorPencere'));
    for (const b of document.querySelectorAll('#klasorPencere .kfpGorunum .kfpDugme')) {
        b.addEventListener('click', async () => {
            const deger = b.dataset.gorunum;
            gorunumuUygula(deger);
            try { await (await import('./ayar.js')).ayarYaz({ kfpGorunum: deger }); } catch (e) { /* */ }
        });
    }

    const gozcu = new MutationObserver(() => {
        if (digerPencereAcik()) { gizle(); return; }
        if (!donulecek) return;
        const y = donulecek;
        donulecek = null;
        yigin = y;
        ciz().then(() => pencereAc('klasorPencere'));
    });
    for (const p of document.querySelectorAll('.pencere')) {
        if (p.id !== 'klasorPencere') gozcu.observe(p, { attributes: true, attributeFilter: ['hidden'] });
    }

    // Kart duzenlenince / tasininca pencere guncel kalsin
    chrome.bookmarks.onChanged?.addListener(() => klasorPenceresiniTazele());
    chrome.bookmarks.onMoved?.addListener(() => klasorPenceresiniTazele());
    chrome.bookmarks.onRemoved?.addListener(() => klasorPenceresiniTazele());
    chrome.bookmarks.onCreated?.addListener(() => klasorPenceresiniTazele());
}
