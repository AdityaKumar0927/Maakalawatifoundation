# Deployment guide (Vercel)

Follow these once, top to bottom. ~20 minutes.

## 1 · Create the Vercel project

1. In [Vercel](https://vercel.com/new), **Import** the GitHub repository
   `AdityaKumar0927/Maakalawatifoundation`.
2. Framework preset: **Next.js** (auto-detected). Build command and output are
   taken from the repo — do not override.
3. Node.js version: **22.x** (Project → Settings → General).

## 2 · Database (Neon Postgres)

1. Vercel Dashboard → **Storage** → **Create database** → **Neon Postgres**
   (region: Singapore `sin1` is closest to India).
2. Connect it to the project — this injects `DATABASE_URL` automatically
   (use the **pooled** connection string).
3. Create the tables (one time, from your machine):
   ```bash
   # .env with the SAME DATABASE_URL Vercel uses
   npm run db:push
   ```

## 3 · Environment variables (Project → Settings → Environment Variables)

| Name | Value |
| --- | --- |
| `DATABASE_URL` | (added automatically by the Neon integration) |
| `APP_ORIGIN` | `https://your-domain.org` — the final domain, no trailing slash |
| `SESSION_SECRET` | `openssl rand -base64 32` |
| `ADMIN_SETUP_TOKEN` | `openssl rand -base64 24` — keep private; used once below |
| `RATE_LIMIT_SALT` | `openssl rand -base64 16` |
| `BLOB_READ_WRITE_TOKEN` | optional — created by Storage → **Blob**; enables image uploads |

Redeploy after saving the variables.

## 4 · Domain

1. Project → Settings → **Domains** → add your domain (apex + `www`).
2. At your registrar, point DNS to Vercel (A `76.76.21.21` / CNAME
   `cname.vercel-dns.com` as instructed on that page). TLS certificates are
   issued and renewed automatically (ACME) — nothing to manage.
3. Set `APP_ORIGIN` to the exact `https://` domain you chose and redeploy.
   **WebAuthn passkeys are bound to this domain** — enrol passkeys only after
   the domain is final.
4. Registrar hardening (recommended):
   - **DNSSEC**: enable it at the registrar.
   - **CAA record**: `0 issue "letsencrypt.org"` and `0 issue "pki.goog"`
     (Vercel uses Let's Encrypt and Google Trust Services).
   - Lock the domain (transfer lock) and protect the registrar account with
     hardware-key MFA.
5. HSTS preload (optional, after everything works for a few days): submit the
   domain at [hstspreload.org](https://hstspreload.org) — the site already
   sends the required header.

## 5 · First administrator

1. Visit `https://your-domain.org/admin/setup`.
2. Enter your email, name and the `ADMIN_SETUP_TOKEN` value, then create the
   passkey when the browser prompts.
3. **Immediately after**: remove (or rotate) `ADMIN_SETUP_TOKEN` in Vercel and
   redeploy. Keep the removed value offline as a break-glass owner-recovery
   secret, or generate a fresh one when needed.
4. In `/admin/admins`, add a second passkey (your phone) so a lost device
   never locks you out. Invite other admins from the same page.

## 6 · Go-live checklist (in `/admin`)

- [ ] Settings → donation payment link (your Razorpay/other payment page URL)
- [ ] Settings → UPI ID, contact email, office hours, Google Maps link
- [ ] Settings → grievance contact name/email/phone (required by DPDP Rule 9)
- [ ] Settings → 80G line + registration line (when the paperwork is in hand)
- [ ] Content → review every text in both languages; add real impact numbers
- [ ] Images → upload a real hero photo (stock photos undermine donor trust)
- [ ] Add the first project(s) and event(s); post a welcome announcement
- [ ] Configure the payment page's *success URL* to
      `https://your-domain.org/en/donate/thank-you`

## 7 · Verify the hardening

- [Mozilla Observatory](https://developer.mozilla.org/en-US/observatory) — expect A/A+
- [SSL Labs](https://www.ssllabs.com/ssltest/) — expect A/A+
- GitHub → Security tab: CodeQL runs weekly + on every PR; Dependabot PRs
  arrive with a 7-day cooldown. Merge them promptly after CI passes.

## Operations

- **Backups**: Neon keeps point-in-time restore (check your plan's window).
- **Logs**: Vercel → Observability. Security-relevant actions are also in
  `/admin/audit` (append-only).
- **Data breach**: see the incident section in [SECURITY.md](SECURITY.md) —
  DPDP requires notifying affected people and the Data Protection Board.
- **Key rotation**: rotating `SESSION_SECRET` signs everyone out (harmless);
  sessions also expire after 12 hours.