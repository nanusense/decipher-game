(function () {
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=G-CPY3S2SCRM';
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', 'G-CPY3S2SCRM');
})();

/* ── Version-gated progress ── */
(function () {
  if (localStorage.getItem('d2version') !== '1') {
    localStorage.removeItem('d2progress');
    localStorage.setItem('d2version', '1');
  }
})();

/* ── Level URLs (relative to landing page) ── */
var LEVEL_URLS = [
  null,
  'levels/01/',
  'levels/key/',
  'levels/firefly/',
  'levels/frequency/',
  'levels/05/',
  'levels/06/',
  'levels/07/',
  'levels/08/',
  'levels/09/',
  'levels/10/',
  'levels/11/',
  'levels/12/',
  'levels/13/',
  'levels/14/',
  'levels/15/',
  'levels/16/',
  'levels/17/',
  'levels/18/',
  'levels/19/',
  'levels/20/',
  'done/',
];

/* ── Desktop block ── */
function desktopBlock() {
  var isTouch = navigator.maxTouchPoints > 0 || 'ontouchstart' in window;
  var isCoarse = window.matchMedia('(pointer: coarse)').matches;
  if (!isTouch && !isCoarse) {
    var el = document.createElement('div');
    el.className = 'desktop-block active';
    el.textContent = 'This one lives in your pocket.';
    document.body.appendChild(el);
  }
}

/* ── iOS orientation permission ── */
function requestOrientation() {
  return new Promise(function (resolve) {
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission === 'function'
    ) {
      DeviceOrientationEvent.requestPermission()
        .then(function (state) { resolve(state === 'granted'); })
        .catch(function () { resolve(false); });
    } else {
      resolve(true);
    }
  });
}

/* ── iOS motion permission ── */
function requestMotion() {
  return new Promise(function (resolve) {
    if (
      typeof DeviceMotionEvent !== 'undefined' &&
      typeof DeviceMotionEvent.requestPermission === 'function'
    ) {
      DeviceMotionEvent.requestPermission()
        .then(function (state) { resolve(state === 'granted'); })
        .catch(function () { resolve(false); });
    } else {
      resolve(true);
    }
  });
}

/* ── Complete level (black fade) ── */
function completeLevel(nextUrl, levelNum) {
  var saved = parseInt(localStorage.getItem('d2progress') || '0');
  if (levelNum > saved) localStorage.setItem('d2progress', levelNum);

  var overlay = document.createElement('div');
  overlay.style.cssText =
    'position:fixed;inset:0;background:#ffffff;z-index:9999;opacity:0;' +
    'transition:opacity 0.5s ease;pointer-events:none';
  document.body.appendChild(overlay);

  requestAnimationFrame(function () {
    overlay.style.opacity = '1';
    setTimeout(function () {
      window.location.href = nextUrl;
    }, 520);
  });
}

/* ── Track progress ── */
function trackProgress(n) {
  var saved = parseInt(localStorage.getItem('d2progress') || '0');
  if (n > saved) localStorage.setItem('d2progress', n);
}

/* ── Bind answer input ── */
function bindAnswer(inputId, word, nextUrl, levelNum) {
  var el = document.getElementById(inputId);
  if (!el) return;
  el.addEventListener('input', function () {
    if (this.value.trim().toLowerCase() === word.toLowerCase()) {
      this.value = '';
      completeLevel(nextUrl, levelNum);
    }
  });
}

/* ── Long press ── */
function onLongPress(el, ms, callback) {
  var timer = null;
  var startX, startY;
  var start = function (e) {
    e.preventDefault();
    if (e.touches) { startX = e.touches[0].clientX; startY = e.touches[0].clientY; }
    timer = setTimeout(callback, ms);
  };
  var cancel = function () { clearTimeout(timer); timer = null; };
  el.addEventListener('touchstart', start, { passive: false });
  el.addEventListener('touchend', cancel);
  el.addEventListener('touchmove', function (e) {
    if (startX == null) return;
    var dx = e.touches[0].clientX - startX;
    var dy = e.touches[0].clientY - startY;
    if (Math.sqrt(dx * dx + dy * dy) > 15) cancel();
  }, { passive: true });
}

/* ── Double tap ── */
function onDoubleTap(el, callback) {
  var last = 0;
  el.addEventListener('touchend', function (e) {
    var now = Date.now();
    if (now - last < 350) { e.preventDefault(); callback(); }
    last = now;
  });
}

