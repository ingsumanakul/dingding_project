// App start: language, hash navigation, data loading.
var PAGES = ['home', 'collection', 'gacha', 'quiz', 'about'];
var DATA = [];

function currentPage() {
  var name = location.hash.replace('#', '');
  return PAGES.indexOf(name) !== -1 ? name : 'home';
}

function showPage() {
  var name = currentPage();
  Bug.notePage(name);                            // remembers the page before About
  document.body.setAttribute('data-page', name); // lets the CSS style each page
  var dialog = document.getElementById('detail');
  if (dialog.open) dialog.close();
  document.querySelectorAll('.page').forEach(function (el) {
    el.hidden = el.getAttribute('data-page') !== name;
  });
  document.querySelectorAll('.site-nav a').forEach(function (a) {
    if (a.getAttribute('href') === '#' + name) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  window.scrollTo(0, 0);

  // The blinking Ding Ding on Home and About (video/ding-normal.mp4 / .webm).
  // If the video can't play, the still picture stays.
  var cats = { home: 'home-cat', about: 'about-cat' };
  Object.keys(cats).forEach(function (page) {
    var img = document.getElementById(cats[page]);
    if (page === name) Motion.play(img, { id: 'ding-normal' });
    else Motion.stop(img);
  });

  if (!DATA.length) return;
  if (name === 'home') renderHomeHints();
  // Opening or leaving the Quiz always starts it over at the start screen
  // (the last result stays one tap away: "See my last result").
  Quiz.reset();
  // Coming back to the Gacha always starts at the machine.
  if (name === 'gacha') Gacha.showMachine();
  // "See in Collection" from the Gacha: open that Ding Ding's popup.
  if (name === 'collection' && Collection.pendingOpen) {
    var id = Collection.pendingOpen;
    Collection.pendingOpen = null;
    var item = DATA.filter(function (it) { return it.id === id; })[0];
    if (item) Collection.openDetail(item);
  }
}

// Home: the small hints under the entrances.
function renderHomeHints() {
  if (!DATA.length) return;
  // the Secret is only counted once it is found (67 → 68)
  var t = Collection.totals();
  document.getElementById('home-hint-collection').textContent =
    I18n.t('home.hintCollection', { n: t.n, total: t.total });
}

function rerenderText() {
  I18n.apply();
  if (DATA.length) {
    Collection.render();
    Gacha.renderText();
    Quiz.render();
    renderHomeHints();
  }
}

// "Open in Chrome to save" (js/share.js) opens this page with a handoff in the
// query: ?go=quiz&r=039&lang=th, or ?go=cert&p=<name>&d=YYYY-MM-DD&lang=th.
// The query is read once, then removed from the address bar.
var HANDOFF = (function () {
  try {
    var q = new URLSearchParams(location.search);
    if (!q.get('go')) return null;
    if (LANGS.indexOf(q.get('lang')) !== -1) Store.set(KEYS.lang, q.get('lang'));
    var page = q.get('go') === 'cert' ? 'collection' : 'quiz';
    history.replaceState(null, '', location.pathname + '#' + page);
    return { go: q.get('go'), r: q.get('r'), p: (q.get('p') || '').slice(0, 24), d: q.get('d') };
  } catch (e) {
    return null;
  }
})();

// Show the card from the handoff, once the data is loaded.
function openHandoff() {
  if (!HANDOFF) return;
  var h = HANDOFF;
  HANDOFF = null;
  if (h.go === 'quiz' && DATA.some(function (it) { return it.id === h.r && it.rarity !== 'secret'; })) {
    Store.set(KEYS.quiz, h.r);
    Quiz.showLast();
  } else if (h.go === 'cert' && /^\d{4}-\d{2}-\d{2}$/.test(h.d || '')) {
    Reward.openFromHandoff(h.p, h.d);
  }
}

document.addEventListener('DOMContentLoaded', function () {
  I18n.init();
  I18n.apply();
  Bug.init();
  Share.init();

  document.querySelectorAll('.lang-toggle button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      I18n.setLang(btn.getAttribute('data-lang'));
      rerenderText();
    });
  });

  window.addEventListener('hashchange', showPage);
  showPage();

  fetch('data/dingding.json')
    .then(function (res) { return res.json(); })
    .then(function (items) {
      DATA = I18n.glueThai(items);
      Collection.init(items);
      Gacha.init(items);
      Reward.init(items);
      Collection.render();
      renderHomeHints();
      // The quiz questions are a separate file; the rest of the site works without it.
      return fetch('data/quiz.json')
        .then(function (res) { return res.json(); })
        .then(function (quiz) { Quiz.init(items, I18n.glueThai(quiz)); openHandoff(); });
    })
    .catch(function (err) {
      console.error('Could not load the data files', err);
    });
});
