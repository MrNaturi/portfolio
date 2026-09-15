// Beacon (TriageRL) and signal (Afroglot) marks. The modifier class picks
// the rhythm; the mark is decorative, so hidden from assistive tech.
export function MotionMark(accent) {
  const kind = accent === "ember" ? "beacon" : "signal";
  return `<span class="motion-mark motion-mark--${kind}" aria-hidden="true"></span>`;
}

// The marks loop forever, so only let them run while on screen. The class
// is the only thing JS touches; timing and reduced-motion handling stay in
// plate.css.
export function initMotionMarks() {
  const marks = document.querySelectorAll(".motion-mark");
  if (!marks.length || !("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      entry.target.classList.toggle("is-live", entry.isIntersecting);
    }
  });
  marks.forEach((mark) => observer.observe(mark));
}
