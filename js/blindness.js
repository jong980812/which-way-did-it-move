// Blindness strip: every model evaluated without direction tuning, as a mark
// on a 0-100 accuracy axis. Marks that would overlap stack upward.
(function () {
  var strip = document.querySelector('.strip');
  if (!strip) return;

  var plot = strip.querySelector('.strip__plot');
  var readout = strip.querySelector('.strip__readout');
  var hint = readout.textContent;
  var STEP = 20; // px between stacked marks

  fetch(strip.getAttribute('data-src'))
    .then(function (res) { return res.json(); })
    .then(function (data) {
      var table = data.table1;
      var models = [];
      table.groups.forEach(function (group) {
        if (group.key === 'ours') return;
        group.rows.forEach(function (row) {
          models.push({ name: row.model, value: row.syn[row.syn.length - 1], group: group });
        });
      });
      models.sort(function (a, b) { return a.value - b.value; });
      build(models, table.chance.syn[table.chance.syn.length - 1]);
    })
    .catch(function () { strip.closest('figure').hidden = true; });

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function build(models, chance) {
    var field = el('div', 'strip__field');
    var best = models[models.length - 1];

    var chanceLine = el('span', 'strip__chance');
    chanceLine.style.left = chance + '%';
    chanceLine.appendChild(el('b', '', 'chance ' + chance + '%'));
    field.appendChild(chanceLine);

    models.forEach(function (model) {
      var button = el('button', 'strip__mark');
      button.type = 'button';
      button.style.left = model.value + '%';
      button.setAttribute('aria-label', model.name + ', ' + model.value.toFixed(1) + '%');
      button.appendChild(el('i', 'mark mark--' + model.group.key));
      ['mouseenter', 'focus', 'click'].forEach(function (type) {
        button.addEventListener(type, function () {
          readout.textContent = model.name + ': ' + model.value.toFixed(1) + '% (' + model.group.name.toLowerCase() + ')';
          readout.classList.add('is-active');
        });
      });
      ['mouseleave', 'blur'].forEach(function (type) {
        button.addEventListener(type, function () {
          readout.textContent = hint;
          readout.classList.remove('is-active');
        });
      });
      model.button = button;
      field.appendChild(button);
    });

    // the one direct label: the best model
    var label = el('span', 'strip__label', best.name + ' ' + best.value.toFixed(1) + '%');
    label.style.left = best.value + '%';
    field.appendChild(label);

    var axis = el('div', 'strip__axis');
    [0, 25, 50, 75, 100].forEach(function (tick) {
      var mark = el('span', 'strip__tick', String(tick));
      mark.style.left = tick + '%';
      axis.appendChild(mark);
    });

    plot.appendChild(field);
    plot.appendChild(axis);

    function layout() {
      var gap = STEP / field.clientWidth * 100;
      var rows = [];
      models.forEach(function (model) {
        var row = 0;
        while (rows[row] !== undefined && model.value - rows[row] < gap) row += 1;
        rows[row] = model.value;
        model.row = row;
        model.button.style.bottom = row * STEP + 'px';
      });
      label.style.bottom = (best.row + 1) * STEP + 6 + 'px';
      field.style.height = Math.max(rows.length, best.row + 2) * STEP + 34 + 'px';
    }

    layout();
    window.addEventListener('resize', layout);
  }
})();
