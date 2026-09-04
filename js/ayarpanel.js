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

// WSD Speed Dial - ayar paneli baglantilari

import { ayarlariAl, ayarYaz, ayarlariSifirla } from './ayar.js';
import { c } from './dil.js';
import { filtreZinciri, ikiRenkKatmanlari } from './filtre.js';
import { yedegiIndir, yedegiYukle, oksuzleriTemizle, herSeyiSil } from './yedek.js';
import { depoDurumu, mb, UYARI_ESIGI } from './depo.js';
import { onaySor, onaylariGeriGetir } from './onay.js';

// NOT: dosyanin BASINDA tanimli olmali. `const` yukari tasinmadigi icin
// asagida tanimlandiginda gorunumuUygula() calisirken erisim hatasi
// veriyor ve panel hic uygulanmiyordu (TDZ).
const VARSAYILAN_DUVAR = 'linear-gradient(135deg, #4aa3df, #2f6fd0)';

// [ayar anahtari, eleman id, deger okuyucu]
const ALANLAR = [
    ['yakalamaYontemi',  'ayYontem',    el => el.value],
    ['yakalamaEn',       'ayEn',        el => +el.value],
    ['yakalamaBoy',      'ayBoy',       el => +el.value],
    ['yakalamaKaydirma', 'ayKaydirma',  el => +el.value],
    ['yakalamaBekleme',  'ayBekleme',   el => +el.value],
    ['gorselBicimi',     'ayBicim',     el => el.value],
    ['jpegKalitesi',     'ayKalite',    el => +el.value],
    ['yakalamaOneAl',    'ayOneAl',     el => el.checked],
    ['yakalamaKipi',     'ayYakalamaKipi', el => el.value],
    ['kartAraclariGoster','ayKartAraclari', el => el.checked],
    ['ekleKartiGoster',  'ayEkleKarti',     el => el.checked],
    ['yanPanelGoster',   'ayYanPanel',      el => el.checked],
    ['baslikGoster',     'ayBaslikGoster',  el => el.checked],
    ['kartAcilis',       'ayKartAcilis',    el => el.value],
    ['otomatikYedek',    'ayOtoYedek',      el => el.checked],
    ['duvarAcik',        'ayDuvar',        el => el.checked],
    ['metinRengi',       'ayMetinRengi',   el => el.value],
    ['zeminRengi',       'ayZeminRengi',   el => el.value],
    ['baslikBoyut',      'ayBaslikBoyut',  el => +el.value],
    ['filtreAcik',       'ayFiltreAcik',   el => el.checked],
    ['colorize',         'ayColorize',     el => el.checked],
    ['ton',              'ayTon',          el => +el.value],
    ['doygunluk',        'ayDoygunluk',    el => +el.value],
    ['aciklik',          'ayAciklik',      el => +el.value],
    ['golgeRengi',       'ayGolgeRengi',   el => el.value],
    ['isikRengi',        'ayIsikRengi',    el => el.value],
    ['siddet',           'aySiddet',       el => +el.value],
    ['grupIkonRengi',    'ayGrupIkonRengi',  el => el.value],
    ['grupZeminRengi',   'ayGrupZeminRengi',   el => el.value],
    ['grupZeminOpaklik', 'ayGrupZeminOpaklik', el => +el.value],
    ['grupAktifRengi',   'ayGrupAktifRengi',   el => el.value],
    ['grupAktifOpaklik', 'ayGrupAktifOpaklik', el => +el.value],
    ['grupKose',         'ayGrupKose',       el => +el.value],
    ['grupBoyut',        'ayGrupBoyut',      el => +el.value],
    ['grubuHatirla',     'ayGrubuHatirla',   el => el.checked],
    ['simgeRenkA',       'aySimgeA',         el => el.value],
    ['simgeRenkB',       'aySimgeB',         el => el.value],
    ['anaSayfaGoster',   'ayAnaSayfa',       el => el.checked],
    ['kartOrani',        'ayKartOrani',        el => el.value],
    ['gorselYerlesim',   'ayGorselYerlesim',   el => el.value],
    ['maxSutun',         'ayMaxSutun',         el => +el.value],
    ['kartZeminRengi',   'ayKartZemin',        el => el.value],
    ['kartEn',           'ayKartEn',           el => +el.value],
    ['kartKose',         'ayKartKose',         el => +el.value],
    ['kartBoslukYatay',  'ayBoslukYatay',      el => +el.value],
    ['kartBoslukDikey',  'ayBoslukDikey',      el => +el.value],
    ['kartCerceve',      'ayKartCerceve',      el => +el.value],
    ['kartCerceveRengi', 'ayKartCerceveRengi', el => el.value],
    ['kartCerceveHoverRengi','ayKartCerceveHover', el => el.value],
];

