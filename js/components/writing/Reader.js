import { findPost, technical, readHref } from "../../data/posts.js";
import { formatDate } from "./WritingIndex.js";
import { sanitizePostHtml } from "./sanitize.js";
import { MoonPhase, initMoonPhase } from "../MoonPhase.js";

const FEED_URL = "/api/feed";
const FEED_TIMEOUT = 12000;

// Where a post sits in a series, if it's in one
function seriesOf(post) {
  const series = technical.find((entry) => entry.series && entry.posts.some((p) => p.id === post.id));
  if (!series) return null;
  const parts = [...series.posts].sort((a, b) => a.date.localeCompare(b.date));
  const index = parts.findIndex((p) => p.id === post.id);
  return { series, parts, index };
}

function SeriesNav(info) {
  if (!info) return "";
  const { series, parts, index } = info;
  const prev = parts[index - 1];
  const next = parts[index + 1];
  return `
    <nav class="reader__series" aria-label="${series.title}">
      <p class="reader__series-label">${series.title} · part ${index + 1} of ${parts.length}</p>
      <div class="reader__series-links">
        ${prev ? `<a href="${readHref(prev)}"><span>Previous</span>${prev.title}</a>` : "<span></span>"}
        ${next ? `<a class="reader__series-next" href="${readHref(next)}"><span>Next</span>${next.title}</a>` : ""}
      </div>
    </nav>
  `;
}

export function Reader(id) {
  const post = id ? findPost(id) : null;

  if (!post) {
    return `
      <article class="section reader reader--missing">
        <a class="reader__back" href="/writing">Writing</a>
        <h1 class="reader__title">That post isn't here</h1>
        <p class="reader__summary">The link may be out of date.</p>
        <a class="reader__cta" href="/writing">See all writing</a>
      </article>
    `;
  }

  document.title = `${post.title} — Ofuje`;
  const kind = post.type === "essay" ? "Essay" : "Technical";
  const series = seriesOf(post);

  return `
    <article class="section reader reader--${post.type}" aria-labelledby="reader-title">
      <a class="reader__back" href="/writing${post.type === "essay" ? "?type=essays" : "?type=technical"}">Writing · ${kind}</a>

      <header class="reader__head">
        <p class="reader__meta">
          <time datetime="${post.date}">${formatDate(post.date)}</time>
          <span aria-hidden="true">·</span>
          <span>${post.source}</span>
        </p>
        <h1 class="reader__title" id="reader-title">${post.title}</h1>
        <p class="reader__summary">${post.summary}</p>
      </header>

      <div class="reader__body" aria-busy="true">
        <p class="reader__status" role="status">Fetching the post from ${post.source}…</p>
      </div>

      <footer class="reader__foot">
        <p>Originally published on ${post.source}.</p>
        <a class="reader__cta" href="${post.href}" rel="noopener">Read it on ${post.source}</a>
      </footer>

      ${SeriesNav(series)}
    </article>
    ${MoonPhase()}
  `;
}

async function fetchFeed() {
  const response = await fetch(FEED_URL, { signal: AbortSignal.timeout(FEED_TIMEOUT) });
  if (!response.ok && response.status !== 502) throw new Error(`Feed ${response.status}`);
  return response.json();
}

export async function initReader(id) {
  const post = id ? findPost(id) : null;
  const body = document.querySelector(".reader__body");
  if (!post || !body) return;

  const moon = document.querySelector(".moon-phase");
  moon.hidden = true;

  const fallback = (message) => {
    body.setAttribute("aria-busy", "false");
    body.classList.add("is-unavailable");
    body.innerHTML = `
      <p class="reader__status" role="status">${message}</p>
      <a class="reader__cta reader__cta--primary" href="${post.href}" rel="noopener">Read it on ${post.source}</a>
    `;
    document.querySelector(".reader__foot").hidden = true;
  };

  try {
    const { posts } = await fetchFeed();
    const match = posts.find((item) => item.id === post.id);

    if (!match?.html) {
      fallback(`This post isn't available to read here right now, but it's on ${post.source}.`);
      return;
    }

    body.innerHTML = sanitizePostHtml(match.html);
    body.setAttribute("aria-busy", "false");
    body.classList.add("is-loaded");
    moon.hidden = false;
    initMoonPhase(document.querySelector(".reader"));
  } catch {
    fallback(`Couldn't load the post just now. It's still on ${post.source}.`);
  }
}
