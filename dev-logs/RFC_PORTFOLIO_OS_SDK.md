# RFC: Portfolio-OS — Open Architecture, Template & Developer SDK

**Status:** Proposed / Backlog  
**Target Milestone:** Future Initiative (v54+)  
**Author:** Aaradhya Dev Tamrakar  
**Date:** 2026-09-08  

---

## 1. Executive Summary

This RFC outlines the strategic plan and architectural decomposition required to transform the current high-performance portfolio codebase into **Portfolio-OS**: a zero-dependency, agent-native portfolio template and developer SDK for engineers, researchers, and systems developers.

The current repository already operates with architectural properties rarely found in personal websites:
- **Zero Framework Lock-in:** 100% vanilla ES modules, CSS custom property tokens, and semantic HTML5 with zero runtime build dependencies.
- **Embedded Developer HUDs:** In-browser Dev Terminal (`#adtTerminal`), Command Palette (`cmdk.js`), Web Audio API synthesizer (`audio.js`), Web Haptics (`haptics.js`), and interactive product tour (`tour.js`).
- **Cryptographic Access Layer:** AES-256-GCM client-side encryption (`access.js` / `manage_payloads.py`) allowing confidential/NDAd projects and private credentials to be safely hosted on public static hosts (GitHub Pages) with zero-leak guarantees.
- **Agent-Native Protocol:** Built-in Model Context Protocol (MCP) server (`site_mcp.py`) enabling AI assistants to explore, query, and verify credentials directly.
- **Industrial DevOps & Verification Suite:** Multi-tier automated verification (`verify.py`, 24 check categories), AST knowledge graph synchronization (`graphify`), and single-pass atomic deployment (`sync.ps1`).

---

## 2. Productization Archetypes

Three distribution layers will be evaluated for the project:

```
┌─────────────────────────────────────────────────────────────┐
│                    Distribution Layers                       │
├──────────────────────────────┬──────────────────────────────┤
│ Layer 1: Starter Template    │ "Use this template" on GitHub│
│                              │ Clone -> edit config -> done │
├──────────────────────────────┼──────────────────────────────┤
│ Layer 2: Headless HUD SDK    │ npm: @engineer/portfolio-hud │
│                              │ Embed CmdK, Terminal, Audio  │
├──────────────────────────────┼──────────────────────────────┤
│ Layer 3: Portfolio CLI / SSG │ npm / pip: portfolio-cli     │
│                              │ init, verify, encrypt, sync  │
└──────────────────────────────┴──────────────────────────────┘
```

### Layer 1: The Zero-Dependency Starter Template (Target: Phase 1)
- Clean GitHub template repository with generic placeholders.
- Centralized `portfolio.config.js` and JSON data files (`data/projects.json`, `data/resume.json`).
- Pre-configured GitHub Actions CI workflow with `verify.py` and automatic GitHub Pages deployment.

### Layer 2: Embedded HUD & Runtime Library (Target: Phase 2)
- Lightweight ES module bundle exporting customizable HUD components:
  - `<portfolio-terminal>` / `initTerminal(options)`
  - `<portfolio-cmdk>` / `initCommandPalette(options)`
  - `<portfolio-gatekeeper>` / `initAccessControl(options)`
  - `initAudioFX(options)`
- Allows any developer with an existing site (Astro, Next.js, Hugo, static HTML) to drop in the terminal, audio, and encrypted gatekeeper.

### Layer 3: Unified Developer CLI (Target: Phase 3)
- Command-line tool unifying existing Python utilities:
  - `portfolio init`: Interactive project scaffolding.
  - `portfolio verify`: Diagnostic suite (links, assets, schemas, CSP).
  - `portfolio payload encrypt|decrypt|verify`: AES-256-GCM management.
  - `portfolio sync`: Conventional commits, version synchronization, and push.
  - `portfolio mcp-serve`: Local MCP server for agent integration.

---

## 3. Architecture Decoupling Boundary

To separate the **generic engine** from **personal content**, the repository structure will be partitioned into three domains:

