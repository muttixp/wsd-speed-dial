# FVD Speed Dial → WSD, with thumbnails

[English](#english) · [Русский](#русский) · [Türkçe](#türkçe)

FVD's own export does not include thumbnails. This small script saves your
groups, dials **and thumbnails** to one file that WSD imports directly.

The script **only reads**: it changes or deletes nothing in FVD and makes no
network requests. The code is short and open: [`fvd-gorselli-aktar.js`](fvd-gorselli-aktar.js).

> WSD Speed Dial is not affiliated with FVD Speed Dial.

## English

1. Open the FVD Speed Dial tab (its new tab page).
2. Press **F12** → **Console**.
3. Copy the whole [`fvd-gorselli-aktar.js`](fvd-gorselli-aktar.js), paste it, press **Enter**.
   If the browser asks, type `allow pasting` first.
4. A file named `wsd-fvd-<date>.json` is downloaded.
5. In WSD: **Settings › Backup and Import › Import › Import** → choose that file.

Groups, dials and thumbnails arrive together. Dials without a thumbnail are
captured by WSD.

## Русский

1. Откройте вкладку FVD Speed Dial (её новую вкладку).
2. Нажмите **F12** → **Console** («Консоль»).
3. Скопируйте весь [`fvd-gorselli-aktar.js`](fvd-gorselli-aktar.js), вставьте и нажмите **Enter**.
   Если браузер попросит, сначала введите `allow pasting`.
4. Скачается файл `wsd-fvd-<дата>.json`.
5. В WSD: **Настройки › Резервная копия и импорт › Импорт › Импорт** → выберите этот файл.

Группы, плитки и изображения переносятся вместе. Для плиток без изображения
WSD сделает снимки сам.

Скрипт **только читает** данные: ничего не меняет и не удаляет в FVD и не
обращается к сети.

## Türkçe

1. FVD Speed Dial sekmesini (yeni sekme sayfasını) açın.
2. **F12** → **Console** (Konsol).
3. [`fvd-gorselli-aktar.js`](fvd-gorselli-aktar.js) dosyasının tamamını kopyalayıp yapıştırın, **Enter**.
   Tarayıcı isterse önce `allow pasting` yazın.
4. `wsd-fvd-<tarih>.json` dosyası iner.
5. WSD'de: **Ayarlar › Yedekleme ve Aktarma › İçe Aktar › İçe aktar** → bu dosyayı seçin.

Gruplar, kartlar ve görseller birlikte gelir. Görseli olmayan kartları WSD
kendisi yakalar.

Kod **yalnızca okur**: FVD'de hiçbir şeyi değiştirmez ya da silmez, internete
bağlanmaz.
