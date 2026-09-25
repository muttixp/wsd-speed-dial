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

/* ============ Ortak agac yapisi ============
 *
 * Iki kaynak da once AGACA ceviriliyor: { ad, baglantilar, cocuklar }.
 * Liste bu agactan iki bicimde uretiliyor:
 *   - ALT KLASORLERI KORU (varsayilan, 1.5.0): her ust klasor bir grup,
 *     icindeki klasorler o grubun alt klasorleri olur.
 *   - DUZ: eski davranis - baglanti iceren her klasor ayri grup.
 * Ornek: "elfinder > template, config, js" korumada TEK grup ve uc alt
 * klasor; duz kipte dort ayri grup.
 */
let agacKoklari = [];      // [{ ad, baglantilar, cocuklar }]
let altlariKoru = true;

function dugumToplami(d) {
    return d.baglantilar.length + d.cocuklar.reduce((t, x) => t + dugumToplami(x), 0);
}

/** Dugumun altindaki klasorler, gruba gore yollariyla. */
function altlariTopla(d, yol = [], cikti = []) {
    for (const x of d.cocuklar) {
        const altYol = [...yol, x.ad];
        cikti.push({ yol: altYol, baglantilar: x.baglantilar });
        altlariTopla(x, altYol, cikti);
    }
    return cikti;
}

function listeyiUret() {
    const cikti = [];
    if (altlariKoru) {
        for (const kok of agacKoklari) {
            // Kokun (yer imi cubugu vb.) dogrudan baglantilari kendi grubunda
            if (kok.baglantilar.length) {
                cikti.push({ ad: kok.ad, baglantilar: kok.baglantilar, altlar: [], toplam: kok.baglantilar.length });
            }
            for (const d of kok.cocuklar) {
                const toplam = dugumToplami(d);
                if (!toplam) continue;
                cikti.push({ ad: d.ad, baglantilar: d.baglantilar, altlar: altlariTopla(d), toplam });
            }
        }
    } else {
        const gez = d => {
            if (d.baglantilar.length) {
                cikti.push({ ad: d.ad, baglantilar: d.baglantilar, altlar: [], toplam: d.baglantilar.length });
            }
            d.cocuklar.forEach(gez);
        };
        agacKoklari.forEach(gez);
    }
    return cikti;
}

/* ============ Kaynak 1: tarayici yer imleri ============ */

export async function tarayiciAgaciniAl() {
    const kok = await kokKlasoruAl();
    const agac = await chrome.bookmarks.getTree();

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

    const cevir = dugum => {
        // Kimlik listesine ek olarak ADA da bakiyoruz: kok kimligi
        // bayatlamis olsa bile WSD klasoru listeye girmesin
        if (bizim.has(dugum.id) || dugum.title === KOK_ADI) return null;
        const d = { ad: dugum.title || '', baglantilar: [], cocuklar: [] };
        for (const c of dugum.children || []) {
            if (c.url) d.baglantilar.push({ url: c.url, baslik: c.title || c.url });
            else {
                const alt = cevir(c);
                if (alt) d.cocuklar.push(alt);
            }
        }
        return d;
    };

    // YALNIZCA kalici kokler: 1 = yer imi cubugu, 2 = diger yer imleri,
    // 3 = mobil. Vivaldi'nin yer imi COP KUTUSU (id 4) da normal bir
    // klasor gibi gorunuyor; silinen WSD gruplari oraya dustugu icin
    // "sildiklerimi hala goruyor" durumu olusuyordu.
    const KALICI_KOKLER = new Set(['1', '2', '3']);
    const koklar = [];
    for (const kokDugum of agac) {
        for (const ust of kokDugum.children || []) {
            if (!KALICI_KOKLER.has(String(ust.id))) continue;
            const d = cevir(ust);
            if (d) koklar.push(d);
        }
    }
    return koklar;
}

/* ============ Kaynak 2: Netscape HTML ============ */

/**
 * Tarayicilarin "yer imlerini disa aktar" ciktisi. Yapi ic ice <DL>
 * bloklari; klasor adi <H3>, baglantilar <A HREF>.
 *
 * Yer imi cubugu / diger yer imleri gibi SISTEM klasorleri (H3'te
 * PERSONAL_TOOLBAR_FOLDER / UNFILED_BOOKMARKS_FOLDER) kok sayiliyor:
 * gruplar onlarin ICINDEKI klasorlerden olusuyor.
 */
