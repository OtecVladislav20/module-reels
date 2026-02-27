export function initFormSubject() {
  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-modal-id]');
    if (!trigger) return;

    const modalId = trigger.dataset.modalId;
    const subject = trigger.dataset.subject?.trim();
    if (!modalId || !subject) return;

    const modal = document.querySelector(`[data-modal="${modalId}"]`);
    if (!modal) return;

    modal.querySelectorAll('form').forEach((form) => {
      let input = form.querySelector('input[name="subject"]');
      if (!input) {
        input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'subject';
        form.appendChild(input);
      }
      input.value = subject;
    });
  });
}
