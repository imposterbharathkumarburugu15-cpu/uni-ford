import { useEnrichedProducts, useExtractedAttributes } from "@/hooks/use-forge-store";
import { Sparkles, Network, CheckCircle, AlertCircle, HelpCircle } from "lucide-react";

export function EnrichedWorkspace() {
  const extractedList = useExtractedAttributes();
  const enrichedList = useEnrichedProducts();

  if (extractedList.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[var(--uf-border)] bg-[var(--uf-surface)] p-5 shadow-2xl">
      {/* Passport Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-[var(--uf-border-faint)] bg-[#090d16] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="uf-mono text-sm font-semibold tracking-wide text-slate-100">
              Modular Data Enrichment & Taxonomy Workspace
            </h3>
            <p className="mt-0.5 uf-mono text-[11px] text-slate-400">
              Provider-driven attribute augmentation & industrial taxonomy classification
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Provider Architecture Status Table */}
        <div className="flex flex-col gap-3 rounded-lg border border-slate-800 bg-[#070a11] p-4">
          <h4 className="uf-mono text-xs font-bold uppercase tracking-wider text-slate-300">
            Configured Enrichment Providers
          </h4>

          <div className="space-y-2.5">
            <div className="flex flex-col gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/5 p-3 uf-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-100">ASTM / ASME Industrial Standards</span>
                <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300 font-bold">
                  ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Local Reference Provider · Specs & Temperature Ratings</p>
            </div>

            <div className="flex flex-col gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/5 p-3 uf-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-100">Global Product Taxonomy Engine</span>
                <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300 font-bold">
                  ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Hierarchy Path & Classification Level</p>
            </div>

            <div className="flex flex-col gap-1 rounded-md border border-slate-800 bg-slate-900/60 p-3 uf-mono text-xs opacity-75">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300">External Supplier Catalog API v2</span>
                <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400 font-bold">
                  UNCONNECTED
                </span>
              </div>
              <p className="text-[11px] text-amber-400 mt-1">DATA NOT AVAILABLE (Unconfigured Provider Rule)</p>
            </div>
          </div>
        </div>

        {/* Product Taxonomy & Enriched Attributes Detail */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {enrichedList.map((item) => (
            <div
              key={item.entityId}
              className="flex flex-col gap-3 rounded-lg border border-slate-800 bg-[#070a11] p-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="uf-mono text-sm font-bold text-slate-100">{item.entityId}</span>
                <span
                  className={`rounded px-2.5 py-0.5 uf-mono text-xs font-semibold ${
                    item.enrichmentState === "FULLY_ENRICHED"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {item.enrichmentState}
                </span>
              </div>

              {/* Taxonomy Path */}
              <div className="flex items-center gap-2 rounded border border-cyan-500/20 bg-cyan-500/5 p-2.5 uf-mono text-xs text-cyan-300">
                <Network className="h-4 w-4 shrink-0" />
                <span className="font-semibold">Taxonomy:</span>
                <span>{item.taxonomyPath}</span>
              </div>

              {/* Enriched Fields List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                {Object.keys(item.enrichedAttributes).length > 0 ? (
                  Object.entries(item.enrichedAttributes).map(([k, v]) => (
                    <div
                      key={k}
                      className="flex flex-col rounded border border-slate-800 bg-slate-900/60 p-2.5 uf-mono text-xs"
                    >
                      <span className="text-[10px] text-slate-400 uppercase">{k.replace(/_/g, " ")}</span>
                      <span className="font-semibold text-slate-100 mt-0.5">{v}</span>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 rounded border border-amber-500/20 bg-amber-500/5 p-3 uf-mono text-xs text-amber-300">
                    NOT ENRICHED / DATA NOT AVAILABLE — No external provider configured for this item.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
