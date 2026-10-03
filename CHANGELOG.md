# Değişiklikler

Sürüm numaraları [Semantic Versioning](https://semver.org/lang/tr/)
kurallarına uyar.

## [1.5.2] — 2026-10-03

### Yeni
- Klavyeyle grup değiştirme: **←** / **→** ve **-** / **+** tuşları da
  önceki / sonraki gruba geçiyor (PageUp / PageDown gibi, son gruptan
  sonra başa dönüyor)
- **Kart başlığı ayarları** (Ayarlar › Kartlar › Başlık): Başlık Rengi,
  Başlık Stili (Normal / Kalın / İtalik / Kalın İtalik), Başlık Gölgesi
  ve Gölge Rengi. Gölge varsayılan olarak açık (1px 1px 2px #4D4C4C):
  açık ya da karışık duvar kâğıdında başlık okunaklı kalıyor. Başlık
  Yazı Boyutu da bu alt başlığa taşındı; klasör başlıkları aynı ayarları
  kullanıyor
- **Sağ tık menüsünden alt klasöre ekleme, üç kip** (Ayarlar › Sistem ›
  Sağ Tık Menüsü):
  - **Gruplar + Klasör seç…** (varsayılan): gruplar tek tıkla ekler;
    menünün en üstündeki "Klasör seç…" küçük bir pencere açar, Taşı
    penceresindeki ağacın aynısı; adına tıklanan klasöre (hangi
    derinlikte olursa) eklenir, ▸ yalnızca dalı açar. Arama, açık dallar
    ve son seçilen yer hatırlanıyor
  - **İç içe menüler**: alt klasörü olan grup/klasör kendi alt menüsünü
    açar; ilk satır "＋ Ad" onun kendisi (alt menüsü olan satıra Chrome
    tıklatmıyor), altında alt klasörler (6 seviyeye kadar)
  - **Yalnızca gruplar**: 1.5.1'deki gibi
  Sayfada çıkan bildirim tam yolu yazıyor ("Y › d")

### Değişiklikler
- Ayarlarda "Grup Şeridi" bölümünün adı **Grup Menüsü** oldu ve
  Kartlar'ın üstüne alındı. İki yeni ayar: **Menü Yazı Rengi** ve
  **Aktif Grup Yazı Rengi** (aktif grup rengi açık seçilince yazı
  okunmuyordu). Seçilmezse eskisi gibi genel metin rengi kullanılıyor. Bölümün
  içindeki "Sekme Boyutu / Sekme Zemin Rengi / Sekme Zemin Saydamlığı"
  da "Menü …" oldu
- Ayarlardaki "Tehlikeli İşlemler" bölümünün adı **Sıfırlama** oldu (uyarı
  simgesi ve kırmızı başlık duruyor)
- Temizlik: kullanılmayan iki ayar anahtarı (`kartKose`,
  `grupSayiGoster`) ve bir çeviri anahtarı kaldırıldı
- Kırık bağlantılar ekranında "Hepsini sil" ikiye ayrıldı: **Kırıkları
  sil** ve **Ulaşılamayanları sil**. Her biri yalnızca kendi listesini
  çöp kutusuna taşıyor, öbürüne dokunmuyor; silinecek bir şey yoksa
  düğme görünmüyor
- **Ayarlar paneli yeniden düzenlendi**: "Uzantı Simgesi", "Anasayfa
  Kurulumu", "Sağ Tık Menüsü" ve "Kısayollar" tek bir **Sistem**
  bölümünde toplandı; her biri tıklayınca açılan alt başlık. "Yedekleme
  ve Aktarma" ile "Bakım" aşağıya, "Sıfırlama"nın hemen üstüne alındı.
  Sıra: Görünüm, Grup Menüsü, Kartlar, Görüntü Yakalama, Sistem,
  Yedekleme ve Aktarma, Bakım, Sıfırlama
- Bölüm başlıkları dönüşümlü zeminli; Sistem mor, Yedekleme mavi, Bakım
  yeşil, Sıfırlama kırmızı. Panelin kenar boşluğu daraltıldı
- Panel **son açık bölümü hatırlıyor** (Sistem'in alt başlıkları dahil);
  Sıfırlama açık bırakılsa da sonraki açılışta kapalı geliyor

### Düzeltmeler
- Aktif Grup Rengi açık seçilince o renkteki düğmelerin ("Başlat",
  "Kaydet", seçili etiket…) beyaz yazısı okunmuyordu. Bu düğmelerin yazısı
  artık Grup Menüsü'ndeki **Aktif Grup Yazı Rengi**'ni kullanıyor;
  seçilmemişse zemine göre kendiliğinden koyu ya da beyaz oluyor
- Aktif Grup Rengi beyaz (ya da çok açık) seçilince ayarlardaki açık/kapalı
  anahtarları bembeyaz görünüyor, açık mı kapalı mı anlaşılmıyordu.
  Anahtarlar artık seçilen renkten bağımsız, sabit mavi
- Boş alan menüsündeki "Hepsini yenile" yalnızca ekrandaki kartları
  yeniliyor, klasör kutularının içindekileri atlıyordu. Artık grup
  sekmesindeki "Görselleri yenile" gibi alt klasörleri de kapsıyor;
  önce ekrandaki kartlar, sonra klasörlerin içindekiler yenileniyor
- **"Görselleri yenile" bir kartta durup devam etmiyordu.** Dört ayrı
  neden kapatıldı: (1) "Otomatik" yöntemde sayfa görseli aranırken
  bağlantıyı kabul edip yanıt vermeyen site isteği sonsuza kadar
  bekletiyordu; isteklere 12 sn sınır kondu. (2) Bir kartın tüm işlemi
  artık tek üst sınır altında (150 sn); aşılırsa o kart atlanıp sıradakine
  geçiliyor. (3) 300'den büyük bir grup yenilenirken arka plan işçisi
  yeniden başlarsa "kuyruk çok büyük" diye tüm yenileme sessizce iptal
  ediliyordu; sınır artık yalnızca arka planda biriken işlere uygulanıyor,
  kullanıcının başlattığı yenileme kaç kart olursa olsun sürüyor. (4)
  Yenileme sürerken işçi uyutulmuyor; döngü yine de 3 dakika ilerlemezse
  bekçi onu yeniden başlatıyor
- Yakalama süre sınırını aşan kart atlandığında işlem arkada çalışmaya
  devam ediyor, sıradaki kartla aynı anda iki yakalama penceresi
  açılabiliyordu; artık sınır aşılınca yakalama bırakılıp penceresi
  kapatılıyor. Açılan pencereyi tarayıcı başka bir pencereye sekme
  olarak taşırsa ("No window with id" hatası) sekmenin bulunduğu pencere
  yakalanıyor; sekme etkin değilse yanlış sayfayı yakalamak yerine kart
  atlanıyor ve o sekme açık bırakılmıyor
- **Büyük içe aktarma "5407 / 5407"de takılıyordu**: ayarlar paneli
  açıkken eklenen her kart için depo durumu yeniden ölçülüyordu (her
  ölçüm tüm yer imi ağacını geziyor). Binlerce kartta bu iş kuyruğu
  aktarma bittikten sonra dakikalarca sürüyor, sayfa yenilense bile
  siyah ekran kalıyordu. Ölçüm artık aktarma bitene kadar bekliyor ve
  tek seferde yapılıyor (1500 kartta 17,7 sn → 1,2 sn)
- İçe aktarma penceresi kartlar bittikten sonraki adımları da yazıyor:
  "Notlar, renkler, etiketler ve ayarlar kaydediliyor…", "Tamamlanıyor:
  eksik görseller sıraya alınıyor…", "Sayfa yenileniyor…". Aşama adları
  artık çevriliyor

## [1.5.1] — 2026-09-30

### Yeni
- **Adlı etiketler**: Kart Düzenle penceresinde renk etiketinin altında
  "Etiketler" alanı: ad + renk yazıp Ekle ile karta etiket veriliyor, bir
  kart birden çok etiket alabiliyor, × ile karttan kaldırılıyor. Aynı ad
  (büyük/küçük harf farkı önemsiz) yeni etiket açmıyor, var olanı
  kullanıyor; yazarken var olan adlar öneriliyor. Etiketli kartın görsel
  köşesinde renkli noktalar, üstüne gelince adları
- **Etiket listesi aramada**: Arama boş açılınca kullanılan renk etiketleri
  ve adlı etiketler sayılarıyla listeleniyor; tıklayınca tüm gruplardaki o
  etiketli kartlar geliyor, tekrar tıklayınca kalkıyor. Adlı etiketin ×'i
  etiketi tüm kartlardan kaldırıyor (onay sorulur, kartlar silinmez).
  Aramaya yazılan kelime etiket adlarında da aranıyor
- **Taşıma penceresi ağaç görünümünde**: alt klasörü olan gruplar ve
  klasörler renkli ve ▸ işaretli; tıklayınca açılıp içindeki klasörler
  görünüyor. Alt klasörü olmayan hedefe tek tıkla taşınıyor, dalın
  kendisine taşımak için çift tık. Açık bıraktığınız dallar ve son
  seçtiğiniz hedef hatırlanıyor; aramada eşleşen klasörün üstleri
  kendiliğinden açılıyor. Bulunulan yer soluk gösteriliyor
- **Aramada alt klasörler de çıkıyor**: yalnızca gruplar değil, adı
  eşleşen alt klasörler de sonuçların üstünde yoluyla birlikte rozet olarak
  görünüyor (ör. "Os › Windows › Ltbs (2)"); tıklayınca o klasör açılıyor
- **Klasöre arka plan rengi ve kapak resmi**: Klasörü düzenle penceresinde
  kutunun arka plan rengi seçilebiliyor ve kapak resmi eklenebiliyor
  (Resim seç…, önizlemeye sürükle-bırak ya da Ctrl+V ile yapıştır). Kapak
  varsa kart önizleme mozaiğinin yerine o görünüyor; resim kart ölçüsüne
  küçültülüp klasörün görünüm kaydında tutuluyor, yedeğe ve çöpe onunla
  birlikte gidiyor
- **"Kırık değil"**: kırık bağlantılar ekranında kartın araç şeridinde
  ilk simge (yeşil sağlam bağlantı simgesi) ve kartın sağ tık menüsünde
  (araç şeridi ayardan kapalıyken de kullanılabilsin); adres listeden
  düşer ve sonraki taramalarda atlanır
- Etiketler yedeğe (elle, otomatik ve silme öncesi yedek) giriyor ve geri
  yükleniyor; çöpe giden kart ve gruplar etiketleriyle gidip etiketleriyle
  geri geliyor (etiket bu arada silinmişse adıyla yeniden kuruluyor);
  renk adları çevrildi

### Değişiklikler
- **Yan araç paneli: "kapat" yerine "gizle"**: Ayar artık "Yan Araç Panelini
  Gizle". Açıkken (varsayılan) panel kenara çekili durur, fare yaklaşınca
  açılır; kapatınca eskisi gibi hep açık kalır. Paneli tamamen kapatma
  seçeneği kaldırıldı
- **Tek köşe yuvarlaklığı ayarı**: "Sekme Köşe Yuvarlaklığı" genel ayar oldu
  (Görünüm › Yazı ve Panel › Köşe Yuvarlaklığı). Kartlar, klasörler, sekmeler,
  pencereler, menüler, düğmeler ve etiketler köşesini buradan alıyor; 0'da her
  şey köşeli. Ayrı "Kart Köşe Yuvarlaklığı" kaldırıldı, sekme için seçtiğiniz
  değer korunuyor
- **Ayar paneli yeniden düzenlendi**: bölümlerin içinde alt başlıklar
  (Kartlar: Davranış / Boyut ve Yerleşim / Renk ve Çerçeve; Grup Şeridi:
  Davranış / Görünüm; Görünüm: Arka Plan / Yazı ve Panel; Görüntü
  Yakalama: Yöntem / Görüntü). "Yedekleme" → "Yedekleme ve Aktarma":
  içe aktarma araçları Bakım'dan buraya taşındı. Ayarları sıfırlama ve
  tüm verileri silme ayrı, kırmızı başlıklı **Tehlikeli İşlemler**
  bölümünde. Kısayollar listesine Backspace ve Alt+←/→ eklendi.
  İşlem düğmeleri yan araç şeridindeki gibi küçük kutular (simge + kısa
  ad, satırda üç); Çöp Kutusu ve "Bekleyen yakalamaları iptal et" Bakım'a
  alındı. Ayarların kendisi değişmedi
- **Menüler tutarlı hâle getirildi**: tek yazım düzeni ("Yeni sekmede aç",
  "Grupları yönet…"), pencere açan öğelerde "…", "Url yi kopyala" →
  "Adresi kopyala", grupta "Kaldır" → "Sil", yenileme her yerde "Görseli /
  Görselleri yenile". Sil her menüde en altta ve kırmızı; menüler ince
  ayraçlarla Aç / Düzenle / Sil kümelerine ayrıldı. Klasör menüsüne
  "Tümünü yeni pencerede aç" eklendi. Kart araç şeridi ipuçları artık
  çevriliyor (İngilizce arayüzde Türkçe görünüyordu)
- Mağaza özet açıklaması (manifest) iç içe klasörleri de anlatıyor

### Düzeltmeler
- Kırık bağlantılar ve arama ekranında boş alana sağ tıklayınca "Kart
  ekle / Yeni grup" menüsü çıkıyordu (ekranda tek grup yok, nereye
  ekleneceği belirsiz). Artık çöp ve yinelenenler ekranı gibi menü çıkmıyor
- Kırık bağlantı taraması var olan sayfaları kırık sayabiliyordu (ör.
  XenForo forum sayfaları HEAD isteğine 404 dönüp GET'te açılıyor). Artık
  HEAD yalnızca "sayfa var" dediğinde yeterli; karar GET'in. 404/410
  kısa bir aradan sonra ikinci kez doğrulanıyor; aynı siteye aynı anda
  tek istek gidiyor (hız sınırına takılıp yanlış sonuç vermesin); iki kez
  "yok" denen adres son olarak tarayıcı çerezleriyle bir kez daha
  deneniyor (oturum isteyen / bot korumalı siteler)
- Kırık bağlantı sayıları tutarlı: tarama "1 kırık" derken ekran 40
  gösteriyordu (kırık + ulaşılamayan toplamı). Ekran artık "1 kırık · 39
  ulaşılamadı" yazıyor. Siteye ulaşılıp engellenen adresler (401/403/429,
  bot koruması) artık "ulaşılamadı" sayılmıyor, sağlam kabul ediliyor;
  listede yalnızca hiç cevap vermeyenler (alan adı yok, zaman aşımı,
  sunucu hatası) kalıyor. "Hepsini sil" onayı ulaşılamayanları da sayıp
  40 diyordu, ama yalnızca kırıkları siliyordu; artık doğru sayıyı
  söylüyor ve ulaşılamayan listesini silmiyor. "Kartları göster" yalnızca
  ulaşılamayan varken de çıkıyor
- Grupları Yönet ve Taşı penceresinde arama önce içinde geçene
  gidiyordu ("os" → Bios, Os en altta kalıyordu). Artık sıra: adı tam
  eşleşen, adı terimle başlayan, adında geçen (Taşı'da en son yolunda
  geçen); Enter sonrakine geçer. Grupları Yönet'te eşleşmeyen satırlar
  soluk gösteriliyor
- Tutarlılık: grup/klasör penceresinde "Özel emoji" ve "Site URL" ikon
  seçiminin hemen altına alındı; pencere alanları küçük harfle ("İkon
  rengi"), ayar satırları baş harfleri büyük ("İkon Rengi", "JPEG
  Kalitesi") yazılıyor; İngilizcede "Colour/Color" karışıklığı "Color"
  olarak birleştirildi; "Yeni Grup" başlığı, grup kart sayısı ve onay
  penceresi başlığı artık çevriliyor; kullanılmayan 16 çeviri anahtarı
  temizlendi
- README ve mağaza açıklaması 1.5.1 özellikleriyle güncellendi (etiketler,
  klasör kapak/arka plan, ağaç taşıma, tek köşe ayarı, yan panel gizleme);
  README ayar tablosunda Çöp Kutusu ve bekleyen yakalamalar Bakım'da
- Duvar kâğıdı kapalıyken "Arka Plan Rengi", "Metin Rengi" ve "Yan Araç
  Paneli" ayarları görünmüyordu (renklendirme kutusunun içinde kalmışlardı)

## [1.5.0] — 2026-09-25

### Yeni
- **İç içe klasörler**: grubun içindeki yer imi klasörleri ızgarada klasör
  kutusu olarak görünüyor (kart sayısı, alt klasör sayısı ve ilk dört
  kartın önizlemesi). Tıklayınca içine giriliyor; üstte yol şeridi
  (`elfinder › template`) ve bir üst klasöre dönüş düğmesi var,
  `Backspace` de bir üst klasöre çıkarıyor. Grup şeridi değişmedi
- **İleri / geri**: dosya gezgini gibi farenin yan tuşları, `Alt+←/→`
  ve tarayıcının geri/ileri düğmeleri klasörler ve gruplar arasında
  gezdiriyor
- Boş alan menüsünde **Yeni Klasör**; klasör kutusunun sağ tık menüsünde
  Aç / Hepsini aç / Görselleri yenile / Düzenle / Taşı / Sil
- **Klasör düzenleme** grup penceresiyle aynı: ad, açıklama (ipucunda),
  ikon (22 ikon, emoji ya da site favicon'u) ve ikon rengi. Özel ikonlu
  klasörde önizleme mozaiği yerine ikon büyük görünüyor; başlıkta da
  küçük hâli var. Aynı klasörde aynı adlı iki alt klasör engelleniyor.
  Klasör ikonları yedeğe ve çöp kutusuna giriyor
- Klasör kutusunun üzerine gelince kartlardaki gibi **araç şeridi**:
  Düzenle / Not / Görselleri yenile / Taşı / Sil
- Klasöre **not** (köşede sarı işaret) ve **renk etiketi** (alt şerit,
  Düzenle penceresinden). İkisi de yedeğe ve çöp kutusuna giriyor
- Kart, **klasör kutusuna** ya da **yol şeridindeki** bir üst klasöre
  sürüklenerek taşınıyor
- **Klasör sürükle-bırak**: klasör kutusu başka bir klasörün kenarına
  bırakılınca sıralanıyor (mavi çizgi), ortasına bırakılınca içine
  giriyor. Yol şeridine ya da bir grup sekmesine bırakılınca oraya
  taşınıyor; Ana Sayfa sekmesine bırakılan klasör grup oluyor
- Klasör **taşınabiliyor**: başka bir gruba/klasöre ya da "üst düzey grup
  olarak" şeride. Grup menüsünde **Başka gruba taşı**: bir grubu başka
  grubun içine alt klasör olarak alıyor (düzleşmiş eski aktarımları
  toparlamak için)
- Kart taşıma listesinde ve Düzenle penceresinin Grup alanında alt
  klasörler tam yollarıyla (`elfinder › config`) yer alıyor
- **Yer imi içe aktarma alt klasörleri koruyor**: her üst klasör bir grup,
  içindeki klasörler onun alt klasörleri oluyor. "Alt klasörleri koru"
  kutusu kaldırılırsa eski davranış (her klasör ayrı grup)

### Düzeltmeler
- **Alt klasördeki kartların görselleri "kullanılmayan veri" sayılıp
  siliniyordu**: öksüz taraması yalnızca grupların ilk seviyesine
  bakıyordu. Artık bütün ağaç geziliyor
- Alt klasördeki kartlar yedeğe girmiyor, aramada, kırık bağlantı
  taramasında, yinelenen kartlarda ve tutarlılık denetiminde çıkmıyordu.
  Hepsi artık alt klasörleri de kapsıyor; yedek klasör yapısını ve
  sırasını koruyor (eski sürümler bu yedeği açınca kartları grubun kendisine koyar)
- Grup silinince alt klasörleri çöp kutusuna girmiyordu; artık tüm ağaç
  yedekleniyor ve Geri Al ile aynı yapıda, aynı sırayla dönüyor.
  Alt klasör silinirse eski yerine, üst klasörü de silinmişse grup olarak dönüyor
- Grupları Yönet'te silinen gruplar çöp kutusuna gitmeden yok oluyordu
- Alt klasöre yer imi çubuğundan eklenen sayfanın görseli yakalanmıyordu
- Sağ tık menüsünden eklerken "zaten ekli" kontrolü alt klasörleri görmüyordu
- Aramadan açılan bir kartı Düzenle'de kaydetmek, grubu değişmese de onu
  açık gruba taşıyabiliyordu
- Başka bir WSD sekmesindeki değişiklik, bu sekmeyi o sekmede son açılan
  gruba atlatıyordu; "Son grubu hatırla" kapalıyken her değişiklikte ilk
  gruba dönülüyordu. Artık ekrandaki klasörde kalınıyor
- Grup sekmesindeki kart sayısı alt klasörleri de sayıyor
- **Grup yenilemede önce başka kartlar yenileniyordu**: alt klasörlerin
  kartları ağaç sırasında öne düşüyordu ve kuyrukta bekleyen arka plan
  işleri (yeni eklenen yer imleri) kullanıcının isteğinden önce
  işleniyordu. Artık ekrandaki kartlar ızgara sırasıyla önce, alt
  klasörlerdekiler sonra geliyor; elle istenen her yenileme (kart,
  grup, klasör, Hepsini Yenile) bekleyen arka plan işlerinin önüne geçiyor
- **İçe aktarma sırasında yakalama çalışıp işlemi kasıyordu**: her yeni
  yer imi arka planda görsel yakalamayı başlatıyordu. Artık aktarma
  (yedekten yükleme, yer imi aktarma) sürerken yakalama, sağ tık menüsü
  kurulumu ve ekran tazelemesi bekliyor; bitince yalnızca görseli
  olmayan kartlar tek seferde kuyruğa alınıyor. 300'den fazlaysa
  kendiliğinden başlamıyor, bildirimle grup yenilemesi öneriliyor
- **Aktarma sessiz bitiyordu**: sonuç bildirimi sayfa yenilenmeden hemen
  önce gösterilip kayboluyordu. Artık "✓ İçe aktarma tamamlandı: …"
  yenilenen sayfada 8 saniye görünüyor (yedekten yükleme, silme
  yedeğini geri alma, tüm verileri silme, ayarları sıfırlama, yer imi
  aktarma)
- Toplu yenileme başlarken kuyrukta önceki yenilemelerden kalan iş
  varsa soruluyor: "Önce onlar iptal edilsin mi?" (İptal et / Kalsın)
- **Yavaş açılan sitelerde "görüntü alınamadı"**: yakalama sekmesi önce
  boş sayfayla "yüklendi" durumuna geçiyor ve site geç yanıt verince boş
  sekme yakalanmaya çalışılıyordu (`Cannot access contents of url ""`).
  Artık gerçek adres gelmeden sayfa hazır sayılmıyor; bu hata yine de
  gelirse bir kez daha bekleyip deneniyor

## [1.4.3] — 2026-09-24

### Yeni
- **Kart taşımada grup arama**: açılır liste yerine aranabilir grup
  listesi. Grupları Yönet'teki aramayla aynı mantık: yazdıkça eşleşen
  gruba kaydırıp seçiyor, Enter sonraki eşleşmeye atlıyor; tıklama
  seçer, çift tıklama taşır
- **Görseli alınamayan kartlar boş kalmıyor**: sitenin alan adını ve
  "görüntü alınamadı" satırını taşıyan, üstü çizili görsel simgeli bir
  yer tutucu üretiliyor. Toplu yenileme bitince kaç kartın alınamadığı
  da bildiriliyor
- **Grupları Yönet'te grup arama**: yazdıkça eşleşen satıra kaydırıp
  vurguluyor, liste bütün kalıyor; Enter sonraki eşleşmeye atlıyor.
  Çok gruplu kurulumlarda kaldığın yeri bulup aşağı doğru devam etmek
  için
- **Grupları Yönet satırlarına yenile düğmesi**: o grubun tüm
  kartlarının görselini yeniden yakalatıyor, pencere açık kalıyor
- Kırık bağlantılar ekranı artık **ulaşılamayan** adresleri de gösteriyor
  ("ulaşılamadı" rozetiyle, kırıkların ardında). DNS hatası, zaman aşımı
  ya da SSL sorunu olan kartlar 404 sayılmıyor ama görünür oluyor;
  "Tekrar tara" ikisini birden yokluyor

### Düzeltmeler
- **Kırık bağlantılar ekranı "ulaşılamadı" kartında çöküyordu**: `kirik.js`
  çeviri işlevini içe aktarmıyordu (`c is not defined`)
- **Gizli kipte toplu yenilemede kartlar "görüntü alınamadı" kalıyordu**:
  arka plan sekmesinde `Page.captureScreenshot` bazı sitelerde hiç
  dönmüyordu. Gizli yakalama başarısız olursa kart bir kez pencere
  kipiyle yeniden deneniyor; `captureScreenshot` zaman aşımı 20 sn'den
  10 sn'ye indi
- **Sahne Yakala bazı sitelerde hiç görünmüyordu**: çubuk `innerHTML` ve
  satır içi `style` öznitelikleriyle kuruluyordu, katı CSP uygulayan
  siteler bunları engelliyordu. Artık DOM ile kurulup stiller CSSOM'dan
  veriliyor
- Sayfadaki çerez/onay ve reklam katmanları çubuğun tıklamasını
  yutabiliyordu: çubuk tarayıcının üst katmanına alındı, üstünde kalan
  öğeler yakalama süresince etkisizleştiriliyor. Yine de engellenirse
  aynı işlemler klavyeden yapılabiliyor (Enter çek, A alan seç,
  U uzun çekim, Esc vazgeç)
- Sahne Yakala bazen tıklamaya yanıt vermiyor, ancak sayfa yenilenince
  çalışıyordu: askıda kalan önceki yakalama yeni istekte kapatılıyor ve
  düğme her durumda geri açılıyor
- **Yumuşak 404**: sunucu 200 dönüp boş sayfa verdiğinde kart bomboş
  kalıyordu. Yakalanan kare renk çeşitliliği ve parlaklık sapmasıyla
  ölçülüyor; boşsa yer tutucuya çevriliyor
- **Toplu yenileme tek bir kartta takılıp kalıyordu**: yanıt vermeyen
  sayfalarda `Page.captureScreenshot` ve `captureVisibleTab` hiç
  dönmüyordu. Tüm yakalama çağrıları zaman aşımına bağlandı, iş başına
  45 saniyelik tavan kondu; süre aşılırsa o kart atlanıp kuyruk devam
  ediyor ve açılan sekme/pencere kapanıyor

## [1.4.2] — 2026-09-24

### Yeni
- **Yeni arayüz dilleri**: Rusça, Ukraynaca, İspanyolca, Portekizce
  (Brezilya ve Portekiz) ve Çince (Basitleştirilmiş). Tarayıcı diline göre
  otomatik seçiliyor

### Düzeltmeler
- Aktif grup silinince listenin başındaki gruba gidiliyordu; artık
  silinen grubun komşusuna geçiliyor
- "Tüm verileri sil" onayı Türkçe büyük harf kuralıyla karşılaştırılıyordu;
  İspanyolca ve Portekizce onay kelimesi hiç kabul edilmiyordu
- İngilizce arayüzde yedi metin çevrilmemişti, anahtar adı görünüyordu
  ("kopyalandi", "tamam" gibi); düzeltildi

## [1.4.1] — 2026-09-12

### Yeni
- **Kırık bağlantı taraması**: kartların adresleri yoklanıyor, artık var
  olmayanlar (404/410) ayrı bir ekranda listeleniyor. Bulunan kartlar
  tarama sürerken anlık ekleniyor, beklemek gerekmiyor. Yan araç
  şeridindeki düğme yalnızca işaretli kart varken görünüyor; adres
  değiştirilince ya da sayfa yeniden yakalanabildiğinde işaret
  kendiliğinden kalkıyor. Ulaşılamayan ama kesin sonuç alınamayan
  adresler "şüpheli" olarak ayrı tutuluyor — bot koruması olan siteler
  yanlış işaretlenmesin diye. Ekrandaki "Hepsini sil" bulunan kırık
  kartları tek seferde çöp kutusuna taşıyor, geri alınabiliyor
- Arama artık grup adlarıyla da eşleşiyor: yazdığınız terim bir grubun
  adında geçiyorsa sonuçların üstünde kart sayısıyla birlikte rozet
  olarak çıkıyor, tıklayınca o gruba gidiyor. Çok gruplu kurulumlarda
  aradığınız grubu bulmanın en hızlı yolu
- Yan araç şeridinden çöp kutusu, yinelenen kartlar ve grupları yönet
  ekranlarına doğrudan erişiliyor. Ayarlar panelindeki girişler de
  duruyor. Sıra: gizle, ara, grupları yönet, kırık bağlantılar,
  yinelenen kartlar, çöp kutusu, ayarlar
- **Yinelenen kartlarda "Tümünü teke düşür"**: her yinelenen adresten
  bir kart kalıyor, gerisi çöp kutusuna taşınıyor. Kalan kart notu ya
  da rengi olana göre seçiliyor, eşitse ilk eklenen
- **Yer imlerini içe aktarma**: Ayarlar → Bakım'dan tarayıcınızdaki yer
  imi klasörleri listeleniyor, seçtikleriniz grup olarak aktarılıyor.
  Aynı adlı grup varsa kartlar onun içine ekleniyor, o grupta bulunan
  adresler atlanıyor
- **HTML dosyasından içe aktarma**: başka tarayıcıdan dışa aktarılmış
  yer imi dosyası (Netscape biçimi) aynı akışla aktarılıyor
- **Sürükle bırak**: yer imi çubuğundan, yer imi yöneticisinden ya da
  bir sayfadaki bağlantıyı kadrana bırakınca aktif gruba kart oluyor.
  Çoklu seçim destekleniyor; klasörler tarayıcı sürükleme verisine
  içerik koymadığı için aktarılamıyor
- **Silmeyi geri al**: "Tüm verileri sil" öncesinde yapı (gruplar,
  kartlar, notlar, renkler, ayarlar) saklanıyor ve tek düğmeyle geri
  alınabiliyor. Küçük resimler yedeğe girmiyor, yeniden yakalanıyorlar
- Bakım bölümünde grup ve kart sayısı gösteriliyor
- Boş kadrandaki karşılama ekranı yenilendi: yer imi içe aktarma ve
  sürükle bırak öne çıkıyor

### Düzeltmeler
- Kök klasör kimliği bellekte tutulup doğrulanmıyordu; klasör silinince
  bayat kimlik kullanılmaya devam ediyordu
- İçe aktarma listesinde tarayıcının yer imi çöp kutusu da görünüyordu
  (Vivaldi silinen yer imlerini orada tutuyor); artık yalnızca kalıcı
  kökler taranıyor
- "Tüm verileri sil" sırasında yakalama kuyruğu çalışmaya devam edip
  silinen kartlar için görsel yazıyordu; kuyruk önce iptal ediliyor ve
  her iş öncesi kartın hâlâ var olup olmadığına bakılıyor
- Arama, çöp kutusu, yinelenen kartlar ve kırık bağlantılar ekranları
  üst üste açılabiliyordu; biri açılırken diğerleri kapanıyor
- Kırık bağlantılar ekranında kart silinince normal ızgaraya
  dönülüyordu; ekran korunuyor ve liste yerinde tazeleniyor
- Arama grup rozetleri kısa terimlerde onlarca çıkıp karmaşaya
  dönüyordu; en fazla altı rozet gösteriliyor, adı terimle başlayanlar
  önce geliyor, şerit kart alanından çizgiyle ayrılıyor
- Stil dosyasında bir düzenleme sırasında silinen kurallar geri kondu:
  yinelenen kart kümeleri, arama grup şeridi, denetim/kırık rapor
  kutuları, logo aday ızgarası
- Yan şerit düğmeleri artık açıp kapatıyor

### Değişiklikler
- Yan araç şeridi kullanılmıyorken kenara çekiliyor. Dar ekranda
  sağdaki kartların üzerine biniyordu; ızgaraya pay bırakmak yerine
  şerit kendisi çekiliyor, kart düzeni değişmiyor. Açılış imlecin sağ
  kenara yakınlığıyla tetikleniyor (yalnızca `:hover` ile hızlı fare
  hareketinde dar şerit atlanıyordu), fare uzaklaşınca kısa bir süre
  açık kalıyor
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
