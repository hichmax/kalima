import type { Metadata } from "next";
import { AuthScreen } from "@/components/auth-screen";
import "./auth.css";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connecte-toi pour retrouver ta progression Kalima sur tous tes appareils.",
  robots: { index: false },
};

/** N'accepte qu'un chemin interne comme destination après connexion (pas de redirection ouverte). */
function safeNext(value: string | string[] | undefined) {
  const next = Array.isArray(value) ? value[0] : value;
  return next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : "/aujourdhui";
}

export default async function ConnexionPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  return <AuthScreen initialMode={params.mode === "inscription" ? "inscription" : "connexion"} next={safeNext(params.suite)} googleEnabled={googleEnabled} />;
}
