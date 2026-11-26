import type { Metadata } from "next";
import { Dashboard } from "@/components/dashboard";

export const metadata: Metadata = { title: "Aujourd'hui" };

export default function TodayPage() {
  return (
    <main className="container page">
      <h1 className="visually-hidden">Aujourd&apos;hui</h1>
      <Dashboard />
    </main>
  );
}
