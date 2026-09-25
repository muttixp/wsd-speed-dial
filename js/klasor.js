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

// WSD Speed Dial - ALT KLASORLER (1.5.0)
//
// Grubun icindeki yer imi klasorleri izgarada KLASOR KUTUSU olarak
// gorunuyor; tiklayinca iceri giriliyor, ustte yol seridi cikiyor
// ("elfinder › template"). Grup seridi degismiyor: yuzlerce grubun
// yanina alt sekme koymak seridi kullanilmaz hale getirirdi.
//
// Klasor kutusu `.kart` sinifini TASIMIYOR, `.klasorKart` kullaniyor:
// kart siralama, sag tik, denetim ve gorsel yukleme `.kart` uzerinden
// calisiyor ve klasorleri kart sanmamalari gerekiyor.

import { c } from './dil.js';
import { klasorIcerigi, klasorEkle, kartlariAl, kokKlasoruAl, urlNormalle } from './yerimi.js';
import { gorselAl } from './gorsel.js';
import { ikonHTML } from './ikon.js';
import { klasorSuruklemeKur } from './klasorsurukle.js';
import { grupPenceresiniAc, ikonYaz, gorunumYaz } from './gruppencere.js';
import { kartGuncelleBaslik } from './yerimi.js';

const el = id => document.getElementById(id);

/* ---------- Cizim ---------- */

/**
 * Klasor kutusu. Kartla AYNI iskelet: baslik satiri + gorsel kutusu.
 * @param ikon     grup ikonlariyla ayni depo ('folder' | 'emoji:..' | 'favicon:..')
 * @param gorunum  { renk, aciklama }
 * OZEL IKON secildiyse onizleme mozaigi yerine o ikon buyuk gorunur:
 * kullanici ikonu bilerek secti, kart gorselleri onu ortmesin.
 */
export function klasorKartiOlustur(k, ikon = null, gorunum = {}) {
    const ozel = ikon && ikon !== 'folder';
    const d = document.createElement('div');
    d.className = 'klasorKart' + (ozel ? ' ozelIkon' : '');
    d.dataset.klasorId = k.id;
    d.dataset.birakKlasor = k.id;         // kart suruklenince hedef
    d.draggable = true;                   // klasor de suruklenip siralaniyor
    d.tabIndex = 0;
    d.title = gorunum.aciklama ? `${k.baslik}\n${gorunum.aciklama}` : k.baslik;

    const govde = document.createElement('span');
    govde.className = 'kartGovde';

    const baslik = document.createElement('span');
    baslik.className = 'kartBaslik';
    if (ozel) {
        const kucuk = document.createElement('span');
        kucuk.className = 'klasorKucukIkon';
        kucuk.innerHTML = ikonHTML(ikon);
        if (gorunum.renk) kucuk.style.color = gorunum.renk;
        baslik.appendChild(kucuk);
    }
    baslik.appendChild(document.createTextNode(k.baslik || '—'));

    const kutu = document.createElement('span');
    kutu.className = 'kartGorsel klasorGorsel';

    // Onizleme: ilk dort kartin gorseli 2x2. Gorsel yoksa buyuk klasor ikonu.
    const mozaik = document.createElement('span');
    mozaik.className = 'klasorMozaik';
    kutu.appendChild(mozaik);

    const ikonEl = document.createElement('span');
    ikonEl.className = 'klasorIkon';
    ikonEl.innerHTML = ikonHTML(ozel ? ikon : 'folder');
    if (gorunum.renk) ikonEl.style.color = gorunum.renk;
    kutu.appendChild(ikonEl);

    const sayi = document.createElement('span');
    sayi.className = 'klasorSayi';
    kutu.appendChild(sayi);

    govde.append(baslik, kutu);
    d.appendChild(govde);

    // Renk etiketi: kartlardaki alt serit
    if (gorunum.etiket) {
        const serit = document.createElement('span');
        serit.className = 'kartRenk';
        serit.style.backgroundColor = gorunum.etiket;
        d.appendChild(serit);
    }
    if (gorunum.not) d.classList.add('notlu');

    d.appendChild(aracSeridi());
    return d;
}

