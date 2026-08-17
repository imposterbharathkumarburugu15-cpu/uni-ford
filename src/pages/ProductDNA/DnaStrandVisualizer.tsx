import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Dna,
  FileCheck,
  Gauge,
  Layers,
  Ruler,
  Sparkles,
  Weight,
  Zap,
} from "lucide-react";
import { useState } from "react";
import type { Conflict, ProductDna } from "@/types/domain";

interface DnaStrandVisualizerProps {
  dna: ProductDna;
  conflicts: Conflict[];
  highlightedKey?: string | null;
  onSelectAttribute: (attributeKey: string) => void;
}

// Visual category helpers
function getSpecVisuals(key: string) {
  const k = key.toUpperCase();
  if (k.includes("MATERIAL")) {
    return {
      icon: Layers,
      color: "#37C7EA",
      glow: "rgba(55,199,234,0.35)",
      bg: "rgba(55,199,234,0.08)",
      strandBand: "bg-cyan-500",
    };
  }
  if (k.includes("SIZE") || k.includes("DIM") || k.includes("LENGTH")) {
    return {
      icon: Ruler,
      color: "#9D7AEA",
      glow: "rgba(157,122,234,0.35)",
      bg: "rgba(157,122,234,0.08)",
      strandBand: "bg-purple-500",
    };
  }
  if (k.includes("PRESSURE") || k.includes("PSI")) {
    return {
      icon: Gauge,
      color: "#EA580C",
      glow: "rgba(234,88,12,0.35)",
      bg: "rgba(234,88,12,0.08)",
      strandBand: "bg-amber-500",
    };
  }
  if (k.includes("WEIGHT") || k.includes("MASS")) {
    return {
      icon: Weight,
      color: "#10B981",
      glow: "rgba(16,185,129,0.35)",
      bg: "rgba(16,185,129,0.08)",
      strandBand: "bg-emerald-500",
    };
  }
  if (k.includes("VOLT") || k.includes("AMP") || k.includes("POWER")) {
    return {
      icon: Zap,
      color: "#F59E0B",
      glow: "rgba(245,158,11,0.35)",
      bg: "rgba(245,158,11,0.08)",
      strandBand: "bg-yellow-500",
    };
  }
  return {
    icon: Activity,
    color: "#38BDF8",
    glow: "rgba(56,189,248,0.35)",
    bg: "rgba(56,189,248,0.08)",
    strandBand: "bg-sky-500",
  };
}

