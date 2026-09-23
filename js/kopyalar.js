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

// WSD Speed Dial - yinelenen kartlar ekrani
//
// Ayni adres birden fazla grupta olabiliyor. Bu kendiliginden sorun
// degil ama GORSEL, NOT, RENK ve SAYAC adrese bagli: bir kopyada
// degistirdigin sey digerlerinde de degisiyor.
//
// Denetim raporunda liste halinde gostermek uzun ve okunmaz oluyordu;
// burada kartlari GORSELIYLE yan yana koyup hangisini tutacagina
// bakarak karar verebiliyorsun.

import { gruplariAl, kartlariAl, kartSil, urlNormalle } from './yerimi.js';
import { kartAraclariOlustur } from './cizim.js';
import { aktifGrup, grubuAc } from './cizim.js';
import { bildir, ekranSinifiniVer } from './arayuz.js';
import { onaySor } from './onay.js';
import { c } from './dil.js';

const el = id => document.getElementById(id);

export function kopyaEkraniniKur() {
    el('kopyaKapat')?.addEventListener('click', kopyaEkraniniKapat);
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && document.body.classList.contains('kopyaAcik')) kopyaEkraniniKapat();
    });
}

export function kopyaEkraniniKapat() {
    document.body.classList.remove('kopyaAcik');
    grubuAc(aktifGrup());
}

export async function kopyaEkraniniAc() {
    // Ayar paneli aciksa kapat - kartlari gormek gerekiyor
    el('ayarPanel')?.classList.remove('acik');
    el('perde')?.classList.remove('acik');
    document.body.classList.remove('ayarAcik');
    el('denetimPencere') && (el('denetimPencere').hidden = true);

    ekranSinifiniVer('kopyaAcik');   // digerleri kapansin
    await ciz();
}

/** Ayni adresi paylasan kart kumelerini bulur. */
async function kumeleriBul() {
    const harita = new Map();          // url -> [{kart, grup}]

    for (const g of await gruplariAl()) {
        for (const k of await kartlariAl(g.id)) {
            const a = urlNormalle(k.url);
            if (!harita.has(a)) harita.set(a, []);
            harita.get(a).push({ kart: k, grup: g });
        }
    }

    return [...harita.entries()]
        .filter(([, liste]) => liste.length > 1)
        .map(([url, liste]) => ({ url, liste }));
}

/**
 * Her yinelenen adresten BIR kart birakip digerlerini cop kutusuna
 * tasir. Hangisi kalir: en cok bilgi tasiyani - once gorseli olan,
 * sonra notu/rengi olan, o da esitse ilk eklenen.
 */
export async function kopyalariTekilleStir(ilerleme) {
    const kumeler = await kumeleriBul();
    if (!kumeler.length) return { silinen: 0, kume: 0 };

    const { kartiYedekle } = await import('./copekrani.js');
    const { copeAt } = await import('./cop.js');
    const { gorselAl } = await import('./gorsel.js');
    const { notlariAl } = await import('./not.js');
    const { renkleriAl } = await import('./renk.js');

    const notlar = await notlariAl();
    const renkler = await renkleriAl();

    let silinen = 0, yapilan = 0;

    for (const kume of kumeler) {
        const anahtar = urlNormalle(kume.url);
        const kayit = (await gorselAl(anahtar))[anahtar];

        // Puan: gorsel > not/renk > sira. Ayni adres oldugu icin gorsel
        // ortak; bu yuzden asil ayrim not/renk ve ilk eklenme.
        const puanla = ({ kart }) => {
            let p = 0;
            if (kayit && kayit.gorsel) p += 1;
            if (notlar[anahtar]) p += 2;
            if (renkler[anahtar]) p += 2;
            return p;
        };

        const sirali = kume.liste.slice().sort((a, b) => puanla(b) - puanla(a));
        const kalan = sirali[0];

        for (const { kart } of sirali.slice(1)) {
            try {
                const yedek = await kartiYedekle(kart.id, kart.url);
                await copeAt(yedek);
                await chrome.bookmarks.remove(kart.id);
                silinen++;
            } catch (e) {
                console.log('[WSD] kopya silinemedi:', kart.url, e);
            }
        }
        yapilan++;
        if (ilerleme) ilerleme({ yapilan, toplam: kumeler.length, silinen });
        void kalan;
    }

    return { silinen, kume: kumeler.length };
}

