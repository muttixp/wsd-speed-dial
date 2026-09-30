/*
 * WSD Speed Dial - kirik baglanti taramasi
 * Copyright (C) 2026 WEBTE Yazilim
 *
 * Kartlarin adreslerini tek tek yoklayip artik var olmayanlari
 * isaretliyor. Sonuc depoda kaliyor, kadranda rozet olarak gorunuyor.
 *
 * NEDEN HEAD DEGIL DE ikisi birden: bircok sunucu HEAD'e 405 ya da
 * 403 donuyor ama GET'e normal cevap veriyor. Once HEAD deniyoruz
 * (ucuz), olmazsa GET'e duseriyoruz.
 *
 * YANLIS ALARM: bot korumasi olan siteler (Cloudflare vb.) eklentiden
 * gelen istege 403 donebiliyor. Bu yuzden yalnizca 404 ve 410
 * "KIRIK" sayiliyor; digerleri "supheli" olarak ayri listeleniyor ve
 * kartta rozet cikmiyor.
 */

import { gruplariAl, grubunTumKartlari, urlNormalle } from './yerimi.js';
import { ekranSinifiniVer, bildir } from './arayuz.js';
import { c } from './dil.js';

const ES_ZAMANLI   = 6;         // ayni anda kac istek
const ZAMAN_ASIMI  = 9000;      // ms
const KIRIK_KODLAR = [404, 410];

let iptalIstendi = false;

export function taramayiIptalEt() {
    iptalIstendi = true;
}

/**
 * Tum kartlari yoklar.
 * @param {function} ilerleme  ({ yapilan, toplam, kirik }) ile cagriliyor
 * @returns {Promise<object>}  { tarih, toplam, kirik[], supheli[] }
 */
export async function kirikTara(ilerleme) {
    iptalIstendi = false;
    // Canli listeye kart eklenebilmesi icin arac ureticisi hazir olsun
    await cizimAraclari();

    const kartlar = [];
    const yoksay = await yoksayilanlar();
    for (const g of await gruplariAl()) {
        for (const k of await grubunTumKartlari(g)) {
            // Yalnizca http(s): chrome:// ve file:// yoklanamiyor
            if (!/^https?:/i.test(k.url)) continue;
            if (yoksay.has(urlNormalle(k.url))) continue;   // "Kirik degil" denmis
            kartlar.push({ url: k.url, anahtar: urlNormalle(k.url),
                           baslik: k.baslik || k.url, grup: [g.baslik, ...(k.yol || [])].join(' › ') });
        }
    }

    const sonuc = { tarih: new Date().toISOString(), toplam: kartlar.length,
                    kirik: [], supheli: [], iptal: false };
    let yapilan = 0;

    // AYNI SITEYE AYNI ANDA TEK ISTEK (1.5.1): bir forumun 20 sayfasi
    // kartlardaysa 6 paralel istek hiz sinirina (429) ya da bot
    // korumasina takilip yanlis sonuc veriyordu.
    const mesgul = new Set();
    const alanAdi = u => { try { return new URL(u).host; } catch (e) { return u; } };
    const siradaki = () => {
        for (let i = kartlar.length - 1; i >= 0; i--) {
            if (!mesgul.has(alanAdi(kartlar[i].url))) return kartlar.splice(i, 1)[0];
        }
        return null;
    };

    const isci = async () => {
        while (kartlar.length && !iptalIstendi) {
            const kart = siradaki();
            if (!kart) { await bekle(150); continue; }
            const host = alanAdi(kart.url);
            mesgul.add(host);
            let d;
            try { d = await adresiYokla(kart.url); } finally { mesgul.delete(host); }

            if (d.kod && KIRIK_KODLAR.includes(d.kod)) {
                sonuc.kirik.push({ ...kart, kod: d.kod });
                // Bulunani HEMEN bildir: kullanici taramanin bitmesini
                // beklemeden sonuclari gormeye baslasin
                if (ilerleme) ilerleme({ yapilan, toplam: sonuc.toplam,
                                         kirik: sonuc.kirik.length, supheli: sonuc.supheli.length, yeni: { ...kart, kod: d.kod } });
            } else if (!d.tamam) {
                sonuc.supheli.push({ ...kart, kod: d.kod || 0, sebep: d.sebep });
            }

            yapilan++;
            if (ilerleme && (yapilan % 5 === 0 || !kartlar.length)) {
                ilerleme({ yapilan, toplam: sonuc.toplam, kirik: sonuc.kirik.length, supheli: sonuc.supheli.length });
            }
        }
    };

    await Promise.all(Array.from({ length: ES_ZAMANLI }, isci));
    sonuc.iptal = iptalIstendi;
    if (ilerleme) ilerleme({ yapilan, toplam: sonuc.toplam, kirik: sonuc.kirik.length, supheli: sonuc.supheli.length });

    try {
        await chrome.storage.local.set({ kirikSonuc: {
            tarih: sonuc.tarih,
            anahtarlar: sonuc.kirik.map(k => k.anahtar),
            // SUPHELI: 404 degil ama ulasilamayan adresler (DNS hatasi,
            // zaman asimi, bot korumasi). Kirik sayilmiyorlar ama
            // kullanici gorup kendi karar verebilsin diye listeleniyorlar.
            supheliler: sonuc.supheli.map(k => k.anahtar)
        }});
    } catch (e) { /* onemli degil */ }

    return sonuc;
}

