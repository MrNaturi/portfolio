// Writing, newest first. Essays are personal pieces on Substack; technical
// posts are on Medium. Posts that belong to a run (the Luminary devlogs) sit
// in a series, shown as one expandable entry.
//
// `id` is the post's slug on its platform. It keys the reading view
// (/writing/read?post=<id>) and is how the RSS feed item is matched.
// Dates are ISO so they sort as strings and fit <time datetime>.

export const essays = [
  {
    id: "the-equivalence-of-legos-and-people",
    title: "The Equivalence of Legos and People",
    summary: "Apart from being uncomfortable to step on.",
    date: "2026-03-12",
    href: "https://ofuj.substack.com/p/the-equivalence-of-legos-and-people",
  },
  {
    id: "why-i-might-start-writing-numbers",
    title: "Why I Might Start Writing Numbers Down Again",
    summary: "What an old man's red journal taught me about memory and meaning.",
    date: "2025-04-22",
    href: "https://ofuj.substack.com/p/why-i-might-start-writing-numbers",
  },
  {
    id: "the-finish-line",
    title: "The (Finish) Line",
    summary: "The line between ideas and action, and what it takes to cross it.",
    date: "2025-01-07",
    href: "https://ofuj.substack.com/p/the-finish-line",
  },
  {
    id: "the-rwandaring",
    title: "The Rwandaring",
    summary: "Time travel with me.",
    date: "2024-10-13",
    href: "https://ofuj.substack.com/p/the-rwandaring",
  },
  {
    id: "genesis",
    title: "Genesis",
    summary: "The act of beginning.",
    date: "2024-09-15",
    href: "https://ofuj.substack.com/p/genesis",
  },
].map((post) => ({ ...post, type: "essay", source: "Substack" }));

const medium = (post) => ({ ...post, type: "technical", source: "Medium" });

// Technical entries: single posts, or a series holding several posts
export const technical = [
  {
    series: true,
    id: "luminary-devlog",
    title: "Luminary devlog",
    summary: "Four weeks of building Luminary with a team, from the landing page to launch.",
    posts: [
      {
        id: "luminary-devlog-4-03113f80ab76",
        title: "Luminary Devlog 4",
        summary: "The last sprint before the launch of Luminary.",
        date: "2026-03-28",
        href: "https://medium.com/@daniaemmanuel06/luminary-devlog-4-03113f80ab76",
      },
      {
        id: "luminary-devlog-3-cc1a989b47dc",
        title: "Luminary DevLog 3: Building the Article Page (While Sick)",
        summary:
          "A clean, readable layout for long-form articles, with related articles and engagement features, finished through a week of being sick.",
        date: "2026-03-21",
        href: "https://medium.com/@daniaemmanuel06/luminary-devlog-3-cc1a989b47dc",
      },
      {
        id: "luminary-devlog-2-20ba04bb57f2",
        title: "Luminary DevLog 2",
        summary: "The core of the Luminary Women's Directory, a searchable interface that highlights women.",
        date: "2026-03-14",
        href: "https://medium.com/@daniaemmanuel06/luminary-devlog-2-20ba04bb57f2",
      },
      {
        id: "luminary-week-1-38f8e3e43605",
        title: "Luminary DevLog Week 1",
        summary: "Building the contributors section of Luminary's landing page.",
        date: "2026-03-07",
        href: "https://medium.com/@daniaemmanuel06/luminary-week-1-38f8e3e43605",
      },
    ].map(medium),
  },
  medium({
    id: "cupids-board-bridging-the-gap-with-vanilla-html-and-css-047db30e5c9e",
    title: "Cupid's Board: Bridging the gap with Vanilla HTML and CSS",
    summary: "A case study of building Cupid's Board with nothing but vanilla HTML and CSS.",
    topics: ["HTML", "CSS", "Case study"],
    related: { label: "Cupid's Board", href: "/projects#cupids-board" },
    date: "2026-02-21",
    href: "https://medium.com/@daniaemmanuel06/cupids-board-bridging-the-gap-with-vanilla-html-and-css-047db30e5c9e",
  }),
  medium({
    id: "the-beginning-of-a-new-phase-ad8633048564",
    title: "The Beginning of a New Phase",
    summary: "Why I want to be a front-end developer, and how HNG will help me get there.",
    topics: ["Frontend", "HNG"],
    date: "2025-01-29",
    href: "https://medium.com/@daniaemmanuel06/the-beginning-of-a-new-phase-ad8633048564",
  }),
];

// A series is dated by its newest part
for (const entry of technical) {
  if (entry.series) {
    entry.type = "technical";
    entry.source = "Medium";
    entry.date = entry.posts.map((p) => p.date).sort().at(-1);
  }
}

const byNewest = (a, b) => b.date.localeCompare(a.date);

// Entries as listed (a series counts once), newest first
export const entries = [...essays, ...technical].sort(byNewest);

// Every individual post, series expanded
export const allPosts = [
  ...essays,
  ...technical.flatMap((entry) => (entry.series ? entry.posts : [entry])),
].sort(byNewest);

export const findPost = (id) => allPosts.find((post) => post.id === id);

// Reading view URL for a post
export const readHref = (post) => `/writing/read?post=${encodeURIComponent(post.id)}`;
