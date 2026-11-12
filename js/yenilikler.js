// WSD Speed Dial - Copyright (C) 2026 muttixp - GPL-3.0-or-later
//
// YENILIKLER (1.5.6): Ayarlar › Hakkinda › Yenilikler penceresinde ve
// guncelleme sonrasi bildirimde gosterilen kisa liste. Tam liste
// CHANGELOG.md'de (pencerede GitHub dugmesi). Son birkac surum tutulur
// (1.7.1'de 1.6.0-1.6.5 cikarildi). Ag istegi yok - metin eklentinin icinde.
// Her surum: `yeni` (zorunlu) ve `duzeltme` (istege bagli), dil basina
// dizi (tr, en, ru, pt_BR, es; digerleri en'e duser). En yeni en ustte.

export const YENILIKLER = [
    {
        surum: '1.7.1',
        yeni: {
            tr: ["Kart arka planı saydam olabilir: Kart Düzenle › Arka Plan'da ve Ayarlar › Kartlar › Zemin Rengi'nde saydamlık kaydırıcısı", "Saydamlık renk kutusunun içinde: Grup Menüsü'nde ayrı saydamlık kaydırıcıları kalktı; kart çerçeve renkleri de saydam olabilir", "Hızlı Başla artık 6 sitenin yanında Sosyal, Eğlence, Teknoloji ve Alışveriş klasörlerini de logolarıyla ekliyor"],
            en: ["Tile backgrounds can be transparent: an opacity slider in Edit Tile › Background and in Settings › Tiles › Background Colour", "Opacity now lives inside the colour box: the separate opacity sliders in Group Menu are gone; tile border colours can be transparent too", "Quick Start now also adds Social, News and Shopping folders with logos, next to the 6 sites"],
            ru: ["Фон плитки может быть прозрачным: ползунок прозрачности в «Изменить › Фон» и в Настройки › Плитки › Цвет фона", "Прозрачность теперь задаётся в самом выборе цвета: отдельные ползунки в «Меню групп» убраны; цвет рамки плитки тоже может быть прозрачным", "«Быстрый старт» теперь добавляет не только 6 сайтов, но и папки Медиа, Новости и Покупки с логотипами"],
            pt_BR: ["O fundo do bloco pode ser transparente: controle de opacidade em Editar › Fundo e em Configurações › Blocos › Cor de fundo", "A opacidade agora fica no próprio seletor de cor: os controles separados do Menu de grupos saíram; a borda do bloco também pode ser transparente", "O Início rápido agora também adiciona as pastas Social, Notícias e Compras com logotipos"],
            es: ["El fondo del acceso puede ser transparente: control de opacidad en Editar › Fondo y en Ajustes › Accesos › Color de fondo", "La opacidad está ahora en el propio selector de color: se quitaron los controles aparte del Menú de grupos; el borde del acceso también puede ser transparente", "Inicio rápido ahora también añade las carpetas Social, Noticias y Compras con logos"],
        },
        duzeltme: {
            tr: ["Arka Plan renk penceresi artık ekranın köşesinde değil, düğmenin yanında açılıyor", "Arka arkaya eklenen paketlerin hepsine logo geliyor (önceden yalnız ilkine)"],
            en: ["The Background colour picker now opens next to its button, not in the screen corner", "Packs added one after another now all get logos (previously only the first)"],
            ru: ["Выбор цвета фона теперь открывается рядом с кнопкой, а не в углу экрана", "Логотипы теперь получают все наборы, добавленные подряд (раньше только первый)"],
            pt_BR: ["O seletor de cor de fundo agora abre ao lado do botão, não no canto da tela", "Pacotes adicionados em sequência agora recebem logos (antes só o primeiro)"],
            es: ["El selector de color de fondo ahora se abre junto al botón, no en la esquina", "Los paquetes añadidos seguidos ahora reciben logos (antes solo el primero)"],
        }
    },
    {
        surum: '1.7.0',
        yeni: {
            tr: ["Basit modda klasörler açılır pencerede küçük logolarla ya da liste olarak açılır; sayfa yerinde kalır, alt klasörlerde ilerleyip geri dönülür (Kartlar › Boyut ve Yerleşim › Klasörleri Pencerede Aç)", "Basit modda Ana Sayfa'ya klasör ekleyin: \"+\" › Klasör ekle (İş, Alışveriş…); klasör grup şeridine değil Ana Sayfa'ya gelir", "Hazır Düzen (Basit mod, Ayarlar'ın başında): Klasik, Sade, Galeri — boyut, aralık ve klasörlerin yeri tek tıkla", "Klasörlerin Yeri: kartlarla birlikte ya da kendi satırında üstte/altta; Basit modda klasör kutusunda 9 küçük logo", "Bölümler: alt klasöre sağ tıklayıp \"Bölüm olarak göster\" deyin, kartları ana kartların altında çerçeveli alanda görünür; bölüme bırakılan kart o klasöre taşınır", "Ana Sayfa Düzeni (Gelişmiş mod, Ayarlar › Ana Sayfa): yalnız Ana Sayfa Klasik/Sade/Galeri düzeninde ve kendi kart boyutunda; gruplar kendi ayarlarında kalır", "Başlık boş bırakılınca kart adı adres değil, sitenin adı olur (ör. sozcu.com.tr → Sözcü)"],
            en: ["In Simple mode folders open in a pop-up window with small logos or as a list; the page stays put, browse subfolders and go back (Tiles › Size and Layout › Open Folders in a Window)", "In Simple mode add folders to the Home page: \"+\" › Add folder (Work, Shopping…); the folder stays on the Home page instead of becoming a group", "Layouts (Simple mode, top of Settings): Classic, Simple, Gallery — size, spacing and folder position in one click", "Folder Position: with the tiles or in their own row at the top/bottom; in Simple mode folder boxes show 9 small logos", "Sections: right-click a subfolder › \"Show as section\" to show its tiles in a framed area below the main tiles; drop a tile on a section to move it there", "Home Page Layout (Advanced mode, Settings › Home Page): only the Home page uses Classic/Simple/Gallery and its own tile size; groups keep their settings", "Leave the title empty and the tile gets the site's name instead of its address"],
            ru: ["В простом режиме папки открываются во всплывающем окне с маленькими логотипами или списком; страница остаётся на месте, можно заходить во вложенные папки и возвращаться (Плитки › Размер и расположение › Открывать папки в окне)", "В простом режиме папки можно добавлять на главную: «+» › Добавить папку (Работа, Покупки…); папка остаётся на главной, а не становится группой", "Готовые макеты (простой режим, вверху настроек): Классика, Просто, Галерея — размер, отступы и место папок одним щелчком", "Расположение папок: вместе с плитками или отдельной строкой сверху/снизу; в простом режиме на папке 9 маленьких логотипов", "Разделы: правый клик по вложенной папке › «Показать как раздел» — её плитки видны в рамке под основными; плитку можно перетащить в раздел", "Макет главной (расширенный режим, Настройки › Главная): только главная в макете Классика/Просто/Галерея и со своим размером плиток; группы не меняются", "Если оставить название пустым, плитка получит имя сайта, а не адрес"],
            pt_BR: ["No modo Simples as pastas abrem numa janela com logos pequenos ou em lista; a página fica onde está (Blocos › Tamanho › Abrir pastas em janela)", "No modo Simples adicione pastas à página inicial: \"+\" › Adicionar pasta; a pasta fica na página inicial em vez de virar grupo", "Layouts prontos (modo Simples, topo das Configurações): Clássico, Simples, Galeria", "Posição das pastas: junto com os blocos ou numa linha própria em cima/embaixo", "Seções: clique com o botão direito numa subpasta › \"Mostrar como seção\" para ver os blocos numa área emoldurada; solte um bloco na seção para movê-lo", "Layout da página inicial (modo Avançado, Configurações › Página inicial): só a página inicial usa Clássico/Simples/Galeria e tamanho próprio; os grupos não mudam", "Com o título vazio, o bloco recebe o nome do site em vez do endereço"],
            es: ["En el modo Simple las carpetas se abren en una ventana con logos pequeños o en lista; la página no cambia (Mosaicos › Tamaño › Abrir carpetas en ventana)", "En el modo Simple añade carpetas a la página de inicio: «+» › Añadir carpeta; la carpeta queda en Inicio en lugar de ser un grupo", "Diseños (modo Simple, arriba en Ajustes): Clásico, Sencillo, Galería", "Posición de carpetas: junto a los accesos o en su propia fila arriba/abajo", "Secciones: clic derecho en una subcarpeta › «Mostrar como sección» para ver sus accesos en un área enmarcada; suelta un acceso en la sección para moverlo", "Diseño de Inicio (modo Avanzado, Ajustes › Inicio): solo Inicio usa Clásico/Sencillo/Galería y su propio tamaño; los grupos no cambian", "Si dejas el título vacío, el acceso recibe el nombre del sitio en lugar de la dirección"],
        },
        duzeltme: {
            tr: ["Adresten eklenen bazı logoların bağlantısı kaydolmuyordu (büyük görsel küçültülünce kayboluyordu); düzeltildi", "Klasör penceresinden açılan Düzenle ve diğer pencereler artık altta kalmıyor", "Klasördeki görseller yenilenince klasör kutusu da sayfa yenilenmeden güncelleniyor"],
            en: ["The address of some logos added from a URL was not kept; fixed", "Edit and other windows opened from a folder window no longer stay underneath it", "Folder boxes update right away when the images inside them are refreshed"],
            ru: ["Ссылка на некоторые логотипы, добавленные по адресу, не сохранялась — исправлено", "Окна «Изменить» и другие, открытые из окна папки, больше не остаются под ним", "Значок папки обновляется сразу после обновления изображений внутри"],
            pt_BR: ["O link de alguns logotipos adicionados por endereço não era mantido; corrigido", "Janelas abertas a partir da janela de pasta não ficam mais por baixo dela", "A caixa da pasta é atualizada assim que as imagens dentro dela são renovadas"],
            es: ["El enlace de algunos logotipos añadidos por dirección no se guardaba; corregido", "Las ventanas abiertas desde una carpeta ya no quedan debajo de ella", "La caja de la carpeta se actualiza en cuanto se renuevan sus imágenes"],
        },
    },
    {
        surum: '1.6.6',
        yeni: {
            tr: ["Görsel Boyutu (Kartı Düzenle, önizlemenin altında): ortada Sığdır, sağa çekince görsel büyür ve \"Doldur\" noktasında boşluk kapanır, sola çekince kenar boşluğu", "Dikey Konum: kartları ekranın dikey ortasına alın (Kartlar › Boyut ve Yerleşim)"],
            en: ["Image Size (Edit Tile, under the preview): middle is Fit, drag right to enlarge until the gaps close at \"Fill\", left for an edge margin", "Vertical Position: centre the tiles vertically on the page (Tiles › Size and Layout)"],
            ru: ["Размер изображения (окно «Изменить плитку», под превью): в центре «Вписать», вправо — увеличить до «Заполнить», где пустые поля исчезают, влево — отступ", "Положение по вертикали: плитки по центру экрана (Плитки › Размер и расположение)"],
            pt_BR: ["Tamanho da imagem (Editar, abaixo da prévia): no meio Ajustar, para a direita amplia até \"Preencher\", para a esquerda adiciona margem", "Posição vertical: centralize os blocos na vertical (Blocos › Tamanho)"],
            es: ["Tamaño de imagen (Editar, bajo la vista previa): en el centro Ajustar, a la derecha amplía hasta «Rellenar», a la izquierda añade margen", "Posición vertical: centra los accesos verticalmente (Mosaicos › Tamaño)"],
        },
        duzeltme: {
            tr: ["Kenar Boşluğu artık Doldur'daki görsellerde de çalışıyor (WSD'nin ürettiği logolar dahil)", "Sağ kenardaki ince şerit kaldırıldı (kaydırma yokken çubuğun boş yeri görünüyordu)"],
            en: ["Edge Margin now also works for images shown with Fill (including logos made by WSD)", "Removed the thin strip on the right edge (empty scrollbar space when the page did not scroll)"],
            ru: ["«Отступ от краёв» теперь работает и в режиме «Заполнить» (включая логотипы, созданные WSD)", "Убрана тонкая полоса справа (пустое место полосы прокрутки, когда прокрутки нет)"],
            pt_BR: ["A Margem agora também funciona em Preencher (incluindo logotipos gerados pelo WSD)", "Removida a faixa fina na borda direita (espaço vazio da barra de rolagem)"],
            es: ["El Margen ahora también funciona con Rellenar (incluidos los logotipos generados por WSD)", "Se quitó la franja fina del borde derecho (espacio vacío de la barra de desplazamiento)"],
        },
    }
];