/** Tek istek: { kod } ya da { kod: 0, sebep } */
async function istek(url, yontem, cerez = 'omit') {
    const kontrol = new AbortController();
    const sayac = setTimeout(() => kontrol.abort(), ZAMAN_ASIMI);
    try {
        const y = await fetch(url, {
            method: yontem,
            redirect: 'follow',
            credentials: cerez,
            cache: 'no-store',
            signal: kontrol.signal
        });
        return { kod: y.status, tamam: y.ok };
    } catch (e) {
        return { kod: 0, tamam: false, sebep: e.name === 'AbortError' ? 'zamanAsimi' : 'ag' };
    } finally {
        clearTimeout(sayac);
    }
}

const bekle = ms => new Promise(r => setTimeout(r, ms));

/**
 * Tek adresi yoklar: { tamam, kod, sebep }
 *
 * 1.5.1 YANLIS KIRIK DUZELTMESI: HEAD'in YALNIZCA olumlu cevabina
 * guveniyoruz. Bircok forum/CDN (XenForo + Cloudflare gibi) HEAD'e 404
 * donup GET'te sayfayi veriyor; eskiden HEAD 404'u dogrudan "kirik"
 * sayiliyordu. Artik karar GET'in. GET de 404/410/429/5xx derse kisa
 * bir aradan sonra BIR KEZ daha soruluyor: gecici hata ya da hiz
 * siniri kalici kirik sayilmasin.
 */
async function adresiYokla(url) {
    const h = await istek(url, 'HEAD');
    if (h.tamam) return h;

    let g = await istek(url, 'GET');
    if (g.tamam) return g;
    if (KIRIK_KODLAR.includes(g.kod) || g.kod === 429 || g.kod >= 500 || g.kod === 0) {
        await bekle(g.kod === 429 ? 4000 : 1500);
        const g2 = await istek(url, 'GET');
        if (g2.tamam) return g2;
        // Kirik sayilmasi icin IKINCI GET de 404/410 demeli; baska bir
        // sey derse (zaman asimi, 5xx) supheli listesine dusuyor
        g = g2;
        // SON DENEME CEREZLE: bazi siteler (bot korumali, uyelik isteyen)
        // cerezsiz istege 404 veriyor ama tarayicida acik oturumla sayfa
        // aciliyor. Yalnizca iki kez "yok" denen adreslere, tek sefer.
        if (KIRIK_KODLAR.includes(g.kod)) {
            const g3 = await istek(url, 'GET', 'include');
            if (g3.tamam) return g3;
        }
    }
    // SITE CEVAP VERDI AMA ENGELLEDI (401/403/429): sunucu ayakta, sayfa
    // buyuk ihtimalle var - bot korumasi ya da uyelik. Bunlar eskiden
    // "ulasilamadi" listesini dolduruyordu (211 kartta 39); artik saglam.
    if ([401, 403, 429].includes(g.kod)) return { ...g, tamam: true, engelli: true };
    return g;
}

/** Ulasilamayan ama kirik sayilmayan adresler. */
export async function supheliAnahtarlar() {
    try {
        const d = await chrome.storage.local.get('kirikSonuc');
        return new Set(d.kirikSonuc?.supheliler || []);
    } catch (e) {
        return new Set();
    }
}

/** Kadranda rozet cizmek icin kirik anahtar kumesi. */
export async function kirikAnahtarlar() {
    try {
        const d = await chrome.storage.local.get('kirikSonuc');
        return new Set(d.kirikSonuc?.anahtarlar || []);
    } catch (e) {
        return new Set();
    }
}

