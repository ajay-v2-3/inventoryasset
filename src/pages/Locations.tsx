import { useState } from "react";
import { Plus, Pencil, Trash2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useLocations, type Location } from "@/hooks/useLocations";

export default function Locations() {
  const { locations, addLocation, updateLocation, deleteLocation } = useLocations();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Location | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  const openNew = () => { setEditing(null); setName(""); setAddress(""); setDialogOpen(true); };
  const openEdit = (loc: Location) => { setEditing(loc); setName(loc.name); setAddress(loc.address); setDialogOpen(true); };

  const handleSave = async () => {
    if (!name.trim()) return;
    if (editing) {
      await updateLocation(editing.id, { name: name.trim(), address: address.trim() });
    } else {
      await addLocation({ name: name.trim(), address: address.trim() });
    }
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Locations</h1>
          <p className="text-sm text-muted-foreground">{locations.length} locations configured</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4 mr-1" /> Add Location
        </Button>
      </div>

      <div className="bg-card rounded-xl shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Address</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {locations.map((loc) => (
              <TableRow key={loc.id}>
                <TableCell className="font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  {loc.name}
                </TableCell>
                <TableCell className="text-muted-foreground">{loc.address || "—"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(loc)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setDeleteId(loc.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {locations.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">No locations yet. Add your first warehouse or branch.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Location" : "Add Location"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Main Warehouse" />
            </div>
            <div>
              <Label>Address</Label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g. 123 Industrial Ave" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!name.trim()}>{editing ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete location?</AlertDialogTitle>
            <AlertDialogDescription>Products assigned to this location will become unassigned.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteId) deleteLocation(deleteId); setDeleteId(null); }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
