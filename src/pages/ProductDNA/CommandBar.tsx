import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Download,
  FileSpreadsheet,
  Scale,
  Sparkles,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useConflicts } from "@/hooks/use-forge-store";
import type { ProductDna } from "@/types/domain";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface CommandBarProps {
  dna: ProductDna;
}

export function CommandBar({ dna }: CommandBarProps) {
  const navigate = useNavigate();
  const conflicts = useConflicts();
  const [exported, setExported] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t));
    },
    [],
  );

  const openConflicts = conflicts.filter(
    (c) => c.productId === dna.productId && c.status === "OPEN",
  );

  const exportDnaJson = () => {
    const payload = {
      schema: "uniforge.product-dna.v1",
      exportedAt: new Date().toISOString(),
      productId: dna.productId,
      mpn: dna.mpn,
      name: dna.name,
      category: dna.category,
      verified: `${dna.verifiedCount}/${dna.totalCount}`,
      confidence: dna.confidence,
      revision: dna.revision,
      attributes: dna.attributes.map((a) => ({
        attribute: a.attribute.key,
        label: a.attribute.label,
        value: a.attribute.value,
        unit: a.attribute.unit,
        confidence: a.attribute.confidence,
        verification: a.attribute.verification,
        sources: a.sources.map((s) => ({
          document: s.document,
          supplier: s.supplier,
          value: s.value,
          pageRef: s.pageRef,
          agreement: s.agreement,
        })),
      })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dna_${dna.mpn.replace(/[^A-Za-z0-9-]/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`DNA Canonical JSON exported — ${dna.mpn}`);
  };

  const exportDnaCsv = () => {
    const headers = ["Attribute Key", "Label", "Canonical Value", "Unit", "Confidence", "Status", "Proof Count"];
    const rows = dna.attributes.map((a) => [
      a.attribute.key,
      `"${a.attribute.label}"`,
      `"${a.attribute.value}"`,
      `"${a.attribute.unit || ""}"`,
      `${Math.round(a.attribute.confidence * 100)}%`,
      a.attribute.verification,
      a.sources.length,
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `spec_sheet_${dna.mpn.replace(/[^A-Za-z0-9-]/g, "_")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Specification CSV sheet exported — ${dna.mpn}`);
  };

  const handleExport = () => {
    if (leaving) return;
    exportDnaJson();
    setExported(true);
    timers.current.push(window.setTimeout(() => setExported(false), 2400));
  };

  const handleReview = () => {
    if (!openConflicts[0] || leaving) return;
    setLeaving(true);
    timers.current.push(
      window.setTimeout(() => navigate(`/resolve?conflict=${openConflicts[0].id}`), 360),
    );
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
      className="sticky bottom-3 z-30 mx-auto mt-6 w-full max-w-7xl rounded-2xl border border-[var(--uf-border)] bg-[var(--uf-bg)]/95 p-3.5 shadow-2xl backdrop-blur-xl sm:p-4"
      aria-label="Record Command Console"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        {/* Left Status Flag */}
        <div className="flex items-center gap-3">
          {openConflicts.length > 0 ? (
            <div className="flex items-center gap-2.5">
              <span className="flex size-7 items-center justify-center rounded-lg bg-[rgba(217,161,59,0.15)] text-[var(--uf-warning)]">
                <AlertTriangle className="size-4 animate-pulse" />
              </span>
              <div className="flex flex-col">
                <span className="uf-mono text-[11px] font-black uppercase tracking-wider text-[var(--uf-warning)]">
                  {openConflicts.length} Discrepancy Pending
                </span>
                <span className="text-[10px] text-[var(--uf-text-secondary)]">
                  Arbitration required before ERP publishing
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <span className="flex size-7 items-center justify-center rounded-lg bg-[rgba(69,193,129,0.15)] text-[var(--uf-success)]">
                <Check className="size-4 stroke-[3]" />
              </span>
              <div className="flex flex-col">
                <span className="uf-mono text-[11px] font-black uppercase tracking-wider text-[var(--uf-success)]">
                  Canonical Ground Truth Ready
                </span>
                <span className="text-[10px] text-[var(--uf-text-secondary)]">
                  100% verified across authoritative datasheets
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Export CSV button */}
          <button
            type="button"
            onClick={exportDnaCsv}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--uf-border)] bg-[var(--uf-surface)] px-3 py-2 uf-mono text-[10.5px] uppercase text-[var(--uf-text-secondary)] transition-all hover:border-[var(--uf-accent)] hover:text-[var(--uf-text-primary)]"
          >
            <FileSpreadsheet className="size-3.5 text-[var(--uf-accent)]" />
            <span>Export CSV</span>
          </button>

          {/* Export JSON button */}
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--uf-border)] bg-[var(--uf-surface)] px-3 py-2 uf-mono text-[10.5px] uppercase text-[var(--uf-text-secondary)] transition-all hover:border-[var(--uf-accent)] hover:text-[var(--uf-text-primary)]"
          >
            {exported ? (
              <>
                <Check className="size-3.5 text-[var(--uf-success)]" />
                <span className="text-[var(--uf-success)]">Downloaded</span>
              </>
            ) : (
              <>
                <Download className="size-3.5 text-[var(--uf-accent)]" />
                <span>Export JSON DNA</span>
              </>
            )}
          </button>

          {/* Primary Action Button */}
          {openConflicts.length > 0 ? (
            <button
              type="button"
              onClick={handleReview}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--uf-warning)] px-4 py-2 uf-mono text-[11px] font-black uppercase tracking-wider text-black shadow-[0_0_16px_rgba(217,161,59,0.3)] transition-all hover:brightness-110 hover:scale-105"
            >
              <Scale className="size-4" />
              <span>Arbitrate Dispute</span>
              <ArrowRight className="size-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate(`/ship?product=${dna.productId}`)}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--uf-accent)] px-4 py-2 uf-mono text-[11px] font-black uppercase tracking-wider text-black shadow-[0_0_16px_rgba(55,199,234,0.3)] transition-all hover:bg-[var(--uf-accent-bright)] hover:scale-105"
            >
              <Sparkles className="size-4" />
              <span>Syndicate to ERP</span>
              <ArrowRight className="size-3.5" />
            </button>
          )}
        </div>
      </div>
    </motion.section>
  );
}
