// /Supersystem/js/app.js
(function(){
  'use strict';
  const C = (window.SafeShare && window.SafeShare.core) || null;
  if(!C) return;

  const $in   = document.getElementById('in');
  const $out  = document.getElementById('out');
  const $logB = document.getElementById('logBox');
  const $log  = document.getElementById('log');
  const $stats= document.getElementById('statsLine');

  // Pro-Status
  (function(){
    const el = document.getElementById('pro-state'); if(!el) return;
    el.innerHTML = C.isPro() ? 'Pro: aktiv' : 'Pro: nicht aktiv · <a class="mut" href="pro.html">freischalten</a>';
  })();

  // Telemetry initial render
  (function(){
    if (window.SafeShare && SafeShare.telemetry && $stats) {
      SafeShare.telemetry.renderLine($stats);
    }
  })();

  function runClean(vRaw){
    const seed = C.normalizeSeed(vRaw||''); if(!seed) return null;
    const un = C.unwrapWithLog(seed);
    const cl = C.cleanWithLog(un.url);

    $out.value = cl.url;

    const lines=[];
    if(un.steps.length) lines.push('Entschachtelung: '+un.steps.join(' → '));
    if(cl.notes.length) lines.push(...cl.notes);
    if(!lines.length)   lines.push('Keine Änderungen notwendig.');
    $log.innerHTML = '<ul style="margin:.2rem 0 0 18px">'+lines.map(x=>`<li>${x.replace(/&/g,'&amp;')}</li>`).join('')+'</ul>';
    $logB.style.display='block';

    // Telemetry bump
    if (window.SafeShare && SafeShare.telemetry) {
      SafeShare.telemetry.bumpClean();
      if ($stats) SafeShare.telemetry.renderLine($stats);
    }

    return cl.url;
  }

  document.getElementById('cleanOpen').addEventListener('click', ()=>{
    const url = runClean($in.value); if(url) location.href=url;
  });

  document.getElementById('copy').addEventListener('click', async ()=>{
    const url = runClean($in.value) || ($in.value||'').trim(); if(!url) return;
    try{ await navigator.clipboard.writeText(url); }
    catch{
      try{
        const ta=document.createElement('textarea');
        ta.value=url; ta.style.position='fixed'; ta.style.opacity='0';
        document.body.appendChild(ta); ta.focus(); ta.select();
        const ok=document.execCommand('copy'); document.body.removeChild(ta);
        if(!ok) throw 0;
      }catch{ prompt('Link kopieren:', url); }
    }
  });

  document.getElementById('share').addEventListener('click', async ()=>{
    const url = runClean($in.value) || ($in.value||'').trim(); if(!url) return;
    if(navigator.share){ try{ await navigator.share({title:'Sauberer Link', url}); return; }catch{} }
    try{ await navigator.clipboard.writeText(url); alert('Link in der Zwischenablage.'); }
    catch{ prompt('Link kopieren:', url); }
  });

  document.getElementById('inspect').addEventListener('click', (e)=>{
    e.preventDefault();
    const vRaw = ($in.value||'').trim(); if(!vRaw) return;
    const href = 'redirect-entschachteln.html?wait=1&details=1&u=' + encodeURIComponent(vRaw);
    window.open(href, '_blank', 'noopener');
  });

  $in.addEventListener('keydown', (e)=>{
    if(e.key==='Enter'){ e.preventDefault(); const url = runClean($in.value); if(url) location.href=url; }
  });
})();
