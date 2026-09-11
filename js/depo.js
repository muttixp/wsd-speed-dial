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

// WSD Speed Dial - depolama durumu
//
// `unlimitedStorage` izni Chrome'un 5 MB kotasini kaldiriyor ama disk
// sinirsiz degil. Yazma basarisiz olunca kullanici yalnizca gorselin
// gelmedigini goruyordu; sebebi burada gorunur hale getiriyoruz.

// Bu esigin ustunde uyariyoruz. Kesin bir sinir degil - diskin dolmasina
// yaklasildiginda tarayici eklenti verisini temizleyebiliyor.
export const UYARI_ESIGI = 0.85;      // kullanilan / ayrilan

export async function depoDurumu() {
    const sonuc = {
        gorselBayt: 0, gorselAdet: 0,
        oksuzAdet: 0, oksuzBayt: 0, oksuzSayildi: false,
        digerBayt: 0, toplamBayt: 0,
        kullanilan: null, ayrilan: null, oran: null
    };

    // DEGERLERI OKUMADAN olcum yapiyoruz.
    //
    // Eskiden `storage.local.get(null)` ile TUM kayitlar bellege
    // aliniyor, ustune her degere JSON.stringify uygulanip ikinci bir
    // kopya cikariliyordu. 1000+ kartli depoda bu yuzlerce MB demek ve
    // sekme "Render process gone" ile cokuyordu. Bu islev acilista
    // (kayipDenetle + otomatikYedekDene) iki kez cagriliyor.
    //
    // Yerine: anahtar listesi + getBytesInUse. Ikisi de degerleri
    // getirmiyor.
    const GORSEL_ANAHTARI = /^(https?|file|chrome|chrome-extension|edge|vivaldi):/i;

    let anahtarlar = [];
    try {
        if (chrome.storage.local.getKeys) {
            anahtarlar = await chrome.storage.local.getKeys();      // Chrome 130+
        } else {
            // Eski surum: baska yol yok, degerleri okuyup hemen birakiyoruz
            const hepsi = await chrome.storage.local.get(null);
            anahtarlar = Object.keys(hepsi);
        }
    } catch (e) {
        console.log('[WSD] depo anahtarlari okunamadi:', e);
    }

    const gorselAnahtarlari = anahtarlar.filter(a => GORSEL_ANAHTARI.test(a));
    sonuc.gorselAdet = gorselAnahtarlari.length;

    const baytOl = async liste => {
        if (!liste.length) return 0;
        try {
            if (!chrome.storage.local.getBytesInUse) return 0;
            // Cok uzun listeyi parcalara bolerek soruyoruz
            let toplam = 0;
            for (let i = 0; i < liste.length; i += 500) {
                toplam += await chrome.storage.local.getBytesInUse(liste.slice(i, i + 500));
            }
            return toplam;
        } catch (e) {
            return 0;
        }
    };

    sonuc.gorselBayt = await baytOl(gorselAnahtarlari);
    try {
        if (chrome.storage.local.getBytesInUse) {
            sonuc.toplamBayt = await chrome.storage.local.getBytesInUse(null);
        }
    } catch (e) { /* eski surum */ }
    sonuc.digerBayt = Math.max(0, sonuc.toplamBayt - sonuc.gorselBayt);

    // OKSUZ kayitlar: yer imi karsiligi kalmamis gorseller.
    // Bunlari ayri saymak onemli - panelde "1109 kart" yaziyordu ama
    // gercek kart sayisi 934'tu, aradaki fark silinen kartlarin
    // depoda kalan gorselleriydi.
    try {
        // YALNIZCA WSD AGACI. Baska klasorlerdeki ayni adresler
        // gorselleri "yasiyor" gosteriyordu; depomuzda yalnizca WSD
        // kartlarinin gorselinin durmasi gerekiyor.
        const yasayan = await wsdUrlleri();

        // Emniyet: agac okunamadiysa hepsini oksuz sayma
        if (yasayan.size) {
            const oksuzler = gorselAnahtarlari.filter(a => !yasayan.has(a));
            sonuc.oksuzAdet = oksuzler.length;
            sonuc.oksuzBayt = await baytOl(oksuzler);
        }
        sonuc.oksuzSayildi = true;
    } catch (e) {
        console.log('[WSD] oksuz sayimi yapilamadi:', e);
        sonuc.oksuzSayildi = false;
    }

    // Ust sinir icin `navigator.storage.estimate()`.
    //
    // DIKKAT: onun `usage` degerini KULLANMIYORUZ. O yalnizca IndexedDB,
    // Cache API gibi alanlari sayiyor; `chrome.storage.local` oraya
    // yansimiyor. 47 MB gorsel varken 46 KB gosteriyordu.
    // `quota` ise diske gore hesaplanan tavan - o gecerli.
    try {
        if (navigator.storage && navigator.storage.estimate) {
            const t = await navigator.storage.estimate();
            sonuc.ayrilan = t.quota ?? null;
            sonuc.kullanilan = sonuc.toplamBayt;      // KENDI olcumumuz
            if (t.quota) sonuc.oran = sonuc.toplamBayt / t.quota;
        }
    } catch (e) { /* desteklenmiyor */ }

    return sonuc;
}

