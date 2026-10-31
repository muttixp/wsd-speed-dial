<?php
/*
 * WSD Speed Dial - kaldirma geri bildirim sayfasi (1.6.1)
 *
 * Eklenti kaldirilinca tarayici bu sayfayi acar:
 *   kaldirildi.php?v=1.6.1&d=ru&t=chrome
 * Yalnizca surum, dil ve magaza (chrome/edge) gelir; kimlik, IP, cerez YOK.
 * Yanitlar veri/kaldirma.csv dosyasina yazilir (veri/ disaridan okunamaz).
 *
 * Kurulum: bu dosyayi ve veri/ klasorunu sitenin /wsd/ dizinine koyun;
 * veri/ PHP tarafindan yazilabilir olsun.
 */
declare(strict_types=1);
header('Content-Type: text/html; charset=utf-8');
header('X-Robots-Tag: noindex');
header("Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; img-src data:");

$METIN = [
 'tr' => ['WSD Speed Dial kaldırıldı', "Neden kaldırdığınızı söyler misiniz? Bir seçenek yeter; ad ya da e-posta istemiyoruz.",
          ['ozellik' => 'Aradığım bir özellik yoktu', 'karmasik' => 'Kullanması karmaşık geldi', 'gorunum' => 'Görünümünü beğenmedim',
           'hata' => 'Hata verdi ya da yavaştı', 'baska' => 'Başka bir eklenti kullanıyorum', 'deneme' => 'Sadece denemek için kurmuştum', 'diger' => 'Başka bir neden'],
          'Eklemek istediğiniz bir şey var mı? (isteğe bağlı)', 'Gönder', "Teşekkürler! Yanıtınız WSD'yi geliştirmek için okunacak.", 'Yeniden kur', 'Lütfen bir seçenek işaretleyin.'],
 'en' => ['WSD Speed Dial has been removed', "Could you tell us why? One choice is enough — we don't ask for your name or email.",
          ['ozellik' => 'A feature I needed was missing', 'karmasik' => 'It felt too complicated', 'gorunum' => "I didn't like how it looks",
           'hata' => 'It had bugs or was slow', 'baska' => 'I use another extension', 'deneme' => 'I was just trying it out', 'diger' => 'Another reason'],
          "Anything you'd like to add? (optional)", 'Send', 'Thank you! Your answer will be read to improve WSD.', 'Reinstall', 'Please pick an option.'],
 'ru' => ['WSD Speed Dial удалён', 'Подскажите, почему вы его удалили? Достаточно выбрать вариант — имя и e-mail не нужны.',
          ['ozellik' => 'Не нашёл нужной функции', 'karmasik' => 'Показалось слишком сложным', 'gorunum' => 'Не понравился внешний вид',
           'hata' => 'Были ошибки или он работал медленно', 'baska' => 'Пользуюсь другим расширением', 'deneme' => 'Просто хотел попробовать', 'diger' => 'Другая причина'],
          'Хотите что-нибудь добавить? (необязательно)', 'Отправить', 'Спасибо! Ваш ответ поможет сделать WSD лучше.', 'Установить снова', 'Пожалуйста, выберите вариант.'],
 'uk' => ['WSD Speed Dial видалено', "Підкажіть, чому ви його видалили? Достатньо вибрати варіант — ім'я та e-mail не потрібні.",
          ['ozellik' => 'Не знайшов потрібної функції', 'karmasik' => 'Здалося надто складним', 'gorunum' => 'Не сподобався вигляд',
           'hata' => 'Були помилки або працював повільно', 'baska' => 'Користуюся іншим розширенням', 'deneme' => 'Просто хотів спробувати', 'diger' => 'Інша причина'],
          "Бажаєте щось додати? (необов'язково)", 'Надіслати', 'Дякуємо! Ваша відповідь допоможе зробити WSD кращим.', 'Встановити знову', 'Будь ласка, виберіть варіант.'],
 'es' => ['WSD Speed Dial se ha desinstalado', '¿Nos cuentas por qué? Basta con elegir una opción; no pedimos nombre ni correo.',
          ['ozellik' => 'Faltaba una función que necesitaba', 'karmasik' => 'Me pareció complicado', 'gorunum' => 'No me gustó su aspecto',
           'hata' => 'Tenía errores o iba lento', 'baska' => 'Uso otra extensión', 'deneme' => 'Solo quería probarla', 'diger' => 'Otro motivo'],
          '¿Quieres añadir algo? (opcional)', 'Enviar', '¡Gracias! Leeremos tu respuesta para mejorar WSD.', 'Volver a instalar', 'Elige una opción, por favor.'],
 'pt' => ['O WSD Speed Dial foi removido', 'Pode nos contar por quê? Basta escolher uma opção — não pedimos nome nem e-mail.',
          ['ozellik' => 'Faltava um recurso de que eu precisava', 'karmasik' => 'Achei complicado', 'gorunum' => 'Não gostei da aparência',
           'hata' => 'Tinha erros ou era lento', 'baska' => 'Uso outra extensão', 'deneme' => 'Só queria experimentar', 'diger' => 'Outro motivo'],
          'Quer acrescentar algo? (opcional)', 'Enviar', 'Obrigado! Sua resposta será lida para melhorar o WSD.', 'Instalar de novo', 'Escolha uma opção, por favor.'],
 'zh' => ['WSD Speed Dial 已卸载', '能告诉我们原因吗？选一项即可，无需姓名或邮箱。',
          ['ozellik' => '缺少我需要的功能', 'karmasik' => '用起来太复杂', 'gorunum' => '不喜欢它的外观',
           'hata' => '有错误或运行缓慢', 'baska' => '我在用其他扩展', 'deneme' => '只是想试一试', 'diger' => '其他原因'],
          '还有什么想补充的吗？（可选）', '提交', '谢谢！我们会认真阅读您的反馈来改进 WSD。', '重新安装', '请选择一项。'],
];

