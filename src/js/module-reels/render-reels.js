export function renderReelsPreview(stories = []) {
  const wrapper = document.querySelector('[data-reels-preview-wrapper]');
  const tpl = wrapper?.querySelector('template');
  if (!wrapper || !tpl) return;

  wrapper.querySelectorAll('.swiper-slide[data-generated="1"]').forEach((el) => el.remove());

  const frag = document.createDocumentFragment();

  stories.forEach((story) => {
    const slide = tpl.content.firstElementChild.cloneNode(true);
    slide.dataset.generated = '1';

    slide.querySelectorAll('[data-reel]').forEach((el) => {
      const key = el.dataset.reel;
      const value = story[key] ?? '';
      const attr = el.dataset.reelAttr;

      if (attr) el.setAttribute(attr, value);
      else el.textContent = value;
    });

    frag.append(slide);
  });

  wrapper.append(frag);
}

function isVideoSrc(src = '') {
  return /\.(mp4|webm|mov|m4v|ogg)(\?|#|$)/i.test(src);
}

function createProgressBar(index) {
  const bar = document.createElement('button');
  bar.type = 'button';
  bar.className = 'reels-modal__bar';
  bar.dataset.reelsProgress = '';
  bar.dataset.segmentIndex = String(index);
  return bar;
}

function createStoryMediaEl(item, alt = '') {
  if (!item?.src) return null;

  if (isVideoSrc(item.src)) {
    const video = document.createElement('video');
    video.src = item.src;
    video.playsInline = true;
    video.preload = 'metadata';
    return video;
  }

  const img = document.createElement('img');
  img.src = item.src;
  img.alt = alt;
  img.loading = 'lazy';
  return img;
}

export function renderReelsModal(stories = []) {
  const wrapper = document.querySelector('[data-reels-modal-wrapper]');
  const tpl = wrapper?.querySelector('template');
  if (!wrapper || !tpl) return;

  wrapper.querySelectorAll('.swiper-slide[data-generated="1"]').forEach((el) => el.remove());

  const frag = document.createDocumentFragment();

  stories.forEach((story) => {
    const slide = tpl.content.firstElementChild.cloneNode(true);
    slide.dataset.generated = '1';

    const titleEl = slide.querySelector('[data-reel="title"]');
    const textEl = slide.querySelector('[data-reel="text"]');
    const mediaRoot = slide.querySelector('[data-reel-media]');

    if (titleEl) titleEl.textContent = story.title || '';
    if (textEl) textEl.textContent = story.text || '';

    const barsRoot = slide.querySelector('[data-reel-progress-bars]');
    if (barsRoot) {
      barsRoot.replaceChildren();

      (story.items || []).forEach((_, index) => {
        barsRoot.append(createProgressBar(index));
      });
    }

    const mediaEl = createStoryMediaEl(story.items?.[0], story.title || 'Рилс');
    if (mediaEl && mediaRoot) mediaRoot.append(mediaEl);

    frag.append(slide);
  });

  wrapper.append(frag);
}
