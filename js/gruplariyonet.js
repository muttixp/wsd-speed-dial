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

// WSD Speed Dial - "Gruplari Yonet" penceresi
//
// Serit uzerinde surukleyerek siralamak cok grupta zor. Burada liste
// halinde: surukle-birak sirala, yerinde yeniden adlandir, sil.
// Degisiklikler KAYDET'e basilinca uygulaniyor.

import { gruplariAl, kartSayilariAl, kartGuncelleBaslik, grupSil,
         sirayiUygula, kokKlasoruAl } from './yerimi.js';
import { c } from './dil.js';
import { ikonlariAl } from './grupikon.js';
import { ikonHTML } from './ikon.js';
import { onaySor } from './onay.js';

const el = id => document.getElementById(id);
let silinecekler = new Set();
let bitince = null;

/**
 * Grup ARAMA: cok gruplu kurulumlarda (100+) aradigin grubu gozle
 * bulmak zor. Satirlari GIZLEMIYORUZ - liste butun kalsin ki arkasini
 * gormeye devam edebilesin; eslesen satira kaydirip vurguluyoruz.
 * Enter sonraki eslesmeye atliyor.
 */
function suzmeyiKur() {
    const alan = document.getElementById('yonetSuz');
    const liste = document.getElementById('yonetListe');
    if (!alan || !liste) return;

    let sira = 0;

    const eslesenler = () => {
        const t = alan.value.trim().toLocaleLowerCase('tr');
        if (!t) return [];
        return [...liste.children].filter(li =>
            (li.querySelector('input')?.value || '').toLocaleLowerCase('tr').includes(t));
    };

    const goster = liste2 => {
        for (const li of liste.children) li.classList.remove('vurgulu');
        if (!liste2.length) return;
        if (sira >= liste2.length) sira = 0;
        const hedef = liste2[sira];
        hedef.classList.add('vurgulu');
        hedef.scrollIntoView({ block: 'center', behavior: 'smooth' });
    };

    alan.addEventListener('input', () => { sira = 0; goster(eslesenler()); });

    alan.addEventListener('keydown', e => {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        const l = eslesenler();
        sira = l.length ? (sira + 1) % l.length : 0;     // sonraki eslesme
        goster(l);
    });
}

export function yonetPenceresiniKur() {
    suzmeyiKur();
    el('yonetIptal')?.addEventListener('click', () => kapat(false));
    el('yonetKaydet')?.addEventListener('click', kaydet);


    el('yonetAz')?.addEventListener('click', () => sirala((a, b) =>
        ad(a).localeCompare(ad(b), 'tr')));
    el('yonetZa')?.addEventListener('click', () => sirala((a, b) =>
        ad(b).localeCompare(ad(a), 'tr')));
    el('yonetSayi')?.addEventListener('click', () => sirala((a, b) =>
        sayi(b) - sayi(a)));

    surukleBirakKur();
}

const ad   = li => li.querySelector('.yonetAd').value.toLocaleLowerCase('tr');
const sayi = li => parseInt(li.querySelector('.yonetSayi').textContent, 10) || 0;

export async function yonetPenceresiniAc(tamamlandi) {
    const suz = document.getElementById('yonetSuz');
    if (suz) suz.value = '';
    bitince = tamamlandi;
    silinecekler = new Set();

    const liste = el('yonetListe');
    liste.textContent = '';

    const kok = await kokKlasoruAl();
    const gruplar = (await gruplariAl()).filter(g => g.id !== kok);  // kok tasinamaz
    const sayilar = await kartSayilariAl(gruplar.map(g => g.id));
    const ikonlar = await ikonlariAl();

    for (const g of gruplar) {
        liste.appendChild(satirOlustur(g, sayilar[g.id] || 0, ikonlar[g.id]));
    }

    el('yonetPencere').hidden = false;
    document.getElementById('perde').classList.add('acik');
}

