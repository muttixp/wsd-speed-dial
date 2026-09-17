/*
 * WSD Speed Dial - yer imi ice aktarma
 * Copyright (C) 2026 WEBTE Yazilim
 *
 * Iki kaynak:
 *   1) Tarayicinin KENDI yer imi agaci (chrome.bookmarks)
 *   2) Baska tarayicidan disa aktarilmis Netscape HTML dosyasi
 *
 * Ikisi de ayni ara bicime cevriliyor: { ad, baglantilar[] } klasor
 * listesi. Kullanici hangi klasorleri alacagini seciyor, secilen her
 * klasor bir GRUP oluyor.
 *
 * WSD'nin kendi kok klasoru listede GOSTERILMIYOR: kendi kartlarimizi
 * kendimize kopyalamanin anlami yok.
 */

import { kokKlasoruAl, kartlariAl, kartEkle, grupEkle, gruplariAl, urlNormalle, KOK_ADI }
    from './yerimi.js';
import { bildir } from './arayuz.js';
import { grubuAc, aktifGrup, arayuzuKur } from './cizim.js';
import { c } from './dil.js';

const el = id => document.getElementById(id);

let klasorler = [];        // { ad, baglantilar: [{url, baslik}] }

/* ============ Kaynak 1: tarayici yer imleri ============ */

export async function tarayiciKlasorleriniAl() {
    const kok = await kokKlasoruAl();
    const agac = await chrome.bookmarks.getTree();
    const cikti = [];

    // WSD'nin KENDI agacindaki her dugum haric: kok klasor, gruplari ve
    // onlarin alt klasorleri. Yalnizca kok kimligine bakinca gruplar
    // baska yoldan listeye girip "kendimizi ice aktar" gibi duruyordu.
    const bizim = new Set([kok]);
    try {
        const [altAgac] = await chrome.bookmarks.getSubTree(kok);
        const isaretle = d => {
            bizim.add(d.id);
            for (const c of d.children || []) if (!c.url) isaretle(c);
        };
        isaretle(altAgac);
    } catch (e) { /* kok okunamadi - en azindan kendisi haric */ }

    const gez = dugum => {
        // Kimlik listesine ek olarak ADA da bakiyoruz: kok kimligi
        // bayatlamis olsa bile WSD klasoru listeye girmesin
        if (bizim.has(dugum.id) || dugum.title === KOK_ADI) return;
        const baglantilar = [];
        for (const c of dugum.children || []) {
            if (c.url) baglantilar.push({ url: c.url, baslik: c.title || c.url });
        }
        // KLASOR ADI: yalnizca klasorun kendi adi. Once tam yol
        // ("Yer imleri / Sys") kullaniliyordu ve grup adlari da oyle
        // olusuyordu; istenen sadece "Sys".
        if (baglantilar.length) cikti.push({ ad: dugum.title || '', baglantilar });

        for (const c of dugum.children || []) {
            if (!c.url) gez(c);
        }
    };

    // YALNIZCA kalici kokler: 1 = yer imi cubugu, 2 = diger yer imleri,
    // 3 = mobil. Vivaldi'nin yer imi COP KUTUSU (id 4) da normal bir
    // klasor gibi gorunuyor; silinen WSD gruplari oraya dustugu icin
    // "sildiklerimi hala goruyor" durumu olusuyordu.
    const KALICI_KOKLER = new Set(['1', '2', '3']);
    for (const kokDugum of agac) {
        for (const ust of kokDugum.children || []) {
            if (!KALICI_KOKLER.has(String(ust.id))) continue;
            gez(ust);
        }
    }
    return cikti;
}

/* ============ Kaynak 2: Netscape HTML ============ */

/**
 * Tarayicilarin "yer imlerini disa aktar" ciktisi. Yapi ic ice <DL>
 * bloklari; klasor adi <H3>, baglantilar <A HREF>. Girintiyi takip
 * etmek yerine <H3> gorunce yola ekliyor, </DL> gorunce cikariyoruz.
 */
export function htmlKlasorleriniCoz(metin) {
    const belge = new DOMParser().parseFromString(metin, 'text/html');
    const cikti = [];

    const gez = (dl, yol) => {
        const baglantilar = [];
        for (const dt of dl.children) {
            const a = dt.querySelector(':scope > a');
            if (a && a.href) baglantilar.push({ url: a.href, baslik: (a.textContent || '').trim() || a.href });
        }
        if (baglantilar.length) cikti.push({ ad: yol || c('yerImleri'), baglantilar });

        for (const dt of dl.children) {
            const h3 = dt.querySelector(':scope > h3');
            const altDl = dt.querySelector(':scope > dl');
            if (h3 && altDl) gez(altDl, h3.textContent.trim());
        }
    };

    const kokDl = belge.querySelector('dl');
    if (kokDl) gez(kokDl, '');
    return cikti;
}

/* ============ Ortak: aktarma ============ */

/**
 * Grup adini sadelestirir.
 *
 * Kaynakta ad "Yer imleri / Sys" gibi yol seklinde gelebiliyor (eski
 * surumun urettigi gruplar, HTML dosyalarindaki egik cizgili klasor
 * adlari, ic ice yapilar). Grup adi yalnizca SON parca olmali; yoksa
 * kadranda yaniltici, uzun adlar olusuyor.
 */
