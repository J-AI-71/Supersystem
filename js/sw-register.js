/* File: js/sw-register.js
   Purpose: Register & manage the SafeShare Service Worker.
   Exposes a tiny API on window.SW for the status page & buttons.
   Works with strict CSP: load via <script defer src="js/sw-register.js?v=__"></script>
*/
(() => {
  'use strict';

  const DEBUG = !!window.SW_DEBUG;
  const log = (...a) => DEBUG && console.log('[SW]', ...a);

  // Allow override before this script loads (rarely needed)
  const SW_URL   = window.__SW_URL__   || 'sw.js';
  const SW_SCOPE = window.__SW_SCOPE__ || '/Supersystem/';

  const emit = (name, detail) => {
    try { window.dispatchEvent(new CustomEvent(name, { detail })); } catch (_) {}
  };

  const SW = {
    supported: 'serviceWorker' in navigator,
    registration: null,
    readyPromise: null,

    /** Register the Service Worker (idempotent). */
    async register() {
      if (!this.supported) {
        log('Service Worker not supported');
        emit('sw-status', { supported: false, registered: false });
        return null;
      }
      if (this.registration) return this.registration;

      try {
        const reg = await navigator.serviceWorker.register(SW_URL, { scope: SW_SCOPE });
        this.registration = reg;
        this.readyPromise = navigator.serviceWorker.ready.catch(() => null);

        // Update lifecycle events
        reg.addEventListener('updatefound', () => {
          const installing = reg.installing;
          emit('sw-status', SW._snapshot('updatefound'));
          if (installing) {
            installing.addEventListener('statechange', () => {
              emit('sw-status', SW._snapshot('installing:' + installing.state));
              log('state:', installing.state);
            });
          }
        });

        // If a new worker takes control, we can refresh once
        let reloaded = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          emit('sw-status', SW._snapshot('controllerchange'));
          if (!reloaded) {
            reloaded = true;
            // Gentle reload to pick the new assets without breaking form inputs
            try { window.location.reload(); } catch (_) {}
          }
        });

        emit('sw-status', this._snapshot('registered'));
        log('registered', reg);
        return reg;
      } catch (err) {
        log('register failed', err);
        emit('sw-status', { supported: true, registered: false, error: String(err) });
        return null;
      }
    },

    /** Ask the browser to look for an updated SW. */
    async checkForUpdate() {
      if (!this.registration) await this.register();
      if (!this.registration) return false;
      try {
        await this.registration.update();
        emit('sw-status', this._snapshot('update()'));
        return true;
      } catch (e) {
        log('update() failed', e);
        emit('sw-status', { error: String(e) });
        return false;
      }
    },

    /** Activate a waiting service worker (skipWaiting). */
    async activateWaiting() {
      if (!this.registration) await this.register();
      const waiting = this.registration && this.registration.waiting;
      if (!waiting) {
        emit('sw-status', this._snapshot('no-waiting'));
        return false;
      }
      // Prefer message channel command; fallback to .postMessage string
      try {
        waiting.postMessage({ type: 'SKIP_WAITING' });
      } catch (_) {
        try { waiting.postMessage('SKIP_WAITING'); } catch (_) {}
      }
      emit('sw-status', this._snapshot('skip-waiting'));
      return true;
    },

    /** Query SW version (if sw.js implements a responder). */
    async getVersion(timeoutMs = 1200) {
      if (!navigator.serviceWorker.controller) return null;
      const ctrl = navigator.serviceWorker.controller;
      try {
        const chan = new MessageChannel();
        const p = new Promise((res) => {
          const t = setTimeout(() => res(null), timeoutMs);
          chan.port1.onmessage = (ev) => {
            clearTimeout(t);
            // Expect {type:'VERSION', value:'…'} or a plain string
            const data = ev.data;
            if (data && typeof data === 'object' && data.type === 'VERSION') {
              res(String(data.value || ''));
            } else if (typeof data === 'string') {
              res(data);
            } else {
              res(null);
            }
          };
        });
        ctrl.postMessage({ type: 'GET_VERSION' }, [chan.port2]);
        const ver = await p;
        if (ver) emit('sw-status', { version: ver });
        return ver;
      } catch {
        return null;
      }
    },

    /** Return a lightweight status snapshot for UI. */
    _snapshot(reason) {
      const reg = this.registration;
      return {
        reason: reason || '',
        supported: this.supported,
        registered: !!reg,
        scope: reg?.scope || null,
        scriptURL: reg?.active?.scriptURL || reg?.installing?.scriptURL || reg?.waiting?.scriptURL || null,
        hasController: !!navigator.serviceWorker.controller,
        states: {
          installing: reg?.installing?.state || null,
          waiting: !!reg?.waiting,
          active: !!reg?.active
        }
      };
    }
  };

  // Expose for the status page (buttons hook into these)
  window.SW = SW;

  // Auto-register as soon as possible
  SW.register().then(() => {
    // Try to surface version soon after control
    SW.getVersion().catch(() => {});
  });

})();
