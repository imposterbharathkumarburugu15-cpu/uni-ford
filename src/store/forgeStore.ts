import { createInitialState } from "@/data/mock";
import { parseExcelWorkbook, type ParsedSheet, type ParsedWorkbook } from "@/ingestion/excelParser";
import { profileWorkbook, type WorkbookProfile } from "@/ingestion/workbookProfiler";
import { generateColumnMappings, type ColumnMapping } from "@/mapping/columnMapper";
import { normalizeSheetRows, type NormalizedRecord } from "@/normalization/valueNormalizer";
import { resolveEntities, type ResolvedEntityCluster } from "@/entity/entityResolver";
import { extractProductAttributes, type ExtractedProductAttributes } from "@/extraction/attributeExtractor";
import { defaultEnrichmentEngine, type EnrichedProductRecord } from "@/enrichment/enrichmentEngine";
import { detectAttributeConflicts, type DetectedConflict } from "@/validation/conflictDetector";
import { buildCanonicalProductDNA, type CanonicalProductDNA } from "@/canonical/productDNAService";
import type {
  ActivityEvent,
  Conflict,
  ConflictSource,
  Evidence,
  ForgeState,
  PipelineStage,
  Product,
  ProductAttribute,
  Resolution,
  ResolutionMode,
  Shipment,
  ShipmentDestination,
  SourceDocument,
  SourceType,
} from "@/types/domain";
import { productConfidence, recomputeStatus } from "@/utils/pipeline";

type Listener = () => void;
type Recipe = (s: ForgeState) => ForgeState;

export type ViewMode = "SOURCE" | "NORMALIZED" | "ENRICHED" | "PRODUCT_DNA";

export type PipelineStepState =
  | "NO_DATA"
  | "UPLOADED"
  | "INGESTING"
  | "PROFILED"
  | "NORMALIZING"
  | "CLASSIFYING"
  | "EXTRACTING"
  | "ENRICHING"
  | "VALIDATING"
  | "CONFLICT_DETECTED"
  | "REVIEW_REQUIRED"
  | "CANONICALIZED"
  | "EXPORTED";

function isoNow(): string {
  return new Date().toISOString();
}

class ForgeStore {
  private state: ForgeState;
  private listeners = new Set<Listener>();

  // Real Ingestion & Pipeline State
  private activeWorkbook: ParsedWorkbook | null = null;
  private rawWorkbookBuffer: File | ArrayBuffer | null = null;
  private workbookProfile: WorkbookProfile | null = null;
  private sheetMappings: Record<string, Record<string, ColumnMapping>> = {}; // sheetName -> colName -> mapping
  private normalizedRecords: NormalizedRecord[] = [];
  private resolvedEntities: ResolvedEntityCluster[] = [];
  private extractedAttributes: ExtractedProductAttributes[] = [];
  private enrichedProducts: EnrichedProductRecord[] = [];
  private canonicalDnaList: CanonicalProductDNA[] = [];
  private detectedConflictsList: DetectedConflict[] = [];

  private activeSheetName = "";
  private activeViewMode: ViewMode = "PRODUCT_DNA";
  private pipelineStepState: PipelineStepState = "NO_DATA";
  private isProcessingPipeline = false;
  private processingStepMessage = "";

  constructor() {
    this.state = createInitialState();
  }

  getState = (): ForgeState => this.state;

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private commit(recipe: Recipe): void {
    this.state = recipe(this.state);
    this.listeners.forEach((l) => l());
  }

  private recordActivity(event: Omit<ActivityEvent, "id" | "timestamp">): void {
    const id = `ACT-${String(Date.now()).slice(-6)}`;
    this.commit((s) => ({
      ...s,
      activity: [{ ...event, id, timestamp: isoNow() }, ...s.activity],
    }));
  }

