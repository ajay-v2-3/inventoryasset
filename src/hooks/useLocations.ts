import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface Location {
  id: string;
  name: string;
  address: string;
}

export function useLocations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchLocations = useCallback(async () => {
    const { data, error } = await supabase
      .from("locations" as any)
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Failed to load locations");
    } else {
      setLocations(
        ((data as any[]) ?? []).map((l) => ({
          id: l.id,
          name: l.name,
          address: l.address ?? "",
        }))
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const addLocation = useCallback(
    async (loc: Omit<Location, "id">) => {
      if (!user) return;
      const { data, error } = await supabase
        .from("locations" as any)
        .insert({ ...loc, user_id: user.id } as any)
        .select()
        .single();
      if (error) {
        toast.error("Failed to add location");
      } else {
        const d = data as any;
        setLocations((prev) => [{ id: d.id, name: d.name, address: d.address ?? "" }, ...prev]);
        toast.success(`Location "${loc.name}" created`);
      }
    },
    [user]
  );

  const updateLocation = useCallback(
    async (id: string, updates: Partial<Omit<Location, "id">>) => {
      const { error } = await supabase.from("locations" as any).update(updates as any).eq("id", id);
      if (error) {
        toast.error("Failed to update location");
      } else {
        setLocations((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));
        toast.success("Location updated");
      }
    },
    []
  );

  const deleteLocation = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("locations" as any).delete().eq("id", id);
      if (error) {
        toast.error("Failed to delete location");
      } else {
        setLocations((prev) => prev.filter((l) => l.id !== id));
        toast.success("Location deleted");
      }
    },
    []
  );

  return { locations, loading, addLocation, updateLocation, deleteLocation };
}
