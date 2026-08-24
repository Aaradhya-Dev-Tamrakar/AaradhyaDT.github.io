/* ============================================================
   SHARED SCRIPT — aaradhyadt.github.io (v49.39)
   Loaded on every page via <script src="assets/js/script.js">.
   Orchestrates core modules from assets/js/modules/
   ============================================================ */

/* ── Dynamic Module Loader (v49.39) ───────────────────────────── */
window.__modulesLoadedPromise = (function () {
  const MODULES = [
    'assets/js/modules/core.js',
    'assets/js/modules/tour.js',
    'assets/js/modules/cmdk.js',
    'assets/js/modules/ui.js',
    'assets/js/modules/access.js',
    'assets/js/modules/audio.js',
    'assets/js/modules/terminal.js',
    'assets/js/modules/haptics.js'
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


/* ── Site release history ─────────────────────────────────── */
const SITE_RELEASES = [
  {
    version: 'v49.39',
    date: '2026-08-19',
    sha: 'xtool20',
    title: 'xTool Laser Safety Awareness Training & Printer Maintenance Certifications',
    highlights: [
      'Certifications: Added xTool Laser Safety Awareness Training (achv-37) & Printer Maintenance Certification (achv-38) with WebP previews & PDF downloads',
      'Makerspace Integration: Tagged under Academic Certifications in collaboration with KEC Makerspace',
      'Search & Tour: Updated search static index and site tour metrics to 39 verified achievements',
      'Hygiene: Passed complete 22-category verification suite'
    ]
  },
  {
    version: 'v48',
    date: '2026-08-16',
    sha: '6c92142',
    title: 'Multi-Category Project Filters, ATS Multi-Format Exporter & Security Suite',
    highlights: [
      'Projects: Added dynamic category filter pill bar (All, AI/ML, Robotics/Embedded, Hardware, Web/Apps) with real-time count badges and smooth transitions',
      'ATS Resume Generator: One-click Copy ATS Plain Text and Download Markdown (.md) multi-format exports directly from the modal',
      'Offline Resilience: Contact form offline submission queue with automatic background synchronization on network reconnect',
      'Security & CLI: Client-side passcode brute-force rate limiting with 30s cooldown and new Dev Terminal navigation commands (goto, cv, email, filter)',
      'PWA & Cache: Bumped Service Worker cache to aaradhya-portfolio-v48'
    ]
  },
  {
    version: 'v47',
    date: '2026-08-14',
    sha: 'upg47',
    title: 'Comprehensive Upgrade Suite — Diagnostics, Terminal Expansion & Visual Polish',
    highlights: [
      'Diagnostics: Fixed verify.py JSON-LD schema validation to handle array-wrapped structured data blocks; excluded 404.html from sitemap sync warnings — suite now passes 0 errors, 0 warnings',
      'Dev Terminal v47: Added stats, benchmark, run prakopnet, run pulselive commands; implemented ArrowUp/ArrowDown command history traversal',
      'Visual Polish: Enhanced glass-card glassmorphism with inset top-edge highlight, hover lift spring transition, and accent glow border',
      'PWA & Cache: Bumped Service Worker cache to aaradhya-portfolio-v47 with full asset manifest'
    ]
  },
  {
    version: 'v46',
    date: '2026-08-13',
    sha: 'hyp3r46',
    title: 'Site-Wide Hyper-Automation Suite & Custom Site MCP Server Integration',
    highlights: [
      'Site Automation Engine: Shipped scripts/site_automation.py CLI supporting automated site telemetry, audits, version syncing, and search index extraction',
      'Site MCP Server: Built custom Model Context Protocol server (mcp-server/site_mcp.py) exposing site:// projects, experience, achievements, tracker, graph, and health resources over stdio',
      'MCP Configuration: Created mcp_config.json for instant registration in Antigravity IDE, Claude Desktop, and Cursor',
      'Lighthouse CI Automation: Added .github/workflows/lighthouse-audit.yml for automated Lighthouse accessibility and performance testing'
    ]
  },
  {
    version: 'v45',
    date: '2026-08-13',
    sha: 'v3r1fy45',
    title: 'Robust Troubleshooting Infrastructure & Site Hardening Upgrade',
    highlights: [
      'Verification Engine: Expanded verify.py from 5 to 17 check categories — cross-page links, asset validation, JS syntax, version consistency, JSON-LD schemas, file size budgets, and more',
      'Pre-Commit Gate: sync.ps1 now runs verify.py before every commit — blocks pushes with errors, -SkipVerify escape hatch for emergencies',
      'Dev Server Fix: Fixed ROOT path bug in dev-serve.py, added CORS headers and MIME type support for .webmanifest/.webp',
      'Dev Terminal: New healthcheck command for client-side diagnostics — module loading, SW status, performance metrics, nav link validation',
      'CI Enhancement: verify.yml now includes Node.js syntax checking step alongside Python structural checks'
    ]
  },
  {
    version: 'v44',
    date: '2026-08-13',
    sha: 'u7g7r44',
    title: 'Site-Wide v44 Upgrade Suite — Performance Hardening, A11y/SEO & Visual Polish',
    highlights: [
      'Performance Optimization: Scoped background grain overlay to dark mode only, eliminated static will-change compositing bloat, added LCP preloads',
      'Accessibility Hardening: Refined light-mode card shadows & focus-visible rings with double-ring contrast technique; fixed reduced motion cursor fallback',
      'Visual Aesthetics Polish: Added animated section title underlines, pulse animations on circuit divider nodes, and tactile button active micro-interactions',
      'SEO & PWA Hardening: Updated sitemap lastmod timestamps, enhanced web manifest with ID and categories, and bumped SW cache to aaradhya-portfolio-v44'
    ]
  },
  {
    version: 'v43',
    date: '2026-08-13',
    sha: 'r4d4r43',
    title: 'Site-Wide v43 Upgrade Suite — Skill Radar, ATS Resume Builder & Interactive Sandbox',
    highlights: [
      'Interactive Skill & Domain Radar visualizer with 5 core competency nodes, score metrics, and toolstacks on about.html',
      'Tailored ATS Resume Generator & Exporter modal with role-based filtering (Master CV, AI/ML, Embedded, Full-Stack) and one-click print/PDF export',
      'Multi-Tab Project Code & Architecture Inspector with syntax highlighting and copy code capabilities',
      'Interactive Dev Terminal sandbox commands (radar, resume, run spark, run gcsbr, glossary)',
      'PWA Service Worker cache version upgraded to aaradhya-portfolio-v43'
    ]
  },
  {
    version: 'v42',
    date: '2026-08-13',
    sha: 'm0du42l',
    title: 'Site-Wide v42 Upgrade Suite — Performance & Modular Code Quality Architecture',
    highlights: [
      'Refactored monolithic script.js into 8 clean, decoupled ES/IIFE architecture modules (core, ui, cmdk, access, tour, audio, terminal, haptics)',
      'Enhanced static search index verification and full structural integrity validation in verify.py',
      'PWA Service Worker cache version upgraded to aaradhya-portfolio-v42',
      'Optimized script loading and DOMContentLoaded boot initialization sequence'
    ]
  },
  {
    version: 'v41',
    date: '2026-08-12',
    sha: 'c0l0r41',
    title: 'Color Upgrades & Multi-Theme Accent Customization Suite',
    highlights: [
      'Interactive 6-theme Accent Color Palette Switcher (Gold 👑, Emerald ⚡, Violet 🔮, Cyan 🌊, Ruby 🔴, Prism 🌌)',
      'Dynamic CSS accent token inheritance across dark and light themes with local storage persistence',
      'Upgraded ambient radial color glows, card glassmorphic hover borders, and terminal widget accents',
      'Tactile haptic feedback integration for swatch toggles & popover navigation',
      'PWA Service Worker cache version upgraded to aaradhya-portfolio-v41'
    ]
  },
  {
    version: 'v40',
    date: '2026-08-12',
    sha: '94bef09',
    title: 'Site-Wide v40 Upgrade Suite — Inter Typography & Performance Core',
    highlights: [
      'Inter variable font typography system modernization with optimized font fallbacks',
      'IntersectionObserver & Visibility API canvas rendering lifecycle optimization',
      'Spring-eased count-up milestone stat counters & card transform hardware scoping',
      'Scrolled nav saturation/blur (saturate 180% + blur 20px) visual upgrade',
      'PWA Service Worker cache version upgraded to aaradhya-portfolio-v40'
    ]
  },
  {
    version: 'v39',
    date: '2026-08-09',
    sha: '0039321',
    title: 'SEO, AEO & ADT Brand Identity Upgrade Suite',
    highlights: [
      'ADT (Aaradhya Dev Tamrakar) brand identity integration across all 10 site page titles & metadata',
      'Enhanced JSON-LD structured schemas (Person alternate names, WebSite, ProfilePage & FAQPage)',
      'AEO allowlist for AI search bots (GPTBot, ClaudeBot, PerplexityBot) in robots.txt',
      'Interactive Dev Terminal multiline output formatting & master Esc key overlay handler',
      'PWA Service Worker cache version upgraded to aaradhya-portfolio-v39'
    ]
  },
  {
    version: 'v38',
    date: '2026-08-08',
    sha: 'a7b8c9d',
    title: 'Site-Wide v38 Upgrade Suite — Web Audio Micro-Sounds, Reading Time & Verification',
    highlights: [
      'Web Audio API synthesized sound cues (clicks, pops, chimes) with Shift+A toggle',
      'Dynamic reading time & word count badges across all main content pages',
      'Real-time filter result count indicators on projects and achievements list',
      'PWA Service Worker cache version upgraded to aaradhya-portfolio-v38',
      'Site-wide HTML tag balance & structural integrity verification in verify.py',
      'Journey engineering timeline milestone nodes j-033 (v37) and j-034 (v38)'
    ]
  },
  {
    version: 'v37',
    date: '2026-08-08',
    sha: '570329b',
    title: 'Guided Cross-Page Site Tour with Spotlight Overlay',
    highlights: [
      'Interactive cross-page spotlight tour traversed across all 7 main pages',
      'Remembers tour progress across page transitions via localStorage',
      'Keyboard navigation (Arrow keys, Esc, Shift+T shortcut) & reduced-motion support',
      'Journey engineering timeline milestone node j-033 for v37 tour release'
    ]
  },
  {
    version: 'v36',
    date: '2026-08-08',
    sha: '9f8e7d6',
    title: 'Site-Wide v36 Upgrade Suite — Visual Polish, Performance & Mobile UX',
    highlights: [
      'Glassmorphism card polish & conic-gradient rotating borders',
      'Playfair Display display serif typography hierarchy upgrade',
      'Interactive Skill & Tech Matrix progress bars with scroll trigger',
      'Mobile Bottom Sheet navigation drawer with backdrop & drag handle',
      'Horizontal swipe-to-navigate between site pages with visual indicators',
      'Scroll-linked parallax depth effects (hero glow, background mesh blobs)',
      'Journey timeline milestone node j-032 for v36 upgrade suite'
    ]
  },
  {
    version: 'v35',
    date: '2026-08-08',
    sha: 'c5d35e1',
    title: 'Site-Wide v35 Upgrade Suite — Motion, Interactions & Performance',
    highlights: [
      'Staggered card entrance animations across grid sections',
      'Typed hero caption animation with expanded rotating pool',
      'Scroll-triggered animated stat counters (15+ Projects, 4th Year, etc.)',
      'Enhanced View Transitions API with element morphing & circular theme wipe',
      'Form focus glow rings & animated checkmark success state',
      'Journey timeline milestone node j-031 for v35 upgrade suite'
    ]
  },
  {
    version: 'v34',
    date: '2026-08-08',
    sha: 'a4b8c9d',
    title: 'Mobile Touch UX & Safe Area Overhaul Suite',
    highlights: [
      'iOS safe area inset (env(safe-area-inset-*)) & viewport-fit=cover integration',
      'Web Touch Gestures: swipe-to-close on mobile nav drawer, lightboxes & modals',
      'Haptic Touch Feedback API (navigator.vibrate) on micro-interactions',
      'Mobile Dev Terminal auto-scroll & touch preset enhancements',
      'Journey milestone node j-030 for v34 upgrade suite'
    ]
  },
  {
    version: 'v33',
    date: '2026-08-04',
    sha: 'fde29d6',
    title: 'Interactive Dev Terminal Widget, CMDK Filters & Cursor Light Trail',
    highlights: [
      'Interactive retro-futuristic terminal widget (#adt-terminal) with live command execution',
      'Quick category tab filter pills integrated into Command Palette (CMDK)',
      'Hardware-accelerated custom cursor light trail micro-interaction',
      'Journey milestone node j-029 for v33 upgrade suite'
    ]
  },
  {
    version: 'v32',
    date: '2026-08-04',
    sha: 'c65d080',
    title: 'PWA Resilience, Reading Progress Bar & 3D Card Tilt',
    highlights: [
      'PWA Service Worker v32 cache refresh with live network status toasts',
      'Top viewport reading progress bar (#readProgressBar) on scroll',
      '3D perspective card tilt micro-interactions on hover',
      'Journey timeline milestone j-028 for v32 upgrade suite'
    ]
  },
  {
    version: 'v31',
    date: '2026-08-04',
    sha: '8761335',
    title: 'Site Upgrade Suite — Hash Sync, Accessibility & PWA Refresh',
    highlights: [
      'Dynamic URL hash filter state sync (#track=academic, #track=eca) on achievements',
      'Screen reader aria-live=polite status announcements for item filtering',
      'PWA Service Worker cache version upgrade to v31',
      'Comprehensive social preview metadata audit (og:image, twitter:card)'
    ]
  },
  {
    version: 'v30',
    date: '2026-08-04',
    sha: 'b146fa5',
    title: 'PWA Service Worker, Skip-Links & Font Preconnects',
    highlights: [
      'Offline PWA Service Worker (sw.js) integration',
      'Keyboard accessibility skip-links across all 10 site HTML pages',
      'Font preconnect hints for faster typography handshakes',
      'CSS content-visibility optimization for rendering speed'
    ]
  },
  {
    version: 'v29',
    date: '2026-08-04',
    sha: '43d99bd',
    title: 'PWA WebManifest & Performance Upgrades',
    highlights: [
      'Created site.webmanifest with dark theme metadata (#0f0e0c)',
      'Playsinline video mobile attributes for iOS devices',
      'Dynamic cross-page theme-color address bar tinting',
      'SEO JSON-LD structured schemas across projects & experience'
    ]
  },
  {
    version: 'v28',
    date: '2026-08-04',
    sha: 'fdbf5b2',
    title: 'Site-Wide Audit & Deep-Linking Hardening',
    highlights: [
      'Explicit deep-link IDs for project cards and journey nodes',
      'Automated search index sync verification in scripts/verify.py',
      'Security hardening (rel=noopener, clean same-tab nav)'
    ]
  }
];


/* ── Global search index (each page appends its entries) ──── */
// Usage in page: SEARCH_INDEX.push(...entries)
window.SEARCH_INDEX = window.SEARCH_INDEX || [];

const SEARCH_STATIC_INDEX = {
  achievement: [
  {
    "type": "achievement",
    "title": "JavaScript Bootcamp",
    "meta": "KEC IT Club · 2023",
    "href": "achievements.html#achv-0",
    "text": "kec it club javascript bootcamp 2023"
  },
  {
    "type": "achievement",
    "title": "Session on Git & GitHub",
    "meta": "KEC IT Club · Nov 2024",
    "href": "achievements.html#achv-1",
    "text": "kec it club session on git & github nov 2024"
  },
  {
    "type": "achievement",
    "title": "Workshop on Linux and Open Source Contribution",
    "meta": "GNOME Nepal & KEC IT Club · Nov 2024",
    "href": "achievements.html#achv-2",
    "text": "gnome nepal & kec it club workshop on linux and open source contribution nov 2024"
  },
  {
    "type": "achievement",
    "title": "HTML & CSS Workshop — Design, Code & Launch via GitHub Pages",
    "meta": "Microsoft Learn Student Ambassador · May 2022",
    "href": "achievements.html#achv-3",
    "text": "microsoft learn student ambassador html & css workshop — design, code & launch via github pages may 2022"
  },
  {
    "type": "achievement",
    "title": "PreXtreme Competitive Programming Workshop",
    "meta": "IEEE · Jul 2025",
    "href": "achievements.html#achv-4",
    "text": "ieee prextreme competitive programming workshop jul 2025"
  },
  {
    "type": "achievement",
    "title": "AWS Fundamentals Workshop",
    "meta": "KEC IT Club · AWS Cloud Club Nepal · Jul 2025",
    "href": "achievements.html#achv-5",
    "text": "kec it club · aws cloud club nepal aws fundamentals workshop jul 2025"
  },
  {
    "type": "achievement",
    "title": "Agile Workshop",
    "meta": "IEEE · Jul 2025",
    "href": "achievements.html#achv-6",
    "text": "ieee agile workshop jul 2025"
  },
  {
    "type": "achievement",
    "title": "PCB Design & Fabrication Workshop",
    "meta": "Nepal Students' Union KEC · KEC Robotics Club · Jul 2025",
    "href": "achievements.html#achv-7",
    "text": "nepal students' union kec · kec robotics club pcb design & fabrication workshop jul 2025"
  },
  {
    "type": "achievement",
    "title": "Mentor — Electronics For All Workshop",
    "meta": "IEEE · Jul 2025",
    "href": "achievements.html#achv-8",
    "text": "ieee mentor — electronics for all workshop jul 2025"
  },
  {
    "type": "achievement",
    "title": "How Hackers Bypass Security: A Beginner's Guide",
    "meta": "Offenso Hackers Academy · Jul 2025",
    "href": "achievements.html#achv-9",
    "text": "offenso hackers academy how hackers bypass security: a beginner's guide jul 2025"
  },
  {
    "type": "achievement",
    "title": "IEEE Day 2025 — Organizer",
    "meta": "IEEE · Oct 2025",
    "href": "achievements.html#achv-10",
    "text": "ieee ieee day 2025 — organizer oct 2025"
  },
  {
    "type": "achievement",
    "title": "IEEEXtreme 19.0",
    "meta": "IEEE · Oct 2025",
    "href": "achievements.html#achv-11",
    "text": "ieee ieeextreme 19.0 oct 2025"
  },
  {
    "type": "achievement",
    "title": "IEEE WIE LaTeX Training Program",
    "meta": "IEEE · May 2026",
    "href": "achievements.html#achv-12",
    "text": "ieee ieee wie latex training program may 2026"
  },
  {
    "type": "achievement",
    "title": "Prompt Engineering Fundamentals",
    "meta": "TechAxis · May 2026",
    "href": "achievements.html#achv-13",
    "text": "techaxis prompt engineering fundamentals may 2026"
  },
  {
    "type": "achievement",
    "title": "IEEE SPAx — Engineer Your Profile",
    "meta": "IEEE · May 2026",
    "href": "achievements.html#achv-14",
    "text": "ieee ieee spax — engineer your profile may 2026"
  },
  {
    "type": "achievement",
    "title": "NepaTronix Drone Training Program",
    "meta": "Drone Operator Training · May 2026",
    "href": "achievements.html#achv-15",
    "text": "drone operator training nepatronix drone training program may 2026"
  },
  {
    "type": "achievement",
    "title": "DataCamp — CPE Credit Certificates",
    "meta": "DataCamp · May 2026 · Jul 2026",
    "href": "achievements.html#achv-16",
    "text": "datacamp datacamp — cpe credit certificates may 2026 · jul 2026"
  },
  {
    "type": "achievement",
    "title": "Datacamp Projects",
    "meta": "DataCamp · May 2026 · Jul 2026",
    "href": "achievements.html#achv-17",
    "text": "datacamp datacamp projects may 2026 · jul 2026"
  },
  {
    "type": "achievement",
    "title": "IEEE Conference Leadership Workshop 2026",
    "meta": "IEEE · 30–31 Jan 2026",
    "href": "achievements.html#achv-18",
    "text": "ieee ieee conference leadership workshop 2026 30–31 jan 2026"
  },
  {
    "type": "achievement",
    "title": "AI Fluency: Framework & Foundations",
    "meta": "ANTHROPIC · Jul 2026",
    "href": "achievements.html#achv-19",
    "text": "anthropic ai fluency: framework & foundations jul 2026"
  },
  {
    "type": "achievement",
    "title": "SimOps Certifications",
    "meta": "SimOps · Jul 2026",
    "href": "achievements.html#achv-20",
    "text": "simops simops certifications jul 2026"
  },
  {
    "type": "achievement",
    "title": "Sports Week — Volunteer Organizer",
    "meta": "Kathmandu Engineering College · 2026",
    "href": "achievements.html#achv-21",
    "text": "kathmandu engineering college sports week — volunteer organizer 2026"
  },
  {
    "type": "achievement",
    "title": "Dristi 3.0 — Volunteer Organizer",
    "meta": "Kathmandu Engineering College · 2025",
    "href": "achievements.html#achv-22",
    "text": "kathmandu engineering college dristi 3.0 — volunteer organizer 2025"
  },
  {
    "type": "achievement",
    "title": "Mr. KEC 2025",
    "meta": "Kathmandu Engineering College · 2025",
    "href": "achievements.html#achv-23",
    "text": "kathmandu engineering college mr. kec 2025 2025"
  },
  {
    "type": "achievement",
    "title": "Proteus Workshop",
    "meta": "KEC Electrical Club · 2024",
    "href": "achievements.html#achv-24",
    "text": "kec electrical club proteus workshop 2024"
  },
  {
    "type": "achievement",
    "title": "AutoCAD Workshop",
    "meta": "CESA (Civil Engineering Student's Association) · 2025",
    "href": "achievements.html#achv-25",
    "text": "cesa (civil engineering student's association) autocad workshop 2025"
  },
  {
    "type": "achievement",
    "title": "Machine Learning Hackathon",
    "meta": "WiseBee · 2 Dec 2023",
    "href": "achievements.html#achv-26",
    "text": "wisebee machine learning hackathon 2 dec 2023"
  },
  {
    "type": "achievement",
    "title": "EU AI Act Literacy — Specialist Certification",
    "meta": "DataCamp · Jul 2026",
    "href": "achievements.html#achv-28",
    "text": "datacamp eu ai act literacy — specialist certification jul 2026"
  },
  {
    "type": "achievement",
    "title": "Introduction to Security in the World of AI",
    "meta": "DataCamp · Jul 2026",
    "href": "achievements.html#achv-31",
    "text": "datacamp introduction to security in the world of ai jul 2026"
  },
  {
    "type": "achievement",
    "title": "Introduction to Python",
    "meta": "DataCamp · May 2026",
    "href": "achievements.html#achv-32",
    "text": "datacamp introduction to python may 2026"
  },
  {
    "type": "achievement",
    "title": "Introduction to Git",
    "meta": "DataCamp · Jul 2026",
    "href": "achievements.html#achv-33",
    "text": "datacamp introduction to git jul 2026"
  },
  {
    "type": "achievement",
    "title": "AI-Assisted Coding for Developers",
    "meta": "DataCamp · Jul 2026",
    "href": "achievements.html#achv-34",
    "text": "datacamp ai-assisted coding for developers jul 2026"
  },
  {
    "type": "achievement",
    "title": "Introduction to Claude Cowork",
    "meta": "ANTHROPIC · Jul 2026",
    "href": "achievements.html#achv-35",
    "text": "anthropic introduction to claude cowork jul 2026"
  },
  {
    "type": "achievement",
    "title": "NEC License Exam Mock Test (BCT)",
    "meta": "Nepal Engineering Council (NEC) · 10 May 2026",
    "href": "achievements.html#achv-36",
    "text": "nepal engineering council (nec) nec license exam mock test (bct) scored 97/100 on the computer engineering (bct) format licensure preparation assessment. 10 may 2026"
  },
  {
    "type": "achievement",
    "title": "Laser Safety Awareness Training",
    "meta": "xTool · KEC Makerspace · 19 Aug 2026",
    "href": "achievements.html#achv-37",
    "text": "xtool · kec makerspace laser safety awareness training 19 aug 2026"
  },
  {
    "type": "achievement",
    "title": "Printer Maintenance Certification",
    "meta": "xTool · KEC Makerspace · 19 Aug 2026",
    "href": "achievements.html#achv-38",
    "text": "xtool · kec makerspace printer maintenance certification 19 aug 2026"
  },
  {
    "type": "achievement",
    "title": "KEC Music Club — Performer",
    "meta": "KEC Music Club · 2023–2026",
    "href": "achievements.html#achv-27",
    "text": "kec music club kec music club — performer performed 4+ times per year for 3+ years at kec music club events. 2023–2026"
  },
  {
    "type": "achievement",
    "title": "Mentor — Basic Electronics Workshop",
    "meta": "Electronic Project Club (EPC) · 7 Dec 2025",
    "href": "achievements.html#achv-29",
    "text": "electronic project club (epc) mentor — basic electronics workshop mentored 1st and 2nd year students through building simple circuits and checking outputs step by step. 7 dec 2025"
  },
  {
    "type": "achievement",
    "title": "+2 Students Orientation — Host",
    "meta": "IEEE · 7 Jun 2026",
    "href": "achievements.html#achv-30",
    "text": "ieee +2 students orientation — host hosted +2 students at the ieee kec ktm student branch with interactive quiz rounds showcasing branch activities. 7 jun 2026"
  }

  ],
  project: [
  {
    "type": "project",
    "title": "BiasAperture — Vision Fairness & Bias Audit",
    "meta": "In Progress · AIF360, Fairlearn, FairFace",
    "href": "projects.html#p-018",
    "text": "biasaperture — vision fairness & bias audit diagnostic tool for deployed vision classifiers — runs a multi-demographic test matrix, flags statistical disparities, and outputs a compliance report; detects bias but doesn't correct it fellowship capstone, two-person team with tisha manandhar — full readme to follow in-repo aif360 fairlearn fairface utkface computer vision bias auditing statistical testing html/jinja2 in progress"
  },
  {
    "type": "project",
    "title": "Gesture-Controlled Self-Balancing Robot",
    "meta": "Arduino, HC-05, MPU-6050",
    "href": "projects.html#p-001",
    "text": "gesture-controlled self-balancing robot two-wheeled inverted pendulum robot with real-time dual-hand mediapipe gesture control over hc-05 bluetooth examiner rated major-project level — 9.6/10 arduino hc-05 mpu-6050 nema-17 mediapipe pid matlab"
  },
  {
    "type": "project",
    "title": "SPARK — Two-Layer Fall Detection Wearable",
    "meta": "In Progress · MPU6050, TFLite Micro, 1D CNN",
    "href": "projects.html#p-015",
    "text": "spark — two-layer fall detection wearable on-device, two-layer fall-detection wearable for eldercare — threshold gate plus a tflite micro cnn gateway, zero imports, zero custom pcb bei major project, four-person team — proposal defended jul 9, 2026 mpu6050 tflite micro 1d cnn shap fastapi streamlit telegram in progress"
  },
  {
    "type": "project",
    "title": "Antenna Lab Data Analysis",
    "meta": "Python, Pandas, NumPy",
    "href": "projects.html#p-013",
    "text": "antenna lab data analysis python data-analysis pipeline for antenna radiation pattern measurements from lab excel sheets scipy cubic interpolation plus matplotlib polar plots — communication & rf coursework deliverable python pandas numpy scipy matplotlib polar plot"
  },
  {
    "type": "project",
    "title": "Custom Processor FSM Design",
    "meta": "VHDL, Vivado, FSM",
    "href": "projects.html#p-012",
    "text": "custom processor fsm design vhdl implementation of a custom processor datapath and fsm supporting gcd and exponentiation operations simulated and verified in vivado 2023.2 as embedded systems coursework vhdl vivado fsm datapath fpga"
  },
  {
    "type": "project",
    "title": "PrakopNet — Multi-Hazard Early Warning System",
    "meta": "Archived · ESP32, Wireless Mesh, Raspberry Pi 4B",
    "href": "projects.html#p-010",
    "text": "prakopnet — multi-hazard early warning system solar-powered wireless mesh multi-hazard monitoring platform for remote regions of nepal — esp32 nodes to a raspberry pi 4b gateway archived june 29, 2026; superseded by spark esp32 wireless mesh raspberry pi 4b tflite micro lstm gps fastapi edge ai archived"
  },
  {
    "type": "project",
    "title": "Fusemachines Wk 14 — Agentic Intent Routing",
    "meta": "Python, BERT, Fine-Tuning",
    "href": "projects.html#p-030",
    "text": "fusemachines wk 14 — agentic intent routing two candidate routing strategies for a shopassist ai support platform — fine-tuned bert-family encoder vs. fine-tuned llm/slm — classifying customer messages into 11 specialized agent categories benchmarked on 26,872 bitext customer-support examples with a group-aware stratified split to prevent instruction-text leakage across train/val/test python bert fine-tuning slm intent classification stratified split"
  },
  {
    "type": "project",
    "title": "Fusemachines Wk 13 — LSTM Text Classification",
    "meta": "Python, PyTorch, LSTM",
    "href": "projects.html#p-029",
    "text": "fusemachines wk 13 — lstm text classification lstm headline classifier on ag_news (world / sports / business / sci-tech) — embedding → lstm → fc, trained top-to-bottom from a skeleton notebook pytorch training loop with vocabulary building from scratch and a short conceptual-reflection section python pytorch lstm ag_news nlp"
  },
  {
    "type": "project",
    "title": "Fusemachines Wk 12 — NER for Customer Support",
    "meta": "Python, NER, CoNLL-2003",
    "href": "projects.html#p-028",
    "text": "fusemachines wk 12 — ner for customer support end-to-end named entity recognition pipeline on conll-2003 for automated customer-support ticket triage and crm routing text preprocessing, eda (sentence-length / word-frequency / entity distributions), and `word2features` feature engineering ahead of model training python ner conll-2003 feature engineering nlp"
  },
  {
    "type": "project",
    "title": "Fusemachines Wk 11 — Vision Transformers",
    "meta": "Python, PyTorch, torchvision",
    "href": "projects.html#p-019",
    "text": "fusemachines wk 11 — vision transformers five-module deep computer vision stack — resnet-50 transfer learning + gradcam, faster r-cnn object detection, deeplabv3+ segmentation, a from-scratch vae, and vit patch embedding clip zero-shot classification hit 92.0% on a 200-image slice, outscoring the fine-tuned resnet-50 (74.1%) — deployment memo compares both for a 500-camera warehouse rollout, exported to onnx python pytorch torchvision timm clip onnx gradcam vision transformers"
  },
  {
    "type": "project",
    "title": "Fusemachines Wk 10 — Image Processing",
    "meta": "Python, OpenCV, NumPy",
    "href": "projects.html#p-017",
    "text": "fusemachines wk 10 — image processing hsv-based multi-class fruit segmentation across the fruits-360 dataset, morphological cleanup, and filter-based denoising benchmarks (gaussian, median, bilateral) from-scratch canny edge detector (96.9% pixel agreement vs. cv2.canny()), plus a full fruit-detection pipeline — harris corners, tuned hough circles, connected-component separation of touching fruit, contour-based bounding boxes python opencv numpy matplotlib hsv segmentation canny edge detection hough transform"
  },
  {
    "type": "project",
    "title": "Fusemachines Wk 9 — NEU Steel Defect CNN",
    "meta": "Python, PyTorch, torchvision",
    "href": "projects.html#p-016",
    "text": "fusemachines wk 9 — neu steel defect cnn pytorch cnn classifier for neu-det steel surface-defect detection — six classes, 1,800 grayscale images from-scratch nn foundation → tuned cnn, 98.8%/78.9% train/val accuracy; augmentation, batchnorm, and dropout ablations plus grid-search and optuna hyperparameter tuning python pytorch torchvision cnn optuna scikit-learn"
  },
  {
    "type": "project",
    "title": "Fusemachines Wk 8 — Forecasting",
    "meta": "Python, statsmodels, SARIMA",
    "href": "projects.html#p-014",
    "text": "fusemachines wk 8 — forecasting time-series pipeline benchmarking nine forecasters on monthly s&p 500 data (1990–2024) via mase/rmse 4-model ensemble outperformed every single model — mase 2.44, confirmed via diebold-mariano test (p = 0.0092) python statsmodels sarima holt-winters prophet lightgbm lstm xgboost"
  },
  {
    "type": "project",
    "title": "Fusemachines Wk 7 — Customer Segmentation",
    "meta": "Python, scikit-learn, K-Means",
    "href": "projects.html#p-009",
    "text": "fusemachines wk 7 — customer segmentation market segmentation on uci online retail ii (~500,000 transactions) with rfm + category-ratio feature engineering full clustering comparison — k-means, hierarchical, dbscan — validated via silhouette and davies-bouldin indices python scikit-learn k-means hierarchical clustering dbscan rfm pandas scipy"
  },
  {
    "type": "project",
    "title": "Fusemachines Wk 6 — Probabilistic Models",
    "meta": "Python, PyMC, ArviZ",
    "href": "projects.html#p-008",
    "text": "fusemachines wk 6 — probabilistic models bayesian inference pipeline for telco churn using pymc, arviz, and pgmpy mle/map estimation, dirichlet-multinomial updating, and a fitted pymc bayesian logistic regression artifact python pymc arviz pgmpy bayesian inference scikit-learn pandas"
  },
  {
    "type": "project",
    "title": "Fusemachines Wk 4 — Telco Churn & CLV ML Pipeline",
    "meta": "Python, scikit-learn, Logistic Regression",
    "href": "projects.html#p-004",
    "text": "fusemachines wk 4 — telco churn & clv ml pipeline classification and regression pipeline for churn prediction and customer lifetime value modeling — roc-auc 0.841 ± 0.005 ridge regression best for clv (mean $1,304.70); full html report export via papermill python scikit-learn logistic regression ridge lasso pandas papermill"
  },
  {
    "type": "project",
    "title": "Fusemachines Wk 5 — Telco Churn Tree-Based Ensemble Pipeline",
    "meta": "Python, XGBoost, Random Forest",
    "href": "projects.html#p-003",
    "text": "fusemachines wk 5 — telco churn tree-based ensemble pipeline end-to-end classification pipeline on telco customer churn (7,043 rows) with smote restricted to training folds only random forest + xgboost with shap explainability; secondary tenure-prediction task with a model card python xgboost random forest shap imbpipeline smote joblib scikit-learn"
  },
  {
    "type": "project",
    "title": "Fusemachines Wk 3 — Text-to-SQL Agentic Pipeline",
    "meta": "Python, FastAPI, Streamlit",
    "href": "projects.html#p-002",
    "text": "fusemachines wk 3 — text-to-sql agentic pipeline five-stage agentic text-to-sql system over a postgresql database — planner → generator → validator → executor → summarizer 100% execution success and 100% result accuracy across a 50-question benchmark, zero retries required python fastapi streamlit gpt-4o-mini postgresql docker prompt chaining"
  },
  {
    "type": "project",
    "title": "Fusemachines Wk 2 — Customer API App",
    "meta": "FastAPI, PostgreSQL, SQLAlchemy",
    "href": "projects.html#p-027",
    "text": "fusemachines wk 2 — customer api app 12-factor app compliant restful api for customer, order, and payment management, refactored to full 12-factor compliance with a statistics module fastapi + sqlalchemy over postgresql, dockerized with environment-based config and centralized logging fastapi postgresql sqlalchemy pydantic docker 12-factor app"
  },
  {
    "type": "project",
    "title": "Fusemachines Wk 1 — Cardiac Event Data Wrangling",
    "meta": "Python, Pandas, EDA",
    "href": "projects.html#p-026",
    "text": "fusemachines wk 1 — cardiac event data wrangling data wrangling and preparation pipeline for cardiac event analysis on a synthetic heart-attack-risk dataset eda, correlation heatmap, and class-imbalance analysis ahead of downstream modeling python pandas eda data wrangling"
  },
  {
    "type": "project",
    "title": "ONM Case Study — Fusemachines Inc.",
    "meta": "LaTeX, Organizational Analysis, Case Study",
    "href": "projects.html#p-025",
    "text": "onm case study — fusemachines inc. organization & management coursework case study on fusemachines inc.'s org structure, hr practices, and cross-functional operations based on a direct interview with the company's talent acquisition and pr managers; latex source plus compiled report latex organizational analysis case study coursework"
  },
  {
    "type": "project",
    "title": "Claude Desktop Multi-Profile & Sync Utilities",
    "meta": "PowerShell 7, Windows Shell, Electron",
    "href": "projects.html#p-021",
    "text": "claude desktop multi-profile & sync utilities powershell 7 & windows shell utility suite enabling multi-user profile isolation for anthropic's claude desktop application features native profile session swapping, single-instance browser oauth (`claude://`) deep-link routing, and automated git repository synchronization with conventional commit messaging powershell 7 windows shell electron msix / appx oauth 2.0 robocopy git automation batch cli"
  },
  {
    "type": "project",
    "title": "IEEE KEC React Workshop",
    "meta": "React, Vite, JavaScript",
    "href": "projects.html#p-023",
    "text": "ieee kec react workshop progressive react teaching material built for an ieee kec student-branch workshop — numbered lesson components from a basic greeting through props, a counter, and a live clock vite-scaffolded, structured as a self-contained follow-along app for first-time react learners react vite javascript teaching material"
  },
  {
    "type": "project",
    "title": "Cryptarithmetic Solver & API",
    "meta": "Python, FastAPI, Backtracking",
    "href": "projects.html#p-022",
    "text": "cryptarithmetic solver & api column-by-column backtracking solver for alphametic puzzles (send + more = money style) — prunes invalid branches immediately on column-arithmetic failure instead of naive generate-and-test fastapi wrapper with a `metrics` mode for solve-time/branch stats, plus a powershell helper and a no-pytest unit test runner python fastapi backtracking docker algorithm design"
  },
  {
    "type": "project",
    "title": "Pulse Live — Real-Time Interactive Polling Platform",
    "meta": "React 19, TypeScript, Vite",
    "href": "projects.html#p-020",
    "text": "pulse live — real-time interactive polling platform real-time audience engagement platform featuring instant multi-mode polling (choice, q&a, word cloud), presenter mode, and interactive voting synchronization built with react 19, typescript, and supabase websockets / database for instant live response updates, presenter display controls, and qr code joining react 19 typescript vite supabase websockets react router v7 lucide icons qr code"
  },
  {
    "type": "project",
    "title": "Nexus — Personal AI Operating System",
    "meta": "In Progress · React, Vite, FastAPI",
    "href": "projects.html#p-011",
    "text": "nexus — personal ai operating system project-centric ai operating system replacing the multi-browser/multi-account/multi-tool workflow react (vite) + fastapi + sqlite/fts5, parallel groq + gemini fan-out — v2 redesign complete june 12, 2026 react vite fastapi sqlite fts5 groq gemini python in progress"
  },
  {
    "type": "project",
    "title": "SysOptimizer — Windows Optimization Tool",
    "meta": "Python, CustomTkinter, PyInstaller",
    "href": "projects.html#p-007",
    "text": "sysoptimizer — windows optimization tool standalone windows optimization tool packaged as a .exe via pyinstaller power plan switcher, ram flush, background bloat panel, startup scanner — runs silently via create_no_window python customtkinter pyinstaller wmi powershell"
  },
  {
    "type": "project",
    "title": "Edge AI Stability Detection System",
    "meta": "Python, scikit-learn, RandomForest",
    "href": "projects.html#p-006",
    "text": "edge ai stability detection system ml system predicting platform stability from simulated imu sensor data — random forest, 99.8% test accuracy rest api via fastapi, joblib export for robotics integration with gcsbr (gesture-controlled self-balancing robot) python scikit-learn randomforest fastapi joblib imu edge ai"
  },
  {
    "type": "project",
    "title": "Alpha Android Super-App",
    "meta": "In Progress · Kotlin, Jetpack Compose, Material3",
    "href": "projects.html#p-005",
    "text": "alpha android super-app modular personal super-app (kotlin/jetpack compose, material3) — gesture remote, budget tracker, multi-mode calculator calculator is the primary shipping target, play store release in progress kotlin jetpack compose material3 camerax mediapipe bluetooth spp datastore apache poi in progress"
  }

  ]
};
window.SEARCH_STATIC_INDEX = SEARCH_STATIC_INDEX;



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