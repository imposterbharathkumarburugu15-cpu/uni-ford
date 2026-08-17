import type { SemanticGuess } from "../ingestion/workbookProfiler";

export interface CanonicalFieldDefinition {
  key: string;
  label: string;
  aliases: string[];
  description: string;
  required: boolean;
}

export const CANONICAL_FIELDS: CanonicalFieldDefinition[] = [
  {
    key: "product_id",
    label: "Product ID / Part #",
    aliases: ["part_num", "part_number", "part_no", "sku", "sku_id", "item_number", "item_no", "product_id", "id", "part_code"],
    description: "Primary identifier for the part or product",
    required: true,
  },
  {
    key: "mpn",
    label: "Manufacturer Part # (MPN)",
    aliases: ["mpn", "mfg_part_num", "mfg_part_no", "mfg_pn", "manufacturer_part_number"],
    description: "Manufacturer given part number",
    required: false,
  },
  {
    key: "name",
    label: "Product Name / Title",
    aliases: ["name", "product_name", "title", "item_name", "short_desc"],
    description: "Display name or short descriptor",
    required: false,
  },
  {
    key: "manufacturer",
    label: "Manufacturer",
    aliases: ["mfg", "manufacturer", "manufacturer_name", "maker", "vendor", "supplier"],
    description: "Brand or manufacturing entity",
    required: false,
  },
  {
    key: "brand",
    label: "Brand",
    aliases: ["brand", "brand_name", "make", "trademark"],
    description: "Product brand",
    required: false,
  },
  {
    key: "category",
    label: "Category / Class",
    aliases: ["category", "class", "product_class", "subclass", "dept", "group", "product_family"],
    description: "Product taxonomy category",
    required: false,
  },
  {
    key: "description",
    label: "Product Description",
    aliases: ["description", "part_desc", "product_description", "spec", "long_desc", "details"],
    description: "Full text product description or specification",
    required: false,
  },
  {
    key: "material",
    label: "Material",
    aliases: ["material", "mat", "construction", "body_material", "alloy"],
    description: "Primary physical material (Brass, Stainless Steel, Bronze, etc.)",
    required: false,
  },
  {
    key: "size",
    label: "Size / Dimension",
    aliases: ["size", "dim", "dimension", "diameter", "od", "id", "pipe_size", "port_size"],
    description: "Physical dimensions or fitting size",
    required: false,
  },
  {
    key: "thread",
    label: "Thread Type",
    aliases: ["thread", "npt", "bsp", "thread_type", "connection"],
    description: "Thread specification (e.g. NPT, BSPP, Male, Female)",
    required: false,
  },
  {
    key: "pressure",
    label: "Pressure Rating",
    aliases: ["pressure", "psi", "bar", "pressure_rating", "max_pressure"],
    description: "Pressure rating or tolerance",
    required: false,
  },
  {
    key: "weight",
    label: "Weight",
    aliases: ["weight", "wt", "mass", "lbs", "kg"],
    description: "Product weight",
    required: false,
  },
  {
    key: "model",
    label: "Model / Series",
    aliases: ["model", "model_number", "series", "version"],
    description: "Model series designation",
    required: false,
  },
  {
    key: "price",
    label: "Price / Cost",
    aliases: ["price", "cost", "list_price", "msrp", "unit_price"],
    description: "Catalog pricing",
    required: false,
  },
];

export interface ColumnMapping {
  excelColumn: string;
  sheetName: string;
  canonicalField: string; // key from CANONICAL_FIELDS or 'unmapped'
  confidence: number; // 0 to 1
  isUserOverridden: boolean;
  matchingMethod: "EXACT" | "ALIAS" | "FUZZY" | "SEMANTIC_GUESS" | "USER";
}

/**
 * Maps Excel columns to canonical fields.
 */
export function generateColumnMappings(
  sheetName: string,
  headers: string[],
  semanticGuesses: Record<string, SemanticGuess>,
): Record<string, ColumnMapping> {
  const mappings: Record<string, ColumnMapping> = {};
  const usedCanonical = new Set<string>();

  headers.forEach((header) => {
    const norm = header.toLowerCase().trim().replace(/[^a-z0-9]/g, "_");

    // 1. Exact match against canonical keys
    const exactMatch = CANONICAL_FIELDS.find((f) => f.key === norm);
    if (exactMatch && !usedCanonical.has(exactMatch.key)) {
      mappings[header] = {
        excelColumn: header,
        sheetName,
        canonicalField: exactMatch.key,
        confidence: 1.0,
        isUserOverridden: false,
        matchingMethod: "EXACT",
      };
      usedCanonical.add(exactMatch.key);
      return;
    }

    // 2. Alias match
    const aliasMatch = CANONICAL_FIELDS.find((f) =>
      f.aliases.some((alias) => alias === norm || norm.includes(alias)),
    );
    if (aliasMatch && !usedCanonical.has(aliasMatch.key)) {
      mappings[header] = {
        excelColumn: header,
        sheetName,
        canonicalField: aliasMatch.key,
        confidence: 0.9,
        isUserOverridden: false,
        matchingMethod: "ALIAS",
      };
      usedCanonical.add(aliasMatch.key);
      return;
    }

    // 3. Semantic Guess from profiler
    const guess = semanticGuesses[header];
    if (guess && guess !== "UNKNOWN") {
      const guessKey = guess.toLowerCase();
      const matchedField = CANONICAL_FIELDS.find(
        (f) => f.key === guessKey || f.aliases.includes(guessKey),
      );
      if (matchedField && !usedCanonical.has(matchedField.key)) {
        mappings[header] = {
          excelColumn: header,
          sheetName,
          canonicalField: matchedField.key,
          confidence: 0.8,
          isUserOverridden: false,
          matchingMethod: "SEMANTIC_GUESS",
        };
        usedCanonical.add(matchedField.key);
        return;
      }
    }

    // Default to unmapped
    mappings[header] = {
      excelColumn: header,
      sheetName,
      canonicalField: "unmapped",
      confidence: 0.0,
      isUserOverridden: false,
      matchingMethod: "FUZZY",
    };
  });

  return mappings;
}
