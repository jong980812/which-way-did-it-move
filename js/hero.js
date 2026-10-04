// Hero prompt card: pause the loop while it is off screen.
(function () {
  var card = document.querySelector('.mcq');
  if (!card || !('IntersectionObserver' in window)) return;

  new IntersectionObserver(function (entries) {
    card.classList.toggle('is-paused', !entries[0].isIntersecting);
  }).observe(card);
})();
