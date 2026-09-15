// GET /api/feed — both writing feeds as JSON for the reading view.
//
// Browsers can't read the Substack or Medium RSS feeds from the portfolio's
// origin (no CORS), so this Vercel function fetches them server-side. The
// CDN caches the response for an hour and serves it stale for up to a day
// while refreshing, so new posts appear without a redeploy and the feeds
// are fetched rarely.

import { parseFeed } from "./_lib/rss.mjs";

const FEEDS = [
  { source: "Substack", url: "https://ofuj.substack.com/feed" },
  { source: "Medium", url: "https://medium.com/feed/@daniaemmanuel06" },
];

async function load({ source, url }) {
  const response = await fetch(url, {
    headers: { "User-Agent": "ofuje-portfolio-reader/1.0", Accept: "application/rss+xml, application/xml" },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`${source} feed responded ${response.status}`);
  return parseFeed(await response.text(), source);
}

export async function GET() {
  // One feed failing shouldn't take the other down
  const results = await Promise.allSettled(FEEDS.map(load));
  const posts = results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
  const errors = results
    .map((r, i) => (r.status === "rejected" ? { source: FEEDS[i].source, error: String(r.reason?.message ?? r.reason) } : null))
    .filter(Boolean);

  const allFailed = errors.length === FEEDS.length;

  return new Response(JSON.stringify({ posts, errors }), {
    status: allFailed ? 502 : 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      // Don't cache a total failure; do cache partial and full successes
      "Cache-Control": allFailed ? "no-store" : "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
