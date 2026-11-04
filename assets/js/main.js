/* ============================================================
   PM Portfolio — interactions
   Vanilla JS, no dependencies. Theme toggle, mobile nav,
   scroll reveal, scrollspy, footer year.
   ============================================================ */
(function () {
  "use strict";
  var root = document.documentElement;
  var body = document.body;

  /* ---------- Theme ----------
     The inline <head> script sets the initial theme (no flash).
     Here we only sync the UI, follow OS changes until the visitor
     picks a theme, and save on manual toggle. */
  var THEME_KEY = "pm-theme";
  var darkQuery = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

  function savedTheme() {
    try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; }
  }
  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    document.querySelectorAll("[data-theme-icon]").forEach(function (el) {
      el.textContent = theme === "dark" ? "☀️" : "🌙";
    });
    document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
      btn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
    });
  }
  function toggleTheme() {
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
  }
  applyTheme(savedTheme() || (darkQuery && darkQuery.matches ? "dark" : "light"));
  if (darkQuery) {
    var onSchemeChange = function (e) { if (!savedTheme()) applyTheme(e.matches ? "dark" : "light"); };
    if (darkQuery.addEventListener) darkQuery.addEventListener("change", onSchemeChange);
    else if (darkQuery.addListener) darkQuery.addListener(onSchemeChange);
  }

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
     <img data-fallback="hide">     → its <figure> is removed.
     Also handles images that failed before this script ran. */
  function imageFallback(img) {
    var mode = img.getAttribute("data-fallback");
    if (mode === "monogram") {
      var tile = document.createElement("div");
      tile.className = "monogram";
      tile.setAttribute("role", "img");
      tile.setAttribute("aria-label", img.alt || "");
      tile.textContent = img.getAttribute("data-monogram") || "RW";
      img.replaceWith(tile);
    } else if (mode === "hide") {
      (img.closest("figure") || img).remove();
    }
  }
  document.querySelectorAll("img[data-fallback]").forEach(function (img) {
    if (img.complete && img.naturalWidth === 0) imageFallback(img);
    else img.addEventListener("error", function () { imageFallback(img); });
  });

  /* ---------- Scroll reveal ---------- */
  var reveals = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && reveals.length) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("is-visible"); ro.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { el.classList.add("reveal"); ro.observe(el); });
  }

  /* ---------- Scrollspy (active nav link) ---------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll("section[id]"));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-links a[href^="#"]'));
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

  /* ============================================================
     Tier 1 interactivity. Each block is self-contained and
     safely no-ops when its markup is absent from the page.
     ============================================================ */
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
    var doc = document.documentElement;
    var top = window.pageYOffset || doc.scrollTop || 0;
    if (bar) {
      var max = doc.scrollHeight - doc.clientHeight;
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

  /* ---------- Animated metric counters ---------- */
  var counters = document.querySelectorAll("[data-count]");
  function finalText(el) {
    var t = parseFloat(el.getAttribute("data-count"));
    var d = parseInt(el.getAttribute("data-decimals") || "0", 10);
    if (isNaN(t)) return el.textContent;
    return (el.getAttribute("data-prefix") || "") + t.toFixed(d) + (el.getAttribute("data-suffix") || "");
  }
  function runCounter(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    if (isNaN(target) || reduceMotion) { el.textContent = finalText(el); return; }
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    var duration = 1100, start = null;
    function frame(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + (target * eased).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = prefix + target.toFixed(decimals) + suffix;
    }
    requestAnimationFrame(frame);
  }
  if (counters.length) {
    if ("IntersectionObserver" in window) {
      var co = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { runCounter(entry.target); co.unobserve(entry.target); }
        });
      }, { threshold: 0.4 });
      counters.forEach(function (el) { co.observe(el); });
    } else {
      counters.forEach(function (el) { el.textContent = finalText(el); });
    }
  }

  /* ---------- Accordion (case-study sections) ---------- */
  document.querySelectorAll(".cs-section").forEach(function (section) {
    var trigger = section.querySelector(".cs-trigger");
    if (!trigger) return;
    var open = trigger.getAttribute("aria-expanded") !== "false";
    section.setAttribute("data-open", open ? "true" : "false");
    trigger.addEventListener("click", function () {
      var isOpen = section.getAttribute("data-open") === "true";
      section.setAttribute("data-open", isOpen ? "false" : "true");
      trigger.setAttribute("aria-expanded", isOpen ? "false" : "true");
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

  /* ---------- Timeline draws itself ---------- */
  var timelines = document.querySelectorAll(".timeline");
  if ("IntersectionObserver" in window && timelines.length && !reduceMotion) {
    var to = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("is-drawn"); to.unobserve(entry.target); }
      });
    }, { threshold: 0.3 });
    timelines.forEach(function (el) { el.classList.add("is-drawable"); to.observe(el); });
  }

  /* ---------- Card spotlight (fine pointers only) ---------- */
  if (!reduceMotion && window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    document.querySelectorAll(".card-hover").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", (e.clientX - r.left) + "px");
        card.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
      card.addEventListener("pointerleave", function () {
        card.style.removeProperty("--mx");
        card.style.removeProperty("--my");
      });
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
  function handleCopy(el, e) {
    // On a mailto: link, copy AND let the mail app open; elsewhere just copy.
    if (!/^mailto:/i.test(el.getAttribute("href") || "")) e.preventDefault();
    var text = el.getAttribute("data-copy");
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
    if (t.closest(".nav-links a")) setNav(false);
    var copyEl = t.closest("[data-copy]");
    if (copyEl) handleCopy(copyEl, e);
  });

  /* ---------- Lightbox ---------- */
  var lbImages = document.querySelectorAll("img[data-lightbox]");
  var lb = null, lbClose = null, lbOpener = null, closeLb = null;
  if (lbImages.length) {
    lb = document.createElement("div");
    lb.className = "lightbox";
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.setAttribute("aria-label", "Image preview");
    lb.innerHTML = '<button class="lightbox-close" type="button" aria-label="Close image preview">✕</button>';
    var lbImg = document.createElement("img");
    lbImg.alt = "";
    lb.insertBefore(lbImg, lb.firstChild);
    body.appendChild(lb);
    lbClose = lb.querySelector(".lightbox-close");
    var openLb = function (img) {
      lbOpener = img;
      lbImg.src = img.currentSrc || img.src; lbImg.alt = img.alt || "";
      lb.classList.add("is-open");
      lbClose.focus();
    };
    closeLb = function () {
      lb.classList.remove("is-open");
      lbImg.removeAttribute("src");
      if (lbOpener && document.contains(lbOpener)) lbOpener.focus();
    };
    lbImages.forEach(function (img) {
      img.tabIndex = 0;
      img.setAttribute("role", "button");
      img.addEventListener("click", function () { openLb(img); });
      img.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLb(img); }
      });
    });
    lb.addEventListener("click", function (e) {
      if (e.target === lb || e.target.closest(".lightbox-close")) closeLb();
    });
  }

  /* ---------- Keyboard: Esc + lightbox focus trap ---------- */
  document.addEventListener("keydown", function (e) {
    var lbOpen = lb && lb.classList.contains("is-open");
    if (e.key === "Escape") {
      if (lbOpen) closeLb();
      else setNav(false);
    } else if (e.key === "Tab" && lbOpen) {
      e.preventDefault();
      lbClose.focus();
    }
  });

  /* ---------- Command palette (⌘K / Ctrl+K) ----------
     Commands come from the page itself (nav links, résumé link,
     footer email/LinkedIn), so new pages need no extra setup. */
  var isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  if (!isMac) document.querySelectorAll("[data-kbd]").forEach(function (el) { el.textContent = "Ctrl K"; });

  var brandLink = document.querySelector(".brand");
  var base = brandLink ? (brandLink.getAttribute("href") || "").replace(/(home\.html.*|#top)$/, "") : "";
  var commands = [];
  document.querySelectorAll(".nav-links a").forEach(function (a) {
    commands.push({ label: a.textContent.trim(), hint: "Section", href: a.getAttribute("href") });
  });
  commands.push({ label: "Home", hint: "Page", href: base + "home.html" });
  commands.push({ label: "All case studies", hint: "Page", href: base + "case-studies/case-studies-list.html" });
  var resumeLink = document.querySelector(".nav-actions a[download]");
  if (resumeLink) commands.push({ label: "Download résumé", hint: "PDF", href: resumeLink.getAttribute("href"), download: true });
  var footerEmail = document.querySelector(".site-footer [data-copy]");
  if (footerEmail) {
    var email = footerEmail.getAttribute("data-copy");
    commands.push({ label: "Copy email address", hint: email, run: function () {
      copyText(email).then(function () { showToast("Copied " + email + " ✓"); }, function () { showToast("Copy failed — " + email); });
    } });
  }
  var footerLinkedIn = document.querySelector('.site-footer a[href*="linkedin.com"]');
  if (footerLinkedIn) commands.push({ label: "Open LinkedIn", hint: "New tab", href: footerLinkedIn.getAttribute("href"), newTab: true });
  commands.push({ label: "Toggle dark mode", hint: "Theme", run: toggleTheme });

  var cmdk = null, cmdkInput, cmdkList, cmdkMatches = [], cmdkIndex = 0;
  function buildPalette() {
    cmdk = document.createElement("dialog");
    cmdk.className = "cmdk";
    cmdk.setAttribute("aria-label", "Jump to");
    cmdk.innerHTML =
      '<input class="cmdk-input" type="text" placeholder="Jump to…" aria-label="Search pages and actions" ' +
      'role="combobox" aria-expanded="true" aria-controls="cmdk-list" aria-autocomplete="list" autocomplete="off" />' +
      '<ul class="cmdk-list" id="cmdk-list" role="listbox"></ul>' +
      '<p class="cmdk-foot">↑↓ to move · Enter to open · Esc to close</p>';
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

  /* ---------- Estimated read time ---------- */
  var rtEls = document.querySelectorAll("[data-read-time]");
  if (rtEls.length) {
    var panels = document.querySelectorAll(".cs-panel");
    var text = panels.length
      ? Array.prototype.map.call(panels, function (p) { return p.textContent; }).join(" ")
      : (document.querySelector("main") || body).textContent;
    var words = text.trim().split(/\s+/).filter(Boolean).length;
    var mins = Math.max(1, Math.round(words / 200));
    rtEls.forEach(function (el) { el.textContent = "≈ " + mins + " min read"; });
  }
})();
