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

// WSD Speed Dial - cizim katmani
// DOM kurulumu burada; veri erisimi yerimi.js'te.

import { gruplariAl, gorunurGruplariAl, kartlariAl, kartSayilariAl, urlNormalle } from './yerimi.js';
import { c } from './dil.js';
import { gorselAl, kucult, SISKIN_ESIK } from './gorsel.js';
import { renkleriAl } from './renk.js';
import { ayarlariAl } from './ayar.js';
import { notlariAl } from './not.js';
import { ikonlariAl, gorunumleriAl } from './grupikon.js';
import { ikonHTML } from './ikon.js';

let aktifGrupId = null;
const grupSeridi = () => document.getElementById('grupSeridi');
const kartKabi   = () => document.getElementById('kartKabi');

export function aktifGrup() {
    return aktifGrupId;
}

export async function arayuzuKur() {
    let gruplar = await gorunurGruplariAl();

    // Ana Sayfa gizlenip tum gruplar silinmisse liste bos kalabiliyor.
    // Bos listede `gruplar[0].id` cokuyordu - koke geri donuyoruz.
    if (!gruplar.length) gruplar = await gruplariAl();
    if (!gruplar.length) return;
    const sayilar = await kartSayilariAl(gruplar.map(g => g.id));
    const ikonlar = await ikonlariAl();
    const gorunumler = await gorunumleriAl();

    grupSeridiCiz(gruplar, sayilar, ikonlar, gorunumler);

    // Son grubu hatirlama kapaliysa her acilista Ana Sayfa'dan basla
    const ayar = await ayarlariAl();
    if (ayar.grubuHatirla === false) {
        await grubuAc(gruplar[0].id);
        return;
    }

    const sonGrup = localStorage.getItem('wsdSonGrup');
    const gecerli = gruplar.find(g => g.id === sonGrup);
    await grubuAc(gecerli ? sonGrup : gruplar[0].id);
}

function grupSeridiCiz(gruplar, sayilar, ikonlar = {}, gorunumler = {}) {
    const serit = grupSeridi();
    serit.textContent = '';

    for (const g of gruplar) {
        const btn = document.createElement('button');
        btn.className = 'grupSekme';
        btn.dataset.grupId = g.id;
        btn.type = 'button';
        // Kok grup yerinde sabit kalir
        btn.draggable = !g.kokMu;

        // Kok grup icin varsayilan ev ikonu, digerleri klasor
        const ikonDeger = ikonlar[g.id] || (g.kokMu ? 'home' : 'folder');
        const ikon = document.createElement('span');
        ikon.className = 'grupIkon';
        ikon.innerHTML = ikonHTML(ikonDeger);

        // Gruba ozel renk genel ayari eziyor
        const gorunum = gorunumler[g.id] || {};
        if (gorunum.renk) ikon.style.color = gorunum.renk;
        btn.appendChild(ikon);

        // Gruba ozel gosterim modu
        if (gorunum.gosterim) btn.classList.add('grupOzel-' + gorunum.gosterim);

        const ad = document.createElement('span');
        ad.className = 'grupAd';
        ad.textContent = g.baslik;
        btn.appendChild(ad);

        // Kart sayisi SEKMEDE gosterilmiyor - yer kapliyor, ipucunda veriliyor.
        // ACIKLAMA varsa ipucuna ekleniyor: kisa ad/ikon kullanan grubun
        // ne icin oldugunu ustune gelince gormek icin.
        const n = sayilar[g.id] || 0;
        const sayiMetni = n ? c('nKart', n) : c('bos');
        btn.title = gorunum.aciklama
            ? `${g.baslik} — ${sayiMetni}\n${gorunum.aciklama}`
            : `${g.baslik} — ${sayiMetni}`;

        btn.addEventListener('click', () => grubuAc(g.id));
        serit.appendChild(btn);
    }

    serit.appendChild(grupEkleDugmesi());
    seritTekeriniBagla();
    // Cizim bittikten sonra olculer kesinlessin
    requestAnimationFrame(oklariTazele);
}

