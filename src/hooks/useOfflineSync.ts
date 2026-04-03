import { useState, useEffect, useCallback } from "react";
import { get, set } from "idb-keyval";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PENDING_KEY = "offline-pending-ops";

interface PendingOp {
  id: string;
  table: string;
  type: "insert" | "update" | "delete";
  payload: Record<string, unknown>;
  createdAt: number;
}

export function useOnlineStatus() {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  return online;
}

export function useOfflineSync() {
  const online = useOnlineStatus();
  const [syncing, setSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const loadPendingCount = useCallback(async () => {
    const ops: PendingOp[] = (await get(PENDING_KEY)) ?? [];
    setPendingCount(ops.length);
  }, []);

  useEffect(() => {
    loadPendingCount();
  }, [loadPendingCount]);

  const addPendingOp = useCallback(
    async (op: Omit<PendingOp, "id" | "createdAt">) => {
      const ops: PendingOp[] = (await get(PENDING_KEY)) ?? [];
      ops.push({ ...op, id: crypto.randomUUID(), createdAt: Date.now() });
      await set(PENDING_KEY, ops);
      setPendingCount(ops.length);
    },
    []
  );

  const syncPending = useCallback(async () => {
    const ops: PendingOp[] = (await get(PENDING_KEY)) ?? [];
    if (ops.length === 0) return;

    setSyncing(true);
    const remaining: PendingOp[] = [];

    for (const op of ops) {
      try {
        if (op.type === "insert") {
          const { error } = await supabase.from(op.table as any).insert(op.payload as any);
          if (error) throw error;
        } else if (op.type === "update") {
          const { id: rowId, ...updates } = op.payload;
          const { error } = await supabase.from(op.table as any).update(updates as any).eq("id", rowId as string);
          if (error) throw error;
        } else if (op.type === "delete") {
          const { error } = await supabase.from(op.table as any).delete().eq("id", op.payload.id as string);
          if (error) throw error;
        }
      } catch {
        remaining.push(op);
      }
    }

    await set(PENDING_KEY, remaining);
    setPendingCount(remaining.length);
    setSyncing(false);

    const synced = ops.length - remaining.length;
    if (synced > 0) {
      toast.success(`Synced ${synced} offline change${synced > 1 ? "s" : ""}`);
    }
    if (remaining.length > 0) {
      toast.error(`${remaining.length} change${remaining.length > 1 ? "s" : ""} failed to sync`);
    }
  }, []);

  // Auto-sync when coming back online
  useEffect(() => {
    if (online && pendingCount > 0) {
      syncPending();
    }
  }, [online, pendingCount, syncPending]);

  return { online, syncing, pendingCount, addPendingOp, syncPending };
}

// Cache helpers for offline data browsing
export async function cacheData(key: string, data: unknown) {
  await set(`cache-${key}`, { data, timestamp: Date.now() });
}

export async function getCachedData<T>(key: string): Promise<T | null> {
  const cached = await get(`cache-${key}`);
  return cached ? (cached as { data: T }).data : null;
}
