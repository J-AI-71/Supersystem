/* /Supersystem/js/page-team-setup.js (v35) – Whitelist-Editor */
(() => {
  'use strict';

  const $ = (s) => document.querySelector(s);
  const chipsEl = $('#wl-chips');
  const inputEl = $('#wl-input');
  const msgEl = $('#wl-msg');

  const KEY = 'ss_whitelist';
  const DEFAULTS = ['tag','ref'];
  const VALID = /^[a-z0-9_-]+$/;

  function load() {
    const raw = (localStorage.getItem(KEY) || '').trim();
    if (!raw) return [];
    return raw.split(',').map(s => s.trim()).filter(Boolean);
  }

  function save(list) {
    const unique = Array.from(new Set(list.map(s => s.toLowerCase())))
      .filter(s => VALID.test(s));
    localStorage.setItem(KEY, unique.join(','));
    return unique;
  }

  function render(list) {
    // Input
    inputEl.value = list.join(',');
    // Chips
    chipsEl.innerHTML = '';
    if (!list.length) {
      chipsEl.innerHTML = '<span class="mut">Keine Einträge – alles wird entfernt.</span>';
      return;
    }
    list.forEach(name => {
      const chip = document.createElement('span');
      chip.className = 'chip';
      chip.innerHTML = `<code>${name}</code> <button type="button" title="Entfernen" aria-label="Entfernen">×</button>`;
      chip.querySelector('button').addEventListener('click', () => {
        const next = load().filter(x => x !== name);
        const final = save(next);
        render(final);
        setMsg(`Entfernt: ${name}`);
      });
      chipsEl.appendChild(chip);
    });
  }

  function parseInput() {
    const raw = inputEl.value || '';
    const items = raw.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    const invalid = items.filter(s => !VALID.test(s));
    if (invalid.length) {
      throw new Error(`Ungültig: ${invalid.join(', ')} (nur a–z, 0–9, _ , -)`);
    }
    return items;
  }

  function setMsg(text) {
    if (msgEl) msgEl.textContent = text;
  }

  // Events
  $('#wl-save')?.addEventListener('click', () => {
    try {
      const items = parseInput();
      const final = save(items);
      render(final);
      setMsg('Gespeichert.');
    } catch (e) {
      setMsg(String(e.message || e));
    }
  });

  $('#wl-reset')?.addEventListener('click', () => {
    const final = save(DEFAULTS);
    render(final);
    setMsg('Standard geladen (tag,ref).');
  });

  $('#wl-clear')?.addEventListener('click', () => {
    localStorage.removeItem(KEY);
    render([]);
    setMsg('Whitelist geleert.');
  });

  $('#wl-export')?.addEventListener('click', () => {
    const list = load();
    const text = list.join(',') + '\n';
    const ts = new Date();
    const pad = (n) => String(n).padStart(2,'0');
    const name = `safeshare-whitelist-${ts.getFullYear()}${pad(ts.getMonth()+1)}${pad(ts.getDate())}.txt`;
    const blob = new Blob([text], {type:'text/plain;charset=utf-8'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
    setMsg(`Exportiert: ${name}`);
  });

  $('#wl-import')?.addEventListener('change', (ev) => {
    const file = ev.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        let txt = String(reader.result || '');
        // JSON-Array unterstützen
        if (/^\s*\[/.test(txt)) {
          const arr = JSON.parse(txt);
          if (!Array.isArray(arr)) throw new Error('JSON ist keine Liste.');
          txt = arr.join(',');
        }
        inputEl.value = txt.trim();
        const final = save(parseInput());
        render(final);
        setMsg(`Importiert: ${file.name}`);
      } catch (e) {
        setMsg('Import fehlgeschlagen: ' + (e.message || e));
      }
      ev.target.value = '';
    };
    reader.readAsText(file, 'utf-8');
  });

  // Init
  render(load());
  setMsg('Bereit.');
  console.log('[SafeShare] page-team-setup bereit');
})();
