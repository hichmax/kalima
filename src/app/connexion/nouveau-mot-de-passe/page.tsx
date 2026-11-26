import type { Metadata } from "next";
import { AuthScreen } from "@/components/auth-screen";
import { mailEnabled } from "@/lib/mail";
import "../auth.css";

export const metadata: Metadata = { title: "Nouveau mot de passe", robots: { index: false } };

/** Arrivée depuis le lien de l'e-mail : Better Auth ajoute ?token=… (ou ?error=INVALID_TOKEN). */
export default async function NewPasswordPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : null;
  return (
    <AuthScreen
      initialMode="connexion"
      next="/aujourdhui"
      googleEnabled={false}
      initialError={null}
      resetEnabled={mailEnabled}
      reset={{ token, invalid: Boolean(params.error) || !token }}
    />
  );
}
