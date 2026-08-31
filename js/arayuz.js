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

// WSD Speed Dial - arayuz cekirdegi
//
// Bildirimler ve pencere altyapisi. Bu dosya BASKA MODULLERI
// IMPORT ETMIYOR: `bildir()` elliye yakin yerden cagriliyor, buraya
// bagimlilik eklemek her seyi birbirine baglardi.

const el = id => document.getElementById(id);

// Perde tiklamasiyla kapanabilen pencereler
const KAPANABILIR = ['kartPencere', 'notPencere', 'tasiPencere',
                     'grupPencere', 'yonetPencere', 'siralaPencere'];

let bildirimZaman = null;

/**
 * @param metin  gosterilecek yazi
 * @param eylem  {etiket, calistir} - bildirimde dugme gosterir (Geri Al gibi)
 */
export function bildir(metin, eylem = null) {
    const b = el('bildirim');
    if (!b) return;

    b.textContent = '';
    b.append(document.createTextNode(metin));

    if (eylem) {
        const d = document.createElement('button');
        d.className = 'bildirimDugme';
        d.type = 'button';
        d.textContent = eylem.etiket;
        d.addEventListener('click', async () => {
            b.classList.remove('gorunur');
            clearTimeout(bildirimZaman);
            await eylem.calistir();
        });
        b.appendChild(d);
    }

    b.classList.add('gorunur');
    clearTimeout(bildirimZaman);
    // Geri alma suresi daha uzun: kullanicinin fark edip karar vermesi gerek.
    // Eylem kendi suresini de verebiliyor (siralama gibi buyuk degisiklikler).
    const sure = eylem ? (eylem.sure || 8000) : 2600;
    bildirimZaman = setTimeout(() => b.classList.remove('gorunur'), sure);
}

/** Pencereyi acar: perde + kart isareti birlikte yonetiliyor. */
export function pencereAc(id, url = null) {
    el('perde').classList.add('acik');
    if (url) kartiIsaretle(url); else kartIsaretiniTemizle();
    el(id).hidden = false;
    sayfaKaydirmasiniTazele();
}

/** Pencereyi kapatir. Ayar paneli aciksa perde kalir. */
export function pencereKapat(id) {
    el(id).hidden = true;
    kartIsaretiniTemizle();
    if (!el('ayarPanel').classList.contains('acik')) {
        el('perde').classList.remove('acik');
    }
    sayfaKaydirmasiniTazele();
}

/**
 * Acik pencere varsa sayfa kaydirmasini kilitler.
 *
 * Pencerelerin acilis/kapanis yollari cok (perde, Escape, kendi
 * dugmeleri, Promise cozumu) - her birine tek tek kilit koymak yerine
 * DURUMA bakiyoruz: DOM'da gorunur pencere var mi?
 */
export function sayfaKaydirmasiniTazele() {
    const acik = !!document.querySelector('.pencere:not([hidden])');
    document.body.classList.toggle('pencereAcik', acik);
    // Perde de acik pencereyle birlikte gorunsun: bazi pencereler
    // `hidden`i dogrudan degistiriyor ve perdeyi acmayi atliyordu
    if (acik) document.getElementById('perde')?.classList.add('acik');
    else if (!document.getElementById('ayarPanel')?.classList.contains('acik')) {
        document.getElementById('perde')?.classList.remove('acik');
    }
}

/**
 * Pencerelerin `hidden` degisimini IZLIYORUZ.
 *
 * Acilis/kapanis yollari cok: kendi dugmeleri, perde, Escape, Promise
 * cozumu, dogrudan `hidden = false`. Her birine tek tek kilit koymak
 * kirilgan - biri unutulunca sayfa kaydirmasi acik kaliyor ya da perde
 * gelmiyordu. Tek gozlemci hepsini yakaliyor.
 */
export function pencereIzleyiciyiKur() {
    const gozlemci = new MutationObserver(sayfaKaydirmasiniTazele);
    for (const p of document.querySelectorAll('.pencere')) {
        gozlemci.observe(p, { attributes: true, attributeFilter: ['hidden'] });
    }
    sayfaKaydirmasiniTazele();
}

/** Pencere acikken ilgili karti karartip one cikarir. */
export function kartiIsaretle(url) {
    kartIsaretiniTemizle();
    for (const a of document.querySelectorAll('.kart[data-anahtar]')) {
        if (a.dataset.anahtar === url) a.classList.add('pencereHedefi');
    }
}

export function kartIsaretiniTemizle() {
    for (const a of document.querySelectorAll('.kart.pencereHedefi')) {
        a.classList.remove('pencereHedefi');
    }
}

/** Basit HTML kacisi - kart basligi kullanicidan geliyor. */
export function kacisliMetin(m) {
    return String(m).replace(/[&<>"]/g, c =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

/** Acik bir pencere varsa kapatir. @returns kapatildi mi */
export function acikPencereyiKapat() {
    for (const id of KAPANABILIR) {
        const p = el(id);
        if (p && !p.hidden) {
            pencereKapat(id);
            return true;
        }
    }
    // Onay penceresi kendi kapanisini yonetiyor (Promise cozuyor)
    const onay = el('onayPencere');
    if (onay && !onay.hidden) {
        el('onayHayir')?.click();
        return true;
    }
    return false;
}


/* ============ Tazeleme bastirma ============ */
//
// Kendi islemlerimiz zaten ekrani ciziyor; yer imi olaylarindan gelen
// otomatik tazeleme ustune binmesin diye kisa sureligine susturuluyor.
//
// Bu iki islev BURADA duruyor cunku hem `wsd.js` hem `etkilesim.js`
// kullaniyor - birinde tutmak ikisi arasinda dongu yaratiyordu.

let bastirmaBitis = 0;

export function tazelemeyiBastir(ms = 1200) {
    bastirmaBitis = Date.now() + ms;
}

export function tazelemeBastirildiMi() {
    return Date.now() < bastirmaBitis;
}


/** Arka plandaki sag tik menusunu yeniden kurdurur. */
export function menuTazele() {
    chrome.runtime.sendMessage({ hedef: 'arkaplan', tur: 'menuTazele' }).catch(() => {});
}
