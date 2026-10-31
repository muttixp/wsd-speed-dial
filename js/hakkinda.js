// WSD Speed Dial - Copyright (C) 2026 muttixp - GPL-3.0-or-later
//
// HAKKINDA (1.5.6): Ayarlar'in en altindaki bolum - surum, Yenilikler
// penceresi ve baglantilar (degerlendir, oneri/hata, kaynak, gizlilik).
//
// Guncelleme sonrasi: surum degistiyse bir kez bildirim + ayarlar
// dugmesinde nokta. Yenilikler penceresi acilinca nokta soner. Gorulen surum chrome.storage.local `sonGorulenSurum`da; ilk
// kurulumda arkaplan.js yaziyor, yeni kullaniciya "yenilik" denmiyor.
import { c } from './dil.js';
import { YENILIKLER } from './yenilikler.js';

const el = id => document.getElementById(id);
const DEPO = 'https://github.com/muttixp/wsd-speed-dial';
// Chrome Web Magazasi'ndaki kimlik (gelistirme kopyasi icin yedek)
const CWS_ID = 'blhdiabjeaeidnnmiflopnocieiaiibd';

const surum = () => chrome.runtime.getManifest().version;

function ac(url) { chrome.tabs.create({ url }); }

/**
 * Degerlendirme sayfasi: eklenti HANGI magazadan kurulduysa orasi.
 * Magazadan kurulan eklentinin kimligi o magazadaki kimligi; kaynak da
 * guncelleme adresinden anlasiliyor (getSelf izin istemiyor).
 */
async function degerlendirmeAdresi() {
    let guncelleme = '';
    try { guncelleme = (await chrome.management.getSelf()).updateUrl || ''; } catch (e) { /* */ }
    if (/microsoft|edge/i.test(guncelleme)) {
        return `https://microsoftedge.microsoft.com/addons/detail/${chrome.runtime.id}`;
    }
    // Magazadan kurulduysa kendi kimligi; paketsiz (gelistirme) yuklemede
    // kimlik farkli - magazadaki kimlige dus
    const id = guncelleme ? chrome.runtime.id : CWS_ID;
    return `https://chromewebstore.google.com/detail/${id}/reviews`;
}

/** Yeniliklerin listesini dil dosyasinin diline gore cizer */
function listeyiCiz() {
    const dil = c('yenilikDil');
    const kutu = el('yenilikListe');
    kutu.textContent = '';
    const simdiki = surum();
    for (const s of YENILIKLER) {
        const blok = document.createElement('section');
        blok.className = 'yenilikSurum';
        const h = document.createElement('h3');
        h.textContent = s.surum;
        if (s.surum === simdiki) {
            const r = document.createElement('span');
            r.className = 'yenilikRozet';
            r.textContent = c('yenilikBuSurum');
            h.appendChild(r);
        }
        blok.appendChild(h);
        // Iki baslik: Yeni / Duzeltmeler (bos olan cizilmez)
        for (const [tur, etiket] of [['yeni', 'yenilikYeni'], ['duzeltme', 'yenilikDuzeltme']]) {
            const maddeler = s[tur] && (s[tur][dil] || s[tur].en);
            if (!maddeler || !maddeler.length) continue;
            const t = document.createElement('div');
            t.className = 'yenilikTur ' + tur;
            t.textContent = c(etiket);
            const ul = document.createElement('ul');
            for (const m of maddeler) {
                const li = document.createElement('li');
                li.textContent = m;
                ul.appendChild(li);
            }
            blok.append(t, ul);
        }
        kutu.appendChild(blok);
    }
}

async function goruldu() {
    el('ayarBtn')?.classList.remove('yeniNokta');
    el('ayYenilikler')?.classList.remove('yeniNokta');
    try { await chrome.storage.local.set({ sonGorulenSurum: surum() }); } catch (e) { /* */ }
}

export function yenilikPenceresiniAc() {
    const p = el('yenilikPencere');
    if (!p) return;
    listeyiCiz();
    p.hidden = false;
    el('perde')?.classList.add('acik');
    goruldu();
}

function kapat() {
    el('yenilikPencere').hidden = true;
    if (!el('ayarPanel')?.classList.contains('acik')) el('perde')?.classList.remove('acik');
}

/** Guncellendiyse bir kez haber ver. Duyurduysa true doner. */
async function guncellemeyiDuyur() {
    let kayit;
    try { kayit = (await chrome.storage.local.get('sonGorulenSurum')).sonGorulenSurum; } catch (e) { return false; }
    const simdiki = surum();
    if (kayit === simdiki) return false;
    // Yalnizca listede yer alan bir surum icin duyur (yama surumleri sessiz)
    if (!YENILIKLER.some(s => s.surum === simdiki)) {
        try { await chrome.storage.local.set({ sonGorulenSurum: simdiki }); } catch (e) { /* */ }
        return false;
    }
    el('ayarBtn')?.classList.add('yeniNokta');
    el('ayYenilikler')?.classList.add('yeniNokta');
    const { bildir } = await import('./arayuz.js');
    // Sayfa ilk acilisinda baska bildirimlerle cakismasin
    setTimeout(() => bildir(c('yenilikYuklendi', simdiki), {
        etiket: c('yenilikler'),
        calistir: yenilikPenceresiniAc,
        sure: 12000,
    }), 1500);
    return true;
}

