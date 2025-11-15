// /Supersystem/js/core.js
(function(){
  'use strict';
  const NS = (window.SafeShare = window.SafeShare || {});
  const T = new Set(["utm_source","utm_medium","utm_campaign","utm_term","utm_content","utm_id","gclid","fbclid","msclkid","yclid","mc_cid","mc_eid","_hsenc","_hsmi","igshid","si","spm"]);
  const UNWRAP_KEYS = ['url','u','link','q','target','to','dest'];

  function isPro(){ return localStorage.getItem('ss2_pro')==='1'; }
  function setPro(on){ on ? localStorage.setItem('ss2_pro','1') : localStorage.removeItem('ss2_pro'); }
  function getFlags(){
    const publisher = localStorage.getItem('ss_mode')==='publisher';
    const wl = new Set((localStorage.getItem('ss_wl')||'').split(',').map(s=>s.trim()).filter(Boolean));
    return {publisher, wl};
  }
  function normalizeSeed(vRaw){
    let v=(vRaw||'').trim(); if(!v) return '';
    try{ for(let i=0;i<3;i++) v=decodeURIComponent(v); }catch{}
    if(!/^[a-zA-Z][a-zA-Z0-9+\-.]*:/.test(v)) v='https://'+v.replace(/^\/+/, '');
    return v;
  }
  function unwrap(u, max=5){
    try{
      let s=u, loops=0;
      while(loops++<max){
        const url=new URL(s), p=url.searchParams;
        let key=null,val=null;
        for(const k of UNWRAP_KEYS){ if(p.has(k)){ key=k; val=p.get(k); break; } }
        if(!key) return s;
        try{ for(let i=0;i<3;i++) val=decodeURIComponent(val); }catch{}
        if(!/^[a-zA-Z][a-zA-Z0-9+\-.]*:/.test(val)) val='https://'+val.replace(/^\/+/, '');
        s=val;
      }
      return s;
    }catch{ return u; }
  }
  function unwrapWithLog(u, max=5){
    const steps=[];
    try{
      let s=u, loops=0;
      while(loops++<max){
        const url=new URL(s), p=url.searchParams;
        let key=null,val=null;
        for(const k of UNWRAP_KEYS){ if(p.has(k)){ key=k; val=p.get(k); break; } }
        if(!key) return {url:s, steps};
        steps.push(`Entschachtelt: „${key}=“ gefunden`);
        try{ for(let i=0;i<3;i++) val=decodeURIComponent(val); }catch{}
        if(!/^[a-zA-Z][a-zA-Z0-9+\-.]*:/.test(val)) val='https://'+val.replace(/^\/+/, '');
        s=val;
      }
      steps.push('Maximalgrenze erreicht');
      return {url:s, steps};
    }catch{ return {url:u, steps}; }
  }
  function clean(u, opts={normalize:true}){
    try{
      const x=new URL(u); const {publisher, wl}=getFlags();
      if(/amazon\./.test(x.hostname)){
        ["tag","ascsubtag","ref","pf_rd_r","pf_rd_p"].forEach(k=>{
          if(!(publisher && wl.has(k))) x.searchParams.delete(k);
        });
        if(x.hash && !(publisher && wl.has('#'))) x.hash="";
      }
      for(const k of [...x.searchParams.keys()]){
        const isTracker = k.startsWith('utm_') || T.has(k);
        if(isTracker && !(publisher && wl.has(k))) x.searchParams.delete(k);
      }
      if(opts.normalize){
        x.pathname=x.pathname.replace(/\/{2,}/g,'/');
        if(x.pathname!=="/" && x.pathname.endsWith("/")) x.pathname=x.pathname.slice(0,-1);
      }
      return x.toString();
    }catch{ return u; }
  }
  function cleanWithLog(u, opts={normalize:true}){
    const notes=[], removed=[], kept=[]; let hashDropped=false, pathNorm=false;
    const {publisher, wl}=getFlags();
    try{
      const x=new URL(u);
      if(/amazon\./.test(x.hostname)){
        ["tag","ascsubtag","ref","pf_rd_r","pf_rd_p"].forEach(k=>{
          if(publisher && wl.has(k)){ if(x.searchParams.has(k)) kept.push(k); }
          else if(x.searchParams.has(k)){ removed.push(k); x.searchParams.delete(k); }
        });
        if(x.hash && !(publisher && wl.has('#'))){ hashDropped=true; x.hash=""; }
      }
      for(const k of [...x.searchParams.keys()]){
        const isTracker = k.startsWith('utm_') || T.has(k);
        if(isTracker){
          if(publisher && wl.has(k)) kept.push(k);
          else { removed.push(k); x.searchParams.delete(k); }
        }
      }
      const before=x.pathname;
      if(opts.normalize){
        x.pathname=x.pathname.replace(/\/{2,}/g,'/');
        if(x.pathname!=="/" && x.pathname.endsWith("/")) x.pathname=x.pathname.slice(0,-1);
      }
      if(x.pathname!==before) pathNorm=true;

      if(removed.length) notes.push(`Entfernt: ${removed.join(', ')}`);
      if(kept.length)    notes.push(`Behalten (Whitelist): ${kept.join(', ')}`);
      if(hashDropped)    notes.push('Hash entfernt (Amazon).');
      if(pathNorm)       notes.push('Pfad normalisiert.');

      return {url:x.toString(), notes};
    }catch{
      return {url:u, notes:['Konnte nicht geparst werden – unverändert']};
    }
  }

  NS.core = { isPro, setPro, getFlags, normalizeSeed, unwrap, unwrapWithLog, clean, cleanWithLog };
})();
