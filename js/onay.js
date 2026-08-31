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
// WSD Speed Dial - onay ve giris pencereleri
//
// Native confirm()/prompt() yerine kendi pencerelerimiz: sayfa temasiyla
// uyumlu, tarayici uslubunda degil. Ikisi de Promise donduruyor, boylece
// cagiran taraf `await` ile beklerken akis dogal kaliyor.

const el = id => document.getElementById(id);

let acikCozucu = null;      // acik pencerenin resolve fonksiyonu
let acikHatirla = null;     // "bir daha sorma" anahtari

export function onayPenceresiniKur() {
    el('onayEvet')?.addEventListener('click', () => kapat(true));
    el('onayHayir')?.addEventListener('click', () => kapat(false));

    el('onayPencere')?.addEventListener('click', e => {
        if (e.target.id === 'onayPencere') kapat(false);
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
export async function onaySor({ baslik = 'Onay', metin = '', evet = c('tamam'),
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

function ac({ baslik, metin, evet, hayir, tehlikeli, giris, hatirla = null }) {
    // Onceki pencere acik kaldiysa iptal say - iki pencere ust uste binmesin
    if (acikCozucu) kapat(false);

    el('onayBaslik').textContent = baslik;
    el('onayMetin').textContent = metin;
    el('onayMetin').hidden = !metin;

    const girisVar = giris !== null;
    el('onayGiris').hidden = !girisVar;
    if (girisVar) el('onayGirisAlan').value = giris;

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
    setTimeout(() => (girisVar ? el('onayGirisAlan') : el('onayEvet')).focus(), 30);

    return new Promise(coz => { acikCozucu = coz; });
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
    if (!kabul) return coz(null);

    // Yalnizca ONAYLANDIGINDA kaydediyoruz: vazgecerken isaretlemek
    // "bir daha sorma ve hep iptal et" anlamina gelirdi
    if (hatirla && el('onayHatirlaKutusu')?.checked) onayiAtla(hatirla);

    const girisVar = !el('onayGiris').hidden;
    coz(girisVar ? el('onayGirisAlan').value.trim() : '');
}
