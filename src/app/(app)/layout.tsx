import { AppShell } from "@/components/app-shell";

export default function LearningLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
