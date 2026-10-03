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

import { kokKlasoruAl, gruplariAl, gorunurGruplariAl, urlNormalle, klasorZinciri } from './yerimi.js';
import { c } from './dil.js';
import { yakalamayaEkle, kuyrugaDevamEt, kuyrugaTemizle, sonBasliklar } from './yakalama.js';
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

function wsdOnayPenceresi(grupAdi, m) {
    return new Promise(resolve => {
        const temizAd = String(grupAdi).replace(/[<>&"]/g, '');
        const k = s => String(s).replace(/[<>&]/g, '');
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
            '<h3>' + k(m.baslik) + '</h3>' +
            '<p>' + k(m.metin).replace('$1', '<b>' + temizAd + '</b>') + '</p>' +
            '<div class="dugmeler">' +
            '<button class="iptal">' + k(m.iptal) + '</button>' +
            '<button class="tamam">' + k(m.tamam) + '</button>' +
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
    // Kisa araliktaki cagrilari tek kuruluma indir.
    //
    // Isci uyandiginda `onInstalled`, `onStartup` ve modul yuklemesi
    // ucu birden tetikleyebiliyor; 120ms bazen yetmiyordu.
    clearTimeout(menuBekleyen);
    menuBekleyen = setTimeout(() => {
        menuKurulumu = menuKurulumu.then(menuyuKur).catch(() => {});
    }, 250);
}

/**
 * Menu ogesi olusturur ve TAMAMLANMASINI BEKLER.
 *
 * `contextMenus.create` callback'siz cagrilinca hemen donuyor; kurulum
 * "bitti" sanilip bir sonraki kurulum basliyordu ve ayni id ikinci kez
 * yazilmaya calisiliyordu ("Cannot create item with duplicate id").
 */
function menuOgesi(ayar) {
    return new Promise(coz => {
        chrome.contextMenus.create(ayar, () => {
            // Hata olsa da zinciri kirmiyoruz - okumak lastError'i temizler
            void chrome.runtime.lastError;
            coz();
        });
    });
}

async function menuyuKur() {
    try {
        await chrome.contextMenus.removeAll();

        const gruplar = await gorunurGruplariAl();
        const kok = await kokKlasoruAl();
        const baslik = chrome.i18n.getMessage('actionTitle') || "WSD Speed Dial'e ekle";

        // ALT KLASORLER (1.5.1): her grubun klasor agaci. Tek getSubTree
        // cagrisiyla tum agac; kok (Ana Sayfa) yaprak - alt klasorleri
        // zaten gruplar.
        let agac = new Map();
        try {
            const [k] = await chrome.bookmarks.getSubTree(kok);
            for (const g of k.children || []) if (!g.url) agac.set(g.id, g);
        } catch (e) { agac = new Map(); }
        const altKlasorler = d => (d?.children || []).filter(x => !x.url);

        // Tek grup ve alt klasoru yoksa alt menu gereksiz - tek tiklamada eklensin
        if (gruplar.length <= 1 && !gruplar.some(g => !g.kokMu && altKlasorler(agac.get(g.id)).length)) {
            await menuOgesi({ id: 'wsdEkle', title: baslik, contexts: BAGLAMLAR });
            return;
        }

        await menuOgesi({ id: 'wsdKok', title: baslik, contexts: BAGLAMLAR });

        // UC KIP (1.5.2, Ayarlar > Kartlar > Davranis):
        //  'pencere': gruplar dogrudan tiklanir + en altta "Klasor sec..."
        //             (alt klasorler kucuk pencerede agac olarak)
        //  'agac'   : alt klasoru olan grup/klasor alt menu aciyor; ilk
        //             satir "＋ Ad" onun kendisi (alt menusu olan satira
        //             Chrome tiklatmiyor)
        //  'gruplar': yalnizca gruplar (1.5.1 ve oncesi)
        let kip = 'pencere';
        try { kip = (await chrome.storage.local.get('ayarlar')).ayarlar?.sagTikMenu || 'pencere'; } catch (e) { /* varsayilan */ }

        if (kip === 'agac') {
            const EN_DERIN = 6;
            const ekle = async (id, ad, ustId, dugum, derinlik) => {
                const altlar = derinlik < EN_DERIN ? altKlasorler(dugum) : [];
                if (!altlar.length) {
                    await menuOgesi({ id: 'wsdGrup:' + id, parentId: ustId, title: ad, contexts: BAGLAMLAR });
                    return;
                }
                const dal = 'wsdDal:' + id;
                await menuOgesi({ id: dal, parentId: ustId, title: ad, contexts: BAGLAMLAR });
                await menuOgesi({ id: 'wsdGrup:' + id, parentId: dal, title: '\uFF0B ' + ad, contexts: BAGLAMLAR });
                await menuOgesi({ id: 'wsdAyrac:' + id, parentId: dal, type: 'separator', contexts: BAGLAMLAR });
                for (const a of altlar) await ekle(a.id, a.title || '\u2014', dal, a, derinlik + 1);
            };
            for (const g of gruplar) await ekle(g.id, g.baslik, 'wsdKok', g.kokMu ? null : agac.get(g.id), 0);
            return;
        }

        // "Klasor sec..." EN USTTE: yuzlerce grupta en altta kaliyor ve
        // listeyi sonuna kadar kaydirmak gerekiyordu
        if (kip === 'pencere' && gruplar.some(g => !g.kokMu && altKlasorler(agac.get(g.id)).length)) {
            await menuOgesi({ id: 'wsdSec', parentId: 'wsdKok',
                              title: chrome.i18n.getMessage('klasorSecMenu') || 'Klasör seç…', contexts: BAGLAMLAR });
            await menuOgesi({ id: 'wsdAyrac', parentId: 'wsdKok', type: 'separator', contexts: BAGLAMLAR });
        }
        for (const g of gruplar) {
            await menuOgesi({ id: 'wsdGrup:' + g.id, parentId: 'wsdKok', title: g.baslik, contexts: BAGLAMLAR });
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
    if (alan === 'local' && d.ayarlar) {
        simgeyiUygula();
        // Sag tik menu kipi degistiyse menu yeniden kurulsun
        if ((d.ayarlar.oldValue?.sagTikMenu || 'pencere') !== (d.ayarlar.newValue?.sagTikMenu || 'pencere')) menuyuTazele();
    }
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
chrome.bookmarks.onCreated.addListener(() => { if (!iceAktarimBayragi) menuyuTazele(); });
chrome.bookmarks.onRemoved.addListener(menuyuTazele);
chrome.bookmarks.onChanged.addListener(menuyuTazele);
chrome.bookmarks.onMoved.addListener(menuyuTazele);

/* --- Ice aktarma sirasinda yakalama bekler (bkz. iceaktarim.js) ---
   Bayrak depoda da tutuluyor: isci aktarma sirasinda yeniden baslarsa
   bellekteki bayrak kaybolur. 30 dakikadan eski bayrak gecersiz -
   aktarma yarida kalirsa yakalama sonsuza kadar kapali kalmasin. */
let iceAktarimBayragi = false;
const ICE_AKTARIM_SURESI = 30 * 60 * 1000;

async function iceAktarimSuruyor() {
    if (iceAktarimBayragi) return true;
    try {
        const { iceAktarim } = await chrome.storage.local.get('iceAktarim');
        return !!iceAktarim && Date.now() - iceAktarim < ICE_AKTARIM_SURESI;
    } catch (e) { return false; }
}

/** Aktarilan adreslerden gorseli olmayanlari kuyruga alir. */
async function aktarilanlariYakala(urller) {
    const anahtarlar = urller.map(urlNormalle);
    let varolan;
    try {
        // Yalnizca ANAHTARLAR: gorselleri bellege almadan (binlerce data URI)
        if (chrome.storage.local.getKeys) {
            varolan = new Set(await chrome.storage.local.getKeys());
        } else {
            varolan = new Set();
            for (let i = 0; i < anahtarlar.length; i += 50) {
                const d = await chrome.storage.local.get(anahtarlar.slice(i, i + 50));
                for (const k of Object.keys(d)) varolan.add(k);
            }
        }
    } catch (e) { return; }

    const eksik = [...new Set(anahtarlar)].filter(a => !varolan.has(a));
    if (!eksik.length) return;
    // Cok fazlaysa KENDILIGINDEN baslatmiyoruz: yuzlerce pencere dakikalarca
    // acilip kapanir. Kullaniciya haber verip gruptan yenilemeyi birakiyoruz.
    if (eksik.length > 300) {
        chrome.runtime.sendMessage({ hedef: 'sayfa', tur: 'aktarimGorselsiz', adet: eksik.length })
            .catch(() => {});
        return;
    }
    for (const a of eksik) yakalamayaEkle(a, gorseliKaydet);
}

// On yuzden gelen istekler
chrome.runtime.onMessage.addListener((mesaj) => {
    if (mesaj && mesaj.hedef === 'arkaplan' && mesaj.tur === 'iceAktarimBasladi') {
        iceAktarimBayragi = true;
        chrome.storage.local.set({ iceAktarim: Date.now() }).catch(() => {});
        return;
    }
    if (mesaj && mesaj.hedef === 'arkaplan' && mesaj.tur === 'iceAktarimBitti') {
        iceAktarimBayragi = false;
        chrome.storage.local.remove('iceAktarim').catch(() => {});
        menuyuTazele();
        aktarilanlariYakala(Array.isArray(mesaj.urller) ? mesaj.urller : []);
        return;
    }
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
        yakalamayaEkle(mesaj.url, gorseliKaydet, mesaj.oncelik !== false);
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

    // Adres onceligi: ORTAM OGESI > baglanti > sayfa.
    // Resmin uzerine sag tiklandiysa kullanici o resmi kastediyor,
    // sayfayi degil.
    const url = bilgi.srcUrl || bilgi.linkUrl || bilgi.pageUrl || (sekme && sekme.url);
    if (!url) return;
    const baslik = bilgi.srcUrl ? dosyaAdi(bilgi.srcUrl)
                 : bilgi.linkUrl ? (bilgi.selectionText || bilgi.linkUrl)
                 : ((sekme && sekme.title) || url);

    if (id === 'wsdEkle') {
        // Tek grup durumu - Ana Sayfa gizliyse o tek grup baska bir grup
        const gorunur = await gorunurGruplariAl();
        hedef = gorunur.length ? gorunur[0].id : await kokKlasoruAl();
    } else if (id.startsWith('wsdGrup:')) {
        hedef = id.slice('wsdGrup:'.length);       // secilen grup
    } else if (id === 'wsdSec') {
        // Klasor secme penceresi: eklenecek sayfa depoda bekliyor,
        // pencere secimi 'seciciEkle' mesajiyla geri yolluyor
        await chrome.storage.local.set({ bekleyenEkle: { url, baslik, sekmeId: sekme?.id ?? null, zaman: Date.now() } });
        await chrome.windows.create({ url: chrome.runtime.getURL('secici.html'), type: 'popup', width: 420, height: 600 });
        return;
    } else {
        return;
    }
    await sayfayiEkle(hedef, url, baslik, sekme);
});

/** Sag tiktan gelen sayfayi `hedef` klasore ekler, sayfada bildirir. */
async function sayfayiEkle(hedef, url, baslik, sekme) {
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

        // Ziyaret edilen sayfada geri bildirim: alt klasorse tam yol
        const zincir = await klasorZinciri(hedef).catch(() => null);
        const grupAdi = zincir ? zincir.map(z => z.baslik).join(' › ')
                      : ((await gruplariAl()).find(g => g.id === hedef)?.baslik || '');
        sayfadaBildir(sekme, grupAdi ? c('grubaEklendi', grupAdi) : c('speedDialeEklendi'), true);
    } catch (e) {
        console.log('[WSD] kart eklenemedi:', e);
        sayfadaBildir(sekme, 'Eklenemedi', false);
    }
}

// "Klasor sec..." penceresinden gelen secim
chrome.runtime.onMessage.addListener(mesaj => {
    if (!mesaj || mesaj.hedef !== 'arkaplan' || mesaj.tur !== 'seciciEkle' || !mesaj.klasorId) return;
    (async () => {
        const { bekleyenEkle: b } = await chrome.storage.local.get('bekleyenEkle');
        await chrome.storage.local.remove('bekleyenEkle');
        if (!b || !b.url || Date.now() - (b.zaman || 0) > 30 * 60 * 1000) return;
        let sekme = null;
        if (b.sekmeId != null) sekme = await chrome.tabs.get(b.sekmeId).catch(() => null);
        await sayfayiEkle(mesaj.klasorId, b.url, b.baslik, sekme);
    })();
});

/** URL WSD agacinda var mi? Varsa hangi grupta oldugunu dondurur. */
async function kopyaAra(url) {
    try {
        // Alt klasorler dahil: kart bir alt klasorde olabilir
        const kok = await kokKlasoruAl();
        const [agac] = await chrome.bookmarks.getSubTree(kok);
        const gez = (d, ad) => {
            for (const c of d.children || []) {
                if (c.url) { if (urlNormalle(c.url) === url) return { grupAdi: ad, id: c.id }; }
                else {
                    const b = gez(c, ad ? ad + ' › ' + c.title : c.title);
                    if (b) return b;
                }
            }
            return null;
        };
        const bulunan = gez(agac, '');
        if (bulunan) return { ...bulunan, grupAdi: bulunan.grupAdi || (chrome.i18n.getMessage('anaSayfa') || 'Ana Sayfa') };
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
            args: [grupAdi, { baslik: c('sayfaZatenEkli'), metin: c('sayfaZatenEkliMetin', '$1'), iptal: c('vazgec'), tamam: c('yineDeEkle') }]
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
/**
 * Kart basligi ilk eklemede o anki sekmeden aliniyor. Site o an hata
 * sayfasi verdiyse baslik "404 - Sayfa bulunamadi" olarak kaliyor ve
 * tazeleme yalnizca gorseli yeniliyordu. Yakalamada okunan YENI baslik
 * ile degistiriyoruz - ama yalnizca eskisi bariz bozuksa; kullanicinin
 * elle yazdigi baslige DOKUNMUYORUZ.
 */
const BOZUK_BASLIK = /^\s*(\d{3}\s*[-–—:|]?\s*)?(404|403|500|502|503)\b|not found|bulunamad|sayfa yok|error|hata|forbidden|unavailable|erisilemiyor|problem loading|yuklenemedi|^\s*$/i;

async function basligiTazele(url) {
    const yeni = sonBasliklar.get(url);
    sonBasliklar.delete(url);
    if (!yeni) return;
    try {
        const dugumler = await chrome.bookmarks.search({ url });
        for (const d of dugumler) {
            const eski = d.title || '';
            // Eski baslik bozuksa ya da adresin kendisiyse guncelle
            if (!BOZUK_BASLIK.test(eski) && eski !== url) continue;
            if (BOZUK_BASLIK.test(yeni)) continue;      // yenisi de hataliysa birak
            await chrome.bookmarks.update(d.id, { title: yeni });
        }
    } catch (e) { /* yer imi bulunamadi */ }
}

async function gorseliKaydet(url, adaylar) {
    await basligiTazele(url);

    // Yakalama BASARILI ise sayfa yeniden acilabiliyor demektir;
    // varsa kirik isaretini kaldiriyoruz. Isaretin kendiliginden
    // duzelmesinin tek yolu bu.
    if (adaylar && adaylar.length) {
        try {
            const { kirikIsaretiKaldir } = await import('./kirik.js');
            await kirikIsaretiKaldir(url);
        } catch (e) { /* onemli degil */ }
    }
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
    if (await iceAktarimSuruyor()) return;      // bitince toplu alinacak
    try {
        // Alt klasorler dahil WSD agacinda mi?
        if (!await klasorZinciri(dugum.parentId)) return;

        // Normallestirilmis anahtarla bakiyoruz - depoda oyle duruyor
        const anahtar = urlNormalle(dugum.url);
        const mevcut = await chrome.storage.local.get(anahtar);
        if (mevcut[anahtar]) return;                // gorsel zaten var
        yakalamayaEkle(anahtar, gorseliKaydet);
    } catch (e) { /* onemli degil */ }
});
