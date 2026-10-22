import { createHash, timingSafeEqual } from "crypto";
import { AppError } from "@/server/errors";

const MAX_JSON_BYTES = 50_000;
const buckets = new Map<string, { count: number; reset: number }>();

export function clientKey(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  const realIp = request.headers.get("x-real-ip")?.trim() ?? "";
  const ip = forwarded || realIp || "unknown";
  return ip.replace(/[^\w.:-]/g, "").slice(0, 64) || "unknown";
}

export function enforceRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  if (buckets.size > 5000) {
    for (const [name, bucket] of buckets) {
      if (bucket.reset <= now) buckets.delete(name);
    }
  }
  const current = buckets.get(key);
  if (!current || current.reset <= now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return;
  }
  if (current.count >= limit) {
    const retryAfter = Math.max(1, Math.ceil((current.reset - now) / 1000));
    throw new AppError("Too many attempts. Wait a few minutes and try again.", 429, undefined, retryAfter);
  }
  current.count += 1;
}

export function secretsMatch(provided: string, expected: string) {
  const left = createHash("sha256").update(provided).digest();
  const right = createHash("sha256").update(expected.length >= 12 ? expected : "judge-invite-disabled").digest();
  const matches = timingSafeEqual(left, right);
  return expected.length >= 12 && matches;
}

export function assertSameOrigin(request: Request) {
  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin" && site !== "none") {
    throw new AppError("Forbidden.", 403);
  }
  const origin = request.headers.get("origin");
  if (!origin) return;
  const host = request.headers.get("host")?.split(",")[0]?.trim();
  if (!host) throw new AppError("Forbidden.", 403);
  let originHost = "";
  try {
    originHost = new URL(origin).host;
  } catch {
    throw new AppError("Forbidden.", 403);
  }
  if (originHost !== host) throw new AppError("Forbidden.", 403);
}

export async function readJsonBody(request: Request) {
  assertSameOrigin(request);
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declared) && declared > MAX_JSON_BYTES) {
    throw new AppError("That request is too large.", 413);
  }
  const text = await request.text();
  if (text.length > MAX_JSON_BYTES) throw new AppError("That request is too large.", 413);
  if (!text) return {};
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new AppError("Send valid JSON.", 400);
  }
}
