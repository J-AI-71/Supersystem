(function(){
  'use strict';
  const here = location.origin;
  function harden(a){
    try{
      const u = new URL(a.href, location.href);
      if (u.origin === here) return; // intern
      const rel = new Set((a.getAttribute('rel')||'').split(/\s+/).filter(Boolean));
      rel.add('noopener'); rel.add('noreferrer'); rel.add('external');
      a.setAttribute('rel', Array.from(rel).join(' '));
      if (!a.getAttribute('referrerpolicy')) a.setAttribute('referrerpolicy','no-referrer');
    }catch{}
  }
  function run(){ document.querySelectorAll('a[href]').forEach(harden); }
  if (document.readyState !== 'loading') run();
  else document.addEventListener('DOMContentLoaded', run);
})();
