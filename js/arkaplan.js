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

// WSD Speed Dial - servis iscisi

import { kokKlasoruAl, gruplariAl, gorunurGruplariAl, urlNormalle } from './yerimi.js';
import { c } from './dil.js';
import { yakalamayaEkle, kuyrugaDevamEt, kuyrugaTemizle } from './yakalama.js';
import { simgeyiUygula } from './simge.js';
import { guvenliYaz } from './depo.js';

/* ============================================================
   ZIYARET EDILEN SAYFAYA ENJEKTE EDILEN PARCALAR
   Bu iki fonksiyon `scripting.executeScript` ile HEDEF SAYFADA
   calisiyor: disaridaki hicbir degiskene erisemezler, her sey
   govdenin icinde olmali. Shadow DOM kullaniyoruz ki sayfanin
   kendi CSS'i gorunumu bozmasin.
   ============================================================ */

function wsdBildirimGoster(metin, basarili) {
    const kap = document.createElement('div');
    kap.style.cssText = 'position:fixed;inset:auto 0 0 0;z-index:2147483647;pointer-events:none;';
    const golge = kap.attachShadow({ mode: 'open' });
    golge.innerHTML =
        '<style>' +
        ':host{all:initial}' +
        '.kutu{position:fixed;left:50%;bottom:28px;transform:translateX(-50%) translateY(10px);' +
        'display:flex;align-items:center;gap:10px;background:#1c1f26;color:#e8eaed;' +
        'border:1px solid rgba(255,255,255,.12);box-shadow:0 8px 26px rgba(0,0,0,.45);' +
        'padding:11px 18px;border-radius:10px;white-space:nowrap;opacity:0;' +
        "font:500 13px/1.4 system-ui,-apple-system,'Segoe UI',sans-serif;" +
        'transition:opacity .18s ease,transform .18s ease}' +
        '.kutu.gorunur{opacity:1;transform:translateX(-50%)}' +
        '.im{font-size:15px;line-height:1}' +
        '</style>' +
        '<div class="kutu"><span class="im">' + (basarili ? '\u2713' : '\u2715') +
        '</span>' + metin + '</div>';

    document.documentElement.appendChild(kap);
    const kutu = golge.querySelector('.kutu');
    requestAnimationFrame(() => kutu.classList.add('gorunur'));

    setTimeout(() => {
        kutu.classList.remove('gorunur');
        setTimeout(() => kap.remove(), 250);
    }, 2200);
}

