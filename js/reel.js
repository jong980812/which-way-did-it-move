// Hero reel: a 15-second motion piece. CSS runs the timeline; this script
// drives the number counter and the pause / replay controls.
(function () {
  var reel = document.querySelector('.reel');
  if (!reel) return;
  // small screens and reduced motion show the static diagram instead
  if (window.matchMedia('(max-width: 759px), (prefers-reduced-motion: reduce)').matches) return;

  var stage = reel.querySelector('.reel__stage');
  var number = reel.querySelector('[data-reel-num]');
  var toggle = reel.querySelector('[data-reel-toggle]');
  var restart = reel.querySelector('[data-reel-restart]');
  var clock = reel.querySelector('.reel__progress span');

  var DURATION = 15000;
  // [time in ms, value]: hold at 0, count to 25.9, hold, count to 85.9, hold
  var KEYS = [[0, 0], [9500, 0], [10500, 25.9], [12300, 25.9], [13300, 85.9], [DURATION, 85.9]];

  var userPaused = false;
  var visible = true;
  var frame = null;

  function valueAt(time) {
    for (var i = 1; i < KEYS.length; i += 1) {
      if (time <= KEYS[i][0]) {
        var from = KEYS[i - 1];
        var to = KEYS[i];
        var progress = (time - from[0]) / (to[0] - from[0]);
        var eased = 1 - Math.pow(1 - progress, 3);
        return from[1] + (to[1] - from[1]) * eased;
      }
    }
    return KEYS[KEYS.length - 1][1];
  }

  function draw() {
    var animation = clock.getAnimations()[0];
    if (animation) {
      number.textContent = valueAt((animation.currentTime || 0) % DURATION).toFixed(1) + '%';
    }
  }

  function loop() {
    draw();
    frame = requestAnimationFrame(loop);
  }

  function apply() {
    var paused = userPaused || !visible;
    reel.classList.toggle('is-paused', paused);
    toggle.textContent = userPaused ? 'Play' : 'Pause';
    toggle.setAttribute('aria-pressed', String(userPaused));
    if (paused && frame !== null) {
      cancelAnimationFrame(frame);
      frame = null;
      draw();
    } else if (!paused && frame === null) {
      loop();
    }
  }

  toggle.addEventListener('click', function () {
    userPaused = !userPaused;
    apply();
  });

  restart.addEventListener('click', function () {
    stage.getAnimations({ subtree: true }).forEach(function (animation) {
      animation.currentTime = 0;
    });
    userPaused = false;
    apply();
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      apply();
    }).observe(reel);
  }

  apply();
})();
