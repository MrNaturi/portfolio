import { entries, readHref } from "../data/posts.js";
import { formatDate } from "./writing/WritingIndex.js";

// A series links to the Writing page's technical view rather than one part
function hrefFor(entry) {
  return entry.series ? "/writing?type=technical" : readHref(entry);
}

function PostRow(entry) {
  const kind = entry.type === "essay" ? "Essay" : "Technical";
  const title = entry.series ? `${entry.title}, ${entry.posts.length} parts` : entry.title;

  return `
    <li class="writing-preview__item writing-preview__item--${entry.type}">
      <p class="writing-preview__meta">
        <time datetime="${entry.date}">${formatDate(entry.date)}</time>
        <span class="writing-preview__kind">${kind}</span>
      </p>
      <div class="writing-preview__text">
        <h3 class="writing-preview__title">
          <a href="${hrefFor(entry)}">${title}</a>
        </h3>
        <p class="writing-preview__summary">${entry.summary}</p>
      </div>
    </li>
  `;
}

export function WritingPreview({ limit = 3 } = {}) {
  // Newest entries across both kinds; a series counts once, so four
  // devlogs can't crowd out everything else
  const recent = entries.slice(0, limit);

  return `
    <section class="section writing-preview" aria-labelledby="writing-preview-title">
      <header class="section__head">
        <span class="section__index" aria-hidden="true">03</span>
        <h2 class="section__title" id="writing-preview-title">Writing</h2>
      </header>

      <p class="writing-preview__intro">Personal essays, and technical notes from building things.</p>

      <ol class="writing-preview__list">
        ${recent.map(PostRow).join("")}
      </ol>

      <a class="writing-preview__all" href="/writing">All writing</a>
    </section>
  `;
}
