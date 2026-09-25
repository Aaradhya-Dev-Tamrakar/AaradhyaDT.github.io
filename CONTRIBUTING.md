# Contributing to Aaradhya's Portfolio Website

Thank you for your interest in contributing to **aaradhyadt.github.io**!

This repository houses the personal portfolio, engineering projects, and interactive developer showcase of **Aaradhya Dev Tamrakar**. We welcome feedback, bug reports, typo fixes, accessibility improvements, and performance enhancements.

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [What You Can Contribute](#what-you-can-contribute)
3. [Development Setup](#development-setup)
4. [Architecture & Guidelines](#architecture--guidelines)
5. [Automated Verification Suite](#automated-verification-suite)
6. [Submitting a Pull Request](#submitting-a-pull-request)
7. [Commit Message Conventions](#commit-message-conventions)
8. [Questions and Feedback](#questions-and-feedback)

---

<a id="code-of-conduct"></a>
## Code of Conduct

All contributors and participants are expected to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md). Please report any violations or concerns to [aaradhyadevtmr@gmail.com](mailto:aaradhyadevtmr@gmail.com).

---

<a id="what-you-can-contribute"></a>
<a id="what-can-i-contribute"></a>
## What You Can Contribute

- 🐛 **Bug Reports & Fixes**: Broken links, visual glitches, script runtime errors, mobile responsive layout bugs.
- ♿ **Accessibility (a11y)**: Screen-reader optimizations, ARIA label accuracy, keyboard navigation, color contrast.
- ⚡ **Performance & SEO**: Lighthouse score improvements, asset optimizations, schema metadata enhancements.
- 📝 **Copy & Documentation**: Typo corrections, clearer explanations, grammatical refinements.

> **Note on Personal Data & Credentials**: Content additions relating to personal projects, achievements, certificates, or CV data are strictly managed by Aaradhya Dev Tamrakar.

---

<a id="development-setup"></a>
## Development Setup

The website is intentionally built with **Vanilla HTML5, CSS3, and ES6+ JavaScript** (zero external frameworks or node build steps required to serve).

### Prerequisites

- Python 3.10+ (for verification and local dev server)
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Local Dev Server

1. **Clone the repository**:
   ```bash
   git clone https://github.com/AaradhyaDT/AaradhyaDT.github.io.git
   cd AaradhyaDT.github.io
   ```

2. **Start the local development server**:
   ```bash
   python scripts/dev-serve.py
   # or: python -m http.server 8000
   ```

3. **Open in your browser**:
   Navigate to `http://localhost:8000`.

---

<a id="architecture-guidelines"></a>
<a id="architecture--guidelines"></a>
## Architecture & Guidelines

- **Vanilla Stack**: Maintain zero-dependency client architecture. Do not introduce heavy JavaScript frameworks (e.g. React, Vue, Angular) or runtime bundlers.
- **CSS Architecture**: Global design tokens and modules reside in `assets/css/modules/`. Maintain dark-mode first, glassmorphism aesthetics, and semantic variables.
- **JavaScript Modules**: Modular scripts reside in `assets/js/modules/` and are dynamically orchestrated by `assets/js/script.js`.
- **Security & Payloads**: Do not tamper with AES-256-GCM ciphertexts in `assets/js/data/` or bypass client-side access control boundaries.
- **Bot-Managed Files**: Never manually edit or stage `assets/js/last-commit.json`.

---

<a id="automated-verification-suite"></a>
## Automated Verification Suite

Before submitting any contribution, run the full verification test suite to ensure all cross-page links, asset references, JS syntax, and accessibility requirements pass:

```bash
python scripts/verify.py
```

All 25 test categories must pass cleanly:
```text
ALL 25 CHECKS PASSED
```

---

<a id="submitting-a-pull-request"></a>
## Submitting a Pull Request

1. **Fork the repository** on GitHub.
2. **Create a topic branch** from `main`:
   ```bash
   git checkout -b fix/dropdown-contrast-issue
   ```
3. **Make your changes** cleanly with minimal diff footprint.
4. **Verify your changes**:
   ```bash
   python scripts/verify.py
   ```
5. **Commit your changes** following [Conventional Commits](#commit-message-conventions).
6. **Push to your fork** and open a Pull Request against the `main` branch.
7. Fill out the [Pull Request Template](.github/pull_request_template.md) completely.

---

<a id="commit-message-conventions"></a>
## Commit Message Conventions

We adhere to the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat(scope)`: A new feature or user-facing capability
- `fix(scope)`: A bug fix or visual correction
- `docs(scope)`: Documentation or README updates
- `style(scope)`: CSS styling, formatting, or UI token tweaks (no logic changes)
- `refactor(scope)`: Code refactoring without changing functionality
- `perf(scope)`: Performance optimizations (e.g., image loading, script deferrals)
- `test(scope)`: Adding or modifying verification checks
- `chore(scope)`: Maintenance, tooling, or workflow tasks

**Example**:
```text
fix(terminal): resolve command history navigation edge case on Firefox
```

---

<a id="questions-and-feedback"></a>
<a id="questions-or-feedback"></a>
## Questions and Feedback

Feel free to open an issue using the [Issue Templates](.github/ISSUE_TEMPLATE/) or reach out directly at [aaradhyadevtmr@gmail.com](mailto:aaradhyadevtmr@gmail.com).
