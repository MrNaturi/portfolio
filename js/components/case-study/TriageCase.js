import * as data from "../../data/triagerl.js";
import { MotionMark } from "../MotionMark.js";

// Section numbers are filled in by the page script in document order, so
// sections can be added or reordered without renumbering by hand.
export const sectionHead = (title, id) => `
  <header class="section__head">
    <span class="section__index" aria-hidden="true"></span>
    <h2 class="section__title" id="${id}">${title}</h2>
  </header>
`;

export function CaseHero() {
  return `
    <header class="section case-hero">
      <nav class="case-hero__crumbs" aria-label="Breadcrumb">
        <a href="/projects">Projects</a>
        <span aria-hidden="true">/</span>
        <span aria-current="page">TriageRL</span>
      </nav>

      <div class="case-hero__title-row">
        <p class="case-hero__serial">Plate I · 2026 · Completed</p>
        ${MotionMark("ember")}
      </div>
      <h1 class="case-hero__title">TriageRL</h1>
      <p class="case-hero__subtitle">Reinforcement learning for emergency department triage.</p>
      <p class="case-hero__summary">${data.summary}</p>

      <ul class="case-hero__actions">
        <li><a class="case-button case-button--primary" href="${data.links.demo}" rel="noopener">Watch the demo<span class="visually-hidden"> (Google Drive)</span></a></li>
        <li><a class="case-button" href="${data.links.github}" rel="noopener">Source on GitHub</a></li>
      </ul>

      <dl class="case-hero__target">
        <div>
          <dt>${data.target.label}, delivered</dt>
          <dd class="case-hero__target-value">${data.target.achieved}</dd>
        </div>
        <div>
          <dt>proposal target</dt>
          <dd>${data.target.proposed}</dd>
        </div>
      </dl>
    </header>
  `;
}

export function CaseResults() {
  return `
    <section class="section case-results" aria-labelledby="results-title">
      ${sectionHead("Results", "results-title")}
      <p class="case-lede">
        Evaluated over 30 paired episodes, each policy facing the identical stream of
        patient arrivals, with Wilcoxon signed-rank tests in the deterioration-enabled
        environment.
      </p>

      <div class="case-table-wrap" tabindex="0" role="region" aria-labelledby="results-caption">
        <table class="case-table">
          <caption id="results-caption" class="visually-hidden">TriageRL against severity-rule triage</caption>
          <thead>
            <tr>
              <th scope="col">Metric</th>
              <th scope="col">Severity rule</th>
              <th scope="col">TriageRL</th>
              <th scope="col">Change</th>
              <th scope="col">p-value</th>
            </tr>
          </thead>
          <tbody>
            ${data.results
              .map(
                (r) => `
              <tr class="${r.significant ? "is-significant" : "is-not-significant"}">
                <th scope="row">${r.metric}</th>
                <td data-label="Severity rule">${r.rule}</td>
                <td data-label="TriageRL">${r.agent}</td>
                <td data-label="Change" class="case-table__change">${r.change}</td>
                <td data-label="p-value" class="case-table__p">${r.p}${r.significant ? "" : '<span class="visually-hidden"> (not significant)</span>'}</td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div>
      <p class="case-note"><span class="case-key" aria-hidden="true"></span> Significant at p &lt; 0.05. ${data.resultsNote}</p>
    </section>
  `;
}

export function CaseFindings() {
  return `
    <section class="section case-findings" aria-labelledby="findings-title">
      ${sectionHead("What I learned", "findings-title")}
      <ol class="case-findings__list">
        ${data.findings
          .map(
            (f, i) => `
          <li class="case-findings__item">
            <span class="case-findings__n" aria-hidden="true">${["i", "ii", "iii"][i]}</span>
            <h3>${f.title}</h3>
            <p>${f.text}</p>
          </li>`
          )
          .join("")}
      </ol>
    </section>
  `;
}

export function CaseNext() {
  return `
    <section class="section case-next" aria-labelledby="next-title">
      ${sectionHead("Where it could go", "next-title")}
      <ul class="case-next__list">
        ${data.futureWork.map((item) => `<li>${item}</li>`).join("")}
      </ul>
      <p class="case-disclaimer">${data.disclaimer}</p>
      <a class="case-back" href="/projects">All projects</a>
    </section>
  `;
}
