import { email, socials } from "../data/social-links.js";

export function Contact() {
  return `
    <section class="section contact" id="contact" aria-labelledby="contact-title">
      <header class="section__head">
        <span class="section__index" aria-hidden="true">04</span>
        <p class="section__title section__title--quiet">Contact</p>
      </header>

      <h2 class="contact__title" id="contact-title">Have something worth building?</h2>
      <p class="contact__copy">
        If you're building something interesting, need an engineer, or just want
        to talk about an idea, I'd love to hear from you.
      </p>

      <div class="contact__email-row">
        <a class="contact__email" href="mailto:${email}">${email}</a>
        <button class="contact__copy-button" type="button" data-copy="${email}">
          <span class="contact__copy-label">Copy</span>
        </button>
        <span class="contact__status visually-hidden" role="status"></span>
      </div>

      <ul class="contact__links">
        ${socials.map((s) => `<li><a href="${s.href}" rel="noopener">${s.label}</a></li>`).join("")}
      </ul>
    </section>
  `;
}

// Copy the address to the clipboard. The button label flips to "Copied"
// and a hidden live region announces it; both reset after a moment.
export function initContact() {
  const button = document.querySelector(".contact__copy-button");
  if (!button) return;
  const label = button.querySelector(".contact__copy-label");
  const status = document.querySelector(".contact__status");

  // No Clipboard API (e.g. insecure origin): the mailto link still works
  if (!navigator.clipboard) {
    button.hidden = true;
    return;
  }

  let timer = 0;
  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(button.dataset.copy);
      label.textContent = "Copied";
      status.textContent = "Email address copied";
      button.classList.add("is-copied");
    } catch {
      label.textContent = "Copy failed";
    }
    clearTimeout(timer);
    timer = setTimeout(() => {
      label.textContent = "Copy";
      status.textContent = "";
      button.classList.remove("is-copied");
    }, 2000);
  });
}
