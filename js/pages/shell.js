// The parts every page shares: nav, footer and the persistent player,
// plus the behaviour they carry. Page scripts call renderShell() and then
// render their own content into <main>.

import { Nav } from "../components/Nav.js";
import { Footer } from "../components/Footer.js";
import { Player, initPlayer } from "../components/Player.js";
import { initObservationLog } from "../components/ObservationLog.js";

export function render(sections) {
  for (const [id, component] of Object.entries(sections)) {
    const root = document.getElementById(id);
    if (root) root.innerHTML = component();
  }
}

export function renderShell() {
  render({
    "nav-root": () => Nav(window.location.pathname),
    "footer-root": Footer,
    "player-root": Player,
  });
  initObservationLog();
  initPlayer();
}
