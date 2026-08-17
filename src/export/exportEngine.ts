import * as XLSX from "xlsx";
import type { CanonicalProductDNA } from "../canonical/productDNAService";

export function exportCanonicalDataToCSV(dnaList: CanonicalProductDNA[], includeProvenance = true): string {
  const rows: Record<string, any>[] = [];

  dnaList.forEach((dna) => {
    dna.attributes.forEach((attr) => {
      const rowObj: Record<string, any> = {
        product_id: dna.productId,
        product_name: dna.name,
        category: dna.category,
        taxonomy_path: dna.taxonomyPath,
        attribute: attr.label,
        canonical_value: attr.canonicalValue,
        confidence_percent: `${(attr.confidence * 100).toFixed(0)}%`,
        verification_status: attr.verificationState,
      };

      if (includeProvenance) {
        rowObj.original_value = attr.originalValue;
        rowObj.source_file = attr.sourceFile;
        rowObj.source_sheet = attr.sourceSheet;
        rowObj.source_row = attr.sourceRow;
        rowObj.source_col = attr.sourceCol;
        rowObj.enrichment_state = attr.enrichmentState;
      }

      rows.push(rowObj);
    });
  });

  if (rows.length === 0) return "";

  const headers = Object.keys(rows[0]);
  const csvLines = [headers.join(",")];

  rows.forEach((r) => {
    const line = headers.map((h) => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(",");
    csvLines.push(line);
  });

  return csvLines.join("\n");
}

export function downloadFile(content: string | Blob, filename: string, mimeType: string) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportCanonicalDataToJSON(dnaList: CanonicalProductDNA[]): string {
  return JSON.stringify(dnaList, null, 2);
}

export function exportCanonicalDataToExcel(dnaList: CanonicalProductDNA[], filename = "canonical_product_dna.xlsx") {
  const flattenedRows: Record<string, any>[] = [];

  dnaList.forEach((dna) => {
    const rowObj: Record<string, any> = {
      PRODUCT_ID: dna.productId,
      PRODUCT_NAME: dna.name,
      CATEGORY: dna.category,
      TAXONOMY_PATH: dna.taxonomyPath,
      VERIFICATION_STATE: dna.pipelineStage,
      CONFIDENCE: `${((dna.confidence || 0) * 100).toFixed(0)}%`,
    };

    dna.attributes.forEach((attr) => {
      rowObj[attr.label] = attr.canonicalValue;
    });

    flattenedRows.push(rowObj);
  });

  const worksheet = XLSX.utils.json_to_sheet(flattenedRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Canonical Product DNA");

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  downloadFile(
    new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
    filename,
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
}

export function exportRawRowsToCsv(rows: Record<string, any>[], filename: string) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csvLines = [headers.join(",")];

  rows.forEach((r) => {
    const line = headers.map((h) => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(",");
    csvLines.push(line);
  });

  const csvContent = csvLines.join("\n");
  downloadFile(csvContent, filename, "text/csv;charset=utf-8;");
}

export function exportRawRowsToExcel(rows: Record<string, any>[], filename: string) {
  if (rows.length === 0) return;
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Delivery Format");

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  downloadFile(
    new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
    filename,
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
}
