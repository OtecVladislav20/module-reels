import { getRem } from '../utils/utils';

let swiperDepsPromise;

async function getSwiperDeps() {
  if (!swiperDepsPromise) {
    swiperDepsPromise = Promise.all([
      import('swiper'),
      import('swiper/modules'),
      import('swiper/css'),
      import('swiper/css/navigation'),
      import('swiper/css/pagination'),
      import('swiper/css/effect-creative'),
    ]).then(([swiperPkg, modulesPkg]) => ({
      Swiper: swiperPkg.default,
      Navigation: modulesPkg.Navigation,
      Pagination: modulesPkg.Pagination,
      EffectCreative: modulesPkg.EffectCreative,
    }));
  }

  return swiperDepsPromise;
}

async function swiperReels() {
  const shell = document.querySelector('[data-swiper="reels"]');
  if (!shell) return;

  const el = shell.querySelector('.swiper');
  if (!el) return;

  const { Swiper, Navigation, Pagination } = await getSwiperDeps();

  new Swiper(el, {
    modules: [Navigation, Pagination],
    slidesPerView: 3.4,
    spaceBetween: 8 * getRem(),

    breakpoints: {
      768: {
        slidesPerView: 6,
        spaceBetween: 10 * getRem(),
      },
      1280: {
        slidesPerView: 8,
        spaceBetween: 40 * getRem(),
      },
    },

    navigation: {
      nextEl: shell.querySelector('.swiper-btn-reels-next'),
      prevEl: shell.querySelector('.swiper-btn-reels-prev'),
    },
  });
}

async function swiperAbout() {
  const shell = document.querySelector('[data-swiper="about"]');
  if (!shell) return;

  const el = shell.querySelector('.swiper');
  if (!el) return;

  const { Swiper, Navigation, Pagination } = await getSwiperDeps();

  new Swiper(el, {
    modules: [Navigation, Pagination],
    slidesPerView: 1,
    spaceBetween: 8 * getRem(),

    touchReleaseOnEdges: true,
    resistanceRatio: 0.3,

    breakpoints: {
      768: {
        slidesPerView: 1,
        spaceBetween: 40 * getRem(),
      },
    },

    navigation: {
      nextEl: shell.querySelector('.swiper-btn-about-next'),
      prevEl: shell.querySelector('.swiper-btn-about-prev'),
    },

    pagination: {
      el: shell.querySelector('.swiper-pagination-about'),
      clickable: true,
    },
  });
}

async function swiperActions() {
  const shell = document.querySelector('[data-swiper="actions"]');
  if (!shell) return;

  const el = shell.querySelector('.swiper');
  if (!el) return;

  const { Swiper, Navigation, Pagination } = await getSwiperDeps();

  new Swiper(el, {
    modules: [Navigation, Pagination],
    slidesPerView: 1.1,
    spaceBetween: 8 * getRem(),

    breakpoints: {
      768: {
        slidesPerView: 2,
        spaceBetween: 20 * getRem(),
      },
      1280: {
        slidesPerView: 3,
        spaceBetween: 20 * getRem(),
      },
    },

    navigation: {
      nextEl: shell.querySelector('.swiper-btn-actions-next'),
      prevEl: shell.querySelector('.swiper-btn-actions-prev'),
    },
  });
}

async function swiperParty() {
  const shell = document.querySelector('[data-swiper="party"]');
  if (!shell) return;

  const el = shell.querySelector('.swiper');
  if (!el) return;

  const { Swiper, Navigation, Pagination } = await getSwiperDeps();

  new Swiper(el, {
    modules: [Navigation, Pagination],
    slidesPerView: 1.1,
    spaceBetween: 8 * getRem(),

    breakpoints: {
      768: {
        slidesPerView: 1.5,
        spaceBetween: 20 * getRem(),
      },
      1280: {
        slidesPerView: 2,
        spaceBetween: 20 * getRem(),
      },
    },

    navigation: {
      nextEl: shell.querySelector('.swiper-btn-party-next'),
      prevEl: shell.querySelector('.swiper-btn-party-prev'),
    },
  });
}

