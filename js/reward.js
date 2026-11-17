// Reward for collecting every DING DING (all 68, including the Secret):
//  1. a full-screen celebration right after the last one is revealed in the Gacha
//  2. a "DING DING MASTER" certificate (1080 x 1920 PNG, like the quiz card)
//  3. a COMPLETE! badge and a certificate button in the Collection
// The winner picture (thumbs/winner-*.webp, video/winner.*) is a reward only,
// not a collectible, so it is not in dingding.json.
var Reward = {
  items: [],
  cert: null,   // { key, file, promise }: the last prepared certificate

  init: function (items) {
    this.items = items;
    var self = this;
    var celebrate = document.getElementById('celebrate');
    var certDialog = document.getElementById('cert');

    document.getElementById('celebrate-close').addEventListener('click', function () { celebrate.close(); });
    document.getElementById('celebrate-cert').addEventListener('click', function () {
      celebrate.close();
      self.openCertificate();
    });
    celebrate.addEventListener('close', function () {
      Motion.stop(document.getElementById('celebrate-img'));
      document.getElementById('celebrate-wall').innerHTML = '';
      document.getElementById('confetti').innerHTML = '';
    });

    document.getElementById('open-cert').addEventListener('click', function () { self.openCertificate(); });
    document.getElementById('cert-close').addEventListener('click', function () { certDialog.close(); });
    certDialog.addEventListener('click', function (e) { if (e.target === certDialog) certDialog.close(); });

    // The name is remembered, and the preview follows the typing (a moment later).
    var input = document.getElementById('cert-name');
    var timer = null;
    input.addEventListener('input', function () {
      Store.set(KEYS.player, input.value.trim());
      clearTimeout(timer);
      timer = setTimeout(function () { self.preview(); }, 300);
    });
    document.getElementById('cert-save').addEventListener('click', function () { self.save(); });

    // Already complete but no date yet (should not happen): note it now.
    this.check();
  },

  // ---- state ----------------------------------------------------------
  isComplete: function () {
    var ids = Collection.unlockedIds();
    return this.items.length > 0 && this.items.every(function (it) { return ids.indexOf(it.id) !== -1; });
  },

  // The day it was completed, "YYYY-MM-DD" (local time), or null.
  completedOn: function () {
    return Store.get(KEYS.completed, null);
  },

  // Call after something is unlocked. Saves the date the first time the
  // collection is complete, and returns true only at that moment.
  check: function () {
    if (!this.isComplete() || this.completedOn()) return false;
    var d = new Date();
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    Store.set(KEYS.completed, d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()));
    return true;
  },

  // "16 November 2026" / "2026年11月16日" / "16 พฤศจิกายน 2569" (Thai uses the Buddhist year)
  formatDate: function (iso) {
    if (!iso) return '';
    var p = iso.split('-');
    var date = new Date(+p[0], +p[1] - 1, +p[2]);
    var locale = { en: 'en-GB', th: 'th-TH', ja: 'ja-JP' }[I18n.lang] || 'en-GB';
    try {
      return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric' }).format(date);
    } catch (e) {
      return iso;
    }
  },

  // ---- celebration ----------------------------------------------------
  celebrate: function () {
    var dialog = document.getElementById('celebrate');
    var wall = document.getElementById('celebrate-wall');
    var confetti = document.getElementById('confetti');

    // All DING DINGs pop in, in a random order, in a grid that fills the screen.
    // A few empty cells (if the grid is bigger than 68) go to the middle, behind the card.
    var w = window.innerWidth, h = window.innerHeight, n = this.items.length;
    var cols = Math.max(4, Math.round(Math.sqrt(n * w / h)));
    var rows = Math.ceil(n / cols);
    wall.style.gridTemplateColumns = 'repeat(' + cols + ', 1fr)';
    wall.style.gridTemplateRows = 'repeat(' + rows + ', 1fr)';
    var cells = [];
    for (var i = 0; i < cols * rows; i++) cells.push(i);
    var mid = { c: (cols - 1) / 2, r: (rows - 1) / 2 };
    var empties = cells.slice().sort(function (a, b) {
      var da = Math.pow(a % cols - mid.c, 2) + Math.pow(Math.floor(a / cols) - mid.r, 2);
      var db = Math.pow(b % cols - mid.c, 2) + Math.pow(Math.floor(b / cols) - mid.r, 2);
      return da - db;
    }).slice(0, cols * rows - n);
    var order = this.items.slice().sort(function () { return Math.random() - 0.5; });
    wall.innerHTML = '';
    cells.forEach(function (cell) {
      var div = document.createElement('div');
      div.className = 'wall-cell';
      if (empties.indexOf(cell) === -1) {
        var item = order.shift();
        var img = document.createElement('img');
        img.src = thumb(item, 400);
        img.alt = '';
        if (item.rarity === 'secret') div.classList.add('is-secret');
        div.appendChild(img);
        div.style.animationDelay = (0.3 + Math.random() * 1.6).toFixed(2) + 's';
      }
      wall.appendChild(div);
    });

    // Confetti in the artwork colours, falling once.
    var colours = ['#f2dc8a', '#e6bd3f', '#f1c9c4', '#1f1f1f', '#b7d8da', '#ffffff', '#cf7f6e'];
    confetti.innerHTML = '';
    for (var k = 0; k < 70; k++) {
      var bit = document.createElement('span');
      bit.style.left = (Math.random() * 100).toFixed(1) + '%';
      bit.style.background = colours[k % colours.length];
      bit.style.animationDelay = (Math.random() * 1.8).toFixed(2) + 's';
      bit.style.animationDuration = (2.6 + Math.random() * 2).toFixed(2) + 's';
      bit.style.setProperty('--spin', (Math.random() * 720 - 360).toFixed(0) + 'deg');
      bit.style.setProperty('--drift', (Math.random() * 80 - 40).toFixed(0) + 'px');
      if (k % 3 === 0) bit.className = 'round';
      confetti.appendChild(bit);
    }

    var winner = document.getElementById('celebrate-img');
    dialog.showModal();
    Motion.play(winner, { id: 'winner' });
  },

  // ---- Collection: COMPLETE! badge + certificate button ---------------
  renderCollection: function () {
    var done = this.isComplete();
    document.getElementById('complete-badge').hidden = !done;
    document.getElementById('open-cert').hidden = !done;
  },

  // ---- certificate ----------------------------------------------------
  openCertificate: function () {
    var input = document.getElementById('cert-name');
    input.value = Store.get(KEYS.player, '') || '';
    var btn = document.getElementById('cert-save');
    btn.textContent = I18n.t(Share.labelKey());
    document.getElementById('cert').showModal();
    this.preview();
  },

  key: function () {
    return (Store.get(KEYS.player, '') || '') + '|' + I18n.lang;
  },

  // Make the PNG for the current name + language (cached), and show it.
  prepare: function () {
    var key = this.key();
    if (this.cert && this.cert.key === key) return this.cert.promise;
    var cert = { key: key, file: null };
    var name = Store.get(KEYS.player, '') || '';
    cert.promise = this.makeCertificate(name).then(function (canvas) {
      return Share.toFile(canvas, 'dingding-master.png');
    }).then(function (file) {
      cert.file = file;
      return file;
    });
    cert.promise.catch(function (err) {
      console.error('Could not make the certificate', err);
      if (Reward.cert === cert) Reward.cert = null;
    });
    this.cert = cert;
    return cert.promise;
  },

  preview: function () {
    var img = document.getElementById('cert-preview');
    var key = this.key();
    this.prepare().then(function (file) {
      if (Reward.key() !== key) return;   // the name changed meanwhile
      if (img.dataset.url) URL.revokeObjectURL(img.dataset.url);
      img.dataset.url = URL.createObjectURL(file);
      img.src = img.dataset.url;
    });
  },

  save: function () {
    var ready = this.cert && this.cert.key === this.key() && this.cert.file;
    // Ready: save/share during the tap (needed on iOS).
    if (ready) {
      Share.save(ready);
      return;
    }
    this.prepare().then(function (file) { Share.save(file); }, function (err) { Share.failed(err); });
  },

  // Returns a Promise for a 1080 x 1920 canvas (Instagram Story size), with
  // everything between SAFE_TOP and SAFE_BOTTOM like the quiz card.
  makeCertificate: function (name) {
    var self = this;
    var lang = I18n.lang;
    var W = 1080, H = 1920;
    var SAFE_TOP = 250, SAFE_BOTTOM = H - 250;
    var thai = lang === 'th';
    var HEAD = thai ? '600 {size} "Mali", sans-serif' : '{size} "Yusei Magic", sans-serif';
    var BODY = thai ? '{size} "Mali", sans-serif' : '{size} "Yomogi", sans-serif';
    var LATIN = '{size} "Yusei Magic", sans-serif';   // footer, always the same
    function font(family, size) { return family.replace('{size}', size + 'px'); }
    var INK = '#1f1f1f', GOLD = '#e6bd3f', MUTED = '#8c8c8c', TILE = '#f2f2f0';

    // plain text for the canvas: no invisible Thai joiners (see I18n.plain)
    var title = I18n.plain(I18n.t('reward.title'));
    var date = I18n.plain(I18n.t('reward.date', { date: this.formatDate(this.completedOn()) }));
    var footer = '© DING DING THE CAT by INGINGE DESIGN';

    function loadImage(src) {
      return new Promise(function (ok, fail) {
        var im = new Image();
        im.onload = function () { ok(im); };
        im.onerror = fail;
        im.src = src;
      });
    }
    // wait for every font used on the certificate
    function loadFonts() {
      return I18n.fontsReady([
        [font(HEAD, 40), title + name],
        [font(BODY, 40), date],
        [font(LATIN, 40), footer + name]
      ]);
    }
    function roundedRect(ctx, x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }
    // a four-pointed sparkle, like on the gacha reveal
    function sparkle(ctx, x, y, r) {
      var k = r * 0.24;
      ctx.beginPath();
      ctx.moveTo(x, y - r);
      ctx.lineTo(x + k, y - k); ctx.lineTo(x + r, y); ctx.lineTo(x + k, y + k);
      ctx.lineTo(x, y + r); ctx.lineTo(x - k, y + k); ctx.lineTo(x - r, y); ctx.lineTo(x - k, y - k);
      ctx.closePath();
      ctx.fill();
    }
    // shrink the font until the text fits
    function fit(ctx, family, size, text, maxWidth, min) {
      do {
        ctx.font = font(family, size);
        size -= 2;
      } while (ctx.measureText(text).width > maxWidth && size > min);
    }

    var pieces = this.items.map(function (it) { return loadImage(thumb(it, 400)).catch(function () { return null; }); });
    return Promise.all([loadImage('thumbs/winner-900.webp'), loadFonts(), Promise.all(pieces)]).then(function (loaded) {
      var winner = loaded[0], thumbs = loaded[2];
      var canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      var ctx = canvas.getContext('2d');
      ctx.textAlign = 'left';   // lines are centred by I18n.fillCentered
      ctx.textBaseline = 'alphabetic';

      // paper and a thin gold frame inside the safe area
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = GOLD;
      ctx.lineWidth = 6;
      roundedRect(ctx, 60, SAFE_TOP + 10, W - 120, SAFE_BOTTOM - SAFE_TOP - 20, 40);
      ctx.stroke();

      // title, with sparkles
      ctx.fillStyle = INK;
      fit(ctx, HEAD, 76, title, 760, 40);
      I18n.fillCentered(ctx, title, W / 2, SAFE_TOP + 125);
      var tw = ctx.measureText(title).width;
      ctx.fillStyle = GOLD;
      sparkle(ctx, W / 2 - tw / 2 - 46, SAFE_TOP + 92, 20);
      sparkle(ctx, W / 2 + tw / 2 + 46, SAFE_TOP + 92, 20);
      sparkle(ctx, W / 2 + tw / 2 + 80, SAFE_TOP + 58, 11);

      // the winner picture, rounded
      var size = 610, x = (W - size) / 2, y = SAFE_TOP + 165;
      ctx.save();
      roundedRect(ctx, x, y, size, size, 28);
      ctx.clip();
      ctx.drawImage(winner, x, y, size, size);
      ctx.restore();

      // the player's name (if given) and the date
      var nameY = y + size + 105;
      if (name) {
        ctx.fillStyle = INK;
        fit(ctx, HEAD, 70, name, 820, 36);
        I18n.fillCentered(ctx, name, W / 2, nameY);
      }
      ctx.fillStyle = MUTED;
      ctx.font = font(BODY, thai ? 32 : 34);
      I18n.fillCentered(ctx, date, W / 2, name ? nameY + 62 : nameY - 20);

      // all the pieces: 17 x 4 little tiles (68)
      var cols = 17, cell = 48, gap = 4;
      var rows = Math.ceil(thumbs.length / cols);
      var gridW = cols * cell + (cols - 1) * gap;
      var gx = (W - gridW) / 2, gy = nameY + 125;
      thumbs.forEach(function (im, i) {
        var cx = gx + (i % cols) * (cell + gap);
        var cy = gy + Math.floor(i / cols) * (cell + gap);
        var secret = self.items[i].rarity === 'secret';
        ctx.save();
        roundedRect(ctx, cx, cy, cell, cell, 6);
        ctx.clip();
        ctx.fillStyle = secret ? '#ffffff' : TILE;
        ctx.fillRect(cx, cy, cell, cell);
        if (im) {
          if (secret) {
            // the plain cat is not square: fit it, sitting on the bottom edge
            var s = Math.min(cell / im.width, cell / im.height);
            ctx.drawImage(im, cx + (cell - im.width * s) / 2, cy + cell - im.height * s, im.width * s, im.height * s);
          } else {
            ctx.drawImage(im, cx, cy, cell, cell);
          }
        }
        ctx.restore();
        if (secret) {
          ctx.strokeStyle = GOLD;
          ctx.lineWidth = 2;
          roundedRect(ctx, cx, cy, cell, cell, 6);
          ctx.stroke();
        }
      });
      var gridBottom = gy + rows * cell + (rows - 1) * gap;

      // count under the grid
      ctx.fillStyle = INK;
      ctx.font = font(LATIN, 30);
      I18n.fillCentered(ctx, thumbs.length + ' / ' + thumbs.length, W / 2, gridBottom + 56);

      // footer at the bottom of the safe area
      ctx.fillStyle = MUTED;
      ctx.font = font(LATIN, 28);
      I18n.fillCentered(ctx, footer, W / 2, SAFE_BOTTOM - 52);

      return canvas;
    });
  }
};
