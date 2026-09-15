// Reading progress drawn as a moon: new at the top of a post, full at the
// end. For Writing post pages — mount MoonPhase() once in the page and call
// initMoonPhase(articleElement) with the element whose reading it tracks.

const SIZE = 28;
const R = 11;
const C = SIZE / 2;

// Lit shape for an illuminated fraction 0–1, waxing from the right.
// Right half of the disc, closed by the terminator: an ellipse whose
// horizontal radius shrinks to 0 at half moon and grows back to R.
// Below half it bulges right (crescent), above half left (gibbous).
function litPath(fraction) {
  if (fraction <= 0.001) return "";
  if (fraction >= 0.999) {
    return `M ${C} ${C - R} A ${R} ${R} 0 1 1 ${C} ${C + R} A ${R} ${R} 0 1 1 ${C} ${C - R} Z`;
  }
  const rx = Math.abs(1 - 2 * fraction) * R;
  const sweep = fraction < 0.5 ? 0 : 1;
  return `M ${C} ${C - R} A ${R} ${R} 0 0 1 ${C} ${C + R} A ${rx} ${R} 0 0 ${sweep} ${C} ${C - R} Z`;
}

export function MoonPhase() {
  return `
    <div class="moon-phase" role="progressbar" aria-label="Reading progress"
         aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
      <svg width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}" aria-hidden="true">
        <circle class="moon-phase__disc" cx="${C}" cy="${C}" r="${R}" />
        <path class="moon-phase__lit" d="" />
      </svg>
    </div>
  `;
}

export function initMoonPhase(article) {
  const root = document.querySelector(".moon-phase");
  if (!root || !article) return;
  const lit = root.querySelector(".moon-phase__lit");
  let frame = 0;
  let lastPercent = -1;

  // Progress = how far the article's bottom edge has travelled past the
  // bottom of the viewport, from "top of article at top of viewport"
  // to "end of article in view".
  function update() {
    frame = 0;
    const rect = article.getBoundingClientRect();
    const scrollable = rect.height - window.innerHeight;
    const progress = scrollable <= 0 ? 1 : Math.min(1, Math.max(0, -rect.top / scrollable));
    const percent = Math.round(progress * 100);
    if (percent === lastPercent) return;
    lastPercent = percent;
    lit.setAttribute("d", litPath(progress));
    root.setAttribute("aria-valuenow", String(percent));
  }

  function requestUpdate() {
    if (!frame) frame = requestAnimationFrame(update);
  }

  window.addEventListener("scroll", requestUpdate, { passive: true });
  new ResizeObserver(requestUpdate).observe(article);
  update();
}