// Kaydiriciların yanindaki canli deger etiketleri
const CIKTILAR = {
    ayKaydirma: ['ayKaydirmaDeger', v => v + ' px'],
    ayBekleme:  ['ayBeklemeDeger',  v => (v / 1000).toFixed(1) + ' sn'],
    ayKalite:   ['ayKaliteDeger',   v => v + '%'],
    ayBaslikBoyut: ['ayBaslikBoyutDeger', v => v + 'px'],
    ayTon:       ['ayTonDeger',       v => v],
    ayDoygunluk: ['ayDoygunlukDeger', v => v],
    ayAciklik:   ['ayAciklikDeger',   v => v],
    aySiddet:    ['aySiddetDeger',    v => v + '%'],
    ayKartEn:       ['ayKartEnDeger',       v => v + 'px'],
    ayMaxSutun:     ['ayMaxSutunDeger',     v => (v ? v : c('sinirsiz'))],
    ayKartKose:     ['ayKartKoseDeger',     v => v + 'px'],
    ayBoslukYatay:  ['ayBoslukYatayDeger',  v => v + 'px'],
    ayBoslukDikey:  ['ayBoslukDikeyDeger',  v => v + 'px'],
    ayKartCerceve:  ['ayKartCerceveDeger',  v => v + 'px'],
    ayGrupKose:     ['ayGrupKoseDeger',     v => v + 'px'],
    ayGrupBoyut:    ['ayGrupBoyutDeger',    v => v + '%'],
    ayGrupZeminOpaklik: ['ayGrupZeminOpaklikDeger', v => v + '%'],
    ayGrupAktifOpaklik: ['ayGrupAktifOpaklikDeger', v => v + '%'],
};

// Kart oranlari - yukseklik = genislik * carpan
const ORANLAR = {
    o1610: 0.625,    // 16:10 - dengeli (varsayilan)
    o169:  0.5625,   // 16:9  - genis ekran
    o43:   0.75,     // 4:3   - 1024x768
    okare: 1         // kare
};

export async function ayarPaneliniKur() {
    const panel  = document.getElementById('ayarPanel');
    const perde  = document.getElementById('perde');
    const acBtn  = document.getElementById('ayarBtn');
    const kapat  = document.getElementById('ayarKapat');

    const ayar = await ayarlariAl();

    for (const [anahtar, id] of ALANLAR) {
        const el = document.getElementById(id);
        if (!el) continue;
        // Onay kutusu `value` degil `checked` kullaniyor
        if (el.type === 'checkbox') el.checked = !!ayar[anahtar];
        else el.value = ayar[anahtar];
        ciktiTazele(id);
    }
    gorunumuUygula(ayar);

    // Degisiklikler aninda kaydediliyor - ayri "Kaydet" dugmesi yok
    for (const [anahtar, id, oku] of ALANLAR) {
        const el = document.getElementById(id);
        if (!el) continue;
        // <select> 'input' yerine 'change' tetikler (bazi tarayicilarda
        // 'input' hic gelmiyor). Ikisini de dinliyoruz.
        const olay = el.tagName === 'SELECT' ? 'change' : 'input';
        el.addEventListener(olay, async () => {
            ciktiTazele(id);
            const yeni = await ayarYaz({ [anahtar]: oku(el) });
            gorunumuUygula(yeni);

            // Ana Sayfa gorunurlugu seridin yapisini degistiriyor -
            // CSS yetmez, yeniden cizilmeli
            if (anahtar === 'anaSayfaGoster') {
                // KORUMA: baska grup yoksa gizlenemez - hic grup kalmaz
                // ve kart eklenecek yer bulunamaz
                if (el.checked === false) {
                    const { gruplariAl, kartlariAl } = await import('./yerimi.js');
                    const hepsi = await gruplariAl();

                    // Baska grup yoksa gizlenemez - hic grup kalmaz
                    if (hepsi.length < 2) {
                        el.checked = true;
                        await ayarYaz({ anaSayfaGoster: true });
                        uyar(c('onceEnAzBirGrupOlusturun'));
                        return;
                    }

                    // Kartlari varsa gizliyoruz ama haber veriyoruz
                    const kartlar = await kartlariAl(hepsi[0].id);
                    if (kartlar.length) {
                        uyar(c('anaSayfaGizlendiNKart', kartlar.length));
                    }
                }
                const { arayuzuKur } = await import('./cizim.js');
                await arayuzuKur();
                chrome.runtime.sendMessage({ hedef: 'arkaplan', tur: 'menuTazele' })
                    .catch(() => {});
            }
        });
    }

    // `hidden` yerine sinif: display:none gecisi iptal ediyor, kapanis
    // animasyonu gorunmuyordu.
    const ac  = () => {
        panel.classList.add('acik');
        perde.classList.add('acik');
        document.body.classList.add('ayarAcik');
    };
    const kap = () => {
        panel.classList.remove('acik');
        perde.classList.remove('acik');
        document.body.classList.remove('ayarAcik');
    };

    duvarAraclariniKur();
    yontemSegmentiniKur();
    bolumleriKur();
    grupGosterimSegmenti();
    yedekAraclariniKur();
    depoDurumunuCiz();
    kurulumBolumunuKur();
    simgeAraclariniKur();
    hazirOlculeriKur();

    if (acBtn) acBtn.addEventListener('click', ac);
    if (kapat) kapat.addEventListener('click', kap);
    // Perdeye tiklama paneli kapatir; tiklama alttaki kartlara GECMEZ
    if (perde) perde.addEventListener('click', kap);
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && panel.classList.contains('acik')) kap();
    });
}


