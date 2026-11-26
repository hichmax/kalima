"use client";

import {
  BookOpenText,
  Books,
  CalendarDots,
  ChartLineUp,
  Cards,
  GearSix,
  GraduationCap,
  Headphones,
  House,
  List,
  Seal,
  SunHorizon,
  TextAa,
  UserCircle,
  X,
} from "@phosphor-icons/react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { AccountSync } from "@/components/account-sync";
import { AmbientBackdrop } from "@/components/ambient-backdrop";
import { useSession } from "@/lib/auth-client";
import { LogoMark } from "@/components/logo";

/** Les cinq destinations du quotidien (barre du bas sur mobile). */
const NAV = [
  { href: "/aujourdhui", label: "Aujourd'hui", icon: SunHorizon },
  { href: "/programme", label: "Programme", icon: CalendarDots },
  { href: "/ecouter", label: "Écouter", icon: Headphones },
  { href: "/coran", label: "Coran", icon: BookOpenText },
  { href: "/reviser", label: "Réviser", icon: Cards },
] as const;

/** Le reste, rangé dans « Plus » : bibliothèque, transparence, réglages. */
const MORE = [
  { href: "/", label: "Accueil du site", detail: "La présentation de Kalima", icon: House },
  { href: "/progression", label: "Ma progression", detail: "Graphiques : régularité, mémoire, couverture", icon: ChartLineUp },
  { href: "/alphabet", label: "L'alphabet", detail: "Apprendre, s'entraîner, réviser les lettres", icon: TextAa },
  { href: "/mots", label: "Les mots", detail: "Les 300 mots les plus fréquents", icon: Books },
  { href: "/lecons", label: "Toutes les leçons", detail: "Refaire une leçon à tout moment", icon: GraduationCap },
  { href: "/sources", label: "Sources", detail: "D'où vient chaque contenu", icon: Seal },
  { href: "/reglages", label: "Réglages", detail: "Phonétique, taille, sauvegarde", icon: GearSix },
] as const;

const isActive = (pathname: string, href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session } = useSession();
  const account = session
    ? { href: "/compte", label: "Mon compte", detail: session.user.email, icon: UserCircle }
    : { href: "/connexion", label: "Se connecter", detail: "Retrouver ta progression sur tous tes appareils", icon: UserCircle };
  const spring = reduce ? { duration: 0 } : { type: "spring" as const, bounce: 0, duration: 0.35 };

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    // La page derrière ne défile plus tant que le menu est ouvert (seul le menu défile).
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      root.style.overflow = previous;
    };
  }, [menuOpen]);

  return (
    <>
      <AmbientBackdrop />
      <AccountSync />
      <header className="topbar">
        <div className="container">
          <div className="topbar-inner glass thin">
            <Link href="/" className="brand" aria-label="Kalima, retour à l'accueil du site">
              <LogoMark size={30} />
              <span className="brand-word">Kalima</span>
            </Link>
            <LayoutGroup id="desktop-nav">
              <nav className="desktop-nav" aria-label="Navigation principale">
                {[...NAV, { href: "/alphabet", label: "Alphabet", extra: true }, { href: "/mots", label: "Mots", extra: true }].map((item) => {
                  const active = isActive(pathname, item.href);
                  return (
                    <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={"extra" in item ? "nav-extra" : undefined}>
                      {active && <motion.span layoutId="nav-pill" className="nav-pill" transition={spring} />}
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </LayoutGroup>
            <div className="topbar-actions">
            <Link
              href={account.href}
              className="btn icon ghost account-btn"
              aria-label={account.label}
              data-signed={session ? "in" : "out"}
              aria-current={isActive(pathname, account.href) ? "page" : undefined}
            >
              {session ? <span className="account-initial" aria-hidden="true">{(session.user.name || session.user.email).trim().charAt(0).toUpperCase()}</span> : <UserCircle size={22} weight="duotone" aria-hidden="true" />}
            </Link>
            <button
              type="button"
              className="btn small menu-btn"
              aria-expanded={menuOpen}
              aria-controls="menu-plus"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <List aria-hidden="true" /> Plus
            </button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen ? (
          <>
            <motion.div
              className="scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.nav
              id="menu-plus"
              className="menu-sheet glass float"
              aria-label="Plus"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.97, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.97, filter: "blur(8px)" }}
              transition={reduce ? { duration: 0.12 } : { type: "spring", bounce: 0, duration: 0.32 }}
            >
              <div className="row between">
                <span className="eyebrow plain">Plus</span>
                <button type="button" className="btn icon ghost" aria-label="Fermer le menu" onClick={() => setMenuOpen(false)}>
                  <X aria-hidden="true" />
                </button>
              </div>
              <ul className="menu-list">
                {[account, ...MORE].map(({ href, label, detail, icon: Icon }) => (
                  <li key={href}>
                    <Link href={href} className="menu-item" aria-current={isActive(pathname, href) ? "page" : undefined} onClick={() => setMenuOpen(false)}>
                      <Icon size={24} weight="duotone" aria-hidden="true" />
                      <span>
                        <strong>{label}</strong>
                        <span className="faint">{detail}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.nav>
          </>
        ) : null}
      </AnimatePresence>

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
