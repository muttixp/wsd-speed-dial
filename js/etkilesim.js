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

// WSD Speed Dial - etkilesim katmani
// Grup ekleme, kart ekleme/duzenleme/silme, gorsel yenileme, sag tik menuleri.

import { grupEkle, grupSil, kartEkle, kartGuncelle, kartSil, kartGuncelleBaslik,
         urlNormalle } from './yerimi.js';
import { c } from './dil.js';
import { aktifGrup, arayuzuKur, grubuAc, kartGorseliniTazele } from './cizim.js';
import { gruplariAl, gorunurGruplariAl, kokKlasoruAl } from './yerimi.js';
import { RENKLER, renkleriAl, renkYaz } from './renk.js';
import { karuseliKur, karuseliYukle, adayEkle, zeminAyarla, secimDurumu } from './karusel.js';
import { adaylariYaz } from './gorsel.js';
import { onayPenceresiniKur, onaySor, metinSor } from './onay.js';
import { bildir, pencereAc, pencereKapat, sayfaKaydirmasiniTazele,
         pencereIzleyiciyiKur, kacisliMetin, acikPencereyiKapat,
         tazelemeyiBastir, menuTazele } from './arayuz.js';
import { notAl, notYaz } from './not.js';
import { sayacArtir, sayacAl, sayacSifirla, tarihMetni } from './sayac.js';
import { copeAt } from './cop.js';
import { copPenceresiniKur, copPenceresiniAc,
         kartiYedekle, kartiGeriAl, grubuYedekle, grubuGeriAl } from './copekrani.js';

import { grupPenceresiniKur, grupPenceresiniAc, ikonYaz, gorunumYaz } from './gruppencere.js';
import { yonetPenceresiniKur, yonetPenceresiniAc } from './gruplariyonet.js';

let menuKartId = null;
let menuKartUrl = null;
let menuGrupId = null;
let duzenlenenKartId = null;      // null ise "ekle", doluysa "duzenle"
let duzenlenenUrl = null;         // renk kaydinda kullaniliyor
let secilenRenk = null;

const el = id => document.getElementById(id);

export function etkilesimiKur() {
    yanAraclariKur();
    seritDugmeleriniKur();
    karsilamaKur();
    onayPenceresiniKur();
    grupPenceresiniKur();
    yonetPenceresiniKur();
    copPenceresiniKur();
    import('./kopyalar.js').then(m => m.kopyaEkraniniKur()).catch(() => {});
    siralaPenceresiniKur();
    pencereIzleyiciyiKur();
    kartPenceresiniKur();
    menuleriKur();


    // "+" karti ve arac seridi - kap uzerinden dinliyoruz cunku kartlar
    // her grup degisiminde yeniden ciziliyor; kart basina dinleyici baglamak
    // hem israf hem sizinti kaynagi olurdu.
    // ORTA TIK: tarayici chrome:// adreslerini bagalanti olarak acmiyor,
    // orta tikta da sessizce hicbir sey olmuyor. Ozel semalarda olayi
    // devralip arka planda sekme aciyoruz. Normal adreslerde tarayicinin
    // kendi davranisina KARISMIYORUZ.
    el('kartKabi')?.addEventListener('auxclick', e => {
        if (e.button !== 1) return;
        const kart = e.target.closest('.kart:not(.ekleKart)');
        if (!kart || e.target.closest('.kartArac')) return;
        if (!OZEL_SEMA.test(kart.href)) return;
        e.preventDefault();
        sayacArtir(kart.dataset.anahtar).catch(() => {});
        ozelSemaAc(kart.href, 'arkaplan');
    });

    // Orta tikin otomatik kaydirma imlecini ve varsayilan gezinmeyi engelle
    el('kartKabi')?.addEventListener('mousedown', e => {
        if (e.button !== 1) return;
        const kart = e.target.closest('.kart:not(.ekleKart)');
        if (kart && OZEL_SEMA.test(kart.href)) e.preventDefault();
    });

    el('kartKabi')?.addEventListener('click', async e => {
        if (e.target.closest('.ekleKart')) return kartPenceresiniAc(null);

        // Ziyaret sayaci - arac dugmesine basildiysa saymiyoruz
        const acilanKart = e.target.closest('.kart:not(.ekleKart)');
        if (acilanKart && !e.target.closest('.kartArac')) {
            sayacArtir(acilanKart.dataset.anahtar).catch(() => {});

            // Ctrl/Cmd/orta tik zaten tarayicinin kendi davranisi -
            // ona KARISMIYORUZ, yoksa iki sekme aciliyor.
            const ozelTik = e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1;
            const kip = document.body.dataset.kartAcilis || 'ayni';

            // chrome:// vb. adresler bagalanti olarak acilamiyor
            if (OZEL_SEMA.test(acilanKart.href)) {
                e.preventDefault();
                ozelSemaAc(acilanKart.href, ozelTik ? 'yeni' : kip);
                return;
            }

            if (!ozelTik && kip !== 'ayni') {
                e.preventDefault();
                if (kip === 'arkaplan') {
                    // Arka planda acmak icin tarayici API'si gerekiyor:
                    // window.open odagi hedefe veriyor.
                    chrome.tabs.create({ url: acilanKart.href, active: false })
                        .catch(() => window.open(acilanKart.href, '_blank'));
                } else {
                    window.open(acilanKart.href, '_blank');
                }
                return;
            }
        }

        const aracBtn = e.target.closest('.kartArac');
        if (!aracBtn) return;

        // Kart bir <a>: aracin tiklamasi sayfayi acmasin
        e.preventDefault();
        e.stopPropagation();

        const kart = aracBtn.closest('.kart');
        await kartAraciCalistir(aracBtn.dataset.arac, kart);
    });
}

/* ---------- Yan arac seridi ---------- */

// Her seyi gizle kipi: kartlar, grup seridi ve arac dugmeleri gizlenip
// yalnizca duvar kagidi kaliyor. Goz butonu KENDI gorunur kaliyor,
// yoksa kullanici geri donemez.
let icerikGizli = false;

function karsilamaKur() {
    el('karsilamaEkle')?.addEventListener('click', () => kartPenceresiniAc(null));
    // Dogrudan dosya seciciyi ac.
    // Once ayar panelini acip Yedekleme bolumune goturuyordu; kullanici
    // "ice aktar" deyip ayar paneliyle karsilasinca bir adim daha
    // atmak zorunda kaliyordu.
    el('karsilamaAktar')?.addEventListener('click', () => {
        el('ayYedekSecici')?.click();
    });
}


