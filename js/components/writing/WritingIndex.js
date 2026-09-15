import { essays, technical, allPosts, readHref } from "../../data/posts.js";

// Fixed three-letter months: Intl's en-GB output writes "Sept", which
// breaks the even rhythm of the mono date column.
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Parse as a local date so "2025-01-07" never shows as 6 Jan west of UTC
const parts = (iso) => iso.split("-").map(Number);
export const formatDate = (iso) => {
  const [y, m, d] = parts(iso);
  return `${d} ${MONTHS[m - 1]} ${y}`;
};
const formatDay = (iso) => {
  const [, m, d] = parts(iso);
  return `${d} ${MONTHS[m - 1]}`;
};

function SourceLink(post) {
  return `<a class="post__source" href="${post.href}" rel="noopener">on ${post.source}</a>`;
}

function Date_(post, className = "post__date") {
  return `<time class="${className}" datetime="${post.date}">${formatDate(post.date)}</time>`;
}

// ---- Essays: the logbook ----

function EssayRow(post) {
  return `
    <li class="post post--essay">
      ${Date_(post)}
      <div class="post__body">
        <h3 class="post__title"><a href="${readHref(post)}">${post.title}</a></h3>
        <p class="post__summary">${post.summary}</p>
        <p class="post__meta">${SourceLink(post)}</p>
      </div>
    </li>
  `;
}

// ---- Technical: field notes ----

function TechRow(post) {
  const topics = post.topics?.length ? `<span class="post__topics">${post.topics.join(" · ")}</span>` : "";
  const related = post.related ? `<a class="post__related" href="${post.related.href}">Project: ${post.related.label}</a>` : "";
  return `
    <li class="post post--technical">
      ${Date_(post)}
      <div class="post__body">
        <h3 class="post__title"><a href="${readHref(post)}">${post.title}</a></h3>
        <p class="post__summary">${post.summary}</p>
        <p class="post__meta">${topics}${related}${SourceLink(post)}</p>
      </div>
    </li>
  `;
}

function SeriesRow(series) {
  const dates = series.posts.map((p) => p.date).sort();
  const [first, last] = [dates[0], dates.at(-1)];
  const range =
    first.slice(0, 4) === last.slice(0, 4)
      ? `${formatDay(first)} – ${formatDate(last)}`
      : `${formatDate(first)} – ${formatDate(last)}`;
  const panelId = `series-${series.id}`;
  // Oldest first inside the series, so parts read in order
  const parts = [...series.posts].sort((a, b) => a.date.localeCompare(b.date));

  return `
    <li class="post post--technical post--series">
      <time class="post__date" datetime="${series.date}">${formatDate(series.date)}</time>
      <div class="post__body">
        <h3 class="post__title">
          <button class="series__toggle" type="button" aria-expanded="false" aria-controls="${panelId}">
            <span>${series.title}</span>
            <span class="series__count">${series.posts.length} parts</span>
          </button>
        </h3>
        <p class="post__summary">${series.summary}</p>
        <p class="post__meta"><span class="post__topics">${range}</span></p>

        <div class="series__panel" id="${panelId}" hidden>
          <ol class="series__parts">
            ${parts
              .map(
                (post, i) => `
              <li class="series__part">
                <span class="series__n">Part ${i + 1}</span>
                <div>
                  <a class="series__title" href="${readHref(post)}">${post.title}</a>
                  <p class="post__summary">${post.summary}</p>
                  <p class="post__meta">${Date_(post, "post__topics")}${SourceLink(post)}</p>
                </div>
              </li>`
              )
              .join("")}
          </ol>
        </div>
      </div>
    </li>
  `;
}

// ---- Page ----

export function WritingHeader() {
  return `
    <header class="section writing-header">
      <p class="writing-header__eyebrow">${allPosts.length} posts · Substack and Medium</p>
      <h1 class="writing-header__title">Writing</h1>
      <p class="writing-header__intro">
        Personal essays about people, memory and beginnings, and technical notes
        from building things.
      </p>
      <div class="writing-header__filter" data-filter-root></div>
    </header>
  `;
}

export function WritingLists() {
  return `
    <section class="section writing-group" id="essays" data-type="essay" aria-labelledby="essays-title">
      <header class="section__head">
        <span class="section__index" aria-hidden="true">01</span>
        <h2 class="section__title" id="essays-title">Essays</h2>
      </header>
      <p class="writing-group__note">Personal writing, on Substack.</p>
      <ol class="post-list">${essays.map(EssayRow).join("")}</ol>
    </section>

    <section class="section writing-group" id="technical" data-type="technical" aria-labelledby="technical-title">
      <header class="section__head">
        <span class="section__index" aria-hidden="true">02</span>
        <h2 class="section__title" id="technical-title">Technical</h2>
      </header>
      <p class="writing-group__note">Build logs and case studies, on Medium.</p>
      <ol class="post-list">
        ${technical.map((entry) => (entry.series ? SeriesRow(entry) : TechRow(entry))).join("")}
      </ol>
    </section>
  `;
}

// Expand / collapse a series. The panel animates open with a grid-rows
// transition; hidden is removed first so the contents are reachable, and
// restored after closing so collapsed links drop out of the tab order.
export function initSeries() {
  for (const toggle of document.querySelectorAll(".series__toggle")) {
    const panel = document.getElementById(toggle.getAttribute("aria-controls"));

    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));

      if (!open) {
        panel.hidden = false;
        requestAnimationFrame(() => panel.classList.add("is-open"));
      } else {
        panel.classList.remove("is-open");
        const done = () => {
          if (toggle.getAttribute("aria-expanded") === "false") panel.hidden = true;
        };
        const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduced) done();
        else panel.addEventListener("transitionend", done, { once: true });
      }
    });
  }
}
