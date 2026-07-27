import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";

export const adminSessionCookie = "kalima_review_session";

const digest = (value: string) =>
  createHash("sha256")
    .update(`kalima-local-review:${value}`)
    .digest("hex");

export function getAdminPassword() {
  return process.env.INTERNAL_REVIEW_TOKEN || "";
}

export function getAdminSessionValue() {
  const password = getAdminPassword();
  return password ? digest(password) : "";
}

export function isAdminSessionAuthorized(cookieValue?: string) {
  const expected = getAdminSessionValue();
  if (!expected || !cookieValue) return false;
  const providedBuffer = Buffer.from(cookieValue);
  const expectedBuffer = Buffer.from(expected);
  return (
    providedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(providedBuffer, expectedBuffer)
  );
}

export function isAdminPasswordValid(value: string) {
  const expected = getAdminPassword();
  if (!expected) return false;
  const providedBuffer = Buffer.from(digest(value));
  const expectedBuffer = Buffer.from(digest(expected));
  return timingSafeEqual(providedBuffer, expectedBuffer);
}
