import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Cpu,
  FileCode2,
  FileSpreadsheet,
  FileText,
  Layers,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

interface DocSource {
  id: string;
  name: string;
  type: "XLSX" | "PDF" | "CAD" | "CSV";
  size: string;
  status: string;
  attributesFed: string[];
  icon: typeof FileSpreadsheet;
  accent: string;
}

interface TruthAttribute {
  id: string;
  label: string;
  value: string;
  confidence: string;
  sourcesCount: number;
  sourcesFedBy: string[];
  status: "VERIFIED" | "CANONICAL" | "MONITORED";
}

const SOURCES: DocSource[] = [
  {
    id: "src-1",
    name: "supplier_catalogue.xlsx",
    type: "XLSX",
    size: "4.2 MB",
    status: "140 ATTRS EXTRACTED",
    attributesFed: ["attr-1", "attr-2", "attr-4", "attr-5"],
    icon: FileSpreadsheet,
    accent: "#37c7ea",
  },
  {
    id: "src-2",
    name: "datasheet_rev_c.pdf",
    type: "PDF",
    size: "1.8 MB",
    status: "OCR VALIDATED",
    attributesFed: ["attr-1", "attr-2", "attr-3", "attr-6"],
    icon: FileText,
    accent: "#d9a13b",
  },
  {
    id: "src-3",
    name: "cad_spec_10492.dwg",
    type: "CAD",
    size: "8.4 MB",
    status: "GEOMETRY MAPPED",
    attributesFed: ["attr-3", "attr-4"],
    icon: FileCode2,
    accent: "#8b5cf6",
  },
  {
    id: "src-4",
    name: "vendor_pricebook.csv",
    type: "CSV",
    size: "640 KB",
    status: "240 ROWS INDEXED",
    attributesFed: ["attr-2", "attr-4", "attr-5", "attr-6"],
    icon: Layers,
    accent: "#38bdf8",
  },
];

const ATTRIBUTES: TruthAttribute[] = [
  {
    id: "attr-1",
    label: "MANUFACTURER",
    value: "APEX FLUIDICS",
    confidence: "99.8%",
    sourcesCount: 4,
    sourcesFedBy: ["src-1", "src-2"],
    status: "VERIFIED",
  },
  {
    id: "attr-2",
    label: "BRAND",
    value: "FLOWMASTER",
    confidence: "99.4%",
    sourcesCount: 4,
    sourcesFedBy: ["src-1", "src-2", "src-4"],
    status: "VERIFIED",
  },
  {
    id: "attr-3",
    label: "MPN",
    value: "VND-992-B",
    confidence: "100.0%",
    sourcesCount: 4,
    sourcesFedBy: ["src-2", "src-3"],
    status: "CANONICAL",
  },
  {
    id: "attr-4",
    label: "INTERNAL CODES",
    value: "SKU-4401-AX",
    confidence: "98.7%",
    sourcesCount: 3,
    sourcesFedBy: ["src-1", "src-3", "src-4"],
    status: "VERIFIED",
  },
  {
    id: "attr-5",
    label: "GTIN / UPC",
    value: "008492019482",
    confidence: "99.1%",
    sourcesCount: 3,
    sourcesFedBy: ["src-1", "src-4"],
    status: "VERIFIED",
  },
  {
    id: "attr-6",
    label: "DISCONTINUED / OBSOLETE",
    value: "ACTIVE (REV 03)",
    confidence: "100.0%",
    sourcesCount: 4,
    sourcesFedBy: ["src-2", "src-4"],
    status: "MONITORED",
  },
];

const LOG_MESSAGES = [
  "PARSING datasheet_rev_c.pdf → 48 ATTRIBUTES EXTRACTED",
  "CROSS-CHECKING MPN VND-992-B ACROSS 4 FEEDS → 100% AGREEMENT",
  "DISPUTE RESOLVED: MATERIAL = C36000 BRASS (WEIGHT 0.94)",
  "CANONICAL TRUTH MATRIX LOCKED · REV 03 PERSISTED",
  "RADAR MONITORING 84,000 LIVE ATTRIBUTES FOR DRIFT",
];

