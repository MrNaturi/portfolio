import { links } from "../data/nav-links.js";
import { socials } from "../data/social-links.js";
import { ObservationLog } from "./ObservationLog.js";

export function Footer() {
  return `
    <footer class="site-footer">
      <div class="footer-mark">
        <a class="wordmark" href="/">Ofuje</a>
        ${ObservationLog()}
      </div>
      <div class="footer-nav-group">
        <ul class="footer-links">
          ${links.map((link) => `<li><a href="${link.href}">${link.label}</a></li>`).join("")}
        </ul>
        <ul class="footer-socials">
          ${socials.map((social) => `<li><a href="${social.href}">${social.label}</a></li>`).join("")}
        </ul>
      </div>
    </footer>
  `;
}
