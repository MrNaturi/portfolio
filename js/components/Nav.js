import { links } from "../data/nav-links.js";

export function Nav(currentPath) {
  function normalizePath(path){
    const strippedPath = path.replace(/\.(html)$/, "")
    return strippedPath
  }
  return `
    <nav class="site-nav">
      <span class="wordmark">Ofuje</span>
      <ul class="nav-links">
        ${links.map(link => `<li class="${normalizePath(link.href) === normalizePath(currentPath) ? 'active' : '' }"><a href="${link.href}">${link.label}</a></li>`).join('')}
      </ul>
    </nav>
  `;
}