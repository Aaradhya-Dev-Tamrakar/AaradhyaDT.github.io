# Graph Report - AaradhyaDT.github.io  (2026-08-29)

## Corpus Check
- 41 files · ~307,494 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 403 nodes · 693 edges · 35 communities (25 shown, 10 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 51 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `55631186`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]

## God Nodes (most connected - your core abstractions)
1. `bootSite()` - 33 edges
2. `main()` - 31 edges
3. `log_pass()` - 25 edges
4. `log_error()` - 22 edges
5. `playAudioCue()` - 18 edges
6. `log_warning()` - 16 edges
7. `get_html_files()` - 14 edges
8. `showToast()` - 11 edges
9. `main()` - 9 edges
10. `parse_html()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `bootSite()` --calls--> `initCountUp()`  [INFERRED]
  assets/js/script.js → assets/js/modules/ui.js
- `bootSite()` --calls--> `initTypedCaption()`  [INFERRED]
  assets/js/script.js → assets/js/modules/ui.js
- `bootSite()` --calls--> `initReadingMetrics()`  [INFERRED]
  assets/js/script.js → assets/js/modules/ui.js
- `bootSite()` --calls--> `initFilterCountIndicators()`  [INFERRED]
  assets/js/script.js → assets/js/modules/ui.js
- `bootSite()` --calls--> `initLightbox()`  [INFERRED]
  assets/js/script.js → assets/js/modules/ui.js

## Import Cycles
- None detected.

## Communities (35 total, 10 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.10
Nodes (60): bold(), _c(), check_asset_references(), check_cross_page_links(), check_csp_integrity(), check_css_integrity(), check_data_consistency(), check_file_sizes() (+52 more)

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (38): bootSite(), initNetworkStatusListeners(), initReadingProgressBar(), initServiceWorker(), AD_MONTHS, adToBs(), applyAccent(), applyLiveDates() (+30 more)

### Community 2 - "Community 2"
Cohesion: 0.10
Nodes (32): getAudioContext(), initAudioCues(), playAudioCue(), syncAudioToggleUI(), toggleAudioCues(), closeResumeGenerator(), closeShortcutsModal(), closeSkillRadarModal() (+24 more)

### Community 3 - "Community 3"
Cohesion: 0.15
Nodes (25): ACCESS_CONTROL, ACCESS_CONTROL_PAYLOADS, addCustomVipEmail(), closeAccessModal(), decryptHexPayload(), getCustomVipEmails(), getDecryptionKey(), getGoogleClientId() (+17 more)

### Community 4 - "Community 4"
Cohesion: 0.09
Nodes (21): Evidence & Verification Log — v20 additions, State of Play, Status, v21 addition — both v20-flagged unmatched PDFs closed out, v22 addition — KEC IT Club "Introduction to Git" (2024) card: closed, no source file available, v23 addition — latest site refinements (2026-07-18), v24 addition — site-optimization pass + mobile legend line-break fix (2026-07-18), v25 addition — bug-check sweep, pages 1/3/4 (2026-07-27) (+13 more)

### Community 5 - "Community 5"
Cohesion: 0.16
Nodes (21): audit(), bump_version(), compute_next_version(), get_current_version(), get_site_stats(), main(), Extracts the latest version string from SITE_RELEASES[0] in assets/js/data/relea, Computes the next point release (patch) or major integer release. (+13 more)

### Community 6 - "Community 6"
Cohesion: 0.21
Nodes (16): closeTourOverlay(), ensureTourOverlay(), exitTour(), getTourCurrentPage(), getTourPageUrl(), initTour(), renderTourStep(), startTour() (+8 more)

### Community 7 - "Community 7"
Cohesion: 0.12
Nodes (16): Automated Git Workflow & Pre-Commit Gate (`sync.ps1`), 📈 Codebase Knowledge Graph (`Graphify`), 📬 Contact & Connect, ⌨️ Global Keyboard Navigation & Shortcuts HUD, 🔑 Google OAuth 2.0 Integration, 💻 Interactive Developer Terminal Widget (`#adtTerminal`), Key Features, 📄 License (+8 more)

### Community 8 - "Community 8"
Cohesion: 0.37
Nodes (16): cmd_export(), cmd_get(), cmd_import(), cmd_list(), cmd_set(), cmd_verify(), decrypt_payload(), derive_key() (+8 more)

