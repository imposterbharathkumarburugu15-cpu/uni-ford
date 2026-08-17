import * as XLSX from "xlsx";

export interface ParsedCell {
  sheetName: string;
  rowIndex: number; // 1-based (row 1 is header or first data row)
  colIndex: number; // 0-based
  colName: string;
  originalValue: string;
  rawValue: any;
  dataType: string;
}

export interface ParsedSheet {
  sheetName: string;
  headers: string[];
  rowCount: number;
  colCount: number;
  emptyCellCount: number;
  duplicateHeaders: string[];
  rows: Record<string, string>[]; // header -> raw string value
  rawMatrix: any[][];
}

export interface ParsedWorkbook {
  filename: string;
  sizeBytes: number;
  sheetNames: string[];
  sheets: Record<string, ParsedSheet>;
  totalRows: number;
  totalCols: number;
  parsedAt: string; // ISO
}

/**
 * Parses an uploaded Excel workbook or ArrayBuffer using SheetJS.
 * Preserves all original values, sheet names, row indices, and header structure.
 */
export async function parseExcelWorkbook(
  fileOrBuffer: File | ArrayBuffer,
  filenameOverride?: string,
): Promise<ParsedWorkbook> {
  let arrayBuffer: ArrayBuffer;
  let filename = filenameOverride || "uploaded_catalog.xlsx";
  let sizeBytes = 0;

  if (fileOrBuffer instanceof File) {
    filename = fileOrBuffer.name;
    sizeBytes = fileOrBuffer.size;
    arrayBuffer = await fileOrBuffer.arrayBuffer();
  } else {
    arrayBuffer = fileOrBuffer;
    sizeBytes = arrayBuffer.byteLength;
  }

  const workbook = XLSX.read(arrayBuffer, {
    type: "array",
    cellDates: true,
    cellNF: true,
    cellText: true,
  });

  const sheets: Record<string, ParsedSheet> = {};
  let totalRows = 0;
  let maxCols = 0;

  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) continue;

    const matrix: any[][] = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: "",
      raw: false,
    }) as any[][];

    if (matrix.length === 0) {
      sheets[sheetName] = {
        sheetName,
        headers: [],
        rowCount: 0,
        colCount: 0,
        emptyCellCount: 0,
        duplicateHeaders: [],
        rows: [],
        rawMatrix: [],
      };
      continue;
    }

    // Determine headers from row 0
    const rawHeaders = (matrix[0] || []).map((h, i) =>
      String(h).trim() ? String(h).trim() : `COLUMN_${i + 1}`,
    );

    // Track duplicate headers
    const headerCounts = new Map<string, number>();
    const duplicateHeaders: string[] = [];
    const headers: string[] = [];

    rawHeaders.forEach((h) => {
      const count = (headerCounts.get(h) || 0) + 1;
      headerCounts.set(h, count);
      if (count > 1) {
        if (!duplicateHeaders.includes(h)) duplicateHeaders.push(h);
        headers.push(`${h}_${count}`);
      } else {
        headers.push(h);
      }
    });

    const rows: Record<string, string>[] = [];
    let emptyCellCount = 0;

    for (let r = 1; r < matrix.length; r++) {
      const rawRow = matrix[r] || [];
      // Skip empty trailing rows
      if (rawRow.every((val: any) => val === undefined || val === null || String(val).trim() === "")) {
        continue;
      }

      const rowObj: Record<string, string> = {
        __rowNum: String(r + 1), // 1-based original sheet row index
        __sheet: sheetName,
      };

      headers.forEach((header, colIdx) => {
        const val = rawRow[colIdx];
        const strVal = val === undefined || val === null ? "" : String(val).trim();
        rowObj[header] = strVal;
        if (!strVal) emptyCellCount++;
      });

      rows.push(rowObj);
    }

    const colCount = headers.length;
    const rowCount = rows.length;

    sheets[sheetName] = {
      sheetName,
      headers,
      rowCount,
      colCount,
      emptyCellCount,
      duplicateHeaders,
      rows,
      rawMatrix: matrix,
    };

    totalRows += rowCount;
    if (colCount > maxCols) maxCols = colCount;
  }

  return {
    filename,
    sizeBytes,
    sheetNames: workbook.SheetNames,
    sheets,
    totalRows,
    totalCols: maxCols,
    parsedAt: new Date().toISOString(),
  };
}
