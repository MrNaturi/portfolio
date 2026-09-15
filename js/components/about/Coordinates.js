import { cities } from "../../data/about.js";

// Two coordinates: toggle between Ibadan and Kigali. The selected city's
// panel shows its local time; a small star-chart map joins the two cities
// and, when the visitor's rough location is known, draws them in too with
// their distance from the selected city.

const W = 640;
const H = 400;
const PAD = 56;

const toRad = (d) => (d * Math.PI) / 180;

// Great-circle distance in km
function distanceKm(a, b) {
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

const km = (n) => `${Math.round(n / 10) * 10 >= 1000 ? (Math.round(n / 10) * 10).toLocaleString("en-GB") : Math.round(n)} km`;

// Equirectangular projection fitted to whatever points are on the map,
// squashed by cos(latitude) so shapes aren't stretched away from the equator
function projector(points) {
  const midLat = points.reduce((s, p) => s + p.lat, 0) / points.length;
  const k = Math.cos(toRad(midLat));
  const xs = points.map((p) => p.lon * k);
  const ys = points.map((p) => -p.lat);
  let [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  // Never zoom in closer than ~20° across, so nearby points still breathe
  const span = Math.max(maxX - minX, (maxY - minY) * ((W - PAD * 2) / (H - PAD * 2)), 20);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const scale = (W - PAD * 2) / span;
  return {
    project: (p) => ({ x: W / 2 + (p.lon * k - cx) * scale, y: H / 2 + (-p.lat - cy) * scale }),
    k,
    scale,
    cx,
    cy,
  };
}

function graticule({ k, scale, cx, cy }) {
  // Lines every 10° that fall inside the frame
  const lines = [];
  const lonMin = (cx - W / 2 / scale) / k;
  const lonMax = (cx + W / 2 / scale) / k;
  const latMax = -(cy - H / 2 / scale);
  const latMin = -(cy + H / 2 / scale);
  for (let lon = Math.ceil(lonMin / 10) * 10; lon <= lonMax; lon += 10) {
    const x = W / 2 + (lon * k - cx) * scale;
    lines.push(`<line x1="${x}" y1="0" x2="${x}" y2="${H}" />`);
  }
  for (let lat = Math.ceil(latMin / 10) * 10; lat <= latMax; lat += 10) {
    const y = H / 2 + (-lat - cy) * scale;
    lines.push(`<line x1="0" y1="${y}" x2="${W}" y2="${y}" />`);
    if (lat === 0) lines.push(`<text class="coords-map__eq" x="8" y="${y - 6}">equator</text>`);
  }
  return lines.join("");
}

// A gentle arc between two projected points, bowed upward like a flight path
function arc(a, b, bow = 0.2) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  let nx = -dy / len;
  let ny = dx / len;
  if (ny > 0) {
    nx = -nx;
    ny = -ny;
  }
  const cx = mx + nx * len * bow;
  const cy = my + ny * len * bow;
  return { d: `M${a.x},${a.y} Q${cx},${cy} ${b.x},${b.y}`, label: { x: (mx + cx) / 2, y: (my + cy) / 2 } };
}

// Labels near the frame's edges anchor inward so they're never cut off
const EDGE = 130;
const labelAnchor = (x) => (x < EDGE ? "start" : x > W - EDGE ? "end" : "middle");
const labelX = (x) => (x < EDGE ? Math.max(8, x - 12) : x > W - EDGE ? Math.min(W - 8, x + 12) : x);

function renderMap(selectedId, visitor) {
  const points = [...cities, ...(visitor ? [visitor] : [])];
  const proj = projector(points);
  const [ibadan, kigali] = cities.map((c) => ({ ...c, ...proj.project(c) }));
  const selected = selectedId === "ibadan" ? ibadan : kigali;
  const other = selectedId === "ibadan" ? kigali : ibadan;
  const between = arc(ibadan, kigali);
  let you = visitor ? { ...visitor, ...proj.project(visitor) } : null;
  // A visitor in or near one of the cities would sit on top of its label,
  // so fold them into that city's label instead of drawing a second point
  const NEAR_KM = 250;
  const nearCity = you ? [ibadan, kigali].find((c) => distanceKm(you, c) < NEAR_KM) : null;
  if (nearCity) {
    nearCity.name = `${nearCity.name} · you're near`;
    you = { ...you, x: nearCity.x, y: nearCity.y, folded: true };
  }

  const cityMark = (c, isSelected) => `
    <g class="coords-map__city${isSelected ? " is-selected" : ""}">
      ${isSelected ? `<circle class="coords-map__halo" cx="${c.x}" cy="${c.y}" r="15" />` : ""}
      <circle class="coords-map__dot" cx="${c.x}" cy="${c.y}" r="${isSelected ? 6 : 4.5}" />
      <text x="${labelX(c.x)}" y="${c.y + 30}" text-anchor="${labelAnchor(c.x)}">${c.name}</text>
    </g>`;

  return `
    <svg class="coords-map" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="coords-map-desc">
      <desc id="coords-map-desc">Star-chart style map of Ibadan and Kigali, ${km(distanceKm(ibadan, kigali))} apart${
        you ? `, and your approximate location, ${km(distanceKm(you, selected))} from ${selected.name}` : ""
      }.</desc>
      <g class="coords-map__grid">${graticule(proj)}</g>
      <path class="coords-map__arc" d="${between.d}" />
      <text class="coords-map__km" x="${between.label.x}" y="${between.label.y - 8}" text-anchor="middle">${km(distanceKm(ibadan, kigali))}</text>
      ${you && !(you.folded && nearCity === selected) ? `<line class="coords-map__you-line" x1="${you.x}" y1="${you.y}" x2="${selected.x}" y2="${selected.y}" />` : ""}
      ${cityMark(other, false)}
      ${cityMark(selected, true)}
      ${
        you && !you.folded
          ? `<g class="coords-map__you"><circle cx="${you.x}" cy="${you.y}" r="3.5" /><text x="${you.x + 10}" y="${you.y - 8}">you</text></g>`
          : ""
      }
    </svg>
  `;
}

export function initCoordinates() {
  const section = document.getElementById("coordinates");
  if (!section) return;
  const panel = section.querySelector("[data-coords-panel]");
  const chart = section.querySelector("[data-coords-chart]");
  const panels = [...panel.querySelectorAll("[data-city]")];

  // Toggle
  const toggle = document.createElement("div");
  toggle.className = "coords-toggle";
  toggle.setAttribute("role", "group");
  toggle.setAttribute("aria-label", "Choose a city");
  toggle.innerHTML = cities
    .map((c) => `<button type="button" data-select="${c.id}" aria-pressed="false">${c.name}</button>`)
    .join("");
  panel.prepend(toggle);

  // Visitor distance line, filled in once /api/where answers
  const you = document.createElement("p");
  you.className = "coords-you";
  you.hidden = true;
  you.setAttribute("aria-live", "polite");
  panel.append(you);

  let selected = cities[0].id;
  let visitor = null;

  function update() {
    for (const button of toggle.querySelectorAll("button")) {
      button.setAttribute("aria-pressed", String(button.dataset.select === selected));
    }
    for (const p of panels) p.hidden = p.dataset.city !== selected;
    chart.innerHTML = renderMap(selected, visitor);

    if (visitor) {
      const city = cities.find((c) => c.id === selected);
      const place = visitor.city ? ` in ${visitor.city}` : "";
      you.innerHTML = `<strong>≈ ${km(distanceKm(visitor, city))}</strong> between you${place} and ${city.name}`;
      you.hidden = false;
    }
  }

  toggle.addEventListener("click", (event) => {
    const button = event.target.closest("[data-select]");
    if (!button) return;
    selected = button.dataset.select;
    update();
  });

  // The "Ibadan" chip in the story selects its city on the way down
  for (const link of document.querySelectorAll("[data-city-link]")) {
    link.addEventListener("click", () => {
      selected = link.dataset.cityLink;
      update();
    });
  }

  // Live local times, ticking on the minute
  const clocks = [...panel.querySelectorAll("[data-city-time]")];
  const tick = () => {
    for (const el of clocks) {
      // Intl names these zones "GMT+1" / "GMT+2"; the local names read better
      const time = new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: el.dataset.cityTime,
      }).format(new Date());
      el.textContent = `${time} ${el.dataset.zone}`;
    }
  };
  tick();
  setTimeout(() => {
    tick();
    setInterval(tick, 60000);
  }, 60000 - (Date.now() % 60000));

  update();

  fetch("/api/where", { signal: AbortSignal.timeout(6000) })
    .then((response) => (response.status === 200 ? response.json() : null))
    .then((data) => {
      if (data && Number.isFinite(data.lat) && Number.isFinite(data.lon)) {
        visitor = data;
        update();
      }
    })
    .catch(() => {});
}
