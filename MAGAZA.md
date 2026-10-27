# Chrome Web Store — listeleme metinleri

Bu dosya depoda kalmak zorunda değil; mağaza formunu doldururken
kopyalayıp yapıştırmak için hazırlandı.

---

## Ad

Paketten (`extName`, dile göre) gelir; mağaza her kullanıcıya kendi dilindekini gösterir.
Aramada en çok ağırlık taşıyan alan; listelerde ~45 karakterden sonrası kırpılır.

| Dil | Ad |
|---|---|
| EN (varsayılan) | WSD Speed Dial – New Tab & Visual Bookmarks |
| TR | WSD Speed Dial – Yeni Sekme, Görsel Yer İmleri |
| RU | WSD Speed Dial – визуальные закладки |
| PT-BR | WSD Speed Dial – Nova Aba e Favoritos Visuais |
| PT-PT | WSD Speed Dial – Novo Separador e Marcadores |
| ES | WSD Speed Dial – Nueva Pestaña y Marcadores |
| UK | WSD Speed Dial – візуальні закладки |
| ZH-CN | WSD Speed Dial – 新标签页与可视化书签 |

1.5.8'den itibaren kısa açıklama da bu dillerde pakette (`extDesc`).

## Kısa açıklama (132 karakter sınırı)

Mağaza bu metni manifest'teki `extDesc`'ten (dil dosyaları) alır; aşağıdakiler
1.5.4 paketindeki ile aynı. Mağaza araması başlığa ve bu metne bakıyor:
"speed dial", "new tab", "visual bookmarks", "workspaces", "web search"
ve taşıma kaynakları (FVD, Speed Dial) bilerek burada. "Speed Dial" hem
Speed Dial 2'yi hem .spd yedekli "Speed Dial"ı kapsıyor. Rusçada
"визуальные закладки" başa alındı: oradaki kullanıcıların aradığı ifade.

**İngilizce**
```
Speed dial for your new tab: visual bookmarks, folders, workspaces and web search. Import from FVD and Speed Dial. No account.
```
(126 karakter)

**Türkçe**
```
Yeni sekme için speed dial: görsel yer imleri, klasörler, çalışma alanları, web araması. FVD ve Speed Dial'den taşıma. Hesap yok.
```
(129 karakter)

**Rusça**
```
Визуальные закладки для новой вкладки: папки, рабочие области, поиск Яндекса. Перенос из FVD и Speed Dial в один клик. Без аккаунта.
```
(132 karakter)

---

## Uzun açıklama

**İngilizce**

```
WSD Speed Dial turns your new tab page into a board of the sites you
actually use, each with its own screenshot. Free, open source, no
tracking.

SIMPLE OR ADVANCED — YOUR CHOICE

Want just a clean page? Simple mode gives you small logo tiles on a
calm wallpaper, with a short settings list. Quick Start fills it with
popular sites and their logos in one click. Need more? Advanced mode
opens groups, folders and every setting. Switch any time; nothing is
lost.

COMING FROM ANOTHER SPEED DIAL?

Bring everything over in one click from FVD Speed Dial and other speed
dial extensions: groups, tiles and their order. If a backup carries no
images, WSD offers to capture them in the background, without opening
windows. A bookmarks HTML file from any browser works the same way.
Moving from FVD Speed Dial? A short guide brings your thumbnails over
too (Settings › Backup and Import › Import).

SEARCH THE WEB FROM THE HOME PAGE

A search box on the home page. Use your browser's default search engine
or pick another one from the list; add your own engine with a single
address, reorder the list, or hide the box entirely.

WHY IT'S DIFFERENT

Your tiles are stored as ordinary browser bookmarks — not in a
database we control. Three things follow from that:

• Browser sync works out of the box. Add a tile on one machine, it
  appears on the other.
• Your data is never locked in. Open the bookmark manager any time
  and there it is.
• Uninstalling doesn't lose anything. The bookmarks stay.

MOVE WITHOUT LOSING ANYTHING — NO SYNC SERVICE NEEDED

You don't need a sync service. One backup file (JSON) carries
everything to another computer or another browser, and one click
restores it. Tiles, groups, folders, thumbnails, notes, tags and
settings travel together. No account, no server — so no login to
lose and no sync accident that wipes your dials.

MERGE, DON'T OVERWRITE

Restoring offers two choices: replace what you have, or ADD to it.
Add leaves your existing tiles untouched and merges the backup in:
groups with the same name are combined, and a site you already have
in that group is not duplicated. Have dials in two browsers? Back up
one, add it to the other, and you end up with a single collection.

The backup is a complete file on your own disk, thumbnails included.
It is free: there is no paid sync service and nothing held back.

Want it automatic? Pick a folder once — for example your OneDrive or
Google Drive folder — and WSD writes the backup there on its own; on
another computer you restore from the same folder in one click. Each
browser keeps its own named set, so several browsers never mix.

SAVE YOUR OPEN TABS AS WORKSPACES

Working on something for a day or a project? Save the open tabs as a
workspace and close them. Reopen them later with one click, in the
current window or a new one. Edit a workspace from your open tabs,
add tags, a note and a color, reorder by drag and drop. Tabs are not
closed when you save. When it's worth keeping, turn it into a regular
group with thumbnails; when you're done, delete it. Workspaces are
stored as bookmarks and are included in backups.

Search across your workspaces, pin the ones you use most, sync a
workspace with the current window in one click, or add the page you
are on from the right-click menu. When a workspace opens, only the
first tab loads; the others load when you click them.

WHAT IT DOES

Tiles
- Screenshots are captured automatically when you add a page
- Don't like the image? Pick another candidate, upload a file, or
  give an image address
- Notes, color labels, visit counters
- Named tags with your own colors, several per tile; open search to
  see all tags and click one to list its tiles across every group
- Drag to reorder, drag to move between groups
- One-off sorting by name, visits or date added

Groups and folders
- Groups in the top bar; reorder by dragging
- Start group: choose which group every new tab opens with
- NESTED FOLDERS inside groups, exactly like your bookmark folders:
  a folder tile shows a preview of its first four sites, click to go
  in, a path bar shows where you are
- Back / forward like a file explorer: mouse side buttons, Alt+Left /
  Alt+Right; Backspace goes up one folder
- Drag tiles onto a folder to move them; drag folders to reorder or
  to put one inside another
- 22 icons, custom emoji or a site favicon for groups and folders;
  notes, color labels, background color and a cover image for folders
- Move dialog shows groups and folders as a tree; search finds folders
  too

Your data
- Ready-made groups: add a starter pack (Daily, Developer, Learning…)
  in one click; packs are kept in the open GitHub repository
- Backup and restore (folder structure included); one Import button
  that recognises the file: a WSD backup, a backup from another speed
  dial extension, or a bookmarks HTML file
- Restore can REPLACE or MERGE: merging combines groups with the same
  name and skips sites you already have
- Import your existing browser bookmarks: every top-level folder
  becomes a group and its subfolders stay as folders
- Broken link scan
- Export as a standalone HTML page
- Trash: deleted tiles and groups are kept for 30 days
- Storage monitor with a warning before space runs out
- Consistency check that finds missing images and duplicates
- Open tabs stay in sync with each other

Looks
- Light and dark mode, ready-made themes, save your own theme
- Optional frosted-glass look for menus, panels and the search box
- Wallpaper, background tinting (hue shift or duotone)
- Tile ratio, size, spacing, borders
- One corner setting for tiles, tabs, menus, windows and buttons
- Group menu colors (including text colors) and size; side toolbar can auto-hide

PRIVACY

No account. No servers. No analytics. Nothing leaves your browser.
Outbound requests go only where your own actions point: the page you
asked to capture, a favicon lookup if you choose one as a group icon,
a logo lookup if you press "Capture Logo", the broken-link check, and
the search engine you pick in the search box (your query, plus that
engine's icon, fetched once), and the pack list from the project's
GitHub repository when you open Ready-made groups.

OPEN SOURCE

GPL-3.0. Full source at:
https://github.com/muttixp/wsd-speed-dial

Written from scratch with no third-party code. Translations welcome.
```

