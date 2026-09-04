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

// WSD Speed Dial - cop kutusu ekrani
//
// Ayri bir pencere DEGIL, arama gibi ana izgarada gosteriliyor:
// kartlar buyuk gorunuyor, hangisini geri aldigin net oluyor.
//
// Silinen ogenin YEDEKLENMESI de burada: kart/grup silinirken tum
// verisi (gorsel, not, renk, sayac) toplanip cope atiliyor.

import { copListesi, coptenCikar, copuBosalt } from './cop.js';
import { c } from './dil.js';
import { aktifGrup, arayuzuKur, grubuAc } from './cizim.js';
import { kokKlasoruAl, kartlariAl, urlNormalle } from './yerimi.js';
import { ikonHTML } from './ikon.js';
import { tarihMetni } from './sayac.js';
import { onaySor } from './onay.js';
import { bildir, menuTazele } from './arayuz.js';

const el = id => document.getElementById(id);

const COP_SVG = {
    geri: '<path d="M3 12a9 9 0 1 0 2.6-6.4"/><path d="M3 3v6h6"/>',
    sil:  '<path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>'
};

export function copPenceresiniKur() {
    el('copKapat')?.addEventListener('click', copuKapat);

    el('copBosalt')?.addEventListener('click', async () => {
        const liste = await copListesi();
        if (!liste.length) return bildir(c('copKutusuZatenBos'));
        if (!await onaySor({
            baslik: c('copKutusunuBosalt'),
            metin: c('nKayitKaliciSilinecek', liste.length),
            evet: c('sil'), tehlikeli: true
        })) return;
        await copuBosalt();
        await copuCiz();
        bildir(c('copKutusuBosaltildi'));
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && document.body.classList.contains('copAcik')) copuKapat();
    });
}

export async function copPenceresiniAc() {
    // Ayar paneli aciksa kapat - kartlari gormesi gerekiyor
    el('ayarPanel')?.classList.remove('acik');
    el('perde')?.classList.remove('acik');
    document.body.classList.remove('ayarAcik');

    document.body.classList.add('copAcik');
    await copuCiz();
}

function copuKapat() {
    document.body.classList.remove('copAcik');
    grubuAc(aktifGrup());
}

async function copuCiz() {
    const kap = el('kartKabi');
    const liste = await copListesi();

    el('copBaslik').textContent = c('copKutusu');
    el('copSayi').textContent = liste.length ? c('nKayit', liste.length) : '';
    const geri = el('copGeriDon');
    if (geri) geri.hidden = true;
    kap.textContent = '';

    if (!liste.length) {
        const bos = document.createElement('p');
        bos.id = 'aramaBos';
        bos.textContent = c('copKutusuBos');
        kap.appendChild(bos);
        return;
    }

    for (const k of liste) {
        kap.appendChild(k.tur === 'grup' ? copGrubuOlustur(k) : copKartiOlustur(k));
    }
}

function copKartiOlustur(k) {
    const a = document.createElement('div');
    a.className = 'kart copKart';

    const govde = document.createElement('span');
    govde.className = 'kartGovde';

    const baslik = document.createElement('span');
    baslik.className = 'kartBaslik';
    baslik.textContent = k.baslik || k.url;

    const gorsel = document.createElement('span');
    gorsel.className = 'kartGorsel';
    if (k.gorsel && k.gorsel.gorsel) {
        gorsel.style.backgroundImage = `url('${k.gorsel.gorsel}')`;
    }

    govde.append(baslik, gorsel);
    a.appendChild(govde);

    // Iki dugme: geri al / kalici sil
    const araclar = document.createElement('span');
    araclar.className = 'copKartAraclari';

    const geri = document.createElement('button');
    geri.type = 'button';
    geri.className = 'copKartDugme';
    geri.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${COP_SVG.geri}</svg>Geri Al`;
    geri.addEventListener('click', async () => {
        const kayit = await coptenCikar(k.copId);
        await kartiGeriAl(kayit, false);   // ekrani tazeleme - copteyiz
        await copuCiz();
        bildir(c('kartGeriAlindi'));
    });

    const sil = document.createElement('button');
    sil.type = 'button';
    sil.className = 'copKartDugme yikici';
    sil.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${COP_SVG.sil}</svg>${c('kaliciSil')}`;
    sil.addEventListener('click', async () => {
        if (!await onaySor({
            baslik: c('kaliciSil'),
            metin: `"${k.baslik || k.url}" tamamen silinecek.`,
            evet: c('sil'), tehlikeli: true
        })) return;
        await coptenCikar(k.copId);
        await copuCiz();
    });

    araclar.append(geri, sil);
    a.appendChild(araclar);

    const tarih = document.createElement('span');
    tarih.className = 'copTarihEtiketi';
    tarih.textContent = c('silindiTarih', tarihMetni(k.silinme));
    a.appendChild(tarih);

    return a;
}

