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
let surukHedefi = null;        // { kart, sonrasina } - araya girilecek yer
let hayalet = null;            // imleci takip eden kopya
let hedefGrupId = null;        // grup sekmesi uzerindeysek
let kaynakUzerinde = false;    // imlec kendi yerinin uzerinde mi (vazgecme)

const GHOST_OFSET = { x: 0, y: 0 };

// Son imlec konumu. Birakma aninda hedef kaydi bos kalirsa buradan
// YENIDEN hesapliyoruz: hizli hareket ya da olay sirasi yuzunden son
// dragover kartin uzerine denk gelmeyebiliyor ve tasima kaciyordu.
let sonKonum = { x: 0, y: 0 };

export function kartSuruklemeKur({ aktifGrup, yenile, bildir }) {
    const kap = document.getElementById('kartKabi');
    const serit = document.getElementById('grupSeridi');
    if (!kap) return;

    kap.addEventListener('dragstart', e => {
        const kart = e.target.closest('.kart:not(.ekleKart)');
        if (!kart) return;

        islendi = false;
        surukKart = kart;
        surukHedefi = null;
        hedefGrupId = null;
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
        await birak({ aktifGrup, yenile, bildir }, { x: e.clientX, y: e.clientY });
    });

    document.getElementById('grupSeridi')?.addEventListener('drop', async e => {
        e.preventDefault();
        e.stopPropagation();
        await birak({ aktifGrup, yenile, bildir }, { x: e.clientX, y: e.clientY });
    });

    kap.addEventListener('dragend', async () => {
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
    });

    serit?.addEventListener('dragleave', e => {
        if (!surukKart) return;
        if (e.target.closest('.grupSekme')) {
            hedefGrupId = null;
            sekmeIsaretiniTemizle();
            hayaletiHedefteIsaretle(false);
        }
    });

    // Kabin/seridin disina birakma - sadece temizle
    document.addEventListener('drop', e => e.preventDefault());
}

/* ---------- Birakma ---------- */

let islendi = false;

async function birak({ aktifGrup, yenile, bildir }, konum = null) {
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
    const grupHedefi = hedefGrupId;

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

        // 2) Ayni grupta siralama
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

        await chrome.bookmarks.move(kartId, { parentId: grupId, index: yeniIndex });

        const gercek = await sirayiOku(grupId, kartId);
        if (gercek !== yeniIndex && gercek >= 0) {
            // Sapma yonune gore telafi et
            const duzeltme = yeniIndex + (yeniIndex - gercek);
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
    const ustKart = altindaki && altindaki.closest
        ? altindaki.closest('.kart:not(.ekleKart)')
        : null;

    // Kendi yerinin uzerinde: vazgecme
    kaynakUzerinde = !!(ustKart && ustKart === surukKart);

    if (!ustKart || kaynakUzerinde) {
        surukHedefi = null;
        isaretiTemizle();
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
    surukKart?.classList.remove('surukKaynak');
    hayalet?.remove();
    hayalet = null;
    isaretiTemizle();
    sekmeIsaretiniTemizle();

    surukKart = null;
    surukHedefi = null;
    hedefGrupId = null;
    kaynakUzerinde = false;
}