**Türkçe**

```
WSD Speed Dial, yeni sekme sayfanızı gerçekten kullandığınız
sitelerin panosuna çevirir — her biri kendi ekran görüntüsüyle.
Ücretsiz, açık kaynak, izleme yok.

BASİT YA DA GELİŞMİŞ — SİZ SEÇİN

Yalnızca sade bir sayfa mı istiyorsunuz? Basit mod, sakin bir duvar
kâğıdı üstünde küçük logolu kartlar ve kısa bir ayar listesi verir.
Hızlı Başla tek tıkla bilinen siteleri logolarıyla ekler. Daha fazlası
mı gerekiyor? Gelişmiş mod gruplar, klasörler ve tüm ayarları açar.
İstediğiniz an geçin; hiçbir şey kaybolmaz.

BAŞKA BİR SPEED DIAL'DAN MI GELİYORSUNUZ?

FVD Speed Dial ve diğer speed dial eklentilerinden her şeyi tek tıkla
taşıyın: gruplar, kartlar ve sıraları. Yedekte görsel yoksa WSD bunları
pencere açmadan arka planda almayı önerir. Herhangi bir tarayıcıdan dışa
aktarılmış yer imi HTML dosyası da aynı şekilde. FVD Speed Dial'dan mı
geliyorsunuz? Kısa bir rehberle görselleriniz de gelir (Ayarlar ›
Yedekleme ve Aktarma › İçe Aktar).

ANA SAYFADAN WEB ARAMASI

Ana sayfada arama kutusu. Tarayıcınızın arama motorunu kullanın ya da
listeden başka bir motor seçin; tek adresle kendi motorunuzu ekleyin,
listeyi sıralayın ya da kutuyu tamamen gizleyin.

FARKI NE

Kartlarınız sıradan tarayıcı yer imi olarak saklanır, bizim
kontrolümüzdeki bir veritabanında değil. Bunun üç sonucu var:

• Tarayıcı senkronu kendiliğinden çalışır. Bir cihazda eklediğiniz
  kart diğerinde belirir.
• Veriniz kilitlenmez. İstediğiniz an yer imi yöneticisinden
  görürsünüz.
• Kaldırırsanız hiçbir şey kaybolmaz. Yer imleri kalır.

KAYIPSIZ TAŞIMA — EŞİTLEME SERVİSİNE GEREK YOK

Eşitleme servisine ihtiyacınız yok. Tek bir yedek dosyası (JSON) her
şeyi başka bilgisayara ya da başka tarayıcıya taşır; tek tıkla geri
yüklersiniz. Kartlar, gruplar, klasörler, görseller, notlar, etiketler
ve ayarlar birlikte gelir. Hesap yok, sunucu yok — kaybedilecek bir
oturum da, kartlarınızı silen bir eşitleme hatası da yok.

SİLMEDEN BİRLEŞTİRME

Geri yüklerken iki seçenek var: mevcutların yerine koymak ya da
EKLEMEK. Ekle, var olan kartlarınıza dokunmadan yedeği üzerine
birleştirir: aynı adlı gruplar tek grupta toplanır, o grupta zaten
bulunan site ikinci kez eklenmez. Kartlarınız iki ayrı tarayıcıda mı?
Birinden yedek alın, diğerine ekleyin; tek bir koleksiyonunuz olur.

Yedek, kendi diskinizde duran eksiksiz bir dosyadır; görseller de
içindedir. Ücretsizdir: ücretli bir eşitleme servisi yok, dışarıda
bırakılan veri yok.

Otomatik olsun mu? Bir kez bir klasör seçin — örneğin OneDrive ya da
Google Drive klasörünüz — WSD yedeği oraya kendisi yazar; başka
bilgisayarda aynı klasörden tek tıkla geri yüklersiniz. Her tarayıcı
kendi adıyla ayrı set tutar, birden çok tarayıcı birbirine karışmaz.

AÇIK SEKMELERİ ÇALIŞMA ALANI OLARAK SAKLAYIN

Bir günlük iş ya da bir proje için açtığınız sekmeleri çalışma alanı
olarak kaydedin ve kapatın. Sonra tek tıkla, bu pencerede ya da yeni
pencerede geri açın. Çalışma alanını açık sekmelerden düzenleyin;
etiket, not ve renk ekleyin, sürükleyip sıralayın. Kaydederken
sekmeler kapanmaz. Kalıcı olacaksa görselli bir gruba dönüştürün,
iş bittiyse silin. Çalışma alanları yer imi olarak saklanır ve
yedeğe dahildir.

Çalışma alanlarında arayın, sık kullandıklarınızı üste sabitleyin,
bir çalışma alanını tek tıkla bu pencereyle eşitleyin ya da
bulunduğunuz sayfayı sağ tık menüsünden ekleyin. Çalışma alanı
açılınca yalnızca ilk sekme yüklenir; diğerleri tıklayınca yüklenir.

NELER YAPAR

Kartlar
- Sayfa eklenince ekran görüntüsü otomatik yakalanır
- Görsel beğenmediyseniz başka aday seçin, dosya yükleyin ya da
  adres verin
- Not, renk etiketi, ziyaret sayacı
- Adlı etiketler: kendi adınız ve renginizle, bir karta birden çok;
  aramayı açınca tüm etiketler listelenir, birine tıklayınca tüm
  gruplardaki o etiketli kartlar gelir
- Sürükleyerek sıralama ve gruplar arası taşıma
- Ada, ziyarete ya da tarihe göre tek seferlik sıralama

Gruplar ve klasörler
- Gruplar üst şeritte; sürükleyerek sıralanır
- Açılış grubu: her yeni sekmenin hangi grupla açılacağını seçin
- Grupların içinde İÇ İÇE KLASÖRLER, yer imi klasörlerinizin
  birebir aynısı: klasör kutusu içindeki ilk dört sitenin
  önizlemesini gösterir, tıklayınca içine girersiniz, üstteki yol
  şeridi nerede olduğunuzu gösterir
- Dosya gezgini gibi ileri / geri: farenin yan tuşları, Alt+← /
  Alt+→; Backspace bir üst klasöre çıkar
- Kartı klasörün üzerine sürükleyerek taşıma; klasörleri sürükleyip
  sıralama ya da birini diğerinin içine alma
- Grup ve klasörlere 22 ikon, özel emoji ya da site favicon'u;
  klasörlere not, renk etiketi, arka plan rengi ve kapak resmi
- Taşıma penceresi grup ve klasörleri ağaç olarak gösterir; arama
  klasörleri de bulur

Verileriniz
- Hazır gruplar: tek tıkla örnek paket ekleyin (Günlük, Alışveriş,
  Geliştirici…); paketler açık GitHub deposunda
- Yedek alma ve yükleme (klasör yapısıyla birlikte); dosyayı kendisi
  tanıyan tek İçe Aktar düğmesi: WSD yedeği, başka bir speed dial
  eklentisinin yedeği ya da yer imi HTML dosyası
- Geri yüklerken DEĞİŞTİR ya da BİRLEŞTİR: birleştirme aynı adlı grupları
  toplar, zaten olan siteleri tekrar eklemez
- Mevcut tarayıcı yer imlerinizi içe aktarma: her üst klasör bir
  grup olur, alt klasörler klasör olarak kalır
- Kırık bağlantı taraması
- Bağımsız HTML sayfası olarak dışa aktarma
- Çöp kutusu: silinen kart ve gruplar 30 gün saklanır
- Depolama denetimi ve alan bitmeden uyarı
- Eksik görselleri ve kopyaları bulan tutarlılık kontrolü
- Açık sekmeler birbiriyle eşitlenir

Görünüm
- Açık ve koyu mod, hazır temalar, kendi temanızı kaydetme
- İsteğe bağlı buzlu cam görünümü: menüler, paneller, arama kutusu
- Duvar kâğıdı, zemin renklendirme (ton kaydırma ya da iki renk)
- Kart oranı, boyutu, boşluğu, çerçevesi
- Kart, sekme, menü, pencere ve düğmeler için tek köşe ayarı
- Grup menüsü renkleri (yazı renkleri dahil) ve boyutu; yan araç paneli kendini gizleyebilir

GİZLİLİK

Hesap yok. Sunucu yok. Analitik yok. Hiçbir şey tarayıcınızdan
çıkmaz. Dışarıya giden istekler yalnızca sizin işlemlerinizden doğar:
yakalamasını istediğiniz sayfa, grup ikonu olarak seçerseniz favicon
sorgusu, "Logo Yakala"ya basarsanız logo sorgusu, kırık bağlantı
taraması, arama kutusunda seçtiğiniz motor (aramanız ve o motorun
bir kez alınan simgesi) ve Hazır Gruplar açılınca projenin GitHub
deposundan paket listesi.

AÇIK KAYNAK

GPL-3.0. Tüm kaynak:
https://github.com/muttixp/wsd-speed-dial

Sıfırdan yazıldı, üçüncü taraf kod içermiyor. Çeviri katkısı
bekliyoruz.
```

