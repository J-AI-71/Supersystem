/* /js/page-app.js
   SafeShare – App-Seite: UI-Logik für Säubern, Öffnen, Kopieren, Teilen, Prüfen
*/
'use strict';

(function () {

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function el(id) { return document.getElementById(id); }

  function init() {
    // Robust an DOM binden (IDs bevorzugt, sonst per data-action)
    const input   = el('in-url')      || $('input[type="url"], input[placeholder], #url, .js-url');
    const out     = el('out-result')  || $('#result, .js-result');
    const btnClean= el('btn-clean')   || $('[data-action="clean"]')   || findButtonByText('Säubern');
    const btnOpen = el('btn-open')    || $('[data-action="clean-open"]') || findButtonByText('Säubern & öffnen');
    const btnCopy = el('btn-copy')    || $('[data-action="copy"]')    || findButtonByText('Kopieren');
    const btnShare= el('btn-share')   || $('[data-action="share"]')   || findButtonByText('Teilen');
    const btnCheck= el('btn-check')   || $('[data-action="check"]')   || findButtonByText('Prüfen');

    // Guards (Seite soll auch weiter funktionieren, wenn einzelne Elemente fehlen)
    if (!input) return;

    const renderResult = (text) => {
      if (!out) return;
      if ('value' in out) out.value = text || '';
      else out.textContent = text || '';
    };

    const getInput = () => (input.value || '').trim();

    function doClean(openAfter = false) {
      const raw = getInput();
      if (!raw) return;
      const res = window.SafeShare.cleanURL(raw, { unwrap: true, keepWhitelist: true });
      renderResult(res.url);
      if (openAfter) {
        try { window.open(res.url, '_blank', 'noopener'); } catch {}
      }
    }

    function doCopy() {
      const text = out && ('value' in out ? out.value : out.textContent);
      const payload = (text || getInput()).trim();
      if (!payload) return;
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(payload).catch(()=>{});
      } else {
        // Fallback
        const ta = document.createElement('textarea');
        ta.value = payload; document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch {}
        ta.remove();
      }
    }

    async function doShare() {
      const text = out && ('value' in out ? out.value : out.textContent);
      const payload = (text || getInput()).trim();
      if (!payload) return;
      if (navigator.share) {
        try { await navigator.share({ url: payload, title: 'Sauberer Link', text: 'Geteilt mit SafeShare' }); }
        catch {}
      } else {
        doCopy();
        alert('Kopiert. Teilen über die gewünschte App einfügen.');
      }
    }

    function doCheck() {
      const raw = getInput();
      if (!raw) return;
      const info = window.SafeShare.analyze(raw);
      if (!info.ok) { renderResult('Ungültige URL.'); return; }
      const lines = [];
      lines.push('Analyse:');
      lines.push(info.url);
      if (!info.params.length) {
        lines.push('• Keine Query-Parameter gefunden.');
      } else {
        for (const p of info.params) {
          lines.push(`• ${p.key} = ${truncate(p.value, 180)}  ${p.tracking ? '[Tracking]' : ''}${p.whitelisted ? '[Whitelist]' : ''}`);
        }
      }
      renderResult(lines.join('\n'));
    }

    // Events
    btnClean  && btnClean.addEventListener('click', () => doClean(false));
    btnOpen   && btnOpen .addEventListener('click', () => doClean(true));
    btnCopy   && btnCopy .addEventListener('click', doCopy);
    btnShare  && btnShare.addEventListener('click', doShare);
    btnCheck  && btnCheck.addEventListener('click', doCheck);

    // Enter-Handling
    input.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' && !ev.shiftKey && !ev.ctrlKey && !ev.altKey && !ev.metaKey) {
        ev.preventDefault();
        doClean(false);
      }
    });

    // Prefill via ?url=…
    try {
      const u = new URL(location.href);
      const q = u.searchParams.get('url');
      if (q) { input.value = q; doClean(false); }
    } catch {}

    // Pro-Hinweis im Footer (falls vorhanden)
    const proBadge = $('#pro-badge, .js-pro-badge');
    if (proBadge && window.SafeShare.isPro()) proBadge.textContent = 'Pro aktiv';
  }

  function findButtonByText(text) {
    const all = $$('button, a.btn, a[role="button"]');
    const t = String(text).toLowerCase();
    return all.find(b => (b.textContent || '').trim().toLowerCase() === t) || null;
  }

  function truncate(s, n) { s = String(s || ''); return s.length > n ? (s.slice(0, n - 1) + '…') : s; }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