/** Gorunum ayarlarini sayfaya uygular. */
function gorunumuUygula(ayar) {
    if (!ayar) return;              // yazma sirasinda null gelebiliyordu
    const kapali = ayar.kartAraclariGoster === false;
    document.body.classList.toggle('araclarKapali', kapali);
    hazirSecimiGoster(ayar.yakalamaEn, ayar.yakalamaBoy);

    // Kart acilis sekli - tiklama isleyicisi bu veriden okuyor
    document.body.dataset.kartAcilis = ayar.kartAcilis || 'ayni';

    const basliklarKapali = ayar.baslikGoster === false;
    document.body.classList.toggle('basliklarKapali', basliklarKapali);
    document.body.classList.toggle('ekleKartiKapali', ayar.ekleKartiGoster === false);
    document.body.classList.toggle('yanPanelKapali', ayar.yanPanelGoster === false);
    // Ipucu basliklarin gorunurluguyle ters calisiyor - anahtar degisince tazele
    for (const a of document.querySelectorAll('.kart:not(.ekleKart)')) {
        const ad = a.querySelector('.kartBaslik')?.textContent || '';
        if (basliklarKapali) a.title = ad;
        else a.removeAttribute('title');
    }

    // --- Kartlar ---
    const kok = document.documentElement.style;
    const en = ayar.kartEn || 250;
    const carpan = ORANLAR[ayar.kartOrani] || ORANLAR.o1610;

    kok.setProperty('--kart-en', en + 'px');
    // Yukseklik ORANDAN: gorsel kutusu en * carpan, baslik ayrica yer kapliyor
    kok.setProperty('--kart-gorsel-boy', Math.round(en * carpan) + 'px');
    // Karusel onizleme ve baska yerler ayni orani kullansin - w/h
    const oranCss = { o1610: '16 / 10', o169: '16 / 9', o43: '4 / 3', okare: '1 / 1' };
    kok.setProperty('--kart-oran', oranCss[ayar.kartOrani] || '16 / 10');
    kok.setProperty('--gorsel-yerlesim', ayar.gorselYerlesim === 'contain' ? 'contain' : 'cover');
    kok.setProperty('--kart-kose', (ayar.kartKose ?? 7) + 'px');
    kok.setProperty('--kart-bosluk-yatay', (ayar.kartBoslukYatay ?? 3) + 'px');
    kok.setProperty('--kart-bosluk-dikey', (ayar.kartBoslukDikey ?? 12) + 'px');
    kok.setProperty('--kart-cerceve', (ayar.kartCerceve ?? 1) + 'px');
    kok.setProperty('--kart-cerceve-rengi', ayar.kartCerceveRengi || '#6a6a6a');
    kok.setProperty('--kart-cerceve-hover', ayar.kartCerceveHoverRengi || '#576a80');
    kok.setProperty('--kart-zemin', ayar.kartZeminRengi || '#22262e');

    // En fazla sutun: izgaranin toplam genisligini siniriyoruz.
    // `grid-template-columns`u sabit sayiya cevirmiyoruz - o, dar ekranda
    // kartlari tasirir. Genislik siniri dar ekranda kendiliginden azalir.
    const sut = ayar.maxSutun || 0;
    if (sut > 0) {
        const yatay = ayar.kartBoslukYatay ?? 3;
        kok.setProperty('--izgara-en',
            `calc(${sut} * ${en}px + ${sut - 1} * ${yatay}px)`);
    } else {
        kok.setProperty('--izgara-en', 'none');
    }

    // Grup seridi gorunumu
    document.documentElement.style.setProperty('--grup-ikon-rengi', ayar.grupIkonRengi || '#9db4cc');
    // Renk kutusu alfa TASIMIYOR (input[type=color] alfa desteklemiyor).
    // Rengi ve saydamligi ayri alip rgba'ya burada ceviriyoruz.
    document.documentElement.style.setProperty('--grup-zemin',
        rgba(ayar.grupZeminRengi || '#ffffff', ayar.grupZeminOpaklik ?? 6));
    document.documentElement.style.setProperty('--grup-aktif-rengi',
        rgba(ayar.grupAktifRengi || '#576a80', ayar.grupAktifOpaklik ?? 100));

    // ARAYUZUN VURGU RENGI de aktif grup renginden geliyor: dugmeler,
    // secili ogeler, kaydiricilar hep ayni tonda olsun.
    //
    // Saydamligi ALMIYORUZ - sekmede saydam zemin duvar kagidini
    // gosteriyor, ama dugmede okunaksizliga yol aciyor.
    const vurgu = ayar.grupAktifRengi || '#576a80';
    document.documentElement.style.setProperty('--vurgu', vurgu);
    document.documentElement.style.setProperty('--vurgu-parlak', acikTon(vurgu, 18));
    document.documentElement.style.setProperty('--grup-kose', (ayar.grupKose ?? 9) + 'px');
    // Tek olcek: yazi, ikon ve dolgu birlikte buyuyup kuculuyor
    document.documentElement.style.setProperty('--grup-olcek', (ayar.grupBoyut ?? 100) / 100);

    const mod = ayar.grupGosterim || 'ikon_yazi';
    document.body.classList.toggle('grupModIkon', mod === 'ikon');
    document.body.classList.toggle('grupModYazi', mod === 'yazi');

    for (const b of document.querySelectorAll('#ayGrupGosterim .segBtn')) {
        b.classList.toggle('secili', b.dataset.deger === mod);
    }

    // Metin rengi ve baslik boyutu - kok degiskenler uzerinden
    document.documentElement.style.setProperty('--metin', ayar.metinRengi || '#e8eaed');
    document.documentElement.style.setProperty('--baslik-boyut', (ayar.baslikBoyut || 13) + 'px');

    // Duvar kagidi
    const katman = document.getElementById('zeminKatmani');
    const gorsel = document.getElementById('zeminGorsel');
    const duvarKapali = ayar.duvarAcik === false;

    if (katman && gorsel) {
        if (duvarKapali) {
            // Kapaliyken duz renk - kullanicinin sectigi zemin rengi
            katman.style.display = 'none';
            document.documentElement.style.background = ayar.zeminRengi || '#14161a';
        } else {
            katman.style.display = '';
            document.documentElement.style.background = '';
            if (ayar.duvarGorsel) {
                gorsel.src = ayar.duvarGorsel;
                gorsel.style.display = '';
                katman.style.background = '';
            } else {
                // Gorsel yoksa gradyan: <img> gizlenip kaba arka plan veriliyor
                gorsel.removeAttribute('src');
                gorsel.style.display = 'none';
                katman.style.background = VARSAYILAN_DUVAR;
            }
        }
    }

    // Duvar kapaliyken onizleme/araclar anlamsiz, renk satiri anlamli
    const duvarKutu  = document.getElementById('ayDuvarKutu');
    const zeminSatir = document.getElementById('ayZeminSatir');
    if (duvarKutu) {
        if (duvarKapali) duvarKutu.setAttribute('hidden', '');
        else             duvarKutu.removeAttribute('hidden');
    }

    // Renklendirme yalnizca duvar kagidi ACIKKEN anlamli:
    // duz renk zeminde uygulanacak bir goruntu yok.
    const renkKutu = document.getElementById('ayRenklendirmeKutu');
    if (renkKutu) {
        if (duvarKapali) renkKutu.setAttribute('hidden', '');
        else             renkKutu.removeAttribute('hidden');
    }
    if (zeminSatir) {
        if (duvarKapali) zeminSatir.removeAttribute('hidden');
        else             zeminSatir.setAttribute('hidden', '');
    }

    // --- Zemin renklendirme ---
    // Filtre TEK yerden: filtreZinciri iki kipi de kendisi ayirt ediyor.
    document.documentElement.style.setProperty('--zemin-filtre', filtreZinciri(ayar));

    const iki   = ikiRenkKatmanlari(ayar);
    const golge = document.getElementById('boyaGolge');
    const isik  = document.getElementById('boyaIsik');
    if (golge && isik) {
        if (iki.acik) {
            golge.style.backgroundColor = iki.golge;
            isik.style.backgroundColor  = iki.isik;
            golge.style.opacity = iki.opaklik;
            isik.style.opacity  = iki.opaklik * 0.85;
        } else {
            golge.style.opacity = 0;
            isik.style.opacity  = 0;
        }
    }

    // Yontem kutulari
    const filtreKutu = document.getElementById('ayFiltreKutu');
    if (filtreKutu) filtreKutu.hidden = !ayar.filtreAcik;
    const tonKutu = document.getElementById('ayTonKutu');
    const ikiKutu = document.getElementById('ayIkiKutu');
    if (tonKutu) tonKutu.hidden = ayar.filtreYontemi !== 'ton';
    if (ikiKutu) ikiKutu.hidden = ayar.filtreYontemi !== 'iki';

    for (const b of document.querySelectorAll('#ayYontemSegment .segBtn')) {
        b.classList.toggle('secili', b.dataset.deger === ayar.filtreYontemi);
    }

    // Panel onizlemesi
    const onizleme = document.getElementById('ayDuvarOnizleme');
    if (onizleme) {
        onizleme.style.backgroundImage = ayar.duvarGorsel
            ? `url('${ayar.duvarGorsel}')`
            : VARSAYILAN_DUVAR;
    }
}

