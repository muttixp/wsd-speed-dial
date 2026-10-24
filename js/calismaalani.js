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

// WSD Speed Dial - CALISMA ALANLARI (1.5.4, deneysel)
//
// Bir penceredeki acik sekmeleri ad vererek saklayip sonra tek tikla
// yeni pencerede geri acmak. Gruplardan BILEREK AYRI tutuluyor:
//
//  - Yer: WSD kok klasorunun YANINDA "WSD Çalışma Alanları" klasoru.
//    WSD agacinin disinda oldugu icin grup seridi, arama, yinelenenler,
//    kirik baglantilar ve gorsel yakalama bunlari hic gormuyor.
//  - Her calisma alani bir alt klasor, sekmeler icinde yer imi.
//    Yer imi oldugu icin tarayici senkronuna kendiliginden giriyor.
//  - Gorsel yakalanmiyor: gecici oturum kaydi. Kalici olsun istenirse
//    "Gruba donustur" klasoru WSD agacina tasiyip gorselleri istiyor.
//
// Deneme bitip begenilmezse bu dosya + wsd.js'deki tek cagri + arayuz
// listelerindeki 'alanAcik' kaldirilarak geri alinabilir.

import { kokKlasoruAl, urlNormalle, ALAN_KOK_ADI } from './yerimi.js';
import { aktifGrup, grubuAc, arayuzuKur } from './cizim.js';
import { bildir, ekranSinifiniVer, menuTazele, tazelemeyiBastir } from './arayuz.js';
import { onaySor, listeSor } from './onay.js';
import { c } from './dil.js';

const el = id => document.getElementById(id);
const COK_SEKME = 25;          // bundan fazlasini acmadan once sor

/* ---------- Depo ---------- */

/** Calisma alanlari klasoru: WSD kokuyle ayni ebeveynde. */
async function alanKokuAl(olustur = false) {
    const kok = await kokKlasoruAl();
    const [wsd] = await chrome.bookmarks.get(kok);
    const kardesler = await chrome.bookmarks.getChildren(wsd.parentId);
    const bulunan = kardesler.find(d => !d.url && d.title === ALAN_KOK_ADI);
    if (bulunan) return bulunan.id;
    if (!olustur) return null;
    const yeni = await chrome.bookmarks.create({ parentId: wsd.parentId, title: ALAN_KOK_ADI });
    return yeni.id;
}

async function alanlariAl() {
    const kokId = await alanKokuAl(false);
    if (!kokId) return [];
    const [agac] = await chrome.bookmarks.getSubTree(kokId);
    return (agac.children || [])
        .filter(d => !d.url)
        .map(d => ({
            id: d.id,
            ad: d.title,
            tarih: d.dateGroupModified || d.dateAdded,
            sekmeler: (d.children || []).filter(x => x.url).map(x => ({ id: x.id, baslik: x.title || x.url, url: x.url }))
        }));
    // SIRA: yer imi klasorundeki sira (yeni kayit en uste ekleniyor,
    // surukle-birak ile degisiyor)
}

/**
 * ETIKET + NOT: klasor kimligine bagli, chrome.storage'da. (Yer imi
 * klasorunde aciklama alani yok.) Silinen klasorunku ciz() sirasinda
 * budaniyor.
 */
const BILGI_ANAHTARI = 'alanBilgileri';

async function bilgileriAl() {
    try { return (await chrome.storage.local.get(BILGI_ANAHTARI))[BILGI_ANAHTARI] || {}; }
    catch (e) { return {}; }
}

async function bilgiYaz(id, bilgi) {
    const hepsi = await bilgileriAl();
    if (bilgi && ((bilgi.etiketler && bilgi.etiketler.length) || bilgi.not || bilgi.renk || bilgi.sabit || bilgi.son)) hepsi[id] = bilgi;
    else delete hepsi[id];
    try { await chrome.storage.local.set({ [BILGI_ANAHTARI]: hepsi }); } catch (e) { /* onemli degil */ }
}

/** Bilginin yalnizca verilen alanlarini degistirir (sabit, son acilis...). */
async function bilgiGuncelle(id, parca) {
    const hepsi = await bilgileriAl();
    await bilgiYaz(id, { ...(hepsi[id] || {}), ...parca });
}

/* ---------- Sekme secimi ---------- */

