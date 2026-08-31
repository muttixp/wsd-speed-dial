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

// WSD Speed Dial - yer imi katmani
//
// Veri modeli:
//   "WSD" adli kok klasor  -> tum icerik burada
//   kok altindaki klasorler -> gruplar (sekmeler)
//   kok altindaki yer imleri -> "Ana Sayfa" grubunun kartlari
//
// Karar: veriyi ayri bir veritabaninda DEGIL, tarayicinin kendi yer imlerinde
// tutuyoruz. Boylece tarayici senkronu bedava geliyor, kullanici verisi bize
// kilitlenmiyor ve tarayicinin kendi yedekleme araclariyla da disari alinabiliyor.

export const KOK_ADI = 'WSD';

let kokId = null;

/** Kok klasoru bulur, yoksa olusturur. Sonucu onbellege alir. */
export async function kokKlasoruAl() {
    if (kokId) return kokId;

    // Once "Diger yer imleri" altinda ariyoruz
    const agac = await chrome.bookmarks.getTree();
    const bulunan = kokAra(agac, KOK_ADI);
    if (bulunan) {
        kokId = bulunan;
        return kokId;
    }

    // Yoksa olustur. parentId vermezsek tarayici varsayilan klasore koyar;
    // "other" (Diger yer imleri) daha uygun cunku yer imi cubugunu kirletmiyor.
    const digerId = digerYerImleriId(agac);
    const yeni = await chrome.bookmarks.create({
        parentId: digerId,
        title: KOK_ADI
    });
    kokId = yeni.id;
    return kokId;
}

function kokAra(dugumler, ad) {
    for (const d of dugumler) {
        if (!d.url && d.title === ad && d.parentId) return d.id;
        if (d.children) {
            const alt = kokAra(d.children, ad);
            if (alt) return alt;
        }
    }
    return null;
}

function digerYerImleriId(agac) {
    // Tarayicilar arasi id sabit degil; baslikla degil YAPIYLA buluyoruz:
    // kokun ikinci cocugu genelde "Diger yer imleri".
    const kok = agac[0];
    if (!kok || !kok.children || !kok.children.length) return undefined;
    return (kok.children[1] || kok.children[0]).id;
}

/**
 * Gruplari dondurur. Ilk sirada her zaman sanal "Ana Sayfa" grubu var:
 * kokun dogrudan altindaki kartlar orada gosteriliyor.
 */
export async function gruplariAl() {
    const kok = await kokKlasoruAl();
    const cocuklar = await chrome.bookmarks.getChildren(kok);
    const gruplar = [{ id: kok, baslik: chrome.i18n.getMessage('anaSayfa') || 'Ana Sayfa', kokMu: true }];
    for (const c of cocuklar) {
        if (!c.url) gruplar.push({ id: c.id, baslik: c.title, kokMu: false });
    }
    return gruplar;
}

/**
 * Kullaniciya GOSTERILECEK gruplar.
 *
 * Ana Sayfa gizliyken bile kokte kart varsa onu listede tutuyoruz:
 * aksi halde o kartlara ulasilamiyor ve kullanici kayboldu saniyor.
 */
export async function gorunurGruplariAl() {
    const gruplar = await gruplariAl();

    // Ayari DOGRUDAN depodan okuyoruz.
    // Dinamik `import()` SERVIS ISCISINDE YASAK (HTML spesifikasyonu),
    // ayar.js'i statik import etmek de dongu yaratiyor - bu yuzden
    // tek anahtari elle okuyoruz.
    let anaSayfaGoster = true;
    try {
        const d = await chrome.storage.local.get('ayarlar');
        if (d.ayarlar && d.ayarlar.anaSayfaGoster === false) anaSayfaGoster = false;
    } catch (e) { /* okunamadi - varsayilan: goster */ }

    if (anaSayfaGoster) return gruplar;

    // Kok grupta kart olsa da gizliyoruz: kullanici acikca istedi.
    // Kartlar kaybolmuyor, aramadan ulasilabiliyor ve ayar geri
    // acilinca yerlerinde duruyorlar.
    return gruplar.slice(1);
}

/** Bir grubun kartlarini dondurur (sadece yer imleri, alt klasorler haric). */
export async function kartlariAl(grupId) {
    const cocuklar = await chrome.bookmarks.getChildren(grupId);
    return cocuklar
        .filter(c => c.url)
        .map(c => ({ id: c.id, baslik: c.title, url: c.url, sira: c.index }));
}

/** Kart sayilari - grup sekmelerinde "(n)" gostermek icin. */
export async function kartSayilariAl(grupIdler) {
    const sonuc = {};
    await Promise.all(grupIdler.map(async id => {
        try {
            const c = await chrome.bookmarks.getChildren(id);
            sonuc[id] = c.filter(x => x.url).length;
        } catch (e) {
            sonuc[id] = 0;
        }
    }));
    return sonuc;
}

export async function kartEkle(grupId, baslik, url) {
    return chrome.bookmarks.create({ parentId: grupId, title: baslik || url, url });
}

export async function kartGuncelle(id, degisiklikler) {
    return chrome.bookmarks.update(id, degisiklikler);
}

export async function kartSil(id) {
    return chrome.bookmarks.remove(id);
}

export async function grupEkle(baslik) {
    const kok = await kokKlasoruAl();
    return chrome.bookmarks.create({ parentId: kok, title: baslik });
}

/** Grup (veya kart) basligini gunceller. */
export async function kartGuncelleBaslik(id, baslik) {
    return chrome.bookmarks.update(id, { title: baslik });
}

export async function grupSil(id) {
    return chrome.bookmarks.removeTree(id);
}

/** Sirayi uygular: listedeki konum = yeni index. */
export async function sirayiUygula(ebeveynId, sirali) {
    for (let i = 0; i < sirali.length; i++) {
        await chrome.bookmarks.move(sirali[i], { parentId: ebeveynId, index: i });
    }
}

/**
 * URL normallestirme.
 * Chrome yer imi URL'lerini normallestiriyor ("https://x.com" -> "https://x.com/").
 * Gorselleri ham URL ile saklarsak arama tutmaz; her yerde bu bicimi kullaniyoruz.
 */
export function urlNormalle(u) {
    try {
        return new URL(u).href;
    } catch (e) {
        return u;
    }
}
