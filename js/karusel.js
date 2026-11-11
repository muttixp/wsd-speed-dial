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

// WSD Speed Dial - duzenle penceresindeki gorsel karuseli
//
// Adaylar: yakalamadan gelen ekran goruntusu + sayfa gorselleri.
// Kullanici kendi dosyasini/URL'sini de ekleyebiliyor; o da listeye giriyor.

import { gorselAl, gorselIzi, buyutmeOlcusu, kartOraniOku, tamDoluBoyut } from './gorsel.js';
import { c } from './dil.js';

let adaylar = [];
let secim = 0;
let zemin = null;
let elle = false;           // KILIT (1.6.3): secili gorsel yenilemede/adres degisince degismez.
                            // Kendi gorseli (dosya/URL/logo) eklenince kendiliginden kilitlenir.
let yerlesim = null;        // kart basina 'contain' | 'cover' (1.6.3); null = genel ayar
let boyut = null;           // GORSEL BOYUTU (1.6.6): <0 bosluk, 0 sigdir, >0 buyutme; null = genel
let kaynaklar = {};         // elle eklenen gorsellerin adresleri { iz: url } (1.6.4)

const el = id => document.getElementById(id);

export function karuseliKur() {
    el('kpOnceki')?.addEventListener('click', () => kaydir(-1));
    el('kpSonraki')?.addEventListener('click', () => kaydir(1));
    el('kpAdaySil')?.addEventListener('click', e => { e.stopPropagation(); adaySil(); });
    el('kpKilit')?.addEventListener('click', e => { e.stopPropagation(); elle = !elle; ciz(); });
    // Gorsel boyutu (1.6.6): kaydirinca yalnizca bu kart; "tam dolu" noktasina yapisir
    el('kpBosluk')?.addEventListener('input', e => {
        let v = +e.target.value;
        const iz = izler.get(adaylar[secim]);
        const tam = iz ? tamDoluBoyut(iz.oran, kartOraniOku()) : null;
        if (tam !== null && tam > 0 && Math.abs(v - tam) <= 3) v = tam;
        boyut = v;
        ciz();
    });
    el('kpBoslukGenel')?.addEventListener('click', () => { boyut = null; ciz(); });

    // Ok tuslariyla da gezinilsin
    el('kpOnizleme')?.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft')  kaydir(-1);
        if (e.key === 'ArrowRight') kaydir(1);
    });
}

/** Pencere acilirken cagriliyor. */
export async function karuseliYukle(anahtar) {
    adaylar = [];
    secim = 0;
    zemin = null;
    elle = false;
    yerlesim = null;
    boyut = null;
    kaynaklar = {};

    if (anahtar) {
        const kayit = (await gorselAl(anahtar))[anahtar];
        if (kayit) {
            zemin = kayit.zemin || null;
            yerlesim = kayit.yerlesim || null;
            boyut = Number.isFinite(kayit.boyut) ? kayit.boyut : null;
            kaynaklar = { ...(kayit.kaynaklar || {}) };
            // 1.6.6 ve oncesinde kuculen gorselin adresi eski izde kaliyordu.
            // Tek sahipsiz adres varsa ve secili gorselin adresi yoksa ona ver.
            {
                const izler2 = new Set((kayit.adaylar || [kayit.gorsel]).filter(Boolean).map(gorselIzi));
                const sahipsiz = Object.keys(kaynaklar).filter(iz => !izler2.has(iz));
                const secili = (kayit.adaylar && kayit.adaylar[kayit.secim || 0]) || kayit.gorsel;
                if (sahipsiz.length === 1 && secili && !kaynaklar[gorselIzi(secili)]) {
                    kaynaklar[gorselIzi(secili)] = kaynaklar[sahipsiz[0]];
                    delete kaynaklar[sahipsiz[0]];
                }
            }
            // Kendi resmi isareti kayitta duruyor; pencere acilinca kaybolup
            // adres degisince yakalama secili resmi eziyordu (1.5.6)
            elle = !!kayit.elle;
            if (Array.isArray(kayit.adaylar) && kayit.adaylar.length) {
                adaylar = [...kayit.adaylar];
                secim = Math.min(kayit.secim || 0, adaylar.length - 1);
            } else if (kayit.gorsel) {
                adaylar = [kayit.gorsel];       // eski kayit - tek gorsel
            }
        }
    }
    ciz();
    kopyalariAyikla().catch(() => {});
}

