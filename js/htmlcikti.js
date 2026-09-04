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

// WSD Speed Dial - bagimsiz HTML sayfasi uretimi
//
// Kartlari gomulu gorselleriyle TEK bir HTML dosyasina yaziyor.
// Eklenti kurulu olmayan bir makinede de acilabiliyor, e-postayla
// gonderilebiliyor, arsivlenebiliyor.
//
// Gorseller data URI olarak GOMULUYOR - dis baglanti yok, dosya
// tasindiginda da calisiyor. Bedeli: dosya buyuk olabiliyor.

import { gruplariAl, kartlariAl, urlNormalle } from './yerimi.js';
import { c } from './dil.js';
import { ayarlariAl } from './ayar.js';

/** HTML metni uretir. */
export async function htmlUret() {
    const gruplar = await gruplariAl();
    const ayar = await ayarlariAl();
    const depo = await chrome.storage.local.get(null);

    const notlar = depo.kartNotlari || {};
    const renkler = depo.kartRenkleri || {};

    // Gruplari SEKME olarak veriyoruz: hepsini alt alta dizince uzun
    // bir liste cikiyor ve kullanici aradigini bulamiyor. Eklentideki
    // duzenin aynisi.
    let menu = '';
    let sayfalar = '';
    let toplamKart = 0;
    let sira = 0;

    for (const g of gruplar) {
        const kartlar = await kartlariAl(g.id);
        if (!kartlar.length) continue;
        toplamKart += kartlar.length;

        const id = 'g' + sira;
        const aktif = sira === 0 ? ' aktif' : '';

        menu += `<button class="sekme${aktif}" data-hedef="${id}">` +
                `${kacis(g.baslik)}<span class="sayi">${kartlar.length}</span></button>\n`;

        let govde = '';
        for (const k of kartlar) {
            const anahtar = urlNormalle(k.url);
            const kayit = depo[anahtar];
            const gorsel = kayit && kayit.gorsel ? kayit.gorsel : null;
            const not = notlar[anahtar];
            const renk = renkler[anahtar];

            govde += `<a class="kart" href="${kacis(k.url)}" target="_blank" rel="noopener"`;
            if (not) govde += ` title="${kacis(not)}"`;
            govde += '>\n';
            govde += `<span class="baslik">${kacis(k.baslik || k.url)}</span>\n`;
            govde += gorsel
                ? `<span class="gorsel" style="background-image:url('${gorsel}')"></span>\n`
                : `<span class="gorsel bos">${kacis(harfAl(k.baslik || k.url))}</span>\n`;
            if (renk) govde += `<span class="renk" style="background:${kacis(renk)}"></span>\n`;
            govde += '</a>\n';
        }

        sayfalar += `<div class="sayfa${aktif}" id="${id}"><div class="izgara">\n` +
                    govde + '</div></div>\n';
        sira++;
    }

    const tarih = new Date().toLocaleString('tr-TR');
    const zemin = ayar.zeminRengi || '#14161a';

    return sablon({
        acikZemin: acikMi(zemin),
        menu,
        sayfalar,
        grupSayisi: sira,
        tarih,
        toplamKart,
        kartEn: ayar.kartEn || 250,
        kose: ayar.kartKose ?? 7,
        zemin
    });
}

/**
 * Zemin acik mi koyu mu?
 *
 * Kullanicinin zemin rengi beyaz olabiliyor (ornek: FVD ice aktarmasi
 * `FFFFFF` getiriyor). Metin rengini sabit acik birakirsak beyaz uzerine
 * beyaz yazi cikip sayfa okunamaz oluyordu.
 *
 * Algilanan parlaklik: goz yesile kirmiziden, kirmiziya maviden daha
 * duyarli - bu yuzden agirlikli ortalama.
 */
function acikMi(hex) {
    const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(String(hex).trim());
    if (!m) return false;
    const [r, g, b] = m.slice(1).map(h => parseInt(h, 16));
    return (r * 0.299 + g * 0.587 + b * 0.114) > 150;
}

/** Ilk harf - gorseli olmayan kartlar icin. */
function harfAl(m) {
    return (m || '?').trim().charAt(0).toLocaleUpperCase('tr');
}

/**
 * HTML kacisi.
 * Kart basliklari ve notlar sitelerden geliyor: icinde `<script>` de
 * olabilir. Kacis yapilmazsa uretilen dosya calistirilabilir hale gelir.
 */
function kacis(m) {
    return String(m ?? '').replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
}

