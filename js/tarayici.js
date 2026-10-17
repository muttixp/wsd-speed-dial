// WSD Speed Dial - Copyright (C) 2026 muttixp
//
// Bu program ozgur yazilimdir: GNU Genel Kamu Lisansi 3. surum ya da
// (tercihinize bagli olarak) daha sonraki bir surumu kosullariyla
// dagitilir. Ayrintilar: LICENSE dosyasi.

/**
 * TARAYICI AYRIMI (1.5.5)
 *
 * Gizli yakalama (hata ayiklayici) Chrome'da ustte "hata ayiklamaya
 * basladi" cubugu gosteriyor; Edge ve Vivaldi'de sessiz. Varsayilan kip
 * ve uyari metni buna gore seciliyor.
 *
 * Vivaldi marka listesinde kendini Chrome gibi gosterebiliyor (marka
 * maskeleme); ayirt edici olan sekme/pencere nesnelerindeki `vivExtData`.
 */
export async function chromeMu() {
    const markalar = (navigator.userAgentData?.brands || []).map(b => b.brand);
    if (!markalar.includes('Google Chrome')) return false;            // Edge, Brave, Opera, Chromium
    if (/\bEdg\/|\bOPR\//.test(navigator.userAgent)) return false;
    try {
        const w = await chrome.windows.getLastFocused({ populate: true });
        if (w && ('vivExtData' in w || w.tabs?.some(t => 'vivExtData' in t))) return false;
    } catch (e) { /* pencere yok */ }
    return true;
}
