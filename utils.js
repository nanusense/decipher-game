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
  'mirror.html',    /* 25 — mirrored text */
  'morse.html',     /* 26 — morse visual */
  'flip.html',      /* 27 — upside-down text */
  'ghost.html',     /* 28 — near-invisible text */
  'listen.html',    /* 29 — audio morse */
  'slide.html',     /* 30 — swipe */
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
  var start = function (e) { e.preventDefault(); timer = setTimeout(callback, ms); };
  var cancel = function () { clearTimeout(timer); timer = null; };
  el.addEventListener('mousedown', start);
  el.addEventListener('touchstart', start, { passive: false });
  el.addEventListener('mouseup', cancel);
  el.addEventListener('mouseleave', cancel);
  el.addEventListener('touchend', cancel);
  el.addEventListener('touchmove', cancel);
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
  var f = document.createElement('div');
  f.style.cssText =
    'position:fixed;bottom:0.9rem;left:0;right:0;text-align:center;' +
    'font-size:0.6rem;letter-spacing:0.1em;font-family:Courier New,monospace;';
  f.innerHTML =
    '<a href="https://razorpay.me/@sandeepnanu" target="_blank" rel="noopener" ' +
    'style="color:#9ca3af;text-decoration:none;">' +
    'You like it? Support it?' +
    '</a>';
  document.addEventListener('DOMContentLoaded', function () {
    document.body.appendChild(f);
  });
})();
