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

import { c } from './dil.js';
import { RENKLER } from './renk.js';
// WSD Speed Dial - onay ve giris pencereleri
//
// Native confirm()/prompt() yerine kendi pencerelerimiz: sayfa temasiyla
// uyumlu, tarayici uslubunda degil. Ikisi de Promise donduruyor, boylece
// cagiran taraf `await` ile beklerken akis dogal kaliyor.

const el = id => document.getElementById(id);

let acikCozucu = null;      // acik pencerenin resolve fonksiyonu
let acikHatirla = null;     // "bir daha sorma" anahtari

// BUYUK YAPISTIRMA (1.5.3): 6 MB'lik FVD metni metin alanina dogrudan
// yazilinca tarayici tek dev satiri kaydirip cizmeye calisirken sayfa
// saniyelerce kilitleniyordu. Esigin ustundeki yapistirmada metnin
// TAMAMI burada tutuluyor, alanda yalnizca basi onizleme olarak gorunuyor.
const ONIZLEME_ESIGI = 20000;
let yapistirilan = null;

export function onayPenceresiniKur() {
    el('onayEvet')?.addEventListener('click', () => kapat(true));
    el('onayHayir')?.addEventListener('click', () => kapat(false));

    el('onayPencere')?.addEventListener('click', e => {
        if (e.target.id === 'onayPencere') kapat(false);
    });

    // Cok satirli alan: yapistirilan metnin boyutu ve turu canli gorunsun
    // (1.5.3) - kullanici ne yapistirdigini ve dogru sey olup olmadigini
    // gondermeden once goruyor.
    el('onayMetinAlan')?.addEventListener('input', metinBilgisiniTazele);
    el('onayMetinAlan')?.addEventListener('paste', e => {
        const m = e.clipboardData?.getData('text') || '';
        if (m.length <= ONIZLEME_ESIGI) return;          // kucuk metin: normal yapistirma
        e.preventDefault();
        yapistirilan = m;
        const alan = el('onayMetinAlan');
        alan.value = m.slice(0, 3000) + '\n\n… ' + c('onizlemeKisaltildi');
        alan.readOnly = true;                            // onizleme duzenlenmesin
        metinBilgisiniTazele();
    });

    el('onayGirisAlan')?.addEventListener('keydown', e => {
        if (e.key === 'Enter')  kapat(true);
        if (e.key === 'Escape') kapat(false);
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && !el('onayPencere').hidden) kapat(false);
    });
}

/**
 * Onay sorar.
 * @returns {Promise<boolean>}
 */
const ATLANAN = 'atlananOnaylar';

/**
 * Onay sorar.
 *
 * @param hatirla  verilirse pencerede "Bir daha sorma" kutusu cikar ve
 *                 isaretlenirse bu anahtar icin bir daha sorulmaz.
 *                 GERI ALINABILIR islemlerde kullaniliyor (silinen kart
 *                 cope gidiyor); kalici silmelerde ASLA.
 * @returns {Promise<boolean>}
 */
export async function onaySor({ baslik = c('onay'), metin = '', evet = c('tamam'),
                                hayir = c('vazgec'), tehlikeli = false,
                                hatirla = null } = {}) {
    if (hatirla && await onayAtlaniyorMu(hatirla)) return true;

    const sonuc = await ac({ baslik, metin, evet, hayir, tehlikeli,
                             giris: null, hatirla });
    return sonuc !== null;
}

/** Bu onay daha once "bir daha sorma" ile kapatildi mi? */
async function onayAtlaniyorMu(anahtar) {
    try {
        const d = await chrome.storage.local.get(ATLANAN);
        return Array.isArray(d[ATLANAN]) && d[ATLANAN].includes(anahtar);
    } catch (e) {
        return false;
    }
}

async function onayiAtla(anahtar) {
    try {
        const d = await chrome.storage.local.get(ATLANAN);
        const liste = Array.isArray(d[ATLANAN]) ? d[ATLANAN] : [];
        if (!liste.includes(anahtar)) liste.push(anahtar);
        await chrome.storage.local.set({ [ATLANAN]: liste });
    } catch (e) { /* onemli degil */ }
}

/** Tum "bir daha sorma" tercihlerini siler. */
export async function onaylariGeriGetir() {
    try {
        const d = await chrome.storage.local.get(ATLANAN);
        const adet = Array.isArray(d[ATLANAN]) ? d[ATLANAN].length : 0;
        await chrome.storage.local.remove(ATLANAN);
        return adet;
    } catch (e) {
        return 0;
    }
}

/**
 * Metin ister.
 * @returns {Promise<string|null>}  iptal edilirse null
 */
export function metinSor({ baslik = c('giris'), metin = '', deger = '',
                           evet = 'Tamam', hayir = c('vazgec') } = {}) {
    return ac({ baslik, metin, evet, hayir, tehlikeli: false, giris: deger });
}

