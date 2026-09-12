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

import { gruplariAl, kartlariAl, urlNormalle } from './yerimi.js';

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
    for (const g of await gruplariAl()) {
        for (const k of await kartlariAl(g.id)) {
            // Yalnizca http(s): chrome:// ve file:// yoklanamiyor
            if (!/^https?:/i.test(k.url)) continue;
            kartlar.push({ url: k.url, anahtar: urlNormalle(k.url),
                           baslik: k.baslik || k.url, grup: g.baslik });
        }
    }

    const sonuc = { tarih: new Date().toISOString(), toplam: kartlar.length,
                    kirik: [], supheli: [], iptal: false };
    let yapilan = 0;

    const isci = async () => {
        while (kartlar.length && !iptalIstendi) {
            const kart = kartlar.pop();
            const d = await adresiYokla(kart.url);

            if (d.kod && KIRIK_KODLAR.includes(d.kod)) {
                sonuc.kirik.push({ ...kart, kod: d.kod });
                // Bulunani HEMEN bildir: kullanici taramanin bitmesini
                // beklemeden sonuclari gormeye baslasin
                if (ilerleme) ilerleme({ yapilan, toplam: sonuc.toplam,
                                         kirik: sonuc.kirik.length, yeni: { ...kart, kod: d.kod } });
            } else if (!d.tamam) {
                sonuc.supheli.push({ ...kart, kod: d.kod || 0, sebep: d.sebep });
            }

            yapilan++;
            if (ilerleme && (yapilan % 5 === 0 || !kartlar.length)) {
                ilerleme({ yapilan, toplam: sonuc.toplam, kirik: sonuc.kirik.length });
            }
        }
    };

    await Promise.all(Array.from({ length: ES_ZAMANLI }, isci));
    sonuc.iptal = iptalIstendi;

    try {
        await chrome.storage.local.set({ kirikSonuc: {
            tarih: sonuc.tarih,
            anahtarlar: sonuc.kirik.map(k => k.anahtar)
        }});
    } catch (e) { /* onemli degil */ }

    return sonuc;
}

/** Tek adresi yoklar: { tamam, kod, sebep } */
async function adresiYokla(url) {
    for (const yontem of ['HEAD', 'GET']) {
        const kontrol = new AbortController();
        const sayac = setTimeout(() => kontrol.abort(), ZAMAN_ASIMI);
        try {
            const y = await fetch(url, {
                method: yontem,
                redirect: 'follow',
                credentials: 'omit',
                cache: 'no-store',
                signal: kontrol.signal
            });
            clearTimeout(sayac);

            // HEAD desteklenmiyorsa GET'e devam
            if (yontem === 'HEAD' && [405, 501, 403].includes(y.status)) continue;
            return { tamam: y.ok, kod: y.status };
        } catch (e) {
            clearTimeout(sayac);
            if (yontem === 'GET') {
                return { tamam: false, kod: 0,
                         sebep: e.name === 'AbortError' ? 'zamanAsimi' : 'ag' };
            }
        }
    }
    return { tamam: false, kod: 0, sebep: 'ag' };
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
    btn.hidden = kume.size === 0;
    btn.dataset.adet = kume.size;
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

    document.body.classList.add('kirikAcik');
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
    if (!kume.size) return { toplam: 0, duzelen: 0, kalan: 0 };

    const anahtarlar = [...kume];
    const kalanlar = [];
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
            yapilan++;
            if (ilerleme) ilerleme({ yapilan, toplam: anahtarlar.length });
        }
    };
    await Promise.all(Array.from({ length: ES_ZAMANLI }, isci));

    try {
        if (kalanlar.length) {
            await chrome.storage.local.set({ kirikSonuc: {
                tarih: new Date().toISOString(), anahtarlar: kalanlar }});
        } else {
            await chrome.storage.local.remove('kirikSonuc');
        }
    } catch (e) { /* onemli degil */ }

    return { toplam: anahtarlar.length,
             duzelen: anahtarlar.length - kalanlar.length,
             kalan: kalanlar.length };
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

    const liste = [];
    for (const g of await gruplariAl()) {
        for (const k of await kartlariAl(g.id)) {
            if (kume.has(urlNormalle(k.url))) liste.push({ kart: k, grup: g.baslik });
        }
    }

    el('kirikSayi').textContent = liste.length ? String(liste.length) : '';

    if (!liste.length) {
        const bos = document.createElement('p');
        bos.id = 'aramaBos';
        // Serit "Tekrar tara" dugmesi burada TUM kadrani tariyor
        bos.textContent = c('kirikKartYokTara');
        kap.appendChild(bos);
        return;
    }

    for (const { kart, grup } of liste) {
        kap.appendChild(kirikKartiOlustur({
            url: kart.url, baslik: kart.baslik, grup, id: kart.id,
            anahtar: urlNormalle(kart.url)
        }));
    }

    if (gorselleriGozle) gorselleriGozle(kap.querySelectorAll('.kart[data-anahtar]'));
}
