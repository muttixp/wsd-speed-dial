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

// WSD Speed Dial - uzanti simgesi cizimi
//
// PNG'yi BOYAMIYORUZ, dogrudan OffscreenCanvas'a ciziyoruz. Piksel
// degistirme yontemi kirilgan: cizim degisince aranan renkler
// bulunamiyor ve simge sessizce eski halinde kaliyor.
//
// MV3 KISITI: `chrome.action.setIcon` KALICI DEGIL. Servis iscisi
// uyudugunda manifest'teki PNG geri geliyor. Bu yuzden isci her
// uyandiginda yeniden uygulaniyor (asagidaki dinleyiciler).

const OLCULER = [16, 24, 32, 48, 128];

/**
 * Tek bir olcu icin ImageData uretir.
 *
 * 1.5.3: iki renkli W. Sol kol birinci renk,
 * sag kol ikinci renk. Eski dort kareli simge magazadaki baska hiz
 * kadranlariyla karisiyordu.
 *
 * Renkler SEFFAF DEGIL: seffaf cizim koyu ve acik arac cubuklarinda
 * farkli gorunuyor, acik zeminde silik kaliyordu.
 */
function ciz(olcu, a, b, golge, zemin) {
    const tuval = new OffscreenCanvas(olcu, olcu);
    const ctx = tuval.getContext('2d');

    // 128'lik tasarim izgarasi -> istenen olcu
    const k = olcu / 128;
    const kucuk = olcu <= 24;

    ctx.clearRect(0, 0, olcu, olcu);

    // ZEMIN: varsayilan YOK (saydam). Sabit koyu zemin, secilen renkle
    // uyusmayinca siritiyordu; artik istege bagli ve rengi secilebiliyor.
    // Cerceve denendi, birakildi: W'yi kucultup 16px'te okunmaz yapiyordu.
    if (zemin) yuvarlak(ctx, 0, 0, olcu, olcu, 26 * k, zemin);

    // Golge: harf tek basina arac cubugunda zeminden ayrismiyordu
    // (kart basligindaki golgeyle ayni fikir). Kucuk olcude en az 1px.
    // Ayardan kapatilabiliyor, rengi secilebiliyor (golge = '' ise yok).
    if (golge) {
        ctx.shadowColor = /^#[0-9a-f]{6}$/i.test(golge) ? golge + '99' : 'rgba(0, 0, 0, .6)';
        ctx.shadowOffsetX = ctx.shadowOffsetY = Math.max(1, olcu / 20);
        ctx.shadowBlur = Math.max(1, olcu / 18);
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    // Kucuk olculerde cizgi kalinlasiyor: 16px'te ince W okunmuyor.
    // Zemin varken W kenara yapismasin diye biraz iceride ve ince.
    ctx.lineWidth = (zemin ? (kucuk ? 23 : 20) : (kucuk ? 28 : 25)) * k;
    const N = zemin
        ? [[[24, 30], [43, 94], [62, 48]], [[62, 48], [81, 94], [100, 30]]]
        : [[[16, 22], [39, 98], [61, 44]], [[61, 44], [83, 98], [106, 22]]];
    const kol = (renk, noktalar) => {
        ctx.beginPath();
        noktalar.forEach(([x, y], i) => (i ? ctx.lineTo(x * k, y * k) : ctx.moveTo(x * k, y * k)));
        ctx.strokeStyle = renk;
        ctx.stroke();
    };
    kol(a, N[0]);
    kol(b, N[1]);

    return ctx.getImageData(0, 0, olcu, olcu);
}

function yuvarlak(ctx, x, y, en, boy, r, renk) {
    const yc = Math.min(r, en / 2, boy / 2);
    ctx.beginPath();
    ctx.moveTo(x + yc, y);
    ctx.arcTo(x + en, y, x + en, y + boy, yc);
    ctx.arcTo(x + en, y + boy, x, y + boy, yc);
    ctx.arcTo(x, y + boy, x, y, yc);
    ctx.arcTo(x, y, x + en, y, yc);
    ctx.closePath();
    ctx.fillStyle = renk;
    ctx.fill();
}

/** Ayarlardaki renklerle simgeyi uygular. */
export async function simgeyiUygula() {
    try {
        const d = await chrome.storage.local.get('ayarlar');
        const ay = d.ayarlar || {};
        const a = ay.simgeRenkA || '#5d93c2';
        const b = ay.simgeRenkB || '#a8c8e4';
        const golge = ay.simgeGolge === false ? '' : (ay.simgeGolgeRengi || '#000000');
        const zemin = ay.simgeZemin ? (ay.simgeZeminRengi || '#1b2029') : '';

        const imageData = {};
        for (const o of OLCULER) imageData[o] = ciz(o, a, b, golge, zemin);

        await chrome.action.setIcon({ imageData });
    } catch (e) {
        console.log('[WSD] simge uygulanamadi:', e);
    }
}
