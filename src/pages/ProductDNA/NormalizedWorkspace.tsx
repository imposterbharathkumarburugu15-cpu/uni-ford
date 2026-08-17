import { useState } from "react";
import { useNormalizedRecords, useResolvedEntities } from "@/hooks/use-forge-store";
import { Layers, ArrowRight, CheckCircle, AlertTriangle, Search, Filter } from "lucide-react";

export function NormalizedWorkspace() {
  const normalizedRecords = useNormalizedRecords();
  const resolvedEntities = useResolvedEntities();
  const [activeTab, setActiveTab] = useState<"RECORDS" | "CLUSTERS">("RECORDS");
  const [filterQuery, setFilterQuery] = useState("");

  if (normalizedRecords.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[var(--uf-border)] bg-[var(--uf-surface)] p-5 shadow-2xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-[var(--uf-border-faint)] bg-[#090d16] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h3 className="uf-mono text-sm font-semibold tracking-wide text-slate-100">
              Normalization & Entity Resolution Matrix
            </h3>
            <p className="mt-0.5 uf-mono text-[11px] text-slate-400">
              {normalizedRecords.length} normalized records resolved into {resolvedEntities.length} canonical product entities
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center rounded-md border border-slate-800 bg-slate-950 p-1">
          <button
            onClick={() => setActiveTab("RECORDS")}
            className={`rounded px-3 py-1 uf-mono text-xs font-medium transition-all ${
              activeTab === "RECORDS" ? "bg-slate-800 text-slate-100" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            NORMALIZED RECORDS ({normalizedRecords.length})
          </button>
          <button
            onClick={() => setActiveTab("CLUSTERS")}
            className={`rounded px-3 py-1 uf-mono text-xs font-medium transition-all ${
              activeTab === "CLUSTERS" ? "bg-slate-800 text-slate-100" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            ENTITY CLUSTERS ({resolvedEntities.length})
          </button>
        </div>
      </div>

      {/* 1. Normalized Records View */}
      {activeTab === "RECORDS" && (
        <div className="flex flex-col gap-3">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Filter normalized fields..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-[#070a11] pl-9 pr-4 py-1.5 uf-mono text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
            {normalizedRecords
              .filter((rec) => {
                if (!filterQuery.trim()) return true;
                const q = filterQuery.toLowerCase();
                return Object.values(rec.fields).some(
                  (f) => f.originalValue.toLowerCase().includes(q) || f.normalizedValue.toLowerCase().includes(q),
                );
              })
              .map((rec) => (
                <div
                  key={rec.id}
                  className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-[#060910] p-4 shadow"
                >
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <span className="uf-mono text-xs font-bold text-slate-200">
                      Record {rec.id} · Sheet: {rec.sourceSheet} (Row {rec.sourceRow})
                    </span>
                    <span className="rounded bg-cyan-500/10 px-2 py-0.5 uf-mono text-[10px] text-cyan-400">
                      {Object.keys(rec.fields).length} mapped fields
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-1">
                    {Object.values(rec.fields).map((field) => (
                      <div
                        key={field.canonicalField}
                        className={`flex flex-col rounded p-2 uf-mono text-xs border ${
                          field.wasModified
                            ? "border-cyan-500/30 bg-cyan-500/5"
                            : "border-slate-800/60 bg-slate-900/40"
                        }`}
                      >
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">
                          {field.canonicalField}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-slate-400 line-through text-[11px] truncate max-w-[120px]">
                            {field.originalValue}
                          </span>
                          <ArrowRight className="h-3 w-3 text-cyan-400 shrink-0" />
                          <span className="font-semibold text-slate-100 truncate">
                            {field.normalizedValue}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 2. Entity Resolution Clusters View */}
      {activeTab === "CLUSTERS" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resolvedEntities.map((cluster) => (
            <div
              key={cluster.entityId}
              className="flex flex-col gap-3 rounded-lg border border-slate-800 bg-[#070a11] p-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div>
                  <h4 className="uf-mono text-sm font-bold text-slate-100">{cluster.entityId}</h4>
                  <p className="uf-mono text-xs text-slate-400 mt-0.5">{cluster.name}</p>
                </div>
                <div className="text-right">
                  <span
                    className={`rounded px-2.5 py-1 uf-mono text-xs font-semibold ${
                      cluster.requiresReview
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    }`}
                  >
                    {(cluster.matchConfidence * 100).toFixed(0)}% Confidence
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1 uf-mono text-xs text-slate-300">
                <span className="text-[11px] text-slate-400">Resolution Evidence:</span>
                <span className="text-cyan-400 font-medium">{cluster.resolutionNotes}</span>
              </div>

              <div className="flex flex-col gap-2 mt-1">
                <span className="uf-mono text-[11px] font-semibold text-slate-400 uppercase">
                  Matched Source Rows ({cluster.matchedRecords.length}):
                </span>
                <div className="space-y-1">
                  {cluster.matchedRecords.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between rounded border border-slate-800 bg-slate-900/60 px-3 py-1.5 uf-mono text-xs text-slate-200"
                    >
                      <span>Sheet: {r.sourceSheet} · Row {r.sourceRow}</span>
                      <span className="text-slate-400 text-[11px] truncate max-w-[200px]">
                        {r.fields.description?.normalizedValue || r.fields.product_id?.normalizedValue}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