/** Bu penceredeki kaydedilebilir sekmeler (WSD sekmesi ve ic sayfalar haric, tekrarsiz). */
async function penceredekiSekmeler() {
    let ben = null;
    try { ben = await chrome.tabs.getCurrent(); } catch (e) { /* onemli degil */ }
    const tumu = (await chrome.tabs.query({ currentWindow: true })).sort((a, b) => a.index - b.index);

    // BLOKLAR (1.5.4): Vivaldi ayni penceredeki TUM calisma alanlarinin
    // sekmelerini veriyor ve hangisinin hangi alanda oldugunu eklentiye
    // soylemiyor (vivExtData gelmiyor, yeniden baslatinca openerTabId de
    // siliniyor). Tahmin denendi, bos calisma alaninda yanlis cikti.
    // Bu yuzden TAHMIN YOK: sekmeler yeni sekme sayfalarina (WSD ya da
    // tarayici baslangic sayfasi) gore bloklara bolunuyor; birden fazla
    // blok varsa hicbiri isaretli gelmiyor, kullanici blok basligindaki
    // kutuyla tek tikla seciyor. Tek blokta (Chrome/Edge) hepsi isaretli.
    const benimSayfam = chrome.runtime.getURL('');
    // ADRESI BOS sekme de sinir: Vivaldi baska calisma alaninin baslangic
    // sayfasini eklentiye adressiz/basliksiz veriyor (gozlem). Yuklenmekte
    // olan sekme `pendingUrl` tasidigi icin sinir sayilmaz.
    const sinirMi = s => (s.url || '').startsWith(benimSayfam)
        || /^(chrome|vivaldi|edge|brave):\/\/(newtab|vivaldi-webui\/startpage|startpage)/i.test(s.url || '')
        || (!s.url && !s.pendingUrl)
        || s.url === 'about:blank';

    // EN IYI TAHMIN: Vivaldi'de her calisma alaninin sekmeleri BLOK
    // halinde duruyor; bloklari ayiran tek iz yeni sekme sayfalari (WSD
    // ya da tarayici baslangic sayfasi). Kaydet'e basilan WSD sekmesi
    // SINIR SAYILMIYOR: Vivaldi yeni sekmeyi etkin sekmenin yanina
    // aciyor, WSD calisma alaninin ortasina dusuyor ve iki yanindakiler
    // ayni alanda. Onun blogu (onceki sinirdan sonraki sinira) isaretli,
    // digerleri isaretsiz gelir. Bos calisma alanindan kaydetmek
    // anlamsiz oldugu icin o durum ikinci planda.
    const sinir = s => sinirMi(s) && !(ben && s.id === ben.id);
    const gorulen = new Set();
    const sonuc = [];
    let blok = 0;
    let benimBlok = null;
    for (const s of tumu) {
        if (sinir(s)) { blok++; continue; }
        if (ben && s.id === ben.id) { benimBlok = blok; continue; }
        if (!/^(https?|file):/i.test(s.url || '')) continue;
        if (gorulen.has(s.url)) continue;
        gorulen.add(s.url);
        s.blok = blok;
        sonuc.push(s);
    }
    // Baska yeni sekme sayfasi yoksa (Chrome/Edge'de olagan) bolme yok
    if (!tumu.some(sinir)) {
        for (const s of sonuc) { s.blok = 0; s.bolumde = true; }
        return sonuc;
    }
    for (const s of sonuc) s.bolumde = s.blok === benimBlok;
    return [...sonuc.filter(s => s.bolumde), ...sonuc.filter(s => !s.bolumde)];
}

/** Ad + onay kutulu sekme listesi sorar. */
export async function sekmeSec({ baslik, deger, evet, metin = c('alanKaydetMetin') }) {
    const sekmeler = await penceredekiSekmeler();
    if (!sekmeler.length) { bildir(c('kaydedilecekSekmeYok')); return null; }
    const satirlar = [], kaynak = [];
    const satir = s => {
        let alt = '';
        try { alt = new URL(s.url).hostname; } catch (e) { /* file: */ }
        const ikon = /^(https?:|data:image\/)/i.test(s.favIconUrl || '') ? s.favIconUrl : '';
        return { baslik: s.title || s.url, alt, ikon };
    };
    const bloklar = [...new Set(sekmeler.map(s => s.blok))];
    const cokBlok = bloklar.length > 1;
    for (const b of bloklar) {
        const icindekiler = sekmeler.filter(s => s.blok === b);
        if (cokBlok) {
            const adlar = [...new Set(icindekiler.map(s => {
                try { return new URL(s.url).hostname.replace(/^www\./, ''); } catch (e) { return ''; }
            }).filter(Boolean))];
            satirlar.push({ bolum: adlar.length ? c('blokBasligi', icindekiler.length, adlar.slice(0, 3).join(', ') + (adlar.length > 3 ? '…' : '')) : c('nSekme', icindekiler.length),
                            secici: true, blok: b });
            kaynak.push(null);
        }
        for (const s of icindekiler) {
            const r = satir(s);
            // Birden fazla blok varsa HICBIRI isaretli gelmiyor: Vivaldi bos
            // calisma alaninin sekmesini baska alanin bloguna sokabiliyor
            // (gozlem), tahmin yanlis isaretliyordu. Tahmin edilen blok
            // yalnizca EN USTE aliniyor; secim kullanicinin.
            r.secili = !cokBlok;
            r.blok = b;
            satirlar.push(r); kaynak.push(s);
        }
    }

    const sonuc = await listeSor({
        baslik,
        metin,
        deger,
        evet,
        satirlar
    });
    if (!sonuc || !sonuc.secili.length) return null;
    return { ad: sonuc.ad, sekmeler: sonuc.secili.map(i => kaynak[i]).filter(Boolean) };
}

/**
 * SITE SIMGELERI: yer iminde simge tutulmuyor; kaydederken sekmenin
 * favIconUrl'si ayrica saklaniyor (yalnizca http(s) adresi ya da kucuk
 * data: - depo sismesin). Simgesi olmayana bas harf gosteriliyor.
 */
