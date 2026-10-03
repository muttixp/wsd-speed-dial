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

// WSD Speed Dial - SAG TIK "KLASOR SEC..." PENCERESI (1.5.2)
//
// Chrome'un sag tik menusunde alt menusu olan satira tiklanamiyor.
// Bu yuzden menude yalnizca gruplar var (tek tikla ekler), alt
// klasorler icin bu kucuk pencere aciliyor: Tasi penceresindeki agacin
// aynisi, ama burada HER SATIRIN ADINA tiklayinca o klasore ekleniyor;
// ▸ yalnizca dali acip kapatiyor. Acik dallar Tasi penceresiyle ortak
// (wsdTasiAcik), son secilen yer ayri hatirlaniyor (wsdEkleSon).

import { c, sayfayiCevir } from './dil.js';
import { tumKlasorleriAl } from './yerimi.js';

const el = id => document.getElementById(id);
const ACIK = 'wsdTasiAcik';
const SON = 'wsdEkleSon';

let acik;
try { acik = new Set(JSON.parse(localStorage.getItem(ACIK) || '[]')); } catch (e) { acik = new Set(); }
const acikYaz = () => { try { localStorage.setItem(ACIK, JSON.stringify([...acik])); } catch (e) { /* onemli degil */ } };

async function kur() {
    sayfayiCevir();
    const { bekleyenEkle: b } = await chrome.storage.local.get('bekleyenEkle');
    if (!b || !b.url) return window.close();
    el('secAdres').textContent = b.baslik || b.url;
    el('secAdres').title = b.url;

    const liste = el('secListe');
    const klasorler = await tumKlasorleriAl();
    const cocuklu = new Set(klasorler.filter(k => k.ustId).map(k => k.ustId));
    const ustu = new Map(klasorler.map(k => [k.id, k.ustId]));

    for (const k of klasorler) {
        const li = document.createElement('li');
        li.dataset.id = k.id;
        li.dataset.yol = k.yol;
        if (k.ustId) li.dataset.ust = k.ustId;
        li.style.paddingLeft = (10 + k.derinlik * 16) + 'px';
        const ok = document.createElement('span');
        ok.className = 'tasiOk';
        const ad = document.createElement('span');
        ad.className = 'tasiAd';
        ad.textContent = k.baslik;
        ad.title = k.yol;
        li.append(ok, ad);
        if (cocuklu.has(k.id)) li.classList.add('dalli');
        liste.appendChild(li);
    }

    const gorunurluk = () => {
        for (const li of liste.children) {
            let gizli = false;
            for (let u = li.dataset.ust; u; u = ustu.get(u)) if (!acik.has(u)) { gizli = true; break; }
            li.hidden = gizli;
            if (li.classList.contains('dalli')) li.querySelector('.tasiOk').textContent = acik.has(li.dataset.id) ? '▾' : '▸';
        }
    };
    const ustleriAc = li => { for (let u = li.dataset.ust; u; u = ustu.get(u)) acik.add(u); };
    gorunurluk();

    // Son secilen yer gorunsun ve vurgulu olsun
    let son = null;
    try { son = localStorage.getItem(SON); } catch (e) { /* yok */ }
    const sonLi = son && liste.querySelector(`li[data-id="${CSS.escape(son)}"]`);
    if (sonLi) { ustleriAc(sonLi); gorunurluk(); sonLi.classList.add('secili'); sonLi.scrollIntoView({ block: 'center' }); }

    let gonderildi = false;
    const sec = async li => {
        if (gonderildi) return;
        gonderildi = true;
        try { localStorage.setItem(SON, li.dataset.id); } catch (e) { /* onemli degil */ }
        await chrome.runtime.sendMessage({ hedef: 'arkaplan', tur: 'seciciEkle', klasorId: li.dataset.id }).catch(() => {});
        window.close();
    };

    liste.addEventListener('click', e => {
        const li = e.target.closest('li');
        if (!li) return;
        // ▸ dali acar/kapar; ADA tiklamak her zaman o klasore ekler
        if (e.target.closest('.tasiOk') && li.classList.contains('dalli')) {
            if (acik.has(li.dataset.id)) acik.delete(li.dataset.id); else acik.add(li.dataset.id);
            acikYaz();
            gorunurluk();
            return;
        }
        sec(li);
    });

    // Arama: once adi tam esleseni, sonra adi baslayani, sonra icinde geceni
    const suz = el('secSuz');
    let sira = 0;
    const eslesenler = () => {
        const t = suz.value.trim().toLocaleLowerCase('tr');
        if (!t) return [];
        const derece = li => {
            const a = li.querySelector('.tasiAd').textContent.trim().toLocaleLowerCase('tr');
            return a === t ? 0 : a.startsWith(t) ? 1 : a.includes(t) ? 2 : li.dataset.yol.toLocaleLowerCase('tr').includes(t) ? 3 : -1;
        };
        return [...liste.children].map((li, i) => ({ li, i, d: derece(li) }))
            .filter(x => x.d >= 0).sort((a, b) => a.d - b.d || a.i - b.i).map(x => x.li);
    };
    const goster = l => {
        for (const x of liste.querySelectorAll('.vurgulu, .secili')) x.classList.remove('vurgulu', 'secili');
        if (!l.length) return;
        if (sira >= l.length) sira = 0;
        ustleriAc(l[sira]); gorunurluk();
        l[sira].classList.add('vurgulu', 'secili');
        l[sira].scrollIntoView({ block: 'center' });
    };
    suz.addEventListener('input', () => { sira = 0; goster(eslesenler()); });
    suz.addEventListener('keydown', e => {
        if (e.key === 'Escape') return window.close();
        if (e.key !== 'Enter') return;
        e.preventDefault();
        // Enter: secili satir varsa ONA ekle (aramada ilk eslesen secili gelir)
        const s = liste.querySelector('li.secili');
        if (s && !e.shiftKey) return sec(s);
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') window.close(); });
    el('secIptal').addEventListener('click', () => window.close());
    document.title = c('klasorSec');
    suz.focus();
}

kur();
