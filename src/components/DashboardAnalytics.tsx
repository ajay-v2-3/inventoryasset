import { useMemo, useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { TrendingUp, TrendingDown, ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/lib/store";

interface StockMovement {
  product_id: string;
  new_quantity: number;
  change_amount: number;
  created_at: string;
}

const CHART_COLORS = [
  "hsl(217, 91%, 53%)",
  "hsl(160, 84%, 39%)",
  "hsl(38, 92%, 50%)",
  "hsl(0, 84%, 60%)",
  "hsl(280, 67%, 55%)",
];

export function DashboardAnalytics({ products }: { products: Product[] }) {
  const [movements, setMovements] = useState<StockMovement[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("stock_movements")
        .select("product_id, new_quantity, change_amount, created_at")
        .order("created_at", { ascending: true })
        .limit(1000);
      setMovements((data as StockMovement[]) ?? []);
    };
    fetch();
  }, []);

  // Inventory value over time (by month from stock movements)
  const valueTrend = useMemo(() => {
    const priceMap = new Map(products.map((p) => [p.id, p.price]));
    const monthMap = new Map<string, number>();

    movements.forEach((m) => {
      const month = m.created_at.slice(0, 7); // YYYY-MM
      const price = priceMap.get(m.product_id) ?? 0;
      const val = m.new_quantity * price;
      monthMap.set(month, (monthMap.get(month) ?? 0) + val);
    });

    // If no movements, show current snapshot
    if (monthMap.size === 0) {
      const now = new Date().toISOString().slice(0, 7);
      const total = products.reduce((s, p) => s + p.price * p.quantity, 0);
      return [{ month: now, value: Math.round(total) }];
    }

    return Array.from(monthMap, ([month, value]) => ({ month, value: Math.round(value) })).sort(
      (a, b) => a.month.localeCompare(b.month)
    );
  }, [products, movements]);

  // Category-wise spend
  const categorySpend = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((p) => map.set(p.category, (map.get(p.category) ?? 0) + p.price * p.quantity));
    return Array.from(map, ([name, value]) => ({ name, value: Math.round(value) })).sort((a, b) => b.value - a.value);
  }, [products]);

  // Monthly stock movement summary
  const monthlySummary = useMemo(() => {
    const map = new Map<string, { added: number; removed: number }>();
    movements.forEach((m) => {
      const month = m.created_at.slice(0, 7);
      const entry = map.get(month) ?? { added: 0, removed: 0 };
      if (m.change_amount > 0) entry.added += m.change_amount;
      else entry.removed += Math.abs(m.change_amount);
      map.set(month, entry);
    });
    return Array.from(map, ([month, data]) => ({ month, ...data })).sort((a, b) =>
      a.month.localeCompare(b.month)
    );
  }, [movements]);

  // Top movers / slow movers
  const movers = useMemo(() => {
    const moveCount = new Map<string, number>();
    movements.forEach((m) => {
      moveCount.set(m.product_id, (moveCount.get(m.product_id) ?? 0) + Math.abs(m.change_amount));
    });
    const productMap = new Map(products.map((p) => [p.id, p.product_name]));
    const sorted = Array.from(moveCount, ([id, total]) => ({
      name: productMap.get(id) ?? "Unknown",
      total,
    })).sort((a, b) => b.total - a.total);

    const top = sorted.slice(0, 5);
    const slow = products
      .filter((p) => !moveCount.has(p.id) || (moveCount.get(p.id) ?? 0) <= 2)
      .slice(0, 5)
      .map((p) => ({ name: p.product_name, total: moveCount.get(p.id) ?? 0 }));

    return { top, slow };
  }, [products, movements]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Inventory Value Trend */}
      <div className="bg-card rounded-xl shadow-card p-5">
        <h2 className="font-semibold text-foreground mb-4">Inventory Value Trend</h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={valueTrend}>
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, "Value"]} />
            <Line type="monotone" dataKey="value" stroke="hsl(217, 91%, 53%)" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Category Spend */}
      <div className="bg-card rounded-xl shadow-card p-5">
        <h2 className="font-semibold text-foreground mb-4">Category-wise Spend</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={categorySpend} layout="vertical">
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
            <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, "Value"]} />
            <Bar dataKey="value" radius={[0, 6, 6, 0]}>
              {categorySpend.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Stock Movements */}
      <div className="bg-card rounded-xl shadow-card p-5">
        <h2 className="font-semibold text-foreground mb-4">Monthly Stock Movements</h2>
        {monthlySummary.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No movement data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlySummary}>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="added" fill="hsl(160, 84%, 39%)" name="Added" radius={[4, 4, 0, 0]} />
              <Bar dataKey="removed" fill="hsl(0, 84%, 60%)" name="Removed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Top / Slow Movers */}
      <div className="bg-card rounded-xl shadow-card p-5">
        <Tabs defaultValue="top">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4" /> Movers
            </h2>
            <TabsList className="h-8">
              <TabsTrigger value="top" className="text-xs px-3">Top</TabsTrigger>
              <TabsTrigger value="slow" className="text-xs px-3">Slow</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="top" className="space-y-2 mt-0">
            {movers.top.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No data yet.</p>
            ) : (
              movers.top.map((m, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                  <span className="text-sm font-medium text-foreground truncate">{m.name}</span>
                  <Badge variant="default" className="shrink-0 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> {m.total} units
                  </Badge>
                </div>
              ))
            )}
          </TabsContent>
          <TabsContent value="slow" className="space-y-2 mt-0">
            {movers.slow.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">All items are moving well.</p>
            ) : (
              movers.slow.map((m, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                  <span className="text-sm font-medium text-foreground truncate">{m.name}</span>
                  <Badge variant="secondary" className="shrink-0 flex items-center gap-1">
                    <TrendingDown className="h-3 w-3" /> {m.total} units
                  </Badge>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
