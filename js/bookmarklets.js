// /Supersystem/js/bookmarklets.js
(function(){
  'use strict';

  // Basis der Live-Seite
  const BASE = 'https://j-ai-71.github.io/Supersystem/';

  // Bookmarklet-Code: aktuelle Seite durch SafeShare-Redirect schicken
  function makeCleanCurrent(){
    const target = BASE + 'redirect-entschachteln.html?u=';
    return 'javascript:(()=>{try{const u=location.href;location.href="'+target+'"+encodeURIComponent(u)}catch(e){alert("Fehler: "+e)}})()';
  }

  // Liste der Bookmarklets
  const BOOKMARKLETS = [
    {
      id: 'clean',
      name: 'SafeShare clean',
      desc: 'Aktuelle Seite sauber öffnen (UTM/gclid/fbclid entfernen, Redirects entschnüren).',
      code: makeCleanCurrent()
    }
    // weitere Bookmarklets können hier ergänzt werden
  ];

  // Hilfsfunktionen
  function el(tag, attrs={}, text){
    const n = document.createElement(tag);
    for (const [k,v] of Object.entries(attrs)){
      if (k === 'class') n.className = v; else n.setAttribute(k, v);
    }
    if (text != null) n.textContent = text;
    return n;
  }

  async function copyNameAndCode(name, code, btn){
    const payload = `${name}\n${code}`;
    try{
      await navigator.clipboard.writeText(payload);
      if (btn){ const t=btn.textContent; btn.textContent='Kopiert'; setTimeout(()=>btn.textContent=t,1200); }
    }catch{
      prompt('Name + Code (1. Zeile = Name, 2. Zeile = Code):', payload);
    }
  }

  function renderItem(bm){
    const row = el('div', {class:'row', style:'align-items:center;gap:8px;margin:8px 0;flex-wrap:wrap'});
    // Ziehen übernimmt den Linktext als Lesezeichen-Namen (Desktop)
    const a = el('a', {href: bm.code, draggable:'true', class:'bm'}, bm.name);
    const input = el('input', {type:'text', class:'code', value: bm.code, readonly:'readonly'});
    const btn = el('button', {}, 'Name+Code kopieren'); // für iOS (Name+URL getrennt)
    btn.onclick = ()=>copyNameAndCode(bm.name, bm.code, btn);
    const p = el('p', {class:'mut', style:'margin:4px 0 0'}, bm.desc);

    const col = el('div', {style:'flex:1;min-width:280px'});
    col.appendChild(input);
    col.appendChild(p);

    row.appendChild(a);
    row.appendChild(col);
    row.appendChild(btn);
    return row;
  }

  // Kompakter Block (Startseite)
  window.renderBookmarkletsIndex = function(targetId){
    const root = document.getElementById(targetId);
    if (!root) return;
    root.innerHTML = '';
    root.appendChild(renderItem(BOOKMARKLETS[0]));
  };

  // Volle Liste (Bookmarklets-Seite)
  window.renderBookmarkletsPage = function(targetId){
    const root = document.getElementById(targetId);
    if (!root) return;
    root.innerHTML = '';
    BOOKMARKLETS.forEach(b => root.appendChild(renderItem(b)));
  };
})();
