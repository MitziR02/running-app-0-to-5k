const screens = [...document.querySelectorAll('.screen')];
const navigationItems = [...document.querySelectorAll('.navigation-item')];

function showScreen(screenId) {
  const targetId = screens.some((screen) => screen.id === screenId) ? screenId : 'home';

  screens.forEach((screen) => {
    const isVisible = screen.id === targetId;
    screen.hidden = !isVisible;
  });

  navigationItems.forEach((item) => {
    const isActive = item.getAttribute('href') === `#${targetId}`;
    item.classList.toggle('navigation-item-active', isActive);
    item.setAttribute('aria-current', isActive ? 'page' : 'false');
  });
}

function handleRouteChange() {
  showScreen(window.location.hash.slice(1));
}

window.addEventListener('hashchange', handleRouteChange);
handleRouteChange();
