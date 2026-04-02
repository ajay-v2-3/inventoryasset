import { useState } from "react";
import { Download, FileText, Package, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useProducts, useAssets, LOW_STOCK_THRESHOLD } from "@/lib/store";

function downloadCSV(filename: string, headers: string[], rows: string[][]) {
  const csv = [headers.join(","), ...rows.map(r => r.map(c => `"${c}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Reports() {
  const { products } = useProducts();
  const { assets } = useAssets();
  const [tab, setTab] = useState("stock");

  const exportStock = () => {
    downloadCSV("stock_report.csv",
      ["Product", "Category", "Quantity", "Price", "Supplier", "Date Added"],
      products.map(p => [p.product_name, p.category, String(p.quantity), String(p.price), p.supplier_name, p.date_added])
    );
  };

  const exportAssets = () => {
    downloadCSV("asset_report.csv",
      ["Asset Name", "Asset ID", "Assigned To", "Purchase Date", "Condition", "Status"],
      assets.map(a => [a.asset_name, a.asset_id, a.assigned_to, a.purchase_date, a.condition, a.status])
    );
  };

  const totalValue = products.reduce((s, p) => s + p.price * p.quantity, 0);
  const lowStockCount = products.filter(p => p.quantity <= LOW_STOCK_THRESHOLD).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
        <p className="text-sm text-muted-foreground">Generate and export reports</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl shadow-card p-5 text-center">
          <p className="text-sm text-muted-foreground">Total Inventory Value</p>
          <p className="text-2xl font-bold text-foreground mt-1">₹{totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-card rounded-xl shadow-card p-5 text-center">
          <p className="text-sm text-muted-foreground">Low Stock Items</p>
          <p className="text-2xl font-bold text-destructive mt-1">{lowStockCount}</p>
        </div>
        <div className="bg-card rounded-xl shadow-card p-5 text-center">
          <p className="text-sm text-muted-foreground">Active Assets</p>
          <p className="text-2xl font-bold text-foreground mt-1">{assets.filter(a => a.status === "Active").length} / {assets.length}</p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <TabsList>
            <TabsTrigger value="stock"><Package className="h-4 w-4 mr-1.5" />Stock Report</TabsTrigger>
            <TabsTrigger value="assets"><Monitor className="h-4 w-4 mr-1.5" />Asset Report</TabsTrigger>
          </TabsList>
          <Button variant="outline" onClick={tab === "stock" ? exportStock : exportAssets}>
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>
        </div>

        <TabsContent value="stock" className="mt-4">
          <div className="bg-card rounded-xl shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total Value</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.product_name}</TableCell>
                      <TableCell>{p.category}</TableCell>
                      <TableCell className="text-right">{p.quantity}</TableCell>
                      <TableCell className="text-right">₹{p.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-medium">₹{(p.price * p.quantity).toFixed(2)}</TableCell>
                      <TableCell>
                        {p.quantity <= LOW_STOCK_THRESHOLD ? (
                          <Badge variant="destructive">Low Stock</Badge>
                        ) : (
                          <Badge variant="secondary">In Stock</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="assets" className="mt-4">
          <div className="bg-card rounded-xl shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.map(a => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.asset_name}</TableCell>
                      <TableCell className="font-mono text-xs">{a.asset_id}</TableCell>
                      <TableCell>{a.assigned_to}</TableCell>
                      <TableCell>{a.condition}</TableCell>
                      <TableCell>
                        <Badge variant={a.status === "Active" ? "default" : a.status === "In Repair" ? "secondary" : "destructive"}>
                          {a.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
