import { render, renderShell } from "./shell.js";
import { Hero } from "../components/Hero.js";
import { AboutTeaser } from "../components/AboutTeaser.js";
import { SelectedWork, initSelectedWork } from "../components/SelectedWork.js";
import { WritingPreview } from "../components/WritingPreview.js";
import { Contact, initContact } from "../components/Contact.js";
import { initStarfield } from "../components/Starfield.js";

renderShell();

render({
  "hero-root": Hero,
  "about-root": AboutTeaser,
  "work-root": SelectedWork,
  "writing-root": WritingPreview,
  "contact-root": Contact,
});

initStarfield();
initSelectedWork();
initContact();
