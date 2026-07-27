# Security model

This document explains what protects the site, why, and what to do when
something goes wrong. Audience: the site owner and future developers.

## Architecture: smallest possible attack surface

- **Zero third-party runtime dependencies in the browser.** No CDNs, no
  analytics, no external fonts or scripts. Every byte the visitor loads comes
  from this origin (donation payments happen on the payment provider's site,
  reached only by an explicit link click). This removes whole classes of
  supply-chain and privacy risk and makes the strict CSP below possible.
- **One managed platform.** Vercel terminates TLS (1.3, automatic ACME
  certificates), runs the code, and hosts the Postgres (Neon) and Blob stores.
  There are no servers to patch.
- **OCR runs client-side.** The visitor-book digitiser uses a self-hosted
  Tesseract build in the admin's own browser; the photographed register page
  never leaves their device unless they explicitly attach it.

## Identity: passkeys only

- Admin sign-in is **WebAuthn passkeys exclusively** — no passwords exist, so
  they cannot be phished, stuffed, or leaked. Credentials are origin-bound:
  a lookalike domain gets nothing.
- Sessions are opaque 256-bit tokens in a `__Host-` cookie (Secure, HttpOnly,
  SameSite=Strict, Path=/). The database stores only the SHA-256 hash, so a
  database leak yields no usable sessions. Sessions expire after 12 h and are
  revocable server-side (deactivating an admin revokes theirs immediately).
- Enrolment paths: one-time `ADMIN_SETUP_TOKEN` (constant-time compared;
  rotate it out after first use), single-use 72-hour invite links (only the
  hash is stored), and self-service add-passkey for signed-in admins.

## Authorization: deny by default, checked three times

1. `proxy.ts` refuses `/admin/*` without a session cookie (cheap outer fence).
2. The admin layout resolves and verifies the session server-side.
3. **Every server action and admin API route independently calls
   `requireAdminAction()` / `getAdminForRequest()`** — a missed check in one
   place cannot fail open, and OWNER-only operations (admin management)
   enforce role there too.

State-changing API routes additionally verify the `Origin` header; server
actions get the same protection from Next.js itself.

## Browser hardening

- **CSP**: `script-src 'nonce-…' 'strict-dynamic'` with a fresh nonce per
  request; `object-src 'none'`, `frame-ancestors 'none'`, `base-uri 'self'`,
  `form-action 'self'`. `wasm-unsafe-eval` is granted only under `/admin`
  (Tesseract OCR).
- **Trusted Types** runs in `Content-Security-Policy-Report-Only`. After a few
  weeks with no violations in production, promote it to the enforcing header
  in `proxy.ts` to eliminate DOM-XSS as a class.
- HSTS (2 years, includeSubDomains, preload), X-Content-Type-Options,
  Referrer-Policy, COOP/CORP, X-Frame-Options, and a restrictive
  Permissions-Policy are set in `next.config.ts`.
- No HTML is ever rendered from stored content — all admin- and user-supplied
  text renders as plain text (`whitespace-pre-line` for paragraphs).

## Input & data

- Every boundary is validated with zod allowlist schemas; free text is
  length-capped and stripped of control characters. Database access is Prisma
  only (parameterized). Uploaded images are checked by **magic bytes** (JPEG/
  PNG/WebP), capped at 5 MB, and stored under random UUID names.
- Public forms: salted-IP rate limiting (Postgres-backed, fails closed),
  honeypot field, and minimum-time submission checks.
- CSV export prefixes `= + - @` cells to block spreadsheet formula injection.

## DPDP Act 2023 compliance (India)

Substantive obligations commence **13 May 2027**; the site implements them now:

- Standalone bilingual notice at the point of collection (patient form):
  itemised data, purpose, rights, withdrawal, grievance route, Data Protection
  Board escalation. Consent is an unticked checkbox; version + language are
  recorded with each submission.
- Under-18 registrations require parent/guardian consent with voluntarily
  provided identity details (Rule 10 due diligence).
- Data minimisation: no analytics, no tracking cookies, raw IPs never stored
  (only salted hashes for rate limiting), only fields needed for the purpose.
- Rights support: admins can view, correct, export and **permanently erase**
  patient records; the privacy policy publishes the grievance contact
  (Rule 9) and a response time well under the 90-day ceiling.
- Security safeguards (Rule 6): encryption in transit, access-controlled
  records, ~1-year append-only audit log, managed backups.
- Retention schedule is published in the privacy policy; enforce it by
  periodically erasing closed records past their window.

### If a data breach happens

1. Contain (rotate secrets, revoke sessions, deactivate compromised admins).
2. Write down what happened and when — `/admin/audit` helps.
3. Inform affected people promptly and plainly: what happened, likely
   consequences, what you did, what they should do, and a contact person.
4. Report to the Data Protection Board of India: initial intimation without
   delay, detailed report within 72 hours.

## Supply chain

- Exact-pinned versions, committed lockfile, `ignore-scripts=true` (install
  lifecycle scripts — the main npm-worm vector — never run).
- New releases are not adopted for 7 days (Dependabot `cooldown`), CodeQL
  runs weekly and on PRs, CI builds every push.
- Tesseract worker/WASM are copied from `node_modules` at build time and the
  language models are committed to the repo — nothing is fetched from a CDN.

## The perimeter you must keep hard

The site's security bottoms out in these accounts — protect each with
hardware-key MFA (or at minimum platform passkeys), no shared logins, and no
personal-email recovery: **GitHub**, **Vercel**, **Neon**, **the domain
registrar**, and the **payment provider** dashboard.

## Reporting a vulnerability

Please email the grievance/technical contact published in the site footer.
We will acknowledge within a few days and fix confirmed issues promptly.