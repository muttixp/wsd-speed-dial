# Değişiklikler

Sürüm numaraları [Semantic Versioning](https://semver.org/lang/tr/)
kurallarına uyar.

## [1.5.8] — 2026-10-22

### Yeni
- **Açılış Grubu** (Ana Sayfa › Davranış; kullanıcı isteği): yeni sekme
  hangi grupla açılsın — Son açılan grup (varsayılan), İlk grup ya da
  listeden seçilen bir grup. Eski "Son Grubu Hatırla" anahtarının yerini
  aldı; ayarı kapalı olanlar "İlk grup"la devam eder. Seçilen grup silinirse
  "Son açılan grup"a döner.
  Kısayollar: Grubu Düzenle penceresinde "Yeni sekmede bu grup
  açılsın" kutusu; Grupları Yönet listesinde her satırda ev simgesi (dolu
  olan açılış grubu, tıklayınca değişir).
- **FVD'den görselleriyle geçiş rehberi** (`araclar/FVD.md`, TR/EN/RU):
  FVD sekmesinde çalışan, yalnızca okuyan kısa kod; gruplar, kartlar ve
  görseller tek dosyada WSD'ye gelir. İçe Aktar'da "FVD'den taşı" düğmesi rehberi açar.
- Ayar ve pencere metinleri kısaltıldı (8 dil).
- İçe aktarmada dosya önce tanınır: "✓ Tanındı: FVD Speed Dial · 37 grup ·
  1135 kart". Tanınmazsa "Bildir" düğmesi GitHub'da hazır destek isteği açar;
  isteğe yalnızca dosyanın yapısı (alan adları) eklenir, veri eklenmez.
  İçe Aktar bölümünde tanınan yedek türleri yazıyor.
- Kurulumdan 14 gün sonra bir kez, kapatılabilir değerlendirme bildirimi
  (güncelleme duyurusuyla aynı açılışta çıkmaz).
- Mağaza adı ve kısa açıklama pt_BR, pt_PT, es, uk, zh_CN dillerinde.

### Düzeltmeler
- Grupları Yönet'te kalemle açılan Grubu Düzenle penceresindeki değişiklikler
  (ad, simge, renk, açıklama) kaydedilmiyordu.
- Yedek, açılış grubunu grubun kendisiyle taşıyor (ham yer imi kimliği değil):
  geri yüklemede doğru grup açılır, başka profile eklemede o profilin
  kendi seçimi korunur.

## [1.5.7] — 2026-10-20

### Yeni
- **Tüm arayüz dilleri tamamlandı**: Portekizce (Brezilya ve Portekiz),
  İspanyolca, Ukraynaca ve Çince'de 1.4.2'den beri eksik kalan 306'şar metin
  çevrildi (çalışma alanları, temalar, arama
  kutusu, Hazır Gruplar, Hakkında, Bulut Klasörü…); eskiden bu kısımlar
  İngilizce görünüyordu. Portekizce (Portekiz) dosyasındaki Brezilya
  Portekizcesi kelimeler ve "Os os" tekrarları düzeltildi.
- **Aranan kart artık belli oluyor**: aramadan gruba gidince diğer kartlar
  soluklaşıyor, aranan kart büyüyüp çift çerçeveyle öne çıkıyor ve altında
  "Aradığınız kart" etiketi beliriyor. Tıklama, tuş, tekerlek ya da 6 sn
  sonra normale döner. Kart bir klasörün içindeyse klasör işaretlenir.
- **Ayarlarda arama**: panelin üstünde "Ayar ara…" kutusu. Yazınca yalnızca
  eşleşen ayarlar kalır, ilgili bölüm ve alt bölümler açılır; Türkçe
  karakterler ve büyük/küçük harf fark etmez ("golge" → Gölge). Esc temizler.
- **Kartlar ve Görüntü Yakalama da alt bölümlü**: Kartlar → Davranış, Boyut ve
  Yerleşim, Başlık, Renk ve Çerçeve; Görüntü Yakalama → Yakalama, Gelişmiş
  (kaydırma, bekleme, küçük pencere, öne alma), Görüntü.
- **Sadeleşen ayarlar**: ana bölüm sayısı 11'den 7'ye indi. Görünüm; Tema,
  Arka Plan, Grup Menüsü (eskiden ayrı bölümdü), Yazı ve Panel, Arayüz açılır
  alt bölümlerine ayrıldı (her birinin renkli simgesi var). Bakım ve
  Sıfırlama, Sistem'in açılır alt bölümleri oldu (Sistem en alta, Hakkında'nın
  üstüne taşındı); Yedekleme ve Aktarma da Yedek / Bulut Klasörü / İçe Aktar
  alt bölümlerine ayrıldı. Depo dolu uyarısındaki "Bakım" düğmesi Sistem ›
  Bakım'ı açıyor.
