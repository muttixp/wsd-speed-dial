# Chrome Web Store — listeleme metinleri

Bu dosya depoda kalmak zorunda değil; mağaza formunu doldururken
kopyalayıp yapıştırmak için hazırlandı.

---

## Ad

```
WSD Speed Dial
```

## Kısa açıklama (132 karakter sınırı)

**İngilizce**
```
Turn your new tab into a visual speed dial. Tiles live in your own bookmarks — no account, no tracking.
```
(103 karakter)

**Türkçe**
```
Yeni sekmenizi görsel bir hız kadranına çevirin. Kartlar kendi yer imlerinizde durur — hesap yok, izleme yok.
```
(107 karakter)

---

## Uzun açıklama

**İngilizce**

```
WSD Speed Dial turns your new tab page into a board of the sites you
actually use, each with its own screenshot.

WHY IT'S DIFFERENT

Your tiles are stored as ordinary browser bookmarks — not in a
database we control. Three things follow from that:

• Browser sync works out of the box. Add a tile on one machine, it
  appears on the other.
• Your data is never locked in. Open the bookmark manager any time
  and there it is.
• Uninstalling doesn't lose anything. The bookmarks stay.

WHAT IT DOES

Tiles
- Screenshots are captured automatically when you add a page
- Don't like the image? Pick another candidate, upload a file, or
  give an image address
- Notes, colour labels, visit counters
- Drag to reorder, drag to move between groups
- One-off sorting by name, visits or date added

Groups
- Reorder by dragging in the bar
- 22 icons, custom emoji, or the site's own favicon
- Per-group display style and icon colour

Your data
- Backup and restore; imports from older WSD and from FVD Speed Dial
- Export as a standalone HTML page
- Trash: deleted tiles and groups are kept for 30 days
- Storage monitor with a warning before space runs out
- Consistency check that finds missing images and duplicates
- Open tabs stay in sync with each other

Looks
- Wallpaper, background tinting (hue shift or duotone)
- Tile ratio, size, corners, spacing, borders
- Group bar colours and size

PRIVACY

No account. No servers. No analytics. Nothing leaves your browser.
The only outbound requests are the page you asked to capture, and
optionally a favicon lookup if you choose that as a group icon.

OPEN SOURCE

GPL-3.0. Full source at:
https://github.com/muttixp/wsd-speed-dial

Written from scratch with no third-party code. Translations welcome.
```

**Türkçe**

```
WSD Speed Dial, yeni sekme sayfanızı gerçekten kullandığınız
sitelerin panosuna çevirir — her biri kendi ekran görüntüsüyle.

FARKI NE

Kartlarınız sıradan tarayıcı yer imi olarak saklanır, bizim
kontrolümüzdeki bir veritabanında değil. Bunun üç sonucu var:

• Tarayıcı senkronu kendiliğinden çalışır. Bir cihazda eklediğiniz
  kart diğerinde belirir.
• Veriniz kilitlenmez. İstediğiniz an yer imi yöneticisinden
  görürsünüz.
• Kaldırırsanız hiçbir şey kaybolmaz. Yer imleri kalır.

NELER YAPAR

Kartlar
- Sayfa eklenince ekran görüntüsü otomatik yakalanır
- Görsel beğenmediyseniz başka aday seçin, dosya yükleyin ya da
  adres verin
- Not, renk etiketi, ziyaret sayacı
- Sürükleyerek sıralama ve gruplar arası taşıma
- Ada, ziyarete ya da tarihe göre tek seferlik sıralama

Gruplar
- Şeritte sürükleyerek sıralama
- 22 ikon, özel emoji ya da sitenin favicon'u
- Gruba özel gösterim biçimi ve ikon rengi

Verileriniz
- Yedek alma ve yükleme; eski WSD ve FVD Speed Dial'dan içe aktarma
- Bağımsız HTML sayfası olarak dışa aktarma
- Çöp kutusu: silinen kart ve gruplar 30 gün saklanır
- Depolama denetimi ve alan bitmeden uyarı
- Eksik görselleri ve kopyaları bulan tutarlılık kontrolü
- Açık sekmeler birbiriyle eşitlenir

Görünüm
- Duvar kâğıdı, zemin renklendirme (ton kaydırma ya da iki renk)
- Kart oranı, boyutu, köşesi, boşluğu, çerçevesi
- Grup şeridi renkleri ve boyutu

GİZLİLİK

Hesap yok. Sunucu yok. Analitik yok. Hiçbir şey tarayıcınızdan
çıkmaz. Dışarıya giden tek istek, yakalamasını istediğiniz sayfa;
bir de grup ikonu olarak seçerseniz favicon sorgusu.

AÇIK KAYNAK

GPL-3.0. Tüm kaynak:
https://github.com/muttixp/wsd-speed-dial

Sıfırdan yazıldı, üçüncü taraf kod içermiyor. Çeviri katkısı
bekliyoruz.
```

---

## Kategori

`Productivity` (Verimlilik)

---

## Dil

Türkçe ve İngilizce

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
| `storage` | Stores tile thumbnails, notes, colour labels, visit counts and user settings locally. |
| `unlimitedStorage` | Thumbnails for a large collection can exceed the default 5 MB quota. A user with a thousand tiles uses roughly 40 MB. |
| `tabs` | Opens tiles in a new tab when the user chooses that, and reads the current tab's address when adding it from the context menu. |
| `contextMenus` | Adds the "Add to WSD Speed Dial" item so pages can be added while browsing. |
| `alarms` | Keeps the screenshot queue running. In Manifest V3 the service worker is terminated while idle; an alarm wakes it so a long capture batch finishes. |
| `scripting` | Scrolls the page being captured past fixed headers and cookie banners, and reads candidate images from the page. |
| `debugger` | Only used by the optional "Hidden" capture mode, which takes a screenshot without showing a window. The default mode does not use it. |
| `offscreen` | Service workers have no DOM, so an offscreen document resizes captured images before they are stored. |
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
| Küçük afiş | 440×280 | Hayır (önerilir) |
| Marquee afiş | 1400×560 | Hayır |

Ekran görüntüsü için öneri sırası:

1. Dolu kart ızgarası, grup şeridi görünür — asıl tanıtım görseli
2. Ayarlar paneli, bir bölüm açık
3. Kart düzenleme penceresi
4. Arama sonuçları
5. Yinelenen kartlar ya da çöp kutusu
