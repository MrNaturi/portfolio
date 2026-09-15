import { person } from "../../data/about.js";

// "Hear it said": plays the pronunciation recording. While sound is
// playing, teal rings pulse out from the button in the signal rhythm,
// the site's motion for transmission.

export function initNameSay() {
  const root = document.querySelector("[data-say-root]");
  if (!root) return;

  const button = document.createElement("button");
  button.type = "button";
  button.className = "say";
  button.setAttribute("aria-label", `Hear how to say ${person.callName}`);
  button.innerHTML = `
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M2 6h3l4-3v10L5 10H2z" />
      <path class="say__wave" d="M11 5.5a3.5 3.5 0 0 1 0 5" />
    </svg>
  `;
  root.prepend(button);

  const audio = new Audio(person.audio);
  audio.preload = "none"; // fetch only when someone asks to hear it

  const stop = () => button.classList.remove("is-playing");
  audio.addEventListener("ended", stop);
  audio.addEventListener("pause", stop);
  audio.addEventListener("error", () => {
    stop();
    button.hidden = true; // no recording, no button
  });

  button.addEventListener("click", async () => {
    audio.currentTime = 0;
    try {
      await audio.play();
      button.classList.add("is-playing");
    } catch {
      stop();
    }
  });
}
