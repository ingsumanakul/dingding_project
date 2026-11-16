// Gacha page: capsule animation and reveal. No limit; repeats are allowed.

var Gacha = {
  items: [],
  current: null,     // the Ding Ding shown in the reveal
  currentIsNew: false,
  busy: false,

  init: function (items) {
    this.items = items;
    var self = this;
    document.getElementById('gacha-spin').addEventListener('click', function () { self.spin(); });
    document.getElementById('reveal-again').addEventListener('click', function () {
      self.showMachine();
      self.spin();
    });
    document.getElementById('reveal-see').addEventListener('click', function () {
      // app.js opens this Ding Ding's popup once the Collection page is shown
      Collection.pendingOpen = self.current ? self.current.id : null;
      location.hash = '#collection';
    });
    this.renderText();
  },

  // ---- picking --------------------------------------------------------
  // Ids collected so far.
  unlocked: function () {
    var ids = Store.get(KEYS.unlocked, []);
    return Array.isArray(ids) ? ids : [];
  },

  // Random, repeats allowed. A Ding Ding not collected yet is twice as
  // likely as one already collected (weight 2 against weight 1).
  pick: function () {
    var have = this.unlocked();
    var weights = this.items.map(function (it) { return have.indexOf(it.id) === -1 ? 2 : 1; });
    var total = weights.reduce(function (sum, w) { return sum + w; }, 0);
    var roll = Math.random() * total;
    for (var i = 0; i < this.items.length; i++) {
      roll -= weights[i];
      if (roll < 0) return this.items[i];
    }
    return this.items[this.items.length - 1];
  },

  // ---- the spin -------------------------------------------------------
  spin: function () {
    if (this.busy || !this.items.length) return;
    this.busy = true;
    var self = this;

    var item = this.pick();
    var have = this.unlocked();
    this.current = item;
    this.currentIsNew = have.indexOf(item.id) === -1;

    // Save first, so a new Ding Ding is never lost if the page is closed mid-animation.
    if (this.currentIsNew) Store.set(KEYS.unlocked, have.concat(item.id));
    Collection.render();
    this.renderText();

    // Start loading the picture while the machine is turning.
    new Image().src = thumb(item, 900);

    var stage = document.getElementById('gacha-stage');
    var capsule = document.getElementById('gacha-capsule');
    // With "reduce motion" the CSS animations are off, so don't wait for them.
    var speed = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0.1 : 1;
    function wait(ms) { return new Promise(function (ok) { setTimeout(ok, ms * speed); }); }

    stage.classList.add('is-spinning');               // handle turns, capsules jiggle
    wait(1000).then(function () {
      stage.classList.remove('is-spinning');
      capsule.hidden = false;
      capsule.className = 'capsule is-dropping';      // capsule falls out and bounces
      return wait(900);
    }).then(function () {
      capsule.className = 'capsule is-shaking';       // a little wiggle...
      return wait(700);
    }).then(function () {
      capsule.className = 'capsule is-open';          // ...and it pops open
      return wait(450);
    }).then(function () {
      capsule.hidden = true;
      capsule.className = 'capsule';
      self.busy = false;
      self.showReveal();
    });
  },

  // ---- views ----------------------------------------------------------
  showMachine: function () {
    if (this.busy) return;
    document.getElementById('gacha-reveal').hidden = true;
    document.getElementById('gacha-machine-view').hidden = false;
    var img = document.getElementById('reveal-img');
    Motion.stop(img);
    img.removeAttribute('src');
    this.renderText();
  },

  showReveal: function () {
    var item = this.current;
    var img = document.getElementById('reveal-img');
    var reveal = document.getElementById('gacha-reveal');

    document.getElementById('gacha-machine-view').hidden = true;
    reveal.hidden = false;
    this.renderText();
    window.scrollTo(0, 0);

    // Still picture first (as the poster), then the animation plays.
    img.src = thumb(item, 900);
    Motion.play(img, item);
  },

  // The reveal text (depends on the language).
  renderText: function () {
    var item = this.current;
    if (!item) return;
    var badge = document.getElementById('reveal-badge');
    badge.textContent = 'No. ' + item.id + ' · ' + I18n.t(this.currentIsNew ? 'gacha.new' : 'gacha.met');
    badge.classList.toggle('is-new', this.currentIsNew);
    document.getElementById('reveal-name').textContent = item.name[I18n.lang];
    document.getElementById('reveal-desc').textContent = item.description[I18n.lang];
    document.getElementById('reveal-img').alt = item.name[I18n.lang];
  }
};
