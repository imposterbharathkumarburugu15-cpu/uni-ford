import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Eye,
  FileCheck2,
  FileCode2,
  FileSpreadsheet,
  FileText,
  Gauge,
  Layers,
  Ruler,
  Search,
  Sparkles,
  Weight,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { forgeStore } from "@/store/forgeStore";
import type { Conflict, ProductDnaAttribute } from "@/types/domain";

type DnaSource = ProductDnaAttribute["sources"][number];

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface EvidenceMatrixProps {
  attributes: ProductDnaAttribute[];
  conflicts: Conflict[];
  highlightedKey?: string | null;
  onSelectEvidence: (attributeKey: string) => void;
  onOpenConflict: (conflictId: string) => void;
}

// Separate component declared outside of render to satisfy react-hooks/static-components
function AttributeIcon({
  attributeKey,
  className,
}: {
  attributeKey: string;
  className?: string;
}) {
  const k = attributeKey.toUpperCase();
  if (k.includes("MATERIAL")) return <Layers className={className} />;
  if (k.includes("SIZE") || k.includes("DIM") || k.includes("LENGTH"))
    return <Ruler className={className} />;
  if (k.includes("PRESSURE") || k.includes("PSI")) return <Gauge className={className} />;
  if (k.includes("WEIGHT") || k.includes("MASS")) return <Weight className={className} />;
  if (k.includes("VOLT") || k.includes("AMP") || k.includes("POWER"))
    return <Zap className={className} />;
  return <Activity className={className} />;
}

// Separate component declared outside of render
function DocIcon({ docName, className }: { docName: string; className?: string }) {
  const n = docName.toLowerCase();
  if (n.includes("dwg") || n.includes("cad") || n.includes("drawing"))
    return <FileCode2 className={className} />;
  if (n.includes("xls") || n.includes("csv") || n.includes("sheet") || n.includes("price"))
    return <FileSpreadsheet className={className} />;
  return <FileText className={className} />;
}

