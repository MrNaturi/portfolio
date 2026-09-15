import { render, renderShell } from "./shell.js";
import { WritingHeader, WritingLists, initSeries } from "../components/writing/WritingIndex.js";
import { initWritingFilter } from "../components/writing/WritingFilter.js";

renderShell();

render({
  "writing-header-root": WritingHeader,
  "writing-root": WritingLists,
});

initSeries();
initWritingFilter();
