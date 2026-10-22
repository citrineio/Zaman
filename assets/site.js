"use strict";
const menuBtn = document.getElementById("menuBtn"),
  nav = document.getElementById("nav");
menuBtn?.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", String(open));
  menuBtn.textContent = open ? "Close" : "Menu";
});
function closeNav() {
  nav?.classList.remove("open");
  menuBtn?.setAttribute("aria-expanded", "false");
  if (menuBtn) menuBtn.textContent = "Menu";
}
nav?.addEventListener("click", (e) => {
  if (e.target.closest("a")) closeNav();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeNav();
});
const fig = document.getElementById("figSvg");
function setMode(docked) {
  if (!fig) return;
  document
    .getElementById("coreGroup")
    .setAttribute("transform", docked ? "translate(679,162)" : "translate(190,160)");
  fig.classList.toggle("svg-docked", docked);
  document.getElementById("wingGroup").classList.toggle("chassis-dim", docked);
  document.getElementById("nestGroup").classList.toggle("chassis-dim", !docked);
  document.getElementById("btnHandheld").setAttribute("aria-pressed", String(!docked));
  document.getElementById("btnDocked").setAttribute("aria-pressed", String(docked));
  document.getElementById("modeCaption").textContent = docked
    ? "MODE B — DOCKED · CORE IN NEST · BIG-SCREEN PLAY"
    : "MODE A — HANDHELD · CORE IN WING · HARDWARE CONCEPT";
}
document.getElementById("btnHandheld")?.addEventListener("click", () => setMode(false));
document.getElementById("btnDocked")?.addEventListener("click", () => setMode(true));
const lightbox = document.getElementById("lightbox");
document.querySelectorAll("[data-zoom]").forEach((img) => {
  const b = document.createElement("button");
  b.className = "image-zoom";
  b.setAttribute("aria-label", "Enlarge " + img.alt);
  img.replaceWith(b);
  b.append(img);
  b.addEventListener("click", () => {
    const dest = document.getElementById("lightboxImg");
    dest.src = img.src;
    dest.alt = img.alt;
    lightbox.showModal();
  });
});
lightbox?.querySelector("button").addEventListener("click", () => lightbox.close());
lightbox?.addEventListener("click", (e) => {
  if (e.target === lightbox) lightbox.close();
});
document.querySelectorAll("[data-filter]").forEach((b) =>
  b.addEventListener("click", () => {
    document
      .querySelectorAll("[data-filter]")
      .forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    let count = 0;
    document.querySelectorAll("[data-status]").forEach((card) => {
      card.hidden = b.dataset.filter !== "all" && card.dataset.status !== b.dataset.filter;
      if (!card.hidden) count++;
    });
    document.getElementById("filter-count").textContent = `${count} features shown`;
  }),
);
document.querySelectorAll(".walkthrough").forEach((v) => {
  const button = v.closest("figure").querySelector(".video-toggle");
  const sync = () => (button.textContent = v.paused ? "Play preview" : "Pause preview");
  button.addEventListener("click", () => (v.paused ? v.play().catch(sync) : v.pause()));
  v.addEventListener("play", sync);
  v.addEventListener("pause", sync);
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    v.autoplay = false;
    v.pause();
  }
  sync();
});
// Preserve previously shared section URLs after splitting the landing page.
if (location.pathname.endsWith("/") || location.pathname.endsWith("/index.html")) {
  const routes = {
    why: "hardware.html#why",
    system: "hardware.html#system",
    specs: "hardware.html#specs",
    pricing: "pricing.html#pricing",
    progress: "development.html#progress",
    lab: "lab.html#lab",
    contact: "lab.html#contact",
  };
  const target = routes[location.hash.slice(1)];
  if (target) location.replace(target);
}

if (location.pathname.endsWith("/hardware.html") && location.hash === "#pricing")
  location.replace("pricing.html#pricing");
