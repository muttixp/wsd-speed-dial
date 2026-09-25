/*
 * WSD Speed Dial - disaridan birakilan baglantilar
 * Copyright (C) 2026 WEBTE Yazilim
 *
 * Yer imi cubugundan, yer imi yoneticisinden ya da baska bir sekmenin
 * adres cubugundan surukleyip birakilan baglantilari kart yapiyor.
 *
 * NEDEN AYRI DOSYA: kartsurukle.js yalnizca KENDI kartlarimizin
 * tasinmasiyla ilgileniyor ve disaridan gelen her seyi engelliyordu
 * (`document.addEventListener('drop', e => e.preventDefault())`).
 * Buradaki dinleyiciler yalnizca dis kaynakli birakmalarda devreye
 * giriyor; ic surukleme surerken hicbir sey yapmiyorlar.
 */

import { kartEkle, kartlariAl, urlNormalle } from './yerimi.js';
import { aktifGrup, grubuAc } from './cizim.js';
import { bildir } from './arayuz.js';
import { c } from './dil.js';
import { icSuruklemeVarMi } from './kartsurukle.js';
import { klasorSuruklemeVarMi } from './klasorsurukle.js';

/** Kendi kartimizi ya da klasorumuzu tasirken bu modul devreye girmiyor. */
const icSurukleme = () => icSuruklemeVarMi() || klasorSuruklemeVarMi();

export function disBirakmayiKur() {
    const kap = document.getElementById('kartKabi');
    if (!kap) return;

    // Kendi kartimizi tasimiyorsak HER birakmayi kabul ediyoruz.
    // Once yalnizca text/uri-list gibi turler kabul ediliyordu; klasor
    // suruklenince bu turler olmadigindan dragover'da izin verilmiyor
    // ve drop olayi hic dogmuyordu - kullaniciya da bir sey soyleyemi-
    // yorduk. Karari artik drop aninda veriyoruz.
    const gecerliMi = e => !icSurukleme() && !!e.dataTransfer;

    const isaret = ac => document.body.classList.toggle('disBirakma', ac);

    // KLASOR surukleme: tarayici klasoru sayfaya hic teslim etmiyor,
    // `drop` olayi dogmuyor. Bu yuzden uyariyi SURUKLEME sirasinda
    // veriyoruz: veri turu bos geliyorsa klasordur.
    let klasorUyarildi = false;
    const klasorMu = e => !e.dataTransfer || e.dataTransfer.types.length === 0;

    // YAKALAMA evresinde dinliyoruz: kartsurukle.js kart alanindaki
    // drop olayinda stopPropagation() cagiriyor ve olay bize hic
    // ulasmiyordu.
    document.addEventListener('dragover', e => {
        if (icSurukleme()) return;

        if (klasorMu(e)) {
            document.body.classList.add('disBirakmaRed');
            if (!klasorUyarildi) {
                klasorUyarildi = true;
                bildir(c('klasorSurukleme'));
            }
            return;                       // birakmaya izin vermiyoruz
        }

        if (!gecerliMi(e)) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        isaret(true);
    }, true);

    // dragleave pencere disina cikinca tetikleniyor; relatedTarget bos
    const temizle = () => {
        isaret(false);
        document.body.classList.remove('disBirakmaRed');
        klasorUyarildi = false;
    };
    document.addEventListener('dragleave', e => { if (!e.relatedTarget) temizle(); });
    document.addEventListener('dragend', temizle);

    document.addEventListener('drop', async e => {
        if (!gecerliMi(e)) return;
        e.preventDefault();
        e.stopPropagation();          // kartsurukle.js devreye girmesin
        temizle();

        const kayitlar = baglantilariCoz(e.dataTransfer);
        if (!kayitlar.length) {
            // KLASOR birakildi: tarayici klasor suruklenince dataTransfer'a
            // adres koymuyor, icerigine de erisemiyoruz. Toplu aktarim
            // icin ice aktarma ekranina yonlendiriyoruz.
            bildir(c('klasorSurukleme'));
            return;
        }

        const grupId = aktifGrup();
        // Ayni adres bu grupta zaten varsa tekrar eklemiyoruz
        const mevcut = new Set();
        try {
            for (const k of await kartlariAl(grupId)) mevcut.add(urlNormalle(k.url));
        } catch (hata) { /* grup okunamadi */ }

        let eklenen = 0, atlanan = 0, hataliMi = null;
        for (const k of kayitlar) {
            const anahtar = urlNormalle(k.url);
            if (mevcut.has(anahtar)) { atlanan++; continue; }
            mevcut.add(anahtar);
            try {
                await kartEkle(grupId, k.baslik || k.url, k.url);
                eklenen++;
            } catch (hata) {
                // Hatalar sessizce yutuluyordu: kart eklenmiyor, kullanici
                // da bir sey olmadigini saniyordu
                hataliMi = hata;
                console.log('[WSD] kart eklenemedi:', k.url, hata);
            }
        }


        if (eklenen) {
            await grubuAc(grupId);
            bildir(atlanan ? `${c('nKartEklendi', eklenen)} · ${c('nKartZatenVardi', atlanan)}`
                           : c('nKartEklendi', eklenen));
        } else if (atlanan) {
            bildir(c('nKartZatenVardi', atlanan));
        } else {
            bildir(c('kartEklenemedi') + (hataliMi ? ': ' + hataliMi.message : ''));
        }
    }, true);
}

/**
 * Birakilan veriden { url, baslik } listesi cikarir.
 *
 * Yer imi surukleyince tarayici uc bicim veriyor:
 *   text/uri-list  - satir satir adres (# ile baslayan satirlar yorum)
 *   text/html      - <a href="...">Baslik</a>, baslik BURADAN geliyor
 *   text/plain     - duz adres
 * Coklu secim yapildiysa uri-list birden fazla satir iceriyor.
 */
function baglantilariCoz(veri) {
    const cikti = [];
    const gorulen = new Set();

    const ekle = (url, baslik) => {
        if (!url || !/^https?:|^chrome:|^edge:|^about:|^file:/i.test(url)) return;
        if (gorulen.has(url)) return;
        gorulen.add(url);
        cikti.push({ url, baslik: (baslik || '').trim() });
    };

    // Basliklar icin once HTML'e bakiyoruz
    const html = veri.getData('text/html');
    const basliklar = new Map();
    if (html) {
        for (const m of html.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
            const metin = m[2].replace(/<[^>]*>/g, '').trim();
            if (metin) basliklar.set(m[1], metin);
        }
    }

    const uri = veri.getData('text/uri-list');
    if (uri) {
        for (const satir of uri.split(/\r?\n/)) {
            const s = satir.trim();
            if (!s || s.startsWith('#')) continue;      // yorum satiri
            ekle(s, basliklar.get(s));
        }
    }

    if (!cikti.length) {
        const duz = (veri.getData('text/plain') || '').trim();
        if (duz) ekle(duz, basliklar.get(duz));
    }

    return cikti;
}
