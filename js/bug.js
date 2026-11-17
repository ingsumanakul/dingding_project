// "Found a bug? Tell us" link in the footer (shown on the About page only).
// The site has no server, so reports go to the DING DING Instagram DMs.
// On tap: copy a short report (page, language, device, progress) to the
// clipboard, show a note, and the link itself opens the Instagram chat.
var BUG_DM = 'https://ig.me/m/dingding.thecat';

var Bug = {
  lastPage: null,   // the page before About, where the bug probably was

  // Called by showPage() in app.js on every page change.
  notePage: function (name) {
    var before = document.body.getAttribute('data-page');
    if (before && before !== name && before !== 'about') this.lastPage = before;
  },

  init: function () {
    var self = this;
    var link = document.getElementById('report-bug');
    link.href = BUG_DM;
    link.addEventListener('click', function () { self.copyReport(); });
  },

  report: function () {
    var t = Collection.totals();   // same count as the Collection page
    return [
      I18n.t('bug.what'),
      '',
      '',
      '---',
      'DING DING bug report',
      'Page: ' + (this.lastPage || 'about'),
      'Language: ' + I18n.lang,
      'Collected: ' + t.n + ' / ' + t.total + (t.secretFound ? '' : ' + ???'),
      'Screen: ' + window.innerWidth + 'x' + window.innerHeight,
      'Browser: ' + navigator.userAgent,
      'Time: ' + new Date().toISOString()
    ].join('\n');
  },

  copyReport: function () {
    var toast = document.getElementById('bug-toast');
    function show() {
      toast.textContent = I18n.t('bug.copied');
      toast.hidden = false;
      clearTimeout(Bug.timer);
      Bug.timer = setTimeout(function () { toast.hidden = true; }, 6000);
    }
    try {
      // the chat still opens if copying is not allowed
      navigator.clipboard.writeText(this.report()).then(show).catch(function () {});
    } catch (e) {}
  }
};