/** WSD agacindaki tum kart adresleri (ham + normallestirilmis). */
export async function wsdUrlleri() {
    const kume = new Set();
    try {
        const { gruplariAl, kartlariAl } = await import('./yerimi.js');
        for (const g of await gruplariAl()) {
            for (const k of await kartlariAl(g.id)) {
                kume.add(k.url);
                try { kume.add(new URL(k.url).href); } catch (e) { /* atla */ }
            }
        }
    } catch (e) {
        console.log('[WSD] wsd url listesi alinamadi:', e);
    }
    return kume;
}

export function mb(bayt) {
    if (bayt == null) return '?';
    if (bayt < 1048576) return (bayt / 1024).toFixed(0) + ' KB';
    if (bayt < 1073741824) return (bayt / 1048576).toFixed(1) + ' MB';
    return (bayt / 1073741824).toFixed(2) + ' GB';
}

/**
 * Yazmayi deneyip basarisiz olursa SEBEBI donduruyor.
 * Cagiran taraf sessizce gecmek yerine kullaniciya haber verebiliyor.
 */
export async function guvenliYaz(nesne) {
    try {
        await chrome.storage.local.set(nesne);
        return { ok: true };
    } catch (e) {
        const m = String(e && e.message || e);
        const doluMu = /quota|exceeded|space|full/i.test(m);
        console.log('[WSD] depoya yazilamadi:', m);
        return { ok: false, dolu: doluMu, mesaj: m };
    }
}


/* ============ Veri kaybi denetimi ============ */

const IZ = 'depoIzi';

// Bu oranin ustundeki ani dusus "kayip" sayiliyor. Kullanicinin kendi
// silmeleri de tetikleyebilir - o yuzden uyari sorgulayici bir dille
// veriliyor, kesin hukum vermiyor.
const KAYIP_ORANI = 0.25;

/**
 * Onceki acilistaki kart/gorsel sayilariyla karsilastirir.
 *
 * Veri kaybi sessizce olabiliyor: disk sorunu, profil bozulmasi,
 * yanlislikla "tum verileri sil". Iz birakmazsak kullanici ancak
 * gorseller gittiginde fark ediyor ve o noktada yedegi de eskimis
 * oluyor.
 */
export async function kayipDenetle(suankiKart) {
    try {
        const d = await chrome.storage.local.get(IZ);
        const onceki = d[IZ];

        const durum = await depoDurumu();
        const suanki = {
            kart: suankiKart,
            gorsel: durum.gorselAdet,
            bayt: durum.gorselBayt,
            tarih: new Date().toISOString()
        };

        await chrome.storage.local.set({ [IZ]: suanki });

        if (!onceki || !onceki.gorsel) return null;   // ilk calisma

        const gorselDususu = 1 - (suanki.gorsel / onceki.gorsel);
        const kartDususu = onceki.kart ? 1 - (suanki.kart / onceki.kart) : 0;

        // Kart sayisi da dustuyse kullanici silmis olabilir; yalnizca
        // GORSELLER gittiyse veri kaybi olasiligi yuksek
        if (gorselDususu >= KAYIP_ORANI && kartDususu < 0.05) {
            return {
                tur: 'gorsel',
                onceki: onceki.gorsel,
                suanki: suanki.gorsel,
                tarih: onceki.tarih
            };
        }

        if (kartDususu >= KAYIP_ORANI) {
            return {
                tur: 'kart',
                onceki: onceki.kart,
                suanki: suanki.kart,
                tarih: onceki.tarih
            };
        }

        return null;
    } catch (e) {
        console.log('[WSD] kayip denetimi yapilamadi:', e);
        return null;
    }
}