  // Getters for Real Ingestion Pipeline State
  getActiveWorkbook = (): ParsedWorkbook | null => this.activeWorkbook;
  getWorkbookProfile = (): WorkbookProfile | null => this.workbookProfile;
  getSheetMappings = (sheetName?: string): Record<string, ColumnMapping> => {
    const sName = sheetName || this.activeSheetName;
    return this.sheetMappings[sName] || {};
  };
  getNormalizedRecords = (): NormalizedRecord[] => this.normalizedRecords;
  getResolvedEntities = (): ResolvedEntityCluster[] => this.resolvedEntities;
  getExtractedAttributes = (): ExtractedProductAttributes[] => this.extractedAttributes;
  getEnrichedProducts = (): EnrichedProductRecord[] => this.enrichedProducts;
  getCanonicalDnaList = (): CanonicalProductDNA[] => this.canonicalDnaList;
  getDetectedConflicts = (): DetectedConflict[] => this.detectedConflictsList;
  getActiveSheetName = (): string => this.activeSheetName;
  getActiveViewMode = (): ViewMode => this.activeViewMode;
  getPipelineStepState = (): PipelineStepState => this.pipelineStepState;
  getIsProcessingPipeline = (): boolean => this.isProcessingPipeline;
  getProcessingStepMessage = (): string => this.processingStepMessage;

  setActiveSheetName(sheetName: string): void {
    this.activeSheetName = sheetName;
    this.commit((s) => s);
  }

  setActiveViewMode(mode: ViewMode): void {
    this.activeViewMode = mode;
    this.commit((s) => s);
  }

