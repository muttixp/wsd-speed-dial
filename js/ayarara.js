// WSD Speed Dial - Copyright (C) 2026 muttixp - GPL-3.0-or-later
//
// AYAR ARAMA (1.5.7): panelin ustundeki kutuya yazilinca yalnizca eslesen
// satirlar kalir; ilgili bolum ve alt bolumler acilir. Aranan: satirin
// gorunen metni (arayuz dili ne ise) + bolum / alt bolum basligi.
// Akordeon durumuna ('acik') DOKUNULMUYOR - arama ayri siniflarla
// gosteriliyor; kutu bosalinca panel eski haline doner.
const el = id => document.getElementById(id);

/** Turkce I/i ve aksanlar: "Gölge" ~ "golge", "IŞIK" ~ "isik" */
function sade(m) {
    return String(m || '').toLocaleLowerCase()
        .replace(/ı/g, 'i').normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/\s+/g, ' ').trim();
}

// Aranabilir birimler: tekil ayar satirlari ve dugme yiginlarindaki dugmeler
const SATIR = '.ayarSatir:not(.dugmeYigini), .dugmeYigini > button, .kyKlasorSatir';

function temizle(panel) {
    panel.classList.remove('ayarAramada');
    for (const x of panel.querySelectorAll('.araEsles, .araGizli')) x.classList.remove('araEsles', 'araGizli');
    el('ayarAraYok').hidden = true;
}

function ara(q) {
    const panel = el('ayarPanel');
    temizle(panel);
    const sorgu = sade(q);
    if (sorgu.length < 2) return;
    panel.classList.add('ayarAramada');
    const kelimeler = sorgu.split(' ');
    const uyar = metin => { const t = sade(metin); return kelimeler.every(k => t.includes(k)); };
    let toplam = 0;
    for (const bolum of panel.querySelectorAll('.bolum')) {
        const bolumAdi = bolum.querySelector('.bolumAd')?.textContent || '';
        const bolumUyar = uyar(bolumAdi);
        let bolumdeVar = false;
        const altlar = [...bolum.querySelectorAll('.altAcilir')];
        const birimler = [...bolum.querySelectorAll(SATIR)];
        for (const alt of altlar) {
            const altUyar = bolumUyar || uyar(alt.querySelector('.altAd')?.textContent || '');
            let altdaVar = altUyar;
            for (const s of alt.querySelectorAll(SATIR)) {
                // Gizli kutudaki satir (ornek: secili olmayan yontemin ayarlari) sayilmaz
                const e = !s.closest('[hidden]') && (altUyar || uyar(s.textContent));
                s.classList.add(e ? 'araEsles' : 'araGizli');
                if (e) { altdaVar = true; toplam++; }
            }
            alt.classList.add(altdaVar ? 'araEsles' : 'araGizli');
            if (altdaVar) bolumdeVar = true;
        }
        // Alt bolumu olmayan satirlar (Hakkinda gibi)
        for (const s of birimler) {
            if (s.closest('.altAcilir')) continue;
            const e = !s.closest('[hidden]') && (bolumUyar || uyar(s.textContent));
            s.classList.add(e ? 'araEsles' : 'araGizli');
            if (e) { bolumdeVar = true; toplam++; }
        }
        // Dugmeleri tumden elenen dugme yiginlari bos satir olarak kalmasin
        for (const y of bolum.querySelectorAll('.dugmeYigini')) {
            if (!y.querySelector('.araEsles')) y.classList.add('araGizli');
        }
        // Ic ice basliklar (Zemin Renklendirme gibi): icinde eslesen yoksa gizle
        for (const ic of bolum.querySelectorAll('.altBolum:not(.altAcilir)')) {
            if (!ic.querySelector('.araEsles')) ic.classList.add('araGizli');
        }
        // Tema listesi gibi satir disi bloklar: bolum ya da alt basligi uyduysa gorunur
        bolum.classList.add(bolumdeVar ? 'araEsles' : 'araGizli');
    }
    el('ayarAraYok').hidden = toplam > 0;
}

export function ayarAramaKur() {
    const kutu = el('ayarAra');
    if (!kutu) return;
    let zaman = null;
    kutu.addEventListener('input', () => { clearTimeout(zaman); zaman = setTimeout(() => ara(kutu.value), 120); });
    kutu.addEventListener('keydown', e => {
        if (e.key === 'Escape' && kutu.value) { e.stopPropagation(); kutu.value = ''; ara(''); }
    });
}