function sablon({ menu, sayfalar, grupSayisi, tarih, toplamKart, kartEn, kose, zemin, acikZemin }) {
    // Renkler zemine gore: acik zeminde koyu metin, koyu zeminde acik
    const R = acikZemin ? {
        metin: '#1c2026', sonuk: 'rgba(28,32,38,.6)',
        kartZemin: 'rgba(0,0,0,.05)', cerceve: 'rgba(0,0,0,.12)',
        cerceveGuclu: 'rgba(0,0,0,.24)', sekme: 'rgba(0,0,0,.05)',
        sekmeHover: 'rgba(0,0,0,.1)', rozet: 'rgba(0,0,0,.1)',
        golge: 'rgba(0,0,0,.14)', ayirac: 'rgba(0,0,0,.1)'
    } : {
        metin: c('e8eaed'), sonuk: 'rgba(232,234,237,.62)',
        kartZemin: '#22262e', cerceve: 'rgba(255,255,255,.09)',
        cerceveGuclu: 'rgba(255,255,255,.2)', sekme: 'rgba(255,255,255,.06)',
        sekmeHover: 'rgba(255,255,255,.12)', rozet: 'rgba(255,255,255,.12)',
        golge: 'rgba(0,0,0,.4)', ayirac: 'rgba(255,255,255,.07)'
    };

    return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>WSD Speed Dial — ${kacis(tarih)}</title>
<style>
  :root { --en: ${kartEn}px; --kose: ${kose}px; }
  * { box-sizing: border-box; }
  body {
    margin: 0; padding: 28px 24px 48px;
    background: ${kacis(zemin)}; color: ${R.metin};
    font: 14px/1.5 system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  header { margin-bottom: 16px; }
  h1 { margin: 0 0 4px; font-size: 19px; font-weight: 600; }
  .ustbilgi { font-size: 12.5px; color: ${R.sonuk}; }

  .menu { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 22px; }
  .sekme {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 6px 12px; border: 1px solid transparent;
    border-radius: 9px; background: ${R.sekme};
    color: ${R.sonuk}; font: inherit; font-weight: 500;
    cursor: pointer; white-space: nowrap;
    transition: background .16s, color .16s;
  }
  .sekme:hover { background: ${R.sekmeHover}; color: ${R.metin}; }
  .sekme.aktif {
    background: #576a80; color: #fff;
    border-color: ${R.cerceveGuclu};
  }
  .sayi {
    font-size: 11px; font-weight: 600; padding: 1px 6px;
    border-radius: 99px; background: ${R.rozet}; opacity: .8;
  }

  .sayfa { display: none; }
  .sayfa.aktif { display: block; }
  .izgara {
    display: grid; gap: 14px;
    grid-template-columns: repeat(auto-fill, minmax(var(--en), 1fr));
  }
  .kart {
    position: relative; display: block;
    text-decoration: none; color: inherit;
  }
  .baslik {
    display: block; padding: 0 10px 5px;
    font-size: 12.5px; text-align: center;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    color: ${R.sonuk};
  }
  .gorsel {
    display: block; aspect-ratio: 16/10;
    border-radius: var(--kose);
    background: ${R.kartZemin} center/cover no-repeat;
    box-shadow: inset 0 0 0 1px ${R.cerceve}, 0 1px 2px ${R.golge};
    transition: box-shadow .16s, transform .16s;
  }
  .gorsel.bos {
    display: flex; align-items: center; justify-content: center;
    font-size: 34px; font-weight: 300; color: ${R.sonuk}; opacity: .55;
  }
  .kart:hover .gorsel {
    box-shadow: inset 0 0 0 1px ${R.cerceveGuclu}, 0 6px 18px ${R.golge};
    transform: translateY(-2px);
  }
  .kart:hover .baslik { color: ${R.metin}; }
  .renk {
    position: absolute; left: 10px; right: 10px; bottom: 0;
    height: 3px; border-radius: 3px 3px 0 0;
  }
  footer {
    margin-top: 40px; padding-top: 16px;
    border-top: 1px solid ${R.ayirac};
    font-size: 11.5px; color: ${R.sonuk};
  }
</style>
</head>
<body>
<header>
  <h1>WSD Speed Dial</h1>
  <div class="ustbilgi">${grupSayisi} grup · ${toplamKart} kart · ${kacis(tarih)}</div>
</header>
<nav class="menu">
${menu}</nav>
${sayfalar}<footer>${kacis(c('htmlAltBilgi'))}</footer>
<script>
// Sekme gecisi. Dinleyici KAP uzerinde: sekme sayisi degisken,
// her dugmeye ayri baglamak gereksiz.
document.querySelector('.menu').addEventListener('click', function (e) {
  var d = e.target.closest('.sekme');
  if (!d) return;
  document.querySelectorAll('.sekme').forEach(function (b) { b.classList.remove('aktif'); });
  document.querySelectorAll('.sayfa').forEach(function (p) { p.classList.remove('aktif'); });
  d.classList.add('aktif');
  var s = document.getElementById(d.dataset.hedef);
  if (s) s.classList.add('aktif');
});
<\/script>
</body>
</html>`;
}

/** Uretip indirir. */
export async function htmlIndir() {
    const html = await htmlUret();
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const t = new Date();
    const iki = n => String(n).padStart(2, '0');
    const a = document.createElement('a');
    a.href = url;
    a.download = `WSD-sayfa-${t.getDate()}-${t.getMonth() + 1}-${t.getFullYear()}-` +
                 `${iki(t.getHours())}${iki(t.getMinutes())}.html`;
    a.click();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return { boyut: blob.size };
}
