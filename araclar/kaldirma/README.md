# Kaldırma geri bildirim sayfası

Eklenti kaldırılınca tarayıcı `https://webteyazilim.net/wsd/kaldirildi.php?v=SÜRÜM&d=DİL&t=chrome|edge` adresini açar (`js/arkaplan.js` › `kaldirmaAdresiniKur`).

Kurulum (sunucuda):

```
mkdir -p /path/to/webteyazilim.net/public_html/wsd/veri
cp kaldirildi.php /path/to/.../wsd/
cp veri/.htaccess /path/to/.../wsd/veri/
chown -R <site-kullanicisi>: /path/to/.../wsd
```

Yanıtlar: `wsd/veri/kaldirma.csv` (tarih, sürüm, dil, mağaza, neden, not). Kimlik, IP, çerez tutulmaz.
