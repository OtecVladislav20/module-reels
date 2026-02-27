export function initBurgerMenu() {
  const body = document.body;
  const menu = document.querySelector('.burger-list');
  const openBtn = document.querySelector('.burger');
  if (!menu || !openBtn) return;

  const closeBtns = menu.querySelectorAll('[data-burger-close]');
  const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

  const open = () => {
    body.classList.add('menu-open');
    openBtn.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-hidden', 'false');
    menu.removeAttribute('inert');

    const firstFocusable = menu.querySelector(focusableSelector);
    firstFocusable?.focus();
  };

  const close = () => {
    if (menu.contains(document.activeElement)) {
      openBtn.focus();
    }

    body.classList.remove('menu-open');
    openBtn.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
    menu.setAttribute('inert', '');
  };

  openBtn.addEventListener('click', () => {
    body.classList.contains('menu-open') ? close() : open();
  });

  closeBtns.forEach((btn) => btn.addEventListener('click', close));

  menu.addEventListener('click', (event) => {
    if (event.target === menu) {
      close();
      return;
    }

    const link = event.target.closest('.burger-list__nav a');
    if (link) close();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && body.classList.contains('menu-open')) close();
  });
}
