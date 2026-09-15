// "Turn the camera around": flips the lens from the mirror photo (camera
// covering the face) to the portrait on its back. Front and back faces are
// swapped for assistive tech as well as visually.

export function initLensFlip() {
  const lens = document.querySelector("[data-lens]");
  if (!lens) return;
  const front = lens.querySelector(".lens__face--front");
  const back = lens.querySelector(".lens__face--back");

  const button = document.createElement("button");
  button.type = "button";
  button.className = "lens__flip";
  button.setAttribute("aria-pressed", "false");
  button.innerHTML = `<span class="lens__flip-icon" aria-hidden="true">↻</span><span class="lens__flip-label">Turn the camera around</span>`;
  lens.append(button);
  const label = button.querySelector(".lens__flip-label");

  // Warm the portrait up before it's needed, so the flip never shows a gap
  const preload = () => back.querySelector("img").setAttribute("loading", "eager");
  button.addEventListener("pointerenter", preload, { once: true });
  button.addEventListener("focus", preload, { once: true });

  button.addEventListener("click", () => {
    const flipped = lens.classList.toggle("is-flipped");
    button.setAttribute("aria-pressed", String(flipped));
    label.textContent = flipped ? "Turn it back" : "Turn the camera around";
    front.setAttribute("aria-hidden", String(flipped));
    back.setAttribute("aria-hidden", String(!flipped));
  });
}
