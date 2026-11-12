/**
 * AYAR PANELI RENK SECICISI (1.5.5)
 *
 * Tarayicinin kendi renk penceresi kutunun ALTINA aciliyor ve alttaki
 * satirlarin ustunu kapatiyordu: "Sol Kol Rengi"ni secip "Sag Kol Rengi"ne
 * gecmek icin once pencereyi kapatmak, sonra yeniden tiklamak gerekiyordu.
 *
 * Bu secici panelin SOLUNDA, satirin hizasinda aciliyor; liste acik
 * kaliyor. Baska bir renk kutusuna tiklayinca secici dogrudan oraya
 * geciyor. Deger asil <input type=color>'a yaziliyor ve 'input'/'change'
 * olaylari tetikleniyor - ayar kodu hicbir sey fark etmiyor.
 */

import { c } from './dil.js';

const SON_ANAHTAR = 'wsdSonRenkler';
const SON_SAYI = 10;

let kutu = null;           // secici penceresi
let hedef = null;          // duzenlenen <input type=color>
let hsv = { h: 0, s: 0, v: 0 };
let alfa = 1;              // 0..1 - yalniz data-alfa olan kutularda (1.7.0)
let cipa = null;           // konum icin dugme (gizli kutu disaridan acilinca)
let ilkDeger = '';
let tazeIstek = 0;