/**
 * DEGERLENDIRME ISTEGI (1.5.8, 1.6.2'de yenilendi): magaza artik SON
 * yorumlara agirlik veriyor. Soru yalnizca eklentiyi gercekten kullanana:
 *   - kurulumdan en az 7 gun gecmis,
 *   - en az 5 AYRI GUN acilmis,
 *   - en az 4 kart var.
 * En cok IKI kez sorulur (ikincisi 30 gun sonra); "Degerlendir"e basan
 * bir daha gormez. Odul/zorlama yok - magaza kurallarina uygun.
 */
const ILK_GUN = 7, KULLANIM_GUN = 5, EN_AZ_KART = 4, TEKRAR_GUN = 30, EN_COK = 2;

/** Ayri kullanim gunlerini sayar (gunde bir artar) */
async function kullanimiSay() {
    try {
        const bugun = new Date().toISOString().slice(0, 10);
        const { kullanim } = await chrome.storage.local.get('kullanim');
        const k = kullanim && typeof kullanim.gun === 'number' ? kullanim : { gun: 0, son: '' };
        if (k.son === bugun) return k.gun;
        const yeni = { gun: k.gun + 1, son: bugun };
        await chrome.storage.local.set({ kullanim: yeni });
        return yeni.gun;
    } catch (e) { return 0; }
}

async function kartSayisi() {
    try {
        const { kokKlasoruAl } = await import('./yerimi.js');
        const [agac] = await chrome.bookmarks.getSubTree(await kokKlasoruAl());
        let n = 0;
        const gez = d => { if (d.url) n++; (d.children || []).forEach(gez); };
        gez(agac);
        return n;
    } catch (e) { return 0; }
}

async function degerlendirmeIste(gun) {
    let d;
    try {
        d = await chrome.storage.local.get(['kurulumTarihi', 'degerlendirmeSoruldu',
                                            'degerlendirmeSayisi', 'degerlendirmeTiklandi']);
    } catch (e) { return; }
    if (d.degerlendirmeTiklandi) return;
    // 1.5.8'de bir kez sorulmus olanlar 1 sayilir
    const sayi = d.degerlendirmeSayisi ?? (d.degerlendirmeSoruldu ? 1 : 0);
    if (sayi >= EN_COK) return;
    const simdi = Date.now();
    if (!d.kurulumTarihi) {
        try { await chrome.storage.local.set({ kurulumTarihi: simdi }); } catch (e) { /* */ }
        return;
    }
    if (simdi - d.kurulumTarihi < ILK_GUN * 864e5) return;
    if (gun < KULLANIM_GUN) return;
    if (sayi >= 1 && simdi - (d.degerlendirmeSoruldu || 0) < TEKRAR_GUN * 864e5) return;
    if (await kartSayisi() < EN_AZ_KART) return;
    // Once isaretle: ayni anda acik baska sekme de sormasin
    try { await chrome.storage.local.set({ degerlendirmeSoruldu: simdi, degerlendirmeSayisi: sayi + 1 }); } catch (e) { return; }
    const { bildir } = await import('./arayuz.js');
    setTimeout(() => bildir(c('degerlendirmeIstegi'), {
        etiket: c('degerlendir'),
        calistir: async () => {
            try { await chrome.storage.local.set({ degerlendirmeTiklandi: true }); } catch (e) { /* */ }
            ac(await degerlendirmeAdresi());
        },
        sure: 20000,
    }), 4000);
}

export function hakkindaKur() {
    const s = el('hkSurum');
    if (!s) return;
    s.textContent = surum();
    el('ayYenilikler')?.addEventListener('click', yenilikPenceresiniAc);
    el('ayDegerlendir')?.addEventListener('click', async () => {
        chrome.storage.local.set({ degerlendirmeTiklandi: true }).catch(() => {});
        ac(await degerlendirmeAdresi());
    });
    el('ayOneri')?.addEventListener('click', () => ac(DEPO + '/issues'));
    el('ayKaynak')?.addEventListener('click', () => ac(DEPO));
    // FVD'den gorselleriyle gecis rehberi (1.5.8) - Ice Aktar dugmeleri arasinda
    el('ayFvdRehber')?.addEventListener('click', () => ac(DEPO + '/blob/main/araclar/FVD.md'));
    el('ayGizlilik')?.addEventListener('click', () => ac(DEPO + '/blob/main/PRIVACY.md'));
    el('yenilikTumu')?.addEventListener('click', () => ac(DEPO + '/blob/main/CHANGELOG.md'));
    el('yenilikKapat')?.addEventListener('click', kapat);
    import('./ozellikler.js').then(m => m.ozelliklerKur()).catch(() => {});
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && el('yenilikPencere') && !el('yenilikPencere').hidden) kapat();
    });
    // Ayni acilista iki bildirim olmasin: guncelleme duyurusu onceliklidir
    const gunSayisi = kullanimiSay();
    guncellemeyiDuyur().then(async duyurdu => { if (!duyurdu) degerlendirmeIste(await gunSayisi); }).catch(() => {});
}
