/* ============================================================
   LUMIO — Scroll Scene
   Scrubs the moon-walk footage from the page scroll position and
   pushes the camera "into the world" the further you travel.
   Runs on every page; the fixed <div class="scene"> lives behind
   all content.
   ============================================================ */
(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const scene  = document.querySelector(".scene");
  const video  = document.getElementById("scene-video");
  const pulse  = document.querySelector(".scene__pulse");

  /* ---------- 1. Scroll-driven scene ----------
     Driven by the scroll event so it works in every context.
     When the page is visible we ease the video seek over a few rAF
     frames (smooth scrubbing, no decoder thrash); when rAF is
     unavailable/throttled (e.g. a hidden tab) we snap synchronously
     so the scene always tracks the scroll position. */
  if (scene && video) {
    let duration = 0;
    let targetP = 0;       // scroll progress 0..1 we want to reach
    let shownTime = 0;     // video time currently applied (eased)
    let raf = null;

    // Detect phones / touch / data-saver: the moon-walk master is a 4K
    // ~29 MB file — far too heavy to scrub on a phone. In "lite" mode we
    // skip the download entirely and keep the poster with a lighter
    // scroll parallax, so mobile still gets the dive-in feel without the cost.
    const conn = navigator.connection || {};
    const isLite =
      window.matchMedia("(max-width: 768px)").matches ||
      window.matchMedia("(pointer: coarse)").matches ||
      conn.saveData === true;

    // Prime the video so the browser decodes/buffers it and seeking
    // becomes responsive. Muted + playsinline keeps autoplay policies happy.
    function prime() {
      const p = video.play();
      if (p && p.then) {
        p.then(function () { video.pause(); }).catch(function () {});
      } else {
        try { video.pause(); } catch (e) {}
      }
    }

    function scrollProgress() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) return 0;
      const p = window.scrollY / max;
      return p < 0 ? 0 : p > 1 ? 1 : p;
    }

    function setVideoTime(t) {
      if (!duration) return;
      if (Math.abs(t - video.currentTime) > 0.015) {
        try { video.currentTime = t; } catch (e) { /* seek in progress */ }
      }
    }

    // Eased smoothing toward the target — used only when visible.
    function ease() {
      raf = null;
      const target = targetP * duration;
      shownTime += (target - shownTime) * 0.18;
      setVideoTime(shownTime);
      applyDepth(targetP);
      if (Math.abs(shownTime - target) > 0.008 && !document.hidden) {
        raf = requestAnimationFrame(ease);
      } else {
        shownTime = target; // settle exactly
      }
    }

    function onScroll() {
      targetP = scrollProgress();
      if (document.hidden || prefersReduced) {
        // No rAF budget (or motion reduced): apply immediately.
        shownTime = targetP * duration;
        setVideoTime(shownTime);
        applyDepth(targetP);
      } else if (!raf) {
        raf = requestAnimationFrame(ease);
      }
    }

    /* ---------- 2. "Dive into the world" camera push ---------- */
    function applyDepth(p) {
      if (prefersReduced) return;
      // Scale up + drift toward the portal as you scroll deeper.
      const scale = 1 + p * 0.55;
      const drift = p * -2.4; // vh, subtle upward pull toward the opening
      scene.style.transform = "translateY(" + drift + "vh) scale(" + scale + ")";

      // Atmosphere brightens the deeper you go.
      const bright = 1 + p * 0.18;
      const contrast = 1 + p * 0.12;
      scene.style.filter = "brightness(" + bright + ") contrast(" + contrast + ")";

      if (pulse) pulse.style.opacity = (p * 0.85).toFixed(3);
    }

    function wireScroll() {
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
      onScroll(); // sync to initial position
    }

    function start() {
      scene.classList.add("is-ready");
      duration = video.duration || 0;
      wireScroll();
    }

    if (isLite) {
      // Abort any in-flight video fetch and keep the poster on screen.
      scene.classList.add("is-lite");
      try {
        video.preload = "none";
        const src = video.querySelector("source");
        if (src) src.removeAttribute("src");
        video.removeAttribute("src");
        video.load(); // cancels buffering of the 4K master
      } catch (e) {}
      // duration stays 0 → no seeking; applyDepth still runs on scroll.
      wireScroll();
    } else {
      video.addEventListener("loadedmetadata", function () {
        duration = video.duration || 0;
      });

      video.addEventListener("canplay", function () {
        prime();
        start();
      }, { once: true });

      // If the video can't load (file missing etc.) keep the poster and
      // still drive the depth push from scroll.
      video.addEventListener("error", start, { once: true });

      // Safety net: if neither event fired shortly after load, start anyway.
      window.addEventListener("load", function () {
        setTimeout(function () {
          if (!scene.classList.contains("is-ready")) start();
        }, 1200);
      });
    }
  }

  /* ---------- 3. Header state on scroll ---------- */
  const header = document.querySelector(".site-header");
  if (header) {
    const onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- 3b. Scroll cue: pinned to bottom, fades once scrolling ---------- */
  const cue = document.querySelector(".scroll-cue");
  if (cue) {
    const onCue = function () {
      cue.classList.toggle("is-hidden", window.scrollY > 60);
    };
    onCue();
    window.addEventListener("scroll", onCue, { passive: true });
  }

  /* ---------- 4. Mobile nav ---------- */
  const nav = document.querySelector(".nav");
  const toggle = document.querySelector(".nav__toggle");
  if (nav && toggle) {
    toggle.addEventListener("click", function () {
      nav.classList.toggle("nav--open");
    });
    nav.querySelectorAll(".nav__links a").forEach(function (a) {
      a.addEventListener("click", function () { nav.classList.remove("nav--open"); });
    });
  }

  /* ---------- 5. Reveal-on-scroll ---------- */
  const reveals = document.querySelectorAll(".reveal");
  if (reveals.length) {
    if ("IntersectionObserver" in window && !prefersReduced) {
      const io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("is-visible");
            io.unobserve(en.target);
          }
        });
      }, { threshold: 0.16 });
      reveals.forEach(function (el) { io.observe(el); });
    } else {
      reveals.forEach(function (el) { el.classList.add("is-visible"); });
    }
  }

  /* ---------- 6. AI Automation notify (coming soon) ---------- */
  const notifyForm = document.getElementById("notify-form");
  if (notifyForm) {
    const input = document.getElementById("notify-email");
    const note = document.getElementById("notify-note");
    notifyForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!input.value || !input.checkValidity()) {
        note.textContent = "Bitte gib eine gültige E-Mail-Adresse ein.";
        note.style.color = "var(--muted)";
        input.focus();
        return;
      }
      // No backend yet — confirm interest and offer a mailto fallback.
      note.innerHTML = "Danke! Wir melden uns, sobald AI Automation startet. " +
        '<a href="mailto:info@lumio-agency.de?subject=' +
        encodeURIComponent("AI Automation — bitte vormerken") +
        '&body=' + encodeURIComponent("Bitte benachrichtigt mich: " + input.value) +
        '" style="color:var(--accent-2);text-decoration:underline;">Per E-Mail bestätigen</a>';
      note.style.color = "var(--accent-2)";
      notifyForm.reset();
    });
  }
})();
