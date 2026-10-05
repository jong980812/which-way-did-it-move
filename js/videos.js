// Reel videos (the hero reel on phones, the DeltaDirect reel): play muted
// while mostly on screen, pause off screen. DeltaDirect has two cuts and the
// page shows one; a hidden video never intersects, so it never loads.
// Under reduced motion, without the script, or when the browser blocks
// autoplay (iOS Low Power Mode), the controls stay so the viewer can play it.
(function () {
  var videos = Array.prototype.slice.call(document.querySelectorAll('.hero__video, .method__video'));
  if (!videos.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;

  // half in view, so a reel starts where the viewer can see its first scene
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var video = entry.target;
      // isIntersecting stays true below the threshold, so check the ratio
      if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
        video.play().catch(function (error) {
          // a pause() before play() resolves rejects too; only a block needs controls
          if (error.name === 'NotAllowedError') video.controls = true;
        });
      } else {
        video.pause();
      }
    });
  }, { threshold: 0.5 });

  videos.forEach(function (video) {
    video.controls = false;
    observer.observe(video);
  });
})();