- **Bulut Klasörü (deneysel)** (Yedekleme ve Aktarma › açılır alt bölüm, bulut simgeli; Yedek ve İçe Aktar da açılır oldu): yedekler seçilen klasöre
  yazılıyor — yerel klasör ya da OneDrive / Google Drive / Dropbox klasörü
  (bulut programı kendisi yükler). Sunucu, hesap, yeni izin yok.
  - Her tarayıcı **Yedek adı** ile kendi alt klasörüne yazar
    (`<klasör>/<ad>/wsd-<ad>-YYYY-AA-GG-SSDD.json`); varsayılan ad tarayıcı
    adı. Aynı ad iki bilgisayarda = ortak yedek seti.
  - Otomatik yedek klasöre gider; sıklık günde 1 / haftada 1; görseller
    dahil ya da değil; son N yedek saklanır, eskiler silinir.
  - **Klasörden geri yükle**: tarih, grup / kart sayısı, boyutla liste;
    "tüm tarayıcılar" seçeneği; Ekle / Değiştir her zamanki yoldan.
  - Başka bilgisayardan aynı ada daha yeni yedek gelince bir kez haber
    verir; kendiliğinden yüklemez.
  - Tarayıcı yeniden açılınca klasör izni bir tıklamayla yenilenir.
- **Yedek adı her yedekte**: Yedekle ile indirilen dosya da artık
  `wsd-<yedek adı>-YYYY-AA-GG-SSDD.json` (eskiden `WSD-gün-ay-yıl-saat`);
  ayar klasör seçmeden de görünüyor. Birden çok tarayıcının yedekleri aynı
  yerde karışmıyor.
- **Yedek alırken geri bildirim**: Yedekle / Klasöre şimdi yedekle
  düğmesi iş bitene kadar kilitli ve üzerinde "Yedekleniyor… %40" yazıyor;
  sessiz bekleyişte tekrar tekrar tıklanıyordu. Klasörden yüklerken
  "Okunuyor…".
- Yedek dosyasının başına özet (grup / kart sayısı) ve kaynak (ad, sürüm)
  eklendi; liste tüm dosyayı okumadan çiziliyor.

### Düzeltildi
- **Bulut klasörü (yayın öncesi denetim)**: eski yedekler dosya ADINA göre
  siliniyordu — büyük/küçük harf farklı adda ya da başka saat dilimindeki
  cihazda en yeni yedek silinebilirdi; artık dosya zamanına göre. Klasör
  otomatik yedeği "Otomatik Yedek" anahtarından bağımsız, kendi sıklığıyla
  (Kapalı / Günde 1 / Haftada 1) çalışıyor; klasör seçiliyken İndirilenler'e
  ayrıca yedek yazılmıyor. İzin bildirimi günde bir kez. Varsayılan yedek adı
  tarayıcı + kısa cihaz eki (iki bilgisayardaki aynı tarayıcı aynı sete
  yazmasın). Listede yalnızca `wsd-…json` dosyaları; "." ile biten adlar
  temizleniyor. Elle indirilen yedek, ad alınamasa bile iniyor.
- Aranan kart bir klasörün kartıysa da öne çıkıyor; ayar araması açıkken
  "Bakım"a yönlendirme aramayı temizliyor; tümden elenen düğme satırları
  boş kalmıyor.
- **Kart Hizalama "Ortaya"yken arama etiketleri alt alta diziliyordu**: kart
  olmayan öğeler (etiket şeridi, çöp kutusu / kopyalar başlıkları, boş durum
  kutuları) kart genişliğine sıkışıyordu; artık tam satır.

## [1.5.6] — 2026-10-19

