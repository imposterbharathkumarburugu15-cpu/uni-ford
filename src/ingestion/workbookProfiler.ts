import type { ParsedSheet, ParsedWorkbook } from "./excelParser";

export type ColumnDataType = "STRING" | "NUMERIC" | "DATE" | "BOOLEAN" | "MIXED";

export type SemanticGuess =
  | "PRODUCT_ID"
  | "MPN"
  | "SKU"
  | "MANUFACTURER"
  | "BRAND"
  | "CATEGORY"
  | "DESCRIPTION"
  | "MATERIAL"
  | "SIZE"
  | "THREAD"
  | "PRESSURE"
  | "WEIGHT"
  | "MODEL"
  | "PRICE"
  | "STATUS"
  | "UNKNOWN";

export interface ColumnProfile {
  columnName: string;
  sheetName: string;
  detectedType: ColumnDataType;
  totalCount: number;
  nonNullCount: number;
  nullCount: number;
  uniqueCount: number;
  duplicateRate: number; // 0 to 1
  sampleValues: string[];
  avgStringLength: number;
  numericMin?: number;
  numericMax?: number;
  suspiciousValues: string[];
  semanticGuess: SemanticGuess;
  guessConfidence: number; // 0 to 1
}

export interface SheetProfile {
  sheetName: string;
  rowCount: number;
  colCount: number;
  columns: Record<string, ColumnProfile>;
}

export interface WorkbookProfile {
  filename: string;
  sheets: Record<string, SheetProfile>;
  totalColumnsProfiled: number;
  profiledAt: string;
}

/**
 * Profiles all columns across sheets in a workbook.
 */
export function profileWorkbook(workbook: ParsedWorkbook): WorkbookProfile {
  const sheets: Record<string, SheetProfile> = {};
  let totalColumnsProfiled = 0;

  for (const sheetName of workbook.sheetNames) {
    const sheet = workbook.sheets[sheetName];
    if (!sheet) continue;

    const columns: Record<string, ColumnProfile> = {};

    sheet.headers.forEach((colName) => {
      totalColumnsProfiled++;
      const values = sheet.rows
        .map((r) => r[colName])
        .filter((val) => val !== undefined && val !== null);

      const nonNullValues = values.filter((val) => val.trim() !== "");
      const nullCount = sheet.rowCount - nonNullValues.length;
      const uniqueValuesSet = new Set(nonNullValues);
      const uniqueCount = uniqueValuesSet.size;
      const duplicateRate =
        nonNullValues.length > 0 ? 1 - uniqueCount / nonNullValues.length : 0;

      // Sample values (up to 5 distinct non-null values)
      const sampleValues = Array.from(uniqueValuesSet).slice(0, 5);

      // String lengths
      const totalLen = nonNullValues.reduce((sum, v) => sum + v.length, 0);
      const avgStringLength =
        nonNullValues.length > 0 ? Math.round((totalLen / nonNullValues.length) * 10) / 10 : 0;

      // Detect Data Type & Numeric range
      let numericCount = 0;
      let dateCount = 0;
      let minNum = Infinity;
      let maxNum = -Infinity;
      const suspiciousValues: string[] = [];

      nonNullValues.forEach((val) => {
        // Suspicious values check (N/A, unknown, ???, TBD, null string, invalid characters)
        if (
          /^(n\/a|na|none|null|undefined|tbd|\?{2,}|#N\/A|#VALUE!|#REF!)$/i.test(
            val.trim(),
          )
        ) {
          if (!suspiciousValues.includes(val)) suspiciousValues.push(val);
        }

        const cleanVal = val.replace(/,/g, "").trim();
        const num = Number(cleanVal);
        if (!isNaN(num) && cleanVal !== "") {
          numericCount++;
          if (num < minNum) minNum = num;
          if (num > maxNum) maxNum = num;
        } else if (!isNaN(Date.parse(val)) && val.length >= 6) {
          dateCount++;
        }
      });

      let detectedType: ColumnDataType = "STRING";
      if (nonNullValues.length > 0) {
        if (numericCount / nonNullValues.length > 0.8) {
          detectedType = "NUMERIC";
        } else if (dateCount / nonNullValues.length > 0.8) {
          detectedType = "DATE";
        } else if (numericCount > 0) {
          detectedType = "MIXED";
        }
      }

      // Semantic Guess
      const { guess, confidence } = inferSemanticMeaning(colName, sampleValues, detectedType);

      columns[colName] = {
        columnName: colName,
        sheetName,
        detectedType,
        totalCount: sheet.rowCount,
        nonNullCount: nonNullValues.length,
        nullCount,
        uniqueCount,
        duplicateRate: Math.round(duplicateRate * 1000) / 1000,
        sampleValues,
        avgStringLength,
        numericMin: minNum !== Infinity ? minNum : undefined,
        numericMax: maxNum !== -Infinity ? maxNum : undefined,
        suspiciousValues,
        semanticGuess: guess,
        guessConfidence: confidence,
      };
    });

    sheets[sheetName] = {
      sheetName,
      rowCount: sheet.rowCount,
      colCount: sheet.colCount,
      columns,
    };
  }

  return {
    filename: workbook.filename,
    sheets,
    totalColumnsProfiled,
    profiledAt: new Date().toISOString(),
  };
}

