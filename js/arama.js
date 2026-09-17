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

// WSD Speed Dial - arama
//
// Arama TUM GRUPLARDA calisiyor, yalnizca acik grupta degil: kullanici
// kartin hangi grupta oldugunu genelde hatirlamiyor. Sonuclarda kartin
// hangi gruptan geldigi kucuk bir etiketle yaziliyor.
//
// Sonuclar AYRI bir liste olarak ciziliyor; mevcut kartlar gizlenip
// gosterilmiyor. Sebep: ayni kart iki grupta olabiliyor ve gizle/goster
// yaklasimi sirayi ve surukleme durumunu bozuyor.

import { gruplariAl, kartlariAl, urlNormalle } from './yerimi.js';
import { kartAraclariOlustur, gorselleriGozle } from './cizim.js';
import { renkleriAl } from './renk.js';
import { notlariAl } from './not.js';
import { c } from './dil.js';
import { seritBoslugunuAyarla, ekranSinifiniVer } from './arayuz.js';

// Arama seridinin kartlarla ortusmesini olcup ust bosluk veriyoruz.
// Sabit bir deger yetmiyor: serit yuksekligi ve sayfa duzeni degisebiliyor.

let acik = false;
let tumKartlar = null;
let tumGruplar = [];        // { id, baslik, adet } - grup aramasi icin
let zamanlayici = null;

const el = id => document.getElementById(id);

export function aramayiKur({ aktifGrup, grubuAc }) {
    // Durum GOVDE SINIFINDAN okunuyor: baska bir ekran acilinca arama
    // disaridan kapatiliyor ve yerel `acik` degiskeni bayatliyordu
    el('araBtn')?.addEventListener('click', () =>
        (document.body.classList.contains('aramaAcik') ? kapat(sonBaglam) : ac()));
    el('aramaKapat')?.addEventListener('click', () => kapat({ grubuAc, aktifGrup }));

    el('aramaAlan')?.addEventListener('input', e => {
        // Her tusa basista tum kartlari yeniden cizmek pahali - kisa bekle
        clearTimeout(zamanlayici);
        const terim = e.target.value;
        zamanlayici = setTimeout(() => suz(terim, { aktifGrup, grubuAc }), 120);
    });

    el('aramaAlan')?.addEventListener('keydown', e => {
        if (e.key === 'Escape') kapat({ grubuAc, aktifGrup });
        if (e.key === 'Enter') {
            // Ilk sonucu ac
            const ilk = document.querySelector('#kartKabi .kart:not(.ekleKart)');
            if (ilk) location.href = ilk.href;
        }
    });

    // Klavye kisayolu: / veya Ctrl+F
    document.addEventListener('keydown', e => {
        const yaziyor = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
        if (yaziyor) return;

        if (e.key === '/' || (e.key === 'f' && (e.ctrlKey || e.metaKey))) {
            e.preventDefault();
            ac();
        }
    });

}

async function ac() {
    acik = true;
    ekranSinifiniVer('aramaAcik');   // digerleri kapansin
    // Arama acilinca mevcut grubun kartlari da gizleniyor: arama tum
    // gruplarda calisiyor, ekranda duran eski kartlar sonucmus gibi
    // gorunuyordu. Terim yazilinca sonuclar cizilecek.
    document.body.classList.add('aramaBekliyor');
    seritBoslugunuAyarla();
    // Serit acilma animasyonu bitmeden odaklanirsa kaydirma zipliyor
    setTimeout(() => el('aramaAlan')?.focus(), 180);

    // Kart dizinini bir kez topla
    if (!tumKartlar) tumKartlar = await dizinOlustur();
}

/**
 * Arama sonucundaki grup etiketine tiklayinca o grubu aciyoruz.
 * Aramayi kapatiyor, kart izgarasini o grupla yeniden ciziyor.
 */
async function grubaGit(grupId, baglam) {
    const ac = baglam?.grubuAc || sonBaglam?.grubuAc;
    if (!ac) return;

    acik = false;
    document.body.classList.remove('aramaAcik', 'aramaBekliyor');
    const alan = el('aramaAlan');
    if (alan) { alan.value = ''; alan.blur(); }
    seritBoslugunuAyarla();

    await ac(grupId);
}

function kapat(baglam) {
    acik = false;
    document.body.classList.remove('aramaAcik', 'aramaBekliyor');
    const alan = el('aramaAlan');
    if (alan) {
        const doluydu = !!alan.value;
        alan.value = '';
        alan.blur();
        // Yalnizca arama yapilmissa normale don - bosuna yeniden cizme
        if (doluydu && baglam) baglam.grubuAc(baglam.aktifGrup());
    }
    seritBoslugunuAyarla();
}

/** Tum gruplardaki kartlari tek listede toplar; grup listesini de doldurur. */
async function dizinOlustur() {
    const liste = [];
    tumGruplar = [];
    for (const g of await gruplariAl()) {
        const kartlar = await kartlariAl(g.id);
        tumGruplar.push({ id: g.id, baslik: g.baslik, adet: kartlar.length });
        for (const k of kartlar) {
            liste.push({
                url: urlNormalle(k.url),
                baslik: k.baslik || k.url,
                grupAdi: g.baslik,
                grupId: g.id,
                id: k.id
            });
        }
    }
    return liste;
}

/** Dizin bayatladiginda cagriliyor (kart eklendi/silindi). */
export function dizinBayatladi() {
    tumKartlar = null;
}