/** Seridin sonundaki "+" - yeni grup ekler. */
function grupEkleDugmesi() {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'grupSekme grupEkle';
    b.id = 'seritGrupEkle';
    b.title = c('yeniGrup');
    b.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 5v14M5 12h14"/></svg>`;
    return b;
}

/**
 * Serit dolunca fare tekeri YATAY kaydirsin.
 * Dikey teker hareketi seride yansimazsa kullanici sagdaki sekmelere
 * ulasmak icin tutup surüklemek zorunda kaliyor.
 */
let tekerBagli = false;
function seritTekeriniBagla() {
    if (tekerBagli) return;
    const serit = grupSeridi();
    if (!serit) return;
    tekerBagli = true;

    serit.addEventListener('wheel', e => {
        if (e.deltaY === 0) return;
        if (serit.scrollWidth <= serit.clientWidth) return;   // tasma yok
        e.preventDefault();
        serit.scrollLeft += e.deltaY;
    }, { passive: false });

    serit.addEventListener('scroll', oklariTazele);

    // Pencere olcusu degisince aktif sekme gorunur alandan cikabiliyor:
    // serit daralinca secili grup saga kayip gozden kayboluyordu.
    let olcuZaman = null;
    window.addEventListener('resize', () => {
        oklariTazele();
        clearTimeout(olcuZaman);
        olcuZaman = setTimeout(aktifSekmeyiGoster, 150);
    });

    // Oklar seridi UCA kadar goturuyor - kismi kaydirma yerine bas/son,
    // kullanici "basa don" derken tek tiklamada varmak istiyor.
    document.getElementById('seritSol')?.addEventListener('click', () => {
        serit.scrollTo({ left: 0, behavior: 'smooth' });
    });
    document.getElementById('seritSag')?.addEventListener('click', () => {
        serit.scrollTo({ left: serit.scrollWidth, behavior: 'smooth' });
    });
}

/** Aktif sekmeyi gorunur alana getirir. */
export function aktifSekmeyiGoster() {
    const s = grupSeridi()?.querySelector('.grupSekme.aktif');
    if (!s) return;
    s.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'instant' });
    oklariTazele();
}

/** Oklar yalnizca o yonde kaydirilacak yer varken gorunur. */
function oklariTazele() {
    const serit = grupSeridi();
    const sol = document.getElementById('seritSol');
    const sag = document.getElementById('seritSag');
    if (!serit || !sol || !sag) return;

    const tasma = serit.scrollWidth - serit.clientWidth;
    if (tasma <= 1) {
        sol.hidden = true;
        sag.hidden = true;
        return;
    }
    // 2px pay: kesirli olculerde tam uca varilamiyor
    sol.hidden = serit.scrollLeft <= 2;
    sag.hidden = serit.scrollLeft >= tasma - 2;
}

export async function grubuAc(grupId) {
    // Grup DEGISTIYSE sayfayi basa al: onceki grupta asagidaysan yeni
    // grupta da asagida basliyordun ve ustteki kartlari kacirıyordun.
    // Ayni grup yeniden ciziliyorsa (tazeleme) kaydirma korunuyor.
    const grupDegisti = aktifGrupId !== null && aktifGrupId !== grupId;

    aktifGrupId = grupId;
    localStorage.setItem('wsdSonGrup', grupId);

    let aktifSekme = null;
    for (const s of grupSeridi().children) {
        const aktifMi = s.dataset.grupId === grupId;
        s.classList.toggle('aktif', aktifMi);
        if (aktifMi) aktifSekme = s;
    }

    // Kaydirma BIR KARE SONRA: acilista serit henuz olculmemis oluyor
    // ve `scrollIntoView` etkisiz kaliyordu - sayfa yenilendiginde
    // secili grup gorunmez kaliyordu.
    requestAnimationFrame(() => {
        aktifSekme?.scrollIntoView({ block: 'nearest', inline: 'center',
                                     behavior: 'instant' });
        oklariTazele();
    });

    if (grupDegisti) window.scrollTo({ top: 0, behavior: 'instant' });

    const kartlar = await kartlariAl(grupId);

    // Karsilama: HIC kart yoksa ve tek grup varsa (yani daha hicbir sey
    // eklenmemis). Kullanici gruba girip bosaltmissa gostermiyoruz -
    // orada "+" karti yeterli, karsilama metni yer kaplar.
    const gruplar = await gorunurGruplariAl();
    const bosDurum = kartlar.length === 0 && gruplar.length <= 1;
    document.body.classList.toggle('bosDurum', bosDurum);
    const kars = document.getElementById('karsilama');
    if (kars) kars.hidden = !bosDurum;

    kartlariCiz(kartlar);
    gorselleriUygula(kartlar);
    renkleriUygula(kartlar);
    notlariUygula(kartlar);
}

