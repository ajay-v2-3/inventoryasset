import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { LOW_STOCK_THRESHOLD } from "@/lib/store";

export function useLowStockNotifications() {
  const { user } = useAuth();
  const [notified, setNotified] = useState<Set<string>>(new Set());

  const checkLowStock = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("products")
      .select("id, product_name, quantity")
      .lte("quantity", LOW_STOCK_THRESHOLD);

    if (data) {
      data.forEach(p => {
        if (!notified.has(p.id)) {
          toast.warning(`Low stock: ${p.product_name} (${p.quantity} left)`, { duration: 8000 });
          setNotified(prev => new Set(prev).add(p.id));
        }
      });
    }
  }, [user, notified]);

  useEffect(() => {
    checkLowStock();

    const channel = supabase
      .channel("low-stock")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => {
        checkLowStock();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [checkLowStock]);
}