/* ---- "KIRIK DEGIL" (1.5.1) ----
   Hicbir yoklama yontemi her siteyi dogru okuyamiyor (bot korumasi,
   bolge engeli). Kullanici "bu sayfa var" derse adres kalici olarak
   taramadan cikariliyor. Liste: kirikYoksay = [anahtar, ...] */
async function yoksayilanlar() {
    try { return new Set((await chrome.storage.local.get('kirikYoksay')).kirikYoksay || []); }
    catch (e) { return new Set(); }
}

export async function kirikDegil(anahtar) {
    const y = await yoksayilanlar();
    y.add(anahtar);
    const d = await chrome.storage.local.get('kirikSonuc');
    const s = d.kirikSonuc;
    const yaz = { kirikYoksay: [...y] };
    if (s) {
        yaz.kirikSonuc = { ...s,
            anahtarlar: (s.anahtarlar || []).filter(a => a !== anahtar),
            supheliler: (s.supheliler || []).filter(a => a !== anahtar) };
    }
    await chrome.storage.local.set(yaz);
}

/**
 * TEK kartin isaretini kaldirir. Adres degistiginde ya da sayfa
 * yeniden yakalanabildiginde cagriliyor - isaret artik gecersiz.
 */
export async function kirikIsaretiKaldir(anahtar) {
    try {
        const d = await chrome.storage.local.get('kirikSonuc');
        const eski = d.kirikSonuc?.anahtarlar;
        if (!Array.isArray(eski) || !eski.includes(anahtar)) return false;

        const yeni = eski.filter(a => a !== anahtar);
        if (yeni.length) {
            await chrome.storage.local.set({ kirikSonuc: { ...d.kirikSonuc, anahtarlar: yeni } });
        } else {
            await chrome.storage.local.remove('kirikSonuc');   // hepsi duzeldi
        }
        return true;
    } catch (e) {
        return false;
    }
}

/** Yan seritteki kirik dugmesini isaret varligina gore gosterir/gizler. */
export async function kirikDugmesiniTazele() {
    const btn = document.getElementById('kirikBtn');
    if (!btn) return;
    const kume = await kirikAnahtarlar();
    const supheli = await supheliAnahtarlar();
    btn.hidden = kume.size === 0 && supheli.size === 0;
    btn.dataset.adet = kume.size + supheli.size;
}

/** Isaretleri temizler (kullanici duzeltince). */
export async function isaretleriSil() {
    try { await chrome.storage.local.remove('kirikSonuc'); } catch (e) { /* yok */ }
}

/* ============ Kirik kartlar ekrani ============ */

/**
 * Yalnizca kirik isaretli kartlari gosteren ekran. Yinelenen kartlar
 * ekraniyla ayni kaliıp: ust bantta serit, izgarada kartlar.
 */
export async function kirikEkraniniAc() {
    const el = id => document.getElementById(id);

    el('ayarPanel')?.classList.remove('acik');
    el('perde')?.classList.remove('acik');
    document.body.classList.remove('ayarAcik');
    if (el('kirikPencere')) el('kirikPencere').hidden = true;

    ekranSinifiniVer('kirikAcik');   // digerleri kapansin
    await kirikEkraniniCiz();
}

export function kirikEkraniniKapat() {
    document.body.classList.remove('kirikAcik');
    kirikDugmesiniTazele();
}

/**
 * Ekrandaki kartlari YENIDEN yoklar. Yalnizca kirik isaretli kartlar
 * taraniyor - tum kadrani baştan taramak gereksiz, kullanici zaten
 * bunlari duzeltmeye calisiyor. Duzelmis olanlar listeden dusuyor.
 */