**Rusça**

```
WSD Speed Dial превращает новую вкладку в панель сайтов, которыми вы
действительно пользуетесь, — у каждого свой скриншот. Бесплатно,
открытый код, без слежки.

ПРОСТОЙ ИЛИ РАСШИРЕННЫЙ — ВЫБОР ЗА ВАМИ

Нужна просто аккуратная страница? Простой режим — это небольшие
плитки с логотипами на спокойных обоях и короткий список настроек.
«Быстрый старт» в один клик добавляет популярные сайты с логотипами.
Нужно больше? Расширенный режим открывает группы, папки и все
настройки. Переключайтесь в любой момент — ничего не теряется.

ПЕРЕХОДИТЕ С ДРУГОГО SPEED DIAL?

Перенесите всё в один клик из FVD Speed Dial и других расширений speed
dial: группы, плитки и их порядок. Если в копии нет изображений, WSD
предложит сделать снимки в фоне, не открывая окон. Так же работает
HTML-файл закладок, экспортированный из любого браузера. Переходите с
FVD Speed Dial? Короткая инструкция перенесёт и изображения (Настройки ›
Резервная копия и импорт › Импорт).

ПОИСК ПРЯМО НА ГЛАВНОЙ

Строка поиска на главной странице. Выберите поисковую систему из
списка, добавьте свою одной ссылкой, измените порядок или скройте
строку совсем.

ЧЕМ ОТЛИЧАЕТСЯ

Ваши плитки хранятся как обычные закладки браузера, а не в нашей базе
данных. Из этого следует три вещи:

• Синхронизация браузера работает сама. Добавили плитку на одном
  компьютере — она появится на другом.
• Ваши данные не заперты. Откройте диспетчер закладок — они там.
• Удаление расширения ничего не стирает. Закладки остаются.

ПЕРЕНОС БЕЗ ПОТЕРЬ — СЕРВИС СИНХРОНИЗАЦИИ НЕ НУЖЕН

Сервис синхронизации не нужен. Один файл резервной копии (JSON)
переносит всё на другой компьютер или в другой браузер, а восстановление
— один клик. Плитки, группы, папки, скриншоты, заметки, метки и
настройки переезжают вместе. Ни аккаунта, ни сервера — не нужно помнить
пароль, и никакой сбой синхронизации не сотрёт ваши плитки.

ОБЪЕДИНЯТЬ, А НЕ ЗАМЕНЯТЬ

При восстановлении есть два варианта: заменить то, что есть, или
ДОБАВИТЬ. Добавление не трогает текущие плитки и вливает копию: группы
с одинаковым названием объединяются, а сайт, который уже есть в группе,
не дублируется. Плитки в двух браузерах? Сохраните копию в одном,
добавьте в другой — и у вас одна общая коллекция.

Резервная копия — полный файл на вашем диске, скриншоты включены.
Бесплатно: никакой платной синхронизации, ничего не урезано.

Хотите автоматически? Один раз выберите папку — например, папку
Яндекс Диска или OneDrive — и WSD сам будет сохранять туда копии; на
другом компьютере восстановление из той же папки — один клик. Каждый
браузер хранит свой набор под своим именем, ничего не смешивается.

СОХРАНЯЙТЕ ОТКРЫТЫЕ ВКЛАДКИ КАК РАБОЧИЕ ОБЛАСТИ

Работаете над задачей на день или над проектом? Сохраните открытые
вкладки как рабочую область и закройте их. Потом откройте одним
щелчком — в этом окне или в новом. Редактируйте рабочую область из
открытых вкладок, добавляйте метки, заметку и цвет, меняйте порядок
перетаскиванием. При сохранении вкладки не закрываются. Если стоит
сохранить надолго — превратите в обычную группу со скриншотами; если
работа закончена — удалите. Рабочие области хранятся как закладки и
входят в резервные копии.

Ищите по рабочим областям, закрепляйте нужные сверху,
синхронизируйте область с текущим окном одним щелчком или добавляйте
открытую страницу через контекстное меню. При открытии области
загружается только первая вкладка, остальные — по щелчку.

ВОЗМОЖНОСТИ

Плитки
- Скриншот делается автоматически при добавлении страницы
- Не нравится картинка? Выберите другой вариант, загрузите файл или
  укажите адрес изображения
- Заметки, цветные метки, счётчик посещений
- Именованные теги со своими цветами, несколько на плитку; в поиске
  видны все теги, клик по тегу показывает его плитки во всех группах
- Перетаскивание для сортировки и переноса между группами
- Разовая сортировка по названию, посещениям или дате добавления

Группы и папки
- Группы в верхней панели; порядок меняется перетаскиванием
- Группа при открытии: выберите, с какой группы открывается каждая
  новая вкладка
- ВЛОЖЕННЫЕ ПАПКИ внутри групп, точно как папки закладок: плитка
  папки показывает превью первых четырёх сайтов, клик открывает её,
  строка пути показывает, где вы находитесь
- Назад / вперёд как в проводнике: боковые кнопки мыши, Alt+← / Alt+→;
  Backspace — на уровень вверх
- Перетащите плитку на папку, чтобы переместить; папки можно
  сортировать и вкладывать друг в друга
- 22 значка, свой эмодзи или значок сайта для групп и папок; для папок —
  заметки, цветные метки, цвет фона и обложка
- Окно перемещения показывает группы и папки деревом; поиск находит и
  папки

Ваши данные
- Готовые группы: набор для старта в один клик (Повседневное,
  Разработчику, Учёба…); наборы лежат в открытом репозитории GitHub
- Резервное копирование и восстановление (со структурой папок); одна
  кнопка «Импорт», которая сама распознаёт файл: резервная копия WSD,
  копия другого расширения speed dial или HTML-файл закладок
- При восстановлении — ЗАМЕНИТЬ или ОБЪЕДИНИТЬ: объединение сливает
  одноимённые группы и пропускает уже имеющиеся сайты
- Импорт закладок браузера: каждая папка верхнего уровня становится
  группой, вложенные остаются папками
- Проверка битых ссылок
- Экспорт в отдельную HTML-страницу
- Корзина: удалённые плитки и группы хранятся 30 дней
- Контроль хранилища с предупреждением до того, как место закончится
- Проверка целостности: находит пропавшие картинки и дубликаты
- Открытые вкладки синхронизируются друг с другом

Внешний вид
- Светлая и тёмная тема, готовые темы, сохранение своей темы
- Эффект матового стекла для меню, панелей и строки поиска (по желанию)
- Обои, тонирование фона (сдвиг оттенка или два цвета)
- Пропорции, размер, отступы и рамки плиток
- Единое скругление углов для плиток, вкладок, меню, окон и кнопок
- Цвета меню групп (включая цвет текста) и размер; боковая панель
  может скрываться сама

КОНФИДЕНЦИАЛЬНОСТЬ

Без аккаунта. Без серверов. Без аналитики. Ничего не покидает ваш
браузер. Внешние запросы возникают только из ваших действий: страница,
скриншот которой нужен; значок сайта, если вы выбрали его для группы;
поиск логотипа по кнопке «Логотип»; проверка битых ссылок; поисковая
система, выбранная в строке поиска (ваш запрос и один раз — её значок);
список наборов из GitHub-репозитория проекта при открытии «Готовых групп».

ОТКРЫТЫЙ КОД

GPL-3.0. Исходный код:
https://github.com/muttixp/wsd-speed-dial

Написано с нуля, без стороннего кода. Переводы приветствуются.
```

