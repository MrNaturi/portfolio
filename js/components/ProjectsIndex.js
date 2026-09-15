import { flagships, supporting } from "../data/projects.js";
import { ProjectFlagship, ProjectSupporting } from "./ProjectEntry.js";

export function ProjectsHeader() {
  const all = [...flagships, ...supporting];
  return `
    <header class="section projects-header">
      <p class="projects-header__eyebrow">Plates I–${all.at(-1).serial.replace("Plate ", "")}</p>
      <h1 class="projects-header__title">Projects</h1>
      <p class="projects-header__intro">
        Two flagship projects in machine learning and speech technology, and the
        smaller builds around them.
      </p>

      <nav class="projects-header__index" aria-label="Projects on this page">
        <ol>
          ${all
            .map(
              (p) => `
            <li>
              <a href="#${p.id}">
                <span class="projects-header__serial">${p.serial.replace("Plate ", "")}</span>
                ${p.name}
              </a>
            </li>`
            )
            .join("")}
        </ol>
      </nav>
    </header>
  `;
}

export function ProjectsList() {
  return `
    <section class="section projects-group" aria-labelledby="flagships-title">
      <header class="section__head">
        <span class="section__index" aria-hidden="true">01</span>
        <h2 class="section__title" id="flagships-title">Flagships</h2>
      </header>
      <div class="projects-group__list projects-group__list--flagship">
        ${flagships.map(ProjectFlagship).join("")}
      </div>
    </section>

    <section class="section projects-group" aria-labelledby="supporting-title">
      <header class="section__head">
        <span class="section__index" aria-hidden="true">02</span>
        <h2 class="section__title" id="supporting-title">Also built</h2>
      </header>
      <div class="projects-group__list">
        ${supporting.map(ProjectSupporting).join("")}
      </div>
    </section>
  `;
}