function seritDugmeleriniKur() {
    // Serit yeniden ciziliyor - dinleyici KAP uzerinde
    el('grupSeridi')?.addEventListener('click', e => {
        if (e.target.closest('.grupEkle')) grupEklePenceresi();
    });
}

function yanAraclariKur() {
    el('gozBtn')?.addEventListener('click', e => {
        e.stopPropagation();
        icerikGizli = !icerikGizli;
        document.body.classList.toggle('icerikGizli', icerikGizli);

        // Ikon durumu yansitsin: acik goz -> gizle, cizgili goz -> goster
        el('gozBtn').querySelector('.gozAcik').hidden = icerikGizli;
        el('gozBtn').querySelector('.gozKapali').hidden = !icerikGizli;
        el('gozBtn').title = icerikGizli ? c('iceriginiGoster') : c('herSeyiGizle');
    });

    // Gizli kipteyken Escape geri getirsin - buton kacirilirsa cikis yolu
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && icerikGizli) el('gozBtn').click();
    });
}

/** Kisayollardan cagrilan sarmalayicilar. */
export function kartEklePenceresi() { kartPenceresiniAc(null); }
export function grupEklePenceresiDis() { grupEklePenceresi(); }

export function gruplariYonetDis() {
    yonetPenceresiniAc(async degisti => {
        if (!degisti) return;
        await arayuzuKur();
        menuTazele();
        bildir(c('gruplarGuncellendi'));
    });
}

/* ---------- Grup ---------- */

async function grupEklePenceresi() {
    tazelemeyiBastir();
    const sonuc = await grupPenceresiniAc(null);
    if (!sonuc) return;
    try {
        const g = await grupEkle(sonuc.ad);
        await ikonYaz(g.id, sonuc.ikon);
        await gorunumYaz(g.id, { gosterim: sonuc.gosterim, renk: sonuc.renk, aciklama: sonuc.aciklama });
        await arayuzuKur();
        await grubuAc(g.id);
        menuTazele();
        bildir(c('grupOlusturuldu'));
    } catch (e) {
        bildir(c('grupOlusturulamadi'));
    }
}

/* ---------- Kart penceresi ---------- */

/** Renk noktalarini cizer. Bir kez kuruluyor, secim `secilenRenk`te. */
function renkSeciciyiKur() {
    const kap = el('kpRenkler');
    if (!kap || kap.children.length) return;

    for (const r of RENKLER) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'renkNokta' + (r.deger ? '' : ' bos');
        b.dataset.renk = r.deger || '';
        b.title = r.ad;
        if (r.deger) b.style.backgroundColor = r.deger;
        else b.textContent = '\u2715';

        b.addEventListener('click', () => {
            secilenRenk = r.deger;
            renkSeciminiGoster();
        });
        kap.appendChild(b);
    }
}

function renkSeciminiGoster() {
    for (const b of el('kpRenkler').children) {
        b.classList.toggle('secili', (b.dataset.renk || null) === secilenRenk);
    }
}

/** Grup acilir listesini doldurur, kartin mevcut grubunu secer. */
async function grupListesiniDoldur(seciliId) {
    const sec = el('kpGrup');
    if (!sec) return;
    sec.textContent = '';
    // Gizli Ana Sayfa listede YOK: gizlenmis bir grubu secenek olarak
    // sunmak celiskili olurdu.
    const gruplar = await gorunurGruplariAl();
    const hedefId = gruplar.some(g => g.id === (seciliId || aktifGrup()))
        ? (seciliId || aktifGrup())
        : (gruplar[0]?.id || aktifGrup());
    for (const g of gruplar) {
        const o = document.createElement('option');
        o.value = g.id;
        o.textContent = g.baslik;
        sec.appendChild(o);
    }
    sec.value = hedefId;
}

function kartPenceresiniKur() {
    renkSeciciyiKur();
    karuseliKur();
    gorselAraclariniKur();
    notPenceresiniKur();
    tasiPenceresiniKur();
    el('kpIptal')?.addEventListener('click', kartPenceresiniKapat);
    el('kpKaydet')?.addEventListener('click', kartiKaydet);

    el('kartPencere')?.addEventListener('click', e => {
        if (e.target.id === 'kartPencere') kartPenceresiniKapat();
    });

    // Enter ile kaydet, Escape ile kapat
    for (const id of ['kpBaslik', 'kpUrl']) {
        el(id)?.addEventListener('keydown', e => {
            if (e.key === 'Enter') kartiKaydet();
            if (e.key === 'Escape') kartPenceresiniKapat();
        });
    }
}

/**
 * Bulunan logolari kucuk izgarada gosterir; tiklanan karusele girer.
 * Kart penceresi acilip kapanirken temizleniyor - yoksa onceki kartin
 * adaylari yeni kartta duruyordu.
 */
function logoAdaylariniGoster(kartlar) {
    const liste = el('kpLogoListe');
    if (!liste) return;
    liste.textContent = '';
    for (const veri of kartlar) {
        const dugme = document.createElement('button');
        dugme.type = 'button';
        dugme.className = 'logoAday';
        const gorsel = document.createElement('img');
        gorsel.src = veri;
        dugme.appendChild(gorsel);
        dugme.addEventListener('click', () => {
            adayEkle(veri);                       // SADECE tiklanan eklenir
            logoAdaylariniGizle();
            bildir(c('logoEklendi'));
        });
        liste.appendChild(dugme);
    }
    el('kpLogoIzgara').hidden = false;
}

function logoAdaylariniGizle() {
    const izgara = el('kpLogoIzgara');
    if (!izgara) return;
    izgara.hidden = true;
    el('kpLogoListe').textContent = '';
}

/**
 * chrome:// edge:// about: gibi adresler BAGLANTI TIKLAMASIYLA
 * acilamiyor - tarayici engelliyor, sessizce hicbir sey olmuyor.
 * Bunlari yalnizca eklenti API'siyle acabiliyoruz.
 */
const OZEL_SEMA = /^(chrome|edge|brave|vivaldi|opera|about|chrome-extension|chrome-search|devtools|view-source|file):/i;

function ozelSemaAc(url, kip) {
    if (kip === 'ayni') {
        chrome.tabs.update({ url }).catch(() => {});
    } else {
        chrome.tabs.create({ url, active: kip !== 'arkaplan' }).catch(() => {});
    }
}