/** Copteki GRUP kaydi - kart yerine klasor gorunumu. */
function copGrubuOlustur(k) {
    const a = document.createElement('div');
    a.className = 'kart copKart copGrup';

    const govde = document.createElement('span');
    govde.className = 'kartGovde';

    const baslik = document.createElement('span');
    baslik.className = 'kartBaslik';
    baslik.textContent = k.baslik;

    const kutu = document.createElement('span');
    kutu.className = 'kartGorsel copGrupKutu';

    // Grubun KENDI ikonu - silinirken yedeklenmisti
    const ikon = document.createElement('span');
    ikon.className = 'copGrupIkon';
    ikon.innerHTML = ikonHTML(k.ikon || 'folder');

    const sayi = document.createElement('span');
    sayi.className = 'copGrupSayi';
    sayi.textContent = `${k.kartlar.length} kart`;

    const ac = document.createElement('span');
    ac.className = 'copGrupAc';
    ac.textContent = c('iceriginiGor');

    kutu.append(ikon, sayi, ac);
    govde.append(baslik, kutu);
    a.appendChild(govde);

    // Kutuya tiklayinca grubun kartlari listelensin
    kutu.style.cursor = 'pointer';
    kutu.addEventListener('click', () => copGrubunuAc(k));

    const araclar = document.createElement('span');
    araclar.className = 'copKartAraclari';

    const geri = document.createElement('button');
    geri.type = 'button';
    geri.className = 'copKartDugme';
    geri.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${COP_SVG.geri}</svg>Geri Al`;
    geri.addEventListener('click', async () => {
        const kayit = await coptenCikar(k.copId);
        await grubuGeriAl(kayit);
        await copuCiz();
        bildir(c('geriAlindiAd', k.baslik));
    });

    const sil = document.createElement('button');
    sil.type = 'button';
    sil.className = 'copKartDugme yikici';
    sil.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${COP_SVG.sil}</svg>${c('kaliciSil')}`;
    sil.addEventListener('click', async () => {
        if (!await onaySor({
            baslik: c('kaliciSil'),
            metin: c('grupKaliciSilMetin', k.baslik, k.kartlar.length),
            evet: c('sil'), tehlikeli: true
        })) return;
        await coptenCikar(k.copId);
        await copuCiz();
        // Grup kalici silindi - gorselleri artik oksuz
        const { oksuzleriTemizle } = await import('./yedek.js');
        oksuzleriTemizle().catch(() => {});
    });

    araclar.append(geri, sil);
    a.appendChild(araclar);

    const tarih = document.createElement('span');
    tarih.className = 'copTarihEtiketi';
    tarih.textContent = c('silindiTarih', tarihMetni(k.silinme));
    a.appendChild(tarih);

    return a;
}

/**
 * Copteki bir grubun kartlarini gosterir.
 * Ust seritte geri donus baglantisi birakiyoruz - kullanici cop
 * listesine nasil donecegini bulamiyordu.
 */
async function copGrubunuAc(g) {
    const kap = el('kartKabi');
    kap.textContent = '';

    el('copBaslik').textContent = g.baslik;
    el('copSayi').textContent = c('nKartSilinmisGrup', g.kartlar.length);

    // Geri donus dugmesi - bir kez ekleniyor
    if (!el('copGeriDon')) {
        const geri = document.createElement('button');
        geri.type = 'button';
        geri.id = 'copGeriDon';
        geri.className = 'copSeritDugme';
        geri.textContent = '← ' + c('copKutusu');
        geri.addEventListener('click', copuCiz);
        el('copKap').insertBefore(geri, el('copBosalt'));
    }
    el('copGeriDon').hidden = false;

    for (const k of g.kartlar) {
        const a = document.createElement('div');
        a.className = 'kart copKart';

        const govde = document.createElement('span');
        govde.className = 'kartGovde';

        const baslik = document.createElement('span');
        baslik.className = 'kartBaslik';
        baslik.textContent = k.baslik || k.url;

        const gorsel = document.createElement('span');
        gorsel.className = 'kartGorsel';
        if (k.gorsel && k.gorsel.gorsel) {
            gorsel.style.backgroundImage = `url('${k.gorsel.gorsel}')`;
        }

        govde.append(baslik, gorsel);
        a.appendChild(govde);

        if (k.renk) {
            const serit = document.createElement('span');
            serit.className = 'kartRenk';
            serit.style.backgroundColor = k.renk;
            a.appendChild(serit);
        }
        if (k.not) a.classList.add('notlu');

        // Tek kart geri alma / silme
        const araclar = document.createElement('span');
        araclar.className = 'copKartAraclari';

        const geri = document.createElement('button');
        geri.type = 'button';
        geri.className = 'copKartDugme';
        geri.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${COP_SVG.geri}</svg>Geri Al`;
        geri.addEventListener('click', () => tekKartiGeriAl(g, k));

        const sil = document.createElement('button');
        sil.type = 'button';
        sil.className = 'copKartDugme yikici';
        sil.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${COP_SVG.sil}</svg>${c('kaliciSil')}`;
        sil.addEventListener('click', async () => {
            if (!await onaySor({
                baslik: c('kaliciSil'),
                metin: `"${k.baslik || k.url}" tamamen silinecek.`,
                evet: c('sil'), tehlikeli: true
            })) return;
            await kartiGruptanCikar(g, k);
        });

        araclar.append(geri, sil);
        a.appendChild(araclar);

        kap.appendChild(a);
    }
}

