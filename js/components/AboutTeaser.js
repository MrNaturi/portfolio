export function AboutTeaser() {
  return `
    <section class="section about-teaser" aria-labelledby="about-teaser-title">
      <header class="section__head">
        <span class="section__index" aria-hidden="true">01</span>
        <h2 class="section__title" id="about-teaser-title">About</h2>
      </header>

      <div class="about-teaser__body">
        <p class="about-teaser__lede">
          I'm an avid learner who enjoys picking up new ideas, going down
          <em>rabbit holes</em>, and sharing what I find.
        </p>
        <div class="about-teaser__aside">
          <p>
            I like building across the stack, but I'm particularly drawn to AI and
            machine learning, especially when they can be turned into useful,
            thoughtfully designed tools.
          </p>
          <a class="about-teaser__link" href="/about">More about me</a>
        </div>
      </div>
    </section>
  `;
}
