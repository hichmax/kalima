"use client";

import { BookOpenText, CalendarDots, Cards, GearSix, SunHorizon, TextAa } from "@phosphor-icons/react";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const NAV = [
  { href: "/aujourdhui", label: "Aujourd'hui", icon: SunHorizon },
  { href: "/programme", label: "Programme", icon: CalendarDots },
  { href: "/coran", label: "Coran", icon: BookOpenText },
  { href: "/reviser", label: "Réviser", icon: Cards },
  { href: "/mots", label: "Mots", icon: TextAa },
] as const;

const DESKTOP_EXTRA = [
  { href: "/lecons", label: "Leçons" },
  { href: "/sources", label: "Sources" },
] as const;

const isActive = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const spring = reduce ? { duration: 0 } : { type: "spring" as const, bounce: 0, duration: 0.35 };

  return (
    <>
      <div className="app-backdrop" aria-hidden="true" />
      <header className="topbar">
        <div className="container">
          <div className="topbar-inner glass thin">
            <Link href="/aujourdhui" className="brand" aria-label="Kalima, accueil de l'application">
              <span className="brand-mark" lang="ar">كَلِمَة</span>
              <span>Kalima</span>
            </Link>
            <LayoutGroup id="desktop-nav">
              <nav className="desktop-nav" aria-label="Navigation principale">
                {[...NAV, ...DESKTOP_EXTRA].map((item) => {
                  const active = isActive(pathname, item.href);
                  return (
                    <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}>
                      {active && <motion.span layoutId="nav-pill" className="nav-pill" transition={spring} />}
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </LayoutGroup>
            <Link href="/reglages" className="btn icon ghost" aria-label="Réglages">
              <GearSix size={22} weight="duotone" />
            </Link>
          </div>
        </div>
      </header>

      <div id="contenu">{children}</div>

      <div className="scroll-edge" aria-hidden="true" />
      <LayoutGroup id="tabbar">
        <nav className="tabbar glass" aria-label="Navigation">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link key={href} href={href} aria-current={active ? "page" : undefined}>
                {active && <motion.span layoutId="tab-pill" className="nav-pill" transition={spring} />}
                <Icon weight={active ? "fill" : "regular"} aria-hidden="true" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </LayoutGroup>
    </>
  );
}
