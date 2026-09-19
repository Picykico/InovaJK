document.addEventListener('DOMContentLoaded', function () {
  const yearNode = document.getElementById('year');
  if (yearNode) {
    yearNode.textContent = new Date().getFullYear();
  }

  const root = document.documentElement;
  const toggle = document.getElementById('themeToggle');

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (toggle) {
      const isDark = theme === 'dark';
      toggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
      toggle.setAttribute(
        'aria-label',
        isDark ? 'Alternar para modo claro' : 'Alternar para modo escuro'
      );
    }
    try {
      localStorage.setItem('inovajk-theme', theme);
    } catch (e) {
      /* armazenamento indisponível: tema não é salvo, mas continua funcionando */
    }
  }

  if (toggle) {
    // sincroniza o estado inicial do botão com o tema já aplicado pelo
    // script anti-flash no <head>
    applyTheme(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');

    toggle.addEventListener('click', function () {
      const current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  // ---- Menu mobile (hambúrguer) ----
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const navOverlay = document.getElementById('navOverlay');

  function closeMenu() {
    if (!navToggle || !navMenu) return;
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Abrir menu');
    navMenu.classList.remove('is-open');
    if (navOverlay) navOverlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function openMenu() {
    if (!navToggle || !navMenu) return;
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Fechar menu');
    navMenu.classList.add('is-open');
    if (navOverlay) navOverlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // fecha ao clicar fora (no overlay escurecido)
    if (navOverlay) {
      navOverlay.addEventListener('click', closeMenu);
    }

    // fecha ao clicar em um link do menu
    navMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    // fecha com a tecla Esc
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeMenu();
    });

    // se a tela for redimensionada para desktop com o menu aberto, fecha
    window.addEventListener('resize', function () {
      if (window.innerWidth > 760) closeMenu();
    });
  }

  // ---- Destaque da página atual no menu ----
  var currentFile = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav a[href]').forEach(function (link) {
    var linkFile = link.getAttribute('href').split('/').pop() || 'index.html';
    if (linkFile === currentFile) {
      link.classList.add('is-current');
    }
  });
});
