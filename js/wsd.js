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

// WSD Speed Dial - giris noktasi
import { arayuzuKur } from './cizim.js';
import { sayfayiCevir } from './dil.js';
import { ayarPaneliniKur } from './ayarpanel.js';
import { etkilesimiKur, gorselHazir, kartEklePenceresi, grupEklePenceresiDis,
         gruplariYonetDis } from './etkilesim.js';
import { grupSuruklemeKur } from './grupsurukle.js';
import { kartSuruklemeKur } from './kartsurukle.js';
import { aramayiKur, dizinBayatladi } from './arama.js';
import { otomatikYedekDene } from './yedek.js';
import { kisayollariKur } from './kisayol.js';
import { copuSuz } from './cop.js';
import { kayipDenetle } from './depo.js';
import { tazelemeBastirildiMi } from './arayuz.js';
import { aktifGrup, grubuAc } from './cizim.js';
import { bildir } from './etkilesim.js';

/**
 * Ekrani yeniden cizer.
 *
 * GECIKMELI: tek bir islem birden cok olay uretiyor (grup silmek
 * klasor + icindeki her kart icin ayri olay). Hepsinde cizmek yerine
 * son olaydan kisa sure sonra bir kez ciziyoruz.
 *
 * Kendi islemlerimiz zaten cizim yapiyor; buradaki tazeleme onlarin
 * ustune binmesin diye `bastir()` ile kisa sureligine susturuluyor.
 */
let tazelemeZaman = null;
let bekleyenTazeleme = false;

function ekraniTazele() {
    if (tazelemeBastirildiMi()) return;

    // SEKME ARKA PLANDAYSA beklet: tarayici arka plan sekmelerinde
    // zamanlayicilari kisiyor, 250ms saniyelere cikiyordu. Kullanici
    // sekmeye dondugu anda cizmek hem hizli hem gereksiz is yapmiyor.
    if (document.hidden) { bekleyenTazeleme = true; return; }

    clearTimeout(tazelemeZaman);
    tazelemeZaman = setTimeout(async () => {
        try {
            // Surukleme sirasinda cizmek islemi bozar
            if (document.querySelector('.kart.surukKaynak')) return;
            // Arama ya da cop ekranindaysak dokunma
            // OZEL EKRANLAR kendi listelerini ciziyor; buradan
            // `arayuzuKur()` calisirsa normal izgara gelip onlarin
            // yerini aliyor ve kullanici yerini kaybediyor
            if (document.body.classList.contains('aramaAcik')) return;
            if (document.body.classList.contains('copAcik')) return;
            if (document.body.classList.contains('kopyaAcik')) return;

            await arayuzuKur();
        } catch (e) {
            console.log('[WSD] tazeleme hatasi:', e);
        }
    }, 120);
}

// Sekmeye donunce bekleyen tazelemeyi HEMEN yap
document.addEventListener('visibilitychange', () => {
    if (document.hidden || !bekleyenTazeleme) return;
    bekleyenTazeleme = false;
    clearTimeout(tazelemeZaman);
    ekraniTazele();
});

/**
 * Depo dolduğunda kullaniciyi uyarir ve BIR KEZ otomatik yedek alir.
 *
 * Sessizce gecmek en kotusu: kullanici gorselin gelmedigini goruyor
 * ama sebebini bilmiyor ve veri kaybediyor olabiliyor.
 */
let depoUyarisiVerildi = false;

async function depoUyarisi(tur) {
    if (depoUyarisiVerildi) return;
    depoUyarisiVerildi = true;

    const { bildir } = await import('./etkilesim.js');

    if (tur !== 'dolu') {
        bildir(c('gorselKaydedilemedi'));
        return;
    }

    bildir(c('depolamaAlaniDoluYedekAliniyor'));

    // Veri kaybina karsi hemen yedek: kullanici alani bosaltirken
    // elinde guncel bir kopya olsun
    try {
        const { yedegiIndir } = await import('./yedek.js');
        await yedegiIndir();
        bildir(c('depoDoluYedekIndirildi'),
               { etiket: c('bakim'), sure: 20000, calistir: () => {
                   document.getElementById('ayarPanel')?.classList.add('acik');
                   document.getElementById('perde')?.classList.add('acik');
                   document.body.classList.add('ayarAcik');
               }});
    } catch (e) {
        console.log('[WSD] acil yedek alinamadi:', e);
        bildir(c('depoDoluTemizlikYapin'));
    }
}

