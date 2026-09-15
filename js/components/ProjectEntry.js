import { MotionMark } from "./MotionMark.js";

// Long-form project entries for the Projects page. Flagships sit on
// instrument plates with their motion mark; supporting projects are open
// entries on brass hairlines. Both share one layout: a sticky spec column
// (serial, name, facts, stack, links) beside the write-up.

function external(href) {
  try {
    return new URL(href).hostname;
  } catch {
    return null;
  }
}

function Links(links) {
  if (!links?.length) return "";
  return `
    <ul class="plate__links">
      ${links
        .map((link) => {
          const host = external(link.href);
          return `<li><a href="${link.href}" rel="noopener">${link.label}${host ? `<span class="visually-hidden"> (opens ${host})</span>` : ""}</a></li>`;
        })
        .join("")}
    </ul>
  `;
}

function Facts(project) {
  const facts = [
    ["Role", project.role],
    ["Year", project.year],
    ["Status", project.status],
    ["Type", project.category],
  ].filter(([, value]) => value);

  return `
    <dl class="entry__facts">
      ${facts.map(([term, value]) => `<div><dt>${term}</dt><dd>${value}</dd></div>`).join("")}
    </dl>
  `;
}

function Readouts(project) {
  if (!project.results?.length) return "";
  return `
    <div class="entry__results">
      <dl class="plate__readouts">
        ${project.results
          .map((r) => `<div class="plate__readout"><dt>${r.label}</dt><dd>${r.value}</dd></div>`)
          .join("")}
      </dl>
      ${project.resultsNote ? `<p class="plate__readout-note">${project.resultsNote}</p>` : ""}
    </div>
  `;
}

function Body(project) {
  const stack = project.fullStack ?? project.stack;
  return `
    <div class="entry__spec">
      <h3 class="plate__name entry__name" id="entry-${project.id}-title">${project.name}</h3>
      ${Facts(project)}
      <ul class="entry__stack" aria-label="Stack">
        ${stack.map((item) => `<li>${item}</li>`).join("")}
      </ul>
      ${Links(project.links)}
    </div>

    <div class="entry__writeup">
      <p class="entry__pitch">${project.pitch}</p>
      ${project.details.map((p) => `<p>${p}</p>`).join("")}
      ${project.contribution ? `<p class="entry__contribution"><span>My part</span> ${project.contribution}</p>` : ""}
      ${Readouts(project)}
    </div>
  `;
}

export function ProjectFlagship(project) {
  const serial = [project.serial, project.year].filter(Boolean).join(" · ");

  return `
    <article class="plate plate--flagship plate--${project.accent} entry entry--flagship"
             id="${project.id}" aria-labelledby="entry-${project.id}-title">
      <header class="plate__head">
        <span class="plate__serial">${serial}</span>
        ${MotionMark(project.accent)}
      </header>
      <div class="entry__grid">${Body(project)}</div>
    </article>
  `;
}

export function ProjectSupporting(project) {
  return `
    <article class="entry entry--supporting" id="${project.id}" aria-labelledby="entry-${project.id}-title">
      <span class="plate__serial entry__serial">${project.serial}</span>
      <div class="entry__grid">${Body(project)}</div>
    </article>
  `;
}
