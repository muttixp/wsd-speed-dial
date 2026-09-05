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

// WSD Speed Dial - yedekleme
//
// Yedege NE GIRER:
//   - Gruplar ve kartlar (yer imi agacindan)
//   - Kart gorselleri, notlar, renk etiketleri
//   - Grup ikonlari ve gruba ozel gorunumler
//   - Ayarlar (duvar kagidi dahil)
//
// Yedege NE GIRMEZ:
//   - Karsiligi kalmamis ("oksuz") gorsel/not/renk kayitlari.
//     Bu onemli: yedegi aldigin anda depoda oksuz kayit varsa yedege
//     gomuluyor ve HER geri yuklemede yeniden doguyor. Boyle bir dosya
//     bir kez 295 MB'a ulasmisti.
//   - Tek seferlik bayraklar (ornek: sikistirma surumu)

import { kokKlasoruAl, gruplariAl, kartlariAl, urlNormalle } from './yerimi.js';
import { c } from './dil.js';
import { ayarlariAl } from './ayar.js';

const SURUM = 1;

// Ayri depo anahtarlari - URL anahtarli gorsellerden farkli olarak
// bunlar tek parca nesneler
const NESNE_ANAHTARLARI = [
    'ayarlar', 'kartNotlari', 'kartRenkleri', 'kartSayaclari',
    'grupIkonlari', 'grupGorunumleri'
];

/* ============ Disa aktarma ============ */

export async function yedekOlustur() {
    const kok = await kokKlasoruAl();
    const gruplar = await gruplariAl();

    // 1) Yer imi agaci
    const disaGruplar = [];
    const yasayanUrlIer = new Set();

    for (const g of gruplar) {
        const kartlar = await kartlariAl(g.id);
        for (const k of kartlar) yasayanUrlIer.add(urlNormalle(k.url));

        disaGruplar.push({
            kokMu: g.id === kok,
            baslik: g.baslik,
            kartlar: kartlar.map(k => ({ baslik: k.baslik, url: urlNormalle(k.url) })),
            ikon: null,          // asagida dolduruluyor
            gorunum: null
        });
    }

    // 2) Depo
    const hepsi = await chrome.storage.local.get(null);

    // Grup ikonlari/gorunumleri id yerine SIRAYLA eslestiriliyor:
    // geri yuklerken yer imi id'leri farkli olacak.
    const ikonlar = hepsi.grupIkonlari || {};
    const gorunumler = hepsi.grupGorunumleri || {};
    gruplar.forEach((g, i) => {
        disaGruplar[i].ikon = ikonlar[g.id] || null;
        disaGruplar[i].gorunum = gorunumler[g.id] || null;
    });

    // 3) Gorseller - YALNIZCA yasayan kartlarinki
    const gorseller = {};
    let atlanan = 0;
    for (const [anahtar, deger] of Object.entries(hepsi)) {
        if (!urlAnahtariMi(anahtar)) continue;
        if (!yasayanUrlIer.has(anahtar)) { atlanan++; continue; }
        gorseller[anahtar] = deger;
    }

    // 4) Not ve renkler - yine yalnizca yasayanlar
    const notlar = suz(hepsi.kartNotlari, yasayanUrlIer);
    const renkler = suz(hepsi.kartRenkleri, yasayanUrlIer);
    const sayaclar = suz(hepsi.kartSayaclari, yasayanUrlIer);

    if (atlanan) console.log(`[WSD] yedege alinmayan oksuz gorsel: ${atlanan}`);

    return {
        wsd: {
            surum: SURUM,
            tarih: new Date().toISOString(),
            gruplar: disaGruplar,
            gorseller,
            notlar,
            renkler,
            sayaclar,
            ayarlar: await ayarlariAl()
        }
    };
}

function suz(nesne, yasayanlar) {
    const cikti = {};
    for (const [url, deger] of Object.entries(nesne || {})) {
        if (yasayanlar.has(url)) cikti[url] = deger;
    }
    return cikti;
}