function inferSemanticMeaning(
  header: string,
  samples: string[],
  type: ColumnDataType,
): { guess: SemanticGuess; confidence: number } {
  const norm = header.toLowerCase().replace(/[^a-z0-9]/g, "");

  if (/(sku|partnum|itemnum|productid|id|partno|code)/i.test(norm)) {
    if (/sku/i.test(norm)) return { guess: "SKU", confidence: 0.95 };
    if (/mpn|mfgpart/i.test(norm)) return { guess: "MPN", confidence: 0.95 };
    return { guess: "PRODUCT_ID", confidence: 0.9 };
  }

  if (/(mfg|manufacturer|vendor|supplier|maker)/i.test(norm)) {
    return { guess: "MANUFACTURER", confidence: 0.92 };
  }

  if (/(brand|make|trade_name|trademark)/i.test(norm)) {
    return { guess: "BRAND", confidence: 0.92 };
  }

  if (/(category|class|subclass|dept|family|group|type)/i.test(norm)) {
    return { guess: "CATEGORY", confidence: 0.88 };
  }

  if (/(desc|description|title|name|spec|summary)/i.test(norm)) {
    return { guess: "DESCRIPTION", confidence: 0.94 };
  }

  if (/(material|mat|body|alloy|metal)/i.test(norm)) {
    return { guess: "MATERIAL", confidence: 0.9 };
  }

  if (/(size|dim|dimension|diameter|len|length|width|height|od|id)/i.test(norm)) {
    return { guess: "SIZE", confidence: 0.88 };
  }

  if (/(thread|npt|bsp|fitting_thread)/i.test(norm)) {
    return { guess: "THREAD", confidence: 0.88 };
  }

  if (/(pressure|psi|bar|rating)/i.test(norm)) {
    return { guess: "PRESSURE", confidence: 0.88 };
  }

  if (/(weight|wt|mass|lbs|kg)/i.test(norm)) {
    return { guess: "WEIGHT", confidence: 0.88 };
  }

  if (/(model|series|version)/i.test(norm)) {
    return { guess: "MODEL", confidence: 0.85 };
  }

  if (/(price|cost|msrp|list_price)/i.test(norm)) {
    return { guess: "PRICE", confidence: 0.95 };
  }

  // Check sample values if header didn't give strong match
  for (const sample of samples) {
    if (/^[A-Z0-9]{3,5}-[0-9]{3,5}-[A-Z0-9]{1,3}$/i.test(sample)) {
      return { guess: "PRODUCT_ID", confidence: 0.75 };
    }
    if (/(brass|bronze|steel|stainless|pvc|aluminum|copper|iron|titanium)/i.test(sample)) {
      return { guess: "MATERIAL", confidence: 0.8 };
    }
    if (/\b(psi|bar|kpa)\b/i.test(sample)) {
      return { guess: "PRESSURE", confidence: 0.8 };
    }
  }

  return { guess: "UNKNOWN", confidence: 0.2 };
}