function wsdOnayPenceresi(grupAdi) {
    return new Promise(resolve => {
        const temizAd = String(grupAdi).replace(/[<>&"]/g, '');
        const kap = document.createElement('div');
        kap.style.cssText = 'position:fixed;inset:0;z-index:2147483647;';
        const golge = kap.attachShadow({ mode: 'open' });
        golge.innerHTML =
            '<style>' +
            ':host{all:initial}' +
            '.perde{position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;' +
            "align-items:center;justify-content:center;font-family:system-ui,-apple-system,'Segoe UI',sans-serif}" +
            '.kutu{background:#1c1f26;color:#e8eaed;width:min(400px,90vw);' +
            'border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:22px 24px;' +
            'box-shadow:0 18px 50px rgba(0,0,0,.55)}' +
            'h3{margin:0 0 10px;font-size:16px;font-weight:600}' +
            'p{margin:0 0 20px;font-size:13.5px;line-height:1.6;opacity:.8}' +
            'b{color:#5d93c2}' +
            '.dugmeler{display:flex;gap:10px}' +
            'button{flex:1;border:0;border-radius:9px;padding:9px 16px;cursor:pointer;' +
            'font:500 14px system-ui,sans-serif}' +
            '.iptal{background:rgba(255,255,255,.10);color:#e8eaed}' +
            '.tamam{background:#4d7ea8;color:#fff}' +
            'button:hover{filter:brightness(1.14)}' +
            '</style>' +
            '<div class="perde"><div class="kutu">' +
            '<h3>Bu sayfa zaten ekli</h3>' +
            '<p><b>' + temizAd + '</b> grubunda bu adres mevcut. Yine de eklensin mi?</p>' +
            '<div class="dugmeler">' +
            '<button class="iptal">Vazgeç</button>' +
            '<button class="tamam">Yine de ekle</button>' +
            '</div></div></div>';

        const bitir = d => {
            kap.remove();
            document.removeEventListener('keydown', tus, true);
            resolve(d);
        };
        const tus = e => { if (e.key === 'Escape') { e.stopPropagation(); bitir(false); } };

        golge.querySelector('.iptal').onclick = () => bitir(false);
        golge.querySelector('.tamam').onclick = () => bitir(true);
        golge.querySelector('.perde').onclick = e => {
            if (e.target === e.currentTarget) bitir(false);
        };
        document.addEventListener('keydown', tus, true);

        document.documentElement.appendChild(kap);
        golge.querySelector('.tamam').focus();
    });
}


const SAYFA = 'index.html';

/** Speed Dial sayfasini acar; zaten acik sekme varsa ona gecer. */
async function sayfayiAc() {
    const url = chrome.runtime.getURL(SAYFA);
    const acik = await chrome.tabs.query({ url });
    if (acik.length) {
        await chrome.tabs.update(acik[0].id, { active: true });
        await chrome.windows.update(acik[0].windowId, { focused: true });
    } else {
        await chrome.tabs.create({ url });
    }
}

// Arac cubugundaki simge
chrome.action.onClicked.addListener(() => sayfayiAc());

/**
 * Sag tik menusu.
 * Her kurulumda SIFIRDAN kuruluyor: gruplar degismis olabiliyor ve
 * contextMenus.create ayni id ile ikinci kez cagrilirsa hata veriyor.
 */
// Sag tik menusunun cikacagi baglamlar.
//
// `page` boslukta, `image`/`video`/`audio` ortam ogesinin UZERINDE,
// `link` bagalantida, `selection` secili metinde cikiyor. Once yalnizca
// page + link vardi; kullanici bir resmin uzerine sag tiklayinca menu
// gorunmuyordu ve "calismiyor" gibi duruyordu.
const BAGLAMLAR = ['page', 'link', 'image', 'video', 'audio', 'selection'];

// Menu kurulumu SIRAYA ALINIYOR.
// removeAll() + create() cifti atomik degil: iki kurulum ust uste
// gelince biri digerinin ogelerini siliyor ya da eski liste tekrar
// yaziliyordu (kart ekle + grup sil pes pese oldugunda goruldu).
let menuKurulumu = Promise.resolve();
let menuBekleyen = null;

function menuyuTazele() {
    // Kisa araliktaki cagrilari tek kuruluma indir
    clearTimeout(menuBekleyen);
    menuBekleyen = setTimeout(() => {
        menuKurulumu = menuKurulumu.then(menuyuKur).catch(() => {});
    }, 120);
}

async function menuyuKur() {
    try {
        await chrome.contextMenus.removeAll();

        const gruplar = await gorunurGruplariAl();

        // Tek grup varsa alt menu gereksiz - tek tiklamada eklensin
        if (gruplar.length <= 1) {
            chrome.contextMenus.create({
                id: 'wsdEkle',
                title: chrome.i18n.getMessage('actionTitle') || "WSD Speed Dial'e ekle",
                contexts: BAGLAMLAR
            });
            return;
        }

        // Birden fazla grup varsa: ust oge + her grup icin alt oge
        chrome.contextMenus.create({
            id: 'wsdKok',
            title: chrome.i18n.getMessage('actionTitle') || "WSD Speed Dial'e ekle",
            contexts: BAGLAMLAR
        });
        for (const g of gruplar) {
            chrome.contextMenus.create({
                id: 'wsdGrup:' + g.id,
                parentId: 'wsdKok',
                title: g.baslik,
                contexts: BAGLAMLAR
            });
        }
    } catch (e) {
        console.log('[WSD] menu kurulamadi:', e);
    }
}

chrome.runtime.onInstalled.addListener(menuyuTazele);
chrome.runtime.onStartup.addListener(menuyuTazele);
menuyuTazele();

/* --- Uzanti simgesi ---
   MV3'te `setIcon` KALICI DEGIL: isci uyudugunda manifest PNG'si geri
   geliyor. Bu yuzden iscinin uyandigi HER firsatta yeniden uyguluyoruz. */
simgeyiUygula();
chrome.runtime.onInstalled.addListener(simgeyiUygula);
chrome.runtime.onStartup.addListener(simgeyiUygula);
chrome.tabs.onActivated.addListener(() => simgeyiUygula());

chrome.storage.onChanged.addListener((d, alan) => {
    if (alan === 'local' && d.ayarlar) simgeyiUygula();
});

// Isci hic uyanmazsa alarm uyandirir
chrome.alarms.create('wsdSimge', { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener(a => {
    if (a.name === 'wsdSimge') simgeyiUygula();
    // Yarim kalan yakalama kuyrugunu surdur
    if (a.name === 'wsdYakalama') kuyrugaDevamEt(gorseliKaydet);
});

// Isci her uyandiginda bekleyen is var mi diye bak
chrome.runtime.onStartup.addListener(() => kuyrugaDevamEt(gorseliKaydet));
kuyrugaDevamEt(gorseliKaydet);

// Grup eklenince/silinince/adi degisince menu guncellensin
chrome.bookmarks.onCreated.addListener(menuyuTazele);
chrome.bookmarks.onRemoved.addListener(menuyuTazele);
chrome.bookmarks.onChanged.addListener(menuyuTazele);
chrome.bookmarks.onMoved.addListener(menuyuTazele);

// On yuzden gelen istekler
chrome.runtime.onMessage.addListener((mesaj) => {
    if (mesaj && mesaj.hedef === 'arkaplan' && mesaj.tur === 'kuyrugaTemizle') {
        kuyrugaTemizle().then(n => {
            chrome.runtime.sendMessage({ hedef: 'sayfa', tur: 'kuyrukTemizlendi', adet: n })
                .catch(() => {});
        });
        return;
    }
    if (mesaj && mesaj.hedef === 'arkaplan' && mesaj.tur === 'menuTazele') {
        menuyuTazele();
        return;
    }
    if (mesaj && mesaj.hedef === 'arkaplan' && mesaj.tur === 'gizliAc' && mesaj.url) {
        chrome.windows.create({ url: mesaj.url, incognito: true })
            .catch(e => console.log('[WSD] gizli pencere acilamadi:', e.message));
        return;
    }
    if (mesaj && mesaj.hedef === 'arkaplan' && mesaj.tur === 'gorselIste' && mesaj.url) {
        yakalamayaEkle(mesaj.url, gorseliKaydet);
    }
});

/**
 * Adresten okunabilir bir ad cikarir.
 *
 * Resim/dosya eklerken baslik olarak tum adresi yazmak kartlari
 * okunmaz yapiyordu; son parcayi alip uzantiyi atiyoruz.
 */
function dosyaAdi(url) {
    try {
        const yol = decodeURIComponent(new URL(url).pathname);
        const son = yol.split('/').filter(Boolean).pop() || url;
        return son.replace(/\.[a-z0-9]{1,5}$/i, '') || son;
    } catch (e) {
        return url;
    }
}

chrome.contextMenus.onClicked.addListener(async (bilgi, sekme) => {
    const id = String(bilgi.menuItemId);
    let hedef = null;

    if (id === 'wsdEkle') {
        // Tek grup durumu - Ana Sayfa gizliyse o tek grup baska bir grup
        const gorunur = await gorunurGruplariAl();
        hedef = gorunur.length ? gorunur[0].id : await kokKlasoruAl();
    } else if (id.startsWith('wsdGrup:')) {
        hedef = id.slice('wsdGrup:'.length);       // secilen grup
    } else {
        return;
    }

    // Adres onceligi: ORTAM OGESI > baglanti > sayfa.
    // Resmin uzerine sag tiklandiysa kullanici o resmi kastediyor,
    // sayfayi degil.
    const url = bilgi.srcUrl || bilgi.linkUrl || bilgi.pageUrl || (sekme && sekme.url);
    if (!url) return;

    const baslik = bilgi.srcUrl ? dosyaAdi(bilgi.srcUrl)
                 : bilgi.linkUrl ? (bilgi.selectionText || bilgi.linkUrl)
                 : ((sekme && sekme.title) || url);

    try {
        const temiz = urlNormalle(url);

        // KOPYA KONTROLU - WSD agacinin tamaminda ara
        const mevcut = await kopyaAra(temiz);
        if (mevcut) {
            const onay = await sayfadaOnaySor(sekme, mevcut.grupAdi);
            if (!onay) return;          // vazgecildi ya da sorulamadi
        }

        // Yakalamayi BURADA istemiyoruz: bookmarks.onCreated dinleyicisi
        // zaten tetikliyor. Ikisi birden calisinca iki popup aciliyordu.
        await chrome.bookmarks.create({ parentId: hedef, title: baslik, url: temiz });

        // Ziyaret edilen sayfada geri bildirim
        const grupAdi = (await gruplariAl()).find(g => g.id === hedef)?.baslik || '';
        sayfadaBildir(sekme, grupAdi ? c('grubaEklendi', grupAdi) : c('speedDialeEklendi'), true);
    } catch (e) {
        console.log('[WSD] kart eklenemedi:', e);
        sayfadaBildir(sekme, 'Eklenemedi', false);
    }
});

/** URL WSD agacinda var mi? Varsa hangi grupta oldugunu dondurur. */
async function kopyaAra(url) {
    try {
        const gruplar = await gruplariAl();
        for (const g of gruplar) {
            const cocuklar = await chrome.bookmarks.getChildren(g.id);
            const bulunan = cocuklar.find(c => c.url && urlNormalle(c.url) === url);
            if (bulunan) return { grupAdi: g.baslik, id: bulunan.id };
        }
    } catch (e) { /* aranamadi - kopya yok say */ }
    return null;
}

/**
 * Ziyaret edilen sayfada onay sorar.
 * Betik calistirilamayan sayfalarda (chrome:// vb.) SORAMIYORUZ;
 * o durumda sessizce ekliyoruz - kullaniciyi eli bos birakmaktansa.
 */
async function sayfadaOnaySor(sekme, grupAdi) {
    if (!sekme || !sekme.id) return true;
    try {
        const [sonuc] = await chrome.scripting.executeScript({
            target: { tabId: sekme.id },
            func: wsdOnayPenceresi,
            args: [grupAdi]
        });
        return sonuc?.result === true;
    } catch (e) {
        console.log('[WSD] onay sorulamadi:', e.message);
        return true;
    }
}

/** Bildirimi ilgili sekmeye enjekte eder. */
function sayfadaBildir(sekme, metin, basarili) {
    if (!sekme || !sekme.id) return;
    chrome.scripting.executeScript({
        target: { tabId: sekme.id },
        func: wsdBildirimGoster,
        args: [metin, basarili]
    }).catch(() => { /* chrome:// gibi sayfalarda betik calismaz */ });
}

/**
 * Yakalanan gorseli depoya yazar ve acik sayfalara haber verir.
 *
 * Kucultme burada YAPILMIYOR: servis iscisinde DOM yok. OffscreenCanvas ile
 * yapilabilir ama on yuz zaten kucultuyor; cift is olmasin diye ham yaziyoruz
 * ve on yuz gorunce sikistiriyor.
 */
async function gorseliKaydet(url, adaylar) {
    const liste = Array.isArray(adaylar) ? adaylar : (adaylar ? [adaylar] : []);
    let depoHatasi = null;

    if (liste.length) {
        const mevcut = (await chrome.storage.local.get(url).catch(() => ({})))[url] || {};
        const sonuc = await guvenliYaz({
            [url]: { ...mevcut, adaylar: liste, secim: 0, gorsel: liste[0] }
        });
        if (!sonuc.ok) {
            depoHatasi = sonuc.dolu ? 'dolu' : 'hata';
            // Depo doluysa kuyrugu surdurmenin anlami yok - hepsi
            // ayni duvara carpacak
            if (sonuc.dolu) kuyrugaTemizle();
        }
    }
    // BASARISIZ OLSA DA haber ver: yoksa karttaki donence hic durmuyor.
    // `basarili` bayragi ile on yuz kullaniciya bilgi verebiliyor.
    chrome.runtime.sendMessage({
        hedef: 'sayfa', tur: 'gorselHazir', url,
        basarili: liste.length > 0 && !depoHatasi,
        depoHatasi
    }).catch(() => {});
}

// Yer imi WSD agacina eklendiginde de gorsel cek (yer imi cubugundan eklenenler)
chrome.bookmarks.onCreated.addListener(async (id, dugum) => {
    if (!dugum.url) return;
    try {
        const kok = await kokKlasoruAl();
        const gruplar = await gruplariAl();
        const wsdIcinde = gruplar.some(g => g.id === dugum.parentId);
        if (!wsdIcinde && dugum.parentId !== kok) return;

        // Normallestirilmis anahtarla bakiyoruz - depoda oyle duruyor
        const anahtar = urlNormalle(dugum.url);
        const mevcut = await chrome.storage.local.get(anahtar);
        if (mevcut[anahtar]) return;                // gorsel zaten var
        yakalamayaEkle(anahtar, gorseliKaydet);
    } catch (e) { /* onemli degil */ }
});
