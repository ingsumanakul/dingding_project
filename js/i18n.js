// UI text in English, Thai and Japanese.
// Character names/descriptions live in data/dingding.json.
var STRINGS = {
  en: {
    'nav.home': 'Home',
    'nav.collection': 'Collection',
    'nav.gacha': 'Gacha',
    'nav.quiz': 'Quiz',
    'nav.about': 'About',
    'home.tagline': 'A black-and-white cat, peeking in to say hi.',
    'home.hintCollection': '{n} / {total}',
    'home.hintGacha': 'Try your luck!',
    'home.hintQuiz': 'Which one are you?',
    'collection.title': 'Collection',
    'collection.progress': '{n} / {total} collected',
    'collection.lockedName': '???',
    'collection.lockedDesc': 'Not met yet. Spin the Gacha to find this DING DING!',
    'gacha.title': 'Gacha',
    'gacha.lead': 'Turn the handle and meet a DING DING!',
    'gacha.spin': 'Spin!',
    'gacha.new': 'NEW!',
    'gacha.again': 'Spin again',
    'gacha.see': 'See in Collection',
    'gacha.met': 'Hello again!',
    'reward.complete': 'COMPLETE!',
    'reward.lead': 'You collected every DING DING!',
    'reward.getCert': 'Get your certificate',
    'reward.close': 'Close',
    'reward.title': 'DING DING MASTER',
    'reward.name': 'Your name',
    'reward.date': 'Completed {date}',
    'reward.open': 'Certificate',
    'gacha.secret': 'SECRET!',
    'rarity.common': 'Common',
    'rarity.rare': 'Rare',
    'rarity.super-rare': 'Super Rare',
    'rarity.secret': 'Secret',
    'cat.secret': 'Secret',
    'quiz.title': 'Which DING DING are you?',
    'quiz.lead': 'Five little questions to find your DING DING.',
    'quiz.start': 'Start',
    'quiz.back': '← Back',
    'quiz.you': 'You are…',
    'quiz.save': 'Save as image',
    'quiz.share': 'Save / Share',
    'quiz.again': 'Try again',
    'quiz.find': 'Find me in the Gacha!',
    'about.title': 'Hello!',
    'about.p1': 'DING DING is a cheeky black-and-white cat who loves peeking in from the bottom of the frame.',
    'about.p2': 'Slurping noodles, spinning plates, haunting the stage as a Thai ghost dancer, or very seriously doing nothing at all, DING DING is always up to something a little silly.',
    'about.p3': 'We hope DING DING makes you smile.',
    'about.p4': 'Every DING DING is drawn and animated by Sumana “Ing” Sumanakul of INGINGE DESIGN.',
    'about.groupDing': 'DING DING THE CAT',
    'about.groupIng': 'INGINGE DESIGN',
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
    'reward.complete': 'コンプリート！',
    'reward.lead': 'ディンディンを、ぜんぶあつめたよ！',
    'reward.getCert': '認定証をもらう',
    'reward.close': 'とじる',
    'reward.title': 'ディンディンマスター',
    'reward.name': 'あなたのなまえ',
    'reward.date': '{date} コンプリート',
    'reward.open': '認定証',
    'gacha.secret': 'シークレット！',
    'rarity.common': 'コモン',
    'rarity.rare': 'レア',
    'rarity.super-rare': 'スーパーレア',
    'rarity.secret': 'シークレット',
    'cat.secret': 'シークレット',
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
    'about.p4': 'イラストもアニメーションも、INGINGE DESIGN の Sumana “Ing” Sumanakul が描いています。',
    'about.groupDing': 'DING DING THE CAT',
    'about.groupIng': 'INGINGE DESIGN',
    'cat.all': 'ぜんぶ',
    'cat.food': 'たべもの',
    'cat.music': 'おんがく',
    'cat.outfit': 'おきがえ',
    'cat.seasonal': 'きせつ',
    'cat.spooky': 'おばけ',
    'cat.love': 'すき',
    'cat.daily': 'まいにち',
    'cat.other': 'そのほか'
  },
  th: {
    'nav.home': 'หน้าแรก',
    'nav.collection': 'คอลเลกชัน',
    'nav.gacha': 'กาชา',
    'nav.quiz': 'ควิซ',
    'nav.about': 'เกี่ยวกับ',
    'home.tagline': 'จ๊ะเอ๋ นี่ดิงดิงเอง',
    'home.hintCollection': '{n} / {total}',
    'home.hintGacha': 'ลองเสี่ยงดวงดู!',
    'home.hintQuiz': 'คุณคือตัวไหนนะ?',
    'collection.title': 'คอลเลกชัน',
    'collection.progress': 'สะสมแล้ว {n} / {total}',
    'collection.lockedName': '???',
    'collection.lockedDesc': 'ยังไม่เจอกันเลย ลองหมุนกาชาตามหาดิงดิงตัวนี้สิ!',
    'gacha.title': 'กาชา',
    'gacha.lead': 'หมุนคันโยก แล้วไปเจอดิงดิงกัน!',
    'gacha.spin': 'หมุนเลย!',
    'gacha.new': 'NEW!',
    'gacha.again': 'หมุนอีกรอบ',
    'gacha.see': 'ดูในคอลเลกชัน',
    'gacha.met': 'เจอกันอีกแล้ว!',
    'reward.complete': 'ครบแล้ว!',
    'reward.lead': 'สะสมดิงดิงครบทุกตัวแล้ว!',
    'reward.getCert': 'รับใบประกาศ',
    'reward.close': 'ปิด',
    'reward.title': 'นักสะสมดิงดิง',
    'reward.name': 'ชื่อของคุณ',
    'reward.date': 'สะสมครบเมื่อ {date}',
    'reward.open': 'ใบประกาศ',
    'gacha.secret': 'ตัวลับ!',
    'rarity.common': 'ธรรมดา',
    'rarity.rare': 'แรร์',
    'rarity.super-rare': 'ซูเปอร์แรร์',
    'rarity.secret': 'ตัวลับ',
    'cat.secret': 'ตัวลับ',
    'quiz.title': 'คุณคือดิงดิงตัวไหน?',
    'quiz.lead': 'ตอบคำถามสั้นๆ 5 ข้อ แล้วมาดูกันว่าดิงดิงตัวไหนคือคุณ',
    'quiz.start': 'เริ่มเลย',
    'quiz.back': '← ย้อนกลับ',
    'quiz.you': 'คุณคือ…',
    'quiz.save': 'บันทึกรูป',
    'quiz.share': 'บันทึก / แชร์',
    'quiz.again': 'เล่นอีกรอบ',
    'quiz.find': 'ไปตามหาในกาชานะ!',
    'about.title': 'สวัสดี!',
    'about.p1': 'ดิงดิงคือแมวขาวดำขี้เล่น แอบโผล่ครึ่งตัวมาจากขอบล่างของกรอบรูป',
    'about.p2': 'ซู้ดบะหมี่บ้าง หมุนจานบ้าง แปลงร่างเป็นผีนางรำบนเวทีบ้าง หรือบางวันก็ตั้งใจนั่งเฉยๆ อย่างจริงจังสุดๆ ดิงดิงมีเรื่องเพี้ยนๆ ให้ทำอยู่ตลอด',
    'about.p3': 'หวังว่าดิงดิงจะทำให้คุณยิ้มได้นะ',
    'about.p4': 'ดิงดิงทุกตัว วาดและทำแอนิเมชันโดย Sumana “Ing” Sumanakul แห่ง INGINGE DESIGN',
    'about.groupDing': 'DING DING THE CAT',
    'about.groupIng': 'INGINGE DESIGN',
    'cat.all': 'ทั้งหมด',
    'cat.food': 'ของกิน',
    'cat.music': 'ดนตรี',
    'cat.outfit': 'แต่งตัว',
    'cat.seasonal': 'เทศกาล',
    'cat.spooky': 'ผีๆ',
    'cat.love': 'ความรัก',
    'cat.daily': 'ชีวิตประจำวัน',
    'cat.other': 'อื่นๆ'
  }
};

