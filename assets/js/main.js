(function () {
  'use strict';

  // ── Theme toggle ──────────────────────────────────
  const toggle = document.querySelector('.theme-toggle');
  const icon = toggle?.querySelector('span');

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    if (icon) icon.textContent = theme === 'dark' ? '☀' : '☾';
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#131315' : '#FBFAF8');
  }

  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(saved || (prefersDark ? 'dark' : 'light'));

  toggle?.addEventListener('click', function () {
    const current = document.documentElement.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });

  // ── Scroll reveal ─────────────────────────────────
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!reducedMotion) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll('.reveal').forEach(function (el) {
      observer.observe(el);
    });
  }

  // ── Nav: scroll-spy, and surface the bar past the hero ──
  var nav = document.querySelector('nav');
  var hero = document.querySelector('.hero');
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

  function onScroll() {
    var threshold = hero ? hero.offsetHeight - 80 : 200;
    nav.classList.toggle('scrolled', window.scrollY > threshold);

    var scrollY = window.scrollY + 100;
    sections.forEach(function (sec) {
      if (sec.offsetTop <= scrollY && sec.offsetTop + sec.offsetHeight > scrollY) {
        navLinks.forEach(function (a) {
          a.classList.toggle('active', a.getAttribute('href') === '#' + sec.id);
        });
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ── Transport trajectories ────────────────────────
  // Brownian-bridge paths (first two KL modes on [0,1]).
  // Endpoints and mode amplitudes are functions of scroll;
  // the displayed state tracks the target through a first-order lag,
  // so the curves move like a dynamical system rather than 1:1 with the wheel.
  var canvas = document.querySelector('.flow-field');

  if (canvas && !reducedMotion) {
    var ctx = canvas.getContext('2d');
    var dpr = 1;
    var state = 0;
    var target = 0;
    var LINES = 5;
    var STEPS = 80;

    function hexAlpha(hex, a) {
      hex = hex.trim();
      if (hex[0] === '#' && hex.length === 7) {
        var r = parseInt(hex.slice(1, 3), 16);
        var g = parseInt(hex.slice(3, 5), 16);
        var b = parseInt(hex.slice(5, 7), 16);
        return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
      }
      return hex;
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
    }

    function progress() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      return max > 0 ? window.scrollY / max : 0;
    }

    function at(i, u, t, w, h) {
      var tau = t * Math.PI * 2;
      var u0 = (i + 0.65) / (LINES + 0.4);
      var x0 = w * (0.08 + 0.84 * u0 + 0.035 * Math.sin(tau + i * 1.1));
      var x1 = w * (0.08 + 0.84 * u0 + 0.05 * Math.cos(tau * 0.85 + i * 1.4));
      var y0 = h * 0.07;
      var y1 = h * 0.93;
      var a1 = w * 0.22 * Math.sin(tau + i * 0.9);
      var a2 = w * 0.09 * Math.sin(tau * 1.7 + i * 1.6 + 0.4);
      var b1 = h * 0.055 * Math.cos(tau * 0.6 + i);
      var su = Math.sin(Math.PI * u);
      var su2 = Math.sin(2 * Math.PI * u);
      return {
        x: (1 - u) * x0 + u * x1 + a1 * su + a2 * su2,
        y: (1 - u) * y0 + u * y1 + b1 * su
      };
    }

    function sample(i, t, w, h) {
      var pts = [];
      for (var s = 0; s <= STEPS; s++) pts.push(at(i, s / STEPS, t, w, h));
      return pts;
    }

    function normal(pts, s) {
      var a = pts[Math.max(0, s - 1)];
      var b = pts[Math.min(pts.length - 1, s + 1)];
      var dx = b.x - a.x;
      var dy = b.y - a.y;
      var len = Math.hypot(dx, dy) || 1;
      return { x: -dy / len, y: dx / len };
    }

    function drawTapered(pts, color, weight) {
      ctx.strokeStyle = color;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      for (var s = 0; s < pts.length - 1; s++) {
        var u = s / (pts.length - 1);
        var swell = Math.pow(Math.sin(Math.PI * u), 0.65);
        ctx.beginPath();
        ctx.moveTo(pts[s].x, pts[s].y);
        ctx.lineTo(pts[s + 1].x, pts[s + 1].y);
        ctx.lineWidth = weight * (0.28 + 0.72 * swell);
        ctx.stroke();
      }
    }

    function drawDashed(pts, color, weight) {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (var s = 1; s < pts.length; s++) ctx.lineTo(pts[s].x, pts[s].y);
      ctx.strokeStyle = color;
      ctx.lineWidth = weight;
      ctx.setLineDash([1.5, 7]);
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.setLineDash([]);
    }

    function drawRibbon(pts, color, offset) {
      ctx.beginPath();
      for (var s = 0; s < pts.length; s++) {
        var n = normal(pts, s);
        var x = pts[s].x + n.x * offset;
        var y = pts[s].y + n.y * offset;
        if (s === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = 0.6;
      ctx.stroke();
    }

    function drawTicks(pts, color, us, length) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 0.8;
      ctx.lineCap = 'butt';
      for (var k = 0; k < us.length; k++) {
        var s = Math.round(us[k] * (pts.length - 1));
        var p = pts[s];
        var n = normal(pts, s);
        ctx.beginPath();
        ctx.moveTo(p.x - n.x * length, p.y - n.y * length);
        ctx.lineTo(p.x + n.x * length, p.y + n.y * length);
        ctx.stroke();
      }
    }

    function openCircle(p, color, r) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    function filledDot(p, color, r) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }

    function draw() {
      var w = canvas.width / dpr;
      var h = canvas.height / dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      var cs = getComputedStyle(document.documentElement);
      var ink = cs.getPropertyValue('--fg');
      var clay = cs.getPropertyValue('--accent');
      var t = state;

      for (var i = 0; i < LINES; i++) {
        var pts = sample(i, t, w, h);
        var first = pts[0];
        var last = pts[pts.length - 1];

        if (i === 0) {
          drawDashed(pts, hexAlpha(ink, 0.22), 0.8);
          openCircle(first, hexAlpha(ink, 0.35), 3.2);
          openCircle(last, hexAlpha(ink, 0.35), 3.2);
        } else if (i === 2) {
          drawRibbon(pts, hexAlpha(clay, 0.16), 5);
          drawRibbon(pts, hexAlpha(clay, 0.16), -5);
          drawTapered(pts, hexAlpha(clay, 0.55), 1.45);
          drawTicks(pts, hexAlpha(clay, 0.45), [0.28, 0.5, 0.72], 6);
          openCircle(first, hexAlpha(clay, 0.7), 4);
          filledDot(last, hexAlpha(clay, 0.7), 2.2);
        } else if (i === 4) {
          drawTapered(pts, hexAlpha(ink, 0.18), 0.85);
          drawTicks(pts, hexAlpha(ink, 0.28), [0.5], 4.5);
          filledDot(first, hexAlpha(ink, 0.28), 1.4);
          filledDot(last, hexAlpha(ink, 0.28), 1.4);
        } else {
          drawTapered(pts, hexAlpha(ink, 0.26), 1.05);
          openCircle(first, hexAlpha(ink, 0.4), 3);
          filledDot(last, hexAlpha(ink, 0.4), 1.8);
        }
      }
    }

    var raf = 0;

    function tick() {
      target = progress();
      state += (target - state) * 0.065;
      draw();
      if (Math.abs(target - state) > 0.0004) {
        raf = requestAnimationFrame(tick);
      } else {
        state = target;
        draw();
        raf = 0;
      }
    }

    function kick() {
      if (!raf) raf = requestAnimationFrame(tick);
    }

    resize();
    draw();
    window.addEventListener('resize', function () { resize(); kick(); }, { passive: true });
    window.addEventListener('scroll', kick, { passive: true });
    toggle?.addEventListener('click', function () { draw(); });
  }
})();
