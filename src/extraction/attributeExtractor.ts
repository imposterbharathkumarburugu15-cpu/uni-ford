import type { ResolvedEntityCluster } from "../entity/entityResolver";
import { normalizeMaterial, normalizeMeasurement, normalizeThread } from "../normalization/unitNormalizer";

export interface ExtractedAttributeProvenance {
  filename: string;
  sheet: string;
  row: number;
  col: string;
  rawFragment: string;
  extractedValue: string;
  confidence: number;
}

export interface ExtractedAttribute {
  key: string; // e.g. MATERIAL, SIZE, PRESSURE, THREAD, PRODUCT_TYPE, BRAND, WEIGHT
  label: string; // e.g. "Material", "Size", "Pressure"
  value: string; // canonical extracted value
  unit?: string;
  confidence: number;
  provenances: ExtractedAttributeProvenance[];
}

export interface ExtractedProductAttributes {
  entityId: string;
  attributes: ExtractedAttribute[];
}

/**
 * Dynamically extracts product attributes from entity clusters and raw descriptions.
 */
export function extractProductAttributes(
  filename: string,
  clusters: ResolvedEntityCluster[],
): ExtractedProductAttributes[] {
  return clusters.map((cluster) => {
    const attributeMap = new Map<string, ExtractedAttribute>();

    cluster.matchedRecords.forEach((record) => {
      const rowNum = record.sourceRow;
      const sheet = record.sourceSheet;

      // 1. Extract from mapped fields
      Object.values(record.fields).forEach((field) => {
        if (!field.normalizedValue || field.canonicalField === "unmapped") return;

        const attrKey = field.canonicalField.toUpperCase();
        const attrLabel = field.canonicalField
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());

        addOrUpdateAttribute(attributeMap, {
          key: attrKey,
          label: attrLabel,
          value: field.normalizedValue,
          confidence: 0.95,
          provenance: {
            filename,
            sheet,
            row: rowNum,
            col: field.sourceCol,
            rawFragment: field.originalValue,
            extractedValue: field.normalizedValue,
            confidence: 0.95,
          },
        });
      });

      // 2. Deep NLP/Regex Extraction from Description strings
      const descStr = record.fields.description?.originalValue || record.fields.name?.originalValue || "";
      if (descStr) {
        extractFromText(descStr, filename, sheet, rowNum, record.fields.description?.sourceCol || "DESCRIPTION", attributeMap);
      }
    });

    return {
      entityId: cluster.entityId,
      attributes: Array.from(attributeMap.values()),
    };
  });
}

function extractFromText(
  text: string,
  filename: string,
  sheet: string,
  row: number,
  col: string,
  attributeMap: Map<string, ExtractedAttribute>,
) {
  // Material regex
  const matMatch = text.match(/\b(brass|bronze|316 stainless|304 stainless|stainless steel|carbon steel|pvc|cpvc|ductile iron|cast iron|aluminum|copper|ptfe)\b/i);
  if (matMatch) {
    const val = normalizeMaterial(matMatch[0]);
    addOrUpdateAttribute(attributeMap, {
      key: "MATERIAL",
      label: "Material",
      value: val,
      confidence: 0.92,
      provenance: {
        filename,
        sheet,
        row,
        col,
        rawFragment: matMatch[0],
        extractedValue: val,
        confidence: 0.92,
      },
    });
  }

  // Product Type regex (e.g. coupling, valve, elbow, tee, flange, adapter, nipple, reducer, fitting, sensor)
  const typeMatch = text.match(/\b(coupling|valve|elbow|tee|flange|adapter|nipple|reducer|fitting|sensor|bushing|union|plug|cap|hose)\b/i);
  if (typeMatch) {
    const val = typeMatch[0].charAt(0).toUpperCase() + typeMatch[0].slice(1).toLowerCase();
    addOrUpdateAttribute(attributeMap, {
      key: "PRODUCT_TYPE",
      label: "Product Type",
      value: val,
      confidence: 0.90,
      provenance: {
        filename,
        sheet,
        row,
        col,
        rawFragment: typeMatch[0],
        extractedValue: val,
        confidence: 0.90,
      },
    });
  }

  // Size fraction/dimension regex e.g. "3/8 NPT", "1/2 in", "3/4\""
  const sizeMatch = text.match(/\b(\d+\/\d+|\d+\.?\d*)\s*(in|inch|inches|"|'')?\b/i);
  if (sizeMatch && !attributeMap.has("SIZE")) {
    const val = normalizeMeasurement(sizeMatch[0]);
    if (val && val !== text.trim()) {
      addOrUpdateAttribute(attributeMap, {
        key: "SIZE",
        label: "Size",
        value: val,
        confidence: 0.88,
        provenance: {
          filename,
          sheet,
          row,
          col,
          rawFragment: sizeMatch[0],
          extractedValue: val,
          confidence: 0.88,
        },
      });
    }
  }

  // Thread type regex
  const threadMatch = text.match(/\b(nptf|npt|bspp|bspt|female npt|male npt)\b/i);
  if (threadMatch) {
    const val = normalizeThread(threadMatch[0]);
    addOrUpdateAttribute(attributeMap, {
      key: "THREAD",
      label: "Thread",
      value: val,
      confidence: 0.92,
      provenance: {
        filename,
        sheet,
        row,
        col,
        rawFragment: threadMatch[0],
        extractedValue: val,
        confidence: 0.92,
      },
    });
  }

  // Pressure rating regex e.g. "125 PSI", "300#", "250 psi"
  const pressureMatch = text.match(/\b(\d+)\s*(psi|#|bar|kpa)\b/i);
  if (pressureMatch) {
    const val = normalizeMeasurement(pressureMatch[0]);
    addOrUpdateAttribute(attributeMap, {
      key: "PRESSURE",
      label: "Pressure",
      value: val,
      confidence: 0.90,
      provenance: {
        filename,
        sheet,
        row,
        col,
        rawFragment: pressureMatch[0],
        extractedValue: val,
        confidence: 0.90,
      },
    });
  }
}

function addOrUpdateAttribute(
  map: Map<string, ExtractedAttribute>,
  item: { key: string; label: string; value: string; confidence: number; provenance: ExtractedAttributeProvenance },
) {
  const existing = map.get(item.key);
  if (!existing) {
    map.set(item.key, {
      key: item.key,
      label: item.label,
      value: item.value,
      confidence: item.confidence,
      provenances: [item.provenance],
    });
  } else {
    // Append provenance if unique
    const provExists = existing.provenances.some(
      (p) => p.sheet === item.provenance.sheet && p.row === item.provenance.row && p.col === item.provenance.col,
    );
    if (!provExists) {
      existing.provenances.push(item.provenance);
    }
  }
}
