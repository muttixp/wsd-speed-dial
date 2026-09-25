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
//   grup icindeki klasorler -> alt klasorler (izgarada klasor kutusu)
//
// Karar: veriyi ayri bir veritabaninda DEGIL, tarayicinin kendi yer imlerinde
// tutuyoruz. Boylece tarayici senkronu bedava geliyor, kullanici verisi bize
// kilitlenmiyor ve tarayicinin kendi yedekleme araclariyla da disari alinabiliyor.

export const KOK_ADI = 'WSD';

let kokId = null;

/** Kok klasoru bulur, yoksa olusturur. Sonucu onbellege alir. */
export async function kokKlasoruAl() {
    // Onbellekteki kimlik BAYAT olabilir: "her seyi sil" ya da kullanici
    // klasoru elle silince kimlik gecersizlesiyor, ama bellekte duruyordu.
    // Bu yuzden ice aktarma ekrani WSD'nin kendi gruplarini yabanci
    // klasor sanip listeliyordu.
    if (kokId) {
        try {
            const [d] = await chrome.bookmarks.get(kokId);
            if (d && !d.url) return kokId;
        } catch (e) { /* silinmis */ }
        kokId = null;
    }

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

/* ---------- Ic ice klasorler (1.5.0) ----------
 *
 * Grup = kokun dogrudan altindaki klasor. Grubun ICINDEKI klasorler
 * "alt klasor": izgarada klasor kutusu olarak gorunuyor ve tiklayinca
 * iceri giriliyor. Tarayicinin yer imi yapisiyla birebir ayni.
 *
 * Toplu islemler (arama, yedek, denetim, oksuz temizligi, gorsel
 * yenileme) ARTIK BUTUN AGACI geziyor. Once yalnizca ilk seviyeye
 * bakiliyordu: alt klasordeki kartlar aramada cikmiyor, yedege
 * girmiyor ve - en tehlikelisi - gorselleri "oksuz" sayilip
 * temizlikte siliniyordu.
 */

/** Bir klasorun dogrudan alt klasorleri. */
export async function klasorleriAl(klasorId) {
    const cocuklar = await chrome.bookmarks.getChildren(klasorId);
    return cocuklar
        .filter(c => !c.url)
        .map(c => ({ id: c.id, baslik: c.title, sira: c.index }));
}

/**
 * Bir klasorun TUM icerigi, alt klasorler dahil, duz liste olarak.
 * `yol`: klasorun kendisine gore alt klasor ADLARI ([] = dogrudan icinde).
 * Sira yer imi sirasini koruyor (derinlik oncelikli).
 * @returns {{kartlar: Array, klasorler: Array}}
 */
export async function klasorIcerigi(klasorId) {
    const kartlar = [], klasorler = [];
    let n = 0;                            // kart+klasor ORTAK sirasi (geri yuklemede)
    let kok;
    try { [kok] = await chrome.bookmarks.getSubTree(klasorId); } catch (e) { return { kartlar, klasorler }; }

    const gez = (dugum, yol) => {
        for (const c of dugum.children || []) {
            if (c.url) {
                kartlar.push({ id: c.id, baslik: c.title, url: c.url, sira: c.index,
                               parentId: c.parentId, yol, n: n++ });
            } else {
                const altYol = [...yol, c.title];
                klasorler.push({ id: c.id, baslik: c.title, parentId: c.parentId, yol: altYol, n: n++ });
                gez(c, altYol);
            }
        }
    };
    gez(kok, []);
    return { kartlar, klasorler };
}

/**
 * Bir GRUBUN tum kartlari. Kok (Ana Sayfa) icin yalnizca dogrudan
 * kartlar: kokun alt klasorleri zaten ayri gruplar, onlari katarsak
 * her kart iki kez sayilir.
 */
export async function grubunTumKartlari(grup) {
    const kok = await kokKlasoruAl();
    if (grup === kok || (grup && grup.kokMu)) return kartlariAl(kok);
    const id = typeof grup === 'string' ? grup : grup.id;
    return (await klasorIcerigi(id)).kartlar;
}

/** WSD agacindaki TUM kartlar (her grup, her alt klasor). */
export async function tumKartlariAl() {
    const kok = await kokKlasoruAl();
    return (await klasorIcerigi(kok)).kartlar;
}

/**
 * Klasorden koke kadar olan zincir: [grup, alt, alt-alt, ..., kendisi].
 * Kok (Ana Sayfa) icin [kok]. WSD disindaysa ya da silinmisse null.
 */
export async function klasorZinciri(klasorId) {
    const kok = await kokKlasoruAl();
    if (klasorId === kok) return [{ id: kok, baslik: chrome.i18n.getMessage('anaSayfa') || 'Ana Sayfa', kokMu: true }];
    const zincir = [];
    let id = klasorId;
    for (let adim = 0; adim < 64 && id; adim++) {
        let d;
        try { [d] = await chrome.bookmarks.get(id); } catch (e) { return null; }
        if (!d || d.url) return null;
        zincir.unshift({ id: d.id, baslik: d.title });
        if (d.parentId === kok) return zincir;
        id = d.parentId;
    }
    return null;                         // WSD agacinda degil
}

/**
 * Tasima hedefleri: tum gruplar ve alt klasorleri, AGAC SIRASIYLA.
 * `yol` gorunen ad ("elfinder › config"), `derinlik` 0 = grup.
 */
export async function tumKlasorleriAl() {
    const gruplar = await gorunurGruplariAl();
    const cikti = [];
    for (const g of gruplar) {
        cikti.push({ id: g.id, baslik: g.baslik, yol: g.baslik, derinlik: 0, kokMu: !!g.kokMu });
        if (g.kokMu) continue;
        for (const k of (await klasorIcerigi(g.id)).klasorler) {
            cikti.push({ id: k.id, baslik: k.baslik, yol: [g.baslik, ...k.yol].join(' › '),
                         derinlik: k.yol.length });
        }
    }
    return cikti;
}

export async function klasorEkle(ustId, baslik) {
    return chrome.bookmarks.create({ parentId: ustId, title: baslik });
}

/** Kart sayilari - grup sekmelerinde "(n)" gostermek icin. */
export async function kartSayilariAl(grupIdler) {
    const sonuc = {};
    const kok = await kokKlasoruAl();
    await Promise.all(grupIdler.map(async id => {
        try {
            // Kok icin yalnizca dogrudan kartlar; gruplarda alt klasorler dahil
            if (id === kok) {
                const c = await chrome.bookmarks.getChildren(id);
                sonuc[id] = c.filter(x => x.url).length;
            } else {
                sonuc[id] = (await klasorIcerigi(id)).kartlar.length;
            }
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
