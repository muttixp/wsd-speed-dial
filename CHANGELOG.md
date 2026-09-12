# Değişiklikler

Sürüm numaraları [Semantic Versioning](https://semver.org/lang/tr/)
kurallarına uyar.

## [1.4.1] — 2026-09-12

### Yeni
- **Kırık bağlantı taraması**: kartların adresleri yoklanıyor, artık var
  olmayanlar (404/410) ayrı bir ekranda listeleniyor. Bulunan kartlar
  tarama sürerken anlık ekleniyor, beklemek gerekmiyor. Yan araç
  şeridindeki düğme yalnızca işaretli kart varken görünüyor; adres
  değiştirilince ya da sayfa yeniden yakalanabildiğinde işaret
  kendiliğinden kalkıyor. Ulaşılamayan ama kesin sonuç alınamayan
  adresler "şüpheli" olarak ayrı tutuluyor — bot koruması olan siteler
  yanlış işaretlenmesin diye
- Arama artık grup adlarıyla da eşleşiyor: yazdığınız terim bir grubun
  adında geçiyorsa sonuçların üstünde kart sayısıyla birlikte rozet
  olarak çıkıyor, tıklayınca o gruba gidiyor. Çok gruplu kurulumlarda
  aradığınız grubu bulmanın en hızlı yolu
- Yan araç şeridinden çöp kutusu, yinelenen kartlar ve grupları yönet
  ekranlarına doğrudan erişiliyor. Ayarlar panelindeki girişler de
  duruyor. Sıra: gizle, ara, grupları yönet, kırık bağlantılar,
  yinelenen kartlar, çöp kutusu, ayarlar
- Bakım bölümünde grup ve kart sayısı gösteriliyor

### Değişiklikler
- Yan araç şeridi kullanılmıyorken kenara çekiliyor, fare yaklaşınca
  açılıyor. Dar ekranda sağdaki kartların üzerine biniyordu; ızgaraya
  pay bırakmak yerine şerit kendisi çekiliyor, kart düzeni değişmiyor
- Çöp kutusu, yinelenen kartlar ve kırık bağlantılar şeritleri tek CSS
  kuralından besleniyor; köşe yarıçapı kart ayarını izliyor
- Üst bant şeridi kart başlıklarının üzerine biniyordu; artık açık olan
  şerit ölçülüp kart alanına o kadar boşluk veriliyor (önceden yalnızca
  arama şeridinde yapılıyordu)

## [1.4.0] — 2026-09-11

### Yeni
- Arama sonucu kartlarında grup rozeti: karta gelince beliriyor,
  tıklayınca o gruba gidiyor
- Grupları Yönet satırlarına "gruba git" ve "grubu düzenle" düğmeleri
- `chrome://`, `edge://`, `about:` gibi adresler artık kartlardan
  açılabiliyor (tıklama ve orta tık) ve bu adresler için adresi yazan
  düz bir kart üretiliyor
- Duvar kağıdı önizlemesi renklendirme ayarlarını anlık gösteriyor

### Düzeltmeler
- **Büyük depolarda çökme**: açılışta çalışan depo ölçümü tüm görselleri
  belleğe alıyordu; artık anahtar listesi ve `getBytesInUse` kullanılıyor.
  Öksüz temizliği, "her şeyi sil" ve yedek geri yükleme de değer okumuyor
- **Yedek alınamıyor**: yedek tek dev JSON dizesi olarak üretiliyordu ve
  dize sınırına takılıyordu. Artık parça parça yazılıyor; aday görseller
  yedeğe girmediği için dosya da küçüldü
- Kart görselleri yalnızca ekranda görünenler için yükleniyor; uzaklaşan
  kartın görseli bırakılıyor (kart ızgarası, arama, yinelenenler)
- Sahne Yakala bazen çalışmıyordu: sekme kapatılınca ya da sayfa
  yönlendirme yapınca süreç asılı kalıyordu
- Bakımda temizlik sonrası ve kart silindikten sonra depo tablosu
  güncellenmiyordu
- Kart başlığı 404 sayfasından kalmışsa yakalamada düzeltiliyor

### Değişiklikler
- **Yedekten yükle → Ekle** artık birleştiriyor: aynı adlı grup varsa
  yenisi açılmadan onun içine ekleniyor, o grupta zaten bulunan adresler
  atlanıyor. Var olan grubun ikonu ve görünümü korunuyor. İki ayrı yedeği
  üst üste yüklerken her grubun ikinci kopyası oluşuyordu
- Yedek dosyasına aday görseller yazılmıyor; dosya birkaç kat küçüldü
- "Zemini Renklendir" anahtarı kaldırıldı; nötr değerler zaten kapalı
  anlamına geliyor. Yanındaki işaretleme hatası da düzeltildi
- Kullanılmayan 6 dil anahtarı silindi

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
