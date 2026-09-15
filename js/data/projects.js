// Project content for Selected Work and, later, the Projects page.
// `accent` ties a flagship to its motion language: ember = beacon, teal = signal.
// Fields left null are simply not rendered.

export const flagships = [
  {
    id: "triagerl",
    serial: "Plate I",
    name: "TriageRL",
    accent: "ember",
    pitch: "Reinforcement learning for emergency department triage optimization.",
    description:
      "A stochastic emergency department simulation where patients arrive, consume beds and staff time, wait in queues, and can deteriorate while waiting. A DQN proof of concept came first; MaskablePPO was selected as the final agent and deployed through a FastAPI backend and React dashboard.",
    role: "Researcher · ML engineer · Full-stack",
    stack: ["Python", "Gymnasium", "MaskablePPO", "DQN", "FastAPI", "React", "SQLite"],
    year: "2026",
    status: "Completed",
    // Readouts against the severity-rule baseline
    results: [
      { value: "−35.0%", label: "average wait" },
      { value: "−35.4%", label: "P90 wait" },
      { value: "+7.6%", label: "throughput" },
    ],
    resultsNote: "vs. severity-rule baseline",
    links: [{ label: "GitHub", href: "https://github.com/e-dania/TriageRL" }],
  },
  {
    id: "afroglot",
    serial: "Plate II",
    name: "Afroglot",
    accent: "teal",
    pitch: "Speech technology for Yoruba, Igbo and Hausa.",
    description:
      "Upload or record speech and get a transcription in your native language, or enter text and hear it spoken back with natural tonal inflection. Built on existing speech models through the Spitch APIs, with the work going into the product experience around them.",
    role: "Full-stack developer",
    // TODO: confirm the rest of the stack
    stack: ["Spitch APIs"],
    year: "2025",
    status: "Shipped prototype",
    results: [
      { value: "3", label: "languages" },
      { value: "2-way", label: "speech and text" },
    ],
    resultsNote: "Yoruba · Igbo · Hausa",
    links: [
      { label: "Live", href: "https://afroglot-v0.vercel.app/" },
      { label: "GitHub", href: "https://github.com/e-dania/Afroglot_v0" },
    ],
  },
];

export const supporting = [
  {
    id: "ml-studybuddy",
    serial: "III",
    name: "ML StudyBuddy",
    category: "AI/ML",
    pitch: "A science tutor built by fine-tuning TinyLlama with LoRA.",
    stack: ["TinyLlama", "PEFT/LoRA", "Gradio"],
    year: "2026",
    // TODO: add GitHub URL
    links: [],
  },
  {
    id: "skillswap",
    serial: "IV",
    name: "SkillSwap",
    category: "Mobile",
    pitch: "A mobile platform for exchanging skills and learning from each other.",
    stack: ["Flutter", "Riverpod", "Firebase"],
    year: "2025",
    links: [{ label: "GitHub", href: "https://github.com/Mathias-Kabango3/skillswap" }],
  },
  {
    id: "cupids-board",
    serial: "V",
    name: "Cupid's Board",
    category: "Frontend",
    pitch: "A quiet digital space for sharing love, memories and encouragement.",
    stack: ["HTML", "CSS", "JavaScript"],
    // TODO: confirm year
    year: null,
    links: [
      { label: "Live", href: "https://cupids-board.vercel.app/" },
      { label: "Case study", href: "https://medium.com/@daniaemmanuel06/cupids-board-bridging-the-gap-with-vanilla-html-and-css-047db30e5c9e" },
    ],
  },
];
