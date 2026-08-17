import { motion } from "framer-motion";
import {
  ArrowRight,
  Database,
  Play,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { PipelineIllustration } from "@/components/common/PipelineIllustration";
import { Button } from "@/components/ui/button";

interface HeroProps {
  onExplore: () => void;
}

const METRICS = [
  { label: "VERIFICATION RATE", value: "96.8%", icon: ShieldCheck, tone: "text-[var(--uf-success)]" },
  { label: "ARBITRATION SPEED", value: "<420ms", icon: Zap, tone: "text-[var(--uf-accent)]" },
  { label: "LINEAGE AUDIT", value: "100%", icon: Database, tone: "text-[var(--uf-accent-bright)]" },
] as const;

export function Hero({ onExplore }: HeroProps) {
  return (
    <section
      id="catalog-intelligence"
      className="relative overflow-hidden border-b border-[var(--uf-border)] bg-[var(--uf-bg)]"
    >
      {/* Top Ambient Engineering Lighting */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-96 w-full -translate-x-1/2 opacity-30 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(55,199,234,0.25), rgba(217,161,59,0.08), transparent 75%)",
        }}
      />

      <div className="mx-auto grid w-full max-w-[1280px] items-center gap-10 px-5 py-14 md:py-20 lg:grid-cols-[1fr_1.18fr] lg:gap-10">
        {/* Left Column: Ultra-Neat Precision Typography & CTAs */}
        <div className="relative z-10">
          {/* Eyebrow Status Pill */}
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2.5 rounded-full border border-[var(--uf-border-strong)] bg-[var(--uf-surface)] px-3 py-1 uf-mono text-[10.5px] uppercase tracking-[0.18em] text-[var(--uf-text-secondary)] shadow-sm"
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-[var(--uf-accent)] opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-[var(--uf-accent)]" />
            </span>
            <span className="font-semibold text-[var(--uf-accent)]">01 // PLATFORM</span>
            <span className="text-[var(--uf-border-strong)]">·</span>
            <span>CATALOG FORENSICS & ARBITRATION</span>
          </motion.div>

          {/* Main Hero Headline - Ultra Neat, Geometric Archivo Display */}
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-5 text-[38px] font-black uppercase leading-[0.98] tracking-[-0.035em] text-[var(--uf-text-primary)] sm:text-[48px] md:text-[58px] lg:text-[64px]"
            style={{ fontFamily: "var(--uf-font-display)" }}
          >
            <span className="block text-[var(--uf-text-secondary)]/90">
              FROM SUPPLIER
            </span>
            <span className="relative my-1 inline-block text-white">
              CHAOS
              <span
                aria-hidden
                className="absolute -bottom-1 left-0 right-0 h-[3px] bg-gradient-to-r from-[var(--uf-warning)] via-[var(--uf-accent)] to-transparent"
              />
            </span>{" "}
            <span className="block bg-gradient-to-r from-white via-[#eaedf0] to-[var(--uf-accent)] bg-clip-text text-transparent">
              TO TRUSTED PRODUCT INTELLIGENCE
            </span>
          </motion.h1>

          {/* Body Narrative */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 max-w-[540px] text-[15px] leading-relaxed text-[var(--uf-text-secondary)] md:text-[16px]"
          >
            UniForge ingests messy multi-supplier datasheets, cross-verifies
            evidence against manufacturer truth, and turns fragmented catalogs
            into structured, traceable product DNA ready for industrial commerce.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center gap-4"
          >
            <Button
              type="button"
              onClick={onExplore}
              className="group relative h-12 overflow-hidden rounded-sm border border-[var(--uf-accent)] bg-[var(--uf-accent)] px-7 uf-mono text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--uf-primary-foreground)] shadow-[0_0_28px_rgba(55,199,234,0.3)] transition-all hover:bg-[var(--uf-accent-bright)] hover:shadow-[0_0_36px_rgba(55,199,234,0.45)]"
            >
              <span className="relative z-10 flex items-center gap-2">
                EXPLORE PLATFORM
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-1"
                  aria-hidden
                />
              </span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                document
                  .querySelector("#process")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="h-12 rounded-sm border-[var(--uf-border-strong)] bg-[var(--uf-surface)]/80 px-6 uf-mono text-[12px] font-medium uppercase tracking-[0.12em] text-[var(--uf-text-primary)] backdrop-blur-sm transition-all hover:border-[var(--uf-accent-line)] hover:bg-[var(--uf-surface-raised)]"
            >
              <Play className="size-3.5 text-[var(--uf-accent)]" aria-hidden />
              HOW IT WORKS
            </Button>
          </motion.div>

          {/* Precision Metric Pills */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-10 grid max-w-[540px] grid-cols-3 gap-3 border-t border-[var(--uf-border)] pt-5"
          >
            {METRICS.map((m) => {
              const Icon = m.icon;
              return (
                <div
                  key={m.label}
                  className="flex flex-col rounded border border-[var(--uf-border-faint)] bg-[var(--uf-surface)]/40 p-2.5"
                >
                  <div className="flex items-center gap-1.5 uf-mono text-[9px] uppercase tracking-[0.1em] text-[var(--uf-text-tertiary)]">
                    <Icon className="size-3 text-[var(--uf-text-secondary)]" />
                    <span>{m.label}</span>
                  </div>
                  <span className={`mt-1 uf-mono text-[16px] font-bold ${m.tone}`}>
                    {m.value}
                  </span>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* Right Column: Interactive Industrial Engine Graphic */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.65, delay: 0.2 }}
          className="relative w-full"
        >
          <PipelineIllustration className="mx-auto h-auto w-full max-w-[680px]" />
        </motion.div>
      </div>
    </section>
  );
}

