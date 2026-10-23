// WSD Speed Dial - Copyright (C) 2026 muttixp - GPL-3.0-or-later
//
// OZELLIKLER (1.5.9, deneysel): Ayarlar › Hakkinda › Ozellikler penceresi.
// Neler yapilabildigini gruplar halinde tek satirla listeler; ayari olan
// maddede "Goster" o ayari acip vurgular. Metinler tr/en/ru; digerleri en.
import { c } from './dil.js';

const el = id => document.getElementById(id);
const KISAYOL = '.altAcilir:has([data-c="kisayollarBolum"])';

// { b: baslik, m: [[metin, hedef secici | null], ...] } - dil basina
const OZELLIKLER = [
    { b: { tr: 'Kartlar', en: 'Tiles', ru: 'Плитки' }, m: [
        [{ tr: "Herhangi bir sayfada sağ tık › \"WSD Speed Dial'e ekle\"; yer imi çubuğundan sürükleyip bırakmak da olur",
           en: 'Right-click any page › "Add to WSD Speed Dial", or drag a link from the bookmarks bar',
           ru: 'Правый щелчок на любой странице › «Добавить в WSD Speed Dial» или перетащите ссылку с панели закладок' }, null],
        [{ tr: 'Kart › Düzenle: görseli değiştirin (aday görseller, dosya, adres), not ve renk etiketi ekleyin',
           en: 'Tile › Edit: change the image (candidates, file, address), add a note and a colour label',
           ru: 'Плитка › Изменить: смените изображение (варианты, файл, адрес), добавьте заметку и цветную метку' }, null],
        [{ tr: 'Adlı etiketler: aramada etikete tıklayınca tüm gruplardaki kartları listeler',
           en: 'Named tags: click a tag in search to list its tiles across all groups',
           ru: 'Именованные метки: щелчок по метке в поиске показывает её плитки во всех группах' }, { btn: '#araBtn' }],
        [{ tr: 'Kart boyutu, oranı, aralığı ve hizalaması', en: 'Tile size, ratio, spacing and alignment',
           ru: 'Размер, пропорции, отступы и выравнивание плиток' }, '#ayKartEn'],
        [{ tr: 'Kart başlığı: boyut, renk, gölge', en: 'Tile titles: size, colour, shadow',
           ru: 'Заголовки плиток: размер, цвет, тень' }, '#ayBaslikBoyut'],
    ]},
    { b: { tr: 'Gruplar ve klasörler', en: 'Groups and folders', ru: 'Группы и папки' }, m: [
        [{ tr: 'Grupların içinde iç içe klasörler; kartı klasörün üzerine bırakınca içine taşınır',
           en: 'Nested folders inside groups; drop a tile on a folder to move it in',
           ru: 'Вложенные папки в группах; перетащите плитку на папку, чтобы переместить её' }, null],
        [{ tr: 'Açılış Grubu: yeni sekmenin hangi grupla açılacağı', en: 'Start Group: which group a new tab opens with',
           ru: 'Группа при открытии: с какой группы открывается новая вкладка' }, '#ayAcilisGrubu'],
        [{ tr: 'Grupları Yönet: sırala, yeniden adlandır, sil, görselleri yenile (Y tuşu)',
           en: 'Manage Groups: reorder, rename, delete, refresh images (Y key)',
           ru: 'Управление группами: порядок, переименование, удаление, обновление изображений (клавиша Y)' }, { btn: '#grupYonetBtn' }],
        [{ tr: 'Grup sekmesine sağ tık › Grubu Düzenle: simge, renk, açıklama',
           en: 'Right-click a group tab › Edit Group: icon, colour, description',
           ru: 'Правый щелчок по вкладке группы › Изменить группу: значок, цвет, описание' }, null],
        [{ tr: 'Hazır Gruplar: tek tıkla başlangıç paketleri', en: 'Ready-made groups: starter packs in one click',
           ru: 'Готовые группы: стартовые наборы в один клик' }, '#ayPaketler'],
    ]},
    { b: { tr: 'Arama ve çalışma alanları', en: 'Search and workspaces', ru: 'Поиск и рабочие области' }, m: [
        [{ tr: 'Tüm gruplarda kart arama: / ya da Ctrl+F', en: 'Search tiles in every group: / or Ctrl+F',
           ru: 'Поиск плиток во всех группах: / или Ctrl+F' }, { btn: '#araBtn' }],
        [{ tr: 'Ana sayfada web araması, istediğiniz arama motoruyla', en: 'Web search on the home page with the engine you choose',
           ru: 'Веб-поиск на главной с выбранной поисковой системой' }, '#ayWebArama'],
        [{ tr: 'Çalışma alanları: açık sekmeleri kaydedin, sonra tek tıkla yeniden açın',
           en: 'Workspaces: save your open tabs and reopen them in one click',
           ru: 'Рабочие области: сохраните открытые вкладки и откройте их снова в один клик' }, { btn: '#alanBtn' }],
    ]},
    { b: { tr: 'Yedekleme ve güvenlik', en: 'Backup and safety', ru: 'Резервные копии и безопасность' }, m: [
        [{ tr: 'Yedek al: görseller dahil her şey tek dosyada', en: 'Back up: everything in one file, images included',
           ru: 'Резервная копия: всё в одном файле, включая изображения' }, '#ayYedekAl'],
        [{ tr: 'Yedek Klasörü: yerel ya da bulut klasörüne otomatik yedek', en: 'Backup Folder: automatic backups to a local or cloud folder',
           ru: 'Папка для копий: автоматические копии в локальную или облачную папку' }, '.altBulut'],
        [{ tr: 'İçe aktar: başka speed dial eklentilerinin yedekleri ve yer imi HTML dosyası',
           en: 'Import: backups from other speed dial extensions and bookmark HTML files',
           ru: 'Импорт: копии других speed dial и HTML-файлы закладок' }, '#ayYedekYukle'],
        [{ tr: 'Çöp kutusu: silinenler 30 gün saklanır, geri alınabilir', en: 'Trash: deleted items are kept for 30 days',
           ru: 'Корзина: удалённое хранится 30 дней' }, { btn: '#copBtn' }],
        [{ tr: 'Yinelenen kartlar: aynı adresi taşıyan kartları bulun', en: 'Duplicate tiles: find tiles with the same address',
           ru: 'Дубликаты: найдите плитки с одинаковым адресом' }, { btn: '#kopyaBtn' }],
        [{ tr: 'Kırık bağlantı taraması ve tutarlılık kontrolü', en: 'Broken link scan and consistency check',
           ru: 'Поиск битых ссылок и проверка целостности' }, { btn: '#kirikBtn' }],
    ]},
    { b: { tr: 'Görünüm', en: 'Appearance', ru: 'Внешний вид' }, m: [
        [{ tr: 'Hazır temalar, kendi temanızı kaydedin; açık, koyu ya da sistem modu',
           en: 'Ready-made themes, save your own; light, dark or system mode',
           ru: 'Готовые темы и свои собственные; светлый, тёмный или системный режим' }, '#ayTemaListe'],
        [{ tr: 'Duvar kâğıdı ve zemin renklendirme', en: 'Wallpaper and background tinting',
           ru: 'Обои и тонирование фона' }, '#ayDuvar'],
        [{ tr: 'Buzlu cam görünümü', en: 'Frosted glass look', ru: 'Эффект матового стекла' }, '#ayCamGorunum'],
        [{ tr: 'Grup menüsü: gösterim, boyut, konum, renkler', en: 'Group menu: display, size, position, colours',
           ru: 'Панель групп: вид, размер, положение, цвета' }, '#ayMenuKonumu'],
    ]},
    { b: { tr: 'Görüntü ve kısayollar', en: 'Capture and shortcuts', ru: 'Снимки и сочетания клавиш' }, m: [
        [{ tr: 'Gizli yakalama: pencere açmadan ekran görüntüsü', en: 'Silent capture: screenshots without opening a window',
           ru: 'Тихий режим: снимки без открытия окна' }, '#ayYakalamaKipi'],
        [{ tr: 'Klavye: 1–9 grup, PgUp/PgDn önceki/sonraki, H gizle, Ctrl+, ayarlar',
           en: 'Keyboard: 1–9 groups, PgUp/PgDn previous/next, H hide, Ctrl+, settings',
           ru: 'Клавиатура: 1–9 группы, PgUp/PgDn пред./след., H скрыть, Ctrl+, настройки' }, KISAYOL],
        [{ tr: 'Uzantı simgesi renkleri ve sağ tık menüsü', en: 'Extension icon colours and right-click menu',
           ru: 'Цвета значка расширения и контекстное меню' }, '#aySagTikMenu'],
    ]},
];