var LANGS = ['en', 'th', 'ja'];

// Thai has no spaces between words, so the browser uses a dictionary to find
// where a line may break. It does not know some words (like our name), and would
// cut them in half: "ดิง / ดิง", "เนก / ไท". Words in this list are kept together
// (with invisible WORD JOINER characters) in every Thai text when it loads.
// If a Thai word breaks badly on the site, add it here.
var THAI_KEEP = [
  // our name
  'ดิงดิง',
  // loanwords the dictionary cuts into pieces
  'ปลาคาร์ป', 'ทาโกะยากิ', 'ซอฟต์เสิร์ฟ', 'อูคูเลเล่', 'ปอมปาดัวร์', 'แฟรงเกนสไตน์',
  'สตรอว์เบอร์รี', 'เชอร์รี', 'ดังโงะ', 'ยูกาตะ', 'คิวโด', 'เรนเดียร์', 'บันดาน่า',
  'อะคูสติก', 'ร็อกเกอร์', 'เฟดอร่า', 'สเตเดียม', 'ป๊อปคอร์น', 'ออนเซ็น', 'ซันเด',
  'คัพเค้ก', 'สปอตไลต์', 'ลิมิเต็ด', 'ลาเต้', 'แต๊งกิ้ว', 'เวรี่มัช', 'เกียงซี',
  'คอลเลกชัน', 'เนกไท', 'ซูเปอร์แรร์', 'ใบประกาศ',
  // Thai words and set phrases that read badly when split
  'หมากฝรั่ง', 'ไอติม', 'ตรุษจีน', 'ต้มยำกุ้ง', 'ไหมพรม', 'ขยิบตา', 'ตาปรือ', 'ตึกตัก',
  'มนุษย์เงินเดือน', 'หั่นเต๋า', 'นักพูดท้อง', 'ผีนางรำ', 'ร่ายรำ', 'วิบวับ', 'คันโยก',
  'ขี้เล่น', 'สะโพก', 'ตะวันตก', 'ระยิบระยับ', 'แปลงร่าง', 'บางวัน', 'ทั้งวัน', 'คู่กาย',
  'ฝ่ายเดียว', 'จดหมายรัก', 'คนหม้อ', 'ริมทะเล', 'ชูฟ้า', 'สักคำ', 'สุดเก๋', 'ใบใหญ่', 'ตัวลับ'
];

