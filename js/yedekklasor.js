// WSD Speed Dial - Copyright (C) 2026 muttixp - GPL-3.0-or-later
//
// KLASORE YEDEK (1.5.7, deneysel)
//
// Kullanici bir klasor secer (yerel ya da OneDrive / Google Drive /
// Dropbox klasoru - bulut programi dosyayi kendisi yukler). WSD yedegi
// `<klasor>/<yedek adi>/wsd-<ad>-YYYY-MM-DD-HHMM.json` olarak yazar.
//   - Sunucu, hesap, yeni izin YOK: tarayicinin dosya erisim ozelligi
//     (File System Access). Klasor tutamagi IndexedDB'de; tarayici yeniden
//     acilinca yazma izni bir tiklamayla yenilenir.
//   - Ayarlar CIHAZA OZEL (`klasorYedek`, ayarlar disinda): yedekten
//     yuklenince baska tarayicinin adi buraya tasinmasin.
//   - Ayni ad = ayni yedek seti: baska cihazdan daha yeni yedek gelince
//     haber verilir, kendiliginden yuklenmez.
import { c } from './dil.js';
import { bildir as bildirA, mesgulDugme } from './arayuz.js';

const el = id => document.getElementById(id);
const DB = 'wsdKlasor', DEPO = 'tutamak', ANAHTAR = 'yedekKlasoru';
const AYAR = 'klasorYedek';
const VARSAYILAN = { ad: '', gorselli: true, sakla: 10, siklik: 'gunluk' };

export const desteklenir = () => typeof window.showDirectoryPicker === 'function';

/* ---------- IndexedDB: klasor tutamagi ---------- */
function db() {
    return new Promise((coz, red) => {
        const r = indexedDB.open(DB, 1);
        r.onupgradeneeded = () => r.result.createObjectStore(DEPO);
        r.onsuccess = () => coz(r.result);
        r.onerror = () => red(r.error);
    });
}
async function tutamakYaz(t) {
    const d = await db();
    await new Promise((coz, red) => {
        const tx = d.transaction(DEPO, 'readwrite');
        if (t) tx.objectStore(DEPO).put(t, ANAHTAR); else tx.objectStore(DEPO).delete(ANAHTAR);
        tx.oncomplete = coz; tx.onerror = () => red(tx.error);
    });
}
export async function tutamakAl() {
    try {
        const d = await db();
        return await new Promise(coz => {
            const r = d.transaction(DEPO).objectStore(DEPO).get(ANAHTAR);
            r.onsuccess = () => coz(r.result || null);
            r.onerror = () => coz(null);
        });
    } catch (e) { return null; }
}

/* ---------- Cihaza ozel ayarlar ---------- */
export async function ayarAl() {
    const d = await chrome.storage.local.get([AYAR, 'cihazKimligi']);
    let kimlik = d.cihazKimligi;
    if (!kimlik) {
        kimlik = Math.random().toString(36).slice(2, 10);
        await chrome.storage.local.set({ cihazKimligi: kimlik });
    }
    const a = { ...VARSAYILAN, ...(d[AYAR] || {}), kimlik };
    if (!a.ad) {
        const { tarayiciAdi } = await import('./tarayici.js');
        // Iki bilgisayardaki ayni tarayici ayni sete yazmasin: kisa cihaz eki
        a.ad = `${await tarayiciAdi()}-${kimlik.slice(0, 4)}`;
    }
    return a;
}
async function ayarYazK(degis) {
    const d = await chrome.storage.local.get(AYAR);
    await chrome.storage.local.set({ [AYAR]: { ...(d[AYAR] || {}), ...degis } });
}

