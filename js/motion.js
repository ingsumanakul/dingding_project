// Plays a Ding Ding's animation as a light video (made by tools/make_videos.py).
// If the video can't be played, the still picture simply stays.
//
// The <video> is placed on top of the still <img>, inside the same box,
// with the still as its poster, so nothing flickers while it loads.
var Motion = {
  DIR: 'video/',

  play: function (img, item) {
    this.stop(img);
    img.dataset.motion = item.id;

    var video = document.createElement('video');
    video.className = 'motion';
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute('muted', '');        // needed for autoplay on iOS
    video.setAttribute('playsinline', '');
    video.poster = img.currentSrc || img.src;

    var webm = document.createElement('source');
    webm.src = this.DIR + item.id + '.webm';
    webm.type = 'video/webm';
    var mp4 = document.createElement('source');
    mp4.src = this.DIR + item.id + '.mp4';
    mp4.type = 'video/mp4';
    video.appendChild(webm);
    video.appendChild(mp4);

    // Fallback: if no video source works, remove the video.
    // The still <img> underneath is then what you see.
    function useStill() { video.remove(); }
    mp4.addEventListener('error', useStill);  // fires when the last source fails
    video.addEventListener('error', useStill);

    img.parentNode.appendChild(video);
    var started = video.play();
    if (started && started.catch) started.catch(function () {}); // autoplay blocked: poster stays
  },

  // Stop the animation. Pass stillSrc to put the still picture back.
  stop: function (img, stillSrc) {
    delete img.dataset.motion;
    img.parentNode.querySelectorAll('video.motion').forEach(function (v) {
      v.pause();
      v.remove();
    });
    if (stillSrc) img.src = stillSrc;
  }
};
