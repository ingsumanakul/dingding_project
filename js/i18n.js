// UI text in English and Japanese.
// Character names/descriptions live in data/dingding.json.
var STRINGS = {
  en: {
    'nav.home': 'Home',
    'nav.collection': 'Collection',
    'nav.gacha': 'Gacha',
    'nav.quiz': 'Quiz',
    'nav.about': 'About',
    'home.tagline': 'A little black-and-white cat, peeking in to say hi.',
    'home.hintCollection': '{n} / {total}',
    'home.hintGacha': 'Try your luck!',
    'home.hintQuiz': 'Which one are you?',
    'collection.title': 'Collection',
    'collection.progress': '{n} / {total} collected',
    'collection.lockedName': '???',
    'collection.lockedDesc': 'Not met yet. Spin the Gacha to find this Ding Ding!',
    'gacha.title': 'Gacha',
    'gacha.lead': 'Turn the handle and meet a Ding Ding!',
    'gacha.spin': 'Spin!',
    'gacha.new': 'NEW!',
    'gacha.again': 'Spin again',
    'gacha.see': 'See in Collection',
    'gacha.met': 'Hello again!',
    'quiz.title': 'Which Ding Ding are you?',
    'quiz.lead': 'Five little questions to find your Ding Ding.',
    'quiz.start': 'Start',
    'quiz.back': '← Back',
    'quiz.you': 'You are…',
    'quiz.save': 'Save as image',
    'quiz.share': 'Save / Share',
    'quiz.again': 'Try again',
    'quiz.find': 'Find me in the Gacha!',
    'about.title': 'Hello!',
    'about.p1': 'Ding Ding is a cheeky black-and-white cat who loves peeking in from the bottom of the frame.',
    'about.p2': 'Slurping noodles, spinning plates, haunting the stage as a Thai ghost dancer, or very seriously doing nothing at all, Ding Ding is always up to something a little silly.',
    'about.p3': 'We hope Ding Ding makes you smile.',
    'about.p4': 'Every Ding Ding is drawn and animated by illustrator Sumana “Ing” Sumanakul.',
    'about.groupDing': 'Ding Ding',
    'about.groupIng': 'Ing (the artist)',
    'footer.by': 'drawn by Ing',
    'cat.all': 'All',
    'cat.food': 'Food',
    'cat.music': 'Music',
    'cat.outfit': 'Outfit',
    'cat.seasonal': 'Seasonal',
    'cat.spooky': 'Spooky',
    'cat.love': 'Love',
    'cat.daily': 'Daily life',
    'cat.other': 'Other'
  },
  ja: {
    'nav.home': 'ホーム',
    'nav.collection': 'コレクション',
    'nav.gacha': 'ガチャ',
    'nav.quiz': 'しんだん',
    'nav.about': 'プロフィール',
    'home.tagline': 'ひょっこり、ディンディンです。',
    'home.hintCollection': '{n} / {total}',
    'home.hintGacha': 'なにが出るかな？',
    'home.hintQuiz': 'あなたはどの子？',
    'collection.title': 'コレクション',
    'collection.progress': '{n} / {total} あつめたよ',
    'collection.lockedName': '？？？',
    'collection.lockedDesc': 'まだ会えてないよ。ガチャでさがしてみてね！',
    'gacha.title': 'ガチャ',
    'gacha.lead': 'ハンドルをまわして、ディンディンに会いにいこう！',
    'gacha.spin': 'まわす！',
    'gacha.new': 'NEW!',
    'gacha.again': 'もう一回',
    'gacha.see': 'コレクションで見る',
    'gacha.met': 'また会えたね！',
    'quiz.title': 'あなたはどのディンディン？',
    'quiz.lead': '5つの質問で、あなたにぴったりのディンディンを見つけよう。',
    'quiz.start': 'はじめる',
    'quiz.back': '← もどる',
    'quiz.you': 'あなたは…',
    'quiz.save': '画像を保存',
    'quiz.share': '保存・シェア',
    'quiz.again': 'もう一回やる',
    'quiz.find': 'ガチャでさがしてね！',
    'about.title': 'こんにちは！',
    'about.p1': 'ディンディンは、画面の下からひょっこり顔を出すのが大好きな、ちょっとおちゃめな白黒ねこ。',
    'about.p2': 'ラーメンをすすったり、お皿を回したり、ときどきタイのおばけになったり。いつも、ちょっとへんてこなことをしています。',
    'about.p3': '見て、くすっと笑ってもらえたらうれしいです。',
    'about.p4': 'イラストもアニメーションも、イラストレーターの Sumana “Ing” Sumanakul が描いています。',
    'about.groupDing': 'ディンディン',
    'about.groupIng': 'Ing（イラストレーター）',
    'footer.by': 'イラスト：Ing',
    'cat.all': 'ぜんぶ',
    'cat.food': 'たべもの',
    'cat.music': 'おんがく',
    'cat.outfit': 'おきがえ',
    'cat.seasonal': 'きせつ',
    'cat.spooky': 'おばけ',
    'cat.love': 'すき',
    'cat.daily': 'まいにち',
    'cat.other': 'そのほか'
  }
};

var I18n = {
  lang: 'en',

  init: function () {
    var saved = Store.get(KEYS.lang, null);
    if (saved === 'en' || saved === 'ja') {
      this.lang = saved;
    } else {
      var nav = (navigator.language || '').toLowerCase();
      this.lang = nav.indexOf('ja') === 0 ? 'ja' : 'en';
    }
  },

  setLang: function (lang) {
    this.lang = lang;
    Store.set(KEYS.lang, lang);
  },

  // t('collection.progress', { n: 3, total: 67 })
  t: function (key, vars) {
    var text = STRINGS[this.lang][key] || STRINGS.en[key] || key;
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        text = text.replace('{' + k + '}', vars[k]);
      });
    }
    return text;
  },

  // Fill every element that has data-i18n="key"
  apply: function () {
    document.documentElement.lang = this.lang;
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = I18n.t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('.lang-toggle button').forEach(function (btn) {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-lang') === I18n.lang);
    });
  }
};