/** Dosya/klasor adinda sorun cikaracak karakterleri temizler */
const temizAd = s => String(s || '').replace(/[\\/:*?"<>|\u0000-\u001f]+/g, '-')
    .slice(0, 40).trim().replace(/^[.\s]+|[.\s]+$/g, '') || 'WSD';

export const kaynakBilgisi = a => ({ ad: a.ad, cihaz: a.kimlik,
    platform: navigator.userAgentData?.platform || '', surum: chrome.runtime.getManifest().version });

/* ---------- Izin ---------- */
async function izin(t, sor) {
    if (!t) return false;
    const o = { mode: 'readwrite' };
    try {
        if (await t.queryPermission(o) === 'granted') return true;
        if (sor && await t.requestPermission(o) === 'granted') return true;
    } catch (e) { /* */ }
    return false;
}

/* ---------- Klasor secimi ---------- */
export async function klasorSec() {
    if (!desteklenir()) throw new Error('destek');
    const t = await window.showDirectoryPicker({ id: 'wsd-yedek', mode: 'readwrite' });
    await tutamakYaz(t);
    return t.name;
}
export async function klasorKaldir() { await tutamakYaz(null); }

/* ---------- Yazma ---------- */
export function dosyaAdi(ad, t = new Date()) {
    const iki = n => String(n).padStart(2, '0');
    return `wsd-${temizAd(ad)}-${t.getFullYear()}-${iki(t.getMonth() + 1)}-${iki(t.getDate())}-` +
           `${iki(t.getHours())}${iki(t.getMinutes())}.json`;
}

/**
 * Klasore yedek yazar. `sor`: izin yoksa sorulsun mu (yalnizca kullanici
 * tiklamasiyla cagrilinca true).
 * Doner: { dosya, kart, boyut } | 'klasorYok' | 'izin'
 */
export async function klasoreYedekle({ sor = false, ilerleme = null } = {}) {
    const t = await tutamakAl();
    if (!t) return 'klasorYok';
    if (!await izin(t, sor)) return 'izin';
    const a = await ayarAl();
    const { yedekBlobu } = await import('./yedek.js');
    const { blob, sayi, isk } = await yedekBlobu(ilerleme, { gorseller: a.gorselli, kaynak: kaynakBilgisi(a) });
    const alt = await t.getDirectoryHandle(temizAd(a.ad), { create: true });
    const ad = dosyaAdi(a.ad);
    const dosya = await alt.getFileHandle(ad, { create: true });
    const yaz = await dosya.createWritable();
    await yaz.write(blob);
    await yaz.close();
    await eskileriSil(alt, Math.max(1, +a.sakla || 10));
    const tarih = new Date().toISOString();
    await chrome.storage.local.set({
        sonKlasorYedek: { tarih, dosya: ad, ad: a.ad },
        sonYedekBilgi: { dosya: ad, tarih, kart: sayi, grup: isk.gruplar.length, boyut: blob.size, klasor: t.name },
    });
    return { dosya: ad, kart: sayi, boyut: blob.size, klasor: t.name, alt: temizAd(a.ad) };
}

async function eskileriSil(alt, sakla) {
    // Eskiden-yeniye DOSYA ZAMANINA gore: ada gore siralamak buyuk/kucuk
    // harf farkli ad ("Ev"/"EV") ya da farkli saat dilimindeki cihazlarda
    // EN YENI yedegi silebiliyordu
    const liste = [];
    for await (const [ad, h] of alt.entries()) {
        if (h.kind === 'file' && /^wsd-.*\.json$/i.test(ad)) {
            try { liste.push({ ad, z: (await h.getFile()).lastModified }); } catch (e) { /* */ }
        }
    }
    liste.sort((x, y) => x.z - y.z);
    for (const { ad } of liste.slice(0, Math.max(0, liste.length - sakla))) {
        try { await alt.removeEntry(ad); } catch (e) { /* */ }
    }
}

/** Dugmeden: izin sor, yaz, sonucu bildir */
export async function klasoreYedekleBildir(btn = null) {
    const bildir = bildirA;
    // Dugmesiz cagri (izin bildirimi) icin de bilgi ver
    if (!btn) bildir(c('yedekleniyor'));
    const calis = async ilerle => { try {
        const s = await klasoreYedekle({ sor: true, ilerleme: i => ilerle(i.yapilan, i.toplam) });
        if (s === 'klasorYok') return bildir(c('klasorYedekKlasorYok'));
        if (s === 'izin') return bildir(c('klasorYedekIzinYok'));
        await chrome.storage.local.set({ sonOtomatikYedek: new Date().toISOString() });
        bildir(c('klasorYedekYazildi', s.kart, `${s.klasor}/${s.alt}`));
        ozetiCiz();
    } catch (e) {
        console.log('[WSD] klasore yedek:', e);
        bildir(c('yedekAlinamadi'));
    } };
    if (btn) return mesgulDugme(btn, c('yedekleniyor'), calis);
    return calis(() => {});
}

/**
 * Otomatik yedekten cagriliyor. Doner:
 *   'yok'     klasor secilmemis - indirmeye devam
 *   'bekle'   haftalik ve henuz vakti gelmedi
 *   'izin'    izin yenilenmeli (kullanici tiklamasi gerek)
 *   'yazildi'
 */
export async function klasorOtomatikYedek() {
    if (!desteklenir()) return 'yok';
    const t = await tutamakAl();
    if (!t) return 'yok';
    const a = await ayarAl();
    if (a.siklik === 'kapali') return 'kapali';
    const { sonKlasorYedek } = await chrome.storage.local.get('sonKlasorYedek');
    if (sonKlasorYedek) {
        const son = new Date(sonKlasorYedek.tarih);
        if (a.siklik === 'haftalik' && Date.now() - son < 7 * 864e5) return 'bekle';
        if (a.siklik !== 'haftalik' && son.toDateString() === new Date().toDateString()) return 'bekle';
    }
    if (!await izin(t, false)) return 'izin';
    try { const s = await klasoreYedekle(); return typeof s === 'object' ? 'yazildi' : s; }
    catch (e) { console.log('[WSD] klasor otomatik yedek:', e); return 'yok'; }
}

/* ---------- Listeleme ---------- */

/** Dosyanin basindan ozet bilgileri okur - tum dosyayi acmadan */
async function basBilgi(dosyaH) {
    const f = await dosyaH.getFile();
    const bas = await f.slice(0, 4096).text();
    const al = re => { const m = re.exec(bas); return m ? m[1] : null; };
    let ozet = null, kaynak = null;
    try { ozet = JSON.parse(al(/"ozet":(\{[^}]*\})/)); } catch (e) { /* eski yedek */ }
    try { kaynak = JSON.parse(al(/"kaynak":(\{[^}]*\})/)); } catch (e) { /* */ }
    let tarih = null;
    try { tarih = JSON.parse(al(/"tarih":("[^"]*")/)); } catch (e) { /* */ }
    return { ad: f.name, boyut: f.size, tarih: tarih || new Date(f.lastModified).toISOString(), ozet, kaynak, h: dosyaH };
}

/** Klasordeki yedekler; `tumu` degilse yalnizca bu tarayicinin adi */
export async function yedekleriListele(tumu = false) {
    const t = await tutamakAl();
    if (!t) return { durum: 'klasorYok' };
    if (!await izin(t, true)) return { durum: 'izin' };
    const a = await ayarAl();
    const benim = temizAd(a.ad);
    const sonuc = [];
    for await (const [ad, h] of t.entries()) {
        if (h.kind !== 'directory') continue;
        if (!tumu && ad !== benim) continue;
        for await (const [dAd, dH] of h.entries()) {
            if (dH.kind !== 'file' || !/^wsd-.*\.json$/i.test(dAd)) continue;
            try { sonuc.push({ ...(await basBilgi(dH)), grup: ad }); } catch (e) { /* */ }
        }
    }
    sonuc.sort((x, y) => String(y.tarih).localeCompare(String(x.tarih)));
    return { durum: 'tamam', liste: sonuc, benim, klasor: t.name, kimlik: a.kimlik };
}

/* ---------- Geri yukleme penceresi ---------- */
let tumuGoster = false;

function boyutYaz(b) { return b > 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB'; }

async function listeCiz() {
    const kutu = el('kyListe');
    kutu.textContent = c('yukleniyor');
    const s = await yedekleriListele(tumuGoster);
    kutu.textContent = '';
    if (s.durum !== 'tamam') { kutu.textContent = c(s.durum === 'izin' ? 'klasorYedekIzinYok' : 'klasorYedekKlasorYok'); return; }
    if (!s.liste.length) { kutu.textContent = c('klasorYedekBos'); return; }
    const bicim = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });
    for (const y of s.liste) {
        const satir = document.createElement('div');
        satir.className = 'kySatir';
        const bilgi = document.createElement('div');
        bilgi.className = 'kyBilgi';
        const b = document.createElement('b');
        b.textContent = y.grup + (y.kaynak && y.kaynak.cihaz === s.kimlik ? ` · ${c('klasorYedekBuCihaz')}` : '');
        const alt = document.createElement('span');
        const parca = [bicim.format(new Date(y.tarih))];
        if (y.ozet) parca.push(c('nGrupNKart', y.ozet.grup, y.ozet.kart));
        parca.push(boyutYaz(y.boyut));
        if (y.ozet && y.ozet.gorselli === false) parca.push(c('klasorYedekGorselsiz'));
        alt.textContent = parca.join(' · ');
        bilgi.append(b, alt);
        const ekle = document.createElement('button');
        ekle.className = 'dugme'; ekle.type = 'button'; ekle.textContent = c('klasorYedekYukleDugme');
        ekle.addEventListener('click', () => mesgulDugme(ekle, c('okunuyor'), () => yukle(y)));
        satir.append(bilgi, ekle);
        kutu.appendChild(satir);
    }
}

async function yukle(y) {
    // Diger "Yukle" dugmeleri de kilitlensin: iki yedek ust uste yuklenmesin
    for (const b of document.querySelectorAll('#kyListe .dugme')) b.disabled = true;
    let metin;
    try { metin = await (await y.h.getFile()).text(); }
    catch (e) {
        for (const b of document.querySelectorAll('#kyListe .dugme')) b.disabled = false;
        bildirA(c('dosyaOkunamadi')); return;
    }
    kapat();
    try {
        await chrome.storage.local.set({ sonKlasorYukleme: { tarih: new Date().toISOString(), dosya: y.ad } });
    } catch (e) { /* */ }
    // Ekle / Degistir sorusu ve ilerleme penceresi ayarpanel'deki ortak yoldan
    document.dispatchEvent(new CustomEvent('wsd-metin-ice-aktar', { detail: { metin } }));
}

export async function geriYuklePenceresiniAc() {
    const p = el('klasorYedekPencere');
    if (!p) return;
    p.hidden = false;
    el('perde')?.classList.add('acik');
    el('kyTumu').checked = tumuGoster;
    await listeCiz();
}
function kapat() {
    el('klasorYedekPencere').hidden = true;
    if (!el('ayarPanel')?.classList.contains('acik')) el('perde')?.classList.remove('acik');
}

/* ---------- Baska cihazdan daha yeni yedek ---------- */
export async function yeniYedekDenetle() {
    if (!desteklenir()) return;
    const t = await tutamakAl();
    if (!t || !await izin(t, false)) return;          // izin sormadan; yoksa sessiz
    const a = await ayarAl();
    let alt;
    try { alt = await t.getDirectoryHandle(temizAd(a.ad)); } catch (e) { return; }
    let en = null;
    for await (const [ad, h] of alt.entries()) {
        if (h.kind !== 'file' || !/^wsd-.*\.json$/i.test(ad)) continue;
        let z = 0;
        try { z = (await h.getFile()).lastModified; } catch (e) { continue; }
        if (!en || z > en.z) en = { ad, h, z };
    }
    if (!en) return;
    const b = await basBilgi(en.h);
    if (!b.kaynak || b.kaynak.cihaz === a.kimlik) return;
    const d = await chrome.storage.local.get(['sonKlasorYedek', 'sonKlasorYukleme', 'sonGorulenUzakYedek']);
    const benimSon = [d.sonKlasorYedek?.tarih, d.sonKlasorYukleme?.tarih].filter(Boolean).sort().pop() || '';
    if (b.tarih <= benimSon || d.sonGorulenUzakYedek === b.ad) return;
    await chrome.storage.local.set({ sonGorulenUzakYedek: b.ad });
    const { bildir } = await import('./arayuz.js');
    const bicim = new Intl.DateTimeFormat(undefined, { dateStyle: 'short', timeStyle: 'short' });
    bildir(c('klasorYedekDahaYeni', b.kaynak.platform || b.kaynak.ad, bicim.format(new Date(b.tarih))), {
        etiket: c('klasorYedekGoster'), sure: 20000, calistir: geriYuklePenceresiniAc,
    });
}

/* ---------- Ayarlar paneli ---------- */
async function ozetiCiz() {
    const ad = el('kyKlasorAd');
    if (!ad) return;
    {
        const a0 = await ayarAl();
        el('kyAd').value = (await chrome.storage.local.get(AYAR))[AYAR]?.ad || '';
        el('kyAd').placeholder = a0.ad;
    }
    const kutu = el('kyAyrinti');
    if (!desteklenir()) {
        ad.textContent = c('klasorYedekDesteklenmiyor');
        el('kySec').disabled = true;
        kutu.hidden = true;
        return;
    }
    const t = await tutamakAl();
    const a = await ayarAl();
    ad.textContent = t ? t.name + '/' + temizAd(a.ad) : c('klasorYedekSecilmedi');
    kutu.hidden = !t;
    el('kyKaldir').hidden = !t;
    el('kyGorselli').checked = a.gorselli !== false;
    el('kySakla').value = a.sakla;
    el('kySiklik').value = a.siklik;
    const { sonKlasorYedek } = await chrome.storage.local.get('sonKlasorYedek');
    const son = el('kySon');
    if (sonKlasorYedek) {
        son.hidden = false;
        son.textContent = c('klasorYedekSon', new Intl.DateTimeFormat(undefined,
            { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(sonKlasorYedek.tarih)));
    } else son.hidden = true;
}

export function klasorYedekKur() {
    if (!el('kySec')) return;
    ozetiCiz();
    el('kySec').addEventListener('click', async () => {
        try { await klasorSec(); ozetiCiz(); }
        catch (e) {
            if (e && e.name === 'AbortError') return;
            const { bildir } = await import('./arayuz.js');
            bildir(c('klasorYedekSecilemedi'));
        }
    });
    el('kyKaldir').addEventListener('click', async () => { await klasorKaldir(); ozetiCiz(); });
    el('kyAd').addEventListener('change', async e => { await ayarYazK({ ad: e.target.value.trim() }); ozetiCiz(); });
    el('kyGorselli').addEventListener('change', e => ayarYazK({ gorselli: e.target.checked }));
    el('kySakla').addEventListener('change', e => ayarYazK({ sakla: Math.min(100, Math.max(1, +e.target.value || 10)) }));
    el('kySiklik').addEventListener('change', e => ayarYazK({ siklik: e.target.value }));
    el('kySimdi').addEventListener('click', e => klasoreYedekleBildir(e.currentTarget));
    el('kyGeriYukle').addEventListener('click', geriYuklePenceresiniAc);
    el('kyKapat')?.addEventListener('click', kapat);
    el('kyTumu')?.addEventListener('change', e => { tumuGoster = e.target.checked; listeCiz(); });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && el('klasorYedekPencere') && !el('klasorYedekPencere').hidden) kapat();
    });
}
