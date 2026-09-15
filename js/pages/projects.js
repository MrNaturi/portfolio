import { render, renderShell } from "./shell.js";
import { ProjectsHeader, ProjectsList } from "../components/ProjectsIndex.js";
import { initMotionMarks } from "../components/MotionMark.js";

renderShell();

render({
  "projects-header-root": ProjectsHeader,
  "projects-root": ProjectsList,
});

initMotionMarks();

// Content is rendered by script, so the browser's own jump to #fragment
// happened before the target existed — repeat it once the entries are in.
if (location.hash) {
  document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
}
