import { track } from "../data/track.js";

// ---- Persistent player ----
// A brass instrument dial fixed bottom-right: the ring fills with progress,
// the centre toggles play/pause, and a teal signal dot pulses while audio
// is playing. A label with the track name slides out on hover/focus.

const RING_R = 25;
const STORAGE_KEY = "player-state";
const SAVE_EVERY = 5; // seconds of playback between saves
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

// ---- Session continuity ----
// Every page is a full load, so the <audio> element starts over each time.
// Position and play state are kept in sessionStorage and restored on the
// next page. Storage can be unavailable (private modes, blocked cookies),
// so every access is guarded and the player simply starts fresh.
function readState() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY));
    return saved && typeof saved.time === "number" ? saved : null;
  } catch {
    return null;
  }
}

function writeState(audio) {
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ time: audio.currentTime, playing: !audio.paused, volume: audio.volume })
    );
  } catch {
    /* storage unavailable: nothing to persist */
  }
}

export function initPlayer() {
  const root = document.querySelector(".player");
  if (!root) return;
  const audio = root.querySelector(".player__audio");
  const dial = root.querySelector(".player__dial");
  const progress = root.querySelector(".player__ring-progress");
  const status = root.querySelector(".player__status");

  // Only show the player once the file is known to exist and be playable,
  // then pick up where the previous page left off
  audio.addEventListener(
    "loadedmetadata",
    async () => {
      root.hidden = false;
      const saved = readState();
      if (!saved) return;

      audio.volume = saved.volume ?? 1;
      if (saved.time < audio.duration) audio.currentTime = saved.time;

      if (saved.playing) {
        try {
          // Allowed when the browser counts the earlier click on this site
          // as permission to play; otherwise it rejects.
          await audio.play();
        } catch {
          root.classList.add("is-resumable");
          render();
        }
      }
    },
    { once: true }
  );
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
  let lastSaved = 0;
  audio.addEventListener("timeupdate", () => {
    if (!audio.duration) return;
    if (Math.abs(audio.currentTime - lastSaved) >= SAVE_EVERY) {
      lastSaved = audio.currentTime;
      writeState(audio);
    }
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

  audio.addEventListener("play", () => {
    root.classList.remove("is-resumable");
    writeState(audio);
    render();
  });
  audio.addEventListener("pause", () => {
    writeState(audio);
    render();
  });

  // pagehide fires on navigation (including into the back/forward cache);
  // visibilitychange covers mobile browsers that skip pagehide on tab switch.
  // Saving on pause above already records a deliberate stop, so these only
  // capture the position at the moment the page goes away.
  window.addEventListener("pagehide", () => writeState(audio));
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") writeState(audio);
  });

  render();

  return { audio, root, render };
}
