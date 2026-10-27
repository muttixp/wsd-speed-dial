# Gizlilik Politikası — WSD Speed Dial

Son güncelleme: 27 Ekim 2026

## Kısaca

WSD Speed Dial verilerinizi **sunucuya göndermez, satmaz ve
paylaşmaz.** Kart adresleri, sayfa başlıkları, küçük resimler, notlar
ve ayarlar yalnızca kendi tarayıcınızda saklanır.

Google'ın kural gereği yerel olarak işlenen veri de beyan edilir:
eklenti **web sitesi içeriği** (eklediğiniz sayfaların ekran görüntüsü
ve logosu) ile **kaydettiğiniz sayfa adreslerini ve başlıklarını**
cihazınızda işler. Bunların hiçbiri dışarı aktarılmaz.

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

Eklenti yalnızca şu durumlarda dışarıya bağlanır:

**1. Kart görseli yakalarken** — eklediğiniz sayfayı arka planda açıp
ekran görüntüsünü alır. Bu, o siteye normal bir ziyaret gibidir; site
sizi görebilir. Başka bir sunucuya veri gitmez.

**2. Favicon alırken** — grup ikonu olarak site simgesi seçerseniz
`google.com/s2/favicons` adresinden çekilir. Yalnızca sitenin alan adı
gönderilir. Bu özelliği kullanmazsanız böyle bir istek olmaz.

**3. Logo Yakala kullanırken** — kart düzenleme penceresinde "Logo
Yakala" düğmesine basarsanız, o kartın alan adı (ör. `example.com`)
`cdn.brandfetch.io` logo servisine gönderilir ve sitenin logosu alınır.
Logo bulunamazsa son çare olarak aynı alan adı
`google.com/s2/favicons` adresine de sorulur.
Kişisel veri, tanımlayıcı ya da tarama geçmişi gönderilmez. Özellik
yalnızca siz tetiklediğinizde çalışır; kendiliğinden istek yapmaz.

**4. Kırık bağlantı taraması yaparken** — Ayarlar'dan taramayı
başlatırsanız kartlarınızdaki adresler tek tek yoklanır. İstekler
yalnızca o sitelerin kendisine gider; başka bir sunucuya veri gitmez.
Tarama kendiliğinden başlamaz.

**5. Ana sayfadaki arama kutusunu kullanırken** — yazdığınız arama
yalnızca seçtiğiniz arama motoruna gider ("Tarayıcının arama motoru"
seçiliyse tarayıcınızın kendi motoruna). Eklenti aramaları okumaz,
saklamaz, kaydetmez. Listede görünen motorların simgeleri bir kez o
motorun kendi sitesinden (çerez gönderilmeden) alınıp yerelde saklanır
ve bir daha istenmez (alınamazsa en erken 7 gün sonra yeniden denenir).

**6. Hazır Gruplar penceresini açarken** — örnek grup listesi ve
seçtiğiniz paket, eklentinin kendi GitHub deposundan
(`raw.githubusercontent.com/muttixp/wsd-speed-dial`) okunur; ağ yoksa
eklentinin içindeki kopya kullanılır. Gönderilen bir veri yoktur;
pencereyi açmazsanız bu istek olmaz.

**7. Yedek klasörü kullanırken** — Ayarlar › Yedekleme'de bir klasör
seçerseniz yedekler yalnızca o klasöre yazılır. Eklenti hiçbir sunucuya
bağlanmaz; klasör bir bulut programının (OneDrive, Google Drive, Dropbox
vb.) klasörüyse yüklemeyi o program yapar. Klasör seçmezseniz böyle bir
yazma olmaz.

**8. Arama önerilerini açarsanız** — Ana Sayfa › Arama Çubuğu ›
Öneriler varsayılan olarak **kapalıdır**. Açarsanız arama kutusuna
yazdığınız metin, öneri listesi için seçili motorun öneri servisine
(Google, Bing, DuckDuckGo, Yandex, Wikipedia; kendi servisi olmayan
motorda Google, Rusça arayüzde Yandex) gönderilir. Çerez gönderilmez,
eklenti yazdıklarınızı saklamaz. Adres yazdığınızda istek gitmez.

**9. Hızlı Başla ve Site Logoları** — karşılama ekranında Hızlı Başla'ya
ya da Site Logoları düğmesine basarsanız eklenen sitelerin logoları
3. maddedeki gibi alınır. Basmazsanız bu istek olmaz.

**10. Eklentiyi kaldırdığınızda** — tarayıcı kısa bir "neden
kaldırdınız?" sayfası açar (`webteyazilim.net/wsd/kaldirildi.php`).
Adreste yalnızca eklentinin sürümü, arayüz dili ve mağaza (Chrome/Edge)
bulunur; kimlik, kullanım bilgisi, IP kaydı ya da çerez yoktur. Formu
doldurmak isteğe bağlıdır; doldurursanız yalnızca seçtiğiniz neden ve
yazdığınız not saklanır. Ad ya da e-posta istenmez.

---

## İzinler ve gerekçeleri

| İzin | Neden gerekli |
|---|---|
| `bookmarks` | Kartlar yer imi olarak saklanıyor; okumak ve yazmak için |
| `storage`, `unlimitedStorage` | Görseller, notlar ve ayarlar için. Görseller birkaç yüz MB'a ulaşabildiğinden varsayılan 5 MB kotası yetmiyor |
| `tabs` | Kartı yeni sekmede açmak, açık sekmenin adresini almak |
| `search` | Arama kutusunda "Tarayıcının arama motoru" seçildiğinde aramayı tarayıcının kendi motoruyla yapmak. Kurulumda uyarı göstermez |
| `contextMenus` | "WSD Speed Dial'e ekle" sağ tık menüsü |
| `alarms` | Görsel yakalama kuyruğunu sürdürmek. Manifest V3'te servis işçisi uyuduğunda kuyruk kesiliyor; alarm onu uyandırıyor |
| `scripting` | Yakalanan sayfayı kaydırmak ve sayfa görsellerini okumak |
| `debugger` | Yalnızca "Gizli" yakalama kipinde. Pencere açmadan ekran görüntüsü almak için. Varsayılan kip bunu kullanmaz |
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
