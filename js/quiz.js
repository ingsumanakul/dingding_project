// Quiz page: "Which Ding Ding are you?"
// Questions come from data/quiz.json. Each answer gives points to 1–2
// categories; the top category wins and one Ding Ding is picked from it.
// The quiz does NOT unlock anything in the Collection.
var Quiz = {
  items: [],
  questions: [],
  step: -1,        // -1 = intro, 0..n-1 = question, n = result
  answers: [],     // chosen answer index for each question
  result: null,    // the Ding Ding shown on the result card

  init: function (items, quiz) {
    this.items = items;
    this.questions = (quiz && quiz.questions) || [];
    var self = this;

    document.getElementById('quiz-start').addEventListener('click', function () { self.start(); });
    document.getElementById('quiz-back').addEventListener('click', function () { self.back(); });
    document.getElementById('quiz-again').addEventListener('click', function () { self.start(); });
    var saveBtn = document.getElementById('quiz-save');
    saveBtn.addEventListener('click', function () { self.save(); });
    // On phones the button opens the share sheet ("Save Image", Instagram…).
    if (this.canShareFiles()) {
      saveBtn.setAttribute('data-i18n', 'quiz.share');
      saveBtn.textContent = I18n.t('quiz.share');
    }
    // Unlocked result: "See in Collection". Still locked: "Find me in the Gacha!"
    document.getElementById('quiz-see').addEventListener('click', function () {
      if (self.result && Collection.isUnlocked(self.result.id)) {
        Collection.pendingOpen = self.result.id;
        location.hash = '#collection';
      } else {
        location.hash = '#gacha';
      }
    });

    // Show the last result again when coming back to the site.
    var savedId = Store.get(KEYS.quiz, null);
    var saved = items.filter(function (it) { return it.id === savedId; })[0];
    if (saved) {
      this.result = saved;
      this.step = this.questions.length;
    }
    this.render();
  },

  // ---- moving through the quiz ----------------------------------------
  start: function () {
    this.answers = [];
    this.result = null;
    this.step = 0;
    this.render();
  },

  back: function () {
    this.step -= 1;   // from the first question this goes back to the intro
    this.render();
  },

  choose: function (index) {
    this.answers[this.step] = index;
    this.step += 1;
    if (this.step >= this.questions.length) {
      this.result = this.pickResult();
      Store.set(KEYS.quiz, this.result.id);
    }
    this.render();
    window.scrollTo(0, 0);
  },

  // ---- result ---------------------------------------------------------
  // Add up the points per category.
  scores: function () {
    var scores = {};
    var self = this;
    this.questions.forEach(function (q, i) {
      var answer = q.answers[self.answers[i]];
      if (!answer) return;
      Object.keys(answer.points).forEach(function (cat) {
        scores[cat] = (scores[cat] || 0) + answer.points[cat];
      });
    });
    return scores;
  },

  // Top category (ties: random among the tied ones), then a random Ding Ding from it.
  pickResult: function () {
    var self = this;
    var scores = this.scores();
    function inCategory(cat) {
      return self.items.filter(function (it) { return it.category === cat; });
    }
    // only categories that really have Ding Dings
    var cats = Object.keys(scores).filter(function (cat) { return inCategory(cat).length > 0; });
    var best = Math.max.apply(null, cats.map(function (cat) { return scores[cat]; }));
    var top = cats.filter(function (cat) { return scores[cat] === best; });
    var pool = top.length ? inCategory(top[Math.floor(Math.random() * top.length)]) : this.items;
    return pool[Math.floor(Math.random() * pool.length)];
  },

  // ---- render ---------------------------------------------------------
  render: function () {
    var total = this.questions.length;
    var isIntro = this.step < 0;
    var isResult = this.step >= total && this.result;

    document.getElementById('quiz-intro').hidden = !isIntro;
    document.getElementById('quiz-question').hidden = isIntro || isResult;
    document.getElementById('quiz-result').hidden = !isResult;

    if (isResult) this.renderResult();
    else if (!isIntro) this.renderQuestion();
    if (!isResult) Motion.stop(document.getElementById('quiz-img'));
  },

  renderQuestion: function () {
    var self = this;
    var lang = I18n.lang;
    var q = this.questions[this.step];

    // progress dots
    var dots = document.getElementById('quiz-dots');
    dots.innerHTML = '';
    this.questions.forEach(function (_, i) {
      var dot = document.createElement('span');
      dot.className = 'dot' + (i < self.step ? ' is-done' : '') + (i === self.step ? ' is-current' : '');
      dots.appendChild(dot);
    });
    dots.setAttribute('aria-label', (this.step + 1) + ' / ' + this.questions.length);

    document.getElementById('quiz-text').textContent = q.question[lang];

    var list = document.getElementById('quiz-answers');
    list.innerHTML = '';
    q.answers.forEach(function (answer, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'answer' + (self.answers[self.step] === i ? ' is-chosen' : '');
      btn.textContent = answer.text[lang];
      btn.addEventListener('click', function () { self.choose(i); });
      list.appendChild(btn);
    });
  },

  renderResult: function () {
    var item = this.result;
    var lang = I18n.lang;
    var img = document.getElementById('quiz-img');
    var still = thumb(item, 900);

    document.getElementById('quiz-name').textContent = item.name[lang];
    document.getElementById('quiz-cat').textContent = I18n.t('cat.' + item.category);
    document.getElementById('quiz-desc').textContent = item.description[lang];
    img.alt = item.name[lang];
    document.getElementById('quiz-see').textContent =
      I18n.t(Collection.isUnlocked(item.id) ? 'gacha.see' : 'quiz.find');
    if (img.getAttribute('src') !== still || img.dataset.motion !== item.id) {
      img.src = still;
      Motion.play(img, item);
    }
    // Get the card ready now, so the share sheet can open right on tap.
    if (this.canShareFiles()) this.prepareCard(item);
  },

  // ---- save / share as PNG --------------------------------------------
  // Phones (touch screen + Web Share with files): open the share sheet.
  // Desktop, or no file sharing: download the PNG.
  canShareFiles: function () {
    try {
      var touch = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
      var test = new File([''], 'test.png', { type: 'image/png' });
      return !!(touch && navigator.share && navigator.canShare && navigator.canShare({ files: [test] }));
    } catch (e) {
      return false;
    }
  },

  card: null,   // { key, file, promise }: the last prepared card

  // Returns a Promise for the card as a PNG File. Cached per Ding Ding + language.
  prepareCard: function (item) {
    var key = item.id + '-' + I18n.lang;
    if (this.card && this.card.key === key) return this.card.promise;
    var card = { key: key, file: null };
    card.promise = this.makeCard(item).then(function (canvas) {
      return new Promise(function (ok, fail) {
        canvas.toBlob(function (blob) {
          if (!blob) return fail(new Error('toBlob failed'));
          card.file = new File([blob], 'dingding-' + item.id + '.png', { type: 'image/png' });
          ok(card.file);
        }, 'image/png');
      });
    });
    card.promise.catch(function () { if (Quiz.card === card) Quiz.card = null; });
    this.card = card;
    return card.promise;
  },

  save: function () {
    var self = this;
    var item = this.result;
    if (!item) return;
    var key = item.id + '-' + I18n.lang;
    var ready = this.card && this.card.key === key && this.card.file;

    // Card already made: share straight away (iOS needs this to happen
    // during the tap, not after waiting).
    if (ready && this.canShareFiles()) {
      this.share(ready);
      return;
    }
    this.prepareCard(item).then(function (file) {
      if (self.canShareFiles()) self.share(file);
      else self.download(file);
    }).catch(function (err) {
      console.error('Could not make the card image', err);
    });
  },

  share: function (file) {
    var self = this;
    navigator.share({ files: [file] }).catch(function (err) {
      // AbortError = the user closed the share sheet: that's fine.
      if (err && err.name !== 'AbortError') self.download(file);
    });
  },

  download: function (file) {
    var link = document.createElement('a');
    link.href = URL.createObjectURL(file);
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(function () { URL.revokeObjectURL(link.href); }, 1000);
  },

  // Returns a Promise for a 1080 x 1920 canvas (Instagram Story size, 9:16).
  // Instagram covers about 250px at the top and bottom with its own buttons,
  // so everything important stays between SAFE_TOP and SAFE_BOTTOM.
  makeCard: function (item) {
    var lang = I18n.lang;
    var W = 1080, H = 1920;
    var SAFE_TOP = 250, SAFE_BOTTOM = H - 250;
    var TOP = SAFE_TOP - 50;   // all the content below is placed relative to this
    var HEAD = '"Yusei Magic", sans-serif';
    var BODY = '"Yomogi", sans-serif';
    var name = item.name[lang];
    var desc = item.description[lang];
    var you = I18n.t('quiz.you');
    var cat = I18n.t('cat.' + item.category);

    function loadImage(src) {
      return new Promise(function (ok, fail) {
        var im = new Image();
        im.onload = function () { ok(im); };
        im.onerror = fail;
        im.src = src;
      });
    }
    // Make sure the web fonts (and the Japanese glyphs we need) are ready.
    function loadFonts() {
      if (!document.fonts || !document.fonts.load) return Promise.resolve();
      return Promise.all([
        document.fonts.load('40px ' + HEAD, you + name + cat),
        document.fonts.load('40px ' + BODY, desc)
      ]).catch(function () {});
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
    // Break text into lines. English breaks at spaces, Japanese at any character
    // (but never puts 、。！？ at the start of a line).
    function wrap(ctx, text, maxWidth) {
      var parts = text.indexOf(' ') !== -1 ? text.split(' ') : text.split('');
      var joiner = text.indexOf(' ') !== -1 ? ' ' : '';
      var lines = [];
      var line = '';
      parts.forEach(function (part) {
        var test = line ? line + joiner + part : part;
        var keep = '、。！？!?…）」'.indexOf(part) !== -1;
        if (line && !keep && ctx.measureText(test).width > maxWidth) {
          lines.push(line);
          line = part;
        } else {
          line = test;
        }
      });
      if (line) lines.push(line);
      return lines;
    }

    return Promise.all([
      loadImage(thumb(item, 900)),
      loadImage('thumbs/logo-dingding.webp'),
      loadFonts()
    ]).then(function (loaded) {
      var art = loaded[0], logo = loaded[1];
      var canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      var ctx = canvas.getContext('2d');
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';

      // paper
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, W, H);

      // "You are…"
      ctx.fillStyle = '#8c8c8c';
      ctx.font = '44px ' + HEAD;
      ctx.fillText(you, W / 2, TOP + 118);

      // artwork, with rounded corners
      var size = 800, x = (W - size) / 2, y = TOP + 170;
      ctx.save();
      roundedRect(ctx, x, y, size, size, 28);
      ctx.clip();
      ctx.drawImage(art, x, y, size, size);
      ctx.restore();

      // name (shrinks a little if it is very long)
      var nameSize = 84;
      ctx.fillStyle = '#1f1f1f';
      do {
        ctx.font = nameSize + 'px ' + HEAD;
        nameSize -= 4;
      } while (ctx.measureText(name).width > W - 120 && nameSize > 40);
      ctx.fillText(name, W / 2, TOP + 1082);

      // category tag (black pill)
      ctx.font = '34px ' + HEAD;
      var tagW = ctx.measureText(cat).width + 64;
      roundedRect(ctx, (W - tagW) / 2, TOP + 1116, tagW, 58, 29);
      ctx.fillStyle = '#1f1f1f';
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillText(cat, W / 2, TOP + 1157);

      // description
      ctx.fillStyle = '#333333';
      ctx.font = '40px ' + BODY;
      wrap(ctx, desc, W - 200).slice(0, 3).forEach(function (line, i) {
        ctx.fillText(line, W / 2, TOP + 1246 + i * 58);
      });

      var logoW = 300, logoH = logoW * logo.height / logo.width;
      // logo: at the bottom of the safe area
      ctx.drawImage(logo, (W - logoW) / 2, SAFE_BOTTOM - logoH - 12, logoW, logoH);

      return canvas;
    });
  }
};
