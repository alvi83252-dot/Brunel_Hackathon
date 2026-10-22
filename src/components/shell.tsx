"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export function Shell({
  home,
  eyebrow,
  links,
  user,
  children,
}: {
  home: string;
  eyebrow: string;
  links: Array<{ href: string; label: string }>;
  user?: { name: string; email: string } | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="masthead text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-4 sm:px-6">
          <Link href={home} className="flex min-w-0 items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
            <BrandMark />
            <span className="min-w-0">
              <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-white/70">Brunel University London</span>
              <span className="block truncate text-base font-bold sm:text-lg">{eyebrow}</span>
            </span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle ghost />
            {user ? (
              <Button type="button" variant="ghost" onClick={() => signOut({ callbackUrl: "/" })}>
                Sign out
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost">
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button asChild variant="accent">
                  <Link href="/register">Create account</Link>
                </Button>
              </>
            )}
          </div>
        </div>
        {links.length > 0 && (
          <nav className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 pb-4 sm:px-6" aria-label="Portal">
            {links.map((link) => {
              const active = link.href === "/participant" || link.href === "/judge" ? pathname === link.href : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`shrink-0 rounded-full px-3 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${active ? "bg-white text-[#07294D]" : "text-white/85 hover:bg-white/10"}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        )}
      </header>
      <main id="main" tabIndex={-1} className="mx-auto max-w-6xl px-4 py-8 focus:outline-none sm:px-6">
        {children}
      </main>
      <footer className="border-t border-border px-4 py-6 text-sm text-muted-foreground sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2">
          <p>Brunel University Hackathon Management Portal</p>
          {user ? <p>{user.name}</p> : <p>Eastern Gateway, Brunel University London</p>}
        </div>
      </footer>
    </div>
  );
}
