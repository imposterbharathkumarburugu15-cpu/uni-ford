import { useState } from "react";
import { useCanonicalDnaList } from "@/hooks/use-forge-store";
import {
  exportCanonicalDataToCSV,
  exportCanonicalDataToExcel,
  exportCanonicalDataToJSON,
  downloadFile,
} from "@/export/exportEngine";
import { Download, FileSpreadsheet, FileCode, FileText, CheckCircle2, X } from "lucide-react";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const canonicalDnaList = useCanonicalDnaList();
  const [includeProvenance, setIncludeProvenance] = useState(true);

  if (!isOpen) return null;

  const handleExportCSV = () => {
    const csv = exportCanonicalDataToCSV(canonicalDnaList, includeProvenance);
    downloadFile(csv, "canonical_product_dna.csv", "text/csv");
  };

  const handleExportExcel = () => {
    exportCanonicalDataToExcel(canonicalDnaList, "canonical_product_dna.xlsx");
  };

  const handleExportJSON = () => {
    const jsonStr = exportCanonicalDataToJSON(canonicalDnaList);
    downloadFile(jsonStr, "canonical_product_dna.json", "application/json");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-[#090d16] p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-cyan-400" />
            <h3 className="uf-mono text-base font-bold text-slate-100">
              Export Canonical Product DNA
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="uf-mono text-xs text-slate-400 mt-3">
          Export {canonicalDnaList.length} verified canonical Product DNA records in enterprise format.
        </p>

        {/* Options */}
        <div className="mt-4 rounded-lg border border-slate-800 bg-[#05070c] p-3">
          <label className="flex items-center gap-2 uf-mono text-xs text-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={includeProvenance}
              onChange={(e) => setIncludeProvenance(e.target.checked)}
              className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
            />
            <span>Include full source provenance metadata (File, Sheet, Row, Col, Raw Value)</span>
          </label>
        </div>

        {/* Export Buttons */}
        <div className="mt-5 space-y-2.5">
          <button
            onClick={handleExportExcel}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 uf-mono text-xs font-bold text-emerald-300 hover:bg-emerald-500/20"
          >
            <FileSpreadsheet className="h-4 w-4" /> EXPORT EXCEL WORKBOOK (.XLSX)
          </button>

          <button
            onClick={handleExportCSV}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-4 py-2.5 uf-mono text-xs font-bold text-cyan-300 hover:bg-cyan-500/20"
          >
            <FileText className="h-4 w-4" /> EXPORT CSV DATASET (.CSV)
          </button>

          <button
            onClick={handleExportJSON}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 uf-mono text-xs font-bold text-slate-200 hover:bg-slate-700"
          >
            <FileCode className="h-4 w-4" /> EXPORT JSON CATALOG (.JSON)
          </button>
        </div>
      </div>
    </div>
  );
}
