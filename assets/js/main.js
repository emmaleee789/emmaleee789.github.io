(function () {
  'use strict';

  // ── Theme toggle ──────────────────────────────────
  const toggle = document.querySelector('.theme-toggle');
  const icon = toggle?.querySelector('span');

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    if (icon) icon.textContent = theme === 'dark' ? '☀' : '☾';
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
})();