export async function kirikleriYenidenTara(ilerleme) {
    const kume = await kirikAnahtarlar();
    const supheli = await supheliAnahtarlar();
    if (!kume.size && !supheli.size) return { toplam: 0, duzelen: 0, kalan: 0 };

    const anahtarlar = [...new Set([...kume, ...supheli])];
    const kalanlar = [];
    const kalanSupheliler = [];
    let yapilan = 0;

    iptalIstendi = false;
    const sira = anahtarlar.slice();

    const isci = async () => {
        while (sira.length && !iptalIstendi) {
            const a = sira.pop();
            const d = await adresiYokla(a);
            // Hala 404/410 ise listede kaliyor; digerleri (duzeldi ya da
            // belirsiz) isaretten cikiyor - yanlis alarmda israr etmeyelim
            if (d.kod && KIRIK_KODLAR.includes(d.kod)) kalanlar.push(a);
            else if (!d.tamam) kalanSupheliler.push(a);      // hala ulasilamiyor
            yapilan++;
            if (ilerleme) ilerleme({ yapilan, toplam: anahtarlar.length });
        }
    };
    await Promise.all(Array.from({ length: ES_ZAMANLI }, isci));

    try {
        if (kalanlar.length || kalanSupheliler.length) {
            await chrome.storage.local.set({ kirikSonuc: {
                tarih: new Date().toISOString(),
                anahtarlar: kalanlar,
                supheliler: kalanSupheliler }});
        } else {
            await chrome.storage.local.remove('kirikSonuc');
        }
    } catch (e) { /* onemli degil */ }

    const kalanToplam = kalanlar.length + kalanSupheliler.length;
    return { toplam: anahtarlar.length,
             duzelen: anahtarlar.length - kalanToplam,
             kalan: kalanToplam };
}

/**
 * Tarama surerken bulunan kirik karti ekrandaki listeye ekler.
 * Ekran kapaliysa hicbir sey yapmiyor.
 */
export function kirikEkraninaEkle(kayit) {
    if (!document.body.classList.contains('kirikAcik')) return;
    const kap = document.getElementById('kartKabi');
    if (!kap) return;

    const bos = document.getElementById('aramaBos');
    if (bos) bos.remove();

    const anahtar = kayit.anahtar || kayit.url;
    if (kap.querySelector(`.kart[data-anahtar="${CSS.escape(anahtar)}"]`)) return;

    const kart = kirikKartiOlustur(kayit);
    kap.appendChild(kart);
    // Canli eklenen kartin gorseli de yuklensin - eskiden yalnizca
    // cizim sonunda gozcuye baglaniyordu, tarama bitene kadar zemin
    // bos kaliyordu
    if (gorselGozcusu) gorselGozcusu([kart], false);   // onceki gozlemleri bozma

    const sayi = document.getElementById('kirikSayi');
    if (sayi) sayi.textContent = String(kap.querySelectorAll('.kart').length);
}

/**
 * Ekrandaki TUM kirik kartlari cop kutusuna tasir.
 * Cop kutusuna gidiyorlar, yani geri alinabilir.
 */
export async function kirikleriTumdenSil(ilerleme) {
    const kume = await kirikAnahtarlar();
    if (!kume.size) return { silinen: 0 };

    const { kartiYedekle } = await import('./copekrani.js');
    const { copeAt } = await import('./cop.js');

    const silinecek = [];
    for (const g of await gruplariAl()) {
        for (const k of await grubunTumKartlari(g)) {
            if (kume.has(urlNormalle(k.url))) silinecek.push(k);
        }
    }

    let silinen = 0;
    for (const k of silinecek) {
        try {
            const yedek = await kartiYedekle(k.id, k.url);
            await copeAt(yedek);
            await chrome.bookmarks.remove(k.id);
            silinen++;
        } catch (e) {
            console.log('[WSD] kirik kart silinemedi:', k.url, e);
        }
        if (ilerleme) ilerleme({ yapilan: silinen, toplam: silinecek.length });
    }

    // Yalnizca KIRIK isaretleri gidiyor; "ulasilamadi" listesi kaliyor
    try {
        const d = await chrome.storage.local.get('kirikSonuc');
        if (d.kirikSonuc?.supheliler?.length) {
            await chrome.storage.local.set({ kirikSonuc: { ...d.kirikSonuc, anahtarlar: [] } });
        } else {
            await chrome.storage.local.remove('kirikSonuc');
        }
    } catch (e) { /* yok */ }
    return { silinen };
}

/** Ekran acikken kart silinirse listeyi ve sayiyi tazele. */
export async function kirikEkraniniYenile() {
    if (document.body.classList.contains('kirikAcik')) await kirikEkraniniCiz();
    await kirikDugmesiniTazele();
}

