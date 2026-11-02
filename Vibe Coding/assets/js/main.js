/* ============================================================
   PM Portfolio — interactions
   Vanilla JS, no dependencies. Theme toggle, mobile nav,
   scroll reveal, scrollspy, footer year.
   ============================================================ */
(function () {
  "use strict";
  var root = document.documentElement;

  /* ---------- Theme ---------- */
  var stored = null;
  try { stored = localStorage.getItem("pm-theme"); } catch (e) {}
  var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  setTheme(stored || (prefersDark ? "dark" : "light"));

  function setTheme(theme) {
    root.setAttribute("data-theme", theme);
    try { localStorage.setItem("pm-theme", theme); } catch (e) {}
    document.querySelectorAll("[data-theme-icon]").forEach(function (el) {
      el.textContent = theme === "dark" ? "\u2600\uFE0F" : "\uD83C\uDF19";
    });
    document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
      btn.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
      btn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
    });
  }

  document.addEventListener("click", function (e) {
    var themeBtn = e.target.closest("[data-theme-toggle]");
    if (themeBtn) {
      e.preventDefault();
      setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
      return;
    }
    var navToggle = e.target.closest("[data-nav-toggle]");
    if (navToggle) { e.preventDefault(); document.body.classList.toggle("nav-open"); return; }
    if (e.target.closest(".nav-links a")) { document.body.classList.remove("nav-open"); }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") document.body.classList.remove("nav-open");
  });

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
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

  /* ---------- Scroll progress bar ---------- */
  var bar = document.createElement("div");
  bar.className = "progress-bar";
  bar.setAttribute("aria-hidden", "true");
  document.body.appendChild(bar);
  function updateProgress() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - doc.clientHeight;
    var top = window.pageYOffset || doc.scrollTop || 0;
    bar.style.width = (max > 0 ? (top / max) * 100 : 0) + "%";
  }
  if (!reduceMotion) {
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    updateProgress();
  }

  /* ---------- Back to top ---------- */
  var toTop = document.createElement("button");
  toTop.className = "to-top";
  toTop.type = "button";
  toTop.setAttribute("aria-label", "Back to top");
  toTop.innerHTML = "\u2191";
  document.body.appendChild(toTop);
  toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });
  function toggleToTop() {
    toTop.classList.toggle("is-visible", (window.pageYOffset || document.documentElement.scrollTop || 0) > 600);
  }
  window.addEventListener("scroll", toggleToTop, { passive: true });
  toggleToTop();

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

  /* ---------- Filterable work grid ---------- */
  var filterBar = document.querySelector("[data-filter-bar]");
  if (filterBar) {
    var workCards = Array.prototype.slice.call(document.querySelectorAll("[data-tags]"));
    filterBar.addEventListener("click", function (e) {
      var btn = e.target.closest(".filter-btn");
      if (!btn) return;
      var filter = btn.getAttribute("data-filter");
      filterBar.querySelectorAll(".filter-btn").forEach(function (b) {
        b.setAttribute("aria-pressed", b === btn ? "true" : "false");
      });
      workCards.forEach(function (card) {
        var tags = (card.getAttribute("data-tags") || "").split(/\s+/);
        var show = filter === "all" || tags.indexOf(filter) !== -1;
        card.classList.toggle("is-hidden", !show);
      });
    });
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

  /* ---------- Toast + copy email ---------- */
  var toast = document.createElement("div");
  toast.className = "toast";
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  document.body.appendChild(toast);
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
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); resolve(); } catch (err) { reject(err); }
      document.body.removeChild(ta);
    });
  }
  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-copy]");
    if (!el) return;
    e.preventDefault();
    var text = el.getAttribute("data-copy");
    copyText(text).then(
      function () { showToast("Copied " + text + " \u2713"); },
      function () { showToast("Copy failed \u2014 " + text); }
    );
  });

  /* ---------- Lightbox ---------- */
  var lbImages = document.querySelectorAll("img[data-lightbox]");
  if (lbImages.length) {
    var lb = document.createElement("div");
    lb.className = "lightbox";
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.setAttribute("aria-label", "Image preview");
    lb.innerHTML = '<button class="lightbox-close" type="button" aria-label="Close image preview">\u2715</button>';
    var lbImg = document.createElement("img");
    lbImg.alt = "";
    lb.insertBefore(lbImg, lb.firstChild);
    document.body.appendChild(lb);
    function openLb(src, alt) {
      lbImg.src = src; lbImg.alt = alt || "";
      lb.classList.add("is-open");
      lb.querySelector(".lightbox-close").focus();
    }
    function closeLb() {
      lb.classList.remove("is-open");
      lbImg.removeAttribute("src");
    }
    lbImages.forEach(function (img) {
      img.addEventListener("click", function () { openLb(img.currentSrc || img.src, img.alt); });
    });
    lb.addEventListener("click", function (e) {
      if (e.target === lb || e.target.closest(".lightbox-close")) closeLb();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && lb.classList.contains("is-open")) closeLb();
    });
  }

  /* ---------- Estimated read time ---------- */
  var rtEls = document.querySelectorAll("[data-read-time]");
  if (rtEls.length) {
    var scope = document.querySelector("main") || document.body;
    var words = (scope.innerText || scope.textContent || "").trim().split(/\s+/).filter(Boolean).length;
    var mins = Math.max(1, Math.round(words / 200));
    rtEls.forEach(function (el) { el.textContent = "\u2248 " + mins + " min read"; });
  }
})();