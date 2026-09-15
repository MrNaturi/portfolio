export function StarfieldCanvas() {
  return `<canvas class="starfield" aria-hidden="true"></canvas>`;
}

const STAR_COUNT = 320;
const FAINT_COUNT = 1400;    // only visible through the eyepiece
const BAND_SHARE = 0.55;     // share of stars pulled into the Milky Way band
const BAND_WIDTH = 0.085;    // band spread, as a fraction of the diagonal
const LABEL_MAGNITUDE = 0.4; // stars brighter than this get a catalogue label
const STAR_RGB = "236, 231, 220";

// Eyepiece
const ZOOM = 1.8;
const FOLLOW = 0.2;          // 0–1, how quickly the lens catches the pointer
const FADE = 0.14;           // 0–1, how quickly the lens fades in/out

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

function placeStar(rand, bandShare) {
  for (;;) {
    let x;
    let y;
    if (rand() < bandShare) {
      // Band runs corner to corner, lower-left to upper-right
      const t = rand();
      const offset = gaussian(rand) * BAND_WIDTH;
      x = t + offset * 0.7;
      y = 1 - t + offset * 0.7;
    } else {
      x = rand();
      y = rand();
    }
    if (x >= 0 && x <= 1 && y >= 0 && y <= 1) return { x, y };
  }
}

function generateStars(rand) {
  const stars = [];
  for (let i = 0; i < STAR_COUNT; i++) {
    // Brightness follows a steep power curve: most stars are faint,
    // a handful are bright — the way a real sky looks.
    const magnitude = Math.pow(rand(), 3.2);
    stars.push({
      ...placeStar(rand, BAND_SHARE),
      magnitude,
      radius: 0.35 + magnitude * 1.65,
      opacity: 0.25 + magnitude * 0.7,
      // Harvard Revised–style catalogue number, shown in the eyepiece
      label: magnitude > LABEL_MAGNITUDE ? `HR ${1000 + Math.floor(rand() * 8000)}` : null,
    });
  }
  return stars;
}

function generateFaintStars(rand) {
  const stars = [];
  for (let i = 0; i < FAINT_COUNT; i++) {
    stars.push({
      ...placeStar(rand, 0.7),
      radius: 0.25 + rand() * 0.35,
      opacity: 0.12 + rand() * 0.35,
    });
  }
  return stars;
}

// Map a canvas position onto a star-chart coordinate readout. Not a real
// projection yet — the real-sky version will replace this.
function toCoordinates(x, y, width, height) {
  const ra = (x / width) * 24;
  const hours = Math.floor(ra);
  const minutes = Math.floor((ra - hours) * 60);
  const dec = 60 - (y / height) * 90;
  const sign = dec < 0 ? "−" : "+";
  const degrees = Math.floor(Math.abs(dec));
  const arcminutes = Math.floor((Math.abs(dec) - degrees) * 60);
  const pad = (n) => String(n).padStart(2, "0");
  return `RA ${pad(hours)}h ${pad(minutes)}m · Dec ${sign}${pad(degrees)}° ${pad(arcminutes)}′`;
}