export function PipelineIllustration({ className = "" }: { className?: string }) {
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [activeAttrId, setActiveAttrId] = useState<string | null>(null);
  const [isArbitrating, setIsArbitrating] = useState(false);
  const [logIndex, setLogIndex] = useState(0);
  const [cyclePulse, setCyclePulse] = useState(0);

  // Cycling status ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setLogIndex((prev) => (prev + 1) % LOG_MESSAGES.length);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  const triggerArbitrationPulse = () => {
    setIsArbitrating(true);
    setCyclePulse((c) => c + 1);
    setTimeout(() => setIsArbitrating(false), 1400);
  };

  // Determine active highlights
  const isSourceActive = (docId: string) => {
    if (activeDocId === docId) return true;
    if (activeAttrId) {
      const targetAttr = ATTRIBUTES.find((a) => a.id === activeAttrId);
      return targetAttr?.sourcesFedBy.includes(docId) ?? false;
    }
    return false;
  };

  const isAttrActive = (attrId: string) => {
    if (activeAttrId === attrId) return true;
    if (activeDocId) {
      const targetDoc = SOURCES.find((d) => d.id === activeDocId);
      return targetDoc?.attributesFed.includes(attrId) ?? false;
    }
    return false;
  };

  return (
    <div className={`relative overflow-hidden rounded-xl border border-[var(--uf-border)] bg-[var(--uf-bg-deep)]/95 shadow-2xl backdrop-blur-xl ${className}`}>
      {/* Dynamic Background Laser Mesh & Glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(55,199,234,0.14), rgba(217,161,59,0.06), transparent 75%)",
        }}
      />

      {/* Engineering Blueprint Grid Background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-15"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* ----------------- TOP TECHNICAL HUD TELEMETRY BAR ----------------- */}
      <header className="relative z-10 border-b border-[var(--uf-border)] bg-[var(--uf-surface)]/80 px-4 py-2.5 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          {/* Section 1: Ingestion Stage */}
          <div className="flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-[var(--uf-warning)] opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-[var(--uf-warning)]" />
            </span>
            <span className="uf-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--uf-text-secondary)]">
              01 // INGESTION
            </span>
          </div>

          {/* Section 2: Arbiter Core */}
          <div className="flex items-center gap-2 rounded-full border border-[var(--uf-border-strong)] bg-[var(--uf-bg-deep)] px-3 py-0.5">
            <Cpu className="size-3 text-[var(--uf-accent)]" />
            <span className="uf-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--uf-accent)]">
              UNIFORGE ARBITER CORE
            </span>
            <span className="text-[var(--uf-border-strong)]">·</span>
            <span className="uf-mono text-[9px] uppercase text-[var(--uf-text-tertiary)]">
              LATENCY: 12ms
            </span>
          </div>

          {/* Section 3: Canonical Output */}
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-[var(--uf-success)] shadow-[0_0_8px_var(--uf-success)]" />
            <span className="uf-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--uf-success)]">
              02 // CANONICAL TRUTH
            </span>
          </div>
        </div>
      </header>

      {/* ----------------- MAIN FORENSICS WORKBENCH GRID ----------------- */}
      <div className="relative z-10 grid grid-cols-1 gap-6 p-4 md:grid-cols-[1.1fr_0.8fr_1.1fr] md:p-6 lg:gap-8">
        {/* LEFT COLUMN: RAW INGESTION FEED */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-[var(--uf-border-faint)] pb-2">
            <div className="flex items-center gap-2">
              <Layers className="size-3.5 text-[var(--uf-warning)]" />
              <span className="uf-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[var(--uf-text-secondary)]">
                UNSTRUCTURED INPUTS
              </span>
            </div>
            <span className="uf-mono text-[9.5px] uppercase text-[var(--uf-text-tertiary)]">
              4 ACTIVE FEEDS
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {SOURCES.map((doc) => {
              const Icon = doc.icon;
              const active = isSourceActive(doc.id);

              return (
                <motion.div
                  key={doc.id}
                  onMouseEnter={() => setActiveDocId(doc.id)}
                  onMouseLeave={() => setActiveDocId(null)}
                  whileHover={{ scale: 1.015 }}
                  className={`group relative flex cursor-pointer items-center justify-between overflow-hidden rounded border p-3 transition-all duration-200 ${
                    active
                      ? "border-[var(--uf-accent)] bg-[var(--uf-surface-raised)] shadow-[0_0_16px_rgba(55,199,234,0.25)]"
                      : "border-[var(--uf-border)] bg-[var(--uf-surface)]/70 hover:border-[var(--uf-border-strong)] hover:bg-[var(--uf-surface)]"
                  }`}
                >
                  {/* Active Laser Indicator Bar */}
                  {active && (
                    <motion.div
                      layoutId="activeDocLaser"
                      className="absolute inset-y-0 left-0 w-[3px] bg-[var(--uf-accent)] shadow-[0_0_10px_var(--uf-accent)]"
                    />
                  )}

                  <div className="flex items-center gap-3">
                    <div
                      className="flex size-8 shrink-0 items-center justify-center rounded border border-[var(--uf-border-strong)] bg-[var(--uf-bg-deep)]"
                      style={{ color: doc.accent }}
                    >
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-[12.5px] font-semibold text-[var(--uf-text-primary)] group-hover:text-white">
                          {doc.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 uf-mono text-[9px] uppercase tracking-wider text-[var(--uf-text-tertiary)]">
                        <span className="font-semibold text-[var(--uf-accent)]">
                          {doc.type}
                        </span>
                        <span>·</span>
                        <span>{doc.size}</span>
                        <span>·</span>
                        <span className="text-[var(--uf-success)]">{doc.status}</span>
                      </div>
                    </div>
                  </div>

                  <ArrowRight
                    className={`size-3.5 shrink-0 transition-transform ${
                      active
                        ? "translate-x-0 text-[var(--uf-accent)] opacity-100"
                        : "-translate-x-2 opacity-0"
                    }`}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* CENTER COLUMN: THE UNIFORGE ARBITER CORE */}
        <div className="relative flex flex-col items-center justify-center py-4 md:py-0">
          {/* Radial Pulse Wave Emitter */}
          <div className="relative flex size-44 items-center justify-center">
            {/* Outer Laser Calibration Track */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border border-dashed border-[var(--uf-accent)]/30"
            />

            {/* Middle Rotating HUD Reticle */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-3 rounded-full border border-dashed border-[rgba(217,161,59,0.35)]"
            />

            {/* High-Tech Laser Scan Beam */}
            <motion.div
              animate={{
                scaleY: [0.2, 1, 0.2],
                opacity: [0.4, 0.9, 0.4],
              }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute h-40 w-[2px] bg-gradient-to-b from-transparent via-[var(--uf-accent)] to-transparent shadow-[0_0_12px_var(--uf-accent)]"
            />

            {/* Industrial Machined Brass Coupler Hexagon */}
            <div className="relative flex size-28 items-center justify-center shadow-2xl">
              {/* Outer Metallic Brass Hexagon */}
              <div
                className="absolute inset-0 rounded-lg border border-[#8d6e3f] shadow-[0_0_24px_rgba(217,161,59,0.25)]"
                style={{
                  background:
                    "linear-gradient(135deg, #4e3b20 0%, #ecd39f 45%, #a7844d 75%, #3d2d17 100%)",
                  clipPath:
                    "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
                }}
              />

              {/* Inner Concentric Core Aperture */}
              <div className="relative z-10 flex size-14 items-center justify-center rounded-full border border-[#ecd39f]/50 bg-[#0b0d0f] shadow-inner">
                {/* Glowing Blue Quantum Reactor Core */}
                <motion.div
                  animate={{
                    scale: [0.85, 1.2, 0.85],
                    boxShadow: [
                      "0 0 10px rgba(55,199,234,0.5)",
                      "0 0 24px rgba(55,199,234,0.9)",
                      "0 0 10px rgba(55,199,234,0.5)",
                    ],
                  }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                  className="size-6 rounded-full bg-[var(--uf-accent)]"
                />
              </div>
            </div>

            {/* Realtime Particle Stream Indicators */}
            {Array.from({ length: 4 }).map((_, i) => (
              <motion.div
                key={`p-${i}-${cyclePulse}`}
                className="absolute size-1.5 rounded-full bg-[var(--uf-accent)] shadow-[0_0_6px_var(--uf-accent)]"
                initial={{
                  x: -60,
                  y: -30 + i * 20,
                  opacity: 0,
                  scale: 0.5,
                }}
                animate={{
                  x: [ -60, 0, 60 ],
                  y: [ -30 + i * 20, 0, -30 + i * 20 ],
                  opacity: [ 0, 1, 0 ],
                  scale: [ 0.5, 1.4, 0.5 ],
                }}
                transition={{
                  duration: 2.2,
                  delay: i * 0.45,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          {/* Interactive Trigger Button */}
          <button
            type="button"
            onClick={triggerArbitrationPulse}
            disabled={isArbitrating}
            className="group mt-3 inline-flex items-center gap-1.5 rounded border border-[var(--uf-accent)]/40 bg-[var(--uf-surface)] px-3 py-1.5 uf-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--uf-accent)] transition-all hover:border-[var(--uf-accent)] hover:bg-[var(--uf-accent)] hover:text-black hover:shadow-[0_0_16px_rgba(55,199,234,0.3)] active:scale-95"
          >
            {isArbitrating ? (
              <>
                <RefreshCw className="size-3 animate-spin" />
                <span>ARBITRATING…</span>
              </>
            ) : (
              <>
                <Sparkles className="size-3 text-[var(--uf-accent)] group-hover:text-black" />
                <span>RUN ARBITER</span>
              </>
            )}
          </button>
        </div>

        {/* RIGHT COLUMN: CANONICAL TRUTH MATRIX */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-[var(--uf-border-faint)] pb-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-3.5 text-[var(--uf-success)]" />
              <span className="uf-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[var(--uf-text-secondary)]">
                VERIFIED CANONICAL TRUTH
              </span>
            </div>
            <span className="uf-mono text-[9.5px] uppercase text-[var(--uf-success)]">
              100% AUDITABLE
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {ATTRIBUTES.map((attr) => {
              const active = isAttrActive(attr.id);

              return (
                <motion.div
                  key={attr.id}
                  onMouseEnter={() => setActiveAttrId(attr.id)}
                  onMouseLeave={() => setActiveAttrId(null)}
                  whileHover={{ scale: 1.015 }}
                  className={`group relative flex cursor-pointer items-center justify-between rounded border px-3 py-2 transition-all duration-200 ${
                    active
                      ? "border-[var(--uf-success)] bg-[var(--uf-surface-raised)] shadow-[0_0_16px_rgba(69,193,129,0.25)]"
                      : "border-[var(--uf-border)] bg-[var(--uf-surface)]/70 hover:border-[var(--uf-border-strong)] hover:bg-[var(--uf-surface)]"
                  }`}
                >
                  {/* Verified Indicator Line */}
                  {active && (
                    <motion.div
                      layoutId="activeAttrLaser"
                      className="absolute inset-y-0 right-0 w-[3px] bg-[var(--uf-success)] shadow-[0_0_10px_var(--uf-success)]"
                    />
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="uf-mono text-[8.5px] uppercase tracking-[0.1em] text-[var(--uf-text-tertiary)]">
                        {attr.label}
                      </span>
                      <span className="rounded bg-[var(--uf-success-dim)] px-1 py-0.2 uf-mono text-[8px] font-bold text-[var(--uf-success)]">
                        {attr.status}
                      </span>
                    </div>
                    <span className="block truncate uf-mono text-[12px] font-bold text-[var(--uf-text-primary)] group-hover:text-white">
                      {attr.value}
                    </span>
                  </div>

                  <div className="flex flex-col items-end pl-3">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="size-3 text-[var(--uf-success)]" />
                      <span className="uf-mono text-[11px] font-bold text-[var(--uf-success)]">
                        {attr.confidence}
                      </span>
                    </div>
                    <span className="uf-mono text-[8.5px] text-[var(--uf-text-tertiary)]">
                      {attr.sourcesCount}/4 SOURCES
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ----------------- BOTTOM LIVE SYSTEM ACTIVITY STREAM ----------------- */}
      <footer className="relative z-10 border-t border-[var(--uf-border)] bg-[var(--uf-surface)]/90 px-4 py-2 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3 uf-mono text-[10px]">
          <div className="flex items-center gap-2.5">
            <Activity className="size-3.5 text-[var(--uf-accent)]" />
            <span className="uppercase text-[var(--uf-text-tertiary)]">FORENSIC LOG:</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={logIndex}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25 }}
                className="font-medium text-[var(--uf-text-secondary)]"
              >
                {LOG_MESSAGES[logIndex]}
              </motion.span>
            </AnimatePresence>
          </div>

          <div className="hidden items-center gap-4 text-[var(--uf-text-tertiary)] sm:flex">
            <span className="flex items-center gap-1">
              <Zap className="size-3 text-[var(--uf-warning)]" />
              <span>4,820 TOKENS/S</span>
            </span>
            <span>·</span>
            <span className="text-[var(--uf-success)]">ZERO CONFLICTS OPEN</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
