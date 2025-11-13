// /Supersystem/js/bookmarklets.js
(function(){
  const BASE = 'https://j-ai-71.github.io/Supersystem/';

  function makeCleanCurrent(){
    // Leitet die aktuelle Seite durch den SafeShare-Wrapper
    const target = BASE + 'redirect-entschachteln.html?u=';
    return 'javascript:(()=>{try{const u=location.href;location.href="'+target+'"+encodeURIComponent(u)}catch(e){alert("Fehler: "+e)}})()';
  }

  const BOOKMARKLETS = [
    {
      id:'clean',
      name:'SafeShare – Clean',
      desc:'Aktuelle Seite sofort sauber öffnen (UTM/gclid/fbclid entfernen, Redirects entschnüren).',
      code: makeCleanCurrent()
    }
    // Platz für weitere Bookmarklets
  ];

  function el(tag,attrs={},text){
    const n=document.createElement(tag);
    Object.entries(attrs).forEach(([k,v])=>{ if(k==='class') n.className=v; else n.setAttribute(k,v); });
    if(text!=null) n.textContent=text;
    return n;
  }

  function copyNameAndCode(name, code, btn){
    const payload = `${name}\n${code}`;
    (async()=>{
      try{
        await navigator.clipboard.writeText(payload);
        if(btn){ const t=btn.textContent; btn.textContent='Kopiert'; setTimeout(()=>btn.textContent=t,1200); }
      }catch{
        prompt('Name + Code (erste Zeile = Name, zweite Zeile = Code):', payload);
      }
    })();
  }

  function renderItem(bm){
    const wrap=el('div',{class:'row',style:'align-items:center;gap:8px;margin:8px 0;flex-wrap:wrap'});
    const a=el('a',{href:bm.code,draggable:'true',class:'bm'},bm.name);
    const input=el('input',{type:'text',class:'code',value:bm.code,readonly:'readonly'});
    const btn=el('button',{},'Name+Code kopieren');
    btn.onclick=()=>copyNameAndCode(bm.name,bm.code,btn);
    const p=el('p',{},bm.desc); p.className='mut'; p.style.margin='4px 0 0';
    const col=el('div',{style:'flex:1;min-width:280px'});
    col.appendChild(input); col.appendChild(p);
    wrap.appendChild(a); wrap.appendChild(col); wrap.appendChild(btn);
    return wrap;
  }

  // Index: ein kompakter Block
  function renderBookmarkletsIndex(targetId){
    const root=document.getElementById(targetId);
    if(!root) return;
    root.innerHTML='';
    root.appendChild(renderItem(BOOKMARKLETS[0]));
  }

  // Volle Seite: Liste
  function renderBookmarkletsPage(targetId){
    const root=document.getElementById(targetId);
    if(!root) return;
    root.innerHTML='';
    BOOKMARKLETS.forEach(b=> root.appendChild(renderItem(b)));
  }

  // Public API
  window.renderBookmarkletsIndex = renderBookmarkletsIndex;
  window.renderBookmarkletsPage  = renderBookmarkletsPage;
})();