export function initStarfield() {
  const canvas = document.querySelector(".starfield");
  if (!canvas) return;
  const host = canvas.parentElement;
  const ctx = canvas.getContext("2d");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const rand = mulberry32(1604);
  const stars = generateStars(rand);
  const faintStars = generateFaintStars(rand);

  const styles = getComputedStyle(document.documentElement);
  const brass = styles.getPropertyValue("--accent-brass").trim() || "#C9A26A";
  const voidDeep = styles.getPropertyValue("--bg-void-deep").trim() || "#070810";
  const monoFont = styles.getPropertyValue("--font-mono").trim() || "monospace";

  let width = 0;
  let height = 0;
  let frame = 0;          // pending requestAnimationFrame id
  let visible = true;

  // The lens eases toward the pointer and fades in/out, so it has its own
  // position and opacity separate from the raw pointer.
  let pointer = null;     // { x, y } in CSS pixels, or null when away
  const lens = { x: 0, y: 0, alpha: 0 };

  function lensRadius() {
    return Math.max(64, Math.min(110, width * 0.075));
  }

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

  function drawDot(x, y, radius, opacity) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${STAR_RGB}, ${opacity})`;
    ctx.fill();
  }

  // ---- Eyepiece ----
  // Inside the lens: the field darkens, everything is magnified around the
  // lens centre, faint stars appear, and bright stars get catalogue labels.
  // Around it: a brass ring with degree ticks, a finder crosshair, and a
  // coordinate readout.
  function drawEyepiece() {
    const r = lensRadius();
    const { x: cx, y: cy, alpha } = lens;
    const reach = r / ZOOM + 4; // source area that ends up inside the lens

    ctx.save();
    ctx.globalAlpha = alpha;

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();

    // Darken the field so magnified stars read against true black
    ctx.fillStyle = voidDeep;
    ctx.globalAlpha = alpha * 0.4;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    ctx.globalAlpha = alpha;

    const magnify = (px, py) => [cx + (px - cx) * ZOOM, cy + (py - cy) * ZOOM];

    for (const star of faintStars) {
      const sx = star.x * width;
      const sy = star.y * height;
      if (Math.abs(sx - cx) > reach || Math.abs(sy - cy) > reach) continue;
      const [mx, my] = magnify(sx, sy);
      drawDot(mx, my, star.radius * ZOOM, Math.min(1, star.opacity * 1.7));
    }

    ctx.font = `400 9px ${monoFont}`;
    ctx.textBaseline = "middle";
    for (const star of stars) {
      const sx = star.x * width;
      const sy = star.y * height;
      if (Math.abs(sx - cx) > reach || Math.abs(sy - cy) > reach) continue;
      const [mx, my] = magnify(sx, sy);
      const radius = star.radius * ZOOM * 0.8;
      drawDot(mx, my, radius, Math.min(1, star.opacity + 0.2));
      if (star.label) {
        ctx.fillStyle = brass;
        ctx.globalAlpha = alpha * 0.8;
        ctx.fillText(star.label, mx + radius + 5, my);
        ctx.globalAlpha = alpha;
      }
    }

    // Inner vignette, like looking down a tube
    const vignette = ctx.createRadialGradient(cx, cy, r * 0.55, cx, cy, r);
    vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
    vignette.addColorStop(1, "rgba(0, 0, 0, 0.55)");
    ctx.fillStyle = vignette;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

    ctx.restore();

    // Chrome outside the clip
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = brass;
    ctx.fillStyle = brass;

    ctx.lineWidth = 1;
    ctx.globalAlpha = alpha * 0.7;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // Degree ticks every 10°, longer every 90°
    for (let deg = 0; deg < 360; deg += 10) {
      const angle = (deg * Math.PI) / 180;
      const length = deg % 90 === 0 ? 9 : 4;
      ctx.globalAlpha = alpha * (deg % 90 === 0 ? 0.8 : 0.45);
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
      ctx.lineTo(cx + Math.cos(angle) * (r + length), cy + Math.sin(angle) * (r + length));
      ctx.stroke();
    }

    // Finder crosshair with an open centre
    ctx.globalAlpha = alpha * 0.55;
    ctx.beginPath();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      ctx.moveTo(cx + dx * 6, cy + dy * 6);
      ctx.lineTo(cx + dx * 16, cy + dy * 16);
    }
    ctx.stroke();

    // Coordinate readout under the lens
    ctx.globalAlpha = alpha * 0.85;
    ctx.font = `400 10px ${monoFont}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(toCoordinates(cx, cy, width, height), cx, cy + r + 16);

    ctx.restore();
  }

  function draw() {
    frame = 0;
    ctx.clearRect(0, 0, width, height);
    drawHaze();

    for (const star of stars) {
      drawDot(star.x * width, star.y * height, star.radius, star.opacity);
    }

    // Step the lens toward its target. Reduced motion: snap, no easing.
    const instant = reducedMotion.matches;
    const targetAlpha = pointer ? 1 : 0;
    if (pointer) {
      if (instant || lens.alpha === 0) {
        lens.x = pointer.x;
        lens.y = pointer.y;
      } else {
        lens.x += (pointer.x - lens.x) * FOLLOW;
        lens.y += (pointer.y - lens.y) * FOLLOW;
      }
    }
    lens.alpha = instant ? targetAlpha : lens.alpha + (targetAlpha - lens.alpha) * FADE;
    if (Math.abs(lens.alpha - targetAlpha) < 0.01) lens.alpha = targetAlpha;

    if (lens.alpha > 0) drawEyepiece();

    // Keep animating only while the lens is still catching up or fading
    const settling =
      lens.alpha !== targetAlpha ||
      (pointer && Math.hypot(pointer.x - lens.x, pointer.y - lens.y) > 0.3);
    if (settling) requestDraw();
  }

  // Draw on demand instead of every frame: the sky only changes when the
  // pointer moves, the lens is settling, or the canvas resizes.
  function requestDraw() {
    if (!frame && visible) frame = requestAnimationFrame(draw);
  }

  // Selector for hero content the lens should step aside for — it's for
  // exploring open sky, not for sitting on top of the text being read.
  const TEXT = "h1, h2, h3, p, a, button";

  function setPointer(event) {
    if (event.target.closest(TEXT)) {
      clearPointer();
      return;
    }
    const rect = canvas.getBoundingClientRect();
    pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    requestDraw();
  }

  function clearPointer() {
    pointer = null;
    requestDraw();
  }

  // Mouse/pen: lens follows while hovering. Touch: lens shows while a
  // finger is down and disappears on lift or when the page starts scrolling.
  host.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch" && !event.buttons) return;
    setPointer(event);
  });
  host.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "touch") setPointer(event);
  });
  host.addEventListener("pointerup", (event) => {
    if (event.pointerType === "touch") clearPointer();
  });
  host.addEventListener("pointercancel", clearPointer);
  host.addEventListener("pointerleave", clearPointer);

  new ResizeObserver(resize).observe(canvas);

  // Skip work entirely while the hero is scrolled out of view
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) requestDraw();
  }).observe(canvas);

  // Canvas text needs the web font loaded before labels render correctly
  document.fonts?.ready.then(requestDraw);
  reducedMotion.addEventListener("change", requestDraw);
}
