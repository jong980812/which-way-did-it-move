// BibTeX: copy the entry to the clipboard.
(function () {
  var button = document.querySelector('.bibtex__copy');
  var code = document.querySelector('.bibtex__code code');
  if (!button || !code) return;

  var label = button.textContent;
  var timer;

  function done() {
    button.textContent = 'Copied';
    clearTimeout(timer);
    timer = setTimeout(function () { button.textContent = label; }, 2000);
  }

  // fallback for browsers without the async clipboard API
  function copyBySelection() {
    var range = document.createRange();
    range.selectNodeContents(code);
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    if (document.execCommand('copy')) done();
    selection.removeAllRanges();
  }

  button.addEventListener('click', function () {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code.textContent).then(done, copyBySelection);
    } else {
      copyBySelection();
    }
  });
})();
