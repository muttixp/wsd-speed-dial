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

// WSD Speed Dial - cop kutusu
//
// Silinen kartlar hemen yok olmuyor: verisiyle birlikte burada
// bekliyor. Bildirimdeki "Geri Al" saniyeler icinde kaciriliyor;
// dalginlikla silinen bir karti gunler sonra da kurtarabilmek gerek.
//
// Eski kayitlar SAKLAMA_GUNU sonra kendiliginden temizleniyor - yoksa
// depo silinen her kartin gorseliyle birlikte suresiz buyuyor.

const ANAHTAR = 'copKutusu';
const SAKLAMA_GUNU = 30;
const EN_FAZLA = 200;          // ust sinir: cok silme yapan kullanicida sismesin

export async function copListesi() {
    try {
        const d = await chrome.storage.local.get(ANAHTAR);
        return Array.isArray(d[ANAHTAR]) ? d[ANAHTAR] : [];
    } catch (e) {
        return [];
    }
}

/** Silinen ogeyi cope atar. */
export async function copeAt(kayit) {
    if (!kayit) return;
    const liste = await copListesi();

    liste.unshift({ ...kayit, silinme: new Date().toISOString(), copId: rastgeleId() });

    // Once yaslilari at, sonra sayiyi kirp
    const sinir = Date.now() - SAKLAMA_GUNU * 86400000;
    const temiz = liste
        .filter(k => new Date(k.silinme).getTime() > sinir)
        .slice(0, EN_FAZLA);

    await chrome.storage.local.set({ [ANAHTAR]: temiz });
}

export async function coptenCikar(copId) {
    const liste = await copListesi();
    const kayit = liste.find(k => k.copId === copId);
    await chrome.storage.local.set({ [ANAHTAR]: liste.filter(k => k.copId !== copId) });
    return kayit || null;
}

/** Bir cop kaydinin alanlarini gunceller (ornek: gruptan kart cikarma). */
export async function copGuncelle(copId, degisiklikler) {
    const liste = await copListesi();
    const yeni = liste.map(k => k.copId === copId ? { ...k, ...degisiklikler } : k);
    await chrome.storage.local.set({ [ANAHTAR]: yeni });
}

export async function copuBosalt() {
    await chrome.storage.local.set({ [ANAHTAR]: [] });
}

/** Suresi dolanlari temizler - acilista cagriliyor. */
export async function copuSuz() {
    const liste = await copListesi();
    const sinir = Date.now() - SAKLAMA_GUNU * 86400000;
    const temiz = liste.filter(k => new Date(k.silinme).getTime() > sinir);
    if (temiz.length !== liste.length) {
        await chrome.storage.local.set({ [ANAHTAR]: temiz });
    }
    return liste.length - temiz.length;
}

function rastgeleId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
