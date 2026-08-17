import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, Cpu } from "lucide-react";
import { useEffect, useRef } from "react";
import type { Conflict, Product, ProductDna } from "@/types/domain";

interface ProductRecordRailProps {
  products: Product[];
  allDna: ProductDna[];
  selectedId: string;
  onSelect: (productId: string) => void;
  conflicts: Conflict[];
}

export function ProductRecordRail({
  products,
  allDna,
  selectedId,
  onSelect,
  conflicts,
}: ProductRecordRailProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const selectedBtnRef = useRef<HTMLButtonElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const offset = direction === "left" ? -320 : 320;
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (selectedBtnRef.current && scrollRef.current) {
      selectedBtnRef.current.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [selectedId]);

  return (
    <div
      aria-label="Product Record Rail"
      className="relative mt-4 rounded-xl border border-[var(--uf-border)] bg-[var(--uf-surface)] p-2.5 shadow-md"
    >
      <div className="flex items-center gap-3">
        {/* Rail Title Header */}
        <div className="flex shrink-0 items-center gap-2 pl-2 pr-3 border-r border-[var(--uf-border-faint)]">
          <div className="flex size-6 items-center justify-center rounded-md bg-[rgba(55,199,234,0.1)] text-[var(--uf-accent)]">
            <Cpu className="size-3.5" />
          </div>
          <div className="flex flex-col">
            <span className="uf-mono text-[9px] uppercase tracking-[0.16em] text-[var(--uf-text-tertiary)]">
              PARTS MATRIX
            </span>
            <span className="uf-mono text-[11px] font-bold text-[var(--uf-text-primary)]">
              {products.length} Records
            </span>
          </div>
        </div>

        {/* Scroll Left Button */}
        <button
          type="button"
          onClick={() => scroll("left")}
          aria-label="Scroll left"
          className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-[var(--uf-border)] bg-[var(--uf-surface-raised)] text-[var(--uf-text-tertiary)] transition-all hover:border-[var(--uf-accent)] hover:text-[var(--uf-text-primary)]"
        >
          <ChevronLeft className="size-4" />
        </button>

        {/* Scrollable Records Container */}
        <div
          ref={scrollRef}
          className="flex flex-1 items-center gap-2 overflow-x-auto px-1 py-1 scrollbar-none"
        >
          {products.map((p) => {
            const isSelected = p.id === selectedId;
            const dna = allDna.find((d) => d.productId === p.id);
            const hasConflict = conflicts.some(
              (c) => c.productId === p.id && c.status === "OPEN",
            );
            const verifiedCount = dna?.verifiedCount ?? 0;
            const totalCount = dna?.totalCount ?? p.attributes.length;
            const isAllVerified = totalCount > 0 && verifiedCount === totalCount && !hasConflict;

            return (
              <button
                key={p.id}
                ref={isSelected ? selectedBtnRef : undefined}
                type="button"
                onClick={() => onSelect(p.id)}
                className={`group relative flex shrink-0 items-center gap-2.5 rounded-lg border px-3 py-1.5 text-left transition-all ${
                  isSelected
                    ? "border-[var(--uf-accent)] bg-[rgba(55,199,234,0.12)] shadow-[0_0_14px_rgba(55,199,234,0.2)]"
                    : hasConflict
                      ? "border-[var(--uf-border)] bg-[var(--uf-surface-raised)] hover:border-[var(--uf-warning)] hover:bg-[rgba(217,161,59,0.05)]"
                      : "border-[var(--uf-border)] bg-[var(--uf-surface-raised)] hover:border-[var(--uf-border-strong)] hover:bg-[var(--uf-surface-2)]"
                }`}
              >
                {/* Status Indicator Icon */}
                <div className="flex shrink-0 items-center">
                  {hasConflict ? (
                    <span className="flex size-5 items-center justify-center rounded-full bg-[rgba(217,161,59,0.15)] text-[var(--uf-warning)]">
                      <AlertTriangle className="size-3 animate-pulse" />
                    </span>
                  ) : isAllVerified ? (
                    <span className="flex size-5 items-center justify-center rounded-full bg-[rgba(69,193,129,0.15)] text-[var(--uf-success)]">
                      <CheckCircle2 className="size-3" />
                    </span>
                  ) : (
                    <span className="flex size-5 items-center justify-center rounded-full bg-[rgba(55,199,234,0.15)] text-[var(--uf-accent)]">
                      <span className="size-2 rounded-full bg-[var(--uf-accent)]" />
                    </span>
                  )}
                </div>

                {/* MPN & Part Name */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="uf-mono text-[11px] font-extrabold tracking-wide"
                      style={{
                        color: isSelected
                          ? "var(--uf-accent)"
                          : hasConflict
                            ? "var(--uf-warning)"
                            : "var(--uf-text-primary)",
                      }}
                    >
                      {p.mpn}
                    </span>
                    <span className="rounded bg-[rgba(255,255,255,0.06)] px-1 py-0.2 uf-mono text-[8.5px] text-[var(--uf-text-tertiary)]">
                      {verifiedCount}/{totalCount}
                    </span>
                  </div>
                  <span className="max-w-[130px] truncate text-[11px] font-medium text-[var(--uf-text-secondary)] [font-family:var(--uf-font-condensed)] sm:max-w-[170px]">
                    {p.name}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Scroll Right Button */}
        <button
          type="button"
          onClick={() => scroll("right")}
          aria-label="Scroll right"
          className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-[var(--uf-border)] bg-[var(--uf-surface-raised)] text-[var(--uf-text-tertiary)] transition-all hover:border-[var(--uf-accent)] hover:text-[var(--uf-text-primary)]"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
