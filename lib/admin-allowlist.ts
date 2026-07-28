import "server-only";

/**
 * Only these people may hold administrator accounts. Enforced at passkey
 * enrolment (setup + invites) AND on every session lookup, so removing an
 * address from this list locks that account out immediately.
 *
 * Override without a code change via the ADMIN_ALLOWED_EMAILS environment
 * variable (comma-separated).
 */
const DEFAULT_ALLOWED = [
  "artistadityakumar@gmail.com",
  "engineeryogesh12@gmail.com",
];

export function allowedAdminEmails(): ReadonlySet<string> {
  const raw = process.env.ADMIN_ALLOWED_EMAILS;
  const list = raw
    ? raw
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean)
    : DEFAULT_ALLOWED;
  return new Set(list);
}

export function isAllowedAdminEmail(email: string): boolean {
  return allowedAdminEmails().has(email.trim().toLowerCase());
}