/** Duvar kagidi secimi. */
/** Katlanabilir bolumler - ayni anda tek bolum acik. */
function bolumleriKur() {
    for (const bas of document.querySelectorAll('.bolumBaslik')) {
        bas.addEventListener('click', () => {
            const bolum = bas.closest('.bolum');
            const zatenAcik = bolum.classList.contains('acik');

            // Akordeon: digerlerini kapat. Panel uzun oldugu icin hepsi
            // acik kalinca aranan ayar kayboluyor.
            for (const b of document.querySelectorAll('.bolum')) {
                b.classList.remove('acik');
            }
            if (!zatenAcik) bolum.classList.add('acik');
        });
    }
}

/** Grup seridi gosterim modu segmenti. */
/** Yedekleme araclari. */
/** Anasayfa kurulumu - eklentinin kendi adresini gosterip kopyalatiyor. */
/** Uzanti simgesi renkleri - varsayilana donus. */
/** Hazir ekran goruntusu olculeri. */
const ASAMA_ADI = {
    baslangic: 'Dosya okunuyor',
    temizlik:  'Mevcut veriler siliniyor',
    gorseller: c('gorsellerYaziliyor'),
    kartlar:   'Kartlar ekleniyor',
    siliniyor: 'Kartlar siliniyor',
    depo:      c('gorsellerVeAyarlarSiliniyor'),
    bitti:     c('tamamlandi')
};

