// Collection page: progress, category filter, tile grid, detail popup.
var CATEGORIES = ['food', 'music', 'outfit', 'seasonal', 'spooky', 'love', 'daily', 'other'];

// Rarity badges, gacha style (the "rarity" field in dingding.json).
// Common has no badge.
var RARITY_LABEL = { 'rare': 'R', 'super-rare': 'SR', 'secret': 'SECRET' };

// Returns a little sticker <span> for this Ding Ding's rarity, or null (Common).
function rarityBadge(item) {
  var label = RARITY_LABEL[item.rarity];
  if (!label) return null;
  var badge = document.createElement('span');
  badge.className = 'rarity-badge rarity-' + item.rarity;
  var text = document.createElement('span');   // inner span: lets SECRET's letters shimmer
  text.textContent = label;
  badge.appendChild(text);
  badge.setAttribute('role', 'img');
  badge.setAttribute('aria-label', I18n.t('rarity.' + item.rarity));
  return badge;
}

// Put the badge into a slot (popup / gacha reveal); the slot is hidden for Common.
function showRarityBadge(slot, item) {
  slot.innerHTML = '';
  var badge = item ? rarityBadge(item) : null;
  if (badge) slot.appendChild(badge);
  slot.hidden = !badge;
}

// Small WebP copies made by tools/make_thumbs.py (sizes: 400, 800, 900).
// An entry with a "media" field (the Secret) has one picture: thumbs/<media>.webp.
function thumb(item, width) {
  if (item.media) return 'thumbs/' + item.media + '.webp';
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
      if (dialog.open) return;   // already reopened for another Ding Ding
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

  // The Secret does not exist in the Collection (no tile, no silhouette,
  // not counted) until it has been found in the Gacha.
  visibleItems: function () {
    var self = this;
    return this.items.filter(function (it) {
      return it.rarity !== 'secret' || self.isUnlocked(it.id);
    });
  },

  // { n: collected, total: pieces that count, secretFound: true/false }
  totals: function () {
    var ids = this.unlockedIds();
    var visible = this.visibleItems();
    return {
      n: visible.filter(function (it) { return ids.indexOf(it.id) !== -1; }).length,
      total: visible.length,
      secretFound: visible.length === this.items.length
    };
  },

  // ---- render ---------------------------------------------------------
  render: function () {
    this.renderProgress();
    if (window.Reward && Reward.items.length) Reward.renderCollection();
    this.renderFilters();
    this.renderGrid();
  },

  renderProgress: function () {
    // "12 / 67 + ???" until the Secret is found, then "13 / 68"
    var t = this.totals();
    var total = t.secretFound ? t.total : t.total + ' + ???';
    document.getElementById('progress-text').textContent = I18n.t('collection.progress', { n: t.n, total: total });
    document.getElementById('progress-fill').style.width = (t.total ? (t.n / t.total) * 100 : 0) + '%';
  },

  renderFilters: function () {
    var self = this;
    var box = document.getElementById('filters');
    box.innerHTML = '';
    var items = this.visibleItems();
    // the "Secret" chip only appears once the Secret is found
    var cats = ['all'].concat(CATEGORIES);
    if (this.totals().secretFound) cats.push('secret');
    if (cats.indexOf(this.filter) === -1) this.filter = 'all';
    cats.forEach(function (cat) {
      var count = cat === 'all'
        ? items.length
        : items.filter(function (it) { return it.category === cat; }).length;
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
    var spot = document.getElementById('secret-spot');
    grid.innerHTML = '';
    spot.innerHTML = '';
    var shown = this.visibleItems().filter(function (it) {
      return self.filter === 'all' || it.category === self.filter;
    });

    // The Secret is not in the grid: it sits alone at the very bottom, on plain white.
    var secret = shown.filter(function (it) { return it.rarity === 'secret'; })[0];
    spot.hidden = !secret;
    if (secret) spot.appendChild(this.makeTile(secret, false, 'div'));

    shown.filter(function (it) { return it.rarity !== 'secret'; }).forEach(function (item, i) {
      // a few bigger tiles for a relaxed, mixed-size grid
      grid.appendChild(self.makeTile(item, i % 12 === 0 || i % 12 === 7, 'li'));
    });
  },

  // One tile: a button with the picture (or silhouette) and the rarity badge.
  makeTile: function (item, big, tag) {
    var self = this;
    var unlocked = self.isUnlocked(item.id);
    var li = document.createElement(tag);
    // locked tiles load only the silhouette (made by tools/make_silhouettes.py)
    var size = big ? 800 : 400;
    var src = unlocked ? thumb(item, size) : 'thumbs/' + item.id + '-sil-' + size + '.webp';
    li.className = 'tile' + (big ? ' tile-big' : '') + (unlocked ? '' : ' is-locked') +
      (item.rarity === 'secret' ? ' is-secret' : '');

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
    // rarity sticker in the top-right corner (unlocked R / SR / SECRET only)
    var badge = unlocked ? rarityBadge(item) : null;
    if (badge) btn.appendChild(badge);
    li.appendChild(btn);

    btn.addEventListener('click', function () { self.openDetail(item); });
    if (unlocked && self.canHover) self.setupHoverPlay(btn, img, item, src);
    return li;
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
    dialog.classList.toggle('is-secret', item.rarity === 'secret');
    // rarity sticker on the picture, only for unlocked ones
    showRarityBadge(document.getElementById('detail-rarity'), unlocked ? item : null);
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
