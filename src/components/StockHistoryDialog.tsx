import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useStockMovements } from "@/hooks/useStockMovements";
import { Skeleton } from "@/components/ui/skeleton";

interface StockHistoryDialogProps {
  productId: string | null;
  productName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StockHistoryDialog({ productId, productName, open, onOpenChange }: StockHistoryDialogProps) {
  const { movements, loading } = useStockMovements(productId ?? undefined);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Stock History — {productName}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : movements.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No stock movements recorded yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Change</TableHead>
                <TableHead className="text-right">New Qty</TableHead>
                <TableHead>Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.map(m => (
                <TableRow key={m.id}>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(m.created_at).toLocaleDateString()}{" "}
                    {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={m.change_amount > 0 ? "default" : "destructive"} className="text-xs">
                      {m.change_amount > 0 ? `+${m.change_amount}` : m.change_amount}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm">{m.new_quantity}</TableCell>
                  <TableCell className="text-xs capitalize">{m.reason}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
}
