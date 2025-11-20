/* team-setup.js – SafeShare Team-Whitelist Verwaltung */
(function(){
  const KEY_MAIN = 'ss_whitelist';
  const KEY_LEGACY = 'ss_team_whitelist';

  const $ = s => document.querySelector(s);
  const box = $('#pill-box');
  const input = $('#param-input');
  const cnt = $('#cnt');
  const taImport = $('#import-area');

  $('#btn-add').addEventListener('click', onAdd);
  $('#btn-export').addEventListener('click', onExport);
  $('#btn-reset').addEventListener('click', onReset);
  $('#btn-import-merge').addEventListener('click', ()=>onImport(false));
  $('#btn-import-replace').addEventListener('click', ()=>onImport(true));
  input.addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); onAdd(); } });

  init();

  function init(){
    const set = loadSet();
    render(set);
  }

  function loadSet(){
    try{
      const raw = localStorage.getItem(KEY_MAIN)
               || localStorage.getItem(KEY_LEGACY)
               || '[]';
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr)) return new Set();
      return new Set(arr.map(s => String(s).toLowerCase()));
    }catch{ return new Set(); }
  }

  function saveSet(set){
    const arr = Array.from(set).sort();
    localStorage.setItem(KEY_MAIN, JSON.stringify(arr));
    // Legacy mitschreiben für Altseiten
    localStorage.setItem(KEY_LEGACY, JSON.stringify(arr));
    return arr;
  }

  function validName(name){
    const n = String(name||'').trim().toLowerCase();
    if (!n) return null;
    // a-z 0-9 _ - .
    if (!/^[a-z0-9_.-]{1,64}$/.test(n)) return null;
    return n;
  }

  function onAdd(){
    const n = validName(input.value);
    if (!n) { flash(input); return; }
    const set = loadSet();
    set.add(n);
    saveSet(set);
    input.value = '';
    render(set);
    toast(`Hinzugefügt: ${n}`);
  }

  function onExport(){
    const set = loadSet();
    const json = JSON.stringify(Array.from(set).sort(), null, 2);
    const blob = new Blob([json], {type:'application/json;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'safeshare-whitelist.json';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }

  function onReset(){
    if (!confirm('Alle Einträge entfernen?')) return;
    localStorage.setItem(KEY_MAIN, '[]');
    localStorage.setItem(KEY_LEGACY, '[]');
    render(new Set());
  }

  function onImport(replace){
    const text = taImport.value || '';
    const parts = text.split(/[\s,;]+/).map(s=>s.trim()).filter(Boolean);
    if (!parts.length) { flash(taImport); return; }

    let set = replace ? new Set() : loadSet();
    let added = 0;
    for (const p of parts){
      const n = validName(p);
      if (n){ set.add(n); added++; }
    }
    saveSet(set);
    render(set);
    toast(`${added} Einträge übernommen.`);
  }

  function render(set){
    box.innerHTML = '';
    const arr = Array.from(set).sort();
    cnt.textContent = String(arr.length);
    if (!arr.length){
      const p = document.createElement('p');
      p.className = 'mut';
      p.textContent = 'Keine Einträge vorhanden.';
      box.appendChild(p);
      return;
    }
    for (const n of arr){
      const span = document.createElement('span');
      span.className = 'pill';
      span.innerHTML = `<code>${escapeHtml(n)}</code><span class="x" title="Entfernen" aria-label="Entfernen" role="button">×</span>`;
      span.querySelector('.x').addEventListener('click', ()=>{
        const s2 = loadSet();
        s2.delete(n);
        saveSet(s2);
        render(s2);
      });
      box.appendChild(span);
    }
  }

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  function flash(el){
    const old = el.style.outline;
    el.style.outline = '2px solid #e11d48';
    setTimeout(()=>{ el.style.outline = old || ''; }, 700);
  }

  function toast(msg){
    const div = document.createElement('div');
    div.textContent = msg;
    Object.assign(div.style, {
      position:'fixed',left:'50%',bottom:'18px',transform:'translateX(-50%)',
      background:'#101214',color:'#e9e9ea',border:'1px solid #20232b',borderRadius:'10px',
      padding:'8px 12px',zIndex:99999,font:'14px/1.2 system-ui,-apple-system,Segoe UI,Roboto'
    });
    document.body.appendChild(div);
    setTimeout(()=>div.remove(), 1600);
  }
})();
