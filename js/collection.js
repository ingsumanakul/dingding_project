// Collection page: progress, category filter, tile grid, detail popup.
var CATEGORIES = ['food', 'music', 'outfit', 'seasonal', 'spooky', 'love', 'daily', 'other'];

// Small WebP copies made by tools/make_thumbs.py (sizes: 400, 800, 900).
function thumb(item, width) {
  return 'thumbs/' + item.id + '-' + width + '.webp';
}

var Collection = {
  items: [],
  filter: 'all',
  pendingOpen: null, // id to open after "See in Collection" (set by the Gacha)
  canHover: window.matchMedia('(hover: hover)').matches,

  init: function (items) {
    this.items = items;

    var dialog = document.getElementById('detail');
    document.getElementById('detail-close').addEventListener('click', function () { dialog.close(); });
    // click on the dark backdrop closes the popup
    dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener('close', function () {
      var img = document.getElementById('detail-img');
      Motion.stop(img);
      img.removeAttribute('src');
    });

    this.render();
  },

  // ---- unlocked state -------------------------------------------------
  unlockedIds: function () {
    var ids = Store.get(KEYS.unlocked, []);
    return Array.isArray(ids) ? ids : [];
  },

  isUnlocked: function (id) {
    return this.unlockedIds().indexOf(id) !== -1;
  },

  // ---- render ---------------------------------------------------------
  render: function () {
    this.renderProgress();
    this.renderFilters();
    this.renderGrid();
  },

  renderProgress: function () {
    var ids = this.unlockedIds();
    var total = this.items.length;
    var n = this.items.filter(function (it) { return ids.indexOf(it.id) !== -1; }).length;
    document.getElementById('progress-text').textContent = I18n.t('collection.progress', { n: n, total: total });
    document.getElementById('progress-fill').style.width = (total ? (n / total) * 100 : 0) + '%';
  },

  renderFilters: function () {
    var self = this;
    var box = document.getElementById('filters');
    box.innerHTML = '';
    ['all'].concat(CATEGORIES).forEach(function (cat) {
      var count = cat === 'all'
        ? self.items.length
        : self.items.filter(function (it) { return it.category === cat; }).length;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chip';
      btn.setAttribute('aria-pressed', cat === self.filter);
      btn.innerHTML = '<span></span><small></small>';
      btn.firstChild.textContent = I18n.t('cat.' + cat);
      btn.lastChild.textContent = count;
      btn.addEventListener('click', function () {
        self.filter = cat;
        self.render();
      });
      box.appendChild(btn);
    });
  },

  renderGrid: function () {
    var self = this;
    var grid = document.getElementById('grid');
    grid.innerHTML = '';
    var shown = this.items.filter(function (it) {
      return self.filter === 'all' || it.category === self.filter;
    });

    shown.forEach(function (item, i) {
      var unlocked = self.isUnlocked(item.id);
      var li = document.createElement('li');
      // a few bigger tiles for a relaxed, mixed-size grid
      var big = i % 12 === 0 || i % 12 === 7;
      // locked tiles load only the silhouette (made by tools/make_silhouettes.py)
      var size = big ? 800 : 400;
      var src = unlocked ? thumb(item, size) : 'thumbs/' + item.id + '-sil-' + size + '.webp';
      li.className = 'tile' + (big ? ' tile-big' : '') + (unlocked ? '' : ' is-locked');

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('aria-label', unlocked ? item.name[I18n.lang] : I18n.t('collection.lockedName'));

      var img = document.createElement('img');
      img.alt = '';
      img.loading = 'lazy';
      img.decoding = 'async';
      img.width = 360;
      img.height = 360;
      img.src = src;

      btn.appendChild(img);
      li.appendChild(btn);
      grid.appendChild(li);

      btn.addEventListener('click', function () { self.openDetail(item); });
      if (unlocked && self.canHover) self.setupHoverPlay(btn, img, item, src);
    });
  },

  // Desktop: play the animation while hovering. It is only downloaded on hover.
  setupHoverPlay: function (btn, img, item, src) {
    btn.addEventListener('mouseenter', function () { Motion.play(img, item); });
    btn.addEventListener('mouseleave', function () { Motion.stop(img, src); });
  },

  // ---- detail popup ---------------------------------------------------
  openDetail: function (item) {
    var unlocked = this.isUnlocked(item.id);
    var lang = I18n.lang;
    var img = document.getElementById('detail-img');
    var dialog = document.getElementById('detail');

    dialog.classList.toggle('is-locked', !unlocked);
    document.getElementById('detail-no').textContent = 'No. ' + item.id;
    document.getElementById('detail-name').textContent = unlocked ? item.name[lang] : I18n.t('collection.lockedName');
    document.getElementById('detail-desc').textContent = unlocked ? item.description[lang] : I18n.t('collection.lockedDesc');
    document.getElementById('detail-cat').textContent = I18n.t('cat.' + item.category);

    if (unlocked) {
      // the still shows right away (as the poster), then the animation plays
      img.src = thumb(item, 900);
      Motion.play(img, item);
    } else {
      Motion.stop(img);
      img.src = 'thumbs/' + item.id + '-sil-800.webp';
    }
    img.alt = unlocked ? item.name[lang] : '';
    dialog.showModal();
  }
};
