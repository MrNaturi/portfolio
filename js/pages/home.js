import { Nav } from "../components/Nav.js";
import { Hero } from "../components/Hero.js";
import { AboutTeaser } from "../components/AboutTeaser.js";
import { SelectedWork, initSelectedWork } from "../components/SelectedWork.js";
import { WritingPreview } from "../components/WritingPreview.js";
import { Contact, initContact } from "../components/Contact.js";
import { Footer } from "../components/Footer.js";
import { initStarfield } from "../components/Starfield.js";
import { initObservationLog } from "../components/ObservationLog.js";

// Render: each section's markup into its mount point
const sections = {
  "nav-root": () => Nav(window.location.pathname),
  "hero-root": Hero,
  "about-root": AboutTeaser,
  "work-root": SelectedWork,
  "writing-root": WritingPreview,
  "contact-root": Contact,
  "footer-root": Footer,
};

for (const [id, render] of Object.entries(sections)) {
  document.getElementById(id).innerHTML = render();
}

// Enhance: attach behaviour once the markup exists
initStarfield();
initObservationLog();
initSelectedWork();
initContact();
