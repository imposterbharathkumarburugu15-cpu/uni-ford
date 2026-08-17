import type { ForgeState } from "@/types/domain";

/**
 * Clean initial state factory.
 * NO static mock products, conflicts, or pipeline counts.
 * State starts empty until an Excel workbook is ingested.
 */
export function createInitialState(): ForgeState {
  return {
    suppliers: [],
    sources: [],
    products: [],
    evidence: [],
    conflicts: [],
    resolutions: [],
    shipments: [],
    activity: [
      {
        id: "ACT-INIT",
        timestamp: new Date().toISOString(),
        type: "system",
        severity: "info",
        title: "UNIFORGE Pipeline Initialized",
        detail: "Awaiting Excel workbook upload to generate Product DNA",
      },
    ],
    system: {
      pipelineCounts: {
        INTAKE: 0,
        FORGE: 0,
        PROVE: 0,
        RESOLVE: 0,
        PRODUCT_DNA: 0,
        SHIP: 0,
      },
      cohort: {
        source: "No Excel Uploaded",
        total: 0,
        processed: 0,
        verified: 0,
        review: 0,
        blocked: 0,
      },
      apiStatus: "OPERATIONAL",
      lastSync: new Date().toISOString(),
      intakeQueue: 0,
      forgeQueue: 0,
      proveQueue: 0,
      resolveQueue: 0,
      shipReady: 0,
      sourceHealth: { healthy: 0, degraded: 0, critical: 0 },
      operator: "DATA_ENGINEER",
      operatorRole: "Master Data Administrator",
    },
  };
}
