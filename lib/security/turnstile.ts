type VerifyTurnstileInput = {
  token: string;
  remoteIp?: string;
  expectedAction: string;
};

type TurnstileVerification = {
  success?: boolean;
  action?: string;
};

export async function verifyTurnstileToken(input: VerifyTurnstileInput) {
  const secret = process.env.TURNSTILE_SECRET;
  const token = input.token.trim();

  if (!secret || !token) {
    return false;
  }

  const body = new URLSearchParams({
    secret,
    response: token
  });
  if (input.remoteIp) body.set("remoteip", input.remoteIp);

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store"
  });

  if (!response.ok) return false;
  const result = (await response.json()) as TurnstileVerification;
  return result.success === true && result.action === input.expectedAction;
}
