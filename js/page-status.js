// js/page-status.js
(function () {
  const $ = (id) => document.getElementById(id);

  async function readSWVersionFallback() {
    // Versucht Versions-Konstante aus sw.js auszulesen (ohne Cache)
    try {
      const res = await fetch('sw.js?nocache=' + Date.now(), { cache: 'no-store' });
      const txt = await res.text();
      // häufige Varianten
      const m =
        txt.match(/SW_VERSION\s*=\s*['"]([^'"]+)['"]/) ||
        txt.match(/CACHE_VERSION\s*=\s*['"]([^'"]+)['"]/) ||
        txt.match(/SSW_VERSION\s*=\s*['"]([^'"]+)['"]/);
      return m ? m[1] : '–';
    } catch {
      return '–';
    }
  }

  function postToSW(msg) {
    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage(msg);
    }
  }

  async function refreshState() {
    const outState   = $('sw-state');
    const outVer     = $('sw-version');
    const outWaiting = $('sw-waiting');
    const outPro     = $('pro-state');

    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (!reg) {
        outState.textContent = 'nicht registriert';
        outVer.textContent = '–';
        outWaiting.textContent = '–';
      } else {
        const state =
          (reg.active && 'aktiv') ||
          (reg.waiting && 'wartend') ||
          (reg.installing && 'installiert') ||
          'registriert';
        outState.textContent = state;
        outWaiting.textContent = reg.waiting ? 'ja' : 'nein';

        // Versuch 1: Version via Message-Channel vom aktiven SW
        let version = '–';
        try {
          version = await new Promise((resolve, reject) => {
            const ch = new MessageChannel();
            const t = setTimeout(() => reject(new Error('timeout')), 800);
            ch.port1.onmessage = (ev) => {
              clearTimeout(t);
              if (ev.data && ev.data.type === 'SW_VERSION') resolve(ev.data.value || '–');
              else resolve('–');
            };
            if (reg.active) reg.active.postMessage({ type: 'GET_VERSION' }, [ch.port2]);
            else reject(new Error('no-active'));
          });
        } catch {
          // Fallback: aus sw.js parsen
          version = await readSWVersionFallback();
        }
        outVer.textContent = version;
      }
    } catch {
      outState.textContent = 'Fehler beim Auslesen';
      outVer.textContent = '–';
      outWaiting.textContent = '–';
    }

    // Pro-Flag
    const pro = localStorage.getItem('ss_pro') || localStorage.getItem('safeshare.pro');
    outPro.textContent = pro ? 'aktiv' : 'nicht aktiv';
  }

  async function checkForUpdate() {
    $('sw-log').textContent = 'Suche nach Updates …';
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      await reg?.update();
      await refreshState();
      $('sw-log').textContent = 'Update-Check abgeschlossen.';
    } catch {
      $('sw-log').textContent = 'Update-Check fehlgeschlagen.';
    }
  }

  async function activateWaiting() {
    const log = $('sw-log');
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg?.waiting) {
        // bittet den SW, sofort zu übernehmen
        reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        log.textContent = 'Wartende Version wird aktiviert …';
        // kurze Pause, dann Reload
        setTimeout(() => location.reload(), 600);
      } else {
        log.textContent = 'Keine wartende Version vorhanden.';
      }
    } catch {
      log.textContent = 'Aktivierung fehlgeschlagen.';
    }
  }

  async function clearAllCaches() {
    const log = $('sw-log');
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
      log.textContent = 'Alle Caches gelöscht. Seite neu laden empfohlen.';
    } catch {
      log.textContent = 'Caches konnten nicht gelöscht werden.';
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    $('btn-check')?.addEventListener('click', checkForUpdate);
    $('btn-activate')?.addEventListener('click', activateWaiting);
    $('btn-clear')?.addEventListener('click', clearAllCaches);
    refreshState();

    // Falls der SW uns proaktiv seine Version schickt
    navigator.serviceWorker?.addEventListener('message', (ev) => {
      if (ev.data && ev.data.type === 'SW_VERSION') {
        const outVer = $('sw-version');
        if (outVer) outVer.textContent = ev.data.value || '–';
      }
    });

    // optional: beim Laden einmal nach neuer Version fragen
    postToSW({ type: 'GET_VERSION' });
  });
})();
