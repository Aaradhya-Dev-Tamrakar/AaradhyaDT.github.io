# Project output captures — 23 October 2026

Local work for #14; not published.

Eight cards now use captures of substantive project outputs:

| Project | Output |
| --- | --- |
| BiasAperture | Unmodified October 19 audit dossier |
| Fleet Orchestrator | Native CPM schedule for a five-task example; planning only |
| Customization Sync | Native snapshot and restore output on an isolated example configuration |
| Cryptarithmetic | Native CLI solutions plus arithmetic validation for SEND/MORE/MONEY and TWO/TWO/FOUR |
| md2pdf | PDF generated from the repository README with the simple renderer |
| Week 16 | Saved four-case evaluation report, rendered from its original Markdown |
| Week 17 | Existing agent regression report covering prompt versions v1–v3 |
| Week 18 | Existing technical evaluation and architecture report |

Existing report figures are historical artifacts, not newly computed evaluations. Captions distinguish these from fresh local command runs. Report claims are reproduced as source content, not independently validated here. The md2pdf LaTeX conversion of its README failed on an emoji; its simple renderer succeeded. No source repair or hidden fallback is claimed.

Original images remain unchanged. Fourteen already-populated AIF cards and 42 associated original assets are preserved, with hashes checked before attachment. The report sources are copied byte-for-byte except the Markdown report, which Pandoc renders without a content rewrite. CLI text is escaped into a display page; it is captured command output, not authored result strings. Only temporary paths in the isolated snapshot example are shortened, as noted beside that output.

`scripts/prepare_output_captures.py` prepares outputs. The browser captures HTML; Poppler rasterizes the PDF's first page. `scripts/attach_output_captures.py` attaches reviewed captures using existing DOM identities. `data/output-captures.json` records source hashes, revisions, working-tree state, capture time, and image hashes.

## Remaining source and runtime gaps

- Week 15 has no saved useful assistant-output image. This runtime lacks Streamlit, the embedding library, Qdrant client, and the model API client. Its slot remains empty rather than implying an end-to-end assistant demo from a calculator component.
- No source was found by the earlier recursive F: search for Edge AI Stability, Antenna Lab, Custom Processor FSM, Pulse Live, or ONM. Their existing media remain unchanged.
- SPARK's existing generated incident report and the robot hardware video already show substantive output; they remain unchanged.
- Native desktop tools and network-dependent integrations retain their current captures where no credible replacement was captured. No live device transfer, course copying, provider dispatch, or hardware validation was performed.
