// Hero reel: a short motion piece in scenes. This script keeps the clock:
// it sets data-scene on the stage (CSS does the rest), counts the result
// number up, and handles pause, replay and the scene buttons.
(function () {
  var reel = document.querySelector('.reel');
  if (!reel) return;
  // small screens and reduced motion keep the static diagram
  if (window.matchMedia('(max-width: 759px), (prefers-reduced-motion: reduce)').matches) return;

  var stage = reel.querySelector('.reel__stage');
  var captions = Array.prototype.slice.call(stage.querySelectorAll('.reel__cap'));
  var number = reel.querySelector('[data-reel-num]');
  var progress = reel.querySelector('.reel__progress span');
  var toggle = reel.querySelector('[data-reel-toggle]');
  var restart = reel.querySelector('[data-reel-restart]');
  var list = reel.querySelector('.reel__scenes');

  // length of each scene in ms; scene n is SCENES[n - 1]
  var SCENES = [2400, 2500, 3900, 2800, 1400, 3200, 2800, 3400, 3600];
  // in the last scene the number counts from the baseline to the result
  var COUNT = { scene: SCENES.length - 1, from: 25.9, to: 85.9, start: 700, end: 1900 };

  var STARTS = [];
  var TOTAL = SCENES.reduce(function (sum, length) {
    STARTS.push(sum);
    return sum + length;
  }, 0);

  var elapsed = 0;
  var last = null;
  var frame = null;
  var current = -1;
  var userPaused = false;
  var visible = true;

  var buttons = SCENES.map(function (_, index) {
    var item = document.createElement('li');
    var button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', 'Scene ' + (index + 1) + ' of ' + SCENES.length);
    button.appendChild(document.createElement('span'));
    button.addEventListener('click', function () { jump(index); });
    item.appendChild(button);
    list.appendChild(item);
    return button;
  });

  function sceneAt(time) {
    for (var i = SCENES.length - 1; i > 0; i -= 1) {
      if (time >= STARTS[i]) return i;
    }
    return 0;
  }

  function setScene(index, replay) {
    if (index === current && !replay) return;
    if (replay) {
      // drop the attribute for one layout pass so the scene's animations start over
      stage.removeAttribute('data-scene');
      void stage.offsetWidth;
    }
    current = index;
    var name = String(index + 1);
    stage.setAttribute('data-scene', name);
    captions.forEach(function (caption) {
      caption.classList.toggle('is-on', caption.getAttribute('data-scene') === name);
    });
    buttons.forEach(function (button, i) {
      button.classList.toggle('is-on', i === index);
    });
  }

  function render() {
    var index = sceneAt(elapsed);
    setScene(index, false);
    progress.style.width = elapsed / TOTAL * 100 + '%';

    var value = COUNT.from;
    if (index === COUNT.scene) {
      var local = elapsed - STARTS[index];
      var t = Math.min(Math.max((local - COUNT.start) / (COUNT.end - COUNT.start), 0), 1);
      value += (COUNT.to - COUNT.from) * (1 - Math.pow(1 - t, 3));
    }
    number.textContent = value.toFixed(1) + '%';
  }

  function tick(now) {
    // real time, so the clock stays in step with the CSS animations even when
    // the browser delivers frames slowly (a covered or unfocused window)
    if (last !== null) elapsed = (elapsed + Math.min(now - last, 2000)) % TOTAL;
    last = now;
    render();
    frame = requestAnimationFrame(tick);
  }

  function apply() {
    var paused = userPaused || !visible;
    reel.classList.toggle('is-paused', paused);
    toggle.textContent = userPaused ? 'Play' : 'Pause';
    toggle.setAttribute('aria-pressed', String(userPaused));
    if (paused && frame !== null) {
      cancelAnimationFrame(frame);
      frame = null;
      last = null;
    } else if (!paused && frame === null) {
      frame = requestAnimationFrame(tick);
    }
  }

  function jump(index) {
    elapsed = STARTS[index];
    last = null;
    setScene(index, true);
    render();
    userPaused = false;
    apply();
  }

  toggle.addEventListener('click', function () {
    userPaused = !userPaused;
    apply();
  });

  restart.addEventListener('click', function () { jump(0); });

  // no frames arrive while the tab is hidden: do not count that time
  document.addEventListener('visibilitychange', function () { last = null; });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      apply();
    }).observe(reel);
  }

  reel.classList.add('is-ready');
  setScene(0, true);
  render();
  apply();
})();
