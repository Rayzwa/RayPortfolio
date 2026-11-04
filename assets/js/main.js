/* ============================================================
   Raymond Wang portfolio — shared interactions
   Vanilla JS, no dependencies. Each block no-ops when its
   markup is missing, and shows the final state under reduced
   motion or when a browser feature is unavailable.
   ============================================================ */
(function () {
  "use strict";
  var root = document.documentElement;
  var body = document.body;
  function mq(q) { return !!(window.matchMedia && window.matchMedia(q).matches); }
  var reduceMotion = mq("(prefers-reduced-motion: reduce)");
  var finePointer = mq("(hover: hover) and (pointer: fine)");

  /* ---------- Theme ----------
     The inline <head> script sets the theme before first paint
     (light unless the visitor chose dark). Here we sync the toggle
     and save manual choices. */
  var THEME_KEY = "pm-theme";
  function syncThemeToggle() {
    var dark = root.getAttribute("data-theme") === "dark";
    document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
      btn.setAttribute("aria-pressed", dark ? "true" : "false");
    });
  }
  function toggleTheme() {
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    syncThemeToggle();
    try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
  }
  syncThemeToggle();

  /* ---------- Mobile nav ---------- */
  function setNav(open) {
    body.classList.toggle("nav-open", open);
    document.querySelectorAll("[data-nav-toggle]").forEach(function (btn) {
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Image fallbacks ----------
     <img data-fallback="monogram"> → swapped for a monogram tile.
     Also handles images that failed before this script ran. */
  function imageFallback(img) {
    var tile = document.createElement("div");
    tile.className = "monogram";
    tile.setAttribute("role", "img");
    tile.setAttribute("aria-label", img.alt || "");
    tile.textContent = "RW";
    img.replaceWith(tile);
  }
  document.querySelectorAll('img[data-fallback="monogram"]').forEach(function (img) {
    if (img.complete && img.naturalWidth === 0) imageFallback(img);
    else img.addEventListener("error", function () { imageFallback(img); });
  });

  /* ---------- Run once when an element scrolls into view ----------
     Without IntersectionObserver, runs immediately. */
  function onVisible(els, fn, options) {
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) { Array.prototype.forEach.call(els, fn); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { io.unobserve(entry.target); fn(entry.target); }
      });
    }, options);
    Array.prototype.forEach.call(els, function (el) { io.observe(el); });
  }

  /* ---------- Scroll reveal (+ per-child stagger index) ---------- */
  var reveals = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    reveals.forEach(function (el) { el.classList.add("reveal"); });
    onVisible(reveals, function (el) { el.classList.add("is-visible"); }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
  }
  document.querySelectorAll("[data-stagger]").forEach(function (list) {
    Array.prototype.forEach.call(list.children, function (el, i) { el.style.setProperty("--i", i); });
  });

  /* ---------- Scrollspy (active nav link) ---------- */
  var sections = document.querySelectorAll("section[id]");
  var navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  if ("IntersectionObserver" in window && sections.length && navLinks.length) {
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = "#" + entry.target.id;
        navLinks.forEach(function (l) { l.classList.toggle("is-active", l.getAttribute("href") === id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    sections.forEach(function (s) { so.observe(s); });
  }

  /* ---------- Scroll progress bar + back to top ---------- */
  var bar = null;
  if (!reduceMotion) {
    bar = document.createElement("div");
    bar.className = "progress-bar";
    bar.setAttribute("aria-hidden", "true");
    body.appendChild(bar);
  }
  var toTop = document.createElement("button");
  toTop.className = "to-top";
  toTop.type = "button";
  toTop.setAttribute("aria-label", "Back to top");
  toTop.textContent = "↑";
  body.appendChild(toTop);
  toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });

  var scrollQueued = false;
  function updateScrollUI() {
    scrollQueued = false;
    var top = window.pageYOffset || root.scrollTop || 0;
    if (bar) {
      var max = root.scrollHeight - root.clientHeight;
      bar.style.transform = "scaleX(" + (max > 0 ? top / max : 0) + ")";
    }
    toTop.classList.toggle("is-visible", top > 600);
  }
  function queueScrollUI() {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(updateScrollUI);
  }
  window.addEventListener("scroll", queueScrollUI, { passive: true });
  window.addEventListener("resize", queueScrollUI);
  updateScrollUI();

  /* ---------- Pointer glow + card spotlight/tilt (fine pointers only) ---------- */
  if (finePointer && !reduceMotion) {
    var glowX = 0, glowY = 0, glowQueued = false;
    window.addEventListener("pointermove", function (e) {
      glowX = e.clientX; glowY = e.clientY;
      if (glowQueued) return;
      glowQueued = true;
      requestAnimationFrame(function () {
        glowQueued = false;
        root.style.setProperty("--gx", glowX + "px");
        root.style.setProperty("--gy", glowY + "px");
      });
    }, { passive: true });

    document.querySelectorAll(".card-hover").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        var x = e.clientX - r.left, y = e.clientY - r.top;
        card.style.setProperty("--mx", x + "px");
        card.style.setProperty("--my", y + "px");
        card.style.setProperty("--ry", ((x / r.width - 0.5) * 6).toFixed(2) + "deg");
        card.style.setProperty("--rx", ((0.5 - y / r.height) * 6).toFixed(2) + "deg");
      });
      card.addEventListener("pointerleave", function () {
        ["--mx", "--my", "--rx", "--ry"].forEach(function (p) { card.style.removeProperty(p); });
      });
    });
  }

  /* ---------- Animated counters ----------
     The real value is the element's text; data-count animates to it. */
  function runCounter(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    if (isNaN(target) || reduceMotion) return;
    var duration = 1100, start = null, finished = false;
    function done() { finished = true; el.textContent = target; }
    function frame(ts) {
      if (finished) return;
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(frame); else done();
    }
    requestAnimationFrame(frame);
    // If frames stall (background tab), still land on the real value.
    setTimeout(done, duration + 400);
  }
  // Hero counters sit behind the intro card, so wait until it has unfolded.
  function afterIntro(fn) {
    return function (el) {
      if (!root.classList.contains("intro-on")) fn(el);
      else document.addEventListener("intro:done", function () { fn(el); }, { once: true });
    };
  }
  onVisible(document.querySelectorAll("[data-count]"), afterIntro(runCounter), { threshold: 0.4 });

  /* ---------- Decode: scramble text into its real value ----------
     The real text is always in the HTML (no-JS, screen readers);
     during the effect it's exposed via aria-label. */
  var GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+<>/";
  function decode(el) {
    if (el._final === undefined) el._final = el.textContent;
    var text = el._final;
    if (reduceMotion) return;
    var run = el._run = (el._run || 0) + 1;
    var duration = Math.min(900, 300 + text.length * 20), start = null, finished = false;
    el.setAttribute("aria-label", text);
    function done() {
      if (finished || el._run !== run) return;
      finished = true;
      el.textContent = text;
      el.removeAttribute("aria-label");
    }
    function frame(ts) {
      if (finished || el._run !== run) return;
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var n = Math.floor(p * text.length), out = text.slice(0, n);
      for (var i = n; i < text.length; i++) {
        out += /\s/.test(text[i]) ? text[i] : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = out;
      if (p < 1) requestAnimationFrame(frame); else done();
    }
    requestAnimationFrame(frame);
    setTimeout(done, duration + 400);
  }
  onVisible(document.querySelectorAll("[data-decode]"), decode, { threshold: 0.5 });

  // Other scripts can ask for a decode (intro.js does, for the name).
  document.addEventListener("rw:decode", function (e) { decode(e.target); });

  /* ---------- Mini prototypes animate only while on screen ---------- */
  var live = document.querySelectorAll("[data-live]");
  if (live.length && !reduceMotion && "IntersectionObserver" in window) {
    var lo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { entry.target.classList.toggle("is-live", entry.isIntersecting); });
    }, { threshold: 0.3 });
    live.forEach(function (el) { lo.observe(el); });
  }

  /* ---------- Quote rotator ----------
     Without JS every quote is listed in full. With JS one shows at a
     time (short part first, "Read more" for the rest), with arrows and
     dots; auto-advances unless reduced motion, and pauses while hovered,
     focused or expanded. */
  document.querySelectorAll("[data-rotator]").forEach(function (rot) {
    var items = rot.querySelectorAll(".rotator-list > li");
    if (items.length < 2) return;
    var current = 0, timer = null, hovered = false, focused = false;
    function button(cls, label, text, onClick) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = cls;
      b.setAttribute("aria-label", label);
      b.textContent = text;
      b.addEventListener("click", onClick);
      return b;
    }
    var controls = document.createElement("div");
    controls.className = "rotator-controls";
    controls.appendChild(button("rotator-arrow", "Previous quote", "‹", function () { go(current - 1); }));
    var dots = [];
    items.forEach(function (li, i) {
      dots.push(controls.appendChild(button("rotator-dot", "Show quote " + (i + 1) + " of " + items.length, "", function () { go(i); })));
    });
    controls.appendChild(button("rotator-arrow", "Next quote", "›", function () { go(current + 1); }));
    rot.appendChild(controls);
    rot.classList.add("is-rotating");

    function setExpanded(li, open) {
      li.classList.toggle("is-expanded", open);
      var b = li.querySelector(".q-toggle");
      if (!b) return;
      b.setAttribute("aria-expanded", open ? "true" : "false");
      b.textContent = open ? "Show less" : "Read more";
    }
    rot.querySelectorAll(".q-toggle").forEach(function (b) {
      b.hidden = false;
      b.addEventListener("click", function () {
        var li = b.closest("li");
        setExpanded(li, !li.classList.contains("is-expanded"));
      });
    });
    function show(i, animate) {
      current = (i + items.length) % items.length;
      items.forEach(function (li, j) {
        li.classList.toggle("is-active", j === current);
        if (j !== current) setExpanded(li, false);
      });
      dots.forEach(function (b, j) { b.setAttribute("aria-current", j === current ? "true" : "false"); });
      var q = animate && items[current].querySelector(".q-short");
      if (q) decode(q);
    }
    function play() {
      if (timer || reduceMotion || hovered || focused || rot.querySelector(".is-expanded")) return;
      timer = setInterval(function () { show(current + 1, true); }, 7000);
    }
    function pause() { clearInterval(timer); timer = null; }
    function go(i) { show(i, true); pause(); play(); }
    show(0, false);
    play();
    rot.addEventListener("mouseenter", function () { hovered = true; pause(); });
    rot.addEventListener("mouseleave", function () { hovered = false; play(); });
    rot.addEventListener("focusin", function () { focused = true; pause(); });
    rot.addEventListener("focusout", function () { focused = false; play(); });
  });

  /* ---------- Accordion (build pages) ---------- */
  document.querySelectorAll(".cs-section").forEach(function (section) {
    var trigger = section.querySelector(".cs-trigger");
    if (!trigger) return;
    section.setAttribute("data-open", trigger.getAttribute("aria-expanded") === "true" ? "true" : "false");
    trigger.addEventListener("click", function () {
      var open = section.getAttribute("data-open") !== "true";
      section.setAttribute("data-open", open ? "true" : "false");
      trigger.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });
  // Links to a panel id (e.g. from the decision map) open that section.
  function openFromHash() {
    var panel = location.hash.length > 1 ? document.getElementById(location.hash.slice(1)) : null;
    var section = panel && panel.closest(".cs-section");
    if (!section) return;
    section.setAttribute("data-open", "true");
    var trigger = section.querySelector(".cs-trigger");
    if (trigger) trigger.setAttribute("aria-expanded", "true");
  }
  window.addEventListener("hashchange", openFromHash);
  openFromHash();

  /* ---------- Toast + copy ---------- */
  var toast = document.createElement("div");
  toast.className = "toast";
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  body.appendChild(toast);
  var toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("is-visible"); }, 2200);
  }
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      var ta = document.createElement("textarea");
      ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); resolve(); } catch (err) { reject(err); }
      body.removeChild(ta);
    });
  }
  function copyEmail(text) {
    copyText(text).then(
      function () { showToast("Copied " + text + " ✓"); },
      function () { showToast("Copy failed — " + text); }
    );
  }

  /* ---------- Single delegated click handler ---------- */
  document.addEventListener("click", function (e) {
    var t = e.target;
    if (t.closest("[data-theme-toggle]")) { e.preventDefault(); toggleTheme(); return; }
    if (t.closest("[data-nav-toggle]")) { e.preventDefault(); setNav(!body.classList.contains("nav-open")); return; }
    if (t.closest("[data-cmdk]")) { e.preventDefault(); openPalette(); return; }
    var jump = t.closest('a[href^="#"]');
    if (jump && !e.defaultPrevented && warpTo(jump.getAttribute("href"))) { e.preventDefault(); setNav(false); return; }
    if (t.closest(".nav-links a")) setNav(false);
    // Touch has no hover, so a tap flips the card (desktop flips on hover/focus in CSS).
    var flip = t.closest(".flip");
    if (flip && !finePointer) flip.classList.toggle("is-flipped");
    // Copy links are mailto: links, so the mail app still opens too.
    var copyEl = t.closest("[data-copy]");
    if (copyEl) copyEmail(copyEl.getAttribute("data-copy"));
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setNav(false);
  });

  /* ---------- Warp: immersive jump to a section ----------
     Same-page links to a <section>/<main> play a scan-line sweep with
     the destination name, glide there, then sweep the section as it
     arrives. Other hash links (e.g. build-page panels) are left alone.
     Reduced motion: an instant jump. */
  var warp = null, warpTimer = null;
  function focusSection(el) {
    if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
    el.focus({ preventScroll: true });
  }
  function warpTo(hash) {
    var target = hash.length > 1 ? document.getElementById(hash.slice(1)) : null;
    if (!target || !target.matches("section, main") || root.classList.contains("intro-on")) return false;
    if (history.pushState) history.pushState(null, "", hash);
    if (reduceMotion) { target.scrollIntoView(); focusSection(target); return true; }
    if (!warp) {
      warp = document.createElement("div");
      warp.className = "warp";
      warp.setAttribute("aria-hidden", "true");
      warp.innerHTML = '<span class="warp-label"></span>';
      body.appendChild(warp);
    }
    warp.firstChild.textContent = "// " + target.id;
    warp.classList.remove("is-on");
    void warp.offsetWidth;   // restart the animation
    warp.classList.add("is-on");
    target.scrollIntoView({ behavior: "smooth" });
    focusSection(target);
    clearTimeout(warpTimer);
    warpTimer = setTimeout(function () {
      target.classList.remove("is-arriving");
      void target.offsetWidth;
      target.classList.add("is-arriving");
      setTimeout(function () { target.classList.remove("is-arriving"); }, 1100);
    }, 500);
    return true;
  }

  /* ---------- Command palette (⌘K / Ctrl+K) ----------
     Commands come from the page (nav links, résumé link, footer
     email/LinkedIn) plus the build pages listed below. */
  var isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  if (!isMac) document.querySelectorAll("[data-kbd]").forEach(function (el) { el.textContent = "Ctrl K"; });

  var brandLink = document.querySelector(".brand");
  var base = brandLink ? (brandLink.getAttribute("href") || "").replace(/(home\.html|#top)$/, "") : "";
  var commands = [];
  document.querySelectorAll(".nav-links a").forEach(function (a) {
    commands.push({ label: a.textContent.trim(), hint: "Section", href: a.getAttribute("href") });
  });
  commands.push({ label: "Momentum", hint: "Build", href: base + "builds/momentum.html" });
  commands.push({ label: "GrowingED", hint: "Build", href: base + "builds/growinged.html" });
  var resumeLink = document.querySelector(".nav-actions a[download]");
  if (resumeLink) commands.push({ label: "Download résumé", hint: "PDF", href: resumeLink.getAttribute("href"), download: true });
  var footerEmail = document.querySelector(".site-footer [data-copy]");
  if (footerEmail) {
    var email = footerEmail.getAttribute("data-copy");
    commands.push({ label: "Copy email address", hint: email, run: function () { copyEmail(email); } });
  }
  var footerLinkedIn = document.querySelector('.site-footer a[href*="linkedin.com"]');
  if (footerLinkedIn) commands.push({ label: "Open LinkedIn", hint: "New tab", href: footerLinkedIn.getAttribute("href"), newTab: true });
  commands.push({ label: "Toggle light / dark", hint: "Theme", run: toggleTheme });

  var cmdk = null, cmdkInput, cmdkList, cmdkMatches = [], cmdkIndex = 0;
  function buildPalette() {
    cmdk = document.createElement("dialog");
    cmdk.className = "cmdk";
    cmdk.setAttribute("aria-label", "Jump to");
    cmdk.innerHTML =
      '<input class="cmdk-input" type="text" placeholder="> jump to…" aria-label="Search sections and actions" ' +
      'role="combobox" aria-expanded="true" aria-controls="cmdk-list" aria-autocomplete="list" autocomplete="off" />' +
      '<ul class="cmdk-list" id="cmdk-list" role="listbox"></ul>' +
      '<p class="cmdk-foot">↑↓ move · Enter open · Esc close</p>';
    body.appendChild(cmdk);
    cmdkInput = cmdk.querySelector(".cmdk-input");
    cmdkList = cmdk.querySelector(".cmdk-list");
    cmdkInput.addEventListener("input", function () { cmdkIndex = 0; renderPalette(); });
    cmdkInput.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        if (!cmdkMatches.length) return;
        cmdkIndex = (cmdkIndex + (e.key === "ArrowDown" ? 1 : -1) + cmdkMatches.length) % cmdkMatches.length;
        renderPalette();
      } else if (e.key === "Enter") {
        e.preventDefault();
        runCommand(cmdkMatches[cmdkIndex]);
      }
    });
    cmdkList.addEventListener("click", function (e) {
      var li = e.target.closest("[data-index]");
      if (li) runCommand(cmdkMatches[+li.getAttribute("data-index")]);
    });
    cmdk.addEventListener("click", function (e) { if (e.target === cmdk) cmdk.close(); });
  }
  function renderPalette() {
    var q = cmdkInput.value.trim().toLowerCase();
    cmdkMatches = commands.filter(function (c) { return !q || (c.label + " " + c.hint).toLowerCase().indexOf(q) !== -1; });
    cmdkList.innerHTML = "";
    if (!cmdkMatches.length) {
      cmdkList.innerHTML = '<li class="cmdk-empty" role="presentation">No matches</li>';
      cmdkInput.removeAttribute("aria-activedescendant");
      return;
    }
    cmdkMatches.forEach(function (c, i) {
      var li = document.createElement("li");
      li.id = "cmdk-opt-" + i;
      li.setAttribute("role", "option");
      li.setAttribute("data-index", i);
      li.setAttribute("aria-selected", i === cmdkIndex ? "true" : "false");
      var label = document.createElement("span");
      label.textContent = c.label;
      var hint = document.createElement("span");
      hint.className = "cmdk-hint";
      hint.textContent = c.hint;
      li.appendChild(label);
      li.appendChild(hint);
      cmdkList.appendChild(li);
    });
    cmdkInput.setAttribute("aria-activedescendant", "cmdk-opt-" + cmdkIndex);
    var active = cmdkList.children[cmdkIndex];
    if (active && active.scrollIntoView) active.scrollIntoView({ block: "nearest" });
  }
  function runCommand(c) {
    if (!c) return;
    cmdk.close();
    if (c.run) { c.run(); return; }
    if (c.href.charAt(0) === "#" && warpTo(c.href)) return;
    if (c.download || c.newTab) {
      var a = document.createElement("a");
      a.href = c.href;
      if (c.download) a.setAttribute("download", "");
      if (c.newTab) { a.target = "_blank"; a.rel = "noopener"; }
      body.appendChild(a); a.click(); body.removeChild(a);
      return;
    }
    location.href = c.href;
  }
  function openPalette() {
    if (!window.HTMLDialogElement) return;
    if (root.classList.contains("intro-on")) return;   // the intro owns the screen
    if (!cmdk) buildPalette();
    if (cmdk.open) return;
    setNav(false);
    cmdkInput.value = "";
    cmdkIndex = 0;
    renderPalette();
    cmdk.showModal();
    cmdkInput.focus();
  }
  document.addEventListener("keydown", function (e) {
    if ((e.metaKey || e.ctrlKey) && !e.altKey && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (cmdk && cmdk.open) cmdk.close(); else openPalette();
    }
  });

  /* ---------- Estimated read time (build pages) ---------- */
  var rtEls = document.querySelectorAll("[data-read-time]");
  if (rtEls.length) {
    var text = Array.prototype.map.call(document.querySelectorAll(".cs-panel"), function (p) { return p.textContent; }).join(" ");
    var mins = Math.max(1, Math.round(text.trim().split(/\s+/).filter(Boolean).length / 200));
    rtEls.forEach(function (el) { el.textContent = "≈ " + mins + " min read"; });
  }
})();
