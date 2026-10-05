// Section index: highlight the section being read. On narrow screens the
// index folds into a bar that names that section ("03 / 07 MoDirect") over a
// reading-progress line; the bar's button opens the full list.
(function () {
  var nav = document.querySelector('.nav');
  var list = nav && nav.querySelector('.nav__list');
  if (!list) return;

  var toggle = nav.querySelector('.nav__now');
  var count = nav.querySelector('.nav__count');
  var name = nav.querySelector('.nav__name');
  var progress = nav.querySelector('.nav__progress span');
  var title = name.textContent;
  var links = Array.prototype.slice.call(list.querySelectorAll('a'));
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var byId = {};
  links.forEach(function (link) {
    byId[link.getAttribute('href').slice(1)] = link;
  });

  function pad(n) {
    return (n < 10 ? '0' : '') + n;
  }

  function setCurrent(id) {
    var active = byId[id];
    links.forEach(function (link) {
      if (link === active) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });

    // the bar: the paper's title over the hero, then the section's number and name
    var index = links.indexOf(active);
    nav.classList.toggle('is-home', index < 0);
    count.textContent = index < 0 ? '' : pad(index + 1) + ' / ' + pad(links.length);
    name.textContent = index < 0 ? title : active.textContent;

    // a wide index that still overflows scrolls sideways: keep the current link in view
    if (active && list.scrollWidth > list.clientWidth) {
      list.scrollTo({
        left: active.offsetLeft - (list.clientWidth - active.offsetWidth) / 2,
        behavior: reduce ? 'auto' : 'smooth'
      });
    }
  }

  // ---------- the folded list ----------
  function setOpen(open) {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  }

  toggle.addEventListener('click', function () {
    setOpen(!nav.classList.contains('is-open'));
  });

  // picking a section, a tap outside, or Escape closes it
  list.addEventListener('click', function (event) {
    if (event.target.closest('a')) setOpen(false);
  });

  document.addEventListener('click', function (event) {
    if (!nav.contains(event.target)) setOpen(false);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) {
      setOpen(false);
      toggle.focus();
    }
  });

  // ---------- reading progress ----------
  var pending = false;

  function drawProgress() {
    pending = false;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var share = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
    progress.style.transform = 'scaleX(' + share + ')';
  }

  function queueProgress() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(drawProgress);
  }

  window.addEventListener('scroll', queueProgress, { passive: true });
  window.addEventListener('resize', queueProgress);
  drawProgress();

  // CSS shows the bar only once the script can keep it current
  nav.classList.add('is-ready');

  if (!('IntersectionObserver' in window)) return;

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
