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

// WSD Speed Dial - dil katmani
//
// Chrome'un kendi i18n altyapisini kullaniyoruz: ceviriler
// `_locales/<dil>/messages.json` dosyalarinda, tarayici dilini
// kendisi seciyor ve bulamazsa `default_locale`e dusuyor.

/**
 * Ceviri getirir. Anahtar yoksa yedek metni, o da yoksa anahtarin
 * kendisini donduruyor - eksik ceviri sayfayi BOS birakmasin.
 *
 * @param anahtar  messages.json anahtari
 * @param yerler   $1, $2... yer tutucularinin degerleri
 */
export function c(anahtar, ...yerler) {
    const m = chrome.i18n.getMessage(anahtar, yerler.map(String));
    return m || anahtar;
}

/**
 * Sayfadaki `data-c` tasiyan ogeleri doldurur.
 *
 *   <span data-c="ayarBaslik">Ayarlar</span>
 *   <input data-c-placeholder="aramaIpucu">
 *   <button data-c-title="kapat">
 *
 * HTML'deki metin YEDEK olarak kaliyor: ceviri bulunamazsa oge bos
 * gorunmesin diye dokunmuyoruz.
 */
export function sayfayiCevir(kok = document) {
    // Belgenin dili de arayuz diline uysun: ekran okuyucular ve
    // tarayicinin ceviri onerisi buna bakiyor
    if (kok === document) {
        try { document.documentElement.lang = chrome.i18n.getUILanguage(); }
        catch (e) { /* onemli degil */ }
    }

    for (const el of kok.querySelectorAll('[data-c]')) {
        const m = chrome.i18n.getMessage(el.dataset.c);
        if (m) el.textContent = m;
    }
    for (const ozellik of ['title', 'placeholder', 'ariaLabel']) {
        const ad = 'data-c-' + ozellik.toLowerCase().replace('arialabel', 'aria-label');
        for (const el of kok.querySelectorAll(`[${ad}]`)) {
            const m = chrome.i18n.getMessage(el.getAttribute(ad));
            if (!m) continue;
            if (ozellik === 'ariaLabel') el.setAttribute('aria-label', m);
            else el[ozellik] = m;
        }
    }
}
