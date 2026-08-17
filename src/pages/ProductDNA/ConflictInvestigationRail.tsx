import { motion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Focus,
  Scale,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { forgeStore } from "@/store/forgeStore";
import type { Conflict, ProductDna } from "@/types/domain";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface ConflictInvestigationRailProps {
  dna: ProductDna;
  conflicts: Conflict[];
  onFocusAttribute: (attributeKey: string) => void;
}

export function ConflictInvestigationRail({
  dna,
  conflicts,
  onFocusAttribute,
}: ConflictInvestigationRailProps) {
  const openConflicts = conflicts.filter(
    (c) => c.productId === dna.productId && c.status === "OPEN",
  );

  const handleQuickResolve = (conflict: Conflict, value: string) => {
    forgeStore.resolveConflict(conflict.id, {
      selectedValue: value,
      reason: `Resolved from investigation rail: verified canonical value is ${value}`,
      mode: "RECOMMENDATION",
    });
    toast.success(`Resolved ${conflict.attributeLabel} to "${value}"`);
  };

  const isAllCanonical = openConflicts.length === 0;

  return (
    <aside
      aria-label="Conflict Investigation Assistant"
      className="flex flex-col gap-4 rounded-2xl border border-[var(--uf-border)] bg-gradient-to-b from-[var(--uf-surface)] to-[var(--uf-bg)] p-5 shadow-xl lg:w-[320px] lg:shrink-0 xl:w-[360px]"
    >
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-[var(--uf-border-faint)] pb-3.5">
        <div className="flex items-center gap-2">
          <div
            className={`flex size-6 items-center justify-center rounded-md ${
              isAllCanonical
                ? "bg-[rgba(69,193,129,0.15)] text-[var(--uf-success)]"
                : "bg-[rgba(217,161,59,0.15)] text-[var(--uf-warning)]"
            }`}
          >
            {isAllCanonical ? (
              <ShieldCheck className="size-3.5" />
            ) : (
              <Scale className="size-3.5" />
            )}
          </div>
          <span className="text-[13px] font-bold uppercase tracking-wider text-[var(--uf-text-primary)] [font-family:var(--uf-font-condensed)]">
            Arbitration Console
          </span>
        </div>

        <span
          className={`rounded-full px-2.5 py-0.5 uf-mono text-[9.5px] font-bold uppercase tracking-wider ${
            isAllCanonical
              ? "bg-[var(--uf-success-dim)] text-[var(--uf-success)] border border-[var(--uf-success-line)]"
              : "bg-[var(--uf-warning-dim)] text-[var(--uf-warning)] border border-[var(--uf-warning-line)] animate-pulse"
          }`}
        >
          {isAllCanonical ? "100% Canonical" : `${openConflicts.length} Action Needed`}
        </span>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col gap-4">
        {openConflicts.length > 0 ? (
          <div className="flex flex-col gap-3.5">
            <p className="text-[12px] leading-relaxed text-[var(--uf-text-secondary)]">
              This part cannot be exported to ERP/PLM until the following discrepancy is resolved:
            </p>

            {openConflicts.map((c) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="flex flex-col gap-3.5 rounded-xl border border-[var(--uf-warning)] bg-gradient-to-b from-[rgba(217,161,59,0.08)] to-[rgba(217,161,59,0.02)] p-4 shadow-md"
              >
                {/* Conflict Identity */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 uf-mono text-[11px] font-bold text-[var(--uf-warning)]">
                    <AlertTriangle className="size-3.5 shrink-0" />
                    <span>{c.attributeLabel} Discrepancy</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onFocusAttribute(c.attributeKey)}
                    className="inline-flex items-center gap-1 rounded bg-[rgba(55,199,234,0.1)] px-2 py-0.5 uf-mono text-[9px] uppercase tracking-wider text-[var(--uf-accent)] hover:bg-[rgba(55,199,234,0.2)]"
                  >
                    <Focus className="size-2.5" />
                    <span>Locate</span>
                  </button>
                </div>

                {/* Conflicting Source Values */}
                <div className="flex flex-col gap-1.5 rounded-lg border border-[var(--uf-border)] bg-[var(--uf-surface)] p-3 text-[11.5px]">
                  <span className="uf-mono text-[9px] uppercase tracking-wider text-[var(--uf-text-tertiary)]">
                    Document Extractions:
                  </span>
                  <div className="mt-1 flex flex-col gap-1.5">
                    {c.sources.map((s, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="truncate text-[var(--uf-text-secondary)]">
                          {s.document}
                        </span>
                        <strong className="uf-mono font-bold text-[var(--uf-text-primary)]">
                          "{s.value}"
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Recommendation */}
                <div className="flex flex-col gap-1.5 rounded-lg border border-[rgba(55,199,234,0.3)] bg-[rgba(55,199,234,0.06)] p-3 text-[11.5px]">
                  <div className="flex items-center gap-1.5 text-[var(--uf-accent)]">
                    <Sparkles className="size-3.5" />
                    <span className="font-bold">Consensus Choice:</span>
                    <strong className="text-[var(--uf-text-primary)]">
                      "{c.recommendation || c.sources[0]?.value}"
                    </strong>
                  </div>
                  <p className="mt-0.5 text-[10.5px] leading-relaxed text-[var(--uf-text-secondary)]">
                    {c.rationale}
                  </p>
                </div>

                {/* Quick 1-Click Resolve Action Button */}
                <button
                  type="button"
                  onClick={() =>
                    handleQuickResolve(c, c.recommendation || c.sources[0]?.value)
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--uf-accent)] py-2 uf-mono text-[11px] font-black uppercase tracking-wider text-black shadow-[0_0_14px_rgba(55,199,234,0.3)] transition-all hover:bg-[var(--uf-accent-bright)]"
                >
                  <Check className="size-3.5" />
                  <span>Accept "{c.recommendation || c.sources[0]?.value}"</span>
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          /* When All Specifications are Canonical */
          <div className="flex flex-col gap-3.5 rounded-xl border border-[var(--uf-success-line)] bg-gradient-to-b from-[rgba(69,193,129,0.08)] to-[rgba(69,193,129,0.02)] p-4 text-center">
            <div className="mx-auto flex size-10 items-center justify-center rounded-xl bg-[var(--uf-success)] text-black shadow-[0_0_16px_rgba(69,193,129,0.4)]">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <h4 className="text-[13px] font-bold uppercase tracking-wider text-[var(--uf-success)] [font-family:var(--uf-font-condensed)]">
                All Specifications Aligned
              </h4>
              <p className="mt-1 text-[11.5px] leading-relaxed text-[var(--uf-text-secondary)]">
                Every attribute has matching cross-document proof. Part is 100% verified and ready
                for downstream ERP syndication.
              </p>
            </div>
          </div>
        )}

        {/* Export Readiness Card */}
        <div className="flex flex-col gap-2.5 rounded-xl border border-[var(--uf-border)] bg-[var(--uf-surface)] p-3.5 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="uf-mono text-[9.5px] uppercase tracking-wider text-[var(--uf-text-tertiary)]">
              ERP Export Readiness
            </span>
            <span
              className={`uf-mono text-[10px] font-bold ${
                isAllCanonical ? "text-[var(--uf-success)]" : "text-[var(--uf-warning)]"
              }`}
            >
              {isAllCanonical ? "Ready to Publish" : "Blocked by Discrepancy"}
            </span>
          </div>

          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: isAllCanonical ? "100%" : "75%",
                background: isAllCanonical ? "var(--uf-success)" : "var(--uf-warning)",
              }}
            />
          </div>

          <div className="mt-1 flex items-center justify-between text-[10px] text-[var(--uf-text-tertiary)]">
            <span>SAP / Oracle / PLM</span>
            <span>{dna.verifiedCount}/{dna.totalCount} Specs Checked</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