async function kartPenceresiniAc(kart) {
    duzenlenenKartId = kart ? kart.id : null;
    duzenlenenUrl    = kart ? kart.url : null;

    el('kartPencereBaslik').textContent = kart ? c('kartiDuzenle') : 'Kart Ekle';
    el('kpBaslik').value = kart ? kart.baslik : '';
    el('kpUrl').value    = kart ? kart.url : '';

    // Ziyaret bilgisi - yalnizca duzenlemede anlamli
    const sayacEl = el('kpSayac');
    if (kart) {
        const sy = await sayacAl(kart.url);
        if (sy.adet) {
            const ne = tarihMetni(sy.son);
            sayacEl.innerHTML = c('nKezAcildi', sy.adet) +
                (ne ? ` \u00B7 ${c('sonAcilis', ne)}` : '') +
                ` \u00B7 <button type="button" class="metinDugme" id="kpSayacSifirla">${c('sifirlaKucuk')}</button>`;
            el('kpSayac').hidden = false;
            setTimeout(() => {
                document.getElementById('kpSayacSifirla')?.addEventListener('click', async () => {
                    await sayacSifirla(kart.url);
                    sayacEl.hidden = true;
                });
            }, 0);
        } else {
            sayacEl.innerHTML = c('henuzAcilmadi');
            sayacEl.hidden = false;
        }
    } else {
        sayacEl.hidden = true;
    }

    await grupListesiniDoldur(kart ? kart.grupId : aktifGrup());

    const renkler = await renkleriAl();
    secilenRenk = kart ? (renkler[kart.url] || null) : null;
    renkSeciminiGoster();

    await karuseliYukle(kart ? kart.url : null);
    logoAdaylariniGizle();          // onceki kartin logo adaylari duruyordu

    pencereAc('kartPencere', kart ? kart.url : null);
    el('kpUrl').focus();
}

function kartPenceresiniKapat() {
    pencereKapat('kartPencere');
    logoAdaylariniGizle();
    duzenlenenKartId = null;
}

async function kartiKaydet() {
    tazelemeyiBastir();
    const baslik = el('kpBaslik').value.trim();
    let url = el('kpUrl').value.trim();
    if (!url) return;

    // Sema yoksa https varsay - kullanici "site.com" yazabiliyor
    if (!/^[a-z][a-z0-9+.-]*:/i.test(url)) url = 'https://' + url;
    url = urlNormalle(url);

    const hedefGrup = el('kpGrup')?.value || aktifGrup();

    try {
        if (duzenlenenKartId) {
            await kartGuncelle(duzenlenenKartId, { title: baslik || url, url });
            // Grup degistiyse tasi
            const a = document.querySelector(`[data-kart-id="${duzenlenenKartId}"]`);
            if (a && hedefGrup !== aktifGrup()) {
                await chrome.bookmarks.move(duzenlenenKartId, { parentId: hedefGrup });
            }
            // URL degistiyse eski renk kaydi oksuz kalmasin
            if (duzenlenenUrl && duzenlenenUrl !== url) {
                await renkYaz(duzenlenenUrl, null);
            }
        } else {
            await kartEkle(hedefGrup, baslik || url, url);
        }

        await renkYaz(url, secilenRenk);

        // Karuseldeki secim ve varsa kullanicinin ekledigi gorseller
        const { adaylar: kAdaylar, secim: kSecim, zemin: kZemin } = secimDurumu();
        if (kAdaylar.length) {
            await adaylariYaz(url, kAdaylar, kSecim);
            if (kZemin) {
                const { zeminYaz } = await import('./gorsel.js');
                await zeminYaz(url, kZemin);
            }
        }

        kartPenceresiniKapat();
        await grubuAc(aktifGrup());
        // Gorsel yoksa arka plan onCreated ile zaten yakalayacak;
        // duzenlemede URL degismis olabilir, acikca isteyelim.
        if (duzenlenenKartId) gorselIste(url);
    } catch (e) {
        bildir(c('kaydedilemedi'));
    }
}

/* ---------- Cop kutusu ---------- */
//
// Ayri bir pencere DEGIL, arama gibi ana izgarada gosteriliyor:
// kartlar buyuk gorunuyor, hangi karti geri aldigin net oluyor.





















/* ---------- Kartlari sirala ---------- */
//
// Siralama KALICI BIR AYAR DEGIL, tek seferlik komut.
// Kalici olsaydi surukle-birak ile catisirdi: kullanicinin elle
// verdigi sira her acilista bozulurdu.

let siralanacakGrup = null;

export function siralaPenceresiniKur() {
    el('siralaIptal')?.addEventListener('click', () => pencereKapat('siralaPencere'));

    el('siralaSecenekler')?.addEventListener('click', async e => {
        const d = e.target.closest('.secenek');
        if (!d || !siralanacakGrup) return;
        pencereKapat('siralaPencere');
        await siralamayiUygula(siralanacakGrup, d.dataset.olcut);
    });
}

async function siralaPenceresiniAc(grupId) {
    siralanacakGrup = grupId;
    pencereAc('siralaPencere');
}

async function siralamayiUygula(grupId, olcut) {
    tazelemeyiBastir(3000);
    try {
        const { kartlariAl, sirayiUygula } = await import('./yerimi.js');
        const { sayaclariAl } = await import('./sayac.js');

        const kartlar = await kartlariAl(grupId);
        if (kartlar.length < 2) return bildir(c('siralanacakYeterliKartYok'));

        // Ekleme sirasi icin yer imi `dateAdded` degeri gerekiyor
        const dugumler = await chrome.bookmarks.getChildren(grupId);
        const tarih = {};
        for (const d of dugumler) if (d.url) tarih[d.id] = d.dateAdded || 0;

        const sayaclar = await sayaclariAl();
        const ziyaret = k => (sayaclar[urlNormalle(k.url)] || {}).adet || 0;
        const ad = k => (k.baslik || k.url).toLocaleLowerCase('tr');

        const siralayici = {
            az:      (a, b) => ad(a).localeCompare(ad(b), 'tr'),
            za:      (a, b) => ad(b).localeCompare(ad(a), 'tr'),
            ziyaret: (a, b) => ziyaret(b) - ziyaret(a) || ad(a).localeCompare(ad(b), 'tr'),
            yeni:    (a, b) => (tarih[b.id] || 0) - (tarih[a.id] || 0),
            eski:    (a, b) => (tarih[a.id] || 0) - (tarih[b.id] || 0)
        }[olcut];
        if (!siralayici) return;

        const eskiSira = kartlar.map(k => k.id);
        const yeni = [...kartlar].sort(siralayici).map(k => k.id);
        if (yeni.join() === eskiSira.join()) return bildir(c('kartlarZatenBuSirada'));

        // Elle verilmis bir sirayi bozmak geri alinamayan bir istek gibi
        // hissettiriyor - once soruyoruz
        if (!await onaySor({
            baslik: c('kartlariSirala'),
            metin: c('nKartSirasiDegisecek', kartlar.length),
            evet: c('sirala')
        })) return;

        await sirayiUygula(grupId, yeni);
        await grubuAc(aktifGrup());

        bildir(c('nKartSiralandi', kartlar.length), {
            etiket: c('geriAl'),
            // Uzun sure: kullanici siralamanin sonucunu gorup karar veriyor,
            // 8 saniye buna yetmiyor
            sure: 30000,
            calistir: async () => {
                await sirayiUygula(grupId, eskiSira);
                await grubuAc(aktifGrup());
                bildir(c('eskiSiraGeriAlindi'));
            }
        });
    } catch (e) {
        console.log('[WSD] siralanamadi:', e);
        bildir(c('siralanamadi'));
    }
}

