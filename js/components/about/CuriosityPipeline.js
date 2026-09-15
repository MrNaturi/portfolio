import { pipeline } from "../../data/about.js";

// A tiny, made-up "curiosity" pipeline set into the story. Pressing run
// ticks through a few log lines, then its output types the pull quote out
// letter by letter, as if the machine built it. The quote is on the page
// the whole time; this only replays it being made.

const LINE_DELAY = 420; // ms between log lines
const CHAR_DELAY = 26;  // ms per typed character
const LEADER = 24;      // width the dotted leaders fill to

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function initCuriosityPipeline() {
  const phrase = document.querySelector(".about-pipeline-phrase");
  const log = document.querySelector("[data-log]");
  const quote = document.querySelector("[data-quote] p");
  if (!phrase || !log || !quote) return;

  const fullQuote = quote.textContent;
  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

  const button = document.createElement("button");
  button.type = "button";
  button.className = "about-run";
  button.innerHTML = `<span aria-hidden="true">▶</span> run`;
  button.setAttribute("aria-label", "Run the curiosity pipeline");
  phrase.after(button);

  let running = false;

  const addLine = (html, className = "") => {
    const line = document.createElement("div");
    line.className = `about-log__line ${className}`;
    line.innerHTML = html;
    log.append(line);
    return line;
  };

  async function run() {
    if (running) return;
    running = true;
    button.disabled = true;
    const instant = reduced();

    log.replaceChildren();
    log.hidden = false;
    log.setAttribute("aria-busy", "true");

    addLine(`<span class="about-log__prompt">$</span> run curiosity`);
    for (const { step, result } of pipeline) {
      if (!instant) await wait(LINE_DELAY);
      const dots = ".".repeat(Math.max(3, LEADER - step.length));
      addLine(`${step} <span class="about-log__dots">${dots}</span> ${result}`);
    }

    if (!instant) {
      await wait(LINE_DELAY);
      // Hold the quote's full height so the text below doesn't jump as
      // lines fill in, then type it into a visual layer; the full sentence
      // stays available to screen readers throughout
      quote.style.minHeight = `${quote.offsetHeight}px`;
      quote.innerHTML = `<span class="visually-hidden">${fullQuote}</span><span class="about-quote__typed" aria-hidden="true"></span><span class="about-quote__caret" aria-hidden="true"></span>`;
      const typed = quote.querySelector(".about-quote__typed");
      for (let i = 1; i <= fullQuote.length; i++) {
        typed.textContent = fullQuote.slice(0, i);
        await wait(fullQuote[i - 1] === "," ? CHAR_DELAY * 8 : CHAR_DELAY);
      }
      await wait(300);
      quote.textContent = fullQuote;
      quote.style.minHeight = "";
    }

    addLine("done in 0.42s · no input needed", "about-log__line--done");
    log.setAttribute("aria-busy", "false");
    button.innerHTML = `<span aria-hidden="true">↻</span> run again`;
    button.disabled = false;
    running = false;
  }

  button.addEventListener("click", run);
}
