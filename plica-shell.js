/* Plica shared shell — nav menu + theme */
(function () {
  function initNavMenu() {
    var menuBtn = document.getElementById('navMenuBtn');
    var navLinks = document.getElementById('navLinks');
    if (!menuBtn || !navLinks) return;

    menuBtn.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open);
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });

    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        navLinks.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.setAttribute('aria-label', 'Open menu');
      });
    });
  }

  function updateThemeBtn() {
    var btn = document.getElementById('themeBtn');
    if (!btn) return;
    btn.textContent = document.documentElement.classList.contains('dark') ? '🌙' : '☀️';
  }

  window.toggleTheme = function () {
    var html = document.documentElement;
    var isDark = html.classList.contains('dark');
    if (isDark) {
      html.classList.remove('dark');
      html.classList.add('light');
      localStorage.setItem('plica-theme', 'light');
    } else {
      html.classList.remove('light');
      html.classList.add('dark');
      localStorage.setItem('plica-theme', 'dark');
    }
    updateThemeBtn();
  };

  function initTheme() {
    var saved = localStorage.getItem('plica-theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var html = document.documentElement;
    if (saved === 'dark' || (!saved && prefersDark)) {
      html.classList.add('dark');
      html.classList.remove('light');
    } else if (saved === 'light') {
      html.classList.add('light');
      html.classList.remove('dark');
    }
    updateThemeBtn();
  }

  window.setLangAria = function (lang) {
    document.querySelectorAll('.lang-btn').forEach(function (b) {
      var on = b.textContent.trim().toLowerCase() === lang;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', on);
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    initNavMenu();
    initTheme();
  });
})();