/** Ayar panelini acip Bakim bolumune goturur. */
function bakimBolumunuAc() {
    document.getElementById('ayarPanel')?.classList.add('acik');
    document.getElementById('perde')?.classList.add('acik');
    document.body.classList.add('ayarAcik');

    // Panel acilis animasyonu bitmeden kaydirmak ise yaramiyor
    setTimeout(() => {
        const bolumler = [...document.querySelectorAll('.bolum')];
        const bakim = bolumler.find(b =>
            b.querySelector('.bolumAd')?.textContent.trim() === c('bakim'));
        if (!bakim) return;
        bolumler.forEach(b => b.classList.remove('acik'));
        bakim.classList.add('acik');
        bakim.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 240);
}

/**
 * Onceki acilisla karsilastirip ani veri dususunu bildirir.
 *
 * Kesin hukum VERMIYOR: kullanicinin kendi silmesi de dususe yol
 * aciyor. Sorgulayici bir dille soyleyip yedegi hatirlatiyoruz.
 */
async function kayipDenetimi() {
    try {
        const { gruplariAl, kartlariAl } = await import('./yerimi.js');
        let kart = 0;
        for (const g of await gruplariAl()) kart += (await kartlariAl(g.id)).length;

        const kayip = await kayipDenetle(kart);
        if (!kayip) return;

        const ne = kayip.tur === 'gorsel' ? c('kartGorseli') : 'kart';
        const { bildir } = await import('./etkilesim.js');
        const { sonYedekBilgisi } = await import('./yedek.js');
        const { tarihMetni } = await import('./sayac.js');

        const yedek = await sonYedekBilgisi();

        // Yedegimiz varsa DOSYA ADINI soyluyoruz: kullanici indirilenler
        // klasorunde neyi arayacagini bilsin
        let metin = c('oncekiSimdiKayip', kayip.onceki, ne, kayip.suanki);
        if (yedek) {
            metin += `Son yedek: ${yedek.dosya} (${tarihMetni(yedek.tarih)}, ` +
                     `${yedek.kart} kart)`;
        } else {
            metin += c('sizSilmediyseniz');
        }

        bildir(metin, {
            etiket: yedek ? c('yedegiYukle') : 'Yedekleme',
            sure: 30000,
            calistir: () => {
                // Dosya secici dogrudan aciliyor - panelde gezinmeye gerek yok
                if (yedek) {
                    document.getElementById('ayYedekSecici')?.click();
                    return;
                }
                document.getElementById('ayarPanel')?.classList.add('acik');
                document.getElementById('perde')?.classList.add('acik');
                document.body.classList.add('ayarAcik');
            }
        });
    } catch (e) {
        console.log('[WSD] kayip denetimi:', e);
    }
}


document.addEventListener('DOMContentLoaded', async () => {
    // Govde `visibility: hidden` basliyor (bkz. index.html kritik stil).
    // Ayarlar uygulanmadan gosterirsek kartlar once varsayilan renklerle
    // cizilip sonra ziplyor - once kur, sonra goster.
    const goster = () => document.body.classList.add('hazir');

    // Guvenlik: bir hata olsa bile sayfa gizli kalmasin
    const asim = setTimeout(goster, 1500);

    try {
        // Once cevir: arayuz kurulurken metinler yerinde olsun
        sayfayiCevir();
        await arayuzuKur();
        await ayarPaneliniKur();
        etkilesimiKur();
        await grupSuruklemeKur(() => arayuzuKur());
        kartSuruklemeKur({
            aktifGrup,
            yenile: () => grubuAc(aktifGrup()),
            bildir
        });
        aramayiKur({ aktifGrup, grubuAc });
        kisayollariKur({ aktifGrup, grubuAc,
                         kartEkle: kartEklePenceresi,
                         grupEkle: grupEklePenceresiDis,
                         gruplariYonet: gruplariYonetDis });

        // Yer imi degisince arama dizini bayatliyor VE ekran tazeleniyor.
        //
        // Degisiklik baska bir sekmeden, sag tik menusunden ya da
        // tarayici senkronundan gelebiliyor; acik duran sayfa eskisini
        // gostermeye devam ediyordu.
        for (const olay of ['onCreated', 'onRemoved', 'onChanged', 'onMoved']) {
            chrome.bookmarks[olay].addListener(() => {
                dizinBayatladi();
                ekraniTazele();
            });
        }

        // Gunluk yedek - acilisi yavaslatmasin diye biraz sonra
        // Veri kaybi denetimi - once bu, sonra yedek
        setTimeout(() => kayipDenetimi(), 1500);

        setTimeout(async () => {
            const sonuc = await otomatikYedekDene();
            if (sonuc && sonuc.acil) {
                const { bildir } = await import('./etkilesim.js');
                const yuzde = Math.round(sonuc.oran * 100);
                bildir(
                    yuzde >= 100
                        ? c('depoDolduYedekAlipTemizleyin')
                        : `Depolama alanının %${yuzde}'i dolu — yedek almanız önerilir`,
                    {
                        // Dogrudan indirmek yerine BAKIM bolumunu aciyoruz:
                        // kullanici orada durumu goruyor, yedegi aliyor ve
                        // gerekirse temizligi de ayni yerden yapiyor.
                        etiket: c('bakim'),
                        sure: 25000,
                        calistir: () => bakimBolumunuAc()
                    });
            }
        }, 3000);
        copuSuz().catch(() => {});
    } catch (e) {
        console.log('[WSD] baslatma hatasi:', e);
    } finally {
        clearTimeout(asim);
        goster();
    }
});

// Arka plan bir gorsel yakaladiginda kart yerinde guncellensin
chrome.runtime.onMessage.addListener(mesaj => {
    if (mesaj && mesaj.hedef === 'sayfa' && mesaj.tur === 'kuyrukTemizlendi') {
        document.querySelectorAll('.kart.yenileniyor')
            .forEach(a => a.classList.remove('yenileniyor'));
        return;
    }
    if (mesaj && mesaj.hedef === 'sayfa' && mesaj.tur === 'yakalamaBasladi') {
        for (const a of document.querySelectorAll('.kart[data-anahtar]')) {
            if (a.dataset.anahtar === mesaj.url) a.classList.add('yenileniyor');
        }
        return;
    }
    if (mesaj && mesaj.hedef === 'sayfa' && mesaj.tur === 'gorselHazir') {
        gorselHazir(mesaj.url, mesaj.basarili !== false);
        if (mesaj.depoHatasi) depoUyarisi(mesaj.depoHatasi);
    }
});