export function DnaStrandVisualizer({
  dna,
  conflicts,
  highlightedKey,
  onSelectAttribute,
}: DnaStrandVisualizerProps) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const openConflictList = conflicts.filter(
    (c) => c.productId === dna.productId && c.status === "OPEN",
  );

  return (
    <section
      aria-label="Interactive Product DNA Genome Map"
      className="relative overflow-hidden rounded-2xl border border-[var(--uf-border)] bg-gradient-to-b from-[var(--uf-surface)] via-[var(--uf-surface-raised)] to-[var(--uf-bg)] p-5 shadow-2xl transition-all sm:p-6"
    >
      {/* Background Genome Waves */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-15"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(55, 199, 234, 0.15) 0%, transparent 60%)`,
        }}
      />

      {/* Header with Title & Live Integrity Dial */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--uf-border-faint)] pb-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-[rgba(55,199,234,0.12)] text-[var(--uf-accent)] shadow-[0_0_15px_rgba(55,199,234,0.25)]">
            <Dna className="size-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[16px] font-black uppercase tracking-tight text-[var(--uf-text-primary)] [font-family:var(--uf-font-display)] sm:text-[18px]">
                Product Specification Genome
              </h3>
              <span className="rounded-full bg-[rgba(55,199,234,0.15)] px-2 py-0.5 uf-mono text-[9px] font-bold text-[var(--uf-accent)]">
                LIVE INTERACTIVE
              </span>
            </div>
            <p className="text-[11.5px] text-[var(--uf-text-secondary)]">
              Interactive visual fingerprint of verified specifications, document lineages, and arbitration nodes.
            </p>
          </div>
        </div>

        {/* Genome Integrity Score Capsule */}
        <div className="flex items-center gap-3 rounded-xl border border-[var(--uf-border)] bg-[var(--uf-surface)] px-3.5 py-1.5 shadow-inner">
          <div className="flex flex-col text-right">
            <span className="uf-mono text-[9px] uppercase tracking-wider text-[var(--uf-text-tertiary)]">
              Genome Alignment
            </span>
            <span className="uf-mono text-[13px] font-black text-[var(--uf-text-primary)]">
              {dna.verifiedCount} of {dna.totalCount} Canonical
            </span>
          </div>
          <div className="flex size-7 items-center justify-center rounded-lg bg-[rgba(69,193,129,0.15)] text-[var(--uf-success)] font-bold uf-mono text-[11px]">
            {Math.round((dna.verifiedCount / (dna.totalCount || 1)) * 100)}%
          </div>
        </div>
      </div>

      {/* Central Interactive DNA Strand Helix Ribbon */}
      <div className="relative z-10 my-6">
        {/* Visual Double-Helix Connecting Rail */}
        <div className="relative mx-auto flex w-full items-center justify-between py-2">
          {/* Animated Connecting Synapse Beam */}
          <div
            aria-hidden
            className="absolute inset-x-8 top-1/2 h-[3px] -translate-y-1/2 rounded-full"
            style={{
              background:
                "linear-gradient(90deg, rgba(55,199,234,0.2) 0%, rgba(157,122,234,0.4) 50%, rgba(55,199,234,0.2) 100%)",
            }}
          />

          {/* Genome Nodes */}
          <div className="relative z-10 flex w-full items-center justify-between gap-2 overflow-x-auto pb-2 pt-2 scrollbar-none sm:gap-4">
            {dna.attributes.map((attrItem, idx) => {
              const { attribute, sources } = attrItem;
              const visuals = getSpecVisuals(attribute.key);
              const Icon = visuals.icon;
              const hasConflict = openConflictList.some(
                (c) => c.attributeKey === attribute.key,
              );
              const isSelected =
                highlightedKey === attribute.key || hoveredKey === attribute.key;

              return (
                <motion.div
                  key={attribute.key}
                  onClick={() => onSelectAttribute(attribute.key)}
                  onMouseEnter={() => setHoveredKey(attribute.key)}
                  onMouseLeave={() => setHoveredKey(null)}
                  whileHover={{ scale: 1.06, y: -4 }}
                  whileTap={{ scale: 0.96 }}
                  className={`group relative flex cursor-pointer flex-col items-center transition-all ${
                    isSelected ? "z-20" : "z-10"
                  }`}
                >
                  {/* Floating Top Tag */}
                  <span
                    className={`mb-2 truncate rounded-md px-2 py-0.5 uf-mono text-[9.5px] font-bold uppercase tracking-wider transition-all ${
                      hasConflict
                        ? "bg-[rgba(217,161,59,0.15)] text-[var(--uf-warning)] border border-[var(--uf-warning-line)] animate-pulse"
                        : isSelected
                          ? "bg-[var(--uf-accent)] text-black shadow-[0_0_12px_rgba(55,199,234,0.4)]"
                          : "bg-[rgba(255,255,255,0.05)] text-[var(--uf-text-secondary)]"
                    }`}
                  >
                    {attribute.label}
                  </span>

                  {/* DNA Node Orb */}
                  <div
                    className={`relative flex size-14 items-center justify-center rounded-2xl border-2 transition-all duration-300 ${
                      hasConflict
                        ? "border-[var(--uf-warning)] bg-[rgba(217,161,59,0.2)] shadow-[0_0_20px_rgba(217,161,59,0.4)]"
                        : isSelected
                          ? "border-[var(--uf-accent)] bg-[rgba(55,199,234,0.25)] shadow-[0_0_24px_rgba(55,199,234,0.5)] scale-110"
                          : "border-[var(--uf-border)] bg-[var(--uf-surface)] shadow-md hover:border-[var(--uf-accent)] hover:bg-[var(--uf-surface-raised)]"
                    }`}
                  >
                    {/* Inner Icon */}
                    <Icon
                      className="size-6 transition-transform group-hover:scale-110"
                      style={{
                        color: hasConflict
                          ? "var(--uf-warning)"
                          : isSelected
                            ? "var(--uf-accent)"
                            : visuals.color,
                      }}
                    />

                    {/* Status Badge Pip */}
                    <div className="absolute -bottom-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full border border-[var(--uf-bg)] bg-[var(--uf-bg)] shadow">
                      {hasConflict ? (
                        <AlertTriangle className="size-3.5 text-[var(--uf-warning)] fill-[var(--uf-warning)]" />
                      ) : (
                        <CheckCircle2 className="size-3.5 text-[var(--uf-success)] fill-[var(--uf-success)]/20" />
                      )}
                    </div>

                    {/* Index Sequence Number */}
                    <div className="absolute -left-1.5 -top-1.5 flex size-4.5 items-center justify-center rounded-full bg-[var(--uf-surface-raised)] uf-mono text-[8px] font-black text-[var(--uf-text-tertiary)] border border-[var(--uf-border)]">
                      {idx + 1}
                    </div>
                  </div>

                  {/* Value Pill Below Node */}
                  <div className="mt-2.5 flex flex-col items-center text-center">
                    <span className="max-w-[100px] truncate uf-mono text-[12px] font-extrabold text-[var(--uf-text-primary)]">
                      {attribute.value}
                      {attribute.unit ? ` ${attribute.unit}` : ""}
                    </span>
                    <span className="flex items-center gap-1 uf-mono text-[9px] text-[var(--uf-text-tertiary)]">
                      <FileCheck className="size-2.5 text-[var(--uf-accent)]" />
                      {sources.length} proofs
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Interactive Detail Spotlight Pill Banner */}
      <AnimatePresence mode="wait">
        {hoveredKey ? (
          (() => {
            const activeAttr = dna.attributes.find((a) => a.attribute.key === hoveredKey);
            if (!activeAttr) return null;
            const conflict = openConflictList.find((c) => c.attributeKey === hoveredKey);
            return (
              <motion.div
                key={hoveredKey}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="relative z-10 mt-2 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--uf-accent)] bg-[rgba(55,199,234,0.06)] p-3.5 text-[12px] shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="size-4 text-[var(--uf-accent)] shrink-0" />
                  <div>
                    <span className="font-bold text-[var(--uf-text-primary)]">
                      {activeAttr.attribute.label}:
                    </span>{" "}
                    <span className="uf-mono font-black text-[var(--uf-accent)]">
                      "{activeAttr.attribute.value} {activeAttr.attribute.unit || ""}"
                    </span>{" "}
                    <span className="text-[var(--uf-text-secondary)]">
                      · {activeAttr.sources.length} independent document sources verified
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {conflict ? (
                    <span className="rounded-md bg-[var(--uf-warning-dim)] px-2 py-0.5 uf-mono text-[10px] font-bold text-[var(--uf-warning)]">
                      ⚠️ Discrepancy Active
                    </span>
                  ) : (
                    <span className="rounded-md bg-[var(--uf-success-dim)] px-2 py-0.5 uf-mono text-[10px] font-bold text-[var(--uf-success)]">
                      ✓ Canonical Consensus Aligned
                    </span>
                  )}
                  <span className="uf-mono text-[10px] text-[var(--uf-text-tertiary)]">
                    Click node to inspect forensic lineage
                  </span>
                </div>
              </motion.div>
            );
          })()
        ) : null}
      </AnimatePresence>
    </section>
  );
}
