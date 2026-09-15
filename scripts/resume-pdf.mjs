// Regenerate assets/resume/Emmanuel-Dania-Resume.pdf from the print layout,
// so the download always matches /resume. Run after changing js/data/resume.js:
//
//   npx serve -l 4173 .                      (in one terminal)
//   npm i --no-save playwright
//   npx playwright install chromium
//   node scripts/resume-pdf.mjs              (in another)
//
// Set RESUME_URL to render from somewhere else, e.g. a Vercel preview.

import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const url = process.env.RESUME_URL ?? "http://localhost:4173/resume";
// fileURLToPath keeps Windows paths valid (URL.pathname would give "/C:/...")
const out = fileURLToPath(new URL("../assets/resume/Emmanuel-Dania-Resume.pdf", import.meta.url));

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(url, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);

await page.pdf({ path: out, preferCSSPageSize: true, printBackground: true });
await browser.close();

console.log(`Wrote ${out}`);
