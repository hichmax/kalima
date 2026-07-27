"use client";

import type { LearnerProgress } from "@/lib/types";

const deviceKey = "kalima:device-id:v1";
const legacyDeviceKey = "nour:device-id:v1";

export function getDeviceId() {
  let deviceId =
    window.localStorage.getItem(deviceKey) ||
    window.localStorage.getItem(legacyDeviceKey);
  if (!deviceId) {
    deviceId = crypto.randomUUID();
  }
  window.localStorage.setItem(deviceKey, deviceId);
  return deviceId;
}

export async function pushProgressToLocalDatabase(progress: LearnerProgress) {
  const response = await fetch("/api/progress", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-device-id": getDeviceId(),
    },
    body: JSON.stringify(progress),
  });
  return response.ok;
}

export async function pullProgressFromLocalDatabase() {
  const response = await fetch("/api/progress", {
    headers: { "x-device-id": getDeviceId() },
  });
  if (!response.ok) return null;
  const body = (await response.json()) as { progress?: LearnerProgress };
  return body.progress || null;
}
