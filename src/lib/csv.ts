import { Product, Asset } from "@/lib/store";

export function exportProductsCSV(products: Product[]) {
  const header = "Product Name,Category,Quantity,Price,Supplier,Date Added,Invoice Number,Vendor GST,Bill Amount";
  const rows = products.map(p =>
    [p.product_name, p.category, p.quantity, p.price, p.supplier_name, p.date_added, p.invoice_number, p.vendor_gst, p.bill_amount]
      .map(v => `"${String(v).replace(/"/g, '""')}"`)
      .join(",")
  );
  downloadCSV([header, ...rows].join("\n"), "inventory-export.csv");
}

export function exportAssetsCSV(assets: Asset[]) {
  const header = "Asset Name,Asset ID,Assigned To,Purchase Date,Condition,Status";
  const rows = assets.map(a =>
    [a.asset_name, a.asset_id, a.assigned_to, a.purchase_date, a.condition, a.status]
      .map(v => `"${String(v).replace(/"/g, '""')}"`)
      .join(",")
  );
  downloadCSV([header, ...rows].join("\n"), "assets-export.csv");
}

function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseProductsCSV(text: string): Omit<Product, "id">[] {
  const lines = text.trim().split("\n").slice(1); // skip header
  return lines.filter(l => l.trim()).map(line => {
    const cols = parseCSVLine(line);
    return {
      product_name: cols[0] || "",
      category: cols[1] || "Other",
      quantity: parseInt(cols[2]) || 0,
      price: parseFloat(cols[3]) || 0,
      supplier_name: cols[4] || "",
      date_added: cols[5] || new Date().toISOString().slice(0, 10),
      invoice_number: cols[6] || "",
      vendor_gst: cols[7] || "",
      bill_amount: parseFloat(cols[8]) || 0,
    };
  });
}

export function parseAssetsCSV(text: string): Omit<Asset, "id">[] {
  const lines = text.trim().split("\n").slice(1);
  return lines.filter(l => l.trim()).map(line => {
    const cols = parseCSVLine(line);
    return {
      asset_name: cols[0] || "",
      asset_id: cols[1] || "",
      assigned_to: cols[2] || "",
      purchase_date: cols[3] || new Date().toISOString().slice(0, 10),
      condition: cols[4] || "Good",
      status: (cols[5] as Asset["status"]) || "Active",
    };
  });
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') { current += '"'; i++; }
      else if (ch === '"') { inQuotes = false; }
      else { current += ch; }
    } else {
      if (ch === '"') { inQuotes = true; }
      else if (ch === ",") { result.push(current.trim()); current = ""; }
      else { current += ch; }
    }
  }
  result.push(current.trim());
  return result;
}
