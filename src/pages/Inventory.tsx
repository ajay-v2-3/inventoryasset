import { useState, useMemo, useRef } from "react";
import { Plus, Search, Pencil, Trash2, Download, Upload, ScanLine, Filter, X, FileText, History, Layers } from "lucide-react";
import { InvoiceBill } from "@/components/InvoiceBill";
import { StockHistoryDialog } from "@/components/StockHistoryDialog";
import { BulkAdjustDialog } from "@/components/BulkAdjustDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ProductDialog } from "@/components/ProductDialog";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { useProducts, LOW_STOCK_THRESHOLD, type Product } from "@/lib/store";
import { exportProductsCSV, parseProductsCSV } from "@/lib/csv";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";

const categories = ["All", "Electronics", "Furniture", "Office Supplies", "Software", "Other"];

export default function Inventory() {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [invoiceProduct, setInvoiceProduct] = useState<Product | null>(null);
  const [historyProduct, setHistoryProduct] = useState<Product | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");

  const suppliers = useMemo(() => {
    const set = new Set(products.map(p => p.supplier_name).filter(Boolean));
    return Array.from(set).sort();
  }, [products]);

  const hasActiveFilters = priceMin || priceMax || dateFrom || dateTo || supplierFilter;

  const clearFilters = () => {
    setPriceMin(""); setPriceMax(""); setDateFrom(""); setDateTo(""); setSupplierFilter("");
  };

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.product_name.toLowerCase().includes(search.toLowerCase()) || p.supplier_name.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === "All" || p.category === category;
      const matchPriceMin = !priceMin || p.price >= Number(priceMin);
      const matchPriceMax = !priceMax || p.price <= Number(priceMax);
      const matchDateFrom = !dateFrom || p.date_added >= dateFrom;
      const matchDateTo = !dateTo || p.date_added <= dateTo;
      const matchSupplier = !supplierFilter || p.supplier_name === supplierFilter;
      return matchSearch && matchCat && matchPriceMin && matchPriceMax && matchDateFrom && matchDateTo && matchSupplier;
    });
  }, [products, search, category, priceMin, priceMax, dateFrom, dateTo, supplierFilter]);

  const handleSave = (data: Omit<Product, "id">) => {
    if (editing) {
      updateProduct(editing.id, data);
      setEditing(null);
    } else {
      addProduct(data);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const items = parseProductsCSV(text);
    let count = 0;
    for (const item of items) {
      await addProduct(item);
      count++;
    }
    toast.success(`Imported ${count} products`);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleScan = (code: string) => {
    const found = products.find(p =>
      p.product_name.toLowerCase().includes(code.toLowerCase()) ||
      p.id === code
    );
    if (found) {
      setSearch(found.product_name);
      toast.success(`Found: ${found.product_name}`);
    } else {
      toast.error(`No product found for "${code}"`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
          <p className="text-sm text-muted-foreground">{products.length} products total</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setBulkOpen(true)}>
            <Layers className="h-4 w-4 mr-1" /> Bulk Adjust
          </Button>
          <Button variant="outline" size="sm" onClick={() => setScannerOpen(true)}>
            <ScanLine className="h-4 w-4 mr-1" /> Scan
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportProductsCSV(products)}>
            <Download className="h-4 w-4 mr-1" /> Export
          </Button>
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-1" /> Import
          </Button>
          <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleImport} />
          <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-1" /> Add Product
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search products..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant={hasActiveFilters ? "default" : "outline"} size="sm" onClick={() => setFiltersOpen(!filtersOpen)} className="gap-1">
          <Filter className="h-4 w-4" /> Filters {hasActiveFilters && <Badge variant="secondary" className="ml-1 text-xs">Active</Badge>}
        </Button>
      </div>

      <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
        <CollapsibleContent>
          <div className="bg-card rounded-xl p-4 border space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Advanced Filters</h3>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs gap-1">
                  <X className="h-3 w-3" /> Clear all
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Price Range</Label>
                <div className="flex gap-2 mt-1">
                  <Input type="number" placeholder="Min" min={0} value={priceMin} onChange={e => setPriceMin(e.target.value)} className="h-8 text-sm" />
                  <Input type="number" placeholder="Max" min={0} value={priceMax} onChange={e => setPriceMax(e.target.value)} className="h-8 text-sm" />
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Date Added</Label>
                <div className="flex gap-2 mt-1">
                  <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="h-8 text-sm" />
                  <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="h-8 text-sm" />
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Supplier</Label>
                <Select value={supplierFilter} onValueChange={v => setSupplierFilter(v === "__all__" ? "" : v)}>
                  <SelectTrigger className="h-8 mt-1 text-sm"><SelectValue placeholder="All suppliers" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All suppliers</SelectItem>
                    {suppliers.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <div className="bg-card rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="hidden md:table-cell">Supplier</TableHead>
                <TableHead className="hidden md:table-cell">Date Added</TableHead>
                <TableHead className="hidden lg:table-cell">Invoice</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.product_name}</TableCell>
                  <TableCell><Badge variant="secondary">{p.category}</Badge></TableCell>
                  <TableCell className="text-right">
                    {p.quantity <= LOW_STOCK_THRESHOLD ? (
                      <Badge variant="destructive">{p.quantity}</Badge>
                    ) : p.quantity}
                  </TableCell>
                  <TableCell className="text-right">${p.price.toFixed(2)}</TableCell>
                  <TableCell className="hidden md:table-cell">{p.supplier_name}</TableCell>
                  <TableCell className="hidden md:table-cell">{p.date_added}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {p.invoice_number ? (
                      <span className="text-xs text-muted-foreground">{p.invoice_number}</span>
                    ) : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" title="Stock History" onClick={() => setHistoryProduct(p)}>
                        <History className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button size="icon" variant="ghost" title="View Invoice" onClick={() => setInvoiceProduct(p)}>
                        <FileText className="h-4 w-4 text-primary" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => { setEditing(p); setDialogOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setDeleteId(p.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No products found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <ProductDialog open={dialogOpen} onOpenChange={setDialogOpen} product={editing} onSave={handleSave} />
      <BarcodeScanner open={scannerOpen} onOpenChange={setScannerOpen} onScan={handleScan} />
      <InvoiceBill product={invoiceProduct} open={!!invoiceProduct} onOpenChange={(o) => { if (!o) setInvoiceProduct(null); }} />
      <StockHistoryDialog productId={historyProduct?.id ?? null} productName={historyProduct?.product_name ?? ""} open={!!historyProduct} onOpenChange={(o) => { if (!o) setHistoryProduct(null); }} />
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteId) deleteProduct(deleteId); setDeleteId(null); }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
