// App start: language, hash navigation, data loading.
var PAGES = ['home', 'collection', 'gacha', 'quiz', 'about'];
var DATA = [];

function currentPage() {
  var name = location.hash.replace('#', '');
  return PAGES.indexOf(name) !== -1 ? name : 'home';
}

function showPage() {
  var name = currentPage();
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
  // The quiz button depends on what is unlocked, so refresh it.
  if (name === 'quiz') Quiz.render();
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
  var have = Collection.unlockedIds();
  var n = DATA.filter(function (it) { return have.indexOf(it.id) !== -1; }).length;
  document.getElementById('home-hint-collection').textContent =
    I18n.t('home.hintCollection', { n: n, total: DATA.length });
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

document.addEventListener('DOMContentLoaded', function () {
  I18n.init();
  I18n.apply();

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
      DATA = items;
      Collection.init(items);
      Gacha.init(items);
      renderHomeHints();
      // The quiz questions are a separate file; the rest of the site works without it.
      return fetch('data/quiz.json')
        .then(function (res) { return res.json(); })
        .then(function (quiz) { Quiz.init(items, quiz); });
    })
    .catch(function (err) {
      console.error('Could not load the data files', err);
    });
});
