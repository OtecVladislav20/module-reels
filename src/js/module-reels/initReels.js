import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import { Modals } from '../libs/vgmodals';

class ReelsModule {
  constructor(options = {}) {
    this.options = {
      imageDuration: 5000,
      previewSelector: '[data-modal-id="reels"]',
      modalSwiperSelector: '[data-swiper="reels-modal"]',
      detectMediaKind: null,
      ...options,
    };

    this.modalSwiper = null;
    this.modalEl = null;
    this.modalInstance = null;

    this.rafId = null;
    this.isModalOpened = false;
    this.isHolding = false;
    this.holdElapsed = 0;
    this.holdStartedAt = 0;
    this.pendingIndex = 0;

    this.seekHandlers = [];
    this.previewHandlers = [];

    this.onPointerUp = this.resumeHold.bind(this);
    this.onPointerCancel = this.resumeHold.bind(this);
    this.onSlideChange = this.handleSlideChange.bind(this);
  }

  init() {
    this.modalEl = document.querySelector(this.options.modalSwiperSelector);
    if (!this.modalEl) return;

    this.initSwiper();
    this.bindPreviewTriggers();
    this.bindProgressSeek();
    this.bindHoldEvents();
    this.bindModalLifecycle();
  }

  destroy() {
    this.stopProgress();
    this.stopAllVideos(true);

    if (this.onHoldPointerDown) {
      this.modalEl?.removeEventListener('pointerdown', this.onHoldPointerDown);
    }

    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('pointercancel', this.onPointerCancel);

    this.seekHandlers.forEach(({ bar, onPointerDown }) => {
      bar.removeEventListener('pointerdown', onPointerDown);
    });
    this.seekHandlers = [];

    this.previewHandlers.forEach(({ trigger, onClick }) => {
      trigger.removeEventListener('click', onClick);
    });
    this.previewHandlers = [];

    if (this.modalSwiper && this.onSlideChange) {
      this.modalSwiper.off('slideChange', this.onSlideChange);
    }

    this.modalSwiper?.destroy(true, true);
    this.modalSwiper = null;
  }

  initSwiper() {
    this.modalSwiper = new Swiper(this.modalEl, {
      modules: [Navigation, Pagination],
      slidesPerView: 1,
      spaceBetween: 40,
      centeredSlides: true,
      slideToClickedSlide: true,
      watchSlidesProgress: true,
      watchOverflow: true,

      breakpoints: {
        768: {
          slidesPerView: 2.5,
        },
        1200: {
          slidesPerView: 3.8,
        },
      },
    });
  }

  bindPreviewTriggers() {
    const triggers = document.querySelectorAll(this.options.previewSelector);
    if (!triggers.length || !this.modalSwiper) return;

    triggers.forEach((trigger) => {
      const onClick = () => {
        const slide = trigger.closest('.swiper-slide') || trigger;
        const idx = Array.from(slide.parentElement.children).indexOf(slide);
        this.pendingIndex = Math.max(0, idx);

        if (this.isModalOpened) {
          this.modalSwiper.slideTo(this.pendingIndex, 0);
        }
      };

      trigger.addEventListener('click', onClick);
      this.previewHandlers.push({ trigger, onClick });
    });
  }

  bindProgressSeek() {
    if (!this.modalEl || !this.modalSwiper) return;

    const bars = this.modalEl.querySelectorAll('[data-reels-progress]');

    bars.forEach((bar) => {
      const onPointerDown = (event) => {
        event.preventDefault();
        event.stopPropagation();

        const rect = bar.getBoundingClientRect();
        const ratio = this.clamp01((event.clientX - rect.left) / rect.width);

        const slideElement = bar.closest('.swiper-slide');
        if (!slideElement) return;

        if (!slideElement.classList.contains('swiper-slide-active')) {
          const index = Array.from(this.modalSwiper.slides).indexOf(slideElement);
          if (index < 0) return;

          this.modalSwiper.slideTo(index);
          this.modalSwiper.once('slideChangeTransitionEnd', () => {
            const activeSlide = this.getActiveSlide();
            this.seekActiveSlideToRatio(activeSlide, ratio);
          });
          return;
        }

        this.seekActiveSlideToRatio(slideElement, ratio);
      };

      bar.addEventListener('pointerdown', onPointerDown);
      this.seekHandlers.push({ bar, onPointerDown });
    });
  }

  bindHoldEvents() {
    if (!this.modalEl) return;

    this.onHoldPointerDown = (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      this.pauseHold();
    };

    this.modalEl.addEventListener('pointerdown', this.onHoldPointerDown);
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('pointercancel', this.onPointerCancel);
  }

  bindModalLifecycle() {
    if (!this.modalSwiper) return;

    this.modalSwiper.on('slideChange', this.onSlideChange);

    this.modalInstance = Modals.getModal('reels');
    if (!this.modalInstance) return;

    this.modalInstance.onOpen(() => {
      this.isModalOpened = true;
      this.isHolding = false;
      this.holdElapsed = 0;

      this.modalSwiper.update();
      this.modalSwiper.slideTo(this.pendingIndex, 0);
      this.startActiveProgress({ resume: false });
    });

    this.modalInstance.onClose(() => {
      this.isModalOpened = false;
      this.isHolding = false;
      this.holdElapsed = 0;

      this.stopProgress();
      this.stopAllVideos(true);
      this.resetAllProgress();
    });
  }

  handleSlideChange() {
    this.isHolding = false;
    this.holdElapsed = 0;
    this.startActiveProgress({ resume: false });
  }

  getActiveSlide() {
    if (!this.modalSwiper) return null;
    return this.modalSwiper.slides[this.modalSwiper.activeIndex] || null;
  }

