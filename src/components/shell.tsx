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
  const app = links.length > 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      {app ? (
        <div className="lg:grid lg:grid-cols-[15.5rem_minmax(0,1fr)]">
          <aside className="border-b border-border bg-card shadow-[var(--surface-shadow)] lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-b-0 lg:border-r">
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <Link href={home} className="flex min-w-0 items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <BrandMark className="h-10 w-auto rounded-sm" />
                <span className="min-w-0">
                  <span className="kicker block">Brunel</span>
                  <span className="block truncate text-sm font-semibold">{eyebrow}</span>
                </span>
              </Link>
              <div className="ml-auto flex items-center gap-1 lg:hidden">
                <ThemeToggle />
                {user ? (
                  <Button type="button" size="sm" variant="ghost" onClick={() => signOut({ callbackUrl: "/" })}>
                    Sign out
                  </Button>
                ) : null}
              </div>
            </div>
            <nav className="flex gap-1 overflow-x-auto px-3 py-3 lg:flex-1 lg:flex-col lg:overflow-visible lg:px-3 lg:pb-4" aria-label="Portal">
              {links.map((link) => {
                const active = link.href === "/participant" || link.href === "/judge" ? pathname === link.href : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={`shrink-0 rounded-md border px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:w-full ${active ? "border-border bg-secondary text-foreground" : "border-transparent text-muted-foreground hover:border-border hover:bg-secondary/70 hover:text-foreground"}`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
            <div className="hidden border-t border-border bg-secondary/40 px-4 py-4 lg:block">
              {user ? (
                <>
                  <p className="truncate text-sm font-semibold">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </>
              ) : null}
              <button type="button" className="mt-3 text-sm font-semibold text-muted-foreground hover:text-foreground" onClick={() => signOut({ callbackUrl: "/" })}>
                Sign out
              </button>
            </div>
          </aside>
          <div className="min-w-0">
            <div className="hidden h-12 items-center justify-end gap-2 border-b border-border bg-card px-4 sm:px-8 lg:flex">
              <ThemeToggle />
            </div>
            <main id="main" tabIndex={-1} className="mx-auto w-full max-w-5xl px-4 py-6 focus:outline-none sm:px-8 sm:py-8">
              {children}
            </main>
          </div>
        </div>
      ) : (
        <>
          <header className="sticky top-0 z-30 border-b border-border bg-card/95 shadow-[var(--surface-shadow)] backdrop-blur">
            <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
              <Link href={home} className="flex min-w-0 items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <BrandMark className="h-10 w-auto rounded-sm" />
                <span className="min-w-0">
                  <span className="kicker block">Brunel University London</span>
                  <span className="block truncate text-sm font-semibold">{eyebrow}</span>
                </span>
              </Link>
              <div className="ml-auto flex items-center gap-2">
                <ThemeToggle />
                {user ? (
                  <Button type="button" size="sm" variant="secondary" onClick={() => signOut({ callbackUrl: "/" })}>
                    Sign out
                  </Button>
                ) : (
                  <>
                    <Button asChild size="sm" variant="ghost">
                      <Link href="/login">Sign in</Link>
                    </Button>
                    <Button asChild size="sm">
                      <Link href="/register">Create account</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </header>
          <main id="main" tabIndex={-1} className="mx-auto max-w-6xl px-4 py-8 focus:outline-none sm:px-6 sm:py-10">
            {children}
          </main>
          <footer className="border-t border-border bg-card/80 px-4 py-5 text-sm text-muted-foreground sm:px-6">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2">
              <p>Brunel University Hackathon Management Portal</p>
              {user ? <p>{user.name}</p> : <p>Eastern Gateway, Brunel University London</p>}
            </div>
          </footer>
        </>
      )}
    </div>
  );
}
