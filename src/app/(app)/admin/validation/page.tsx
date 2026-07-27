import { cookies } from "next/headers";
import { AdminLogin } from "@/components/admin-login";
import { ValidationPanel } from "@/components/validation-panel";
import { PageHeader } from "@/components/page-header";
import vocabulary from "@/data/vocabulary.generated.json";
import {
  adminSessionCookie,
  isAdminSessionAuthorized,
} from "@/lib/admin-auth";
import {
  getVocabularyReviewQueue,
  syncVocabularyReviewQueue,
} from "@/lib/database";
import type { VocabularyUnit } from "@/lib/types";

export default async function ValidationPage() {
  const cookieStore = await cookies();
  const authorized = isAdminSessionAuthorized(
    cookieStore.get(adminSessionCookie)?.value,
  );
  if (!authorized) return <AdminLogin />;
  syncVocabularyReviewQueue(vocabulary.units as VocabularyUnit[]);
  const items = getVocabularyReviewQueue();
  return (
    <>
      <PageHeader
        eyebrow="Interne · accès protégé"
        title="Vérifier les 1 000 mots"
        description="Contrôler la traduction française, la phonétique, l’audio et la source de chaque occurrence. Les décisions restent dans SQLite sur cet appareil."
      />
      <ValidationPanel initialItems={items} />
    </>
  );
}
