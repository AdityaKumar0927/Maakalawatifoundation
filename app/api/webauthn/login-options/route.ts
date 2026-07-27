import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { rpID } from "@/lib/env";
import { hasValidOrigin } from "@/lib/guard";
import { rateLimit } from "@/lib/rate-limit";
import { storeChallenge } from "@/lib/webauthn";

export async function POST(request: Request): Promise<Response> {
  if (!hasValidOrigin(request)) {
    return Response.json({ error: "Bad origin" }, { status: 403 });
  }
  if (!(await rateLimit("webauthn-login", 20, 900))) {
    return Response.json({ error: "Too many attempts" }, { status: 429 });
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