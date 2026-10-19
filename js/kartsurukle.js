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

import { c } from './dil.js';
// WSD Speed Dial - kart surukleme
//
// === BIRAKINCA SIRALAMA ===
// Surukleme sirasinda DOM'da HICBIR SEY oynamiyor. Sebep: kart suruklenirken
// digerleri surekli kayarsa, kullanici karti grup seridine goturene kadar
// sira zaten bozulmus oluyor. FVD'de de surukleme sirasinda hicbir sey
// oynamaz; yalnizca araya girilecek yer isaretlenir, tasima BIRAKILINCA olur.
//
// Hedef `surukHedefi`nde tutuluyor ve yalnizca birakma aninda uygulaniyor.



let surukKart = null;          // suruklenen kart

/** disbirak.js ic suruklemeyi bundan anliyor. */
export function icSuruklemeVarMi() { return surukKart !== null; }
let surukHedefi = null;        // { kart, sonrasina } - araya girilecek yer
let hayalet = null;            // imleci takip eden kopya
let hedefGrupId = null;        // grup sekmesi uzerindeysek
let klasorHedefId = null;      // klasor kutusu / yol seridi uzerindeysek (1.5.0)
let kaynakUzerinde = false;    // imlec kendi yerinin uzerinde mi (vazgecme)

const GHOST_OFSET = { x: 0, y: 0 };

// YAYLI KLASOR (1.5.5; 1.5.6 itibariyla kalici): kart suruklenirken bir klasor kutusu,
// yol seridindeki bir ad ya da grup sekmesi uzerinde YAYLI_MS beklenirse
// o klasor surukleme BIRAKILMADAN acilir. Ornek: "1" klasorundeyken kardes
// "fx" klasorune tasimak icin yolda "LTS" uzerinde beklenir, LTS acilir,
// kart fx kutusuna birakilir. Tasi penceresine gerek kalmaz.
//
// Ekran yeniden cizilirken suruklenen kart DOM'dan kalkarsa tarayici
// dragend'i kimseye ulastiramiyor ve surukleme yarim kaliyordu; kart
// bu yuzden once gorunmez bir TUTUCUya aliniyor.
const YAYLI_MS = 700;
let yayliId = null;
let yayliEl = null;
let yayliZaman = null;
let yayliAcar = null;          // kartSuruklemeKur'da baglaniyor
let tutucu = null;

function yayliKur(id, el) {
    if (!id || yayliId === id) return;
    yayliIptal();
    yayliId = id;
    yayliEl = el;
    el?.classList.add('yayliBekliyor');
    yayliZaman = setTimeout(() => { const h = yayliId; yayliIptal(); if (h && yayliAcar) yayliAcar(h); }, YAYLI_MS);
}

function yayliIptal() {
    clearTimeout(yayliZaman);
    yayliZaman = null;
    yayliEl?.classList.remove('yayliBekliyor');
    yayliEl = null;
    yayliId = null;
}

function tutucudaMi() {
    return !!(tutucu && surukKart && surukKart.parentNode === tutucu);
}

/** Kart alani ya da sayfanin hicbir ogeye ait olmayan zemini. */
function bosYerMi(el) {
    if (!el) return false;
    if (el === document.body || el === document.documentElement) return true;
    return !!el.closest?.('#kartAlani');
}

/** Suruklenen karti gorunmez tutucuya alir: ekran yenilense de DOM'da kalsin. */
function kartiTut(kart) {
    if (!kart) return;
    if (!tutucu) {
        tutucu = document.createElement('div');
        tutucu.id = 'surukTutucu';
        tutucu.style.cssText = 'position:fixed;left:-9999px;top:0;width:1px;height:1px;overflow:hidden;';
        document.body.appendChild(tutucu);
    }
    if (kart.parentNode !== tutucu) tutucu.appendChild(kart);
}

// Son imlec konumu. Birakma aninda hedef kaydi bos kalirsa buradan
// YENIDEN hesapliyoruz: hizli hareket ya da olay sirasi yuzunden son
// dragover kartin uzerine denk gelmeyebiliyor ve tasima kaciyordu.
let sonKonum = { x: 0, y: 0 };