let sonTerim = '';
let sonBaglam = null;

/**
 * Son aramayi yeniden calistirir.
 *
 * Bir kart silinince ekran `grubuAc()` ile normal izgaraya donuyordu;
 * kullanici arama sonuclarindaysa yerini kaybediyordu.
 */
export async function aramayiTazele() {
    if (!sonTerim) return;
    dizinBayatladi();
    await suz(sonTerim, sonBaglam);
}

async function suz(terim, baglam) {
    sonTerim = terim;
    sonBaglam = baglam || sonBaglam;
    const t = (terim || '').trim().toLocaleLowerCase('tr');

    if (!t) {
        // Terim silindi - yine bos ekran, arama kutusu hala acik
        document.body.classList.add('aramaBekliyor');
        return;
    }

    document.body.classList.remove('aramaBekliyor');

    if (!tumKartlar) tumKartlar = await dizinOlustur();

    const eslesen = tumKartlar.filter(k =>
        k.baslik.toLocaleLowerCase('tr').includes(t) ||
        k.url.toLocaleLowerCase('tr').includes(t)
    );

    // GRUP ARAMASI: ayni kutudan, ayri kip yok. Eslesen gruplar
    // sonuclarin ustunde kucuk rozetler olarak cikiyor.
    const eslesenGrup = tumGruplar.filter(g =>
        (g.baslik || '').toLocaleLowerCase('tr').includes(t));

    ciz(eslesen, sonBaglam, t, eslesenGrup);
}

async function ciz(kartlar, baglam, terim, gruplar = []) {
    const kap = el('kartKabi');
    kap.textContent = '';

    // Eslesen gruplar - sonuclarin ustunde tek satir
    if (gruplar.length) {
        const serit = document.createElement('div');
        serit.id = 'aramaGrupSerit';
        for (const g of gruplar) {
            const d = document.createElement('button');
            d.type = 'button';
            d.className = 'aramaGrupRozet';
            d.innerHTML = '<svg viewBox="0 0 16 16" width="13" height="13" fill="none" ' +
                'stroke="currentColor" stroke-width="1.5" stroke-linecap="round" ' +
                'stroke-linejoin="round"><path d="M1.8 12.7V4.4c0-.6.5-1.1 1.1-1.1h3l1.5 1.8h6.8c.6 0 ' +
                '1.1.5 1.1 1.1v6.5c0 .6-.5 1.1-1.1 1.1H2.9c-.6 0-1.1-.5-1.1-1.1z"/></svg>' +
                '<span></span>';
            d.querySelector('span').textContent = `${g.baslik} (${g.adet})`;
            d.addEventListener('click', () => grubaGit(g.id, baglam));
            serit.appendChild(d);
        }
        kap.appendChild(serit);
    }

    if (!kartlar.length && !gruplar.length) {
        const bos = document.createElement('p');
        bos.id = 'aramaBos';
        bos.textContent = c('sonucBulunamadi', terim);
        kap.appendChild(bos);
        return;
    }

    const renkler = await renkleriAl();
    const notlar = await notlariAl();

    for (const k of kartlar) {
        const a = document.createElement('a');
        a.className = 'kart';
        a.href = k.url;
        a.dataset.kartId = k.id;
        a.dataset.anahtar = k.url;

        const govde = document.createElement('span');
        govde.className = 'kartGovde';

        const baslik = document.createElement('span');
        baslik.className = 'kartBaslik';
        baslik.textContent = k.baslik;

        const gorsel = document.createElement('span');
        gorsel.className = 'kartGorsel';
        // Gorsel tembel yukleniyor - dongu sonunda gozetlemeye aliniyor

        govde.append(baslik, gorsel);
        a.appendChild(govde);

        // Renk etiketi
        const serit = document.createElement('span');
        serit.className = 'kartRenk';
        const renk = renkler[k.url];
        if (renk) serit.style.backgroundColor = renk;
        else serit.hidden = true;
        a.appendChild(serit);

        // Not isareti - metni ipucunda gosterilmiyor
        if (notlar[k.url]) a.classList.add('notlu');

        if (document.body.classList.contains('basliklarKapali')) {
            a.title = k.baslik;
        }

        // Arac seridi - normal kartlarla AYNI bilesen.
        // Once burada eksikti: ayardan acilsa bile arama sonuclarinda
        // butonlar cikmiyordu.
        a.appendChild(kartAraclariOlustur());

        // Hangi gruptan geldigi - TIKLANINCA O GRUBA GIDIYOR.
        // Boylece arama ayni zamanda grup bulmaya da yariyor.
        const etiket = document.createElement('button');
        etiket.type = 'button';
        etiket.className = 'kartGrupEtiketi kartGrupGit';
        etiket.textContent = k.grupAdi;
        etiket.title = c('grubaGit');
        etiket.dataset.grupId = k.grupId;
        etiket.addEventListener('click', e => {
            e.preventDefault();          // kartin baglantisini tetikleme
            e.stopPropagation();
            grubaGit(k.grupId, baglam);
        });
        a.appendChild(etiket);

        kap.appendChild(a);
    }

    // TEMBEL YUKLEME: eskiden eslesen tum kartlarin gorseli tek seferde
    // okunuyordu; genis aramalarda yuzlerce data URI bellege giriyordu.
    gorselleriGozle(kap.querySelectorAll('.kart[data-anahtar]'));
}