/** Disaridan gorsel ekler (dosya secimi / URL) ve ona gecer. */
export async function adayEkle(dataUri, kaynak = null) {
    if (!dataUri) return;
    elle = true;
    if (kaynak) kaynaklar[gorselIzi(dataUri)] = kaynak;
    let mevcut = adaylar.indexOf(dataUri);
    // AYNI RESIM IKI KEZ GIRMESIN (1.6.3): ayni dosya farkli yoldan
    // (dosya, adres, logo) gelince metin farkli ama resim ayni olabiliyor
    if (mevcut < 0) {
        const iz = await izAl(dataUri);
        if (iz) for (let i = 0; i < adaylar.length; i++) {
            if (izBenzer(iz, await izAl(adaylar[i]))) { mevcut = i; break; }
        }
    }
    if (mevcut >= 0) {
        secim = mevcut;
        // Ayni resim baska kopyayla eslendi: adresi oraya da yaz
        if (kaynak) kaynaklar[gorselIzi(adaylar[mevcut])] = kaynak;
    } else {
        adaylar.push(dataUri);
        secim = adaylar.length - 1;
    }
    ciz();
}

/** Secili adayi karuselden cikarir (1.6.3). Son aday silinmez. */
export function adaySil() {
    if (adaylar.length < 2) return;
    adaylar.splice(secim, 1);
    elle = false;                          // kilitli gorsel gitti - kilit de kalkar
    if (secim >= adaylar.length) secim = adaylar.length - 1;
    ciz();
}

/* Gorsel izi: 16x16 kucultulmus piksel + oran. Ayni resmin farkli
   kodlanmis kopyalarini yakalar; filtrelenmis surumu (renk degisti)
   ayri sayar. */
const izler = new Map();
async function izAl(veri) {
    if (izler.has(veri)) return izler.get(veri);
    let iz = null;
    try {
        const img = new Image();
        img.src = veri;
        await img.decode();
        const t = new OffscreenCanvas(16, 16), x = t.getContext('2d');
        x.drawImage(img, 0, 0, 16, 16);
        iz = { oran: img.naturalWidth / img.naturalHeight, p: x.getImageData(0, 0, 16, 16).data };
    } catch (e) { /* cizilemeyen (capraz kaynak vb.) - karsilastirma yok */ }
    izler.set(veri, iz);
    return iz;
}
function izBenzer(a, b) {
    if (!a || !b || Math.abs(a.oran / b.oran - 1) > 0.02) return false;
    let fark = 0;
    for (let i = 0; i < a.p.length; i++) fark += Math.abs(a.p[i] - b.p[i]);
    return fark / a.p.length < 3;
}
/** Kayitta zaten ayni resim iki kez varsa pencere acilinca teke indir. */
async function kopyalariAyikla() {
    const ref = adaylar, liste = [...adaylar];
    const kopyaMi = [], izListe = [];       // kopyaMi[i] = ilk esinin sirasi ya da -1
    for (let i = 0; i < liste.length; i++) {
        const iz = await izAl(liste[i]);
        const k = izListe.findIndex(z => z && izBenzer(z.iz, iz));
        kopyaMi.push(k >= 0 ? izListe[k].i : -1);
        if (k < 0) izListe.push({ i, iz });
    }
    // Olcum surerken pencere degistiyse ya da liste oynadiysa dokunma
    if (adaylar !== ref || adaylar.length !== liste.length || !kopyaMi.some(k => k >= 0)) return;
    const hedef = kopyaMi[secim] >= 0 ? kopyaMi[secim] : secim;
    adaylar = liste.filter((_, i) => kopyaMi[i] < 0);
    secim = adaylar.indexOf(liste[hedef]);
    ciz();
}

export function zeminAyarla(renk) {
    zemin = renk;
    ciz();
}