### Ek diller (1.5.8)

Mağaza panelinde dil ekleyip uzun açıklamaya yapıştırın; kısa açıklama pakette.

**Portekizce (Brezilya)**

```
WSD Speed Dial transforma a página de nova aba em um painel com os
sites que você realmente usa, cada um com sua própria captura de tela.
Gratuito, de código aberto e sem rastreamento.

SIMPLES OU AVANÇADO — VOCÊ ESCOLHE

Quer só uma página limpa? O modo Simples mostra blocos pequenos com
logotipos sobre um papel de parede tranquilo e uma lista curta de
configurações. O Início rápido adiciona sites populares com seus
logotipos em um clique. Precisa de mais? O modo Avançado abre grupos,
pastas e todas as configurações. Troque quando quiser; nada se perde.

VEIO DE OUTRO SPEED DIAL?

Traga tudo em um clique do FVD Speed Dial e de outras extensões de
speed dial: grupos, blocos e a ordem deles. Se o backup não tiver
imagens, o WSD se oferece para capturá-las em segundo plano, sem abrir
janelas. Um arquivo HTML de favoritos de qualquer navegador funciona
do mesmo jeito. Está saindo do FVD Speed Dial? Um guia curto traz
também suas miniaturas (Configurações › Backup e importação ›
Importar).

PESQUISE NA WEB PELA PÁGINA INICIAL

Uma barra de pesquisa na página inicial. Use o mecanismo de pesquisa
padrão do navegador ou escolha outro da lista; adicione seu próprio
mecanismo com um único endereço, reordene a lista ou oculte a barra
por completo.

O QUE O TORNA DIFERENTE

Seus blocos ficam guardados como favoritos comuns do navegador, e não
em um banco de dados controlado por nós. Daí vêm três vantagens:

• A sincronização do navegador funciona de imediato. Adicione um
  bloco em um computador e ele aparece no outro.
• Seus dados nunca ficam presos. Abra o gerenciador de favoritos a
  qualquer momento e eles estão lá.
• Desinstalar não apaga nada. Os favoritos continuam lá.

MUDE SEM PERDER NADA — SEM SERVIÇO DE SINCRONIZAÇÃO

Você não precisa de um serviço de sincronização. Um único arquivo de
backup (JSON) leva tudo para outro computador ou outro navegador, e um
clique restaura tudo. Blocos, grupos, pastas, miniaturas, anotações,
tags e configurações vão juntos. Sem conta e sem servidor — então não
há login para perder nem falha de sincronização que apague seus
blocos.

MESCLE EM VEZ DE SOBRESCREVER

Ao restaurar, há duas opções: substituir o que você tem ou ADICIONAR.
"Adicionar" mantém seus blocos intactos e mescla o backup: grupos com
o mesmo nome são combinados, e um site que já está naquele grupo não é
duplicado. Tem blocos em dois navegadores? Faça backup de um,
adicione-o ao outro e fique com uma coleção única.

O backup é um arquivo completo no seu próprio disco, com miniaturas.
É gratuito: não há serviço de sincronização pago e nada fica de fora.

Quer que seja automático? Escolha uma pasta uma vez — por exemplo, a
pasta do OneDrive ou do Google Drive — e o WSD grava o backup lá
sozinho; em outro computador, você restaura da mesma pasta com um
clique. Cada navegador mantém seu próprio conjunto com nome, então
vários navegadores nunca se misturam.

SALVE SUAS ABAS ABERTAS COMO ESPAÇOS DE TRABALHO

Trabalhando em algo por um dia ou em um projeto? Salve as abas abertas
como um espaço de trabalho e feche-as. Reabra tudo depois com um
clique, na janela atual ou em uma nova. Edite um espaço de trabalho a
partir das abas abertas, adicione tags, uma anotação e uma cor,
reordene arrastando. As abas não são fechadas ao salvar. Quando valer
a pena guardar, transforme-o em um grupo comum com miniaturas; quando
terminar, exclua-o. Os espaços de trabalho são guardados como
favoritos e entram nos backups.

Pesquise nos espaços de trabalho, fixe no topo os que você mais usa,
sincronize um espaço com a janela atual em um clique ou adicione a
página atual pelo menu do botão direito. Ao abrir um espaço, só a
primeira aba carrega; as outras carregam quando você clica nelas.

O QUE ELE FAZ

Blocos
- Capturas de tela automáticas ao adicionar uma página
- Não gostou da imagem? Escolha outra opção, envie um arquivo ou
  informe o endereço de uma imagem
- Anotações, etiquetas de cor, contador de visitas
- Tags com nome e cores próprias, várias por bloco; abra a pesquisa
  para ver todas as tags e clique em uma para listar seus blocos em
  todos os grupos
- Arraste para reordenar ou para mover entre grupos
- Ordenação pontual por nome, visitas ou data de inclusão

Grupos e pastas
- Grupos na barra superior; reordene arrastando
- Grupo inicial: escolha com qual grupo cada nova aba abre
- PASTAS ANINHADAS dentro dos grupos, exatamente como suas pastas de
  favoritos: o bloco da pasta mostra uma prévia dos quatro primeiros
  sites, clique para entrar e uma barra de caminho mostra onde você
  está
- Voltar / avançar como em um explorador de arquivos: botões laterais
  do mouse, Alt+Left / Alt+Right; Backspace sobe uma pasta
- Arraste blocos para uma pasta para movê-los; arraste pastas para
  reordenar ou colocar uma dentro da outra
- 22 ícones, emoji personalizado ou o favicon de um site para grupos e
  pastas; anotações, etiquetas de cor, cor de fundo e imagem de capa
  para pastas
- A janela Mover mostra grupos e pastas em árvore; a pesquisa também
  encontra pastas

Seus dados
- Grupos prontos: adicione um pacote inicial (Dia a dia,
  Desenvolvedor, Estudos…) com um clique; os pacotes ficam no
  repositório aberto do GitHub
- Backup e restauração (com a estrutura de pastas); um único botão
  Importar que reconhece o arquivo: backup do WSD, backup de outra
  extensão de speed dial ou arquivo HTML de favoritos
- A restauração pode SUBSTITUIR ou MESCLAR: mesclar combina grupos com
  o mesmo nome e ignora sites que você já tem
- Importe os favoritos que você já tem no navegador: cada pasta de
  nível superior vira um grupo e suas subpastas continuam como pastas
- Verificação de links quebrados
- Exportação como página HTML independente
- Lixeira: blocos e grupos excluídos ficam guardados por 30 dias
- Monitor de armazenamento com aviso antes de o espaço acabar
- Verificação de consistência que encontra imagens ausentes e
  duplicados
- As abas abertas ficam sincronizadas entre si

Aparência
- Modo claro e escuro, temas prontos, salve seu próprio tema
- Efeito de vidro fosco opcional para menus, painéis e barra de
  pesquisa
- Papel de parede, tonalização do fundo (deslocar matiz ou duas cores)
- Proporção, tamanho, espaçamento e bordas dos blocos
- Um único ajuste de cantos para blocos, abas, menus, janelas e botões
- Cores do menu de grupos (incluindo cores do texto) e tamanho; a
  barra lateral pode se ocultar automaticamente

PRIVACIDADE

Sem conta. Sem servidores. Sem análises. Nada sai do seu navegador.
Requisições externas vão apenas aonde suas próprias ações apontam: a
página que você pediu para capturar, a busca de um favicon se você
escolher um como ícone de grupo, a busca de um logo se você clicar em
"Capturar logo", a verificação de links quebrados, o mecanismo de
pesquisa que você escolher na barra de pesquisa (sua consulta e o
ícone desse mecanismo, baixado uma vez) e a lista de pacotes do
repositório do projeto no GitHub quando você abre Grupos prontos.

CÓDIGO ABERTO

GPL-3.0. Código-fonte completo em:
https://github.com/muttixp/wsd-speed-dial

Escrito do zero, sem código de terceiros. Traduções são bem-vindas.
```

