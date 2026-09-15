import { flagships, supporting } from "../data/projects.js";
import { MotionMark } from "./MotionMark.js";

function LinkList(links, className) {
  if (!links.length) return "";
  return `
    <ul class="${className}">
      ${links
        .map((link) => {
          // Only external links get a hostname note; relative ones like
          // /projects/triagerl would throw in new URL()
          const external = /^https?:\/\//.test(link.href);
          const note = external ? `<span class="visually-hidden"> (opens ${new URL(link.href).hostname})</span>` : "";
          return `<li><a href="${link.href}"${external ? ' rel="noopener"' : ""}>${link.label}${note}</a></li>`;
        })
        .join("")}
    </ul>
  `;
}

function PlateFlagship(project) {
  const meta = [project.serial, project.year, project.status].filter(Boolean).join(" · ");

  return `
    <article class="plate plate--flagship plate--${project.accent}" aria-labelledby="plate-${project.id}">
      <header class="plate__head">
        <span class="plate__serial">${meta}</span>
        ${MotionMark(project.accent)}
      </header>

      <h3 class="plate__name" id="plate-${project.id}"><a class="plate__name-link" href="${project.caseStudy ?? `/projects#${project.id}`}">${project.name}</a></h3>
      <p class="plate__pitch">${project.pitch}</p>
      <p class="plate__description">${project.description}</p>

      ${
        project.results?.length
          ? `
        <dl class="plate__readouts">
          ${project.results
            .map(
              (r) => `
            <div class="plate__readout">
              <dt>${r.label}</dt>
              <dd>${r.value}</dd>
            </div>`
            )
            .join("")}
        </dl>
        ${project.resultsNote ? `<p class="plate__readout-note">${project.resultsNote}</p>` : ""}
      `
          : ""
      }

      <footer class="plate__foot">
        <p class="plate__stack"><span class="visually-hidden">Stack: </span>${project.stack.join(" · ")}</p>
        ${LinkList(project.links, "plate__links")}
      </footer>
    </article>
  `;
}

function PlateSupporting(project) {
  const meta = [project.category, project.year].filter(Boolean).join(" · ");

  return `
    <article class="plate plate--supporting" aria-labelledby="plate-${project.id}">
      <span class="plate__serial">${project.serial}</span>
      <h3 class="plate__name" id="plate-${project.id}"><a class="plate__name-link" href="${project.caseStudy ?? `/projects#${project.id}`}">${project.name}</a></h3>
      <p class="plate__meta">${meta}</p>
      <p class="plate__pitch">${project.pitch}</p>
      <p class="plate__stack"><span class="visually-hidden">Stack: </span>${project.stack.join(" · ")}</p>
      ${LinkList(project.links, "plate__links")}
    </article>
  `;
}

export function SelectedWork() {
  return `
    <section class="section selected-work" aria-labelledby="selected-work-title">
      <header class="section__head">
        <span class="section__index" aria-hidden="true">02</span>
        <h2 class="section__title" id="selected-work-title">Selected work</h2>
      </header>

      <div class="selected-work__flagships">
        ${flagships.map(PlateFlagship).join("")}
      </div>

      <div class="selected-work__supporting">
        ${supporting.map(PlateSupporting).join("")}
      </div>

      <a class="selected-work__all" href="/projects">All projects</a>
    </section>
  `;
}
