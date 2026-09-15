// An embedded window onto a live deployment. The iframe is created only
// when the visitor asks for it: the app runs on a free tier that sleeps,
// so loading it with the page would add a minute of waking up for
// everyone, including people who never use it.

const SLOW_AFTER = 15000; // ms before offering the new-tab route more loudly

export function LiveConsole({ url, title, host, note }) {
  return `
    <div class="live-console" data-src="${url}" data-title="${title}">
      <div class="live-console__bar">
        <span class="live-console__lights" aria-hidden="true"><i></i><i></i><i></i></span>
        <span class="live-console__host">${host}</span>
        <span class="live-console__status" role="status">Not loaded</span>
        <a class="live-console__newtab" href="${url}" rel="noopener">Open in new tab</a>
      </div>

      <div class="live-console__screen">
        <div class="live-console__idle">
          <p class="live-console__prompt">${note}</p>
          <button class="case-button case-button--primary live-console__launch" type="button">
            Launch here
          </button>
          <p class="live-console__narrow">
            The dashboard needs a wider screen.
            <a href="${url}" rel="noopener">Open it in a new tab</a> instead.
          </p>
        </div>
      </div>
    </div>
  `;
}

export function initLiveConsole() {
  for (const root of document.querySelectorAll(".live-console")) {
    const launch = root.querySelector(".live-console__launch");
    const screen = root.querySelector(".live-console__screen");
    const status = root.querySelector(".live-console__status");

    launch.addEventListener("click", () => {
      const frame = document.createElement("iframe");
      frame.className = "live-console__frame";
      frame.src = root.dataset.src;
      frame.title = root.dataset.title;
      frame.loading = "eager";
      frame.referrerPolicy = "strict-origin-when-cross-origin";
      // Allow what the dashboard needs to run; no top-level navigation
      frame.sandbox = "allow-scripts allow-same-origin allow-forms allow-popups";

      root.classList.add("is-loading");
      status.textContent = "Waking the server…";

      const slow = setTimeout(() => {
        if (root.classList.contains("is-loading")) {
          status.textContent = "Still waking. Free servers can take a minute";
          root.classList.add("is-slow");
        }
      }, SLOW_AFTER);

      frame.addEventListener("load", () => {
        clearTimeout(slow);
        root.classList.remove("is-loading", "is-slow");
        root.classList.add("is-live");
        status.textContent = "Live";
      });

      screen.replaceChildren(frame);
      frame.focus({ preventScroll: true });
    });
  }
}