function ac({ baslik, metin, evet, hayir, tehlikeli, giris, hatirla = null, cokSatir = false, liste = null, ek = null }) {
    // Onceki pencere acik kaldiysa iptal say - iki pencere ust uste binmesin
    if (acikCozucu) kapat(false);

    el('onayBaslik').textContent = baslik;
    el('onayMetin').textContent = metin;
    el('onayMetin').hidden = !metin;

    const girisVar = giris !== null;
    el('onayGiris').hidden = !girisVar;
    if (girisVar) el('onayGirisAlan').value = giris;

    const cok = el('onayCokSatir');
    if (cok) {
        cok.hidden = !cokSatir;
        yapistirilan = null;
        el('onayMetinAlan').readOnly = false;
        el('onayMetinAlan').value = '';
        metinBilgisiniTazele();
    }

    listeyiCiz(liste);

    // Ek alanlar: etiket + not (calisma alani duzenleme, 1.5.4)
    if (el('onayEk')) {
        el('onayEk').hidden = !ek;
        el('onayEtiket').value = ek ? (ek.etiketler || []).join(', ') : '';
        el('onayNot').value = ek ? (ek.not || '') : '';
        ekRenk = ek ? (ek.renk || null) : null;
        renkleriCiz();
    }

    // "Bir daha sorma" yalnizca geri alinabilir islemlerde
    acikHatirla = hatirla;
    const kutu = el('onayHatirlaKutu');
    if (kutu) {
        kutu.hidden = !hatirla;
        el('onayHatirlaKutusu').checked = false;
    }

    el('onayEvet').textContent = evet;
    el('onayHayir').textContent = hayir;
    el('onayEvet').className = 'dugme ' + (tehlikeli ? 'tehlikeli' : 'birincil');

    el('onayPencere').hidden = false;
    document.getElementById('perde').classList.add('acik');
    setTimeout(() => (cokSatir ? el('onayMetinAlan') : girisVar ? el('onayGirisAlan') : el('onayEvet')).focus(), 30);

    return new Promise(coz => { acikCozucu = coz; });
}

function metinBilgisiniTazele() {
    const alan = el('onayMetinAlan');
    const bilgi = el('onayMetinBilgi');
    if (!alan || !bilgi) return;
    const m = yapistirilan ?? alan.value;
    if (!m.trim()) { bilgi.textContent = ''; bilgi.className = 'onayMetinBilgi'; return; }
    const bas = m.replace(/^\uFEFF/, '').trimStart();
    const tur = bas.startsWith('<') ? 'HTML'
              : (bas.startsWith('{') || bas.startsWith('[')) ? 'JSON' : null;
    // Bayt hesabi icin metni kopyalamiyoruz: UTF-8 uzunlugu tahmini yeter
    const kb = (m.length > 200000 ? m.length : new Blob([m]).size) / 1024;
    const boyut = kb >= 1024 ? (kb / 1024).toFixed(1) + ' MB' : Math.max(1, Math.round(kb)) + ' KB';
    bilgi.textContent = (tur ? tur + ' · ' : '⚠ ' + c('desteklenmeyenDosya') + ' · ') + boyut;
    bilgi.className = 'onayMetinBilgi' + (tur ? ' iyi' : ' kotu');
}

/**
 * COK SATIRLI metin ister (yapistirma icin, 1.5.3). Tek satirlik
 * alanda yapistirilan uzun metin gorunmuyordu.
 * @returns {Promise<string|null>}  iptal edilirse null
 */
export function metinAlaniSor({ baslik = c('giris'), metin = '', evet = c('tamam'),
                                hayir = c('vazgec') } = {}) {
    return ac({ baslik, metin, evet, hayir, tehlikeli: false, giris: null, cokSatir: true });
}

function kapat(kabul) {
    const coz = acikCozucu;
    const hatirla = acikHatirla;
    acikHatirla = null;
    acikCozucu = null;                  // once temizle - tekrar girmesin
    el('onayPencere').hidden = true;
    if (!document.getElementById('ayarPanel').classList.contains('acik')) {
        document.getElementById('perde').classList.remove('acik');
    }

    if (!coz) return;
    if (!kabul) { yapistirilan = null; return coz(null); }

    // Yalnizca ONAYLANDIGINDA kaydediyoruz: vazgecerken isaretlemek
    // "bir daha sorma ve hep iptal et" anlamina gelirdi
    if (hatirla && el('onayHatirlaKutusu')?.checked) onayiAtla(hatirla);

    if (el('onayListe') && !el('onayListe').hidden) {
        const secili = [...el('onayListeIc').querySelectorAll('input[data-i]')]
            .filter(k => k.checked).map(k => Number(k.dataset.i));
        el('onayListe').hidden = true;
        el('onayListeIc').textContent = '';
        const ekVar = el('onayEk') && !el('onayEk').hidden;
        const ek = ekVar ? {
            etiketler: [...new Set(el('onayEtiket').value.split(',').map(x => x.trim()).filter(Boolean))],
            not: el('onayNot').value.trim(),
            renk: ekRenk
        } : null;
        if (ekVar) el('onayEk').hidden = true;
        return coz({ ad: el('onayGirisAlan').value.trim(), secili, ek });
    }

    if (el('onayCokSatir') && !el('onayCokSatir').hidden) {
        const m = yapistirilan ?? el('onayMetinAlan').value;
        yapistirilan = null;                     // buyuk metin bellekte kalmasin
        el('onayMetinAlan').value = '';
        el('onayMetinAlan').readOnly = false;
        return coz(m);
    }
    const girisVar = !el('onayGiris').hidden;
    coz(girisVar ? el('onayGirisAlan').value.trim() : '');
}