/** Filtre onizlemesi (1.6.1): adaylari degistirmeden gosterilen resim */
export function onizlemeGoster(dataUri) {
    const o = el('kpOnizleme');
    if (o && dataUri) o.style.backgroundImage = `url('${dataUri}')`;
}

export function karuseliCiz() { ciz(); }

let sonra = null;
/** Her cizimden sonra cagrilir (filtre onizlemesi secim degisince tazelensin) */
export function cizinceCagir(fn) { sonra = fn; }

/** Secili gorselin en/boy orani (gorsel boyutu icin kayda yazilir) */
export async function seciliOran() {
    const su = adaylar[secim];
    return su ? ((await izAl(su))?.oran || null) : null;
}

export function secimDurumu() {
    // Yalnizca karuselde kalan adaylarin adresleri saklanir
    const izler = new Set(adaylar.map(gorselIzi));
    const k = Object.fromEntries(Object.entries(kaynaklar).filter(([iz]) => izler.has(iz)));
    return { adaylar, secim, zemin, elle, yerlesim, boyut, kaynaklar: k, gorsel: adaylar[secim] || null };
}

/** Secili adayin elle girilen adresi (varsa) - "Adresten" sorusu bununla dolar */
export function seciliKaynak() {
    const su = adaylar[secim];
    return su ? (kaynaklar[gorselIzi(su)] || '') : '';
}

/* GORSEL YERLESIMI (1.6.3): onizleme KARTLA AYNI gorunsun - ayni oran,
   ayni sigdir/doldur, ayni zemin. Onceden onizleme hep "sigdir" + beyaz
   zemindi; kartta kirpilmis ve tema renginde gorununce kullanici
   sasiriyordu. Kart basina Sigdir/Doldur secilebilir. */
const genelYerlesim = () =>
    getComputedStyle(document.documentElement).getPropertyValue('--gorsel-yerlesim').trim() === 'contain' ? 'contain' : 'cover';
const etkinYerlesim = () => yerlesim || genelYerlesim();

export function yerlesimDegistir() {
    boyut = null;                          // Sigdir/Doldur dugmesi boyut kaydiricisini sifirlar
    const yeni = etkinYerlesim() === 'contain' ? 'cover' : 'contain';
    // Genel ayarla ayni olursa kart basina kayda gerek yok
    yerlesim = yeni === genelYerlesim() ? null : yeni;
    ciz();
}

/**
 * Kullanicinin kendi resmi (dosya/adres) kartin oranina uymuyorsa ya da
 * saydamsa ve genel ayar "doldur" ise bu kart icin "sigdir" secilir -
 * logo gibi resimler kirpilmasin. Kullanici dugmeyle geri alabilir.
 */
export async function kendiResmeGoreYerlesim(dataUri) {
    if (yerlesim || genelYerlesim() === 'contain') return;
    try {
        const img = new Image();
        img.src = dataUri;
        await img.decode();
        const oranStr = getComputedStyle(document.documentElement).getPropertyValue('--kart-oran').trim() || '16 / 10';
        const [a, b] = oranStr.split('/').map(Number);
        const kartOran = a && b ? a / b : 1.6;
        const resimOran = img.naturalWidth / img.naturalHeight;
        let saydam = false;
        try {
            const t = new OffscreenCanvas(24, 24), x = t.getContext('2d');
            x.drawImage(img, 0, 0, 24, 24);
            const p = x.getImageData(0, 0, 24, 24).data;
            for (let i = 3; i < p.length; i += 4) if (p[i] < 200) { saydam = true; break; }
        } catch (e) { /* */ }
        if (saydam || Math.abs(Math.log(resimOran / kartOran)) > 0.25) {
            yerlesim = 'contain';
            ciz();
        }
    } catch (e) { /* olcemedik - genel ayar kalir */ }
}

function kaydir(yon) {
    if (adaylar.length < 2) return;
    // Dairesel: sondan ilkine, ilkten sona
    secim = (secim + yon + adaylar.length) % adaylar.length;
    ciz();
}

