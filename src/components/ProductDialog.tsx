import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Product } from "@/lib/store";

const categories = ["Electronics", "Furniture", "Office Supplies", "Software", "Other"];

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSave: (data: Omit<Product, "id">) => void;
}

export function ProductDialog({ open, onOpenChange, product, onSave }: ProductDialogProps) {
  const [form, setForm] = useState({
    product_name: "",
    category: "Electronics",
    quantity: 0,
    price: 0,
    supplier_name: "",
    date_added: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    if (product) {
      setForm({
        product_name: product.product_name,
        category: product.category,
        quantity: product.quantity,
        price: product.price,
        supplier_name: product.supplier_name,
        date_added: product.date_added,
      });
    } else {
      setForm({
        product_name: "",
        category: "Electronics",
        quantity: 0,
        price: 0,
        supplier_name: "",
        date_added: new Date().toISOString().slice(0, 10),
      });
    }
  }, [product, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Add Product"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="product_name">Product Name</Label>
            <Input id="product_name" value={form.product_name} onChange={e => setForm(f => ({ ...f, product_name: e.target.value }))} required />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" type="number" min={0} value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) }))} required />
            </div>
            <div>
              <Label htmlFor="price">Price ($)</Label>
              <Input id="price" type="number" min={0} step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} required />
            </div>
          </div>
          <div>
            <Label htmlFor="supplier">Supplier Name</Label>
            <Input id="supplier" value={form.supplier_name} onChange={e => setForm(f => ({ ...f, supplier_name: e.target.value }))} required />
          </div>
          <div>
            <Label htmlFor="date">Date Added</Label>
            <Input id="date" type="date" value={form.date_added} onChange={e => setForm(f => ({ ...f, date_added: e.target.value }))} required />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{product ? "Update" : "Add"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
