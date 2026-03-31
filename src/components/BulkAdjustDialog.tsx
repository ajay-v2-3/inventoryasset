import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import type { Product } from "@/lib/store";

interface BulkAdjustDialogProps {
  products: Product[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (adjustments: { id: string; quantity: number }[]) => Promise<void>;
}

export function BulkAdjustDialog({ products, open, onOpenChange, onApply }: BulkAdjustDialogProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [adjustments, setAdjustments] = useState<Record<string, string>>({});
  const [applying, setApplying] = useState(false);

  const toggleAll = (checked: boolean) => {
    setSelected(checked ? new Set(products.map(p => p.id)) : new Set());
  };

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const setAdj = (id: string, val: string) => {
    setAdjustments(prev => ({ ...prev, [id]: val }));
  };

  const handleApply = async () => {
    const changes = Array.from(selected)
      .map(id => {
        const raw = adjustments[id];
        if (!raw) return null;
        const product = products.find(p => p.id === id);
        if (!product) return null;
        const delta = parseInt(raw, 10);
        if (isNaN(delta) || delta === 0) return null;
        const newQty = Math.max(0, product.quantity + delta);
        return { id, quantity: newQty };
      })
      .filter(Boolean) as { id: string; quantity: number }[];

    if (changes.length === 0) {
      toast.error("No valid adjustments to apply");
      return;
    }

    setApplying(true);
    await onApply(changes);
    setApplying(false);
    setSelected(new Set());
    setAdjustments({});
    onOpenChange(false);
    toast.success(`Updated ${changes.length} product(s)`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Quantity Adjustment</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Select products and enter adjustment values (e.g. <code className="text-xs bg-muted px-1 rounded">+10</code> or <code className="text-xs bg-muted px-1 rounded">-5</code>).
        </p>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={selected.size === products.length && products.length > 0}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Current Qty</TableHead>
                <TableHead className="w-28">Adjust</TableHead>
                <TableHead className="text-right">New Qty</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map(p => {
                const delta = parseInt(adjustments[p.id] || "0", 10) || 0;
                const newQty = Math.max(0, p.quantity + delta);
                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <Checkbox checked={selected.has(p.id)} onCheckedChange={() => toggle(p.id)} />
                    </TableCell>
                    <TableCell className="font-medium text-sm">{p.product_name}</TableCell>
                    <TableCell className="text-right text-sm">{p.quantity}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        placeholder="+/-"
                        className="h-8 text-sm w-24"
                        value={adjustments[p.id] || ""}
                        onChange={e => setAdj(p.id, e.target.value)}
                        disabled={!selected.has(p.id)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      {selected.has(p.id) && adjustments[p.id] ? (
                        <Badge variant={delta >= 0 ? "default" : "destructive"} className="text-xs">
                          {newQty}
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleApply} disabled={applying || selected.size === 0}>
            {applying ? "Applying..." : `Apply to ${selected.size} product(s)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