export function kartSuruklemeKur({ aktifGrup, yenile, bildir }) {
    const kap = document.getElementById('kartKabi');
    const serit = document.getElementById('grupSeridi');
    if (!kap) return;

    yayliAcar = async id => {
        if (!surukKart || id === aktifGrup()) return;
        kartiTut(surukKart);
        try {
            const { grubuAc } = await import('./cizim.js');
            await grubuAc(id);
        } catch (e) { console.log('[WSD] yayli klasor acilamadi:', e); }
        // Yeni ekranda hedefler sifirdan hesaplanacak
        klasorHedefId = null;
        hedefGrupId = null;
        surukHedefi = null;
        sekmeIsaretiniTemizle();
        isaretiTemizle();
    };

    kap.addEventListener('dragstart', e => {
        const kart = e.target.closest('.kart:not(.ekleKart)');
        if (!kart) return;

        islendi = false;
        surukKart = kart;
        surukHedefi = null;
        hedefGrupId = null;
        klasorHedefId = null;
        kaynakUzerinde = false;

        kart.classList.add('surukKaynak');

        // Yerel surukleme goruntusunu GIZLE: donduktan sonra degistirilemiyor,
        // bu yuzden hedefe gelince saydamlastiramiyoruz. Kendi hayaletimizi
        // ciziyoruz ki durum degistikce gorunumu de degissin.
        const bos = new Image();
        bos.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        e.dataTransfer.setDragImage(bos, 0, 0);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', kart.dataset.kartId);

        hayaletOlustur(kart, e);
    });

    // HEM drop HEM dragend dinleniyor.
    // `drop` hedefte, `dragend` kaynakta tetikleniyor ve tarayiciya gore
    // sirasi degisebiliyor; biri kacarsa digeri isi yapiyor. `islendi`
    // bayragi ikisinin birden calismasini engelliyor.
    kap.addEventListener('drop', async e => {
        e.preventDefault();
        e.stopPropagation();
        await birak({ aktifGrup, yenile, bildir }, { x: e.clientX, y: e.clientY }, true);
    });

    document.getElementById('grupSeridi')?.addEventListener('drop', async e => {
        e.preventDefault();
        e.stopPropagation();
        await birak({ aktifGrup, yenile, bildir }, { x: e.clientX, y: e.clientY });
    });

    // dragend kaynak kartta tetikleniyor; yayli klasorle ekran degismisse
    // kart tutucuda (kabin disinda) - bu yuzden belge duzeyinde dinleniyor
    document.addEventListener('dragend', async () => {
        if (!surukKart) return;
        await birak({ aktifGrup, yenile, bildir });
    });

    // Imlec konumu - hayaleti tasi ve vazgecmeyi yakala
    document.addEventListener('dragover', e => {
        if (!surukKart) return;
        e.preventDefault();
        sonKonum = { x: e.clientX, y: e.clientY };
        hayaletiKonumla(e.clientX, e.clientY);

        // Hedef HER HAREKETTE yeniden hesaplaniyor.
        // Once yalnizca kart uzerindeyken yaziliyordu; imlec uzaklasinca
        // eski hedef hem turuncu kaliyor hem de birakinca uygulanıyordu.
        hedefiTazele(e.clientX, e.clientY);
    }, true);

    // Kap uzerinde surukleme: drop'un tetiklenebilmesi icin gerekli
    kap.addEventListener('dragover', e => {
        if (surukKart) e.preventDefault();
    });

    // Grup sekmesi uzerinde: karti o gruba tasi
    serit?.addEventListener('dragover', e => {
        if (!surukKart) return;
        const sekme = e.target.closest('.grupSekme');
        if (!sekme) return;
        e.preventDefault();

        hedefGrupId = sekme.dataset.grupId;
        surukHedefi = null;
        isaretiTemizle();
        sekmeIsaretle(sekme);
        hayaletiHedefteIsaretle(true);
        yayliKur(sekme.dataset.grupId, sekme);
    });

    serit?.addEventListener('dragleave', e => {
        if (!surukKart) return;
        if (e.target.closest('.grupSekme')) {
            hedefGrupId = null;
            sekmeIsaretiniTemizle();
            hayaletiHedefteIsaretle(false);
            yayliIptal();
        }
    });

    // Kabin/seridin disina birakma - sadece temizle.
    // Yayli klasorle gelinmisse sayfanin bos yeri de "buraya koy" demek
    // (kart alani kisa ya da klasor bossa kabin disina dusuluyor).
    document.addEventListener('drop', async e => {
        e.preventDefault();
        if (tutucudaMi() && bosYerMi(e.target)) {
            await birak({ aktifGrup, yenile, bildir }, { x: e.clientX, y: e.clientY }, true);
        }
    });
}

