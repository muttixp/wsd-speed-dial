// WSD Speed Dial - Copyright (C) 2026 muttixp
//
// Bu program ozgur yazilimdir: GNU Genel Kamu Lisansi 3. surum ya da
// (tercihinize bagli olarak) daha sonraki bir surumu kosullariyla
// dagitilir. Ayrintilar: LICENSE dosyasi.

/**
 * HAZIR GRUPLAR (1.5.5)
 *
 * Bos kadranla baslayan kullaniciya ornek gruplar: "Gunluk", "Gelistirici"
 * gibi 5-6 kartlik paketler. Liste ve paketler depodaki `paketler/`
 * klasorunden - once GitHub'daki guncel kopya (yeni surum cikarmadan
 * paket eklenebilsin), ag yoksa eklentinin icindeki kopya.
 *
 * Istek YALNIZCA pencere acilinca ve "Ekle"ye basinca gidiyor. Paketten
 * yalnizca grup adi, ikon ve kartlar (baslik + http/https adres) aliniyor;
 * ayar, gorsel, not gibi alanlar yok sayiliyor.
 */
import { c } from './dil.js';
import { bildir } from './arayuz.js';

const UZAK = 'https://raw.githubusercontent.com/muttixp/wsd-speed-dial/main/paketler/';
const YEREL = chrome.runtime.getURL('paketler/');
const DEPO = 'https://github.com/muttixp/wsd-speed-dial/tree/main/paketler';
const el = id => document.getElementById(id);

let liste = [];            // index.json paketleri
let kaynak = YEREL;        // listenin geldigi yer - paketler de oradan
let tumDiller = false;
const eklenenler = new Set();

const arayuzDili = () => {
    try { return (chrome.i18n.getUILanguage() || 'en').slice(0, 2).toLowerCase(); } catch (e) { return 'en'; }
};

async function jsonAl(adres, ms = 5000) {
    const k = new AbortController();
    const t = setTimeout(() => k.abort(), ms);
    try {
        const y = await fetch(adres, { credentials: 'omit', cache: 'no-cache', signal: k.signal });
        if (!y.ok) throw new Error('HTTP ' + y.status);
        return await y.json();
    } finally { clearTimeout(t); }
}

async function listeyiYukle() {
    for (const yer of [UZAK, YEREL]) {
        try {
            const d = await jsonAl(yer + 'index.json');
            if (Array.isArray(d?.paketler)) {
                kaynak = yer;
                liste = d.paketler.filter(p => p && p.id && p.ad && /^[\w.-]+\.json$/.test(p.dosya || ''));
                return;
            }
        } catch (e) { /* sonraki kaynak */ }
    }
    liste = [];
}

/** Paket icerigini guvenli WSD yedegine indirger */
function suz(veri) {
    const gruplar = (veri?.wsd?.gruplar || []).filter(g => g && !g.kokMu).slice(0, 10).map(g => ({
        kokMu: false,
        baslik: String(g.baslik || 'Grup').slice(0, 60),
        ikon: typeof g.ikon === 'string' && /^[a-z_]{2,20}$/.test(g.ikon) ? g.ikon : null,
        gorunum: null,
        kartlar: (g.kartlar || []).filter(k => k && /^https?:\/\//i.test(k.url || '')).slice(0, 60)
            .map(k => ({ baslik: String(k.baslik || k.url).slice(0, 120), url: String(k.url) }))
    })).filter(g => g.kartlar.length);
    return { wsd: { surum: 1, gruplar, gorseller: {}, notlar: {}, renkler: {}, sayaclar: {}, ayarlar: null } };
}

function ciz() {
    const kap = el('paketListe');
    if (!kap) return;
    kap.textContent = '';
    const dil = arayuzDili();
    const kendiDili = liste.some(p => p.dil === dil) ? dil : 'en';
    const gosterilen = tumDiller ? liste : liste.filter(p => p.dil === kendiDili);
    if (!gosterilen.length) {
        const p = document.createElement('p');
        p.className = 'kucukBilgi';
        p.textContent = c('paketListesiAlinamadi');
        kap.appendChild(p);
        return;
    }
    for (const p of gosterilen) {
        const satir = document.createElement('div');
        satir.className = 'paketSatir';
        const yazi = document.createElement('div');
        yazi.className = 'paketYazi';
        const ad = document.createElement('b');
        ad.textContent = p.ad + (tumDiller ? ` · ${String(p.dil || '').toUpperCase()}` : '');
        const sayi = document.createElement('span');
        sayi.className = 'paketSayi';
        sayi.textContent = c('nKartKisa', p.kart || 0);
        ad.appendChild(sayi);
        const acik = document.createElement('small');
        acik.textContent = p.aciklama || '';
        yazi.append(ad, acik);
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'dugme' + (eklenenler.has(p.id) ? '' : ' birincil');
        btn.textContent = eklenenler.has(p.id) ? '✓ ' + c('eklendi') : c('ekle');
        btn.disabled = eklenenler.has(p.id);
        btn.addEventListener('click', () => paketiEkle(p, btn));
        satir.append(yazi, btn);
        kap.appendChild(satir);
    }
}

async function paketiEkle(p, btn) {
    btn.disabled = true;
    try {
        let veri;
        try { veri = await jsonAl(kaynak + p.dosya, 8000); }
        catch (e) { veri = await jsonAl(YEREL + p.dosya, 8000); }    // uzak paket yoksa yerel
        const temiz = suz(veri);
        if (!temiz.wsd.gruplar.length) throw new Error('bos paket');
        const { yedegiYukle } = await import('./yedek.js');
        const s = await yedegiYukle(temiz, false);
        eklenenler.add(p.id);
        const { arayuzuKur, grubuAc } = await import('./cizim.js');
        await arayuzuKur();
        // Eklenen grubu ac: kartlar ve gorselleri yuklenirken gorunsun
        try {
            const { gruplariAl } = await import('./yerimi.js');
            const ad = temiz.wsd.gruplar[0].baslik.trim().toLocaleLowerCase();
            const g = (await gruplariAl()).filter(x => (x.baslik || '').trim().toLocaleLowerCase() === ad).pop();
            if (g) await grubuAc(g.id);
        } catch (e) { /* ana sayfada kal */ }
        bildir('✓ ' + c('paketEklendi', p.ad, s.eklenen ?? s.kart));
        ciz();
    } catch (e) {
        console.log('[WSD] paket eklenemedi:', e);
        btn.disabled = false;
        bildir(c('paketEklenemedi'));
    }
}

export async function paketPenceresiniAc() {
    const pencere = el('paketPencere');
    if (!pencere) return;
    el('paketListe').textContent = c('yukleniyor');
    pencere.hidden = false;
    el('perde')?.classList.add('acik');
    await listeyiYukle();
    ciz();
}

export function paketPenceresiniKur() {
    const kapat = () => {
        el('paketPencere').hidden = true;
        if (!el('ayarPanel')?.classList.contains('acik')) el('perde')?.classList.remove('acik');
    };
    el('paketKapat')?.addEventListener('click', kapat);
    el('paketTumDiller')?.addEventListener('change', e => { tumDiller = e.target.checked; ciz(); });
    el('paketOner')?.addEventListener('click', () => chrome.tabs.create({ url: DEPO }));
    for (const id of ['karsilamaPaket', 'ayPaketler']) el(id)?.addEventListener('click', paketPenceresiniAc);
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && el('paketPencere') && !el('paketPencere').hidden) kapat();
    });
}
