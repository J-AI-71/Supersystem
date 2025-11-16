(function(){
  'use strict';
  const NS = (window.SafeShare = window.SafeShare || {});
  const KEY = 'ss_stats_v1';
  const todayKey = () => new Date().toISOString().slice(0,10); // YYYY-MM-DD (UTC)

  function load(){ try{ return JSON.parse(localStorage.getItem(KEY)||'{}'); }catch{ return {}; } }
  function save(x){ try{ localStorage.setItem(KEY, JSON.stringify(x)); }catch{} }

  function get(){
    const s = load(), d = todayKey();
    return {
      today: (s.days&&s.days[d]) || {clean:0},
      total: s.total || {clean:0}
    };
  }

  function bumpClean(){
    const s = load(), d = todayKey();
    s.days = s.days || {}; s.days[d] = s.days[d] || {clean:0}; s.days[d].clean++;
    s.total = s.total || {clean:0}; s.total.clean++;
    save(s);
  }

  function renderLine(el){
    if(!el) return;
    const {today,total} = get();
    el.textContent = `Heute gesäubert: ${today.clean||0} · Gesamt: ${total.clean||0}`;
  }

  NS.telemetry = { get, bumpClean, renderLine };
})();
