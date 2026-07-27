import type { ReviewStatus } from "@/lib/types";

const labels: Record<ReviewStatus, string> = {
  imported: "Donnée brute importée",
  draft: "Brouillon",
  needs_review: "À valider",
  linguistically_reviewed: "Relu linguistiquement",
  religiously_reviewed: "Relu religieusement",
  approved: "Approuvé",
  published: "Publié",
  rejected: "Rejeté",
};

export function ContentStatus({ status }: { status: ReviewStatus }) {
  return (
    <span className={`chip content-status status-${status}`}>
      {labels[status]}
    </span>
  );
}