/** Ice aktarma ilerleme penceresini gunceller. */
function ilerlemeCiz({ asama, yapilan, toplam, ad }) {
    const metin = document.getElementById('ilerlemeMetin');
    const dolgu = document.getElementById('ilerlemeDolgu');
    const sayi  = document.getElementById('ilerlemeSayi');
    if (!metin || !dolgu) return;

    metin.textContent = ASAMA_ADI[asama] || '';
    // Grup adi varsa hangi gruptayiz onu da goster
    if ((asama === 'kartlar' || asama === 'siliniyor') && ad) {
        metin.textContent += ` — ${ad}`;
    }

    // Kart sayisi bilinmeyen asamalarda cubuk belirsiz kalmasin:
    // hazirlik adimlarina kucuk sabit paylar veriyoruz
    let oran;
    if (asama === 'bitti') oran = 100;
    else if (!toplam) oran = asama === 'baslangic' ? 4 : 8;
    else oran = 10 + Math.round((yapilan / toplam) * 90);

    dolgu.style.width = Math.min(100, oran) + '%';
    sayi.textContent = toplam ? `${yapilan} / ${toplam} kart` : '';
}

function hazirOlculeriKur() {
    for (const b of document.querySelectorAll('#ayHazirOlcu .segBtn')) {
        b.addEventListener('click', async () => {
            const en = +b.dataset.en, boy = +b.dataset.boy;
            document.getElementById('ayEn').value = en;
            document.getElementById('ayBoy').value = boy;
            gorunumuUygula(await ayarYaz({ yakalamaEn: en, yakalamaBoy: boy }));
            hazirSecimiGoster(en, boy);
        });
    }
}

/** Mevcut olcu hazir bir degerle esitse o dugme isaretlenir. */
function hazirSecimiGoster(en, boy) {
    for (const b of document.querySelectorAll('#ayHazirOlcu .segBtn')) {
        b.classList.toggle('secili', +b.dataset.en === en && +b.dataset.boy === boy);
    }
}

function simgeAraclariniKur() {
    document.getElementById('aySimgeSifirla')?.addEventListener('click', async () => {
        const varsayilan = { simgeRenkA: '#5d93c2', simgeRenkB: '#a8c8e4' };
        const yeni = await ayarYaz(varsayilan);
        document.getElementById('aySimgeA').value = varsayilan.simgeRenkA;
        document.getElementById('aySimgeB').value = varsayilan.simgeRenkB;
        gorunumuUygula(yeni);
        uyar(c('simgeRenkleriSifirlandi'));
    });
}

function kurulumBolumunuKur() {
    const adres = chrome.runtime.getURL('index.html');
    const kutu = document.getElementById('kurulumAdres');
    if (kutu) kutu.textContent = adres;

    document.getElementById('kurulumKopyala')?.addEventListener('click', async e => {
        const dugme = e.currentTarget;
        try {
            await navigator.clipboard.writeText(adres);
            // Geri bildirimi dugmenin uzerinde veriyoruz: kullanicinin
            // gozu zaten orada, ekranin altindaki bildirimi kacirabilir
            const eski = dugme.textContent;
            dugme.textContent = c('kopyalandi');
            setTimeout(() => { dugme.textContent = eski; }, 1600);
        } catch (err) {
            uyar(c('kopyalanamadiElleSecin'));
        }
    });
}

