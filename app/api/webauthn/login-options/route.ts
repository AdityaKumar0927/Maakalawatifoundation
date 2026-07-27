import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { rpID } from "@/lib/env";
import { hasValidOrigin } from "@/lib/guard";
import { rateLimit } from "@/lib/rate-limit";
import { storeChallenge } from "@/lib/webauthn";

export async function POST(request: Request): Promise<Response> {
  if (!hasValidOrigin(request)) {
    return Response.json({ error: "Bad origin" }, { status: 403 });
  }
  const limit = await rateLimit("webauthn-login", 20, 900);
  if (limit !== "ok") {
    return limit === "limited"
      ? Response.json({ error: "Too many attempts — wait a while" }, { status: 429 })
      : Response.json({ error: "Temporarily unavailable — try again shortly" }, { status: 503 });
  }

  // Usernameless: discoverable credentials — the browser shows the account
  // picker. Nothing about existing accounts is disclosed to the caller.
  const options = await generateAuthenticationOptions({
    rpID: rpID(),
    userVerification: "preferred",
    allowCredentials: [],
  });

  await storeChallenge({ challenge: options.challenge, purpose: "authentication" });

  return Response.json({ options }, { headers: { "Cache-Control": "no-store" } });
}