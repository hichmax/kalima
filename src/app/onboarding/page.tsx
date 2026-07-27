import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { OnboardingFlow } from "@/components/onboarding-flow";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "Créer mon parcours",
};

export default function OnboardingPage() {
  return (
    <main className="onboarding-page" id="main-content">
      <header className="onboarding-header">
        <Logo />
        <div className="row">
          <Link className="btn btn-ghost" href="/">Quitter</Link>
          <ThemeToggle />
        </div>
      </header>
      <OnboardingFlow />
    </main>
  );
}
