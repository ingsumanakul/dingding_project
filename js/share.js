// Saving a card image (quiz result, certificate).
//
// Every tap on "Save" ends in one of three ways, never in nothing:
//   1. the share sheet ("Save Image", Instagram…): phones that can share files;
//   2. a download of the PNG: desktop, or when sharing is not possible or fails;
//   3. the card shown full screen with "Press and hold the image to save":
//      in-app browsers (Instagram, Facebook, LINE), which usually block both
//      sharing files and downloads, or when the other two can't run.
var Share = {
  // Instagram / Facebook / LINE open links in their own little browser.
  isInApp: function () {
    return /Instagram|FBAN|FBAV|FB_IAB|Line\//i.test(navigator.userAgent || '');
  },

  // Can this browser share this file (or, without a file, a PNG at all)?
  canShareFiles: function (file) {
    try {
      if (this.isInApp()) return false;
      var touch = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
      var test = file || new File([''], 'test.png', { type: 'image/png' });
      return !!(touch && navigator.share && navigator.canShare && navigator.canShare({ files: [test] }));
    } catch (e) {
      return false;
    }
  },

  // Canvas → Promise for a PNG File.
  toFile: function (canvas, name) {
    return new Promise(function (ok, fail) {
      canvas.toBlob(function (blob) {
        if (!blob) return fail(new Error('toBlob failed'));
        ok(new File([blob], name, { type: 'image/png' }));
      }, 'image/png');
    });
  },

  // Call it straight from the tap with a file that is already made:
  // iOS only opens the share sheet during the tap.
  save: function (file) {
    if (this.isInApp()) this.showImage(file);
    else if (this.canShareFiles(file)) this.share(file);
    else this.download(file);
  },

  share: function (file) {
    var self = this;
    try {
      navigator.share({ files: [file] }).catch(function (err) {
        // AbortError = the user closed the share sheet: that's fine.
        if (err && err.name === 'AbortError') return;
        self.download(file);
      });
    } catch (e) {
      this.download(file);
    }
  },

  download: function (file) {
    try {
      var link = document.createElement('a');
      link.href = URL.createObjectURL(file);
      link.download = file.name;
      if (!('download' in link)) throw new Error('no download support');
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(function () { URL.revokeObjectURL(link.href); }, 60000);
    } catch (e) {
      this.showImage(file);
    }
  },

  // Full-screen view of the card; the user saves it with a long press.
  // A data: URL (not a blob: URL), so the phone's "Save image" can read it.
  // Without a file (the card could not be made), it says so instead.
  showImage: function (file) {
    var view = document.getElementById('save-view');
    var img = document.getElementById('save-view-img');
    var text = document.getElementById('save-view-text');
    function open() {
      if (view.open) return;
      if (view.showModal) view.showModal(); else view.setAttribute('open', '');
    }
    img.hidden = !file;
    text.textContent = I18n.t(file ? 'save.hold' : 'save.failed');
    if (!file) { img.removeAttribute('src'); open(); return; }
    var reader = new FileReader();
    reader.onload = function () { img.src = reader.result; open(); };
    reader.onerror = function () { img.src = URL.createObjectURL(file); open(); };
    reader.readAsDataURL(file);
  },

  // The card could not be made at all: say so, don't stay silent.
  failed: function (err) {
    console.error('Could not make the card image', err);
    this.showImage(null);
  },

  init: function () {
    var view = document.getElementById('save-view');
    function close() {
      if (view.close) view.close(); else view.removeAttribute('open');
    }
    document.getElementById('save-view-close').addEventListener('click', close);
    // a tap on the dark background closes it too (not on the image: that's for saving)
    view.addEventListener('click', function (e) { if (e.target === view) close(); });
    this.initBanner();
  },

  // In-app browsers: a small banner at the top, "open in your browser".
  // Closed once = closed for good (remembered in localStorage).
  initBanner: function () {
    var banner = document.getElementById('inapp-banner');
    if (!this.isInApp() || Store.get(KEYS.inappBanner, false)) return;
    banner.hidden = false;
    document.getElementById('inapp-close').addEventListener('click', function () {
      banner.hidden = true;
      Store.set(KEYS.inappBanner, true);
    });
  },

  // The button label: "Save / Share" when the share sheet opens, else "Save as image".
  labelKey: function () {
    return this.canShareFiles() ? 'quiz.share' : 'quiz.save';
  }
};
