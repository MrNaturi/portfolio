import { render, renderShell } from "./shell.js";
import { Reader, initReader } from "../components/writing/Reader.js";

const id = new URLSearchParams(location.search).get("post");

renderShell();
render({ "reader-root": () => Reader(id) });
initReader(id);
