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
import { gorselAl } from './gorsel.js';
import { aktifGrup, grubuAc } from './cizim.js';
import { bildir } from './arayuz.js';
import { onaySor } from './onay.js';
import { c } from './dil.js';

const el = id => document.getElementById(id);

export function kopyaEkraniniKur() {
    el('kopyaKapat')?.addEventListener('click', kapat);
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && document.body.classList.contains('kopyaAcik')) kapat();
    });
}

function kapat() {
    document.body.classList.remove('kopyaAcik');
    grubuAc(aktifGrup());
}

export async function kopyaEkraniniAc() {
    // Ayar paneli aciksa kapat - kartlari gormek gerekiyor
    el('ayarPanel')?.classList.remove('acik');
    el('perde')?.classList.remove('acik');
    document.body.classList.remove('ayarAcik');
    el('denetimPencere') && (el('denetimPencere').hidden = true);

    document.body.classList.add('kopyaAcik');
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

async function ciz() {
    const kap = el('kartKabi');
    kap.textContent = '';

    const kumeler = await kumeleriBul();
    const toplam = kumeler.reduce((t, k) => t + k.liste.length, 0);
    el('kopyaSayi').textContent = kumeler.length
        ? `${kumeler.length} adres · ${toplam} kart`
        : '';

    if (!kumeler.length) {
        const bos = document.createElement('p');
        bos.id = 'aramaBos';
        bos.textContent = c('yinelenenKartYok');
        kap.appendChild(bos);
        return;
    }

    const kayitlar = await gorselAl(kumeler.map(k => k.url));

    for (const kume of kumeler) {
        // Kume basligi - hangi adres
        const bas = document.createElement('div');
        bas.className = 'kopyaKume';
        bas.innerHTML = `<b>${kacis(kume.liste[0].kart.baslik || kume.url)}</b>`;
        kap.appendChild(bas);

        for (const { kart, grup } of kume.liste) {
            kap.appendChild(kartOlustur(kart, grup, kayitlar[kume.url]));
        }
    }
}

function kartOlustur(k, grup, kayit) {
    const a = document.createElement('div');
    a.className = 'kart kopyaKart';

    const govde = document.createElement('span');
    govde.className = 'kartGovde';

    const baslik = document.createElement('span');
    baslik.className = 'kartBaslik';
    baslik.textContent = k.baslik || k.url;

    const gorsel = document.createElement('span');
    gorsel.className = 'kartGorsel';
    if (kayit && kayit.gorsel) gorsel.style.backgroundImage = `url('${kayit.gorsel}')`;

    govde.append(baslik, gorsel);
    a.appendChild(govde);

    // Hangi grupta
    const etiket = document.createElement('span');
    etiket.className = 'kartGrupEtiketi';
    etiket.textContent = grup.baslik;
    a.appendChild(etiket);

    // Tek dugme: bu kopyayi sil
    const araclar = document.createElement('span');
    araclar.className = 'copKartAraclari';

    const sil = document.createElement('button');
    sil.type = 'button';
    sil.className = 'copKartDugme yikici';
    sil.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/>
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>` + c('sil');
    sil.addEventListener('click', async () => {
        if (!await onaySor({
            baslik: c('kartiSil'),
            metin: `"${grup.baslik}" grubundaki kopya çöp kutusuna taşınacak.`,
            evet: c('sil'), tehlikeli: true, hatirla: 'kopyaSil'
        })) return;

        // Cope at - digerleri ayni adresi kullandigi icin gorseli
        // SILMIYORUZ, oksuz temizligi de dokunmayacak
        try {
            await kartSil(k.id);
            await ciz();
            bildir(c('kartSilindi'));
        } catch (e) {
            bildir(c('silinemedi'));
        }
    });

    araclar.appendChild(sil);
    a.appendChild(araclar);
    return a;
}

function kacis(m) {
    return String(m ?? '').replace(/[&<>"]/g, x =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[x]));
}
