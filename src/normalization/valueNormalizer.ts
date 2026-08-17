import type { ColumnMapping } from "../mapping/columnMapper";
import { normalizeMaterial, normalizeMeasurement, normalizeThread } from "./unitNormalizer";

export interface NormalizedValueField {
  canonicalField: string;
  originalValue: string;
  normalizedValue: string;
  sourceSheet: string;
  sourceRow: number;
  sourceCol: string;
  wasModified: boolean;
}

export interface NormalizedRecord {
  id: string; // REC-0001
  sourceRow: number; // 1-based original sheet row index
  sourceSheet: string;
  fields: Record<string, NormalizedValueField>; // canonicalField -> field info
  rawRow: Record<string, string>;
}

/**
 * Normalizes raw sheet row records into clean standardized records.
 * NEVER overwrites original string values; preserves originalValue and creates normalizedValue.
 */
export function normalizeSheetRows(
  sheetName: string,
  rows: Record<string, string>[],
  columnMappings: Record<string, ColumnMapping>,
): NormalizedRecord[] {
  return rows.map((rawRow, idx) => {
    const rowNum = parseInt(rawRow.__rowNum || String(idx + 2), 10);
    const fields: Record<string, NormalizedValueField> = {};

    Object.entries(columnMappings).forEach(([colName, mapping]) => {
      if (mapping.canonicalField === "unmapped") return;

      const originalValue = rawRow[colName] || "";
      let normalizedValue = originalValue.trim();

      // Clean double spaces & punctuation
      normalizedValue = normalizedValue.replace(/\s+/g, " ");

      // Field-specific normalization rules
      switch (mapping.canonicalField) {
        case "material":
          normalizedValue = normalizeMaterial(originalValue);
          break;
        case "size":
        case "pressure":
        case "weight":
          normalizedValue = normalizeMeasurement(originalValue);
          break;
        case "thread":
          normalizedValue = normalizeThread(originalValue);
          break;
        case "category":
        case "manufacturer":
        case "brand":
          // Title Casing
          if (normalizedValue) {
            normalizedValue = normalizedValue
              .toLowerCase()
              .split(/\s+/)
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" ");
          }
          break;
        case "product_id":
        case "mpn":
        case "sku":
          // Upper-case clean IDs
          normalizedValue = normalizedValue.toUpperCase().replace(/\s+/g, "");
          break;
        default:
          break;
      }

      fields[mapping.canonicalField] = {
        canonicalField: mapping.canonicalField,
        originalValue,
        normalizedValue,
        sourceSheet: sheetName,
        sourceRow: rowNum,
        sourceCol: colName,
        wasModified: originalValue !== normalizedValue,
      };
    });

    return {
      id: `REC-${sheetName.substring(0, 3).toUpperCase()}-${rowNum}`,
      sourceRow: rowNum,
      sourceSheet: sheetName,
      fields,
      rawRow,
    };
  });
}
