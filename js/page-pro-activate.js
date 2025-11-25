/* /Supersystem/js/page-pro-activate.js
   Setzt den lokalen Pro-Status nach Payhip-Redirect und springt zurück. */

(function () {
  'use strict';

  const qs = new URLSearchParams(location.search);
  const DEBUG = qs.get('debug') === '1';
  const RETURN = (qs.get('return') || 'pro').toLowerCase(); // pro|app|start|index
  const PRO_FLAG = qs.get('pro') === '1';
  const PLAN = (qs.get('plan') || 'personal').toLowerCase(); // personal|team

  // DOM-Helper
  const $ = (s) => document.querySelector(s);
  const showDebug = (obj) => {
    if (!DEBUG) return;
    const box = $('#debugBox');
    const out = $('#debugOut');
    if (box && out) {
      box.hidden = false;
      out.textContent = JSON.stringify(obj, null, 2);
    }
    console.log('[pro-activate debug]', obj);
  };

  // Keys zentral
  const KEYS = {
    PRO: 'SS_PRO',                 // '1' = aktiv
    PLAN: 'SS_PRO_PLAN',           // 'personal' | 'team'
    AT: 'SS_PRO_AT',               // ISO-Zeitpunkt
    SOURCE: 'SS_PRO_SOURCE'        // 'payhip'|'manual'
  };

  function setProLocally(plan, source) {
    try {
      localStorage.setItem(KEYS.PRO, '1');
      localStorage.setItem(KEYS.PLAN, plan);
      localStorage.setItem(KEYS.AT, new Date().toISOString());
      localStorage.setItem(KEYS.SOURCE, source);
      return true;
    } catch (e) {
      showDebug({ error: 'localStorage', detail: String(e) });
      return false;
    }
  }

  function getReturnHref() {
    switch (RETURN) {
      case 'app':   return 'app.html';
      case 'start':
      case 'index': return 'index.html';
      case 'pro':
      default:      return 'pro.html';
    }
  }

  function go(href) {
    // schneller, ohne History-Eintrag
    location.replace(href);
  }

  // Hauptlogik
  document.addEventListener('DOMContentLoaded', () => {
    // Buttons verlinken (falls manuell geklickt wird)
    const goPro = $('#go-pro');
    if (goPro) goPro.href = 'pro.html';

    const payload = {
      url: location.href,
      params: Object.fromEntries(qs.entries()),
      willSetPro: PRO_FLAG,
      plan: PLAN
    };

    // Automatische Aktivierung, wenn pro=1 vorhanden
    if (PRO_FLAG) {
      const ok = setProLocally(PLAN === 'team' ? 'team' : 'personal', 'payhip');
      payload.setResult = ok ? 'ok' : 'fail';
      showDebug(payload);

      // kurzer Tick, damit Storage sicher geschrieben ist
      setTimeout(() => go(getReturnHref()), 50);
      return;
    }

    // Manuelle Aktivierungs-Links erlauben (Buttons oben auf der Seite)
    // Aktivieren (Personal)
    const linkPersonal = document.querySelector('a[href*="plan=personal"]');
    if (linkPersonal) linkPersonal.addEventListener('click', (ev) => {
      ev.preventDefault();
      setProLocally('personal', 'manual');
      go(getReturnHref());
    });

    // Aktivieren (Team)
    const linkTeam = document.querySelector('a[href*="plan=team"]');
    if (linkTeam) linkTeam.addEventListener('click', (ev) => {
      ev.preventDefault();
      setProLocally('team', 'manual');
      go(getReturnHref());
    });

    showDebug(payload);
  });
})();
