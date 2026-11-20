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
    // the Secret can only be found in the Gacha, never here
    items = items.filter(function (it) { return it.rarity !== 'secret'; });
    this.items = items;
    this.questions = (quiz && quiz.questions) || [];
    var self = this;

    document.getElementById('quiz-start').addEventListener('click', function () { self.start(); });
    document.getElementById('quiz-last').addEventListener('click', function () { self.showLast(); });
    document.getElementById('quiz-back').addEventListener('click', function () { self.back(); });
    document.getElementById('quiz-again').addEventListener('click', function () { self.start(); });
    var saveBtn = document.getElementById('quiz-save');
    saveBtn.addEventListener('click', function () { self.save(); });
    // On phones the button opens the share sheet ("Save Image", Instagram…).
    saveBtn.setAttribute('data-i18n', Share.labelKey());
    saveBtn.textContent = I18n.t(Share.labelKey());
    // Unlocked result: "See in Collection". Still locked: "Find me in the Gacha!"
    document.getElementById('quiz-see').addEventListener('click', function () {
      if (self.result && Collection.isUnlocked(self.result.id)) {
        Collection.pendingOpen = self.result.id;
        location.hash = '#collection';
      } else {
        location.hash = '#gacha';
      }
    });

    this.reset();
  },

  // The last finished result (saved in localStorage), or null.
  lastResult: function () {
    var savedId = Store.get(KEYS.quiz, null);
    return this.items.filter(function (it) { return it.id === savedId; })[0] || null;
  },

  // Back to the start screen and forget any half-done answers.
  // app.js calls this every time the Quiz page is opened or left.
  reset: function () {
    this.answers = [];
    this.result = null;
    this.step = -1;
    this.render();
  },

  // "See my last result": show the saved result card again.
  showLast: function () {
    var last = this.lastResult();
    if (!last) return;
    this.result = last;
    this.step = this.questions.length;
    this.render();
    window.scrollTo(0, 0);
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
    document.getElementById('quiz-last-wrap').hidden = !(isIntro && this.lastResult());

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
    if (Share.canShareFiles()) this.prepareCard(item);
  },

  // ---- save / share as PNG (js/share.js) -----------------------------
  card: null,   // { key, file, promise }: the last prepared card

  // Returns a Promise for the card as a PNG File. Cached per Ding Ding + language.
  prepareCard: function (item) {
    var key = item.id + '-' + I18n.lang;
    if (this.card && this.card.key === key) return this.card.promise;
    var card = { key: key, file: null };
    card.promise = this.makeCard(item).then(function (canvas) {
      return Share.toFile(canvas, 'dingding-' + item.id + '.png');
    }).then(function (file) {
      card.file = file;
      return file;
    });
    card.promise.catch(function () { if (Quiz.card === card) Quiz.card = null; });
    this.card = card;
    return card.promise;
  },

  save: function () {
    var item = this.result;
    if (!item) return;
    var key = item.id + '-' + I18n.lang;
    var ready = this.card && this.card.key === key && this.card.file;
    // Card already made: save/share straight away, during the tap.
    var handoff = { go: 'quiz', r: item.id };   // for "Open in Chrome" (js/share.js)
    if (ready) {
      Share.save(ready, handoff);
      return;
    }
    this.prepareCard(item).then(function (file) {
      Share.save(file, handoff);
    }).catch(function (err) {
      Share.failed(err);
    });
  },

  // Returns a Promise for a 1080 x 1920 canvas (Instagram Story size, 9:16).
  // Instagram covers about 250px at the top and bottom with its own buttons,
  // so everything important stays between SAFE_TOP and SAFE_BOTTOM.
  makeCard: function (item) {
    var lang = I18n.lang;
    var W = 1080, H = 1920;
    var SAFE_TOP = 250, SAFE_BOTTOM = H - 250;
    var TOP = SAFE_TOP - 50;   // all the content below is placed relative to this
    var thai = lang === 'th';
    var mali = lang !== 'ja';   // English and Thai use Mali, Japanese Yusei Magic + Yomogi
    var HEAD = mali ? '600 {size} "Mali", sans-serif' : '{size} "Yusei Magic", sans-serif';
    var BODY = mali ? '{size} "Mali", sans-serif' : '{size} "Yomogi", sans-serif';
    function font(family, size) { return family.replace('{size}', size + 'px'); }
    // Drawn texts never contain the invisible Thai joiners (see I18n.plain).
    // desc keeps them only for wrapping (so kept words stay whole), and every
    // line is made plain before it is measured or drawn.
    var name = I18n.plain(item.name[lang]);
    var desc = item.description[lang];
    var you = I18n.plain(I18n.t('quiz.you'));
    var cat = I18n.plain(I18n.t('cat.' + item.category));
    var MAX_LINES = 3;
    var HANDLE = '@dingding.thecat by @inginge.design';
    // where to play, for people who see a shared card (a picture, so it can't be tapped)
    var PLAY_URL = 'ingsumanakul.github.io/dingding_project/#quiz';
    var LATIN = '{size} "Yusei Magic", sans-serif';   // the handle line, in every language

    function loadImage(src) {
      return new Promise(function (ok, fail) {
        var im = new Image();
        im.onload = function () { ok(im); };
        im.onerror = fail;
        im.src = src;
      });
    }
    // Wait for every font used on the card (and the Japanese/Thai glyphs we need).
    function loadFonts() {
      return I18n.fontsReady([
        [font(HEAD, 40), you + name + cat],
        [font(BODY, 40), I18n.plain(desc)],
        [font(LATIN, 40), HANDLE + PLAY_URL]
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
    // Break text into lines. English breaks at spaces, Japanese at any character
    // (but never puts 、。！？ at the start of a line).
    // Thai has no spaces between words, so it is split into whole words with
    // Intl.Segmenter (or only at spaces in old browsers), and a very short last
    // line gets a word from the line above, so no word is left alone.
    function wrap(ctx, text, maxWidth) {
      if (thai) {
        // balance: the narrowest width that still gives the same number of lines
        var lines = wrapThai(ctx, text, maxWidth);
        for (var w = maxWidth - 20; w > maxWidth / 2; w -= 20) {
          var tryLines = wrapThai(ctx, text, w);
          if (tryLines.length > lines.length) break;
          lines = tryLines;
        }
        return lines;
      }
      text = I18n.plain(text);
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
    function wrapThai(ctx, text, maxWidth) {
      var words;
      if (window.Intl && Intl.Segmenter) {
        words = Array.from(new Intl.Segmenter('th', { granularity: 'word' }).segment(text), function (s) { return s.segment; });
      } else {
        words = text.split(/( )/);
      }
      // lines as lists of words; a space or punctuation never starts a line
      var lines = [[]];
      words.forEach(function (w) {
        var line = lines[lines.length - 1];
        var prevWord = line[line.length - 1] || '';
        var stick = /^[\s!?…)”’.,\u2060]+$/.test(w) || /\u2060$/.test(prevWord);
        if (line.length && !stick && ctx.measureText(I18n.plain(line.join('') + w)).width > maxWidth) {
          lines.push([w]);
        } else {
          line.push(w);
        }
      });
      // no lonely word: move words down until the last line is at least a third full
      var last = lines[lines.length - 1], prev = lines[lines.length - 2];
      while (prev && prev.length > 1 &&
             ctx.measureText(I18n.plain(last.join(''))).width < maxWidth / 3 &&
             ctx.measureText(I18n.plain(prev[prev.length - 1] + last.join(''))).width <= maxWidth) {
        last.unshift(prev.pop());
      }
      return lines.map(function (l) { return I18n.plain(l.join('')).trim(); }).filter(Boolean);
    }
    // At most MAX_LINES lines; if there is more, the last one ends with "…".
    function clampLines(ctx, lines, maxWidth) {
      if (lines.length <= MAX_LINES) return lines;
      lines = lines.slice(0, MAX_LINES);
      var last = lines[MAX_LINES - 1];
      while (last && ctx.measureText(last + '…').width > maxWidth) last = last.slice(0, -1);
      lines[MAX_LINES - 1] = last.trim() + '…';
      return lines;
    }

    return Promise.all([
      loadImage(thumb(item, 900)),
      loadImage('thumbs/logo-dingding.webp'),
      loadFonts()
    ]).then(function (loaded) {
      var art = loaded[0], logo = loaded[1];
      return drawStory(art, logo);
    });

    // name: shrinks a little if it is very long
    function drawName(ctx, size, maxWidth, x, y) {
      ctx.fillStyle = '#1f1f1f';
      do {
        ctx.font = font(HEAD, size);
        size -= 4;
      } while (ctx.measureText(name).width > maxWidth && size > 40);
      I18n.fillCentered(ctx, name, x, y);
    }
    // category tag (black pill), centred on x; y = top of the pill
    function drawTag(ctx, x, y) {
      ctx.font = font(HEAD, 34);
      var tagW = ctx.measureText(cat).width + 64;
      roundedRect(ctx, x - tagW / 2, y, tagW, 58, 29);
      ctx.fillStyle = '#1f1f1f';
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      I18n.fillCentered(ctx, cat, x, y + 41);
    }
    // The signature at the bottom, top to bottom: the DING DING logo, the quiz
    // link in a black pill (white letters), then the Instagram handles, small.
    // bottom = where the handles line sits (its baseline).
    function drawSignature(ctx, logo, x, bottom) {
      var logoW = 220, logoH = logoW * logo.height / logo.width;
      var linkSize = 22, padX = 26, pillH = 46, handleSize = 20;
      var handleY = bottom;
      var pillY = handleY - handleSize - 20 - pillH;
      var logoY = pillY - 30 - logoH;

      ctx.drawImage(logo, x - logoW / 2, logoY, logoW, logoH);

      ctx.font = font(LATIN, linkSize);
      var pillW = ctx.measureText(PLAY_URL).width + padX * 2;
      ctx.fillStyle = '#1f1f1f';
      roundedRect(ctx, x - pillW / 2, pillY, pillW, pillH, pillH / 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.textBaseline = 'middle';
      I18n.fillCentered(ctx, PLAY_URL, x, pillY + pillH / 2 + 1);
      ctx.textBaseline = 'alphabetic';

      ctx.fillStyle = '#9a9a9a';
      ctx.font = font(LATIN, handleSize);
      I18n.fillCentered(ctx, HANDLE, x, handleY);
    }

    function drawStory(art, logo) {
      var canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      var ctx = canvas.getContext('2d');
      ctx.textAlign = 'left';   // lines are centred by I18n.fillCentered
      ctx.textBaseline = 'alphabetic';

      // paper
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, W, H);

      // "You are…"
      ctx.fillStyle = '#8c8c8c';
      ctx.font = font(HEAD, 44);
      I18n.fillCentered(ctx, you, W / 2, TOP + 118);

      // artwork, with rounded corners
      var size = 640, x = (W - size) / 2, y = TOP + 170;
      ctx.save();
      roundedRect(ctx, x, y, size, size, 28);
      ctx.clip();
      ctx.drawImage(art, x, y, size, size);
      ctx.restore();

      var below = y + size;   // everything else is placed under the artwork
      // Thai marks above and below need a little more room
      drawName(ctx, mali ? 76 : 84, W - 120, W / 2, below + 112);
      drawTag(ctx, W / 2, below + (mali ? 158 : 146));

      // description
      ctx.fillStyle = '#333333';
      ctx.font = font(BODY, mali ? 36 : 40);
      clampLines(ctx, wrap(ctx, desc, W - 200), W - 200).forEach(function (line, i) {
        I18n.fillCentered(ctx, line, W / 2, below + (mali ? 278 : 276) + i * (mali ? 54 : 58));
      });

      // logo, link and handles at the bottom of the safe area
      drawSignature(ctx, logo, W / 2, SAFE_BOTTOM);
      return canvas;
    }
  }
};
