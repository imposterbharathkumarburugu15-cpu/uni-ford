import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import {
  useConflicts,
  useProductDna,
  useProducts,
  useSuppliers,
} from "@/hooks/use-forge-store";
import { STAGES } from "@/utils/pipeline";
import { ProductHeader } from "./ProductHeader";
import { VerificationPipeline } from "./VerificationPipeline";
import { ProductRecordRail } from "./ProductRecordRail";
import { DnaStrandVisualizer } from "./DnaStrandVisualizer";
import { EvidenceMatrix } from "./EvidenceMatrix";
import { ConflictInvestigationRail } from "./ConflictInvestigationRail";
import { CommandBar } from "./CommandBar";
import { EvidenceViewer } from "@/components/evidence/EvidenceViewer";

/**
 * PRODUCT DNA — Enterprise Industrial Data Forensics Workspace.
 * Full-width command interface, interactive spec genome visualizer,
 * progressive pipeline illumination, precision horizontal record rail,
 * evidence matrix with interactive lineage, persistent investigation rail,
 * and floating command action strip.
 */

export default function ProductDNA() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const products = useProducts();
  const suppliers = useSuppliers();
  const conflicts = useConflicts();

  const withStructure = products.filter((p) => p.attributes.length > 0);

  // Initialize selected product from URL or default to PRD-0101
  const paramProductId = searchParams.get("product");
  const [selectedId, setSelectedId] = useState<string>(
    paramProductId && withStructure.some((p) => p.id === paramProductId)
      ? paramProductId
      : "PRD-0101",
  );

  // Track highlighted attribute key (e.g. from conflict click)
  const paramAttr = searchParams.get("attr");
  const [highlightedKey, setHighlightedKey] = useState<string | null>(paramAttr);

  // Evidence Viewer Modal State
  const [viewerOpen, setViewerOpen] = useState(false);
  const [activeEvidenceAttr, setActiveEvidenceAttr] = useState<string | undefined>(undefined);

  const selected = withStructure.find((p) => p.id === selectedId) ?? withStructure[0];
  const dna = useProductDna(selected?.id);
  const supplier = suppliers.find((s) => s.id === selected?.supplierId);

  const openConflicts = selected
    ? conflicts.filter((c) => c.productId === selected.id && c.status === "OPEN")
    : [];

  const activeIdx = selected ? STAGES.findIndex((s) => s.stage === selected.stage) : 4;
  const review = openConflicts.length > 0;

  // Handle product selection
  const handleSelectProduct = (productId: string) => {
    setSelectedId(productId);
    setHighlightedKey(null);
    setSearchParams({ product: productId });
  };

  // Handle focusing attribute
  const handleFocusAttribute = (attributeKey: string) => {
    setHighlightedKey(attributeKey);
  };

  // Handle opening evidence viewer
  const handleOpenEvidence = (attributeKey: string) => {
    setActiveEvidenceAttr(attributeKey);
    setViewerOpen(true);
  };

  // Handle opening conflict resolution
  const handleOpenConflict = (conflictId: string) => {
    navigate(`/resolve?conflict=${conflictId}`);
  };

  // All DNA records for the rail
  const allDna = withStructure.map((p) => ({
    productId: p.id,
    mpn: p.mpn,
    name: p.name,
    category: p.category,
    verifiedCount: p.attributes.filter((a) => a.verification === "VERIFIED").length,
    totalCount: p.attributes.length,
    confidence: p.confidence,
    attributes: [],
    revision: p.revision,
    lastVerifiedAt: p.updatedAt,
  }));

  return (
    <div className="relative -mx-4 -my-6 flex min-h-screen flex-col bg-[var(--uf-bg)] px-4 py-4 uf-grid-bg md:-mx-6 md:px-6 lg:-mx-8 lg:px-8">
      {/* Subtle Engineering Grid Line Ambient Wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[600px] opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 65% 50% at 50% 0%, rgba(55,199,234,0.08), transparent 75%)",
        }}
      />

      <div className="relative z-10 flex flex-col gap-4">
        {/* 1. Full-Width Engineering Passport & Telemetry Header */}
        {dna && selected && (
          <ProductHeader
            product={selected}
            dna={dna}
            supplier={supplier}
            openConflictsCount={openConflicts.length}
          />
        )}

        {/* 2. Horizontal Process Pipeline Rail */}
        {selected && (
          <VerificationPipeline
            activeIdx={activeIdx >= 0 ? activeIdx : 4}
            review={review}
          />
        )}

        {/* 3. Horizontal Technical Record Selector Rail */}
        <ProductRecordRail
          products={withStructure}
          allDna={allDna}
          selectedId={selectedId}
          onSelect={handleSelectProduct}
          conflicts={conflicts}
        />

        {/* 4. Interactive Spec Genome & DNA Strand Visualizer */}
        {dna && (
          <DnaStrandVisualizer
            dna={dna}
            conflicts={conflicts}
            highlightedKey={highlightedKey}
            onSelectAttribute={handleFocusAttribute}
          />
        )}

        {/* 5. Main 2-Column Forensic Workspace */}
        <main className="relative mt-2 flex-1">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            {/* Main Left Column: Evidence Forensics Matrix */}
            <div className="min-w-0 flex-1">
              {dna ? (
                <EvidenceMatrix
                  attributes={dna.attributes}
                  conflicts={openConflicts}
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

            {/* Right Column: Narrow Persistent Investigation Rail */}
            {dna && (
              <ConflictInvestigationRail
                dna={dna}
                conflicts={conflicts}
                onFocusAttribute={handleFocusAttribute}
              />
            )}
          </div>
        </main>
      </div>

      {/* 6. Sticky Bottom Technical Command Bar */}
      {dna && <CommandBar dna={dna} />}

      {/* Evidence Viewer Forensics Modal */}
      {selected && (
        <EvidenceViewer
          open={viewerOpen}
          onOpenChange={setViewerOpen}
          productId={selected.id}
          attributeKey={activeEvidenceAttr}
        />
      )}
    </div>
  );
}