/* ---------- Not penceresi ---------- */

let notUrl = null;

function notPenceresiniKur() {
    el('notKaydet')?.addEventListener('click', async () => {
        await notYaz(notUrl, el('notAlan').value);
        pencereKapat('notPencere');
        await grubuAc(aktifGrup());
        bildir(c('notKaydedildi'));
    });
    el('notSil')?.addEventListener('click', async () => {
        await notYaz(notUrl, '');
        pencereKapat('notPencere');
        await grubuAc(aktifGrup());
        bildir(c('notSilindi'));
    });
    el('notPencere')?.addEventListener('click', e => {
        if (e.target.id === 'notPencere') pencereKapat('notPencere');
    });
}

async function notPenceresiniAc(url, baslik) {
    notUrl = url;
    const mevcut = await notAl(url);
    el('notBaslik').textContent = mevcut ? c('notuDuzenle') : 'Not Ekle';
    el('notKartAdi').innerHTML = baslik ? `<b>${kacisliMetin(baslik)}</b>` : '';
    el('notKartAdi').hidden = !baslik;
    el('notAlan').value = mevcut;
    el('notSil').hidden = !mevcut;

    // Hangi kart uzerinde calisildigi belli olsun
    pencereAc('notPencere', url);
    setTimeout(() => el('notAlan').focus(), 30);
}


















/* ---------- Tasima penceresi ---------- */

let tasinanKartId = null;

let grupSecCozucu = null;

/**
 * Hedef grup sectirir.
 * @param haric  listeden cikarilacak grup id (zaten oradaysa)
 * @returns Promise<grupId|null>
 */
export async function grupSec(haric = null, baslik = 'Hedef Grup') {
    const sec = el('tasiGrup');
    sec.textContent = '';

    const gruplar = await gorunurGruplariAl();
    for (const g of gruplar) {
        if (g.id === haric) continue;
        const o = document.createElement('option');
        o.value = g.id;
        o.textContent = g.baslik;
        sec.appendChild(o);
    }
    if (!sec.children.length) { bildir(c('baskaGrupYok')); return null; }

    el('tasiPencere').querySelector('h2').textContent = baslik;
    el('tasiPencere').hidden = false;
    el('perde').classList.add('acik');

    return new Promise(coz => { grupSecCozucu = coz; });
}

function grupSecKapat(sonuc) {
    const coz = grupSecCozucu;
    grupSecCozucu = null;
    el('tasiPencere').hidden = true;
    if (!el('ayarPanel').classList.contains('acik')) {
        el('perde').classList.remove('acik');
    }
    if (coz) coz(sonuc);
}

function tasiPenceresiniKur() {
    el('tasiIptal')?.addEventListener('click', () => {
        if (grupSecCozucu) return grupSecKapat(null);
        el('tasiPencere').hidden = true;
        if (!el('ayarPanel').classList.contains('acik')) el('perde').classList.remove('acik');
    });
    // Pencere ici bosluk tiklamasi PERDEYE dusuyor (pencerede
    // `pointer-events: none` var), ayri dinleyiciye gerek yok.
    //
    // Onceki hali perdeyi KOSULSUZ kapatiyordu: acilir listeye tiklamak
    // bile golgeyi kaldiriyordu.
    el('tasiOnay')?.addEventListener('click', async () => {
        // Grup secici kipindeysek Promise'i coz, tasima yapma
        if (grupSecCozucu) return grupSecKapat(el('tasiGrup').value);

        const hedef = el('tasiGrup').value;
        el('tasiPencere').hidden = true;
        if (!el('ayarPanel').classList.contains('acik')) el('perde').classList.remove('acik');
        try {
            await chrome.bookmarks.move(tasinanKartId, { parentId: hedef });
            await grubuAc(aktifGrup());
            bildir(c('kartTasindi'));
        } catch (e) {
            bildir(c('tasinamadi'));
        }
    });
}

async function tasiPenceresiniAc(kartId) {
    tasinanKartId = kartId;
    const sec = el('tasiGrup');
    sec.textContent = '';
    const gruplar = await gorunurGruplariAl();
    for (const g of gruplar) {
        if (g.id === aktifGrup()) continue;      // zaten bu gruptayiz
        const o = document.createElement('option');
        o.value = g.id;
        o.textContent = g.baslik;
        sec.appendChild(o);
    }
    if (!sec.children.length) return bildir(c('baskaGrupYok'));
    el('tasiPencere').hidden = false;
    el('perde').classList.add('acik');
}

/* ---------- Gorsel araclari ---------- */

