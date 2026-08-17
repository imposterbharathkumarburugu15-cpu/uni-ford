import { useState, useMemo } from "react";
import { processUnilogItem, type UnilogEnrichedOutputRow, type UnilogRawInputRow } from "@/enrichment/unilogEngine";
import { evaluateUnilogEnrichment } from "@/validation/unilogEvaluator";
import { exportRawRowsToCsv, exportRawRowsToExcel } from "@/export/exportEngine";
import {
  Sparkles,
  FileCheck,
  BarChart2,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Zap,
  Layers,
  Search,
  ArrowRight,
  ShieldCheck,
  Download,
  Table,
} from "lucide-react";

// Ground truth items including user pasted samples
const GROUND_TRUTH_SAMPLES: UnilogRawInputRow[] = [
  {
    SKU: "1515863",
    Mfg_Part_Num: "PDSH4816AF",
    Part_Desc: "PDSH4816AF Dishwasher SS - Display Only",
    E1_Brand: "-- Unbranded --",
    Unilog_Brand: "-- No Unilog Brand --",
    DIB_Brand: "-- No DIB Brand --",
    Part_Manuf: "Appliance Dealers Cooperative (APPDE)",
    Dept: "Appliances",
    Class: "Large Appliances",
    Fine: "Dishwashers",
  },
  {
    SKU: "1515867",
    Mfg_Part_Num: "WDTS7024RZ",
    Part_Desc: "WDTS7024RZ Dishwasher SS - Display Only",
    E1_Brand: "-- Unbranded --",
    Unilog_Brand: "-- No Unilog Brand --",
    DIB_Brand: "-- No DIB Brand --",
    Part_Manuf: "Appliance Dealers Cooperative (APPDE)",
    Dept: "Appliances",
    Class: "Large Appliances",
    Fine: "Dishwashers",
  },
  {
    SKU: "2435001",
    Mfg_Part_Num: "DCB518ASTS06G",
    Part_Desc: "DCB518ASTS06G Diablo 1/2\"x18\" - Sanding Belt 6pc",
    E1_Brand: "-- Unbranded --",
    Unilog_Brand: "-- No Unilog Brand --",
    DIB_Brand: "-- No DIB Brand --",
    Part_Manuf: "Freud Inc (2435)",
    Dept: "Abrasives",
    Class: "Sanding Belts",
  },
  {
    SKU: "7100075678",
    Mfg_Part_Num: "3MABR-7100075678",
    Part_Desc: "3M 775L Stikit Film P150 - Cubitron II 50 Disc/Box",
    E1_Brand: "-- Unbranded --",
    Unilog_Brand: "-- No Unilog Brand --",
    DIB_Brand: "-- No DIB Brand --",
    Part_Manuf: "Jam Industrial Supply LLC (JAMIN)",
    Dept: "Abrasives",
    Class: "Sanding Discs",
  },
  {
    SKU: "40310013",
    Mfg_Part_Num: "49-94-0013",
    Part_Desc: "49-94-0013 Milw 5\"x.045\"x7/8\" Metal Cut Off Disc",
    E1_Brand: "-- Unbranded --",
    Unilog_Brand: "-- No Unilog Brand --",
    DIB_Brand: "-- No DIB Brand --",
    Part_Manuf: "Milwaukee Accessory (4031)",
    Dept: "Abrasives",
    Class: "Cut-Off Discs",
  },
];