/* ---------- Birakma ---------- */

let islendi = false;

async function birak({ aktifGrup, yenile, bildir }, konum = null, kabaBirakildi = false) {
    if (islendi) return;
    // Kendi tasimamiz yer imi olayi uretiyor - otomatik tazeleme
    // araya girip DOM'u yeniden cizmesin
    import('./arayuz.js').then(m => m.tazelemeyiBastir(2000)).catch(() => {});
    if (!surukKart) return;
    // Kilit BIR SONRAKI dragstart'ta aciliyor. Zamanlayiciyla acmak
    // riskli: drop ve dragend cok yakin geliyor, erken acilirsa is iki
    // kez yapiliyor.
    islendi = true;

    if (konum) sonKonum = konum;
    const kart = surukKart;
    // Hedef kaydini YEREL degiskene aliyoruz: temizlik globali sifirliyor
    let hedefKaydi = surukHedefi;
    const grupHedefi = hedefGrupId || klasorHedefId;
    // Yayli klasorle yeni klasore gecilmis mi (kart tutucuda bekliyor)
    const tutucuda = !!(tutucu && kart && kart.parentNode === tutucu);

    // YEDEK YOL: kayit bos ama imlec bir kartin uzerindeyse hedefi
    // son konumdan hesapla. Kayit, hizli harekette ya da olay sirasi
    // yuzunden bos kalabiliyordu ve tasima sessizce kaciyordu.
    if (!hedefKaydi && !grupHedefi && !kaynakUzerinde && kart) {
        hedefKaydi = konumdanHedef(sonKonum.x, sonKonum.y, kart);
    }

    temizle();
    if (!kart) return;

    try {
        // 1) Baska gruba tasima
        if (grupHedefi && grupHedefi !== aktifGrup()) {
            await chrome.bookmarks.move(kart.dataset.kartId, { parentId: grupHedefi });
            await yenile();
            bildir(c('kartTasindi'));
            return;
        }

        // 1b) Yayli klasorle acilan klasorde BOS yere birakildi: sona ekle
        if (tutucuda && !hedefKaydi && kabaBirakildi) {
            await chrome.bookmarks.move(kart.dataset.kartId, { parentId: aktifGrup() });
            await yenile();
            bildir(c('kartTasindi'));
            return;
        }

        // 2) Ayni klasorde siralama
        const kap = document.getElementById('kartKabi');
        const eskiIndex = [...kap.querySelectorAll('.kart:not(.ekleKart)')].indexOf(kart);

        // DOM'a SIMDI yerlestiriyoruz (surukleme boyunca hicbir sey oynamadi)
        if (!hedefeYerlestir(kart, hedefKaydi)) return;   // hedef yok = vazgecildi

        let yeniIndex = [...kap.querySelectorAll('.kart:not(.ekleKart)')].indexOf(kart);

        // KOMSU KART TUZAGI: kart 2, hedef 3 ve imlec hedefin SOL yarisinda
        // ise "hedefin onune koy" karti yine 2'de birakiyor - hicbir sey
        // degismiyor. Kullanici turuncuyu gorup biraktigi icin "kacirdi"
        // saniyor. Hedefin uzerine birakildiysa MUTLAKA yer degissin:
        // sonuc ayniysa ters tarafa koyuyoruz.
        if (yeniIndex === eskiIndex && hedefKaydi) {
            hedefeYerlestir(kart, { kart: hedefKaydi.kart, sonrasina: !hedefKaydi.sonrasina });
            yeniIndex = [...kap.querySelectorAll('.kart:not(.ekleKart)')].indexOf(kart);
        }

        if (yeniIndex < 0 || yeniIndex === eskiIndex) return;

        // Chrome'un ayni klasor icindeki `move` indeks yorumu tahmin
        // edilebilir degil: bazen kaynak cikarilmadan onceki listeye,
        // bazen sonrasina gore davraniyor ve kart bir eksik/fazla yere
        // dusuyordu. Tahmin yerine DOGRULUYORUZ: tasi, gercek sonucu oku,
        // tutmadiysa bir kez duzelt.
        const grupId = aktifGrup();
        const kartId = kart.dataset.kartId;

        // KART SIRASI -> YER IMI SIRASI. Klasorde alt klasorler de varsa
        // yer imi indeksi kart sirasiyla ayni degil (klasorler ekranda
        // once ciziliyor ama yer iminde araya karisik olabilir).
        const hedefIndex = await gercekIndeks(grupId, kartId, yeniIndex);
        await chrome.bookmarks.move(kartId, { parentId: grupId, index: hedefIndex });

        const gercek = await sirayiOku(grupId, kartId);
        if (gercek !== yeniIndex && gercek >= 0) {
            // Sapma yonune gore telafi et
            const duzeltme = hedefIndex + (yeniIndex - gercek);
            await chrome.bookmarks.move(kartId, {
                parentId: grupId,
                index: Math.max(0, duzeltme)
            });
        }
    } catch (e) {
        console.log('[WSD] surukleme uygulanamadi:', e);
        await yenile();
    }
}