### Yeni
- **Hakkında bölümü** (Ayarlar'ın en altı): sürüm, **Yenilikler** penceresi
  (son üç sürümün öne çıkanları, TR/EN/RU, ağ isteği yok), Değerlendir
  (eklenti hangi mağazadan kurulduysa orası), Öneri / hata bildir,
  kaynak kod, gizlilik politikası.
- **Güncelleme sonrası haber**: sürüm değişince bir kez "X yüklendi ·
  Yenilikler" bildirimi ve ayarlar düğmesinde nokta; Yenilikler açılınca
  söner. İlk kurulumda çıkmaz.
- **Desenli varsayılan duvar kâğıtları**: her hazır temanın zemini düz
  iki renkli geçiş yerine ışık lekeleri ve çok ince çapraz çizgi dokusu
  (yalnızca CSS, dosya yok). Eski hazır zemini kullananlar kendiliğinden
  yenisine geçer; "değiştirildi" rozeti çıkmaz. Kendi resmine dokunulmaz.
- **Yaylı klasör artık kalıcı** (deneysel işareti kalktı).
- **Kart Hizalama** (Kartlar): Ortaya (varsayılan) / Sola. Ortaya'da her
  satır, son satır dahil, ortalanıyor; az kartlı grupta kartlar sola
  yaslanıp sağda boşluk kalmıyor. (Kullanıcı isteği)
- **16 yeni grup simgesi**: Wi-Fi, bilgisayar, telefon, bilgi, yardım, not,
  sohbet, takvim, konum, uçuş, yemek, banka, spor, kilit, TV, resim.
- **Kırmızı ve sarı temalar**: Yakut, Kehribar (koyu); Gül, Güneş (açık).
- **Özel temayı güncelle**: kaydettiğin temada renk değiştirince
  "değiştirildi" yerine **Güncelle** çıkıyor; tıklayınca değişiklik
  (filtre dahil) o temaya yazılıyor.
- **Renklendirme desenli zemine de uygulanıyor**: ton / doygunluk /
  açıklık eskiden yalnızca kendi resmine etki ediyordu; artık hazır
  desenli zemin de değişiyor.
- **Renklendirme temaya özel**: her temanın filtresi ayrı hatırlanıyor.
  Başka temaya geçince onun filtresi (yoksa nötr) geliyor, geri dönünce
  eskisi yerinde. Kaydedilen özel temalar da filtresini saklıyor.

### Düzeltildi
- **Adres değişince kendi resmi kayboluyordu**: kart penceresi açılınca
  "kendi resmi" işareti okunmuyordu, adres değiştirip kaydedince yeni
  yakalama seçili resmi eziyordu. Artık: yakalanmış resim → yeni adresle
  kendiliğinden yenilenir; kendi resmi → korunur, yeni sayfanın görüntüsü
  yalnızca seçilebilir aday olarak eklenir. Yenile düğmesi her zaman
  değiştirir.
- **Açık şablonlarda aktif grup yazısı zayıftı**: Kâğıt, Kum, Buz, Nane ve
  Pastel'de aktif grup rengi biraz koyulaştı (beyaz yazı kontrastı en az
  4,6:1). Şablonu değiştirmemiş kullanıcılar yeni renge kendiliğinden geçer;
  "değiştirildi" rozeti çıkmaz.
- **Kaydedilen temalar içe aktarınca siliniyordu**: yedekteki tema
  listesi mevcudun üstüne yazılıyordu. Artık birleştiriliyor (yedektekiler
  eklenir, sizinkiler kalır). "Ayarları sıfırla" da kaydedilen temalara
  dokunmuyor; yalnızca tek tek silinir.
- **İçe aktarılan renkler temanın üstüne biniyordu**: yedekteki renkler
  seçili temada "değiştirildi" görünüyor, Güncelle'ye basılırsa o tema
  eziliyordu. Artık renkler bir temaya uyuyorsa o tema seçiliyor; hiçbirine
  uymuyorsa **"İçe aktarılan"** adıyla yeni özel tema ekleniyor (istemezseniz
  silin ya da yeni adla kaydedin).
- Koyu modda grup menüsü şeridi zemine karışıyordu: buzlu cam artık arama
  kutusuyla aynı koyulukta.
- Açık modda parlak vurgu rengi (sarı gibi) yazı olarak kullanıldığında
  (Geri al, bölüm başlıkları) koyulaştırılıyor; açık zeminde okunuyor.
- **Açık modda yan panel simgeleri zor seçiliyordu**: renkli simgelerin
  tonları koyu zemine göreydi. Açık modda aynı renklerin koyu tonları,
  panel kapalıyken daha az soluk, cam zemin daha dolgun; ayar bölümü
  başlıklarındaki simgeler de aynı şekilde.
- **Kendi resmini seçince yakalama eziyordu** (kullanıcı bildirimi): yeni
  kart eklerken yerel resim seçilse de yer imi önce oluşuyor, arka plan
  görsel yok sanıp yakalamayı başlatıyor, bitince seçilen resmin yerine
  ekran görüntüsünü yazıyordu ("2-3 denemede tutuyor"). Artık görsel yer
  iminden önce yazılıyor; kullanıcının eklediği resim işaretleniyor ve
  kendiliğinden başlayan yakalama onu değiştirmiyor (yalnızca aday olarak
  ekleniyor). Kart düzenlemede her kayıtta yeniden yakalama da kalktı:
  yalnızca adres değişip kendi resmi yoksa. Kartın "Yenile"si korumayı
  kaldırıp yeni görüntüyü alıyor.

## [1.5.5] — 2026-10-17

### Yeni
- **Hazır Gruplar:** karşılama ekranında ve Yedekleme › İçe Aktar'da.
  Dile göre örnek paketler (TR: Günlük, Alışveriş, Geliştirici; EN ve RU
  için de üçer paket), tek tıkla yeni grup olarak ekleniyor ve açılıyor.
  Liste depodaki `paketler/` klasöründen - önce GitHub'daki güncel kopya,
  ağ yoksa eklentinin içindeki. Paketten yalnızca grup adı, ikon ve
  http/https kartlar alınıyor.