const IKON_ANAHTARI = 'alanIkonlari';

async function ikonlariAl() {
    try { return (await chrome.storage.local.get(IKON_ANAHTARI))[IKON_ANAHTARI] || {}; }
    catch (e) { return {}; }
}

async function sekmeleriYaz(klasorId, sekmeler) {
    const ikonlar = await ikonlariAl();
    for (const s of sekmeler) {
        await chrome.bookmarks.create({ parentId: klasorId, title: s.title || s.url, url: s.url });
        const f = s.favIconUrl || '';
        if (/^https?:/i.test(f) || (/^data:image\//i.test(f) && f.length < 6000)) ikonlar[s.url] = f;
    }
    try { await chrome.storage.local.set({ [IKON_ANAHTARI]: ikonlar }); } catch (e) { /* onemli degil */ }
}

/** Hicbir calisma alaninda kalmayan adreslerin simgelerini atar. */
async function ikonlariBuda(alanlar) {
    const ikonlar = await ikonlariAl();
    const kullanilan = new Set(alanlar.flatMap(a => a.sekmeler.map(s => s.url)));
    let degisti = false;
    for (const u of Object.keys(ikonlar)) if (!kullanilan.has(u)) { delete ikonlar[u]; degisti = true; }
    if (degisti) try { await chrome.storage.local.set({ [IKON_ANAHTARI]: ikonlar }); } catch (e) { /* */ }
    return ikonlar;
}

/* ---------- Eylemler ---------- */

async function yeniAlan() {
    const tarih = new Date().toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
    const varsayilan = c('alanVarsayilanAd', tarih);
    const secim = await sekmeSec({ baslik: c('alanKaydetBaslik'), deger: varsayilan, evet: c('kaydet') });
    if (!secim) return;
    tazelemeyiBastir(5000);
    const kokId = await alanKokuAl(true);
    const k = await chrome.bookmarks.create({ parentId: kokId, title: secim.ad || varsayilan, index: 0 });
    await sekmeleriYaz(k.id, secim.sekmeler);
    bildir(c('alanKaydedildi', secim.sekmeler.length));
    await ciz();
}

/**
 * VARSAYILAN: BU PENCEREDE, WSD sekmesinin hemen sagina acar.
 * Vivaldi'de windows.create ile acilan yeni pencere baska bir calisma
 * alanini gosterebiliyordu; sekmeler acilmis ama gorunmuyordu. Ayni
 * pencerede tabs.create ise sekmeleri o an acik olan Vivaldi calisma
 * alanina koyuyor. Yeni pencere ayri dugmede.
 */
async function alaniAc(alan, yeniPencere = false) {
    if (!alan.sekmeler.length) { bildir(c('alanBos')); return; }
    if (alan.sekmeler.length > COK_SEKME && !await onaySor({
        baslik: c('alanAc'),
        metin: c('nSekmeAcilacak', alan.sekmeler.length),
        evet: c('alanAc')
    })) return;
    const adresler = alan.sekmeler.map(s => s.url);
    bilgiGuncelle(alan.id, { son: Date.now() }).then(ciz);
    if (yeniPencere) {
        const p = await chrome.windows.create({ url: adresler, focused: true });
        (p.tabs || []).slice(1).forEach(t => hafifYap(t.id));
        return;
    }
    let ben = null;
    try { ben = await chrome.tabs.getCurrent(); } catch (e) { /* onemli degil */ }
    for (const [i, url] of adresler.entries()) {
        const ozellik = { url, active: i === 0 };
        if (ben) { ozellik.windowId = ben.windowId; ozellik.index = ben.index + 1 + i; }
        const t = await chrome.tabs.create(ozellik);
        if (i > 0) hafifYap(t.id);
    }
}

/**
 * HAFIF ACMA (1.6.0): ilk sekme disindakiler adres islenir islenmez
 * uyutuluyor (discard); tiklaninca yuklenir. Cok sekmeli kayit acilinca
 * hepsi birden yuklenip bilgisayari yormasin. Adres islenmeden uyutmak
 * sekmeyi bos birakabildigi icin once adresin gelmesi bekleniyor; 15 sn
 * icinde gelmezse ya da kullanici sekmeye gecerse sekme normal yuklenir.
 */
function hafifYap(sekmeId) {
    let bitti = false;
    const bitir = (uyut, neden) => {
        if (bitti) return;
        bitti = true;
        chrome.tabs.onUpdated.removeListener(dinle);
        clearTimeout(zaman);
        if (!uyut) return;
        chrome.tabs.discard(sekmeId).catch(e => console.log('[WSD] hafif acma:', sekmeId, neden, e.message));
    };
    const islendi = t => !!t && /^(https?|file):/i.test(t.url || '');
    const dinle = (id, d, t) => {
        if (id !== sekmeId) return;
        if (t.active) return bitir(false);               // kullanici tikladi
        if (islendi(t)) bitir(true, d.status || 'adres');
    };
    const zaman = setTimeout(() => bitir(false), 15000);
    chrome.tabs.onUpdated.addListener(dinle);
    chrome.tabs.get(sekmeId).then(t => { if (islendi(t)) bitir(true, 'hemen'); })
        .catch(() => bitir(false));
}

/**
 * DUZENLE (1.5.4): ad + KAYITLI sekmeler (isaretli; kaldirilan cikar)
 * + bu pencerede ACIK olup kayitta olmayanlar (isaretsiz; isaretlenen
 * eklenir). Eski "Guncelle" ve "Yeniden adlandir"in yerini aldi.
 */
async function alaniDuzenle(alan) {
    const ikonlar = await ikonlariAl();
    const kayitliAdres = new Set(alan.sekmeler.map(s => s.url));
    const acik = (await penceredekiSekmeler()).filter(s => !kayitliAdres.has(s.url));

    const alanAdi = u => { try { return new URL(u).hostname; } catch (e) { return ''; } };
    const ikonu = (url, f) => /^(https?:|data:image\/)/i.test(f || '') ? f : (ikonlar[url] || '');
    const satirlar = [{ bolum: c('kayitliSekmeler') }];
    const kaynak = [null];                     // satir -> { tur, veri }
    for (const s of alan.sekmeler) {
        satirlar.push({ baslik: s.baslik, alt: alanAdi(s.url), ikon: ikonu(s.url) });
        kaynak.push({ tur: 'kayitli', veri: s });
    }
    if (acik.length) {
        satirlar.push({ bolum: c('acikSekmeler') });
        kaynak.push(null);
        for (const s of acik) {
            satirlar.push({ baslik: s.title || s.url, alt: alanAdi(s.url), ikon: ikonu(s.url, s.favIconUrl), secili: false });
            kaynak.push({ tur: 'acik', veri: s });
        }
    }

    const sonuc = await listeSor({
        baslik: c('alanDuzenleBaslik'),
        metin: c('alanDuzenleMetin'),
        deger: alan.ad,
        evet: c('kaydet'),
        satirlar,
        ek: { etiketler: alan.etiketler, not: alan.not, renk: alan.renk }
    });
    if (!sonuc) return;
    if (sonuc.ek) await bilgiGuncelle(alan.id, sonuc.ek);

    const secili = new Set(sonuc.secili);
    tazelemeyiBastir(5000);
    let cikan = 0;
    const eklenecek = [];
    kaynak.forEach((k, i) => {
        if (!k) return;
        if (k.tur === 'kayitli' && !secili.has(i)) cikan++;
        if (k.tur === 'acik' && secili.has(i)) eklenecek.push(k.veri);
    });
    for (const [i, k] of kaynak.entries()) {
        if (k && k.tur === 'kayitli' && !secili.has(i)) {
            try { await chrome.bookmarks.remove(k.veri.id); } catch (e) { /* zaten yok */ }
        }
    }
    if (eklenecek.length) await sekmeleriYaz(alan.id, eklenecek);
    if (sonuc.ad && sonuc.ad !== alan.ad) await chrome.bookmarks.update(alan.id, { title: sonuc.ad });
    if (cikan || eklenecek.length) bildir(c('alanDuzenlendi', eklenecek.length, cikan));
    await ciz();
}

/**
 * PENCEREYLE ESITLE (1.6.0): kaydi bu penceredeki sekmelerle ayni yapar,
 * sirasi da pencereninki olur. Cikacak sekme varsa once sorar.
 * Pencere bloklara ayriliyorsa Duzenle acilir (bkz. penceredekiSekmeler).
 */
async function alaniEsitle(alan) {
    const tumu = await penceredekiSekmeler();
    if (!tumu.length) { bildir(c('kaydedilecekSekmeYok')); return; }
    // Pencere birden fazla bloga ayriliyorsa (Vivaldi calisma alanlari ya
    // da araya acilmis yeni sekme) hangi sekmelerin kastedildigini tahmin
    // etmiyoruz: secimi Duzenle penceresi yaptiriyor
    if (tumu.some(s => !s.bolumde)) return alaniDuzenle(alan);
    const pencere = tumu;
    const yeni = new Set(pencere.map(s => s.url));
    const eski = new Set(alan.sekmeler.map(s => s.url));
    const cikacak = alan.sekmeler.filter(s => !yeni.has(s.url));
    const eklenecek = pencere.filter(s => !eski.has(s.url));
    const ayniSira = !cikacak.length && !eklenecek.length
        && pencere.every((s, i) => alan.sekmeler[i]?.url === s.url);
    if (ayniSira) { bildir(c('alanZatenGuncel')); return; }
    if (cikacak.length && !await onaySor({
        baslik: c('pencereyleEsitle'),
        metin: c('esitleMetin', alan.ad, eklenecek.length, cikacak.length),
        evet: c('esitle')
    })) return;
    tazelemeyiBastir(5000);
    for (const s of cikacak) {
        try { await chrome.bookmarks.remove(s.id); } catch (e) { /* zaten yok */ }
    }
    if (eklenecek.length) await sekmeleriYaz(alan.id, eklenecek);
    // Sira: pencerenin sirasi (ayni adreste ilk yer imi)
    const [klasor] = await chrome.bookmarks.getSubTree(alan.id);
    const yerimleri = new Map();
    for (const d of klasor.children || []) if (d.url && !yerimleri.has(d.url)) yerimleri.set(d.url, d.id);
    for (const [i, s] of pencere.entries()) {
        const id = yerimleri.get(s.url);
        if (id) await chrome.bookmarks.move(id, { parentId: alan.id, index: i }).catch(() => {});
    }
    bildir(c('alanDuzenlendi', eklenecek.length, cikacak.length));
    await ciz();
}

/** Klasoru WSD agacina tasir: normal grup olur, gorselleri istenir. */
async function grubaDonustur(alan) {
    if (!await onaySor({
        baslik: c('grubaDonustur'),
        metin: c('grubaDonusturMetin', alan.ad),
        evet: c('grubaDonustur')
    })) return;
    tazelemeyiBastir(5000);
    const kok = await kokKlasoruAl();
    await chrome.bookmarks.move(alan.id, { parentId: kok });
    // Not grubun aciklamasina gecsin; etiketler gruplarda yok
    if (alan.not) {
        try {
            const { gorunumYaz } = await import('./gruppencere.js');
            await gorunumYaz(alan.id, { aciklama: alan.not });
        } catch (e) { /* onemli degil */ }
    }
    await bilgiYaz(alan.id, null);
    // Tasima onCreated tetiklemiyor; gorselleri biz istiyoruz
    for (const s of alan.sekmeler) {
        chrome.runtime.sendMessage({ hedef: 'arkaplan', tur: 'gorselIste', url: urlNormalle(s.url) })
            .catch(() => {});
    }
    menuTazele();
    document.body.classList.remove('alanAcik');
    await arayuzuKur();
    await grubuAc(alan.id);
    bildir(c('grubaDonusturuldu'));
}

async function alaniSil(alan) {
    if (!await onaySor({
        baslik: c('alanSil'),
        metin: c('alanSilMetin', alan.ad, alan.sekmeler.length),
        evet: c('sil'),
        tehlikeli: true
    })) return;
    await chrome.bookmarks.removeTree(alan.id);
    await bilgiYaz(alan.id, null);
    await ciz();
}

/* ---------- Ekran ---------- */

export function calismaAlanlariniKur() {
    el('alanBtn')?.addEventListener('click', () => {
        if (document.body.classList.contains('alanAcik')) return kapat();
        ac();
    });
    el('alanKaydet')?.addEventListener('click', yeniAlan);
    el('alanKapat')?.addEventListener('click', kapat);
    el('alanAra')?.addEventListener('input', araUygula);
    // Arac cubugu simgesinin menusunden gelindiyse kaydetmeyi hemen ac
    if (location.hash === '#sekmeleriKaydet') {
        history.replaceState(null, '', location.pathname);
        setTimeout(async () => { await ac(); await yeniAlan(); }, 400);
    }
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && document.body.classList.contains('alanAcik')
            && el('onayPencere')?.hidden !== false) {
            // Aramada yazi varsa once onu temizle
            const ara = el('alanAra');
            if (ara && ara.value) { ara.value = ''; araUygula(); ara.blur(); return; }
            kapat();
        }
    });
}

