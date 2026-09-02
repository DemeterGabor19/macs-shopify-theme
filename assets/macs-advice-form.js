class MacsAdviceForm {
  /** @type {HTMLElement} */
  section = document.createElement("div");

  /** @type {HTMLFormElement} */
  form = document.createElement("form");

  /** @type {HTMLElement[]} */
  panels = [];

  /** @type {HTMLButtonElement[]} */
  progress = [];

  /** @type {HTMLButtonElement} */
  back = document.createElement("button");

  /** @type {HTMLButtonElement} */
  next = document.createElement("button");

  /** @type {HTMLButtonElement} */
  submit = document.createElement("button");

  /** @type {HTMLElement} */
  validation = document.createElement("div");

  /** @type {number} */
  current = 0;

  /** @param {HTMLElement} section */
  constructor(section) {
    const form = section.querySelector(".macs-advice-form");
    const back = section.querySelector("[data-form-back]");
    const next = section.querySelector("[data-form-next]");
    const submit = section.querySelector("[data-form-submit]");
    const validation = section.querySelector("[data-form-validation]");

    if (
      !(form instanceof HTMLFormElement) ||
      !(back instanceof HTMLButtonElement) ||
      !(next instanceof HTMLButtonElement) ||
      !(submit instanceof HTMLButtonElement) ||
      !(validation instanceof HTMLElement)
    ) {
      return;
    }

    this.section = section;
    this.form = form;
    this.panels = /** @type {HTMLElement[]} */ ([
      ...this.form.querySelectorAll("[data-form-step]"),
    ]);
    this.progress = /** @type {HTMLButtonElement[]} */ ([
      ...section.querySelectorAll("[data-progress-step]"),
    ]);
    this.back = back;
    this.next = next;
    this.submit = submit;
    this.validation = validation;
    this.current = 0;
    this.bind();
    this.updateDogName();
    this.updateFeedingPanel();
    this.render(false);
  }

  bind() {
    this.next.addEventListener("click", () => this.goNext());
    this.back.addEventListener("click", () => this.goBack());
    this.progress.forEach((button) =>
      button.addEventListener("click", () =>
        this.goTo(Number(button.dataset.progressStep)),
      ),
    );
    this.form
      .querySelector("[data-dog-name-input]")
      ?.addEventListener("input", () => this.updateDogName());
    this.form
      .querySelectorAll("[data-feeding-mode]")
      .forEach((input) =>
        input.addEventListener("change", () => this.updateFeedingPanel()),
      );
    /** @param {SubmitEvent} event */
    this.form.addEventListener("submit", (event) => {
      if (!this.validatePanel(this.current)) event.preventDefault();
    });
  }

  /** @param {number} index */
  validatePanel(index) {
    const panel = this.panels[index];
    if (!panel) return false;

    const fields =
      /** @type {(HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)[]} */ ([
        ...panel.querySelectorAll("input, select, textarea"),
      ]).filter((field) => !field.disabled && !field.closest("[hidden]"));
    const invalid = fields.find((field) => !field.checkValidity());
    if (invalid) {
      this.validation.hidden = false;
      invalid.reportValidity();
      invalid.focus({ preventScroll: true });
      invalid.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }
    this.validation.hidden = true;
    return true;
  }

  goNext() {
    if (!this.validatePanel(this.current)) return;
    if (this.current < this.panels.length - 1) this.goTo(this.current + 1);
  }

  goBack() {
    if (this.current > 0) this.goTo(this.current - 1);
  }

  /** @param {number} index */
  goTo(index) {
    if (index < 0 || index >= this.panels.length || index > this.current + 1)
      return;
    this.current = index;
    this.render(true);
  }

  /** @param {boolean} scroll */
  render(scroll) {
    this.panels.forEach((panel, index) => {
      const active = index === this.current;
      panel.hidden = !active;
      panel.classList.toggle("is-active", active);
    });
    this.progress.forEach((button, index) => {
      button.classList.toggle("is-active", index === this.current);
      button.classList.toggle("is-complete", index < this.current);
      button.disabled = index > this.current;
    });
    this.back.hidden = this.current === 0;
    this.next.hidden = this.current === this.panels.length - 1;
    this.submit.hidden = this.current !== this.panels.length - 1;
    this.validation.hidden = true;
    if (scroll)
      this.section.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  updateDogName() {
    const input = this.form.querySelector("[data-dog-name-input]");
    const value = input instanceof HTMLInputElement ? input.value.trim() : "";

    this.form.querySelectorAll("[data-dog-name]").forEach((element) => {
      element.textContent = value || "A kutyád";
    });
  }

  updateFeedingPanel() {
    const checked = this.form.querySelector("[data-feeding-mode]:checked");
    const mode =
      checked instanceof HTMLElement ? checked.dataset.feedingMode : undefined;

    this.form.querySelectorAll("[data-feeding-panel]").forEach((panel) => {
      if (!(panel instanceof HTMLElement)) return;

      const active = panel.dataset.feedingPanel === mode;
      panel.hidden = !active;
      panel.querySelectorAll("input, select, textarea").forEach((field) => {
        if (
          !(
            field instanceof HTMLInputElement ||
            field instanceof HTMLSelectElement ||
            field instanceof HTMLTextAreaElement
          )
        ) {
          return;
        }

        field.disabled = !active;
      });
    });
    const empty = this.form.querySelector("[data-feeding-empty]");
    if (empty instanceof HTMLElement) empty.hidden = Boolean(mode);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-advice-form-section]").forEach((section) => {
    if (section instanceof HTMLElement) new MacsAdviceForm(section);
  });
});

/** @param {Event} event */
document.addEventListener("shopify:section:load", (event) => {
  if (!(event.target instanceof HTMLElement)) return;

  const section = event.target.matches("[data-advice-form-section]")
    ? event.target
    : event.target.querySelector("[data-advice-form-section]");

  if (section instanceof HTMLElement) new MacsAdviceForm(section);
});
