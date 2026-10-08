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

import { gruplariAl, grubunTumKartlari, klasorIcerigi, urlNormalle } from './yerimi.js';
import { kartAraclariOlustur, gorselleriGozle } from './cizim.js';
import { renkleriAl, RENKLER } from './renk.js';
import { etiketTanimlariAl, kartEtiketleriAl, etiketNoktalari, etiketSil } from './etiket.js';
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
    sonBaglam = { aktifGrup, grubuAc };
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
    if (!el('aramaAlan')?.value.trim()) await etiketleriGoster();
}

/* ============ ETIKET LISTESI (1.5.1) ============
   Arama bos acikken kutunun altinda: kullanilan RENK etiketleri ve ADLI
   etiketler, yanlarinda kart sayisi. Tiklayinca tum gruplardaki o
   etiketli kartlar arama sonucu gibi geliyor; tekrar tiklayinca kalkiyor.
   Adli etiketin x'i etiketi tum kartlardan kaldiriyor. */
let etiketCizildi = false;
let seciliEtiket = null;           // { tur: 'renk'|'ad', deger }

async function etiketVerisi() {
    if (!tumKartlar) tumKartlar = await dizinOlustur();
    const [renkler, kartEt, tanimlar] = await Promise.all([renkleriAl(), kartEtiketleriAl(), etiketTanimlariAl()]);
    return { renkler, kartEt, tanimlar };
}

function etiketUyar(k, sec, v) {
    if (sec.tur === 'renk') return v.renkler[k.url] === sec.deger;
    return (v.kartEt[k.url] || []).includes(sec.deger);
}

async function etiketleriGoster(secili = seciliEtiket) {
    const v = await etiketVerisi();
    const kap = el('kartKabi');
    const renkSay = new Map(), adSay = new Map();
    const gorulen = new Set();
    for (const k of tumKartlar) {
        if (gorulen.has(k.id)) continue;
        gorulen.add(k.id);
        const r = v.renkler[k.url];
        if (r) renkSay.set(r, (renkSay.get(r) || 0) + 1);
        for (const id of v.kartEt[k.url] || []) {
            if (v.tanimlar[id]) adSay.set(id, (adSay.get(id) || 0) + 1);
        }
    }
    if (!renkSay.size && !adSay.size) {
        seciliEtiket = null;
        if (etiketCizildi) { kap.textContent = ''; etiketCizildi = false; }
        document.body.classList.add('aramaBekliyor');
        return;
    }
    if (secili && !(secili.tur === 'renk' ? renkSay.has(secili.deger) : adSay.has(secili.deger))) secili = null;
    seciliEtiket = secili;

    const serit = document.createElement('div');
    serit.id = 'aramaEtiketSerit';
    const baslik = document.createElement('span');
    baslik.className = 'aramaEtiketBaslik';
    baslik.textContent = c('etiketler');
    serit.appendChild(baslik);

    const cip = (tur, deger, ad, renk, adet, silinir) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'aramaEtiket' + (secili && secili.tur === tur && secili.deger === deger ? ' secili' : '');
        const n = document.createElement('i');
        n.style.backgroundColor = renk;
        const s = document.createElement('span');
        s.textContent = ad;
        const say = document.createElement('small');
        say.textContent = adet;
        b.append(n, s, say);
        if (silinir) {
            const x = document.createElement('span');
            x.className = 'aramaEtiketSil';
            x.textContent = '\u00d7';
            x.title = c('etiketiSil');
            x.addEventListener('click', async e => {
                e.stopPropagation();
                const { onaySor } = await import('./onay.js');
                if (!await onaySor({ baslik: c('etiketiSil'), metin: c('etiketiSilSoru', ad, String(adet)),
                                     evet: c('sil'), tehlikeli: true })) return;
                await etiketSil(deger);
                if (seciliEtiket && seciliEtiket.deger === deger) seciliEtiket = null;
                await etiketleriGoster();
            });
            b.appendChild(x);
        }
        b.addEventListener('click', () => {
            const ayni = secili && secili.tur === tur && secili.deger === deger;
            etiketleriGoster(ayni ? null : { tur, deger });
        });
        serit.appendChild(b);
    };
    for (const r of RENKLER) {
        if (r.deger && renkSay.has(r.deger)) cip('renk', r.deger, c('renk_' + r.ad) || r.ad, r.deger, renkSay.get(r.deger), false);
    }
    const adlilar = [...adSay.keys()].sort((a, b) => v.tanimlar[a].ad.localeCompare(v.tanimlar[b].ad, 'tr'));
    if (renkSay.size && adlilar.length) {
        const ayrac = document.createElement('span');
        ayrac.className = 'aramaEtiketAyrac';
        serit.appendChild(ayrac);
    }
    for (const id of adlilar) cip('ad', id, v.tanimlar[id].ad, v.tanimlar[id].renk, adSay.get(id), true);

    document.body.classList.remove('aramaBekliyor');
    etiketCizildi = true;
    if (secili) {
        const gorulen2 = new Set();
        const kartlar = tumKartlar.filter(k => {
            if (gorulen2.has(k.id) || !etiketUyar(k, secili, v)) return false;
            gorulen2.add(k.id);
            return true;
        });
        await ciz(kartlar, sonBaglam, '', []);
        kap.prepend(serit);
    } else {
        kap.textContent = '';
        kap.appendChild(serit);
    }
}