- **Yakalama kipi tarayıcıya göre:** ilk kurulumda Edge, Vivaldi ve diğer
  Chromium tarayıcılarda varsayılan "Gizli" (pencere açılmaz, uyarı çıkmaz);
  yalnızca Chrome'da "Pencere" (Chrome gizli kipte üstte "hata ayıklama"
  çubuğu gösteriyor). Chrome'da gizli kip seçilince altında bu çubuğun ne
  olduğunu anlatan not çıkıyor. Seçenek adı "Gizli (pencere açılmaz)" oldu.
  Mevcut kullanıcıların seçimine dokunulmuyor.
- **Küçük Pencere, Köşede (deneysel)** (Yakalama): pencere kipinde
  yakalama penceresi yarı boyutta, kullanıcının penceresinin sağ alt
  köşesinde açılıyor; sayfa %50 yakınlaştırmayla aynı genişlikte diziliyor.
  Arkada açmak denendi, kaldırıldı: Chrome örtülen pencereyi çizmiyor.
- **Arama çubuğu: Nerede Görünsün** (Ana Sayfa › Arama Çubuğu):
  Yalnızca Ana Sayfa / İlk grupta / Tüm gruplarda. "Yalnızca Ana Sayfa"
  seçiliyken Ana Sayfa gizlenirse kutu da gizlenir.
- **Yeni temalar:** Kontrast (koyu: siyah zemin, aktif grup beyaz) ve
  Mürekkep (açık: beyaz zemin, aktif grup siyah). Seçili tema kartında
  onay rozeti ve metin renginde kalın çerçeve - gri vurgulu temalarda
  seçim anlaşılmıyordu.
- **Rusça arayüzde varsayılan arama motoru Yandex** (diğer dillerde
  tarayıcının kendi motoru). Ayardan değiştirilebilir.
- **"Speed Dial" (.spd) yedeğinden içe aktarma:** kategoriler gruba, ilk
  kategori (Main/Главная) Ana Sayfa'ya. Yedekteki gömülü logolar zemin
  rengiyle 16:10 karta çiziliyor - yakalama gerekmiyor. Varsayılan arama
  motoru (Yandex vb.) ve arama kutusu açıklığı da alınıyor. Dosya
  seçicisi .spd'yi kabul ediyor; adreslerdeki "#from_speed_dial" izi
  temizleniyor.
- **İçe aktarma sonrası görsel sorusu:** 30'dan fazla kartın görseli
  eksikse (FVD yedekleri hiç görsel taşımıyor) yakalama kendiliğinden
  başlamıyor; "Arka planda al" (pencere açmadan, ayardaki kipten
  bağımsız) ya da "Şimdi değil" soruluyor. Sayfa cevapsız kapanırsa bir
  sonraki açılışta yeniden soruluyor. Eskiden 30-300 arası kart pencere
  kipinde ekranda pencere açıp kapatıyor, 300 üstünde hiç başlamıyordu.
- **Aktif Grup İkon Rengi** (Grup Menüsü › Görünüm): aktif sekmenin
  ikonu ayrı renk. Seçilmemişse aktif sekmenin yazı rengini alır (aktif
  zemin açıksa koyu, koyuysa açık) - tek ikon rengi aktif zeminde
  kaybolabiliyordu. Gruba özel ikon rengi yine geçerli; ama aktif zeminle
  aynı tondaysa (kırmızı ikon + kırmızı aktif zemin) o grup aktifken ikon
  kendiliğinden okunur renge geçer
- **Buzlu cam görünüm**: üstteki koyu bant kalktı; grup menüsü duvar
  kâğıdının üstünde yüzen, köşeleri yuvarlak, sekmelere sarılı ince bir
  cam panelde (zeminsiz: renk tonu yok, yalnızca bulanıklık; kenar
  çizgisi çok hafif). Arama
  çubuğu, motor listesi, özel ekran şeritleri (kart araması, çöp,
  çalışma alanları…), sağ tık menüleri, pencereler, kart üzerindeki araç
  şeridi, yan şerit, ayarlar paneli, bildirim ve renk seçici aynı camdan.
  Kartın boş alanı (sığdır kipinde görselin çevresi) yarı saydam, hafif
  parlamalı (kartlarda bulanıklık yok: çok kartta kaydırma ağırlaşmasın).
  Çalışma alanı kartları, boş durum ve karşılama kutusu da cam. Açık modda cam açık tonlu. Görünüm › Arayüz › Buzlu Cam
  Görünüm ile kapatılabilir (kapalıyken eski görünüm)
