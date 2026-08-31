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

// WSD Speed Dial - klavye kisayollari
//
// Tum dinleyiciler once "yaziyor muyuz" diye bakiyor: bir metin
// alanindayken 1'e basmak grup degistirmemeli.

import { gorunurGruplariAl } from './yerimi.js';

/** Ayar panelini acar ya da kapatir. */
function ayarlariAcKapat() {
    const panel = document.getElementById('ayarPanel');
    const perde = document.getElementById('perde');
    if (!panel) return;

    const acik = panel.classList.contains('acik');
    panel.classList.toggle('acik', !acik);
    perde?.classList.toggle('acik', !acik);
    document.body.classList.toggle('ayarAcik', !acik);
}

export function kisayollariKur({ aktifGrup, grubuAc, kartEkle, grupEkle, gruplariYonet }) {
    document.addEventListener('keydown', async e => {
        // Metin alanindaysak karisma
        if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
        if (e.target.isContentEditable) return;

        // Acik bir pencere varsa kisayollar calismasin - o pencerenin
        // kendi tuslari var (Enter kaydet, Escape kapat)
        if (document.querySelector('.pencere:not([hidden])')) return;

        // Tarayicinin kendi kisayollarina dokunmuyoruz
        if (e.altKey || e.metaKey) return;

        // Ctrl+, ayarlar (yaygin kalip). Ctrl+F aramada isleniyor.
        if (e.ctrlKey) {
            if (e.key === ',') {
                e.preventDefault();
                ayarlariAcKapat();
            }
            return;
        }

        // Tek harfli kisayollar
        const harf = e.key.toLocaleLowerCase('tr');
        if (harf === 'h') { e.preventDefault(); document.getElementById('gozBtn')?.click(); return; }
        if (harf === 'n') { e.preventDefault(); kartEkle && kartEkle(); return; }
        if (harf === 'g') { e.preventDefault(); grupEkle && grupEkle(); return; }
        if (harf === 'y') { e.preventDefault(); gruplariYonet && gruplariYonet(); return; }

        const gruplar = await gorunurGruplariAl();
        if (!gruplar.length) return;

        const su = gruplar.findIndex(g => g.id === aktifGrup());

        // 1-9: dogrudan gruba git
        if (/^[1-9]$/.test(e.key) && !e.ctrlKey) {
            const hedef = gruplar[+e.key - 1];
            if (hedef) {
                e.preventDefault();
                grubuAc(hedef.id);
            }
            return;
        }

        switch (e.key) {
            // Home / End: ilk ve son grup
            case 'Home':
                e.preventDefault();
                grubuAc(gruplar[0].id);
                break;

            case 'End':
                e.preventDefault();
                grubuAc(gruplar[gruplar.length - 1].id);
                break;

            // PageUp/PageDown: onceki ve sonraki grup, DAIRESEL
            case 'PageUp':
                e.preventDefault();
                grubuAc(gruplar[(su - 1 + gruplar.length) % gruplar.length].id);
                break;

            case 'PageDown':
                e.preventDefault();
                grubuAc(gruplar[(su + 1) % gruplar.length].id);
                break;
        }
    });
}
