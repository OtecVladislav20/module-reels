import { Modals } from '../libs/vgmodals';

export function initValidatedForms() {
  const forms = document.querySelectorAll('form[data-success-modal]');
  if (!forms.length) return;

  forms.forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const successModalId = form.dataset.successModal;
      const closeModalId = form.dataset.closeModal || form.closest('[data-modal]')?.dataset.modal;

      if (closeModalId) Modals.getModal(closeModalId)?.close();
      if (successModalId) Modals.getModal(successModalId)?.open(true);

      form.reset();
    });
  });
}
