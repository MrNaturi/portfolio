// Minimal RSS parsing for two known feeds (Substack and Medium). Not a
// general XML parser: it reads <item> blocks and the handful of fields the
// reading view needs, which keeps the function dependency-free.

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", "#39": "'" };

function decode(text) {
  return text
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([\da-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&(amp|lt|gt|quot|apos|#39);/g, (_, name) => ENTITIES[name]);
}

// Text of the first <tag>…</tag> in a block, CDATA unwrapped
function field(block, tag) {
  const escaped = tag.replace(":", "\\:");
  const match = block.match(new RegExp(`<${escaped}(?:\\s[^>]*)?>([\\s\\S]*?)</${escaped}>`, "i"));
  if (!match) return "";
  const raw = match[1].trim();
  const cdata = raw.match(/^<!\[CDATA\[([\s\S]*?)\]\]>$/);
  return cdata ? cdata[1] : decode(raw);
}

// Slug that posts.js uses as the id: the last path segment of the link
export function idFromLink(link) {
  try {
    return new URL(link).pathname.split("/").filter(Boolean).pop() ?? "";
  } catch {
    return "";
  }
}

export function parseFeed(xml, source) {
  const items = xml.match(/<item\b[\s\S]*?<\/item>/gi) ?? [];
  return items.map((block) => {
    const link = field(block, "link");
    const url = new URL(link);
    url.search = ""; // drop Medium's ?source=rss tracking
    const published = new Date(field(block, "pubDate"));

    let html = field(block, "content:encoded");
    // Medium appends a 1×1 tracking pixel to every post
    html = html.replace(/<img[^>]+medium\.com\/_\/stat[^>]*>/gi, "");

    return {
      id: idFromLink(link),
      source,
      title: field(block, "title"),
      subtitle: field(block, "description").replace(/<[^>]+>/g, "").trim(),
      link: url.toString(),
      date: Number.isNaN(published.getTime()) ? null : published.toISOString(),
      html,
    };
  });
}
