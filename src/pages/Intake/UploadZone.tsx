import { CloudDownload, FilePlus2, X, Sparkles } from "lucide-react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { forgeStore } from "@/store/forgeStore";
import { generateSampleIndustrialWorkbook } from "@/data/sample/industrialSampleWorkbook";
import type { SourceType } from "@/types/domain";

const SOURCE_TYPES: SourceType[] = [
  "CATALOGUE",
  "DATASHEET",
  "SPECIFICATION",
  "MATERIAL_GUIDE",
  "PRICEBOOK",
  "SAFETY_SHEET",
  "BOM",
];

interface UploadZoneProps {
  suppliers: Array<{ id: string; name: string; code: string }>;
  onQueued: (count: number) => void;
}

const CLIP = "polygon(14px 0, calc(100% - 14px) 0, 100% 14px, 100% calc(100% - 14px), calc(100% - 14px) 100%, 14px 100%, 0 calc(100% - 14px), 0 14px)";

export function UploadZone({ suppliers, onQueued }: UploadZoneProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id ?? "EXCEL_SOURCE");
  const [sourceType, setSourceType] = useState<SourceType>("CATALOGUE");
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const rawFiles = Array.from(list);
    setFiles((prev) => [...prev, ...rawFiles]);

    // If an Excel file is added, immediately process it through the real pipeline!
    const excelFile = rawFiles.find(
      (f) => f.name.endsWith(".xlsx") || f.name.endsWith(".xls") || f.name.endsWith(".csv"),
    );
    if (excelFile) {
      toast.info(`Ingesting ${excelFile.name} through UNIFORGE pipeline...`);
      forgeStore.ingestExcelWorkbook(excelFile);
      onQueued(1);
      navigate("/product-dna");
    }
  };

  const openPicker = () => inputRef.current?.click();

  const handleQueue = async () => {
    if (files.length === 0 || submitting) return;
    setSubmitting(true);
    const firstFile = files[0];
    await forgeStore.ingestExcelWorkbook(firstFile);
    setSubmitting(false);
    onQueued(files.length);
    toast.success(`${files.length} Excel file ingested into Product DNA`);
    navigate("/product-dna");
  };

  const handleSample = async () => {
    if (submitting) return;
    setSubmitting(true);
    const sampleBuffer = generateSampleIndustrialWorkbook();
    await forgeStore.ingestExcelWorkbook(sampleBuffer, "enterprise_supplier_catalog.xlsx");
    setSubmitting(false);
    onQueued(1);
    toast.success("Enterprise sample Excel ingested — Product DNA Ready");
    navigate("/product-dna");
  };

  const borderGlow = dragging
    ? "linear-gradient(135deg, rgba(55,199,234,0.9), rgba(55,199,234,0.35))"
    : "linear-gradient(135deg, rgba(55,199,234,0.45), rgba(55,199,234,0.12))";

  return (
    <div>
      <div className="relative">
        {/* glowing angled intake port */}
        <div className="relative">
          <div
            className="p-px"
            style={{
              clipPath: CLIP,
              background: borderGlow,
              boxShadow: dragging
                ? "0 0 34px rgba(55,199,234,0.28)"
                : "0 0 22px rgba(55,199,234,0.1)",
            }}
          >
            <div
              className="flex min-h-[300px] flex-col items-center justify-center px-6 py-8 text-center transition-colors"
              style={{
                clipPath: CLIP,
                background: dragging
                  ? "rgba(55,199,234,0.06)"
                  : "var(--uf-bg-raised)",
              }}
              onClick={openPicker}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                addFiles(e.dataTransfer.files);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") openPicker();
              }}
              aria-label="Drop supplier catalogues or click to browse"
            >
              <span className="uf-mono flex items-center gap-2 text-[9.5px] uppercase tracking-[0.16em] text-[var(--uf-text-tertiary)]">
                <span className="h-px w-6 bg-[var(--uf-accent-line)]" aria-hidden />
                Intake port · stage 01
                <span className="h-px w-6 bg-[var(--uf-accent-line)]" aria-hidden />
              </span>

              <CloudDownload
                className={`mt-6 size-9 transition-transform ${dragging ? "scale-110" : ""}`}
                style={{ color: dragging ? "var(--uf-accent-bright)" : "var(--uf-accent)" }}
                aria-hidden
              />
              <p className="mt-4 text-[22px] font-bold uppercase tracking-[0.02em] text-[var(--uf-text-primary)]">
                Drop Excel Workbook
              </p>
              <p className="uf-mono mt-1.5 text-[10.5px] uppercase tracking-[0.18em] text-[var(--uf-text-tertiary)]">
                XLSX / XLS / CSV (Real Data Pipeline)
              </p>

              <Button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openPicker();
                }}
                className="uf-mono mt-7 h-9 rounded-full border border-[var(--uf-accent-line)] bg-[var(--uf-accent-dim)] px-6 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[var(--uf-accent)] shadow-[0_0_18px_rgba(55,199,234,0.18)] transition-colors hover:bg-[var(--uf-accent)] hover:text-[var(--uf-primary-foreground)]"
              >
                Select Excel File
              </Button>
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                className="sr-only"
                onChange={(e) => addFiles(e.target.files)}
              />

              {files.length > 0 && (
                <div className="mt-6 w-full max-w-md border-t border-[var(--uf-border-faint)] pt-4">
                  <p className="uf-mono mb-2 text-left text-[9px] uppercase tracking-[0.14em] text-[var(--uf-text-tertiary)]">
                    Pending ({files.length})
                  </p>
                  <ul className="flex flex-wrap justify-center gap-1.5">
                    {files.map((f, i) => (
                      <li
                        key={`${f.name}-${i}`}
                        className="flex items-center gap-1.5 rounded-sm border border-[var(--uf-border)] bg-[var(--uf-surface)] px-2 py-1"
                      >
                        <span className="uf-mono max-w-[180px] truncate text-[10px] text-[var(--uf-text-secondary)]">
                          {f.name}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFiles((prev) => prev.filter((_, idx) => idx !== i));
                          }}
                          className="text-[var(--uf-text-tertiary)] transition-colors hover:text-[var(--uf-critical)]"
                        >
                          <X className="size-3" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* USE SAMPLE DATA */}
        <div className="mt-4 flex items-center gap-4">
          <button
            type="button"
            onClick={handleSample}
            disabled={submitting}
            className="uf-mono flex items-center gap-2 rounded-full border border-[var(--uf-border-strong)] bg-[var(--uf-surface)] px-5 py-2 text-[10.5px] uppercase tracking-[0.14em] text-[var(--uf-accent)] transition-colors hover:border-[var(--uf-accent-line)] hover:bg-[rgba(55,199,234,0.1)] disabled:opacity-50"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Use Enterprise Sample Excel
          </button>
          <span className="uf-mono hidden text-[9px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)] md:block">
            Parses multi-sheet industrial catalog through the real pipeline
          </span>
        </div>
      </div>

      {/* Configuration bar */}
      <div className="mt-5 grid gap-3 rounded-sm border border-[var(--uf-border-faint)] bg-[var(--uf-bg-deep)] p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div>
          <label className="uf-mono mb-1.5 block text-[9px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
            Supplier
          </label>
          <Select value={supplierId} onValueChange={setSupplierId}>
            <SelectTrigger className="h-8 w-full rounded-sm border-[var(--uf-border)] bg-[var(--uf-surface)] text-[11px] text-[var(--uf-text-primary)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-[var(--uf-border-strong)] bg-[var(--uf-surface-raised)] text-[var(--uf-text-primary)]">
              {suppliers.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name} · {s.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="uf-mono mb-1.5 block text-[9px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
            Source type
          </label>
          <Select value={sourceType} onValueChange={(v) => setSourceType(v as SourceType)}>
            <SelectTrigger className="h-8 w-full rounded-sm border-[var(--uf-border)] bg-[var(--uf-surface)] text-[11px] text-[var(--uf-text-primary)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-[var(--uf-border-strong)] bg-[var(--uf-surface-raised)] text-[var(--uf-text-primary)]">
              {SOURCE_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          type="button"
          onClick={handleQueue}
          disabled={files.length === 0 || submitting}
          className="h-8 rounded-sm bg-[var(--uf-accent)] px-4 text-[11px] font-semibold text-[var(--uf-primary-foreground)] hover:bg-[var(--uf-accent-bright)] disabled:opacity-40"
        >
          <FilePlus2 className="size-3.5" aria-hidden />
          {submitting ? "Processing Pipeline…" : `Ingest ${files.length} Excel File`}
        </Button>
      </div>
    </div>
  );
}
