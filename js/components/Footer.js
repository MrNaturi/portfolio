import { links } from "../data/nav-links.js";
import { socials } from "../data/social-links.js";

export function Footer() {
return `
    <footer class="site-footer">
        <span class="wordmark">Ofuje</span>
        <ul class="footer-links">
            ${links.map(link => `<li><a href="${link.href}">${link.label}</a></li>`).join('')}
        </ul>
        <ul class="footer-socials">
            ${socials.map(social => `<li><a href="${social.href}">${social.label}</a></li>`).join('')}
        </ul>
    </footer>
  `;
}