/** Kirik ekranindaki tek kart. */
function kirikKartiOlustur(k) {
    const a = document.createElement('a');
    a.className = 'kart';
    a.href = k.url;
    if (k.id) a.dataset.kartId = k.id;
    a.dataset.anahtar = k.anahtar || k.url;

    const govde = document.createElement('span');
    govde.className = 'kartGovde';

    const baslik = document.createElement('span');
    baslik.className = 'kartBaslik';
    baslik.textContent = k.baslik || k.url;

    const gorsel = document.createElement('span');
    gorsel.className = 'kartGorsel';

    govde.append(baslik, gorsel);
    a.appendChild(govde);
    if (kartAraclari) a.appendChild(kartAraclari());

    const etiket = document.createElement('span');
    etiket.className = 'kartGrupEtiketi';
    etiket.textContent = k.grup || '';
    a.appendChild(etiket);

    // "Kirik degil": yanlis alarmi kalici olarak kapatir. Kartin ARAC
    // SERIDINDE ilk simge (onay isareti) - ayri bir dugme olarak seridin
    // altinda kaliyor ve tiklanamiyordu.
    const degil = document.createElement('button');
    degil.type = 'button';
    degil.className = 'kartArac kirikDegilArac';
    degil.title = `${c('kirikDegil')} \u2014 ${c('kirikDegilIpucu')}`;
    degil.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
        'stroke-linecap="round" stroke-linejoin="round">' +
        // SAGLAM BAGLANTI simgesi (kirik bag. simgesinin kopuk olmayan hali)
        '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>' +
        '<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>';
    degil.addEventListener('click', async e => {
        e.preventDefault();
        e.stopPropagation();
        await kirikDegil(a.dataset.anahtar);
        await kirikEkraniniYenile();
        bildir(c('kirikDegilBildir'));
    });
    const serit = a.querySelector('.kartAraclari');
    if (serit) serit.prepend(degil); else a.appendChild(degil);

    // Supheli kartlar ayirt edilsin: 404 degil, ulasilamadi
    if (k.supheliMi) {
        a.classList.add('supheliKart');
        const r = document.createElement('span');
        r.className = 'supheliRozet';
        r.textContent = c('ulasilamadi');
        a.appendChild(r);
    }
    return a;
}

let kartAraclari = null;       // cizim.js'ten gelen arac uretici
let gorselGozcusu = null;      // cizim.js'ten gelen tembel yukleyici

/** cizim.js yardimcilarini bir kez yukler. */
async function cizimAraclari() {
    if (kartAraclari && gorselGozcusu) return;
    try {
        const m = await import('./cizim.js');
        kartAraclari  = m.kartAraclariOlustur;
        gorselGozcusu = m.gorselleriGozle;
    } catch (e) { /* ekran kapali - onemli degil */ }
}

async function kirikEkraniniCiz() {
    const el = id => document.getElementById(id);
    const kap = el('kartKabi');
    const { c } = await import('./dil.js');
    await cizimAraclari();
    const gorselleriGozle = gorselGozcusu;

    kap.textContent = '';
    const kume = await kirikAnahtarlar();
    const supheli = await supheliAnahtarlar();

    const liste = [];
    for (const g of await gruplariAl()) {
        for (const k of await grubunTumKartlari(g)) {
            const a = urlNormalle(k.url);
            if (kume.has(a)) liste.push({ kart: k, grup: [g.baslik, ...(k.yol || [])].join(' › '), supheliMi: false });
            else if (supheli.has(a)) liste.push({ kart: k, grup: [g.baslik, ...(k.yol || [])].join(' › '), supheliMi: true });
        }
    }
    liste.sort((a, b) => (a.supheliMi ? 1 : 0) - (b.supheliMi ? 1 : 0));

    // Iki sayi AYRI: "1 kirik · 39 ulasilamadi". Tek toplam (40) tarama
    // raporundaki "1 kirik" ile celisiyordu.
    {
        const nk = liste.filter(x => !x.supheliMi).length, ns = liste.length - nk;
        const parca = [];
        if (nk) parca.push(c('nKirik', nk));
        if (ns) parca.push(c('nUlasilamadi', ns));
        el('kirikSayi').textContent = parca.join(' · ');
    }

    if (!liste.length) {
        const bos = document.createElement('p');
        bos.id = 'aramaBos';
        // Serit "Tekrar tara" dugmesi burada TUM kadrani tariyor
        bos.textContent = c('kirikKartYokTara');
        kap.appendChild(bos);
        return;
    }

    for (const { kart, grup, supheliMi } of liste) {
        kap.appendChild(kirikKartiOlustur({
            url: kart.url, baslik: kart.baslik, grup, id: kart.id,
            anahtar: urlNormalle(kart.url), supheliMi
        }));
    }

    if (gorselleriGozle) gorselleriGozle(kap.querySelectorAll('.kart[data-anahtar]'));
}