/* ---------- Secimli liste (1.5.4, deneysel) ---------- */

/**
 * Ad + onay kutulu liste ister. Acik sekmeleri gruba kaydetmede
 * kullaniliyor: Vivaldi/Opera calisma alanlarini eklenti ayirt
 * edemiyor, kullanici istemedigi sekmelerin isaretini kaldiriyor.
 *
 * @param satirlar [{ baslik, alt, ikon }]
 * @returns {Promise<{ad: string, secili: number[]}|null>}
 */
export function listeSor({ baslik = c('giris'), metin = '', deger = '', satirlar = [],
                           evet = c('tamam'), hayir = c('vazgec'), ek = null } = {}) {
    return ac({ baslik, metin, evet, hayir, tehlikeli: false, giris: deger, liste: satirlar, ek });
}

function listeyiCiz(liste) {
    const kap = el('onayListe');
    if (!kap) return;
    kap.hidden = !liste;
    const ic = el('onayListeIc');
    ic.textContent = '';
    el('onayEvet').disabled = false;
    if (!liste) return;

    for (const [i, s] of liste.entries()) {
        // Bolum basligi (duzenlemede "Kayitli" / "Acik sekmeler")
        if (s.bolum) {
            const b = document.createElement(s.secici ? 'label' : 'div');
            b.className = 'onayListeBolum' + (s.secici ? ' secici' : '');
            if (s.secici) {
                // Blok basligi: kutusu o bloktaki tum sekmeleri secer
                const k = document.createElement('input');
                k.type = 'checkbox';
                k.dataset.blokSecici = s.blok;
                k.addEventListener('change', e => {
                    e.stopPropagation();
                    for (const x of ic.querySelectorAll(`input[data-blok="${s.blok}"]`)) x.checked = k.checked;
                    ic.dispatchEvent(new Event('change'));
                });
                b.appendChild(k);
            }
            const sp = document.createElement('span');
            sp.textContent = s.bolum;
            b.appendChild(sp);
            ic.appendChild(b);
            continue;
        }
        const satir = document.createElement('label');
        satir.className = 'onayListeSatir';
        const kutu = document.createElement('input');
        kutu.type = 'checkbox';
        kutu.checked = s.secili !== false;
        if (s.blok != null) kutu.dataset.blok = s.blok;
        kutu.dataset.i = i;
        satir.appendChild(kutu);
        if (s.ikon) {
            const img = document.createElement('img');
            img.src = s.ikon;
            img.alt = '';
            img.onerror = () => img.replaceWith(document.createElement('i'));
            satir.appendChild(img);
        } else {
            satir.appendChild(document.createElement('i'));
        }
        const ad = document.createElement('span');
        ad.textContent = s.baslik;
        ad.title = s.baslik;
        satir.appendChild(ad);
        const alt = document.createElement('small');
        alt.textContent = s.alt || '';
        satir.appendChild(alt);
        ic.appendChild(satir);
    }

    const hepsi = el('onayListeHepsi');
    const sayiyiYaz = () => {
        const kutular = [...ic.querySelectorAll('input[data-i]')];
        const n = kutular.filter(k => k.checked).length;
        // Blok basliklari: bloktakilerin durumunu yansitsin
        for (const bs of ic.querySelectorAll('input[data-blok-secici]')) {
            const grup = kutular.filter(k => k.dataset.blok === bs.dataset.blokSecici);
            const sec = grup.filter(k => k.checked).length;
            bs.checked = sec === grup.length && sec > 0;
            bs.indeterminate = sec > 0 && sec < grup.length;
        }
        el('onayListeSayi').textContent = `${n} / ${kutular.length}`;
        hepsi.checked = n === kutular.length;
        hepsi.indeterminate = n > 0 && n < kutular.length;
        el('onayEvet').disabled = n === 0;
    };
    ic.onchange = sayiyiYaz;
    hepsi.onchange = () => {
        for (const k of ic.querySelectorAll('input[data-i]')) k.checked = hepsi.checked;
        sayiyiYaz();
    };
    sayiyiYaz();
}

/* Ek alanlardaki renk secimi */
let ekRenk = null;
function renkleriCiz() {
    const kap = el('onayRenkler');
    if (!kap) return;
    kap.textContent = '';
    for (const r of RENKLER) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'renkNokta' + (r.deger ? '' : ' bos') + ((r.deger || null) === ekRenk ? ' secili' : '');
        b.title = c('renk_' + r.ad) || r.ad;
        if (r.deger) b.style.backgroundColor = r.deger;
        else b.textContent = '\u2715';
        b.addEventListener('click', () => { ekRenk = r.deger || null; renkleriCiz(); });
        kap.appendChild(b);
    }
}
