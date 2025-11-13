// v2025-11-13-02 – zentrale Bookmarklet-Quelle
(function(){
  const ROOT = new URL((document.querySelector('base')?.getAttribute('href')||'/'), location.origin).href;
  const BM = [
    {
      title: "Clean & Open (über SafeShare)",
      href: "javascript:location.href='"+ROOT+"redirect-entschachteln.html?u='+encodeURIComponent(location.href)"
    },
    {
      title: "Clean & Stay",
      href: "javascript:(function(){try{var u=new URL(location.href),t=['utm_source','utm_medium','utm_campaign','utm_term','utm_content','utm_id','gclid','fbclid','msclkid','yclid','mc_cid','mc_eid','_hsenc','_hsmi','igshid','si','spm'];if(/amazon\\./.test(u.hostname)){['tag','ascsubtag','ref','pf_rd_r','pf_rd_p'].forEach(function(k){u.searchParams.delete(k)});u.hash=''};u.searchParams.forEach(function(_,k){if(/^utm_/.test(k)||t.indexOf(k)>-1)u.searchParams.delete(k)});u.pathname=u.pathname.replace(/\\/{2,}/g,'/');if(u.pathname!=='/'&&u.pathname.endsWith('/'))u.pathname=u.pathname.slice(0,-1);location.href=u.toString()}catch(e){}})();"
    },
    {
      title: "Clean & Copy",
      href: "javascript:(function(){try{var u=new URL(location.href),t=['utm_source','utm_medium','utm_campaign','utm_term','utm_content','utm_id','gclid','fbclid','msclkid','yclid','mc_cid','mc_eid','_hsenc','_hsmi','igshid','si','spm'];if(/amazon\\./.test(u.hostname)){['tag','ascsubtag','ref','pf_rd_r','pf_rd_p'].forEach(function(k){u.searchParams.delete(k)});u.hash=''};u.searchParams.forEach(function(_,k){if(/^utm_/.test(k)||t.indexOf(k)>-1)u.searchParams.delete(k)});u.pathname=u.pathname.replace(/\\/{2,}/g,'/');if(u.pathname!=='/'&&u.pathname.endsWith('/'))u.pathname=u.pathname.slice(0,-1);var s=u.toString()}catch(e){var s=location.href}try{navigator.clipboard&&navigator.clipboard.writeText(s)}catch(_){ }prompt('Clean URL:',s)})();"
    }
  ];

  function mkEl(tag, attrs={}, text){ const el=document.createElement(tag); Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v)); if(text) el.appendChild(document.createTextNode(text)); return el; }
  async function copy(txt, btn){ try{ await navigator.clipboard.writeText(txt); btn.textContent='Kopiert'; }catch{ /* Fallback UI handled by input selection outside */ } setTimeout(()=>btn.textContent='Kopieren',1200); }

  // Für Index: nur erstes Bookmarklet + Kopierfeld
  window.renderBookmarkletsIndex = function(containerId){
    const root=document.getElementById(containerId); if(!root) return;
    const b=BM[0];
    const row=mkEl('div', {class:'row'});
    const a =mkEl('a', {class:'bm', href:b.href}, 'SafeShare Clean & Open');
    const inp=mkEl('input', {class:'code', readonly:''}); inp.value=b.href;
    const btn=mkEl('button', {class:'btn alt', type:'button'}, 'Kopieren');
    btn.addEventListener('click', ()=>{ inp.select(); document.execCommand('copy'); btn.textContent='Kopiert'; setTimeout(()=>btn.textContent='Kopieren',1200); copy(inp.value, btn); });
    row.append(a, inp, btn);
    root.append(row);
  };

  // Für bookmarklets.html: alle drei + Kopierfelder
  window.renderBookmarkletsPage = function(containerId){
    const root=document.getElementById(containerId); if(!root) return;
    BM.forEach((b, i)=>{
      const card=mkEl('div', {class:'card'});
      card.append(mkEl('h3', {style:'margin:0 0 8px'}, (i+1)+') '+b.title));
      const a=mkEl('a', {class:'bm', href:b.href}, b.title);
      const row=mkEl('div', {class:'row'});
      const inp=mkEl('input', {class:'code', readonly:''}); inp.value=b.href;
      const btn=mkEl('button', {class:'copy'}, 'Kopieren');
      btn.addEventListener('click', ()=>{ inp.select(); document.execCommand('copy'); btn.textContent='Kopiert'; setTimeout(()=>btn.textContent='Kopieren',1200); copy(inp.value, btn); });
      row.append(inp, btn);
      card.append(a, row);
      root.append(card);
    });
  };
})();