$al = fn(string $k, int $en) => mb_substr(trim((string)($_REQUEST[$k] ?? '')), 0, $en);
$surum = preg_replace('/[^0-9.]/', '', $al('v', 20));
$dilHam = strtolower($al('d', 10));
$dil = substr($dilHam, 0, 2);
if (!isset($METIN[$dil])) $dil = 'en';
$magaza = $al('t', 10) === 'edge' ? 'edge' : 'chrome';
[$baslik, $alt, $nedenler, $ekMetin, $gonder, $tesekkur, $yenidenKur, $secin] = $METIN[$dil];
$e = fn(string $s) => htmlspecialchars($s, ENT_QUOTES, 'UTF-8');

/* RAPOR (yalnizca gelistirici): kaldirildi.php?rapor=ANAHTAR
   Anahtar depoda DEGIL, sunucuda veri/anahtar.txt dosyasinda. Dosya yoksa
   rapor kapali. CSV'nin kendisi disaridan hic okunamaz (veri/ kapali). */
if (isset($_GET['rapor'])) {
    $anahtarDosya = __DIR__ . '/veri/anahtar.txt';
    $anahtar = is_file($anahtarDosya) ? trim((string)file_get_contents($anahtarDosya)) : '';
    if ($anahtar === '' || !hash_equals($anahtar, (string)$_GET['rapor'])) { http_response_code(404); exit; }
    if (isset($_GET['indir'])) {                 // ham CSV indir
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="wsd-kaldirma.csv"');
        @readfile(__DIR__ . '/veri/kaldirma.csv');
        exit;
    }
    $satirlar = [];
    if (($f = @fopen(__DIR__ . '/veri/kaldirma.csv', 'rb'))) {
        fgetcsv($f);
        while (($r = fgetcsv($f)) !== false) if (count($r) >= 6) $satirlar[] = $r;
        fclose($f);
    }
    $say = function (int $i) use ($satirlar) { $s = []; foreach ($satirlar as $r) $s[$r[$i]] = ($s[$r[$i]] ?? 0) + 1; arsort($s); return $s; };
    $tablo = function (string $baslik, array $s) use ($e) {
        $t = '<h2>' . $e($baslik) . '</h2><table>';
        foreach ($s as $k => $n) $t .= '<tr><td>' . $e((string)$k) . '</td><td>' . $n . '</td></tr>';
        return $t . '</table>';
    };
    $tr = $METIN['tr'][2];
    $nedenler2 = []; foreach ($say(4) as $k => $n) $nedenler2[($tr[$k] ?? $k)] = $n;
    echo '<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex"><title>WSD kaldırma raporu</title>'
       . '<style>body{font:14px system-ui,sans-serif;max-width:760px;margin:24px auto;padding:0 16px}table{border-collapse:collapse;margin-bottom:16px}td{border:1px solid #ccc;padding:4px 10px}h2{font-size:15px;margin:18px 0 6px}</style>'
       . '<h1>Kaldırma yanıtları: ' . count($satirlar) . '</h1>'
       . '<p><a href="?rapor=' . $e((string)$_GET['rapor']) . '&amp;indir=1">CSV indir</a></p>'
       . $tablo('Neden', $nedenler2) . $tablo('Dil', $say(2)) . $tablo('Sürüm', $say(1)) . $tablo('Mağaza', $say(3))
       . '<h2>Notlar (son 50)</h2><table>';
    foreach (array_slice(array_reverse(array_filter($satirlar, fn($r) => $r[5] !== '')), 0, 50) as $r)
        echo '<tr><td>' . $e($r[0]) . '</td><td>' . $e($r[2]) . '</td><td>' . $e($tr[$r[4]] ?? $r[4]) . '</td><td>' . $e($r[5]) . '</td></tr>';
    echo '</table>';
    exit;
}

