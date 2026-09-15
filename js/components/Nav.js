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
            // Exact page → aria-current="page"; a sub-page of the section
            // (/projects/triagerl) → aria-current="true". Both are styled alike.
            const href = normalizePath(link.href);
            const attr =
              current === href ? ' aria-current="page"' : current.startsWith(`${href}/`) ? ' aria-current="true"' : "";
            return `<li><a href="${link.href}"${attr}>${link.label}</a></li>`;
          })
          .join("")}
      </ul>
    </nav>
  `;
}
