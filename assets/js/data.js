const modalTargets = {
  "open-modal-portfolio": document.querySelector("#content-modal-portfolio .modal"),
  "open-modal-blog": document.querySelector("#content-modal-blog .modal"),
};

for (const [triggerClass, modal] of Object.entries(modalTargets)) {
  document.querySelectorAll(`.${triggerClass}[data-modal-id]`).forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const template = document.getElementById(trigger.dataset.modalId);
      if (!template || !modal) {
        console.error(`Missing modal template: ${trigger.dataset.modalId}`);
        return;
      }
      modal.replaceChildren(template.content.cloneNode(true));
    });
  });
}
