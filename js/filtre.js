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

// WSD Speed Dial - zemin renklendirme
//
// Iki kip:
//   'ton' -> hue-rotate + saturate + brightness. `colorize` acikken goruntu
//            once grileştirilip sepia ile TEK TONA sabitleniyor, sonra o ton
//            istenen yere donduruluyor.
//   'iki' -> duotone. Gorsel yalnizca grileşiyor; renk isini golge/isik
//            boya katmanlari yapiyor (multiply + screen).

/**
 * Zemin gorseline uygulanacak CSS filter zinciri.
 *
 * Kaydiricilar FARK degeri tutuyor: 0 = degisiklik yok. Boylece kullanici
 * "sifira al" deyince orijinal goruntuye donuyor.
 */
export function filtreZinciri(ayar) {
    if (!ayar || !ayar.filtreAcik) return 'none';

    const ton       = ayar.ton || 0;
    const doygunluk = ayar.doygunluk || 0;
    const aciklik   = ayar.aciklik || 0;
    const parlaklik = 1 + aciklik / 100;          // -100 -> 0, 0 -> 1, +100 -> 2

    if (ayar.filtreYontemi === 'iki') {
        // Boya katmanlari renk veriyor; gorsel sadece grileşiyor.
        const siddet = (ayar.siddet ?? 100) / 100;
        return `grayscale(${siddet}) contrast(1.05)`;
    }

    if (ayar.colorize) {
        // Sepia zayif doygunlukta oldugu icin TABAN 2 aliniyor;
        // 1 ile birakilinca sonuc solgun kaliyordu.
        const doy = Math.max(0, 2 + doygunluk / 50);   // -100 -> 0, 0 -> 2, +100 -> 4
        return `grayscale(1) sepia(1) hue-rotate(${ton}deg) ` +
               `saturate(${doy}) brightness(${parlaklik})`;
    }

    // Duz ton kaydirma: grileştirme YOK, notr griler notr kaliyor
    const doy = Math.max(0, 1 + doygunluk / 100);      // -100 -> 0, 0 -> 1, +100 -> 2
    return `hue-rotate(${ton}deg) saturate(${doy}) brightness(${parlaklik})`;
}

/** Iki renk kipinde boya katmanlarinin durumu. */
export function ikiRenkKatmanlari(ayar) {
    if (!ayar || !ayar.filtreAcik || ayar.filtreYontemi !== 'iki') {
        return { acik: false };
    }
    const siddet = (ayar.siddet ?? 100) / 100;
    return {
        acik: true,
        golge: ayar.golgeRengi,
        isik: ayar.isikRengi,
        opaklik: siddet
    };
}