- **Tema: Koyu / Açık / Sistem + hazır şablonlar** (Görünüm bölümünün en
  üstü). Açık mod artık var: ayar paneli, menüler, pencereler, seritler
  açık renk. Şablonlar (koyu: Gece, Grafit, Okyanus, Orman, Mor, Gün
  Batımı; açık: Kâğıt, Kum, Buz, Nane, Pastel) zemin, kart, grup menüsü
  ve başlık renklerini birlikte ayarlar; sonra her renk tek tek
  değiştirilebilir ("değiştirildi" rozeti çıkar). Seçimden sonra "Geri
  al". Her modun renkleri ayrı saklanır: açığa geçip koyuya dönünce koyuda
  yaptığın değişiklikler geri gelir. "Sistem" işletim sisteminin
  koyu/açık ayarını izler. Duvar kâğıdı resmine dokunulmaz; resim yoksa
  varsayılan geçişli zemin temadan gelir. Açılışta parlama olmasın diye
  mod sayfa çizilmeden uygulanır
  Açık modda üst şeritte solma bandı yok (koyu duvar kâğıdında beyaz
  boru gibi görünüyordu); grup sekmeleri açık zeminli hap
  Kendi teman: şablon listesinin sonundaki "+ Kaydet" şu anki renkleri
  adıyla kaydeder (aynı adlı tema varsa günceller); kaydedilen tema
  listede şablonların yanında durur, üzerine gelince ✕ ile silinir (Geri
  al var). Her mod kendi temalarını gösterir; yedeğe ayarlarla gider
- **Renkli simgeler**: ayar bölümlerinin ve yan şeritteki düğmelerin
  simgeleri kendi renginde (aynı iş aynı renk: Ana Sayfa ve Çalışma
  alanları turkuaz, Ayarlar ve Sistem mor…). Görünüm › Arayüz ›
  Renkli Simgeler ile kapatılabilir; kapalıyken alt bölümler de sade
- **Web arama kutusu**: yalnızca Ana Sayfa'da, kartların
  üstünde. Varsayılan motor tarayıcının kendi arama motoru (`search`
  izni - kurulum uyarısı yok). Soldaki simgeden 10 motordan biri yalnızca
  o arama için seçilir; raptiye kalıcı varsayılan yapar. Kısayollar:
  `g`, `b`, `d`, `y`, `br`, `e`, `s`, `w`, `yt`, `gh` + boşluk + kelime.
  Adres yazılırsa doğrudan açılır. Ctrl/Shift/Alt+Enter yeni sekmede.
  Yazarken hiçbir yere istek gitmez; tarayıcının arama ayarına dokunulmaz
- **Ayarlarda "Ana Sayfa" bölümü**: "Ana Sayfa grubunu göster" ve "Son
  grubu hatırla" Grup Menüsü'nden buraya taşındı. Arama çubuğu ayarları da
  burada (Davranış, Arama Çubuğu, Anasayfa Kurulumu Sistem bölümündeki gibi açılır-kapanır alt başlıklar): göster/gizle, varsayılan motor, listede görünecek motorlar,
  kendi motorunu ekleme (ad + kısayol + `%s` içeren adres) ve silme
  "Anasayfa Kurulumu" da Sistem'den bu bölüme taşındı.
  Motorların sırası ayar listesinde sürükle-bırak ile değişir; açılır
  liste ve kısayollar bu sırayı izler. Motor simgeleri sitenin kendi
  favicon'u: motorun sitesinden bir kez (çerezsiz) alınıp yerelde
  saklanır, alınamazsa harf rozeti kalır, 7 gün sonra yeniden denenir
  Bölgesel motorlar: Sahibinden, Trendyol, Hepsiburada, WEBTE City
  yalnızca Türkiye'deki kullanıcıda listelenir (tarayıcı dili Türkçe ya
  da saat dilimi İstanbul; izin/ağ isteği yok) ve kapalı gelir
- **Yaylı klasör (deneysel)**: kart sürüklerken bir klasör kutusunun,
  yol çubuğundaki klasör adının ya da bir grup sekmesinin üzerinde
  ~0,7 sn beklenince o klasör/grup açılır (hedef yanıp söner); kart
  bırakılmadan içeri girilip kardeş klasöre taşınabilir. Taşı
  penceresine gerek kalmaz. Açılan klasörde boş bir yere bırakılırsa
  kart sona eklenir ("+" kartı turuncu yanar; o kart gizliyse alan
  kesik çizgiyle işaretlenir); Esc vazgeçer

### Düzeltildi
- Arama kutusunda tarayıcının motoru seçiliyken yer tutucu "Tarayıcının arama
  motoru ile ara" yerine "Web'de ara veya adres yaz" (İngilizcesi bozuk duruyordu).
- Açık temada koyu duvar kâğıdı (ya da koyu temada açık resim / zemin
  rengi) seçilince kart başlıkları, klasör sayıları, yol şeridi ve "+"
  kutusu zeminde kayboluyordu. Zeminin parlaklığı ölçülüp yalnızca bu
  yazılar çevriliyor; koyu temada açık resimde grup hapları ve arama
  kutusu da koyu yarı saydam zemin alıyor. Seçilmiş başlık rengi öncelikli.
