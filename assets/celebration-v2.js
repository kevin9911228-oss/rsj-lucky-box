/* RSJ_CELEBRATION_V2 compatibility loader -> V3 glyph-free runtime */
(function(){
  if(window.__RSJ_V3_LOADER__)return;
  window.__RSJ_V3_LOADER__=true;
  if(!document.querySelector('link[data-rsj-vector-hotfix]')){
    const l=document.createElement('link');
    l.rel='stylesheet';
    l.href='/assets/celebration-v2-hotfix.css?v=20260809-v4';
    l.dataset.rsjVectorHotfix='1';
    document.head.appendChild(l);
  }
  const s=document.createElement('script');
  s.src='/assets/celebration-v3.js?v=20260809-v4';
  s.async=false;
  document.body.appendChild(s);
})();
