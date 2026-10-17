# Hazır gruplar

WSD Speed Dial'daki **Hazır gruplar** penceresi bu klasörü okur
(önce GitHub'daki güncel sürümü, ağ yoksa eklentinin içindeki kopyayı).

- `index.json` — paket listesi: `id`, `dil` (tr/en/ru…), `ad`, `aciklama`,
  `ikon` (grup ikon adı), `kart` (kart sayısı), `dosya`.
- Her paket WSD yedek biçiminde bir dosya: `{ "wsd": { "gruplar": [...] } }`.
  Yalnızca grup adı, ikon ve kartlar (`baslik`, `url`) alınır; ayar,
  görsel ve not alanları yok sayılır. Adresler `http`/`https` olmalı.

Yeni paket önermek için bu klasöre dosya ekleyip `index.json`'a bir satır
yazan bir çekme isteği (pull request) açın.