export function UnilogWorkspace() {
  const [tabMode, setTabMode] = useState<"ARENA" | "252_GRID">("ARENA");
  const [selectedItemIdx, setSelectedItemIdx] = useState(0);
  const [gridSearch, setGridSearch] = useState("");

  const enrichedItems = useMemo(() => {
    return GROUND_TRUTH_SAMPLES.map(processUnilogItem);
  }, []);

  const report = useMemo(() => {
    return evaluateUnilogEnrichment(enrichedItems);
  }, [enrichedItems]);

  const activeItem = enrichedItems[selectedItemIdx] || enrichedItems[0];

  // Extract all 252 delivery headers
  const deliveryColumns = useMemo(() => {
    if (enrichedItems.length === 0) return [];
    return Object.keys(enrichedItems[0].fullDeliveryRow);
  }, [enrichedItems]);

  // Filtered rows for 252 grid
  const filteredGridRows = useMemo(() => {
    if (!gridSearch.trim()) return enrichedItems;
    const q = gridSearch.toLowerCase();
    return enrichedItems.filter(
      (item) =>
        item.Mfg_Part_Num.toLowerCase().includes(q) ||
        item.BRAND_NAME.toLowerCase().includes(q) ||
        item.SHORT_DESC.toLowerCase().includes(q),
    );
  }, [enrichedItems, gridSearch]);

  const handleExportDeliveryCsv = () => {
    const rawRows = enrichedItems.map((item) => item.fullDeliveryRow);
    exportRawRowsToCsv(rawRows as any, "UNILOG_252_COLUMN_DELIVERY_FORMAT.csv");
  };

  const handleExportDeliveryExcel = () => {
    const rawRows = enrichedItems.map((item) => item.fullDeliveryRow);
    exportRawRowsToExcel(rawRows as any, "UNILOG_252_COLUMN_DELIVERY_FORMAT.xlsx");
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[var(--uf-border)] bg-[var(--uf-surface)] p-5 shadow-2xl">
      {/* 1. Passport Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-purple-500/30 bg-gradient-to-r from-[#0d0916] via-[#140d24] to-[#0d0916] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-purple-500/40 bg-purple-500/10 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="uf-mono text-sm font-bold text-slate-100">
                UNILOG 252-COLUMN DELIVERY FORMAT ENGINE & ACCURACY BENCHMARK
              </h3>
              <span className="rounded bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 uf-mono text-[10px] uppercase font-bold text-emerald-400">
                GROUND TRUTH ACCURACY: {report.overallAccuracyScore}%
              </span>
            </div>
            <p className="mt-0.5 uf-mono text-[11px] text-slate-400">
              Generating 5 search-ready descriptions, UOM fractions & 252-column delivery format schema
            </p>
          </div>
        </div>

        {/* View Switcher & Export */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTabMode("ARENA")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 uf-mono text-xs font-bold transition-all ${
              tabMode === "ARENA"
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow"
                : "bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" /> 5-Format Arena
          </button>
          <button
            onClick={() => setTabMode("252_GRID")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 uf-mono text-xs font-bold transition-all ${
              tabMode === "252_GRID"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow"
                : "bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200"
            }`}
          >
            <Table className="h-3.5 w-3.5" /> 252-Column Grid ({deliveryColumns.length} Cols)
          </button>
          <button
            onClick={handleExportDeliveryCsv}
            className="flex items-center gap-1.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 px-3 py-1.5 uf-mono text-xs font-bold text-emerald-300 hover:bg-emerald-500/30 transition-all"
          >
            <Download className="h-3.5 w-3.5" /> Export 252-Col CSV
          </button>
        </div>
      </div>

      {/* 2. MODE: ARENA */}
      {tabMode === "ARENA" && (
        <>
          {/* Item Selector Rail */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {enrichedItems.map((item, idx) => (
              <button
                key={item.Mfg_Part_Num}
                onClick={() => setSelectedItemIdx(idx)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left uf-mono text-xs transition-all shrink-0 ${
                  selectedItemIdx === idx
                    ? "border-purple-500 bg-purple-500/10 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.2)] font-bold"
                    : "border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-800"
                }`}
              >
                <span className="text-[10px] text-slate-500">#{idx + 1}</span>
                <span className="font-semibold text-slate-100">{item.Mfg_Part_Num}</span>
                <span className="text-[10px] text-slate-400 max-w-[120px] truncate">{item.BRAND_NAME}</span>
              </button>
            ))}
          </div>

          {/* Transformation Arena */}
          {activeItem && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Left Column */}
              <div className="flex flex-col gap-3 rounded-lg border border-slate-800 bg-[#070a11] p-4">
                <h4 className="uf-mono text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
                  RAW INPUT vs CANONICAL MASTER
                </h4>

                <div className="space-y-3 uf-mono text-xs">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Raw Input Description</span>
                    <span className="text-slate-300 font-medium bg-slate-900/80 p-2 rounded border border-slate-800">
                      "{GROUND_TRUTH_SAMPLES[selectedItemIdx]?.Part_Desc}"
                    </span>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Cleansed Brand & Manufacturer</span>
                    <div className="flex items-center gap-2 text-cyan-400 font-bold bg-cyan-500/5 p-2 rounded border border-cyan-500/20">
                      <span>{activeItem.BRAND_NAME}</span>
                      <span className="text-slate-500">·</span>
                      <span className="text-slate-300 text-[11px] font-normal">{activeItem.MANUFACTURER_NAME}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Canonical Taxonomy Classpath</span>
                    <span className="text-emerald-400 font-semibold bg-emerald-500/5 p-2 rounded border border-emerald-500/20 text-[11px]">
                      {activeItem.Classpath}
                    </span>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Digital Asset File Names</span>
                    <div className="space-y-1 text-[11px] text-slate-300">
                      <div className="flex items-center justify-between rounded bg-slate-900 p-1.5 border border-slate-800">
                        <span>Image:</span>
                        <span className="text-cyan-400 font-bold">{activeItem.Product_Image}</span>
                      </div>
                      <div className="flex items-center justify-between rounded bg-slate-900 p-1.5 border border-slate-800">
                        <span>Spec Sheet:</span>
                        <span className="text-cyan-400 font-bold">{activeItem.Specification_Sheet}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: 5 Descriptions */}
              <div className="lg:col-span-2 flex flex-col gap-3 rounded-lg border border-slate-800 bg-[#070a11] p-4">
                <h4 className="uf-mono text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2 flex items-center justify-between">
                  <span>UNILOG 5-FORMAT DESCRIPTION GENERATION</span>
                  <span className="text-purple-400 font-normal text-[11px]">Exact Guideline Character & UOM Rules</span>
                </h4>

                <div className="space-y-3 uf-mono text-xs">
                  <div className="flex flex-col gap-1 rounded-md border border-slate-800 bg-[#05070c] p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        1. INVOICE DESC (≤ 40 CHARACTERS, ALL CAPS)
                      </span>
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                          activeItem.invoiceValid ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"
                        }`}
                      >
                        {activeItem.invoiceDescLength} / 40 CHARS
                      </span>
                    </div>
                    <pre className="mt-1 font-mono text-sm font-extrabold text-cyan-300 whitespace-pre-wrap">
                      {activeItem.INVOICE_DESC}
                    </pre>
                  </div>

                  <div className="flex flex-col gap-1 rounded-md border border-slate-800 bg-[#05070c] p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        2. MOBILE DESC (60 - 80 CHARACTERS)
                      </span>
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                          activeItem.mobileValid ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
                        }`}
                      >
                        {activeItem.mobileDescLength} CHARS (TARGET 60-80)
                      </span>
                    </div>
                    <p className="mt-1 font-mono text-xs font-semibold text-slate-200">
                      {activeItem.MOBILE_DESC}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1 rounded-md border border-slate-800 bg-[#05070c] p-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      3. PRODUCT TITLE / SHORT DESC (Brand + Series + MPN + Type + Key Specs)
                    </span>
                    <p className="mt-1 text-xs font-bold text-slate-100 leading-relaxed">
                      {activeItem.SHORT_DESC}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1 rounded-md border border-slate-800 bg-[#05070c] p-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      4. LONG DESCRIPTION (Detailed Specifications with Standardized UOMs)
                    </span>
                    <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                      {activeItem.LONG_DESC1}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* 3. MODE: 252-COLUMN GRID */}
      {tabMode === "252_GRID" && (
        <div className="flex flex-col gap-3 rounded-lg border border-slate-800 bg-[#070a11] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Table className="h-4 w-4 text-cyan-400" />
              <h4 className="uf-mono text-xs font-bold uppercase tracking-wider text-slate-200">
                OFFICIAL UNILOG 252-COLUMN DELIVERY FORMAT MATRIX
              </h4>
              <span className="rounded bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 uf-mono text-[10px] font-bold text-cyan-400">
                {deliveryColumns.length} COLUMNS
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter 252-column grid..."
                  value={gridSearch}
                  onChange={(e) => setGridSearch(e.target.value)}
                  className="rounded-md border border-slate-800 bg-slate-900 pl-8 pr-3 py-1.5 uf-mono text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none w-64"
                />
              </div>

              <button
                onClick={handleExportDeliveryExcel}
                className="flex items-center gap-1.5 rounded bg-cyan-500/20 border border-cyan-500/40 px-3 py-1.5 uf-mono text-xs font-bold text-cyan-300 hover:bg-cyan-500/30 transition-all"
              >
                <Download className="h-3.5 w-3.5" /> Download .xlsx
              </button>
            </div>
          </div>

          {/* Interactive 252-Column Scrollable Table */}
          <div className="overflow-x-auto max-h-[550px] overflow-y-auto rounded border border-slate-800 scrollbar-thin">
            <table className="w-full text-left uf-mono text-xs border-collapse">
              <thead className="sticky top-0 bg-[#0c101c] z-10 text-[10.5px] uppercase font-bold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-3 py-2 border-r border-slate-800 text-slate-500 sticky left-0 bg-[#0c101c] z-20">
                    #
                  </th>
                  {deliveryColumns.map((col) => (
                    <th
                      key={col}
                      className="px-3 py-2 border-r border-slate-800 whitespace-nowrap min-w-[140px] text-cyan-400/90 font-bold"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 text-[11px]">
                {filteredGridRows.map((row, idx) => (
                  <tr key={row.Mfg_Part_Num} className="hover:bg-slate-900/50 transition-colors">
                    <td className="px-3 py-2 border-r border-slate-800 text-slate-500 font-bold sticky left-0 bg-[#070a11]">
                      {idx + 1}
                    </td>
                    {deliveryColumns.map((col) => {
                      const val = row.fullDeliveryRow[col] || "";
                      return (
                        <td key={col} className="px-3 py-2 border-r border-slate-800 whitespace-nowrap max-w-[300px] truncate">
                          {val ? (
                            <span className={col.startsWith("ATTRIBUTE_") ? "text-cyan-300" : ""}>{val}</span>
                          ) : (
                            <span className="text-slate-600 font-light">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
