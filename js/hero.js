// Hero scene: pause the loop while it is off screen.
(function () {
  var scene = document.querySelector('.scene');
  if (!scene || !('IntersectionObserver' in window)) return;

  new IntersectionObserver(function (entries) {
    scene.classList.toggle('is-paused', !entries[0].isIntersecting);
  }).observe(scene);
})();