async function ciz() {
    const kap = el('kartKabi');
    kap.textContent = '';

    const kumeler = await kumeleriBul();
    const toplam = kumeler.reduce((t, k) => t + k.liste.length, 0);
    el('kopyaSayi').textContent = kumeler.length
        ? c('nAdresNKart', kumeler.length, toplam)
        : '';

    if (!kumeler.length) {
        const bos = document.createElement('p');
        bos.id = 'aramaBos';
        bos.textContent = c('yinelenenKartYok');
        kap.appendChild(bos);
        return;
    }


    for (const kume of kumeler) {
        // Kume basligi - hangi adres
        const bas = document.createElement('div');
        bas.className = 'kopyaKume';
        bas.innerHTML = `<b>${kacis(kume.liste[0].kart.baslik || kume.url)}</b>`;
        kap.appendChild(bas);

        for (const { kart, grup } of kume.liste) {
            kap.appendChild(kartOlustur(kart, grup));
        }
    }

    // TEMBEL YUKLEME: eskiden yinelenen TUM kartlarin gorseli tek
    // seferde okunuyordu.
    try {
        const { gorselleriGozle } = await import('./cizim.js');
        gorselleriGozle(kap.querySelectorAll('.kart[data-anahtar]'));
    } catch (e) { /* onemli degil */ }

    // Renk etiketi ve not isareti - normal izgaradaki gibi
    try {
        const { renkleriUygula, notlariUygula } = await import('./cizim.js');
        const tumKartlar = kumeler.flatMap(x => x.liste.map(y => y.kart));
        renkleriUygula(tumKartlar);
        notlariUygula(tumKartlar);
    } catch (e) { /* onemli degil */ }
}

/**
 * Kart - NORMAL izgaradakiyle ayni yapida.
 *
 * Onceden yalnizca "Sil" dugmesi vardi; kullanici duzenlemek ya da
 * tasimak isteyince buradan cikip grubu bulmak zorunda kaliyordu.
 * Artik SANAL GRUP gibi davraniyor: ayni arac seridi, ayni sag tik
 * menusu, tiklayinca aciliyor.
 */
function kartOlustur(k, grup) {
    const a = document.createElement('a');
    a.className = 'kart kopyaKart';
    a.href = k.url;
    a.dataset.kartId = k.id;
    a.dataset.anahtar = urlNormalle(k.url);

    const govde = document.createElement('span');
    govde.className = 'kartGovde';

    const baslik = document.createElement('span');
    baslik.className = 'kartBaslik';
    baslik.textContent = k.baslik || k.url;

    const gorsel = document.createElement('span');
    gorsel.className = 'kartGorsel';
    // Gorsel tembel yukleniyor - ciz() sonunda gozetlemeye aliniyor

    govde.append(baslik, gorsel);
    a.appendChild(govde);

    // Renk seridi - normal kartlardaki gibi
    const serit = document.createElement('span');
    serit.className = 'kartRenk';
    serit.hidden = true;
    a.appendChild(serit);

    // Hangi grupta - bu ekranin ayirt edici bilgisi
    const etiket = document.createElement('span');
    etiket.className = 'kartGrupEtiketi';
    etiket.textContent = grup.baslik;
    a.appendChild(etiket);

    a.appendChild(kartAraclariOlustur());
    return a;
}

function kacis(m) {
    return String(m ?? '').replace(/[&<>"]/g, x =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[x]));
}
