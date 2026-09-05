# Değişiklikler

Sürüm numaraları [Semantic Versioning](https://semver.org/lang/tr/)
kurallarına uyar.

## [1.3.0] — 2026-09-04

### Yeni
- Alan Seç: Sahne Yakala çubuğundan sürükleyerek istediğiniz bölgeyi
  kırpma (Shift ile 16:10 kilidi, ESC iptal)
- Uzun Çekim: sayfayı kaydırarak birden fazla kareyi tek görselde
  birleştirme; sabit/yapışkan öğeler çekim boyunca gizleniyor
- Logo Yakala: sitenin logosunu bulup 16:10 karta yerleştirme.
  Adaylar ızgarada gösteriliyor, tıkladığınız karusele giriyor
- Logosu saydam olan sitelerde bir de marka renginde varyant üretiliyor

### İyileştirmeler
- Logo araması canlı sayfa üzerinde yapılıyor (inline SVG, `srcset`,
  CSS arka planı, ikon bildirimleri); "basında biz" şeritleri eleniyor
- Çek yalnızca video/iframe oynatıcıya kırpıyor; sayfadaki rastgele
  görsele yapışan `<img>` taraması kaldırıldı

### Düzeltmeler
- Görüntü yakalama **Yöntem** ayarı çalışmıyordu; "Ekran görüntüsü"
  seçilse bile sayfa görselleri alınıyordu
- Logo adayları kart penceresi değişince temizlenmiyordu
- Geniş ve alçak yazı logoları (ör. 160×27) ölçü kontrolüne takılıp
  eleniyordu

## [1.2.0] — 2026-09-03

### Yeni
- Sahne Yakala: kart düzenlerken sayfayı açıp videonun istediğiniz
  karesini seçerek yakalama. Video öğesine kırpılır, arayüz girmez
- Yerel dosya ve klasörler kart olabiliyor (`file:///`)
- Görsel Yerleşimi ayarı: Kırp / Sığdır
- YouTube kartları bantsız kapakla geliyor (maxresdefault/mqdefault)
- Grup açıklaması — sekme ipucunda görünüyor

### İyileştirmeler
- Görsel seçimi akıllandı: kart oranına en yakın, en yüksek çözünürlüklü
  aday öne geliyor; placeholder ve logo'lar eleniyor
- `<picture>`/`srcset` görselleri de taranıyor
- Kart Düzenle penceresi daha derli toplu
- Kart arka plan rengi hem uygulanıyor hem palette doğru gösteriliyor

### Düzeltmeler
- Ayar açılırken çift kaydırma çubuğu
- Açılır menüler modal içinde perdeyi kapatmıyor
- Grup şeridinde seçili sekmeye kaydırma
- select ayarları anında uygulanıyor

## [1.1.0] — 2026-09-01

### Yeni
- Yerel dosya ve klasörler kart olabiliyor (`file:///`) — PDF, belge,
  resim ve klasör kataloglama. Sağ tık menüsü resim, video, ses ve
  seçili metin üzerinde de çıkıyor
- Yinelenen kartlar ekranı: aynı adresi birden fazla grupta bulup
  görselleriyle yönetme
- Gruplara açıklama alanı — kısa ad ya da ikon kullanılan grubun ne
  için olduğu, sekmenin üzerine gelince ipucunda görünüyor
- Tutarlılık kontrolü: eksik görselleri, yinelenen adresleri ve boş
  grupları bulan denetim
- Depolama denetimi, alan bitmeden uyarı ve veri kaybı denetimi
- Silme onaylarında "Bir daha sorma" seçeneği

### Düzeltmeler
- Türkçe ve İngilizce arayüz tamamlandı
- Açık sekmeler arasında canlı eşitleme
- Görsel indirme artık ayarlardaki biçimde (JPEG/PNG)
- Çeşitli menü, perde, kaydırma ve şerit düzeltmeleri

## [1.0.0] — 2026-08-31

İlk sürüm.

### Kartlar
- Sayfa eklenince ekran görüntüsü otomatik yakalanıyor
- Aday görseller arasında geçiş, dosyadan yükleme, adresten alma
- Not, renk etiketi, ziyaret sayacı
- Sürükleyerek sıralama ve gruplar arası taşıma
- Beş ölçütle tek seferlik sıralama

### Gruplar
- Şeritte sürükleyerek sıralama
- 22 ikon, özel emoji ya da sitenin favicon'u
- Gruba özel gösterim biçimi ve ikon rengi
- Toplu yönetim penceresi

### Veri
- Kartlar tarayıcının kendi yer imlerinde — senkron bedava geliyor
- Yedek alma ve yükleme; dört biçim tanınıyor (WSD, eski WSD, FVD ×2)
- Bağımsız HTML sayfası olarak dışa aktarma
- Çöp kutusu: silinen kart ve gruplar 30 gün saklanıyor

### Görünüm
- Duvar kâğıdı, zemin renklendirme (ton kaydırma / iki renk)
- Kart oranı, boyutu, köşesi, boşluğu, çerçevesi
- Grup şeridi renkleri ve boyutu

### Diğer
- Türkçe ve İngilizce arayüz
- Klavye kısayolları
- Tüm gruplarda arama
