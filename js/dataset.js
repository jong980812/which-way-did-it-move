// Dataset clips: play only while visible; no autoplay under reduced motion.
(function () {
  var clips = Array.prototype.slice.call(document.querySelectorAll('.clip video'));
  if (!clips.length) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    clips.forEach(function (video) {
      video.removeAttribute('autoplay');
      video.pause();
      video.controls = true;
    });
    return;
  }

  if (!('IntersectionObserver' in window)) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.play().catch(function () {});
      } else {
        entry.target.pause();
      }
    });
  }, { threshold: 0.25 });

  clips.forEach(function (video) {
    observer.observe(video);
  });
})();
