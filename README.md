# WSD Speed Dial

Yer imlerinizi görsel kartlar hâlinde gösteren hızlı erişim sayfası.
Chromium tabanlı tarayıcılar için (Chrome, Edge, Vivaldi, Brave, Opera).

![Lisans](https://img.shields.io/badge/lisans-GPL--3.0-blue)
![Manifest](https://img.shields.io/badge/manifest-v3-green)
![Bağımlılık](https://img.shields.io/badge/bağımlılık-yok-lightgrey)

---

## Ne yapar

Yeni sekme sayfanızı, sık kullandığınız sitelerin ekran görüntüleriyle
dolu bir panoya çevirir. Kartlar gruplara ayrılır, sürükleyerek sıralanır,
üzerlerine not düşülür.

**Verileriniz tarayıcının kendi yer imlerinde durur.** Ayrı bir veritabanı
yok. Bunun üç faydası var:

- Tarayıcı senkronu bedava gelir — bir cihazda eklediğiniz kart diğerinde belirir
- Veriniz bize kilitlenmez, istediğiniz an yer imi yöneticisinden görürsünüz
- Eklentiyi kaldırsanız bile kartlarınız yer imi olarak kalır

Küçük resimler, notlar ve ayarlar `chrome.storage.local`'da tutulur.

---

## Kurulum

1. Paketi bir klasöre açın (ör. `C:\wsd`) — klasör kalıcı olsun, silmeyin
2. `chrome://extensions` adresini açın
3. Sağ üstten **Geliştirici modu**nu açın
4. **Paketlenmemiş öğe yükle** → klasörü seçin

**Güncelleme:** yeni paketi aynı klasörün üzerine açın, ardından eklenti
kartındaki yenile (⟳) simgesine basın. Kaldırıp yeniden yüklemeye gerek yok —
yalnızca izinler değişirse gerekir.

### Vivaldi kullanıyorsanız

Vivaldi kendi hız kadranını varsayılan tutar. Yeni sekmede WSD çıkması için:

**Ayarlar → Sekmeler → Yeni Sekme Sayfası → Uzantı**

### Anasayfa (ev) butonu

Ayarlar → **Anasayfa Kurulumu** bölümündeki adresi kopyalayıp tarayıcınızın
başlangıç sayfası ayarına yapıştırın.

---

## Özellikler

### Kartlar

- Sayfa açılınca ekran görüntüsü otomatik yakalanır
- Görsel beğenmediyseniz karuselden başka aday seçin, dosyadan yükleyin
  veya bir görsel adresi verin
- Renk etiketi, not, ziyaret sayacı
- Sürükleyerek sıralama, başka gruba taşıma
- Kart üzerine gelince: düzenle, not, yenile, taşı, sil

### Gruplar

- Şeritte sürükleyerek sıralanır
- 22 ikon, özel emoji veya sitenin favicon'u
- Gruba özel gösterim (yalnızca ikon / ikon+yazı / yalnızca yazı) ve ikon rengi
- **Grupları Yönet** ile toplu sıralama, yeniden adlandırma, silme

### Arama

Büyüteç simgesi veya `/` tuşu. Tüm gruplarda arar, sonuçta kartın hangi
gruptan geldiğini yazar.

### Görünüm

Duvar kâğıdı, zemin renklendirme (ton kaydırma veya iki renk), kart oranı,
boyut, köşe yuvarlaklığı, çerçeve, sütun sınırı, grup şeridi renkleri.

Sağdaki göz simgesi her şeyi gizler, yalnızca duvar kâğıdı kalır.

---

## Yedekleme ve taşıma

**Ayarlar → Yedekleme → Yedek al** ile tüm veriniz tek bir JSON dosyasına iner.
`WSD-27-8-2026-1457.json` biçiminde adlandırılır.

**Yedekten yükle** dört biçimi tanır:

| Kaynak | Taşınan |
|---|---|
| WSD (bu eklenti) | her şey |
| Eski WSD sürümleri | gruplar, kartlar, görseller, notlar, renkler, ayarlar |
| FVD Speed Dial (`fvd-full`) | gruplar, kartlar, görseller |
| FVD Speed Dial (özgün dışa aktarma) | gruplar, kartlar, tıklama sayıları |

FVD'nin özgün yedeğinde görseller taşınamaz: dosya yolu olarak saklandıkları
için başka bir eklenti onlara erişemez. Kartlar eklenir, görselleri yeniden
yakalanır.

Birden fazla tarayıcıdaki veriyi birleştirmek için: ilkinde **"Sil ve yükle"**,
sonrakilerde **"Ekle"** seçin.

### Çöp kutusu

Silinen kartlar 30 gün saklanır. Bildirimdeki **Geri Al** düğmesini
kaçırdıysanız boş alan menüsünden **Çöp Kutusu**'na girin.

---

## Ayarlar

| Bölüm | İçerik |
|---|---|
| Görünüm | duvar kâğıdı, zemin renklendirme, metin rengi |
| Kartlar | başlık, açılış şekli, oran, boyut, boşluk, çerçeve |
| Grup Şeridi | gösterim, renkler, boyut, Ana Sayfa görünürlüğü |
| Görüntü Yakalama | yöntem, kip, çözünürlük, kaydırma, kalite |
| Yedekleme | yedek al/yükle, otomatik yedek, çöp kutusu |
| Bakım | kullanılmayan veriler, ayarları sıfırla, tüm verileri sil |
| Anasayfa Kurulumu | ev butonu için adres |
| Uzantı Simgesi | simge renkleri |

### Görüntü yakalama kipleri

**Pencere** (varsayılan) — sayfa küçük bir pencerede açılır, kısa süre görünür.

**Gizli** — sekme arka planda açılır, pencere hiç görünmez. Karşılığında
tarayıcı üstte "hata ayıklıyor" çubuğu gösterir.

---

## Klavye

| Tuş | İşlev |
|---|---|
| `1` – `9` | o sıradaki gruba geç |
| `Home` / `End` | ilk / son grup |
| `PageUp` / `PageDown` | önceki / sonraki grup |
| `/` veya `Ctrl+F` | arama |
| `H` | her şeyi gizle / göster |
| `Ctrl+,` | ayarları aç / kapat |
| `N` | yeni kart |
| `G` | yeni grup |
| `Y` | grupları yönet |
| `Esc` | pencereyi/aramayı kapat |
| `Enter` (aramada) | ilk sonucu aç |

Kısayollar bir metin alanındayken ya da açık pencere varken çalışmaz.

---

## Bilinen sınırlar

- **Yakalama penceresi bir an görünür.** Tarayıcı yalnızca görünür sekmeyi
  yakalamaya izin verdiği için kaçınılmaz. "Gizli" kipi bunu çözer ama
  hata ayıklama çubuğu getirir.
- **Toplu yenileme uzun sürer.** Kart başına birkaç saniye. Kuyruk arka planda
  ilerler; tarayıcı kapansa bile kaldığı yerden devam eder.
- **`chrome://` sayfalarında** sağ tık menüsü ve bildirimler çalışmaz —
  tarayıcı bu sayfalarda eklenti betiği çalıştırmaz.

---

## Geliştirme

Bağımlılık yok, derleme adımı yok. Dosyaları düzenleyip eklentiyi yenilemek
yeterli.

```
manifest.json      MV3 tanımı
index.html         yeni sekme sayfası
css/wsd.css        tasarım sistemi (değişkenler, bileşenler)
js/
  wsd.js           giriş noktası
  arkaplan.js      servis işçisi — menüler, simge, mesajlar
  yerimi.js        yer imi katmanı (gruplar, kartlar)
  cizim.js         grup şeridi ve kart ızgarası
  etkilesim.js     menüler, pencereler, kart işlemleri
  ayar.js          ayar deposu ve varsayılanlar
  ayarpanel.js     ayarlar paneli
  yakalama.js      ekran görüntüsü kuyruğu
  gorsel.js        görsel deposu ve küçültme
  arama.js         arama
  kartsurukle.js   kart sürükleme motoru
  grupsurukle.js   grup şeridi sürükleme
  yedek.js         yedekleme, içe aktarma, temizlik
  cop.js           çöp kutusu
  ...
```

CSS'te renk, boşluk ve köşe değerleri `:root` altındaki değişkenlerden gelir.
Yeni bileşen eklerken sabit değer yazmak yerine bunları kullanın.

---

## Katkı

Çeviri katkısı özellikle değerli — şu an yalnızca Türkçe ve İngilizce var.

Ayrıntılar için `CONTRIBUTING.md` dosyasına bakın.

---

## Lisans

**GNU General Public License v3.0** — bkz. `LICENSE`.

Kısaca: kullanabilir, inceleyebilir, değiştirebilir ve dağıtabilirsiniz.
Değiştirip dağıtırsanız kaynağı da aynı lisansla açmanız gerekir.

Bu proje, kaynağı kapalı bir eklentiyi temel alamadığı için sıfırdan
yazıldı. Aynı durumun tekrarlanmaması adına GPL seçildi.

Kullanılan üçüncü taraf kod yoktur — tüm kaynak sıfırdan yazılmıştır.

Copyright (C) 2026 muttixp