async function ac() {
    el('ayarPanel')?.classList.remove('acik');
    el('perde')?.classList.remove('acik');
    document.body.classList.remove('ayarAcik');
    ekranSinifiniVer('alanAcik');
    await ciz();
}

function kapat() {
    if (el('alanAra')) el('alanAra').value = '';
    document.body.classList.remove('alanAcik');
    grubuAc(aktifGrup());
}

let seciliEtiket = null;

async function ciz() {
    if (!document.body.classList.contains('alanAcik')) return;
    const kap = el('kartKabi');
    kap.textContent = '';

    const alanlar = await alanlariAl();
    const ikonlar = await ikonlariBuda(alanlar);
    const bilgiler = await bilgileriAl();
    // Klasoru silinmis bilgileri at
    const varOlan = new Set(alanlar.map(a => a.id));
    if (Object.keys(bilgiler).some(id => !varOlan.has(id))) {
        for (const id of Object.keys(bilgiler)) if (!varOlan.has(id)) delete bilgiler[id];
        try { await chrome.storage.local.set({ [BILGI_ANAHTARI]: bilgiler }); } catch (e) { /* */ }
    }
    for (const a of alanlar) {
        a.etiketler = bilgiler[a.id]?.etiketler || [];
        a.not = bilgiler[a.id]?.not || '';
        a.renk = bilgiler[a.id]?.renk || null;
        a.sabit = !!bilgiler[a.id]?.sabit;
        a.son = bilgiler[a.id]?.son || 0;
    }
    // Sabitlenenler ustte; kendi aralarinda yer imi sirasi
    alanlar.sort((x, y) => (y.sabit ? 1 : 0) - (x.sabit ? 1 : 0));
    el('alanSayi').textContent = alanlar.length ? String(alanlar.length) : '';

    const liste = document.createElement('div');
    liste.className = 'alanListe';
    kap.appendChild(liste);

    // ETIKET SUZGECI: herhangi bir alanda etiket varsa ustte cipler
    const tumEtiketler = [...new Set(alanlar.flatMap(a => a.etiketler))]
        .sort((x, y) => x.localeCompare(y, undefined, { sensitivity: 'base' }));
    if (seciliEtiket && !tumEtiketler.includes(seciliEtiket)) seciliEtiket = null;
    if (tumEtiketler.length) {
        const serit = document.createElement('div');
        serit.className = 'alanSuzgec';
        for (const e of [null, ...tumEtiketler]) {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'alanCip' + (e === seciliEtiket ? ' secili' : '');
            b.textContent = e === null ? c('tumu') : e;
            b.addEventListener('click', () => { seciliEtiket = e; ciz(); });
            serit.appendChild(b);
        }
        liste.appendChild(serit);
    }

    if (!alanlar.length) {
        const bos = document.createElement('div');
        bos.className = 'alanBosDurum';
        bos.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${SVG.alan}</svg><p></p>`;
        bos.querySelector('p').textContent = c('alanYok');
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'dugme birincil';
        b.textContent = c('sekmeleriKaydet');
        b.addEventListener('click', yeniAlan);
        bos.appendChild(b);
        liste.appendChild(bos);
        return;
    }

    for (const alan of alanlar) {
        if (seciliEtiket && !alan.etiketler.includes(seciliEtiket)) continue;
        liste.appendChild(alanKarti(alan, ikonlar));
    }
    const bos = document.createElement('p');
    bos.className = 'alanAraBos';
    bos.textContent = c('alanAraBos');
    bos.hidden = true;
    liste.appendChild(bos);
    araUygula();
}

/**
 * ARAMA (1.6.0): kayit adi, etiket, not, sekme basligi ve adresinde.
 * Yeniden cizmeden kartlari gizler; eslesen sekme kartin gizli
 * kismindaysa kart genisler.
 */
function araUygula() {
    const terim = (el('alanAra')?.value || '').trim().toLocaleLowerCase();
    const kartlar = [...document.querySelectorAll('.alanListe .alanKart')];
    let gorunen = 0;
    for (const k of kartlar) {
        let tutan = !terim || (k.dataset.ara || '').includes(terim);
        let gizlideVar = false;
        for (const li of k.querySelectorAll('.alanSekmeler li[data-ara]')) {
            const es = !!terim && li.dataset.ara.includes(terim);
            li.classList.toggle('eslesme', es);
            if (es) { tutan = true; if (li.classList.contains('fazla')) gizlideVar = true; }
        }
        k.classList.toggle('araGenis', gizlideVar);
        k.hidden = !tutan;
        if (tutan) gorunen++;
    }
    const bos = document.querySelector('.alanListe .alanAraBos');
    if (bos) bos.hidden = !terim || gorunen > 0;
}

/* Simgeler - 24'luk kutu, cizgi */
const SVG = {
    alan:   '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M7 6.5h.01M10 6.5h.01"/>',
    ac:     '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
    pencere:'<rect x="3" y="5" width="14" height="14" rx="2"/><path d="M10 3h9a2 2 0 0 1 2 2v9"/>',
    esitle: '<path d="M21 12a9 9 0 0 1-15.5 6.2L3 16"/><path d="M3 21v-5h5"/><path d="M3 12a9 9 0 0 1 15.5-6.2L21 8"/><path d="M21 3v5h-5"/>',
    sabit:  '<path d="M12 17v5"/><path d="M9 10.8V4h6v6.8l3 3.2v1H6v-1z"/>',
    grup:   '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="m10 13 2 2 4-4"/>',
    kalem:  '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    sil:    '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/>',
    carpi:  '<path d="M6 6l12 12M18 6 6 18"/>'
};

function ikonDugme(svg, ipucu, tik, sinif = '') {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'alanIkonDugme ' + sinif;
    b.title = ipucu;
    b.setAttribute('aria-label', ipucu);
    b.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${svg}</svg>`;
    b.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); tik(); });
    return b;
}

