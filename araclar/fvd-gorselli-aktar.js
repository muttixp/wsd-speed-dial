/*
 * WSD Speed Dial - FVD export with thumbnails / FVD'yi gorselleriyle disa aktar
 * Copyright (C) 2026 muttixp - GPL-3.0-or-later
 * https://github.com/muttixp/wsd-speed-dial/blob/main/araclar/FVD.md
 *
 * READ-ONLY: reads your own groups, dials and thumbnails from the
 * FVD Speed Dial page and saves them to one file. It changes or
 * deletes nothing and makes no network requests.
 *
 * YALNIZCA OKUR: kendi gruplarinizi, kartlarinizi ve gorsellerinizi
 * okuyup tek dosyaya kaydeder. Hicbir seyi degistirmez/silmez,
 * internete baglanmaz.
 *
 * Usage: open the FVD Speed Dial tab -> F12 -> Console -> paste -> Enter.
 * Then in WSD: Settings > Backup and Import > Import > choose the downloaded file.
 *
 * Not affiliated with FVD Speed Dial.
 */
(async () => {
    const log = (...a) => console.log('%c[WSD]', 'color:#5d93c2;font-weight:bold', ...a);

    // indexedDB.open() creates a missing database - check first so we
    // never write anything to the page.
    const dbler = (await indexedDB.databases()).map(d => d.name);
    if (!dbler.includes('fvd_speeddial')) {
        log('FVD data not found. Run this in the FVD Speed Dial tab (its new tab page).');
        return;
    }

    const ac = ad => new Promise((ok, red) => {
        const r = indexedDB.open(ad);
        r.onsuccess = () => ok(r.result);
        r.onerror = () => red(r.error);
    });
    const hepsi = (db, depo) => new Promise((ok, red) => {
        if (!db.objectStoreNames.contains(depo)) return ok([]);
        const r = db.transaction(depo, 'readonly').objectStore(depo).getAll();
        r.onsuccess = () => ok(r.result || []);
        r.onerror = () => red(r.error);
    });

    const sd = await ac('fvd_speeddial');
    let gruplar, kartlar;
    try {
        gruplar = await hepsi(sd, 'groups');
        kartlar = await hepsi(sd, 'dials');
    } finally { sd.close(); }

    // Thumbnail index: path -> record key. Contents are read one by one
    // later, so a large store is never loaded into memory at once.
    const dosyalar = new Map();
    let fs = null;
    if (dbler.includes('FSRedundancy')) {
        fs = await ac('FSRedundancy');
        if (fs.objectStoreNames.contains('fs_store')) {
            await new Promise((ok, red) => {
                const r = fs.transaction('fs_store', 'readonly').objectStore('fs_store').openCursor();
                r.onsuccess = () => {
                    const c = r.result;
                    if (!c) return ok();
                    const k = c.value;
                    if (k && k.path && k.path.includes('sd_previews') && k.contents) dosyalar.set(k.path, c.primaryKey);
                    c.continue();
                };
                r.onerror = () => red(r.error);
            }).catch(() => {});
        }
    }
    const dosyaOku = anahtar => new Promise(ok => {
        try {
            const r = fs.transaction('fs_store', 'readonly').objectStore('fs_store').get(anahtar);
            r.onsuccess = () => ok(r.result ? r.result.contents : null);
            r.onerror = () => ok(null);
        } catch (e) { ok(null); }
    });
    log(`Groups: ${gruplar.length} · Dials: ${kartlar.length} · Thumbnail files: ${dosyalar.size}`);

    // Shrink to WebP (max 640px wide): keeps the file small, WSD resizes anyway
    const blobaCevir = async ic => {
        if (ic instanceof Blob) return ic;
        if (ic instanceof ArrayBuffer || ArrayBuffer.isView(ic)) return new Blob([ic]);
        if (typeof ic === 'string') {
            const b64 = ic.includes(',') ? ic.slice(ic.indexOf(',') + 1) : ic;
            const bin = atob(b64);
            const u = new Uint8Array(bin.length);
            for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
            return new Blob([u]);
        }
        return null;
    };
    const veriAdresi = b => new Promise(ok => {
        const o = new FileReader();
        o.onload = () => ok(o.result);
        o.onerror = () => ok(null);
        o.readAsDataURL(b);
    });
    const kucult = async ic => {
        try {
            const blob = await blobaCevir(ic);
            if (!blob) return null;
            const resim = await createImageBitmap(blob);
            const o = Math.min(1, 640 / resim.width);
            const tuval = new OffscreenCanvas(Math.round(resim.width * o), Math.round(resim.height * o));
            tuval.getContext('2d').drawImage(resim, 0, 0, tuval.width, tuval.height);
            resim.close();
            return await veriAdresi(await tuval.convertToBlob({ type: 'image/webp', quality: 0.87 }));
        } catch (e) {
            return null;              // unreadable image: dial comes without it, WSD captures it
        }
    };

    // Thumbnails FVD keeps in the browser's file area (filesystem: URL).
    // Read-only: resolve the entry and read the file; fall back to <img>.
    const dosyaAlani = url => new Promise(ok => {
        const coz = window.webkitResolveLocalFileSystemURL;
        const resimle = () => {
            const img = new Image();
            img.onload = () => createImageBitmap(img).then(b => {
                const c = new OffscreenCanvas(b.width, b.height);
                c.getContext('2d').drawImage(b, 0, 0); b.close();
                return c.convertToBlob({ type: 'image/png' });
            }).then(ok, () => ok(null));
            img.onerror = () => ok(null);
            img.src = url;
        };
        if (!coz) return resimle();
        try {
            coz.call(window, url, giris => giris.file(f => ok(f), () => ok(null)), () => ok(null));
        } catch (e) { resimle(); }
    });

    const sonuc = {
        source: 'fvd-full',
        groups: gruplar.map(g => ({ id: g.id, name: g.name, position: g.position })),
        dials: []
    };
    let gorselli = 0, i = 0;
    const tur = { store: 0, embedded: 0, file: 0, fileFailed: 0, web: 0, none: 0, other: 0 };
    const alanlar = new Set();
    for (const d of kartlar.slice(0, 200)) if (d) Object.keys(d).forEach(a => alanlar.add(a));
    const ornek = new Set();
    for (const d of kartlar) {
        i++;
        if (!d || !d.url) continue;
        let thumb = null;
        const k = typeof d.thumb === 'string' ? d.thumb : '';
        // Order: image embedded in `thumb` -> backup store -> file area ->
        // as a last resort an image embedded in some other field
        if (k.startsWith('data:image')) {
            thumb = await kucult(k);
            if (thumb) tur.embedded++;
        }
        if (!thumb && k.includes('sd_previews/')) {
            const yol = '/sd_previews/' + k.split('sd_previews/')[1].split(/[?#]/)[0];
            if (dosyalar.has(yol)) thumb = await kucult(await dosyaOku(dosyalar.get(yol)));
            if (thumb) tur.store++;
        }
        let dosyaYok = false;
        if (!thumb && k.startsWith('filesystem:')) {
            const f = await dosyaAlani(k);
            if (f) thumb = await kucult(f);
            if (thumb) tur.file++; else dosyaYok = true;
        }
        if (!thumb) {
            for (const v of Object.values(d)) {
                if (v === k || typeof v !== 'string' || !v.startsWith('data:image')) continue;
                thumb = await kucult(v);
                if (thumb) { tur.embedded++; break; }
            }
        }
        if (!thumb) {
            // Web addresses are NOT downloaded (no network); WSD captures those
            if (dosyaYok) tur.fileFailed++;
            else if (/^https?:/i.test(k)) tur.web++;
            else if (!k) tur.none++;
            else { tur.other++; if (ornek.size < 3) ornek.add(k.slice(0, 40)); }
        }
        if (thumb) gorselli++;
        sonuc.dials.push({ url: d.url, title: d.title, group_id: d.group_id, position: d.position, thumb });
        if (i % 50 === 0) log(`${i} / ${kartlar.length}`);
    }

    if (fs) fs.close();

    const t = new Date(), iki = n => String(n).padStart(2, '0');
    const ad = `wsd-fvd-${t.getFullYear()}-${iki(t.getMonth() + 1)}-${iki(t.getDate())}.json`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(sonuc)], { type: 'application/json' }));
    a.download = ad;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 10000);

    log(`Done: ${sonuc.dials.length} dials, ${gorselli} with thumbnails -> ${ad}`);
    log('Thumbnails:', JSON.stringify(tur), ornek.size ? [...ornek] : '');
    if (tur.fileFailed) log(`${tur.fileFailed} thumbnail files are missing in FVD itself; WSD will capture them.`);
    log('Dial fields:', [...alanlar].join(', '));
    log('WSD: Settings > Backup and Import > Import > choose this file.');
})();
