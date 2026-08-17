import type { ExtractedAttribute } from "../extraction/attributeExtractor";

export interface DetectedConflictSource {
  evidenceId: string;
  sourceFile: string;
  sheet: string;
  row: number;
  col: string;
  value: string;
  rawFragment: string;
  confidence: number;
}

export interface DetectedConflict {
  id: string; // CFL-0001
  entityId: string;
  attributeKey: string;
  attributeLabel: string;
  sources: DetectedConflictSource[];
  valueCounts: Record<string, number>;
  recommendation: string;
  recommendationConfidence: number; // 0 to 1
  rationale: string;
  status: "OPEN" | "RESOLVED";
  detectedAt: string;
}

/**
 * Scans extracted attributes across source records for entity clusters and detects conflicting values.
 */
export function detectAttributeConflicts(
  entityId: string,
  attributes: ExtractedAttribute[],
): DetectedConflict[] {
  const conflicts: DetectedConflict[] = [];
  let conflictCounter = 1;

  attributes.forEach((attr) => {
    if (attr.provenances.length <= 1) return;

    // Group values across provenances
    const valueMap = new Map<string, DetectedConflictSource[]>();

    attr.provenances.forEach((prov, pIdx) => {
      const v = prov.extractedValue.trim();
      const src: DetectedConflictSource = {
        evidenceId: `EVD-${entityId}-${attr.key}-${pIdx + 1}`,
        sourceFile: prov.filename,
        sheet: prov.sheet,
        row: prov.row,
        col: prov.col,
        value: v,
        rawFragment: prov.rawFragment,
        confidence: prov.confidence,
      };

      const existing = valueMap.get(v) || [];
      existing.push(src);
      valueMap.set(v, existing);
    });

    // If there are multiple different extracted values for the same attribute key, flag CONFLICT!
    if (valueMap.size > 1) {
      const valueCounts: Record<string, number> = {};
      let topValue = "";
      let topCount = 0;
      let totalSources = 0;

      valueMap.forEach((srcs, val) => {
        valueCounts[val] = srcs.length;
        totalSources += srcs.length;
        if (srcs.length > topCount) {
          topCount = srcs.length;
          topValue = val;
        }
      });

      // Calculate confidence for recommendation based on source ratio & source reliability
      const agreementRatio = topCount / totalSources;
      const recConfidence = Math.round((0.6 + agreementRatio * 0.35) * 100) / 100;

      const conflictId = `CFL-${entityId.replace("PRD-", "")}-${String(conflictCounter++).padStart(2, "0")}`;

      const valueBreakdownStr = Array.from(valueMap.entries())
        .map(([val, list]) => `${list.length} source(s) specified '${val}'`)
        .join("; ");

      conflicts.push({
        id: conflictId,
        entityId,
        attributeKey: attr.key,
        attributeLabel: attr.label,
        sources: Array.from(valueMap.values()).flat(),
        valueCounts,
        recommendation: topValue,
        recommendationConfidence: recConfidence,
        rationale: `Discrepancy detected across sources (${totalSources} evidence points): ${valueBreakdownStr}. Plurality recommendation is '${topValue}'.`,
        status: "OPEN",
        detectedAt: new Date().toISOString(),
      });
    }
  });

  return conflicts;
}
