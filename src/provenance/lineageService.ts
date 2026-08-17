export interface LineageStep {
  stepName: "EXCEL_SOURCE" | "NORMALIZATION" | "ENTITY_RESOLUTION" | "ATTRIBUTE_EXTRACTION" | "ENRICHMENT" | "VALIDATION" | "HUMAN_REVIEW" | "CANONICAL_DNA";
  title: string;
  description: string;
  detail: string;
  timestamp?: string;
  metadata: Record<string, any>;
}

export interface AttributeLineageGraph {
  productId: string;
  attributeKey: string;
  attributeLabel: string;
  canonicalValue: string;
  steps: LineageStep[];
}

/**
 * Constructs line-of-sight lineage for an attribute from Excel raw cell to Canonical Product DNA.
 */
export function buildAttributeLineage(
  productId: string,
  attributeKey: string,
  attributeLabel: string,
  canonicalValue: string,
  originalValue: string,
  sourceFile: string,
  sourceSheet: string,
  sourceRow: number,
  sourceCol: string,
  confidence: number,
  verificationStatus: string,
  enrichmentState: string,
): AttributeLineageGraph {
  const steps: LineageStep[] = [
    {
      stepName: "EXCEL_SOURCE",
      title: "Excel Source Cell Intake",
      description: `Verbatim cell in workbook '${sourceFile}'`,
      detail: `Sheet: ${sourceSheet} | Row: ${sourceRow} | Column: ${sourceCol} | Verbatim: "${originalValue}"`,
      metadata: { sourceFile, sourceSheet, sourceRow, sourceCol, originalValue },
    },
    {
      stepName: "NORMALIZATION",
      title: "Data Normalization & Cleaning",
      description: "Standardized whitespace, casing, and units",
      detail: `Original: "${originalValue}" → Normalized: "${canonicalValue}"`,
      metadata: { originalValue, canonicalValue },
    },
    {
      stepName: "ENTITY_RESOLUTION",
      title: "Entity Clustering",
      description: `Mapped source row ${sourceRow} to product entity ${productId}`,
      detail: "Linked via matching Product SKU / Part Number candidate key",
      metadata: { productId, sourceRow },
    },
    {
      stepName: "ATTRIBUTE_EXTRACTION",
      title: "Attribute Extraction",
      description: `Extracted '${attributeLabel}' attribute`,
      detail: `Assigned canonical key ${attributeKey} with base extraction confidence ${(confidence * 100).toFixed(0)}%`,
      metadata: { attributeKey, confidence },
    },
    {
      stepName: "ENRICHMENT",
      title: "Modular Enrichment",
      description: `Enrichment status: ${enrichmentState}`,
      detail: enrichmentState === "ENRICHED" ? "Augmented with industrial reference standards" : "Direct source extraction",
      metadata: { enrichmentState },
    },
    {
      stepName: "VALIDATION",
      title: "Confidence & Evidence Validation",
      description: `Status: ${verificationStatus}`,
      detail: `Final calculated confidence: ${(confidence * 100).toFixed(1)}%`,
      metadata: { confidence, verificationStatus },
    },
    {
      stepName: "CANONICAL_DNA",
      title: "Canonical Product DNA Record",
      description: "Committed to master product catalog",
      detail: `Canonical value: ${canonicalValue}`,
      metadata: { canonicalValue },
    },
  ];

  return {
    productId,
    attributeKey,
    attributeLabel,
    canonicalValue,
    steps,
  };
}