  /**
   * Primary Entry Point: Load and process an Excel file or Buffer through the real pipeline!
   */
  async ingestExcelWorkbook(fileOrBuffer: File | ArrayBuffer, filename?: string): Promise<void> {
    try {
      this.rawWorkbookBuffer = fileOrBuffer;
      this.isProcessingPipeline = true;
      this.processingStepMessage = "INGESTING WORKBOOK — Reading sheets & preserving raw cell matrix...";
      this.pipelineStepState = "INGESTING";
      this.commit((s) => s);

      // Step 1: Parse Excel workbook
      const parsedWb = await parseExcelWorkbook(fileOrBuffer, filename);
      this.activeWorkbook = parsedWb;
      this.activeSheetName = parsedWb.sheetNames[0] || "";

      // Step 2: Profile workbook
      this.processingStepMessage = "PROFILING DATA — Analyzing column data types, duplicates & semantic meaning...";
      this.pipelineStepState = "PROFILED";
      this.commit((s) => s);

      const profile = profileWorkbook(parsedWb);
      this.workbookProfile = profile;

      // Step 3: Column Mapping
      this.processingStepMessage = "MAPPING FIELDS — Matching Excel columns to canonical attributes...";
      const newMappings: Record<string, Record<string, ColumnMapping>> = {};

      parsedWb.sheetNames.forEach((sName) => {
        const sheet = parsedWb.sheets[sName];
        const sProfile = profile.sheets[sName];
        if (!sheet || !sProfile) return;

        const guesses: Record<string, any> = {};
        Object.entries(sProfile.columns).forEach(([col, cProf]) => {
          guesses[col] = cProf.semanticGuess;
        });

        // Preserve manual overrides if already present
        const existingForSheet = this.sheetMappings[sName] || {};
        const generated = generateColumnMappings(sName, sheet.headers, guesses);

        Object.keys(generated).forEach((col) => {
          if (existingForSheet[col] && existingForSheet[col].isUserOverridden) {
            generated[col] = existingForSheet[col];
          }
        });

        newMappings[sName] = generated;
      });
      this.sheetMappings = newMappings;

      // Step 4: Normalize Records
      this.processingStepMessage = "NORMALIZING — Standardizing casing, whitespace & measurement units...";
      this.pipelineStepState = "NORMALIZING";
      this.commit((s) => s);

      let allNormRecords: NormalizedRecord[] = [];
      parsedWb.sheetNames.forEach((sName) => {
        const sheet = parsedWb.sheets[sName];
        const mappings = newMappings[sName] || {};
        if (sheet && sheet.rows.length > 0) {
          const norm = normalizeSheetRows(sName, sheet.rows, mappings);
          allNormRecords = allNormRecords.concat(norm);
        }
      });
      this.normalizedRecords = allNormRecords;

      // Step 5: Entity Resolution
      this.processingStepMessage = "ENTITY RESOLUTION — Clustering matched source rows into product entities...";
      this.pipelineStepState = "CLASSIFYING";
      this.commit((s) => s);

      const clusters = resolveEntities(allNormRecords);
      this.resolvedEntities = clusters;

      // Step 6: Attribute Extraction
      this.processingStepMessage = "ATTRIBUTES — Dynamically extracting spec attributes & provenance...";
      this.pipelineStepState = "EXTRACTING";
      this.commit((s) => s);

      const extracted = extractProductAttributes(parsedWb.filename, clusters);
      this.extractedAttributes = extracted;

      // Step 7: Modular Enrichment
      this.processingStepMessage = "ENRICHING — Querying reference data & industrial taxonomy providers...";
      this.pipelineStepState = "ENRICHING";
      this.commit((s) => s);

      const enriched = await defaultEnrichmentEngine.enrichProducts(extracted);
      this.enrichedProducts = enriched;

      // Step 8: Validation & Conflict Detection
      this.processingStepMessage = "VALIDATING — Computing confidence & scanning for value conflicts...";
      this.pipelineStepState = "VALIDATING";
      this.commit((s) => s);

      const allDetectedConflicts: DetectedConflict[] = [];
      extracted.forEach((item) => {
        const itemConflicts = detectAttributeConflicts(item.entityId, item.attributes);
        allDetectedConflicts.push(...itemConflicts);
      });
      this.detectedConflictsList = allDetectedConflicts;

      // Convert to domain Conflict format for compatibility
      const domainConflicts: Conflict[] = allDetectedConflicts.map((dc) => ({
        id: dc.id,
        productId: dc.entityId,
        attributeKey: dc.attributeKey,
        attributeLabel: dc.attributeLabel,
        sources: dc.sources.map((s) => ({
          evidenceId: s.evidenceId,
          supplier: s.sourceFile,
          document: `${s.sheet} (Row ${s.row}, Col ${s.col})`,
          value: s.value,
          confidence: s.confidence,
        })),
        recommendation: dc.recommendation,
        recommendationConfidence: dc.recommendationConfidence,
        rationale: dc.rationale,
        status: dc.status,
        openedAt: dc.detectedAt,
        requestedEvidence: 0,
      }));

      // Step 9: Assemble Canonical Product DNA
      const canonicalDnaItems: CanonicalProductDNA[] = [];
      const domainProducts: Product[] = [];
      const domainEvidence: Evidence[] = [];

      clusters.forEach((cluster) => {
        const itemExtracted = extracted.find((e) => e.entityId === cluster.entityId) || {
          entityId: cluster.entityId,
          attributes: [],
        };
        const itemEnriched = enriched.find((e) => e.entityId === cluster.entityId);
        const itemConflicts = domainConflicts.filter((c) => c.productId === cluster.entityId);

        const dna = buildCanonicalProductDNA(cluster, itemExtracted, itemEnriched, itemConflicts.length);
        canonicalDnaItems.push(dna);

        // Map to Domain Product shape
        const domainAttrs: ProductAttribute[] = dna.attributes.map((attr) => ({
          key: attr.key,
          label: attr.label,
          value: attr.canonicalValue,
          rawValues: [attr.originalValue],
          confidence: attr.confidence,
          verification: attr.verificationState === "CONFLICT" ? "CONFLICT" : attr.verificationState === "VERIFIED" ? "VERIFIED" : "UNVERIFIED",
          evidenceIds: attr.provenance.map((p) => `EVD-${dna.productId}-${attr.key}`),
        }));

        domainProducts.push({
          id: dna.productId,
          mpn: dna.mpn,
          name: dna.name,
          category: dna.category,
          description: `${dna.name} - ${dna.category}`,
          supplierId: parsedWb.filename,
          stage: itemConflicts.length > 0 ? "RESOLVE" : "PRODUCT_DNA",
          status: itemConflicts.length > 0 ? "REQUIRES_REVIEW" : "VERIFIED",
          confidence: dna.confidence,
          attributes: domainAttrs,
          revision: 1,
          createdAt: isoNow(),
          updatedAt: isoNow(),
        });

        // Map to Domain Evidence
        dna.attributes.forEach((attr) => {
          attr.provenance.forEach((p, idx) => {
            domainEvidence.push({
              id: `EVD-${dna.productId}-${attr.key}-${idx + 1}`,
              productId: dna.productId,
              attributeKey: attr.key,
              sourceDocumentId: p.document,
              value: p.value,
              raw: p.value,
              pageRef: `Sheet: ${p.sheet} · Row ${p.row} · Col ${p.col}`,
              excerpt: `Extracted '${p.value}' from column '${p.col}' row ${p.row}`,
              confidence: p.confidence,
              capturedAt: isoNow(),
            });
          });
        });
      });

      this.canonicalDnaList = canonicalDnaItems;

      // Update Pipeline Step State
      const hasConflicts = allDetectedConflicts.some((c) => c.status === "OPEN");
      this.pipelineStepState = hasConflicts ? "REVIEW_REQUIRED" : "CANONICALIZED";

      // Commit to main ForgeState
      const sourceDoc: SourceDocument = {
        id: `SRC-${parsedWb.filename.replace(/[^a-z0-9]/gi, "_")}`,
        filename: parsedWb.filename,
        type: "CATALOGUE",
        supplierId: "EXCEL_SOURCE",
        status: "INGESTED",
        progress: 100,
        sizeBytes: parsedWb.sizeBytes,
        rowCount: parsedWb.totalRows,
        pages: parsedWb.sheetNames.length,
        receivedAt: parsedWb.parsedAt,
        processedAt: isoNow(),
        errors: [],
      };

      const verifiedCount = canonicalDnaItems.filter((d) => d.verifiedCount === d.totalCount).length;

      this.commit((s) => ({
        ...s,
        sources: [sourceDoc],
        products: domainProducts,
        evidence: domainEvidence,
        conflicts: domainConflicts,
        activity: [
          {
            id: `ACT-${Date.now()}`,
            timestamp: isoNow(),
            type: "intake",
            severity: "success",
            title: `Ingested Workbook ${parsedWb.filename}`,
            detail: `${parsedWb.totalRows} rows across ${parsedWb.sheetNames.length} sheets → Generated ${canonicalDnaItems.length} Product DNA records (${domainConflicts.length} conflicts)`,
          },
          ...s.activity,
        ],
        system: {
          ...s.system,
          pipelineCounts: {
            INTAKE: parsedWb.totalRows,
            FORGE: allNormRecords.length,
            PROVE: verifiedCount,
            RESOLVE: domainConflicts.length,
            PRODUCT_DNA: canonicalDnaItems.length,
            SHIP: canonicalDnaItems.length,
          },
          cohort: {
            source: parsedWb.filename,
            total: parsedWb.totalRows,
            processed: allNormRecords.length,
            verified: verifiedCount,
            review: domainConflicts.length,
            blocked: 0,
          },
          intakeQueue: 0,
          forgeQueue: 0,
          proveQueue: 0,
          resolveQueue: domainConflicts.length,
          shipReady: canonicalDnaItems.length,
        },
      }));

      this.isProcessingPipeline = false;
      this.processingStepMessage = "";
    } catch (err: any) {
      this.isProcessingPipeline = false;
      this.processingStepMessage = "";
      this.pipelineStepState = "NO_DATA";
      console.error("Pipeline Ingestion Error:", err);
      this.commit((s) => ({
        ...s,
        activity: [
          {
            id: `ACT-ERR-${Date.now()}`,
            timestamp: isoNow(),
            type: "system",
            severity: "critical",
            title: "Pipeline Ingestion Error",
            detail: err.message || "Failed to process Excel workbook",
          },
          ...s.activity,
        ],
      }));
    }
  }

