"use client";

import {
  BookOpenText,
  CardsThree,
  ChartDonut,
  Books,
  House,
  Path,
  ShieldCheck,
  Target,
} from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

const desktopNav = [
  { label: "Accueil", href: "/dashboard", icon: House },
  { label: "Défi de 5 mots", href: "/defi", icon: Target },
  { label: "Coran", href: "/coran", icon: BookOpenText },
  { label: "Apprendre", href: "/apprendre", icon: Path },
  { label: "Réviser", href: "/reviser", icon: CardsThree },
  { label: "Vocabulaire", href: "/vocabulaire", icon: Books },
  { label: "Progression", href: "/progression", icon: ChartDonut },
] as const;

const mobileNav = [
  { label: "Accueil", href: "/dashboard", icon: House },
  { label: "Apprendre", href: "/apprendre", icon: Path },
  { label: "Coran", href: "/coran", icon: BookOpenText },
  { label: "Réviser", href: "/reviser", icon: CardsThree },
  { label: "Progression", href: "/progression", icon: ChartDonut },
] as const;

const isCurrent = (pathname: string, href: string) =>
  pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <Logo href="/dashboard" />
        <nav className="app-nav" aria-label="Espace d’apprentissage">
          {desktopNav.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                className="app-nav-link"
                href={item.href}
                key={item.href}
                aria-current={isCurrent(pathname, item.href) ? "page" : undefined}
              >
                <Icon size={20} aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-spacer" />
        <div className="soft-card stack" style={{ gap: 10 }}>
          <span className="cluster">
            <span className="status-dot" />
            <strong style={{ fontSize: ".8rem" }}>Mode local actif</strong>
          </span>
          <span className="muted" style={{ fontSize: ".72rem", lineHeight: 1.5 }}>
            Ta progression reste sur cet appareil et pourra être synchronisée après connexion.
          </span>
        </div>
        <div className="row" style={{ justifyContent: "space-between", marginTop: 16 }}>
          <Link className="btn btn-ghost btn-icon" href="/admin/validation" aria-label="Espace de validation">
            <ShieldCheck size={21} />
          </Link>
          <ThemeToggle />
        </div>
      </aside>
      <main className="app-main" id="main-content">
        <div className="app-content">{children}</div>
      </main>
      <nav className="mobile-nav" aria-label="Navigation mobile">
        {mobileNav.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              href={item.href}
              key={item.href}
              aria-current={isCurrent(pathname, item.href) ? "page" : undefined}
            >
              <Icon size={21} aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
