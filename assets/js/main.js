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
    if (panelsOn) return;   // panel mode drives the bar itself (syncPanelUI)
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

  // In desktop panel mode, content changes (counters) wait until
  // their panel has finished sliding in, so the slide never has to redraw.
  function whenSettled(fn) {
    return function (el) {
      var moving = el.closest && el.closest(".panel.is-moving");
      if (moving) setTimeout(function () { fn(el); }, 650); else fn(el);
    };
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
      else document.addEventListener("intro:done", function () { setTimeout(function () { fn(el); }, 150); }, { once: true });
    };
  }
  onVisible(document.querySelectorAll("[data-count]"), afterIntro(whenSettled(runCounter)), { threshold: 0.4 });

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
      var q = animate && !reduceMotion && Element.prototype.animate && items[current].querySelector("blockquote");
      if (q) q.animate([{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }], { duration: 450, easing: "ease-out" });
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

  /* ---------- Builds showcase ----------
     Without JS every build is listed and the selectors are plain
     anchors. With JS they become tabs: click (or hover on desktop)
     shows one build; arrow keys move between tabs. */
  document.querySelectorAll("[data-showcase]").forEach(function (sc) {
    var list = sc.querySelector(".show-list");
    var tabs = Array.prototype.slice.call(sc.querySelectorAll(".show-tab"));
    var items = tabs.map(function (t) { return document.getElementById(t.getAttribute("href").slice(1)); });
    if (!list || !tabs.length || items.indexOf(null) !== -1) return;
    var hoverTimer = null, switchTimer = null, current = -1;
    list.setAttribute("role", "tablist");
    list.setAttribute("aria-label", "Builds");
    function select(i) {
      if (i === current) return;
      // Entrance animation only when the visitor changes builds (not on first show or panel re-entry).
      if (current !== -1) {
        sc.classList.add("is-switching");
        clearTimeout(switchTimer);
        switchTimer = setTimeout(function () { sc.classList.remove("is-switching"); }, 700);
      }
      current = i;
      tabs.forEach(function (t, j) {
        t.setAttribute("aria-selected", j === i ? "true" : "false");
        t.tabIndex = j === i ? 0 : -1;
        items[j].classList.toggle("is-active", j === i);
      });
      // Phone chip row: bring the chosen chip into view.
      if (list.scrollWidth > list.clientWidth) list.scrollTo({ left: tabs[i].offsetLeft - 16, behavior: reduceMotion ? "auto" : "smooth" });
    }
    tabs.forEach(function (t, i) {
      t.parentNode.setAttribute("role", "presentation");
      t.setAttribute("role", "tab");
      t.id = "tab-" + items[i].id;
      t.setAttribute("aria-controls", items[i].id);
      items[i].setAttribute("role", "tabpanel");
      items[i].setAttribute("aria-labelledby", t.id);
      t.addEventListener("click", function (e) { e.preventDefault(); select(i); });
      t.addEventListener("keydown", function (e) {
        var d = (e.key === "ArrowDown" || e.key === "ArrowRight") ? 1 : (e.key === "ArrowUp" || e.key === "ArrowLeft") ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        var j = (i + d + tabs.length) % tabs.length;
        select(j);
        tabs[j].focus();
      });
      if (finePointer) {
        t.addEventListener("pointerenter", function () { clearTimeout(hoverTimer); hoverTimer = setTimeout(function () { select(i); }, 150); });
        t.addEventListener("pointerleave", function () { clearTimeout(hoverTimer); });
      }
    });
    sc.classList.add("is-tabbed");
    select(0);
  });

  /* ---------- Desktop panels ----------
     At ≥ 900×620 the home page becomes one full-screen panel at a
     time (html.is-panels). Nav links, ⌘K, the dot rail, keys, wheel
     and swipes switch panels; each panel scrolls on its own first if
     it overflows. Smaller screens (and no JS) keep a normal scrolling
     page. */
  var panels = Array.prototype.slice.call(document.querySelectorAll(".panel"));
  var panelMQ = window.matchMedia ? window.matchMedia("(min-width: 900px) and (min-height: 620px)") : null;
  var panelsOn = false, currentPanel = null, rail = null, nextBtn = null, leaveTimer = null;
  var lastSwitch = 0, lastWheel = 0, wheelUsed = false, touchY = null;

  function panelFor(hash) {
    if (!hash || hash.charAt(0) !== "#" || hash.length < 2) return null;
    if (hash === "#top") return panels[0] || null;
    var el = document.getElementById(hash.slice(1));
    return el && el.closest(".panel");
  }
  function panelLabel(p) {
    var link = document.querySelector('.nav-links a[href="#' + p.id + '"]');
    return link ? link.textContent.trim() : "Home";
  }
  // Signature entrance effects (chip stagger, career line) replay once the
  // panel has landed, so they never compete with the slide itself.
  var SIGNATURE = ".stack.reveal, .path.reveal";
  function syncPanelUI() {
    var i = panels.indexOf(currentPanel), last = i === panels.length - 1;
    Array.prototype.forEach.call(rail.children, function (b, j) { b.setAttribute("aria-current", j === i ? "true" : "false"); });
    nextBtn.textContent = last ? "Back to top" : panelLabel(panels[i + 1]);
    nextBtn.classList.toggle("is-last", last);
    document.querySelectorAll(".nav-links a").forEach(function (l) { l.classList.toggle("is-active", l.getAttribute("href") === "#" + currentPanel.id); });
    if (bar) bar.style.transform = "scaleX(" + (panels.length > 1 ? i / (panels.length - 1) : 0) + ")";
  }
  function showPanel(next, opts) {
    opts = opts || {};
    if (!next || next === currentPanel) return;
    var from = currentPanel, animate = from && !reduceMotion && !opts.instant;
    root.style.setProperty("--dir", from && panels.indexOf(from) > panels.indexOf(next) ? -1 : 1);
    clearTimeout(leaveTimer);
    panels.forEach(function (p) { p.classList.remove("is-leaving", "is-moving"); });
    if (from) {
      from.classList.remove("is-current");
      if (animate) from.classList.add("is-leaving");
    }
    next.classList.add("is-current");
    next.scrollTop = 0;
    if (animate) {
      var signature = next.querySelectorAll(SIGNATURE);
      signature.forEach(function (el) { el.classList.remove("is-visible"); });
      next.classList.add("is-entering", "is-moving");
      void next.offsetWidth;   // the only forced layout: commit the start state, then transition to rest
      next.classList.remove("is-entering");
      leaveTimer = setTimeout(function () {
        from.classList.remove("is-leaving");
        next.classList.remove("is-moving");
        signature.forEach(function (el) { el.classList.add("is-visible"); });
      }, 600);
    }
    currentPanel = next;
    lastSwitch = performance.now();
    if (opts.push && history.pushState) history.pushState(null, "", next === panels[0] ? location.pathname + location.search : "#" + next.id);
    syncPanelUI();
    if (opts.focus) {
      next.setAttribute("tabindex", "-1");
      next.focus({ preventScroll: true });
    }
  }
  function stepPanel(d) {
    var i = panels.indexOf(currentPanel) + d;
    if (i >= 0 && i < panels.length) showPanel(panels[i], { push: true });
  }
  function buildPanelUI() {
    rail = document.createElement("nav");
    rail.className = "panel-rail";
    rail.setAttribute("aria-label", "Sections");
    panels.forEach(function (p) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "rail-dot";
      b.setAttribute("aria-label", panelLabel(p));
      b.setAttribute("data-label", panelLabel(p));
      b.addEventListener("click", function () { showPanel(p, { push: true, focus: true }); });
      rail.appendChild(b);
    });
    nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.className = "panel-next";
    nextBtn.addEventListener("click", function () {
      var i = panels.indexOf(currentPanel);
      showPanel(i === panels.length - 1 ? panels[0] : panels[i + 1], { push: true });
    });
    body.appendChild(rail);
    body.appendChild(nextBtn);
  }
  function setPanels(on) {
    if (!panels.length || on === panelsOn) return;
    var keep = currentPanel;
    if (on) {
      // Start on the linked panel, or the one at the top of the screen.
      var start = panelFor(location.hash);
      for (var k = 0; !start && k < panels.length; k++) {
        if (window.pageYOffset > 50 && panels[k].getBoundingClientRect().bottom > 80) start = panels[k];
      }
      panelsOn = true;
      root.classList.add("is-panels");
      // The panel slide is the entrance, so plain fade-ins are settled up front
      // (they're display:none until shown, so nothing animates now).
      document.querySelectorAll(".panel .reveal").forEach(function (el) {
        if (!el.matches(SIGNATURE)) el.classList.add("is-visible");
      });
      if (!rail) buildPanelUI();
      showPanel(start || panels[0], { instant: true });
    } else {
      panelsOn = false;
      root.classList.remove("is-panels");
      panels.forEach(function (p) { p.classList.remove("is-current", "is-leaving", "is-entering", "is-moving"); });
      currentPanel = null;
      if (keep && keep !== panels[0]) keep.scrollIntoView();
      document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("is-visible"); });
      updateScrollUI();
    }
  }
  function panelInputBlocked() {
    return !panelsOn || root.classList.contains("intro-on") || (cmdk && cmdk.open);
  }
  // Inside an overflowing panel, scroll it first; switch only at its edge.
  function canScrollInside(d) {
    var p = currentPanel;
    return d > 0 ? p.scrollTop + p.clientHeight < p.scrollHeight - 2 : p.scrollTop > 2;
  }
  if (panels.length && panelMQ) {
    setPanels(panelMQ.matches);
    var onPanelMQ = function (e) { setPanels(e.matches); };
    if (panelMQ.addEventListener) panelMQ.addEventListener("change", onPanelMQ);
    else if (panelMQ.addListener) panelMQ.addListener(onPanelMQ);

    // One switch per wheel/trackpad gesture: momentum events keep arriving
    // less than 120 ms apart, so they count as the same gesture.
    window.addEventListener("wheel", function (e) {
      if (panelInputBlocked() || e.ctrlKey || Math.abs(e.deltaY) < 4) return;
      var now = performance.now(), d = e.deltaY > 0 ? 1 : -1;
      if (now - lastWheel > 120) wheelUsed = false;
      lastWheel = now;
      if (wheelUsed || canScrollInside(d) || now - lastSwitch < 650) return;
      wheelUsed = true;
      stepPanel(d);
    }, { passive: true });

    window.addEventListener("touchstart", function (e) { touchY = e.touches[0].clientY; }, { passive: true });
    window.addEventListener("touchend", function (e) {
      if (touchY === null || panelInputBlocked()) return;
      var dy = touchY - e.changedTouches[0].clientY, d = dy > 0 ? 1 : -1;
      touchY = null;
      if (Math.abs(dy) > 50 && !canScrollInside(d) && performance.now() - lastSwitch > 650) stepPanel(d);
    }, { passive: true });

    document.addEventListener("keydown", function (e) {
      if (panelInputBlocked() || e.altKey || e.ctrlKey || e.metaKey) return;
      var t = e.target, k = e.key, d = 0;
      if (t.closest && t.closest("input, textarea, select, [role=tab]")) return;
      if (k === " " && t.closest && t.closest("a, button")) return;
      if (k === "ArrowDown" || k === "PageDown" || (k === " " && !e.shiftKey)) d = 1;
      else if (k === "ArrowUp" || k === "PageUp" || (k === " " && e.shiftKey)) d = -1;
      else if (k === "Home" || k === "End") {
        e.preventDefault();
        showPanel(panels[k === "Home" ? 0 : panels.length - 1], { push: true });
        return;
      }
      if (!d) return;
      e.preventDefault();
      if (canScrollInside(d)) { currentPanel.scrollBy({ top: d * currentPanel.clientHeight * 0.8, behavior: reduceMotion ? "auto" : "smooth" }); return; }
      if (performance.now() - lastSwitch > 350) stepPanel(d);
    });

    window.addEventListener("popstate", function () {
      if (panelsOn) showPanel(panelFor(location.hash) || panels[0]);
    });
  }

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
    if (jump && !e.defaultPrevented && panelsOn) {
      var target = panelFor(jump.getAttribute("href"));
      if (target) { e.preventDefault(); setNav(false); showPanel(target, { push: true, focus: true }); return; }
    }
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
    var target = panelsOn && panelFor(c.href);
    if (target) { showPanel(target, { push: true, focus: true }); return; }
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
