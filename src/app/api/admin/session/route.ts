import { NextResponse } from "next/server";
import { z } from "zod";
import {
  adminSessionCookie,
  getAdminSessionValue,
  isAdminPasswordValid,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  const body = z.object({ token: z.string().min(8).max(256) }).safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
  }
  if (!isAdminPasswordValid(body.data.token)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminSessionCookie, getAdminSessionValue(), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 8,
    path: "/",
  });
  return response;
}
