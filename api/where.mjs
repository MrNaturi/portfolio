// GET /api/where — the visitor's approximate location, for the About
// page's "you're this far from Ibadan" line.
//
// Vercel adds IP-derived geolocation headers to every request, so this
// needs no permission prompt and no third-party service. It's city-level
// at best, is never logged or stored, and is only returned to the same
// visitor. When the headers are missing (local dev, some networks) it
// answers 204 and the page simply leaves the line out.

export function GET(request) {
  const h = request.headers;
  const lat = Number.parseFloat(h.get("x-vercel-ip-latitude") ?? "");
  const lon = Number.parseFloat(h.get("x-vercel-ip-longitude") ?? "");

  const headers = {
    // Per-visitor answer: never cache it at the edge or share it
    "Cache-Control": "private, no-store",
    Vary: "*",
  };

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return new Response(null, { status: 204, headers });
  }

  const decode = (value) => {
    try {
      return value ? decodeURIComponent(value) : null;
    } catch {
      return value;
    }
  };

  const body = {
    // Round to ~10km so nothing more precise than a city ever leaves
    lat: Math.round(lat * 10) / 10,
    lon: Math.round(lon * 10) / 10,
    city: decode(h.get("x-vercel-ip-city")),
    country: h.get("x-vercel-ip-country"),
  };

  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { ...headers, "Content-Type": "application/json; charset=utf-8" },
  });
}