```
portfolio-os/
├── portfolio.config.yaml       # Master identity, navigation, theme tokens, feature flags
├── content/                     # User-owned content (Git-tracked & human editable)
│   ├── projects.json            # Categorized project definitions & metadata
│   ├── resume.json              # Structured resume schema (JSON Resume standard)
│   ├── achievements.json        # Credentials, certificates, and media links
│   └── encrypted/               # Encrypted AES-256 payload blobs
├── engine/                      # Core runtime (Zero external dependencies)
│   ├── js/
│   │   ├── core.js              # Theme engine, routing, date utilities
│   │   ├── cmdk.js              # Universal command palette & search
│   │   ├── terminal.js          # Interactive shell & simulated commands
│   │   ├── audio.js             # Web Audio API sound generator
│   │   ├── haptics.js           # Vibration & tactile feedback
│   │   ├── access.js            # Web Crypto AES-256-GCM gatekeeper
│   │   └── tour.js              # Guided onboarding walkthrough
│   └── css/
│       ├── tokens.css           # System design tokens & palettes
│       ├── components.css       # Cards, modals, buttons, HUD styling
│       └── terminal.css         # Terminal styling & CRT retro effects
└── tooling/                     # Python & shell automation
    ├── verify.py                # Pre-commit diagnostic & integrity checker
    ├── manage_payloads.py       # Payload encryption / decryption tool
    ├── site_mcp.py              # Model Context Protocol stdio server
    └── site_automation.py       # Multi-target version propagation
```

---

## 4. Technical Specifications

### 4.1. Configuration Schema (`portfolio.config.yaml`)

```yaml
identity:
  name: "Jane Doe"
  title: "Systems & AI Engineer"
  tagline: "Building resilient distributed infrastructure."
  location: "San Francisco, CA"
  avatar: "assets/images/portrait.webp"

features:
  terminal: true
  commandPalette: true
  audioSynthesizer: true
  haptics: true
  guidedTour: true
  encryptedGate: true
  serviceWorkerPWA: true
  mcpServer: true

theme:
  default: "dark"
  accents: ["amber", "cyan", "emerald", "violet"]
  typography:
    sans: "Inter, system-ui, sans-serif"
    serif: "Newsreader, Georgia, serif"
    mono: "JetBrains Mono, monospace"

accessControl:
  keyDerivation: "PBKDF2-SHA256"
  cipher: "AES-256-GCM"
  iterations: 100000
```

### 4.2. Zero-Leak Cryptographic Protocol
- **No Backend Requirement:** Uses browser-native `crypto.subtle` (PBKDF2 key derivation + AES-256-GCM cipher).
- **Offline Decryption:** Payload strings are base64-encoded ciphertexts in `assets/js/data/payloads.js`.
- **Passkey / OAuth Validation:** Can validate local passcode hashes or verify identity tokens client-side.

### 4.3. Universal Verification Engine
The 24-category verification suite in `scripts/verify.py` will be generalized to:
1. Accept arbitrary project roots and dynamic page lists.
2. Validate links, images, JSON schemas, tag balancing, and file budgets against configurable thresholds.
3. Serve as an open-source pre-commit tool for any static website.

---

## 5. Implementation Roadmap

### Phase 1: Engine & Content Separation
- [ ] Create `assets/js/data/portfolio-config.js` to externalize identity and social links.
- [ ] Refactor `terminal.js` and `cmdk.js` to ingest command lists and project catalogs from configuration rather than hardcoded arrays.
- [ ] Decouple `access.js` from specific email addresses, moving VIP access lists into configuration.

### Phase 2: Template Extraction & Hygiene
- [ ] Create a standalone `template` branch or independent repository.
- [ ] Replace personal certificates, images, and project descriptions with high-quality generic examples.
- [ ] Package `verify.py` and `manage_payloads.py` into a portable `tools/` directory with a unified entrypoint.

### Phase 3: Community Release & Package Distribution
- [ ] Publish GitHub Template repository with "One-Click Deploy to GitHub Pages".
- [ ] Package `@portfolio-os/hud` on npm for developers seeking drop-in Web Components.
- [ ] Publish documentation website showcasing live demos of the terminal, audio synthesizer, and encrypted gatekeeper.
