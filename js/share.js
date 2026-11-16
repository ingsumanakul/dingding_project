// Saving a card image (quiz result, certificate).
// Phones (touch screen + Web Share with files): open the share sheet
// ("Save Image", Instagram…). Desktop, or no file sharing: download the PNG.
var Share = {
  canShareFiles: function () {
    try {
      var touch = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
      var test = new File([''], 'test.png', { type: 'image/png' });
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

  // Share sheet or download. Call it straight from the tap with a file that
  // is already made: iOS only opens the share sheet during the tap.
  save: function (file) {
    if (this.canShareFiles()) this.share(file);
    else this.download(file);
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

  // The button label: "Save / Share" on phones, "Save as image" elsewhere.
  labelKey: function () {
    return this.canShareFiles() ? 'quiz.share' : 'quiz.save';
  }
};
