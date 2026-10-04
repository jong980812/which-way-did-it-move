// Method diagram: pause the loop while it is off screen.
(function () {
  var diagram = document.querySelector('.dd');
  if (!diagram || !('IntersectionObserver' in window)) return;

  new IntersectionObserver(function (entries) {
    diagram.classList.toggle('is-paused', !entries[0].isIntersecting);
  }).observe(diagram);
})();
