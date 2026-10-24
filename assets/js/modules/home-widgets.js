/* ============================================================

   HOME WIDGETS — index.html-only status widgets (v57.7)

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

      'live-hero-tag': function () { return 'Electronics student · Kathmandu'; },

      'live-focus': function () { return 'ML evaluation · AI workflow tooling · SPARK'; },

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



  /* ── Exploration Dropdown & Panel Switcher ─────────────────

     Ties "A closer look at how I work." (.exploration-highlight)

     to the panels below. Clicking any card (Dev terminal, Shortcuts &

     controls, Research & specs) toggles open ONLY that specific section.

     Clicking an active card toggles it closed. Deep links (#terminal-section,

     #keymap, #about-sign-in) and tour steps reveal the matching panel. */

  function initExplorationDropdown() {

    var toolsSec = document.getElementById('site-tools');

    var panelsWrap = document.getElementById('explorationPanelsWrap');

    if (!toolsSec || !panelsWrap) return;

    if (toolsSec.dataset.dropdownBound) return;

    toolsSec.dataset.dropdownBound = '1';



    var links = Array.from(toolsSec.querySelectorAll('.exploration-link'));

    var panels = Array.from(panelsWrap.querySelectorAll('.exploration-panel'));



    function closeAllPanels() {

      panels.forEach(function (p) {

        p.setAttribute('hidden', '');

        p.classList.remove('is-open');

      });

      links.forEach(function (lnk) {

        lnk.classList.remove('is-active');

        lnk.setAttribute('aria-expanded', 'false');

        lnk.setAttribute('aria-selected', 'false');

        var actEl = lnk.querySelector('.exploration-action');

        if (actEl && actEl.dataset.default) {

          actEl.textContent = actEl.dataset.default;

        }

      });

    }



    function openPanel(panelId, shouldScroll, focusTarget) {

      var targetPanel = document.getElementById(panelId);

      if (!targetPanel) return;



      var wasOpen = !targetPanel.hasAttribute('hidden') && targetPanel.classList.contains('is-open');



      closeAllPanels();



      if (!wasOpen) {

        targetPanel.removeAttribute('hidden');

        targetPanel.classList.add('is-open');



        var activeLink = links.find(function (lnk) {

          return lnk.getAttribute('data-target') === panelId || lnk.getAttribute('aria-controls') === panelId;

        });

        if (activeLink) {

          activeLink.classList.add('is-active');

          activeLink.setAttribute('aria-expanded', 'true');

          activeLink.setAttribute('aria-selected', 'true');

          var actEl = activeLink.querySelector('.exploration-action');

          if (actEl && actEl.dataset.active) {

            actEl.textContent = actEl.dataset.active;

          }

        }



        // Trigger reveal animations on contents

        targetPanel.querySelectorAll('.reveal').forEach(function (el) {

          el.classList.add('visible');

        });



        // Scroll into view at section-header level (cleanly below fixed navbar) for all 3 options

        if (shouldScroll) {

          setTimeout(function () {

            var header = targetPanel.querySelector('.section-header') || targetPanel;

            var nav = document.querySelector('nav') || document.getElementById('navbar') || document.querySelector('.nav');

            var navHeight = nav ? nav.offsetHeight : 76;

            var rect = header.getBoundingClientRect();

            var targetY = window.pageYOffset + rect.top - (navHeight + 20);

            window.scrollTo({

              top: Math.max(0, targetY),

              behavior: 'smooth'

            });

          }, 60);

        }



        // Focus terminal input without hijacking scroll position

        if (panelId === 'panel-terminal') {

          var input = targetPanel.querySelector('.terminal-input');

          if (input && focusTarget !== false) {

            setTimeout(function () {

              try {

                input.focus({ preventScroll: true });

              } catch (e) {

                // older browsers

              }

            }, 350);

          }

        }



        if (typeof playAudioCue === 'function') playAudioCue('click');

      } else {

        if (typeof playAudioCue === 'function') playAudioCue('pop');

      }

    }



    // Bind link clicks

    links.forEach(function (lnk) {

      lnk.addEventListener('click', function (e) {

        e.preventDefault();

        var targetId = lnk.getAttribute('data-target') || lnk.getAttribute('aria-controls');

        if (!targetId) {

          var href = lnk.getAttribute('href') || '';

          if (href.indexOf('terminal') !== -1) targetId = 'panel-terminal';

          else if (href.indexOf('keymap') !== -1) targetId = 'panel-keymap';

          else if (href.indexOf('about') !== -1 || href.indexOf('sign-in') !== -1) targetId = 'panel-research';

        }

        if (targetId) {

          openPanel(targetId, true);

        }

      });

    });



    // Bind close buttons inside each panel footer

    panelsWrap.querySelectorAll('[data-close-target]').forEach(function (btn) {

      btn.addEventListener('click', function () {

        closeAllPanels();

        var nav = document.querySelector('nav') || document.getElementById('navbar') || document.querySelector('.nav');

        var navHeight = nav ? nav.offsetHeight : 76;

        var rect = toolsSec.getBoundingClientRect();

        var targetY = window.pageYOffset + rect.top - (navHeight + 20);

        window.scrollTo({

          top: Math.max(0, targetY),

          behavior: 'smooth'

        });

        if (typeof playAudioCue === 'function') playAudioCue('pop');

      });

    });



    // Expose globally so tour, CMDK, or external callers can open any panel

    window.openExplorationPanel = function (panelOrSectionId, shouldScroll) {

      var map = {

        'terminal': 'panel-terminal',

        'terminal-section': 'panel-terminal',

        'adtTerminal': 'panel-terminal',

        'panel-terminal': 'panel-terminal',

        'keymap': 'panel-keymap',

        'panel-keymap': 'panel-keymap',

        'about-sign-in': 'panel-research',

        'vip-exclusive': 'panel-research',

        'master-exclusive': 'panel-research',

        'research': 'panel-research',

        'panel-research': 'panel-research'

      };

      var target = map[panelOrSectionId] || panelOrSectionId;

      openPanel(target, shouldScroll !== false);

    };



    // Check location.hash on load and on hashchange

    function checkHash() {

      if (!location.hash) return;

      var hash = location.hash.replace(/^#/, '');

      if (['terminal-section', 'adtTerminal', 'panel-terminal'].indexOf(hash) !== -1) {

        openPanel('panel-terminal', true);

      } else if (['keymap', 'panel-keymap'].indexOf(hash) !== -1) {

        openPanel('panel-keymap', true);

      } else if (['about-sign-in', 'vip-exclusive', 'master-exclusive', 'panel-research'].indexOf(hash) !== -1) {

        openPanel('panel-research', true);

      }

    }



    window.addEventListener('hashchange', checkHash);

    checkHash();

  }



  /* ── Dynamic N-Sided Star Hero Affiliations (v57.1) ────────── */

  var DEFAULT_AFFILIATIONS = [

    {

      id: 'fusemachines',

      name: 'Fuse AI Fellow',

      org: 'Fusemachines',

      logo: 'assets/images/logos/fusemachines-circle.webp',

      url: 'experience.html#exp-fuse'

    },

    {

      id: 'ieee-kec',

      name: 'IEEE Vice Chair',

      org: 'IEEE KEC KTM Student Branch',

      logo: 'assets/images/logos/ieee-kec.webp',

      url: 'experience.html#exp-ieee-vicechair'

    },

    {

      id: 'nssr',

      name: 'NSSR Fellow',

      org: 'NSSR Nepal (DataCamp)',

      logo: 'assets/images/logos/nssr.webp',

      url: 'experience.html#exp-nssr'

    },

    {

      id: 'makerspace',

      name: 'Makerspace Lead',

      org: 'KEC Makerspace (Robotics)',

      logo: 'assets/images/logos/makerspace.webp',

      url: 'experience.html#exp-makerspace'

    },

    {

      id: 'epc-club',

      name: 'EPC Event Mgr',

      org: 'Engineering Project Club',

      logo: 'assets/images/logos/epc-club.webp',

      url: 'experience.html#exp-epc'

    }

  ];



  function initHeroStarAffiliations(affiliationsList) {

    var stage = document.getElementById('heroStarStage');

    if (!stage) return;



    var affiliations = affiliationsList || DEFAULT_AFFILIATIONS;

    var N = affiliations.length;

    if (N < 3) return;



    var poly = document.getElementById('heroStarPolygon');

    var innerRing = document.getElementById('heroLotusInnerRing');

    var outerRing = document.getElementById('heroLotusOuterRing');

    var badgesWrap = document.getElementById('heroStarBadges');

    if (!poly || !badgesWrap) return;



    var cx = 155;

    var cy = 155;

    var rOuter = 136;

    var rInner = Math.round(rOuter * 0.50);

    var stageW = stage.clientWidth || 310;

    var badgeDist = Math.round(120 * (stageW / 310));



    // Generate 2N star polygon points

    var pts = [];

    for (var i = 0; i < N; i++) {

      var theta = -Math.PI / 2 + (i * 2 * Math.PI) / N;

      var phi = theta + Math.PI / N;



      var ox = Math.round(cx + rOuter * Math.cos(theta));

      var oy = Math.round(cy + rOuter * Math.sin(theta));

      pts.push(ox + ',' + oy);



      var ix = Math.round(cx + rInner * Math.cos(phi));

      var iy = Math.round(cy + rInner * Math.sin(phi));

      pts.push(ix + ',' + iy);

    }

    poly.setAttribute('points', pts.join(' '));



    // Dynamically build N-sided Dual-Ring Interlocking Tang Lotus blades with coaxial 120px circle sockets

    if (innerRing && outerRing) {

      var innerHtml = '<circle cx="155" cy="155" r="155" fill="none" stroke="none" /><circle class="lotus-mech-ring" cx="155" cy="155" r="108" />';

      var outerHtml = '<circle cx="155" cy="155" r="155" fill="none" stroke="none" /><circle class="lotus-core-ring" cx="155" cy="155" r="99" />';

      for (var b = 0; b < N; b++) {

        var deg = Math.round(((b * 360) / N) * 100) / 100;

        var phiDeg = Math.round((deg + 180 / N) * 100) / 100;

        innerHtml +=

          '<g class="lotus-blade lotus-blade--secondary" style="--rot: ' + phiDeg + 'deg; --i: ' + b + ';">' +

          '<path class="lotus-crystal-light" d="M 155 10 Q 145 31 136 48 Q 131 64 142 82 L 155 88 Z" /><path class="lotus-crystal-dark" d="M 155 10 Q 165 31 174 48 Q 179 64 168 82 L 155 88 Z" /><path class="lotus-crystal-filigree" d="M 155 19 Q 147 35 140 50 Q 137 62 146 75 L 155 80 L 164 75 Q 173 62 170 50 Q 163 35 155 19 Z" /><line class="lotus-crystal-spine" x1="155" y1="11" x2="155" y2="82" />' +

          '</g>';

        outerHtml +=

          '<g class="lotus-blade lotus-blade--primary" style="--rot: ' + deg + 'deg; --i: ' + b + ';">' +

          '<path class="lotus-facet-light" d="M 155 -5 Q 141 14 125 30 Q 118 50 137 74 L 155 84 Z" /><path class="lotus-facet-dark" d="M 155 -5 Q 169 14 185 30 Q 192 50 173 74 L 155 84 Z" /><path class="lotus-blade-filigree" d="M 155 3 Q 144 19 131 32 Q 126 48 141 67 L 155 75 L 169 67 Q 184 48 179 32 Q 166 19 155 3 Z" /><line class="lotus-blade-spine" x1="155" y1="-4" x2="155" y2="16" /><circle class="lotus-blade-cradle" cx="155" cy="35" r="19.5" />' +

          '</g>';

      }

      innerRing.innerHTML = innerHtml;

      outerRing.innerHTML = outerHtml;

    }



    // Render / update badges

    badgesWrap.innerHTML = '';

    affiliations.forEach(function (aff, idx) {

      var angle = -Math.PI / 2 + (idx * 2 * Math.PI) / N;

      var dx = Math.round(badgeDist * Math.cos(angle));

      var dy = Math.round(badgeDist * Math.sin(angle));



      var a = document.createElement('a');

      a.href = aff.url;

      a.className = 'star-badge';

      a.style.setProperty('--dx', dx + 'px');

      a.style.setProperty('--dy', dy + 'px');

      a.style.setProperty('--i', idx);

      a.setAttribute('aria-label', aff.org + ' — ' + aff.name);



      var iconWrap = document.createElement('span');

      iconWrap.className = 'star-badge-icon-wrap';



      var img = document.createElement('img');

      img.src = aff.logo;

      img.alt = '';

      img.width = 38;

      img.height = 38;

      img.loading = 'lazy';

      img.decoding = 'async';

      iconWrap.appendChild(img);

      a.appendChild(iconWrap);



      var tip = document.createElement('span');

      tip.className = 'star-badge-tooltip';

      tip.textContent = aff.name;

      a.appendChild(tip);



      badgesWrap.appendChild(a);

    });



    if (!stage.dataset.starBound) {

      stage.dataset.starBound = '1';

      var portrait = document.getElementById('heroPortraitStage');

      if (portrait) {

        portrait.addEventListener('click', function (e) {

          if (window.matchMedia('(hover: none)').matches) {

            e.preventDefault();

            var isExp = stage.classList.toggle('is-expanded');

            portrait.setAttribute('aria-expanded', isExp ? 'true' : 'false');

          }

        });

        document.addEventListener('click', function (e) {

          if (!stage.contains(e.target)) {

            stage.classList.remove('is-expanded');

            portrait.setAttribute('aria-expanded', 'false');

          }

        });

      }

    }



    // Expose engine dynamically so new affiliations can be loaded at runtime

    window.setStarAffiliations = function (newAffiliations) {

      initHeroStarAffiliations(newAffiliations);

    };

  }



  function bootHomeWidgets() {

    initStatusClock();

    initLastCommitBadge();

    initHeroCrestScrollFade();

    initExplorationDropdown();

    initHeroStarAffiliations();

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

