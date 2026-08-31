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
 * Dort kare, capraz iki renk. Cerceve ve orta kare YOK: 16px'te ikisi de
 * bulaniklasip ikonu kirletiyordu.
 *
 * Renkler SEFFAF DEGIL: opaklik kullanmak yerine iki gercek renk
 * veriyoruz. Seffaf kareler koyu ve acik arac cubuklarinda farkli
 * gorunuyor, acik zeminde silik kaliyordu.
 */
function ciz(olcu, a, b) {
    const tuval = new OffscreenCanvas(olcu, olcu);
    const ctx = tuval.getContext('2d');

    // 24'luk tasarim izgarasi -> istenen olcu
    const k = olcu / 24;
    const K = 8.5 * k;            // kare kenari
    const r = 2 * k;              // kose yaricapi
    const bas = 2 * k;            // kenar boslugu
    const ikinci = 13.5 * k;      // ikinci sutun/satir

    ctx.clearRect(0, 0, olcu, olcu);
    yuvarlak(ctx, bas, bas, K, K, r, a);
    yuvarlak(ctx, ikinci, bas, K, K, r, b);
    yuvarlak(ctx, bas, ikinci, K, K, r, b);
    yuvarlak(ctx, ikinci, ikinci, K, K, r, a);

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

        const imageData = {};
        for (const o of OLCULER) imageData[o] = ciz(o, a, b);

        await chrome.action.setIcon({ imageData });
    } catch (e) {
        console.log('[WSD] simge uygulanamadi:', e);
    }
}
