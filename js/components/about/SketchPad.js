// A small sketch pad in brass ink. Strokes fade away a few seconds after
// they're drawn, so it never fills up or needs clearing.

const HOLD = 3500;  // ms a stroke stays at full strength
const FADE = 1500;  // ms it then takes to disappear

export function initSketchPad() {
  const card = document.querySelector("[data-sketch]");
  if (!card) return;

  const wrap = document.createElement("div");
  wrap.className = "about-sketch";
  wrap.innerHTML = `
    <canvas class="about-sketch__canvas" role="img" aria-label="Sketch pad: drawings fade after a few seconds"></canvas>
    <span class="about-sketch__hint" aria-hidden="true">draw here · fades in 5s</span>
  `;
  card.append(wrap);

  const canvas = wrap.querySelector("canvas");
  const hint = wrap.querySelector(".about-sketch__hint");
  const ctx = canvas.getContext("2d");
  const ink = getComputedStyle(document.documentElement).getPropertyValue("--accent-brass").trim() || "#C9A26A";

  let width = 0;
  let height = 0;
  const strokes = []; // { points: [{x,y}], ended: time | null }
  let current = null;
  let frame = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    requestDraw();
  }

  function draw() {
    frame = 0;
    const now = performance.now();
    ctx.clearRect(0, 0, width, height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1.8;

    for (let i = strokes.length - 1; i >= 0; i--) {
      const stroke = strokes[i];
      const age = stroke.ended ? now - stroke.ended : 0;
      const alpha = age < HOLD ? 1 : 1 - (age - HOLD) / FADE;
      if (alpha <= 0) {
        strokes.splice(i, 1);
        continue;
      }
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      const [first, ...rest] = stroke.points;
      ctx.moveTo(first.x, first.y);
      if (!rest.length) ctx.lineTo(first.x + 0.1, first.y); // a dot
      for (const p of rest) ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    hint.hidden = strokes.length > 0;
    // Keep animating only while something is on the pad
    if (strokes.length) requestDraw();
  }

  function requestDraw() {
    if (!frame) frame = requestAnimationFrame(draw);
  }

  const point = (event) => {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  canvas.addEventListener("pointerdown", (event) => {
    canvas.setPointerCapture(event.pointerId);
    current = { points: [point(event)], ended: null };
    strokes.push(current);
    requestDraw();
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!current) return;
    // Use coalesced events for smooth lines on fast pointers
    const events = event.getCoalescedEvents?.() ?? [event];
    for (const e of events) current.points.push(point(e));
    requestDraw();
  });

  const end = () => {
    if (current) current.ended = performance.now();
    current = null;
    requestDraw();
  };
  canvas.addEventListener("pointerup", end);
  canvas.addEventListener("pointercancel", end);

  new ResizeObserver(resize).observe(canvas);
}
