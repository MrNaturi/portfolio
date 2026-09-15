// Project content for Home's Selected Work and the Projects page.
// `accent` ties a flagship to its motion language: ember = beacon, teal = signal.
// `description` is the short version used on Home; `details` holds the
// longer write-up paragraphs for the Projects page.
// Fields left null or empty are simply not rendered.

export const flagships = [
  {
    id: "triagerl",
    serial: "Plate I",
    name: "TriageRL",
    accent: "ember",
    pitch: "Reinforcement learning for emergency department triage optimization.",
    description:
      "A stochastic emergency department simulation where patients arrive, consume beds and staff time, wait in queues, and can deteriorate while waiting. A DQN proof of concept came first; MaskablePPO was selected as the final agent and deployed through a FastAPI backend and React dashboard.",
    details: [
      "TriageRL explores whether reinforcement learning can improve patient prioritization in an overcrowded emergency department.",
      "I built a stochastic simulation where patients arrive, consume beds and staff time, wait in queues, and can deteriorate while waiting. A DQN proof of concept was evaluated before MaskablePPO was selected as the final agent, which was then deployed through a FastAPI backend and React dashboard with SQLite.",
    ],
    role: "Researcher · ML engineer · Full‑stack",
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
    caseStudy: "/projects/triagerl",
    links: [
      { label: "Case study", href: "/projects/triagerl" },
      { label: "Live", href: "https://triagerl.onrender.com/" },
      { label: "Demo video", href: "https://drive.google.com/file/d/1xKa9FgESG11B0YHXsIxKq-Z9JYoKZOs_/view" },
      { label: "GitHub", href: "https://github.com/e-dania/TriageRL" },
    ],
  },
  {
    id: "afroglot",
    serial: "Plate II",
    name: "Afroglot",
    accent: "teal",
    pitch: "Speech technology for Yoruba, Igbo and Hausa.",
    description:
      "Upload or record speech and get a transcription in your native language, or enter text and hear it spoken back with natural tonal inflection. Built on existing speech models through the Spitch APIs, with the work going into the product experience around them.",
    details: [
      "Afroglot is a speech platform built around three African languages: Yoruba, Igbo and Hausa.",
      "Users can upload or record speech and receive a transcription in their native language, or enter text and generate natural-sounding speech with tonal inflections. I integrated existing speech models through Spitch APIs rather than training a model from scratch, and built the product experience around them.",
    ],
    role: "Full-stack developer",
    stack: ["React", "Firebase", "Spitch APIs"],
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
    details: [
      "ML StudyBuddy is a domain-specific science assistant built by fine-tuning TinyLlama-1.1B-Chat with parameter-efficient LoRA training.",
      "I used the SciQ science-education dataset and evaluated the resulting model against the base model before deploying the assistant through Gradio. The project explored how smaller language models can be adapted for specialized tasks without requiring large-scale compute.",
    ],
    role: "ML engineer",
    status: "Completed",
    results: [
      { value: "0.283", label: "ROUGE-1" },
      { value: "0.144", label: "ROUGE-2" },
      { value: "0.230", label: "ROUGE-L" },
      { value: "0.057", label: "BLEU" },
    ],
    stack: ["TinyLlama", "PEFT/LoRA", "Gradio"],
    fullStack: ["Python", "TinyLlama", "Hugging Face Transformers", "PEFT/LoRA", "SciQ", "Gradio"],
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
    details: [
      "SkillSwap was built around the idea that people can teach and learn from one another without money being the primary barrier. Users share their skills, discover people with complementary ones, communicate, schedule sessions, and build credibility through ratings and endorsements.",
    ],
    contribution:
      "I worked on the HomePage, UserPage and ProfilePage, skills handling, dynamic reloading, skill uploads, and the Firestore collections.",
    role: "Frontend / full‑stack contributor",
    status: "Completed group project",
    stack: ["Flutter", "Riverpod", "Firebase"],
    fullStack: ["Flutter", "Dart", "Riverpod", "Firebase Authentication", "Firestore", "Firebase Storage"],
    year: "2025",
    links: [{ label: "GitHub", href: "https://github.com/Mathias-Kabango3/skillswap" }],
  },
  {
    id: "cupids-board",
    serial: "V",
    name: "Cupid's Board",
    category: "Frontend",
    pitch: "A quiet digital space for sharing love, memories and encouragement.",
    details: [
      "Cupid's Board is a love-centered digital space designed around emotional expression, memory preservation and anonymous acts of kindness.",
      "Rather than building another noisy social platform, the project focuses on something intimate, warm and visually comforting. I built the experience in vanilla HTML and CSS, with a calm, minimal interface driven by a CSS-variable design system.",
    ],
    role: "Frontend developer",
    status: "Shipped",
    stack: ["HTML", "CSS", "JavaScript"],
    year: "2026",
    links: [
      { label: "Live", href: "https://cupids-board.vercel.app/" },
      { label: "GitHub", href: "https://github.com/MrNaturi/Cupids_Board" },
      { label: "Case study", href: "https://medium.com/@daniaemmanuel06/cupids-board-bridging-the-gap-with-vanilla-html-and-css-047db30e5c9e" },
    ],
  },
];
