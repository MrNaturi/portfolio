import { person, photos, story, facts, cities, currently, beyond, onward } from "../../data/about.js";

const head = (title, id) => `
  <header class="section__head">
    <span class="section__index" aria-hidden="true"></span>
    <h2 class="section__title" id="${id}">${title}</h2>
  </header>
`;

// Wrap {phrases} in a highlight span
const highlight = (text) => text.replace(/\{([^}]+)\}/g, '<em class="about-lift">$1</em>');

// ---- Hero ----

export function AboutHero() {
  return `
    <header class="section about-hero">
      <div class="about-hero__text">
        <p class="about-hero__eyebrow">About · Ibadan → Kigali</p>
        <h1 class="about-hero__title">Hi, I'm ${person.name}.</h1>
        <p class="about-hero__say" data-say-root>
          <span class="about-hero__phonetic">
            <strong>${person.callName}</strong>
            <span aria-hidden="true">·</span> ${person.pronunciation}
            <span aria-hidden="true">·</span> "${person.meaning}"
          </span>
        </p>
      </div>

      <figure class="lens" data-lens>
        <span class="lens__ticks" aria-hidden="true"></span>
        <div class="lens__card">
          <div class="lens__face lens__face--front">
            <img src="${photos.front.src}" alt="${photos.front.alt}" width="880" height="880" fetchpriority="high" />
          </div>
          <div class="lens__face lens__face--back" aria-hidden="true">
            <img src="${photos.back.src}" alt="${photos.back.alt}" width="880" height="880" loading="lazy" />
          </div>
        </div>
      </figure>
    </header>
  `;
}

// ---- Story ----

const storyToken = {
  ibadan: `<a class="about-chip" href="#coordinates" data-city-link="ibadan">Ibadan<small aria-hidden="true">7.38°N</small></a>`,
  pipeline: `<span class="about-pipeline-phrase">automations and pipelines</span>`,
};

function StoryBlock(block) {
  if (typeof block === "object") {
    return `
      <div class="about-log" data-log hidden></div>
      <blockquote class="about-quote" data-quote>
        <p>${block.quote}</p>
      </blockquote>
    `;
  }
  return `<p>${block.replace(/\{(\w+)\}/g, (_, key) => storyToken[key] ?? key)}</p>`;
}

export function AboutStory() {
  return `
    <section class="section about-story" aria-labelledby="story-title">
      ${head("How I got here", "story-title")}
      <div class="about-story__grid">
        <div class="about-story__prose">
          ${story.map(StoryBlock).join("")}
        </div>
        <aside class="about-facts" aria-label="Quick facts">
          <dl>
            ${facts.map((f) => `<div><dt>${f.term}</dt><dd>${f.value}</dd></div>`).join("")}
          </dl>
        </aside>
      </div>
    </section>
  `;
}

// ---- Coordinates ----

function CityPanel(city) {
  return `
    <div class="about-city" data-city="${city.id}">
      <h3 class="about-city__name">${city.name}</h3>
      <p class="about-city__meaning">${city.meaning}</p>
      <dl class="about-city__coords">
        <dt>lat</dt><dd>${Math.abs(city.lat).toFixed(4)}° ${city.lat >= 0 ? "N" : "S"}</dd>
        <dt>lon</dt><dd>${Math.abs(city.lon).toFixed(4)}° ${city.lon >= 0 ? "E" : "W"}</dd>
        <dt>local time</dt><dd data-city-time="${city.timeZone}" data-zone="${city.zoneAbbr}">—</dd>
      </dl>
    </div>
  `;
}

export function AboutCoordinates() {
  return `
    <section class="section about-coords" id="coordinates" aria-labelledby="coords-title">
      ${head("Two coordinates", "coords-title")}
      <div class="about-coords__grid">
        <div class="about-coords__panel" data-coords-panel>
          ${cities.map(CityPanel).join("")}
        </div>
        <div class="about-coords__chart" data-coords-chart></div>
      </div>
    </section>
  `;
}

// ---- Currently ----

export function AboutCurrently() {
  const [y, m] = currently.updated.split("-").map(Number);
  const month = new Date(y, m - 1).toLocaleString("en-GB", { month: "short" }).slice(0, 3);
  return `
    <section class="section about-now" aria-labelledby="now-title">
      ${head("Currently", "now-title")}
      <dl class="about-now__log">
        ${currently.entries.map((e) => `<div><dt>${e.label}</dt><dd>${highlight(e.text)}</dd></div>`).join("")}
      </dl>
      <p class="about-now__updated">log updated <time datetime="${currently.updated}">${month} ${y}</time></p>
    </section>
  `;
}

// ---- Beyond code ----

export function AboutBeyond() {
  return `
    <section class="section about-beyond" aria-labelledby="beyond-title">
      ${head("Beyond code", "beyond-title")}
      <div class="about-beyond__grid">
        <article class="about-card about-card--games">
          <div>
            <h3>Games</h3>
            <p>${beyond.games.line}</p>
            <p class="about-card__label">currently playing</p>
            <ul class="about-playing">${beyond.games.playing.map((g) => `<li>${g}</li>`).join("")}</ul>
          </div>
          <div class="about-memory" data-memory>
            <p class="about-card__label">where building started</p>
            <p>${beyond.games.memory}</p>
          </div>
        </article>

        <article class="about-card" data-guitar>
          <h3>Guitar</h3>
          <p>${beyond.guitar}</p>
        </article>

        <article class="about-card">
          <h3>Writing</h3>
          <p>${beyond.writing}</p>
          <a class="about-card__link" href="/writing">Read my writing</a>
        </article>

        <article class="about-card" data-sketch>
          <h3>Drawing</h3>
          <p>${beyond.drawing}</p>
        </article>
      </div>
    </section>
  `;
}

// ---- Onward ----

export function AboutOnward() {
  return `
    <nav class="section about-onward" aria-label="More">
      ${onward
        .map((l) => `<a href="${l.href}"${/^https?:/.test(l.href) ? ' rel="noopener"' : ""}>${l.label}</a>`)
        .join("")}
    </nav>
  `;
}
