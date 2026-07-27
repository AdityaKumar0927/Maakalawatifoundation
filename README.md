# Maa Kalawati Foundation — Website

**We care, we serve, we empower.**

Bilingual (English + हिन्दी) website for the Maa Kalawati Foundation, Gurugram —
healthcare support, education, women empowerment and community welfare — with a
full administrator panel and a security-first architecture.

## What's inside

| Area | Details |
| --- | --- |
| Public site | Home, About, Our Work (projects by pillar), Events, Donate, Patient registration, Contact, Privacy, Terms |
| Languages | First-visit language choice, header toggle, full Hindi translation, Devanagari-correct typography |
| Donations | On-site pre-donation page → external secure payment link, plus UPI ID/QR and offline giving |
| Patient registration | DPDP-compliant notice + consent, under-18 parental-consent branch, rate limited, honeypot + timing checks |
| Admin panel (`/admin`) | Edit all site text (both languages) and images, announcements, events, projects, patient request pipeline + CSV export + erasure, visitor-book OCR digitiser (English+Hindi, in-browser), admin management, append-only audit log |
| Authentication | **Passkeys only** (WebAuthn) — phishing-resistant, no passwords anywhere |

## Stack

Next.js 16 (App Router, `proxy.ts`) · TypeScript strict · Tailwind CSS 4 ·
Prisma 6 + Postgres · @simplewebauthn 13 · Tesseract.js 6 (self-hosted, no CDN) ·
Vercel Blob (optional, for image uploads)

## Security highlights

- Strict CSP with per-request nonces + `strict-dynamic`; Trusted Types in
  report-only; HSTS preload, COOP/CORP, frame-ancestors 'none', full header set
- Passkey-only admin auth; hashed server-side revocable sessions in a
  `__Host-` cookie (Secure, HttpOnly, SameSite=Strict)
- Deny-by-default authorization: proxy fence + server-side check in the admin
  layout **and** every server action **and** every admin API route
- All input zod-validated at the boundary; DB access via Prisma only
  (parameterized); user content rendered as plain text, never HTML
- Postgres-backed rate limiting keyed by salted IP hashes (raw IPs never stored)
- Append-only audit log; CSV export hardened against formula injection
- Supply chain: exact-pinned dependencies, `ignore-scripts=true`, lockfile,
  Dependabot with 7-day cooldown, CodeQL, no third-party scripts/fonts/CDNs at
  runtime — the site makes **zero** cross-origin requests

See [SECURITY.md](SECURITY.md) for the full model and operational guidance,
and [DEPLOYMENT.md](DEPLOYMENT.md) for step-by-step Vercel setup.

## Local development

```bash
npm ci                       # exact, script-free install
cp .env.example .env         # fill in DATABASE_URL, SESSION_SECRET, etc.
npm run db:push              # create tables (first time)
npm run dev
```

Open http://localhost:3000. For the admin panel, set `ADMIN_SETUP_TOKEN` in
`.env`, then visit http://localhost:3000/admin/setup to enrol the first passkey.

> Note: WebAuthn requires a secure context — `localhost` counts, so passkeys
> work in local dev on Chrome/Edge/Firefox.

## Useful scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Copies OCR assets, generates Prisma client, builds |
| `npm run typecheck` | TypeScript, strict |
| `npm run db:push` | Sync the Prisma schema to the database |
| `npm run db:studio` | Browse the database |