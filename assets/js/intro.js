/* ============================================================
   PM Portfolio — "Unfold" intro (home page only)
   State machine: card → unfolding → site.
   The <head> script sets html.intro-on (show the card) or
   html.intro-done (returning visit / deep link). Without JS
   neither is set and the intro is just the first section.
   Uses GSAP + Flip when available; otherwise CSS fallbacks.
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
  var behind = document.querySelectorAll(".site-header, main > section:not(#intro), .site-footer");
  function setInert(on) {
    behind.forEach(function (el) { if (on) el.setAttribute("inert", ""); else el.removeAttribute("inert"); });
  }
  setInert(true);

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
  }

  // CSS-only exit: reduced motion, small screens, or GSAP unavailable.
  function cssLeave(className, ms) {
    root.classList.add("intro-reveal");
    intro.classList.add(className);
    setTimeout(finish, ms + 50);
  }

  function gsapLeave(gsap, Flip) {
    gsap.registerPlugin(Flip);
    var card = intro.querySelector("[data-intro-card]");
    var photo = intro.querySelector("[data-intro-photo]");
    var body = intro.querySelector("[data-intro-body]");
    var hint = intro.querySelector(".intro-hint");
    var target = document.querySelector(".hero-portrait");
    var tl = gsap.timeline({ onComplete: finish });
    // Safety net: if animation frames stall (throttled tab, odd browser), never leave the visitor stuck.
    setTimeout(finish, 2000);

    tl.to([body, hint], { opacity: 0, y: -8, duration: 0.2, ease: "power1.out" }, 0);

    // Lift the photo out of the card and fly it onto the hero portrait.
    var cardState = Flip.getState(card);
    if (photo && target) {
      var photoState = Flip.getState(photo);
      var r = target.getBoundingClientRect();
      intro.appendChild(photo);
      photo.classList.add("is-flying");
      photo.style.left = r.left + "px";
      photo.style.top = r.top + "px";
      photo.style.width = r.width + "px";
      photo.style.height = r.height + "px";
      tl.add(Flip.from(photoState, { duration: 0.75, ease: "power3.inOut" }), 0.1);
    }
    // Grow the card to fill the screen.
    card.classList.add("is-full");
    tl.add(Flip.from(cardState, { duration: 0.6, ease: "power3.inOut" }), 0.1);

    // Reveal the site underneath, then fade the layer away.
    tl.call(function () { root.classList.add("intro-reveal"); }, null, 0.6);
    tl.to(intro, { opacity: 0, duration: 0.3, ease: "power1.out" }, 0.7);
  }

  function unfold(instant) {
    if (started) return;
    started = true;
    removeTriggers();
    if (instant) return finish();
    if (reduceMotion) return cssLeave("is-fading", 150);
    if (small) return cssLeave("is-sliding", 500);
    if (!window.gsap || !window.Flip) return cssLeave("is-leaving", 300);
    gsapLeave(window.gsap, window.Flip);
  }

  /* ---------- Triggers (each fires once) ---------- */
  var explore = intro.querySelector("[data-intro-explore]");
  var skip = document.querySelector("[data-intro-skip]");
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
  if (skip) skip.addEventListener("click", onSkip);
  window.addEventListener("wheel", onWheel, { passive: true });
  window.addEventListener("touchstart", onTouchStart, { passive: true });
  window.addEventListener("touchmove", onTouchMove, { passive: true });
  document.addEventListener("keydown", onKey);

  function removeTriggers() {
    if (explore) explore.removeEventListener("click", onExplore);
    if (skip) skip.removeEventListener("click", onSkip);
    window.removeEventListener("wheel", onWheel);
    window.removeEventListener("touchstart", onTouchStart);
    window.removeEventListener("touchmove", onTouchMove);
    document.removeEventListener("keydown", onKey);
  }
})();
