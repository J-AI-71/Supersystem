// /Supersystem/js/bulk-clean.js
(function(){
  'use strict';
  const C = (window.SafeShare && window.SafeShare.core) || null;
  if(!C) return;

  // Pro-Badge
  (function(){
    const b=document.getElementById('proBadge');
    if(b) b.textContent = C.isPro() ? 'aktiv' : 'nicht aktiv';
    if(!C.isPro()){ const h=document.getElementById('proHint'); if(h) h.style.display='block'; }
  })();

  const $in   = document.getElementById('in');
  const $out  = document.getElementById('out');
  const $run  = document.getElementById('run');
  const $copy = document.getElementById('copy');
  const $clear= document.getElementById('clear');
  const $stats= document.getElementById('stats');
  const $optUnwrap    = document.getElementById('optUnwrap');
  const $optNormalize = document.getElementById('optNormalize');

  $run.addEventListener('click', ()=>{
    const lines = ($in.value||'').split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
    if(!lines.length){ $out.textContent=''; $stats.textContent=''; return; }
    const out = [];
    for(const raw of lines){
      let v = C.normalizeSeed(raw);
      if($optUnwrap?.checked) v = C.unwrap(v);
      v = C.clean(v, {normalize: !!$optNormalize?.checked});
      out.push(v);
    }
    $out.textContent = out.join('\n');
    $stats.textContent = `${lines.length} Eingaben → ${out.length} Ausgaben`;
  });

  $copy.addEventListener('click', async ()=>{
    const txt=$out.textContent||''; if(!txt.trim()) return;
    try{ await navigator.clipboard.writeText(txt); }
    catch{
      try{
        const ta=document.createElement('textarea');
        ta.value=txt; ta.style.position='fixed'; ta.style.opacity='0';
        document.body.appendChild(ta); ta.focus(); ta.select();
        const ok=document.execCommand('copy'); document.body.removeChild(ta);
        if(!ok) throw 0;
      }catch{ prompt('Ausgabe kopieren:', txt); }
    }
  });

  $clear.addEventListener('click', ()=>{ $in.value=''; $out.textContent=''; $stats.textContent=''; });
})();
