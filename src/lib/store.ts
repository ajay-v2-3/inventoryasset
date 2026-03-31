import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { recordStockMovement } from "@/hooks/useStockMovements";

export interface Product {
  id: string;
  product_name: string;
  category: string;
  quantity: number;
  price: number;
  supplier_name: string;
  date_added: string;
  invoice_number: string;
  vendor_gst: string;
  bill_amount: number;
}

export interface Asset {
  id: string;
  asset_name: string;
  asset_id: string;
  assigned_to: string;
  purchase_date: string;
  condition: string;
  status: "Active" | "In Repair" | "Retired";
}

export interface Activity {
  id: string;
  message: string;
  type: "product" | "asset" | "alert";
  date: string;
}

export const LOW_STOCK_THRESHOLD = 5;

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchProducts = useCallback(async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Failed to load products");
    } else {
      setProducts(
      (data ?? []).map((p: any) => ({
          id: p.id,
          product_name: p.product_name,
          category: p.category,
          quantity: p.quantity,
          price: Number(p.price),
          supplier_name: p.supplier_name,
          date_added: p.date_added,
          invoice_number: p.invoice_number ?? "",
          vendor_gst: p.vendor_gst ?? "",
          bill_amount: Number(p.bill_amount ?? 0),
        }))
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addProduct = useCallback(
    async (p: Omit<Product, "id">) => {
      if (!user) return;
      const { data, error } = await supabase
        .from("products")
        .insert({ ...p, user_id: user.id })
        .select()
        .single();
      if (error) {
        toast.error("Failed to add product");
      } else {
        setProducts((prev) => [{ ...p, id: data.id, price: Number(data.price) }, ...prev]);
        addActivity(`New product added: ${p.product_name}`, "product", user.id);
        recordStockMovement(user.id, data.id, 0, p.quantity, "initial");
      }
    },
    [user]
  );

  const updateProduct = useCallback(
    async (id: string, updates: Partial<Product>) => {
      const { error } = await supabase.from("products").update(updates).eq("id", id);
      if (error) {
        toast.error("Failed to update product");
      } else {
        // Track stock movement if quantity changed
        if (updates.quantity !== undefined && user) {
          const prev = products.find((p) => p.id === id);
          if (prev && prev.quantity !== updates.quantity) {
            recordStockMovement(user.id, id, prev.quantity, updates.quantity, "manual");
          }
        }
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
        );
      }
    },
    [user, products]
  );

  const deleteProduct = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) {
        toast.error("Failed to delete product");
      } else {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    },
    []
  );

  return { products, loading, addProduct, updateProduct, deleteProduct };
}

export function useAssets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchAssets = useCallback(async () => {
    const { data, error } = await supabase
      .from("assets")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Failed to load assets");
    } else {
      setAssets(
        (data ?? []).map((a: any) => ({
          id: a.id,
          asset_name: a.asset_name,
          asset_id: a.asset_id,
          assigned_to: a.assigned_to,
          purchase_date: a.purchase_date,
          condition: a.condition,
          status: a.status as Asset["status"],
        }))
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const addAsset = useCallback(
    async (a: Omit<Asset, "id">) => {
      if (!user) return;
      const { data, error } = await supabase
        .from("assets")
        .insert({ ...a, user_id: user.id })
        .select()
        .single();
      if (error) {
        toast.error("Failed to add asset");
      } else {
        setAssets((prev) => [{ ...a, id: data.id }, ...prev]);
        addActivity(`New asset added: ${a.asset_name}`, "asset", user.id);
      }
    },
    [user]
  );

  const updateAsset = useCallback(
    async (id: string, updates: Partial<Asset>) => {
      const { error } = await supabase.from("assets").update(updates).eq("id", id);
      if (error) {
        toast.error("Failed to update asset");
      } else {
        setAssets((prev) =>
          prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
        );
      }
    },
    []
  );

  const deleteAsset = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("assets").delete().eq("id", id);
      if (error) {
        toast.error("Failed to delete asset");
      } else {
        setAssets((prev) => prev.filter((a) => a.id !== id));
      }
    },
    []
  );

  return { assets, loading, addAsset, updateAsset, deleteAsset };
}

export function useActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("activities")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      setActivities(
        (data ?? []).map((a: any) => ({
          id: a.id,
          message: a.message,
          type: a.type as Activity["type"],
          date: a.created_at?.slice(0, 10) ?? "",
        }))
      );
    };
    fetch();
  }, []);

  return activities;
}

async function addActivity(message: string, type: Activity["type"], userId: string) {
  await supabase.from("activities").insert({ message, type, user_id: userId });
}
