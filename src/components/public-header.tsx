import Link from "next/link";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { appConfig } from "@/config/app";

export function PublicHeader() {
  return (
    <header className="public-header">
      <div className="container public-header-inner">
        <Logo />
        <nav className="public-nav" aria-label="Navigation principale">
          {appConfig.nav.public.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
          <ThemeToggle />
          <Link className="btn btn-primary" href="/onboarding">
            Commencer
          </Link>
        </nav>
      </div>
    </header>
  );
}
