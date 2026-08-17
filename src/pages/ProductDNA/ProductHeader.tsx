import { animate, motion, useMotionValue } from "framer-motion";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Copy,
  Cpu,
  FileCheck,
  HelpCircle,
  QrCode,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Tag,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Product, ProductDna, Supplier } from "@/types/domain";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface ProductHeaderProps {
  product: Product;
  dna: ProductDna;
  supplier?: Supplier;
  openConflictsCount: number;
}

export function ProductHeader({
  product,
  dna,
  supplier,
  openConflictsCount,
}: ProductHeaderProps) {
  const [showGuide, setShowGuide] = useState(false);
  const [copied, setCopied] = useState(false);

  const isRequiresReview = openConflictsCount > 0;
  const isFullyVerified = !isRequiresReview && dna.verifiedCount === dna.totalCount;

  // Total source proofs across all attributes
  const totalEvidenceChecks = useMemo(() => {
    return dna.attributes.reduce((acc, a) => acc + (a.sources?.length || 1), 0);
  }, [dna.attributes]);

  const copyMpn = () => {
    navigator.clipboard.writeText(dna.mpn);
    setCopied(true);
    toast.success(`Copied MPN: ${dna.mpn}`);
    setTimeout(() => setCopied(false), 2000);
  };

  const lastVerifiedTime = new Date(dna.lastVerifiedAt).toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const confidencePct = Math.round((dna.confidence || 0.95) * 100);

  return (
    <header
      key={`header-${dna.productId}`}
      aria-label="Product DNA Operations Command Header"
      className="relative rounded-2xl border border-[var(--uf-border)] bg-gradient-to-b from-[var(--uf-surface-raised)] via-[var(--uf-bg)] to-[var(--uf-bg)] p-5 shadow-2xl transition-all duration-300 sm:p-6"
    >
      {/* Decorative ambient neon back-glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 -top-20 size-72 rounded-full opacity-20 blur-3xl"
        style={{
          background: isRequiresReview
            ? "radial-gradient(circle, var(--uf-warning) 0%, transparent 70%)"
            : "radial-gradient(circle, var(--uf-accent) 0%, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full opacity-15 blur-3xl"
        style={{
          background: "radial-gradient(circle, var(--uf-success) 0%, transparent 70%)",
        }}
      />

      {/* 1. Top HUD Breadcrumb & Guide Action */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--uf-border-faint)] pb-3.5">
        <div className="flex items-center gap-2 uf-mono text-[10px] uppercase tracking-[0.14em] text-[var(--uf-text-tertiary)]">
          <span className="flex items-center gap-1 font-semibold text-[var(--uf-accent)]">
            <Cpu className="size-3.5" />
            <span>UNIFORGE ENGINE</span>
          </span>
          <span className="text-[var(--uf-border-strong)]">/</span>
          <span className="text-[var(--uf-text-secondary)]">PRODUCT DNA FORENSICS</span>
          <span className="text-[var(--uf-border-strong)]">/</span>
          <span className="font-bold text-[var(--uf-text-primary)]">CANONICAL TRUTH MATRIX</span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--uf-border)] bg-[var(--uf-surface)] px-3 py-1 uf-mono text-[9.5px] uppercase tracking-wider text-[var(--uf-text-secondary)] transition-all hover:border-[var(--uf-accent)] hover:bg-[rgba(55,199,234,0.08)] hover:text-[var(--uf-text-primary)]"
          >
            <HelpCircle className="size-3 text-[var(--uf-accent)]" />
            <span>{showGuide ? "Hide Guide" : "What is Product DNA?"}</span>
          </button>

          <span className="h-3 w-px bg-[var(--uf-border-strong)]" />

          <div className="flex items-center gap-1.5 rounded-md bg-[rgba(255,255,255,0.04)] px-2 py-0.5 uf-mono text-[9.5px] text-[var(--uf-text-tertiary)]">
            <span className="size-1.5 rounded-full bg-[var(--uf-success)] animate-pulse" />
            <span>REV {String(dna.revision).padStart(2, "0")} · {lastVerifiedTime}Z</span>
          </div>
        </div>
      </div>

      {/* Collapsible Explainer Banner */}
      {showGuide && (
        <motion.div
          initial={{ opacity: 0, y: -6, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -6, height: 0 }}
          className="relative z-10 mt-3 overflow-hidden rounded-xl border border-[var(--uf-accent)] bg-[rgba(55,199,234,0.07)] p-4 shadow-lg"
        >
          <div className="flex items-start gap-3">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[var(--uf-accent)] text-black">
              <Sparkles className="size-4" />
            </div>
            <div className="flex-1 text-[12px] leading-relaxed text-[var(--uf-text-secondary)]">
              <strong className="font-bold text-[var(--uf-text-primary)]">
                Understanding Product DNA & Canonical Ingestion:
              </strong>{" "}
              Uniforge ingests supplier catalogs, engineering drawings, and ERP spec sheets.
              Attributes marked <strong className="text-[var(--uf-success)]">VERIFIED (✓)</strong>{" "}
              match across multiple authoritative documents. When documents disagree, a{" "}
              <strong className="text-[var(--uf-warning)]">CONFLICT (⚠️)</strong> is flagged so
              inaccurate specifications can be arbitrated before publication.
            </div>
            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="uf-mono text-[10px] font-bold text-[var(--uf-text-tertiary)] hover:text-[var(--uf-text-primary)]"
            >
              [CLOSE]
            </button>
          </div>
        </motion.div>
      )}

      {/* 2. Main Product Identity & Interactive Radial Gauge */}
      <div className="relative z-10 mt-5 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
        {/* Left Side: Product MPN, Name, and Metadata Pills */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            {/* Holographic MPN Badge */}
            <motion.div
              onClick={copyMpn}
              title="Click to copy Part Number (MPN)"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group flex cursor-pointer items-center gap-2 rounded-xl border border-[rgba(55,199,234,0.3)] bg-[rgba(55,199,234,0.08)] px-3.5 py-1.5 shadow-[0_0_20px_rgba(55,199,234,0.12)] transition-all hover:border-[var(--uf-accent)] hover:bg-[rgba(55,199,234,0.14)]"
            >
              <QrCode className="size-4 text-[var(--uf-accent)]" />
              <h1 className="text-[22px] font-black uppercase tracking-tight text-[var(--uf-text-primary)] [font-family:var(--uf-font-display)] sm:text-[28px] md:text-[32px]">
                {dna.mpn}
              </h1>
              {copied ? (
                <span className="uf-mono text-[10px] font-bold text-[var(--uf-success)]">COPIED!</span>
              ) : (
                <Copy className="size-3.5 text-[var(--uf-accent)] opacity-70 transition-opacity group-hover:opacity-100" />
              )}
            </motion.div>

            {/* Product Name Display */}
            <h2 className="text-[18px] font-extrabold uppercase tracking-tight text-[var(--uf-text-secondary)] [font-family:var(--uf-font-condensed)] sm:text-[22px] md:text-[24px]">
              {dna.name}
            </h2>
          </div>

          {/* Key Engineering Metadata Pills */}
          <motion.div
            className="mt-3.5 flex flex-wrap items-center gap-2 uf-mono text-[10.5px] uppercase tracking-wider"
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1, ease: EASE }}
          >
            {/* Supplier Chip */}
            <div className="flex items-center gap-1.5 rounded-lg border border-[var(--uf-border)] bg-[var(--uf-surface)] px-2.5 py-1 text-[var(--uf-text-tertiary)]">
              <Building2 className="size-3 text-[var(--uf-accent)]" />
              <span>SUPPLIER:</span>
              <strong className="text-[var(--uf-text-primary)]">
                {supplier?.name ?? product.supplierId}
              </strong>
            </div>

            {/* Category Chip */}
            <div className="flex items-center gap-1.5 rounded-lg border border-[var(--uf-border)] bg-[var(--uf-surface)] px-2.5 py-1 text-[var(--uf-text-tertiary)]">
              <Tag className="size-3 text-[var(--uf-accent)]" />
              <span>CATEGORY:</span>
              <strong className="text-[var(--uf-text-secondary)]">{dna.category}</strong>
            </div>

            {/* Part ID Chip */}
            <div className="flex items-center gap-1.5 rounded-lg border border-[var(--uf-border)] bg-[var(--uf-surface)] px-2.5 py-1 text-[var(--uf-text-tertiary)]">
              <Cpu className="size-3 text-[var(--uf-text-secondary)]" />
              <span>ID:</span>
              <strong className="text-[var(--uf-text-secondary)]">{dna.productId}</strong>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Circular Radial Confidence Meter & Prominent Status Capsule */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          {/* Radial Confidence Dial (Circular SVG Meter) */}
          <div className="flex items-center gap-3 rounded-xl border border-[var(--uf-border)] bg-[var(--uf-surface)] px-4 py-2.5 shadow-inner">
            <div className="relative size-12 shrink-0">
              <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                {/* Background Ring */}
                <path
                  className="text-[var(--uf-border-strong)]"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Dynamic Stroke Ring */}
                <path
                  style={{
                    stroke: isRequiresReview ? "var(--uf-warning)" : "var(--uf-success)",
                    transition: "stroke-dasharray 0.8s ease-in-out",
                  }}
                  strokeDasharray={`${confidencePct}, 100`}
                  strokeLinecap="round"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center uf-mono text-[11px] font-black text-[var(--uf-text-primary)]">
                {confidencePct}%
              </div>
            </div>
            <div className="flex flex-col">
              <span className="uf-mono text-[9px] uppercase tracking-wider text-[var(--uf-text-tertiary)]">
                Cross-Match
              </span>
              <span className="text-[11.5px] font-bold text-[var(--uf-text-secondary)]">
                Consensus Score
              </span>
            </div>
          </div>

          {/* Main Status Capsule */}
          <motion.div
            className="shrink-0"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, delay: 0.15, ease: EASE }}
          >
            {isRequiresReview ? (
              <div className="flex items-center gap-3 rounded-xl border border-[var(--uf-warning-line)] bg-gradient-to-r from-[rgba(217,161,59,0.15)] to-[rgba(217,161,59,0.05)] px-4 py-2.5 shadow-[0_0_20px_rgba(217,161,59,0.2)]">
                <div className="flex size-8 items-center justify-center rounded-lg bg-[var(--uf-warning)] text-black">
                  <AlertTriangle className="size-4.5" />
                </div>
                <div className="flex flex-col">
                  <span className="uf-mono text-[11px] font-black uppercase tracking-wider text-[var(--uf-warning)]">
                    {openConflictsCount} Conflict to Resolve
                  </span>
                  <span className="text-[10.5px] text-[var(--uf-text-secondary)]">
                    Cross-document discrepancy flagged
                  </span>
                </div>
              </div>
            ) : isFullyVerified ? (
              <div className="flex items-center gap-3 rounded-xl border border-[var(--uf-success-line)] bg-gradient-to-r from-[rgba(69,193,129,0.15)] to-[rgba(69,193,129,0.05)] px-4 py-2.5 shadow-[0_0_20px_rgba(69,193,129,0.2)]">
                <div className="flex size-8 items-center justify-center rounded-lg bg-[var(--uf-success)] text-black">
                  <ShieldCheck className="size-4.5" />
                </div>
                <div className="flex flex-col">
                  <span className="uf-mono text-[11px] font-black uppercase tracking-wider text-[var(--uf-success)]">
                    100% Verified Canonical
                  </span>
                  <span className="text-[10.5px] text-[var(--uf-text-secondary)]">
                    All specifications proven across sources
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-xl border border-[var(--uf-border)] bg-[var(--uf-surface)] px-4 py-2.5 uf-mono text-[11px] font-bold text-[var(--uf-accent)]">
                <span className="size-2 rounded-full bg-[var(--uf-accent)] animate-ping" />
                <span>Processing Pipeline</span>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* 3. Three Sleek Telemetry Ribbon Metrics */}
      <motion.div
        className="relative z-10 mt-5 grid grid-cols-1 gap-3 border-t border-[var(--uf-border-faint)] pt-4 sm:grid-cols-3 sm:gap-4"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.2, ease: EASE }}
      >
        {/* Metric 1: Verified Specifications */}
        <div className="flex items-center justify-between rounded-xl border border-[var(--uf-border-faint)] bg-[rgba(255,255,255,0.015)] p-3.5 transition-all hover:bg-[rgba(255,255,255,0.03)]">
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-lg bg-[rgba(69,193,129,0.12)] text-[var(--uf-success)]">
              <CheckCircle2 className="size-4" />
            </div>
            <div className="flex flex-col">
              <span className="uf-mono text-[9.5px] uppercase tracking-[0.14em] text-[var(--uf-text-tertiary)]">
                Verified Attributes
              </span>
              <span className="text-[11px] font-medium text-[var(--uf-text-secondary)]">
                Proven Specifications
              </span>
            </div>
          </div>
          <div className="flex items-baseline gap-1 uf-mono text-[20px] font-bold text-[var(--uf-text-primary)]">
            <AnimatedNumber to={dna.verifiedCount} />
            <span className="text-[13px] text-[var(--uf-text-tertiary)]">/{dna.totalCount}</span>
          </div>
        </div>

        {/* Metric 2: Overall Confidence */}
        <div className="flex items-center justify-between rounded-xl border border-[var(--uf-border-faint)] bg-[rgba(255,255,255,0.015)] p-3.5 transition-all hover:bg-[rgba(255,255,255,0.03)]">
          <div className="flex items-center gap-2.5">
            <div
              className="flex size-7 items-center justify-center rounded-lg"
              style={{
                background: isRequiresReview
                  ? "rgba(217,161,59,0.12)"
                  : "rgba(69,193,129,0.12)",
                color: isRequiresReview
                  ? "var(--uf-warning)"
                  : "var(--uf-success)",
              }}
            >
              {isRequiresReview ? (
                <ShieldAlert className="size-4" />
              ) : (
                <ShieldCheck className="size-4" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="uf-mono text-[9.5px] uppercase tracking-[0.14em] text-[var(--uf-text-tertiary)]">
                Match Confidence
              </span>
              <span className="text-[11px] font-medium text-[var(--uf-text-secondary)]">
                Cross-Document Health
              </span>
            </div>
          </div>
          <div
            className="uf-mono text-[20px] font-bold"
            style={{
              color: isRequiresReview ? "var(--uf-warning)" : "var(--uf-success)",
            }}
          >
            <AnimatedConfidence to={dna.confidence} />
          </div>
        </div>

        {/* Metric 3: Authoritative Proofs */}
        <div className="flex items-center justify-between rounded-xl border border-[var(--uf-border-faint)] bg-[rgba(255,255,255,0.015)] p-3.5 transition-all hover:bg-[rgba(255,255,255,0.03)]">
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-lg bg-[rgba(55,199,234,0.12)] text-[var(--uf-accent)]">
              <FileCheck className="size-4" />
            </div>
            <div className="flex flex-col">
              <span className="uf-mono text-[9.5px] uppercase tracking-[0.14em] text-[var(--uf-text-tertiary)]">
                Authoritative Proofs
              </span>
              <span className="text-[11px] font-medium text-[var(--uf-text-secondary)]">
                Datasheet & CAD Citations
              </span>
            </div>
          </div>
          <div className="flex items-baseline gap-1 uf-mono text-[20px] font-bold text-[var(--uf-accent)]">
            <AnimatedNumber to={totalEvidenceChecks} />
            <span className="text-[11px] text-[var(--uf-text-tertiary)]">PROOFS</span>
          </div>
        </div>
      </motion.div>
    </header>
  );
}

function AnimatedNumber({ to }: { to: number }) {
  const mv = useMotionValue(0);
  const [val, setVal] = useState("0");
  useEffect(() => {
    const controls = animate(mv, to, {
      duration: 0.75,
      delay: 0.1,
      ease: EASE,
      onUpdate: (v) => setVal(String(Math.round(v))),
    });
    return () => controls.stop();
  }, [mv, to]);
  return <span>{val}</span>;
}

function AnimatedConfidence({ to }: { to: number }) {
  const mv = useMotionValue(0);
  const [val, setVal] = useState("0.0%");
  useEffect(() => {
    const pct = Math.round(to * 1000) / 10;
    const controls = animate(mv, pct, {
      duration: 0.85,
      delay: 0.15,
      ease: EASE,
      onUpdate: (v) => setVal(`${v.toFixed(1)}%`),
    });
    return () => controls.stop();
  }, [mv, to]);
  return <span>{val}</span>;
}
