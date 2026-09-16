# Evidence data

`quantitative-claims.json` is the repository-local provenance boundary for portfolio claims.
Every published (`verified`) record must contain a full 40-character source commit SHA,
repository-relative source path, verification-test reference, metric, and scope. Records
that cannot be tied to an immutable SHA are explicitly `needs_review` and are not treated
as verified evidence.

## Brainstorm integration boundary

The portfolio does not checkout or fetch `brainstorm` during verification. That would make
CI depend on another repository's branch state and credentials. If brainstorm publishes a
canonical manifest, a maintainer may export/copy it into this directory as
`brainstorm-claims.json` using the same `claims` record shape, then commit it for local
validation. `scripts/verify.py` detects and validates that local input; it never silently
falls back to a cross-repository checkout. Until that input is present, brainstorm claims
remain explicit `needs_review` records in `quantitative-claims.json`.