function gorselAraclariniKur() {
    // 1) Dosyadan gorsel
    el('kpDosya')?.addEventListener('click', () => el('kpDosyaSecici').click());
    el('kpDosyaSecici')?.addEventListener('change', async e => {
        const dosya = e.target.files && e.target.files[0];
        if (!dosya) return;
        try {
            adayEkle(await dosyayiOku(dosya));
        } catch (err) {
            bildir(c('dosyaOkunamadi'));
        }
        e.target.value = '';           // ayni dosya tekrar secilebilsin
    });

    // 2) URL'den gorsel
    el('kpUrlGorsel')?.addEventListener('click', async () => {
        const adres = await metinSor({
            baslik: c('goruntuUrlsi'),
            metin: c('gorselAdresiniYapistirin'),
            evet: c('ekle')
        });
        if (!adres) return;
        try {
            const yanit = await fetch(adres, { credentials: 'omit' });
            if (!yanit.ok) throw new Error('indirilemedi');
            const blob = await yanit.blob();
            if (!blob.type.startsWith('image/')) throw new Error(c('gorselDegil'));
            adayEkle(await blobOku(blob));
        } catch (err) {
            bildir(c('goruntuAlinamadi'));
        }
    });

    // 3) Arka plan rengi - gorsel seffafsa/kucukse arkasi bu renk olur
    el('kpZemin')?.addEventListener('click', () => el('kpZeminSecici').click());
    el('kpZeminSecici')?.addEventListener('input', e => zeminAyarla(e.target.value));

    // Sahne Yakala: sayfayi acar, kullanici sahneyi secip ceker,
    // cekilen kare karusele aday olarak eklenir. Video sitelerinde
    // poster/placeholder yerine gercek bir sahne yakalamak icin.
    el('kpSahne')?.addEventListener('click', async () => {
        const url = el('kpUrl').value.trim();
        if (!url) return bildir(c('onceAdresGirin'));

        const btn = el('kpSahne');
        btn.disabled = true;
        try {
            const { elleYakala } = await import('./yakalama.js');
            const veri = await elleYakala(url);
            if (veri) {
                adayEkle(veri);       // karusele ekle + secili yap
                bildir(c('sahneEklendi'));
            }
        } catch (e) {
            console.log('[WSD] sahne yakalanamadi:', e);
            bildir(c('yakalanamadi'));
        } finally {
            btn.disabled = false;
        }
    });

    // Logo Yakala: sitenin kendi logosunu duz zemine ortalayip aday ekler.
    // Ekran goruntusu ile ayni akis, farkli kaynak.
    el('kpLogo')?.addEventListener('click', async () => {
        const url = el('kpUrl').value.trim();
        if (!url) return bildir(c('onceAdresGirin'));

        const btn = el('kpLogo');
        btn.disabled = true;
        try {
            const { logoYakala } = await import('./yakalama.js');
            const kartlar = await logoYakala(url);
            if (kartlar.length) {
                logoAdaylariniGoster(kartlar);        // karusele DEGIL, secime sunuluyor
            } else {
                logoAdaylariniGizle();
                bildir(c('logoBulunamadi'));
            }
        } catch (e) {
            console.log('[WSD] logo yakalanamadi:', e);
            bildir(c('yakalanamadi'));
        } finally {
            btn.disabled = false;
        }
    });

    // 4) Gosterilen gorseli indir
    el('kpIndir')?.addEventListener('click', async () => {
        const { gorsel } = secimDurumu();
        if (!gorsel) return bildir(c('indirilecekGorselYok'));

        const ad = (el('kpBaslik').value || 'kart').replace(/[^\w\d-]+/g, '_').slice(0, 40);

        // Depoda WEBP tutuyoruz (yer kazanci) ama kullanici indirdiginde
        // AYARLARDAKI bicimi bekliyor - webp cogu goruntuleyicide acilmiyor
        const { ayarlariAl } = await import('./ayar.js');
        const ayar = await ayarlariAl();
        const hedef = ayar.gorselBicimi === 'png' ? 'png' : 'jpeg';

        let veri = gorsel;
        try {
            veri = await bicimeCevir(gorsel, hedef, ayar.jpegKalitesi);
        } catch (e) {
            console.log('[WSD] bicim cevrilemedi, ozgun hali iniyor:', e);
        }

        const a = document.createElement('a');
        a.href = veri;
        a.download = ad + uzanti(veri);
        a.click();
    });
}

/**
 * Gorseli istenen bicime cevirir.
 *
 * Depoda WebP duruyor; JPEG'e cevirirken SAYDAMLIK kayboluyor ve
 * saydam alanlar siyah cikiyor - bu yuzden once beyaz zemin basiliyor.
 */
function bicimeCevir(dataUri, hedef, kalite = 85) {
    return new Promise((coz, red) => {
        const g = new Image();
        g.onload = () => {
            const t = document.createElement('canvas');
            t.width = g.naturalWidth;
            t.height = g.naturalHeight;
            const ctx = t.getContext('2d');

            if (hedef === 'jpeg') {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, t.width, t.height);
            }
            ctx.drawImage(g, 0, 0);

            coz(hedef === 'png'
                ? t.toDataURL('image/png')
                : t.toDataURL('image/jpeg', Math.min(100, Math.max(1, kalite)) / 100));
        };
        g.onerror = () => red(new Error(c('gorselYuklenemedi')));
        g.src = dataUri;
    });
}

/**
 * Data URI'nin MIME turunden dosya uzantisi cikarir.
 *
 * Onceden yalnizca png/jpg ayrimi vardi; gorselleri WEBP'ye
 * kucuIttugumuz icin cogu kayit `.jpg` adiyla iniyordu ve dosya
 * gorsel goruntuleyicide acilmiyordu.
 */
function uzanti(dataUri) {
    const m = /^data:image\/([a-z0-9.+-]+)/i.exec(String(dataUri));
    if (!m) return '.png';
    const tur = m[1].toLowerCase();
    return {
        jpeg: '.jpg', jpg: '.jpg', png: '.png', webp: '.webp',
        gif: '.gif', 'svg+xml': '.svg', avif: '.avif', bmp: '.bmp'
    }[tur] || '.' + tur.replace(/[^a-z0-9]/g, '');
}

function dosyayiOku(dosya) {
    return blobOku(dosya);
}

function blobOku(blob) {
    return new Promise((coz, red) => {
        const o = new FileReader();
        o.onload  = () => coz(o.result);
        o.onerror = () => red(new Error('okunamadi'));
        o.readAsDataURL(blob);
    });
}

/**
 * Ekrani tazeler - HANGI EKRANDAYSAK ONU.
 *
 * `grubuAc()` her zaman normal izgaraya donuyordu; yinelenen kartlar
 * ya da cop ekranindayken bir kart silince o ekran kapanip gruba
 * donuyordu ve kullanici yerini kaybediyordu.
 */
async function ekraniTazele() {
    if (document.body.classList.contains('kopyaAcik')) {
        const { kopyaEkraniniAc } = await import('./kopyalar.js');
        return kopyaEkraniniAc();
    }
    if (document.body.classList.contains('copAcik')) {
        return copPenceresiniAc();
    }
    if (document.body.classList.contains('aramaAcik')) {
        const { aramayiTazele } = await import('./arama.js');
        return aramayiTazele();
    }
    return grubuAc(aktifGrup());
}

/* ---------- Kart uzeri araclar ---------- */

/**
 * Kartin bulundugu grubu dondurur.
 *
 * Normal izgarada aktif gruptur, ama arama ve yinelenen kartlar
 * ekranlarinda kartlar baska gruplardan geliyor - yer iminin kendi
 * `parentId`'sine bakmak gerekiyor.
 */
async function kartinGrubu(kartId) {
    try {
        const [d] = await chrome.bookmarks.get(kartId);
        return d.parentId || aktifGrup();
    } catch (e) {
        return aktifGrup();
    }
}