  /**
   * User override of Column Mapping
   */
  updateColumnMapping(sheetName: string, excelColumn: string, canonicalField: string): void {
    if (!this.sheetMappings[sheetName] || !this.sheetMappings[sheetName][excelColumn]) return;

    this.sheetMappings[sheetName][excelColumn] = {
      ...this.sheetMappings[sheetName][excelColumn],
      canonicalField,
      isUserOverridden: true,
      confidence: 1.0,
      matchingMethod: "USER",
    };

    // Re-run downstream pipeline quickly with new mappings
    if (this.rawWorkbookBuffer && this.activeWorkbook) {
      this.ingestExcelWorkbook(this.rawWorkbookBuffer, this.activeWorkbook.filename);
    }
  }

  /**
   * Human Review: Resolve Conflict
   */
  resolveConflict(
    conflictId: string,
    opts: { selectedValue: string; reason: string; mode: ResolutionMode },
  ): Resolution | null {
    const conflict = this.state.conflicts.find((c) => c.id === conflictId);
    if (!conflict || conflict.status === "RESOLVED") return null;

    const resolution: Resolution = {
      id: `RSL-${String(1000 + this.state.resolutions.length + 1)}`,
      conflictId,
      productId: conflict.productId,
      attributeKey: conflict.attributeKey,
      selectedValue: opts.selectedValue,
      mode: opts.mode,
      reason: opts.reason,
      resolvedBy: this.state.system.operator,
      resolvedAt: isoNow(),
    };

    // Update in-memory lists
    this.state.conflicts = this.state.conflicts.map((c) =>
      c.id === conflictId ? { ...c, status: "RESOLVED" as const, resolvedResolutionId: resolution.id } : c,
    );

    // Update canonical Product DNA record
    this.canonicalDnaList = this.canonicalDnaList.map((dna) => {
      if (dna.productId !== conflict.productId) return dna;
      const attributes = dna.attributes.map((attr) => {
        if (attr.key !== conflict.attributeKey) return attr;
        return {
          ...attr,
          canonicalValue: opts.selectedValue,
          confidence: 0.98,
          verificationState: "VERIFIED" as const,
        };
      });
      const verifiedCount = attributes.filter((a) => a.verificationState === "VERIFIED").length;
      return {
        ...dna,
        attributes,
        verifiedCount,
        confidence: Math.min(0.99, dna.confidence + 0.05),
      };
    });

    // Update domain products state
    this.commit((s) => {
      const openForProd = s.conflicts.filter((c) => c.productId === conflict.productId && c.status === "OPEN");
      const products = s.products.map((p) => {
        if (p.id !== conflict.productId) return p;
        const attributes = p.attributes.map((a) =>
          a.key === conflict.attributeKey
            ? { ...a, value: opts.selectedValue, confidence: 0.98, verification: "VERIFIED" as const }
            : a,
        );
        return {
          ...p,
          attributes,
          stage: openForProd.length === 0 ? ("PRODUCT_DNA" as PipelineStage) : p.stage,
          status: openForProd.length === 0 ? ("VERIFIED" as const) : ("REQUIRES_REVIEW" as const),
        };
      });

      return {
        ...s,
        products,
        resolutions: [resolution, ...s.resolutions],
        system: {
          ...s.system,
          resolveQueue: Math.max(0, s.system.resolveQueue - 1),
        },
      };
    });

    return resolution;
  }

