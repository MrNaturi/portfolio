import { links } from "../data/nav-links.js";

// Local dev serves /about.html while Vercel serves /about, and both may
// carry a trailing slash — reduce every path to one comparable form.
function normalizePath(path) {
  const stripped = path.replace(/\.html$/, "").replace(/\/index$/, "/").replace(/(.)\/$/, "$1");
  return stripped || "/";
}

export function Nav(currentPath) {
  const current = normalizePath(currentPath);

  return `
    <nav class="site-nav" aria-label="Primary">
      <a class="wordmark" href="/">Ofuje</a>
      <ul class="nav-links">
        ${links
          .map((link) => {
            const isCurrent = normalizePath(link.href) === current;
            return `<li><a href="${link.href}"${isCurrent ? ' aria-current="page"' : ""}>${link.label}</a></li>`;
          })
          .join("")}
      </ul>
    </nav>
  `;
}
