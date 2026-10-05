// DeltaDirect reel: plays muted while on screen, pauses off screen. The page
// shows one of two cuts; the hidden one never intersects, so it never loads.
// Under reduced motion, without the script, or when the browser blocks
// autoplay (iOS Low Power Mode), the controls stay so the viewer can play it.
(function () {
  var videos = Array.prototype.slice.call(document.querySelectorAll('.method__video'));
  if (!videos.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var video = entry.target;
      if (entry.isIntersecting) {
        video.play().catch(function (error) {
          // a pause() before play() resolves rejects too; only a block needs controls
          if (error.name === 'NotAllowedError') video.controls = true;
        });
      } else {
        video.pause();
      }
    });
  }, { threshold: 0.25 });

  videos.forEach(function (video) {
    video.controls = false;
    observer.observe(video);
  });
})();
