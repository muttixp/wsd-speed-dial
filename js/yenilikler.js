// WSD Speed Dial - Copyright (C) 2026 muttixp - GPL-3.0-or-later
//
// YENILIKLER (1.5.6): Ayarlar › Hakkinda › Yenilikler penceresinde ve
// guncelleme sonrasi bildirimde gosterilen kisa liste. Tam liste
// CHANGELOG.md'de. Ag istegi yok - metin eklentinin icinde.
// Her surum: `yeni` (zorunlu) ve `duzeltme` (istege bagli), dil basina
// dizi (tr, en, ru, pt_BR, es; digerleri en'e duser). En yeni en ustte.

export const YENILIKLER = [
    {
        surum: '1.5.8',
        yeni: {
            tr: ["Açılış Grubu: yeni sekmede hangi grubun açılacağını seçin (Ayarlar › Ana Sayfa)", "FVD'den görselleriyle geçiş rehberi (Ayarlar › Yedekleme ve Aktarma › İçe Aktar)", "İçe aktarmada yedeğin türü önceden gösterilir; desteklenmeyen dosya tek tıkla bildirilir"],
            en: ["Start Group: choose which group opens in new tabs (Settings › Home)", "Guide for moving from FVD with thumbnails (Settings › Backup and Import › Import)", "Import shows what the backup is before loading it; unsupported files can be reported in one click"],
            ru: ["Группа при открытии: выберите, какая группа открывается в новой вкладке (Настройки › Главная)", "Инструкция по переносу из FVD с изображениями (Настройки › Резервная копия и импорт › Импорт)", "Импорт заранее показывает тип копии; неподдерживаемый файл можно сообщить одним щелчком"],
            pt_BR: ["Grupo inicial: escolha qual grupo abre nas novas abas (Configurações › Início)", "Guia para migrar do FVD com miniaturas (Configurações › Backup e importação › Importar)", "A importação mostra o tipo do backup antes de carregar; arquivos não suportados podem ser informados com um clique"],
            es: ["Grupo inicial: elige qué grupo se abre en las pestañas nuevas (Ajustes › Inicio)", "Guía para migrar desde FVD con miniaturas (Ajustes › Copia e importación › Importar)", "La importación muestra el tipo de copia antes de cargarla; un archivo no compatible se informa con un clic"],
        },
        duzeltme: {
            tr: ["Grupları Yönet'te kalemle açılan düzenleme penceresindeki değişiklikler kaydedilmiyordu"],
            en: ["Changes made in Edit Group opened from the pencil in Manage Groups were not saved"],
            ru: ["Изменения в окне «Изменить группу», открытом карандашом из «Управления группами», не сохранялись"],
            pt_BR: ["Alterações em Editar grupo aberto pelo lápis em Gerenciar grupos não eram salvas"],
            es: ["Los cambios en Editar grupo abierto con el lápiz de Gestionar grupos no se guardaban"],
        },
    },
    {
        surum: '1.5.7',
        yeni: {
            tr: [
                "Bulut Klasörü (deneysel): yedekleri yerel ya da OneDrive / Google Drive / Dropbox klasörüne yazın, başka bilgisayarda aynı klasörden geri yükleyin",
                "Her tarayıcı kendi adıyla ayrı alt klasöre yazar; aynı ad iki bilgisayarda ortak yedek setidir",
                "Daha sade ayarlar: 7 ana bölüm, açılır alt bölümler ve en üstte \"Ayar ara\" kutusu",
                "Aramadan gruba gidince aranan kart öne çıkar, diğerleri soluklaşır",
                "Portekizce (Brezilya) ve İspanyolca arayüz tamamlandı",
            ],
            en: [
                "Cloud Folder (experimental): write backups to a local, OneDrive, Google Drive or Dropbox folder and restore them on another computer",
                "Each browser writes to its own named subfolder; the same name on two computers shares one backup set",
                "Simpler settings: 7 main sections, collapsible subsections and a \"Search settings\" box at the top",
                "Jumping from search to a group now spotlights the tile you were looking for",
                "Portuguese (Brazil) and Spanish interface completed",
            ],
            ru: [
                "Облачная папка (экспериментально): сохраняйте копии в локальную папку или папку OneDrive, Google Диска, Яндекс Диска, Dropbox и восстанавливайте на другом компьютере",
                "Каждый браузер пишет в свою подпапку; одинаковое имя на двух компьютерах — общий набор копий",
                "Настройки проще: 7 разделов, раскрывающиеся подразделы и поле «Поиск настроек» вверху",
                "При переходе из поиска в группу найденная плитка выделяется, остальные затемняются",
                "Интерфейс на португальском (Бразилия) и испанском завершён",
            ],
            pt_BR: [
                "Pasta na nuvem (experimental): salve backups numa pasta local, do OneDrive, Google Drive ou Dropbox e restaure em outro computador",
                "Cada navegador grava na sua própria subpasta; o mesmo nome em dois computadores compartilha um conjunto de backups",
                "Configurações mais simples: 7 seções, subseções recolhíveis e uma caixa \"Pesquisar configurações\" no topo",
                "Ao ir da pesquisa para um grupo, o bloco procurado fica em destaque",
                "Interface em português (Brasil) e espanhol completa",
            ],
            es: [
                "Carpeta en la nube (experimental): guarda copias en una carpeta local, de OneDrive, Google Drive o Dropbox y restáuralas en otro equipo",
                "Cada navegador escribe en su propia subcarpeta; el mismo nombre en dos equipos comparte un conjunto de copias",
                "Ajustes más simples: 7 secciones, subsecciones plegables y un cuadro \"Buscar ajustes\" arriba",
                "Al ir de la búsqueda a un grupo, el mosaico buscado se resalta",
                "Interfaz en portugués (Brasil) y español completada",
            ],
        },
        duzeltme: {
            tr: [
                "Kart Hizalama \"Ortaya\"yken arama etiketleri alt alta diziliyordu",
            ],
            en: [
                "With tile alignment \"Centered\", search tags were stacked vertically",
            ],
            ru: [
                "При выравнивании плиток «По центру» метки поиска выстраивались столбиком",
            ],
            pt_BR: [
                "Com o alinhamento \"Centralizado\", as tags da pesquisa ficavam empilhadas",
            ],
            es: [
                "Con la alineación \"Centrada\", las etiquetas de búsqueda se apilaban",
            ],
        },
    },
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
            pt_BR: [
                "Papéis de parede padrão com padrões; o ajuste de cor (matiz, saturação, brilho) agora também se aplica a eles",
                "O ajuste de cor é lembrado separadamente para cada tema",
                "Novos temas: Rubi, Âmbar (escuros) · Rosa, Sol (claros)",
                "\"Atualizar\" salva num clique as alterações de um tema que você salvou",
                "Alinhamento dos blocos: centralizado ou à esquerda (Configurações › Blocos)",
                "16 novos ícones de grupo: Wi-Fi, computador, telefone, anotação, calendário, comida e mais",
            ],
            es: [
                "Fondos de pantalla predeterminados con patrones; el coloreado (tono, saturación, brillo) ahora también se les aplica",
                "El coloreado se recuerda por separado para cada tema",
                "Temas nuevos: Rubí, Ámbar (oscuros) · Rosa, Sol (claros)",
                "\"Actualizar\" guarda con un clic los cambios de un tema que guardaste",
                "Alineación de mosaicos: centrados o a la izquierda (Ajustes › Mosaicos)",
                "16 iconos de grupo nuevos: Wi-Fi, ordenador, teléfono, nota, calendario, comida y más",
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
            pt_BR: [
                "A imagem escolhida por você para um bloco era substituída por uma nova captura ou ao mudar o endereço",
                "Os ícones do painel lateral eram difíceis de ver no modo claro",
                "Os temas salvos sumiam ao importar ou redefinir as configurações",
            ],
            es: [
                "La imagen que elegiste para un mosaico se sustituía por una nueva captura o al cambiar la dirección",
                "Los iconos del panel lateral se veían mal en el modo claro",
                "Los temas guardados se perdían al importar o restablecer los ajustes",
            ],
        },
    },
];
