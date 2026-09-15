import { render, renderShell } from "./shell.js";
import { ResumeIntro, ResumeBody } from "../components/resume/ResumePage.js";
import { initSectionRail } from "../components/resume/SectionRail.js";

renderShell();

render({
  "resume-intro-root": ResumeIntro,
  "resume-body-root": ResumeBody,
});

// Number the sections in the order they appear
document.querySelectorAll("main .section__index").forEach((el, i) => {
  el.textContent = String(i + 1).padStart(2, "0");
});

initSectionRail();
