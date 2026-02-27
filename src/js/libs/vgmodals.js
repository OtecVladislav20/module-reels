/**********************************************************/
/*  @name  Modal Windows by VICTORY digital               */
/*	@copyright	VICTORY group                             */
/*	@support	https://victoryagency.ru/digital            */
/**********************************************************/

export class Modals {
  static _Modals = {};
  static _ActiveModal = null;

  static addModal(Modal) {
    const modal = Modal;
    this._Modals[modal.id] = modal;
  }

  static getModal(id) {
    return this._Modals[id] ?? false;
  }

  static getActiveModal() {
    return this._ActiveModal;
  }

  static setActiveModal(modal) {
    this._ActiveModal = modal;
  }

  static refreshAllButtons() {
    for (const index in this._Modals) {
      this._Modals[index].refreshButtons();
    }
  }

  static closeAll() {
    for (const index in this._Modals) {
      this._Modals[index].close();
    }
  }
}
export class Modal {
  id;
  $modal;
  $buttons;
  $closeButton;
  onOpenCallback;
  onCloseCallback;

  constructor($modal) {
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
    this.handleEscape = this.handleEscape.bind(this);
    this.handleTab = this.handleTab.bind(this);
    this.handleCloseClick = this.handleCloseClick.bind(this);
    this.handleOutsideClick = this.handleOutsideClick.bind(this); // Добавляем новый биндинг

    this.$modal = $modal;
    this.id = $modal.dataset.modal ?? null;
    this.refreshButtons();
    this.refreshCloseButtons();

    // Проверяем наличие кнопки закрытия
    this.$closeButton = this.$modal?.querySelector('.modal-close');

    // Инициализация ARIA-атрибутов
    if (!this.$modal.hasAttribute('role')) {
      this.$modal.setAttribute('role', 'dialog');
    }
    if (!this.$modal.hasAttribute('aria-modal')) {
      this.$modal.setAttribute('aria-modal', 'true');
    }
    if (!this.$modal.hasAttribute('aria-hidden')) {
      this.$modal.setAttribute('aria-hidden', 'true');
    }

    if (!this.$modal.hasAttribute('tabindex')) {
      this.$modal.setAttribute('tabindex', '-1');
    }

    // Убедимся, что у заголовка есть id для aria-labelledby
    const modalTitle = this.$modal.querySelector('.modal-title');
    if (modalTitle && !modalTitle.id) {
      modalTitle.id = `${this.id}Title`;
      this.$modal.setAttribute('aria-labelledby', modalTitle.id);
    }

    // Добавляем роль и метку для кнопки закрытия
    if (this.$closeButton) {
      if (!this.$closeButton.hasAttribute('role')) {
        this.$closeButton.setAttribute('role', 'button');
      }
      if (!this.$closeButton.hasAttribute('aria-label')) {
        this.$closeButton.setAttribute('aria-label', 'Закрыть');
      }
      // Добавляем tabindex="0", если это не button и tabindex не указан
      if (
        this.$closeButton.tagName.toLowerCase() !== 'button' &&
        !this.$closeButton.hasAttribute('tabindex')
      ) {
        this.$closeButton.setAttribute('tabindex', '0');
      }
    }

    Modals.addModal(this);
  }

  // Добавляем методы для установки callbacks
  onOpen(callback) {
    if (typeof callback === 'function') {
      this.onOpenCallback = callback;
    }
    return this; // для цепочки вызовов
  }

  onClose(callback) {
    if (typeof callback === 'function') {
      this.onCloseCallback = callback;
    }
    return this; // для цепочки вызовов
  }

  getScrollbarWidth() {
    // Создаём элемент с прокруткой
    const outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.overflow = 'scroll';
    document.body.appendChild(outer);

    // Создаём внутренний элемент
    const inner = document.createElement('div');
    outer.appendChild(inner);

    // Вычисляем ширину скролла
    const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;

    // Удаляем временные элементы
    outer.parentNode.removeChild(outer);

    return scrollbarWidth;
  }

  hasScrollbar() {
    return window.innerWidth > document.documentElement.clientWidth;
  }

  getFocusableElements() {
    return this.$modal.querySelectorAll(
      '.modal-close, a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])',
    );
  }

  handleTab(e) {
    if (e.key !== 'Tab') return;

    const focusableElements = this.getFocusableElements();
    if (focusableElements.length === 0) return;

    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];

    // Убедиться, что фокус внутри модалки
    if (!this.$modal.contains(document.activeElement)) {
      e.preventDefault();
      first.focus();
      return;
    }

