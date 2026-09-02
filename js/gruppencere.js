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

// WSD Speed Dial - grup ekle/duzenle penceresi

import { IKONLAR, ikonAl, faviconUrl } from './ikon.js';
import { c } from './dil.js';
import { kartSayilariAl } from './yerimi.js';
import { ikonlariAl, ikonYaz, gorunumleriAl, gorunumYaz } from './grupikon.js';

const el = id => document.getElementById(id);

let secilenIkon = 'folder';       // 'ad' | 'emoji:X' | 'favicon:URL'
let duzenlenenGrup = null;        // null ise yeni grup
let cozucu = null;                // Promise resolve

/** Pencere icinde kisa uyari - alanin altinda beliriyor. */
let uyariZaman = null;
function uyarGoster(metin) {
    const el2 = el('gpUyari');
    if (!el2) return;
    el2.textContent = metin;
    el2.hidden = false;
    clearTimeout(uyariZaman);
    uyariZaman = setTimeout(() => { el2.hidden = true; }, 3500);
}

export function grupPenceresiniKur() {
    ikonIzgarasiniKur();

    el('gpIptal')?.addEventListener('click', () => kapat(null));
    el('gpKaydet')?.addEventListener('click', kaydet);



    el('gpAd')?.addEventListener('keydown', e => {
        if (e.key === 'Enter') kaydet();
        if (e.key === 'Escape') kapat(null);
    });

    // Ozel emoji: YAZAR YAZMAZ secilsin. Once yalnizca dugmeye basinca
    // uygulaniyordu ve kullanici emojiyi yazip Kaydet'e basinca kayboluyordu.
    const emojiUygula = () => {
        const deger = el('gpEmoji').value.trim();
        if (!deger) return;
        secilenIkon = 'emoji:' + deger;
        secimiGoster();
    };
    el('gpRenkSifirla')?.addEventListener('click', () => {
        // Bos deger = genel ayari kullan
        el('gpIkonRengi').dataset.bos = '1';
        el('gpIkonRengi').value = '#9db4cc';
    });
    el('gpIkonRengi')?.addEventListener('input', () => {
        delete el('gpIkonRengi').dataset.bos;
    });

    el('gpEmoji')?.addEventListener('input', emojiUygula);
    el('gpEmojiSec')?.addEventListener('click', emojiUygula);

    // Site adresi: favicon'a cevrilir
    const faviconUygula = () => {
        const adres = el('gpFavicon').value.trim();
        if (!adres) return;
        const url = faviconUrl(adres.startsWith('http') ? adres : 'https://' + adres);
        if (!url) return;
        secilenIkon = 'favicon:' + url;
        secimiGoster();
    };
    el('gpFavicon')?.addEventListener('change', faviconUygula);
    el('gpFaviconSec')?.addEventListener('click', faviconUygula);
}

function ikonIzgarasiniKur() {
    const kap = el('gpIkonlar');
    if (!kap || kap.children.length) return;

    for (const ad of Object.keys(IKONLAR)) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'ikonKutu';
        b.dataset.ikon = ad;
        b.title = ad;
        b.innerHTML = ikonAl(ad);
        b.addEventListener('click', () => {
            secilenIkon = ad;
            secimiGoster();
        });
        kap.appendChild(b);
    }
}

function secimiGoster() {
    for (const b of el('gpIkonlar').children) {
        b.classList.toggle('secili', b.dataset.ikon === secilenIkon);
    }

    // Ozel alanlarin onizlemesi
    const emojiBtn = el('gpEmojiSec');
    const favBtn   = el('gpFaviconSec');
    const emojiMi  = secilenIkon.startsWith('emoji:');
    const favMi    = secilenIkon.startsWith('favicon:');

    emojiBtn.textContent = emojiMi ? secilenIkon.slice(6) : '';
    emojiBtn.classList.toggle('secili', emojiMi);

    favBtn.innerHTML = favMi
        ? `<img class="ikonFavicon" src="${secilenIkon.slice(8)}" alt="">`
        : '';
    favBtn.classList.toggle('secili', favMi);
}

/**
 * Pencereyi acar.
 * @returns {Promise<{ad, ikon}|null>}  iptal edilirse null
 */
export async function grupPenceresiniAc(grup = null) {
    duzenlenenGrup = grup;

    el('grupPencereBaslik').textContent = grup ? c('grubuDuzenle') : 'Yeni Grup';
    el('gpKaydet').textContent = grup ? 'Kaydet' : c('grupOlustur');
    el('gpAd').value = grup ? grup.baslik : '';
    // Kart sayisi - yalnizca duzenlemede anlamli
    const bilgi = el('gpKartSayisi');
    if (grup) {
        const sayilar = await kartSayilariAl([grup.id]);
        bilgi.innerHTML = `Bu grupta <b>${sayilar[grup.id] || 0}</b> kart var`;
        bilgi.hidden = false;
    } else {
        bilgi.hidden = true;
    }

    // Gruba ozel gorunum
    const gorunumler = await gorunumleriAl();
    const g = (grup && gorunumler[grup.id]) || {};
    el('gpGosterim').value = g.gosterim || '';
    el('gpAciklama').value = g.aciklama || '';
    if (g.renk) {
        el('gpIkonRengi').value = g.renk;
        delete el('gpIkonRengi').dataset.bos;
    } else {
        el('gpIkonRengi').value = '#9db4cc';
        el('gpIkonRengi').dataset.bos = '1';
    }

    const ikonlar = await ikonlariAl();
    secilenIkon = (grup && ikonlar[grup.id]) || 'folder';

    // Mevcut secim ozel bir deger ise ilgili alani doldur
    el('gpEmoji').value   = secilenIkon.startsWith('emoji:')   ? secilenIkon.slice(6) : '';
    el('gpFavicon').value = '';
    secimiGoster();

    el('gpUyari').hidden = true;
    el('grupPencere').hidden = false;
    document.getElementById('perde').classList.add('acik');
    setTimeout(() => el('gpAd').focus(), 30);

    return new Promise(coz => { cozucu = coz; });
}

async function kaydet() {
    const ad = el('gpAd').value.trim();
    if (!ad) return el('gpAd').focus();

    // AYNI AD KONTROLU - buyuk/kucuk harf ve bosluk farki onemsiz.
    // Iki "Haber" grubu varken kullanici hangisine kart ekledigini
    // anlayamiyor; tasima listesinde de ayirt edilemiyorlar.
    const { gruplariAl } = await import('./yerimi.js');
    const hepsi = await gruplariAl();
    const karsilastir = m => m.trim().toLocaleLowerCase('tr').replace(/\s+/g, ' ');

    const cakisan = hepsi.find(g =>
        karsilastir(g.baslik) === karsilastir(ad) &&
        g.id !== (duzenlenenGrup && duzenlenenGrup.id)   // kendi adi sorun degil
    );

    if (cakisan) {
        uyarGoster(`"${cakisan.baslik}" adında bir grup zaten var`);
        el('gpAd').focus();
        el('gpAd').select();
        return;
    }

    const renkEl = el('gpIkonRengi');
    kapat({
        ad,
        ikon: secilenIkon,
        gosterim: el('gpGosterim').value || '',
        renk: renkEl.dataset.bos ? null : renkEl.value,
        aciklama: el('gpAciklama').value.trim() || null
    });
}

function kapat(sonuc) {
    const coz = cozucu;
    cozucu = null;
    el('grupPencere').hidden = true;
    if (!document.getElementById('ayarPanel').classList.contains('acik')) {
        document.getElementById('perde').classList.remove('acik');
    }
    if (coz) coz(sonuc);
}

export { ikonYaz, gorunumYaz };
