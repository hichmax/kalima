import { cookies } from "next/headers";
import { listUsers } from "@/lib/admin-users";
import { ADMIN_COOKIE, isValidAdminToken } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

/** Cellule CSV sûre : guillemets doublés, et pas de formule exécutable dans Excel. */
function cell(value: string) {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

/** Export CSV des inscrits. ?filtre=nouvelles pour ne garder que les personnes qui ont consenti. */
export async function GET(request: Request) {
  if (!isValidAdminToken((await cookies()).get(ADMIN_COOKIE)?.value)) return new Response("Accès réservé.", { status: 403 });

  const onlyNews = new URL(request.url).searchParams.get("filtre") === "nouvelles";
  const users = (await listUsers()).filter((user) => !onlyNews || user.newsletter);
  const lines = [
    ["email", "prenom", "inscription", "nouvelles", "email_verifie", "methode", "derniere_synchro"].join(","),
    ...users.map((user) =>
      [
        cell(user.email),
        cell(user.name),
        cell(user.createdAt.slice(0, 10)),
        cell(user.newsletter ? "oui" : "non"),
        cell(user.emailVerified ? "oui" : "non"),
        cell(user.methods.join(" + ")),
        cell(user.lastSync ? user.lastSync.slice(0, 10) : ""),
      ].join(","),
    ),
  ];
  const day = new Date().toISOString().slice(0, 10);
  return new Response("﻿" + lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="kalima-inscrits-${onlyNews ? "nouvelles-" : ""}${day}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
