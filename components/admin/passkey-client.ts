"use client";

import { startAuthentication, startRegistration } from "@simplewebauthn/browser";

/** Thin client for the WebAuthn API routes. Throws Error with a safe message. */

async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string } & T;
  if (!res.ok) throw new Error(data.error || "Something went wrong");
  return data;
}

export async function passkeyLogin(): Promise<void> {
  const { options } = await post<{ options: Parameters<typeof startAuthentication>[0]["optionsJSON"] }>(
    "/api/webauthn/login-options",
    {}
  );
  const response = await startAuthentication({ optionsJSON: options });
  await post("/api/webauthn/login-verify", { response });
}

export async function passkeyRegister(
  init:
    | { mode: "setup"; email: string; name: string; token: string }
    | { mode: "invite"; token: string; name: string }
    | { mode: "add" },
  deviceName?: string
): Promise<void> {
  const { options } = await post<{ options: Parameters<typeof startRegistration>[0]["optionsJSON"] }>(
    "/api/webauthn/register-options",
    init
  );
  const response = await startRegistration({ optionsJSON: options });
  await post("/api/webauthn/register-verify", { response, deviceName });
}