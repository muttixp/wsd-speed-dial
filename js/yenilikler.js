// WSD Speed Dial - Copyright (C) 2026 muttixp - GPL-3.0-or-later
//
// YENILIKLER (1.5.6): Ayarlar › Hakkinda › Yenilikler penceresinde ve
// guncelleme sonrasi bildirimde gosterilen kisa liste. Tam liste
// CHANGELOG.md'de. Ag istegi yok - metin eklentinin icinde.
// Her surum: `yeni` (zorunlu) ve `duzeltme` (istege bagli), dil basina
// dizi (tr, en, ru, pt_BR, es; digerleri en'e duser). En yeni en ustte.

export const YENILIKLER = [
    {
        surum: '1.6.2',
        yeni: {
            tr: ["Yapay zekâ ile arama: Perplexity, ChatGPT, Claude, Copilot (Arama Çubuğu, kısayollar px, gpt, cl, co)", "Sağ tık menüsündeki \"Çalışma alanına ekle\" kapatılabilir (Sistem › Sağ Tık Menüsü)", "Kart filtresine Tersine Çevir: koyu zeminli logo açık zemine geçer, renkler korunur"],
            en: ["Search with AI: Perplexity, ChatGPT, Claude, Copilot (Search Bar, shortcuts px, gpt, cl, co)", "\"Add to workspace\" in the right-click menu can be turned off (System › Right-Click Menu)", "Invert in the tile image filter: a logo on a dark background moves to a light one, colors stay"],
            ru: ["Поиск с ИИ: Perplexity, ChatGPT, Claude, Copilot (Строка поиска, сокращения px, gpt, cl, co)", "Пункт «Добавить в рабочую область» в контекстном меню можно отключить (Система › Контекстное меню)", "Инвертировать в фильтре изображения: логотип на тёмном фоне переходит на светлый, цвета сохраняются"],
            pt_BR: ["Pesquisa com IA: Perplexity, ChatGPT, Claude, Copilot (Barra de pesquisa, atalhos px, gpt, cl, co)", "\"Adicionar ao espaço de trabalho\" no menu do clique direito pode ser desativado (Sistema › Menu de clique direito)", "Inverter no filtro de imagem: um logotipo com fundo escuro passa para fundo claro, as cores ficam"],
            es: ["Búsqueda con IA: Perplexity, ChatGPT, Claude, Copilot (Barra de búsqueda, atajos px, gpt, cl, co)", "\"Añadir al espacio de trabajo\" del menú contextual se puede desactivar (Sistema › Menú contextual)", "Invertir en el filtro de imagen: un logotipo con fondo oscuro pasa a fondo claro, los colores se mantienen"],
        },
        duzeltme: {
            tr: ["Koyulaştır'ın adı Tersine Çevir oldu: ışığı ters çevirir, açık resim koyulaşır, koyu resim açılır", "Değerlendirme isteği artık yalnızca eklentiyi bir süredir kullananlara, en çok iki kez çıkıyor", "Küçük hata düzeltmeleri ve iyileştirmeler"],
            en: ["Darken is now Invert: it flips lightness, so light images get dark and dark images get light", "The review request now appears only to people who have used WSD for a while, at most twice", "Small fixes and improvements"],
            ru: ["«Затемнить» теперь «Инвертировать»: яркость переворачивается, светлое темнеет, тёмное светлеет", "Просьба об отзыве теперь появляется только тем, кто пользуется WSD какое-то время, не больше двух раз", "Мелкие исправления и улучшения"],
            pt_BR: ["Escurecer agora é Inverter: inverte a luminosidade, o claro escurece e o escuro clareia", "O pedido de avaliação agora só aparece para quem já usa o WSD há algum tempo, no máximo duas vezes", "Pequenas correções e melhorias"],
            es: ["Oscurecer ahora es Invertir: invierte la luminosidad, lo claro se oscurece y lo oscuro se aclara", "La solicitud de valoración ahora solo aparece a quien ya usa WSD desde hace un tiempo, como mucho dos veces", "Pequeñas correcciones y mejoras"],
        },
    },
    {
        surum: '1.6.1',
        yeni: {
            tr: ["Arayüz: Basit | Gelişmiş — Basit, küçük logolu kartlarla sade bir sayfa ve kısa bir ayar listesi verir (Ayarlar'ın en üstü)", "Hızlı Başla: karşılama ekranında tek tıkla bilinen siteler, logolarıyla", "Hazır duvar kâğıtları: iki yeni zemin (dalga, ipek); açık/koyu hali moda göre gelir (Görünüm › Arka Plan)", "Tersine Çevir: duvar kâğıdının ışığını ters çevirir, açık resim koyu moda uyar (Arka Plan › Renklendirme)", "Görsel filtresi: kart görselini tek renge, siyah-beyaza, sepyaya çevirin (Kartı Düzenle › Filtre)", "Temalar eşit: koyu ve açık modda 10'ar eş tema; yeni: Toprak, Gümüş, Mercan", "Arama önerileri: isteğe bağlı, kapalı gelir (Ana Sayfa › Arama Çubuğu)"],
            en: ["Interface: Simple | Advanced — Simple gives you a clean page with small logo tiles and a short settings list (top of Settings)", "Quick Start: popular sites with their logos in one click on the welcome screen", "Built-in wallpapers: two new backgrounds (wave, silk); the light or dark version follows the mode (Appearance › Background)", "Invert: flips the wallpaper's lightness so a light image fits dark mode (Background › Tinting)", "Image filter: turn a tile image into one color, black & white or sepia (Edit Tile › Filter)", "Matching themes: 10 paired themes in dark and light mode; new: Earth, Silver, Coral", "Search suggestions: optional, off by default (Home › Search Bar)"],
            ru: ["Интерфейс: Простой | Расширенный — простой режим даёт аккуратную страницу с небольшими плитками-логотипами и коротким списком настроек (в начале настроек)", "Быстрый старт: популярные сайты с логотипами в один клик на экране приветствия", "Готовые обои: два новых фона (волна, шёлк); светлый или тёмный вариант подбирается по режиму (Внешний вид › Фон)", "Инвертировать: яркость обоев переворачивается, светлые обои подходят тёмному режиму (Фон › Тонирование)", "Фильтр изображения: сделайте картинку плитки одноцветной, чёрно-белой или сепией (Изменить плитку › Фильтр)", "Парные темы: по 10 тем в тёмном и светлом режиме; новые: Земля, Серебро, Коралл", "Подсказки поиска: по желанию, по умолчанию выключены (Главная › Строка поиска)"],
            pt_BR: ["Interface: Simples | Avançado — o modo Simples mostra uma página limpa com blocos pequenos de logotipos e poucas configurações (topo das Configurações)", "Início rápido: sites populares com seus logotipos em um clique na tela de boas-vindas", "Papéis de parede prontos: dois novos fundos (onda, seda); a versão clara ou escura segue o modo (Aparência › Fundo)", "Inverter: inverte a luminosidade do papel de parede; um fundo claro combina com o modo escuro (Fundo › Tonalização)", "Filtro de imagem: deixe a imagem do bloco em uma cor, preto e branco ou sépia (Editar bloco › Filtro)", "Temas pareados: 10 temas em cada modo, claro e escuro; novos: Terra, Prata, Coral", "Sugestões de pesquisa: opcionais, desligadas por padrão (Início › Barra de pesquisa)"],
            es: ["Interfaz: Simple | Avanzado — el modo Simple muestra una página limpia con mosaicos pequeños de logotipos y pocos ajustes (arriba en Ajustes)", "Inicio rápido: sitios populares con sus logotipos en un clic en la pantalla de bienvenida", "Fondos incluidos: dos fondos nuevos (onda, seda); la versión clara u oscura sigue el modo (Apariencia › Fondo)", "Invertir: invierte la luminosidad del fondo; uno claro encaja en el modo oscuro (Fondo › Tinte)", "Filtro de imagen: pon la imagen del mosaico en un solo color, blanco y negro o sepia (Editar mosaico › Filtro)", "Temas emparejados: 10 temas en cada modo, claro y oscuro; nuevos: Tierra, Plata, Coral", "Sugerencias de búsqueda: opcionales, desactivadas por defecto (Inicio › Barra de búsqueda)"],
        },
        duzeltme: {
            tr: ["Koyu temada saydam logolar artık okunuyor: koyu logo beyaz, açık logo koyu kutuda", "Yandex araması tarayıcı diline göre doğru siteye gidiyor", "Ayar adları kısa ve tutarlı; ayar araması \"kart boyutu\" gibi aramaları da buluyor", "Küçük hata düzeltmeleri ve iyileştirmeler"],
            en: ["Transparent logos are readable in dark themes: dark logos sit on white, light logos on dark", "Yandex search now opens the right site for your browser language", "Shorter, consistent setting names; settings search understands phrases like \"tile size\"", "Small fixes and improvements"],
            ru: ["Прозрачные логотипы теперь видны в тёмных темах: тёмный логотип на белом, светлый — на тёмном", "Поиск Яндекса открывает сайт для языка браузера (yandex.ru для русского)", "Короткие и единые названия настроек; поиск настроек понимает фразы вроде «размер плитки»", "Мелкие исправления и улучшения"],
            pt_BR: ["Logotipos transparentes ficam legíveis nos temas escuros: logotipo escuro no branco, claro no escuro", "A pesquisa do Yandex abre o site certo para o idioma do navegador", "Nomes de configurações mais curtos e consistentes; a busca de configurações entende frases como \"tamanho do bloco\"", "Pequenas correções e melhorias"],
            es: ["Los logotipos transparentes se leen en los temas oscuros: logotipo oscuro sobre blanco, claro sobre oscuro", "La búsqueda de Yandex abre el sitio correcto según el idioma del navegador", "Nombres de ajustes más cortos y coherentes; la búsqueda de ajustes entiende frases como \"tamaño del mosaico\"", "Pequeñas correcciones y mejoras"],
        },
    },
    {
        surum: '1.6.0',
        yeni: {
            tr: ["Çalışma alanlarında arama: ad, etiket, not ve sekmelerde (/ tuşu)", "Pencereyle eşitle: kaydı bu penceredeki sekmelerle tek tıkla güncelleyin", "Hafif açma: kayıt açılınca sekmeler tıklayınca yüklenir, bilgisayar yorulmaz", "Kayıtları üste sabitleyin; kartta son açılış zamanı", "Sağ tık › Çalışma alanına ekle: sayfayı doğrudan bir kayda ekleyin", "Açık/koyu mod değişince temanın eşi gelir: Orman ↔ Nane, Okyanus ↔ Buz…"],
            en: ["Search in workspaces: names, tags, notes and tabs (/ key)", "Sync with this window: update saved tabs from the current window in one click", "Light opening: tabs load when you click them, so opening many is easy on your computer", "Pin saved tabs to the top; cards show when they were last opened", "Right-click › Add to workspace: add the page straight to saved tabs", "Switching light/dark mode now picks the matching theme: Forest ↔ Mint, Ocean ↔ Ice…"],
            ru: ["Поиск в рабочих областях: названия, метки, заметки и вкладки (клавиша /)", "Синхронизация с окном: обновите сохранённые вкладки из текущего окна в один клик", "Лёгкое открытие: вкладки загружаются по щелчку и не нагружают компьютер", "Закрепляйте области сверху; на карточке время последнего открытия", "Правый щелчок › Добавить в рабочую область: страница сразу попадает в сохранённые вкладки", "При смене светлого/тёмного режима выбирается парная тема"],
            pt_BR: ["Busca nos espaços de trabalho: nomes, tags, notas e abas (tecla /)", "Sincronizar com esta janela: atualize as abas salvas com um clique", "Abertura leve: as abas carregam quando você clica nelas", "Fixe espaços no topo; o cartão mostra quando foi aberto pela última vez", "Clique direito › Adicionar ao espaço de trabalho: adicione a página direto às abas salvas", "Ao trocar entre modo claro e escuro, o tema correspondente é escolhido"],
            es: ["Búsqueda en los espacios de trabajo: nombres, etiquetas, notas y pestañas (tecla /)", "Sincronizar con esta ventana: actualiza las pestañas guardadas con un clic", "Apertura ligera: las pestañas se cargan al hacer clic en ellas", "Fija espacios arriba; la tarjeta muestra cuándo se abrió por última vez", "Clic derecho › Añadir al espacio de trabajo: añade la página directamente", "Al cambiar entre modo claro y oscuro se elige el tema equivalente"],
        },
        duzeltme: {
            tr: ["Gizli yakalama: açılış animasyonlu sitelerde görüntü artık yarıda kalmıyor", "Sahne Yakala: eklentilere kapalı sayfada artık boşuna beklemiyorsunuz, uyarı çıkıyor", "Koyu temalarda grup menüsü daha sade: aktif gruptaki beyaz halka ve seridin kenar çizgisi kaldırıldı", "Küçük hata düzeltmeleri ve iyileştirmeler"],
            en: ["Silent capture: sites with intro animations no longer come out half-drawn", "Capture Scene: on pages closed to extensions you now get a notice instead of waiting", "Cleaner group menu in dark themes: the white ring on the active group and the bar's border are gone", "Small fixes and improvements"],
            ru: ["Тихий режим: сайты с анимацией появления больше не снимаются наполовину", "Снять сцену: на страницах, закрытых для расширений, теперь появляется предупреждение", "Панель групп в тёмных темах аккуратнее: убраны белая рамка активной группы и обводка панели", "Мелкие исправления и улучшения"],
            pt_BR: ["Captura silenciosa: sites com animações de entrada não saem mais pela metade", "Capturar cena: em páginas fechadas a extensões agora aparece um aviso", "Barra de grupos mais limpa nos temas escuros: sem o anel branco no grupo ativo e sem a borda da barra", "Pequenas correções e melhorias"],
            es: ["Captura silenciosa: los sitios con animaciones de entrada ya no salen a medias", "Capturar escena: en páginas cerradas a las extensiones ahora aparece un aviso", "Barra de grupos más limpia en los temas oscuros: sin el anillo blanco del grupo activo ni el borde de la barra", "Pequeñas correcciones y mejoras"],
        },
    },
    {
        surum: '1.5.9',
        yeni: {
            tr: ["Özellikler penceresi: neler yapabildiğini tek listede görün, \"Göster\" ile ayara gidin (Ayarlar › Hakkında)", "Menü Konumu: grup menüsü sol üst köşede, boşluksuz (Ayarlar › Görünüm › Grup Menüsü)", "Menü simgeleri ve açma/kapama anahtarları artık temanın renginde", "Koyu temalarda aktif grup daha belirgin", "Bulut Klasörü artık Yedek Klasörü: yerel klasör ya da bulut klasörü, ikisi de olur"],
            en: ["Features window: see everything WSD can do in one list, \"Show\" takes you to the setting (Settings › About)", "Menu Position: the group menu can sit in the top-left corner with no gap (Settings › Appearance › Group Menu)", "Menu icons and toggles now follow the theme colour", "The active group stands out more in dark themes", "Cloud Folder is now Backup Folder: a local folder or a cloud folder, both work"],
            ru: ["Окно «Возможности»: всё, что умеет WSD, в одном списке; «Показать» открывает настройку (Настройки › О расширении)", "Положение меню: панель групп может стоять в левом верхнем углу без отступов (Настройки › Внешний вид › Панель групп)", "Значки меню и переключатели теперь в цвете темы", "Активная группа заметнее в тёмных темах", "«Облачная папка» теперь «Папка для копий»: подходит и локальная, и облачная папка"],
            pt_BR: ["Janela Recursos: tudo o que o WSD faz numa lista; \"Mostrar\" leva à configuração (Configurações › Sobre)", "Posição do menu: a barra de grupos pode ficar no canto superior esquerdo, sem espaço (Configurações › Aparência › Barra de grupos)", "Os ícones dos menus e os interruptores agora seguem a cor do tema", "O grupo ativo se destaca mais nos temas escuros", "Pasta na nuvem agora é Pasta de backup: pode ser uma pasta local ou na nuvem"],
            es: ["Ventana Funciones: todo lo que hace WSD en una lista; \"Mostrar\" lleva al ajuste (Ajustes › Acerca de)", "Posición del menú: la barra de grupos puede ir en la esquina superior izquierda, sin margen (Ajustes › Apariencia › Barra de grupos)", "Los iconos de los menús y los interruptores siguen ahora el color del tema", "El grupo activo destaca más en los temas oscuros", "Carpeta en la nube ahora es Carpeta de copias: sirve una carpeta local o en la nube"],
        },
    },
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
                "Yedek Klasörü: yedekleri yerel ya da OneDrive / Google Drive / Dropbox klasörüne yazın, başka bilgisayarda aynı klasörden geri yükleyin",
                "Her tarayıcı kendi adıyla ayrı alt klasöre yazar; aynı ad iki bilgisayarda ortak yedek setidir",
                "Daha sade ayarlar: 7 ana bölüm, açılır alt bölümler ve en üstte \"Ayar ara\" kutusu",
                "Aramadan gruba gidince aranan kart öne çıkar, diğerleri soluklaşır",
                "Portekizce (Brezilya) ve İspanyolca arayüz tamamlandı",
            ],
            en: [
                "Backup Folder: write backups to a local, OneDrive, Google Drive or Dropbox folder and restore them on another computer",
                "Each browser writes to its own named subfolder; the same name on two computers shares one backup set",
                "Simpler settings: 7 main sections, collapsible subsections and a \"Search settings\" box at the top",
                "Jumping from search to a group now spotlights the tile you were looking for",
                "Portuguese (Brazil) and Spanish interface completed",
            ],
            ru: [
                "Папка для копий: сохраняйте копии в локальную папку или папку OneDrive, Google Диска, Яндекс Диска, Dropbox и восстанавливайте на другом компьютере",
                "Каждый браузер пишет в свою подпапку; одинаковое имя на двух компьютерах — общий набор копий",
                "Настройки проще: 7 разделов, раскрывающиеся подразделы и поле «Поиск настроек» вверху",
                "При переходе из поиска в группу найденная плитка выделяется, остальные затемняются",
                "Интерфейс на португальском (Бразилия) и испанском завершён",
            ],
            pt_BR: [
                "Pasta de backup: salve backups numa pasta local, do OneDrive, Google Drive ou Dropbox e restaure em outro computador",
                "Cada navegador grava na sua própria subpasta; o mesmo nome em dois computadores compartilha um conjunto de backups",
                "Configurações mais simples: 7 seções, subseções recolhíveis e uma caixa \"Pesquisar configurações\" no topo",
                "Ao ir da pesquisa para um grupo, o bloco procurado fica em destaque",
                "Interface em português (Brasil) e espanhol completa",
            ],
            es: [
                "Carpeta de copias: guarda copias en una carpeta local, de OneDrive, Google Drive o Dropbox y restáuralas en otro equipo",
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
