export function StarfieldCanvas() {
  return `<canvas class="starfield" aria-hidden="true"></canvas>`;
}

const STAR_COUNT = 320;
const BAND_SHARE = 0.55;     // share of stars pulled into the Milky Way band
const BAND_WIDTH = 0.085;    // band spread, as a fraction of the diagonal
const HOVER_RADIUS = 120;
const STAR_RGB = "236, 231, 220";

// Seeded PRNG so the sky is identical on every visit and every resize.
// Stars are stored in 0–1 space and scaled to the canvas at draw time.
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussian(rand) {
  const u = 1 - rand();
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function generateStars(rand) {
  const stars = [];
  for (let i = 0; i < STAR_COUNT; i++) {
    let x;
    let y;
    if (rand() < BAND_SHARE) {
      // Band runs corner to corner, lower-left to upper-right
      const t = rand();
      const offset = gaussian(rand) * BAND_WIDTH;
      x = t + offset * 0.7;
      y = 1 - t + offset * 0.7;
    } else {
      x = rand();
      y = rand();
    }
    if (x < 0 || x > 1 || y < 0 || y > 1) {
      i--;
      continue;
    }

    // Brightness follows a steep power curve: most stars are faint,
    // a handful are bright — the way a real sky looks.
    const magnitude = Math.pow(rand(), 3.2);
    stars.push({
      x,
      y,
      radius: 0.35 + magnitude * 1.65,
      opacity: 0.25 + magnitude * 0.7,
    });
  }
  return stars;
}

export function initStarfield() {
  const canvas = document.querySelector(".starfield");
  if (!canvas) return;
  const host = canvas.parentElement;
  const ctx = canvas.getContext("2d");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const stars = generateStars(mulberry32(1604));

  let width = 0;
  let height = 0;
  let pointer = null;   // { x, y } in CSS pixels relative to the canvas
  let frame = 0;        // pending requestAnimationFrame id
  let visible = true;

  // Match the drawing buffer to the displayed size × device pixel ratio,
  // then scale the context so drawing code keeps working in CSS pixels.
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    requestDraw();
  }

  // Soft glow along the band so it reads as the Milky Way, not just a
  // denser strip of dots. A gradient runs perpendicular to the band
  // (the band's normal is the (1, 1) direction), peaking on its centre line.
  function drawHaze() {
    const cx = width / 2;
    const cy = height / 2;
    const spread = Math.hypot(width, height) * 0.16;
    const nx = spread / Math.SQRT2;
    const gradient = ctx.createLinearGradient(cx - nx, cy - nx, cx + nx, cy + nx);
    gradient.addColorStop(0, `rgba(${STAR_RGB}, 0)`);
    gradient.addColorStop(0.3, `rgba(${STAR_RGB}, 0.012)`);
    gradient.addColorStop(0.5, `rgba(${STAR_RGB}, 0.03)`);
    gradient.addColorStop(0.7, `rgba(${STAR_RGB}, 0.012)`);
    gradient.addColorStop(1, `rgba(${STAR_RGB}, 0)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  function draw() {
    frame = 0;
    ctx.clearRect(0, 0, width, height);
    drawHaze();

    for (const star of stars) {
      const sx = star.x * width;
      const sy = star.y * height;
      let radius = star.radius;
      let opacity = star.opacity;

      if (pointer && !reducedMotion.matches) {
        const distance = Math.hypot(sx - pointer.x, sy - pointer.y);
        if (distance < HOVER_RADIUS) {
          const proximity = 1 - distance / HOVER_RADIUS;
          radius += proximity * 1.2;
          opacity = Math.min(1, opacity + proximity * 0.5);
        }
      }

      ctx.beginPath();
      ctx.arc(sx, sy, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${STAR_RGB}, ${opacity})`;
      ctx.fill();
    }
  }

  // Draw on demand instead of every frame: the sky only changes when the
  // pointer moves or the canvas resizes, and at most once per frame.
  function requestDraw() {
    if (!frame && visible) frame = requestAnimationFrame(draw);
  }

  host.addEventListener("pointermove", (event) => {
    const rect = canvas.getBoundingClientRect();
    pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    requestDraw();
  });

  host.addEventListener("pointerleave", () => {
    pointer = null;
    requestDraw();
  });

  new ResizeObserver(resize).observe(canvas);

  // Skip work entirely while the hero is scrolled out of view
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) requestDraw();
  }).observe(canvas);

  reducedMotion.addEventListener("change", requestDraw);
}