/**
 * Imlecin bulundugu noktaya gore hedefi belirler ve isaretler.
 * Grup sekmesi uzerindeysek siralama hedefi YOK.
 */
function hedefiTazele(x, y) {
    if (hedefGrupId) return;           // sekme kendi isaretini yonetiyor

    const altindaki = document.elementFromPoint(x, y);

    // KLASOR KUTUSU ya da YOL SERIDI: kart o klasore tasinacak
    const klasor = altindaki && altindaki.closest
        ? altindaki.closest('[data-birak-klasor]')
        : null;
    if (klasor) {
        if (klasorHedefId !== klasor.dataset.birakKlasor) {
            klasorHedefId = klasor.dataset.birakKlasor;
            isaretiTemizle();
            sekmeIsaretle(klasor);
        }
        hayaletiHedefteIsaretle(true);
        surukHedefi = null;
        kaynakUzerinde = false;
        yayliKur(klasor.dataset.birakKlasor, klasor);
        return;
    }
    yayliIptal();
    if (klasorHedefId) {
        klasorHedefId = null;
        sekmeIsaretiniTemizle();
    }
    const ustKart = altindaki && altindaki.closest
        ? altindaki.closest('.kart:not(.ekleKart)')
        : null;

    // Kendi yerinin uzerinde: vazgecme
    kaynakUzerinde = !!(ustKart && ustKart === surukKart);

    if (!ustKart || kaynakUzerinde) {
        surukHedefi = null;
        isaretiTemizle();
        // Yayli klasorle gelindiyse kabin bos yeri de hedef: sona eklenir
        if (!ustKart && tutucudaMi() && bosYerMi(altindaki)) {
            // "+" karti gorunuyorsa o isaretlenir (kart oraya, sona gelecek);
            // gizliyse kart alani kesik cizgiyle
            const ekle = document.querySelector('#kartKabi .ekleKart .ekleKutu');
            if (ekle && ekle.offsetParent) ekle.classList.add('surukHedef');
            else document.getElementById('kartAlani')?.classList.add('surukKapHedef');
            hayaletiHedefteIsaretle(true);
        }
        return;
    }

    // YON BAZLI yerlestirme.
    //
    // Once imlecin kartin sag/sol yarisinda olmasina bakiyordum, ama
    // kullanici son karta suruklerken imlec sol yariya denk gelince kart
    // bir onceki siraya dusuyordu ("4. degil 3. koyuyor").
    //
    // Dogrusu SURUKLEME YONU: hedef, kaynagin SAGINDAysa ardina; SOLUNDAysa
    // onune geciyor. Boylece "ustune biraktigin kartin yerine gecersin"
    // hissi olusuyor ve sonuc HER ZAMAN degisiyor.
    const kap = document.getElementById('kartKabi');
    const sira = [...kap.querySelectorAll('.kart:not(.ekleKart)')];
    const sonrasina = sira.indexOf(ustKart) > sira.indexOf(surukKart);

    surukHedefi = { kart: ustKart, sonrasina };
    hedefiIsaretle(ustKart);
}

/**
 * Kart sirasindaki `kartSira` konumunun yer imi indeksi: o konumdaki
 * kartin (kendisi haric) yer imi indeksi; sona konuyorsa son kartin
 * hemen ardi.
 */
async function gercekIndeks(grupId, kartId, kartSira) {
    try {
        const cocuklar = await chrome.bookmarks.getChildren(grupId);
        const kartlar = cocuklar.filter(c => c.url && c.id !== kartId);
        if (!kartlar.length) return 0;
        if (kartSira >= kartlar.length) return kartlar[kartlar.length - 1].index + 1;
        return kartlar[Math.max(0, kartSira)].index;
    } catch (e) {
        return kartSira;
    }
}

