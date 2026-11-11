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

// WSD Speed Dial - SITE ADI (1.7.0)
//
// Baslik bos birakilinca kart adi adres olmasin: once adresten tahmin
// ("https://www.sozcu.com.tr/" -> "Sozcu"), sonra sitenin kendi bildirdigi
// ad (og:site_name, application-name, <title>'in ilk parcasi) -> "Sözcü".
// Istek yalnizca sitenin kendisine; baska servis yok.

const EK = new Set(['com', 'net', 'org', 'gov', 'edu', 'gen', 'bel', 'k12', 'av', 'co', 'ac', 'or', 'ne', 'go',
    'io', 'tr', 'ru', 'ua', 'uk', 'de', 'fr', 'es', 'it', 'br', 'pt', 'cn', 'jp', 'us', 'eu', 'info', 'biz',
    'app', 'dev', 'tv', 'me', 'online', 'site', 'xyz', 'su', 'by', 'kz', 'az', 'mx', 'ar', 'in', 'pl', 'nl']);

/** Adresten hemen bir ad: alan adinin ana parcasi, bas harfi buyuk */
export function otoAd(url) {
    try {
        const u = new URL(url);
        if (!/^https?:$/.test(u.protocol)) return url;
        const parca = u.hostname.replace(/^www\d*\./, '').split('.');
        while (parca.length > 1 && EK.has(parca[parca.length - 1])) parca.pop();
        const ad = parca[parca.length - 1] || u.hostname;
        return ad.charAt(0).toLocaleUpperCase() + ad.slice(1);
    } catch (e) { return url; }
}

const GENEL = /^(home|homepage|ana ?sayfa|anasayfa|главная|inicio|início|welcome|hoş ?geldiniz|index)$/i;

/** Sitenin kendi adi; bulunamazsa null */
export async function siteAdiBul(url, ms = 7000) {
    const k = new AbortController();
    const t = setTimeout(() => k.abort(), ms);
    try {
        const y = await fetch(url, { credentials: 'omit', redirect: 'follow', signal: k.signal });
        if (!y.ok || !(y.headers.get('content-type') || '').includes('text/html')) return null;
        // Basliklar <head>'de: ilk 200 KB yeter
        const html = (await y.text()).slice(0, 200000);
        const d = new DOMParser().parseFromString(html, 'text/html');
        const meta = sec => d.querySelector(sec)?.getAttribute('content')?.trim();
        const aday = meta('meta[property="og:site_name"]') || meta('meta[name="application-name"]') ||
                     meta('meta[name="apple-mobile-web-app-title"]');
        if (aday) return temizle(aday);
        const baslik = (d.querySelector('title')?.textContent || '').replace(/\s+/g, ' ').trim();
        if (!baslik) return null;
        const parcalar = baslik.split(/\s+[-|–—·:»•]\s+/).map(s => s.trim()).filter(s => s && !GENEL.test(s));
        return parcalar.length ? temizle(parcalar[0]) : null;
    } catch (e) {
        return null;
    } finally {
        clearTimeout(t);
    }
}

function temizle(s) {
    s = String(s).replace(/\s+/g, ' ').trim();
    if (!s || s.length > 60) return s ? s.slice(0, 40).trim() : null;
    return s;
}
