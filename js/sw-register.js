// Einmal zentriert für alle Seiten nutzen
(function(){
  const VER = '2025-11-13-12'; // <— nur hier anheben
  if ('serviceWorker' in navigator){
    navigator.serviceWorker.register('./sw.js?v='+VER);
  }
})();
