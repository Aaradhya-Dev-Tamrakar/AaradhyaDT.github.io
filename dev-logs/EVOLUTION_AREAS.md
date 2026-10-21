# Portfolio Repository Evolution Roadmap

_Reviewed: 2026-10-21_
_Repository: `AaradhyaDT.github.io` (personal canonical repository)_
_Verified baseline: v55.16 at `8d0377bf4b2b93f17bb51772ec67a41ebe41a9c6`_
_Evidence tier: `EMPIRICALLY_VERIFIED` for repository state and checks listed below; proposals remain `HEURISTIC_HYPOTHESIS`._

---

## 1. Current Baseline

The previous version of this roadmap targeted v53 and described work that has since shipped. This revision records the observed v55.16 baseline and keeps proposed work separate from completed implementation.

| Area | Verified state on 2026-10-21 |
| :--- | :--- |
| Release metadata | `assets/js/data/releases.js`, `VERSION`, and `pyproject.toml` report v55.16 / 55.16.0. |
| Working tree | Clean `main`; local `HEAD` and `origin/main` both resolve to `8d0377bf4b2b93f17bb51772ec67a41ebe41a9c6`. |
| Deterministic verification | `python scripts/verify.py`: all 26 categories passed, including release SHAs, version consistency, assets, search index, and unit tests. |
| Release recommendation | `python scripts/site_automation.py evaluate-bump`: `none`; clean working tree, score 0, no trigger domains. |
| Project catalog | Verifier reports 40 project cards, 39 achievements, and 38 journey entries. |
| Recent documented scope | Tracker v55.16 records project onboarding, contact form backend and bot defense, portfolio content/access calibration, and site presentation work. These are tracker claims, not independent validation of every external system described there. |
| Knowledge graph | `graphify-out/GRAPH_REPORT.md` was built from `0afcc8b0`, behind the current HEAD. Refresh it when the next architecture/specification change is made. |

This baseline does not claim a composite quality score. The former scorecard mixed dated counts and subjective ratings, so it has been removed until a reproducible rubric and fresh measurements are available.

## 2. Completed Evolution Tracks

The following tracks were proposed in the 2026-09-08 roadmap and are now recorded as completed based on the present repository contents. Completion of an implementation does not imply that every proposed benefit has been measured.

| Track | Present evidence | Status |
| :--- | :--- | :--- |
| Cross-platform sync CLI | `scripts/site_automation.py` exposes `sync`; the repository workflow remains documented in `AGENTS.md`. | Implemented; parity and platform coverage should be assessed before claiming full behavioral equivalence. |
| Asset waterfall / bundle benchmark | `scripts/benchmark_bundle.py` exists. | Implemented; its simulated network results are not substitutes for browser measurements on representative devices and networks. |
| UI modal decomposition | `assets/js/modules/shortcuts.js` exists separately from `ui.js`. | Partially implemented; the earlier broader renderer extraction and <25 KB target are not established by that extraction alone. |
| WebAuthn / passkeys | `assets/js/modules/access.js` contains enrollment and authentication flows. | Implemented in the client; the static-site trust boundary and authenticator lifecycle remain constraints to document accurately. |

## 3. Candidate Next Work

These are investigation candidates, not approved implementation commitments. Select work only after defining a user-facing or maintenance outcome and a measurable acceptance gate.

### Candidate A: Measure real-user performance

- **Question:** Do current page weight, loading order, and rendering remain within agreed budgets on representative mobile devices and slower networks?
- **Scope to investigate:** Capture repeatable browser traces for the landing, projects, and experience pages; separate cold-cache from warm-cache measurements; record LCP, CLS, INP where supported, transfer size, and test environment.
- **Acceptance gate:** Publish reproducible measurements and explicit budgets before changing module loading or bundling. Keep `benchmark_bundle.py` results labeled as simulated.
- **Evidence tier:** `HEURISTIC_HYPOTHESIS` until browser measurements are collected.

### Candidate B: Audit access-control claims and passkey lifecycle

- **Question:** Do the UI, docs, and implementation consistently describe what a static client can and cannot enforce, including passkey enrollment, recovery, and local-storage behavior?
- **Scope to investigate:** Trace the current enrollment/authentication paths, inspect failure and recovery behavior, and align user-facing language with the actual trust boundary. Do not describe client-side gating as server authorization.
- **Acceptance gate:** Document verified behavior and limitations; add focused checks only for specific reproduced gaps.
- **Evidence tier:** `HEURISTIC_HYPOTHESIS` pending a fresh code and behavior audit.

### Candidate C: Improve focused module maintainability

- **Question:** Which module currently has the highest change risk or weakest test isolation?
- **Scope to investigate:** Use current file sizes, dependency relationships, test coverage, and recent defect/change history. Avoid fixed file-size targets unless a measured maintenance problem supports them.
- **Acceptance gate:** Select one bounded extraction with preserved public globals/module load order, targeted tests, and a measurable reduction in coupling or test setup.
- **Evidence tier:** `HEURISTIC_HYPOTHESIS` pending current measurements.

### Candidate D: Refresh portfolio content from verified project evidence

- **Question:** Are recent flagship projects, achievements, and journey milestones represented with current, reviewable evidence?
- **Scope to investigate:** Identify a specific missing or stale item and verify its source repository, status, claims, and proof assets. Preserve uncertainty where a result is planned or historical.
- **Acceptance gate:** Update only evidence-backed content; use `scripts/add_project.py` for new project cards and verify generated links, filters, search index, and asset integrity.
- **Evidence tier:** Determined per claim from its source evidence.

## 4. Decision and Delivery Sequence

1. Choose one candidate based on an observed user or maintenance need.
2. Record a bounded scope, non-goals, evidence sources, and acceptance criteria in the appropriate tracker or issue before implementation.
3. Inspect the active repository instructions and relevant code. Keep synthetic benchmark outputs and tracker statements distinct from independently measured behavior.
4. Implement the smallest change that meets the acceptance criteria. For new project cards, use `scripts/add_project.py`; for architectural/specification changes, refresh Graphify.
5. Run `python scripts/verify.py` and any task-specific checks. Record exact results and any remaining limitations in the tracker.
6. Let `scripts/site_automation.py evaluate-bump` and the repository release workflow determine whether the change warrants a point or major release. Never invent release SHAs.

## 5. Verification Record

Verified on 2026-10-21 from the personal canonical repository checkout:

- `python scripts/verify.py` — all 26 categories passed.
- `python scripts/site_automation.py evaluate-bump` — recommended bump `none`; working tree clean at inspection time.
- `git rev-parse HEAD` and `git rev-parse origin/main` — both `8d0377bf4b2b93f17bb51772ec67a41ebe41a9c6`.

These checks describe the inspected repository state on that date; they do not validate future edits or external services.
