// "Play Sweden" in the Minecraft memory drives the site's own music
// player, so the song in the story and the song in the corner are the
// same one. The button mirrors the player's state.

export function initPlaySweden() {
  const memory = document.querySelector("[data-memory]");
  const player = document.querySelector(".player");
  const audio = player?.querySelector(".player__audio");
  const dial = player?.querySelector(".player__dial");
  if (!memory || !audio || !dial) return;

  const button = document.createElement("button");
  button.type = "button";
  button.className = "about-play-sweden";
  memory.append(button);

  const render = () => {
    const playing = !audio.paused;
    button.innerHTML = playing
      ? `<span aria-hidden="true">❚❚</span> pause Sweden`
      : `<span aria-hidden="true">▶</span> play Sweden`;
    button.classList.toggle("is-playing", playing);
  };

  // The player hides itself if the track can't load; follow suit
  const sync = () => {
    button.hidden = player.hidden || !player.isConnected;
  };

  button.addEventListener("click", () => dial.click());
  audio.addEventListener("play", render);
  audio.addEventListener("pause", render);
  audio.addEventListener("loadedmetadata", sync);
  audio.addEventListener("error", () => (button.hidden = true));

  render();
  sync();
}