async function kartAraciCalistir(arac, kart) {
    tazelemeyiBastir();
    if (!kart) return;
    const kartId = kart.dataset.kartId;
    const url    = kart.dataset.anahtar;
    const baslik = kart.querySelector('.kartBaslik')?.textContent || '';

    // Kartin GERCEK grubu - arama ve yinelenen kartlar ekranlarinda
    // aktif grup kartin bulundugu grup DEGIL
    const grupId = await kartinGrubu(kartId);

    switch (arac) {
        case 'duzenle':
            kartPenceresiniAc({ id: kartId, baslik, url, grupId });
            break;

        case 'not':
            await notPenceresiniAc(url, baslik);
            break;

        case 'yenile':
            await gorseliYenile(kartId, url);
            break;

        case 'tasi': {
            const gruplar = await gruplariAl();
            if (gruplar.length < 2) return bildir(c('baskaGrupYok'));
            await tasiPenceresiniAc(kartId);
            break;
        }

        case 'sil':
            if (!await onaySor({
                baslik: c('kartiSil'),
                metin: c('copeTasinacak', baslik),
                evet: c('sil'), tehlikeli: true,
                hatirla: 'kartSil'
            })) return;
            try {
                const yedek = await kartiYedekle(kartId, url);
                await copeAt(yedek);
                await kartSil(kartId);
                await ekraniTazele();
                bildir(c('kartSilindi'), {
                    etiket: c('geriAl'),
                    calistir: () => kartiGeriAl(yedek)
                });
            } catch (e) {
                bildir(c('silinemedi'));
            }
            break;
    }
}

/* ---------- Menuler ---------- */

function menuleriKur() {
    const kap = el('kartKabi');

    kap?.addEventListener('contextmenu', async e => {
        const kart = e.target.closest('.kart:not(.ekleKart)');
        if (!kart) return;

        // COP KUTUSUNDA menu YANILTICI: kartlar artik yer imi degil,
        // "Düzenle" ya da "Taşı" hicbir sey yapamaz. Orada kartin
        // uzerindeki Geri Al / Kalıcı Sil dugmeleri gecerli olan.
        if (document.body.classList.contains('copAcik')) {
            e.preventDefault();
            return;
        }

        e.preventDefault();
        menuKartId  = kart.dataset.kartId;
        menuKartUrl = kart.dataset.anahtar;
        isaretle(kart);

        // Tek grup varsa "Tasi" anlamsiz - devre disi birak.
        // Gizlemek yerine soluk gostermek daha iyi: menu duzeni sabit kaliyor
        // ve kullanici ogenin var oldugunu biliyor.
        const gruplar = await gruplariAl();
        const tasiOge = el('kartMenu').querySelector('[data-eylem="tasi"]');
        if (tasiOge) tasiOge.classList.toggle('pasif', gruplar.length < 2);

        menuyuAc(el('kartMenu'), e.clientX, e.clientY);
    });

    el('grupSeridi')?.addEventListener('contextmenu', async e => {
        const sekme = e.target.closest('.grupSekme');
        if (!sekme) return;
        e.preventDefault();
        menuGrupId = sekme.dataset.grupId;

        // "Ana Sayfa" kok klasor: silinemez ve adi degistirilemez, ama
        // DIGER islemler gecerli. Once menuyu tumden kapatiyordum;
        // boylece kok gruptaki kartlar siralanamiyordu.
        const kok = await kokKlasoruAl();
        const kokMu = menuGrupId === kok;

        for (const li of el('grupMenu').children) {
            const eylem = li.dataset.eylem;
            li.hidden = kokMu && (eylem === 'grupYenidenAdlandir' || eylem === 'grupSil');
        }

        menuyuAc(el('grupMenu'), e.clientX, e.clientY);
    });

    // Bos alan: kart, grup sekmesi, menu ya da pencere DISINDA sag tik.
    // Belge duzeyinde dinliyoruz - yoksa izgaranin disindaki bosluklarda
    // (kenar boslugu, alt bosluk) tarayici menusu cikiyordu.
    document.addEventListener('contextmenu', e => {
        // Gercek kart -> kart menusu (asagidaki kap dinleyicisi acar)
        // "+" karti .kart sinifini tasiyor ama BOS ALAN sayilmali:
        // uzerinde tarayici menusu cikiyordu.
        if (e.target.closest('.kart:not(.ekleKart)')) return;
        if (e.target.closest('.grupSekme, .menu, .pencere, #ayarPanel')) return;

        // Metin secimi / form alani varsa tarayici menusu isine yarar
        if (e.target.closest('input, textarea, select')) return;

        e.preventDefault();

        // COP ve YINELENEN KARTLAR ekranlarinda "Ekle" / "Yeni Grup"
        // anlamsiz: kullanici o an bir listeyi inceliyor, kart eklemiyor.
        // Tarayici menusu de cikmasin diye preventDefault ustte.
        if (document.body.classList.contains('copAcik')) return;
        if (document.body.classList.contains('kopyaAcik')) return;

        menuyuAc(el('bosMenu'), e.clientX, e.clientY);
    });

    el('kartMenu')?.addEventListener('click', e => kartMenuEylemi(e));
    el('grupMenu')?.addEventListener('click', e => grupMenuEylemi(e));
    el('bosMenu')?.addEventListener('click',  e => bosMenuEylemi(e));

    // Perdeye tiklama: ACIK PENCERE varsa onu, yoksa menuleri kapatir.
    // Pencerelere `pointer-events: none` verdigimiz icin bosluk tiklamasi
    // artik pencereye degil perdeye geliyor.
    //
    // TIKLAMA PERDEDE BASLAMALI: acilir liste (select) kapanirken olusan
    // tiklama perdeye dusuyor ve pencere kendiliginden kapaniyordu.
    // Ayni koruma metin secerken imleci disari kaydirmayi da kurtariyor.
    let perdedeBasladi = false;

    el('perde')?.addEventListener('mousedown', e => {
        perdedeBasladi = e.target === el('perde');
    });

    el('perde')?.addEventListener('click', e => {
        if (!perdedeBasladi || e.target !== el('perde')) {
            perdedeBasladi = false;
            return;
        }
        perdedeBasladi = false;
        if (acikPencereyiKapat()) return;
        menuleriKapat();
    });
    document.addEventListener('keydown', e => {
        if (e.key !== 'Escape') return;
        if (acikPencereyiKapat()) return;
        menuleriKapat();
    });
    window.addEventListener('blur', menuleriKapat);

    // KAYDIRMA menuyu kapatir: menu `position: fixed`, sayfa kayarken
    // yerinde duruyor ve isaret ettigi karttan kopuyordu.
    // `capture` sart - kaydirma ic kaplarda da olabiliyor.
    //
    // YALNIZCA MENU ACIKKEN calisiyor: pencere acilinca `overflow: hidden`
    // uygulaniyor ve sayfa kaydirilmissa tarayici bir scroll olayi
    // uretiyor - o da perdeyi kaldiriyordu.
    window.addEventListener('scroll', () => {
        const menuAcik = ['kartMenu', 'grupMenu', 'bosMenu']
            .some(id => el(id) && !el(id).hidden);
        if (menuAcik) menuleriKapat();
    }, { capture: true, passive: true });
}

