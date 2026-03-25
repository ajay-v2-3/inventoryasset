import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Asset } from "@/lib/store";

const conditions = ["Excellent", "Good", "Fair", "Poor"];
const statuses: Asset["status"][] = ["Active", "In Repair", "Retired"];

interface AssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset?: Asset | null;
  onSave: (data: Omit<Asset, "id">) => void;
}

export function AssetDialog({ open, onOpenChange, asset, onSave }: AssetDialogProps) {
  const [form, setForm] = useState({
    asset_name: "",
    asset_id: "",
    assigned_to: "",
    purchase_date: new Date().toISOString().slice(0, 10),
    condition: "Good",
    status: "Active" as Asset["status"],
  });

  useEffect(() => {
    if (asset) {
      setForm({
        asset_name: asset.asset_name,
        asset_id: asset.asset_id,
        assigned_to: asset.assigned_to,
        purchase_date: asset.purchase_date,
        condition: asset.condition,
        status: asset.status,
      });
    } else {
      setForm({
        asset_name: "",
        asset_id: `AST-${String(Date.now()).slice(-4)}`,
        assigned_to: "",
        purchase_date: new Date().toISOString().slice(0, 10),
        condition: "Good",
        status: "Active",
      });
    }
  }, [asset, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{asset ? "Edit Asset" : "Add Asset"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="asset_name">Asset Name</Label>
            <Input id="asset_name" value={form.asset_name} onChange={e => setForm(f => ({ ...f, asset_name: e.target.value }))} required />
          </div>
          <div>
            <Label htmlFor="asset_id">Asset ID</Label>
            <Input id="asset_id" value={form.asset_id} onChange={e => setForm(f => ({ ...f, asset_id: e.target.value }))} required />
          </div>
          <div>
            <Label htmlFor="assigned_to">Assigned To</Label>
            <Input id="assigned_to" value={form.assigned_to} onChange={e => setForm(f => ({ ...f, assigned_to: e.target.value }))} required />
          </div>
          <div>
            <Label htmlFor="purchase_date">Purchase Date</Label>
            <Input id="purchase_date" type="date" value={form.purchase_date} onChange={e => setForm(f => ({ ...f, purchase_date: e.target.value }))} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Condition</Label>
              <Select value={form.condition} onValueChange={v => setForm(f => ({ ...f, condition: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {conditions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v: Asset["status"]) => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{asset ? "Update" : "Add"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