/**
 * Arama sonucundaki grup etiketine tiklayinca o grubu aciyoruz.
 * Aramayi kapatiyor, kart izgarasini o grupla yeniden ciziyor.
 */
async function grubaGit(grupId, baglam, kartId = null) {
    const ac = baglam?.grubuAc || sonBaglam?.grubuAc;
    if (!ac) return;

    acik = false;
    etiketCizildi = false;
    seciliEtiket = null;
    document.body.classList.remove('aramaAcik', 'aramaBekliyor');
    const alan = el('aramaAlan');
    if (alan) { alan.value = ''; alan.blur(); }
    seritBoslugunuAyarla();

    await ac(grupId);
    if (kartId) bulunanKartiGoster(kartId);
}

/**
 * Aramadan gruba gidildiginde ARANAN KARTI gosterir (1.5.3): gorunur
 * alana kaydirir ve birkac saniye cerceveyle isaretler. Kalabalik
 * grupta "hangisiydi" diye yeniden aramak gerekmesin.
 *
 * Izgara cizimi bir-iki kare surebiliyor; kart hemen bulunamazsa kisa
 * araliklarla birkac kez deniyoruz.
 */
function bulunanKartiGoster(kartId, deneme = 0) {
    const kart = [...document.querySelectorAll('.kart')].find(k => k.dataset.kartId === String(kartId));
    if (!kart) {
        if (deneme < 12) setTimeout(() => bulunanKartiGoster(kartId, deneme + 1), 80);
        return;
    }
    document.querySelectorAll('.kart.aramaBulunan').forEach(k => k.classList.remove('aramaBulunan'));
    kart.scrollIntoView({ block: 'center', behavior: 'smooth' });
    kart.classList.add('aramaBulunan');
    const kaldir = () => kart.classList.remove('aramaBulunan');
    setTimeout(kaldir, 4000);
    // Kullanici bir yere tiklarsa isaret hemen kalksin
    document.addEventListener('pointerdown', kaldir, { once: true, capture: true });
}

