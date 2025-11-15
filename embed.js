// /Supersystem/embed.js
// Nutzung auf fremden Seiten: <script src="https://j-ai-71.github.io/Supersystem/embed.js" defer></script>
// <a href="https://example.com/?utm_source=x" data-clean-copy>Sauber kopieren</a>
// Optional: data-action="copy" (nur kopieren)
(function(){
  'use strict';
  function norm(u){ try{ for(let i=0;i<3;i++) u=decodeURIComponent(u); }catch{} if(!/^[a-zA-Z][a-zA-Z0-9+\-.]*:/.test(u)) u='https://'+u.replace(/^\/+/, ''); return u; }
  function unwrap(u){
    try{
      let s=u, loops=0;
      while(loops++<5){
        const url=new URL(s), p=url.searchParams;
        const keys=['url','u','link','q','target','to','dest'];
        let key=null,val=null; for(const k of keys){ if(p.has(k)){ key=k; val=p.get(k); break; } }
        if(!key) return s;
        try{ for(let i=0;i<3;i++) val=decodeURIComponent(val); }catch{}
        if(!/^[a-zA-Z][a-zA-Z0-9+\-.]*:/.test(val)) val='https://'+val.replace(/^\/+/, '');
        s=val;
      }
      return s;
    }catch{ return u; }
  }
  function clean(u){
    try{
      const x=new URL(u);
      const T=new Set(["utm_source","utm_medium","utm_campaign","utm_term","utm_content","utm_id","gclid","fbclid","msclkid","yclid","mc_cid","mc_eid","_hsenc","_hsmi","igshid","si","spm"]);
      if(/amazon\./.test(x.hostname)){
        ["tag","ascsubtag","ref","pf_rd_r","pf_rd_p"].forEach(k=>x.searchParams.delete(k));
        x.hash="";
      }
      for(const k of [...x.searchParams.keys()]){
        const isT=k.startsWith('utm_')||T.has(k);
        if(isT) x.searchParams.delete(k);
      }
      x.pathname=x.pathname.replace(/\/{2,}/g,'/');
      if(x.pathname!=="/" && x.pathname.endsWith("/")) x.pathname=x.pathname.slice(0,-1);
      return x.toString();
    }catch{ return u; }
  }
  function onClick(e){
    const a = e.currentTarget;
    let href = a.getAttribute('href') || '';
    if(!href) return;
    href = clean(unwrap(norm(href)));
    const act = a.getAttribute('data-action');
    if(act==='copy'){
      e.preventDefault();
      (async()=>{ try{ await navigator.clipboard.writeText(href); a.textContent='Kopiert'; setTimeout(()=>a.textContent='Sauber kopieren',1200); }catch{} })();
      return;
    }
    a.setAttribute('href', href); // säubern vor Navigation
  }
  function init(){
    document.querySelectorAll('a[data-clean-copy]').forEach(a=>{
      a.addEventListener('click', onClick, {capture:true});
      if(!a.textContent.trim()) a.textContent = 'Sauber kopieren';
    });
  }
  if(document.readyState!=='loading') init(); else document.addEventListener('DOMContentLoaded', init);
})();
