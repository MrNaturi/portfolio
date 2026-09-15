import { render, renderShell } from "./shell.js";
import { initMotionMarks } from "../components/MotionMark.js";
import { initLiveConsole } from "../components/case-study/LiveConsole.js";
import { CaseHero, CaseResults, CaseArchitecture, CaseLive, CaseFindings, CaseNext } from "../components/case-study/TriageCase.js";

renderShell();

render({
  "case-hero-root": CaseHero,
  "case-results-root": CaseResults,
  "case-arch-root": CaseArchitecture,
  "case-live-root": CaseLive,
  "case-findings-root": CaseFindings,
  "case-next-root": CaseNext,
});

// Number the sections in the order they appear
document.querySelectorAll("main .section__index").forEach((el, i) => {
  el.textContent = String(i + 1).padStart(2, "0");
});

initMotionMarks();
initLiveConsole();

if (location.hash) {
  document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
}
