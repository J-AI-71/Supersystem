/* page-tests.js – Testsuite-UI */
document.addEventListener('DOMContentLoaded', () => {
  const $ = s => document.querySelector(s);
  const APP_URL = new URL('app.html', location.origin + '/Supersystem/').toString();

  const tests = [
    {name:'UTM + gclid', url:'https://example.com/?utm_source=newsletter&utm_medium=email&utm_campaign=launch&gclid=TEST123'},
    {name:'Google /url → Ziel', url:'https://www.google.com/url?q=https%3A%2F%2Fexample.com%2Fpage%3Futm_source%3Dgoogle&sa=D&source=hangouts&ust=158'},
    {name:'Facebook linker → Ziel', url:'https://l.facebook.com/l.php?u=https%3A%2F%2Fexample.org%2F%3Ffbclid%3DXYZ&h=AT0'},
    {name:'Reddit outbound', url:'https://out.reddit.com/t3_abc?url=https%3A%2F%2Fexample.net%2F%3Fref%3Dtwitter&token=123'},
    {name:'Generic redirect param', url:'https://tracker.example/redirect?target=https%3A%2F%2Fexample.com%2F%3Fspm%3Dabc123'},
    {name:'Amazon Beispiel', url:'https://www.amazon.de/dp/B0C1234567?tag=affde-21&utm_source=newsletter&ref_=abc123'},
    {name:'Schon sauber', url:'https://example.com/path?foo=bar'},
    {name:'Kurz-URL (ohne Ziel)', url:'https://bit.ly/3abcxyz'}
  ];

  const ncBtn = document.querySelector('[onclick*="nocache"]') || $('#btnNc');
  const openAppBtn = document.querySelector('[href="app.html"]') || $('#btnApp');
  const oneIn = $('#oneIn'), oneOut = $('#oneOut'), oneRep = $('#oneRep');
  const oneCleanBtn = document.querySelector('[onclick*="oneClean"]') || $('#btnOneClean');
  const oneOpenBtn  = document.querySelector('[onclick*="openInApp"]') || $('#btnOneOpen');

  if (ncBtn) ncBtn.addEventListener('click', reloadNoCache);
  if (openAppBtn) openAppBtn.addEventListener('click', () => {});
  $('#ncInfo') && ($('#ncInfo').textContent = 'URL: ' + location.href);
  if (oneCleanBtn) oneCleanBtn.addEventListener('click', () => {
    const res = Cleaner.cleanUrl(oneIn.value);
    oneOut.value = res.url; oneRep.innerHTML = renderReport(res);
  });
  if (oneOpenBtn) oneOpenBtn.addEventListener('click', () => {
    if (!oneIn.value.trim()) return;
    openUrl(APP_URL + '?url=' + encodeURIComponent(oneIn.value.trim()));
  });

  // Tabelle
  const TBody = $('#testsBody');
  if (TBody) {
    tests.forEach((t, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${i+1}</td>
        <td>${Cleaner.escapeHtml(t.name)}</td>
        <td class="mono"><input id="u${i}" type="text" value="${Cleaner.escapeHtml(t.url).replace(/"/g,'&quot;')}" style="width:100%"></td>
        <td class="small">
          <div class="row">
            <button class="btn" data-act="clean" data-i="${i}">Säubern (lokal)</button>
            <button class="btn ok" data-act="open" data-i="${i}">In App öffnen</button>
            <button class="btn" data-act="copy-in" data-i="${i}">Input kopieren</button>
            <button class="btn" data-act="copy-out" data-i="${i}">Output kopieren</button>
          </div>
          <div id="r${i}" class="mut mono" style="margin-top:6px">–</div>
        </td>`;
      TBody.appendChild(tr);
    });
    TBody.addEventListener('click', async (e) => {
      const b = e.target.closest('button[data-act]'); if (!b) return;
      const i = +b.dataset.i; const act = b.dataset.act;
      const inp = document.getElementById('u'+i);
      const rep = document.getElementById('r'+i);
      if (act === 'clean') {
        const res = Cleaner.cleanUrl(inp.value);
        rep.innerHTML = `<div>Output: <code>${Cleaner.escapeHtml(res.url)}</code></div>${renderReport(res)}`;
        inp.setAttribute('data-out', res.url);
      } else if (act === 'open') {
        openUrl(APP_URL + '?url=' + encodeURIComponent(inp.value));
      } else if (act === 'copy-in') {
        try{ await navigator.clipboard.writeText(inp.value); }catch{}
      } else if (act === 'copy-out') {
        const v = inp.getAttribute('data-out') || '';
        if (v) try{ await navigator.clipboard.writeText(v); }catch{}
      }
    });
  }

  function renderReport(res){
    const rm = res.removed.length ? res.removed.map(k=>`<span class="pill">${Cleaner.escapeHtml(k)}</span>`).join(' ') : '–';
    const kp = res.kept.length ? res.kept.map(k=>`<span class="pill">${Cleaner.escapeHtml(k)}</span>`).join(' ') : '–';
    const uw = res.unwrapped ? `<div>Redirect: <code>${Cleaner.escapeHtml(res.unwrapped.from)}</code> → <code>${Cleaner.escapeHtml(res.unwrapped.to)}</code></div>` : '';
    const nm = res.normalized || '–';
    return `<div>Entfernt: ${rm}</div><div>Behalten: ${kp}</div>${uw}<div>Normalisierung: ${Cleaner.escapeHtml(nm)}</div>`;
  }
  function reloadNoCache(){
    const ts = new Date().toISOString().replace(/[:.]/g,'-');
    location.href = location.pathname + '?nocache=' + ts;
  }
  function openUrl(u){ try{ window.open(u,'_blank','noopener,noreferrer'); }catch{ location.href = u; } }
});