async function swiperPhoto() {
  const shell = document.querySelector('[data-swiper="photo"]');
  if (!shell) return;

  const el = shell.querySelector('.swiper');
  if (!el) return;

  const { Swiper, Navigation, EffectCreative } = await getSwiperDeps();

  const photoSwiper = new Swiper(el, {
    modules: [Navigation, EffectCreative],
    loop: true,
    centeredSlides: true,
    watchSlidesProgress: true,
    speed: 700,
    grabCursor: true,

    effect: 'creative',
    slidesPerView: 1.08,
    spaceBetween: 80,
    creativeEffect: {
      perspective: true,
      limitProgress: 2,
      prev: {
        translate: ['-93%', 0, 120],
        rotate: [0, 14, 0],
        scale: 0.9,
        opacity: 0.9,
      },
      next: {
        translate: ['93%', 0, 120],
        rotate: [0, -14, 0],
        scale: 0.9,
        opacity: 0.9,
      },
    },

    breakpoints: {
      768: {
        slidesPerView: 2.5,
        spaceBetween: 40,
        creativeEffect: {
          perspective: true,
          limitProgress: 2,
          prev: { translate: ['-95%', 0, 220], rotate: [0, 28, 0], scale: 0.9, opacity: 0.75 },
          next: { translate: ['95%', 0, 220], rotate: [0, -28, 0], scale: 0.9, opacity: 0.75 },
        },
      },
    },

    navigation: {
      nextEl: shell.querySelector('.swiper-btn-photo-next'),
      prevEl: shell.querySelector('.swiper-btn-photo-prev'),
    },
  });

  requestAnimationFrame(() => photoSwiper.slideToLoop(1, 0, false));
}

async function swiperReview() {
  const shell = document.querySelector('[data-swiper="review"]');
  if (!shell) return;

  const el = shell.querySelector('.swiper');
  if (!el) return;

  const { Swiper, Navigation, Pagination } = await getSwiperDeps();

  new Swiper(el, {
    modules: [Navigation, Pagination],
    slidesPerView: 1.2,
    spaceBetween: 8 * getRem(),

    breakpoints: {
      768: {
        slidesPerView: 2.1,
        spaceBetween: 20 * getRem(),
      },
    },

    navigation: {
      nextEl: shell.querySelector('.swiper-btn-review-next'),
      prevEl: shell.querySelector('.swiper-btn-review-prev'),
    },
  });
}

async function swiperStocks() {
  const shell = document.querySelector('[data-swiper="stocks"]');
  if (!shell) return;

  const el = shell.querySelector('.swiper');
  if (!el) return;

  const { Swiper, Navigation, Pagination } = await getSwiperDeps();

  new Swiper(el, {
    modules: [Navigation, Pagination],
    slidesPerView: 1.2,
    spaceBetween: 8 * getRem(),

    breakpoints: {
      768: {
        slidesPerView: 1.5,
        spaceBetween: 20 * getRem(),
      },
      1280: {
        slidesPerView: 2,
        spaceBetween: 20 * getRem(),
      },
    },

    navigation: {
      nextEl: shell.querySelector('.swiper-btn-stocks-next'),
      prevEl: shell.querySelector('.swiper-btn-stocks-prev'),
    },
  });
}

async function swiperBlog() {
  const shell = document.querySelector('[data-swiper="blog"]');
  if (!shell) return;

  const el = shell.querySelector('.swiper');
  if (!el) return;

  const { Swiper, Navigation, Pagination } = await getSwiperDeps();

  new Swiper(el, {
    modules: [Navigation, Pagination],
    slidesPerView: 1.05,
    spaceBetween: 8 * getRem(),

    breakpoints: {
      768: {
        slidesPerView: 2,
        spaceBetween: 20 * getRem(),
      },
      1280: {
        slidesPerView: 3,
        spaceBetween: 20 * getRem(),
      },
    },

    navigation: {
      nextEl: shell.querySelector('.swiper-btn-blog-next'),
      prevEl: shell.querySelector('.swiper-btn-blog-prev'),
    },
  });
}

export function initSwipers() {
  swiperReels();
  swiperAbout();
  swiperActions();
  swiperParty();
  swiperPhoto();
  swiperReview();
  swiperStocks();
  swiperBlog();
}
