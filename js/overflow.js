// Sideways scrollers: mark the edge that still hides content (data-more =
// start, end or both), so CSS can fade it and the scroll is discoverable.
(function () {
  var scrollers = Array.prototype.slice.call(
    document.querySelectorAll('.nav__list, .table-wrap, .eq, .bibtex__code')
  );
  if (!scrollers.length) return;

  function update(node) {
    var max = node.scrollWidth - node.clientWidth;
    var x = Math.abs(node.scrollLeft);
    var more = max <= 1 ? '' : x <= 1 ? 'end' : x >= max - 1 ? 'start' : 'both';
    if (more) {
      node.setAttribute('data-more', more);
    } else {
      node.removeAttribute('data-more');
    }
  }

  function updateAll() {
    scrollers.forEach(update);
  }

  scrollers.forEach(function (node) {
    node.addEventListener('scroll', function () { update(node); }, { passive: true });
  });
  updateAll();

  // sizes change when a fold opens, a table is filled in, or the fonts arrive
  if ('ResizeObserver' in window) {
    var observer = new ResizeObserver(function (entries) {
      entries.forEach(function (entry) { update(entry.target); });
    });
    scrollers.forEach(function (node) { observer.observe(node); });
  } else {
    window.addEventListener('resize', updateAll);
  }
  window.addEventListener('load', updateAll);
})();