/** Kartin gruptaki GERCEK sirasini dondurur (yalnizca yer imleri sayilir). */
async function sirayiOku(grupId, kartId) {
    try {
        const cocuklar = await chrome.bookmarks.getChildren(grupId);
        return cocuklar.filter(c => c.url).findIndex(c => c.id === kartId);
    } catch (e) {
        return -1;
    }
}

/** Verilen ekran noktasindan araya girilecek yeri hesaplar. */
function konumdanHedef(x, y, kaynak) {
    const altindaki = document.elementFromPoint(x, y);
    const hedef = altindaki && altindaki.closest
        ? altindaki.closest('.kart:not(.ekleKart)')
        : null;
    if (!hedef || hedef === kaynak) return null;

    const kap = document.getElementById('kartKabi');
    const sira = [...kap.querySelectorAll('.kart:not(.ekleKart)')];
    return { kart: hedef, sonrasina: sira.indexOf(hedef) > sira.indexOf(kaynak) };
}

/**
 * Kaydi PARAMETRE olarak aliyoruz. Global `surukHedefi` temizlik sirasinda
 * sifirlaniyor; global okusaydik burasi hep bos bulurdu.
 */
function hedefeYerlestir(kart, kayit) {
    if (!kart || !kayit || !kayit.kart) return false;
    const { kart: hedef, sonrasina } = kayit;
    if (!hedef.isConnected || hedef === kart) return false;
    if (sonrasina) hedef.after(kart);
    else hedef.before(kart);
    return true;
}

/* ---------- Hayalet ---------- */

function hayaletOlustur(kart, e) {
    const k = kart.getBoundingClientRect();
    GHOST_OFSET.x = e.clientX - k.left;
    GHOST_OFSET.y = e.clientY - k.top;

    hayalet = kart.cloneNode(true);
    hayalet.id = 'surukHayaleti';
    hayalet.classList.remove('surukKaynak');
    hayalet.style.width = k.width + 'px';
    hayalet.style.height = k.height + 'px';
    document.body.appendChild(hayalet);
    hayaletiKonumla(e.clientX, e.clientY);
}

function hayaletiKonumla(x, y) {
    if (!hayalet) return;
    hayalet.style.transform =
        `translate3d(${x - GHOST_OFSET.x}px, ${y - GHOST_OFSET.y}px, 0)`;
}

function hayaletiHedefteIsaretle(hedefte) {
    hayalet?.classList.toggle('hedefte', hedefte);
}

/* ---------- Isaretler ---------- */

function hedefiIsaretle(hedef) {
    isaretiTemizle();
    // Sinifi RESIM kutusuna dogrudan yaziyoruz - alt-oge secicisine
    // guvenmiyoruz ki cerceve yanlislikla basligi kapsamasin.
    const kutu = hedef.querySelector('.kartGorsel');
    if (kutu) kutu.classList.add('surukHedef');
    hayaletiHedefteIsaretle(true);
}

function isaretiTemizle() {
    for (const el of document.querySelectorAll('.surukHedef')) {
        el.classList.remove('surukHedef');
    }
    document.getElementById('kartAlani')?.classList.remove('surukKapHedef');
    hayaletiHedefteIsaretle(false);
}

function sekmeIsaretle(sekme) {
    sekmeIsaretiniTemizle();
    sekme.classList.add('surukSekmeHedef');
}

function sekmeIsaretiniTemizle() {
    for (const s of document.querySelectorAll('.surukSekmeHedef')) {
        s.classList.remove('surukSekmeHedef');
    }
}

function temizle() {
    yayliIptal();
    surukKart?.classList.remove('surukKaynak');
    // Tutucuda kalan kart (yayli klasorle ekran degisti, birakma yeri
    // siralama degildi) - ekranda yeri yok, at
    if (surukKart && tutucu && surukKart.parentNode === tutucu) surukKart.remove();
    hayalet?.remove();
    hayalet = null;
    isaretiTemizle();
    sekmeIsaretiniTemizle();

    surukKart = null;
    surukHedefi = null;
    hedefGrupId = null;
    klasorHedefId = null;
    kaynakUzerinde = false;
}
