import { useState } from "react";
import { useNavigate } from "react-router";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";

const LINKS = [
  { label: "PLATFORM", target: "#engines" },
  { label: "ENGINES", target: "#engines" },
  { label: "HOW IT WORKS", target: "#process" },
  { label: "CATALOG INTELLIGENCE", target: "#catalog-intelligence" },
] as const;

interface NavProps {
  onRequestDemo: () => void;
  onOpenProduct: () => void;
}

export function Nav({ onRequestDemo, onOpenProduct }: NavProps) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const scrollTo = (target: string) => {
    setMobileOpen(false);
    document.querySelector(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--uf-border)] bg-[var(--uf-bg-deep)]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1240px] items-center justify-between gap-6 px-5">
        {/* Left: Logo & Live System Status */}
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => scrollTo("#catalog-intelligence")}
            aria-label="UNIFORGE home"
            className="flex items-center gap-2"
          >
            <Logo
              className="text-[18px] font-black uppercase tracking-tight text-[var(--uf-text-primary)]"
              markClassName="text-[var(--uf-accent)]"
            />
          </button>

          <div className="hidden items-center gap-2 rounded border border-[var(--uf-border)] bg-[var(--uf-surface)]/60 px-2.5 py-1 uf-mono text-[9.5px] uppercase tracking-[0.14em] text-[var(--uf-text-tertiary)] lg:flex">
            <span className="size-1.5 rounded-full bg-[var(--uf-success)] shadow-[0_0_6px_var(--uf-success)]" />
            <span>SYS: ALL ENGINES NOMINAL</span>
          </div>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden items-center gap-7 md:flex" aria-label="Landing navigation">
          {LINKS.map((link) => (
            <button
              key={link.label}
              type="button"
              onClick={() => scrollTo(link.target)}
              className="uf-mono text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--uf-text-secondary)] transition-colors hover:text-[var(--uf-accent)]"
            >
              {link.label}
            </button>
          ))}
          <button
            type="button"
            onClick={onOpenProduct}
            className="uf-mono text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--uf-accent)] transition-colors hover:text-[var(--uf-accent-bright)]"
          >
            3D / CAD AI
          </button>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={() => navigate("/auth?returnTo=/command-center")}
            className="hidden uf-mono text-[11.5px] font-semibold uppercase tracking-[0.12em] text-[var(--uf-text-secondary)] transition-colors hover:text-white sm:block"
          >
            LOG IN
          </button>

          <Button
            type="button"
            onClick={onRequestDemo}
            className="h-9 rounded-sm border border-[var(--uf-accent)] bg-[var(--uf-accent)] px-4 uf-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--uf-primary-foreground)] shadow-[0_0_16px_rgba(55,199,234,0.2)] transition-all hover:bg-[var(--uf-accent-bright)] hover:shadow-[0_0_24px_rgba(55,199,234,0.35)]"
          >
            REQUEST A DEMO
          </Button>

          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-sm border border-[var(--uf-border)] text-[var(--uf-text-secondary)] md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <span className="flex flex-col gap-1" aria-hidden>
              <span className="h-px w-4 bg-current" />
              <span className="h-px w-4 bg-current" />
            </span>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-[var(--uf-border)] bg-[var(--uf-bg-deep)] px-5 py-4 md:hidden" aria-label="Mobile navigation">
          {LINKS.map((link) => (
            <button
              key={link.label}
              type="button"
              onClick={() => scrollTo(link.target)}
              className="block w-full py-2 text-left uf-mono text-[12px] uppercase tracking-wider text-[var(--uf-text-secondary)] hover:text-white"
            >
              {link.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              onOpenProduct();
            }}
            className="block w-full py-2 text-left uf-mono text-[12px] uppercase tracking-wider text-[var(--uf-accent)]"
          >
            3D / CAD AI
          </button>
          <button
            type="button"
            onClick={() => navigate("/auth?returnTo=/command-center")}
            className="block w-full py-2 text-left uf-mono text-[12px] uppercase tracking-wider text-[var(--uf-text-secondary)] hover:text-white"
          >
            LOG IN
          </button>
        </nav>
      )}
    </header>
  );
}