### Community 10 - "Community 10"
Cohesion: 0.29
Nodes (6): Get-LfsInstalled(), Get-PythonPath(), Show-Diagnostics(), Sync-BotStamp(), Update-TrackerLog(), Write-Badge()

### Community 11 - "Community 11"
Cohesion: 0.31
Nodes (8): handle_resource_read(), handle_tool_call(), process_request(), Fetches resource content based on URI., Executes requested tool and returns output., Routes JSON-RPC request to appropriate handler., Reads JSON-RPC messages from stdin and writes responses to stdout., run_stdio_server()

### Community 12 - "Community 12"
Cohesion: 0.29
Nodes (6): 1. Git Workflow & Automation (CRITICAL — STRICT ENFORCEMENT), 2. Knowledge Graph & Codebase Navigation (Graphify), 3. Operational Rules & Efficiency, 4. Encrypted Payloads & VIP Sections (`access.js`), Agent Rules & Workflow Guidelines, Commands

### Community 13 - "Community 13"
Cohesion: 0.38
Nodes (6): any, generate_cards(), main(), Generates OG SVG cards into the output directory., Renders a high-resolution 1200x630 SVG OpenGraph card with cyber/engineering sty, render_svg_card()

### Community 14 - "Community 14"
Cohesion: 0.29
Nodes (6): 1. Git Workflow & Automation (CRITICAL — STRICT ENFORCEMENT), 2. Knowledge Graph & Codebase Navigation (Graphify), 3. Operational Rules & Efficiency, 4. Encrypted Payloads & VIP Sections (`access.js`), Antigravity IDE & Gemini Agent Rules for Portfolio Repository, Commands

### Community 15 - "Community 15"
Cohesion: 0.57
Nodes (6): extract_achievements(), extract_projects(), main(), render_block(), render_entry(), text_of()

### Community 16 - "Community 16"
Cohesion: 0.33
Nodes (5): Encrypted Sections & VIP Payloads (`access.js`), File delivery, Local Git Workflow & Auto-Sync (`sync.ps1`), Output constraints (strict), Working conventions for this repo

### Community 17 - "Community 17"
Cohesion: 0.53
Nodes (5): buildSearchIndex(), CMDK_ENTRIES, initGlobalSearch(), renderCmdk(), revealSearchTarget()

### Community 18 - "Community 18"
Cohesion: 0.33
Nodes (5): CMDK_ICONS, CMDK_TYPE_LABEL, QUICK_NAV_PAGES, SITE, SOCIAL_ICONS

### Community 20 - "Community 20"
Cohesion: 0.70
Nodes (4): bootHomeWidgets(), initLastCommitBadge(), initLiveDates(), initStatusClock()

### Community 21 - "Community 21"
Cohesion: 0.50
Nodes (4): build_all(), minify_css(), Safely minifies CSS content without breaking modern syntax., Minifies all CSS files in assets/css/modules/.

### Community 22 - "Community 22"
Cohesion: 0.60
Nodes (4): find_browser(), generate_icon(), main(), Path

### Community 24 - "Community 24"
Cohesion: 0.50
Nodes (3): decryptHexPayload(), getDecryptionKey(), KEY_CACHE

## Knowledge Gaps
- **71 isolated node(s):** `SITE_RELEASES`, `RESUME_DATA`, `SEARCH_STATIC_INDEX`, `ACCESS_CONTROL_PAYLOADS`, `KEY_CACHE` (+66 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `bootSite()` connect `Community 1` to `Community 17`, `Community 2`, `Community 3`, `Community 6`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Why does `playAudioCue()` connect `Community 2` to `Community 3`, `Community 6`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Why does `initTour()` connect `Community 6` to `Community 1`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Are the 29 inferred relationships involving `bootSite()` (e.g. with `initAccessControl()` and `initAudioCues()`) actually correct?**
  _`bootSite()` has 29 INFERRED edges - model-reasoned connections that need verification._
- **Are the 15 inferred relationships involving `playAudioCue()` (e.g. with `closeAccessModal()` and `openAccessModal()`) actually correct?**
  _`playAudioCue()` has 15 INFERRED edges - model-reasoned connections that need verification._
- **What connects `SITE_RELEASES`, `RESUME_DATA`, `SEARCH_STATIC_INDEX` to the rest of the system?**
  _111 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.09726775956284153 - nodes in this community are weakly interconnected._