  // ------------------------------------------------------------
  // Backward compatibility methods for Intake / Forge services
  // ------------------------------------------------------------

  setSourceProgress(sourceId: string, status: SourceDocument["status"], progress: number): void {
    const completed = status === "INGESTED";
    const source = this.state.sources.find((d) => d.id === sourceId);
    this.commit((s) => {
      const target = s.sources.find((d) => d.id === sourceId);
      if (!target) return s;
      const next: SourceDocument = {
        ...target,
        status,
        progress,
        processedAt: completed ? isoNow() : target.processedAt,
      };
      return {
        ...s,
        sources: s.sources.map((d) => (d.id === sourceId ? next : d)),
      };
    });
  }

  addSources(items: Array<{ filename: string; type: SourceType; supplierId: string; sizeBytes: number }>): string[] {
    const now = isoNow();
    const ids = items.map((_, i) => `SRC-${String(10_000 + Date.now()).slice(0, 4)}-${i + 1}`);
    this.commit((s) => {
      const docs: SourceDocument[] = items.map((item, i) => ({
        id: ids[i],
        filename: item.filename,
        type: item.type,
        supplierId: item.supplierId,
        status: "QUEUED",
        progress: 0,
        sizeBytes: item.sizeBytes,
        receivedAt: now,
        errors: [],
      }));
      return {
        ...s,
        sources: [...docs, ...s.sources],
      };
    });
    return ids;
  }