function menuyuAc(menu, x, y) {
    menuleriKapat(false);
    menu.hidden = false;
    // Ekran disina tasmasin
    const k = menu.getBoundingClientRect();
    menu.style.left = Math.min(x, innerWidth  - k.width  - 8) + 'px';
    menu.style.top  = Math.min(y, innerHeight - k.height - 8) + 'px';
    el('perde').classList.add('acik');
}

function menuleriKapat(perdeyiDeKapat = true) {
    el('kartMenu').hidden = true;
    el('grupMenu').hidden = true;
    el('bosMenu').hidden = true;

    // ACIK PENCERE VARSA perde kalir.
    //
    // Dosya secici ya da indirme baslatinca pencere odagi kayboluyor,
    // `blur` menuleri kapatiyordu ve perde de gidiyordu - Duzenle
    // penceresi karartmasiz ortada kaliyordu.
    const pencereAcik = !!document.querySelector('.pencere:not([hidden])');
    const panelAcik = el('ayarPanel').classList.contains('acik');

    if (perdeyiDeKapat && !panelAcik && !pencereAcik) {
        el('perde').classList.remove('acik');
    }
    isaretiTemizle();
}

function isaretle(kart) {
    isaretiTemizle();
    kart.classList.add('menuHedef');
}
function isaretiTemizle() {
    document.querySelectorAll('.kart.menuHedef').forEach(k => k.classList.remove('menuHedef'));
}

async function kartMenuEylemi(e) {
    tazelemeyiBastir();
    const oge = e.target.closest('li');
    if (!oge || oge.classList.contains('pasif')) return;
    const eylem = oge.dataset.eylem;
    if (!eylem || !menuKartId) return;

    const a = document.querySelector(`[data-kart-id="${menuKartId}"]`);
    const url = menuKartUrl;
    const baslik = a?.querySelector('.kartBaslik')?.textContent || '';
    menuleriKapat();

    switch (eylem) {
        case 'ac':
            if (OZEL_SEMA.test(url)) ozelSemaAc(url, 'ayni');
            else location.href = url;
            break;
        case 'yeniSekme':
            if (OZEL_SEMA.test(url)) ozelSemaAc(url, 'yeni');
            else window.open(url, '_blank');
            break;
        case 'gizliSekme':
            // Gizli pencere acmak icin arka plan gerekiyor: on yuzden
            // dogrudan incognito acilamiyor.
            chrome.runtime.sendMessage({ hedef: 'arkaplan', tur: 'gizliAc', url })
                .catch(() => bildir(c('gizliPencereAcilamadi')));
            break;

        case 'yenile':
            await gorseliYenile(menuKartId, url);
            break;

        case 'not':
            await notPenceresiniAc(url, baslik);
            break;

        case 'kopyala':
            try {
                await navigator.clipboard.writeText(url);
                bildir(c('adresKopyalandi'));
            } catch (err) {
                bildir(c('kopyalanamadi'));
            }
            break;

        case 'tasi':
            await tasiPenceresiniAc(menuKartId);
            break;
        case 'duzenle':
            kartPenceresiniAc({ id: menuKartId, baslik, url, grupId: aktifGrup() });
            break;
        case 'sil':
            if (!await onaySor({
                baslik: c('kartiSil'),
                metin: c('copeTasinacak', baslik),
                evet: c('sil'), tehlikeli: true,
                hatirla: 'kartSil'
            })) return;
            try {
                const yedek = await kartiYedekle(menuKartId, url);
                await copeAt(yedek);
                await kartSil(menuKartId);
                await ekraniTazele();
                bildir(c('kartSilindi'), {
                    etiket: c('geriAl'),
                    calistir: () => kartiGeriAl(yedek)
                });
            } catch (err) {
                bildir(c('silinemedi'));
            }
            break;
    }
}

