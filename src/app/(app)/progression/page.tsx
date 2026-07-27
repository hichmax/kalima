import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { ProgressOverview } from "@/components/progress-overview";

export const metadata: Metadata = {
  title: "Ma progression",
};

export default function ProgressPage() {
  return (
    <>
      <PageHeader
        eyebrow="Mon Coran appris"
        title="Quelles sourates sais-tu déjà réciter ?"
        description="Une liste simple et manuelle pour garder une trace des sourates apprises. D’autres indicateurs pourront être ajoutés plus tard."
      />
      <ProgressOverview />
    </>
  );
}
