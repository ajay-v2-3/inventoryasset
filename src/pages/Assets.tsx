import { useState, useMemo } from "react";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AssetDialog } from "@/components/AssetDialog";
import { useAssets, type Asset } from "@/lib/store";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const statusFilter = ["All", "Active", "In Repair", "Retired"];

const statusVariant = (s: string) => {
  if (s === "Active") return "default" as const;
  if (s === "In Repair") return "secondary" as const;
  return "destructive" as const;
};

export default function Assets() {
  const { assets, addAsset, updateAsset, deleteAsset } = useAssets();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Asset | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return assets.filter(a => {
      const matchSearch = a.asset_name.toLowerCase().includes(search.toLowerCase()) || a.assigned_to.toLowerCase().includes(search.toLowerCase());
      const matchStatus = status === "All" || a.status === status;
      return matchSearch && matchStatus;
    });
  }, [assets, search, status]);

  const handleSave = (data: Omit<Asset, "id">) => {
    if (editing) {
      updateAsset(editing.id, data);
      setEditing(null);
    } else {
      addAsset(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Assets</h1>
          <p className="text-sm text-muted-foreground">{assets.length} assets tracked</p>
        </div>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Add Asset
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search assets..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            {statusFilter.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset Name</TableHead>
                <TableHead>Asset ID</TableHead>
                <TableHead className="hidden md:table-cell">Assigned To</TableHead>
                <TableHead className="hidden md:table-cell">Purchase Date</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(a => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.asset_name}</TableCell>
                  <TableCell className="font-mono text-xs">{a.asset_id}</TableCell>
                  <TableCell className="hidden md:table-cell">{a.assigned_to}</TableCell>
                  <TableCell className="hidden md:table-cell">{a.purchase_date}</TableCell>
                  <TableCell>{a.condition}</TableCell>
                  <TableCell><Badge variant={statusVariant(a.status)}>{a.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => { setEditing(a); setDialogOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setDeleteId(a.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No assets found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AssetDialog open={dialogOpen} onOpenChange={setDialogOpen} asset={editing} onSave={handleSave} />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete asset?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteId) deleteAsset(deleteId); setDeleteId(null); }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
