export function getClientIp(requestHeaders: Headers) {
  const forwarded = requestHeaders.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  const cfConnectingIp = requestHeaders.get("cf-connecting-ip");
  if (cfConnectingIp?.trim()) return cfConnectingIp.trim();

  const realIp = requestHeaders.get("x-real-ip");
  if (realIp?.trim()) return realIp.trim();

  return "unknown";
}
