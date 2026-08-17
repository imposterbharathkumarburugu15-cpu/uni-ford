import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuoteProps {
  onRequestDemo: () => void;
}

export function Quote({ onRequestDemo }: QuoteProps) {
  return (
    <section className="relative overflow-hidden border-b border-[var(--uf-border)] bg-[var(--uf-bg)] py-24 md:py-32">
      {/* Subtle radial ambient highlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(55,199,234,0.15), transparent 70%)",
        }}
      />

      <div className="relative mx-auto flex w-full max-w-[1000px] flex-col items-center px-5 text-center">
        {/* Eyebrow Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--uf-border-strong)] bg-[var(--uf-surface)] px-3 py-1 uf-mono text-[10.5px] uppercase tracking-[0.18em] text-[var(--uf-text-secondary)]">
          <ShieldCheck className="size-3.5 text-[var(--uf-accent)]" />
          <span>03 // THE ENGINEERING STANDARD</span>
        </div>

        {/* Editorial Principle Headline */}
        <h2
          className="mt-8 text-3xl font-black uppercase leading-[1.05] tracking-tight text-[var(--uf-text-primary)] sm:text-4xl md:text-5xl lg:text-[54px]"
          style={{ fontFamily: "var(--uf-font-display)" }}
        >
          Industrial catalogs should
          <br />
          not just contain information.
        </h2>

        {/* Secondary Punchline */}
        <p
          className="mt-3 text-3xl font-black uppercase leading-[1.05] tracking-tight text-[var(--uf-accent)] sm:text-4xl md:text-5xl lg:text-[54px]"
          style={{ fontFamily: "var(--uf-font-display)" }}
        >
          They should understand it.
        </p>

        <p className="mt-6 max-w-[560px] text-[15px] leading-relaxed text-[var(--uf-text-secondary)]">
          Eliminate manual attribute auditing, eradicate supplier catalog drift,
          and unlock deterministic commerce intelligence.
        </p>

        {/* CTA */}
        <Button
          type="button"
          onClick={onRequestDemo}
          className="mt-10 h-12 rounded-sm border border-[var(--uf-accent)] bg-[var(--uf-accent)] px-8 uf-mono text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--uf-primary-foreground)] shadow-[0_0_28px_rgba(55,199,234,0.25)] transition-all hover:bg-[var(--uf-accent-bright)] hover:shadow-[0_0_36px_rgba(55,199,234,0.4)]"
        >
          REQUEST A DEMO
          <ArrowRight className="size-4" aria-hidden />
        </Button>
      </div>
    </section>
  );
}

