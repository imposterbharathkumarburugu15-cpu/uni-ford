import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import {
  useActiveSheetName,
  useActiveViewMode,
  useActiveWorkbook,
  useCanonicalDnaList,
  useConflicts,
  useIsProcessingPipeline,
  useProcessingStepMessage,
  useProducts,
  useSuppliers,
} from "@/hooks/use-forge-store";
import { forgeStore, type ViewMode } from "@/store/forgeStore";
import { STAGES } from "@/utils/pipeline";
import { generateSampleIndustrialWorkbook } from "@/data/sample/industrialSampleWorkbook";
import { ProductHeader } from "./ProductHeader";
import { VerificationPipeline } from "./VerificationPipeline";
import { ProductRecordRail } from "./ProductRecordRail";
import { DnaStrandVisualizer } from "./DnaStrandVisualizer";
import { EvidenceMatrix } from "./EvidenceMatrix";
import { ConflictInvestigationRail } from "./ConflictInvestigationRail";
import { CommandBar } from "./CommandBar";
import { SourceDataWorkspace } from "./SourceDataWorkspace";
import { NormalizedWorkspace } from "./NormalizedWorkspace";
import { EnrichedWorkspace } from "./EnrichedWorkspace";
import { UnilogWorkspace } from "./UnilogWorkspace";
import { LineageModal } from "./LineageModal";
import { ExportModal } from "./ExportModal";
import { EvidenceViewer } from "@/components/evidence/EvidenceViewer";
import type { ProductDna } from "@/types/domain";
import {
  FileSpreadsheet,
  Upload,
  Sparkles,
  Layers,
  CheckCircle2,
  Table as TableIcon,
  Cpu,
  Download,
  RefreshCw,
} from "lucide-react";