function satirOlustur(g, adet, ikonDeger) {
    const li = document.createElement('li');
    li.className = 'yonetSatir';
    li.draggable = true;
    li.dataset.grupId = g.id;
    li.dataset.eskiAd = g.baslik;

    const tut = document.createElement('span');
    tut.className = 'yonetTut';
    tut.textContent = '\u2630';

    const ikon = document.createElement('span');
    ikon.className = 'yonetIkon';
    ikon.innerHTML = ikonHTML(ikonDeger || 'folder');

    const adAlan = document.createElement('input');
    adAlan.className = 'yonetAd';
    adAlan.type = 'text';
    adAlan.value = g.baslik;

    const sayiEl = document.createElement('span');
    sayiEl.className = 'yonetSayi';
    sayiEl.textContent = adet;

    // DUZENLE: ikon, renk, gorunum ve aciklama icin grup penceresi.
    // Buradaki ad kutusu yalnizca adi degistiriyor.
    const duzenle = document.createElement('button');
    duzenle.className = 'yonetDuzenle';
    duzenle.type = 'button';
    duzenle.title = c('grubuDuzenle');
    // Kalem - metin karakteri yerine SVG: yazi tipine gore bozuluyordu
    duzenle.innerHTML = '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" ' +
        'stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M11.2 2.3a1.6 1.6 0 0 1 2.3 2.3L5.6 12.5l-3 .9.9-3z"/></svg>';
    duzenle.addEventListener('click', async () => {
        const { grupPenceresiniAc } = await import('./gruppencere.js');
        // Bekleyen ad degisikligi varsa once onu yaziyoruz ki pencere
        // eski adi gostermesin
        const yeniAd = adAlan.value.trim();
        kapat(true);
        await grupPenceresiniAc({ id: g.id, baslik: yeniAd || g.baslik });
    });

    // YENILE: bu grubun tum kartlarinin gorselini yeniden yakalar.
    // Pencere ACIK kaliyor - birkac grubu arka arkaya yenilemek icin.
    const yenile = document.createElement('button');
    yenile.className = 'yonetYenile';
    yenile.type = 'button';
    yenile.title = c('grubunGorselleriniYenile');
    yenile.innerHTML = '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" ' +
        'stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M14 8a6 6 0 1 1-1.8-4.3"/><path d="M14 2v4h-4"/></svg>';
    yenile.addEventListener('click', async () => {
        const { grubunGorselleriniYenile } = await import('./etkilesim.js');
        yenile.disabled = true;
        try { await grubunGorselleriniYenile(g.id); }
        finally { yenile.disabled = false; }
    });

    // GIT: yonet penceresini kapatip o grubu aciyor
    const git = document.createElement('button');
    git.className = 'yonetGit';
    git.type = 'button';
    git.title = c('grubaGit');
    // Kutudan disari ok: "bu gruba git". Duz ok, kalem dugmesini
    // isaret ediyormus gibi duruyordu.
    git.innerHTML = '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" ' +
        'stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M9.5 2.5h4v4"/><path d="M13.5 2.5 8 8"/>' +
        '<path d="M12.5 9.8v2.9a1.3 1.3 0 0 1-1.3 1.3H3.8a1.3 1.3 0 0 1-1.3-1.3V5.3A1.3 1.3 0 0 1 3.8 4h2.9"/></svg>';
    git.addEventListener('click', async () => {
        const { grubuAc } = await import('./cizim.js');
        kapat(true);
        await grubuAc(g.id);
    });

    const sil = document.createElement('button');
    sil.className = 'yonetSil';
    sil.type = 'button';
    sil.title = c('grubuSil');
    sil.textContent = '\u00D7';
    sil.addEventListener('click', async () => {
        const onay = await onaySor({
            baslik: c('grubuSil'),
            metin: c('grupVeKartSilinecek', adAlan.value, adet),
            evet: c('sil'), tehlikeli: true
        });
        if (!onay) return;
        // Hemen SILMIYORUZ: Kaydet'e basilinca uygulanacak, boylece
        // kullanici Vazgec diyerek geri donebiliyor.
        silinecekler.add(g.id);
        li.remove();
    });

    li.append(tut, ikon, adAlan, sayiEl, yenile, git, duzenle, sil);
    return li;
}

/* --- Surukle-birak --- */

let tasinan = null;

function surukleBirakKur() {
    const liste = el('yonetListe');
    if (!liste) return;

    liste.addEventListener('dragstart', e => {
        const li = e.target.closest('.yonetSatir');
        if (!li) return;
        tasinan = li;
        li.classList.add('tasiniyor');
        e.dataTransfer.effectAllowed = 'move';
    });

    liste.addEventListener('dragend', () => {
        tasinan?.classList.remove('tasiniyor');
        tasinan = null;
    });

    liste.addEventListener('dragover', e => {
        e.preventDefault();
        if (!tasinan) return;
        const hedef = e.target.closest('.yonetSatir');
        if (!hedef || hedef === tasinan) return;

        // Imlecin satirin ust yarisinda mi alt yarisinda mi oldugu
        const k = hedef.getBoundingClientRect();
        const altYarida = e.clientY > k.top + k.height / 2;
        hedef.parentNode.insertBefore(tasinan, altYarida ? hedef.nextSibling : hedef);
    });
}

function sirala(karsilastir) {
    const liste = el('yonetListe');
    [...liste.children].sort(karsilastir).forEach(li => liste.appendChild(li));
}

async function kaydet() {
    const liste = el('yonetListe');
    const satirlar = [...liste.children];
    const kok = await kokKlasoruAl();

    try {
        // Once silmeler - COPE yedekleyerek (alt klasorleriyle birlikte).
        // Burada silinen gruplar dogrudan yok oluyordu.
        const { grubuYedekle } = await import('./copekrani.js');
        const { copeAt } = await import('./cop.js');
        for (const id of silinecekler) {
            try {
                const yedek = await grubuYedekle(id);
                if (yedek) await copeAt(yedek);
            } catch (e) { /* yedeklenemese de kullanici silmek istedi */ }
            await grupSil(id);
        }

        // Ad degisiklikleri
        for (const li of satirlar) {
            const yeniAd = li.querySelector('.yonetAd').value.trim();
            if (yeniAd && yeniAd !== li.dataset.eskiAd) {
                await kartGuncelleBaslik(li.dataset.grupId, yeniAd);
            }
        }

        // Sira - listedeki konum = yeni index
        await sirayiUygula(kok, satirlar.map(li => li.dataset.grupId));
    } catch (e) {
        console.log('[WSD] gruplar guncellenemedi:', e);
    }

    kapat(true);
}

function kapat(degistiMi) {
    el('yonetPencere').hidden = true;
    if (!document.getElementById('ayarPanel').classList.contains('acik')) {
        document.getElementById('perde').classList.remove('acik');
    }
    if (bitince) bitince(degistiMi);
    bitince = null;
}