/** Bakim bolumundeki depolama ozeti. */
async function depoDurumunuCiz() {
    const d = await depoDurumu();

    const yaz = (id, m) => { const e = document.getElementById(id); if (e) e.textContent = m; };
    // "kart" degil "gorsel": sayilan sey depodaki gorsel kaydi,
    // silinmis kartlarinki de burada
    const canli = d.gorselAdet - d.oksuzAdet;
    yaz('depoGorsel', `${mb(d.gorselBayt)}  (${c('nGorsel', canli)})`);
    yaz('depoDiger', mb(d.digerBayt));

    // Satir HER ZAMAN gorunuyor: "yok" bilgisi de degerli, kullanici
    // temizlige gerek olup olmadigini goruyor
    const oksuzSatir = document.getElementById('depoOksuzSatir');
    if (oksuzSatir) {
        oksuzSatir.hidden = false;
        if (!d.oksuzSayildi) yaz('depoOksuz', c('sayilamadi'));
        else if (d.oksuzAdet > 0) yaz('depoOksuz', `${mb(d.oksuzBayt)}  (${d.oksuzAdet} adet)`);
        else yaz('depoOksuz', 'yok');
        oksuzSatir.classList.toggle('vurgulu', d.oksuzAdet > 0);
    }

    const satir = document.getElementById('depoAyrilanSatir');
    const dolgu = document.getElementById('depoDolgu');
    const uyari = document.getElementById('depoUyari');
    if (!dolgu) return;

    if (d.ayrilan) {
        satir.hidden = false;
        yaz('depoAyrilan', `${mb(d.kullanilan)} / ${mb(d.ayrilan)}`);
        const yuzde = Math.min(100, Math.round(d.oran * 100));
        dolgu.style.width = yuzde + '%';
        dolgu.classList.toggle('dolmak-uzere', d.oran >= UYARI_ESIGI && d.oran < 0.95);
        dolgu.classList.toggle('dolu', d.oran >= 0.95);

        const yedekBtn = document.getElementById('depoYedekAl');

        if (d.oran >= 1) {
            // Tavan asildi - yazma her an basarisiz olabilir
            uyari.hidden = false;
            uyari.classList.add('kritik');
            uyari.textContent = c('ayrilanAlanDoldu');
            if (yedekBtn) yedekBtn.hidden = false;
        } else if (d.oran >= UYARI_ESIGI) {
            uyari.hidden = false;
            uyari.classList.remove('kritik');
            uyari.textContent = c('depoDoluUyari', yuzde) +
                c('yedekAlipTemizlemenizOnerilir');
            if (yedekBtn) yedekBtn.hidden = false;
        } else {
            uyari.hidden = true;
            uyari.classList.remove('kritik');
            if (yedekBtn) yedekBtn.hidden = true;
        }
    } else {
        // Tarayici ayrilan alani bildirmiyorsa cubuk yaniltici olur
        satir.hidden = true;
        dolgu.style.width = '0';
        uyari.hidden = true;
    }

    // Son yedek bilgisi - hangi dosya, ne zaman
    const { sonYedekBilgisi } = await import('./yedek.js');
    const { tarihMetni } = await import('./sayac.js');
    const y = await sonYedekBilgisi();
    const el2 = document.getElementById('sonYedek');
    if (el2) {
        if (y) {
            el2.hidden = false;
            el2.textContent = c('sonYedekBilgisi', y.dosya, tarihMetni(y.tarih), y.kart, mb(y.boyut));
        } else {
            el2.hidden = true;
        }
    }
}

