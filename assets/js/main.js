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
    var STEPS = 56;

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

    function draw() {
      var w = canvas.width / dpr;
      var h = canvas.height / dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      var cs = getComputedStyle(document.documentElement);
      var ink = cs.getPropertyValue('--fg');
      var accent = cs.getPropertyValue('--accent');
      var t = state;
      var tau = t * Math.PI * 2;

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (var i = 0; i < LINES; i++) {
        var u0 = (i + 0.65) / (LINES + 0.4);
        var xStart = w * (0.06 + 0.88 * u0 + 0.035 * Math.sin(tau + i * 1.1));
        var xEnd = w * (0.06 + 0.88 * u0 + 0.05 * Math.cos(tau * 0.85 + i * 1.4));
        var yStart = -h * 0.04;
        var yEnd = h * 1.04;

        // Mode amplitudes: change the "way" of each bridge with scroll
        var a1 = w * 0.22 * Math.sin(tau + i * 0.9);
        var a2 = w * 0.09 * Math.sin(tau * 1.7 + i * 1.6 + 0.4);
        var b1 = h * 0.055 * Math.cos(tau * 0.6 + i);

        ctx.beginPath();
        for (var s = 0; s <= STEPS; s++) {
          var u = s / STEPS;
          var su = Math.sin(Math.PI * u);
          var su2 = Math.sin(2 * Math.PI * u);
          var x = (1 - u) * xStart + u * xEnd + a1 * su + a2 * su2;
          var y = (1 - u) * yStart + u * yEnd + b1 * su;
          if (s === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        var isAccent = i === 2;
        ctx.strokeStyle = hexAlpha(isAccent ? accent : ink, isAccent ? 0.42 : 0.2);
        ctx.lineWidth = isAccent ? 1.15 : 0.9;
        ctx.stroke();
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
