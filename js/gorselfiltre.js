// WSD Speed Dial - Copyright (C) 2026 muttixp - GPL-3.0-or-later
//
// GORSEL FILTRESI (1.6.1): Kart Duzenle > Filtre. Secili gorsele filtre
// uygulanip sonuc YENI bir aday olarak karusele eklenir; asil gorsel
// yerinde kalir (geri donulebilir). Filtre ayar olarak saklanmaz, gorsele
// islenir - yedek/aktarim degismez, sayfa hizina etkisi yok.
//
// Turler:
//   tekrenk    -> zeminden farkli her sey secilen renge (siyah logo -> mor)
//   renklendir -> koyu..acik tonlar secilen rengin tonlarina (duotone)
//   gri, sepya
//   ters       -> ISIK ters cevrilir, renk tonu korunur (1.6.2): koyu zeminli
//                 logo acik zemine, acik olan koyuya - kirmizi kirmizi kalir
// Hepsinde Parlaklik / Kontrast.
import { secimDurumu, adayEkle, onizlemeGoster, karuseliCiz, cizinceCagir } from './karusel.js';
import { c } from './dil.js';

const el = id => document.getElementById(id);
const ONIZLEME_EN = 480;          // onizleme kucuk olcekte (hizli)
const KAYIT_EN = 1200;

const durum = { tur: 'yok', renk: '#7c4dff', parlaklik: 0, kontrast: 0 };
let sira = 0;                     // yarisan onizlemelerden yalnizca sonuncusu

const notr = () => durum.tur === 'yok' && !durum.parlaklik && !durum.kontrast;
const acikMi = () => el('kpFiltrePanel') && !el('kpFiltrePanel').hidden;

function hex(h) {
    const m = /^#?([0-9a-f]{6})$/i.exec(h || '');
    const n = m ? parseInt(m[1], 16) : 0x7c4dff;
    return [n >> 16 & 255, n >> 8 & 255, n & 255];
}

function gorselYukle(kaynak) {
    return new Promise((coz, red) => {
        const g = new Image();
        g.onload = () => coz(g);
        g.onerror = () => red(new Error('yuklenemedi'));
        g.src = kaynak;
    });
}

/** Zemin rengi: koselerin ortalamasi; koseler seffafsa null */
function zeminBul(p, w, h) {
    const noktalar = [0, w - 1, (h - 1) * w, h * w - 1, (w >> 1), (h >> 1) * w];
    let r = 0, g = 0, b = 0, n = 0, seffaf = 0;
    for (const i of noktalar) {
        const o = i * 4;
        if (p[o + 3] < 40) { seffaf++; continue; }
        r += p[o]; g += p[o + 1]; b += p[o + 2]; n++;
    }
    if (seffaf >= n) return null;
    return [r / n, g / n, b / n];
}

function tekRenk(p, w, h, [R, G, B]) {
    const zemin = zeminBul(p, w, h);
    if (!zemin) {                         // seffaf zemin: siluet secilen renk
        for (let o = 0; o < p.length; o += 4) { p[o] = R; p[o + 1] = G; p[o + 2] = B; }
        return;
    }
    const [zr, zg, zb] = zemin;
    const fark = new Float32Array(p.length / 4);
    let enBuyuk = 0;
    for (let i = 0, o = 0; o < p.length; i++, o += 4) {
        const d = Math.hypot(p[o] - zr, p[o + 1] - zg, p[o + 2] - zb) / 441.7;
        fark[i] = d;
        if (d > enBuyuk) enBuyuk = d;
    }
    // Zeminden en farkli kismin %60'i tam renk; kenar yumusakligi korunur
    const ust = Math.max(0.12, enBuyuk * 0.6), alt = 0.04;
    for (let i = 0, o = 0; o < p.length; i++, o += 4) {
        const t = Math.min(1, Math.max(0, (fark[i] - alt) / (ust - alt)));
        p[o]     = zr + (R - zr) * t;
        p[o + 1] = zg + (G - zg) * t;
        p[o + 2] = zb + (B - zb) * t;
    }
}

function isle(p, w, h) {
    const [R, G, B] = hex(durum.renk);
    if (durum.tur === 'tekrenk') tekRenk(p, w, h, [R, G, B]);
    const C = durum.kontrast * 2.55;
    const k = (259 * (C + 255)) / (255 * (259 - C));
    const pa = durum.parlaklik * 2.55;
    const tur = durum.tur;
    for (let o = 0; o < p.length; o += 4) {
        let r = p[o], g = p[o + 1], b = p[o + 2];
        if (tur === 'gri' || tur === 'renklendir') {
            const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            if (tur === 'gri') { r = g = b = l; }
            else {
                const t = l / 255;
                if (t < 0.5) { r = R * t * 2; g = G * t * 2; b = B * t * 2; }
                else { const u = (t - 0.5) * 2; r = R + (255 - R) * u; g = G + (255 - G) * u; b = B + (255 - B) * u; }
            }
        } else if (tur === 'sepya') {
            [r, g, b] = [0.393 * r + 0.769 * g + 0.189 * b, 0.349 * r + 0.686 * g + 0.168 * b, 0.272 * r + 0.534 * g + 0.131 * b];
        } else if (tur === 'ters') {
            // HSL'de L -> 1-L; ton ve doygunluk ayni. Kisa yol: rengin en
            // acik ve en koyu bileseninin toplamini 255'e tamamlayacak
            // kadar kaydir (tum bilesenlere ayni miktar).
            const kay = 255 - Math.max(r, g, b) - Math.min(r, g, b);
            r += kay; g += kay; b += kay;
        }
        if (pa || C) {
            r = k * (r - 128) + 128 + pa;
            g = k * (g - 128) + 128 + pa;
            b = k * (b - 128) + 128 + pa;
        }
        p[o] = r; p[o + 1] = g; p[o + 2] = b;      // Uint8Clamped: tasma kirpilir
    }
}