function urlAnahtariMi(anahtar) {
    if (NESNE_ANAHTARLARI.includes(anahtar)) return false;
    return /^(https?|file|chrome|chrome-extension|edge|vivaldi):/i.test(anahtar);
}

/** Yedegi dosya olarak indirir. */
export async function yedegiIndir() {
    const veri = await yedekOlustur();
    const blob = new Blob([JSON.stringify(veri)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // WSD-27-8-2026-1457 : gun-ay-yil-saatdakika
    // Yerel saat kullaniyoruz; toISOString UTC verip gun kaydirabiliyor.
    const t = new Date();
    const iki = n => String(n).padStart(2, '0');
    const ad = `WSD-${t.getDate()}-${t.getMonth() + 1}-${t.getFullYear()}-` +
               `${iki(t.getHours())}${iki(t.getMinutes())}`;

    const dosyaAdi = ad + '.json';
    const a = document.createElement('a');
    a.href = url;
    a.download = dosyaAdi;
    a.click();

    setTimeout(() => URL.revokeObjectURL(url), 1000);

    const sayi = veri.wsd.gruplar.reduce((t, g) => t + g.kartlar.length, 0);

    // Son yedegin izi: veri kaybi uyarisinda "hangi dosyayi arayacaksin"
    // sorusunun cevabi. Tarayicinin indirme klasorunu bilemiyoruz ama
    // dosya adini soyleyebiliyoruz.
    try {
        await chrome.storage.local.set({
            sonYedekBilgi: {
                dosya: dosyaAdi,
                tarih: new Date().toISOString(),
                kart: sayi,
                grup: veri.wsd.gruplar.length,
                boyut: blob.size
            }
        });
    } catch (e) { /* onemli degil */ }

    return { grup: veri.wsd.gruplar.length, kart: sayi, boyut: blob.size, dosya: dosyaAdi };
}

/* ============ Ice aktarma ============ */

/**
 * @param {object} veri   yedek nesnesi
 * @param {boolean} temizle  true ise mevcut gruplar SILINIR, false ise eklenir
 */
/**
 * @param ilerleme  ({asama, yapilan, toplam, ad}) seklinde cagriliyor
 */
export async function yedegiYukle(veri, temizle = false, ilerleme = null) {
    // ESKI SURUM YEDEGI de kabul ediliyor: kullanicinin onceki eklentiden
    // birikmis verisi var ve bir tarayicidan digerine tasimasi gerekiyor.
    const y = bicimiCoz(veri);
    if (!y || !Array.isArray(y.gruplar)) throw new Error(c('gecersizYedekDosyasi'));

    const kok = await kokKlasoruAl();

    const toplamKart = y.gruplar.reduce((t, g) => t + g.kartlar.length, 0);
    const bildir = (asama, yapilan, ad) =>
        ilerleme && ilerleme({ asama, yapilan, toplam: toplamKart, ad });

    if (temizle) {
        bildir(c('temizlik'), 0, 'Mevcut veriler siliniyor');
        // Kok altindaki her seyi sil - kokun kendisi kaliyor
        const cocuklar = await chrome.bookmarks.getChildren(kok);
        for (const c of cocuklar) {
            await chrome.bookmarks.removeTree(c.id).catch(() => {});
        }
    }

    // GORSELLERI ONCE yaziyoruz.
    // Yer imleri once olusturulursa `bookmarks.onCreated` her kart icin
    // tetiklenip yakalama kuyruguna atiyor - yedekte gorsel zaten oldugu
    // halde. Bir ice aktarmada kuyruk 1000'in ustune cikmisti.
    if (y.gorseller && Object.keys(y.gorseller).length) {
        bildir(c('gorsellerBd'), 0, c('gorsellerYaziliyor'));
        await chrome.storage.local.set(y.gorseller);
    }

    const yeniIkonlar = {};
    const yeniGorunumler = {};
    let eklenen = 0;

    for (const g of y.gruplar) {
        // Kok grubun kartlari dogrudan koke, digerleri yeni klasore
        const hedefId = g.kokMu ? kok : (await chrome.bookmarks.create({
            parentId: kok, title: g.baslik
        })).id;

        if (g.ikon) yeniIkonlar[hedefId] = g.ikon;
        if (g.gorunum) yeniGorunumler[hedefId] = g.gorunum;

        for (const k of g.kartlar) {
            await chrome.bookmarks.create({
                parentId: hedefId, title: k.baslik, url: k.url
            }).catch(() => {});

            eklenen++;
            // Her kartta bildirmek arayuzu bogar - 5'te bir yeter
            if (eklenen % 5 === 0 || eklenen === toplamKart) {
                bildir(c('kartlar'), eklenen, g.baslik);
                // Tarayiciya cizim firsati ver, yoksa cubuk donuk kaliyor
                await new Promise(r => setTimeout(r, 0));
            }
        }
    }

    // Depoyu yaz - mevcutlarla birlestiriyoruz
    const mevcut = await chrome.storage.local.get(null);
    const yazilacak = {
        kartNotlari:   { ...(mevcut.kartNotlari || {}),   ...(y.notlar || {}) },
        kartRenkleri:  { ...(mevcut.kartRenkleri || {}),  ...(y.renkler || {}) },
        kartSayaclari: { ...(mevcut.kartSayaclari || {}), ...(y.sayaclar || {}) },
        grupIkonlari:  { ...(mevcut.grupIkonlari || {}),  ...yeniIkonlar },
        grupGorunumleri: { ...(mevcut.grupGorunumleri || {}), ...yeniGorunumler }
    };
    if (y.ayarlar) yazilacak.ayarlar = { ...(mevcut.ayarlar || {}), ...y.ayarlar };

    await chrome.storage.local.set(yazilacak);

    bildir(c('bitti'), toplamKart, '');
    return { grup: y.gruplar.length, kart: toplamKart };
}

/* ============ Bicim cozumleme ============ */

/**
 * Uc bicim destekleniyor:
 *   - kendi yedegimiz  { wsd: {...} }
 *   - onceki eklenti   { yasd: {...} }
 *   - FVD Speed Dial   { source: 'fvd-full', groups, dials }
 */
function bicimiCoz(veri) {
    if (!veri || typeof veri !== 'object') return null;
    if (veri.wsd) return veri.wsd;
    if (veri.yasd) return eskiyiCevir(veri.yasd);

    // FVD "full" bicimi: `source` alani olmayabiliyor, yapidan da taniyoruz
    const fvdMi = veri.source === 'fvd-full' ||
        (Array.isArray(veri.groups) && Array.isArray(veri.dials));
    if (fvdMi) return fvdCevir(veri);

    // FVD ORIJINAL bicimi: { db: {dials, groups}, prefs: {...} }
    if (veri.db && Array.isArray(veri.db.dials)) return fvdHamCevir(veri);

    return null;
}

/**
 * FVD Speed Dial'in KENDI disa aktarma bicimi.
 *
 * ONEMLI: `thumb` alani `filesystem:chrome-extension://...` seklinde,
 * yani FVD'nin kendi dosya deposuna bir BAGLANTI - gomulu goruntu degil.
 * Baska bir eklenti oraya erisemez, bu yuzden gorseller TASINAMIYOR;
 * kartlar ekleniyor ve gorselleri yeniden yakalaniyor.
 */
function fvdHamCevir(f) {
    const db = f.db || {};
    const gruplar = [];
    const grupIndeksi = new Map();

    gruplar.push({ kokMu: true, baslik: c('anaSayfa'), kartlar: [], ikon: null, gorunum: null });

    const sirali = (db.groups || []).slice()
        .sort((a, b) => (a.position || 0) - (b.position || 0));

    for (const g of sirali) {
        grupIndeksi.set(String(g.id), gruplar.length);
        gruplar.push({
            kokMu: false,
            baslik: g.name || 'Grup',
            kartlar: [],
            ikon: null,
            gorunum: null
        });
    }

    const sayaclar = {};
    const kartlar = (db.dials || []).slice()
        .sort((a, b) => (a.position || 0) - (b.position || 0));

    for (const d of kartlar) {
        if (!d.url) continue;
        const yer = grupIndeksi.has(String(d.group_id))
            ? grupIndeksi.get(String(d.group_id))
            : 0;
        const temiz = urlNormalle(d.url);

        gruplar[yer].kartlar.push({
            baslik: d.title || d.auto_title || d.url,
            url: temiz
        });

        if (d.clicks) sayaclar[temiz] = { adet: d.clicks, son: null };
    }

    return {
        surum: SURUM,
        fvdHam: true,
        gruplar,
        gorseller: {},          // filesystem: baglantilari tasinamiyor
        notlar: {},
        renkler: {},
        sayaclar,
        ayarlar: fvdAyarCevir(f.prefs)
    };
}

/** FVD tercihleri -> bizim ayarlar. Bilinmeyenler atlaniyor. */
function fvdAyarCevir(p) {
    if (!p) return null;
    const c = {};

    // FVD renkleri '#' olmadan tutuyor
    const renk = v => (typeof v === 'string' && /^[\da-f]{6}$/i.test(v)) ? '#' + v : null;

    const en = parseInt(p['sd.custom_dial_size_fancy'] || p['sd.custom_dial_size'], 10);
    if (en > 0) c.kartEn = Math.min(420, Math.max(140, en));

    const yazi = parseInt(p['sd.text.cell_title.size'], 10);
    if (yazi > 0) c.baslikBoyut = Math.min(20, Math.max(10, yazi));

    const zemin = renk(p['sd.background_color']);
    if (zemin && p['sd.background_color_enabled']) {
        c.zeminRengi = zemin;
        c.duvarAcik = false;
    }

    const metin = renk(p['sd.text.cell_title.color']);
    if (metin) c.metinRengi = metin;

    const grupZemin = renk(p['sd.text.group_bg.color']);
    if (grupZemin) { c.grupZeminRengi = grupZemin; c.grupZeminOpaklik = 100; }

    const grupAktif = renk(p['sd.text.group_active_bg.color']);
    if (grupAktif) { c.grupAktifRengi = grupAktif; c.grupAktifOpaklik = 100; }

    if (p['sd.default_open_in'] === 'new') c.kartAcilis = 'yeni';
    if (p['sd.show_icons_and_titles_above_dials'] === false) c.baslikGoster = true;

    return Object.keys(c).length ? c : null;
}

/**
 * FVD Speed Dial yedegini cevirir.
 *
 * Yapi: groups[{id, name, position}], dials[{url, title, group_id, position, thumb}]
 * `thumb` tam boy ekran goruntusu olabiliyor (birkac yuz KB); ON YUZ
 * bunlari kart olcusune indirip geri yaziyor - burada dokunmuyoruz,
 * cunku ice aktarma sirasinda yuzlerce gorseli islemek sayfayi kilitler.
 */
function fvdCevir(f) {
    const gruplar = [];
    const grupIndeksi = new Map();

    gruplar.push({ kokMu: true, baslik: c('anaSayfa'), kartlar: [], ikon: null, gorunum: null });

    const sirali = (f.groups || []).slice()
        .sort((a, b) => (a.position || 0) - (b.position || 0));

    for (const g of sirali) {
        grupIndeksi.set(String(g.id), gruplar.length);
        gruplar.push({
            kokMu: false,
            baslik: g.name || 'Grup',
            kartlar: [],
            ikon: null,
            gorunum: null
        });
    }

    const gorseller = {};
    const kartlar = (f.dials || []).slice()
        .sort((a, b) => (a.position || 0) - (b.position || 0));

    for (const d of kartlar) {
        if (!d.url) continue;
        const yer = grupIndeksi.has(String(d.group_id))
            ? grupIndeksi.get(String(d.group_id))
            : 0;                       // grubu bulunamayan kart koke
        const temiz = urlNormalle(d.url);
        gruplar[yer].kartlar.push({ baslik: d.title || d.url, url: temiz });

        if (d.thumb && typeof d.thumb === 'string' && d.thumb.startsWith('data:')) {
            gorseller[temiz] = { gorsel: d.thumb, adaylar: [d.thumb], secim: 0, zemin: null };
        }
    }

    return {
        surum: SURUM,
        fvdden: true,
        gruplar,
        gorseller,
        notlar: {},
        renkler: {},
        sayaclar: {},
        ayarlar: null              // FVD ayarlari bizimkilerle ortusmuyor
    };
}

/* ============ Eski surum yedegi ============ */

/**
 * Onceki eklentinin yedek bicimini bizimkine cevirir.
 *
 * Eski bicim DUZ listeler kullaniyor: butun kartlar tek dizide ve her biri
 * `folderid` ile grubuna baglaniyor. Bizde kartlar grubun icinde. Ayrica
 * gorseller `dials` dizisinde `{url: {thumbnails, thumbIndex, bgColor}}`
 * seklinde tutuluyor.
 */
function eskiyiCevir(e) {
    const gruplar = [];
    const grupIndeksi = new Map();     // eski folder id -> yeni dizi konumu

    // Kok grup her zaman ilk sirada
    gruplar.push({ kokMu: true, baslik: c('anaSayfa'), kartlar: [], ikon: null, gorunum: null });

    for (const f of (e.folders || []).slice().sort((a, b) => (a.index || 0) - (b.index || 0))) {
        grupIndeksi.set(String(f.id), gruplar.length);
        gruplar.push({
            kokMu: false,
            baslik: f.title || 'Grup',
            kartlar: [],
            ikon: (e.folderIcons || {})[f.id] || null,
            gorunum: gorunumCevir(e, f.id)
        });
    }

    for (const b of (e.bookmarks || []).slice().sort((a, b2) => (a.index || 0) - (b2.index || 0))) {
        if (!b.url) continue;
        // Bilinmeyen folderid -> koke koy, kart kaybolmasin
        const yer = grupIndeksi.has(String(b.folderid)) ? grupIndeksi.get(String(b.folderid)) : 0;
        gruplar[yer].kartlar.push({ baslik: b.title || b.url, url: urlNormalle(b.url) });
    }

    // Gorseller: dizi icinde tek anahtarli nesneler
    const gorseller = {};
    for (const kayit of (e.dials || [])) {
        for (const [url, deger] of Object.entries(kayit || {})) {
            const kucukResim = Array.isArray(deger.thumbnails)
                ? deger.thumbnails[deger.thumbIndex || 0] || deger.thumbnails[0]
                : null;
            if (!kucukResim) continue;
            gorseller[urlNormalle(url)] = {
                gorsel: kucukResim,
                adaylar: deger.thumbnails || [kucukResim],
                secim: 0,
                zemin: deger.bgColor || null
            };
        }
    }

    return {
        surum: SURUM,
        eskiden: true,
        gruplar,
        gorseller,
        notlar: anahtarlariNormalle(e.cardNotes),
        renkler: anahtarlariNormalle(e.cardColors),
        sayaclar: sayaclariCevir(e.cardClicks),
        ayarlar: ayarlariCevir(e.settings, e.wallpaperSrc)
    };
}

function gorunumCevir(e, id) {
    const mod = (e.folderDisplayModes || {})[id];
    const renk = (e.folderIconColors || {})[id];
    if (!mod && !renk) return null;
    const g = {};
    if (mod) g.gosterim = mod === 'icon' ? 'ikon' : (mod === 'text' ? 'yazi' : 'ikon_yazi');
    if (renk) g.renk = renk;
    return g;
}

function anahtarlariNormalle(nesne) {
    const c = {};
    for (const [url, deger] of Object.entries(nesne || {})) c[urlNormalle(url)] = deger;
    return c;
}

/** Eski sayac duz sayiydi; bizde { adet, son }. */
function sayaclariCevir(nesne) {
    const c = {};
    for (const [url, deger] of Object.entries(nesne || {})) {
        const adet = typeof deger === 'number' ? deger : (deger && deger.adet) || 0;
        if (adet) c[urlNormalle(url)] = { adet, son: null };
    }
    return c;
}

/** Eski ayar adlarini bizimkilere esler; bilinmeyenler atlanir. */
function ayarlariCevir(a, duvar) {
    if (!a) return duvar ? { duvarGorsel: duvar } : null;

    const esleme = {
        backgroundColor: 'zeminRengi',      textColor: 'metinRengi',
        textSize: 'baslikBoyut',            showTitles: 'baslikGoster',
        showCardActions: 'kartAraclariGoster',
        cardBorderWidth: 'kartCerceve',     cardBorderColor: 'kartCerceveRengi',
        cardBorderHoverColor: 'kartCerceveHoverRengi',
        cardCornerStyle: 'kartKose',        dialCustomWidth: 'kartEn',
        dialCustomGap: 'kartBoslukYatay',   dialCustomGapV: 'kartBoslukDikey',
        folderCornerStyle: 'grupKose',      folderActiveColor: 'grupAktifRengi',
        folderBgColor: 'grupZeminRengi',    folderBgOpacity: 'grupZeminOpaklik',
        screenshotWidth: 'yakalamaEn',      screenshotHeight: 'yakalamaBoy',
        screenshotScrollY: 'yakalamaKaydirma',
        screenshotFormat: 'gorselBicimi',   screenshotQuality: 'jpegKalitesi',
        hslColorize: 'colorize',            hslHue: 'ton',
        hslSat: 'doygunluk',                hslLight: 'aciklik',
        duotoneDark: 'golgeRengi',          duotoneLight: 'isikRengi',
        duotoneStrength: 'siddet',          rememberFolder: 'grubuHatirla',
        showHome: 'anaSayfaGoster',         autoBackup: 'otomatikYedek',
        maxCols: 'maxSutun',
    };

    const c = {};
    for (const [eski, yeni] of Object.entries(esleme)) {
        if (a[eski] !== undefined) c[yeni] = a[eski];
    }

    // Deger bicimi degisenler
    if (a.dialRatio) {
        c.kartOrani = { ratio43: 'o43', ratio1610: 'o1610', ratio169: 'o169' }[a.dialRatio] || 'o1610';
    }
    if (a.folderDisplayMode) {
        c.grupGosterim = a.folderDisplayMode === 'icon' ? 'ikon'
            : (a.folderDisplayMode === 'text' ? 'yazi' : 'ikon_yazi');
    }
    if (a.bgFilterMode) {
        c.filtreYontemi = a.bgFilterMode === 'duotone' ? 'iki' : 'ton';
    }
    if (a.linkTarget) {
        c.kartAcilis = a.linkTarget === '_blank' ? 'yeni' : 'ayni';
    }
    if (duvar) c.duvarGorsel = duvar;

    return c;
}

/* ============ Oksuz veri temizligi ============ */

/**
 * Yer imi karsiligi kalmamis kayitlari siler.
 * Grup silindiginde cagriliyor: silme sirasinda kart basina temizlik
 * yapmak yavas, tek seferde supurmek hizli.
 */
export async function oksuzleriTemizle() {
    try {
        // YALNIZCA WSD agacindaki kartlar "yasiyor" sayiliyor.
        // Baska klasorlerdeki ayni adresler bizim depomuzu ilgilendirmiyor;
        // once tum agaca bakiyordum ve 182 gereksiz gorsel temizlenmiyordu.
        const { wsdUrlleri } = await import('./depo.js');
        const yasayan = await wsdUrlleri();

        const hepsi = await chrome.storage.local.get(null);

        // EMNIYET FRENI: depoda URL kaydi var ama hic yasayan url yoksa
        // agac okunamamis demektir. Silme, cik.
        const depodaki = Object.keys(hepsi).filter(urlAnahtariMi).length;
        if (yasayan.size === 0 && depodaki > 0) {
            console.log('[WSD] temizlik iptal: yer imi ağacı okunamadı');
            return { gorsel: 0, kayit: 0, bayt: 0, iptal: true };
        }

        const yasiyorMu = u => yasayan.has(u) || yasayan.has(urlNormalle(u));

        const silinecek = [];
        let bayt = 0;
        for (const anahtar of Object.keys(hepsi)) {
            if (!urlAnahtariMi(anahtar) || yasiyorMu(anahtar)) continue;
            silinecek.push(anahtar);
            try { bayt += JSON.stringify(hepsi[anahtar] ?? '').length; } catch (e) { /* atla */ }
        }

        const guncelle = {};
        for (const ad of ['kartNotlari', 'kartRenkleri', 'kartSayaclari']) {
            const nesne = hepsi[ad];
            if (!nesne || typeof nesne !== 'object') continue;
            const kalan = {};
            let atilan = 0;
            for (const [url, deger] of Object.entries(nesne)) {
                if (yasiyorMu(url)) kalan[url] = deger;
                else atilan++;
            }
            if (atilan) guncelle[ad] = kalan;
        }

        if (silinecek.length) await chrome.storage.local.remove(silinecek);
        if (Object.keys(guncelle).length) await chrome.storage.local.set(guncelle);

        return { gorsel: silinecek.length, kayit: Object.keys(guncelle).length, bayt };
    } catch (e) {
        console.log('[WSD] temizlik hatası:', e);
        return { gorsel: 0, kayit: 0, bayt: 0, hata: true };
    }
}


/* ============ Otomatik yedek ============ */

const SON_YEDEK = 'sonOtomatikYedek';
const SON_ACIL = 'sonAcilYedek';

/**
 * Gunde bir kez yedek dosyasi indirir.
 *
 * Sayfa acilisinda calisiyor: servis iscisinde `document` olmadigi icin
 * indirme oradan tetiklenemiyor. Kullanici gun icinde yeni sekmeyi en az
 * bir kez aciyor - bu yeterli.
 */
export async function otomatikYedekDene() {
    try {
        const { ayarlariAl } = await import('./ayar.js');
        const { depoDurumu, UYARI_ESIGI } = await import('./depo.js');
        const ayar = await ayarlariAl();

        const d = await chrome.storage.local.get([SON_YEDEK, SON_ACIL]);
        const bugun = new Date().toDateString();

        // 1) ALAN AZALIYORSA yedegi KENDILIGINDEN INDIRMIYORUZ.
        //
        // Tarayici "her indirmede sor" ayarindaysa pencere aciliyor ve
        // kullanici basinda degilse orada oylece kaliyor - yedek de
        // alinmamis oluyor. Bunun yerine KALICI bir uyari birakiyoruz:
        // Bakim bolumunde duruyor, kacirilmasi zor.
        const durum = await depoDurumu();
        if (durum.oran != null && durum.oran >= UYARI_ESIGI) {
            return { acil: true, oran: durum.oran, indirilmedi: true };
        }

        // 2) Gunluk otomatik yedek - ayara bagli
        if (ayar.otomatikYedek !== true) return null;

        const son = d[SON_YEDEK] ? new Date(d[SON_YEDEK]) : null;
        if (son && son.toDateString() === bugun) return null;

        await yedegiIndir();
        await chrome.storage.local.set({ [SON_YEDEK]: new Date().toISOString() });
        console.log('[WSD] otomatik yedek alindi');
        return { acil: false };
    } catch (e) {
        console.log('[WSD] otomatik yedek alinamadi:', e);
        return null;
    }
}


/* ============ Her seyi sil ============ */

/**
 * WSD'ye ait TUM veriyi siler: gruplar, kartlar, gorseller, notlar,
 * renkler, sayaclar, cop kutusu, ayarlar.
 *
 * Kok klasorun KENDISI kaliyor - silinirse yer imi cubugunda yeniden
 * olusturuluyor ve kullanicinin klasor duzeni bozulabiliyor.
 *
 * Tarayicinin DIGER yer imlerine dokunulmuyor: yalnizca WSD kokunun
 * altindakiler siliniyor.
 */
export async function herSeyiSil(ilerleme = null) {
    const kok = await kokKlasoruAl();
    let silinenKart = 0;
    let silinenGrup = 0;

    const cocuklar = await chrome.bookmarks.getChildren(kok);

    // Toplami ONCE hesapliyoruz: cubuk yuzde gosterebilsin.
    // Bunu atlarsak ekran uzun sure sessiz kaliyor ve kullanici
    // kilitlendi saniyor.
    let toplam = 0;
    for (const c of cocuklar) {
        if (c.url) toplam++;
        else {
            try {
                const icerik = await chrome.bookmarks.getChildren(c.id);
                toplam += icerik.filter(x => x.url).length;
            } catch (e) { /* atla */ }
        }
    }

    const bildir = (yapilan, ad) =>
        ilerleme && ilerleme({ asama: 'siliniyor', yapilan, toplam, ad });

    bildir(0, '');

    // 1) Yer imleri
    for (const c of cocuklar) {
        try {
            if (c.url) {
                await chrome.bookmarks.remove(c.id);
                silinenKart++;
            } else {
                const icerik = await chrome.bookmarks.getChildren(c.id);
                const adet = icerik.filter(x => x.url).length;
                await chrome.bookmarks.removeTree(c.id);
                silinenKart += adet;
                silinenGrup++;
            }

            bildir(silinenKart, c.title || '');
            // Tarayiciya cizim firsati - yoksa cubuk donuk kaliyor
            await new Promise(r => setTimeout(r, 0));
        } catch (e) { /* zaten silinmis */ }
    }

    // 2) Depo - YALNIZCA bizim anahtarlarimiz.
    // `storage.local.clear()` KULLANMIYORUZ: baska bir seyin verisi
    // ayni alanda olabilir ve onu silmek bize dusmez.
    if (ilerleme) ilerleme({ asama: 'depo', yapilan: toplam, toplam, ad: '' });

    const hepsi = await chrome.storage.local.get(null);
    const silinecek = Object.keys(hepsi).filter(k =>
        urlAnahtariMi(k) || NESNE_ANAHTARLARI.includes(k) ||
        ['copKutusu', 'yakalamaKuyrugu', 'sonOtomatikYedek', 'sonAcilYedek', 'depoIzi', 'sonYedekBilgi', 'atlananOnaylar'].includes(k)
    );
    if (silinecek.length) await chrome.storage.local.remove(silinecek);

    try { localStorage.removeItem('wsdSonGrup'); } catch (e) { /* onemli degil */ }

    return { kart: silinenKart, grup: silinenGrup, kayit: silinecek.length };
}


/** Son alinan yedegin bilgisi (dosya adi, tarih, boyut). */
export async function sonYedekBilgisi() {
    try {
        const d = await chrome.storage.local.get('sonYedekBilgi');
        return d.sonYedekBilgi || null;
    } catch (e) {
        return null;
    }
}
