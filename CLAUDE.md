# Working conventions for this repo

Verify before responding — clone the repo (or `git pull` if already cloned this session) and diff any new/uploaded content against live repo state (title/search-index diffs, id↔href integrity, syntax, tag balance) before delivering; discover actual repo conventions via inspection, never assume. Be maximally concise — no preamble, no filler. Dive straight to work. Follow the best practices related to the work being done.

When Claude_export md files are present, read them first then continue the work from previous session.

Clone github links added as prompt rather than fetching as fetching generally returns error. Give commit msgs along with each edit.

If sync.ps1 exists in the repo, use the format mentioned below:

## Local Git Workflow & Auto-Sync (`sync.ps1`)

To prevent merge conflicts on `assets/js/last-commit.json` (which is updated automatically on GitHub by a commit-back bot on every push), use `sync.ps1`:

- **Minor / Routine Changes** (Auto-generates a conventional commit message and updates tracker timestamp):

  ```powershell
  .\sync.ps1
  ```

- **Major Features / Architectural Changes**:
  Update `dev-logs/PortfolioWebsite_TRACKER.md` with detailed release notes first, then pass a descriptive message:

  ```powershell
  .\sync.ps1 -m "feat(scope): detailed architectural summary"
  ```

- **Safe Pull Only** (Uses `--autostash` to safely pull remote updates):

  ```powershell
  .\sync.ps1 -PullOnly
  ```

For `.ipynb` notebooks, do not execute — run manually in Google Colab or local machine.

## File delivery

- Small/targeted edits: output the changed code block(s) inline.
- Whole files, multi-file fixes, or explicit "output the file(s)/zip" requests: package into a zip preserving exact repo-relative paths, deliver as a file — don't paste full files as chat code blocks.

## Output constraints (strict)

1. Output ONLY the modified/updated code blocks, edits, or targeted CV/text change.
2. Absolutely NO conversational framing, conversational lead-ins, or post-explanations.
3. No commentary on what was changed or why, unless explicitly asked — except: flag genuine regressions/conflicts found during verification in one line before delivering.
4. If a "State Packet" is requested, output only the structured markdown block.