/** Filtreyi uygular; data URI (webp, seffaflik korunur) */
async function uygula(kaynak, enCok) {
    const g = await gorselYukle(kaynak);
    const olcek = Math.min(1, enCok / Math.max(g.naturalWidth, g.naturalHeight));
    const w = Math.max(1, Math.round(g.naturalWidth * olcek));
    const h = Math.max(1, Math.round(g.naturalHeight * olcek));
    const cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    const x = cv.getContext('2d', { willReadFrequently: true });
    x.drawImage(g, 0, 0, w, h);
    const veri = x.getImageData(0, 0, w, h);       // yabanci adres: hata atar
    isle(veri.data, w, h);
    x.putImageData(veri, 0, 0);
    return cv.toDataURL('image/webp', 0.92);
}

async function onizle() {
    if (!acikMi() || notr()) return;
    const { gorsel } = secimDurumu();
    if (!gorsel) return;
    const benim = ++sira;
    try {
        const sonuc = await uygula(gorsel, ONIZLEME_EN);
        if (benim === sira && acikMi()) onizlemeGoster(sonuc);
    } catch (e) { /* uygula dugmesinde bildirilir */ }
}

let bekleyen = 0;
function onizlemeIste() {
    cancelAnimationFrame(bekleyen);
    bekleyen = requestAnimationFrame(() => {
        if (notr()) karuseliCiz(); else onizle();
    });
}

function denetimleriCiz() {
    for (const b of document.querySelectorAll('#kpFiltreTur .segBtn')) {
        b.classList.toggle('secili', b.dataset.tur === durum.tur);
    }
    el('kpFiltreRenkSatir').hidden = !['tekrenk', 'renklendir'].includes(durum.tur);
    el('kpFiltreRenk').value = durum.renk;
    el('kpParlaklik').value = durum.parlaklik;
    el('kpKontrast').value = durum.kontrast;
}

function sifirla() {
    durum.tur = 'yok'; durum.parlaklik = 0; durum.kontrast = 0;
    sira++;
    denetimleriCiz();
}

/** Pencere acilirken / kapanirken */
export function filtrePaneliniKapat() {
    const panel = el('kpFiltrePanel');
    if (!panel) return;
    sifirla();
    panel.hidden = true;
    el('kpFiltre')?.classList.remove('secili');
}

/** Kaydet'e basildiginda panel acik ve filtre secili ise once uygula */
export async function bekleyenFiltreyiUygula() {
    if (!acikMi() || notr()) return;
    await uygulaVeEkle(false);
}

async function uygulaVeEkle(bildirsin = true) {
    const { gorsel } = secimDurumu();
    if (!gorsel) return;
    const { bildir } = await import('./arayuz.js');
    try {
        const sonuc = await uygula(gorsel, KAYIT_EN);
        filtrePaneliniKapat();
        adayEkle(sonuc);                       // yeni aday + secili; asil yerinde
        if (bildirsin) bildir(c('filtreUygulandi'));
    } catch (e) {
        console.log('[WSD] filtre uygulanamadi:', e);
        bildir(c('filtreUygulanamadi'));
    }
}

export function gorselFiltreKur() {
    const panel = el('kpFiltrePanel');
    if (!panel) return;
    cizinceCagir(() => { if (acikMi() && !notr()) onizle(); });

    el('kpFiltre')?.addEventListener('click', async () => {
        if (acikMi()) { filtrePaneliniKapat(); karuseliCiz(); return; }
        if (!secimDurumu().gorsel) {
            const { bildir } = await import('./arayuz.js');
            return bildir(c('filtreGorselYok'));
        }
        sifirla();
        panel.hidden = false;
        el('kpFiltre').classList.add('secili');
    });
    el('kpFiltreTur').addEventListener('click', e => {
        const b = e.target.closest('.segBtn');
        if (!b) return;
        durum.tur = b.dataset.tur;
        denetimleriCiz();
        onizlemeIste();
    });
    el('kpFiltreRenk').addEventListener('input', e => { durum.renk = e.target.value; onizlemeIste(); });
    el('kpParlaklik').addEventListener('input', e => { durum.parlaklik = +e.target.value; onizlemeIste(); });
    el('kpKontrast').addEventListener('input', e => { durum.kontrast = +e.target.value; onizlemeIste(); });
    el('kpFiltreSifirla').addEventListener('click', () => { sifirla(); karuseliCiz(); });
    el('kpFiltreUygula').addEventListener('click', () => {
        if (notr()) { filtrePaneliniKapat(); karuseliCiz(); return; }
        uygulaVeEkle();
    });
}
