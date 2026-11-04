/* ============================================================
   Raymond Wang portfolio — boot-sequence intro (home page only)
   State machine: boot → ready → unfolding → site.
   The <head> script sets html.intro-on (show the intro) or
   html.intro-done (returning visit / deep link). Without JS
   neither is set and the intro is a static first section.
   Boot steps are CSS classes on #intro (.is-booting, .graph-on,
   .name-on, .is-ready); then it opens the site by itself after a
   short countdown (paused while the visitor hovers or focuses the
   intro's buttons). The exit uses GSAP + Flip when available,
   otherwise CSS fallbacks.
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

  /* ---------- Boot sequence (~3 s; skipped under reduced motion) ---------- */
  var lines = intro.querySelectorAll(".boot-log li");
  var bar = intro.querySelector(".boot-bar span");
  var name = intro.querySelector(".boot-name");
  var timers = [];
  function at(ms, fn) { timers.push(setTimeout(fn, ms)); }
  function endBoot() {
    timers.forEach(clearTimeout);
    intro.classList.remove("is-booting");
    if (bar) bar.style.removeProperty("transform");
  }
  if (!reduceMotion) {
    intro.classList.add("is-booting");
    var step = 260, t = 250 + lines.length * step;
    lines.forEach(function (li, i) {
      at(250 + i * step, function () {
        li.classList.add("is-on");
        if (bar) bar.style.transform = "scaleX(" + (i + 1) / lines.length + ")";
      });
    });
    at(t, function () { intro.classList.add("graph-on"); });
    at(t + 600, function () {
      intro.classList.add("name-on");
      if (name) name.dispatchEvent(new CustomEvent("rw:decode", { bubbles: true }));   // main.js decodes it
    });
    at(t + 1200, function () { intro.classList.add("is-ready"); endBoot(); startCountdown(); });
  }

  /* ---------- Auto-open countdown ---------- */
  var AUTO_MS = reduceMotion ? 3500 : 1800;
  var autoTimer = null, counting = false, hovering = false, focusInside = false;
  intro.style.setProperty("--auto-ms", AUTO_MS + "ms");
  function startCountdown() {
    counting = true;
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
  // Reduced motion: nothing animates in, so the countdown starts right away (and runs longer).
  if (reduceMotion) startCountdown();

  function finish() {
    if (done) return;
    done = true;
    setInert(false);
    root.classList.remove("intro-on");
    root.classList.add("intro-done");
    intro.hidden = true;
    // Don't rely on the scroll-reveal observer for the hero: show it now.
    document.querySelectorAll(".hero [data-reveal]").forEach(function (el) { el.classList.add("is-visible"); });
    try { sessionStorage.setItem(SEEN_KEY, "1"); } catch (e) {}
    window.scrollTo(0, 0);
    if (heroHeading) heroHeading.focus({ preventScroll: true });
    if (status) status.textContent = "Showing the full site.";
    document.dispatchEvent(new Event("intro:done"));   // main.js starts the hero counters
  }

  // CSS-only exit: reduced motion, small screens, or GSAP unavailable.
  function cssLeave(className, ms) {
    root.classList.add("intro-reveal");
    intro.classList.add(className);
    setTimeout(finish, ms + 50);
  }

  function gsapLeave(gsap, Flip) {
    gsap.registerPlugin(Flip);
    var photo = intro.querySelector("[data-intro-photo]");
    var fade = intro.querySelectorAll("[data-intro-body], .graph, .intro-hint, .boot-skip");
    var target = document.querySelector(".hero-portrait");
    var tl = gsap.timeline({ onComplete: finish });
    // Safety net: if animation frames stall (throttled tab, odd browser), never leave the visitor stuck.
    setTimeout(finish, 2000);

    tl.to(fade, { opacity: 0, y: -8, duration: 0.25, ease: "power1.out" }, 0);

    // Lift the photo out of the graph and fly it onto the hero portrait.
    if (photo && target) {
      var photoState = Flip.getState(photo);
      var r = target.getBoundingClientRect();
      intro.appendChild(photo);
      photo.classList.add("is-flying");
      photo.style.position = "absolute";
      photo.style.left = r.left + "px";
      photo.style.top = r.top + "px";
      photo.style.width = r.width + "px";
      photo.style.height = r.height + "px";
      tl.add(Flip.from(photoState, { duration: 0.8, ease: "power3.inOut" }), 0.1);
    }

    // Reveal the site underneath, then fade the intro layer away (same theme, so it reads as one surface).
    tl.call(function () { root.classList.add("intro-reveal"); }, null, 0.5);
    tl.to(intro, { opacity: 0, duration: 0.35, ease: "power1.out" }, 0.65);
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
    if (!window.gsap || !window.Flip) return cssLeave("is-leaving", 300);
    gsapLeave(window.gsap, window.Flip);
  }

  /* ---------- Triggers (each fires once; any of them also skips the boot) ---------- */
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