/* ── Swipe ── */
function onSwipe(el, direction, callback) {
  var sx, sy;
  el.addEventListener('touchstart', function (e) {
    sx = e.touches[0].clientX;
    sy = e.touches[0].clientY;
  }, { passive: true });
  el.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - sx;
    var dy = e.changedTouches[0].clientY - sy;
    if (direction === 'left'  && dx < -80 && Math.abs(dy) < 60) callback();
    if (direction === 'right' && dx >  80 && Math.abs(dy) < 60) callback();
    if (direction === 'up'    && dy < -80 && Math.abs(dx) < 60) callback();
    if (direction === 'down'  && dy >  80 && Math.abs(dx) < 60) callback();
  }, { passive: true });
}

/* ── Pinch ── */
function onPinch(el, callback) {
  var startDist = null;
  el.addEventListener('touchstart', function (e) {
    if (e.touches.length === 2) {
      var dx = e.touches[0].clientX - e.touches[1].clientX;
      var dy = e.touches[0].clientY - e.touches[1].clientY;
      startDist = Math.sqrt(dx * dx + dy * dy);
    }
  }, { passive: true });
  el.addEventListener('touchmove', function (e) {
    if (e.touches.length === 2 && startDist) {
      var dx = e.touches[0].clientX - e.touches[1].clientX;
      var dy = e.touches[0].clientY - e.touches[1].clientY;
      var dist = Math.sqrt(dx * dx + dy * dy);
      callback({ scale: dist / startDist, delta: dist - startDist });
    }
  }, { passive: true });
  el.addEventListener('touchend', function () { startDist = null; }, { passive: true });
}

/* ── Multi-finger tap ── */
function onMultiTap(el, fingers, callback) {
  el.addEventListener('touchstart', function (e) {
    if (e.touches.length === fingers) callback();
  }, { passive: true });
}

/* ── Vibrate (no-op on iOS) ── */
function vibrate(pattern) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}

/* ── Reveal text letter by letter ── */
function revealText(el, text, msPerLetter, onDone) {
  el.innerHTML = '';
  var i = 0;
  var interval = setInterval(function () {
    if (i >= text.length) {
      clearInterval(interval);
      if (onDone) onDone();
      return;
    }
    if (text[i] === '\n') {
      el.appendChild(document.createElement('br'));
    } else {
      var span = document.createElement('span');
      span.className = 'reveal-letter';
      span.textContent = text[i];
      el.appendChild(span);
    }
    i++;
  }, msPerLetter);
}

/* ── Support widget (tap to expand) ── */
(function () {
  var el = document.createElement('div');
  el.style.cssText =
    'position:fixed;bottom:0.9rem;right:1rem;z-index:50;' +
    'font-family:Courier New,monospace;font-size:0.75rem;letter-spacing:0.1em;color:#3a3a3a;' +
    'white-space:nowrap;overflow:hidden;max-width:22px;' +
    'padding:0.3rem 0.2rem;' +
    'transition:max-width 0.3s ease;cursor:pointer;' +
    '-webkit-tap-highlight-color:transparent;';
  el.innerHTML =
    '<span style="user-select:none;">♥</span>' +
    '<a href="https://razorpay.me/@sandeepnanu" target="_blank" rel="noopener" ' +
    'style="color:inherit;text-decoration:none;"> Like it? Support it. No pressure.</a>';

  var expanded = false;
  var hideTimer = null;

  function collapse() {
    el.style.maxWidth = '22px';
    expanded = false;
    clearTimeout(hideTimer);
  }

  function outsideTap(e) {
    if (el.contains(e.target)) {
      // Tapped inside — re-arm for next tap
      setTimeout(function () {
        window.addEventListener('touchstart', outsideTap, { once: true, passive: true });
      }, 0);
    } else {
      collapse();
    }
  }

  function expand() {
    el.style.maxWidth = '280px';
    expanded = true;
    clearTimeout(hideTimer);
    hideTimer = setTimeout(collapse, 4000);
    // Register outside-tap listener after current event finishes
    setTimeout(function () {
      window.addEventListener('touchstart', outsideTap, { once: true, passive: true });
    }, 0);
  }

  el.addEventListener('touchstart', function (e) {
    if (!expanded) {
      e.preventDefault();
      expand();
    }
  }, { passive: false });

  document.addEventListener('DOMContentLoaded', function () {
    if (!window.hideSupport) document.body.appendChild(el);
  });

  document.addEventListener('DOMContentLoaded', function () {
    if (!window.hideSupport) document.body.appendChild(el);
  });
})();