    // Если нажат Shift + Tab
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    }
    // Если нажат Tab
    else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  refreshButtons() {
    this.$buttons = document.querySelectorAll(`[data-modal-id="${this.id}"]`);
    for (const [index, $button] of this.$buttons.entries()) {
      $button.removeEventListener('click', this.open);
      $button.addEventListener('click', this.open);
    }
  }

  refreshCloseButtons() {
    // Находим все кнопки с атрибутом data-modal-close
    const closeButtons = document.querySelectorAll('[data-modal-close]');

    closeButtons.forEach((button) => {
      button.removeEventListener('click', this.handleCloseClick);
      button.addEventListener('click', this.handleCloseClick);
    });
  }

  handleCloseClick(e) {
    const targetId = e.currentTarget.dataset.modalClose;

    // Если атрибут пустой, закрываем активную модалку
    if (!targetId) {
      const activeModal = Modals.getActiveModal();
      if (activeModal) {
        activeModal.close();
      }
      return;
    }

    // Если указан id, закрываем конкретную модалку
    const targetModal = Modals.getModal(targetId);
    if (targetModal) {
      targetModal.close();
    }
  }

  handleEscape(e) {
    if (e.key === 'Escape') {
      this.close();
    }
  }

  lockScroll() {
    const bodyComputedStyle = window.getComputedStyle(document.body);
    const bodyWidth = parseInt(bodyComputedStyle.width);
    const viewportWidth = Math.round(window.innerWidth);
    const bodyIs100vw = Math.abs(bodyWidth - viewportWidth) <= 1;

    // Проверяем наличие скролла
    if (!bodyIs100vw && this.hasScrollbar()) {
      // Сохраняем текущий padding-right
      this.initialBodyPadding = parseInt(bodyComputedStyle.paddingRight) || 0;

      // Добавляем padding-right = ширина скроллбара + текущий padding
      document.body.style.paddingRight = `${this.initialBodyPadding + this.getScrollbarWidth()}px`;
    }

    document.body.classList.add('modal-opened');
  }

  unlockScroll() {
    // Восстанавливаем исходный padding-right
    document.body.style.paddingRight = this.initialBodyPadding
      ? `${this.initialBodyPadding}px`
      : '';
    document.body.classList.remove('modal-opened');
  }

  // Добавляем новый метод для обработки клика вне модалки
  handleOutsideClick(e) {
    this.close(false, e);
  }

  open(clear = false) {
    // Закрываем все модалки, кроме текущей
    for (const index in Modals._Modals) {
      if (Modals._Modals[index] !== this) {
        Modals._Modals[index].close(false, undefined, true);
      }
    }

    this.$modal.classList.add('opened');
    this.$modal.setAttribute('aria-hidden', 'false');
    Modals.setActiveModal(this);
    this.lockScroll();

    // Вызываем callback при открытии
    if (this.onOpenCallback) {
      this.onOpenCallback(this);
    }

    // Сохраняем элемент, на котором был фокус
    this.previousActiveElement = document.activeElement;

    // Устанавливаем фокус на первый фокусируемый элемент
    requestAnimationFrame(() => {
      const focusableElements = this.getFocusableElements();
      if (focusableElements.length > 0) {
        try {
          focusableElements[0].focus({ preventScroll: true });
        } catch {
          focusableElements[0].focus();
        }
      } else {
        // если нет фокусируемых — фокус на саму модалку
        const modalWindow = this.$modal.querySelector('.modal-window');
        if (modalWindow) {
          modalWindow.setAttribute('tabindex', '-1');
          modalWindow.focus({ preventScroll: true });
        }
      }
    });

    // Используем сохраненную функцию для обработчика
    setTimeout(() => {
      document.addEventListener('click', this.handleOutsideClick);
    }, 0);
    document.addEventListener('keydown', this.handleEscape);
    document.addEventListener('keydown', this.handleTab);

    if (clear === true) {
      this.clear();
    }
  }

  close(clear = false, e, isOpeningNew = false) {
    if (e !== undefined && e.type === 'click') {
      const $target = e.target;

      // Если кнопки триггера вообще нет — считаем, что модалка открыта вручную
      const hasManualOpen = !this.$buttons || this.$buttons.length === 0;

      const isButton =
        !hasManualOpen && Array.prototype.some.call(this.$buttons, (btn) => btn.contains($target));

      const isCloseButton = this.$closeButton?.contains($target);

      const modalContent =
        this.$modal.querySelector('.modal-window') || this.$modal.querySelector('div');

      const isClickInside = modalContent?.contains($target);

      // Предотвратить закрытие, если:
      // 1. клик был по триггеру (если они есть)
      // 2. клик внутри окна, но не по кнопке закрытия
      if ((!hasManualOpen && isButton) || (isClickInside && !isCloseButton)) {
        return;
      }
    }

    this.$modal.classList.remove('opened');
    this.$modal.setAttribute('aria-hidden', 'true');

    // Вызываем callback только если это не закрытие для открытия новой модалки
    if (!isOpeningNew && this.onCloseCallback) {
      this.onCloseCallback(this);
    }

    if (Modals.getActiveModal() === this) {
      Modals.setActiveModal(null);
    }
    this.unlockScroll();

    // Удаляем все обработчики событий
    document.removeEventListener('click', this.handleOutsideClick);
    document.removeEventListener('keydown', this.handleEscape);
    document.removeEventListener('keydown', this.handleTab);

    // Возвращаем фокус, только если не открывается другая модалка
    if (!isOpeningNew && this.previousActiveElement) {
      this.previousActiveElement.focus();
    }

    if (clear === true) {
      this.clear();
    }
  }

  clear() {
    const nodeName = this.$modal.nodeName;

    if (nodeName === 'FORM') {
      this.$modal.reset();
    } else {
      const $form = this.$modal.querySelector('form');
      $form?.reset();
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  (function () {
    // Привязка кнопок к модалкам
    const $modals = document.querySelectorAll('[data-modal]');
    for (const [index, $item] of $modals.entries()) {
      new Modal($item);
    }
  })();
});
