import { useState } from "react";
import {
  useActiveSheetName,
  useActiveWorkbook,
  useSheetMappings,
  useWorkbookProfile,
} from "@/hooks/use-forge-store";
import { forgeStore } from "@/store/forgeStore";
import { CANONICAL_FIELDS } from "@/mapping/columnMapper";
import {
  FileSpreadsheet,
  CheckCircle2,
  Search,
  SlidersHorizontal,
  Table as TableIcon,
  BarChart2,
  Sparkles,
  Info,
  ChevronRight,
  Database,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

export function SourceDataWorkspace() {
  const workbook = useActiveWorkbook();
  const profile = useWorkbookProfile();
  const activeSheetName = useActiveSheetName();
  const sheetMappings = useSheetMappings(activeSheetName);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"GRID" | "PROFILER" | "MAPPING">("GRID");
  const [selectedColumnForProfiling, setSelectedColumnForProfiling] = useState<string | null>(null);
  const [inspectedValue, setInspectedValue] = useState<{ row: number; col: string; val: string } | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 50;

  if (!workbook) return null;

  const currentSheet = workbook.sheets[activeSheetName] || workbook.sheets[workbook.sheetNames[0]];
  if (!currentSheet) return null;

  const sheetProfile = profile?.sheets[activeSheetName];

  // Search filter
  const filteredRows = currentSheet.rows.filter((row) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return Object.values(row).some((val) => String(val).toLowerCase().includes(q));
  });

  const totalPages = Math.ceil(filteredRows.length / pageSize) || 1;
  const paginatedRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);

  const selectedColProfile = selectedColumnForProfiling && sheetProfile
    ? sheetProfile.columns[selectedColumnForProfiling]
    : null;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[var(--uf-border)] bg-[var(--uf-surface)] p-5 shadow-2xl">
      {/* 1. Source File Passport Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-[var(--uf-border-faint)] bg-[#090d16] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="uf-mono text-sm font-semibold tracking-wide text-slate-100">
                {workbook.filename}
              </h3>
              <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 uf-mono text-[10px] uppercase tracking-widest text-emerald-400">
                <CheckCircle2 className="h-3 w-3" /> VERIFIED SOURCE
              </span>
            </div>
            <p className="mt-0.5 uf-mono text-[11px] text-slate-400">
              {(workbook.sizeBytes / 1024).toFixed(1)} KB · {workbook.sheetNames.length} Sheets · {workbook.totalRows.toLocaleString()} Rows · {workbook.totalCols} Columns
            </p>
          </div>
        </div>

        {/* Sheet Selector & View Mode Switcher */}
        <div className="flex items-center gap-2">
          {/* Sheet Selector */}
          <div className="flex items-center gap-1 rounded-md border border-slate-800 bg-slate-900/80 p-1">
            {workbook.sheetNames.map((sName) => (
              <button
                key={sName}
                onClick={() => {
                  forgeStore.setActiveSheetName(sName);
                  setPage(1);
                }}
                className={`rounded px-3 py-1 uf-mono text-[11px] font-medium transition-all ${
                  activeSheetName === sName
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                {sName} ({workbook.sheets[sName]?.rowCount || 0})
              </button>
            ))}
          </div>

          {/* Perspective Sub-tabs */}
          <div className="flex items-center rounded-md border border-slate-800 bg-slate-950 p-1">
            <button
              onClick={() => setActiveTab("GRID")}
              className={`flex items-center gap-1.5 rounded px-3 py-1 uf-mono text-[11px] font-medium transition-all ${
                activeTab === "GRID" ? "bg-slate-800 text-slate-100" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <TableIcon className="h-3.5 w-3.5" /> EXCEL GRID
            </button>
            <button
              onClick={() => setActiveTab("PROFILER")}
              className={`flex items-center gap-1.5 rounded px-3 py-1 uf-mono text-[11px] font-medium transition-all ${
                activeTab === "PROFILER" ? "bg-slate-800 text-slate-100" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <BarChart2 className="h-3.5 w-3.5" /> PROFILER
            </button>
            <button
              onClick={() => setActiveTab("MAPPING")}
              className={`flex items-center gap-1.5 rounded px-3 py-1 uf-mono text-[11px] font-medium transition-all ${
                activeTab === "MAPPING" ? "bg-slate-800 text-slate-100" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" /> COLUMN MAPPING
            </button>
          </div>
        </div>
      </div>

      {/* 2. EXCEL GRID PERSPECTIVE */}
      {activeTab === "GRID" && (
        <div className="flex flex-col gap-3">
          {/* Controls Bar */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search raw Excel cells..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-slate-800 bg-[#070a11] pl-9 pr-4 py-1.5 uf-mono text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3 uf-mono text-[11px] text-slate-400">
              <span>Showing {paginatedRows.length} of {filteredRows.length} rows</span>
              <div className="flex items-center gap-1">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded border border-slate-800 px-2 py-0.5 disabled:opacity-30 hover:bg-slate-800"
                >
                  Prev
                </button>
                <span className="px-1 text-slate-200">{page} / {totalPages}</span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded border border-slate-800 px-2 py-0.5 disabled:opacity-30 hover:bg-slate-800"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Excel Grid Table */}
          <div className="relative max-h-[500px] overflow-auto rounded-lg border border-slate-800 bg-[#060910]">
            <table className="w-full border-collapse text-left uf-mono text-xs">
              <thead className="sticky top-0 z-20 bg-[#0f172a] shadow-md">
                <tr>
                  <th className="w-12 border-b border-r border-slate-800 bg-slate-900 px-3 py-2.5 text-center text-[10px] text-slate-400 font-medium">
                    ROW
                  </th>
                  {currentSheet.headers.map((header) => {
                    const mapping = sheetMappings[header];
                    return (
                      <th
                        key={header}
                        className="border-b border-r border-slate-800 px-3 py-2.5 font-semibold text-slate-200 whitespace-nowrap min-w-[140px]"
                      >
                        <div className="flex flex-col gap-1">
                          <span className="text-slate-100">{header}</span>
                          {mapping && mapping.canonicalField !== "unmapped" ? (
                            <span className="inline-flex items-center gap-1 text-[10px] text-cyan-400 font-normal">
                              → {mapping.canonicalField} ({(mapping.confidence * 100).toFixed(0)}%)
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500 font-normal">Unmapped</span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {paginatedRows.map((row, idx) => (
                  <tr
                    key={idx}
                    className="group transition-colors hover:bg-cyan-500/5 cursor-pointer"
                  >
                    <td className="border-r border-slate-800 bg-slate-900/40 px-3 py-2 text-center text-[10px] text-slate-500 group-hover:text-cyan-400">
                      {row.__rowNum}
                    </td>
                    {currentSheet.headers.map((col) => {
                      const val = row[col] || "";
                      return (
                        <td
                          key={col}
                          onClick={() => setInspectedValue({ row: parseInt(row.__rowNum, 10), col, val })}
                          className="border-r border-slate-800/40 px-3 py-2 text-slate-300 max-w-[240px] truncate group-hover:text-slate-100"
                          title={val}
                        >
                          {val ? (
                            <span>{val}</span>
                          ) : (
                            <span className="text-slate-600 italic">EMPTY</span>
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

      {/* 3. PROFILER PERSPECTIVE */}
      {activeTab === "PROFILER" && sheetProfile && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Column List */}
          <div className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-[#070a11] p-3 max-h-[450px] overflow-y-auto">
            <h4 className="uf-mono text-xs font-semibold uppercase tracking-wider text-slate-400 px-2 py-1">
              Detected Columns ({Object.keys(sheetProfile.columns).length})
            </h4>
            {Object.values(sheetProfile.columns).map((colProf) => (
              <button
                key={colProf.columnName}
                onClick={() => setSelectedColumnForProfiling(colProf.columnName)}
                className={`flex items-center justify-between rounded-md p-2.5 text-left uf-mono text-xs transition-all ${
                  selectedColumnForProfiling === colProf.columnName
                    ? "bg-cyan-500/20 border border-cyan-500/40 text-cyan-300"
                    : "bg-slate-900/60 border border-slate-800/80 text-slate-300 hover:bg-slate-800/60"
                }`}
              >
                <div>
                  <span className="font-medium text-slate-100">{colProf.columnName}</span>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                    <span>{colProf.detectedType}</span>
                    <span>·</span>
                    <span>{colProf.nonNullCount} non-null</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-cyan-400">
                    {colProf.semanticGuess}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Column Profile Inspector Detail */}
          <div className="lg:col-span-2 flex flex-col gap-4 rounded-lg border border-slate-800 bg-[#070a11] p-4">
            {selectedColProfile ? (
              <>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="uf-mono text-base font-semibold text-slate-100">
                      {selectedColProfile.columnName}
                    </h3>
                    <p className="uf-mono text-xs text-cyan-400 mt-0.5">
                      Inferred Semantic: {selectedColProfile.semanticGuess} ({(selectedColProfile.guessConfidence * 100).toFixed(0)}% confidence)
                    </p>
                  </div>
                  <span className="rounded bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 uf-mono text-xs font-semibold text-cyan-300">
                    TYPE: {selectedColProfile.detectedType}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="rounded-md border border-slate-800 bg-slate-900/60 p-3">
                    <span className="uf-mono text-[10px] uppercase text-slate-400">Non-Null</span>
                    <p className="uf-mono text-lg font-semibold text-slate-100 mt-1">
                      {selectedColProfile.nonNullCount} / {selectedColProfile.totalCount}
                    </p>
                  </div>
                  <div className="rounded-md border border-slate-800 bg-slate-900/60 p-3">
                    <span className="uf-mono text-[10px] uppercase text-slate-400">Unique Values</span>
                    <p className="uf-mono text-lg font-semibold text-slate-100 mt-1">
                      {selectedColProfile.uniqueCount}
                    </p>
                  </div>
                  <div className="rounded-md border border-slate-800 bg-slate-900/60 p-3">
                    <span className="uf-mono text-[10px] uppercase text-slate-400">Duplicate Rate</span>
                    <p className="uf-mono text-lg font-semibold text-slate-100 mt-1">
                      {(selectedColProfile.duplicateRate * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="rounded-md border border-slate-800 bg-slate-900/60 p-3">
                    <span className="uf-mono text-[10px] uppercase text-slate-400">Avg String Length</span>
                    <p className="uf-mono text-lg font-semibold text-slate-100 mt-1">
                      {selectedColProfile.avgStringLength} chars
                    </p>
                  </div>
                </div>

                {/* Sample Values */}
                <div className="flex flex-col gap-2 mt-2">
                  <h4 className="uf-mono text-xs font-semibold text-slate-300">Sample Distinct Values</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedColProfile.sampleValues.map((sample, sIdx) => (
                      <span
                        key={sIdx}
                        className="rounded border border-slate-800 bg-slate-900 px-2.5 py-1 uf-mono text-xs text-slate-200"
                      >
                        {sample}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex h-64 items-center justify-center uf-mono text-xs text-slate-500">
                Select a column on the left to inspect detailed profiling telemetry.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. MAPPING PERSPECTIVE */}
      {activeTab === "MAPPING" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="uf-mono text-sm font-semibold text-slate-100">
                Semantic Column Mapping Matrix — Sheet: {activeSheetName}
              </h3>
              <p className="uf-mono text-xs text-slate-400 mt-0.5">
                Map raw Excel column headers to canonical Product DNA fields. Changes automatically re-run the pipeline.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {currentSheet.headers.map((header) => {
              const mapping = sheetMappings[header];
              const currentCanonical = mapping?.canonicalField || "unmapped";

              return (
                <div
                  key={header}
                  className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-[#070a11] p-3.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="uf-mono text-xs font-bold text-slate-100 truncate max-w-[180px]">
                      {header}
                    </span>
                    <span className="rounded bg-cyan-500/10 px-2 py-0.5 uf-mono text-[10px] text-cyan-400">
                      {mapping ? `${(mapping.confidence * 100).toFixed(0)}% Match` : "Unmapped"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <ArrowRight className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                    <select
                      value={currentCanonical}
                      onChange={(e) => forgeStore.updateColumnMapping(activeSheetName, header, e.target.value)}
                      className="w-full rounded border border-slate-700 bg-slate-900 px-2.5 py-1.5 uf-mono text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                    >
                      <option value="unmapped">-- Unmapped (Ignore) --</option>
                      {CANONICAL_FIELDS.map((field) => (
                        <option key={field.key} value={field.key}>
                          {field.label} ({field.key})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Value Inspector Modal */}
      {inspectedValue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-[#0b0f19] p-5 shadow-2xl">
            <h3 className="uf-mono text-sm font-bold text-slate-100">Full Raw Cell Value Inspection</h3>
            <p className="uf-mono text-xs text-slate-400 mt-1">
              Sheet: {activeSheetName} · Row {inspectedValue.row} · Column: {inspectedValue.col}
            </p>
            <div className="mt-4 rounded-lg border border-slate-800 bg-[#05070c] p-3 max-h-60 overflow-y-auto">
              <pre className="uf-mono text-xs text-cyan-300 whitespace-pre-wrap break-all">
                {inspectedValue.val || "<EMPTY CELL>"}
              </pre>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setInspectedValue(null)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-1.5 uf-mono text-xs font-semibold text-slate-200 hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
