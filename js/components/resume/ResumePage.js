import {
  updated,
  header,
  contact,
  experience,
  projects,
  education,
  skills,
  beyond,
  pdf,
} from "../../data/resume.js";

// Fixed three-letter months, matching the Writing page's date column
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const month = (ym) => {
  const [y, m] = ym.split("-").map(Number);
  return { y, m: MONTHS[m - 1] };
};

// "May – Sep 2022" within a year, "Aug 2026 –" while ongoing
export function formatRange(start, end, { ongoing = "Present" } = {}) {
  const s = month(start);
  if (!end) return `${s.m} ${s.y} – ${ongoing}`;
  const e = month(end);
  return s.y === e.y ? `${s.m} – ${e.m} ${e.y}` : `${s.m} ${s.y} – ${e.m} ${e.y}`;
}

export const formatUpdated = (ym) => {
  const u = month(ym);
  return `${u.m} ${u.y}`;
};

export const highlight = (text) => text.replace(/\{([^}]+)\}/g, "<em>$1</em>");

export const sections = [
  { id: "experience", title: "Experience" },
  { id: "projects", title: "Selected projects", short: "Projects" },
  { id: "education", title: "Education" },
  { id: "skills", title: "Skills" },
  { id: "beyond", title: "Beyond" },
];

const head = ({ id, title }) => `
  <header class="section__head resume-sec__head">
    <span class="section__index" aria-hidden="true"></span>
    <h2 class="section__title resume-sec__title" id="${id}-title">${title}</h2>
  </header>
`;

const Section = (meta, body) => `
  <section class="resume-sec" id="${meta.id}" aria-labelledby="${meta.id}-title">
    ${head(meta)}
    ${body}
  </section>
`;

const When = (html) => `<p class="resume-entry__when">${html}</p>`;

// ---- Intro ----

export function ResumeIntro() {
  return `
    <header class="resume-intro">
      <div class="resume-intro__text">
        <p class="resume-intro__eyebrow">Resume · ${header.location}</p>
        <h1 class="resume-intro__name">${header.name}</h1>
        <p class="resume-intro__summary">${highlight(header.summary)}</p>
      </div>
      <div class="resume-intro__actions">
        <a class="resume-btn" href="${pdf.href}" download="${pdf.filename}">
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2v8m-3.5-3.5L8 10l3.5-3.5M3 13.5h10" /></svg>
          Download PDF
        </a>
        <button class="resume-btn resume-btn--quiet" type="button" data-print>
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 6V2.5h7V6M4.5 11.5h-2v-5h11v5h-2M4.5 9.5h7v4h-7z" /></svg>
          Print
        </button>
        <p class="resume-intro__updated">Updated <time datetime="${updated}">${formatUpdated(updated)}</time></p>
      </div>
    </header>
  `;
}

// ---- Rail: section list + contact ----

function Rail() {
  const reach = contact.filter((c) => !c.printOnly);
  return `
    <aside class="resume-rail">
      <nav class="resume-toc" aria-label="Resume sections">
        <p class="resume-rail__label">On this page</p>
        <ul>
          ${sections.map((s) => `<li><a href="#${s.id}" data-toc="${s.id}">${s.short ?? s.title}</a></li>`).join("")}
        </ul>
      </nav>
      <div class="resume-reach">
        <p class="resume-rail__label">Reach me</p>
        <ul>
          ${reach
            .map((c) => {
              const isGithub = c.label === "GitHub";
              const text = isGithub ? `GitHub · ${c.value.split("/").pop()}` : c.label === "Email" ? `<span class="resume-reach__email">${c.value}</span>` : c.label;
              const ext = c.href.startsWith("http") ? ' rel="noopener"' : "";
              return `<li><a href="${c.href}"${ext}>${text}</a></li>`;
            })
            .join("")}
        </ul>
      </div>
    </aside>
  `;
}

// ---- Sections ----

function Experience() {
  return experience
    .map(
      (job) => `
      <article class="resume-entry">
        ${When(
          job.end
            ? formatRange(job.start, job.end)
            : `<span class="resume-now">Now</span><span>${formatRange(job.start, null, { ongoing: "" }).trim()}</span>`
        )}
        <div class="resume-entry__body">
          <h3 class="resume-entry__title">${job.role}</h3>
          <p class="resume-entry__where">${job.org} · ${job.where}</p>
          <ul class="resume-entry__points">${job.points.map((p) => `<li>${p}</li>`).join("")}</ul>
          ${
            job.work
              ? `<div class="resume-work">
                  ${job.work
                    .map(
                      (w) => `
                    <div class="resume-work__item">
                      <p class="resume-work__name">
                        ${w.href ? `<a href="${w.href}">${w.name}</a>` : w.name}
                        ${w.tag ? `<span class="resume-tag">${w.tag}</span>` : ""}
                      </p>
                      <p>${w.text}</p>
                    </div>`
                    )
                    .join("")}
                </div>`
              : ""
          }
        </div>
      </article>`
    )
    .join("");
}

function Projects() {
  return projects
    .map(
      (p) => `
      <article class="resume-entry resume-project"${p.accent ? ` data-accent="${p.accent}"` : ""}>
        ${When(p.year)}
        <div class="resume-entry__body">
          <h3 class="resume-entry__title"><a href="${p.href}">${p.name}</a></h3>
          <p class="resume-entry__where">${p.pitch}</p>
          <ul class="resume-entry__points">${p.points.map((x) => `<li>${x}</li>`).join("")}</ul>
          ${
            p.results.length
              ? `<dl class="resume-readout">${p.results
                  .map((r) => `<div><dt>${r.label}</dt><dd>${r.value}</dd></div>`)
                  .join("")}</dl>`
              : ""
          }
          <ul class="resume-stack" aria-label="Stack">${p.stack.map((s) => `<li>${s}</li>`).join("")}</ul>
        </div>
      </article>`
    )
    .join("");
}

function Education() {
  return education
    .map(
      (e) => `
      <article class="resume-entry">
        ${When(e.when.replace("Graduating ", "Graduating<br>"))}
        <div class="resume-entry__body">
          <h3 class="resume-entry__title">${e.degree}</h3>
          <p class="resume-entry__where">${e.school} · ${e.where}</p>
          <p class="resume-entry__note">${e.note}</p>
        </div>
      </article>`
    )
    .join("");
}

function Skills() {
  return `
    <dl class="resume-skills">
      ${skills.map((s) => `<div><dt>${s.area}</dt><dd>${s.items.join(", ")}</dd></div>`).join("")}
    </dl>
  `;
}

function Beyond() {
  return beyond
    .map(
      (b) => `
      <article class="resume-entry">
        ${When(b.when)}
        <div class="resume-entry__body">
          <h3 class="resume-entry__title">${b.href ? `<a href="${b.href}">${b.title}</a>` : b.title}</h3>
          <p class="resume-entry__where">${b.text}</p>
        </div>
      </article>`
    )
    .join("");
}

const bodies = { experience: Experience, projects: Projects, education: Education, skills: Skills, beyond: Beyond };

export function ResumeBody() {
  return `
    <div class="resume-layout">
      ${Rail()}
      <div class="resume-main">
        ${sections.map((s) => Section(s, bodies[s.id]())).join("")}
      </div>
    </div>
  `;
}
