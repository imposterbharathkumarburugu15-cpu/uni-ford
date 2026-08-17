import type { ExtractedProductAttributes } from "../extraction/attributeExtractor";
import {
  ExternalSupplierAPIProvider,
  LocalReferenceProvider,
  TaxonomyProvider,
  type EnrichmentContext,
  type EnrichmentProvider,
  type EnrichmentResult,
} from "./enrichmentProviders";

export interface EnrichedProductRecord {
  entityId: string;
  providerResults: EnrichmentResult[];
  enrichedAttributes: Record<string, string>;
  taxonomyPath: string;
  enrichmentState: "FULLY_ENRICHED" | "PARTIALLY_ENRICHED" | "NOT_ENRICHED";
}

export class EnrichmentEngine {
  private providers: EnrichmentProvider[] = [
    new LocalReferenceProvider(),
    new TaxonomyProvider(),
    new ExternalSupplierAPIProvider(),
  ];

  async enrichProducts(
    extractedList: ExtractedProductAttributes[],
  ): Promise<EnrichedProductRecord[]> {
    const results: EnrichedProductRecord[] = [];

    for (const item of extractedList) {
      const context: EnrichmentContext = {
        productId: item.entityId,
        category: getAttrVal(item, "CATEGORY") || getAttrVal(item, "PRODUCT_TYPE"),
        material: getAttrVal(item, "MATERIAL"),
        productType: getAttrVal(item, "PRODUCT_TYPE"),
        size: getAttrVal(item, "SIZE"),
        pressure: getAttrVal(item, "PRESSURE"),
        thread: getAttrVal(item, "THREAD"),
        manufacturer: getAttrVal(item, "MANUFACTURER"),
        brand: getAttrVal(item, "BRAND"),
      };

      const providerResults: EnrichmentResult[] = [];
      const combinedFields: Record<string, string> = {};
      let hasEnriched = false;

      for (const provider of this.providers) {
        const res = await provider.enrich(context);
        providerResults.push(res);
        if (res.status === "ENRICHED") {
          hasEnriched = true;
          Object.assign(combinedFields, res.enrichedFields);
        }
      }

      results.push({
        entityId: item.entityId,
        providerResults,
        enrichedAttributes: combinedFields,
        taxonomyPath: combinedFields.taxonomy_path || "Industrial Components",
        enrichmentState: hasEnriched ? "FULLY_ENRICHED" : "NOT_ENRICHED",
      });
    }

    return results;
  }
}

function getAttrVal(extracted: ExtractedProductAttributes, key: string): string {
  const found = extracted.attributes.find((a) => a.key === key);
  return found ? found.value : "";
}

export const defaultEnrichmentEngine = new EnrichmentEngine();
