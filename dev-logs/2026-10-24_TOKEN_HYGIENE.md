# Documentation token hygiene

Date: 2026-10-24
Tracking: #50

Applied the Fleet-Orchestrator token hygiene scanner to tracked Markdown and
JSONL files. Cleaned eight maintained files: the PR template, contributing and
security guides, README, project source report, tracker, SDK RFC, and VIP audit.
Removed 57 decorative glyphs, eight variation selectors, and two invisible
characters. Preserved report numbers, status words, links, and code examples.

The audit before this log was added covered 26 tracked files. After cleanup,
23 passed and three verbatim transcripts retained warnings:

- `2026-09-16_ANALYZE-RECENT-REPOSITORY-WORKS_CONVERSATION.md`
- `2026-09-16_DISTRIBUTED-PROVISION-SERVICE_CONVERSATION.md`
- `2026-09-29_NAVIGATION_SHOWCASE_REFACTOR_CHAT.md`

These transcripts remain byte-identical. Their ten remaining glyphs are
historical content. The scanner also reports 38 long fenced blocks across the
tracked corpus, including 36 in a transcript. Length alone does not establish
that a block is terminal output; retain structural diagrams and source examples.
No blacklisted phrases, thinking blocks, malformed Markdown markers, variation
selectors, or invisible characters remain in the audited maintained files.

The scanner's default workspace traversal includes ignored local files and
skips hidden directories. Use a Git-tracked inventory when checking the public
source, including `.github/pull_request_template.md`. Runtime HTML, JavaScript,
and JSON copy require a separate review.
