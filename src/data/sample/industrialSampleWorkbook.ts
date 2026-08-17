import * as XLSX from "xlsx";

/**
 * Generates an in-memory sample industrial Excel workbook ArrayBuffer containing
 * multi-sheet supplier catalogs, materials, pressure ratings, and conflict scenarios.
 */
export function generateSampleIndustrialWorkbook(): ArrayBuffer {
  const productsSheet = [
    ["PART_NUM", "CLASS", "PART_DESC", "BRAND", "MATERIAL", "SIZE", "THREAD", "PRESSURE", "WEIGHT", "LIST_PRICE"],
    ["VND-992-B", "Pipe Fittings", "Threaded Coupling 3/8 NPT 125 PSI Brass", "UNIFORGE Industrial", "BRASS", "3/8", "NPT", "125 PSI", "0.25 lb", "$14.50"],
    ["VND-992-B", "Pipe Fittings", "Threaded Coupling 3/8 NPT 125 PSI Bronze Spec", "UNIFORGE Industrial", "BRONZE", "3/8 in", "NPT", "125 #", "0.26 lb", "$15.20"],
    ["VND-992-B", "Pipe Fittings", "Heavy Duty Threaded Coupling 3/8 NPT Bronze", "Apex Engineering", "BRONZE", "0.375 inch", "NPT", "125 PSI", "0.27 lb", "$15.50"],
    ["VND-104-A", "Valves", "316 Stainless Steel Ball Valve 1/2 in 1000 WOG", "Apex Engineering", "316 SS", "1/2", "Female NPT", "1000 PSI", "1.10 lb", "$48.00"],
    ["VND-104-A", "Valves", "Stainless Ball Valve 1/2 NPT 1000 WOG Full Port", "Apex Engineering", "Stainless Steel", "0.5 inch", "NPT", "1000 PSI", "1.12 lb", "$49.50"],
    ["VND-550-X", "Instrumentation", "Digital Pressure Sensor 0-250 PSI 1/4 NPT", "Precision Sensors", "Stainless Steel", "1/4", "NPT", "250 PSI", "0.45 lb", "$185.00"],
    ["VND-881-C", "Pipe Fittings", "Ductile Iron Flanged Elbow 2 inch 300#", "IronWorks Corp", "Ductile Iron", "2 in", "Flanged", "300 PSI", "8.50 lb", "$62.00"],
    ["VND-881-C", "Pipe Fittings", "Ductile Iron Flanged 90 Deg Elbow 2 in 300 PSI", "IronWorks Corp", "Ductile Iron", "2", "Flanged", "300#", "8.45 lb", "$63.10"],
    ["VND-302-P", "Pipe Fittings", "PVC Schedule 80 Union 1 in Socket", "Plastix Industrial", "PVC", "1 in", "Socket", "150 PSI", "0.35 lb", "$12.80"],
  ];

  const specsSheet = [
    ["ITEM_CODE", "MFG_NAME", "SPEC_DESCRIPTION", "ALLOY_GRADE", "MAX_PRESSURE", "CERTIFICATION"],
    ["VND-992-B", "UNIFORGE Corp", "Precision Machined Pipe Coupling", "C36000 Brass", "125 PSI", "ASME B16.14 / ASTM B16"],
    ["VND-104-A", "Apex Engineering", "High Pressure Full Port Ball Valve", "ASTM A351 CF8M", "1000 PSI", "API 598 / NACE MR0175"],
    ["VND-550-X", "Precision Sensors", "Piezoelectric Pressure Transmitter", "316L SS Wetted", "250 PSI", "CE / RoHS / ISO 9001"],
  ];

  const wb = XLSX.utils.book_new();

  const ws1 = XLSX.utils.aoa_to_sheet(productsSheet);
  XLSX.utils.book_append_sheet(wb, ws1, "Supplier Catalog");

  const ws2 = XLSX.utils.aoa_to_sheet(specsSheet);
  XLSX.utils.book_append_sheet(wb, ws2, "Engineering Specs");

  return XLSX.write(wb, { bookType: "xlsx", type: "array" });
}
