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

// WSD Speed Dial - KLASOR SURUKLEME (1.5.0)
//
// Klasor kutusu iki is icin surukleniyor:
//   1) SIRALAMA: baska bir klasor kutusunun KENARINA (sol/sag ceyrek)
//      birakinca onun onune/ardina geciyor. Mavi cizgi yeri gosteriyor.
//   2) TASIMA: klasor kutusunun ORTASINA, yol seridindeki bir ust
//      klasore ya da seritteki bir GRUP SEKMESINE birakinca onun icine
//      giriyor. Turuncu parilti kart tasimayla ayni dil.
//      Ana Sayfa sekmesine birakilan klasor ust duzey GRUP oluyor.
//
// Kart surukleme (kartsurukle.js) ayri: o `.kart` ile basliyor, bu
// `.klasorKart` ile. Ikisi ayni anda calismiyor.

import { c } from './dil.js';
import { kokKlasoruAl } from './yerimi.js';

let surukKlasor = null;            // suruklenen .klasorKart
let hedef = null;                  // { tur: 'icine'|'once'|'sonra', el, id }
let islendi = false;

/** disbirak.js: kendi klasorumuzu tasirken dis birakma devreye girmesin. */
export function klasorSuruklemeVarMi() { return surukKlasor !== null; }

/** Ortadaki bu oran "icine", kenarlar "onune/ardina". */
const ORTA = 0.5;

export function klasorSuruklemeKur(bag) {
    const kap = document.getElementById('kartKabi');
    if (!kap) return;

    kap.addEventListener('dragstart', e => {
        const k = e.target.closest('.klasorKart');
        if (!k) return;
        surukKlasor = k;
        hedef = null;
        islendi = false;
        k.classList.add('surukKaynak');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', 'wsd-klasor:' + k.dataset.klasorId);
    });

    // Hedef HER harekette yeniden hesaplaniyor (kart suruklemedeki ders)
    document.addEventListener('dragover', e => {
        if (!surukKlasor) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        hedefiBul(e);
    }, true);

    const birak = async e => {
        if (!surukKlasor || islendi) return;
        islendi = true;
        if (e && e.type === 'drop') { e.preventDefault(); e.stopPropagation(); }
        const kaynak = surukKlasor;
        const h = hedef;
        temizle();
        if (h) await uygula(bag, kaynak.dataset.klasorId, h);
    };
    // drop ve dragend sirasi tarayiciya gore degisiyor: ikisi de dinleniyor,
    // `islendi` ikinciyi engelliyor
    document.addEventListener('drop', birak, true);
    kap.addEventListener('dragend', () => birak(null));
}

function hedefiBul(e) {
    const el = e.target && e.target.closest
        ? e.target.closest('.klasorKart, #klasorYolu [data-birak-klasor], .grupSekme[data-grup-id]')
        : null;

    if (!el || el === surukKlasor) return isaretle(null);

    // Seritteki grup sekmesi ya da yol seridi: icine
    if (!el.classList.contains('klasorKart')) {
        const id = el.dataset.grupId || el.dataset.birakKlasor;
        return isaretle({ tur: 'icine', el, id });
    }

    // Klasor kutusu: kenarda siralama, ortada icine
    const k = el.getBoundingClientRect();
    const oran = k.width ? (e.clientX - k.left) / k.width : 0.5;
    const kenar = (1 - ORTA) / 2;
    const tur = oran < kenar ? 'once' : oran > 1 - kenar ? 'sonra' : 'icine';
    isaretle({ tur, el, id: el.dataset.klasorId });
}

function isaretle(yeni) {
    if (hedef && yeni && hedef.el === yeni.el && hedef.tur === yeni.tur) return;
    isaretleriTemizle();
    hedef = yeni;
    if (!yeni) return;
    yeni.el.classList.add(yeni.tur === 'icine' ? 'surukSekmeHedef'
        : yeni.tur === 'once' ? 'klasorBirakOnce' : 'klasorBirakSonra');
}

function isaretleriTemizle() {
    for (const x of document.querySelectorAll('.surukSekmeHedef, .klasorBirakOnce, .klasorBirakSonra')) {
        x.classList.remove('surukSekmeHedef', 'klasorBirakOnce', 'klasorBirakSonra');
    }
}

function temizle() {
    surukKlasor?.classList.remove('surukKaynak');
    isaretleriTemizle();
    surukKlasor = null;
    hedef = null;
}

async function uygula(bag, id, h) {
    bag.tazelemeyiBastir(2000);
    try {
        const [d] = await chrome.bookmarks.get(id);

        if (h.tur === 'icine') {
            if (h.id === d.parentId) return;               // zaten orada
            // Kendi alt agacina tasinamaz: Chrome da reddeder, biz once soyleyelim
            if (await altindaMi(h.id, id)) return bag.bildir(c('klasorKendiIcine'));
            await chrome.bookmarks.move(id, { parentId: h.id });
            const kok = await kokKlasoruAl();
            await bag.seritTazele();                       // grup olmus/grup ici olmus olabilir
            await bag.grubuAc(bag.aktifGrup());
            bag.bildir(h.id === kok ? c('klasorGrupOldu') : c('klasorTasindi'));
            return;
        }

        // SIRALAMA: hedef klasorun yer imi indeksi. chrome.bookmarks.move
        // ayni ust klasorde "cikarilmadan onceki" indeksi bekliyor;
        // sonucu yine de DOGRULUYORUZ (kart suruklemedeki ders).
        const [hd] = await chrome.bookmarks.get(h.id);
        if (hd.parentId !== d.parentId) return;
        const hedefIndex = h.tur === 'once' ? hd.index : hd.index + 1;
        await chrome.bookmarks.move(id, { parentId: d.parentId, index: hedefIndex });

        if (!await siraTuttuMu(d.parentId, id, h)) {
            // Tutmadiysa tek bir duzeltme: hedefin guncel yerine gore
            const [hd2] = await chrome.bookmarks.get(h.id);
            await chrome.bookmarks.move(id, {
                parentId: d.parentId,
                index: h.tur === 'once' ? hd2.index : hd2.index + 1
            });
        }
        await bag.grubuAc(bag.aktifGrup());
    } catch (err) {
        console.log('[WSD] klasor surukleme uygulanamadi:', err);
        bag.bildir(c('tasinamadi'));
        await bag.grubuAc(bag.aktifGrup());
    }
}

/** `adayId`, `klasorId`in kendisi ya da alt klasoru mu? */
async function altindaMi(adayId, klasorId) {
    let id = adayId;
    for (let i = 0; i < 64 && id; i++) {
        if (id === klasorId) return true;
        try { id = (await chrome.bookmarks.get(id))[0].parentId; } catch (e) { return false; }
    }
    return false;
}

/** Klasorler arasindaki sirada kaynak hedefin istenen tarafinda mi? */
async function siraTuttuMu(ustId, id, h) {
    const klasorler = (await chrome.bookmarks.getChildren(ustId)).filter(x => !x.url).map(x => x.id);
    const i = klasorler.indexOf(id), j = klasorler.indexOf(h.id);
    return h.tur === 'once' ? i === j - 1 : i === j + 1;
}
