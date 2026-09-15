import { essays, allPosts } from "../../data/posts.js";

// All / Essays / Technical. The choice lives in the URL (?type=technical)
// so a filtered view can be linked to directly, e.g. from a CV.

const OPTIONS = [
  { value: "all", label: "All", count: allPosts.length },
  { value: "essays", label: "Essays", count: essays.length, section: "essays" },
  { value: "technical", label: "Technical", count: allPosts.length - essays.length, section: "technical" },
];

export function WritingFilter() {
  return `
    <div class="writing-filter" role="group" aria-label="Show writing">
      ${OPTIONS.map(
        (o) => `
        <button class="writing-filter__option" type="button" data-value="${o.value}" aria-pressed="false">
          ${o.label}<span class="writing-filter__count">${o.count}</span>
        </button>`
      ).join("")}
    </div>
  `;
}

export function initWritingFilter() {
  const root = document.querySelector("[data-filter-root]");
  if (!root) return;
  root.innerHTML = WritingFilter();

  const buttons = [...root.querySelectorAll(".writing-filter__option")];
  const sections = {
    essays: document.getElementById("essays"),
    technical: document.getElementById("technical"),
  };

  function apply(value, { updateUrl = true } = {}) {
    const option = OPTIONS.find((o) => o.value === value) ?? OPTIONS[0];

    for (const button of buttons) {
      button.setAttribute("aria-pressed", String(button.dataset.value === option.value));
    }
    for (const [name, section] of Object.entries(sections)) {
      section.hidden = option.section ? option.section !== name : false;
    }

    if (updateUrl) {
      const url = new URL(location.href);
      if (option.value === "all") url.searchParams.delete("type");
      else url.searchParams.set("type", option.value);
      history.replaceState(null, "", url);
    }
  }

  for (const button of buttons) {
    button.addEventListener("click", () => apply(button.dataset.value));
  }

  apply(new URLSearchParams(location.search).get("type") ?? "all", { updateUrl: false });
}