function yedekAraclariniKur() {
    const bildir = m => {
        const b = document.getElementById('bildirim');
        if (!b) return;
        b.textContent = m;
        b.classList.add('gorunur');
        setTimeout(() => b.classList.remove('gorunur'), 3200);
    };

    document.getElementById('ayYedekAl')?.addEventListener('click', async () => {
        try {
            const s = await yedegiIndir();
            bildir(c('nGrupNKartYedeklendi', s.grup, s.kart, s.dosya));
            depoDurumunuCiz();
        } catch (e) {
            console.log('[WSD] yedek alinamadi:', e);
            bildir(c('yedekAlinamadi'));
        }
    });

    // Bakim bolumundeki acil yedek dugmesi
    document.getElementById('depoYedekAl')?.addEventListener('click', async () => {
        try {
            const s = await yedegiIndir();
            bildir(c('yedekAlindiDosya', s.dosya));
            depoDurumunuCiz();
        } catch (e) {
            bildir(c('yedekAlinamadi'));
        }
    });

    document.getElementById('ayHtmlCikti')?.addEventListener('click', async () => {
        try {
            bildir(c('htmlHazirlaniyor'));
            const { htmlIndir } = await import('./htmlcikti.js');
            const s = await htmlIndir();
            bildir(`HTML indirildi (${(s.boyut / 1048576).toFixed(1)} MB)`);
        } catch (e) {
            console.log('[WSD] html uretilemedi:', e);
            bildir(c('htmlOlusturulamadi'));
        }
    });

    const secici = document.getElementById('ayYedekSecici');
    document.getElementById('ayYedekYukle')?.addEventListener('click', () => secici?.click());

    secici?.addEventListener('change', async e => {
        const dosya = e.target.files && e.target.files[0];
        e.target.value = '';
        if (!dosya) return;

        // Mevcut veriyi silmek geri alinamaz - acikca soruyoruz
        const temizle = await onaySor({
            baslik: c('yedektenYukleBd'),
            metin: c('mevcutGruplarSilinsinMiHayirDerseniz'),
            evet: c('silVeYukle'), hayir: c('ekle'), tehlikeli: true
        });

        const pencere = document.getElementById('ilerlemePencere');
        try {
            const metin = await dosya.text();

            pencere.hidden = false;
            document.getElementById('perde')?.classList.add('acik');
            ilerlemeCiz({ asama: 'baslangic', yapilan: 0, toplam: 0, ad: 'Dosya okunuyor' });

            const s = await yedegiYukle(JSON.parse(metin), temizle, ilerlemeCiz);

            bildir(c('nGrupNKartYuklendi', s.grup, s.kart));
            setTimeout(() => location.reload(), 900);
        } catch (err) {
            pencere.hidden = true;
            document.getElementById('perde')?.classList.remove('acik');
            console.log('[WSD] yedek yuklenemedi:', err);
            bildir(c('yedekYuklenemedi') + (err.message || ''));
        }
    });

    document.getElementById('ayCopAc')?.addEventListener('click', async () => {
        const { copPenceresiniAc } = await import('./etkilesim.js');
        await copPenceresiniAc();
    });

    document.getElementById('ayKuyrukTemizle')?.addEventListener('click', () => {
        chrome.runtime.sendMessage({ hedef: 'arkaplan', tur: 'kuyrugaTemizle' })
            .catch(() => {});
        bildir(c('bekleyenYakalamalarIptalEdiliyor'));
    });

    document.getElementById('ayDenetle')?.addEventListener('click', async () => {
        const { denetle, raporHTML } = await import('./denetim.js');
        const kutu = document.getElementById('denetimRapor');
        kutu.textContent = '...';
        document.getElementById('denetimPencere').hidden = false;
        kutu.innerHTML = raporHTML(await denetle());

        // Rapordaki eylem dugmeleri - kutu her cizildiginde yenileniyor,
        // dinleyici KAP uzerinde
        kutu.onclick = async e => {
            const d = e.target.closest('.dnDugme');
            if (!d) return;
            document.getElementById('denetimPencere').hidden = true;
            if (d.dataset.git === 'yinelenenler') {
                const { kopyaEkraniniAc } = await import('./kopyalar.js');
                await kopyaEkraniniAc();
            }
        };
    });

    document.getElementById('denetimKapat')?.addEventListener('click', () => {
        document.getElementById('denetimPencere').hidden = true;
    });

    document.getElementById('ayOnaylariGeri')?.addEventListener('click', async () => {
        const n = await onaylariGeriGetir();
        bildir(n ? `${n} onay sorusu geri getirildi` : c('kapatilmisOnaySorusuYok'));
    });

    document.getElementById('ayAyarSifirla')?.addEventListener('click', async () => {
        if (!await onaySor({
            baslik: c('ayarlariSifirlaBd'),
            metin: c('tumGorunumVeDavranisAyarlariVarsayilana') +
                   c('kartlarinizaDokunulmaz'),
            evet: c('sifirla')
        })) return;

        try {
            await ayarlariSifirla();
            bildir(c('ayarlarSifirlandi'));
            setTimeout(() => location.reload(), 800);
        } catch (e) {
            console.log('[WSD] ayarlar sifirlanamadi:', e);
            bildir(c('sifirlanamadi'));
        }
    });

    document.getElementById('ayHepsiniSil')?.addEventListener('click', async () => {
        // IKI KADEMELI onay: bu islem geri alinamiyor ve cop kutusuna
        // da dusmuyor. Once uyari, sonra "SIL" yazdirma.
        if (!await onaySor({
            baslik: c('tumVerileriSilBd'),
            metin: c('butunGruplarKartlarGorsellerNotlarVe') +
                   c('kaliciSilinecekCopeGitmez'),
            evet: c('devam'), tehlikeli: true
        })) return;

        const { metinSor } = await import('./onay.js');
        const dogrulama = await metinSor({
            baslik: c('eminMisiniz'),
            metin: c('onaylamakIcinSilYazin'),
            evet: c('sil')
        });
        if (!dogrulama || dogrulama.toLocaleUpperCase('tr') !== c('silOnayKelimesi')) {
            return bildir(c('iptalEdildi'));
        }

        const pencere = document.getElementById('ilerlemePencere');
        try {
            document.getElementById('ilerlemeBaslik').textContent = 'Veriler Siliniyor';
            pencere.hidden = false;
            document.getElementById('perde')?.classList.add('acik');
            ilerlemeCiz({ asama: 'siliniyor', yapilan: 0, toplam: 0, ad: '' });

            const s = await herSeyiSil(ilerlemeCiz);
            ilerlemeCiz({ asama: 'bitti', yapilan: 1, toplam: 1, ad: '' });

            bildir(c('nGrupNKartSilindi', s.grup, s.kart));
            setTimeout(() => location.reload(), 1200);
        } catch (e) {
            pencere.hidden = true;
            document.getElementById('perde')?.classList.remove('acik');
            console.log('[WSD] veriler silinemedi:', e);
            bildir(c('silinemedi'));
        }
    });

    document.getElementById('ayTemizle')?.addEventListener('click', async () => {
        const s = await oksuzleriTemizle();
        if (s.iptal) return bildir(c('temizlikAtlandi'));
        if (!s.gorsel && !s.kayit) return bildir(c('temizlenecekVeriYok'));
        const kazanc = s.bayt / 1048576;
        bildir(c('nGorselTemizlendi', s.gorsel) +
               (kazanc >= 0.05 ? ` (${kazanc.toFixed(1)} MB)` : ''));
    });
}

