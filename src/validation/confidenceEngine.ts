import type { ExtractedAttribute } from "../extraction/attributeExtractor";
import type { DetectedConflict } from "./conflictDetector";

export interface ConfidenceBreakdown {
  sourceAgreementScore: number;
  sourceReliabilityWeight: number;
  normalizationQualityScore: number;
  entityMatchScore: number;
  contradictionPenalty: number;
  finalConfidence: number; // 0.00 to 1.00
}

/**
 * Calculates mathematical evidence-grounded confidence for derived product attributes.
 */
export function calculateAttributeConfidence(
  attr: ExtractedAttribute,
  entityMatchConfidence: number,
  activeConflict?: DetectedConflict,
): ConfidenceBreakdown {
  const provCount = attr.provenances.length;
  let sourceAgreementScore = 1.0;
  let contradictionPenalty = 0.0;

  if (activeConflict && activeConflict.status === "OPEN") {
    const topCount = activeConflict.valueCounts[activeConflict.recommendation] || 1;
    sourceAgreementScore = topCount / provCount;
    contradictionPenalty = 0.25; // 25% penalty for open conflict
  } else if (provCount > 1) {
    sourceAgreementScore = 1.0; // Multiple sources in complete agreement
  } else {
    sourceAgreementScore = 0.9; // Single source evidence
  }

  // Source reliability weight (higher for excel catalog / datasheet specs)
  const sourceReliabilityWeight = 0.92;

  // Normalization quality score
  const normalizationQualityScore = attr.confidence || 0.9;

  // Compute final score
  const rawScore =
    (sourceAgreementScore * 0.35 +
      sourceReliabilityWeight * 0.25 +
      normalizationQualityScore * 0.25 +
      entityMatchConfidence * 0.15) -
    contradictionPenalty;

  const finalConfidence = Math.min(0.99, Math.max(0.4, Math.round(rawScore * 100) / 100));

  return {
    sourceAgreementScore,
    sourceReliabilityWeight,
    normalizationQualityScore,
    entityMatchScore: entityMatchConfidence,
    contradictionPenalty,
    finalConfidence,
  };
}