/**
 * Silinmis gruptaki TEK karti geri alir.
 * Grup artik yok, o yuzden hedef grubu kullaniciya sorduruyoruz.
 */
async function tekKartiGeriAl(g, k) {
    // Dinamik import: `grupSec` etkilesim.js'te ve o da bu dosyayi
    // kullaniyor - statik import dongu yaratirdi
    const { grupSec } = await import('./etkilesim.js');
    const hedef = await grupSec(null, c('kartiNereyeAlalim'));
    if (!hedef) return;

    try {
        await chrome.bookmarks.create({
            parentId: hedef, title: k.baslik, url: k.url
        });

        const a = urlNormalle(k.url);
        const mevcut = await chrome.storage.local.get(
            ['kartNotlari', 'kartRenkleri', 'kartSayaclari']);
        const yaz = {};
        if (k.gorsel) yaz[a] = k.gorsel;
        if (k.not)   yaz.kartNotlari   = { ...(mevcut.kartNotlari || {}),   [a]: k.not };
        if (k.renk)  yaz.kartRenkleri  = { ...(mevcut.kartRenkleri || {}),  [a]: k.renk };
        if (k.sayac) yaz.kartSayaclari = { ...(mevcut.kartSayaclari || {}), [a]: k.sayac };
        if (Object.keys(yaz).length) await chrome.storage.local.set(yaz);

        await kartiGruptanCikar(g, k, false);
        bildir(c('kartGeriAlindi'));
    } catch (e) {
        console.log('[WSD] kart geri alinamadi:', e);
        bildir(c('geriAlinamadi'));
    }
}

/** Kayittan bir karti cikarir; grup bosalirsa kaydi tumden siler. */
async function kartiGruptanCikar(g, k, haberVer = true) {
    const { copGuncelle } = await import('./cop.js');

    g.kartlar = g.kartlar.filter(x => x.url !== k.url);

    if (g.kartlar.length) {
        await copGuncelle(g.copId, { kartlar: g.kartlar });
        await copGrubunuAc(g);          // listeyi tazele
    } else {
        // Son kart da cikti - grup kaydini tutmanin anlami yok
        await coptenCikar(g.copId);
        await copuCiz();
    }
    if (haberVer) bildir(c('kaliciOlarakSilindi'));
}

/**
 * Silinmeden ONCE kartin tum verisini toplar.
 * Yer imi silinince gorseli/notu/rengi de kaybolacagi icin hepsini
 * burada saklayip geri almada yeniden yaziyoruz.
 */
export async function kartiYedekle(kartId, url) {
    try {
        const [dugum] = await chrome.bookmarks.get(kartId);
        const depo = await chrome.storage.local.get([
            url, 'kartNotlari', 'kartRenkleri', 'kartSayaclari'
        ]);
        return {
            baslik: dugum.title,
            url: dugum.url,
            parentId: dugum.parentId,
            index: dugum.index,
            gorsel: depo[url] || null,
            not: (depo.kartNotlari || {})[url] || null,
            renk: (depo.kartRenkleri || {})[url] || null,
            sayac: (depo.kartSayaclari || {})[url] || null
        };
    } catch (e) {
        return null;
    }
}

