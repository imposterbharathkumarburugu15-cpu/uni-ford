import { buildAttributeLineage } from "@/provenance/lineageService";
import { GitCommit, FileSpreadsheet, Layers, ShieldCheck, CheckCircle2, X } from "lucide-react";

interface LineageModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  attributeKey: string;
  attributeLabel: string;
  canonicalValue: string;
  originalValue: string;
  sourceFile: string;
  sourceSheet: string;
  sourceRow: number;
  sourceCol: string;
  confidence: number;
  verificationStatus: string;
  enrichmentState: string;
}

export function LineageModal({
  isOpen,
  onClose,
  productId,
  attributeKey,
  attributeLabel,
  canonicalValue,
  originalValue,
  sourceFile,
  sourceSheet,
  sourceRow,
  sourceCol,
  confidence,
  verificationStatus,
  enrichmentState,
}: LineageModalProps) {
  if (!isOpen) return null;

  const lineage = buildAttributeLineage(
    productId,
    attributeKey,
    attributeLabel,
    canonicalValue,
    originalValue,
    sourceFile,
    sourceSheet,
    sourceRow,
    sourceCol,
    confidence,
    verificationStatus,
    enrichmentState,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="w-full max-w-3xl rounded-xl border border-slate-800 bg-[#090d16] p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <GitCommit className="h-5 w-5 text-cyan-400" />
              <h3 className="uf-mono text-base font-bold text-slate-100">
                Data Provenance & Line-of-Sight Traceability
              </h3>
            </div>
            <p className="uf-mono text-xs text-slate-400 mt-1">
              Product {productId} · Attribute: <span className="text-cyan-400 font-semibold">{attributeLabel} ({canonicalValue})</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step-by-Step Lineage Graph */}
        <div className="mt-5 space-y-4 max-h-[480px] overflow-y-auto pr-2">
          {lineage.steps.map((step, idx) => (
            <div key={idx} className="relative flex items-start gap-4">
              {/* Node Connector Line */}
              {idx < lineage.steps.length - 1 && (
                <div className="absolute left-4 top-8 h-full w-0.5 bg-slate-800" />
              )}

              {/* Node Icon */}
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cyan-500/40 bg-cyan-500/10 text-cyan-400 z-10 uf-mono text-xs font-bold">
                {idx + 1}
              </div>

              {/* Node Details Card */}
              <div className="flex-1 rounded-lg border border-slate-800 bg-[#05070c] p-3.5 shadow-md">
                <div className="flex items-center justify-between">
                  <h4 className="uf-mono text-xs font-bold text-slate-200">{step.title}</h4>
                  <span className="rounded bg-slate-800 px-2 py-0.5 uf-mono text-[10px] text-slate-400">
                    {step.stepName}
                  </span>
                </div>
                <p className="uf-mono text-xs text-slate-400 mt-1">{step.description}</p>
                <div className="mt-2 rounded border border-slate-800/80 bg-slate-950 p-2 uf-mono text-xs font-semibold text-cyan-300">
                  {step.detail}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-5 flex justify-end border-t border-slate-800 pt-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-700 bg-slate-800 px-5 py-2 uf-mono text-xs font-semibold text-slate-200 hover:bg-slate-700"
          >
            Close Traceability Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
