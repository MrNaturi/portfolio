import { render, renderShell } from "./shell.js";
import { WritingHeader, WritingLists, initSeries } from "../components/writing/WritingIndex.js";

renderShell();

render({
  "writing-header-root": WritingHeader,
  "writing-root": WritingLists,
});

initSeries();
