/* /Supersystem/js/page-pro.js
   Aktualisiert den Pro-Status auf pro.html anhand von localStorage.
   Kompatibel zu alten Keys (ss_plan) und neuen (ss_pro_plan).
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
    // Neu: ss_pro_plan, Fallback: ss_plan
    const p = (localStorage.getItem('ss_pro_plan') || localStorage.getItem('ss_plan') || '').toLowerCase();
    return (p === 'team' || p === 'personal') ? p : '';
  }

  function getActivatedAt() {
    const raw = localStorage.getItem('ss_pro_activated_at');
    if (!raw) return null;
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

    badge.classList.remove('ok', 'warn');
    badge.classList.add(active ? 'ok' : 'warn');

    if (active) {
      const planLabel = plan ? ` · Plan: ${plan[0].toUpperCase()}${plan.slice(1)}` : '';
      badge.textContent = `Status: aktiv${planLabel}`;
      if (dt) {
        try {
          const fmt = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });
          badge.title = `Aktiv seit ${fmt.format(dt)}`;
        } catch { badge.title = `Aktiv seit ${dt.toLocaleString()}`; }
      }
    } else {
      badge.textContent = 'Status: nicht aktiviert';
      badge.title = '';
    }
  }

  function wirePurchaseLinks() {
    const links = document.querySelectorAll('a[href*="payhip.com/b/"]');
    links.forEach(a => {
      a.addEventListener('click', () => {
        try { sessionStorage.setItem('ss_after_activate', 'pro.html'); } catch {}
      }, { passive: true });
    });
  }

  function toggleVisibilityBlocks() {
    const active = isProActive();
    document.querySelectorAll('[data-visible-when]').forEach(el => {
      const cond = (el.getAttribute('data-visible-when') || '').toLowerCase();
      const show = (cond === 'pro' && active) || (cond === 'free' && !active);
      el.hidden = !show;
    });
  }

  function handleResetHash() {
    if (location.hash === '#reset-pro') {
      try {
        localStorage.removeItem('ss_pro');
        localStorage.removeItem('ss_pro_plan');
        localStorage.removeItem('ss_plan'); // alter Key
        localStorage.removeItem('ss_pro_activated_at');
      } catch {}
      history.replaceState(null, '', location.pathname + location.search);
      setTimeout(() => location.reload(), 50);
    }
  }
})();
