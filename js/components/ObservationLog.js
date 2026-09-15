// A line in the footer written like an entry in an observing log:
// where the visitor is (from their timezone), their local time, and the
// current Greenwich sidereal time — the clock astronomers point by.
// No geolocation or network request: everything comes from the browser.

export function ObservationLog() {
  // Empty until JS fills it, so there is no stale time without scripts
  return `<p class="observation-log" hidden></p>`;
}

function placeFromTimeZone(timeZone) {
  if (!timeZone || !timeZone.includes("/")) return null;
  // "America/Argentina/Buenos_Aires" → "Buenos Aires"
  return timeZone.split("/").pop().replace(/_/g, " ");
}

// Greenwich Mean Sidereal Time, in hours, for a given Date.
// Standard low-precision formula; accurate to well under a second.
function gmstHours(date) {
  const julianDate = date.getTime() / 86400000 + 2440587.5;
  const daysSinceJ2000 = julianDate - 2451545.0;
  const hours = 18.697374558 + 24.06570982441908 * daysSinceJ2000;
  return ((hours % 24) + 24) % 24;
}

function formatSidereal(hours) {
  const h = Math.floor(hours);
  const m = Math.floor((hours - h) * 60);
  return `${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m`;
}

export function initObservationLog() {
  const el = document.querySelector(".observation-log");
  if (!el) return;

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const place = placeFromTimeZone(timeZone);
  const timeFormat = new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  function render() {
    const now = new Date();
    const parts = [
      place ? `Observed from ${place}` : "Observed",
      `<time datetime="${now.toISOString()}">${timeFormat.format(now)}</time> local`,
      `sidereal ${formatSidereal(gmstHours(now))} GMST`,
    ];
    el.innerHTML = parts.join('<span class="observation-log__sep" aria-hidden="true"> · </span>');
    el.hidden = false;
  }

  render();

  // Tick on the minute boundary, then every minute after
  const msToNextMinute = 60000 - (Date.now() % 60000);
  setTimeout(() => {
    render();
    setInterval(render, 60000);
  }, msToNextMinute);
}
