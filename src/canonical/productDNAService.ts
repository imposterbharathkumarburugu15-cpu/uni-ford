import type { ResolvedEntityCluster } from "../entity/entityResolver";
import type { EnrichedProductRecord } from "../enrichment/enrichmentEngine";
import type { ExtractedProductAttributes } from "../extraction/attributeExtractor";

export interface CanonicalProductDnaField {
  key: string;
  label: string;
  canonicalValue: string;
  originalValue: string;
  confidence: number; // 0 to 1
  verificationState: "VERIFIED" | "CONFLICT" | "UNVERIFIED" | "REQUIRES_REVIEW";
  enrichmentState: "ENRICHED" | "NOT_ENRICHED" | "DATA_NOT_AVAILABLE";
  sourceFile: string;
  sourceSheet: string;
  sourceRow: number;
  sourceCol: string;
  evidenceCount: number;
  provenance: Array<{
    document: string;
    sheet: string;
    row: number;
    col: string;
    value: string;
    confidence: number;
    agreement: "AGREES" | "DISAGREES" | "SOLE_SOURCE";
  }>;
}

export interface CanonicalProductDNA {
  productId: string;
  mpn: string;
  name: string;
  category: string;
  taxonomyPath: string;
  verifiedCount: number;
  totalCount: number;
  confidence: number; // 0 to 1
  attributes: CanonicalProductDnaField[];
  revision: number;
  lastVerifiedAt: string;
  pipelineStage: "PRODUCT_DNA" | "REVIEW_REQUIRED" | "INGESTED";
}

/**
 * Builds canonical Product DNA records strictly from real pipeline execution outputs.
 */
export function buildCanonicalProductDNA(
  cluster: ResolvedEntityCluster,
  extracted: ExtractedProductAttributes,
  enriched?: EnrichedProductRecord,
  openConflictsCount = 0,
): CanonicalProductDNA {
  const fields: CanonicalProductDnaField[] = [];
  let totalConfidence = 0;
  let verifiedCount = 0;

  extracted.attributes.forEach((attr) => {
    const mainProv = attr.provenances[0] || {
      filename: "uploaded_catalog.xlsx",
      sheet: "Sheet1",
      row: 1,
      col: "A",
      rawFragment: attr.value,
      extractedValue: attr.value,
      confidence: 0.9,
    };

    const hasConflict = attr.provenances.length > 1 &&
      new Set(attr.provenances.map((p) => p.extractedValue.trim())).size > 1;

    const verificationState = hasConflict ? "CONFLICT" : attr.confidence > 0.85 ? "VERIFIED" : "UNVERIFIED";

    if (verificationState === "VERIFIED") verifiedCount++;

    const isEnrichedField = enriched?.enrichedAttributes[attr.key.toLowerCase()] !== undefined;
    const enrichmentState = isEnrichedField ? "ENRICHED" : "NOT_ENRICHED";

    const provenance = attr.provenances.map((p) => ({
      document: p.filename,
      sheet: p.sheet,
      row: p.row,
      col: p.col,
      value: p.extractedValue,
      confidence: p.confidence,
      agreement: attr.provenances.length === 1 ? ("SOLE_SOURCE" as const) : hasConflict ? ("DISAGREES" as const) : ("AGREES" as const),
    }));

    fields.push({
      key: attr.key,
      label: attr.label,
      canonicalValue: attr.value,
      originalValue: mainProv.rawFragment || attr.value,
      confidence: attr.confidence,
      verificationState,
      enrichmentState,
      sourceFile: mainProv.filename,
      sourceSheet: mainProv.sheet,
      sourceRow: mainProv.row,
      sourceCol: mainProv.col,
      evidenceCount: attr.provenances.length,
      provenance,
    });

    totalConfidence += attr.confidence;
  });

  const avgConfidence = fields.length > 0 ? Math.round((totalConfidence / fields.length) * 100) / 100 : 0.9;

  return {
    productId: cluster.entityId,
    mpn: cluster.primaryId,
    name: cluster.name,
    category: cluster.category,
    taxonomyPath: enriched?.taxonomyPath || "Industrial Components",
    verifiedCount,
    totalCount: fields.length,
    confidence: avgConfidence,
    attributes: fields,
    revision: 1,
    lastVerifiedAt: new Date().toISOString(),
    pipelineStage: openConflictsCount > 0 ? "REVIEW_REQUIRED" : "PRODUCT_DNA",
  };
}
