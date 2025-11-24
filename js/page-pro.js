/* /Supersystem/js/page-pro.js
   Aktualisiert den Pro-Status auf pro.html anhand von localStorage
   und setzt kleine Komfort-Helfer für Kauf/Activation-Flow.
   – Erwartet Keys, die pro-activate.html setzt:
     ss_pro = '1'
     ss_pro_plan = 'personal' | 'team'
     ss_pro_activated_at = ISO-String oder ms
*/
(() => {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    updateProBadge();
    wirePurchaseLinks();
    handleResetHash();
    toggleVisibilityBlocks();
  });

  function isProActive() {
    return localStorage.getItem('ss_pro') === '1';
  }

  function getProPlan() {
    const p = (localStorage.getItem('ss_pro_plan') || '').toLowerCase();
    return (p === 'team' || p === 'personal') ? p : '';
  }

  function getActivatedAt() {
    const raw = localStorage.getItem('ss_pro_activated_at');
    if (!raw) return null;
    // Unterstütze ms (Zahl) oder ISO-Zeitstempel
    let d;
    if (/^\d+$/.test(raw)) d = new Date(Number(raw));
    else d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
  }

  function updateProBadge() {
    const badge = document.getElementById('pro-badge');
    if (!badge) return;

    const active = isProActive();
    const plan = getProPlan();
    const dt = getActivatedAt();

    // Klassen anpassen
    badge.classList.remove('ok', 'warn');
    badge.classList.add(active ? 'ok' : 'warn');

    // Text setzen
    if (active) {
      const planLabel = plan ? ` · Plan: ${plan[0].toUpperCase()}${plan.slice(1)}` : '';
      badge.textContent = `Status: aktiv${planLabel}`;
      // Tooltip mit Datum
      if (dt) {
        try {
          const fmt = new Intl.DateTimeFormat(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short'
          });
          badge.title = `Aktiv seit ${fmt.format(dt)}`;
        } catch {
          badge.title = `Aktiv seit ${dt.toLocaleString()}`;
        }
      }
    } else {
      badge.textContent = 'Status: nicht aktiviert';
      badge.title = '';
    }
  }

  // Komfort: Beim Klick auf einen Payhip-Kauf-Link merken wir,
  // dass wir nach Aktivierung wieder auf pro.html zurück möchten.
  function wirePurchaseLinks() {
    const links = document.querySelectorAll('a[href*="payhip.com/b/"]');
    links.forEach(a => {
      a.addEventListener('click', () => {
        try { sessionStorage.setItem('ss_after_activate', 'pro.html'); } catch {}
      }, { passive: true });
    });
  }

  // Optional: Sichtbarkeit von Blöcken anhand data-visible-when="pro|free"
  function toggleVisibilityBlocks() {
    const active = isProActive();
    document.querySelectorAll('[data-visible-when]').forEach(el => {
      const cond = (el.getAttribute('data-visible-when') || '').toLowerCase();
      const show = (cond === 'pro' && active) || (cond === 'free' && !active);
      el.hidden = !show;
    });
  }

  // Testhilfe: #reset-pro im Hash löscht lokale Pro-Daten
  function handleResetHash() {
    if (location.hash === '#reset-pro') {
      try {
        localStorage.removeItem('ss_pro');
        localStorage.removeItem('ss_pro_plan');
        localStorage.removeItem('ss_pro_activated_at');
      } catch {}
      // Hash entfernen und neu laden
      history.replaceState(null, '', location.pathname + location.search);
      setTimeout(() => location.reload(), 50);
    }
  }
})();