**İspanyolca**

```
WSD Speed Dial convierte la página de nueva pestaña en un panel con
los sitios que de verdad usas, cada uno con su propia captura.
Gratuito, de código abierto y sin rastreo.

SIMPLE O AVANZADO — TÚ ELIGES

¿Solo quieres una página limpia? El modo Simple muestra mosaicos
pequeños con logotipos sobre un fondo tranquilo y una lista corta de
ajustes. Inicio rápido añade sitios populares con sus logotipos en un
clic. ¿Necesitas más? El modo Avanzado abre grupos, carpetas y todos
los ajustes. Cambia cuando quieras; no se pierde nada.

¿VIENES DE OTRO SPEED DIAL?

Trae todo con un clic desde FVD Speed Dial y otras extensiones de
speed dial: grupos, mosaicos y su orden. Si una copia no incluye
imágenes, WSD se ofrece a capturarlas en segundo plano, sin abrir
ventanas. Un archivo HTML de marcadores de cualquier navegador
funciona igual. ¿Te pasas desde FVD Speed Dial? Una guía breve trae
también tus miniaturas (Ajustes › Copia e importación › Importar).

BUSCA EN LA WEB DESDE LA PÁGINA DE INICIO

Una barra de búsqueda en la página de inicio. Usa el buscador
predeterminado del navegador o elige otro de la lista; añade tu propio
buscador con una sola dirección, reordena la lista u oculta la barra
por completo.

POR QUÉ ES DIFERENTE

Tus mosaicos se guardan como marcadores normales del navegador, no en
una base de datos que controlemos nosotros. De ahí se derivan tres
cosas:

• La sincronización del navegador funciona sin configurar nada. Añade
  un mosaico en un equipo y aparece en el otro.
• Tus datos nunca quedan atrapados. Abre el administrador de
  marcadores cuando quieras y ahí están.
• Desinstalar no te hace perder nada. Los marcadores se quedan.

CAMBIA DE EQUIPO SIN PERDER NADA — SIN SERVICIO DE SINCRONIZACIÓN

No necesitas un servicio de sincronización. Un solo archivo de copia
(JSON) lleva todo a otro equipo o a otro navegador, y un clic lo
restaura. Mosaicos, grupos, carpetas, miniaturas, notas, etiquetas y
ajustes viajan juntos. Sin cuenta ni servidor: no hay inicio de
sesión que perder ni fallos de sincronización que borren tus mosaicos.

COMBINA, NO SOBRESCRIBAS

Al restaurar tienes dos opciones: reemplazar lo que tienes o AÑADIR.
«Añadir» deja intactos tus mosaicos y combina la copia con ellos: los
grupos con el mismo nombre se unen y un sitio que ya tienes en ese
grupo no se duplica. ¿Tienes mosaicos en dos navegadores? Haz una
copia de uno, añádela al otro y tendrás una sola colección.

La copia es un archivo completo en tu propio disco, con miniaturas.
Es gratis: no hay servicio de sincronización de pago y no se deja nada
fuera.

¿Lo quieres automático? Elige una carpeta una vez —por ejemplo, tu
carpeta de OneDrive o Google Drive— y WSD guardará la copia ahí por
su cuenta; en otro equipo restauras desde la misma carpeta con un
clic. Cada navegador conserva su propio conjunto con nombre, así que
varios navegadores nunca se mezclan.

GUARDA TUS PESTAÑAS ABIERTAS COMO ESPACIOS DE TRABAJO

¿Trabajas en algo durante un día o en un proyecto? Guarda las
pestañas abiertas como espacio de trabajo y ciérralas. Vuelve a
abrirlas más tarde con un clic, en la ventana actual o en una nueva.
Edita un espacio de trabajo a partir de tus pestañas abiertas, añade
etiquetas, una nota y un color, y reordena arrastrando. Las pestañas
no se cierran al guardar. Cuando valga la pena conservarlo,
conviértelo en un grupo normal con miniaturas; cuando termines,
elimínalo. Los espacios de trabajo se guardan como marcadores y se
incluyen en las copias.

Busca en tus espacios de trabajo, fija arriba los que más usas,
sincroniza un espacio con la ventana actual en un clic o añade la
página en la que estás desde el menú contextual. Al abrir un espacio
solo se carga la primera pestaña; las demás, cuando haces clic.

QUÉ HACE

Mosaicos
- Capturas automáticas al añadir una página
- ¿No te gusta la imagen? Elige otra opción, sube un archivo o indica
  la dirección de una imagen
- Notas, etiquetas de color, contador de visitas
- Etiquetas con nombre y tus propios colores, varias por mosaico;
  abre la búsqueda para ver todas las etiquetas y haz clic en una para
  listar sus mosaicos en todos los grupos
- Arrastra para reordenar o para mover entre grupos
- Ordenación puntual por nombre, visitas o fecha de alta

Grupos y carpetas
- Grupos en la barra superior; reordénalos arrastrando
- Grupo inicial: elige con qué grupo se abre cada nueva pestaña
- CARPETAS ANIDADAS dentro de los grupos, igual que tus carpetas de
  marcadores: el mosaico de una carpeta muestra una vista previa de
  sus cuatro primeros sitios, haz clic para entrar y una barra de ruta
  indica dónde estás
- Atrás / adelante como en un explorador de archivos: botones
  laterales del ratón, Alt+Left / Alt+Right; Retroceso sube una
  carpeta
- Arrastra mosaicos sobre una carpeta para moverlos; arrastra carpetas
  para reordenarlas o meter una dentro de otra
- 22 iconos, emoji personalizado o el favicon de un sitio para grupos
  y carpetas; notas, etiquetas de color, color de fondo e imagen de
  portada para carpetas
- La ventana Mover muestra grupos y carpetas en árbol; la búsqueda
  también encuentra carpetas

Tus datos
- Grupos predefinidos: añade un paquete inicial (Día a día,
  Desarrollador, Aprendizaje…) con un clic; los paquetes se mantienen
  en el repositorio abierto de GitHub
- Copia y restauración (incluida la estructura de carpetas); un único
  botón Importar que reconoce el archivo: una copia de WSD, una copia
  de otra extensión de speed dial o un archivo HTML de marcadores
- La restauración puede REEMPLAZAR o COMBINAR: al combinar se unen los
  grupos con el mismo nombre y se omiten los sitios que ya tienes
- Importa los marcadores que ya tienes en el navegador: cada carpeta
  de primer nivel se convierte en un grupo y sus subcarpetas siguen
  siendo carpetas
- Búsqueda de enlaces rotos
- Exportación como página HTML independiente
- Papelera: los mosaicos y grupos eliminados se conservan 30 días
- Monitor de almacenamiento con aviso antes de quedarse sin espacio
- Comprobación de coherencia que detecta imágenes faltantes y
  duplicados
- Las pestañas abiertas se mantienen sincronizadas entre sí

Aspecto
- Modo claro y oscuro, temas predefinidos, guarda tu propio tema
- Efecto de vidrio esmerilado opcional para menús, paneles y la barra
  de búsqueda
- Fondo de pantalla, tinte del fondo (desplazar tono o dos colores)
- Proporción, tamaño, espaciado y bordes de los mosaicos
- Un solo ajuste de esquinas para mosaicos, pestañas, menús, ventanas
  y botones
- Colores del menú de grupos (incluido el color del texto) y tamaño;
  la barra lateral puede ocultarse automáticamente

PRIVACIDAD

Sin cuenta. Sin servidores. Sin analíticas. Nada sale de tu navegador.
Las solicitudes externas solo van adonde apuntan tus propias acciones:
la página que pediste capturar, la búsqueda de un favicon si eliges
uno como icono de grupo, la búsqueda de un logo si pulsas «Capturar
logo», la búsqueda de enlaces rotos, el buscador que elijas en la
barra de búsqueda (tu consulta y el icono de ese buscador, descargado
una sola vez) y la lista de paquetes del repositorio del proyecto en
GitHub cuando abres Grupos predefinidos.

CÓDIGO ABIERTO

GPL-3.0. Código fuente completo en:
https://github.com/muttixp/wsd-speed-dial

Escrito desde cero, sin código de terceros. Las traducciones son
bienvenidas.
```

