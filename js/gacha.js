// Gacha page: capsule animation and reveal. No limit; repeats are allowed.
//
// Each spin first picks a rarity tier (ODDS below), then one Ding Ding from
// that tier. The reveal gets a bigger effect the rarer the tier is.

// Chance of each tier per spin, in percent (must add up to 100).
var ODDS = [
  { rarity: 'common',     chance: 65 },
  { rarity: 'rare',       chance: 20 },
  { rarity: 'super-rare', chance: 13 },
  { rarity: 'secret',     chance: 2 }
];

// Inside a tier, a Ding Ding not collected yet is this many times as likely
// as one already collected. Repeats still happen, just less often.
var NEW_WEIGHT = 10;

// Catch-up for the Secret: once the player has all the other pieces, the
// Secret chance goes up from ODDS (2%) to CATCHUP.chance (10%) per spin, and
// if it still hasn't come after CATCHUP.guarantee spins, the next spin is
// the Secret for sure. The spins are counted in localStorage (KEYS.secretWait).
var CATCHUP = { chance: 10, guarantee: 30 };

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

  // Is the Secret the only piece still missing?
  onlySecretLeft: function () {
    var have = this.unlocked();
    var missing = this.items.filter(function (it) { return have.indexOf(it.id) === -1; });
    return missing.length === 1 && missing[0].rarity === 'secret';
  },

  // Step 1: the tier, by the chances in ODDS.
  // Only the Secret missing: the Secret gets CATCHUP.chance (the other tiers
  // share the rest, in the same proportions), and after CATCHUP.guarantee
  // spins without it, the next spin is the Secret.
  pickRarity: function () {
    var odds = ODDS;
    if (this.onlySecretLeft()) {
      if (Store.get(KEYS.secretWait, 0) >= CATCHUP.guarantee) return 'secret';
      var others = ODDS.filter(function (o) { return o.rarity !== 'secret'; });
      var othersTotal = others.reduce(function (sum, o) { return sum + o.chance; }, 0);
      odds = others.map(function (o) {
        return { rarity: o.rarity, chance: o.chance * (100 - CATCHUP.chance) / othersTotal };
      }).concat({ rarity: 'secret', chance: CATCHUP.chance });
    }
    var roll = Math.random() * 100;
    for (var i = 0; i < odds.length; i++) {
      roll -= odds[i].chance;
      if (roll < 0) return odds[i].rarity;
    }
    return odds[0].rarity;
  },

  // Step 2: one Ding Ding from that tier. Repeats are allowed, but one not
  // collected yet is NEW_WEIGHT times as likely as one already collected.
  pick: function () {
    var rarity = this.pickRarity();
    var pool = this.items.filter(function (it) { return it.rarity === rarity; });
    if (!pool.length) pool = this.items;   // just in case a tier is empty

    var have = this.unlocked();
    var weights = pool.map(function (it) { return have.indexOf(it.id) === -1 ? NEW_WEIGHT : 1; });
    var total = weights.reduce(function (sum, w) { return sum + w; }, 0);
    var roll = Math.random() * total;
    for (var i = 0; i < pool.length; i++) {
      roll -= weights[i];
      if (roll < 0) return pool[i];
    }
    return pool[pool.length - 1];
  },

  // ---- the spin -------------------------------------------------------
  spin: function () {
    if (this.busy || !this.items.length) return;
    this.busy = true;
    var self = this;

    var waiting = this.onlySecretLeft();
    var item = this.pick();
    var have = this.unlocked();
    // count the spins that missed the Secret while it was the only one left
    if (waiting) Store.set(KEYS.secretWait, item.rarity === 'secret' ? 0 : Store.get(KEYS.secretWait, 0) + 1);
    this.current = item;
    this.currentIsNew = have.indexOf(item.id) === -1;

    // Save first, so a new Ding Ding is never lost if the page is closed mid-animation.
    if (this.currentIsNew) Store.set(KEYS.unlocked, have.concat(item.id));
    // The very last one? Then the celebration follows the reveal (js/reward.js).
    var completed = this.currentIsNew && Reward.check();
    Collection.render();
    this.renderText();

    // Start loading the picture while the machine is turning.
    new Image().src = thumb(item, 900);

    var stage = document.getElementById('gacha-stage');
    var capsule = document.getElementById('gacha-capsule');
    var curtain = document.getElementById('gacha-curtain');
    var rarity = item.rarity;
    var special = rarity === 'super-rare' || rarity === 'secret';
    // With "reduce motion" the CSS animations are off, so don't wait for them.
    var speed = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0.1 : 1;
    function wait(ms) { return new Promise(function (ok) { setTimeout(ok, ms * speed); }); }

    capsule.setAttribute('data-rarity', rarity);      // the capsule colour hints at the tier
    stage.classList.add('is-spinning');               // handle turns, capsules jiggle
    wait(1000).then(function () {
      stage.classList.remove('is-spinning');
      capsule.hidden = false;
      capsule.className = 'capsule is-dropping';      // capsule falls out and bounces
      return wait(900);
    }).then(function () {
      // a little wiggle... (Super Rare and Secret: a long, hard shake with a glow)
      capsule.className = special ? 'capsule is-shaking-hard' : 'capsule is-shaking';
      return wait(special ? 1600 : 700);
    }).then(function () {
      capsule.className = 'capsule is-open';          // ...and it pops open
      if (rarity !== 'secret') return wait(450);
      // Secret: the screen goes dark, two yellow eyes blink, then the reveal
      curtain.hidden = false;
      return wait(2300);
    }).then(function () {
      capsule.hidden = true;
      capsule.className = 'capsule';
      self.busy = false;
      self.showReveal();
      if (rarity !== 'secret') return;
      curtain.classList.add('is-leaving');            // fade the dark screen away
      return wait(600).then(function () {
        curtain.hidden = true;
        curtain.classList.remove('is-leaving');
      });
    }).then(function () {
      // Collected everything: let the reveal be seen, then celebrate.
      if (completed) return wait(2500).then(function () { Reward.celebrate(); });
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
    reveal.setAttribute('data-rarity', item.rarity);  // the CSS adds sparkles / glow per tier
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
    var secret = item.rarity === 'secret';
    var badge = document.getElementById('reveal-badge');
    var label = secret ? 'gacha.secret' : this.currentIsNew ? 'gacha.new' : 'gacha.met';
    badge.textContent = 'No. ' + item.id + ' · ' + I18n.t(label);
    badge.classList.toggle('is-new', this.currentIsNew && !secret);
    showRarityBadge(document.getElementById('reveal-rarity'), item);
    document.getElementById('reveal-name').textContent = item.name[I18n.lang];
    document.getElementById('reveal-desc').textContent = item.description[I18n.lang];
    document.getElementById('reveal-img').alt = item.name[I18n.lang];
  }
};