- Chrome'da (Windows) pencere kipi görüntü alamıyordu: yakalama penceresi
  kullanıcının penceresinin arkasında açılıyor, örtülen pencere çizilmiyordu
  (pencereye tıklayınca alınıyordu). Sayfa gizli görünüyorsa pencere kısa
  süreliğine öne alınıyor, odak sonra geri veriliyor.
- **Rusça çeviri gözden geçirildi:** sayıyla birlikte yanlış çoğul
  ("2 плиток" gibi) kalıpları "Плиток: 2" biçimine çevrildi; kaynakla
  uyuşmayan iki açıklama (kırık/şüpheli bağlantı) düzeltildi; terimler
  tek tipe indirildi (плитка, панель групп, резервная копия, импорт,
  снимок, готовая тема); cins uyumu hataları giderildi.
- Koda gömülü kalmış Türkçe metinler çeviriye alındı: çöp kutusundaki
  "Geri Al" düğmeleri, veri kaybı uyarısındaki "Son yedek … kart"
  satırı, yedek yüklerken "Mevcut veriler siliniyor".
- Mağaza metni: "FVD yedeklerinin görselleri de gelir" yanlıştı (FVD
  görsel taşımıyor) - düzeltildi. Kısa açıklamalara web araması,
  Rusçasına "визуальные закладки" eklendi.
- **Ana Sayfa'nın menüsünde "Sil / Grubu düzenle / Taşı" görünüyordu**:
  gizlenmeleri gerekiyordu ama ikonlu menüde [hidden] eziliyordu (aynı
  hata diğer ikonlu menülerde gizlenen öğeleri de etkiliyordu). Artık
  Ana Sayfa'da "Sil" kilitli görünür, tıklayınca "Ana Sayfa silinemez"
  der (onay penceresi açılmaz); "Taşı" yok; "Grubu düzenle" açılır ama
  ad kutusu kilitli (simge, renk, açıklama değiştirilebilir). Ana
  Sayfa'nın adı değişseydi yer imlerindeki "WSD" klasörünün adı
  değişiyor ve WSD verisini bulamıyordu
- **WSD sayfasına geri dönünce "ilk kurulum" ekranı çıkabiliyordu**: kök
  klasör o an bulunamazsa (tarayıcı yer imlerini henüz yüklememişken)
  hemen yeni, boş bir "WSD" klasörü açılıyordu. Artık önce kayıtlı
  kimliğe bakılıyor ve kısa aralarla yeniden deneniyor; birden çok
  "WSD" klasörü varsa en dolu olanı kullanılıyor (boş olan veriyi
  gizlemiyor)
- **Soluk metin rengi sabitti**: kart başlıkları ve grup adları ayarlardaki
  metin renginden değil sabit açık griden geliyordu; artık metin renginin
  soluk tonu
- **Ayarlardaki renk kutuları arasında geçiş zordu**: tarayıcının renk
  penceresi kutunun altına açılıp alttaki satırları kapatıyordu; bir
  sonraki rengi seçmek için önce pencereyi kapatmak gerekiyordu. Artık
  kendi seçicimiz panelin solunda, satır hizasında açılıyor; başka bir
  renk kutusuna tıklayınca doğrudan oraya geçiyor. Ton çubuğu, HEX
  alanı, ekrandan renk alma ve son kullanılan 10 renk var; Esc geri alır
- **Gizli kipte "görüntü alınamadı" / boş kart**: arka plan sekmesi
  tarayıcı tarafından hiç çizilmiyor; "Loading" perdesi ya da yavaşça
  beliren içerik ilk karede takılı kalıyordu. Artık ilk çekim sayfayı
  uyandırıyor, aralıkla birkaç kare daha çekilip sonuncusu alınıyor
  (sayfa oturunca erken bitiyor); donan çekim kısa sürede atlanıyor
- **Vurgu renkli düğmelerde yazı okunmuyordu** (çalışma alanlarındaki
  "Sekmeleri kaydet", seçili etiket çipi, arama etiketi, "gruba git"):
  yazı rengi sabit beyazdı; artık ayarlardaki Aktif Grup Yazı Rengi'nden,
  seçilmemişse zemine göre kendiliğinden geliyor

## [1.5.4] — 2026-10-10

