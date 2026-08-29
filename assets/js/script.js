/* ============================================================
   SHARED SCRIPT — aaradhyadt.github.io (v50.4)
   Loaded on every page via <script src="assets/js/script.js">.
   Orchestrates core modules from assets/js/modules/
   ============================================================ */

/* ── Dynamic Module Loader (v50.4) ───────────────────────────── */
window.__modulesLoadedPromise = (function () {
  const MODULES = [
    'assets/js/data/releases.js',
    'assets/js/data/search-index.js',
    'assets/js/data/resume-data.js',
    'assets/js/modules/core.js',
    'assets/js/modules/tour.js',
    'assets/js/modules/cmdk.js',
    'assets/js/modules/ui.js',
    'assets/js/modules/access.js',
    'assets/js/modules/audio.js',
    'assets/js/modules/terminal.js',
    'assets/js/modules/haptics.js',
    'assets/js/modules/home-widgets.js'
  ];

  const promises = MODULES.map(function (src) {
    var existing = document.querySelector('script[src="' + src + '"]');
    if (existing) return Promise.resolve();
    return new Promise(function (resolve) {
      var s = document.createElement('script');
      s.src = src;
      s.async = false;
      var timer = setTimeout(function () {
        console.warn('Module load timed out after 5s:', src);
        resolve();
      }, 5000);
      s.onload = function () {
        clearTimeout(timer);
        resolve();
      };
      s.onerror = function (err) {
        clearTimeout(timer);
        console.error('Failed to load module:', src, err);
        resolve();
      };
      document.head.appendChild(s);
    });
  });

  return Promise.all(promises);
})();


/* -- Static site data -----------------------------------------
   SITE_RELEASES       -> assets/js/data/releases.js
   SEARCH_STATIC_INDEX -> assets/js/data/search-index.js
   Both load ahead of the core modules via the MODULES array
   above; the dynamic loader preserves insertion order (async=false).
   ------------------------------------------------------------- */



/* ── Boot ─────────────────────────────────────────────────── */
function bootSite() {
  if (typeof initTheme === 'function') initTheme();        // must run first — sets data-theme before paint
  if (typeof initAccent === 'function') initAccent();       // sets data-accent before paint
  if (typeof computeLiveDates === 'function') computeLiveDates(); // compute before any page script reads LIVE
  if (typeof renderSiteNav === 'function') renderSiteNav();
  if (typeof setActiveNav === 'function') setActiveNav();
  if (typeof renderQuickNav === 'function') renderQuickNav();
  if (typeof initThemeToggle === 'function') initThemeToggle();
  if (typeof initAccentPicker === 'function') initAccentPicker();
  if (typeof initKeyNav === 'function') initKeyNav();
  if (typeof initStatusDate === 'function') initStatusDate();
  if (typeof initHamburger === 'function') initHamburger();
  if (typeof initScroll === 'function') initScroll();
  if (typeof initReveal === 'function') initReveal();
  if (typeof initCountUp === 'function') initCountUp();
  if (typeof initTypedCaption === 'function') initTypedCaption();
  if (typeof initCursor === 'function') initCursor();
  if (typeof initLightbox === 'function') initLightbox();
  if (typeof initGlobalSearch === 'function') initGlobalSearch();
  if (typeof initAccessControl === 'function') initAccessControl();
  if (typeof renderSiteFooter === 'function') renderSiteFooter();
  if (typeof initServiceWorker === 'function') initServiceWorker();
  if (typeof initReadingProgressBar === 'function') initReadingProgressBar();
  if (typeof initNetworkStatusListeners === 'function') initNetworkStatusListeners();
  if (typeof initTour === 'function') initTour();
  if (typeof initTouchGestures === 'function') initTouchGestures();
  if (typeof initSkillBars === 'function') initSkillBars();
  if (typeof initScrollParallax === 'function') initScrollParallax();
  if (typeof initSwipeNav === 'function') initSwipeNav();
  if (typeof initAudioCues === 'function') initAudioCues();
  if (typeof initReadingMetrics === 'function') initReadingMetrics();
  if (typeof initFilterCountIndicators === 'function') initFilterCountIndicators();
  if (typeof initSkillRadar === 'function') initSkillRadar(false);
  if (typeof scheduleGA4 === 'function') scheduleGA4();
  else if (typeof loadGA4 === 'function') window.addEventListener('load', loadGA4);
}

if (window.__modulesLoadedPromise) {
  window.__modulesLoadedPromise.then(function () {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', bootSite);
    } else {
      bootSite();
    }
  });
} else {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootSite);
  } else {
    bootSite();
  }
}


function initServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(err => {
        console.debug('ServiceWorker registration skipped or failed:', err);
      });
    });
  }
}

function initReadingProgressBar() {
  const bar = document.getElementById('readProgressBar');
  if (!bar) return;
  function updateProgress() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = Math.min(100, Math.max(0, progress)) + '%';
  }
  window.addEventListener('scroll', () => {
    requestAnimationFrame(updateProgress);
  }, { passive: true });
  updateProgress();
}

function initNetworkStatusListeners() {
  window.addEventListener('online', () => {
    showToast('Connection restored — back online');
    syncQueuedContactMessages();
  });
  window.addEventListener('offline', () => {
    showToast('You are currently offline');
  });
}

function syncQueuedContactMessages() {
  try {
    const raw = localStorage.getItem('adt_queued_contact_submissions');
    if (!raw) return;
    const list = JSON.parse(raw);
    if (!Array.isArray(list) || !list.length) return;

    const pending = list.slice();
    localStorage.removeItem('adt_queued_contact_submissions');

    pending.forEach(async (formData) => {
      try {
        const FORMSPREE_ID = "xnnjkrrn";
        const res = await fetch("https://formspree.io/f/" + FORMSPREE_ID, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          showToast(`Queued message from ${formData.name} sent successfully!`);
          if (typeof playAudioCue === 'function') playAudioCue('chime');
        } else {
          queueOfflineContactMessage(formData);
        }
      } catch (err) {
        queueOfflineContactMessage(formData);
      }
    });
  } catch (e) {
    console.warn('Sync queued contact messages:', e);
  }
}

function queueOfflineContactMessage(formData) {
  try {
    const list = JSON.parse(localStorage.getItem('adt_queued_contact_submissions') || '[]');
    list.push(formData);
    localStorage.setItem('adt_queued_contact_submissions', JSON.stringify(list));
  } catch (e) {
    console.warn('Queue offline contact message:', e);
  }
}

window.queueOfflineContactMessage = queueOfflineContactMessage;
window.syncQueuedContactMessages = syncQueuedContactMessages;