import * as data from "../../data/triagerl.js";
import { MotionMark } from "../MotionMark.js";
import { LiveConsole } from "./LiveConsole.js";

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
        <li><a class="case-button case-button--primary" href="#live">Try the live system</a></li>
        <li><a class="case-button" href="${data.links.demo}" rel="noopener">Watch the demo<span class="visually-hidden"> (Google Drive)</span></a></li>
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

// ---- Architecture ----
// Drawn as inline SVG so it inherits the page's type and colour tokens.
// Two layouts: wide (left to right) and narrow (top to bottom), because a
// scaled-down wide diagram is unreadable on a phone.

function node(x, y, w, h, title, sub, accent = false) {
  return `
    <g class="arch__node${accent ? " arch__node--accent" : ""}">
      <rect x="${x}" y="${y}" width="${w}" height="${h}" />
      <text class="arch__title" x="${x + 16}" y="${y + 30}">${title}</text>
      <text class="arch__sub" x="${x + 16}" y="${y + 52}">${sub}</text>
    </g>
  `;
}

function arrow(id, x1, y1, x2, y2, label, lx, ly, anchor = "middle") {
  return `
    <g class="arch__edge">
      <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" marker-end="url(#${id})" />
      ${label ? `<text class="arch__label" x="${lx}" y="${ly}" text-anchor="${anchor}">${label}</text>` : ""}
    </g>
  `;
}

// Each diagram needs its own marker id: only one of the two is displayed,
// and a marker defined inside a display:none SVG doesn't render elsewhere.
const defs = (id) => `
  <defs>
    <marker id="${id}" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
      <path d="M0,0 L8,4 L0,8" fill="none" />
    </marker>
  </defs>
`;

function DiagramWide() {
  return `
    <svg class="arch arch--wide" viewBox="0 0 780 290" role="img" aria-labelledby="arch-desc">
      ${defs("arch-head-wide")}
      ${node(10, 40, 200, 76, "React dashboard", "Vite SPA")}
      ${node(290, 40, 200, 76, "FastAPI backend", "+ SQLite")}
      ${node(570, 40, 200, 76, "MaskablePPO agent", "Stable-Baselines3", true)}
      ${node(570, 200, 200, 76, "ED simulation", "Gymnasium")}
      ${arrow("arch-head-wide", 212, 68, 286, 68, "REST", 249, 58)}
      ${arrow("arch-head-wide", 288, 90, 214, 90, "", 0, 0)}
      ${arrow("arch-head-wide", 492, 68, 566, 68, "predict", 529, 58)}
      ${arrow("arch-head-wide", 568, 90, 494, 90, "", 0, 0)}
      ${arrow("arch-head-wide", 670, 198, 670, 120, "trained in", 682, 164, "start")}
    </svg>
  `;
}

function DiagramNarrow() {
  return `
    <svg class="arch arch--narrow" viewBox="0 0 320 520" role="img" aria-labelledby="arch-desc">
      ${defs("arch-head-narrow")}
      ${node(20, 10, 280, 76, "React dashboard", "Vite SPA")}
      ${node(20, 150, 280, 76, "FastAPI backend", "+ SQLite")}
      ${node(20, 290, 280, 76, "MaskablePPO agent", "Stable-Baselines3", true)}
      ${node(20, 430, 280, 76, "ED simulation", "Gymnasium")}
      ${arrow("arch-head-narrow", 140, 88, 140, 146, "REST", 196, 122, "start")}
      ${arrow("arch-head-narrow", 180, 148, 180, 90, "", 0, 0)}
      ${arrow("arch-head-narrow", 140, 228, 140, 286, "predict", 196, 262, "start")}
      ${arrow("arch-head-narrow", 180, 288, 180, 230, "", 0, 0)}
      ${arrow("arch-head-narrow", 160, 428, 160, 370, "trained in", 172, 404, "start")}
    </svg>
  `;
}

export function CaseArchitecture() {
  return `
    <section class="section case-arch" aria-labelledby="arch-title">
      ${sectionHead("How it works", "arch-title")}
      <figure class="case-arch__figure">
        ${DiagramWide()}
        ${DiagramNarrow()}
        <figcaption id="arch-desc" class="case-note">
          The React dashboard talks to a FastAPI backend over REST. The backend
          stores patients in SQLite and asks the MaskablePPO agent who to treat
          next; the agent was trained in a Gymnasium simulation of the emergency
          department, with a rule-based fallback if no model is available.
        </figcaption>
      </figure>

      <dl class="case-arch__parts">
        ${data.architecture
          .map(
            (part) => `
          <div class="case-arch__part">
            <dt>
              <span class="case-arch__name">${part.name}</span>
              <code>${part.file}</code>
            </dt>
            <dd>${part.text}</dd>
          </div>`
          )
          .join("")}
      </dl>
    </section>
  `;
}

export function CaseLive() {
  return `
    <section class="section case-live" id="live" aria-labelledby="live-title">
      ${sectionHead("Try it", "live-title")}
      <p class="case-lede">
        The deployed system, running here. Turn on <strong>Demo mode</strong> on the
        queue board to stream synthetic arrivals and watch the agent prioritize, or
        register a patient and ask <strong>Who's next?</strong>
      </p>
      ${LiveConsole({
        url: data.links.live,
        title: "TriageRL live dashboard",
        host: new URL(data.links.live).host,
        note: "Hosted on a free tier that sleeps when idle, so the first load can take about a minute.",
      })}
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

export function CaseEngineering() {
  const { testing, performance } = data;
  return `
    <section class="section case-eng" aria-labelledby="eng-title">
      ${sectionHead("Engineering", "eng-title")}

      <div class="case-eng__tests">
        <p class="case-eng__headline">
          <span class="case-eng__count">41</span>
          <span>tests, four strategies, passing on a Windows laptop, Colab Linux and a container</span>
        </p>
        <ul class="case-eng__strategies">
          ${testing.strategies
            .map(
              (t) => `
            <li>
              <h3>${t.name}</h3>
              <code>${t.where}</code>
              <p>${t.covers}</p>
            </li>`
            )
            .join("")}
        </ul>
      </div>

      <h3 class="case-eng__subhead" id="perf-caption">Performance across environments</h3>
      <div class="case-table-wrap" tabindex="0" role="region" aria-labelledby="perf-caption">
        <table class="case-table case-table--perf">
          <thead>
            <tr>
              <th scope="col">Environment</th>
              <th scope="col">Simulation <span class="case-table__unit">steps/s</span></th>
              <th scope="col">Inference <span class="case-table__unit">mean ms</span></th>
              <th scope="col">API /prioritize <span class="case-table__unit">ms</span></th>
            </tr>
          </thead>
          <tbody>
            ${performance
              .map(
                (row) => `
              <tr>
                <th scope="row">${row.env}</th>
                <td data-label="Simulation, steps/s">${row.sim}</td>
                <td data-label="Inference, mean ms">${row.inference}</td>
                <td data-label="API /prioritize, ms">${row.api}</td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div>
      <p class="case-note">Measured with <code>scripts/benchmark.py</code>. The Render deployment was verified live through its <code>/docs</code> endpoint.</p>
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
