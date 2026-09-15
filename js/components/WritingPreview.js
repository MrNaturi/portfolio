import { posts } from "../data/posts.js";

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

// Parse as a local date so "2025-01-07" never shows as 6 Jan west of UTC
function formatDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return dateFormat.format(new Date(y, m - 1, d));
}

function PostRow(post) {
  return `
    <li class="writing-preview__item">
      <time class="writing-preview__date" datetime="${post.date}">${formatDate(post.date)}</time>
      <div class="writing-preview__text">
        <h3 class="writing-preview__title">
          <a href="${post.href}" rel="noopener">${post.title}</a>
        </h3>
        <p class="writing-preview__summary">${post.summary}</p>
      </div>
    </li>
  `;
}

export function WritingPreview({ limit = 3 } = {}) {
  const recent = [...posts].sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);

  return `
    <section class="section writing-preview" aria-labelledby="writing-preview-title">
      <header class="section__head">
        <span class="section__index" aria-hidden="true">03</span>
        <h2 class="section__title" id="writing-preview-title">Writing</h2>
      </header>

      <p class="writing-preview__intro">Essays on people, memory, and getting from an idea to the finish line.</p>

      <ol class="writing-preview__list">
        ${recent.map(PostRow).join("")}
      </ol>

      <a class="writing-preview__all" href="/writing">All writing</a>
    </section>
  `;
}