function kapat(baglam) {
    acik = false;
    document.body.classList.remove('aramaAcik', 'aramaBekliyor');
    const alan = el('aramaAlan');
    if (alan) {
        const doluydu = !!alan.value || etiketCizildi;
        alan.value = '';
        alan.blur();
        etiketCizildi = false;
        seciliEtiket = null;
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
        const kartlar = await grubunTumKartlari(g);
        tumGruplar.push({ id: g.id, baslik: g.baslik, gorunen: g.baslik, adet: kartlar.length });
        // ALT KLASORLER de grup aramasina giriyor (1.5.1): "ltbs" yazinca
        // Os › Windows › Ltbs klasoru de rozet olarak cikiyor. Sayi, klasorun
        // alt klasorleri dahil kart sayisi.
        if (!g.kokMu) {
            const { klasorler } = await klasorIcerigi(g.id);
            const ust = new Map(klasorler.map(k => [k.id, k.parentId]));
            const adet = new Map();
            for (const k of kartlar) {
                for (let id = k.parentId; ust.has(id); id = ust.get(id)) adet.set(id, (adet.get(id) || 0) + 1);
            }
            for (const k of klasorler) {
                tumGruplar.push({ id: k.id, baslik: k.baslik, gorunen: [g.baslik, ...k.yol].join(' › '),
                                  adet: adet.get(k.id) || 0 });
            }
        }
        for (const k of kartlar) {
            liste.push({
                url: urlNormalle(k.url),
                baslik: k.baslik || k.url,
                grupAdi: [g.baslik, ...(k.yol || [])].join(' › '),
                grupId: k.parentId || g.id,
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
        // Terim silindi - etiket listesi (yoksa bos ekran), kutu hala acik
        seciliEtiket = null;
        await etiketleriGoster(null);
        return;
    }
    etiketCizildi = false;

    document.body.classList.remove('aramaBekliyor');

    if (!tumKartlar) tumKartlar = await dizinOlustur();

    // Adli etiketin ADI da araniyor: "is" yazinca "İş" etiketli kartlar
    const kartEt = await kartEtiketleriAl();
    const tanimlar = await etiketTanimlariAl();
    const etiketAdlari = u => (kartEt[u] || []).map(id => tanimlar[id]?.ad || '').join(' ').toLocaleLowerCase('tr');
    const eslesen = tumKartlar.filter(k =>
        k.baslik.toLocaleLowerCase('tr').includes(t) ||
        k.url.toLocaleLowerCase('tr').includes(t) ||
        etiketAdlari(k.url).includes(t)
    );

    // GRUP ARAMASI: ayni kutudan, ayri kip yok. Eslesen gruplar
    // sonuclarin ustunde kucuk rozetler olarak cikiyor.
    //
    // SIRALAMA VE SINIR: kisa terimlerde (or. "de") 20 grup birden
    // esleserek serit karmasaya donuyordu. Adi terimle BASLAYANLAR
    // once, sonra kart sayisi cok olanlar; en fazla EN_COK_GRUP tane.
    const EN_COK_GRUP = 6;
    const eslesenGrup = tumGruplar
        .filter(g => (g.baslik || '').toLocaleLowerCase('tr').includes(t))
        .sort((a, b) => {
            const aBas = (a.baslik || '').toLocaleLowerCase('tr').startsWith(t) ? 1 : 0;
            const bBas = (b.baslik || '').toLocaleLowerCase('tr').startsWith(t) ? 1 : 0;
            if (aBas !== bBas) return bBas - aBas;
            return b.adet - a.adet;
        })
        .slice(0, EN_COK_GRUP);

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
            d.querySelector('span').textContent = `${g.gorunen || g.baslik} (${g.adet})`;
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
    const kartEt = await kartEtiketleriAl();
    const tanimlar = await etiketTanimlariAl();

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

        const noktalar = etiketNoktalari(kartEt[k.url], tanimlar);
        if (noktalar) gorsel.appendChild(noktalar);

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
            grubaGit(k.grupId, baglam, k.id);
        });
        a.appendChild(etiket);

        kap.appendChild(a);
    }

    // TEMBEL YUKLEME: eskiden eslesen tum kartlarin gorseli tek seferde
    // okunuyordu; genis aramalarda yuzlerce data URI bellege giriyordu.
    gorselleriGozle(kap.querySelectorAll('.kart[data-anahtar]'));
}