**Ukraynaca**

```
WSD Speed Dial перетворює сторінку нової вкладки на дошку із сайтами,
якими ви справді користуєтеся, — кожен зі своїм знімком. Безкоштовно,
з відкритим кодом, без стеження.

ПРОСТИЙ АБО РОЗШИРЕНИЙ — ОБИРАЄТЕ ВИ

Потрібна просто охайна сторінка? Простий режим — це невеликі плитки з
логотипами на спокійних шпалерах і короткий список налаштувань.
«Швидкий старт» в один клік додає популярні сайти з логотипами.
Потрібно більше? Розширений режим відкриває групи, папки й усі
налаштування. Перемикайтеся будь-коли — нічого не втрачається.

ПЕРЕХОДИТЕ З ІНШОГО SPEED DIAL?

Перенесіть усе одним клацанням із FVD Speed Dial та інших розширень
speed dial: групи, плитки та їхній порядок. Якщо в копії немає
зображень, WSD запропонує зняти їх у фоновому режимі, не відкриваючи
вікон. Так само працює HTML-файл закладок із будь-якого браузера.
Переходите з FVD Speed Dial? Коротка інструкція допоможе перенести й
мініатюри (Налаштування › Резервна копія та імпорт › Імпорт).

ПОШУК В ІНТЕРНЕТІ З ДОМАШНЬОЇ СТОРІНКИ

Рядок пошуку на домашній сторінці. Використовуйте пошукову систему
браузера за замовчуванням або виберіть іншу зі списку; додайте власну
систему за однією адресою, змініть порядок списку або зовсім
приховайте рядок.

ЧИМ ВІН ІНШИЙ

Ваші плитки зберігаються як звичайні закладки браузера, а не в базі
даних, яку контролюємо ми. Звідси три наслідки:

• Синхронізація браузера працює одразу. Додайте плитку на одному
  комп'ютері — вона з'явиться на іншому.
• Ваші дані ніколи не опиняються в пастці. Відкрийте менеджер
  закладок будь-коли — і вони там.
• Видалення розширення нічого не стирає. Закладки залишаються.

ПЕРЕЇЗД БЕЗ ВТРАТ — БЕЗ СЕРВІСУ СИНХРОНІЗАЦІЇ

Сервіс синхронізації не потрібен. Один файл копії (JSON) переносить
усе на інший комп'ютер чи в інший браузер, а одне клацання відновлює
його. Плитки, групи, папки, мініатюри, нотатки, мітки й налаштування
переїжджають разом. Без облікового запису й без сервера — тож немає
входу, який можна втратити, і збою синхронізації, що зітре ваші
плитки.

ОБ'ЄДНУЙТЕ, А НЕ ПЕРЕЗАПИСУЙТЕ

Під час відновлення є два варіанти: замінити наявне або ДОДАТИ до
нього. «Додати» не чіпає ваших плиток і об'єднує з ними копію: групи
з однаковою назвою зливаються, а сайт, який уже є в цій групі, не
дублюється. Маєте плитки у двох браузерах? Зробіть копію в одному,
додайте її в інший — і матимете одну спільну колекцію.

Копія — це повний файл на вашому диску, разом із мініатюрами.
Безкоштовно: жодного платного сервісу синхронізації, нічого не
приховано.

Хочете автоматично? Один раз виберіть папку — наприклад, папку
OneDrive чи Google Drive, — і WSD сам записуватиме туди копію; на
іншому комп'ютері ви відновлюєте з тієї самої папки одним клацанням.
Кожен браузер має власний іменований набір, тож копії кількох
браузерів ніколи не змішуються.

ЗБЕРІГАЙТЕ ВІДКРИТІ ВКЛАДКИ ЯК РОБОЧІ ПРОСТОРИ

Працюєте над чимось один день чи над проєктом? Збережіть відкриті
вкладки як робочий простір і закрийте їх. Пізніше відкрийте їх одним
клацанням — у поточному вікні або в новому. Змінюйте робочий простір
із відкритих вкладок, додавайте мітки, нотатку й колір, змінюйте
порядок перетягуванням. Під час збереження вкладки не закриваються.
Якщо простір вартий того, перетворіть його на звичайну групу з
мініатюрами; коли закінчите — видаліть. Робочі простори зберігаються
як закладки й потрапляють у резервні копії.

Шукайте в робочих просторах, закріплюйте потрібні вгорі,
синхронізуйте простір із поточним вікном одним клацанням або
додавайте відкриту сторінку через контекстне меню. Під час відкриття
простору завантажується лише перша вкладка, решта — після клацання.

ЩО ВІН ВМІЄ

Плитки
- Знімки створюються автоматично, коли ви додаєте сторінку
- Не подобається зображення? Виберіть інший варіант, завантажте файл
  або вкажіть адресу зображення
- Нотатки, кольорові мітки, лічильник відвідувань
- Іменовані мітки з власними кольорами, кілька на плитку; відкрийте
  пошук, щоб побачити всі мітки, і клацніть одну, щоб показати її
  плитки в усіх групах
- Перетягуйте, щоб змінити порядок або перемістити в іншу групу
- Разове сортування за назвою, відвідуваннями чи датою додавання

Групи й папки
- Групи у верхній панелі; порядок змінюється перетягуванням
- Група під час відкриття: виберіть, з якою групою відкривається
  кожна нова вкладка
- ВКЛАДЕНІ ПАПКИ всередині груп — точнісінько як папки закладок:
  плитка папки показує мініатюри перших чотирьох сайтів, клацніть,
  щоб увійти, а рядок шляху показує, де ви
- Назад / вперед, як у файловому менеджері: бічні кнопки миші,
  Alt+Left / Alt+Right; Backspace — на папку вище
- Перетягуйте плитки на папку, щоб перемістити їх; перетягуйте папки,
  щоб змінити порядок або вкласти одну в іншу
- 22 значки, свій емодзі або favicon сайту для груп і папок; нотатки,
  кольорові мітки, колір фону й обкладинка для папок
- Вікно «Перемістити» показує групи й папки деревом; пошук знаходить
  і папки

Ваші дані
- Готові групи: додайте стартовий набір (Повсякденне, Розробнику,
  Навчання…) одним клацанням; набори зберігаються у відкритому
  репозиторії на GitHub
- Резервна копія й відновлення (зі структурою папок); одна кнопка
  «Імпорт», яка сама розпізнає файл: копію WSD, копію з іншого
  розширення speed dial або HTML-файл закладок
- Відновлення може ЗАМІНИТИ або ОБ'ЄДНАТИ: об'єднання зливає групи з
  однаковою назвою й пропускає сайти, які у вас уже є
- Імпорт наявних закладок браузера: кожна папка верхнього рівня стає
  групою, а її підпапки залишаються папками
- Перевірка битих посилань
- Експорт в окрему HTML-сторінку
- Кошик: видалені плитки й групи зберігаються 30 днів
- Контроль сховища з попередженням, перш ніж закінчиться місце
- Перевірка цілісності, яка знаходить відсутні зображення й дублікати
- Відкриті вкладки синхронізуються між собою

Вигляд
- Світлий і темний режими, готові теми, збереження власної теми
- Необов'язковий ефект матового скла для меню, панелей і рядка пошуку
- Шпалери, тонування фону (зсув відтінку або два кольори)
- Пропорції, розмір, відступи й рамки плиток
- Одне налаштування заокруглення кутів для плиток, вкладок, меню,
  вікон і кнопок
- Кольори панелі груп (зокрема кольори тексту) і розмір; бічна панель
  може автоматично ховатися

КОНФІДЕНЦІЙНІСТЬ

Без облікового запису. Без серверів. Без аналітики. Ніщо не залишає
ваш браузер. Зовнішні запити йдуть лише туди, куди ведуть ваші власні
дії: на сторінку, знімок якої ви попросили зробити, пошук favicon,
якщо ви вибрали його значком групи, пошук логотипу, якщо ви натиснули
«Зняти логотип», перевірка битих посилань, пошукова система, яку ви
обрали в рядку пошуку (ваш запит і значок цієї системи, завантажений
один раз), а також список наборів із репозиторію проєкту на GitHub,
коли ви відкриваєте «Готові групи».

ВІДКРИТИЙ КОД

GPL-3.0. Повний вихідний код:
https://github.com/muttixp/wsd-speed-dial

Написано з нуля, без стороннього коду. Переклади вітаються.
```

