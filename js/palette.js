// PREVIEW: palette switcher. Sets data-accent on <html> (yellow, navy or
// green; tokens.css holds the colours). The choice is remembered in this
// browser; ?accent=navy or ?accent=green in the URL opens a palette for a
// shared link. The inline script in <head> applies it before the first paint.
(function () {
  var root = document.documentElement;
  var buttons = Array.prototype.slice.call(document.querySelectorAll('.palette [data-accent]'));
  if (!buttons.length) return;

  function show(name) {
    if (name === 'yellow') {
      root.removeAttribute('data-accent');
    } else {
      root.setAttribute('data-accent', name);
    }
    buttons.forEach(function (button) {
      button.setAttribute('aria-pressed', String(button.getAttribute('data-accent') === name));
    });
  }

  buttons.forEach(function (button) {
    button.addEventListener('click', function () {
      var name = button.getAttribute('data-accent');
      show(name);
      try { localStorage.setItem('accent', name); } catch (e) {}
    });
  });

  show(root.getAttribute('data-accent') || 'yellow');
})();