// Kartlardaki uzerine gelince cikan seridin aynisi. Eylem adlari klasor
// menusundekilerle ortak: tek yerden calisiyor.
const ARACLAR = [
    ['klasorDuzenle', 'duzenle', '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/>'],
    ['klasorNot',     'not',     '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>'],
    ['klasorYenile',  'gorselleriYenile', '<path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 3v6h-6"/>'],
    ['klasorTasi',    'tasi',    '<path d="M5 9l-3 3 3 3"/><path d="M9 5l3-3 3 3"/><path d="M15 19l-3 3-3-3"/><path d="M19 9l3 3-3 3"/><path d="M2 12h20M12 2v20"/>'],
    ['klasorSil',     'sil',     '<path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>'],
];

function aracSeridi() {
    const kap = document.createElement('span');
    kap.className = 'kartAraclari';
    for (const [eylem, metin, yol] of ARACLAR) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'kartArac';
        b.dataset.klasorArac = eylem;
        b.dataset.arac = eylem === 'klasorSil' ? 'sil' : eylem;   // sil icin kirmizi hover
        b.title = c(metin) || metin;
        b.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${yol}</svg>`;
        kap.appendChild(b);
    }
    return kap;
}

/**
 * Klasor kutularinin sayisini ve onizlemesini doldurur. Cizimden SONRA
 * cagriliyor: klasor basina bir agac okumasi var, izgarayi bekletmesin.
 */
export async function klasorOzetleriniUygula(kutular) {
    const onizlemeler = new Map();         // kutu -> [anahtar]
    const tumAnahtarlar = new Set();

    for (const kutu of kutular) {
        const { kartlar, klasorler } = await klasorIcerigi(kutu.dataset.klasorId);
        const sayi = kutu.querySelector('.klasorSayi');
        if (sayi) {
            const parca = [c('nKart', kartlar.length)];
            if (klasorler.length) parca.push(c('nAltKlasor', klasorler.length));
            sayi.textContent = kartlar.length || klasorler.length ? parca.join(' · ') : c('bos');
        }
        const ilk = kartlar.slice(0, 4).map(k => urlNormalle(k.url));
        onizlemeler.set(kutu, ilk);
        ilk.forEach(a => tumAnahtarlar.add(a));
    }
    if (!tumAnahtarlar.size) return;

    let kayitlar = {};
    try { kayitlar = await gorselAl([...tumAnahtarlar]); } catch (e) { return; }

    for (const [kutu, anahtarlar] of onizlemeler) {
        if (!kutu.isConnected) continue;
        const mozaik = kutu.querySelector('.klasorMozaik');
        let adet = 0;
        for (const a of anahtarlar) {
            const g = kayitlar[a]?.gorsel;
            if (!g) continue;
            const hucre = document.createElement('span');
            hucre.style.backgroundImage = `url('${g}')`;
            mozaik.appendChild(hucre);
            adet++;
        }
        kutu.classList.toggle('onizlemeli', adet > 0);
    }
}

/** Ust taraftaki yol seridi. Grubun kokundeyken gizli. */
export function yolSeridiniCiz(zincir) {
    const serit = el('klasorYolu');
    if (!serit) return;
    serit.textContent = '';
    const icerde = zincir && zincir.length > 1;
    serit.hidden = !icerde;
    document.body.classList.toggle('klasorIcinde', icerde);
    if (!icerde) return;

    const yukari = document.createElement('button');
    yukari.type = 'button';
    yukari.className = 'yolYukari';
    yukari.dataset.klasorId = zincir[zincir.length - 2].id;
    yukari.dataset.birakKlasor = zincir[zincir.length - 2].id;
    yukari.title = c('ustKlasor');
    yukari.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
        'stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>';
    serit.appendChild(yukari);

    zincir.forEach((z, i) => {
        if (i) {
            const ayrac = document.createElement('span');
            ayrac.className = 'yolAyrac';
            ayrac.textContent = '›';
            serit.appendChild(ayrac);
        }
        const son = i === zincir.length - 1;
        const b = document.createElement(son ? 'span' : 'button');
        b.className = son ? 'yolParca yolSon' : 'yolParca';
        b.textContent = z.baslik || '—';
        if (!son) {
            b.type = 'button';
            b.dataset.klasorId = z.id;
            b.dataset.birakKlasor = z.id;     // kart ust klasore surukelenebilsin
        }
        serit.appendChild(b);
    });
}

/* ---------- Etkilesim ---------- */

let bag = null;             // etkilesim.js'ten gelen bagimliliklar
let menuKlasorId = null;

/**
 * @param deps { grubuAc, aktifGrup, menuyuAc, menuleriKapat, bildir,
 *               onaySor, metinSor, klasorHedefiSec, grubunGorselleriniYenile,
 *               grubuYedekle, grubuGeriAl, copeAt, tazelemeyiBastir }
 */
export function klasorleriKur(deps) {
    bag = deps;
    const kap = el('kartKabi');
    klasorSuruklemeKur(bag);

    // Tiklama: iceri gir. Enter da ayni is (klavyeyle gezinme).
    kap?.addEventListener('click', e => {
        const k = e.target.closest('.klasorKart');
        if (!k) return;
        e.preventDefault();
        // Arac seridi: iceri girmeden eylem
        const arac = e.target.closest('[data-klasor-arac]');
        if (arac) {
            e.stopPropagation();
            klasorEylemi(arac.dataset.klasorArac, k.dataset.klasorId);
            return;
        }
        bag.grubuAc(k.dataset.klasorId);
    });
    kap?.addEventListener('keydown', e => {
        if (e.key !== 'Enter') return;
        const k = e.target.closest('.klasorKart');
        if (k) bag.grubuAc(k.dataset.klasorId);
    });

    // Orta tik / Ctrl+tik: klasoru acmak yerine icindeki kartlari
    // sekmelerde acmak cazip ama kaza riski yuksek - yapmiyoruz.

    el('klasorYolu')?.addEventListener('click', e => {
        const b = e.target.closest('[data-klasor-id]');
        if (b) bag.grubuAc(b.dataset.klasorId);
    });

    kap?.addEventListener('contextmenu', e => {
        const k = e.target.closest('.klasorKart');
        if (!k) return;
        e.preventDefault();
        menuKlasorId = k.dataset.klasorId;
        k.classList.add('menuHedef');
        bag.menuyuAc(el('klasorMenu'), e.clientX, e.clientY);
    });

    el('klasorMenu')?.addEventListener('click', e => {
        const oge = e.target.closest('li');
        if (!oge || oge.classList.contains('pasif')) return;
        const id = menuKlasorId;
        bag.menuleriKapat();
        if (id) klasorEylemi(oge.dataset.eylem, id);
    });
}

/** Menu kapaninca isaretini kaldir (etkilesim.js cagiriyor). */
export function klasorIsaretiniTemizle() {
    document.querySelectorAll('.klasorKart.menuHedef').forEach(k => k.classList.remove('menuHedef'));
}

async function klasorAdi(id) {
    try { return (await chrome.bookmarks.get(id))[0].title || ''; } catch (e) { return ''; }
}

async function klasorEylemi(eylem, id) {
    bag.tazelemeyiBastir();
    switch (eylem) {
        case 'klasorAc':
            return bag.grubuAc(id);

        case 'klasorHepsiniAc': {
            const kartlar = await kartlariAl(id);
            if (!kartlar.length) return bag.bildir(c('buKlasordeKartYok'));
            if (kartlar.length > 8 && !await bag.onaySor({
                baslik: c('hepsiniAcBd'),
                metin: c('nSekmeAcilacak', kartlar.length),
                evet: c('ac')
            })) return;
            for (const k of kartlar) window.open(k.url, '_blank');
            return;
        }

        case 'klasorYenile':
            return bag.grubunGorselleriniYenile(id);

        case 'klasorDuzenle':
            return klasoruDuzenle(id);

        case 'klasorNot':
            return klasorNotu(id);

        case 'klasorTasi':
            return klasoruTasi(id);

        case 'klasorSil':
            return klasoruSil(id);
    }
}

/** Klasoru baska bir gruba/klasore tasir ya da ust duzey GRUP yapar. */
export async function klasoruTasi(id) {
    const [d] = await chrome.bookmarks.get(id);
    const { klasorler } = await klasorIcerigi(id);
    // Kendisi, kendi alt klasorleri ve su anki ust klasoru hedef olamaz
    const haric = new Set([id, d.parentId, ...klasorler.map(k => k.id)]);

    const hedef = await bag.klasorHedefiSec(haric, c('klasoruTasi'), true);
    if (!hedef) return;
    try {
        bag.tazelemeyiBastir(2000);
        await chrome.bookmarks.move(id, { parentId: hedef });
        const kok = await kokKlasoruAl();
        // Grup oldu ya da grup olmaktan cikti: serit degisti
        await bag.seritTazele();
        await bag.grubuAc(bag.aktifGrup());
        bag.bildir(hedef === kok ? c('klasorGrupOldu') : c('klasorTasindi'));
    } catch (e) {
        console.log('[WSD] klasor tasinamadi:', e);
        bag.bildir(c('tasinamadi'));
    }
}

/** Klasoru icerigiyle cope atar; Geri Al ile eski yerine doner. */
async function klasoruSil(id) {
    const { kartlar, klasorler } = await klasorIcerigi(id);
    const ad = await klasorAdi(id);
    if (!await bag.onaySor({
        baslik: c('klasoruSil'),
        metin: c('klasorSilMetin', ad, kartlar.length, klasorler.length),
        evet: c('sil'),
        tehlikeli: true,
        hatirla: 'grupSil'
    })) return;

    try {
        const yedek = await bag.grubuYedekle(id);
        if (yedek) await bag.copeAt(yedek);
        bag.tazelemeyiBastir(2000);
        await chrome.bookmarks.removeTree(id);
        await bag.grubuAc(bag.aktifGrup());
        bag.bildir(c('klasorSilindiNKart', kartlar.length), yedek ? {
            etiket: c('geriAl'),
            calistir: () => bag.grubuGeriAl(yedek)
        } : null);
    } catch (e) {
        console.log('[WSD] klasor silinemedi:', e);
        bag.bildir(c('silinemedi'));
    }
}

/**
 * Klasoru GRUP PENCERESIYLE duzenler: ad, aciklama, ikon (kutuphane /
 * emoji / site favicon'u) ve ikon rengi. Veriler gruplarla ayni depoda,
 * yer imi kimligine bagli.
 */
async function klasoruDuzenle(id) {
    const [d] = await chrome.bookmarks.get(id);
    const sonuc = await grupPenceresiniAc({ id, baslik: d.title }, { klasor: { ustId: d.parentId } });
    if (!sonuc) return;
    bag.tazelemeyiBastir(2000);
    try {
        if (sonuc.ad !== d.title) await kartGuncelleBaslik(id, sonuc.ad);
        await klasorGorunumunuYaz(id, sonuc);
        await bag.grubuAc(bag.aktifGrup());
    } catch (e) {
        console.log('[WSD] klasor duzenlenemedi:', e);
        bag.bildir(c('kaydedilemedi'));
    }
}

async function klasorGorunumunuYaz(id, sonuc) {
    await ikonYaz(id, sonuc.ikon && sonuc.ikon !== 'folder' ? sonuc.ikon : null);
    await gorunumYaz(id, { renk: sonuc.renk, aciklama: sonuc.aciklama, etiket: sonuc.etiket || null });
}

/** Klasor notu - gorunum deposunda, klasorle birlikte yedeklenip cope gidiyor */
async function klasorNotu(id) {
    const [d] = await chrome.bookmarks.get(id);
    const { gorunumleriAl } = await import('./grupikon.js');
    await bag.notPenceresiniAc(null, d.title, {
        oku: async () => ((await gorunumleriAl())[id] || {}).not || '',
        yaz: m => gorunumYaz(id, { not: (m || '').trim() || null })
    });
}

/** Bos alan menusu -> "Yeni Klasor". Kokte (Ana Sayfa) klasor = grup. */
export async function yeniKlasor(ustId) {
    const sonuc = await grupPenceresiniAc(null, { klasor: { ustId } });
    if (!sonuc) return;
    bag.tazelemeyiBastir(2000);
    const yeni = await klasorEkle(ustId, sonuc.ad);
    await klasorGorunumunuYaz(yeni.id, sonuc);
    await bag.grubuAc(ustId);
}