/** "#rrggbb", "#rrggbbaa" ya da "rgba(r,g,b,a)" -> { hex, a } */
export function renkCozumle(d) { return cozumle(d); }
export function renkDegeri(hex, a) { return deger(hex, a); }
function cozumle(deger) {
    const s = String(deger || '').trim();
    let m = /^#?([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(s);
    if (m) return { hex: '#' + m[1].toLowerCase(), a: m[2] ? parseInt(m[2], 16) / 255 : 1 };
    m = /^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)(?:[\s,/]+([\d.]+%?))?\s*\)$/i.exec(s);
    if (m) {
        const hex = '#' + [m[1], m[2], m[3]].map(x => Math.min(255, +x).toString(16).padStart(2, '0')).join('');
        let a = m[4] === undefined ? 1 : (m[4].endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4]));
        return { hex, a: Math.max(0, Math.min(1, isNaN(a) ? 1 : a)) };
    }
    return { hex: '#000000', a: 1 };
}
/** Saydamsiz: hex; saydam: rgba(...) */
function deger(hex, a) {
    if (a >= 0.995) return hex;
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${n >> 16 & 255}, ${n >> 8 & 255}, ${n & 255}, ${Math.round(a * 100) / 100})`;
}
const alfaliMi = () => !!hedef && hedef.dataset.alfa === '1';

/* ---------- Renk donusumleri ---------- */

function hexHsv(hex) {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
    if (!m) return { h: 0, s: 0, v: 0 };
    const n = parseInt(m[1], 16);
    const r = (n >> 16 & 255) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
    let h = 0;
    if (d) {
        if (mx === r) h = ((g - b) / d) % 6;
        else if (mx === g) h = (b - r) / d + 2;
        else h = (r - g) / d + 4;
        h *= 60;
        if (h < 0) h += 360;
    }
    return { h, s: mx ? d / mx : 0, v: mx };
}

function hsvHex({ h, s, v }) {
    const f = k => {
        const x = (k + h / 60) % 6;
        return v - v * s * Math.max(0, Math.min(x, 4 - x, 1));
    };
    return '#' + [f(5), f(3), f(1)]
        .map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
}

/* ---------- Son kullanilanlar ---------- */

function sonlariAl() {
    try { return JSON.parse(localStorage.getItem(SON_ANAHTAR) || '[]').filter(x => /^#[0-9a-f]{6}$/i.test(x)); }
    catch (e) { return []; }
}
function sonaEkle(hex) {
    try {
        const l = [hex.toLowerCase(), ...sonlariAl().filter(x => x.toLowerCase() !== hex.toLowerCase())];
        localStorage.setItem(SON_ANAHTAR, JSON.stringify(l.slice(0, SON_SAYI)));
    } catch (e) { /* */ }
}

/* ---------- Pencere ---------- */

function olustur() {
    kutu = document.createElement('div');
    kutu.id = 'renkSecici';
    kutu.hidden = true;
    kutu.innerHTML = `
        <div class="rsAlan"><div class="rsBeyaz"></div><div class="rsSiyah"></div><div class="rsImlec"></div></div>
        <div class="rsSatir">
            <button type="button" class="rsDamla" hidden>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m2 22 1-1h3l9-9"/><path d="M3 21v-3l9-9"/><path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4Z"/></svg>
            </button>
            <span class="rsOnizleme"></span>
            <input type="range" class="rsTon" min="0" max="360" step="1">
        </div>
        <div class="rsSatir rsAlfaSatir" hidden>
            <input type="range" class="rsAlfa" min="0" max="100" step="1">
            <span class="rsAlfaYuzde"></span>
        </div>
        <div class="rsSatir">
            <input type="text" class="rsHex" maxlength="7" spellcheck="false" autocomplete="off">
            <div class="rsSonlar"></div>
        </div>`;
    document.body.appendChild(kutu);
    kutu.querySelector('.rsDamla').title = c('ekrandanSec');

    const alan = kutu.querySelector('.rsAlan');
    const surukle = e => {
        const r = alan.getBoundingClientRect();
        hsv.s = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
        hsv.v = 1 - Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
        uygula();
    };
    alan.addEventListener('pointerdown', e => {
        alan.setPointerCapture(e.pointerId);
        surukle(e);
        const hareket = ev => surukle(ev);
        const birak = () => {
            alan.removeEventListener('pointermove', hareket);
            alan.removeEventListener('pointerup', birak);
            degisti();
        };
        alan.addEventListener('pointermove', hareket);
        alan.addEventListener('pointerup', birak);
    });

    const ton = kutu.querySelector('.rsTon');
    ton.addEventListener('input', () => { hsv.h = +ton.value; uygula(); });
    ton.addEventListener('change', degisti);

    const alfaAlan = kutu.querySelector('.rsAlfa');
    alfaAlan.addEventListener('input', () => { alfa = +alfaAlan.value / 100; uygula(); });
    alfaAlan.addEventListener('change', degisti);

    const hexAlan = kutu.querySelector('.rsHex');
    hexAlan.addEventListener('input', () => {
        let v = hexAlan.value.trim();
        if (!v.startsWith('#')) v = '#' + v;
        if (/^#[0-9a-f]{6}$/i.test(v)) { hsv = hexHsv(v); uygula(false); }
    });
    hexAlan.addEventListener('change', degisti);
    hexAlan.addEventListener('keydown', e => { if (e.key === 'Enter') { degisti(); kapat(); } });

    kutu.querySelector('.rsSonlar').addEventListener('click', e => {
        const s = e.target.closest('[data-renk]');
        if (!s) return;
        hsv = hexHsv(s.dataset.renk);
        uygula();
        degisti();
    });

    const damla = kutu.querySelector('.rsDamla');
    if ('EyeDropper' in window) {
        damla.hidden = false;
        damla.addEventListener('click', async () => {
            try {
                const { sRGBHex } = await new window.EyeDropper().open();
                hsv = hexHsv(sRGBHex);
                uygula();
                degisti();
            } catch (e) { /* vazgecildi */ }
        });
    }
}

/** Pencereyi gunceller ve degeri asil kutuya yazar */
function uygula(hexYaz = true, yaz = true) {
    const hex = hsvHex(hsv);
    kutu.querySelector('.rsAlan').style.background = `hsl(${hsv.h} 100% 50%)`;
    const im = kutu.querySelector('.rsImlec');
    im.style.left = (hsv.s * 100) + '%';
    im.style.top = ((1 - hsv.v) * 100) + '%';
    im.style.background = hex;
    kutu.querySelector('.rsTon').value = Math.round(hsv.h);
    const yeni = alfaliMi() ? deger(hex, alfa) : hex;
    kutu.querySelector('.rsOnizleme').style.background = yeni;
    if (hexYaz) kutu.querySelector('.rsHex').value = hex;
    const as = kutu.querySelector('.rsAlfaSatir');
    as.hidden = !alfaliMi();
    if (alfaliMi()) {
        const aa = kutu.querySelector('.rsAlfa');
        aa.value = Math.round(alfa * 100);
        aa.style.setProperty('--rs-renk', hex);
        kutu.querySelector('.rsAlfaYuzde').textContent = Math.round(alfa * 100) + '%';
    }

    if (!yaz || !hedef || hedef.value.toLowerCase() === yeni.toLowerCase()) return;
    hedef.value = yeni;
    // Surukleme sirasinda her kare yazmasin: kare basina bir olay
    cancelAnimationFrame(tazeIstek);
    const h = hedef;
    tazeIstek = requestAnimationFrame(() => h.dispatchEvent(new Event('input', { bubbles: true })));
}

function degisti() {
    if (!hedef) return;
    hedef.dispatchEvent(new Event('change', { bubbles: true }));
}

function sonlariCiz() {
    const yer = kutu.querySelector('.rsSonlar');
    yer.textContent = '';
    for (const r of sonlariAl()) {
        const b = document.createElement('button');
        b.type = 'button';
        b.dataset.renk = r;
        b.title = r;
        b.style.background = r;
        yer.appendChild(b);
    }
}

function konumla() {
    if (!hedef || !kutu) return;
    // Ayar paneli disi (Kart Duzenle vb.): dugmenin yaninda, ekranda kalsin
    if (!hedef.closest('#ayarPanel')) {
        const a = (cipa && cipa.isConnected ? cipa : hedef).getBoundingClientRect();
        const k = kutu.getBoundingClientRect();
        const G = 10;
        let x = a.right + G;
        if (x + k.width > innerWidth - G) x = a.left - k.width - G;
        if (x < G) x = Math.max(G, Math.min(a.left, innerWidth - k.width - G));
        let y = a.top + a.height / 2 - k.height / 2;
        y = Math.max(G, Math.min(y, innerHeight - k.height - G));
        kutu.style.left = x + 'px';
        kutu.style.top = y + 'px';
        return;
    }
    const r = (cipa && cipa.isConnected ? cipa : hedef).getBoundingClientRect();
    const panel = document.getElementById('ayarPanel')?.getBoundingClientRect();
    const k = kutu.getBoundingClientRect();
    const G = 10;
    // Once panelin SOLUNA, satir hizasina: liste acik kalsin
    let x = (panel ? panel.left : r.left) - k.width - G;
    let y = r.top + r.height / 2 - k.height / 2;
    if (x < G) {                       // dar pencere: kutunun altina/ustune
        x = Math.max(G, r.right - k.width);
        y = r.bottom + 6;
        if (y + k.height > innerHeight - G) y = r.top - k.height - 6;
    }
    y = Math.max(G, Math.min(y, innerHeight - k.height - G));
    kutu.style.left = x + 'px';
    kutu.style.top = y + 'px';
}

function ac(girdi, dugme = null) {
    if (!kutu) olustur();
    if (hedef && hedef !== girdi) bitir();
    hedef = girdi;
    cipa = dugme;
    ilkDeger = girdi.value;
    const c0 = cozumle(girdi.value);
    hsv = hexHsv(c0.hex);
    alfa = girdi.dataset.alfa === '1' ? c0.a : 1;
    document.querySelectorAll('.renkDuzenleniyor').forEach(x => x.classList.remove('renkDuzenleniyor'));
    girdi.classList.add('renkDuzenleniyor');
    sonlariCiz();
    kutu.hidden = false;
    uygula(true, false);          // acmak degeri degistirmesin (bos zemin siyaha donmesin)
    konumla();
}

/** Duzenlenen kutuyu birakir; deger degistiyse son kullanilanlara ekler */
function bitir() {
    if (!hedef) return;
    if (hedef.value.toLowerCase() !== ilkDeger.toLowerCase()) sonaEkle(cozumle(hedef.value).hex);
    hedef.classList.remove('renkDuzenleniyor');
    hedef = null;
}

function kapat() {
    bitir();
    if (kutu) kutu.hidden = true;
}

/**
 * Disaridan ac (1.7.0): gizli bir kutu icin bir dugmeden. Kutuda
 * data-alfa="1" varsa saydamlik kaydiricisi da cikar; deger "rgba(...)" olur.
 */
export function renkSeciciAc(girdi, dugme) {
    if (!girdi) return;
    if (hedef === girdi && kutu && !kutu.hidden) { kapat(); return; }
    ac(girdi, dugme);
}

export function renkSeciciyiKur() {
    // Yalnizca ayar panelindeki renk kutulari. Yakalama asamasinda: yerel
    // pencere hic acilmasin.
    document.addEventListener('click', e => {
        // Ayar paneli ve pencerelerdeki (Kart Duzenle, Grup) renk kutulari:
        // tarayicinin penceresi bazen ekranin kosesinde aciliyordu (1.7.0)
        const girdi = e.target.closest?.('#ayarPanel input[type=color], .pencere input[type=color]');
        if (girdi) {
            e.preventDefault();
            if (hedef === girdi && kutu && !kutu.hidden) kapat();
            else ac(girdi);
            return;
        }
        if (kutu && !kutu.hidden && !e.target.closest('#renkSecici')) {
            // Perdeye tiklama yalnizca seciciyi kapatsin, ayar panelini ya
            // da pencereyi de kapatmasin. Acan dugmeye tiklama: kapat, yeniden acma
            const perde = !e.target.closest('#ayarPanel, .pencereIc, .pencere > *');
            const acanDugme = cipa && e.target.closest && cipa.contains(e.target);
            if (perde || acanDugme) { e.preventDefault(); e.stopPropagation(); }
            kapat();
        }
    }, true);

    // Klavyeyle (Enter/Bosluk) acilmasin diye de
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && kutu && !kutu.hidden) {
            // Esc: degisikligi geri al
            if (hedef && ilkDeger && hedef.value !== ilkDeger) {
                const c0 = cozumle(ilkDeger);
                hsv = hexHsv(c0.hex);
                if (alfaliMi()) alfa = c0.a;
                uygula();
                degisti();
            }
            kapat();
            e.stopPropagation();
            return;
        }
        const girdi = e.target.closest?.('#ayarPanel input[type=color], .pencere input[type=color]');
        if (girdi && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); ac(girdi); }
    }, true);

    // Panel kayinca ya da pencere degisince yeniden hizala
    const panel = document.getElementById('ayarPanel');
    panel?.addEventListener('scroll', konumla, true);
    // Panel kapanirsa secici de kapansin
    if (panel) new MutationObserver(() => {
        if (!panel.classList.contains('acik') && hedef?.closest('#ayarPanel')) kapat();
    }).observe(panel, { attributes: true, attributeFilter: ['class'] });
    // Pencere kapanirsa da (Kart Duzenle, Grup)
    const pg = new MutationObserver(() => { if (hedef && hedef.closest('.pencere')?.hidden) kapat(); });
    for (const p of document.querySelectorAll('.pencere')) pg.observe(p, { attributes: true, attributeFilter: ['hidden'] });
    addEventListener('resize', konumla);
}
