import { initSwipers } from './modules/initSwiper';
import { initVGMap } from './libs/victorymap';
import { initBurgerMenu } from './modules/initBurgerMenu';
import { initSwiperReelsModal } from './module-reels/initReels';
import { initValidatedForms } from './modules/initValidatedForms';
import { initFormSubject } from './modules/initFormSubject';
import './libs/vgmodals';

import { Modals } from './libs/vgmodals';
import { reelsMock } from './module-reels/reels.mock';
import { renderReelsPreview, renderReelsModal } from './module-reels/render-reels';

document.addEventListener('DOMContentLoaded', async () => {
  if (document.querySelector('input[type="tel"]')) {
    const { initMask } = await import('./libs/mask-lib/initMask');
    initMask();
  }

  /////////////////////
  renderReelsPreview(reelsMock);
  renderReelsModal(reelsMock);
  Modals.refreshAllButtons();

  initValidatedForms();
  initFormSubject();

  initSwipers();

  initSwiperReelsModal();

  initBurgerMenu();

  initVGMap();
});
