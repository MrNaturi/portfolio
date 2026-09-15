import { render, renderShell } from "./shell.js";
import {
  AboutHero,
  AboutStory,
  AboutCoordinates,
  AboutCurrently,
  AboutBeyond,
  AboutOnward,
} from "../components/about/AboutPage.js";
import { initNameSay } from "../components/about/NameSay.js";
import { initLensFlip } from "../components/about/LensFlip.js";
import { initCuriosityPipeline } from "../components/about/CuriosityPipeline.js";
import { initCoordinates } from "../components/about/Coordinates.js";
import { initGuitar } from "../components/about/Guitar.js";

renderShell();

render({
  "about-hero-root": AboutHero,
  "about-story-root": AboutStory,
  "about-coords-root": AboutCoordinates,
  "about-now-root": AboutCurrently,
  "about-beyond-root": AboutBeyond,
  "about-onward-root": AboutOnward,
});

// Number the sections in the order they appear
document.querySelectorAll("main .section__index").forEach((el, i) => {
  el.textContent = String(i + 1).padStart(2, "0");
});

initNameSay();
initLensFlip();
initCuriosityPipeline();
initCoordinates();
initGuitar();