function ciz() {
    const onizleme = el('kpOnizleme');
    const noktalar = el('kpNoktalar');
    if (!onizleme || !noktalar) return;

    const su = adaylar[secim];
    onizleme.style.backgroundImage = su ? `url('${su}')` : 'none';
    // Kartla ayni: zemin yoksa temanin kart zemini (CSS), beyaz degil
    onizleme.style.backgroundColor = zemin || '';
    const y = etkinYerlesim();
    onizleme.style.backgroundSize = y;
    onizleme.style.backgroundPosition = y === 'contain' ? '50% 50%' : '50% 0';
    // Kenar boslugu kartla ayni (1.6.4)
    onizleme.style.boxSizing = 'border-box';
    onizleme.style.padding = 'var(--gorsel-bosluk, 0%)';
    onizleme.style.backgroundOrigin = 'content-box';
    // Gorsel boyutu: kart basina deger varsa taban SIGDIR + bosluk/buyutme
    const su2 = adaylar[secim];
    const iz = su2 ? izler.get(su2) : null;
    if (su2 && iz === undefined) izAl(su2).then(() => { if (adaylar[secim] === su2) ciz(); });
    const tam = iz ? tamDoluBoyut(iz.oran, kartOraniOku()) : null;
    if (boyut !== null) {
        onizleme.style.setProperty('--gorsel-bosluk', Math.max(0, -boyut) + '%');
        onizleme.style.backgroundSize = (iz && buyutmeOlcusu(boyut, iz.oran, kartOraniOku())) || 'contain';
        onizleme.style.backgroundPosition = '50% 50%';
    } else onizleme.style.removeProperty('--gorsel-bosluk');
    const genelB = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--gorsel-bosluk')) || 0;
    const bk = el('kpBosluk'), bd = el('kpBoslukDeger'), bg = el('kpBoslukGenel');
    // Genel ayardayken kaydirici etkin yerlesimi gostersin: Doldur ise tam dolu noktasi
    const genelDoldur = boyut === null && etkinYerlesim() === 'cover';
    const gv = boyut !== null ? boyut : genelDoldur ? (tam !== null ? tam : 0) : -genelB;
    if (bk) bk.value = gv;
    if (bd) bd.textContent = (genelDoldur || (tam !== null && tam > 0 && gv === tam)) ? c('yerlesimKirp')
        : gv === 0 ? c('yerlesimSigdir') : (gv > 0 ? '+' : '−') + Math.abs(gv) + '%';
    if (bg) bg.classList.toggle('secili', boyut === null);
    const yd = el('kpYerlesim');
    if (yd) {
        yd.classList.toggle('secili', !!yerlesim);
        const etiket = yd.querySelector('[data-yerlesim-ad]');
        // Dugme YAPILACAK isi soyler: simdi kirpiliyorsa "Sigdir"
        if (etiket) etiket.textContent = c(y === 'contain' ? 'yerlesimKirp' : 'yerlesimSigdir');
    }

    // Renk secici mevcut zemini gostersin - onceki karttan kalan
    // deger yaniltmasin
    const secici = el('kpZeminSecici');
    if (secici && zemin && /^#[0-9a-f]{6}$/i.test(zemin)) secici.value = zemin;

    // Oklar tek aday varken anlamsiz
    const tek = adaylar.length < 2;
    el('kpOnceki').disabled = tek;
    el('kpSonraki').disabled = tek;
    const sil = el('kpAdaySil');
    if (sil) sil.hidden = tek;
    const kilit = el('kpKilit');
    if (kilit) {
        kilit.hidden = !su;
        kilit.classList.toggle('kilitli', elle);
        kilit.setAttribute('aria-pressed', elle ? 'true' : 'false');
        kilit.title = c(elle ? 'kilidiAc' : 'kpKilitIpucu');
    }

    noktalar.textContent = '';
    sonra?.();
    if (tek) return;
    adaylar.forEach((_, i) => {
        const n = document.createElement('button');
        n.type = 'button';
        n.className = 'karuselNokta' + (i === secim ? ' secili' : '');
        n.addEventListener('click', () => { secim = i; ciz(); });
        noktalar.appendChild(n);
    });
}