function grupGosterimSegmenti() {
    for (const b of document.querySelectorAll('#ayGrupGosterim .segBtn')) {
        b.addEventListener('click', async () => {
            gorunumuUygula(await ayarYaz({ grupGosterim: b.dataset.deger }));
        });
    }
}

function yontemSegmentiniKur() {
    for (const b of document.querySelectorAll('#ayYontemSegment .segBtn')) {
        b.addEventListener('click', async () => {
            gorunumuUygula(await ayarYaz({ filtreYontemi: b.dataset.deger }));
        });
    }
}

function duvarAraclariniKur() {
    const secici = document.getElementById('ayDuvarSecici');

    // Onizlemeye tiklamak dosya seciciyi aciyor
    document.getElementById('ayDuvarOnizleme')
        ?.addEventListener('click', () => secici?.click());

    document.getElementById('ayDuvarSil')?.addEventListener('click', async () => {
        gorunumuUygula(await ayarYaz({ duvarGorsel: null }));
    });

    secici?.addEventListener('change', async e => {
        const dosya = e.target.files && e.target.files[0];
        e.target.value = '';
        if (!dosya) return;
        try {
            // KUCULTME YOK: kullanici ne sectiyse o kalir. Depoda
            // `unlimitedStorage` var, boyut kaygisi yok.
            const veri = await dosyayiOku(dosya);

            const yeni = await ayarYaz({ duvarGorsel: veri, duvarAcik: true });
            document.getElementById('ayDuvar').checked = true;

            // Onizlemeyi ve sayfayi ayni anda tazele
            gorunumuUygula(yeni);
        } catch (err) {
            console.log('[WSD] duvar kagidi uygulanamadi:', err);
        }
    });
}

function dosyayiOku(dosya) {
    return new Promise((coz, red) => {
        const o = new FileReader();
        o.onload  = () => coz(o.result);
        o.onerror = () => red(new Error('okunamadi'));
        o.readAsDataURL(dosya);
    });
}


/** '#rrggbb' + yuzde -> 'rgba(r, g, b, a)' */
/** Panelde kisa uyari - bildirim seridini kullaniyor. */
function uyar(metin) {
    const b = document.getElementById('bildirim');
    if (!b) return;
    b.textContent = metin;
    b.classList.add('gorunur');
    setTimeout(() => b.classList.remove('gorunur'), 3000);
}

/** Rengi verilen yuzde kadar aciyor - hover/vurgu tonlari icin. */
function acikTon(hex, yuzde) {
    const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(String(hex).trim());
    if (!m) return hex;
    const [r, g, b] = m.slice(1).map(h => parseInt(h, 16));
    const ac = v => Math.round(v + (255 - v) * (yuzde / 100));
    return '#' + [ac(r), ac(g), ac(b)].map(v => v.toString(16).padStart(2, '0')).join('');
}

function rgba(hex, yuzde) {
    const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(String(hex).trim());
    if (!m) return hex;
    const [r, g, b] = m.slice(1).map(h => parseInt(h, 16));
    return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(100, yuzde)) / 100})`;
}

function ciktiTazele(id) {
    const tanim = CIKTILAR[id];
    if (!tanim) return;
    const el  = document.getElementById(id);
    const hedef = document.getElementById(tanim[0]);
    if (el && hedef) hedef.textContent = tanim[1](+el.value);
}
