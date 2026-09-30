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
import { RENKLER } from './renk.js';

const el = id => document.getElementById(id);

let secilenIkon = 'folder';       // 'ad' | 'emoji:X' | 'favicon:URL'
let duzenlenenGrup = null;        // null ise yeni grup
let klasorKipi = null;            // { ustId } - alt klasor ekle/duzenle (1.5.0)
let secilenEtiket = null;         // klasor renk etiketi (kartlardaki alt serit gibi)
let secilenKapak = null;          // klasor kapak resmi (data URI, kucultulmus) - 1.5.1
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
    etiketleriKur();

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

    // KLASOR ARKA PLANI VE KAPAK RESMI (1.5.1)
    el('gpZeminSifirla')?.addEventListener('click', () => {
        el('gpZemin').dataset.bos = '1';
        el('gpZemin').value = '#2a3340';
    });
    el('gpZemin')?.addEventListener('input', () => { delete el('gpZemin').dataset.bos; kapakGoster(); });
    el('gpKapakSec')?.addEventListener('click', () => el('gpKapakDosya').click());
    el('gpKapakOnizleme')?.addEventListener('click', () => el('gpKapakDosya').click());
    el('gpKapakKaldir')?.addEventListener('click', () => { secilenKapak = null; kapakGoster(); });
    el('gpKapakDosya')?.addEventListener('change', async e => {
        const dosya = e.target.files && e.target.files[0];
        e.target.value = '';
        if (dosya) await kapakDosyasiniAl(dosya);
    });
    // Resmi onizleme kutusuna surukle-birak
    const onz = el('gpKapakOnizleme');
    onz?.addEventListener('dragover', e => { e.preventDefault(); e.stopPropagation(); onz.classList.add('ustunde'); });
    onz?.addEventListener('dragleave', () => onz.classList.remove('ustunde'));
    onz?.addEventListener('drop', async e => {
        e.preventDefault(); e.stopPropagation();
        onz.classList.remove('ustunde');
        const dosya = [...(e.dataTransfer?.files || [])].find(f => f.type.startsWith('image/'));
        if (dosya) await kapakDosyasiniAl(dosya);
    });
    // Pencere aciksa Ctrl+V ile resim yapistir
    document.addEventListener('paste', async e => {
        if (el('grupPencere').hidden || !klasorKipi) return;
        const oge = [...(e.clipboardData?.items || [])].find(i => i.type.startsWith('image/'));
        if (!oge) return;
        e.preventDefault();
        await kapakDosyasiniAl(oge.getAsFile());
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

/** Klasor renk etiketi - kart Duzenle penceresindeki renk sirasiyla ayni */
function etiketleriKur() {
    const kap = el('gpEtiketler');
    if (!kap || kap.children.length) return;
    for (const r of RENKLER) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'renkNokta' + (r.deger ? '' : ' bos');
        b.dataset.renk = r.deger || '';
        b.title = c('renk_' + r.ad) || r.ad;
        if (r.deger) b.style.backgroundColor = r.deger;
        else b.textContent = '\u2715';
        b.addEventListener('click', () => { secilenEtiket = r.deger; etiketiGoster(); });
        kap.appendChild(b);
    }
}
function etiketiGoster() {
    for (const b of el('gpEtiketler').children) {
        b.classList.toggle('secili', (b.dataset.renk || null) === secilenEtiket);
    }
}

/** Dosyayi okuyup kart olcusune kucultur (gorsel.js kucult). */
async function kapakDosyasiniAl(dosya) {
    try {
        const ham = await new Promise((coz, red) => {
            const o = new FileReader();
            o.onload = () => coz(o.result);
            o.onerror = red;
            o.readAsDataURL(dosya);
        });
        const { kucult } = await import('./gorsel.js');
        secilenKapak = (await kucult(ham)) || ham;
        kapakGoster();
    } catch (e) {
        uyarGoster(c('dosyaOkunamadi'));
    }
}

function kapakGoster() {
    const onz = el('gpKapakOnizleme');
    if (!onz) return;
    onz.style.backgroundImage = secilenKapak ? `url('${secilenKapak}')` : '';
    const zemin = el('gpZemin');
    onz.style.backgroundColor = zemin && !zemin.dataset.bos ? zemin.value : '';
    onz.classList.toggle('dolu', !!secilenKapak);
    el('gpKapakKaldir').hidden = !secilenKapak;
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
 * @param secenek.klasor  { ustId } verilirse ALT KLASOR kipinde calisir:
 *   baslik/metinler klasore gore, "Gosterim" (yalnizca seritte anlamli)
 *   gizli, ayni ad kontrolu kardes klasorlerde.
 * @returns {Promise<{ad, ikon}|null>}  iptal edilirse null
 */
export async function grupPenceresiniAc(grup = null, { klasor = null } = {}) {
    duzenlenenGrup = grup;
    klasorKipi = klasor;

    el('grupPencereBaslik').textContent = klasor
        ? (grup ? c('klasoruDuzenle') : c('yeniKlasor'))
        : (grup ? c('grubuDuzenle') : c('yeniGrup'));
    el('gpKaydet').textContent = grup ? c('kaydet') : (klasor ? c('olustur') : c('grupOlustur'));
    el('gpGosterimSatir').hidden = !!klasor;
    el('gpEtiketSatir').hidden = !klasor;
    el('gpZeminSatir').hidden = !klasor;
    el('gpKapakSatir').hidden = !klasor;
    el('gpAd').value = grup ? grup.baslik : '';
    // Kart sayisi - yalnizca duzenlemede anlamli
    const bilgi = el('gpKartSayisi');
    if (grup) {
        const sayilar = await kartSayilariAl([grup.id]);
        bilgi.innerHTML = (klasor ? c('buKlasordeNKart', sayilar[grup.id] || 0)
                                  : c('buGruptaNKart', sayilar[grup.id] || 0));
        bilgi.hidden = false;
    } else {
        bilgi.hidden = true;
    }

    // Gruba ozel gorunum
    const gorunumler = await gorunumleriAl();
    const g = (grup && gorunumler[grup.id]) || {};
    el('gpGosterim').value = g.gosterim || '';
    secilenEtiket = g.etiket || null;
    etiketiGoster();
    secilenKapak = g.kapak || null;
    if (g.zemin) { el('gpZemin').value = g.zemin; delete el('gpZemin').dataset.bos; }
    else { el('gpZemin').value = '#2a3340'; el('gpZemin').dataset.bos = '1'; }
    kapakGoster();
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
    // Klasorde KARDES klasorlerle, grupta gruplarla karsilastiriyoruz
    const { gruplariAl, klasorleriAl } = await import('./yerimi.js');
    const hepsi = klasorKipi ? await klasorleriAl(klasorKipi.ustId) : await gruplariAl();
    const karsilastir = m => m.trim().toLocaleLowerCase('tr').replace(/\s+/g, ' ');

    const cakisan = hepsi.find(g =>
        karsilastir(g.baslik) === karsilastir(ad) &&
        g.id !== (duzenlenenGrup && duzenlenenGrup.id)   // kendi adi sorun degil
    );

    if (cakisan) {
        uyarGoster(klasorKipi ? c('klasorAdiZatenVar', cakisan.baslik) : c('grupAdiZatenVar', cakisan.baslik));
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
        aciklama: el('gpAciklama').value.trim() || null,
        // Yalnizca klasor kipinde anlamli; grupta alan hic gonderilmiyor
        ...(klasorKipi ? {
            etiket: secilenEtiket,
            zemin: el('gpZemin').dataset.bos ? null : el('gpZemin').value,
            kapak: secilenKapak
        } : {})
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
