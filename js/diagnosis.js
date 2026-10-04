// Diagnosis figure: the direction signal followed through a Video-LLM.
// Builds the stages from data/diagnosis.json, plays once when the figure
// scrolls into view, and again on Replay. CSS runs the animation.
(function () {
  var pipe = document.querySelector('.pipe');
  if (!pipe) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var stage = pipe.querySelector('.pipe__stage');
  var replay = pipe.querySelector('.pipe__replay');

  fetch(pipe.getAttribute('data-src'))
    .then(function (res) { return res.json(); })
    .then(build)
    .catch(function () { pipe.closest('figure').hidden = true; });

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function build(data) {
    // the LLM box, the wires between modules, and the video the signal comes from
    stage.appendChild(el('span', 'pipe__llm', 'LLM'));
    ['1', '2', '3', '4', 'gap'].forEach(function (name) {
      stage.appendChild(el('span', 'pipe__wire pipe__wire--' + name));
    });
    stage.appendChild(el('span', 'pipe__sig'));

    var video = el('span', 'pipe__video');
    [18, 39, 60, 80].forEach(function (left) {
      var dot = el('i');
      dot.style.left = left + '%';
      video.appendChild(dot);
    });
    stage.appendChild(video);
    stage.appendChild(el('span', 'pipe__video-label', 'Input video'));

    var list = el('ol', 'pipe__items');
    data.stages.forEach(function (item, index) {
      // the gap sits between the last stage inside the model and the answer
      if (index === data.stages.length - 1) list.appendChild(el('li', 'pipe__gap', data.gap));

      var entry = el('li', 'pipe__item');
      entry.setAttribute('data-kind', item.kind);
      var node = el('span', 'pipe__node', item.label);
      if (item.where) {
        entry.setAttribute('data-where', item.where);
        node.setAttribute('data-where', item.where);
      }
      entry.appendChild(node);
      entry.appendChild(el('span', 'pipe__chip', item.value.toFixed(1) + '%'));
      list.appendChild(entry);
    });
    stage.appendChild(list);

    if (reduce || !('IntersectionObserver' in window)) {
      replay.hidden = true;
      return;
    }

    stage.classList.add('is-armed');
    replay.addEventListener('click', play);

    var observer = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      observer.disconnect();
      play();
    }, { threshold: 0.5 });
    observer.observe(stage);
  }

  function play() {
    // drop the class for one layout pass so the animations start over
    stage.classList.remove('is-playing');
    void stage.offsetWidth;
    stage.classList.add('is-playing');
  }
})();
