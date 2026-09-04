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
import { gorselAl } from './gorsel.js';
import { kartAraclariOlustur } from './cizim.js';
import { renkleriAl } from './renk.js';
import { notlariAl } from './not.js';
import { c } from './dil.js';

// Arama seridinin kartlarla ortusmesini olcup ust bosluk veriyoruz.
// Sabit bir deger yetmiyor: serit yuksekligi ve sayfa duzeni degisebiliyor.
const NEFES_PAYI = 26;

let acik = false;
let tumKartlar = null;      // { url, baslik, grupAdi, grupId }
let zamanlayici = null;

const el = id => document.getElementById(id);

export function aramayiKur({ aktifGrup, grubuAc }) {
    el('araBtn')?.addEventListener('click', () => (acik ? kapat() : ac()));
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

    window.addEventListener('resize', bosluguAyarla);
}

async function ac() {
    acik = true;
    document.body.classList.add('aramaAcik');
    // Arama acilinca mevcut grubun kartlari da gizleniyor: arama tum
    // gruplarda calisiyor, ekranda duran eski kartlar sonucmus gibi
    // gorunuyordu. Terim yazilinca sonuclar cizilecek.
    document.body.classList.add('aramaBekliyor');
    bosluguAyarla();
    // Serit acilma animasyonu bitmeden odaklanirsa kaydirma zipliyor
    setTimeout(() => el('aramaAlan')?.focus(), 180);

    // Kart dizinini bir kez topla
    if (!tumKartlar) tumKartlar = await dizinOlustur();
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
    bosluguAyarla();
}

/** Serit ile kart alani ortusuyorsa ust bosluk verir. */
function bosluguAyarla() {
    const alan = el('kartAlani');
    if (!alan) return;

    if (!document.body.classList.contains('aramaAcik')) {
        alan.style.paddingTop = '';
        return;
    }

    // Once sifirla: onceki itmeyi olcumun icine katmayalim
    alan.style.paddingTop = '';

    requestAnimationFrame(() => {
        if (!document.body.classList.contains('aramaAcik')) return;
        const serit = el('aramaKap').getBoundingClientRect();
        const kutu = alan.getBoundingClientRect();
        const ortusme = serit.bottom - kutu.top;
        alan.style.paddingTop = ortusme > 0
            ? Math.ceil(ortusme + NEFES_PAYI) + 'px'
            : '';
    });
}

/** Tum gruplardaki kartlari tek listede toplar. */
async function dizinOlustur() {
    const liste = [];
    for (const g of await gruplariAl()) {
        for (const k of await kartlariAl(g.id)) {
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

    ciz(eslesen, t);
}

async function ciz(kartlar, terim) {
    const kap = el('kartKabi');
    kap.textContent = '';

    if (!kartlar.length) {
        const bos = document.createElement('p');
        bos.id = 'aramaBos';
        bos.textContent = c('sonucBulunamadi', terim);
        kap.appendChild(bos);
        return;
    }

    const kayitlar = await gorselAl(kartlar.map(k => k.url));
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
        const veri = kayitlar[k.url];
        if (veri && veri.gorsel) gorsel.style.backgroundImage = `url('${veri.gorsel}')`;

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

        // Hangi gruptan geldigi
        const etiket = document.createElement('span');
        etiket.className = 'kartGrupEtiketi';
        etiket.textContent = k.grupAdi;
        a.appendChild(etiket);

        kap.appendChild(a);
    }
}