---

## Kategori

`Verimlilik › İş Akışı ve Planlama` (Productivity › Workflow & Planning) — rakiplerin çoğu burada

---

## Dil

Türkçe, İngilizce ve Rusça (mağaza listelemesi). Rusça metinler makine
desteğiyle çevrildi; yayından önce Rusça bilen birine okutmak iyi olur.

---

## Gizlilik sekmesi

**Tek amaç açıklaması**

```
Replaces the new tab page with a visual speed dial of the user's own
bookmarks, each shown as a tile with a screenshot.
```

**İzin gerekçeleri** — her biri mağaza formunda ayrı ayrı sorulur:

| İzin | Gerekçe (İngilizce, forma yapıştırılacak) |
|---|---|
| `bookmarks` | Tiles are stored as bookmarks. The extension reads them to draw the grid and writes them when the user adds, edits, reorders or deletes a tile. |
| `storage` | Stores tile thumbnails, notes, color labels, visit counts and user settings locally. |
| `unlimitedStorage` | Thumbnails for a large collection can exceed the default 5 MB quota. A user with a thousand tiles uses roughly 40 MB. |
| `tabs` | Opens tiles in a new tab when the user chooses that, reads the current tab's address when adding it from the context menu, and lists the open tabs of the current window when the user saves them as a workspace or a group. |
| `contextMenus` | Adds the "Add to WSD Speed Dial" item (with an "Add to workspace" submenu) so pages can be added while browsing, and a "Save tabs to a workspace" item on the toolbar icon. |
| `alarms` | Keeps the screenshot queue running. In Manifest V3 the service worker is terminated while idle; an alarm wakes it so a long capture batch finishes. |
| `scripting` | Scrolls the page being captured past fixed headers and cookie banners, and reads candidate images from the page. |
| `search` | Lets the home-page search box send a query to the browser's own default search engine when the user picks "Browser default". The extension does not read, store or log queries; the permission shows no warning at install. |
| `debugger` | Only used by the optional "Hidden" capture mode, which takes a screenshot without showing a window. The default mode does not use it. Chrome does not allow this permission to be optional, so it is requested at install. |
| `host_permissions` (`<all_urls>`) | The user can add any site, so the target is not known in advance. Access is used solely to capture a screenshot of pages the user explicitly added. |

**Veri kullanımı beyanları** — hepsine "hayır":

