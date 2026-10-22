"use strict";
// Browser translation of citrineio/dukkan qml/Main.qml and its components.
// The screen hierarchy and action routing follow QML; catalog/jobs are fixtures.
window.createDukkanPreview = function createDukkanPreview(options) {
  const root = options.root;
  // Keep HTML templates readable with editor/formatter support for the html tag.
  const html = (parts, ...values) =>
    parts.reduce((result, part, index) => result + part + (values[index] ?? ""), "");
  const escape = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
    );
  const catalog = [
    {
      id: "ember",
      name: "Ember Trail",
      genre: "Platformer",
      art: "ember.svg",
      size: "48 MB",
      summary: "Follow a little spark through a world waking up.",
      description:
        "Explore quiet ruins, cross floating platforms and follow the embers home. This fictional title demonstrates Dukkan's native-game workflow. Browser installs, sizes and availability are sample data.",
      screenshots: ["ember-1.svg", "ember-2.svg", "ember-3.svg"],
    },
    {
      id: "sprout",
      name: "Moss Postcard",
      genre: "Adventure",
      art: "garden.svg",
      size: "32 MB",
      summary: "Grow a green path through a forgotten world.",
      description:
        "A fictional catalog entry for browsing, searching and testing the sample install queue. No package is downloaded.",
      screenshots: [],
    },
    {
      id: "nova",
      name: "Signal Lantern",
      genre: "Arcade",
      art: "orbital.svg",
      size: "64 MB",
      summary: "A little ship. An enormous sky.",
      description:
        "A fictional native-game fixture. Installation and removal update the sample Zaman library while preserving simulated saves.",
      screenshots: [],
    },
    {
      id: "tide",
      name: "Tidal Parcel",
      genre: "Exploration",
      art: "current.svg",
      size: "24 MB",
      summary: "Find a way back to the coast.",
      description:
        "A fictional catalog entry. The actual Dukkan catalog is curated and checks package availability for ARM64.",
      screenshots: [],
    },
  ];
  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem("zaman-dukkan-preview-v1")) || {};
  } catch {
    /* Storage is optional. */
  }
  const installed = new Set(
    (options.installed || []).filter((id) => catalog.some((game) => game.id === id)),
  );
  const jobs = Array.isArray(saved.jobs)
    ? saved.jobs
        .filter(
          (job) =>
            job &&
            typeof job === "object" &&
            /^demo-\d+-\d+$/.test(job.id) &&
            typeof job.name === "string" &&
            typeof job.stage === "string" &&
            Number.isFinite(job.percent) &&
            job.percent >= 0 &&
            job.percent <= 100 &&
            catalog.some((game) => game.id === job.app) &&
            ["install", "remove"].includes(job.operation) &&
            [
              "queued",
              "running",
              "cancelling",
              "succeeded",
              "cancelled",
              "interrupted",
              "failed",
            ].includes(job.phase),
        )
        .slice(-30)
    : [];
  // Simulated jobs reconnect after closing the storefront. On a page reload,
  // unfinished work is explicitly interrupted rather than pretending native durability.
  jobs.forEach((job) => {
    if (["queued", "running", "cancelling"].includes(job.phase)) {
      job.phase = "interrupted";
      job.stage = "Browser preview reloaded · retry to continue";
    }
  });
  const state = {
    open: false,
    section: "Discover",
    index: 0,
    area: "catalog",
    nav: 0,
    details: false,
    gallery: false,
    image: 0,
    activity: false,
    job: "",
    keyboard: false,
    keyboardView: 0,
    keyRow: 0,
    keyColumn: 0,
    query: "",
    modal: null,
    choice: 0,
    detailAction: 0,
  };
  const terminal = (job) => ["succeeded", "failed", "cancelled", "interrupted"].includes(job.phase);
  const visibleGames = () =>
    catalog.filter(
      (game) =>
        (state.section !== "Library" || installed.has(game.id)) &&
        `${game.name} ${game.genre} ${game.id}`
          .toLowerCase()
          .includes(state.query.trim().toLowerCase()),
    );
  const selectedGame = () => {
    const games = visibleGames();
    state.index = Math.max(0, Math.min(state.index, games.length - 1));
    return games[state.index] || null;
  };
  const selectedJob = () => jobs.find((job) => job.id === state.job) || jobs.at(-1);
  const pending = (id) => jobs.find((job) => job.app === id && !terminal(job));
  const activeJob = () => jobs.find((job) => job.phase === "running" || job.phase === "cancelling");
  const button = (label, action, extra = "", cls = "") => html`
    <button class="dk-button ${cls}" data-dk="${action}" ${extra}>${label}</button>
  `;
  const hint = (key, label, action) => html`
    <button class="dk-hint" data-dk="${action}">
      <kbd>${key}</kbd>
      ${label}
    </button>
  `;
  function store() {
    try {
      localStorage.setItem("zaman-dukkan-preview-v1", JSON.stringify({ jobs }));
    } catch {
      /* Optional persistence. */
    }
  }
  function changed() {
    options.onChange?.({
      installed: [...installed],
      games: catalog.filter((game) => installed.has(game.id)),
      busy: jobs.some((job) => !terminal(job)),
      jobs,
    });
    store();
  }
  function art(game, cls = "") {
    return html`
      <div class="dk-art ${cls}">
        <img src="assets/demo/${game.art}" alt="${escape(game.name)} fictional sample artwork" />
      </div>
    `;
  }
  function shot(game, image, cls = "") {
    return game.screenshots.length
      ? html`
          <img
            class="dk-shot ${cls}"
            src="assets/demo/${game.screenshots[image]}"
            alt="${escape(game.name)} illustrated sample scene ${image + 1}"
          />
        `
      : '<div class="dk-no-shot">No screenshots available</div>';
  }
  function progress(job, stacked = false) {
    if (!job || terminal(job)) return "";
    return html`
      <section
        class="dk-progress ${stacked ? "stacked" : "dk-home-progress"}"
        aria-label="Transaction progress"
      >
        <div>
          <div class="dk-progress-label">
            <strong>${job.operation === "install" ? "INSTALLING" : "UNINSTALLING"}</strong>
            <span>${escape(job.name)}</span>
            <b data-dk-percent="${job.id}">${job.percent}% · CURRENT STEP</b>
          </div>
          ${
            stacked
              ? html`
                  <p data-dk-stage="${job.id}">${escape(job.stage)}</p>
                `
              : ""
          }
          <progress
            max="100"
            value="${job.percent}"
            data-dk-progress="${job.id}"
            aria-label="${escape(job.name)} current step"
          ></progress>
        </div>
        ${button("X　Stop", "cancel", `data-job="${job.id}"`)}
      </section>
    `;
  }
  function homeMarkup() {
    const game = selectedGame();
    const games = visibleGames();
    return html`
      <header class="dk-header">
        <div class="dk-brand">
          <i></i>
          <div>
            <b>DUKKAN</b>
            <small>THE ZAMAN STORE</small>
          </div>
        </div>
        ${button(`⌕　${escape(state.query || "Search the collection")}`, "search", 'aria-label="Search the collection"', "dk-search")}
        <span class="dk-ready">
          <i></i>
          ${options.controller?.() ? "Controller ready" : "Keyboard ready"}
        </span>
      </header>
      <div class="dk-main">
        <nav class="dk-rail" aria-label="Dukkan sections">
          <small>EXPLORE</small>
          ${["Discover", "Library", "Activity"]
            .map(
              (section, index) => html`
                <button
                  data-dk="section"
                  data-section="${section}"
                  data-nav="${index}"
                  ${state.section === section ? 'aria-current="page"' : ""}
                  class="${state.area === "nav" && state.nav === index ? "dk-chosen" : ""}"
                >
                  <span>${index === 0 ? "◇" : "▦"}</span>
                  ${section}
                </button>
              `,
            )
            .join("")}
          <div class="dk-curated">
            <small>CURATED FOR</small>
            <b>ARM64</b>
            <p>Native games from Flathub.</p>
            <img src="assets/dukkan-shopfront.webp" alt="Dukkan shopfront" />
          </div>
        </nav>
        <div class="dk-content">
          <section class="dk-feature">
            <div class="dk-feature-copy">
              <small>
                ${state.section === "Discover" ? "FEATURED / DISCOVER" : "YOUR LIBRARY / INSTALLED"}
              </small>
              <h1>${game ? escape(game.name) : "Nothing here yet"}</h1>
              <b class="dk-meta">
                ${game ? `${escape(game.genre.toUpperCase())}　·　${installed.has(game.id) ? "INSTALLED" : "FLATHUB"}` : "LIBRARY"}
              </b>
              <p>${game ? escape(game.summary) : "Install a game from Discover to see it here."}</p>
              ${button("VIEW GAME　↗", "details", game ? "" : "disabled", `dk-primary ${state.area === "hero" ? "dk-chosen" : ""}`)}
            </div>
            ${game ? art(game, "dk-feature-art") : '<div class="dk-art dk-feature-art"></div>'}
          </section>
          <div class="dk-shelf-heading">
            <h2>${state.section === "Discover" ? "Made to play" : "Ready to play"}</h2>
            <small>SELECT A GAME TO EXPLORE</small>
          </div>
          <div class="dk-shelf" role="group" aria-label="Dukkan game shelf">
            ${
              games
                .map(
                  (item, index) => html`
                    <button
                      class="dk-tile ${state.area === "catalog" && index === state.index ? "dk-chosen" : ""}"
                      data-dk="game"
                      data-index="${index}"
                      aria-label="${escape(item.name)} — game details"
                    >
                      ${art(item)}
                      <strong>${escape(item.name)}</strong>
                      <span>${escape(item.genre)}</span>
                      <div>
                        <b>${installed.has(item.id) ? "INSTALLED" : "FLATHUB"}</b>
                        ${
                          installed.has(item.id)
                            ? ""
                            : html`
                                <small>↓ ${item.size}</small>
                              `
                        }
                      </div>
                    </button>
                  `,
                )
                .join("") ||
              html`
                <p class="dk-empty">
                  ${state.section === "Library" ? "Your library is empty. Explore and install a game." : "No games match your search."}
                </p>
              `
            }
          </div>
        </div>
      </div>
      ${progress(activeJob())}
      <footer class="dk-footer">
        <small>SIMULATED CATALOG & TRANSACTIONS</small>
        <div>
          ${hint("A", "Details", "details")}${hint("B", "Back / exit", "back")}${hint("Y", "Library", "library")}${hint("START", "Search", "search")}
        </div>
      </footer>
    `;
  }
  function detailsMarkup() {
    const game = selectedGame();
    if (!game) return "";
    const job = pending(game.id);
    return html`
      <section class="dk-details">
        <header>
          <strong>
            DUKKAN
            <span>/ GAME DETAILS</span>
          </strong>
          ${hint("B", "Back to games", "back")}
        </header>
        <div class="dk-detail-grid">
          <div class="dk-gallery-panel">
            ${
              game.screenshots.length
                ? html`
                    <button
                      class="dk-screenshot-button"
                      data-dk="gallery"
                      aria-label="View screenshot fullscreen"
                    >
                      ${shot(game, state.image)}
                    </button>
                    <div class="dk-thumbnails">
                      ${game.screenshots
                        .map(
                          (image, index) => html`
                            <button
                              data-dk="image"
                              data-image="${index}"
                              aria-label="Screenshot ${index + 1}"
                              aria-pressed="${state.image === index}"
                            >
                              ${shot(game, index)}
                            </button>
                          `,
                        )
                        .join("")}
                    </div>
                    <p class="dk-caption">Illustrated sample scene · fictional game</p>
                    <div class="dk-gallery-controls">
                      ${button("L1　Previous", "previousImage")}
                      <span>${state.image + 1} / ${game.screenshots.length}</span>
                      ${button("R1　Next", "nextImage")}
                    </div>
                    ${button("Y　View fullscreen", "gallery")}
                  `
                : shot(game, 0)
            }
          </div>
          <div class="dk-detail-copy">
            <small>GAME / ${escape(game.genre.toUpperCase())}</small>
            <h1>${escape(game.name)}</h1>
            <p class="dk-summary">${escape(game.summary)}</p>
            <div class="dk-badges">
              <b>${installed.has(game.id) ? "INSTALLED" : "FLATHUB"}</b>
              <span>CURATED FALLBACK DATA</span>
            </div>
            ${
              installed.has(game.id)
                ? ""
                : html`
                    <small class="dk-size">APP DOWNLOAD　${game.size}　·　RUNTIMES EXTRA</small>
                  `
            }
            <hr />
            <small>ABOUT THE GAME</small>
            <div class="dk-description" tabindex="0">${escape(game.description)}</div>
            <div class="dk-detail-transaction">
              ${
                job
                  ? progress(job, true)
                  : html`
                      <div class="dk-detail-actions">
                        ${button(installed.has(game.id) ? "PLAY" : "INSTALL FROM FLATHUB", "primary", "", state.detailAction === 0 ? "dk-primary dk-chosen" : "")}${installed.has(game.id) ? button("UNINSTALL", "remove", "", state.detailAction === 1 ? "dk-primary dk-chosen" : "") : ""}
                      </div>
                    `
              }
            </div>
            <p class="dk-instructions">
              ${job ? "X Request stop · Activity shows queue details" : "← / → Action · A Select · B Back"}
              <br />
              ↑ / ↓ Scroll · Y View fullscreen
            </p>
          </div>
        </div>
      </section>
    `;
  }
  function activityMarkup() {
    const job = selectedJob();
    return html`
      <section class="dk-activity">
        <h1>Activity</h1>
        <p>Jobs continue when you return Home or close Dukkan.</p>
        <div class="dk-job-list">
          ${
            jobs
              .slice()
              .reverse()
              .map(
                (item) => html`
                  <button
                    class="dk-job ${job?.id === item.id ? "dk-chosen" : ""}"
                    data-dk="job"
                    data-job="${item.id}"
                  >
                    <strong>
                      ${escape(item.name)} · ${item.operation === "install" ? "Install" : "Remove"}
                      ·
                      <span data-dk-phase="${item.id}">${item.phase}</span>
                    </strong>
                    <span data-dk-job-stage="${item.id}">
                      ${escape(item.stage)} · ${item.percent}%
                    </span>
                  </button>
                `,
              )
              .join("") || '<p class="dk-empty">No transactions yet.</p>'
          }
        </div>
        <p class="dk-job-result">
          ${job ? `Transaction ${escape(job.id)}<br>${escape(job.stage)}` : ""}
        </p>
        <footer>
          ${hint("↑ / ↓", "Select", "noop")}${hint("A", "Game", "jobGame")}${job && !terminal(job) ? hint("X", "Cancel", "cancel") : job && job.phase !== "succeeded" ? hint("Y", "Retry", "retry") : ""}${hint("B", "Back", "back")}
        </footer>
      </section>
    `;
  }
  function galleryMarkup() {
    const game = selectedGame();
    return html`
      <section class="dk-fullscreen">
        <header>
          <h2>${escape(game.name)}</h2>
          ${button("B　Back to details", "back")}
        </header>
        ${shot(game, state.image)}
        <footer>
          ${button("L1　Previous", "previousImage")}
          <p>Illustrated sample scene · fictional game</p>
          <span>${state.image + 1} / ${game.screenshots.length}</span>
          ${button("R1　Next", "nextImage")}
        </footer>
      </section>
    `;
  }
  function modalMarkup() {
    const type = state.modal.type;
    const game = catalog.find((game) => game.id === state.modal.app);
    const copy = {
      install: [
        "Install this game?",
        `Dukkan will install ${game?.name} from Flathub. App download: ${game?.size}. Additional runtimes may require more data.`,
        "Go back",
        "Install game",
      ],
      remove: [
        "Uninstall this game?",
        `Uninstall ${game?.name} from this device? Saved application data will be retained.`,
        "Go back",
        "Uninstall game",
      ],
      cancel: [
        "Stop this download?",
        "Request cancellation of the selected transaction? It may take a moment.",
        "Keep running",
        "Request stop",
      ],
      retry: [
        "Retry this transaction?",
        "A new transaction will verify the current installation before retrying.",
        "Go back",
        "Retry",
      ],
      play: [
        "Browser preview",
        `${game?.name} is a fictional sample. The native OS launches installed games through Sessiond. Return to Zaman's library to play the Dune Runner browser game.`,
        "Back to details",
        "Return to Zaman",
      ],
    }[type];
    return html`
      <div class="dk-overlay">
        <section
          class="dk-confirm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dk-confirm-title"
        >
          <h2 id="dk-confirm-title">${copy[0]}</h2>
          <p>${escape(copy[1])}</p>
          <small>${escape(state.modal.job || `preview.${game?.id || "transaction"}`)}</small>
          <div>
            ${button(copy[2], "confirmNo", "", state.choice === 0 ? "dk-primary dk-chosen" : "")}${button(copy[3], "confirmYes", "", state.choice === 1 ? "dk-primary dk-chosen" : "")}
          </div>
          <small>D-PAD Choose　 A Confirm　 B Go back</small>
        </section>
      </div>
    `;
  }
  function keyRows() {
    if (state.keyboardView === 2)
      return [
        Array.from("!@#$%^&*()"),
        ["-", "_", "=", "+", "[", "]", "{", "}", "\\", "⌫"],
        Array.from(";:'\",.<>/?"),
        ["`", "~", "|", "0", "1", "2", "3", "SPACE", "CLEAR", "DONE"],
      ];
    const letters =
      state.keyboardView === 1
        ? ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"]
        : ["qwertyuiop", "asdfghjkl", "zxcvbnm"];
    return [
      Array.from(letters[0]),
      [...letters[1], "⌫"],
      [...letters[2], "1", "2", "3"],
      ["4", "5", "6", "7", "8", "9", "0", "SPACE", "CLEAR", "DONE"],
    ];
  }
  function keyboardMarkup() {
    return html`
      <div class="dk-overlay dk-keyboard-overlay">
        <section
          class="dk-keyboard"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dk-keyboard-title"
        >
          <header>
            <h2 id="dk-keyboard-title">Search games</h2>
            ${button(`Y　${["lowercase", "UPPERCASE", "symbols"][state.keyboardView]}`, "keyView")}
          </header>
          <output aria-label="Search query">
            ${escape(state.query || "Type with your controller...")}│
          </output>
          <p>${visibleGames().length} games match in the curated collection</p>
          <div class="dk-keys">
            ${keyRows()
              .map(
                (row, r) => html`
                  <div>
                    ${row.map((key, c) => button(escape(key), "key", `data-row="${r}" data-column="${c}" data-key="${escape(key)}"`, r === state.keyRow && c === state.keyColumn ? "dk-primary dk-chosen" : "")).join("")}
                  </div>
                `,
              )
              .join("")}
          </div>
          <footer>D-PAD Move · A Type · Y Change keyboard · X Delete · B / START Done</footer>
          ${button("Done", "searchDone", "", "dk-done")}
        </section>
      </div>
    `;
  }
  function focusTarget() {
    if (state.keyboard)
      return `.dk-keys [data-row="${state.keyRow}"][data-column="${state.keyColumn}"]`;
    if (state.modal) return `[data-dk="${state.choice ? "confirmYes" : "confirmNo"}"]`;
    if (state.activity) return `.dk-job[data-job="${selectedJob()?.id}"]`;
    if (state.gallery) return '.dk-fullscreen [data-dk="back"]';
    if (state.details)
      return pending(selectedGame()?.id)
        ? '.dk-details [data-dk="cancel"]'
        : `.dk-details [data-dk="${state.detailAction ? "remove" : "primary"}"]`;
    if (state.area === "nav") return `[data-nav="${state.nav}"]`;
    if (state.area === "hero") return '.dk-feature [data-dk="details"]';
    return `.dk-tile[data-index="${state.index}"]`;
  }
  let previousSurface = "";
  function render(focus = true) {
    if (!state.open) return;
    const surface = state.keyboard
      ? "keyboard"
      : state.modal
        ? "modal"
        : state.activity
          ? "activity"
          : state.gallery
            ? "gallery"
            : state.details
              ? "details"
              : "home";
    const revealTop =
      surface !== previousSurface && ["details", "gallery", "activity"].includes(surface);
    previousSurface = surface;
    const hadFocus = root.contains(document.activeElement);
    root.innerHTML =
      homeMarkup() +
      (state.details ? detailsMarkup() : "") +
      (state.gallery ? galleryMarkup() : "") +
      (state.activity ? activityMarkup() : "") +
      (state.modal ? modalMarkup() : "") +
      (state.keyboard ? keyboardMarkup() : "");
    const underlying = root.querySelectorAll(
      ".dk-header,.dk-main,.dk-footer,.dk-progress,.dk-details,.dk-fullscreen,.dk-activity",
    );
    if (state.keyboard || state.modal)
      underlying.forEach((element) => {
        element.inert = true;
      });
    else {
      if (state.details || state.activity || state.gallery)
        root
          .querySelectorAll(".dk-header,.dk-main,.dk-footer, .dk-home-progress")
          .forEach((element) => {
            element.inert = true;
          });
      if (state.gallery || state.activity)
        root.querySelector(".dk-details")?.setAttribute("inert", "");
    }
    if (revealTop && matchMedia("(max-width: 650px)").matches)
      root.scrollIntoView({ block: "start", behavior: "instant" });
    if ((focus || hadFocus) && !root.inert) {
      const target = root.querySelector(focusTarget());
      (
        target ||
        root.querySelector('[data-dk="back"]') ||
        root.querySelector('[data-dk="search"]')
      )?.focus({ preventScroll: true });
      if (state.area === "catalog" && !state.details && !state.activity && !state.keyboard)
        root
          .querySelector(".dk-tile.dk-chosen")
          ?.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }
  function section(name) {
    if (name === "Activity") {
      state.activity = true;
      state.job = jobs.at(-1)?.id || "";
      return;
    }
    state.section = name;
    state.nav = name === "Discover" ? 0 : 1;
    state.index = 0;
    state.query = "";
    state.details = false;
    state.gallery = false;
    state.area = "catalog";
  }
  function openDetails() {
    if (!selectedGame()) return;
    state.details = true;
    state.image = 0;
    state.gallery = false;
    state.detailAction = 0;
  }
  function request(type, jobId) {
    const game = selectedGame();
    const job =
      jobs.find((item) => item.id === jobId) ||
      (state.activity ? selectedJob() : pending(game?.id));
    if (["install", "remove", "play"].includes(type) && (!game || pending(game.id))) return;
    if (["cancel", "retry"].includes(type) && !job) return;
    state.modal = { type, app: game?.id, job: job?.id };
    state.choice = 0;
  }
  function enqueue(app, operation) {
    if (pending(app)) return;
    const game = catalog.find((item) => item.id === app);
    const job = {
      id: `demo-${Date.now()}-${jobs.length + 1}`,
      app,
      name: game.name,
      operation,
      phase: "queued",
      percent: 0,
      stage: "Waiting for another transaction",
    };
    jobs.push(job);
    state.job = job.id;
    changed();
    tick();
  }
  function keyActivate(key) {
    if (key === "DONE") {
      state.keyboard = false;
      return;
    }
    if (key === "CLEAR") state.query = "";
    else if (key === "⌫") state.query = state.query.slice(0, -1);
    else state.query += key === "SPACE" ? " " : key;
    state.index = 0;
  }
  function handle(action, data = {}) {
    if (!state.open || root.inert) return;
    if (action === "noop") return;
    if (action === "keyView") {
      state.keyboardView = (state.keyboardView + 1) % 3;
      render();
      return;
    }
    if (action === "searchDone") {
      state.keyboard = false;
      render();
      return;
    }
    if (state.keyboard) {
      if (action === "key") {
        state.keyRow = Number(data.row);
        state.keyColumn = Number(data.column);
        keyActivate(data.key);
      } else if (action === "left") state.keyColumn = Math.max(0, state.keyColumn - 1);
      else if (action === "right")
        state.keyColumn = Math.min(keyRows()[state.keyRow].length - 1, state.keyColumn + 1);
      else if (action === "up") state.keyRow = Math.max(0, state.keyRow - 1);
      else if (action === "down") state.keyRow = Math.min(3, state.keyRow + 1);
      else if (action === "select") keyActivate(keyRows()[state.keyRow][state.keyColumn]);
      else if (action === "refresh") keyActivate("⌫");
      else if (action === "library") state.keyboardView = (state.keyboardView + 1) % 3;
      else if (["search", "back"].includes(action)) state.keyboard = false;
      render();
      return;
    }
    if (state.modal) {
      if (["left", "up", "confirmNo"].includes(action)) state.choice = 0;
      else if (["right", "down", "confirmYes"].includes(action)) state.choice = 1;
      if (action === "back" || action === "confirmNo") state.modal = null;
      else if (action === "select" || action === "confirmYes") {
        const modal = state.modal;
        state.modal = null;
        if (state.choice === 1) {
          if (["install", "remove"].includes(modal.type)) enqueue(modal.app, modal.type);
          else if (modal.type === "cancel") {
            const job = jobs.find((job) => job.id === modal.job);
            if (job && !terminal(job)) {
              job.phase = job.phase === "queued" ? "cancelled" : "cancelling";
              job.stage = "Cancellation requested";
              changed();
            }
          } else if (modal.type === "retry") {
            const job = jobs.find((job) => job.id === modal.job);
            if (job) enqueue(job.app, job.operation);
          } else if (modal.type === "play") {
            close();
            return;
          }
        }
      }
      render();
      return;
    }
    if (state.activity) {
      const job = selectedJob();
      const order = jobs.slice().reverse();
      const index = order.indexOf(job);
      if (action === "back") state.activity = false;
      else if (action === "job") state.job = data.job;
      else if (["up", "down"].includes(action) && order.length)
        state.job = order[(index + (action === "up" ? -1 : 1) + order.length) % order.length].id;
      else if (["select", "jobGame"].includes(action) && job) {
        section("Discover");
        state.index = visibleGames().findIndex((game) => game.id === job.app);
        state.activity = false;
        openDetails();
      } else if (["refresh", "cancel"].includes(action) && job && !terminal(job))
        request("cancel", job.id);
      else if (
        ["library", "retry"].includes(action) &&
        job &&
        ["cancelled", "interrupted", "failed"].includes(job.phase)
      )
        request("retry", job.id);
      render();
      return;
    }
    if (state.gallery) {
      if (action === "back") state.gallery = false;
      else if (["previousImage", "nextImage"].includes(action))
        moveImage(action === "nextImage" ? 1 : -1);
      render();
      return;
    }
    if (action === "section") section(data.section);
    else if (action === "search") {
      if (!state.details) {
        state.keyboard = true;
        state.keyboardView = 0;
        state.keyRow = 0;
        state.keyColumn = 0;
      }
    } else if (action === "activity") {
      state.activity = true;
      state.job = jobs.at(-1)?.id || "";
    } else if (action === "refresh") {
      const job = pending(selectedGame()?.id);
      if (job) request("cancel", job.id);
      else if (activeJob()) state.activity = true;
      else options.notify?.("Sample Dukkan catalog refreshed");
    } else if (action === "cancel") request("cancel", data.job);
    else if (action === "image") state.image = Number(data.image);
    else if (["nextImage", "previousImage"].includes(action) && state.details)
      moveImage(action === "nextImage" ? 1 : -1);
    else if (["gallery", "library"].includes(action) && state.details) {
      if (selectedGame()?.screenshots.length) state.gallery = true;
    } else if (action === "library") section(state.section === "Library" ? "Discover" : "Library");
    else if (state.details) {
      if (action === "back") {
        state.details = false;
        state.area = "catalog";
      } else if (["primary", "remove"].includes(action))
        request(
          action === "remove" ? "remove" : installed.has(selectedGame().id) ? "play" : "install",
        );
      else if (action === "left") state.detailAction = 0;
      else if (action === "right" && installed.has(selectedGame().id)) state.detailAction = 1;
      else if (action === "select")
        request(
          state.detailAction ? "remove" : installed.has(selectedGame().id) ? "play" : "install",
        );
      else if (["up", "down"].includes(action)) {
        root.querySelector(".dk-description")?.scrollBy(0, action === "down" ? 145 : -145);
        return;
      }
    } else if (action === "game") {
      state.index = Number(data.index);
      state.area = "catalog";
      openDetails();
    } else if (action === "details") openDetails();
    else if (state.area === "nav") {
      if (action === "up") state.nav = Math.max(0, state.nav - 1);
      else if (action === "down") state.nav = Math.min(2, state.nav + 1);
      else if (["right", "back"].includes(action)) state.area = "catalog";
      else if (action === "select") section(["Discover", "Library", "Activity"][state.nav]);
    } else if (state.area === "hero") {
      if (action === "select") openDetails();
      else if (["down", "back"].includes(action)) state.area = "catalog";
      else if (action === "left") state.area = "nav";
    } else {
      if (action === "left" && state.index === 0) state.area = "nav";
      else if (["left", "right"].includes(action))
        state.index = Math.max(
          0,
          Math.min(visibleGames().length - 1, state.index + (action === "right" ? 1 : -1)),
        );
      else if (action === "up") state.area = selectedGame() ? "hero" : "nav";
      else if (action === "select") openDetails();
      else if (action === "back") {
        if (state.section !== "Discover") section("Discover");
        else {
          close();
          return;
        }
      }
    }
    render();
  }
  function moveImage(delta) {
    const count = selectedGame()?.screenshots.length || 0;
    if (count) state.image = (state.image + delta + count) % count;
  }
  function tick() {
    let job = activeJob();
    let transition = false;
    if (job?.phase === "cancelling") {
      job.phase = "cancelled";
      job.stage = "Cancelled · sample application data retained";
      transition = true;
      options.notify?.(`${job.name} transaction cancelled`);
    }
    if (!activeJob()) {
      job = jobs.find((item) => item.phase === "queued");
      if (job) {
        job.phase = "running";
        job.stage = "Checking current installation";
        transition = true;
      }
    }
    job = activeJob();
    if (job) {
      job.percent = Math.min(100, job.percent + 5);
      job.stage =
        job.operation === "remove"
          ? "Removing application · keeping saves"
          : job.percent < 20
            ? "Checking current installation"
            : job.percent < 80
              ? "Downloading sample application"
              : "Verifying install and refreshing library";
      if (job.percent === 100) {
        job.phase = "succeeded";
        job.stage =
          job.operation === "install"
            ? "Installed · published to Native games"
            : "Removed · application saves retained";
        if (job.operation === "install") installed.add(job.app);
        else installed.delete(job.app);
        transition = true;
        options.notify?.(
          `${job.name} ${job.operation === "install" ? "installed · added to Native games" : "removed · saves retained"}`,
        );
      }
    }
    if (transition) {
      changed();
      render(false);
    } else if (job) {
      root.querySelectorAll(`[data-dk-progress="${job.id}"]`).forEach((element) => {
        element.value = job.percent;
      });
      root.querySelectorAll(`[data-dk-percent="${job.id}"]`).forEach((element) => {
        element.textContent = `${job.percent}% · CURRENT STEP`;
      });
      root.querySelectorAll(`[data-dk-stage="${job.id}"]`).forEach((element) => {
        element.textContent = job.stage;
      });
      root.querySelectorAll(`[data-dk-job-stage="${job.id}"]`).forEach((element) => {
        element.textContent = `${job.stage} · ${job.percent}%`;
      });
      store();
    }
  }
  function open(activity = false) {
    state.open = true;
    state.details = false;
    state.gallery = false;
    state.keyboard = false;
    state.modal = null;
    state.activity = activity;
    section("Discover");
    if (activity) state.activity = true;
    root.hidden = false;
    options.onOpen?.();
    render();
  }
  function close() {
    state.open = false;
    root.hidden = true;
    options.onClose?.();
  }
  root.addEventListener("click", (event) => {
    const target = event.target.closest("[data-dk]");
    if (target && !target.disabled) handle(target.dataset.dk, target.dataset);
  });
  function updateHomeSelection() {
    if (state.details || state.activity || state.keyboard || state.gallery) return;
    const template = document.createElement("template");
    template.innerHTML = homeMarkup();
    const next = template.content.querySelector(".dk-feature");
    if (next) root.querySelector(".dk-feature")?.replaceWith(next);
    root
      .querySelectorAll(".dk-tile")
      .forEach((tile) =>
        tile.classList.toggle(
          "dk-chosen",
          state.area === "catalog" && Number(tile.dataset.index) === state.index,
        ),
      );
    root
      .querySelectorAll("[data-nav]")
      .forEach((nav) =>
        nav.classList.toggle(
          "dk-chosen",
          state.area === "nav" && Number(nav.dataset.nav) === state.nav,
        ),
      );
  }
  root.addEventListener("focusin", (event) => {
    const target = event.target.closest("[data-dk]");
    if (!target) return;
    if (target.dataset.dk === "confirmNo" || target.dataset.dk === "confirmYes") {
      state.choice = target.dataset.dk === "confirmYes" ? 1 : 0;
      root.querySelectorAll(".dk-confirm .dk-button").forEach((item) => {
        item.classList.toggle("dk-primary", item === target);
        item.classList.toggle("dk-chosen", item === target);
      });
    } else if (target.dataset.dk === "key") {
      state.keyRow = Number(target.dataset.row);
      state.keyColumn = Number(target.dataset.column);
      root.querySelectorAll(".dk-keys .dk-button").forEach((item) => {
        item.classList.toggle("dk-chosen", item === target);
        item.classList.toggle("dk-primary", item === target);
      });
    } else if (target.matches(".dk-tile")) {
      const next = Number(target.dataset.index);
      if (next !== state.index || state.area !== "catalog") {
        state.index = next;
        state.area = "catalog";
        updateHomeSelection();
      }
    } else if (target.dataset.nav !== undefined) {
      state.area = "nav";
      state.nav = Number(target.dataset.nav);
    } else if (target.matches('.dk-feature [data-dk="details"]')) state.area = "hero";
    else if (target.dataset.dk === "remove") state.detailAction = 1;
    else if (target.dataset.dk === "primary") state.detailAction = 0;
  });
  const keyboardActions = {
    ArrowLeft: "left",
    ArrowRight: "right",
    ArrowUp: "up",
    ArrowDown: "down",
    Enter: "select",
    Escape: "back",
    PageUp: "previousImage",
    PageDown: "nextImage",
    F5: "refresh",
  };
  function keydown(event) {
    if (state.keyboard && !event.ctrlKey && !event.metaKey && !event.altKey) {
      if (event.key === "Backspace") {
        keyActivate("⌫");
        render();
        event.preventDefault();
        return true;
      }
      if (event.key.length === 1 && /^[\x20-\x7e]$/.test(event.key)) {
        keyActivate(event.key === " " ? "SPACE" : event.key);
        render();
        event.preventDefault();
        return true;
      }
    }
    let action = keyboardActions[event.key];
    if (event.ctrlKey && event.key.toLowerCase() === "f") action = "search";
    else if (event.ctrlKey && event.key.toLowerCase() === "t") action = "activity";
    else if (event.ctrlKey && event.key.toLowerCase() === "q") {
      event.preventDefault();
      close();
      return true;
    } else if (!event.ctrlKey && event.key.toLowerCase() === "y") action = "library";
    else if (!event.ctrlKey && event.key.toLowerCase() === "x") action = "refresh";
    else if (!event.ctrlKey && event.key === "/") action = "search";
    else if (event.key === " " && state.details) action = "gallery";
    else if (event.key === "Tab") {
      if (state.modal || state.keyboard) {
        event.preventDefault();
        const layer = root.querySelector(state.keyboard ? ".dk-keyboard" : ".dk-confirm");
        const items = [...layer.querySelectorAll("button:not(:disabled)")].filter(
          (element) => element.getClientRects().length,
        );
        const at = items.indexOf(document.activeElement);
        items[(at + (event.shiftKey ? -1 : 1) + items.length) % items.length]?.focus({
          preventScroll: true,
        });
        return true;
      }
      return false;
    }
    if (action) {
      event.preventDefault();
      handle(action);
      return true;
    }
    return false;
  }
  setInterval(tick, 500);
  return {
    open,
    close,
    handle,
    keydown,
    restoreFocus: () => render(),
    isOpen: () => state.open,
    keyboardOpen: () => state.keyboard,
    installedGames: () => catalog.filter((game) => installed.has(game.id)),
    jobs: () => jobs,
  };
};
