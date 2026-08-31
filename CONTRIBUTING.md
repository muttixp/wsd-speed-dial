# Katkı

## Çeviri

En çok ihtiyaç duyulan katkı bu.

1. `_locales/tr/messages.json` dosyasını kopyalayın
2. `_locales/<dil kodu>/messages.json` olarak kaydedin (`de`, `fr`, `es`…)
3. Yalnızca `message` değerlerini çevirin — **anahtarlara dokunmayın**
4. `$1`, `$2` gibi yer tutucuları olduğu gibi bırakın

Anahtar adları yalnızca `A-Z a-z 0-9 _` içerebilir; Chrome başka
karakter kabul etmiyor.

## Kod

Bağımlılık yok, derleme adımı yok. Dosyaları düzenleyip
`chrome://extensions` üzerinden eklentiyi yenilemek yeterli.

### Beklentiler

- **Yorumlar NEDEN'i anlatsın.** Ne yaptığı koddan okunuyor; neden
  öyle yapıldığı okunmuyor. Özellikle bir tuzaktan kaçınmak için
  yazılmış satırlarda bunu belirtin.
- **Değişken ve fonksiyon adları Türkçe.** Proje boyunca tutarlı.
- **CSS'te sabit değer yerine değişken.** Renk, boşluk ve köşe
  değerleri `:root` altında tanımlı.
- **Yeni kullanıcı metni eklerken `c('anahtar')` kullanın** ve
  karşılığını iki dil dosyasına da ekleyin.

### Göndermeden önce

Sözdizimi denetimi yapın — `node --check` **güvenilir değil**,
hatalı dosyayı da geçiriyor. Bunun yerine gerçek bir ayrıştırıcı
kullanın (örneğin `acorn`).

## Hata bildirimi

Şunları yazarsanız çok daha hızlı çözülür:

- Tarayıcı ve sürümü
- Ne yaptınız, ne bekliyordunuz, ne oldu
- Konsolda hata var mı (`F12` → Console)
- **Ayarlar → Bakım → Tutarlılık kontrolü** çıktısı
