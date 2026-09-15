// Clean URLs — vercel.json's cleanUrls serves /about from about.html and
// redirects /about.html to /about, so linking the clean form avoids a hop.
export const links = [
  { id: 1, label: "About", href: "/about" },
  { id: 2, label: "Writing", href: "/writing" },
  { id: 3, label: "Projects", href: "/projects" },
  { id: 4, label: "Resume", href: "/resume" },
];
