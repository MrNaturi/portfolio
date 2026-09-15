// Allowlist sanitizer for post HTML from the feeds. The content is our own
// writing, but it comes from third-party platforms, so only plain reading
// markup survives: no scripts, styles, iframes, forms, event handlers or
// platform widgets. Unknown elements are unwrapped (their text kept);
// dangerous ones are dropped with their contents.

const KEEP = new Set([
  "P", "BR", "HR", "H2", "H3", "H4", "EM", "I", "STRONG", "B", "U", "S", "SUP", "SUB",
  "A", "BLOCKQUOTE", "UL", "OL", "LI", "PRE", "CODE", "FIGURE", "FIGCAPTION", "IMG",
  "TABLE", "THEAD", "TBODY", "TR", "TH", "TD",
]);
const DROP = new Set(["SCRIPT", "STYLE", "IFRAME", "OBJECT", "EMBED", "FORM", "INPUT", "BUTTON", "SVG", "NOSCRIPT", "TEMPLATE"]);
const ATTRS = { A: ["href", "title"], IMG: ["src", "alt", "width", "height"], TD: ["colspan", "rowspan"], TH: ["colspan", "rowspan"] };
// Platform chrome that arrives inside post bodies (subscribe boxes, share bars)
const WIDGET = /subscribe|subscription|button-wrapper|share-dialog|captioned-button/i;

const safeUrl = (value) => {
  try {
    const url = new URL(value, location.href);
    return url.protocol === "https:" || url.protocol === "http:" || url.protocol === "mailto:" ? url.href : null;
  } catch {
    return null;
  }
};

function clean(node) {
  for (const child of [...node.childNodes]) {
    if (child.nodeType === Node.COMMENT_NODE) {
      child.remove();
      continue;
    }
    if (child.nodeType !== Node.ELEMENT_NODE) continue;

    const tag = child.tagName;
    if (DROP.has(tag) || WIDGET.test(child.getAttribute("class") ?? "")) {
      child.remove();
      continue;
    }

    clean(child);

    if (tag === "H1") {
      // The page title is the only h1; demote the post's own headings
      const h2 = child.ownerDocument.createElement("h2");
      h2.append(...child.childNodes);
      child.replaceWith(h2);
      continue;
    }

    if (!KEEP.has(tag)) {
      child.replaceWith(...child.childNodes);
      continue;
    }

    const allowed = ATTRS[tag] ?? [];
    for (const attr of [...child.attributes]) {
      if (!allowed.includes(attr.name)) child.removeAttribute(attr.name);
    }

    if (tag === "A") {
      const href = safeUrl(child.getAttribute("href") ?? "");
      if (href) {
        child.setAttribute("href", href);
        child.setAttribute("rel", "noopener");
      } else {
        child.replaceWith(...child.childNodes);
      }
    }

    if (tag === "IMG") {
      const src = safeUrl(child.getAttribute("src") ?? "");
      // Tracking pixels (Medium's 1×1 stat image) aren't content
      const tiny = Number(child.getAttribute("width")) <= 1 && Number(child.getAttribute("height")) <= 1 && child.hasAttribute("width");
      if (!src || tiny) {
        child.remove();
        continue;
      }
      child.setAttribute("src", src);
      child.setAttribute("loading", "lazy");
      child.setAttribute("decoding", "async");
      child.setAttribute("referrerpolicy", "no-referrer");
      if (!child.hasAttribute("alt")) child.setAttribute("alt", "");
    }
  }
}

export function sanitizePostHtml(html) {
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
  const root = doc.body.firstElementChild;
  clean(root);
  // Drop paragraphs left empty by removed widgets
  for (const p of root.querySelectorAll("p")) {
    if (!p.textContent.trim() && !p.querySelector("img")) p.remove();
  }
  return root.innerHTML;
}
