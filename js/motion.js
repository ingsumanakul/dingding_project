// Plays a Ding Ding's animation as a light video (made by tools/make_videos.py).
// If the video can't be played, the still picture simply stays.
//
// The <video> is placed on top of the still <img>, inside the same box,
// with the still as its poster, so nothing flickers while it loads.
//
// Some iPhones play a looping video only once, and Low Power Mode blocks
// autoplay altogether. So:
//   - when the video ends, it is started again by hand (on top of `loop`);
//   - when playing is blocked, the video is removed (the still stays) and a
//     small play button is shown; a tap on it plays the video.
var Motion = {
  DIR: 'video/',

  play: function (img, item) {
    this.stop(img);
    img.dataset.motion = item.id;
    var self = this;

    var video = document.createElement('video');
    video.className = 'motion';
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute('autoplay', '');
    video.setAttribute('loop', '');
    video.setAttribute('muted', '');        // needed for autoplay on iOS
    video.setAttribute('playsinline', '');
    video.poster = img.currentSrc || img.src;

    var webm = document.createElement('source');
    var name = item.media || item.id;   // the Secret uses video/ding-normal.*
    webm.src = this.DIR + name + '.webm';
    webm.type = 'video/webm';
    var mp4 = document.createElement('source');
    mp4.src = this.DIR + name + '.mp4';
    mp4.type = 'video/mp4';
    video.appendChild(webm);
    video.appendChild(mp4);

    // Fallback: if no video source works, remove the video.
    // The still <img> underneath is then what you see.
    function useStill() { video.remove(); }
    mp4.addEventListener('error', useStill);  // fires when the last source fails
    video.addEventListener('error', useStill);

    // Loop by hand too, for iPhones that ignore `loop`.
    video.addEventListener('ended', function () {
      video.currentTime = 0;
      start();
    });

    // Playing was blocked (Low Power Mode, data saver...): show the still
    // with a play button instead of a frozen frame.
    function blocked() {
      if (!video.isConnected || !video.paused) return;
      video.remove();
      self.showPlayButton(img, item);
    }
    function start() {
      var started = video.play();
      if (started && started.catch) started.catch(blocked);
    }

    img.parentNode.appendChild(video);
    start();
    // Some browsers neither play nor reject: check again a bit later.
    setTimeout(function () {
      if (video.isConnected && video.paused && video.readyState >= 2) blocked();
    }, 2500);
  },

  // A small round play button over the still. Not inside the Collection
  // tiles (they are buttons themselves, and only animate on mouse hover).
  showPlayButton: function (img, item) {
    var box = img.parentNode;
    if (!box || img.closest('button') || box.querySelector('.motion-play')) return;
    var self = this;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'motion-play';
    btn.setAttribute('aria-label', 'Play');
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      btn.remove();
      self.play(img, item);   // a tap counts as permission to play
    });
    box.appendChild(btn);
  },

  // Stop the animation. Pass stillSrc to put the still picture back.
  stop: function (img, stillSrc) {
    delete img.dataset.motion;
    img.parentNode.querySelectorAll('video.motion, .motion-play').forEach(function (v) {
      if (v.pause) v.pause();
      v.remove();
    });
    if (stillSrc) img.src = stillSrc;
  }
};
