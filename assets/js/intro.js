/* ============================================================
   Raymond Wang portfolio — intro (home page only)
   State machine: reveal → ready → unfolding → site.
   The <head> script sets html.intro-on (show the intro) or
   html.intro-done (returning visit / deep link). Without JS
   neither is set and the intro is a static first section.
   The <head> script sets html.intro-boot before first paint (intro
   content hidden); reveal steps are then CSS classes on #intro
   (.photo-on, .name-on, .is-ready); then it opens the site by itself after a
   short countdown (paused while the visitor hovers or focuses the
   intro's buttons). The exit animates only transform/opacity with
   the Web Animations API (runs on the compositor, so it stays
   smooth), with CSS fallbacks.
   ============================================================ */
(function () {
  "use strict";
  var root = document.documentElement;
  var intro = document.getElementById("intro");
  if (!intro) return;
  if (!root.classList.contains("intro-on")) { intro.hidden = true; return; }

  var SEEN_KEY = "pm-intro-seen";
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var small = window.matchMedia && window.matchMedia("(max-width: 720px)").matches;
  var status = document.querySelector("[data-intro-status]");
  var heroHeading = document.querySelector(".hero .h1");
  var started = false, done = false;

  // Keep keyboard/screen-reader focus inside the intro while it's showing.
  var behind = document.querySelectorAll(".site-header, main > section:not(#intro), .site-footer, .panel-rail, .panel-next");
  function setInert(on) {
    behind.forEach(function (el) { if (on) el.setAttribute("inert", ""); else el.removeAttribute("inert"); });
  }
  setInert(true);

  /* ---------- Reveal (~1.3 s; skipped under reduced motion) ---------- */
  var timers = [];
  function at(ms, fn) { timers.push(setTimeout(fn, ms)); }
  function endBoot() {
    timers.forEach(clearTimeout);
    root.classList.remove("intro-boot");
  }
  if (root.classList.contains("intro-boot")) {
    root.classList.add("intro-running");   // tells the <head> failsafe the reveal is in hand
    at(250, function () { intro.classList.add("photo-on"); });
    at(700, function () { intro.classList.add("name-on"); });
    at(1300, function () { intro.classList.add("is-ready"); endBoot(); startCountdown(); });
  }

  /* ---------- Auto-open countdown ---------- */
  var AUTO_MS = reduceMotion ? 4000 : 3000;
  var autoTimer = null, counting = false, hovering = false, focusInside = false;
  intro.style.setProperty("--auto-ms", AUTO_MS + "ms");
  function startCountdown() {
    counting = true;
    intro.classList.add("is-primed");   // promote the exit layers now, while nothing is moving
    resumeCountdown();
  }
  function resumeCountdown() {
    if (!counting || started || hovering || focusInside) return;
    clearTimeout(autoTimer);
    intro.classList.remove("is-counting");
    void intro.offsetWidth;   // restart the countdown line
    intro.classList.add("is-counting");
    autoTimer = setTimeout(function () { unfold(false); }, AUTO_MS);
  }
  function holdCountdown() {
    clearTimeout(autoTimer);
    intro.classList.remove("is-counting");
  }
  var actions = intro.querySelector(".boot-actions");
  if (actions) {
    actions.addEventListener("pointerenter", function () { hovering = true; holdCountdown(); });
    actions.addEventListener("pointerleave", function () { hovering = false; resumeCountdown(); });
  }
  intro.addEventListener("focusin", function () { focusInside = true; holdCountdown(); });
  intro.addEventListener("focusout", function () { focusInside = false; resumeCountdown(); });
  // No reveal to watch (reduced motion, or the <head> failsafe already showed everything):
  // start the countdown right away.
  if (!root.classList.contains("intro-running")) startCountdown();

  function finish() {
    if (done) return;
    done = true;
    setInert(false);
    root.classList.remove("intro-on");
    root.classList.add("intro-done");
    intro.hidden = true;
    // Don't rely on the scroll-reveal observer for the hero: show it now.
    document.querySelectorAll(".hero [data-reveal]").forEach(function (el) { el.classList.add("is-visible"); });
    // The flown photo sits exactly on the portrait; keep it there until the portrait has faded in.
    var flown = document.querySelector(".boot-photo.is-flying");
    if (flown) setTimeout(function () { flown.remove(); }, 700);
    try { sessionStorage.setItem(SEEN_KEY, "1"); } catch (e) {}
    window.scrollTo(0, 0);
    if (heroHeading) heroHeading.focus({ preventScroll: true });
    if (status) status.textContent = "Showing the full site.";
    document.dispatchEvent(new Event("intro:done"));   // main.js starts the hero counters
  }

  // CSS-only exit: reduced motion, small screens, or no Web Animations API.
  function cssLeave(className, ms) {
    intro.classList.add(className);
    setTimeout(finish, ms + 50);
  }

  // Every animation here is transform/opacity on its own layer, so the
  // browser runs it off the main thread. No classes or layout change until
  // finish(), after motion has stopped. The site is already painted under
  // the intro, so the exit is one crossfade plus the photo flight.
  function animateLeave() {
    var photo = intro.querySelector("[data-intro-photo]");
    var target = document.querySelector(".hero-portrait");
    var ease = "cubic-bezier(.65, 0, .35, 1)", flight = null;
    // Safety net: if animations stall (throttled tab, odd browser), never leave the visitor stuck.
    setTimeout(finish, 2000);
    intro.classList.add("is-primed");

    intro.querySelectorAll("[data-intro-body], .intro-hint, .boot-skip").forEach(function (el) {
      el.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(-8px)" }],
        { duration: 250, easing: "ease-out", fill: "forwards" });
    });

    // FLIP: put the photo where the hero portrait is, then animate a
    // transform from where it was. Both are square, so one scale works.
    if (photo && target) {
      var a = photo.getBoundingClientRect(), b = target.getBoundingClientRect();
      photo.classList.add("is-flying");
      photo.style.left = b.left + "px";
      photo.style.top = b.top + "px";
      photo.style.width = b.width + "px";
      photo.style.height = b.height + "px";
      document.body.appendChild(photo);   // outside the intro, so it stays visible while the intro fades
      flight = photo.animate([
        { transform: "translate(" + (a.left - b.left) + "px," + (a.top - b.top) + "px) scale(" + a.width / b.width + ")" },
        { transform: "none" }
      ], { duration: 800, easing: ease });
    }

    var fadeOut = intro.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 350, delay: 600, easing: "ease-out", fill: "forwards" });
    Promise.all([fadeOut.finished, flight && flight.finished]).then(finish, finish);
  }

  function unfold(instant) {
    if (started) return;
    started = true;
    removeTriggers();
    endBoot();
    clearTimeout(autoTimer);
    if (instant) return finish();
    if (reduceMotion) return cssLeave("is-fading", 150);
    if (small) return cssLeave("is-sliding", 500);
    if (!Element.prototype.animate) return cssLeave("is-leaving", 300);
    animateLeave();
  }

  /* ---------- Triggers (each fires once; any of them also skips the reveal) ---------- */
  var explore = intro.querySelector("[data-intro-explore]");
  var skips = document.querySelectorAll("[data-intro-skip]");
  var touchY = null;

  function onExplore(e) { e.preventDefault(); unfold(false); }
  function onSkip(e) { e.preventDefault(); unfold(true); }
  function onWheel(e) { if (e.deltaY > 0) unfold(false); }
  function onTouchStart(e) { touchY = e.touches[0].clientY; }
  function onTouchMove(e) { if (touchY !== null && touchY - e.touches[0].clientY > 20) unfold(false); }
  function onKey(e) {
    var onControl = e.target.closest && e.target.closest("a, button, input, textarea, select");
    if (e.key === "ArrowDown" || e.key === "PageDown" || ((e.key === "Enter" || e.key === " ") && !onControl)) {
      e.preventDefault();
      unfold(false);
    }
  }

  if (explore) explore.addEventListener("click", onExplore);
  skips.forEach(function (el) { el.addEventListener("click", onSkip); });
  window.addEventListener("wheel", onWheel, { passive: true });
  window.addEventListener("touchstart", onTouchStart, { passive: true });
  window.addEventListener("touchmove", onTouchMove, { passive: true });
  document.addEventListener("keydown", onKey);

  function removeTriggers() {
    if (explore) explore.removeEventListener("click", onExplore);
    skips.forEach(function (el) { el.removeEventListener("click", onSkip); });
    window.removeEventListener("wheel", onWheel);
    window.removeEventListener("touchstart", onTouchStart);
    window.removeEventListener("touchmove", onTouchMove);
    document.removeEventListener("keydown", onKey);
  }
})();
