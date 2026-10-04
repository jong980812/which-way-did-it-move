// Diagnosis pipeline: a direction signal travels through the Video-LLM stages
// and is lost between the final readout and the answer.
(function () {
  var root = document.querySelector('.pipeline');
  if (!root) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var stages = [];
  var signal, replay, gapLabel;
  var playing = false;

  fetch(root.getAttribute('data-src'))
    .then(function (res) { return res.json(); })
    .then(build)
    .catch(function () { root.closest('figure').hidden = true; });

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function legendKey(modifier, text) {
    var item = el('span');
    item.appendChild(el('i', 'pipeline__key ' + modifier));
    item.appendChild(document.createTextNode(text));
    return item;
  }

  function build(data) {
    root.style.setProperty('--chance', data.chance + '%');

    var legend = el('p', 'pipeline__legend mono');
    legend.appendChild(legendKey('', 'Direction probe accuracy'));
    legend.appendChild(legendKey('pipeline__key--qa', 'QA accuracy'));
    legend.appendChild(legendKey('pipeline__key--chance', 'Chance (' + data.chance + '%)'));

    var list = el('ol', 'pipeline__stages');
    data.stages.forEach(function (stage, index) {
      var item = el('li', 'stage stage--' + stage.kind);
      item.appendChild(el('span', 'stage__rail'));
      item.appendChild(el('span', 'stage__node'));
      item.appendChild(el('span', 'stage__group mono', stage.group));

      var label = el('span', 'stage__label', stage.label + ' ');
      if (stage.symbol) {
        var symbol = el('b', 'stage__symbol', stage.symbol);
        if (stage.sup) symbol.appendChild(el('sup', '', stage.sup));
        label.appendChild(symbol);
      }
      item.appendChild(label);

      var bar = el('span', 'stage__bar');
      var fill = el('span', 'stage__fill');
      fill.style.width = stage.value + '%';
      bar.appendChild(fill);
      item.appendChild(bar);
      item.appendChild(el('span', 'stage__val', stage.value.toFixed(1) + '%'));

      if (index === data.gap.after) {
        item.classList.add('stage--break');
        gapLabel = el('span', 'stage__gap mono', data.gap.label);
        item.appendChild(gapLabel);
      }

      list.appendChild(item);
      stages.push(item);
    });

    signal = el('span', 'pipeline__signal');
    replay = el('button', 'btn pipeline__replay', 'Replay');
    replay.type = 'button';
    replay.addEventListener('click', play);

    root.appendChild(legend);
    root.appendChild(list);
    root.appendChild(signal);
    root.appendChild(replay);

    if (reduce || !('IntersectionObserver' in window)) {
      replay.hidden = true;
      showAll();
      return;
    }

    root.classList.add('is-armed');
    var observer = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      observer.disconnect();
      play();
    }, { threshold: 0.4 });
    observer.observe(root);
  }

  function showAll() {
    stages.forEach(function (stage) { stage.classList.add('is-on'); });
    gapLabel.classList.add('is-on');
  }

  function center(node) {
    var a = node.getBoundingClientRect();
    var b = root.getBoundingClientRect();
    return { x: a.left - b.left + a.width / 2, y: a.top - b.top + a.height / 2 };
  }

  function moveSignal(point, ms, lost) {
    signal.style.transition = ms ? 'transform ' + ms + 'ms linear, opacity ' + ms + 'ms linear' : 'none';
    signal.style.transform = 'translate(' + point.x + 'px,' + point.y + 'px)';
    signal.style.opacity = lost ? '0' : '1';
  }

  function play() {
    if (playing) return;
    playing = true;
    replay.disabled = true;
    root.classList.add('is-armed');
    stages.forEach(function (stage) { stage.classList.remove('is-on'); });
    gapLabel.classList.remove('is-on');

    var hop = parseFloat(getComputedStyle(root).getPropertyValue('--dur-hop')) || 700;
    var nodes = stages.map(function (stage) { return stage.querySelector('.stage__node'); });
    var last = stages.length - 1;
    var index = 0;

    moveSignal(center(nodes[0]), 0, false);
    arrive();

    function arrive() {
      stages[index].classList.add('is-on');
      setTimeout(depart, 550);
    }

    function depart() {
      if (index === last - 1) {
        // the signal fades out half way to the output: it never reaches the answer
        var from = center(nodes[index]);
        var to = center(nodes[last]);
        moveSignal({ x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 }, hop, true);
        setTimeout(function () {
          stages[last].classList.add('is-on');
          gapLabel.classList.add('is-on');
          playing = false;
          replay.disabled = false;
        }, hop);
        return;
      }
      index += 1;
      moveSignal(center(nodes[index]), hop, false);
      setTimeout(arrive, hop);
    }
  }
})();