export function htmlAgaciniCoz(metin) {
    const belge = new DOMParser().parseFromString(metin, 'text/html');

    const cevir = (dl, ad) => {
        const d = { ad, baglantilar: [], cocuklar: [], sistem: false };
        for (const dt of dl.children) {
            const a = dt.querySelector(':scope > a');
            if (a && a.href) d.baglantilar.push({ url: a.href, baslik: (a.textContent || '').trim() || a.href });
            const h3 = dt.querySelector(':scope > h3');
            const altDl = dt.querySelector(':scope > dl');
            if (h3 && altDl) {
                const alt = cevir(altDl, h3.textContent.trim());
                alt.sistem = h3.hasAttribute('personal_toolbar_folder') ||
                             h3.hasAttribute('unfiled_bookmarks_folder');
                d.cocuklar.push(alt);
            }
        }
        return d;
    };

    const kokDl = belge.querySelector('dl');
    if (!kokDl) return [];
    const kok = cevir(kokDl, c('yerImleri'));

    // Sistem klasorleri kendi basina kok; digerleri dis kokte kaliyor
    const koklar = [];
    const sistemler = kok.cocuklar.filter(x => x.sistem);
    kok.cocuklar = kok.cocuklar.filter(x => !x.sistem);
    if (kok.baglantilar.length || kok.cocuklar.length) koklar.push(kok);
    koklar.push(...sistemler);
    return koklar;
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
    const { iceAktarimBaslat, iceAktarimBitir } = await import('./iceaktarim.js');
    const urller = [];
    for (const k of secilenler) {
        for (const b of k.baglantilar) urller.push(b.url);
        for (const a of k.altlar || []) for (const b of a.baglantilar) urller.push(b.url);
    }
    await iceAktarimBaslat();
    try {
        return await aktarIc(secilenler);
    } finally {
        await iceAktarimBitir(urller);
    }
}

async function aktarIc(secilenler) {
    const mevcut = new Map();
    for (const g of await gruplariAl()) {
        mevcut.set((g.baslik || '').trim().toLocaleLowerCase('tr'), g.id);
    }

    let eklenen = 0, atlanan = 0, grupSayisi = 0;
    const anahtar = ad => String(ad || '').trim().toLocaleLowerCase('tr');

    // Klasordeki mevcut adresler - tekrar eklememek icin
    const adresler = new Map();
    const adresleriAl = async id => {
        if (!adresler.has(id)) {
            const kume = new Set();
            try { for (const kart of await kartlariAl(id)) kume.add(urlNormalle(kart.url)); }
            catch (e) { /* okunamadi */ }
            adresler.set(id, kume);
        }
        return adresler.get(id);
    };

    // Alt klasor zinciri: ayni adli alt klasor varsa ICINE ekle
    const klasorBul = async (ustId, yol) => {
        let id = ustId;
        for (const ad of yol) {
            const cocuklar = await chrome.bookmarks.getChildren(id);
            const var_ = cocuklar.find(x => !x.url && anahtar(x.title) === anahtar(ad));
            id = var_ ? var_.id : (await chrome.bookmarks.create({ parentId: id, title: ad || '—' })).id;
        }
        return id;
    };

    const ekle = async (klasorId, baglantilar) => {
        const varolan = await adresleriAl(klasorId);
        for (const b of baglantilar) {
            const a = urlNormalle(b.url);
            if (varolan.has(a)) { atlanan++; continue; }
            varolan.add(a);
            try {
                await kartEkle(klasorId, b.baslik, b.url);
                eklenen++;
            } catch (e) { /* gecersiz adres */ }
        }
    };

    for (const k of secilenler) {
        const grupAdi = grupAdiniSadelestir(k.ad);
        let grupId = mevcut.get(anahtar(grupAdi));
        if (!grupId) {
            grupId = (await grupEkle(grupAdi)).id;
            mevcut.set(anahtar(grupAdi), grupId);
            grupSayisi++;
        }

        await ekle(grupId, k.baglantilar);
        for (const alt of k.altlar || []) {
            await ekle(await klasorBul(grupId, alt.yol), alt.baglantilar);
        }
    }

    return { eklenen, atlanan, grupSayisi };
}

/* ============ Pencere ============ */

export async function ictarPenceresiniAc(kaynak = 'tarayici', dosyaMetni = null) {
    agacKoklari = kaynak === 'html'
        ? htmlAgaciniCoz(dosyaMetni)
        : await tarayiciAgaciniAl();
    const koru = el('ictarKoru');
    if (koru) koru.checked = altlariKoru;
    await listeyiCiz();
    el('ictarPencere').hidden = false;
}

async function listeyiCiz() {
    klasorler = listeyiUret();

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
        adet.textContent = k.toplam;
        // Alt klasor sayisi ipucunda ve ad yaninda
        if (k.altlar && k.altlar.length) {
            const alt = document.createElement('span');
            alt.className = 'ictarVar';
            alt.textContent = c('nAltKlasor', k.altlar.length);
            ad.appendChild(alt);
        }

        satir.append(kutu, ad, adet);
        liste.appendChild(satir);
    });

    el('ictarOzet').textContent = c('nKlasorNBaglanti',
        klasorler.length, klasorler.reduce((t, k) => t + k.toplam, 0));
}

export function ictarPenceresiniKur() {
    el('ictarKoru')?.addEventListener('change', e => {
        altlariKoru = e.target.checked;
        listeyiCiz();
    });
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
            bildir('✓ ' + c('iceAktarmaTamamlandi') + ': ' + c('nKartEklendi', s.eklenen) +
                   (s.grupSayisi ? ` · ${c('nYeniGrup', s.grupSayisi)}` : '') +
                   (s.atlanan ? ` · ${c('nKartZatenVardi', s.atlanan)}` : ''), { sure: 8000 });
        } catch (e) {
            console.log('[WSD] ice aktarma hatasi:', e);
            bildir(c('ictarBasarisiz'));
        } finally {
            btn.disabled = false;
        }
    });
}
