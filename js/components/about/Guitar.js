// Strum a G chord. The sound is synthesised in the browser with the
// Karplus–Strong plucked-string algorithm (a burst of noise fed through a
// short averaging delay line), so there's no audio file to load. Each of
// the six drawn strings shivers as its note sounds.

// Open G major, low string to high: G2 B2 D3 G3 B3 G4
const CHORD = [98.0, 123.47, 146.83, 196.0, 246.94, 392.0];
const STRUM_GAP = 0.034; // seconds between strings on a downstroke
const RING = 2.6;        // seconds each string rings for

let context = null;
const buffers = new Map();

function pluck(ctx, frequency) {
  if (buffers.has(frequency)) return buffers.get(frequency);
  const rate = ctx.sampleRate;
  const length = Math.floor(rate * RING);
  const buffer = ctx.createBuffer(1, length, rate);
  const out = buffer.getChannelData(0);
  const period = Math.round(rate / frequency);
  const ring = new Float32Array(period);
  for (let i = 0; i < period; i++) ring[i] = Math.random() * 2 - 1;
  // Lower strings decay a touch slower, like a real guitar
  const damping = 0.994 + Math.min(0.004, 20 / frequency / 100);
  for (let i = 0, p = 0; i < length; i++) {
    const next = (p + 1) % period;
    const sample = ring[p];
    ring[p] = damping * 0.5 * (ring[p] + ring[next]);
    out[i] = sample;
    p = next;
  }
  buffers.set(frequency, buffer);
  return buffer;
}

export function initGuitar() {
  const card = document.querySelector("[data-guitar]");
  if (!card || !("AudioContext" in window || "webkitAudioContext" in window)) return;

  const button = document.createElement("button");
  button.type = "button";
  button.className = "about-strum";
  button.innerHTML = `<span aria-hidden="true">♪</span> strum a G chord`;

  const strings = document.createElement("div");
  strings.className = "about-strings";
  strings.setAttribute("aria-hidden", "true");
  strings.innerHTML = CHORD.map(() => "<span></span>").join("");

  card.append(button, strings);
  const lines = [...strings.children];

  button.addEventListener("click", async () => {
    context ??= new (window.AudioContext || window.webkitAudioContext)();
    if (context.state === "suspended") await context.resume();

    const master = context.createGain();
    master.gain.value = 0.28;
    master.connect(context.destination);

    const start = context.currentTime + 0.02;
    CHORD.forEach((frequency, i) => {
      const source = context.createBufferSource();
      source.buffer = pluck(context, frequency);
      const gain = context.createGain();
      const at = start + i * STRUM_GAP;
      const level = 0.9 - i * 0.08; // bass strings a little louder
      // Fade out over the last 0.4s so the buffer's end never clicks
      gain.gain.setValueAtTime(level, at);
      gain.gain.setValueAtTime(level, at + RING - 0.4);
      gain.gain.linearRampToValueAtTime(0, at + RING);
      source.connect(gain).connect(master);
      source.start(at);

      setTimeout(() => {
        const line = lines[i];
        line.classList.remove("is-ringing");
        void line.offsetWidth; // restart the animation on repeat strums
        line.classList.add("is-ringing");
      }, (i * STRUM_GAP + 0.02) * 1000);
    });
  });
}
