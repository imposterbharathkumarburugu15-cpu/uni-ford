import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useEffect, useRef } from "react";
import { Link } from "react-router";
import { STAGES } from "@/utils/pipeline";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface PipelineProps {
  activeIdx: number;
  review: boolean;
}

export function VerificationPipeline({ activeIdx, review }: PipelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeNodeRef = useRef<HTMLAnchorElement>(null);

  const n = STAGES.length;
  const passedFrac = activeIdx / (n - 1);

  // Auto-scroll active stage into view on mobile
  useEffect(() => {
    if (activeNodeRef.current && scrollRef.current) {
      activeNodeRef.current.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [activeIdx]);

  return (
    <nav
      aria-label="Live Verification Process Pipeline"
      className="relative mt-4 rounded-xl border border-[var(--uf-border)] bg-[var(--uf-surface)] p-3 shadow-md"
    >
      <div
        ref={scrollRef}
        className="relative flex w-full items-center overflow-x-auto scrollbar-none"
      >
        <div className="relative mx-auto flex min-w-[640px] flex-1 items-center justify-between px-6 sm:min-w-[700px]">
          {/* Continuous Baseline Wire */}
          <div
            aria-hidden
            className="absolute left-8 right-8 top-[18px] h-[2px] bg-[var(--uf-border)]"
          />

          {/* Illuminated Progress Wire */}
          {passedFrac > 0 && (
            <motion.div
              aria-hidden
              className="absolute left-8 top-[18px] h-[2px]"
              style={{
                width: `calc((100% - 64px) * ${passedFrac})`,
                background: review
                  ? "linear-gradient(90deg, var(--uf-success) 0%, var(--uf-warning) 100%)"
                  : "linear-gradient(90deg, var(--uf-success) 0%, var(--uf-accent) 100%)",
                transformOrigin: "left",
                boxShadow: review
                  ? "0 0 10px rgba(217,161,59,0.5)"
                  : "0 0 10px rgba(55,199,234,0.5)",
              }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.08, ease: EASE }}
            />
          )}

          {/* Traveling Laser Pulse along Pipeline */}
          <motion.div
            aria-hidden
            className="absolute top-[16px] z-10 size-1.5 rounded-full bg-[var(--uf-accent)]"
            style={{
              boxShadow: "0 0 10px rgba(55,199,234,0.9)",
            }}
            initial={{ left: "32px", opacity: 0 }}
            animate={{
              left: ["32px", `calc(32px + (100% - 64px) * ${passedFrac})`],
              opacity: [0, 1, 0.4],
            }}
            transition={{
              duration: 2.2,
              times: [0, 0.7, 1],
              repeat: Infinity,
              repeatDelay: 1,
              ease: "easeInOut",
            }}
          />

          {/* Stage Nodes */}
          {STAGES.map((s, i) => {
            const passed = i < activeIdx;
            const active = i === activeIdx;
            const isReview = (s.stage === "RESOLVE" || active) && review;

            const stageNumber = String(i + 1).padStart(2, "0");

            return (
              <Link
                key={s.stage}
                ref={active ? activeNodeRef : undefined}
                to={s.path}
                className="group relative z-10 flex flex-col items-center gap-1.5 focus:outline-none"
              >
                {/* Node Reticle / Marker */}
                <div
                  className={`relative flex size-[34px] items-center justify-center rounded-full border transition-all ${
                    active
                      ? isReview
                        ? "border-[var(--uf-warning)] bg-[rgba(217,161,59,0.15)] shadow-[0_0_14px_rgba(217,161,59,0.5)]"
                        : "border-[var(--uf-accent)] bg-[rgba(55,199,234,0.15)] shadow-[0_0_14px_rgba(55,199,234,0.5)]"
                      : passed
                        ? "border-[var(--uf-success)] bg-[rgba(69,193,129,0.15)] text-[var(--uf-success)]"
                        : "border-[var(--uf-border)] bg-[var(--uf-surface-raised)] text-[var(--uf-text-tertiary)]"
                  }`}
                >
                  {passed ? (
                    <Check className="size-3.5 stroke-[3] text-[var(--uf-success)]" />
                  ) : active ? (
                    <span
                      className={`size-2.5 rounded-full ${
                        isReview ? "bg-[var(--uf-warning)]" : "bg-[var(--uf-accent)]"
                      }`}
                    />
                  ) : (
                    <span className="uf-mono text-[10px] font-bold text-[var(--uf-text-tertiary)]">
                      {stageNumber}
                    </span>
                  )}
                </div>

                {/* Stage Label */}
                <div className="flex flex-col items-center">
                  <span
                    className="text-[11px] font-extrabold uppercase tracking-tight [font-family:var(--uf-font-condensed)]"
                    style={{
                      color: active
                        ? isReview
                          ? "var(--uf-warning)"
                          : "var(--uf-accent)"
                        : passed
                          ? "var(--uf-text-primary)"
                          : "var(--uf-text-tertiary)",
                    }}
                  >
                    {s.label}
                  </span>
                  <span className="uf-mono text-[8.5px] uppercase tracking-wider text-[var(--uf-text-tertiary)]">
                    {active ? "CURRENT STEP" : passed ? "COMPLETED" : "PENDING"}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
