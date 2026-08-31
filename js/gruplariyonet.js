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

export function yonetPenceresiniKur() {
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

    const sil = document.createElement('button');
    sil.className = 'yonetSil';
    sil.type = 'button';
    sil.title = c('grubuSil');
    sil.textContent = '\u00D7';
    sil.addEventListener('click', async () => {
        const onay = await onaySor({
            baslik: c('grubuSil'),
            metin: `"${adAlan.value}" ve içindeki ${adet} kart silinecek.`,
            evet: c('sil'), tehlikeli: true
        });
        if (!onay) return;
        // Hemen SILMIYORUZ: Kaydet'e basilinca uygulanacak, boylece
        // kullanici Vazgec diyerek geri donebiliyor.
        silinecekler.add(g.id);
        li.remove();
    });

    li.append(tut, ikon, adAlan, sayiEl, sil);
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
        // Once silmeler
        for (const id of silinecekler) {
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
