import { useSyncExternalStore } from "react";
import { forgeStore, type ViewMode, type PipelineStepState } from "@/store/forgeStore";
import type {
  ActivityEvent,
  Conflict,
  Evidence,
  ForgeState,
  Product,
  ProductDna,
  Resolution,
  Shipment,
  SourceDocument,
  Supplier,
  SystemStatus,
} from "@/types/domain";
import { buildProductDna, shipQueueProducts } from "@/utils/pipeline";
import type { ParsedWorkbook } from "@/ingestion/excelParser";
import type { WorkbookProfile } from "@/ingestion/workbookProfiler";
import type { ColumnMapping } from "@/mapping/columnMapper";
import type { NormalizedRecord } from "@/normalization/valueNormalizer";
import type { ResolvedEntityCluster } from "@/entity/entityResolver";
import type { ExtractedProductAttributes } from "@/extraction/attributeExtractor";
import type { EnrichedProductRecord } from "@/enrichment/enrichmentEngine";
import type { CanonicalProductDNA } from "@/canonical/productDNAService";

export function useForgeState(): ForgeState {
  return useSyncExternalStore(forgeStore.subscribe, forgeStore.getState);
}

export function useProducts(): Product[] {
  return useForgeState().products;
}

export function useProduct(id?: string): Product | undefined {
  const state = useForgeState();
  return id ? state.products.find((p) => p.id === id) : undefined;
}

export function useSuppliers(): Supplier[] {
  return useForgeState().suppliers;
}

export function useSources(): SourceDocument[] {
  return useForgeState().sources;
}

export function useEvidence(): Evidence[] {
  return useForgeState().evidence;
}

export function useConflicts(): Conflict[] {
  return useForgeState().conflicts;
}

export function useOpenConflicts(): Conflict[] {
  return useForgeState().conflicts.filter((c) => c.status === "OPEN");
}

export function useConflict(id?: string): Conflict | undefined {
  const state = useForgeState();
  return id ? state.conflicts.find((c) => c.id === id) : undefined;
}

export function useResolutions(): Resolution[] {
  return useForgeState().resolutions;
}

export function useShipments(): Shipment[] {
  return useForgeState().shipments;
}

export function useActivity(): ActivityEvent[] {
  return useForgeState().activity;
}

export function useSystemStatus(): SystemStatus {
  return useForgeState().system;
}

export function useShipQueue(): Product[] {
  const state = useForgeState();
  return shipQueueProducts(state);
}

export function useProductDna(productId?: string): ProductDna | undefined {
  const state = useForgeState();
  const product = productId
    ? state.products.find((p) => p.id === productId)
    : undefined;
  return product ? buildProductDna(state, product) : undefined;
}

export function useAllDna(): ProductDna[] {
  const state = useForgeState();
  return state.products.map((p) => buildProductDna(state, p));
}

// ------------------------------------------------------------
// Hooks for Real Ingestion Pipeline
// ------------------------------------------------------------

export function useActiveWorkbook(): ParsedWorkbook | null {
  useForgeState();
  return forgeStore.getActiveWorkbook();
}

export function useWorkbookProfile(): WorkbookProfile | null {
  useForgeState();
  return forgeStore.getWorkbookProfile();
}

export function useSheetMappings(sheetName?: string): Record<string, ColumnMapping> {
  useForgeState();
  return forgeStore.getSheetMappings(sheetName);
}

export function useNormalizedRecords(): NormalizedRecord[] {
  useForgeState();
  return forgeStore.getNormalizedRecords();
}

export function useResolvedEntities(): ResolvedEntityCluster[] {
  useForgeState();
  return forgeStore.getResolvedEntities();
}

export function useExtractedAttributes(): ExtractedProductAttributes[] {
  useForgeState();
  return forgeStore.getExtractedAttributes();
}

export function useEnrichedProducts(): EnrichedProductRecord[] {
  useForgeState();
  return forgeStore.getEnrichedProducts();
}

export function useCanonicalDnaList(): CanonicalProductDNA[] {
  useForgeState();
  return forgeStore.getCanonicalDnaList();
}

export function useActiveSheetName(): string {
  useForgeState();
  return forgeStore.getActiveSheetName();
}

export function useActiveViewMode(): ViewMode {
  useForgeState();
  return forgeStore.getActiveViewMode();
}

export function usePipelineStepState(): PipelineStepState {
  useForgeState();
  return forgeStore.getPipelineStepState();
}

export function useIsProcessingPipeline(): boolean {
  useForgeState();
  return forgeStore.getIsProcessingPipeline();
}

export function useProcessingStepMessage(): string {
  useForgeState();
  return forgeStore.getProcessingStepMessage();
}
