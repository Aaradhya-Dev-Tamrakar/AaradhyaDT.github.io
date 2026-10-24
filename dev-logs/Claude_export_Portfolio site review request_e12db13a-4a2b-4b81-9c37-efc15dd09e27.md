# Portfolio site review request

**Model:** claude-sonnet-5-5

### User

Rate my portfolio site
github.com/AaradhyaDT/AaradhyaDT.github.io

---

### Assistant

Model: Sonnet 5.5 · effort: medium · extended thinking: off (current setup is fine)

repo link/path given this turn: yes

sync.ps1: found

**8.5/10**, in line with the earlier external review.

| Area | Score |
|---|---|
| Engineering/tooling | 9.5 |
| Visual identity | 9 |
| Content depth (46 projects, journey, achievements) | 8.5 |
| SEO/AEO (JSON-LD, OG, llms.txt, sitemap, CSP, PWA) | 8.5 |
| Performance | 7.5 |
| Repo hygiene | 6 |

**What stands out:** the CI covers Lighthouse, visual regression, unit tests and `verify.py`. Reduced-motion is respected, and the dark editorial look is distinctive.

**Fix in this order:**
1. **Repo hygiene (biggest drag):** the public repo holds a 21 MB `clean_codebase_payload.txt`, `chat_history/` (including personal and astrology chats), `graphify-out/`, and AGENTS/GEMINI/CLAUDE.md. A recruiter opening the repo sees noise. Move these out or into `.gitignore`.
2. **Canonical domain:** canonicals and the sitemap use `aaradhyadt.github.io`, but the repo's own workflow notes also reference `aaradhya-dev-tamrakar.github.io`. Confirm the second domain 301s or canonicalises, since split canonicals dilute SEO.
3. **Weight:** `projects.html` is 179 KB and `journey.html` is 140 KB. Certificates total 19 MB, with 10 files over 500 KB. Project images are stored twice (60 PNG plus 60 WebP). Serve only WebP and compress the certificates. This is the likely cause of the 87 mobile score.
4. **CLS:** only 8 of 43 `<img>` tags in `projects.html` have `width`/`height`. Add them to the rest.
5. **First-screen focus:** with cmdk, terminal, tour, audio, haptics and background animations, the site has more features than a 30-second recruiter scan needs. Make sure the first viewport answers who you are, what you build and the proof, with the extras kept secondary.
6. **Minor:** `experience.html` has 8 `alt=""` images; confirm they are decorative.

The text-only project cards gap from the earlier review looks largely closed. About 60 images exist under `assets/images/projects`. I didn't verify per-card coverage.

---

### User

AS a site only not repo

---

### Assistant

**Site only: 8.5/10.** Removing the repo hygiene drag doesn't change the score, because performance and first-impression focus still hold it back.

| Area | Score |
|---|---|
| Visual identity (dark editorial, type pairing, light/dark) | 9 |
| Content depth (46 projects, journey, achievements, certs) | 8.5 |
| Interaction layer (cmdk, terminal, tour) | 8.5 |
| SEO/AEO (JSON-LD, OG, canonicals, sitemap, llms.txt) | 8.5 |
| Accessibility (reduced-motion handled, skip/aria present) | 8 |
| Performance (mobile 87, desktop 99) | 7.5 |
| First-impression clarity | 7.5 |

**Fix in this order:**
1. **Mobile performance:**
   - `projects.html` is 179 KB and `journey.html` is 140 KB of HTML.
   - Certificates total 19 MB, with 10 files over 500 KB.
   - Project images exist as both PNG and WebP.
   - Serve WebP only, lazy-load certificates, and paginate or defer the heavy sections.
2. **Layout shift:** only 8 of 43 project images have `width`/`height`. Add them to the rest.
3. **First viewport:** the site has many features (audio, haptics, terminal, tour, background animation). A recruiter spends about 30 seconds, so the first screen should answer who you are, what you build and the proof, with the extras secondary.
4. **Canonical domain:** canonicals and the sitemap use `aaradhyadt.github.io`. Confirm any other domain you use redirects to it.
5. **Gated tiers:** VIP and Master content is invisible to visitors. Make sure the public pages carry the strongest material and a downloadable CV.
6. **Minor:** `experience.html` has 8 `alt=""` images. Confirm they are decorative.

---

### User

Mostly desktop focused

---

### Assistant

**Desktop-focused: 9/10.** Desktop Lighthouse is 99, so the performance drag drops out. Most of the engineering effort (cmdk palette, keyboard shortcuts, terminal, hover and cursor effects, background animation) pays off on desktop.

| Area | Score |
|---|---|
| Visual identity | 9 |
| Content depth | 8.5 |
| Interaction/keyboard UX | 9 |
| SEO/AEO | 8.5 |
| Performance | 9.5 |
| First-impression clarity | 7.5 |

**Remaining fixes:**
1. **First viewport (the main gap):** with this many features, the hero must state who you are, what you build and one proof point without scrolling or discovering the palette. Surface the strongest 2-3 projects above the fold.
2. **Information density:** `projects.html` (46 projects) and `journey.html` are long. Add filters or tags and a sticky index so a visitor can jump to the relevant work, and lead with a featured set.
3. **Gated tiers:** VIP and Master content is invisible to most visitors. Keep the strongest proof and a downloadable CV public.
4. **Canonical domain:** canonicals and the sitemap use `aaradhyadt.github.io`. Confirm any other domain you use redirects to it.
5. **Ultrawide check:** I only read the code and didn't render it. Test 1440p and ultrawide for max-width containers and for background animation that scales or tiles badly.
6. **Minor:** layout shift is a small issue on desktop. Only 8 of 43 project images have `width`/`height`, so add the rest anyway.

---
