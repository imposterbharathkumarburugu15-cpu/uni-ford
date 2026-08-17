export interface EnrichmentContext {
  productId: string;
  category: string;
  material?: string;
  productType?: string;
  size?: string;
  pressure?: string;
  thread?: string;
  manufacturer?: string;
  brand?: string;
}

export interface EnrichmentResult {
  providerName: string;
  status: "ENRICHED" | "NOT_ENRICHED" | "DATA_NOT_AVAILABLE";
  enrichedFields: Record<string, string>; // field -> value
  confidence: number;
  notes: string;
}

export interface EnrichmentProvider {
  name: string;
  id: string;
  isConfigured: boolean;
  enrich(context: EnrichmentContext): Promise<EnrichmentResult>;
}

/**
 * Local Reference Provider for standard industrial catalog lookups.
 * Enriches standard material specs & pressure temperature limits.
 */
export class LocalReferenceProvider implements EnrichmentProvider {
  name = "Industrial Standard Specs Reference";
  id = "local_industrial_ref";
  isConfigured = true;

  async enrich(context: EnrichmentContext): Promise<EnrichmentResult> {
    const enrichedFields: Record<string, string> = {};

    if (context.material === "Bronze" && context.pressure) {
      enrichedFields.max_temperature = "400°F (204°C)";
      enrichedFields.standard_compliance = "ASTM B62 / ASME B16.15";
    } else if (context.material === "316 Stainless Steel") {
      enrichedFields.max_temperature = "1000°F (538°C)";
      enrichedFields.corrosion_resistance = "Excellent (Chloride Resistant)";
      enrichedFields.standard_compliance = "ASTM A351 / ASME B16.34";
    } else if (context.material === "Brass") {
      enrichedFields.max_temperature = "250°F (121°C)";
      enrichedFields.standard_compliance = "ASTM B16 / ASME B16.14";
    }

    if (Object.keys(enrichedFields).length > 0) {
      return {
        providerName: this.name,
        status: "ENRICHED",
        enrichedFields,
        confidence: 0.95,
        notes: "Matched against local ASTM/ASME engineering reference table",
      };
    }

    return {
      providerName: this.name,
      status: "NOT_ENRICHED",
      enrichedFields: {},
      confidence: 0.0,
      notes: "No reference match found for material/specs combination",
    };
  }
}

/**
 * Global Taxonomy Provider.
 * Enriches hierarchical product taxonomy paths.
 */
export class TaxonomyProvider implements EnrichmentProvider {
  name = "UNIFORGE Global Product Taxonomy";
  id = "global_taxonomy_ref";
  isConfigured = true;

  async enrich(context: EnrichmentContext): Promise<EnrichmentResult> {
    const pType = (context.productType || context.category || "").toLowerCase();
    let taxonomyPath = "";

    if (pType.includes("coupling") || pType.includes("fitting") || pType.includes("elbow") || pType.includes("tee")) {
      taxonomyPath = "Industrial Components > Pipe Fittings > Coupling > Threaded Coupling";
    } else if (pType.includes("valve")) {
      taxonomyPath = "Industrial Components > Flow Control > Valves > Ball Valve";
    } else if (pType.includes("sensor")) {
      taxonomyPath = "Instrumentation > Process Sensors > Pressure Transmitters";
    } else {
      taxonomyPath = "Industrial Components > General Hardware";
    }

    return {
      providerName: this.name,
      status: "ENRICHED",
      enrichedFields: {
        taxonomy_path: taxonomyPath,
        taxonomy_level: "4",
      },
      confidence: 0.92,
      notes: "Classified into standard UNIFORGE industrial taxonomy tree",
    };
  }
}

/**
 * Unconfigured External Provider — returns DATA_NOT_AVAILABLE as requested.
 */
export class ExternalSupplierAPIProvider implements EnrichmentProvider {
  name = "External Supplier Catalog API v2 (Unconnected)";
  id = "ext_supplier_api";
  isConfigured = false;

  async enrich(_context: EnrichmentContext): Promise<EnrichmentResult> {
    return {
      providerName: this.name,
      status: "DATA_NOT_AVAILABLE",
      enrichedFields: {},
      confidence: 0.0,
      notes: "External provider endpoint not configured. Data not available.",
    };
  }
}