function kartlariCiz(kartlar) {
    const kap = kartKabi();
    kap.textContent = '';

    for (const k of kartlar) {
        kap.appendChild(kartOlustur(k));
    }
    kap.appendChild(ekleKartiOlustur());
}

function kartOlustur(k) {
    const a = document.createElement('a');
    a.className = 'kart';
    a.href = k.url;
    a.draggable = true;
    a.dataset.kartId = k.id;
    // Gorsel arama anahtari: normallestirilmis URL.
    a.dataset.anahtar = urlNormalle(k.url);

    const govde = document.createElement('span');
    govde.className = 'kartGovde';

    const baslik = document.createElement('span');
    baslik.className = 'kartBaslik';
    baslik.textContent = k.baslik || k.url;

    // Ipucu YALNIZCA basliklar gizliyken: gorunen basligi ikinci kez
    // gostermek gereksiz gurultu.
    if (document.body.classList.contains('basliklarKapali')) {
        a.title = k.baslik || k.url;
    }

    // NOT: gorsel kutusu BASLIKTAN SONRA ekleniyor ama DOM sirasi
    // (baslik, gorsel) olarak sabit - konum yerine SINIFLA erisilecek.
    const gorsel = document.createElement('span');
    gorsel.className = 'kartGorsel';

    govde.append(baslik, gorsel);
    a.appendChild(govde);

    // Renk etiketi seridi - varsa doldurulacak
    const serit = document.createElement('span');
    serit.className = 'kartRenk';
    serit.hidden = true;
    a.appendChild(serit);

    a.appendChild(kartAraclariOlustur());
    return a;
}

// Kart uzerine gelince cikan arac seridi.
// Her buton `data-arac` tasiyor; tiklamalar etkilesim.js'te TEK bir
// dinleyiciyle yakalaniyor (kart sayisi kadar dinleyici baglanmasin).
const KART_ARACLARI = [
    ['duzenle', c('duzenle'), '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/>'],
    ['not',     'Not',     '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>'],
    ['yenile',  'Yenile',  '<path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 3v6h-6"/>'],
    ['tasi',    c('tasi'),    '<path d="M5 9l-3 3 3 3"/><path d="M9 5l3-3 3 3"/><path d="M15 19l-3 3-3-3"/><path d="M19 9l3 3-3 3"/><path d="M2 12h20M12 2v20"/>'],
    ['sil',     'Sil',     '<path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>'],
];

