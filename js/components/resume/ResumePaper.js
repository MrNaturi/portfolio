// The paper version of the resume: what print and the PDF show.
// Built from the same data as the page, but laid out for one A4 sheet —
// denser, with the phone number and full link text that screens don't need.

import { header, contact, experience, projects, education, skills, beyond } from "../../data/resume.js";
import { formatRange } from "./ResumePage.js";

const plain = (text) => text.replace(/[{}]/g, "");

const Head = (title, where, when) => `
  <div class="paper-entry__head">
    <p><b>${title}</b>${where ? ` <span>· ${where}</span>` : ""}</p>
    ${when ? `<p class="paper-entry__when">${when}</p>` : ""}
  </div>
`;

const List = (items) => `<ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul>`;

export function ResumePaper() {
  return `
    <article class="paper">
      <header class="paper__head">
        <h1 class="paper__name">${header.name}</h1>
        <p class="paper__title">${header.title}</p>
        <p class="paper__contact">
          <span>${header.location}</span>
          ${contact.map((c) => `<span>${c.value}</span>`).join("")}
        </p>
      </header>

      <h2 class="paper__sec">Summary</h2>
      <p>${plain(header.summary)}${header.printSummaryTail}</p>

      <h2 class="paper__sec">Experience</h2>
      ${experience
        .map(
          (job) => `
        <div class="paper-entry">
          ${Head(job.role, `${job.org}, ${job.where}`, formatRange(job.start, job.end))}
          ${List([
            ...job.points,
            ...(job.work ?? []).map((w) => `<b>${w.name}</b>${w.tag && w.tag !== "in design" ? ` (${w.tag})` : ""}: ${w.text.charAt(0).toLowerCase()}${w.text.slice(1)}`),
          ])}
        </div>`
        )
        .join("")}

      <h2 class="paper__sec">Selected projects</h2>
      ${projects
        .map(
          (p) => `
        <div class="paper-entry">
          ${Head(p.name, p.pitch, p.year)}
          ${List(p.printPoints ?? p.points)}
          <p class="paper-entry__stack">${p.stack.join(" · ")}</p>
        </div>`
        )
        .join("")}

      <h2 class="paper__sec">Education</h2>
      ${education
        .map(
          (e) => `
        <div class="paper-entry">
          ${Head(e.degree, e.school, e.when)}
          <p>${e.note}</p>
        </div>`
        )
        .join("")}

      <h2 class="paper__sec">Skills</h2>
      <dl class="paper__skills">
        ${skills.map((s) => `<dt>${s.printArea ?? s.area}</dt><dd>${s.items.join(", ")}</dd>`).join("")}
      </dl>

      <h2 class="paper__sec">Leadership &amp; more</h2>
      ${List(beyond.map((b) => b.print))}
    </article>
  `;
}
