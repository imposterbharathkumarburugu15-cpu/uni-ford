import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, BrainCircuit, Radar, Scale } from "lucide-react";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";

interface Engine {
  index: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  description: string;
  accent: string;
  detail: string[];
  metric: [string, string];
}

const ENGINES: Engine[] = [
  {
    index: "01",
    icon: BrainCircuit,
    title: "Supplier Taxonomy Learning",
    subtitle: "Adaptive Normalization Engine",
    description:
      "Learns each supplier's unique vocabulary, abbreviations, and table patterns. Data models get smarter with every ingested batch.",
    accent: "var(--uf-accent)",
    detail: [
      "Per-supplier lexical embeddings built from ingested catalogues & spec sheets",
      "Automatic unit conversion, dimension parsing, and material standard mapping",
      "Confidence thresholds grow with each processed supplier feed",
    ],
    metric: ["SUPPLIER DIALECTS", "1,240 MODELS"],
  },
  {
    index: "02",
    icon: Scale,
    title: "Product Truth Arbiter",
    subtitle: "Cross-Source Evidence Forensics",
    description:
      "Evaluates multi-source evidence, enforces strict authority hierarchies, and decides canonical verified attributes with full lineage.",
    accent: "var(--uf-accent-bright)",
    detail: [
      "Deterministic authority weighing (Manufacturer Datasheet > Reseller CSV)",
      "Automated conflict arbitration with human escalation triggers",
      "Every canonical value carries full cryptographic proof trail back to page & line",
    ],
    metric: ["VERIFICATION ACCURACY", "96.8% TRUE"],
  },
  {
    index: "03",
    icon: Radar,
    title: "Continuous Change Radar",
    subtitle: "Specification Drift Monitor",
    description:
      "Detects manufacturer revisions, obsolete MPNs, and specification drift, alerting downstream teams before stale data reaches production.",
    accent: "var(--uf-success)",
    detail: [
      "Autonomous crawlers monitor revision logs, EOL bulletins, and CAD changes",
      "Instant blast-radius analysis across all active master catalogs",
      "One-click differential updates with revision rollback protection",
    ],
    metric: ["MONITORED ATTRIBUTES", "84,000+ LIVE"],
  },
];

export function Engines() {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <section
      id="engines"
      className="relative border-b border-[var(--uf-border)] bg-[var(--uf-bg-deep)] py-20 md:py-28"
    >
      <div className="mx-auto w-full max-w-[1240px] px-5">
        {/* Section Header */}
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2.5 uf-mono text-[10.5px] uppercase tracking-[0.18em] text-[var(--uf-accent)]">
              <span className="size-1.5 rounded-full bg-[var(--uf-accent)]" />
              <span>02 // ARCHITECTURE</span>
            </div>
            <h2
              className="mt-2 text-3xl font-black uppercase tracking-tight text-[var(--uf-text-primary)] sm:text-4xl md:text-5xl"
              style={{ fontFamily: "var(--uf-font-display)" }}
            >
              Core Forensics Engines
            </h2>
          </div>
          <p className="max-w-[420px] text-[14px] leading-relaxed text-[var(--uf-text-secondary)]">
            Three interconnected autonomous systems working together to forge
            unstructured supplier data into canonical enterprise intelligence.
          </p>
        </div>

        {/* Engine Cards Grid */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {ENGINES.map((engine, i) => {
            const Icon = engine.icon;
            const isOpen = expanded === i;
            return (
              <motion.article
                key={engine.index}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                className="group relative flex flex-col justify-between overflow-hidden rounded-md border border-[var(--uf-border)] bg-[var(--uf-surface)]/70 backdrop-blur-sm transition-all duration-300 hover:border-[var(--uf-border-strong)] hover:shadow-xl"
              >
                {/* Top Subtle Accent Stripe */}
                <div
                  className="h-[2px] w-full transition-all group-hover:opacity-100"
                  style={{ background: engine.accent, opacity: 0.6 }}
                />

                <div className="flex flex-1 flex-col p-6">
                  {/* Icon & Index Badge */}
                  <div className="flex items-center justify-between">
                    <span
                      className="flex size-11 items-center justify-center rounded border border-[var(--uf-border-strong)] bg-[var(--uf-bg-deep)]"
                      style={{ color: engine.accent }}
                    >
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <span
                      className="uf-mono text-[13px] font-bold"
                      style={{ color: engine.accent }}
                    >
                      {engine.index}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <div className="mt-5">
                    <span className="uf-mono text-[10px] uppercase tracking-[0.14em] text-[var(--uf-text-tertiary)]">
                      {engine.subtitle}
                    </span>
                    <h3
                      className="mt-1 text-[20px] font-bold uppercase tracking-tight text-[var(--uf-text-primary)]"
                      style={{ fontFamily: "var(--uf-font-display)" }}
                    >
                      {engine.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="mt-3 text-[13.5px] leading-relaxed text-[var(--uf-text-secondary)]">
                    {engine.description}
                  </p>

                  {/* Telemetry Metric Pill */}
                  <div className="mt-6 flex items-baseline justify-between border-t border-[var(--uf-border-faint)] pt-4">
                    <span className="uf-mono text-[9.5px] uppercase tracking-[0.14em] text-[var(--uf-text-tertiary)]">
                      {engine.metric[0]}
                    </span>
                    <span
                      className="uf-mono text-[14px] font-bold"
                      style={{ color: engine.accent }}
                    >
                      {engine.metric[1]}
                    </span>
                  </div>
                </div>

                {/* Expand / Details Toggle Button */}
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : i)}
                  className="flex items-center justify-between border-t border-[var(--uf-border-faint)] bg-[var(--uf-bg-deep)]/40 px-6 py-3 text-left transition-colors hover:bg-[var(--uf-surface-raised)]"
                  aria-expanded={isOpen}
                >
                  <span
                    className="inline-flex items-center gap-1.5 uf-mono text-[11px] font-semibold uppercase tracking-[0.12em]"
                    style={{ color: engine.accent }}
                  >
                    {isOpen ? "COLLAPSE AUDIT SPECS" : "EXPAND AUDIT SPECS"}
                    <ArrowRight
                      className={`size-3.5 transition-transform duration-200 ${
                        isOpen ? "rotate-90" : ""
                      }`}
                      aria-hidden
                    />
                  </span>
                </button>

                {/* Collapsible Details Panel */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.ul
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden border-t border-[var(--uf-border-faint)] bg-[var(--uf-bg-deep)]"
                    >
                      <div className="space-y-2.5 px-6 py-4">
                        {engine.detail.map((d) => (
                          <li
                            key={d}
                            className="flex items-start gap-2.5 text-[12.5px] leading-relaxed text-[var(--uf-text-secondary)]"
                          >
                            <span
                              className="mt-1.5 size-1.5 shrink-0 rounded-full"
                              style={{ background: engine.accent }}
                              aria-hidden
                            />
                            <span>{d}</span>
                          </li>
                        ))}
                      </div>
                    </motion.ul>
                  )}
                </AnimatePresence>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

