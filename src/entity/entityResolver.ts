import type { NormalizedRecord } from "../normalization/valueNormalizer";

export interface ResolvedEntityCluster {
  entityId: string; // PRD-001
  primaryId: string; // VND-992-B or SKU
  name: string;
  category: string;
  matchedRecords: NormalizedRecord[];
  matchConfidence: number; // 0 to 1
  matchKey: string;
  requiresReview: boolean;
  resolutionNotes: string;
}

/**
 * Resolves normalized records into canonical product entity clusters.
 */
export function resolveEntities(records: NormalizedRecord[]): ResolvedEntityCluster[] {
  const clusters: ResolvedEntityCluster[] = [];
  const recordToClusterMap = new Map<string, ResolvedEntityCluster>();

  records.forEach((record) => {
    const prodId = record.fields.product_id?.normalizedValue;
    const mpn = record.fields.mpn?.normalizedValue;
    const sku = record.fields.sku?.normalizedValue;
    const desc = record.fields.description?.normalizedValue || record.fields.name?.normalizedValue || "";
    const brand = record.fields.brand?.normalizedValue || record.fields.manufacturer?.normalizedValue || "";

    // Candidate key matching priority:
    // 1. Explicit Product ID / MPN / SKU
    // 2. Combined Brand + Description normalized key
    let candidateKey = "";
    let matchType = "";

    if (prodId) {
      candidateKey = `ID:${prodId}`;
      matchType = "EXACT_PRODUCT_ID";
    } else if (mpn) {
      candidateKey = `MPN:${mpn}`;
      matchType = "EXACT_MPN";
    } else if (sku) {
      candidateKey = `SKU:${sku}`;
      matchType = "EXACT_SKU";
    } else if (desc.length > 5) {
      const cleanDesc = desc.toLowerCase().replace(/[^a-z0-9]/g, "_").substring(0, 30);
      const cleanBrand = brand.toLowerCase().replace(/[^a-z0-9]/g, "");
      candidateKey = `DESC:${cleanBrand}_${cleanDesc}`;
      matchType = "DESCRIPTION_FUZZY";
    } else {
      candidateKey = `REC:${record.id}`;
      matchType = "SINGLETON_ROW";
    }

    let existingCluster = clusters.find((c) => c.matchKey === candidateKey);

    if (!existingCluster) {
      const entityIndex = clusters.length + 1;
      const entityId = `PRD-${String(100 + entityIndex).padStart(4, "0")}`;
      const primaryId = prodId || mpn || sku || `ITEM-${entityIndex}`;

      const name =
        record.fields.name?.originalValue ||
        record.fields.description?.originalValue ||
        `Product ${primaryId}`;

      const category = record.fields.category?.normalizedValue || "General Hardware & Components";

      const confidence = matchType.startsWith("EXACT")
        ? 0.98
        : matchType === "DESCRIPTION_FUZZY"
        ? 0.82
        : 0.9;

      existingCluster = {
        entityId,
        primaryId,
        name,
        category,
        matchedRecords: [record],
        matchConfidence: confidence,
        matchKey: candidateKey,
        requiresReview: confidence < 0.85,
        resolutionNotes: `Matched via ${matchType}`,
      };

      clusters.push(existingCluster);
    } else {
      existingCluster.matchedRecords.push(record);
      // If multiple records merge, adjust confidence slightly if exact match vs fuzzy
      if (!matchType.startsWith("EXACT")) {
        existingCluster.requiresReview = true;
        existingCluster.matchConfidence = Math.max(0.7, existingCluster.matchConfidence - 0.05);
      }
    }

    recordToClusterMap.set(record.id, existingCluster);
  });

  return clusters;
}