const dil = () => {
    const d = c('yenilikDil');
    return ['tr', 'en', 'ru'].includes(d) ? d : 'en';
};

function listeyiCiz() {
    const kutu = el('ozellikListe');
    if (!kutu) return;
    const d = dil();
    kutu.textContent = '';
    for (const g of OZELLIKLER) {
        const blok = document.createElement('section');
        blok.className = 'ozellikGrup';
        const h = document.createElement('h3');
        h.textContent = g.b[d] || g.b.en;
        const ul = document.createElement('ul');
        for (const [m, hedef] of g.m) {
            const li = document.createElement('li');
            const s = document.createElement('span');
            s.textContent = m[d] || m.en;
            li.appendChild(s);
            if (hedef && document.querySelector(typeof hedef === 'string' ? hedef : hedef.btn)) {
                const b = document.createElement('button');
                b.type = 'button';
                b.className = 'ozGoster';
                b.textContent = c('goster');
                b.addEventListener('click', () => goster(hedef));
                li.appendChild(b);
            }
            ul.appendChild(li);
        }
        blok.append(h, ul);
        kutu.appendChild(blok);
    }
}

/**
 * Goster: ayar ise paneli/bolumu acip satiri vurgular; { btn } ise ayar
 * panelini kapatip o ekrani (arama, calisma alanlari, cop...) acar.
 */
