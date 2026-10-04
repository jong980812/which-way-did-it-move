// Results: bar chart with a SynBench / RealBench toggle, and the paper's tables.
(function () {
  var chart = document.querySelector('.chart');
  if (!chart) return;

  fetch(chart.getAttribute('data-src'))
    .then(function (res) { return res.json(); })
    .then(function (data) {
      buildChart(data.table1);
      Array.prototype.forEach.call(document.querySelectorAll('[data-table]'), function (slot) {
        var key = slot.getAttribute('data-table');
        slot.appendChild(key === 'table1' ? mainTable(data.table1) : simpleTable(data[key]));
      });
    })
    .catch(function () { chart.closest('figure').hidden = true; });

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  // ---------- chart ----------
  function buildChart(table) {
    var plot = chart.querySelector('.chart__plot');
    var buttons = Array.prototype.slice.call(chart.querySelectorAll('[data-bench]'));
    var rows = [];

    table.groups.forEach(function (group) {
      plot.appendChild(el('p', 'chart__group', group.name));
      group.rows.forEach(function (row) {
        var line = el('div', 'chart__row' + (row.ours ? ' is-ours' : ''));
        var track = el('span', 'chart__track');
        var bar = el('span', 'chart__bar');
        var value = el('span', 'chart__val');
        track.appendChild(bar);
        track.appendChild(value);
        line.appendChild(el('span', 'chart__label', row.model));
        line.appendChild(track);
        plot.appendChild(line);
        rows.push({ bar: bar, value: value, syn: row.syn[row.syn.length - 1], real: row.real[row.real.length - 1] });
      });
    });

    var chanceRow = el('p', 'chart__chance');
    var chanceLabel = el('span');
    chanceRow.appendChild(chanceLabel);
    plot.appendChild(chanceRow);

    var chance = {
      syn: table.chance.syn[table.chance.syn.length - 1],
      real: table.chance.real[table.chance.real.length - 1]
    };

    function show(bench) {
      plot.style.setProperty('--chance', chance[bench] + '%');
      chanceLabel.textContent = 'chance ' + chance[bench].toFixed(1);
      rows.forEach(function (row) {
        row.bar.style.width = row[bench] + '%';
        row.value.style.left = row[bench] + '%';
        row.value.textContent = row[bench].toFixed(1);
      });
      buttons.forEach(function (button) {
        button.setAttribute('aria-pressed', String(button.getAttribute('data-bench') === bench));
      });
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () { show(button.getAttribute('data-bench')); });
    });
    show('syn');
  }

  // ---------- Table 1 ----------
  function mainTable(table) {
    var all = [];
    table.groups.forEach(function (group) { all = all.concat(group.rows); });

    function values(row) { return row.syn.concat(row.real, [row.overall]); }
    function deviations(row) { return row.synSd ? row.synSd.concat(row.realSd, [row.overallSd]) : []; }

    // best and second best per column, over every model row
    var ranks = values(all[0]).map(function (_, column) {
      var sorted = all.map(function (row) { return values(row)[column]; })
        .filter(function (v, i, list) { return list.indexOf(v) === i; })
        .sort(function (a, b) { return b - a; });
      return { best: sorted[0], second: sorted[1] };
    });

    var node = el('table', 'data-table');
    var head = el('thead');
    var top = el('tr');
    var sub = el('tr');
    var method = el('th', '', 'Method');
    method.rowSpan = 2;
    var syn = el('th', 'is-span', 'MoDirect-SynBench');
    syn.colSpan = table.columns.syn.length;
    var real = el('th', 'is-span', 'MoDirect-RealBench');
    real.colSpan = table.columns.real.length;
    var overall = el('th', '', 'Overall Avg.');
    overall.rowSpan = 2;
    [method, syn, real, overall].forEach(function (cell) { top.appendChild(cell); });
    table.columns.syn.concat(table.columns.real).forEach(function (name) { sub.appendChild(el('th', '', name)); });
    head.appendChild(top);
    head.appendChild(sub);
    node.appendChild(head);

    var body = el('tbody');
    var width = values(all[0]).length + 1;

    function addRow(row, ranked) {
      var tr = el('tr', row.ours ? 'is-ours' : '');
      tr.appendChild(el('td', '', row.model));
      var sd = deviations(row);
      values(row).forEach(function (value, column) {
        var td = el('td');
        var text = value.toFixed(1);
        var mark = !ranked ? null : value === ranks[column].best ? 'b' : value === ranks[column].second ? 'u' : null;
        td.appendChild(mark ? el(mark, '', text) : document.createTextNode(text));
        if (sd[column] !== undefined) td.appendChild(el('span', 'sd', '±' + sd[column].toFixed(1)));
        tr.appendChild(td);
      });
      body.appendChild(tr);
    }

    addRow(table.chance, false);
    table.groups.forEach(function (group) {
      var tr = el('tr', 'is-group');
      var th = el('th', '', group.name);
      th.colSpan = width;
      tr.appendChild(th);
      body.appendChild(tr);
      group.rows.forEach(function (row) { addRow(row, true); });
    });
    node.appendChild(body);
    return node;
  }

  // ---------- Tables 2-4 ----------
  function simpleTable(table) {
    var node = el('table', 'data-table');
    var head = el('thead');
    var tr = el('tr');
    table.columns.forEach(function (name) { tr.appendChild(el('th', '', name)); });
    head.appendChild(tr);
    node.appendChild(head);

    var body = el('tbody');
    table.rows.forEach(function (cells) {
      var row = el('tr', cells[0].indexOf(table.ours) !== -1 ? 'is-ours' : '');
      cells.forEach(function (cell) {
        var parts = cell.split('±');
        var td = el('td', '', parts[0]);
        if (parts[1]) td.appendChild(el('span', 'sd', '±' + parts[1]));
        row.appendChild(td);
      });
      body.appendChild(row);
    });
    node.appendChild(body);
    return node;
  }
})();