export function EvidenceMatrix({
  attributes,
  conflicts,
  highlightedKey,
  onSelectEvidence,
  onOpenConflict,
}: EvidenceMatrixProps) {
  const [filterMode, setFilterMode] = useState<"ALL" | "CONFLICT" | "VERIFIED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedKeys, setExpandedKeys] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    if (highlightedKey) {
      initial[highlightedKey] = true;
    }
    const firstConflict = conflicts.find((c) => c.status === "OPEN");
    if (firstConflict) {
      initial[firstConflict.attributeKey] = true;
    }
    return initial;
  });

  // Track selected source for inline traceability drawer
  const [activeTraceSource, setActiveTraceSource] = useState<{
    source: DnaSource;
    attributeKey: string;
    attributeLabel: string;
  } | null>(null);

  const toggleExpand = (key: string) => {
    setExpandedKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const openConflictList = conflicts.filter((c) => c.status === "OPEN");

  // Filter attributes
  const filteredAttributes = attributes.filter((item) => {
    const hasConflict = openConflictList.some((c) => c.attributeKey === item.attribute.key);
    const isVerified = item.attribute.verification === "VERIFIED" && !hasConflict;

    if (filterMode === "CONFLICT" && !hasConflict) return false;
    if (filterMode === "VERIFIED" && !isVerified) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchLabel = item.attribute.label.toLowerCase().includes(q);
      const matchKey = item.attribute.key.toLowerCase().includes(q);
      const matchVal = String(item.attribute.value).toLowerCase().includes(q);
      return matchLabel || matchKey || matchVal;
    }

    return true;
  });

  return (
    <section
      aria-label="Specification Forensics Table"
      className="relative flex flex-col rounded-2xl border border-[var(--uf-border)] bg-gradient-to-b from-[var(--uf-surface)] to-[var(--uf-bg)] p-5 shadow-xl sm:p-6"
    >
      {/* 1. Filter & Search Controls Header */}
      <div className="flex flex-col justify-between gap-3.5 border-b border-[var(--uf-border-faint)] pb-4 sm:flex-row sm:items-center">
        {/* Quick Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setFilterMode("ALL")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 uf-mono text-[10.5px] font-bold uppercase tracking-wider transition-all ${
              filterMode === "ALL"
                ? "bg-[var(--uf-accent)] text-black shadow-[0_0_12px_rgba(55,199,234,0.3)]"
                : "bg-[var(--uf-surface-raised)] text-[var(--uf-text-secondary)] hover:bg-[var(--uf-surface-2)] hover:text-[var(--uf-text-primary)]"
            }`}
          >
            <span>All Specs</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[9px] ${
                filterMode === "ALL"
                  ? "bg-black/20 text-black"
                  : "bg-[rgba(255,255,255,0.08)] text-[var(--uf-text-tertiary)]"
              }`}
            >
              {attributes.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterMode("CONFLICT")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 uf-mono text-[10.5px] font-bold uppercase tracking-wider transition-all ${
              filterMode === "CONFLICT"
                ? "border border-[var(--uf-warning)] bg-[var(--uf-warning)] text-black shadow-[0_0_12px_rgba(217,161,59,0.3)]"
                : openConflictList.length > 0
                  ? "border border-[var(--uf-warning-line)] bg-[var(--uf-warning-dim)] text-[var(--uf-warning)] hover:bg-[rgba(217,161,59,0.18)]"
                  : "bg-[var(--uf-surface-raised)] text-[var(--uf-text-tertiary)]"
            }`}
          >
            <AlertTriangle className="size-3.5 shrink-0" />
            <span>Discrepancies</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[9px] ${
                filterMode === "CONFLICT"
                  ? "bg-black/20 text-black"
                  : "bg-[rgba(217,161,59,0.2)] text-[var(--uf-warning)]"
              }`}
            >
              {openConflictList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterMode("VERIFIED")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 uf-mono text-[10.5px] font-bold uppercase tracking-wider transition-all ${
              filterMode === "VERIFIED"
                ? "border border-[var(--uf-success)] bg-[var(--uf-success)] text-black shadow-[0_0_12px_rgba(69,193,129,0.3)]"
                : "bg-[var(--uf-surface-raised)] text-[var(--uf-text-secondary)] hover:border-[var(--uf-success-line)] hover:text-[var(--uf-success)]"
            }`}
          >
            <Check className="size-3.5 shrink-0" />
            <span>Verified</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[9px] ${
                filterMode === "VERIFIED"
                  ? "bg-black/20 text-black"
                  : "bg-[rgba(69,193,129,0.2)] text-[var(--uf-success)]"
              }`}
            >
              {attributes.length - openConflictList.length}
            </span>
          </button>
        </div>

        {/* Search Input Box */}
        <div className="relative min-w-[220px] sm:w-[260px]">
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[var(--uf-text-tertiary)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search specifications, values..."
            className="h-9 w-full rounded-xl border border-[var(--uf-border)] bg-[var(--uf-surface-raised)] pl-9 pr-3 text-[12px] text-[var(--uf-text-primary)] placeholder:text-[var(--uf-text-tertiary)] focus:border-[var(--uf-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--uf-accent)]"
          />
        </div>
      </div>

      {/* 2. Column Headers (Desktop) */}
      <div className="hidden grid-cols-12 items-center border-b border-[var(--uf-border-faint)] pb-3 pt-3.5 uf-mono text-[9.5px] uppercase tracking-[0.14em] text-[var(--uf-text-tertiary)] lg:grid">
        <div className="col-span-3 pl-3">
          <span>Specification Field</span>
        </div>
        <div className="col-span-3">
          <span>Canonical Value</span>
        </div>
        <div className="col-span-2">
          <span>Cross-Match Health</span>
        </div>
        <div className="col-span-2">
          <span>Authoritative Proofs</span>
        </div>
        <div className="col-span-2 pr-3 text-right">
          <span>Resolution Status</span>
        </div>
      </div>

      {/* 3. Specification List Rows */}
      <div className="mt-1 divide-y divide-[var(--uf-border-faint)]">
        {filteredAttributes.length === 0 ? (
          <div className="py-14 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[var(--uf-surface-raised)] text-[var(--uf-text-tertiary)]">
              <Search className="size-5" />
            </div>
            <p className="mt-3 text-[13px] font-bold text-[var(--uf-text-primary)]">
              No specifications match your filter
            </p>
            <p className="mt-1 text-[11px] text-[var(--uf-text-tertiary)]">
              Try adjusting your search query or reset filter to "All Specs"
            </p>
          </div>
        ) : (
          filteredAttributes.map((item) => {
            const conflict = openConflictList.find(
              (c) => c.attributeKey === item.attribute.key,
            );
            const isHighlighted = highlightedKey === item.attribute.key;
            const isExpanded = !!expandedKeys[item.attribute.key] || isHighlighted;

            return (
              <AttributeRow
                key={item.attribute.key}
                item={item}
                conflict={conflict}
                isExpanded={isExpanded}
                isHighlighted={isHighlighted}
                onToggleExpand={() => toggleExpand(item.attribute.key)}
                onSelectEvidence={() => onSelectEvidence(item.attribute.key)}
                onOpenConflict={() => conflict && onOpenConflict(conflict.id)}
                onInspectSource={(src) =>
                  setActiveTraceSource({
                    source: src,
                    attributeKey: item.attribute.key,
                    attributeLabel: item.attribute.label,
                  })
                }
              />
            );
          })
        )}
      </div>

      {/* 4. Inline Source Document Traceability Drawer */}
      <AnimatePresence>
        {activeTraceSource && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="sticky bottom-4 z-20 mt-4 rounded-xl border border-[var(--uf-accent)] bg-[var(--uf-surface-raised)] p-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[var(--uf-border-faint)] pb-3">
              <div className="flex items-center gap-2 uf-mono text-[10.5px] uppercase tracking-[0.14em] text-[var(--uf-accent)]">
                <FileCheck2 className="size-4" />
                <span>Authoritative Document Proof</span>
                <span className="text-[var(--uf-border-strong)]">/</span>
                <span className="font-bold text-[var(--uf-text-primary)]">
                  {activeTraceSource.attributeLabel}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTraceSource(null)}
                className="rounded-md border border-[var(--uf-border)] bg-[var(--uf-surface)] px-2.5 py-1 uf-mono text-[9.5px] uppercase text-[var(--uf-text-tertiary)] transition-colors hover:border-[var(--uf-border-strong)] hover:text-[var(--uf-text-primary)]"
              >
                Close Drawer ✕
              </button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-4 uf-mono text-[11px] sm:grid-cols-4">
              <div className="flex flex-col">
                <span className="text-[9.5px] uppercase tracking-wider text-[var(--uf-text-tertiary)]">
                  Document Source
                </span>
                <p className="mt-0.5 truncate font-bold text-[var(--uf-text-primary)]">
                  {activeTraceSource.source.document}
                </p>
                <span className="text-[10px] text-[var(--uf-text-secondary)]">
                  Supplier: {activeTraceSource.source.supplier}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-[9.5px] uppercase tracking-wider text-[var(--uf-text-tertiary)]">
                  Location Citation
                </span>
                <p className="mt-0.5 font-bold text-[var(--uf-text-secondary)]">
                  {activeTraceSource.source.pageRef.includes("Row")
                    ? activeTraceSource.source.pageRef
                    : `Page ${activeTraceSource.source.pageRef}`}
                </p>
                <span className="text-[10px] text-[var(--uf-text-tertiary)]">
                  Indexed section
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-[9.5px] uppercase tracking-wider text-[var(--uf-text-tertiary)]">
                  Extracted Raw Value
                </span>
                <p className="mt-0.5 font-black text-[var(--uf-accent)]">
                  "{activeTraceSource.source.value}"
                </p>
                <span className="text-[10px] text-[var(--uf-success)]">
                  {Math.round(activeTraceSource.source.confidence * 100)}% Extraction Score
                </span>
              </div>

              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => {
                    onSelectEvidence(activeTraceSource.attributeKey);
                    setActiveTraceSource(null);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--uf-accent)] bg-[rgba(55,199,234,0.12)] px-3.5 py-2 text-[10.5px] font-bold text-[var(--uf-accent)] transition-all hover:bg-[var(--uf-accent)] hover:text-black"
                >
                  <Eye className="size-3.5" />
                  <span>Inspect in PDF Viewer</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

interface AttributeRowProps {
  item: ProductDnaAttribute;
  conflict?: Conflict;
  isExpanded: boolean;
  isHighlighted: boolean;
  onToggleExpand: () => void;
  onSelectEvidence: () => void;
  onOpenConflict: () => void;
  onInspectSource: (source: DnaSource) => void;
}

function AttributeRow({
  item,
  conflict,
  isExpanded,
  isHighlighted,
  onToggleExpand,
  onSelectEvidence,
  onOpenConflict,
  onInspectSource,
}: AttributeRowProps) {
  const { attribute, sources = [] } = item;
  const isConflict = !!conflict;
  const isVerified = attribute.verification === "VERIFIED" && !isConflict;
  const confidencePct = Math.round(attribute.confidence * 1000) / 10;

  // Quick Resolve direct action
  const handleQuickResolve = (chosenValue: string) => {
    if (!conflict) return;
    forgeStore.resolveConflict(conflict.id, {
      selectedValue: chosenValue,
      reason: `Accepted during Product DNA forensic inspection: value verified as ${chosenValue}`,
      mode: "RECOMMENDATION",
    });
    toast.success(`Resolved ${attribute.label} to "${chosenValue}"`);
  };

  return (
    <div
      className={`group relative flex flex-col transition-all duration-200 ${
        isHighlighted
          ? "bg-[rgba(55,199,234,0.06)]"
          : isConflict
            ? "bg-[rgba(217,161,59,0.04)]"
            : "hover:bg-[rgba(255,255,255,0.02)]"
      }`}
    >
      {/* Main Row Summary (Desktop Grid) */}
      <div
        onClick={onToggleExpand}
        className="hidden cursor-pointer grid-cols-12 items-center py-4 pr-3 transition-colors lg:grid"
      >
        {/* 1. Specification Field with Category Icon */}
        <div className="col-span-3 flex items-center gap-3 pl-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
            className="flex size-6 items-center justify-center rounded-md text-[var(--uf-text-tertiary)] transition-colors hover:bg-[var(--uf-surface)] hover:text-[var(--uf-text-primary)]"
          >
            {isExpanded ? (
              <ChevronDown className="size-4" />
            ) : (
              <ChevronRight className="size-4" />
            )}
          </button>

          <div
            className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
              isConflict
                ? "bg-[rgba(217,161,59,0.15)] text-[var(--uf-warning)]"
                : isVerified
                  ? "bg-[rgba(69,193,129,0.12)] text-[var(--uf-success)]"
                  : "bg-[var(--uf-surface-raised)] text-[var(--uf-accent)]"
            }`}
          >
            <AttributeIcon attributeKey={attribute.key} className="size-4" />
          </div>

          <div className="flex flex-col">
            <span
              className="text-[13.5px] font-bold uppercase tracking-tight [font-family:var(--uf-font-condensed)]"
              style={{
                color: isConflict ? "var(--uf-warning)" : "var(--uf-text-primary)",
              }}
            >
              {attribute.label}
            </span>
            <span className="uf-mono text-[9.5px] uppercase tracking-wider text-[var(--uf-text-tertiary)]">
              {attribute.key}
            </span>
          </div>
        </div>

        {/* 2. Canonical Value Display */}
        <div className="col-span-3 flex items-baseline gap-1.5">
          <span className="uf-mono text-[14px] font-black tracking-tight text-[var(--uf-text-primary)]">
            {attribute.value}
          </span>
          {attribute.unit && (
            <span className="rounded bg-[rgba(255,255,255,0.06)] px-1.5 py-0.5 uf-mono text-[10px] font-medium text-[var(--uf-text-tertiary)]">
              {attribute.unit}
            </span>
          )}
        </div>

        {/* 3. Cross-Match Health Meter */}
        <div className="col-span-2 flex items-center gap-2.5">
          <div className="h-2 w-20 overflow-hidden rounded-full bg-[var(--uf-surface)] shadow-inner">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${confidencePct}%`,
                background: isConflict
                  ? "var(--uf-warning)"
                  : "var(--uf-success)",
              }}
            />
          </div>
          <span
            className="uf-mono text-[11.5px] font-extrabold"
            style={{
              color: isConflict ? "var(--uf-warning)" : "var(--uf-success)",
            }}
          >
            {confidencePct.toFixed(0)}%
          </span>
        </div>

        {/* 4. Authoritative Proof Pills */}
        <div className="col-span-2 flex flex-wrap items-center gap-1.5">
          {sources.slice(0, 2).map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onInspectSource(src);
              }}
              className="inline-flex items-center gap-1 rounded-md border border-[var(--uf-border)] bg-[var(--uf-surface)] px-2 py-1 uf-mono text-[9.5px] text-[var(--uf-text-secondary)] transition-all hover:border-[var(--uf-accent)] hover:bg-[rgba(55,199,234,0.08)] hover:text-[var(--uf-text-primary)]"
            >
              <DocIcon docName={src.document} className="size-3 text-[var(--uf-accent)]" />
              <span className="max-w-[75px] truncate">{src.document.split(".")[0]}</span>
              <span className="text-[var(--uf-text-tertiary)]">p.{src.pageRef}</span>
            </button>
          ))}
          {sources.length > 2 && (
            <span className="rounded bg-[rgba(255,255,255,0.06)] px-1.5 py-0.5 uf-mono text-[9px] text-[var(--uf-text-tertiary)]">
              +{sources.length - 2} more
            </span>
          )}
        </div>

        {/* 5. Status Badge */}
        <div className="col-span-2 flex items-center justify-end gap-2 pr-3 text-right">
          {isConflict ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--uf-warning-line)] bg-[var(--uf-warning-dim)] px-3 py-1 uf-mono text-[10px] font-black uppercase tracking-wider text-[var(--uf-warning)] shadow-[0_0_12px_rgba(217,161,59,0.2)] animate-pulse">
              <AlertTriangle className="size-3 shrink-0" />
              <span>Needs Review</span>
            </span>
          ) : isVerified ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--uf-success-line)] bg-[var(--uf-success-dim)] px-3 py-1 uf-mono text-[10px] font-black uppercase tracking-wider text-[var(--uf-success)]">
              <Check className="size-3.5 stroke-[3]" />
              <span>Verified</span>
            </span>
          ) : (
            <span className="uf-mono text-[10px] text-[var(--uf-text-tertiary)]">
              Pending
            </span>
          )}
        </div>
      </div>

      {/* Mobile Row View (<1024px) */}
      <div
        onClick={onToggleExpand}
        className="flex cursor-pointer flex-col gap-2.5 p-4 lg:hidden"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand();
              }}
              className="text-[var(--uf-text-tertiary)]"
            >
              {isExpanded ? (
                <ChevronDown className="size-4" />
              ) : (
                <ChevronRight className="size-4" />
              )}
            </button>
            <div
              className={`flex size-7 items-center justify-center rounded-md ${
                isConflict
                  ? "bg-[rgba(217,161,59,0.15)] text-[var(--uf-warning)]"
                  : "bg-[rgba(69,193,129,0.12)] text-[var(--uf-success)]"
              }`}
            >
              <AttributeIcon attributeKey={attribute.key} className="size-3.5" />
            </div>
            <div className="flex flex-col">
              <span
                className="text-[14px] font-bold uppercase [font-family:var(--uf-font-condensed)]"
                style={{
                  color: isConflict ? "var(--uf-warning)" : "var(--uf-text-primary)",
                }}
              >
                {attribute.label}
              </span>
              <span className="uf-mono text-[9.5px] uppercase text-[var(--uf-text-tertiary)]">
                {attribute.key}
              </span>
            </div>
          </div>

          <div>
            {isConflict ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--uf-warning-dim)] px-2.5 py-0.5 uf-mono text-[10px] font-bold text-[var(--uf-warning)]">
                ⚠️ Conflict
              </span>
            ) : isVerified ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--uf-success-dim)] px-2.5 py-0.5 uf-mono text-[10px] font-bold text-[var(--uf-success)]">
                ✓ Verified
              </span>
            ) : (
              <span className="uf-mono text-[10px] text-[var(--uf-text-tertiary)]">
                Pending
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pl-8">
          <div className="flex items-baseline gap-1.5">
            <span className="uf-mono text-[15px] font-bold text-[var(--uf-text-primary)]">
              {attribute.value}
            </span>
            {attribute.unit && (
              <span className="uf-mono text-[10px] text-[var(--uf-text-tertiary)]">
                {attribute.unit}
              </span>
            )}
          </div>

          <span
            className="uf-mono text-[11px] font-bold"
            style={{
              color: isConflict ? "var(--uf-warning)" : "var(--uf-success)",
            }}
          >
            {confidencePct.toFixed(0)}% match
          </span>
        </div>
      </div>

      {/* Expanded Forensic Resolution Arena or Citation Explorer */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="overflow-hidden border-t border-[var(--uf-border-faint)] bg-[rgba(0,0,0,0.3)] p-4 sm:p-5 lg:pl-12"
          >
            {isConflict && conflict ? (
              /* Conflict Arbitration Card Arena */
              <div className="flex flex-col gap-4 rounded-xl border border-[var(--uf-warning)] bg-gradient-to-b from-[rgba(217,161,59,0.08)] to-[rgba(217,161,59,0.02)] p-4 sm:p-5 shadow-lg">
                {/* Header of Dispute Card */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--uf-warning)] text-black">
                      <AlertTriangle className="size-4.5" />
                    </div>
                    <div>
                      <h4 className="text-[14px] font-bold uppercase tracking-wider text-[var(--uf-warning)] [font-family:var(--uf-font-condensed)]">
                        Specification Discrepancy Detected
                      </h4>
                      <p className="mt-0.5 text-[12px] text-[var(--uf-text-secondary)]">
                        Indexed documents provide differing values for{" "}
                        <strong className="text-[var(--uf-text-primary)]">{attribute.label}</strong>.
                        Review cross-source proofs below to arbitrate.
                      </p>
                    </div>
                  </div>

                  <span className="rounded-md border border-[var(--uf-warning-line)] bg-[var(--uf-warning-dim)] px-2.5 py-1 uf-mono text-[10px] font-bold text-[var(--uf-warning)]">
                    {conflict.sources.length} Sources Ingested
                  </span>
                </div>

                {/* Evidence Comparison Grid */}
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {conflict.sources.map((s, idx) => {
                    const isRecValue =
                      s.value.toLowerCase() ===
                      (conflict.recommendation || attribute.value).toLowerCase();

                    return (
                      <div
                        key={idx}
                        className={`flex flex-col justify-between rounded-xl border p-3.5 transition-all ${
                          isRecValue
                            ? "border-[rgba(55,199,234,0.4)] bg-[rgba(55,199,234,0.06)] shadow-[0_0_12px_rgba(55,199,234,0.1)]"
                            : "border-[var(--uf-border)] bg-[var(--uf-surface)]"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between text-[11px]">
                            <div className="flex items-center gap-1.5 font-bold text-[var(--uf-text-primary)]">
                              <DocIcon docName={s.document} className="size-3.5 text-[var(--uf-accent)]" />
                              <span className="truncate">{s.document}</span>
                            </div>
                            {isRecValue && (
                              <span className="rounded bg-[rgba(55,199,234,0.2)] px-1.5 py-0.2 uf-mono text-[8.5px] font-bold text-[var(--uf-accent)]">
                                CONSENSUS
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-[var(--uf-text-tertiary)]">
                            Supplier: {s.supplier}
                          </span>

                          {/* Extracted Value */}
                          <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-[10px] uppercase text-[var(--uf-text-tertiary)]">
                              Extracted:
                            </span>
                            <span className="uf-mono text-[15px] font-extrabold text-[var(--uf-text-primary)]">
                              "{s.value}"
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between border-t border-[var(--uf-border-faint)] pt-2 uf-mono text-[10px]">
                          <span className="text-[var(--uf-text-tertiary)]">Confidence</span>
                          <span className="font-bold text-[var(--uf-accent)]">
                            {Math.round(s.confidence * 100)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* AI Recommendation & 1-Click Action Bar */}
                <div className="flex flex-col justify-between gap-3 rounded-xl border border-[rgba(55,199,234,0.3)] bg-[rgba(55,199,234,0.06)] p-4 sm:flex-row sm:items-center">
                  <div className="flex items-start gap-2.5">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-[var(--uf-accent)] text-black">
                      <Sparkles className="size-4" />
                    </div>
                    <div className="text-[12px] leading-relaxed text-[var(--uf-text-secondary)]">
                      <strong className="text-[var(--uf-accent)]">AI Consensus Verdict:</strong>{" "}
                      Latest engineering drawings & certified catalog agree on{" "}
                      <strong className="font-bold text-[var(--uf-text-primary)]">
                        "{conflict.recommendation || attribute.value}"
                      </strong>
                      . (Legacy pricebook contains an outdated entry).
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() =>
                        handleQuickResolve(conflict.recommendation || attribute.value)
                      }
                      className="inline-flex items-center gap-2 rounded-lg bg-[var(--uf-accent)] px-4 py-2 uf-mono text-[11px] font-black uppercase tracking-wider text-black shadow-[0_0_14px_rgba(55,199,234,0.3)] transition-all hover:bg-[var(--uf-accent-bright)] hover:scale-105"
                    >
                      <Check className="size-3.5" />
                      <span>Accept "{conflict.recommendation || attribute.value}"</span>
                    </button>

                    <button
                      type="button"
                      onClick={onOpenConflict}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--uf-border)] bg-[var(--uf-surface)] px-3 py-2 uf-mono text-[10.5px] uppercase text-[var(--uf-text-secondary)] transition-colors hover:border-[var(--uf-border-strong)] hover:text-[var(--uf-text-primary)]"
                    >
                      <span>Full Arbitration Suite</span>
                      <ArrowRight className="size-3" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Verified Attribute Citation Trail */
              <div className="flex flex-col gap-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-[var(--uf-success)]" />
                    <span className="uf-mono text-[11px] font-bold uppercase tracking-wider text-[var(--uf-success)]">
                      Verified Provenance Trail ({sources.length} Documents Aligned)
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={onSelectEvidence}
                    className="inline-flex items-center gap-1.5 rounded-md border border-[rgba(55,199,234,0.3)] bg-[rgba(55,199,234,0.08)] px-2.5 py-1 uf-mono text-[10px] text-[var(--uf-accent)] transition-colors hover:bg-[var(--uf-accent)] hover:text-black"
                  >
                    <Eye className="size-3.5" />
                    <span>Open Evidence Viewer</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {sources.map((src, i) => (
                    <div
                      key={i}
                      onClick={() => onInspectSource(src)}
                      className="flex cursor-pointer flex-col gap-2 rounded-xl border border-[var(--uf-border)] bg-[var(--uf-surface)] p-3 transition-all hover:border-[var(--uf-accent)] hover:bg-[var(--uf-surface-raised)]"
                    >
                      <div className="flex items-center justify-between text-[11.5px]">
                        <div className="flex items-center gap-1.5 font-bold text-[var(--uf-text-primary)]">
                          <DocIcon docName={src.document} className="size-3.5 text-[var(--uf-accent)]" />
                          <span className="truncate">{src.document}</span>
                        </div>
                        <span className="uf-mono text-[10px] text-[var(--uf-text-tertiary)]">
                          p.{src.pageRef}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="uf-mono text-[12px] font-extrabold text-[var(--uf-accent)]">
                          "{src.value}"
                        </span>
                        <span className="flex items-center gap-1 uf-mono text-[10px] font-bold text-[var(--uf-success)]">
                          <Check className="size-3" />
                          <span>{Math.round(src.confidence * 100)}% match</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
