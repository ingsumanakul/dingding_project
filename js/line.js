// Opened inside LINE? Ask LINE to open the page in the phone's real browser
// instead, by adding ?openExternalBrowser=1 (LINE's own switch). The rest of
// the address (other query values and the #hash) stays the same.
// Only LINE: Instagram and Facebook have no such switch, so there the site
// shows the "open in your browser" banner and button instead (js/share.js).
// Loaded first, in <head>, so this happens before the page is drawn.
(function () {
  try {
    if (!/Line\//i.test(navigator.userAgent || '')) return;
    var url = new URL(location.href);
    if (url.searchParams.get('openExternalBrowser') === '1') return;   // already asked once: no loop
    url.searchParams.set('openExternalBrowser', '1');
    location.replace(url.toString());
  } catch (e) {
    // very old browser: just stay in LINE, the banner still helps
  }
})();