function goster(secici) {
    kapat();
    if (typeof secici === 'object') {
        if (el('ayarPanel')?.classList.contains('acik')) el('ayarKapat')?.click();
        setTimeout(() => document.querySelector(secici.btn)?.click(), 220);
        return;
    }
    if (!el('ayarPanel')?.classList.contains('acik')) el('ayarBtn')?.click();
    const ara = el('ayarAra');
    if (ara && ara.value) { ara.value = ''; ara.dispatchEvent(new Event('input')); }
    const hedef = document.querySelector(secici);
    if (!hedef) return;
    const bolum = hedef.closest('.bolum');
    const alt = hedef.closest('.altAcilir');
    for (const b of document.querySelectorAll('#ayarPanel .bolum')) b.classList.toggle('acik', b === bolum);
    if (alt) for (const a of document.querySelectorAll('#ayarPanel .altAcilir')) a.classList.toggle('acik', a === alt);
    // Bolum acilma gecisi bitsin, sonra kaydir
    setTimeout(() => {
        const satir = hedef.classList.contains('altAcilir') ? hedef : (hedef.closest('.ayarSatir') || hedef);
        satir.scrollIntoView({ block: 'center', behavior: 'smooth' });
        satir.classList.remove('ozellikVurgu');
        void satir.offsetWidth;
        satir.classList.add('ozellikVurgu');
        setTimeout(() => satir.classList.remove('ozellikVurgu'), 2400);
    }, 380);
}

export function ozelliklerPenceresiniAc() {
    const p = el('ozellikPencere');
    if (!p) return;
    listeyiCiz();
    p.hidden = false;
    el('perde')?.classList.add('acik');
}

function kapat() {
    const p = el('ozellikPencere');
    if (!p || p.hidden) return;
    p.hidden = true;
    if (!el('ayarPanel')?.classList.contains('acik')) el('perde')?.classList.remove('acik');
}

export function ozelliklerKur() {
    el('ayOzellikler')?.addEventListener('click', ozelliklerPenceresiniAc);
    el('ozellikKapat')?.addEventListener('click', kapat);
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && el('ozellikPencere') && !el('ozellikPencere').hidden) kapat();
    });
}
