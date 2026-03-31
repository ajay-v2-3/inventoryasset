import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface StockMovement {
  id: string;
  product_id: string;
  previous_quantity: number;
  new_quantity: number;
  change_amount: number;
  reason: string;
  created_at: string;
}

export function useStockMovements(productId?: string) {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMovements = useCallback(async () => {
    let query = supabase
      .from("stock_movements")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (productId) {
      query = query.eq("product_id", productId);
    }

    const { data } = await query;
    setMovements(
      (data ?? []).map((m: any) => ({
        id: m.id,
        product_id: m.product_id,
        previous_quantity: m.previous_quantity,
        new_quantity: m.new_quantity,
        change_amount: m.change_amount,
        reason: m.reason,
        created_at: m.created_at,
      }))
    );
    setLoading(false);
  }, [productId]);

  useEffect(() => {
    fetchMovements();
  }, [fetchMovements]);

  return { movements, loading, refetch: fetchMovements };
}

export async function recordStockMovement(
  userId: string,
  productId: string,
  previousQty: number,
  newQty: number,
  reason: string = "manual"
) {
  await supabase.from("stock_movements").insert({
    user_id: userId,
    product_id: productId,
    previous_quantity: previousQty,
    new_quantity: newQty,
    change_amount: newQty - previousQty,
    reason,
  });
}
