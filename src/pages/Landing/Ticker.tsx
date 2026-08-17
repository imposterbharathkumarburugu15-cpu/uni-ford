import { ArrowRight } from "lucide-react";

const STEPS = [
  { label: "01 / RAW SUPPLIER INGESTION", status: "ONLINE", verified: true },
  { label: "02 / CROSS-SOURCE ARBITRATION", status: "PROCESSING", verified: true },
  { label: "03 / DISPUTE RESOLUTION", status: "ACTIVE", verified: true },
  { label: "04 / CANONICAL PRODUCT DNA", status: "VERIFIED", verified: true },
] as const;

const BADGES = [
  "DETERMINISTIC RULES",
  "CROSS-SOURCE LINEAGE",
  "99.4% CONFIDENCE",
  "ISO-8000 READY",
] as const;

export function Ticker() {
  return (
    <section
      id="process"
      className="border-b border-[var(--uf-border)] bg-[var(--uf-surface)]/60 backdrop-blur-sm"
    >
      <div className="mx-auto flex w-full max-w-[1240px] flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-3.5">
        {/* Left Interactive Pipeline Trace */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {STEPS.map((step, i) => (
            <div key={step.label} className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span
                  className={`size-1.5 rounded-full ${
                    i === STEPS.length - 1
                      ? "bg-[var(--uf-success)] shadow-[0_0_8px_var(--uf-success)]"
                      : "bg-[var(--uf-accent)]"
                  }`}
                  aria-hidden
                />
                <span
                  className={`uf-mono text-[11px] uppercase tracking-[0.14em] ${
                    i === STEPS.length - 1
                      ? "font-bold text-[var(--uf-success)]"
                      : "text-[var(--uf-text-secondary)]"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <ArrowRight
                  className="size-3 text-[var(--uf-border-strong)]"
                  aria-hidden
                />
              )}
            </div>
          ))}
        </div>

        {/* Right Certification & Guarantee Badges */}
        <div className="hidden items-center gap-2 lg:flex">
          {BADGES.map((b) => (
            <span
              key={b}
              className="inline-flex items-center gap-1.5 rounded border border-[var(--uf-border)] bg-[var(--uf-bg-deep)] px-2.5 py-1 uf-mono text-[9.5px] font-medium uppercase tracking-[0.14em] text-[var(--uf-text-tertiary)]"
            >
              <span className="size-1 rounded-full bg-[var(--uf-accent)]" />
              {b}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

