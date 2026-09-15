// Resume content. One source for both the /resume page and its print/PDF
// layout. Projects reuse names, years, links and results from projects.js so
// the numbers always match the case study; only the resume bullets live here.
// `printOnly` fields show on paper but never on the public web page.

import { flagships, supporting } from "./projects.js";
import { email } from "./social-links.js";

export const updated = "2026-09";

export const header = {
  name: "Emmanuel Dania",
  title: "Software Engineer · Machine Learning",
  location: "Kigali, Rwanda",
  summary:
    "Software engineer working where {machine learning meets the interface}. I build ML systems end to end, from simulation and model training to the APIs and frontends people use.",
  printSummaryTail: " Currently building a clinician-facing voice assistant at HealthStack.",
};

export const contact = [
  { label: "Phone", value: "+234 704 036 9741", href: "tel:+2347040369741", printOnly: true },
  { label: "Email", value: email, href: `mailto:${email}` },
  { label: "Portfolio", value: "ofujesportfolio.vercel.app", href: "https://ofujesportfolio.vercel.app/", printOnly: true },
  { label: "LinkedIn", value: "linkedin.com/in/emmanuel-dania-93a08b24a", href: "https://www.linkedin.com/in/emmanuel-dania-93a08b24a/" },
  { label: "GitHub", value: "github.com/e-dania", href: "https://github.com/e-dania" },
  { label: "GitHub", value: "github.com/MrNaturi", href: "https://github.com/MrNaturi" },
];

// Dates are "YYYY-MM"; `end: null` means ongoing.
export const experience = [
  {
    role: "AI & Frontend Engineering Intern",
    org: "HealthStack",
    where: "Remote, Ibadan",
    start: "2026-08",
    end: null,
    points: [
      "Building a clinician-facing voice assistant for HealthStack's chat-first EMR, which runs day-to-day operations for small and mid-sized Nigerian hospitals.",
    ],
  },
  {
    role: "Frontend Engineering Intern",
    org: "Rise Academy",
    where: "Remote",
    start: "2026-01",
    end: null,
    points: [
      "Year-long frontend programme, shipping team products across HTML, CSS, React, Vue and Tailwind.",
    ],
    work: [
      {
        name: "Luminary",
        tag: "open source",
        text: "Built the landing page contributors section, the searchable Women's Directory and the long-form article page for a platform spotlighting women.",
        href: "/writing?type=technical",
      },
      {
        name: "Cupid's Board",
        text: "Built a calm, vanilla HTML/CSS space for sharing notes and memories on a CSS-variable design system, and wrote a case study on it.",
        href: "/projects#cupids-board",
      },
      {
        name: "Shelves",
        tag: "in design",
        text: "Designing digital shelves for tracking books and reading.",
      },
    ],
  },
  {
    role: "Coding Instructor Intern",
    org: "Unicorn Den",
    where: "Ibadan",
    start: "2022-05",
    end: "2022-09",
    points: ["Taught HTML and CSS to children aged 8–12 through hands-on projects."],
  },
];

const allProjects = [...flagships, ...supporting];
const project = (id) => allProjects.find((p) => p.id === id);

const withProject = (id, extra) => {
  const p = project(id);
  return {
    id,
    name: p.name,
    year: p.year,
    accent: p.accent ?? null,
    results: p.results ?? [],
    href: p.caseStudy ?? `/projects#${id}`,
    ...extra,
  };
};

export const projects = [
  withProject("triagerl", {
    pitch: "Reinforcement learning for emergency department triage",
    points: [
      "Built a stochastic ED simulation and trained a MaskablePPO agent after a DQN proof of concept, served through FastAPI and a React dashboard.",
    ],
    printPoints: [
      "Built a stochastic ED simulation and trained a MaskablePPO agent after a DQN proof of concept; deployed through FastAPI and a React dashboard.",
      "Cut average wait 35.0% and P90 wait 35.4%, and raised throughput 7.6% against a severity-rule baseline.",
    ],
    stack: ["Python", "PyTorch", "Gymnasium", "Stable-Baselines3", "FastAPI", "React", "SQLite"],
  }),
  withProject("afroglot", {
    pitch: "Speech to text and back for Yoruba, Igbo and Hausa",
    points: ["Built recording, upload, transcription and tonal speech synthesis, with authentication and cloud audio storage."],
    stack: ["React", "Firebase", "Spitch APIs"],
    results: [], // "3 languages" reads as filler on a resume
  }),
  withProject("ml-studybuddy", {
    pitch: "Science tutor from a fine-tuned small language model",
    points: ["Fine-tuned TinyLlama-1.1B with LoRA on SciQ, evaluated against the base model (ROUGE-L 0.230) and deployed through Gradio."],
    stack: ["Python", "Hugging Face Transformers", "PEFT/LoRA", "Gradio"],
    results: [],
  }),
];

export const education = [
  {
    degree: "BSc Software Engineering, specialising in Machine Learning & AI",
    school: "African Leadership University",
    where: "Kigali",
    note: "First Class · all coursework complete",
    when: "Graduating July 2027",
  },
];

export const skills = [
  { area: "Languages", items: ["Python", "JavaScript", "TypeScript", "Dart", "HTML", "CSS"] },
  { area: "Machine learning", printArea: "ML", items: ["PyTorch", "Stable-Baselines3", "Gymnasium", "Hugging Face Transformers", "PEFT/LoRA"] },
  { area: "Web & mobile", items: ["React", "Vue", "Tailwind CSS", "FastAPI", "Flutter", "Firebase", "SQLite"] },
  { area: "Tools", items: ["Git", "Bash", "Vercel", "Figma", "n8n"] },
];

export const beyond = [
  { when: "ALU", title: "Vice President, Astronomy Club", text: "Ran events on astronomy, physics and scientific inquiry." },
  { when: "2025", title: "Organiser, Agahozo-Shalom Youth Village visit", text: "Planned a learning visit to the solar farm and ran STEM trivia workshops with local students." },
  { when: "Writing", title: "Medium and Substack", text: "Technical devlogs and case studies on Medium; personal essays in <i>Ofuje's Rough Drafts</i>.", href: "/writing" },
  { when: "Certificates", title: "freeCodeCamp", text: "Responsive Web Design · JavaScript Algorithms & Data Structures" },
];

export const pdf = {
  href: "/assets/resume/emmanuel-dania-resume.pdf",
  filename: "Emmanuel-Dania-Resume.pdf",
};