// Thai uses the Mali font. It is only downloaded the first time Thai is shown.
var THAI_FONT = 'https://fonts.googleapis.com/css2?family=Mali:wght@400;600&display=swap';

var I18n = {
  lang: 'en',

  init: function () {
    this.glueThai(STRINGS);
    var saved = Store.get(KEYS.lang, null);
    if (LANGS.indexOf(saved) !== -1) {
      this.lang = saved;
    } else {
      // First visit: follow the browser's main language (th → Thai, ja → Japanese, else English)
      var nav = ((navigator.languages && navigator.languages[0]) || navigator.language || '').toLowerCase();
      this.lang = nav.indexOf('th') === 0 ? 'th' : nav.indexOf('ja') === 0 ? 'ja' : 'en';
    }
  },

  // Keep the THAI_KEEP words together in a Thai text.
  // The joiner goes before each letter, never before a vowel or tone mark
  // that sits above/below a letter (those must stay attached to it).
  keepThaiWords: function (text) {
    THAI_KEEP.forEach(function (word) {
      var glued = word.charAt(0) + word.slice(1).replace(/[^\u0E31\u0E34-\u0E3A\u0E47-\u0E4E]/g, '\u2060$&');
      text = text.split(word).join(glued);
    });
    return text;
  },

  // Apply keepThaiWords to every "th" text inside an object
  // (STRINGS, dingding.json, quiz.json). STRINGS itself has a "th" object, not text.
  glueThai: function (obj) {
    if (Array.isArray(obj)) {
      obj.forEach(function (x) { I18n.glueThai(x); });
    } else if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach(function (k) {
        if (typeof obj[k] === 'string') {
          if (k === 'th' || obj === STRINGS.th) obj[k] = I18n.keepThaiWords(obj[k]);
        } else {
          I18n.glueThai(obj[k]);
        }
      });
    }
    return obj;
  },

  loadThaiFont: function () {
    if (document.getElementById('font-th')) return;
    var link = document.createElement('link');
    link.id = 'font-th';
    link.rel = 'stylesheet';
    link.href = THAI_FONT;
    document.head.appendChild(link);
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
    if (this.lang === 'th') this.loadThaiFont();
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = I18n.t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('.lang-toggle button').forEach(function (btn) {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-lang') === I18n.lang);
    });
  }
};
