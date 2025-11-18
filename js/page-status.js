/* js/page-status.js — steuert Status-Seite & Update-Button */
(() => {
  const BASE = '/Supersystem/';

  const $ = (id) => document.getElementById(id);
  const el = {
    loc: $('loc'),
    rt:  $('runtime'),
    sw:  document.getElementById('sw'),
    cs:  $('caches'),
    ls:  $('ls'),
    mani:$('manifest'),
    btnUpd: $('btnSwUpd'),
    btnRef: $('btnRefresh'),
    btnNC:  $('btnNoCache'),
  };

  function w(s){ return `<span class="mut">${s}</span>`; }
  function mono(s){ return `<code class="mono">${s}</code>`; }

  async function getReg() {
    if (!('serviceWorker' in navigator)) return null;
    // Registrierung für unsere Scope abrufen (oder registrieren, falls noch nicht)
    let reg = await navigator.serviceWorker.getRegistration(BASE);
    if (!reg) {
      try { reg = await navigator.serviceWorker.register(`${BASE}sw.js`, { scope: BASE }); }
      catch { /* ignore */ }
    }
    return reg;
  }

  function sendToSW(msg) {
    const ctrl = navigator.serviceWorker?.controller;
    if (ctrl) ctrl.postMessage(msg);
  }

  async function refreshRuntime() {
    const parts = [];
    parts.push(`UserAgent: ${navigator.userAgent}`);
    parts.push(`Online: ${navigator.onLine ? 'ja' : 'nein'}`);
    parts.push(`ServiceWorker: ${'serviceWorker' in navigator ? 'unterstützt' : 'nicht verfügbar'}`);

    const reg = await getReg();
    if (reg) {
      const s = [
        reg.installing ? 'installing' : null,
        reg.waiting    ? 'waiting'    : null,
        reg.active     ? 'active'     : null,
      ].filter(Boolean).join(', ') || '—';

      parts.push(`SW-Registration: ${s}`);
      if (reg.scope) parts.push(`Scope: ${reg.scope}`);
    } else {
      parts.push('SW-Registration: —');
    }

    if (el.rt) el.rt.innerHTML = parts.map(p => `<div>${p}</div>`).join('');
    // SW-Version vom aktiven Controller erfragen
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      sendToSW({ type: 'GET_VERSION' });
    }
  }

  async function listCaches() {
    if (!('caches' in self)) { if (el.cs) el.cs.textContent = 'Cache API nicht verfügbar.'; return; }
    try {
      const names = await caches.keys();
      if (!names.length) { el.cs.textContent = 'Keine Caches.'; return; }
      const ul = document.createElement('ul');
      ul.className = 'tight';
      for (const n of names) {
        const li = document.createElement('li');
        li.textContent = n;
        ul.appendChild(li);
      }
      el.cs.innerHTML = '';
      el.cs.appendChild(ul);
    } catch {
      el.cs.textContent = 'Cache-Auflistung fehlgeschlagen.';
    }
  }

  function listLocalStorage() {
    try {
      const keys = Object.keys(localStorage);
      if (!keys.length) { el.ls.textContent = 'leer'; return; }
      el.ls.innerHTML = keys.map(k => `${mono(k)} = ${w(String(localStorage.getItem(k)).slice(0,120))}`).join('<br>');
    } catch {
      if (el.ls) el.ls.textContent = 'LocalStorage nicht verfügbar.';
    }
  }

  async function showManifest() {
    try {
      const res = await fetch(`${BASE}manifest.webmanifest`, { cache: 'no-cache' });
      if (!res.ok) throw new Error();
      const json = await res.json();
      el.mani.textContent = `Name: ${json.name || '—'} · Start URL: ${json.start_url || '—'} · Icons: ${(json.icons||[]).length}`;
    } catch {
      if (el.mani) el.mani.textContent = 'Manifest nicht geladen.';
    }
  }

  async function checkUpdate() {
    const reg = await getReg();
    if (!reg) { alert('Kein Service Worker registriert.'); return; }

    // Update vom Netz anstoßen
    try { await reg.update(); } catch {}

    // Wenn ein neues SW bereit ist, aktivieren
    if (reg.waiting) {
      reg.waiting.postMessage({ type: 'SKIP_WAITING' });
      setTimeout(() => location.reload(), 250);
      return;
    }

    // Wenn gerade installiert wird, auf Abschluss warten
    if (reg.installing) {
      reg.installing.addEventListener('statechange', () => {
        if (reg.installing?.state === 'installed') {
          // neues SW wartet → aktivieren
          reg.waiting?.postMessage({ type: 'SKIP_WAITING' });
          setTimeout(() => location.reload(), 250);
        }
      });
      return;
    }

    // Sonst Version anzeigen (evtl. keine Änderung)
    sendToSW({ type: 'GET_VERSION' });
    alert('Kein Update gefunden (oder bereits aktiv).');
  }

  function wire() {
    if (el.loc) el.loc.textContent = `URL: ${location.href}`;
    el.btnUpd?.addEventListener('click', checkUpdate);
    el.btnRef?.addEventListener('click', () => location.reload());
    el.btnNC ?.addEventListener('click', () => {
      const url = new URL(location.href);
      url.searchParams.set('nocache', Date.now().toString());
      location.replace(url.toString());
    });

    // SW-Nachrichten empfangen (Version etc.)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (e) => {
        const d = e.data || {};
        if (d.type === 'SW_VERSION' && el.rt) {
          el.rt.insertAdjacentHTML('beforeend', `<div>SW-Version: ${mono(d.version)}</div>`);
        }
      });
      // Controller-Wechsel → neu laden (nach SkipWaiting)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // kurze Verzögerung, damit das neue SW übernimmt
        setTimeout(() => location.reload(), 100);
      });
    }
  }

  document.addEventListener('DOMContentLoaded', async () => {
    wire();
    await refreshRuntime();
    await listCaches();
    listLocalStorage();
    await showManifest();
  });
})();
