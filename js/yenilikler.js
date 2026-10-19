// WSD Speed Dial - Copyright (C) 2026 muttixp - GPL-3.0-or-later
//
// YENILIKLER (1.5.6): Ayarlar › Hakkinda › Yenilikler penceresinde ve
// guncelleme sonrasi bildirimde gosterilen kisa liste. Tam liste
// CHANGELOG.md'de. Ag istegi yok - metin eklentinin icinde.
// Her surum: `yeni` (zorunlu) ve `duzeltme` (istege bagli), dil basina
// dizi. En yeni en ustte.

export const YENILIKLER = [
    {
        surum: '1.5.6',
        yeni: {
            tr: [
                "Desenli varsayılan duvar kâğıtları; renklendirme (ton, doygunluk, açıklık) artık desene de uygulanıyor",
                "Renklendirme her tema için ayrı hatırlanıyor",
                "Yeni temalar: Yakut, Kehribar (koyu) · Gül, Güneş (açık)",
                "Kendi kaydettiğiniz temada değişikliği tek tıkla kaydetmek için \"Güncelle\"",
                "Kart Hizalama: kartlar ortada ya da solda (Ayarlar › Kartlar)",
                "16 yeni grup simgesi: Wi-Fi, bilgisayar, telefon, not, takvim, yemek ve dahası",
            ],
            en: [
                "Patterned default wallpapers; coloring (hue, saturation, lightness) now applies to them too",
                "Coloring is remembered separately for each theme",
                "New themes: Ruby, Amber (dark) · Rose, Sunshine (light)",
                "\"Update\" saves changes to a theme you saved yourself in one click",
                "Tile alignment: centered or left (Settings › Tiles)",
                "16 new group icons: Wi-Fi, computer, phone, note, calendar, food and more",
            ],
            ru: [
                "Узорные обои по умолчанию; тонирование (оттенок, насыщенность, яркость) теперь действует и на них",
                "Тонирование запоминается отдельно для каждой темы",
                "Новые темы: Рубин, Янтарь (тёмные) · Роза, Солнце (светлые)",
                "Кнопка «Обновить» сохраняет изменения в вашей теме одним нажатием",
                "Выравнивание плиток: по центру или слева (Настройки › Плитки)",
                "16 новых значков групп: Wi-Fi, компьютер, телефон, заметка, календарь, еда и другие",
            ],
        },
        duzeltme: {
            tr: [
                "Kendi seçtiğiniz kart resmi yeni yakalamayla ya da adres değişince eziliyordu",
                "Açık modda yan paneldeki simgeler zor seçiliyordu",
                "Kaydettiğiniz temalar içe aktarınca ya da ayarları sıfırlayınca siliniyordu",
            ],
            en: [
                "A tile image you picked was replaced by a new capture or when the address changed",
                "Side panel icons were hard to see in light mode",
                "Saved themes were lost on import or settings reset",
            ],
            ru: [
                "Выбранное вами изображение плитки заменялось новым снимком или при смене адреса",
                "Значки боковой панели плохо различались в светлой теме",
                "Сохранённые темы пропадали при импорте или сбросе настроек",
            ],
        },
    },
    {
        surum: '1.5.5',
        yeni: {
            tr: [
                "Ana sayfada web arama kutusu: motor seçimi, kendi motorunu ekleme, nerede görüneceği",
                "Temalar: Koyu / Açık / Sistem ve hazır renk şablonları",
                "Hazır Gruplar: örnek kart paketlerini tek tıkla ekleme",
                "Başka speed dial eklentilerinin yedeklerinden içe aktarma; görseli olmayan kartlar arka planda yakalanır",
                "Buzlu cam görünüm ve renkli simgeler",
            ],
            en: [
                "Web search box on the home page: pick an engine, add your own, choose where it appears",
                "Themes: Dark / Light / System with ready-made color presets",
                "Ready-made Groups: add sample tile packs in one click",
                "Import from other speed dial backups; tiles without images are captured in the background",
                "Frosted glass look and colored icons",
            ],
            ru: [
                "Поле веб-поиска на главной: выбор поисковика, свой поисковик, где показывать",
                "Темы: тёмная / светлая / системная и готовые цветовые наборы",
                "Готовые группы: добавление наборов плиток одним нажатием",
                "Импорт из резервных копий других speed dial; плитки без изображений снимаются в фоне",
                "Эффект матового стекла и цветные значки",
            ],
        },
        duzeltme: {
            tr: [
                "Gizli kipte bazı kartlar boş kalıyordu",
                "Rusça çeviri gözden geçirildi",
            ],
            en: [
                "Some tiles stayed blank in hidden capture mode",
                "Russian translation reviewed",
            ],
            ru: [
                "В скрытом режиме некоторые плитки оставались пустыми",
                "Русский перевод вычитан",
            ],
        },
    },
    {
        surum: '1.5.4',
        yeni: {
            tr: [
                "Çalışma alanları: açık sekmeleri adıyla saklayıp sonra tek tıkla açma",
                "Araç çubuğu simgesine sağ tık → sekmeleri çalışma alanına kaydet",
                "Boş alana sağ tık → açık sekmeleri gruba kaydet",
                "Arama sonuçları eşleşme gücüne göre sıralanıyor",
            ],
            en: [
                "Workspaces: save open tabs under a name and reopen them in one click",
                "Right-click the toolbar icon → save tabs to a workspace",
                "Right-click empty space → save open tabs to a group",
                "Search results are sorted by how well they match",
            ],
            ru: [
                "Рабочие области: сохраните открытые вкладки под именем и откройте их одним нажатием",
                "Правый клик по значку на панели → сохранить вкладки в рабочую область",
                "Правый клик по пустому месту → сохранить открытые вкладки в группу",
                "Результаты поиска упорядочены по точности совпадения",
            ],
        },
        duzeltme: {
            tr: [
                "Gizli kipte başarısız yakalama pencere açıyordu",
                "\"Bekleyen yakalamaları iptal et\" işlenen kartı durdurmuyordu",
            ],
            en: [
                "A failed hidden capture opened a window",
                "\"Cancel pending captures\" did not stop the tile in progress",
            ],
            ru: [
                "Неудачный скрытый снимок открывал окно",
                "«Отменить ожидающие снимки» не останавливал текущую плитку",
            ],
        },
    },
];
