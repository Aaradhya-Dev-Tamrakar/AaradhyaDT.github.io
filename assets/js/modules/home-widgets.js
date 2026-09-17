/* ============================================================
   HOME WIDGETS — index.html-only status widgets (v54.19)
   Kathmandu clock · live date labels · last-commit badge.
   Loaded globally via script.js MODULES; every widget is
   element-guarded so it no-ops on all other pages.
   ============================================================ */
(function () {
  'use strict';

  /* ── Digital clock — Kathmandu local time, status card ──── */
  function initStatusClock() {
    var el = document.getElementById('statusClockTime');
    if (!el || el.dataset.clockBound) return;
    el.dataset.clockBound = '1';
    var fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kathmandu',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false
    });
    function tick() { el.textContent = fmt.format(new Date()); }
    tick();
    setInterval(tick, 1000);
  }

  /* ── Live date auto-update: Fuse week + BEI semester ────── */
  function initLiveDates() {
    if (!window.applyLiveDates) return;
    window.applyLiveDates({
      'live-hero-tag': function (L) { return L.heroTag; },
      'live-focus': function (L) {
        var propDeadline = new Date(2026, 6, 2); // Jul 2 2026
        var defenceDate = new Date(2026, 6, 10); // Jul 10 2026
        var now = new Date();
        var propPart = now < propDeadline
          ? 'SPARK proposal due Jul 2'
          : now < defenceDate
            ? 'SPARK proposal defended · Major Project'
            : 'SPARK Major Project — proposal defended'
          ;
        return propPart + ' · ' + L.fuseLabel;
      },
      'live-fellowship': function (L) {
        return L.fuseLabel + ' · NSSR DataCamp (C2)';
      },
      'live-stat-sem': function (L) {
        return 'BEI ' + L.semLabel + ' at KEC, IOE';
      }
    });
  }

  /* ── Last-commit widget — static, offline-safe ─────────────
     Reads assets/js/last-commit.json, a file written by the
     "Stamp last commit" GitHub Action on every push to main.
     Same-origin local read: works online, offline, and from a
     downloaded copy alike (no api.github.com dependency). */
  function initLastCommitBadge() {
    var el = document.getElementById('live-last-updated');
    if (!el || el.dataset.commitBound) return;
    el.dataset.commitBound = '1';

    function pad(n) { return String(n).padStart(2, '0'); }

    function formatDateTime(isoString) {
      var d = new Date(isoString);
      return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
        ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
    }

    fetch('assets/js/last-commit.json', { cache: 'no-store' })
      .then(function (res) {
        if (!res.ok) throw new Error('status ' + res.status);
        return res.json();
      })
      .then(function (data) {
        el.textContent = formatDateTime(data.date);
        el.title = data.shortSha + ' — ' + data.message;
      })
      .catch(function (err) {
        // Only reachable if last-commit.json is missing/malformed
        // (e.g. before the Action has run once) — not when offline.
        el.textContent = 'Last commit unavailable';
        console.warn('last-commit widget:', err);
      });
  }

  /* ── Hero Center Crest Scroll Fade ───────────────────────── */
  function initHeroCrestScrollFade() {
    var crest = document.getElementById('heroCrestCenter');
    if (!crest || crest.dataset.fadeBound) return;
    crest.dataset.fadeBound = '1';

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var ticking = false;
    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          var y = window.pageYOffset || document.documentElement.scrollTop || 0;
          var fadeDistance = 420;
          var p = Math.min(y / fadeDistance, 1);
          var opacity = Math.max(0, 1 - Math.pow(p, 1.2));
          var scale = 1 - p * 0.08;
          var translateY = y * 0.32;
          crest.style.opacity = opacity.toFixed(3);
          crest.style.transform = 'translate3d(0, ' + translateY.toFixed(1) + 'px, 0) scale(' + scale.toFixed(3) + ')';
          crest.style.pointerEvents = p >= 0.95 ? 'none' : 'auto';
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function bootHomeWidgets() {
    initStatusClock();
    initLastCommitBadge();
    initHeroCrestScrollFade();
    initLiveDates(); // last — depends on core.js applyLiveDates labels
  }

  /* Run after all modules load so window.applyLiveDates exists;
     bootSite's own .then callback registered earlier always runs
     first, preserving the original inline-script ordering. */
  if (window.__modulesLoadedPromise && typeof window.__modulesLoadedPromise.then === 'function') {
    window.__modulesLoadedPromise.then(bootHomeWidgets);
  } else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootHomeWidgets);
  } else {
    bootHomeWidgets();
  }
})();
