import { track } from "../data/track.js";

// ---- Persistent player ----
// A brass instrument dial fixed bottom-right: the ring fills with progress,
// the centre toggles play/pause, and a teal signal dot pulses while audio
// is playing. A label with the track name slides out on hover/focus.

const RING_R = 25;
const RING_C = 2 * Math.PI * RING_R;

export function Player() {
  return `
    <aside class="player" aria-label="Music player" hidden>
      <audio class="player__audio" preload="metadata" loop src="${track.src}"></audio>

      <div class="player__label" aria-hidden="true">
        <span class="player__status">Paused</span>
        <span class="player__track">${track.title} · ${track.artist}</span>
      </div>

      <button class="player__dial" type="button" aria-pressed="false"
              aria-label="Play ${track.title} by ${track.artist}">
        <svg class="player__ring" viewBox="0 0 56 56" aria-hidden="true">
          <circle class="player__ring-track" cx="28" cy="28" r="${RING_R}" />
          <circle class="player__ring-progress" cx="28" cy="28" r="${RING_R}"
                  stroke-dasharray="${RING_C}" stroke-dashoffset="${RING_C}" />
        </svg>
        <svg class="player__icon" viewBox="0 0 16 16" aria-hidden="true">
          <path class="player__icon-play" d="M5 3.5v9l7.5-4.5z" />
          <path class="player__icon-pause" d="M4.5 3.5h2.5v9H4.5zM9 3.5h2.5v9H9z" />
        </svg>
        <span class="player__signal" aria-hidden="true"></span>
      </button>
    </aside>
  `;
}

export function initPlayer() {
  const root = document.querySelector(".player");
  if (!root) return;
  const audio = root.querySelector(".player__audio");
  const dial = root.querySelector(".player__dial");
  const progress = root.querySelector(".player__ring-progress");
  const status = root.querySelector(".player__status");

  // Only show the player once the file is known to exist and be playable
  audio.addEventListener("loadedmetadata", () => (root.hidden = false), { once: true });
  audio.addEventListener("error", () => root.remove(), { once: true });

  function render() {
    const playing = !audio.paused;
    root.classList.toggle("is-playing", playing);
    dial.setAttribute("aria-pressed", String(playing));
    dial.setAttribute("aria-label", `${playing ? "Pause" : "Play"} ${track.title} by ${track.artist}`);
    status.textContent = playing ? "Now playing" : root.classList.contains("is-resumable") ? "Tap to resume" : "Paused";
  }

  // Progress ring. timeupdate fires ~4×/s, which is smooth enough for a
  // 56px ring and costs nothing compared with a rAF loop.
  audio.addEventListener("timeupdate", () => {
    if (!audio.duration) return;
    progress.style.strokeDashoffset = String(RING_C * (1 - audio.currentTime / audio.duration));
  });

  dial.addEventListener("click", async () => {
    root.classList.remove("is-resumable");
    if (audio.paused) {
      try {
        await audio.play();
      } catch {
        /* blocked or failed; state stays paused */
      }
    } else {
      audio.pause();
    }
  });

  audio.addEventListener("play", render);
  audio.addEventListener("pause", render);
  render();

  return { audio, root, render };
}
