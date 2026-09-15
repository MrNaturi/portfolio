// The long exposure is hidden behind a press-and-hold, which few people try
// unprompted. A quiet caption at the foot of the hero points it out, then
// retires once it has been used: it fades on the first exposure and stays
// gone on later visits. The hint is decorative (the exposure is pointer-only
// and the canvas is aria-hidden), so it is hidden from assistive tech too.

const KEY = "exposure-found";

const remembered = () => {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
};

export function initExposureHint() {
  const hint = document.querySelector("[data-exposure-hint]");
  const hero = hint?.closest(".hero");
  if (!hint || !hero) return;

  if (remembered()) {
    hint.remove();
    return;
  }

  hero.addEventListener(
    "exposurestart",
    () => {
      hint.classList.add("is-found");
      try {
        localStorage.setItem(KEY, "1");
      } catch {
        /* storage blocked: the hint simply returns next visit */
      }
    },
    { once: true }
  );
}
