// Results: a ranked board with a SynBench / RealBench toggle and a per-domain
// detail card, plus the paper's tables.
(function () {
  var board = document.querySelector('.board');
  if (!board) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  fetch(board.getAttribute('data-src'))
    .then(function (res) { return res.json(); })
    .then(function (data) {
      buildBoard(data.table1);
      Array.prototype.forEach.call(document.querySelectorAll('[data-table]'), function (slot) {
        var key = slot.getAttribute('data-table');
        slot.appendChild(key === 'table1' ? mainTable(data.table1) : simpleTable(data[key]));
      });
    })
    .catch(function () { board.closest('figure').hidden = true; });

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function last(list) { return list[list.length - 1]; }

  // ---------- board ----------
  function buildBoard(table) {
    var list = board.querySelector('.board__rows');
    var detail = board.querySelector('.board__detail');
    var buttons = Array.prototype.slice.call(board.querySelectorAll('[data-bench]'));
    var bench = 'syn';
    var selected = null;
    var rows = [];

    table.groups.forEach(function (group) {
      group.rows.forEach(function (row) {
        var item = el('li');
        var button = el('button', 'board__row' + (row.ours ? ' is-ours' : ''));
        button.type = 'button';
        button.setAttribute('data-group', group.key);

        var rank = el('span', 'board__rank');
        var name = el('span', 'board__name');
        name.appendChild(el('i', 'mark mark--' + group.key));
        name.appendChild(document.createTextNode(row.model));
        var track = el('span', 'board__track');
        var fill = el('span', 'board__fill');
        track.appendChild(fill);
        var value = el('span', 'board__val');

        [rank, name, track, value].forEach(function (part) { button.appendChild(part); });
        item.appendChild(button);

        var entry = { data: row, group: group, item: item, button: button, rank: rank, fill: fill, value: value, order: rows.length };
        button.addEventListener('click', function () { select(entry); });
        button.addEventListener('mouseenter', function () { select(entry); });
        button.addEventListener('focus', function () { select(entry); });
        rows.push(entry);
      });
    });

    var chanceRow = el('p', 'board__chance');
    var chanceLabel = el('span');
    chanceRow.appendChild(chanceLabel);

    function average(entry) { return last(entry.data[bench]); }

    function show(next) {
      bench = next;
      var before = rows.map(function (entry) { return entry.item.getBoundingClientRect().top; });

      // rank by the benchmark's average; ties keep the paper's order
      var sorted = rows.slice().sort(function (a, b) { return average(b) - average(a) || a.order - b.order; });
      sorted.forEach(function (entry, index) {
        list.appendChild(entry.item);
        entry.rank.textContent = index + 1;
        entry.fill.style.width = average(entry) + '%';
        entry.value.textContent = average(entry).toFixed(1);
      });
      list.appendChild(chanceRow);

      var chance = last(table.chance[bench]);
      board.style.setProperty('--chance', chance + '%');
      chanceLabel.textContent = 'chance ' + chance.toFixed(1);
      buttons.forEach(function (button) {
        button.setAttribute('aria-pressed', String(button.getAttribute('data-bench') === bench));
      });

      // rows slide from their old position to the new one
      if (!reduce) {
        rows.forEach(function (entry, index) {
          var shift = before[index] - entry.item.getBoundingClientRect().top;
          if (!shift) return;
          entry.item.style.transition = 'none';
          entry.item.style.transform = 'translateY(' + shift + 'px)';
          requestAnimationFrame(function () {
            requestAnimationFrame(function () {
              entry.item.style.transition = 'transform 500ms ease';
              entry.item.style.transform = '';
            });
          });
        });
      }

      if (selected) renderDetail(selected);
    }

    function select(entry) {
      if (selected === entry) return;
      if (selected) selected.button.setAttribute('aria-pressed', 'false');
      selected = entry;
      entry.button.setAttribute('aria-pressed', 'true');
      renderDetail(entry);
    }

    function renderDetail(entry) {
      var row = entry.data;
      var names = bench === 'syn' ? table.columns.synLong : table.columns.real.slice(0, -1);
      var values = row[bench];
      var deviations = row[bench + 'Sd'] || [];
      var chances = table.chance[bench];

      detail.textContent = '';
      var head = el('p', 'board__detail-name');
      head.appendChild(el('i', 'mark mark--' + entry.group.key));
      head.appendChild(document.createTextNode(row.model));
      detail.appendChild(head);
      detail.appendChild(el('p', 'board__detail-group', entry.group.name + ', ' + (bench === 'syn' ? 'MoDirect-SynBench' : 'MoDirect-RealBench')));

      var avg = el('p', 'board__detail-avg');
      avg.appendChild(el('b', '', last(values).toFixed(1) + '%'));
      avg.appendChild(document.createTextNode(' average' + (deviations.length ? ' (±' + last(deviations).toFixed(1) + ')' : '')));
      detail.appendChild(avg);

      if (row.base) {
        var base = rows.filter(function (other) { return other.data.model === row.base; })[0];
        if (base) {
          var gain = last(values) - last(base.data[bench]);
          detail.appendChild(el('p', 'board__detail-gain', '+' + gain.toFixed(1) + ' points over ' + row.base));
        }
      }

      var bars = el('ul', 'board__detail-bars');
      bars.setAttribute('data-group', entry.group.key);
      names.forEach(function (name, index) {
        var line = el('li');
        line.appendChild(el('span', 'board__detail-label', name));
        var track = el('span', 'board__track');
        track.style.setProperty('--chance', chances[index] + '%');
        var fill = el('span', 'board__fill');
        fill.style.width = values[index] + '%';
        track.appendChild(fill);
        line.appendChild(track);
        line.appendChild(el('span', 'board__val', values[index].toFixed(1)));
        bars.appendChild(line);
      });
      detail.appendChild(bars);
      detail.appendChild(el('p', 'board__detail-note', 'Dashed line: chance for each subset.'));
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () { show(button.getAttribute('data-bench')); });
    });

    show('syn');
    // start on the paper's main result
    select(rows.filter(function (entry) { return entry.data.base; })[0] || rows[0]);
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