### Yeni
- **Çalışma alanları**: açık sekmeleri ad vererek saklayıp sonra tek
  tıkla geri açmak için ayrı ekran (yan paneldeki düğme). Günlük ya da
  proje bazlı geçici sekmeler için: kalıcı olacaksa gruba dönüştürülür,
  iş bitince silinir. Kaydederken sekmeler kapanmaz
  - **Aç** bu pencerede (Vivaldi'de o anki çalışma alanına), ayrıca
    **Yeni pencerede**
  - **Düzenle**: ad, etiket, not ve renk; kayıtlı sekmeleri çıkarma ve
    bu penceredeki açık sekmelerden ekleme tek pencerede (ada çift tık
    da açar)
  - **Gruba dönüştür**: normal, görselli grup olur; not grubun
    açıklamasına geçer
  - Kartlar sürükleyip sıralanır, üstteki etiket süzgeciyle ayıklanır;
    renk seçilmeyen kart gri başlıklı
  - Kayıtlar WSD klasörünün yanında ayrı **WSD Çalışma Alanları** yer
    imi klasöründe; grup şeridi, arama, yinelenenler, kırık bağlantılar
    ve görsel yakalama bunlara dokunmaz
- **Araç çubuğu simgesine sağ tık → "Sekmeleri çalışma alanına
  kaydet…"**: WSD sayfasını etkin sekmenin yanına açıp kaydetmeyi başlatır
- **Boş alana sağ tık → "Açık sekmeleri gruba kaydet…"**: seçilen
  sekmeler doğrudan yeni bir grupta kart olur
- **Yedek**: çalışma alanları (etiket, not, renk, sıra dahil) yedeğe
  giriyor. "Sil ve yükle" mevcutları değiştirir, "Ekle" aynı adlı olanı
  "Ad (2)" diye ekler. Eski yedekler çalışma alanlarına dokunmaz

### Değişti
- **Eklenti adı ve kısa açıklama (EN/TR/RU)** aramada bulunacak şekilde
  yenilendi: ad "WSD Speed Dial – New Tab & Visual Bookmarks" (TR/RU
  karşılıklarıyla); kısa açıklama: speed
  dial, yeni sekme, görsel yer imleri, çalışma alanları; FVD ve Speed
  Dial 2'den tek tıkla taşıma
- **Rusça arayüz tamamlandı**: eksik 133 metin (klasör işlemleri, menüler,
  ayar başlıkları, içe aktarma adımları, renk adları…) çevrildi; Rusça
  kullanıcılar artık İngilizceye düşen satır görmüyor
- **Arama sonuçları eşleşme gücüne göre sıralanıyor**: başlığı aranan
  kelimeyle başlayanlar önce, sonra başlığında geçenler, en son yalnızca
  adreste ya da etikette geçenler; her katmanda bulunduğunuz grubun
  kartları üstte
- **Sekme seçimi ve Vivaldi/Opera çalışma alanları**: tarayıcı hangi
  sekmenin hangi çalışma alanında olduğunu eklentilere bildirmiyor.
  Pencerede birden fazla bölüm varsa (yeni sekme sayfalarına göre)
  sekmeler bloklar halinde, işaretsiz listelenir; blok başlığındaki
  kutu bloğun tamamını seçer. Tek bölümlü pencerede (Chrome/Edge'de
  olağan) hepsi işaretli gelir

### Düzeltildi
- **Klasör kutusundaki "N kart" yazısı açık zeminde okunmuyordu**: boyutu
  aynı kaldı, rengi, kalınlığı ve gölgesi artık kart başlığı ayarlarından
  geliyor
- **"Bekleyen yakalamaları iptal et" işlenen kartı durdurmuyordu**:
  gizli sekme ya da pencere sonuna kadar açık kalıyor, ardından bir kez
  daha deneniyordu (2 dakikayı bulabiliyordu). Artık açık yakalama
  sekmesi/penceresi hemen kapanıyor
- **Gizli kipte pencere açılıyordu**: gizli yakalaması başarısız olan
  kart pencere kipiyle yeniden deneniyordu. İkinci deneme de artık gizli
  kipte, daha uzun beklemeyle; olmazsa kart yer tutucuyla kalır

## [1.5.3] — 2026-10-08

### Yeni
- **Tek "İçe Aktar", tür kendiliğinden tanınıyor**: WSD yedeği, eski
  sürüm, FVD Speed Dial, Speed Dial 2, Speed Dial ve Group Speed Dial
  yedekleri ile herhangi bir tarayıcının yer imi HTML dosyası aynı
  düğmeden yükleniyor. Ayarlar › Yedekleme'deki ayrı "Yedekten yükle" ve
  "HTML dosyasından içe aktar" düğmeleri tek **İçe aktar** düğmesinde
  birleşti
- **Speed Dial 2, Speed Dial ve Group Speed Dial'dan geçiş**: gruplar,
  kartlar ve sıra aktarılıyor; Speed Dial 2'de ziyaret sayaçları da.
  Görselleri o eklentilerin sunucularında durduğu için oraya istek
  atılmıyor, kartların görselleri WSD'de yakalanıyor. Group Speed Dial'ın
  metin, arama kutusu, zamanlayıcı gibi araç kartları WSD'de karşılığı
  olmadığı için atlanıyor
- **Metin yapıştırarak içe aktarma** (Ayarlar › Yedekleme › Metin
  yapıştır): FVD yedeğini dosya olarak değil, ayarlarındaki bir metin
  kutusunda veriyor; o metin kopyalanıp doğrudan yapıştırılabiliyor.
  Alanın altında boyutu ve türü canlı yazıyor; büyük metinde yalnızca
  başı önizleme olarak gösteriliyor, tarayıcı donmuyor
- **Yeni karşılama ekranı**: birincil düğme **İçe Aktar**, yanında **Yer
  imlerinden** ve **Site Ekle**; düğmelerde simgeler, hangi dosyaların
  kabul edildiğini anlatan kısa açıklama ve **Bu pencereyi kapat ve devam
  et** düğmesi. Karşılama önceden yalnızca ilk kart eklenince kayboluyordu,
  boş başlamak isteyen kullanıcı çıkamıyordu
- **Boş alan menüsünde "Grubu düzenle… / Klasörü düzenle…"**: bulunulan
  grubu ya da içinde olunan klasörü doğrudan düzenliyor; yol şeridine sağ
  tıklayınca da aynı menü geliyor
- **Aramada "gruba git" aranan kartı gösteriyor**: grup açılıyor, kart
  görünür alana kaydırılıyor ve birkaç saniye çerçeveyle işaretleniyor
- **Klasör kapağı**: klasördeki kartların görsellerinden seçilebiliyor
  (alt klasörler dahil, en fazla 24); kartlardaki gibi **Görüntü URL'si**
  düğmesi de var
- **İçe Aktarınca Eksik Görselleri Yakala** (Ayarlar › Görüntü Yakalama,
  varsayılan açık): kapatılırsa içe aktarma bitince yakalama kendiliğinden
  başlamıyor, kaç kartın görselsiz kaldığı bildiriliyor
- Ekran görüntüsü hazır boyutlarına **16:10 · 1280×800** eklendi: varsayılan
  kart oranıyla birebir, ne kırpma ne boşluk kalıyor

### Değişiklikler
- **Yeni simge**: iki renkli W (araç çubuğunda zeminsiz ve gölgeli, mağazada
  koyu zemin üstünde). Eski dört kareli simge mağazadaki başka Speed Dial
  eklentileriyle karışıyordu. Ayarlar › Sistem › Uzantı Simgesi'nde iki
  renk ("Sol Kol Rengi", "Sağ Kol Rengi"; eskiden iki satır da yanlışlıkla
  aynı etiketi gösteriyordu) ve yeni **Simge Gölgesi**, **Gölge Rengi**,
  **Simge Zemini**, **Zemin Rengi** ayarları. Karşılama ekranı ve tanıtım
  afişleri de W simgesine geçti; 1400×560 büyük afişler eklendi
- Yedekleme bölümü: "Yedek al" → **Yedekle**; iki düğmenin simgeleri ters
  duruyordu, düzeltildi (kutuya giren ok içe aktar, kutudan çıkan ok
  yedekle)
- Boş alan menüsünden "Yinelenen kartlar" kaldırıldı: yan panelde ve
  Bakım'daki tutarlılık raporunda zaten var
- Türkçe metinlerde "hız kadranı" ifadesi kaldırıldı; kısa açıklama artık
  "Sık kullandığınız siteler yeni sekmede görsel kartlar olarak…"
- Gizlilik metni tamamlandı: Logo Yakala'nın son çare favicon sorgusu ve
  kırık bağlantı taraması da "Dış bağlantılar"da yazıyor

### Düzeltmeler
- **Kart görselinde sitenin üst kısmı kesiliyordu**: "kırp" yerleşiminde
  görsel ortadan hizalanıyor, sitenin üst menüsü ve logosu kayboluyordu.
  Artık üstten hizalanıyor, kırpılan kısım sayfanın altından gidiyor
- **Gizli kipte görüntü Pencere kipinden farklı çıkıyordu** (kenarlarda
  siyah boşluk, kaymış yerleşim): yakalama ölçüsü değiştikten sonra sitenin
  yeniden yerleşmesi bekleniyor
- **Speed Dial 2 yedekleri FVD sanılıyordu**: grup adları ve grup bağları
  kayboluyor, her şey Ana Sayfa'ya düşüyordu
- **FVD metnindeki gömülü görseller atılıyordu**: elle seçilmiş kart
  görselleri artık aktarılıyor
- **Büyük yer imi dosyasında sessiz bekleme**: okuma ve aktarma sırasında
  ekranda hiçbir şey görünmüyor, bitince eski (boş) grup çiziliyordu.
  Artık iki aşamada da ilerleme penceresi var (kart sayacı ve grup adıyla)
  ve bitince aktarılan ilk gruba gidiliyor
- **Kırık işareti kendiliğinden kalkmıyordu**: başarılı yakalamadan sonra
  işareti kaldıran kod arka planda sessizce hata veriyordu

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
