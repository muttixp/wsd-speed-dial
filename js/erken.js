// WSD Speed Dial - erken tema (1.5.5)
// Sayfa cizilmeden ONCE calisir (head icinde, modul degil): acik mod
// secilmisse koyu zemin bir an parlamasin. Asil ayar tema.js'te.
(function () {
    try {
        var m = localStorage.getItem('wsdTemaModu') || 'koyu';
        if (m === 'sistem') m = matchMedia('(prefers-color-scheme: dark)').matches ? 'koyu' : 'acik';
        if (m === 'acik') document.documentElement.classList.add('acikMod');
    } catch (e) { /* */ }
})();
