/* Google Analytics */
(function () {
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=G-CPY3S2SCRM';
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  gtag('js', new Date());
  gtag('config', 'G-CPY3S2SCRM');
})();

/* inject favicon on every level page */
(function () {
  var lnk = document.createElement('link');
  lnk.rel = 'icon'; lnk.type = 'image/svg+xml'; lnk.href = '../favicon.svg';
  document.head.appendChild(lnk);
})();

/* clear stale progress if game version changed */
(function () {
  if (localStorage.getItem('decipherVersion') !== '3') {
    localStorage.removeItem('decipherProgress');
    localStorage.setItem('decipherVersion', '3');
  }
})();

/* URL for each level (index = level number). Used by index.html for Resume. */
var LEVEL_URLS = [
  null,             /* 0  */
  'start.html',     /* 1  — click the orb */
  'door.html',      /* 2  — double-tap */
  'ocean.html',     /* 3  — scroll to bottom */
  'hold.html',      /* 4  — long press 2s */
  'ink.html',       /* 5  — invisible ink */
  'tiny.html',      /* 6  — zoom to read */
  'sequence.html',  /* 7  — click in order */
  'sesame.html',    /* 8  — type a word */
  'letters.html',   /* 9  — acrostic */
  'source.html',    /* 10 — view source */
  'triple.html',    /* 11 — combination lock */
  'hunt.html',      /* 12 — catch the dot */
  'turn.html',      /* 13 — orientation */
  'compass.html',   /* 14 — direction sequence */
  'level15.html',   /* 15 — URL number change */
  'blind.html',     /* 16 — shake */
  'pattern.html',   /* 17 — dot pattern */
  'count.html',     /* 18 — exact count */
  'lock.html',      /* 19 — drag & drop */
  'highlight.html', /* 20 — selection reveal */
  'wait.html',      /* 21 — countdown */
  'qr.html',        /* 22 — QR code */
  'query.html',     /* 23 — URL query param */
  'fragment.html',  /* 24 — URL hash */
  'morse.html',     /* 25 — morse transmit */
  'scramble.html',  /* 26 — unscramble */
  'flip.html',      /* 27 — upside-down text */
  'ghost.html',     /* 28 — near-invisible text */
  'listen.html',    /* 29 — audio morse */
  'zorro.html',     /* 30 — draw Z */
  'last.html',      /* 31 — last-letter acrostic */
  'numbers.html',   /* 32 — A=1 numbers */
  'emoji.html',     /* 33 — emoji cipher */
  'phone.html',     /* 34 — phone keypad */
  'binary.html',    /* 35 — binary decode */
  'caesar.html',    /* 36 — Caesar cipher */
  'hex.html',       /* 37 — hex decode */
  'void.html',      /* 38 — invisible click zone */
  'painter.html',   /* 39 — canvas connect dots */
  'inspect.html',   /* 40 — data attribute */
  'memory.html',    /* 41 — Simon Says */
  'grid.html',      /* 42 — word search */
  'crossword.html', /* 43 — mini crossword */
  'cookie.html',    /* 44 — browser cookie */
  'storage.html',   /* 45 — localStorage */
  'halves.html',    /* 46 — two halves */
  'coords.html',    /* 47 — pixel coordinates */
  'timing.html',    /* 48 — :17 second window */
  'combo.html',     /* 49 — combo gesture */
  'finale.html',    /* 50 — multi-step finale */
];

function completeLevel(nextUrl, levelNum) {
  var saved = parseInt(localStorage.getItem('decipherProgress') || '0');
  if (levelNum > saved) localStorage.setItem('decipherProgress', levelNum);

  var overlay = document.createElement('div');
  overlay.style.cssText =
    'position:fixed;inset:0;background:#fff;z-index:9999;opacity:0;' +
    'transition:opacity 0.4s ease;pointer-events:none';
  document.body.appendChild(overlay);

  requestAnimationFrame(function () {
    overlay.style.opacity = '1';
    setTimeout(function () {
      window.location.href = nextUrl;
    }, 400);
  });
}

function trackProgress(n) {
  var saved = parseInt(localStorage.getItem('decipherProgress') || '0');
  if (n > saved) localStorage.setItem('decipherProgress', n);
}

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

function onLongPress(el, ms, callback) {
  var timer = null;
  var startX, startY;
  var start = function (e) {
    e.preventDefault();
    if (e.touches) { startX = e.touches[0].clientX; startY = e.touches[0].clientY; }
    timer = setTimeout(callback, ms);
  };
  var cancel = function () { clearTimeout(timer); timer = null; };
  el.addEventListener('mousedown', start);
  el.addEventListener('touchstart', start, { passive: false });
  el.addEventListener('mouseup', cancel);
  el.addEventListener('mouseleave', cancel);
  el.addEventListener('touchend', cancel);
  el.addEventListener('touchmove', function (e) {
    var dx = e.touches[0].clientX - startX;
    var dy = e.touches[0].clientY - startY;
    if (Math.sqrt(dx * dx + dy * dy) > 15) cancel();
  }, { passive: true });
}

function onDoubleTap(el, callback) {
  var last = 0;
  el.addEventListener('touchend', function (e) {
    var now = Date.now();
    if (now - last < 350) { e.preventDefault(); callback(); }
    last = now;
  });
  el.addEventListener('dblclick', callback);
}

function onSwipe(el, direction, callback) {
  var sx, sy;
  el.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  el.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - sx;
    var dy = e.changedTouches[0].clientY - sy;
    if (direction === 'left'  && dx < -80 && Math.abs(dy) < 60) callback();
    if (direction === 'right' && dx >  80 && Math.abs(dy) < 60) callback();
  }, { passive: true });
}

(function () {
  var el = document.createElement('div');
  el.style.cssText =
    'position:fixed;bottom:0.9rem;right:1rem;z-index:50;' +
    'font-family:Courier New,monospace;font-size:0.75rem;letter-spacing:0.1em;color:#9ca3af;' +
    'white-space:nowrap;overflow:hidden;max-width:22px;' +
    'padding:0.3rem 0.2rem;' +
    'transition:max-width 0.3s ease,color 0.15s;cursor:pointer;' +
    '-webkit-tap-highlight-color:transparent;';
  el.innerHTML =
    '<span style="user-select:none;">•</span>' +
    '<a href="https://razorpay.me/@sandeepnanu" target="_blank" rel="noopener" ' +
    'style="color:inherit;text-decoration:none;"> Like it? Support it.</a>';

  var expanded = false;

  el.addEventListener('mouseenter', function () {
    el.style.maxWidth = '220px';
  });
  el.addEventListener('mouseleave', function () {
    el.style.maxWidth = '22px';
    expanded = false;
  });

  /* mobile: first tap expands, second tap follows the link */
  el.addEventListener('click', function (e) {
    if (!expanded) {
      e.preventDefault();
      expanded = true;
      el.style.maxWidth = '220px';
    }
  });

  document.addEventListener('DOMContentLoaded', function () {
    document.body.appendChild(el);
  });
})();
