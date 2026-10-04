// Section index: highlight the section being read.
(function () {
  var list = document.querySelector('.nav__list');
  if (!list || !('IntersectionObserver' in window)) return;

  var links = Array.prototype.slice.call(list.querySelectorAll('a'));
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var byId = {};
  links.forEach(function (link) {
    byId[link.getAttribute('href').slice(1)] = link;
  });

  function setCurrent(id) {
    var active = byId[id];
    links.forEach(function (link) {
      if (link === active) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });

    // on narrow screens the index scrolls sideways: keep the current link in view
    if (active && list.scrollWidth > list.clientWidth) {
      list.scrollTo({
        left: active.offsetLeft - (list.clientWidth - active.offsetWidth) / 2,
        behavior: reduce ? 'auto' : 'smooth'
      });
    }
  }

  // a section is current while it crosses a line one third of the way down the viewport
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) setCurrent(entry.target.id);
    });
  }, { rootMargin: '-33% 0px -66% 0px' });

  // the hero is observed too, so nothing is highlighted while it is on screen
  ['top'].concat(Object.keys(byId)).forEach(function (id) {
    var section = document.getElementById(id);
    if (section) observer.observe(section);
  });
})();