export default function ProductDNA() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const workbook = useActiveWorkbook();
  const isProcessing = useIsProcessingPipeline();
  const processingMsg = useProcessingStepMessage();
  const canonicalDnaList = useCanonicalDnaList();
  const activeViewMode = useActiveViewMode();

  const products = useProducts();
  const suppliers = useSuppliers();
  const conflicts = useConflicts();

  // Selection
  const paramProductId = searchParams.get("product");
  const [selectedId, setSelectedId] = useState<string>(
    paramProductId && canonicalDnaList.some((d) => d.productId === paramProductId)
      ? paramProductId
      : canonicalDnaList[0]?.productId || "",
  );

  const selectedDna = canonicalDnaList.find((d) => d.productId === selectedId) || canonicalDnaList[0];
  const selectedProduct = products.find((p) => p.id === selectedDna?.productId);

  const paramAttr = searchParams.get("attr");
  const [highlightedKey, setHighlightedKey] = useState<string | null>(paramAttr);

  // Modal States
  const [viewerOpen, setViewerOpen] = useState(false);
  const [activeEvidenceAttr, setActiveEvidenceAttr] = useState<string | undefined>(undefined);
  const [lineageAttr, setLineageAttr] = useState<{
    productId: string;
    key: string;
    label: string;
    canonicalValue: string;
    originalValue: string;
    sourceFile: string;
    sourceSheet: string;
    sourceRow: number;
    sourceCol: string;
    confidence: number;
    verificationStatus: string;
    enrichmentState: string;
  } | null>(null);
  const [exportOpen, setExportOpen] = useState(false);

  // File Upload Handler
  const handleFileUpload = (file: File) => {
    forgeStore.ingestExcelWorkbook(file);
  };

  const handleLoadSampleWorkbook = () => {
    const buffer = generateSampleIndustrialWorkbook();
    forgeStore.ingestExcelWorkbook(buffer, "enterprise_supplier_catalog.xlsx");
  };

  const activeIdx = selectedProduct ? STAGES.findIndex((s) => s.stage === selectedProduct.stage) : 4;
  const review = conflicts.some((c) => c.status === "OPEN");

  // Handle product selection
  const handleSelectProduct = (productId: string) => {
    setSelectedId(productId);
    setHighlightedKey(null);
    setSearchParams({ product: productId });
  };

  const handleFocusAttribute = (attributeKey: string) => {
    setHighlightedKey(attributeKey);
  };

  const handleOpenEvidence = (attributeKey: string) => {
    setActiveEvidenceAttr(attributeKey);
    setViewerOpen(true);
  };

  const handleOpenConflict = (conflictId: string) => {
    navigate(`/resolve?conflict=${conflictId}`);
  };

  // ------------------------------------------------------------
  // STATE 1: NO SOURCE DATA SCREEN (No hardcoded mock data!)
  // ------------------------------------------------------------
  if (!workbook && !isProcessing) {
    return (
      <div className="relative -mx-4 -my-6 flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-[var(--uf-bg)] px-4 py-12 uf-grid-bg">
        <div className="relative z-10 flex max-w-2xl flex-col items-center text-center">
          {/* Neon Icon */}
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 shadow-[0_0_30px_rgba(55,199,234,0.2)]">
            <FileSpreadsheet className="h-8 w-8" />
          </div>

          <h2 className="mt-6 uf-mono text-2xl font-extrabold tracking-tight text-slate-100 sm:text-3xl">
            NO SOURCE DATA
          </h2>
          <p className="mt-2 text-sm text-slate-400 max-w-md uf-mono">
            Upload an Excel workbook to generate canonical Product DNA. The system never uses mock or demo data.
          </p>

          {/* Upload Dropzone */}
          <div className="mt-8 w-full rounded-2xl border-2 border-dashed border-slate-800 bg-[#070a11] p-8 transition-colors hover:border-cyan-500/50">
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              id="excel-upload"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
            />
            <label
              htmlFor="excel-upload"
              className="flex flex-col items-center justify-center cursor-pointer"
            >
              <Upload className="h-10 w-10 text-cyan-400 animate-bounce" />
              <span className="mt-3 uf-mono text-sm font-bold text-slate-200">
                Click to browse or drag & drop Excel workbook
              </span>
              <span className="mt-1 uf-mono text-xs text-slate-500">
                Supports .xlsx, .xls, .csv · All sheets & rows preserved
              </span>
            </label>
          </div>

          {/* Load Sample Workbook Button */}
          <div className="mt-6 flex flex-col items-center gap-3">
            <span className="uf-mono text-xs text-slate-500 uppercase tracking-widest">— OR —</span>
            <button
              onClick={handleLoadSampleWorkbook}
              className="flex items-center gap-2.5 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-6 py-3 uf-mono text-xs font-bold uppercase tracking-wider text-cyan-300 shadow-[0_0_20px_rgba(55,199,234,0.15)] transition-all hover:bg-cyan-500/20 hover:scale-105"
            >
              <Sparkles className="h-4 w-4" /> Load Enterprise Industrial Sample (.xlsx)
            </button>
            <span className="uf-mono text-[11px] text-slate-500">
              Parses a multi-sheet industrial catalog through the real pipeline
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------
  // STATE 2: PIPELINE PROCESSING LOADER
  // ------------------------------------------------------------
  if (isProcessing) {
    return (
      <div className="relative -mx-4 -my-6 flex min-h-screen flex-col items-center justify-center bg-[var(--uf-bg)] px-4 uf-grid-bg">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-800 bg-[#090d16] p-8 text-center shadow-2xl">
          <RefreshCw className="h-10 w-10 animate-spin text-cyan-400" />
          <h3 className="uf-mono text-base font-bold text-slate-100">
            PROCESSING ENTERPRISE PIPELINE
          </h3>
          <p className="uf-mono text-xs text-cyan-400 font-semibold max-w-sm">
            {processingMsg}
          </p>
        </div>
      </div>
    );
  }

  // Map legacy ProductDna type for DnaStrandVisualizer & ProductHeader
  const legacyDna: ProductDna | undefined = selectedDna
    ? {
        productId: selectedDna.productId,
        mpn: selectedDna.mpn,
        name: selectedDna.name,
        category: selectedDna.category,
        verifiedCount: selectedDna.verifiedCount,
        totalCount: selectedDna.totalCount,
        confidence: selectedDna.confidence,
        revision: selectedDna.revision,
        lastVerifiedAt: selectedDna.lastVerifiedAt,
        attributes: selectedDna.attributes.map((a) => ({
          attribute: {
            key: a.key,
            label: a.label,
            value: a.canonicalValue,
            rawValues: [a.originalValue],
            confidence: a.confidence,
            verification: (a.verificationState === "CONFLICT" ? "CONFLICT" : a.verificationState === "VERIFIED" ? "VERIFIED" : "UNVERIFIED") as any,
            evidenceIds: [],
          },
          sources: a.provenance.map((p) => ({
            document: p.document,
            supplier: p.sheet,
            value: p.value,
            pageRef: `Row ${p.row}`,
            confidence: p.confidence,
            agreement: p.agreement,
          })),
        })),
      }
    : undefined;

  const allLegacyDna: ProductDna[] = canonicalDnaList.map((d) => ({
    productId: d.productId,
    mpn: d.mpn,
    name: d.name,
    category: d.category,
    verifiedCount: d.verifiedCount,
    totalCount: d.totalCount,
    confidence: d.confidence,
    attributes: [],
    revision: d.revision,
    lastVerifiedAt: d.lastVerifiedAt,
  }));

  const openConflictsForSelected = selectedDna
    ? conflicts.filter((c) => c.productId === selectedDna.productId && c.status === "OPEN")
    : [];

  return (
    <div className="relative -mx-4 -my-6 flex min-h-screen flex-col bg-[var(--uf-bg)] px-4 py-4 uf-grid-bg md:-mx-6 md:px-6 lg:-mx-8 lg:px-8">
      {/* Background Glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[600px] opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 65% 50% at 50% 0%, rgba(55,199,234,0.08), transparent 75%)",
        }}
      />

      <div className="relative z-10 flex flex-col gap-4">
        {/* 1. Header Bar with Mode Switcher & Export Trigger */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800 bg-[#090d16] p-3.5 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h2 className="uf-mono text-sm font-bold text-slate-100">
                UNIFORGE INDUSTRIAL INTELLIGENCE CONSOLE
              </h2>
              <p className="uf-mono text-[11px] text-slate-400">
                Source: <span className="text-cyan-400 font-semibold">{workbook?.filename}</span> · {canonicalDnaList.length} Canonical Records
              </p>
            </div>
          </div>

          {/* Perspective Mode Switcher */}
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-slate-800 bg-[#05070c] p-1">
              <button
                onClick={() => forgeStore.setActiveViewMode("SOURCE")}
                className={`flex items-center gap-1.5 rounded px-3 py-1.5 uf-mono text-xs font-semibold transition-all ${
                  activeViewMode === "SOURCE"
                    ? "bg-slate-800 text-slate-100 shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <TableIcon className="h-3.5 w-3.5" /> 01 SOURCE
              </button>
              <button
                onClick={() => forgeStore.setActiveViewMode("NORMALIZED")}
                className={`flex items-center gap-1.5 rounded px-3 py-1.5 uf-mono text-xs font-semibold transition-all ${
                  activeViewMode === "NORMALIZED"
                    ? "bg-slate-800 text-slate-100 shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Layers className="h-3.5 w-3.5" /> 02 NORMALIZED
              </button>
              <button
                onClick={() => forgeStore.setActiveViewMode("ENRICHED")}
                className={`flex items-center gap-1.5 rounded px-3 py-1.5 uf-mono text-xs font-semibold transition-all ${
                  activeViewMode === "ENRICHED"
                    ? "bg-slate-800 text-slate-100 shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" /> 03 ENRICHED
              </button>
              <button
                onClick={() => forgeStore.setActiveViewMode("PRODUCT_DNA")}
                className={`flex items-center gap-1.5 rounded px-3 py-1.5 uf-mono text-xs font-semibold transition-all ${
                  activeViewMode === "PRODUCT_DNA"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> 04 PRODUCT DNA
              </button>
              <button
                onClick={() => forgeStore.setActiveViewMode("UNILOG" as any)}
                className={`flex items-center gap-1.5 rounded px-3 py-1.5 uf-mono text-xs font-semibold transition-all ${
                  (activeViewMode as string) === "UNILOG"
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 text-purple-400" /> 05 UNILOG ENGINE
              </button>
            </div>

            <button
              onClick={() => setExportOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 uf-mono text-xs font-bold text-emerald-300 hover:bg-emerald-500/20"
            >
              <Download className="h-4 w-4" /> EXPORT
            </button>
          </div>
        </div>

        {/* 2. Interactive Pipeline Header Bar */}
        <VerificationPipeline
          activeIdx={activeIdx >= 0 ? activeIdx : 4}
          review={review}
        />

        {/* 3. PERSPECTIVE RENDERING */}
        {activeViewMode === "SOURCE" && <SourceDataWorkspace />}
        {activeViewMode === "NORMALIZED" && <NormalizedWorkspace />}
        {activeViewMode === "ENRICHED" && <EnrichedWorkspace />}
        {(activeViewMode as string) === "UNILOG" && <UnilogWorkspace />}

        {activeViewMode === "PRODUCT_DNA" && (
          <>
            {/* Record Rail */}
            <ProductRecordRail
              products={products}
              allDna={allLegacyDna}
              selectedId={selectedDna?.productId || ""}
              onSelect={handleSelectProduct}
              conflicts={conflicts}
            />

            {/* Passport Header */}
            {legacyDna && selectedProduct && (
              <ProductHeader
                product={selectedProduct}
                dna={legacyDna}
                supplier={suppliers.find((s) => s.id === selectedProduct.supplierId)}
                openConflictsCount={openConflictsForSelected.length}
              />
            )}

            {/* DNA Strand Visualizer */}
            {legacyDna && (
              <DnaStrandVisualizer
                dna={legacyDna}
                conflicts={conflicts}
                highlightedKey={highlightedKey}
                onSelectAttribute={handleFocusAttribute}
              />
            )}

            {/* Forensic Matrix Workspace */}
            <main className="relative mt-2 flex-1">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                <div className="min-w-0 flex-1">
                  {legacyDna ? (
                    <EvidenceMatrix
                      attributes={legacyDna.attributes}
                      conflicts={openConflictsForSelected}
                      highlightedKey={highlightedKey}
                      onSelectEvidence={handleOpenEvidence}
                      onOpenConflict={handleOpenConflict}
                    />
                  ) : (
                    <div className="flex h-64 items-center justify-center rounded-2xl border border-[var(--uf-border-faint)] bg-[var(--uf-surface)] uf-mono text-[11px] uppercase tracking-widest text-[var(--uf-text-tertiary)]">
                      SELECTING CANONICAL RECORD…
                    </div>
                  )}
                </div>

                {legacyDna && (
                  <ConflictInvestigationRail
                    dna={legacyDna}
                    conflicts={conflicts}
                    onFocusAttribute={handleFocusAttribute}
                  />
                )}
              </div>
            </main>
          </>
        )}
      </div>

      {/* Command Bar */}
      {legacyDna && activeViewMode === "PRODUCT_DNA" && <CommandBar dna={legacyDna} />}

      {/* Modals */}
      {selectedProduct && (
        <EvidenceViewer
          open={viewerOpen}
          onOpenChange={setViewerOpen}
          productId={selectedProduct.id}
          attributeKey={activeEvidenceAttr}
        />
      )}

      {lineageAttr && (
        <LineageModal
          isOpen={!!lineageAttr}
          onClose={() => setLineageAttr(null)}
          productId={lineageAttr.productId}
          attributeKey={lineageAttr.key}
          attributeLabel={lineageAttr.label}
          canonicalValue={lineageAttr.canonicalValue}
          originalValue={lineageAttr.originalValue}
          sourceFile={lineageAttr.sourceFile}
          sourceSheet={lineageAttr.sourceSheet}
          sourceRow={lineageAttr.sourceRow}
          sourceCol={lineageAttr.sourceCol}
          confidence={lineageAttr.confidence}
          verificationStatus={lineageAttr.verificationStatus}
          enrichmentState={lineageAttr.enrichmentState}
        />
      )}

      <ExportModal isOpen={exportOpen} onClose={() => setExportOpen(false)} />
    </div>
  );
}
