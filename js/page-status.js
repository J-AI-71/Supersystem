// page-status.js – Service Worker / Cache / Diagnose
(function(){
  const $ = s => document.querySelector(s);

  const badge = $('#sw-state-badge');
  const elCtrl = $('#sw-controller');
  const elReg = $('#sw-reg');
  const elScript = $('#sw-script');
  const elVer = $('#sw-version');
  const elNote = $('#sw-note');

  const elCaches = $('#cache-list');
  const elLS = $('#ls-keys');

  const elOnline = $('#diag-online');
  const elLang = $('#diag-lang');
  const elUA = $('#diag-ua');
  const elTime = $('#diag-time');
  const diagMsg = $('#diag-msg');

  $('#btn-update').addEventListener('click', onUpdate);
  $('#btn-activate-waiting').addEventListener('click', onActivateWaiting);
  $('#btn-hard').addEventListener('click', hardReload);
  $('#btn-unreg').addEventListener('click', unregisterSW);

  $('#btn-clear-caches').addEventListener('click', clearCaches);
  $('#btn-clear-ls').addEventListener('click', clearLS);
  $('#btn-clear-all').addEventListener('click', clearAll);

  $('#btn-ping').addEventListener('click', pingSW);
  $('#btn-open-app').addEventListener('click', ()=>location.href='app.html');

  window.addEventListener('online', updateDiag);
  window.addEventListener('offline', updateDiag);
  navigator.serviceWorker?.addEventListener('message', onSWMessage);
  navigator.serviceWorker?.addEventListener('controllerchange', ()=>setTimeout(refreshSW, 50));

  init();

  async function init(){
    updateDiag();
    await refreshSW();
    await refreshCaches();
    refreshLS();
  }

  // ---- Service Worker ----
  async function getReg(){
    try{ return await navigator.serviceWorker.getRegistration(); }
    catch{ return null; }
  }

  async function refreshSW(){
    const ctrl = navigator.serviceWorker?.controller || null;
    elCtrl.textContent = ctrl ? 'aktiv' : 'kein Controller';
    setBadge(ctrl ? 'ok' : 'idle', ctrl ? 'SW aktiv' : 'Kein SW aktiv');

    const reg = await getReg();
    if (!reg){
      elReg.textContent = '–';
      elScript.textContent = '–';
      elVer.textContent = '–';
      $('#btn-activate-waiting').disabled = true;
      return;
    }
    const sup = [];
    if (reg.installing) sup.push('installing');
    if (reg.waiting) sup.push('waiting');
    if (reg.active) sup.push('active');
    elReg.textContent = sup.join(', ') || '–';
    elScript.textContent = reg.active?.scriptURL?.split('/').slice(-1)[0] || 'sw.js';

    // Version vom SW anfragen
    elVer.textContent = '…';
    try {
      const v = await askSW({type:'PING'});
      if (v && v.version) {
        elVer.textContent = v.version;
        elNote.textContent = v.note || '';
      } else {
        elVer.textContent = 'unbekannt';
      }
    } catch {
      elVer.textContent = 'unbekannt';
    }

    $('#btn-activate-waiting').disabled = !reg.waiting;

    // updatefound überwachen
    reg.addEventListener('updatefound', ()=>{
      elReg.textContent = 'installing…';
      const i = reg.installing;
      if (i){
        i.addEventListener('statechange', ()=>{
          elReg.textContent = i.state;
          if (i.state === 'installed'){
            $('#btn-activate-waiting').disabled = !reg.waiting;
          }
        });
      }
    });
  }

  async function onUpdate(){
    const reg = await getReg();
    if (!reg) return;
    try{
      await reg.update();
      toast('Update angestoßen.');
      // Kleines Delay, dann Status ziehen
      setTimeout(refreshSW, 300);
    }catch{
      toast('Update fehlgeschlagen.');
    }
  }

  async function onActivateWaiting(){
    const reg = await getReg();
    if (!reg || !reg.waiting) return;
    try{
      // SW anweisen, sofort zu übernehmen
      reg.waiting.postMessage({type:'SKIP_WAITING'});
      toast('Aktiviere wartende Version…');
      // Nach Controller-Wechsel neu darstellen
      let changed = false;
      navigator.serviceWorker.addEventListener('controllerchange', ()=>{
        if (changed) return;
        changed = true;
        setTimeout(()=>{ location.reload(); }, 150);
      });
    }catch{
      toast('Aktivierung nicht möglich.');
    }
  }

  function hardReload(){
    const u = new URL(location.href);
    u.searchParams.set('nocache', Date.now().toString());
    location.href = u.toString();
  }

  async function unregisterSW(){
    if (!confirm('Service Worker deregistrieren? (Neuladen empfohlen)')) return;
    const reg = await getReg();
    try{
      if (reg) await reg.unregister();
      toast('SW deregistriert.');
      setTimeout(hardReload, 200);
    }catch{
      toast('Fehler beim Deregistrieren.');
    }
  }

  function onSWMessage(ev){
    // Erwartet {type:'PONG', version, note?}
    const d = ev.data || {};
    if (d.type === 'PONG'){
      if (d.version) elVer.textContent = d.version;
      if (d.note) elNote.textContent = d.note;
      setBadge('ok', 'SW aktiv');
    }
  }

  function setBadge(kind, text){
    badge.textContent = text || '';
    badge.classList.remove('ok');
    if (kind === 'ok') badge.classList.add('ok');
  }

  function askSW(msg, timeout=1200){
    return new Promise((resolve,reject)=>{
      if (!navigator.serviceWorker?.controller) return reject(new Error('no-controller'));
      const chan = new MessageChannel();
      const t = setTimeout(()=>{ chan.port1.onmessage=null; reject(new Error('timeout')); }, timeout);
      chan.port1.onmessage = e => { clearTimeout(t); resolve(e.data); };
      navigator.serviceWorker.controller.postMessage(msg, [chan.port2]);
    });
  }

  // ---- Cache & Storage ----
  async function refreshCaches(){
    try{
      const names = await caches.keys();
      elCaches.textContent = names.length ? names.join(', ') : '–';
    }catch{
      elCaches.textContent = '–';
    }
  }

  function refreshLS(){
    try{
      const keys = [];
      for (let i=0;i<localStorage.length;i++){
        keys.push(localStorage.key(i));
      }
      elLS.textContent = keys.length ? keys.join(', ') : '–';
    }catch{
      elLS.textContent = '–';
    }
  }

  async function clearCaches(){
    try{
      const names = await caches.keys();
      await Promise.all(names.map(n=>caches.delete(n)));
      await refreshCaches();
      toast('Caches gelöscht.');
    }catch{
      toast('Cache-Löschung fehlgeschlagen.');
    }
  }

  async function clearLS(){
    try{
      localStorage.removeItem('ss_whitelist');
      localStorage.removeItem('ss_team_whitelist');
      localStorage.removeItem('ss_pro');
      refreshLS();
      toast('localStorage zurückgesetzt.');
    }catch{
      toast('localStorage nicht verfügbar.');
    }
  }

  async function clearAll(){
    if (!confirm('Alle Site-Daten (Caches + LS) löschen?')) return;
    await clearCaches();
    await clearLS();
    toast('Alles gelöscht. Hard-Reload…');
    setTimeout(hardReload, 250);
  }

  // ---- Diagnose ----
  function updateDiag(){
    elOnline.textContent = navigator.onLine ? 'online' : 'offline';
    elLang.textContent = navigator.language || '–';
    elUA.textContent = navigator.userAgent || '–';
    elTime.textContent = new Date().toLocaleString();
  }

  async function pingSW(){
    diagMsg.textContent = 'Pinge SW…';
    try{
      const res = await askSW({type:'PING'});
      if (res && res.type === 'PONG'){
        diagMsg.textContent = `Antwort: PONG (Version ${res.version || '–'})`;
      }else{
        diagMsg.textContent = 'Keine gültige Antwort.';
      }
    }catch(e){
      diagMsg.textContent = 'Kein aktiver Controller.';
    }
  }

  // ---- UI helper ----
  function toast(msg){
    const div = document.createElement('div');
    div.textContent = msg;
    Object.assign(div.style,{
      position:'fixed',left:'50%',bottom:'18px',transform:'translateX(-50%)',
      background:'#101214',color:'#e9e9ea',border:'1px solid #20232b',borderRadius:'10px',
      padding:'8px 12px',zIndex:99999,font:'14px/1.2 system-ui,-apple-system,Segoe UI,Roboto'
    });
    document.body.appendChild(div);
    setTimeout(()=>div.remove(),1600);
  }
})();
