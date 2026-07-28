import "server-only";

/** Read a required environment variable; fail closed if missing. */
export function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

/** Canonical origin of the site, no trailing slash. */
export function appOrigin(): string {
  const raw = process.env.APP_ORIGIN || "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}

/**
 * WebAuthn Relying Party ID — the registrable domain of the site.
 * "www." is stripped so passkeys work on both www and the apex domain.
 */
export function rpID(): string {
  return new URL(appOrigin()).hostname.replace(/^www\./, "");
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}