  getSlideVideo(slideElement) {
    return slideElement?.querySelector('video') || null;
  }

  getSlideMediaKind(slideElement) {
    if (!slideElement) return null;

    if (typeof this.options.detectMediaKind === 'function') {
      return this.options.detectMediaKind(slideElement);
    }

    return this.getSlideVideo(slideElement) ? 'video' : 'image';
  }

  setProgress(slideElement, percent) {
    const bar = slideElement?.querySelector('[data-reels-progress]');
    if (!bar) return;

    const safePercent = Math.max(0, Math.min(100, percent));
    bar.style.setProperty('--progress', `${safePercent}%`);
  }

  resetAllProgress() {
    if (!this.modalSwiper) return;
    this.modalSwiper.slides.forEach((slide) => this.setProgress(slide, 0));
  }

  stopProgress() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  stopAllVideos(reset = false) {
    if (!this.modalEl) return;

    this.modalEl.querySelectorAll('video').forEach((video) => {
      video.pause();

      if (reset) {
        try {
          video.currentTime = 0;
        } catch {}
      }
    });
  }

  startImageProgress(fromElapsed = 0) {
    const activeSlide = this.getActiveSlide();
    if (!activeSlide || this.getSlideMediaKind(activeSlide) !== 'image') return;

    this.holdElapsed = fromElapsed;
    this.holdStartedAt = performance.now() - this.holdElapsed;

    const tick = (now) => {
      if (!this.isModalOpened || this.isHolding) return;

      const elapsed = Math.min(now - this.holdStartedAt, this.options.imageDuration);
      this.holdElapsed = elapsed;

      const percent = (elapsed / this.options.imageDuration) * 100;
      this.setProgress(activeSlide, percent);

      if (elapsed >= this.options.imageDuration) {
        this.holdElapsed = 0;
        this.modalSwiper.slideNext();
        return;
      }

      this.rafId = requestAnimationFrame(tick);
    };

    this.rafId = requestAnimationFrame(tick);
  }

  startVideoProgress({ resume = false } = {}) {
    const activeSlide = this.getActiveSlide();
    if (!activeSlide || this.getSlideMediaKind(activeSlide) !== 'video') return;

    const video = this.getSlideVideo(activeSlide);
    if (!video) return;

    const runVideo = () => {
      if (!resume) {
        try {
          video.currentTime = 0;
        } catch {}
        this.setProgress(activeSlide, 0);
      }

      video.playsInline = true;

      const playPromise = video.play();
      if (playPromise?.catch) {
        playPromise.catch(() => {});
      }

      const tick = () => {
        if (!this.isModalOpened || this.isHolding) return;

        const duration = video.duration || 0;
        if (duration > 0) {
          const percent = Math.min((video.currentTime / duration) * 100, 100);
          this.setProgress(activeSlide, percent);

          if (video.ended || video.currentTime >= duration - 0.05) {
            this.modalSwiper.slideNext();
            return;
          }
        }

        this.rafId = requestAnimationFrame(tick);
      };

      this.rafId = requestAnimationFrame(tick);
    };

    if (video.readyState >= 1) {
      runVideo();
    } else {
      video.addEventListener('loadedmetadata', runVideo, { once: true });
      video.load();
    }
  }

  startActiveProgress({ resume = false } = {}) {
    this.stopProgress();

    const activeSlide = this.getActiveSlide();
    if (!activeSlide) return;

    if (!resume) {
      this.resetAllProgress();
      this.stopAllVideos(true);
      this.holdElapsed = 0;
    }

    if (this.getSlideMediaKind(activeSlide) === 'video') {
      this.startVideoProgress({ resume });
    } else {
      this.startImageProgress(resume ? this.holdElapsed : 0);
    }
  }

  pauseHold() {
    if (!this.isModalOpened || this.isHolding) return;

    this.isHolding = true;
    this.stopProgress();

    const activeSlide = this.getActiveSlide();
    if (!activeSlide) return;

    if (this.getSlideMediaKind(activeSlide) === 'video') {
      this.getSlideVideo(activeSlide)?.pause();
    } else {
      this.holdElapsed = Math.min(
        performance.now() - this.holdStartedAt,
        this.options.imageDuration,
      );
    }
  }

  resumeHold() {
    if (!this.isModalOpened || !this.isHolding) return;

    this.isHolding = false;
    this.startActiveProgress({ resume: true });
  }

  seekActiveSlideToRatio(slideElement, ratio) {
    const safeRatio = this.clamp01(ratio);
    const kind = this.getSlideMediaKind(slideElement);
    if (!kind) return;

    if (kind === 'video') {
      const video = this.getSlideVideo(slideElement);
      if (!video) return;

      const applySeek = () => {
        const duration = video.duration || 0;
        if (!duration) return;

        video.currentTime = safeRatio * duration;
        this.setProgress(slideElement, safeRatio * 100);

        if (!this.isHolding && this.isModalOpened) {
          this.startActiveProgress({ resume: true });
        }
      };

      if (video.readyState >= 1) {
        applySeek();
      } else {
        video.addEventListener('loadedmetadata', applySeek, { once: true });
        video.load();
      }

      return;
    }

    this.holdElapsed = safeRatio * this.options.imageDuration;
    this.holdStartedAt = performance.now() - this.holdElapsed;
    this.setProgress(slideElement, safeRatio * 100);

    if (!this.isHolding && this.isModalOpened) {
      this.startActiveProgress({ resume: true });
    }
  }

  clamp01(value) {
    return Math.max(0, Math.min(1, value));
  }
}

export function initSwiperReelsModal(options) {
  const module = new ReelsModule(options);
  module.init();
  return module;
}