- Kişisel iletişim bilgisi: toplanmıyor
- Sağlık bilgisi: toplanmıyor
- Finansal bilgi: toplanmıyor
- Kimlik doğrulama bilgisi: toplanmıyor
- Kişisel iletişim içeriği: toplanmıyor
- Konum: toplanmıyor
- Web geçmişi: toplanmıyor
- Kullanıcı etkinliği: toplanmıyor
- Web sitesi içeriği: toplanmıyor

Üç onay kutusunun üçü de işaretlenebilir:
- Veriler onaylanmış kullanım amaçları dışında satılmıyor
- Veriler ürünün temel işlevi dışında kullanılmıyor
- Veriler kredi değerliliği tespiti için kullanılmıyor

**Gizlilik politikası adresi**

```
https://github.com/muttixp/wsd-speed-dial/blob/main/PRIVACY.md
```

---

## Görseller

| Tür | Ölçü | Zorunlu |
|---|---|---|
| Simge | 128×128 | Evet |
| Ekran görüntüsü | 1280×800 veya 640×400 | En az 1, en fazla 5 |
| Küçük afiş | 440×280 | Hayır (önerilir) — `docs/wsd-afis-440x280-tr.png` / `-en.png` / `-ru.png` |
| Marquee afiş | 1400×560 | Hayır — `docs/wsd-afis-1400x560-tr.png` / `-en.png` / `-ru.png` |

Edge Add-ons'ta aynı ölçüler: küçük (440×280) ve büyük (1400×560) tanıtım
kutusu.

Ekran görüntüsü için öneri sırası:

1. Dolu kart ızgarası, grup şeridi görünür — asıl tanıtım görseli
2. Ayarlar paneli, bir bölüm açık
3. Kart düzenleme penceresi
4. Arama sonuçları
5. Yinelenen kartlar ya da çöp kutusu

### 1.6.1 ile yapılacaklar (mağaza paneli)

- Paket yüklenecek. Yeni izin yok.
- Uzun açıklama: girişin hemen altına "Basit ya da Gelişmiş" paragrafı
  eklendi — EN, TR, RU, PT-BR, ES, UK metinlerini yeniden yapıştır.
- Ekran görüntüsü: Basit mod görseli (`docs/basit.png`) eklenebilir.
- Gizlilik politikası güncellendi (kaldırma sayfası, isteğe bağlı arama
  önerileri) — adres aynı, bir şey yapmaya gerek yok.

### 1.6.0 ile yapılacaklar (mağaza paneli)

- Paket yüklenecek. Yeni izin yok.
- Uzun açıklama: çalışma alanları bölümüne bir paragraf eklendi (arama,
  sabitleme, pencereyle eşitleme, sağ tık ile ekleme, hafif açma) — EN,
  TR, RU, PT-BR, ES, UK metinlerini yeniden yapıştır.
- Gizlilik sekmesi, `contextMenus` gerekçesi: "Add to workspace" eklendi
  (aşağıdaki tablo) — istenirse güncelle.

### 1.5.9 ile yapılacaklar (mağaza paneli)

- Yalnızca paket; açıklamalar değişmedi. Yeni izin yok.

### 1.5.8 ile yapılacaklar (mağaza paneli)

- Uzun açıklama (EN/TR/RU): "FVD'den görselleriyle" cümlesi ve
  "Açılış grubu" maddesi eklendi — üç dilde de yapıştır.
- Yeni diller: pt_BR, es, uk uzun açıklama (yukarıda "Ek diller"; kısa açıklama pakette).
  Mağaza panelinde Mağaza girişi › dil ekle › metni yapıştır.
- Yorum yanıtları (Boris Konev, guraynsj): 1.5.8 yayına girince
  "с версии 1.5.8" diye.

### 1.5.7 ile yapılacaklar (mağaza paneli)

- Paket yüklenecek. Yeni izin YOK (klasöre yazma tarayıcının dosya erişim
  özelliğiyle, izin kullanıcı klasör seçerken veriliyor; manifest değişmedi).
- Uzun açıklamalar (EN/TR/RU) yeniden yapıştırılacak: yedek bölümüne
  "otomatik klasör yedeği" paragrafı eklendi. Bulut adları liste halinde
  değil, tek cümle içinde iki ad (anahtar kelime spam kuralı).
- Gizlilik: PRIVACY.md madde 7 (yedek klasörü) eklendi; mağaza formundaki
  veri beyanları değişmiyor (veri hâlâ kullanıcının kendi klasöründe).
- Arayüz dilleri artık tam: pt-BR, pt-PT, es, uk, zh-CN (eksik 306'şar metin).
- Edge: 1.5.6 onaylanınca bu paket aynı açıklamalarla.

### 1.5.6 ile yapılacaklar (mağaza paneli)

- Yalnızca paket yüklenecek. Yeni izin yok, açıklamalar ve gizlilik
  gerekçeleri değişmedi (Değerlendir / Öneri bağlantıları yalnızca
  tıklanınca sekme açıyor; `management.getSelf` izin istemiyor).
- Edge: 1.5.4 incelemeden çıkınca bu paket, düzeltilmiş açıklamalarla
  (anahtar kelime listesi yok) gönderilecek.

### 1.5.5 ile yapılacaklar (mağaza paneli)

- **Anahtar kelime spam'i (reddedildi, 17 Eki 2026):** arama motoru adlarının
  listesi ve içe aktarma biçimlerinin uzun listesi (WSD, FVD, Speed Dial 2,
  .spd, Group Speed Dial) "lüzumsuz anahtar kelime" sayıldı. İkisi de
  genel ifadeye çevrildi. Kural: açıklamada marka/motor adlarını liste
  halinde sıralama; taşıma paragrafındaki bir iki ad yeterli.

- Uzun açıklamalar (EN/TR/RU) yenilendi: .spd taşıma, FVD'nin görsel
  taşımadığı (önceki metin "FVD görselleri de gelir" diyordu - yanlıştı),
  web arama kutusu, temalar, gizlilik satırında arama motoru - panele
  yeniden yapıştırılacak
- Kısa açıklama paketten geliyor (`extDesc`); Rusçası "визуальные
  закладки" ile başlıyor
- Gizlilik sekmesinde yeni izin: `search` gerekçesi eklenecek
- İsteğe bağlı: arama kutulu ana sayfa ekran görüntüsü (RU listelemesinde
  Yandex seçili haliyle)

### 1.5.4 ile yapılacaklar (mağaza paneli)

- Uzun açıklamalar (EN/TR/RU) "çalışma alanları" bölümüyle ve en üstte FVD / Speed Dial 2'den taşıma paragrafıyla güncellendi — panele yeniden yapıştırılacak
- Kısa açıklama paketin içinden (manifest) geliyor; yeni metin 1.5.4 ile kendiliğinden yayına girer
- `tabs` ve `contextMenus` gerekçeleri güncellendi — Gizlilik sekmesinde yenilenecek
- İsteğe bağlı: çalışma alanları ekranının görüntüsü ekran görüntüleri arasına eklenebilir

### 1.5.3 ile yapılacaklar (mağaza paneli)

- Küçük afiş: `docs/wsd-afis-440x280-en.png` (Türkçesi `-tr`) — "Küçük tanıtım
  kutusu" alanına yüklenecek
- Yayıncı doğrulaması: `webteyazilim.net` Search Console'da doğrulanıp
  mağaza girişinde resmi URL olarak seçilecek
- Açıklamada "ücretsiz, açık kaynak, izleme yok" ilk satırlara alınacak
