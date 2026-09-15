import { StarfieldCanvas } from "./Starfield.js";

export function Hero() {
  return `
    <section class="hero">
      ${StarfieldCanvas()}
      <p class="hero__eyebrow">I like building things and seeing where they go.</p>

      <h1 class="hero__title">
        I build software for the things I'm <span class="hero__emphasis">curious about.</span>
      </h1>

      <p class="hero__intro">
        I'm Ofuje, a software engineer who likes turning half-formed ideas into things you can actually use. I work across software, machine learning, and design, and I'm usually somewhere between building, learning, and figuring out what's next. This is a collection of the things I've made, explored, and written along the way.
      </p>

      <div class="hero__hint" data-exposure-hint aria-hidden="true">
        <svg class="hero__hint-mark" viewBox="0 0 16 16"><circle cx="8" cy="8" r="4.5" /><path d="M8 0.5v3M8 12.5v3M0.5 8h3M12.5 8h3" /></svg>
        <span class="hero__hint-text hero__hint-text--fine">Press and hold anywhere on the sky for star trails</span>
        <span class="hero__hint-text hero__hint-text--touch">Hold the sky for star trails</span>
      </div>
    </section>
  `;
}