$gonderildi = false;
$uyari = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $neden = $al('neden', 20);
    $not = $al('not', 1000);
    if ($al('web', 50) !== '') {                       // bal kupu: botlar doldurur
        $gonderildi = true;
    } elseif (!isset($nedenler[$neden])) {
        $uyari = $secin;
    } else {
        $klasor = __DIR__ . '/veri';
        $dosya = $klasor . '/kaldirma.csv';
        if (!is_dir($klasor)) @mkdir($klasor, 0750, true);
        if (!is_file($dosya) || filesize($dosya) < 5 * 1024 * 1024) {   // en cok 5 MB
            $yeni = !is_file($dosya);
            if ($f = @fopen($dosya, 'ab')) {
                flock($f, LOCK_EX);
                if ($yeni) fputcsv($f, ['tarih', 'surum', 'dil', 'magaza', 'neden', 'not']);
                $not = preg_replace('/[\r\n\t]+/', ' ', $not);
                if (preg_match('/^[=+\-@]/', $not)) $not = "'" . $not;     // tablo formulu olmasin
                fputcsv($f, [gmdate('Y-m-d H:i'), $surum, $dilHam ?: $dil, $magaza, $neden, $not]);
                flock($f, LOCK_UN);
                fclose($f);
            }
        }
        $gonderildi = true;
    }
}
$magazaAdres = $magaza === 'edge'
    ? 'https://microsoftedge.microsoft.com/addons/search/WSD%20Speed%20Dial'
    : 'https://chromewebstore.google.com/detail/blhdiabjeaeidnnmiflopnocieiaiibd';
?><!doctype html>
<html lang="<?= $e($dil) ?>">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title><?= $e($baslik) ?></title>
<style>
:root { --zemin:#0f1522; --kart:#182132; --cerceve:#2a364c; --yazi:#e8edf5; --sonuk:#9aa6ba; --vurgu:#5b8def; }
@media (prefers-color-scheme: light) {
  :root { --zemin:#eef2f8; --kart:#ffffff; --cerceve:#d9e0ea; --yazi:#1b2330; --sonuk:#5d6878; --vurgu:#2f6fe0; }
}
* { box-sizing: border-box; }
body { margin:0; min-height:100vh; display:grid; place-items:center; padding:24px 16px;
  background: radial-gradient(ellipse 60% 50% at 20% 15%, rgba(91,141,239,.18), transparent 70%), var(--zemin);
  color:var(--yazi); font:15px/1.5 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
main { width:100%; max-width:480px; background:var(--kart); border:1px solid var(--cerceve); border-radius:16px; padding:28px 24px; box-shadow:0 12px 40px rgba(0,0,0,.25); }
.logo { width:44px; height:44px; border-radius:11px; background:#1d2638; display:grid; place-items:center; margin-bottom:14px; }
.logo span { font:800 26px/1 system-ui, sans-serif; color:#7fb2ff; }
h1 { font-size:20px; margin:0 0 6px; }
p { margin:0 0 18px; color:var(--sonuk); }
label.secenek { display:flex; gap:10px; align-items:center; padding:10px 12px; border:1px solid var(--cerceve); border-radius:10px; margin-bottom:8px; cursor:pointer; }
label.secenek:hover { border-color:var(--vurgu); }
label.secenek:has(input:checked) { border-color:var(--vurgu); background:rgba(91,141,239,.10); }
input[type=radio] { accent-color:var(--vurgu); width:16px; height:16px; margin:0; flex:none; }
textarea { width:100%; min-height:84px; margin:10px 0 16px; padding:10px 12px; border-radius:10px; border:1px solid var(--cerceve);
  background:transparent; color:var(--yazi); font:inherit; resize:vertical; }
.ek { display:block; font-size:13px; color:var(--sonuk); margin-top:8px; }
button { width:100%; padding:12px; border:0; border-radius:10px; background:var(--vurgu); color:#fff; font-family:inherit; font-size:15px; font-weight:600; cursor:pointer; }
.uyari { color:#e5735f; font-size:13px; margin:0 0 10px; }
.gizli { position:absolute; left:-9999px; }
a.dugme { display:inline-block; margin-top:4px; color:var(--vurgu); text-decoration:none; font-weight:600; }
</style>
</head>
<body>
<main>
  <div class="logo" aria-hidden="true"><span>W</span></div>
<?php if ($gonderildi): ?>
  <h1><?= $e($tesekkur) ?></h1>
  <a class="dugme" href="<?= $e($magazaAdres) ?>"><?= $e($yenidenKur) ?> →</a>
<?php else: ?>
  <h1><?= $e($baslik) ?></h1>
  <p><?= $e($alt) ?></p>
  <form method="post" action="?v=<?= $e($surum) ?>&amp;d=<?= $e($dilHam ?: $dil) ?>&amp;t=<?= $e($magaza) ?>">
    <?php if ($uyari): ?><p class="uyari"><?= $e($uyari) ?></p><?php endif; ?>
    <?php foreach ($nedenler as $k => $ad): ?>
      <label class="secenek"><input type="radio" name="neden" value="<?= $e($k) ?>" required> <?= $e($ad) ?></label>
    <?php endforeach; ?>
    <label class="ek" for="not"><?= $e($ekMetin) ?></label>
    <textarea id="not" name="not" maxlength="1000"></textarea>
    <input class="gizli" type="text" name="web" tabindex="-1" autocomplete="off" aria-hidden="true">
    <button type="submit"><?= $e($gonder) ?></button>
  </form>
<?php endif; ?>
</main>
</body>
</html>
