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

// WSD Speed Dial - ICE AKTARMA SIRASINDA YAKALAMAYI BEKLET (1.5.0)
//
// Ice aktarma binlerce yer imi olusturuyor; her biri `bookmarks.onCreated`
// ile arka planda gorsel yakalamayi tetikliyordu. Aktarma bitmeden
// pencereler acilip kapaniyor ve islem kasiyordu.
//
// Artik aktarma basinda arka plana haber veriliyor: yakalama ve sag tik
// menusu kurulumu bekliyor. Bitince aktarilan adreslerden GORSELI
// OLMAYANLAR tek seferde kuyruga aliniyor.

import { tazelemeyiBastir } from './arayuz.js';

const gonder = m => chrome.runtime.sendMessage({ hedef: 'arkaplan', ...m }).catch(() => {});

export async function iceAktarimBaslat() {
    // Sayfa da her yer imi olayinda yeniden cizmesin
    tazelemeyiBastir(30 * 60 * 1000);
    await gonder({ tur: 'iceAktarimBasladi' });
}

/** @param urller aktarilan kart adresleri - gorseli olmayanlar yakalanir */
export async function iceAktarimBitir(urller = []) {
    tazelemeyiBastir(0);
    await gonder({ tur: 'iceAktarimBitti', urller: [...new Set(urller)] });
}
