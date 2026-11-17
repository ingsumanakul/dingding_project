// Small safe wrapper around localStorage.
// Every read/write is in try/catch so the site still works
// in private mode or when storage is blocked.
var Store = {
  get: function (key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  },
  set: function (key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      // storage unavailable: ignore, the site keeps working
    }
  }
};

// Keys used across the site
var KEYS = {
  lang: 'dd.lang',              // "en" | "th" | "ja"
  unlocked: 'dd.unlocked',      // array of ids, written by the Gacha
  quiz: 'dd.quiz',              // id of the last quiz result
  completed: 'dd.completed',    // "YYYY-MM-DD": the day every DING DING was collected
  player: 'dd.player',          // the name on the certificate
  inappBanner: 'dd.inappBanner', // true once the "open in your browser" banner was closed
  secretWait: 'dd.secretWait'   // spins so far with only the Secret missing (js/gacha.js)
};