  acknowledgeSource(sourceId: string): void {
    this.commit((s) => ({
      ...s,
      sources: s.sources.map((d) =>
        d.id === sourceId ? { ...d, status: "INGESTED" as const, progress: 100, processedAt: isoNow() } : d,
      ),
    }));
  }

  advanceProduct(productId: string, stage: Product["stage"]): void {
    this.commit((s) => {
      const open = s.conflicts.filter((c) => c.productId === productId && c.status === "OPEN");
      const products = s.products.map((p) => {
        if (p.id !== productId) return p;
        const updated: Product = {
          ...p,
          stage,
          revision: p.revision + 1,
          updatedAt: isoNow(),
        };
        return { ...updated, status: recomputeStatus(updated, open) };
      });
      return { ...s, products };
    });
  }

  requestMoreEvidence(conflictId: string, _reason: string): void {
    this.commit((s) => ({
      ...s,
      conflicts: s.conflicts.map((c) =>
        c.id === conflictId ? { ...c, requestedEvidence: c.requestedEvidence + 1 } : c,
      ),
    }));
  }

  createShipment(destination: ShipmentDestination, productIds: string[]): Shipment {
    const maxN = this.state.shipments.reduce((max, sh) => {
      const n = parseInt(sh.id.replace("SH-", ""), 10);
      return Number.isFinite(n) ? Math.max(max, n) : max;
    }, 0);
    const id = `SH-${maxN + 1}`;
    const shipment: Shipment = {
      id,
      destination,
      destinationLabel: destination,
      productIds,
      validation: "PASSED",
      status: "EXPORTING",
      createdAt: isoNow(),
    };
    this.commit((s) => ({
      ...s,
      shipments: [shipment, ...s.shipments],
    }));
    return shipment;
  }

  completeShipment(shipmentId: string): void {
    this.commit((s) => ({
      ...s,
      shipments: s.shipments.map((sh) =>
        sh.id === shipmentId ? { ...sh, status: "EXPORTED" as const, completedAt: isoNow() } : sh,
      ),
    }));
  }

  retryShipment(shipmentId: string): void {
    this.commit((s) => ({
      ...s,
      shipments: s.shipments.map((sh) =>
        sh.id === shipmentId ? { ...sh, status: "EXPORTING" as const, error: undefined, createdAt: isoNow() } : sh,
      ),
    }));
  }
}

export const forgeStore = new ForgeStore();
export type { ResolutionMode };
