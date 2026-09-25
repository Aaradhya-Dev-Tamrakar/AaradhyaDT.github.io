# Security Policy

## 🛡️ Supported Versions

We actively maintain and provide security updates for the latest deployment on the `main` branch.

| Version | Supported          |
| ------- | ------------------ |
| Latest (`main` branch / live deployment) | :white_check_mark: |
| Older releases / archived tags           | :x:                |

---

## 🔒 Threat Model & Architecture Note

The website features an educational client-side cryptography sandbox alongside administrative access gating:

1. **Client-Side Sandbox (Tier 1)**: Operates with public educational demonstration keys (`vip2026`) executing in-browser Web Crypto API (PBKDF2 100k iterations + AES-256-GCM authenticated decryption). This tier acts as an anti-scraping / crawler friction layer rather than an absolute secret boundary.
2. **Master Admin (Tier 2)**: Cryptographically verified Google OAuth 2.0 JWT identity authorization strictly tied to `aaradhyadevtmr@gmail.com`.

For full architecture details and security analysis, refer to [`dev-logs/SECURITY_AUDIT_VIP_TIER.md`](dev-logs/SECURITY_AUDIT_VIP_TIER.md).

---

## 🚨 Reporting a Vulnerability

If you discover a security vulnerability or potential threat in this repository or the live website, please report it responsibly. **Please do not report security vulnerabilities through public GitHub issues.**

### Disclosure Methods

1. **GitHub Private Vulnerability Reporting**:
   - Navigate to the repository's [Security Advisories](https://github.com/AaradhyaDT/AaradhyaDT.github.io/security/advisories) tab and click **"Report a vulnerability"**.

2. **Direct Email**:
   - Send an email to **[aaradhyadevtmr@gmail.com](mailto:aaradhyadevtmr@gmail.com)** with the subject line `[SECURITY] Potential Vulnerability in aaradhyadt.github.io`.

### What to Include in Your Report

To help us investigate and remediate the issue efficiently, please include:

- A clear description of the vulnerability and its potential impact.
- Step-by-step reproduction steps or Proof of Concept (PoC).
- Affected URLs, scripts, or components.
- Browser/OS environment details if client-specific.
- Any suggested fixes or mitigation strategies (optional).

### Response Timeline

- **Acknowledgment**: Within **48 hours** of receiving your report.
- **Triage & Assessment**: Within **5 business days**.
- **Remediation & Deployment**: As soon as a fix is verified through our automated verification suite.
- **Credit**: We are glad to credit security researchers in our release notes and changelog upon request once resolved.

Thank you for helping keep this project safe and secure!
