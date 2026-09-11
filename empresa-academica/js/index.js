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
});
