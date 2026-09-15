export function StarfieldCanvas() {
  return `<canvas class="starfield" aria-hidden="true"></canvas>`;
}

const STAR_COUNT = 320;
const FAINT_COUNT = 1400;    // only visible through the eyepiece
const BAND_SHARE = 0.55;     // share of stars pulled into the Milky Way band
const BAND_WIDTH = 0.085;    // band spread, as a fraction of the diagonal
const LABEL_MAGNITUDE = 0.4; // stars brighter than this get a catalogue label
const STAR_RGB = "236, 231, 220";

// First-visit intro: stars fade in brightest-first
const INTRO_DELAY = 250;     // ms, lets the coordinate grid lead
const INTRO_DURATION = 1100; // ms
const INTRO_STAGGER = 0.75;  // share of the intro spent staggering by brightness

// Long exposure (press and hold)
const HOLD_DELAY = 180;          // ms before a mouse/pen press becomes an exposure
const TOUCH_HOLD_DELAY = 420;    // ms for a long press on touch — longer, so taps and scrolls win
const TOUCH_SLOP = 10;           // px a finger may drift before the press counts as a scroll
const EXPOSURE_MAX_SPEED = 7;    // degrees of sky rotation per second, at full speed
const EXPOSURE_RAMP = 1.2;       // seconds to reach full speed
const EXPOSURE_MAX_ANGLE = 32;   // degrees — trails stop growing here
const RELEASE_DURATION = 900;    // ms for trails to wind back and fade
const TRAIL_SEGMENTS = 8;        // arc slices per trail, for the fading tail
const TRAIL_OPACITY = 0.8;       // trails sit a little under the stars, so hero text stays legible
const STILL_EXPOSURE_ANGLE = 18; // reduced motion: one finished frame at this angle

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

  // <html data-intro="play"> is set by an inline script in index.html on the
  // first visit of a session (and never with reduced motion)
  const introStart =
    document.documentElement.dataset.intro === "play" ? performance.now() + INTRO_DELAY : null;

  // The lens eases toward the pointer and fades in/out, so it has its own
  // position and opacity separate from the raw pointer.
  let pointer = null;     // { x, y } in CSS pixels, or null when away
  const lens = { x: 0, y: 0, alpha: 0 };

  // Exposure state. Stars rotate about the celestial pole, which sits at the
  // same point the page grid is projected from (50% across, 55vh above the
  // top of the viewport — see css/atmosphere.css), converted to canvas space.
  const exposure = {
    state: "idle",   // idle | armed | exposing | releasing
    timer: 0,
    start: 0,        // performance.now() when exposing began
    angle: 0,        // current rotation, degrees
    releaseFrom: 0,  // angle at the moment of release
    releaseStart: 0,
    anchor: null,    // { x, y } where the press happened, for the readout
    pole: { x: 0, y: 0 },
  };

  function polePosition() {
    const rect = canvas.getBoundingClientRect();
    return { x: window.innerWidth / 2 - rect.left, y: -0.55 * window.innerHeight - rect.top };
  }

  function lensRadius() {
    return Math.max(64, Math.min(110, width * 0.075));
  }

  // Match the drawing buffer to the displayed size × device pixel ratio,
  // then scale the context so drawing code keeps working in CSS pixels.
  // The resting sky (haze + stars) never changes between resizes, so it is
  // painted once to an offscreen canvas and copied in with one drawImage per
  // frame, instead of re-filling hundreds of stars while the lens moves.
  const skyLayer = document.createElement("canvas");
  const skyCtx = skyLayer.getContext("2d");

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    for (const [target, context] of [[canvas, ctx], [skyLayer, skyCtx]]) {
      target.width = Math.round(width * dpr);
      target.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    paintSkyLayer();
    requestDraw();
  }

  function paintSkyLayer() {
    skyCtx.clearRect(0, 0, width, height);
    drawHaze(skyCtx);
    skyCtx.fillStyle = `rgb(${STAR_RGB})`;
    for (const star of stars) {
      skyCtx.globalAlpha = star.opacity;
      skyCtx.beginPath();
      skyCtx.arc(star.x * width, star.y * height, star.radius, 0, Math.PI * 2);
      skyCtx.fill();
    }
    skyCtx.globalAlpha = 1;
  }

  // Soft glow along the band so it reads as the Milky Way, not just a
  // denser strip of dots. A gradient runs perpendicular to the band
  // (the band's normal is the (1, 1) direction), peaking on its centre line.
  function drawHaze(context = ctx) {
    const cx = width / 2;
    const cy = height / 2;
    const spread = Math.hypot(width, height) * 0.16;
    const nx = spread / Math.SQRT2;
    const gradient = context.createLinearGradient(cx - nx, cy - nx, cx + nx, cy + nx);
    gradient.addColorStop(0, `rgba(${STAR_RGB}, 0)`);
    gradient.addColorStop(0.3, `rgba(${STAR_RGB}, 0.012)`);
    gradient.addColorStop(0.5, `rgba(${STAR_RGB}, 0.03)`);
    gradient.addColorStop(0.7, `rgba(${STAR_RGB}, 0.012)`);
    gradient.addColorStop(1, `rgba(${STAR_RGB}, 0)`);
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
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

  // Integrated rotation for a hold of t seconds: speed ramps in with a
  // quadratic ease, then runs at full speed, capped at the maximum angle.
  function exposureAngle(t) {
    const ramp = EXPOSURE_RAMP;
    const angle =
      t < ramp
        ? (EXPOSURE_MAX_SPEED * t * t) / (2 * ramp)
        : (EXPOSURE_MAX_SPEED * ramp) / 2 + EXPOSURE_MAX_SPEED * (t - ramp);
    return Math.min(EXPOSURE_MAX_ANGLE, angle);
  }

  // Each star sweeps an arc around the pole from where it started to where
  // it is now. The arc is split into slices that brighten toward the head,
  // so the tail fades like a real long-exposure trail.
  function drawTrails(angleDeg, fade) {
    const { x: px, y: py } = exposure.pole;
    // Northern sky turns counter-clockwise about the pole; with canvas y
    // pointing down that is a negative angle.
    const sweep = (-angleDeg * Math.PI) / 180;

    ctx.save();
    ctx.lineCap = "round";
    for (const star of stars) {
      const sx = star.x * width;
      const sy = star.y * height;
      const radius = Math.hypot(sx - px, sy - py);
      const start = Math.atan2(sy - py, sx - px);
      ctx.lineWidth = Math.max(0.6, star.radius * 1.3);

      for (let i = 0; i < TRAIL_SEGMENTS; i++) {
        const a0 = start + (sweep * i) / TRAIL_SEGMENTS;
        const a1 = start + (sweep * (i + 1)) / TRAIL_SEGMENTS;
        const strength = (i + 1) / TRAIL_SEGMENTS;
        ctx.strokeStyle = `rgba(${STAR_RGB}, ${star.opacity * strength * strength * fade * TRAIL_OPACITY})`;
        ctx.beginPath();
        ctx.arc(px, py, radius, a0, a1, sweep < 0);
        ctx.stroke();
      }

      // The star itself, at the head of its trail
      const head = start + sweep;
      drawDot(px + Math.cos(head) * radius, py + Math.sin(head) * radius, star.radius, star.opacity);
    }
    ctx.restore();
  }

  function drawExposureReadout(angleDeg, seconds, alpha) {
    if (!exposure.anchor) return;
    const pad = (n) => String(n).padStart(2, "0");
    // Reduced motion shows a still frame, so there is no running clock to report
    const clock = reducedMotion.matches ? "" : `${pad(Math.floor(seconds / 60))}:${pad(Math.floor(seconds % 60))} · `;
    const text = `exposure ${clock}${Math.round(angleDeg)}°`;
    ctx.save();
    ctx.globalAlpha = alpha * 0.85;
    ctx.fillStyle = brass;
    ctx.font = `400 10px ${monoFont}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(text, exposure.anchor.x, exposure.anchor.y + 20);
    ctx.restore();
  }

  // Advance the exposure state machine; returns true while it needs frames
  function stepExposure(now) {
    if (exposure.state === "exposing") {
      exposure.angle = reducedMotion.matches
        ? STILL_EXPOSURE_ANGLE
        : exposureAngle((now - exposure.start) / 1000);
      return !reducedMotion.matches;
    }
    if (exposure.state === "releasing") {
      const t = Math.min(1, (now - exposure.releaseStart) / RELEASE_DURATION);
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; // in-out cubic
      exposure.angle = exposure.releaseFrom * (1 - eased);
      if (t >= 1) {
        exposure.state = "idle";
        exposure.angle = 0;
        return false;
      }
      return true;
    }
    return false;
  }

  function draw() {
    frame = 0;
    const now = performance.now();
    const exposureRunning = stepExposure(now);
    ctx.clearRect(0, 0, width, height);
    // 0 → 1 across the intro; 1 immediately when there is no intro
    const intro =
      introStart === null
        ? 1
        : Math.min(1, Math.max(0, (performance.now() - introStart) / INTRO_DURATION));

    const trailing = exposure.angle > 0.05;

    if (intro >= 1 && !trailing) {
      // Common case: resting sky, possibly with the lens on top
      ctx.drawImage(skyLayer, 0, 0, width, height);
    } else {
      ctx.globalAlpha = intro;
      drawHaze();
      ctx.globalAlpha = 1;
    }

    if (trailing) {
      const fade =
        exposure.state === "releasing"
          ? 1 - Math.min(1, (now - exposure.releaseStart) / RELEASE_DURATION)
          : 1;
      drawTrails(exposure.angle, fade);
      if (exposure.state === "exposing") {
        const seconds = reducedMotion.matches ? 0 : (now - exposure.start) / 1000;
        drawExposureReadout(exposure.angle, seconds, 1);
      }
    }

    if (!trailing && intro < 1) for (const star of stars) {
      // Each star waits its turn by brightness, then fades over the rest
      let reveal = 1;
      if (intro < 1) {
        const start = (1 - star.magnitude) * INTRO_STAGGER;
        reveal = Math.min(1, Math.max(0, (intro - start) / (1 - INTRO_STAGGER)));
        reveal = 1 - Math.pow(1 - reveal, 3); // ease-out
      }
      if (reveal > 0) drawDot(star.x * width, star.y * height, star.radius, star.opacity * reveal);
    }

    // Step the lens toward its target. Reduced motion: snap, no easing.
    const instant = reducedMotion.matches;
    // The lens steps aside while an exposure is running
    const targetAlpha = pointer && exposure.state === "idle" ? 1 : 0;
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
      intro < 1 ||
      exposureRunning ||
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

  // ---- Press and hold → long exposure ----
  function beginExposure() {
    exposure.state = "exposing";
    exposure.start = performance.now();
    exposure.pole = polePosition();
    host.classList.add("is-exposing");
    requestDraw();
  }

  function armExposure(event) {
    if (event.button !== 0 || event.target.closest(TEXT)) return;
    const isTouch = event.pointerType === "touch";
    // A mouse press on open sky shouldn't start a text drag-select. Touch
    // is left alone here so the page can still scroll normally.
    if (!isTouch) event.preventDefault();
    const rect = canvas.getBoundingClientRect();
    exposure.anchor = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    exposure.pressX = event.clientX;
    exposure.pressY = event.clientY;
    exposure.state = "armed";
    clearTimeout(exposure.timer);
    exposure.timer = setTimeout(beginExposure, isTouch ? TOUCH_HOLD_DELAY : HOLD_DELAY);
  }

  function endExposure() {
    clearTimeout(exposure.timer);
    host.classList.remove("is-exposing");
    if (exposure.state === "exposing") {
      if (reducedMotion.matches) {
        exposure.state = "idle";
        exposure.angle = 0;
      } else {
        exposure.state = "releasing";
        exposure.releaseFrom = exposure.angle;
        exposure.releaseStart = performance.now();
      }
      requestDraw();
    } else if (exposure.state === "armed") {
      exposure.state = "idle";
    }
  }

  host.addEventListener("pointerdown", armExposure);

  // A finger that drifts before the long press fires is scrolling, not holding
  host.addEventListener("pointermove", (event) => {
    if (exposure.state !== "armed" || event.pointerType !== "touch") return;
    if (Math.hypot(event.clientX - exposure.pressX, event.clientY - exposure.pressY) > TOUCH_SLOP) {
      endExposure();
    }
  });

  // Once an exposure is running, keep the finger from scrolling the page or
  // opening the long-press menu.
  host.addEventListener(
    "touchmove",
    (event) => {
      if (exposure.state === "exposing") event.preventDefault();
    },
    { passive: false }
  );
  host.addEventListener("contextmenu", (event) => {
    if (exposure.state !== "idle") event.preventDefault();
  });
  window.addEventListener("pointercancel", endExposure);
  // Listen on window so releasing outside the hero still ends the exposure
  window.addEventListener("pointerup", endExposure);
  window.addEventListener("blur", endExposure);

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
