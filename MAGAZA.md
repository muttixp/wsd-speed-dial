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

COMING FROM ANOTHER SPEED DIAL?

Bring everything over in one click from FVD Speed Dial and other speed
dial extensions: groups, tiles and their order. If a backup carries no
images, WSD offers to capture them in the background, without opening
windows. A bookmarks HTML file from any browser works the same way.

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

SAVE YOUR OPEN TABS AS WORKSPACES

Working on something for a day or a project? Save the open tabs as a
workspace and close them. Reopen them later with one click, in the
current window or a new one. Edit a workspace from your open tabs,
add tags, a note and a color, reorder by drag and drop. Tabs are not
closed when you save. When it's worth keeping, turn it into a regular
group with thumbnails; when you're done, delete it. Workspaces are
stored as bookmarks and are included in backups.

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

BAŞKA BİR SPEED DIAL'DAN MI GELİYORSUNUZ?

FVD Speed Dial ve diğer speed dial eklentilerinden her şeyi tek tıkla
taşıyın: gruplar, kartlar ve sıraları. Yedekte görsel yoksa WSD bunları
pencere açmadan arka planda almayı önerir. Herhangi bir tarayıcıdan dışa
aktarılmış yer imi HTML dosyası da aynı şekilde.

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

AÇIK SEKMELERİ ÇALIŞMA ALANI OLARAK SAKLAYIN

Bir günlük iş ya da bir proje için açtığınız sekmeleri çalışma alanı
olarak kaydedin ve kapatın. Sonra tek tıkla, bu pencerede ya da yeni
pencerede geri açın. Çalışma alanını açık sekmelerden düzenleyin;
etiket, not ve renk ekleyin, sürükleyip sıralayın. Kaydederken
sekmeler kapanmaz. Kalıcı olacaksa görselli bir gruba dönüştürün,
iş bittiyse silin. Çalışma alanları yer imi olarak saklanır ve
yedeğe dahildir.

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

ПЕРЕХОДИТЕ С ДРУГОГО SPEED DIAL?

Перенесите всё в один клик из FVD Speed Dial и других расширений speed
dial: группы, плитки и их порядок. Если в копии нет изображений, WSD
предложит сделать снимки в фоне, не открывая окон. Так же работает
HTML-файл закладок, экспортированный из любого браузера.

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

СОХРАНЯЙТЕ ОТКРЫТЫЕ ВКЛАДКИ КАК РАБОЧИЕ ОБЛАСТИ

Работаете над задачей на день или над проектом? Сохраните открытые
вкладки как рабочую область и закройте их. Потом откройте одним
щелчком — в этом окне или в новом. Редактируйте рабочую область из
открытых вкладок, добавляйте метки, заметку и цвет, меняйте порядок
перетаскиванием. При сохранении вкладки не закрываются. Если стоит
сохранить надолго — превратите в обычную группу со скриншотами; если
работа закончена — удалите. Рабочие области хранятся как закладки и
входят в резервные копии.

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

---

## Kategori

`Productivity` (Verimlilik)

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
| `contextMenus` | Adds the "Add to WSD Speed Dial" item so pages can be added while browsing, and a "Save tabs to a workspace" item on the toolbar icon. |
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