function siteSimgesi(url, ikonlar) {
    const f = ikonlar[url];
    let harf = '?';
    try { harf = new URL(url).hostname.replace(/^www\./, '').charAt(0).toUpperCase() || '?'; } catch (e) { /* */ }
    const yedek = () => { const i = document.createElement('i'); i.textContent = harf; return i; };
    if (!f) return yedek();
    const img = document.createElement('img');
    img.src = f;
    img.alt = '';
    img.loading = 'lazy';
    img.onerror = () => img.replaceWith(yedek());
    return img;
}

const ILK_GOSTERILEN = 6;

function alanKarti(alan, ikonlar) {
    const kart = document.createElement('section');
    kart.className = 'alanKart';
    kart.dataset.id = alan.id;
    kart.dataset.ara = [alan.ad, alan.not, ...alan.etiketler].join(' ').toLocaleLowerCase();
    kart.classList.toggle('sabit', alan.sabit);
    // Renk secilmemisse GRI: baslik bandi her kartta ayirt edilsin
    kart.classList.add('renkli');
    if (!alan.renk) kart.classList.add('varsayilanRenk');
    kart.style.setProperty('--alan-renk', alan.renk || '#6b7280');
    suruklemeyiKur(kart);

    // Baslik: ad (cift tik = yeniden adlandir) + bilgi
    const ust = document.createElement('header');
    ust.className = 'alanUst';
    const ad = document.createElement('h3');
    ad.textContent = alan.ad;
    ad.title = c('duzenle');
    ad.addEventListener('dblclick', () => alaniDuzenle(alan));
    const bilgi = document.createElement('small');
    const zaman = t => new Date(t).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
    // Son acilis varsa o (1.6.0), yoksa kayit tarihi
    const tarih = alan.son ? c('alanSonAcilis', zaman(alan.son)) : alan.tarih ? zaman(alan.tarih) : '';
    bilgi.textContent = c('nSekme', alan.sekmeler.length) + (tarih ? ' · ' + tarih : '');
    // SABITLE (1.6.0): sabitlenen kayit listenin basinda durur
    const sabitle = ikonDugme(SVG.sabit, alan.sabit ? c('sabitlemeyiKaldir') : c('sabitle'), async () => {
        await bilgiGuncelle(alan.id, { sabit: !alan.sabit });
        await ciz();
    }, 'alanSabitle' + (alan.sabit ? ' secili' : ''));
    ust.append(ad, bilgi, sabitle);

    if (alan.etiketler.length) {
        const cipler = document.createElement('div');
        cipler.className = 'alanCipler';
        for (const e of alan.etiketler) {
            const s = document.createElement('button');
            s.type = 'button';
            s.className = 'alanCip kucuk';
            s.textContent = e;
            s.addEventListener('click', () => { seciliEtiket = e; ciz(); });
            cipler.appendChild(s);
        }
        ust.appendChild(cipler);
    }
    if (alan.not) {
        const n = document.createElement('p');
        n.className = 'alanNot';
        n.textContent = alan.not;
        n.title = alan.not;
        ust.appendChild(n);
    }

    // Sekmeler: ilk birkaci gorunur, gerisi "+N daha" ile acilir.
    // Tiklayinca o tek sekme acilir; x ile calisma alanindan cikar.
    const sekmeler = document.createElement('ul');
    sekmeler.className = 'alanSekmeler';
    alan.sekmeler.forEach((s, i) => {
        const li = document.createElement('li');
        if (i >= ILK_GOSTERILEN) li.className = 'fazla';
        li.dataset.ara = (s.baslik + ' ' + s.url).toLocaleLowerCase();
        const a = document.createElement('a');
        a.href = s.url;
        a.title = s.url;
        a.addEventListener('click', e => {
            e.preventDefault();
            chrome.tabs.create({ url: s.url, active: !(e.ctrlKey || e.metaKey) });
        });
        const ba = document.createElement('span');
        ba.textContent = s.baslik;
        a.append(siteSimgesi(s.url, ikonlar), ba);
        li.append(a, ikonDugme(SVG.carpi, c('alandanCikar'), async () => {
            await chrome.bookmarks.remove(s.id);
            await ciz();
        }, 'kucuk'));
        sekmeler.appendChild(li);
    });
    if (alan.sekmeler.length > ILK_GOSTERILEN) {
        const li = document.createElement('li');
        li.className = 'alanDaha';
        const b = document.createElement('button');
        b.type = 'button';
        const kalan = alan.sekmeler.length - ILK_GOSTERILEN;
        b.textContent = c('nDahaGoster', kalan);
        b.addEventListener('click', () => {
            const acik = kart.classList.toggle('genis');
            b.textContent = acik ? c('dahaAzGoster') : c('nDahaGoster', kalan);
        });
        li.appendChild(b);
        sekmeler.appendChild(li);
    }

    // Alt: belirgin "Ac" + ikincil islemler simge olarak
    const alt = document.createElement('footer');
    alt.className = 'alanAlt';
    const ac = document.createElement('button');
    ac.type = 'button';
    ac.className = 'dugme birincil alanAcDugme';
    ac.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${SVG.ac}</svg><span></span>`;
    ac.querySelector('span').textContent = c('alanAc');
    ac.title = c('alanAcIpucu');
    ac.addEventListener('click', () => alaniAc(alan));
    const bosluk = document.createElement('span');
    bosluk.className = 'alanBosluk';
    alt.append(
        ac,
        ikonDugme(SVG.pencere, c('yeniPencerede'), () => alaniAc(alan, true)),
        bosluk,
        ikonDugme(SVG.esitle, c('pencereyleEsitle'), () => alaniEsitle(alan)),
        ikonDugme(SVG.kalem, c('duzenle'), () => alaniDuzenle(alan)),
        ikonDugme(SVG.grup, c('grubaDonustur'), () => grubaDonustur(alan)),
        ikonDugme(SVG.sil, c('sil'), () => alaniSil(alan), 'yikici')
    );

    kart.append(ust, sekmeler, alt);
    return kart;
}

/* ---------- Surukle-birak siralama ---------- */

let surukId = null;

function suruklemeyiKur(kart) {
    kart.draggable = true;
    kart.addEventListener('dragstart', e => {
        // Sekme baglantisini ya da dugmeyi surukleyince kart surulmesin
        if (e.target !== kart) return;
        surukId = kart.dataset.id;
        kart.classList.add('surukleniyor');
        // disbirak.js bunu disaridan birakilan baglanti sanip olayi
        // yutuyordu; ic surukleme oldugunu bu sinifla anliyor
        document.body.classList.add('alanSurukleniyor');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', '');
    });
    kart.addEventListener('dragend', () => {
        surukId = null;
        kart.classList.remove('surukleniyor');
        document.body.classList.remove('alanSurukleniyor');
        document.querySelectorAll('.alanKart.hedefOnce, .alanKart.hedefSonra')
            .forEach(k => k.classList.remove('hedefOnce', 'hedefSonra'));
    });
    kart.addEventListener('dragover', e => {
        if (!surukId || surukId === kart.dataset.id) return;
        e.preventDefault();
        const r = kart.getBoundingClientRect();
        const sonra = e.clientX > r.left + r.width / 2;
        kart.classList.toggle('hedefSonra', sonra);
        kart.classList.toggle('hedefOnce', !sonra);
    });
    kart.addEventListener('dragleave', () => kart.classList.remove('hedefOnce', 'hedefSonra'));
    kart.addEventListener('drop', async e => {
        if (!surukId || surukId === kart.dataset.id) return;
        e.preventDefault();
        // Kimligi HEMEN al: dragend, ilk await'ten once surukId'yi siliyor
        const kaynakId = surukId;
        const sonra = kart.classList.contains('hedefSonra');
        kart.classList.remove('hedefOnce', 'hedefSonra');
        const [hedef] = await chrome.bookmarks.get(kart.dataset.id);
        // Ayni klasorde: tarayici, kaynak hedefin ustundeyse indeksi
        // kendisi kaydiriyor; "once" = hedefin yeri, "sonra" = bir fazlasi
        await chrome.bookmarks.move(kaynakId, { parentId: hedef.parentId, index: hedef.index + (sonra ? 1 : 0) });
        await ciz();
    });
}

/* ---------- Yedek (1.5.4) ---------- */

/**
 * Yedege girecek bicim: siraya gore liste. Yalnizca metin - site
 * simgelerinden yalnizca http(s) adresi olanlar (gomulu data: simgeler
 * sekme acilinca zaten yenileniyor, yedegi sisirmesin).
 */
export async function alanlariDisaVer() {
    const alanlar = await alanlariAl();
    if (!alanlar.length) return [];
    const bilgiler = await bilgileriAl();
    const ikonlar = await ikonlariAl();
    return alanlar.map(a => {
        const o = {
            ad: a.ad,
            sekmeler: a.sekmeler.map(s => {
                const x = { baslik: s.baslik, url: s.url };
                if (/^https?:/i.test(ikonlar[s.url] || '')) x.ikon = ikonlar[s.url];
                return x;
            })
        };
        const b = bilgiler[a.id];
        if (b?.etiketler?.length) o.etiketler = b.etiketler;
        if (b?.not) o.not = b.not;
        if (b?.renk) o.renk = b.renk;
        if (b?.sabit) o.sabit = true;
        return o;
    });
}

/**
 * Yedekten geri yukler.
 *  temizle = true  ("sil ve yukle"): mevcut calisma alanlari silinir.
 *  temizle = false ("ekle"): mevcutlar kalir; ayni adli varsa yenisi
 *                  "Ad (2)", "Ad (3)" diye eklenir (kartlardaki gibi
 *                  icine birlestirilmez - oturumlar ayri kalsin).
 * Yedekte bu bolum yoksa (eski yedek) hicbir sey yapilmaz.
 */
export async function alanlariIceAl(liste, temizle) {
    if (!Array.isArray(liste)) return 0;
    const kokId = await alanKokuAl(true);
    const bilgiler = await bilgileriAl();
    const ikonlar = await ikonlariAl();

    if (temizle) {
        for (const c of await chrome.bookmarks.getChildren(kokId)) {
            await chrome.bookmarks.removeTree(c.id).catch(() => {});
            delete bilgiler[c.id];
        }
    }
    const kullanilan = new Set((await chrome.bookmarks.getChildren(kokId))
        .filter(c => !c.url).map(c => c.title.trim().toLocaleLowerCase()));
    const adVer = ad => {
        let aday = ad, n = 2;
        while (kullanilan.has(aday.trim().toLocaleLowerCase())) aday = `${ad} (${n++})`;
        kullanilan.add(aday.trim().toLocaleLowerCase());
        return aday;
    };

    let sayi = 0;
    for (const a of liste) {
        if (!a || !Array.isArray(a.sekmeler)) continue;
        const k = await chrome.bookmarks.create({ parentId: kokId, title: adVer(String(a.ad || c('calismaAlanlari'))) });
        for (const s of a.sekmeler) {
            if (!s || !/^(https?|file):/i.test(s.url || '')) continue;
            await chrome.bookmarks.create({ parentId: k.id, title: s.baslik || s.url, url: s.url }).catch(() => {});
            if (s.ikon && /^https?:/i.test(s.ikon)) ikonlar[s.url] = s.ikon;
        }
        const b = {};
        if (Array.isArray(a.etiketler) && a.etiketler.length) b.etiketler = a.etiketler.map(String);
        if (a.not) b.not = String(a.not);
        if (a.renk) b.renk = String(a.renk);
        if (a.sabit) b.sabit = true;
        if (Object.keys(b).length) bilgiler[k.id] = b;
        sayi++;
    }
    await chrome.storage.local.set({ [BILGI_ANAHTARI]: bilgiler, [IKON_ANAHTARI]: ikonlar });
    return sayi;
}