function grupAdiniSadelestir(ad) {
    const sade = String(ad || '')
        .split('/').pop()          // son parca
        .replace(/\s+/g, ' ')
        .trim();
    return sade || c('yerImleri');
}

/**
 * Secilen klasorleri gruba cevirir.
 * Ayni adli grup varsa ICINE ekliyor; o grupta bulunan adresi atliyor.
 */
async function aktar(secilenler) {
    const mevcut = new Map();
    for (const g of await gruplariAl()) {
        mevcut.set((g.baslik || '').trim().toLocaleLowerCase('tr'), g.id);
    }

    let eklenen = 0, atlanan = 0, grupSayisi = 0;

    for (const k of secilenler) {
        const grupAdi = grupAdiniSadelestir(k.ad);
        const anahtar = grupAdi.toLocaleLowerCase('tr');
        let grupId = mevcut.get(anahtar);
        if (!grupId) {
            grupId = (await grupEkle(grupAdi)).id;
            mevcut.set(anahtar, grupId);
            grupSayisi++;
        }

        const varolan = new Set();
        try {
            for (const kart of await kartlariAl(grupId)) varolan.add(urlNormalle(kart.url));
        } catch (e) { /* okunamadi */ }

        for (const b of k.baglantilar) {
            const a = urlNormalle(b.url);
            if (varolan.has(a)) { atlanan++; continue; }
            varolan.add(a);
            try {
                await kartEkle(grupId, b.baslik, b.url);
                eklenen++;
            } catch (e) { /* gecersiz adres */ }
        }
    }

    return { eklenen, atlanan, grupSayisi };
}

/* ============ Pencere ============ */

export async function ictarPenceresiniAc(kaynak = 'tarayici', dosyaMetni = null) {
    klasorler = kaynak === 'html'
        ? htmlKlasorleriniCoz(dosyaMetni)
        : await tarayiciKlasorleriniAl();

    // Adi mevcut bir grupla ayni olan klasorleri isaretliyoruz: aktarim
    // onun ICINE ekleyecek, yeni grup acmayacak
    const mevcutAdlar = new Set();
    try {
        for (const g of await gruplariAl()) {
            mevcutAdlar.add((g.baslik || '').trim().toLocaleLowerCase('tr'));
        }
    } catch (e) { /* onemli degil */ }

    const liste = el('ictarListe');
    const pencere = el('ictarPencere');
    if (!liste || !pencere) return;

    liste.textContent = '';

    if (!klasorler.length) {
        const bos = document.createElement('p');
        bos.className = 'kucukBilgi';
        bos.textContent = c('ictarKlasorYok');
        liste.appendChild(bos);
    }

    klasorler.forEach((k, i) => {
        const satir = document.createElement('label');
        satir.className = 'ictarSatir';

        const kutu = document.createElement('input');
        kutu.type = 'checkbox';
        kutu.dataset.sira = i;
        kutu.checked = true;

        const ad = document.createElement('span');
        ad.className = 'ictarAd';
        ad.textContent = grupAdiniSadelestir(k.ad);

        // Son parca grup adi olacak - mevcut grupla ayniysa belirt
        const grupAdi = grupAdiniSadelestir(k.ad).toLocaleLowerCase('tr');
        if (mevcutAdlar.has(grupAdi)) {
            const uyari = document.createElement('span');
            uyari.className = 'ictarVar';
            uyari.textContent = c('grubaEklenecek');
            ad.appendChild(uyari);
        }

        const adet = document.createElement('span');
        adet.className = 'ictarAdet';
        adet.textContent = k.baglantilar.length;

        satir.append(kutu, ad, adet);
        liste.appendChild(satir);
    });

    el('ictarOzet').textContent = c('nKlasorNBaglanti',
        klasorler.length, klasorler.reduce((t, k) => t + k.baglantilar.length, 0));
    pencere.hidden = false;
}

export function ictarPenceresiniKur() {
    el('ictarKapat')?.addEventListener('click', () => { el('ictarPencere').hidden = true; });

    el('ictarHepsi')?.addEventListener('click', () => {
        const kutular = el('ictarListe').querySelectorAll('input[type="checkbox"]');
        const hepsiSecili = [...kutular].every(k => k.checked);
        kutular.forEach(k => { k.checked = !hepsiSecili; });
    });

    el('ictarAktar')?.addEventListener('click', async () => {
        const secili = [...el('ictarListe').querySelectorAll('input:checked')]
            .map(k => klasorler[+k.dataset.sira])
            .filter(Boolean);
        if (!secili.length) return bildir(c('ictarSecimYok'));

        const btn = el('ictarAktar');
        btn.disabled = true;
        try {
            const s = await aktar(secili);
            el('ictarPencere').hidden = true;
            await arayuzuKur();
            await grubuAc(aktifGrup());
            bildir(`${c('nKartEklendi', s.eklenen)}` +
                   (s.atlanan ? ` · ${c('nKartZatenVardi', s.atlanan)}` : ''));
        } catch (e) {
            console.log('[WSD] ice aktarma hatasi:', e);
            bildir(c('ictarBasarisiz'));
        } finally {
            btn.disabled = false;
        }
    });
}