/** Yedeklenen karti geri oluşturur. */
export async function kartiGeriAl(y, tazele = true) {
    if (!y) return;
    try {
        await chrome.bookmarks.create({
            parentId: y.parentId,
            index: y.index,
            title: y.baslik,
            url: y.url
        });

        const anahtar = urlNormalle(y.url);
        const yaz = {};
        if (y.gorsel) yaz[anahtar] = y.gorsel;

        // Not/renk/sayac tek parca nesneler - mevcutla birlestiriyoruz
        const mevcut = await chrome.storage.local.get(
            ['kartNotlari', 'kartRenkleri', 'kartSayaclari']);
        if (y.not) yaz.kartNotlari = { ...(mevcut.kartNotlari || {}), [anahtar]: y.not };
        if (y.renk) yaz.kartRenkleri = { ...(mevcut.kartRenkleri || {}), [anahtar]: y.renk };
        if (y.sayac) yaz.kartSayaclari = { ...(mevcut.kartSayaclari || {}), [anahtar]: y.sayac };

        if (Object.keys(yaz).length) await chrome.storage.local.set(yaz);

        if (tazele) {
            await grubuAc(aktifGrup());
            bildir(c('kartGeriAlindi'));
        }
    } catch (e) {
        console.log('[WSD] kart geri alinamadi:', e);
        bildir(c('geriAlinamadi'));
    }
}

/**
 * Grubu ve icindeki HER SEYI yedekler.
 * Grup silmek geri alinamaz bir islem: tek tikla onlarca kart gidiyor.
 */
export async function grubuYedekle(grupId) {
    try {
        const { kartlariAl } = await import('./yerimi.js');
        const { ikonlariAl, gorunumleriAl } = await import('./grupikon.js');

        const [dugum] = await chrome.bookmarks.get(grupId);
        const kartlar = await kartlariAl(grupId);
        const ikonlar = await ikonlariAl();
        const gorunumler = await gorunumleriAl();

        const depo = await chrome.storage.local.get([
            ...kartlar.map(k => urlNormalle(k.url)),
            'kartNotlari', 'kartRenkleri', 'kartSayaclari'
        ]);

        return {
            tur: 'grup',
            baslik: dugum.title,
            index: dugum.index,
            ikon: ikonlar[grupId] || null,
            gorunum: gorunumler[grupId] || null,
            kartlar: kartlar.map(k => {
                const a = urlNormalle(k.url);
                return {
                    baslik: k.baslik,
                    url: k.url,
                    gorsel: depo[a] || null,
                    not: (depo.kartNotlari || {})[a] || null,
                    renk: (depo.kartRenkleri || {})[a] || null,
                    sayac: (depo.kartSayaclari || {})[a] || null
                };
            })
        };
    } catch (e) {
        console.log('[WSD] grup yedeklenemedi:', e);
        return null;
    }
}

/** Yedeklenen grubu kartlariyla birlikte geri olusturur. */
export async function grubuGeriAl(y) {
    if (!y || y.tur !== 'grup') return;
    try {
        const { kokKlasoruAl } = await import('./yerimi.js');
        const { ikonYaz, gorunumYaz } = await import('./grupikon.js');

        const kok = await kokKlasoruAl();
        const grup = await chrome.bookmarks.create({
            parentId: kok, index: y.index, title: y.baslik
        });

        if (y.ikon) await ikonYaz(grup.id, y.ikon);
        if (y.gorunum) await gorunumYaz(grup.id, y.gorunum);

        // Kart verilerini TEK yazmada topluyoruz: kart basina ayri
        // `storage.set` cagrisi 50 kartlik grupta gorunur gecikme yapiyor
        const mevcut = await chrome.storage.local.get(
            ['kartNotlari', 'kartRenkleri', 'kartSayaclari']);
        const yaz = {
            kartNotlari:   { ...(mevcut.kartNotlari || {}) },
            kartRenkleri:  { ...(mevcut.kartRenkleri || {}) },
            kartSayaclari: { ...(mevcut.kartSayaclari || {}) }
        };

        for (const k of y.kartlar) {
            await chrome.bookmarks.create({
                parentId: grup.id, title: k.baslik, url: k.url
            }).catch(() => {});

            const a = urlNormalle(k.url);
            if (k.gorsel) yaz[a] = k.gorsel;
            if (k.not)   yaz.kartNotlari[a] = k.not;
            if (k.renk)  yaz.kartRenkleri[a] = k.renk;
            if (k.sayac) yaz.kartSayaclari[a] = k.sayac;
        }

        await chrome.storage.local.set(yaz);
        await arayuzuKur();
        menuTazele();
    } catch (e) {
        console.log('[WSD] grup geri alinamadi:', e);
        bildir(c('geriAlinamadi'));
    }
}
