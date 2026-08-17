/**
 * Unit standardization and measurement normalizer.
 * Standardizes common industrial dimensions, pressures, weights, and threads.
 */

export interface NormalizedDimension {
  numericValue: number;
  unit: string;
  formatted: string;
}

/**
 * Standardize fractions like 3/8 -> 0.375 in, 1/2 -> 0.5 in, 3/4 -> 0.75 in
 */
export function normalizeMeasurement(raw: string): string {
  if (!raw || typeof raw !== "string") return "";
  const trimmed = raw.trim();

  // Fraction check: e.g. "3/8", "3/8 in", "3/8\"", "0.375 inch"
  const fracMatch = trimmed.match(/^(\d+)\/(\d+)\s*(in|inch|inches|"|'')?$/i);
  if (fracMatch) {
    const num = parseInt(fracMatch[1], 10);
    const den = parseInt(fracMatch[2], 10);
    if (den !== 0) {
      const val = num / den;
      return `${val} in`;
    }
  }

  // Fraction with leading integer: e.g. "1 1/2 in", "1-1/2 inch"
  const mixedFracMatch = trimmed.match(/^(\d+)[\s|-]+(\d+)\/(\d+)\s*(in|inch|inches|"|'')?$/i);
  if (mixedFracMatch) {
    const whole = parseInt(mixedFracMatch[1], 10);
    const num = parseInt(mixedFracMatch[2], 10);
    const den = parseInt(mixedFracMatch[3], 10);
    if (den !== 0) {
      const val = whole + num / den;
      return `${val} in`;
    }
  }

  // Inch quotes e.g. 0.375" or 0.375 inch -> 0.375 in
  const inchMatch = trimmed.match(/^([\d.]+)\s*(in|inch|inches|"|'')?$/i);
  if (inchMatch && inchMatch[1]) {
    const val = parseFloat(inchMatch[1]);
    if (!isNaN(val)) {
      return `${val} in`;
    }
  }

  // Pressure check: e.g. 125psi, 125 PSI, 125 # -> 125 PSI
  const pressureMatch = trimmed.match(/^([\d.]+)\s*(psi|#|bar|kpa|lbs\/in2)?$/i);
  if (pressureMatch) {
    const val = parseFloat(pressureMatch[1]);
    if (!isNaN(val)) {
      const unit = (pressureMatch[2] || "").toLowerCase() === "bar" ? "BAR" : "PSI";
      return `${val} ${unit}`;
    }
  }

  // Weight check: e.g. 0.25 lbs, 0.25lb, 0.25 LBS -> 0.25 lb
  const weightMatch = trimmed.match(/^([\d.]+)\s*(lbs|lb|pound|pounds|kg|g)?$/i);
  if (weightMatch) {
    const val = parseFloat(weightMatch[1]);
    if (!isNaN(val)) {
      const unit = (weightMatch[2] || "").toLowerCase().includes("kg") ? "kg" : "lb";
      return `${val} ${unit}`;
    }
  }

  return trimmed;
}

/**
 * Standardizes common industrial material names.
 */
export function normalizeMaterial(raw: string): string {
  if (!raw) return "";
  const t = raw.trim().toLowerCase();

  if (/(brass|c36000|yellow brass)/i.test(t)) return "Brass";
  if (/(bronze|c93200|bearing bronze|cast bronze)/i.test(t)) return "Bronze";
  if (/(ss316|316ss|316 stainless|316 st-st)/i.test(t)) return "316 Stainless Steel";
  if (/(ss304|304ss|304 stainless|304 st-st)/i.test(t)) return "304 Stainless Steel";
  if (/(stainless|ss|st-st)/i.test(t)) return "Stainless Steel";
  if (/(carbon steel|cs|a105)/i.test(t)) return "Carbon Steel";
  if (/(pvc|polyvinyl)/i.test(t)) return "PVC";
  if (/(cpvc)/i.test(t)) return "CPVC";
  if (/(ductile iron|di)/i.test(t)) return "Ductile Iron";
  if (/(cast iron|ci)/i.test(t)) return "Cast Iron";
  if (/(aluminum|al)/i.test(t)) return "Aluminum";
  if (/(copper|cu)/i.test(t)) return "Copper";
  if (/(ptfe|teflon)/i.test(t)) return "PTFE";

  // Title case fallback
  return raw
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Standardizes thread types.
 */
export function normalizeThread(raw: string): string {
  if (!raw) return "";
  const t = raw.trim().toUpperCase();

  if (t.includes("NPTF")) return "NPTF";
  if (t.includes("NPT")) return "NPT";
  if (t.includes("BSPP") || t.includes("G ")) return "BSPP";
  if (t.includes("BSPT") || t.includes("R ")) return "BSPT";
  if (t.includes("FEMALE") || t.includes("FPT")) return "Female NPT";
  if (t.includes("MALE") || t.includes("MPT")) return "Male NPT";
  if (t.includes("METRIC")) return "Metric";

  return t;
}
