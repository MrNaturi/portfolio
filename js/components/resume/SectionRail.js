// Highlight the section being read in the rail. The current section is the
// last one whose top has passed the upper part of the viewport; at the very
// bottom of the page the last section wins, since short closing sections can
// never scroll that far. Marked with aria-current so the state is exposed,
// not just coloured.
//
// Measured on scroll (one read per frame) rather than with an
// IntersectionObserver: jumping straight from the bottom to the top skips
// sections without ever firing their callbacks, leaving the rail stale.

export function initSectionRail() {
  const links = [...document.querySelectorAll("[data-toc]")];
  const sections = links.map((a) => document.getElementById(a.dataset.toc)).filter(Boolean);
  if (!sections.length) return;

  let current = null;
  let queued = false;

  const update = () => {
    queued = false;
    // Upper third, capped so a clicked section (scrolled to the top) is never
    // overtaken by a short section right below it
    const line = Math.min(window.innerHeight / 3, 160);
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;

    let next = sections[0];
    if (atBottom) next = sections[sections.length - 1];
    else for (const s of sections) if (s.getBoundingClientRect().top <= line) next = s;

    if (next === current) return;
    current = next;
    links.forEach((a) => {
      if (a.dataset.toc === current.id) a.setAttribute("aria-current", "location");
      else a.removeAttribute("aria-current");
    });
  };

  const queue = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  };

  window.addEventListener("scroll", queue, { passive: true });
  window.addEventListener("resize", queue);
  update();
}