export function kartAraclariOlustur() {
    const kap = document.createElement('span');
    kap.className = 'kartAraclari';

    for (const [arac, baslik, yol] of KART_ARACLARI) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'kartArac';
        b.dataset.arac = arac;
        b.title = baslik;
        b.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${yol}</svg>`;
        kap.appendChild(b);
    }
    return kap;
}


/** Notu olan kartlara kose isareti koyar. */
export async function notlariUygula(kartlar) {
    const notlar = await notlariAl();
    for (const k of kartlar) {
        const a = document.querySelector(`[data-kart-id="${k.id}"]`);
        if (!a) continue;
        // Yalnizca kose isareti - not METNI ipucunda GOSTERILMIYOR:
        // uzun notlar ekrani kapliyor ve baslik ipucunun yerini aliyordu.
        a.classList.toggle('notlu', !!notlar[urlNormalle(k.url)]);
    }
}

/** Kart renk etiketlerini basar. */
export async function renkleriUygula(kartlar) {
    const renkler = await renkleriAl();
    for (const k of kartlar) {
        const renk = renkler[urlNormalle(k.url)];
        const serit = document.querySelector(`[data-kart-id="${k.id}"] .kartRenk`);
        if (!serit) continue;
        if (renk) {
            serit.style.backgroundColor = renk;
            serit.hidden = false;
        } else {
            serit.hidden = true;
        }
    }
}

/**
 * "+" karti normal kartla AYNI yapiyi kullaniyor: baslik satiri (bos ama
 * yer kaplayan) + gorsel kutusu. Boylece cerceve tam olarak diger kartlarin
 * gorsel alaniyla hizalaniyor - CSS'te ayri yukseklik hesabi gerekmiyor.
 */
function ekleKartiOlustur() {
    const b = document.createElement('button');
    b.className = 'kart ekleKart';
    b.type = 'button';
    b.title = c('kartEkle');

    const govde = document.createElement('span');
    govde.className = 'kartGovde';

    const baslik = document.createElement('span');
    baslik.className = 'kartBaslik';
    baslik.innerHTML = '&nbsp;';          // bos ama yer kaplasin

    const kutu = document.createElement('span');
    kutu.className = 'ekleKutu';
    kutu.textContent = '+';

    govde.append(baslik, kutu);
    b.appendChild(govde);
    return b;
}

/** Depodaki gorselleri kartlara basar. Tek okuma ile toplu. */
async function gorselleriUygula(kartlar) {
    const anahtarlar = kartlar.map(k => urlNormalle(k.url));
    if (!anahtarlar.length) return;

    const kayitlar = await gorselAl(anahtarlar);

    // Yakalama kuyrugunda bekleyen kartlar donence gostersin - sayfa
    // yenilendiginde de durum korunuyor
    let kuyrukta = [];
    try {
        const d = await chrome.storage.local.get('yakalamaKuyrugu');
        if (Array.isArray(d.yakalamaKuyrugu)) kuyrukta = d.yakalamaKuyrugu;
    } catch (e) { /* onemli degil */ }
    for (const k of kartlar) {
        const anahtar = urlNormalle(k.url);
        const veri = kayitlar[anahtar];

        if (!veri || !veri.gorsel) {
            // Gorsel yok ama zemin rengi secilmisse onu goster
            if (veri && veri.zemin) {
                const bos = document.querySelector(`[data-kart-id="${k.id}"] .kartGorsel`);
                if (bos) bos.style.backgroundColor = veri.zemin;
            }
            if (kuyrukta.includes(anahtar)) {
                document.querySelector(`[data-kart-id="${k.id}"]`)
                    ?.classList.add('yenileniyor');
            }
            continue;
        }

        const el = document.querySelector(`[data-kart-id="${k.id}"] .kartGorsel`);
        if (el) {
            el.style.backgroundImage = `url('${veri.gorsel}')`;
            // Zemin rengi: saydam gorsellerde arkada gorunur, ayrica
            // "sigdir" modunda kenar bosluklarini doldurur
            if (veri.zemin) el.style.backgroundColor = veri.zemin;
        }

        // Arka plan gorseli HAM yaziyor (servis iscisinde DOM yok).
        // Kart goruntulendiginde burada kucultup geri yaziyoruz.
        //
        // ADAYLAR da kontrol ediliyor: yakalama artik birden fazla aday
        // donduruyor ve yalnizca gosterileni kucultunce digerleri ham
        // JPEG olarak kaliyordu - tek aday 1.8 MB'a ulasmisti.
        const siskinMi = veri.gorsel.length >= SISKIN_ESIK ||
            (Array.isArray(veri.adaylar) &&
             veri.adaylar.some(a => typeof a === 'string' && a.length >= SISKIN_ESIK));

        if (siskinMi) sikistirmayaEkle(urlNormalle(k.url), veri);
    }
}

/** Tek bir kartin gorselini yerinde tazeler (yakalama bitince cagriliyor). */
export async function kartGorseliniTazele(anahtar) {
    const kayit = await gorselAl(anahtar);
    const veri = kayit[anahtar];
    if (!veri || !veri.gorsel) return;

    for (const a of document.querySelectorAll('.kart[data-anahtar]')) {
        if (a.dataset.anahtar !== anahtar) continue;
        const el = a.querySelector('.kartGorsel');
        if (el) el.style.backgroundImage = `url('${veri.gorsel}')`;
    }
    const siskin = veri.gorsel.length >= SISKIN_ESIK ||
        (Array.isArray(veri.adaylar) &&
         veri.adaylar.some(a => typeof a === 'string' && a.length >= SISKIN_ESIK));
    if (siskin) sikistirmayaEkle(anahtar, veri);
}

// --- Sikistirma kuyrugu ---
//
// Bosta calisan bir kuyruk. requestIdleCallback KULLANILMIYOR: bosta-zamani
// hic gelmeyebiliyor ve kuyruk sessizce oluyor. Duz zamanlayici ongorulebilir.
const sikistirmaKuyrugu = [];
let sikistirmaCalisiyor = false;

function sikistirmayaEkle(anahtar, kayit) {
    if (sikistirmaKuyrugu.some(x => x.anahtar === anahtar)) return;
    sikistirmaKuyrugu.push({ anahtar, kayit });
    if (!sikistirmaCalisiyor) sikistirmayiBaslat();
}

function sikistirmayiBaslat() {
    sikistirmaCalisiyor = true;
    setTimeout(async () => {
        try {
            // Adaylar da kuculdugu icin parti kucuk: her kayit birkac
            // gorsel isleyebiliyor
            const parti = sikistirmaKuyrugu.splice(0, 2);

            for (const { anahtar, kayit } of parti) {
                const mevcut = (await gorselAl(anahtar))[anahtar];
                // Arada yenilenmis olabilir - sadece hala ayni kayitsa yaz
                if (!mevcut || mevcut.gorsel !== kayit.gorsel) continue;

                const yeni = { ...mevcut };
                let degisti = false;

                if (Array.isArray(mevcut.adaylar) && mevcut.adaylar.length) {
                    const kucukAdaylar = [];
                    for (const a of mevcut.adaylar) {
                        if (typeof a !== 'string') { kucukAdaylar.push(a); continue; }
                        if (a.length < SISKIN_ESIK) { kucukAdaylar.push(a); continue; }
                        const k = await kucult(a);
                        kucukAdaylar.push(k || a);
                        if (k) degisti = true;
                    }
                    if (degisti) {
                        yeni.adaylar = kucukAdaylar;
                        // Gosterilen gorsel adaylardan biriyse onu da tazele
                        const i = mevcut.secim || 0;
                        if (kucukAdaylar[i]) yeni.gorsel = kucukAdaylar[i];
                    }
                }

                // Adaylarda yoksa gosterilen gorseli tek basina kucult
                if (!degisti && mevcut.gorsel.length >= SISKIN_ESIK) {
                    const k = await kucult(mevcut.gorsel);
                    if (k) { yeni.gorsel = k; degisti = true; }
                }

                if (degisti) await chrome.storage.local.set({ [anahtar]: yeni });
            }
        } catch (e) {
            console.log('[WSD] sikistirma hatasi:', e);
        } finally {
            // Hata olsa da bayrak birakilmali; yoksa kuyruk sonsuza kadar
            // "calisiyor" gorunup bir daha islenmez.
            if (sikistirmaKuyrugu.length) sikistirmayiBaslat();
            else sikistirmaCalisiyor = false;
        }
    }, 250);
}
