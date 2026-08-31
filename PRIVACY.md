# Gizlilik Politikası — WSD Speed Dial

Son güncelleme: 31 Ağustos 2026

## Kısaca

WSD Speed Dial **hiçbir veri toplamaz, iletmez veya paylaşmaz.**
Tüm veriniz kendi tarayıcınızda kalır.

Eklentinin bir sunucusu yoktur. Analitik, izleme veya reklam kodu
içermez. Geliştiricinin verilerinize erişimi yoktur.

---

## Saklanan veriler

Eklenti şunları **yerel olarak** saklar:

| Veri | Nerede | Neden |
|---|---|---|
| Kart adresleri ve başlıkları | Tarayıcının yer imleri | Kartların kendisi |
| Kart görselleri | `chrome.storage.local` | Küçük resimler |
| Notlar, renk etiketleri, ziyaret sayaçları | `chrome.storage.local` | Kart bilgileri |
| Ayarlar | `chrome.storage.local` | Görünüm tercihleri |
| Duvar kâğıdı | `chrome.storage.local` | Seçtiyseniz |

Kartlar tarayıcının kendi yer imi sisteminde tutulur. Tarayıcı
senkronu açıksa yer imleriniz — dolayısıyla kartlarınız — cihazlarınız
arasında **tarayıcı tarafından** eşitlenir. Bu eşitleme Google'ın
(ya da kullandığınız tarayıcının) hesap altyapısıyla yapılır; eklenti
bu sürece dahil değildir.

Görseller, notlar ve ayarlar senkronize edilmez, yalnızca o cihazda
kalır.

---

## Dış bağlantılar

Eklenti yalnızca iki durumda dışarıya bağlanır:

**1. Kart görseli yakalarken** — eklediğiniz sayfayı arka planda açıp
ekran görüntüsünü alır. Bu, o siteye normal bir ziyaret gibidir; site
sizi görebilir. Başka bir sunucuya veri gitmez.

**2. Favicon alırken** — grup ikonu olarak site simgesi seçerseniz
`google.com/s2/favicons` adresinden çekilir. Yalnızca sitenin alan adı
gönderilir. Bu özelliği kullanmazsanız böyle bir istek olmaz.

---

## İzinler ve gerekçeleri

| İzin | Neden gerekli |
|---|---|
| `bookmarks` | Kartlar yer imi olarak saklanıyor; okumak ve yazmak için |
| `storage`, `unlimitedStorage` | Görseller, notlar ve ayarlar için. Görseller birkaç yüz MB'a ulaşabildiğinden varsayılan 5 MB kotası yetmiyor |
| `tabs` | Kartı yeni sekmede açmak, açık sekmenin adresini almak |
| `contextMenus` | "WSD Speed Dial'e ekle" sağ tık menüsü |
| `alarms` | Görsel yakalama kuyruğunu sürdürmek. Manifest V3'te servis işçisi uyuduğunda kuyruk kesiliyor; alarm onu uyandırıyor |
| `scripting` | Yakalanan sayfayı kaydırmak ve sayfa görsellerini okumak |
| `debugger` | Yalnızca "Gizli" yakalama kipinde. Pencere açmadan ekran görüntüsü almak için. Varsayılan kip bunu kullanmaz |
| `offscreen` | Servis işçisinde DOM olmadığından görsel küçültme için |
| `<all_urls>` | Hangi siteyi ekleyeceğiniz önceden bilinemez; yalnızca eklediğiniz sayfaların görselini almak için kullanılır |

Hiçbir izin veri toplamak için kullanılmaz.

---

## Verinizi dışa aktarma ve silme

**Dışa aktarma:** Ayarlar → Yedekleme → Yedek al. Tüm veriniz tek bir
JSON dosyası olarak iner.

**Silme:** Ayarlar → Bakım → Tüm verileri sil. Ya da eklentiyi
kaldırın; tarayıcı depolanan verileri siler. Yer imleri kalır, çünkü
onlar tarayıcının kendi verisidir.

---

## Çocuklara yönelik değil

Eklenti çocuklara yönelik değildir ve yaş bilgisi toplamaz.

---

## Değişiklikler

Bu politika değişirse depodaki bu dosya güncellenir ve değişiklik
tarihi yukarıda belirtilir.

---

## İletişim

Sorularınız için:
https://github.com/muttixp/wsd-speed-dial/issues