async function grupMenuEylemi(e) {
    tazelemeyiBastir();
    const eylem = e.target.closest('li')?.dataset.eylem;
    if (!eylem || !menuGrupId) return;
    const id = menuGrupId;
    menuleriKapat();

    if (eylem === 'grupHepsiniAc' || eylem === 'grupYeniSekmeGrubu') {
        // Grubun kartlarini oku - aktif grup olmayabilir
        const { kartlariAl } = await import('./yerimi.js');
        const kartlar = await kartlariAl(id);
        if (!kartlar.length) return bildir(c('buGrupBos'));

        if (kartlar.length > 8 && !await onaySor({
            baslik: c('hepsiniAcBd'),
            metin: c('nSekmeAcilacak', kartlar.length),
            evet: c('ac')
        })) return;

        if (eylem === 'grupYeniSekmeGrubu') {
            // Yeni PENCEREDE ac: sekme gruplama API'si her tarayicida yok,
            // ayri pencere her yerde calisiyor ve ayni izolasyonu veriyor.
            chrome.windows.create({ url: kartlar.map(k => k.url) })
                .catch(() => bildir(c('pencereAcilamadi')));
        } else {
            for (const k of kartlar) window.open(k.url, '_blank');
        }
        return;
    }

    if (eylem === 'grupSirala') {
        await siralaPenceresiniAc(id);
        return;
    }

    if (eylem === 'grupYenile') {
        const { kartlariAl } = await import('./yerimi.js');
        const kartlar = await kartlariAl(id);
        if (!kartlar.length) return bildir(c('buGrupBos'));

        if (!await onaySor({
            baslik: c('gorselleriYenile'),
            metin: c('nKartGorseliYenilenecek', kartlar.length),
            evet: c('baslat')
        })) return;

        // Aktif grupta degilsek de calisir: kartlarin DOM karsiligi
        // olmayabilir, o yuzden dogrudan URL uzerinden istiyoruz.
        for (const k of kartlar) {
            const temiz = urlNormalle(k.url);
            try { await chrome.storage.local.remove(temiz); } catch (e) { /* yoktu */ }
            gorselIste(temiz);
            const a = document.querySelector(`[data-kart-id="${k.id}"]`);
            a?.classList.add('yenileniyor');
        }
        bildir(c('nKartKuyrugaAlindi', kartlar.length));
        return;
    }

    if (eylem === 'gruplariYonet') {
        await yonetPenceresiniAc(async degisti => {
            if (!degisti) return;
            await arayuzuKur();
            menuTazele();
            bildir(c('gruplarGuncellendi'));
        });
        return;
    }

    if (eylem === 'grupYenidenAdlandir') {
        const mevcut = document.querySelector(`[data-grup-id="${id}"] .grupAd`)?.textContent || '';
        const sonuc = await grupPenceresiniAc({ id, baslik: mevcut });
        if (!sonuc) return;
        try {
            await kartGuncelleBaslik(id, sonuc.ad);
            await ikonYaz(id, sonuc.ikon);
            await gorunumYaz(id, { gosterim: sonuc.gosterim, renk: sonuc.renk, aciklama: sonuc.aciklama });
            await arayuzuKur();
            menuTazele();
            bildir(c('grupGuncellendi'));
        } catch (e) {
            console.log('[WSD] grup adi degistirilemedi:', e);
            bildir(c('yenidenAdlandirilamadi'));
        }
    } else if (eylem === 'grupSil') {
        if (!await onaySor({
            baslik: c('grubuSil'),
            metin: c('grupVeIcindekiTumKartlarCop'),
            evet: c('sil'), tehlikeli: true,
            hatirla: 'grupSil'
        })) return;

        try {
            const yedek = await grubuYedekle(id);
            if (yedek) await copeAt(yedek);

            await grupSil(id);
            // Silinen grup aktifse ilk gruba don - yoksa bos ekran kaliyor
            if (aktifGrup() === id) {
                const kalanlar = await gruplariAl();
                await grubuAc(kalanlar[0].id);
            }
            await arayuzuKur();
            menuTazele();

            // NOT: oksuz temizligi YAPMIYORUZ - grup cop kutusunda ve
            // gorselleri orada duruyor. Temizlik onlari silerse geri
            // alinan kartlar gorselsiz doner.
            bildir(c('grupSilindiNKart', yedek ? yedek.kartlar.length : 0), {
                etiket: c('geriAl'),
                calistir: () => grubuGeriAl(yedek)
            });
        } catch (e) {
            console.log('[WSD] grup silinemedi:', e);
            bildir(c('grupSilinemedi') + (e.message || 'bilinmeyen hata'));
        }
    }
}

async function bosMenuEylemi(e) {
    const oge = e.target.closest('li');
    const eylem = oge && oge.dataset.eylem;
    if (!eylem) return;
    menuleriKapat();

    switch (eylem) {
        case 'ekle':
            kartPenceresiniAc(null);
            break;

        case 'yeniGrup':
            await grupEklePenceresi();
            break;

        case 'hepsiniAc': {
            const kartlar = [...document.querySelectorAll('.kart:not(.ekleKart)')];
            if (!kartlar.length) return bildir(c('acilacakKartYok'));
            if (kartlar.length > 8 && !await onaySor({
                baslik: c('hepsiniAcBd'),
                metin: c('nSekmeAcilacakDevam', kartlar.length),
                evet: c('ac')
            })) return;
            for (const k of kartlar) window.open(k.href, '_blank');
            break;
        }

        case 'hepsiniYenile': {
            const kartlar = [...document.querySelectorAll('.kart:not(.ekleKart)')];
            if (!kartlar.length) return bildir(c('yenilenecekKartYok'));
            if (!await onaySor({
                baslik: c('hepsiniYenile'),
                metin: c('nKartYenidenYakalanacak', kartlar.length),
                evet: c('baslat')
            })) return;
            for (const k of kartlar) {
                await gorseliYenile(k.dataset.kartId, k.dataset.anahtar);
            }
            bildir(c('nKartKuyrugaAlindi2', kartlar.length));
            break;
        }

        case 'yinelenenler': {
            const { kopyaEkraniniAc } = await import('./kopyalar.js');
            await kopyaEkraniniAc();
            break;
        }

        case 'copKutusu':
            await copPenceresiniAc();
            break;

        case 'ayarlar':
            el('ayarPanel').classList.add('acik');
            el('perde').classList.add('acik');
            break;
    }
}

/* ---------- Gorsel yenileme ---------- */

// Donencenin en az ne kadar gorunecegi. Yakalama cok hizli basarisiz
// oldugunda donence bir anda kalkiyor ve kullanici "hicbir sey olmadi"
// saniyor. Alt sinir koyuyoruz ki islem yapildigi anlasilsin.
const DONENCE_EN_AZ_MS = 900;
const donenceBaslangic = new Map();

async function gorseliYenile(kartId, url) {
    const a = document.querySelector(`[data-kart-id="${kartId}"]`);
    if (!a) return;
    a.classList.add('yenileniyor');
    donenceBaslangic.set(url, Date.now());

    // Eski gorseli sil ki yakalama yenisini yazsin
    try { await chrome.storage.local.remove(url); } catch (e) { /* yoktu */ }

    gorselIste(url);

    // Guvenlik: yakalama patlarsa donence sonsuza kadar donmesin
    setTimeout(() => donenceyiKaldir(url), 30000);
}

function donenceyiKaldir(url) {
    donenceBaslangic.delete(url);
    for (const a of document.querySelectorAll('.kart[data-anahtar]')) {
        if (a.dataset.anahtar === url) a.classList.remove('yenileniyor');
    }
}


function gorselIste(url) {
    chrome.runtime.sendMessage({ hedef: 'arkaplan', tur: 'gorselIste', url })
        .catch(() => {});
}

/** Arka plan gorseli hazirlayinca donenceyi kaldirip karti tazeler. */
export async function gorselHazir(url, basarili = true) {

    // Donence alt sinirini doldur
    const bas = donenceBaslangic.get(url);
    const gecen = bas ? Date.now() - bas : DONENCE_EN_AZ_MS;
    if (gecen < DONENCE_EN_AZ_MS) {
        await new Promise(r => setTimeout(r, DONENCE_EN_AZ_MS - gecen));
    }

    donenceyiKaldir(url);

    if (basarili) {
        await kartGorseliniTazele(url);
        bildir(c('gorselYenilendi'));
    } else {
        bildir(c('gorselAlinamadi'));
    }
}

/* ---------- Bildirim ---------- */












// Cekirdek arayuz islevleri buradan da disari aciliyor: cagiran
// dosyalar (wsd.js, ayarpanel.js) tek noktadan almaya devam etsin
export { bildir, sayfaKaydirmasiniTazele, pencereIzleyiciyiKur } from './arayuz.js';
export { copPenceresiniAc } from './copekrani.js';
