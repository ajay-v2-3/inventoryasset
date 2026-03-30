import { Package, Monitor, AlertTriangle, Activity, ShoppingCart, TrendingUp } from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { useProducts, useAssets, useActivities, LOW_STOCK_THRESHOLD } from "@/lib/store";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const PIE_COLORS = [
  "hsl(217, 91%, 53%)",
  "hsl(160, 84%, 39%)",
  "hsl(38, 92%, 50%)",
  "hsl(0, 84%, 60%)",
  "hsl(280, 67%, 55%)",
];

export default function Dashboard() {
  const { products, updateProduct } = useProducts();
  const { assets } = useAssets();
  const activities = useActivities();
  const navigate = useNavigate();

  const lowStockItems = products.filter(p => p.quantity <= LOW_STOCK_THRESHOLD);
  const activeAssets = assets.filter(a => a.status === "Active").length;

  const categoryMap = new Map<string, number>();
  products.forEach(p => categoryMap.set(p.category, (categoryMap.get(p.category) || 0) + p.quantity));
  const categoryData = Array.from(categoryMap, ([name, value]) => ({ name, value }));

  const stockData = products.slice(0, 8).map(p => ({
    name: p.product_name.length > 12 ? p.product_name.slice(0, 12) + "…" : p.product_name,
    quantity: p.quantity,
  }));

  const suggestReorder = (current: number) => Math.max(20, LOW_STOCK_THRESHOLD * 4 - current);

  const handleQuickReorder = async (product: typeof products[0]) => {
    const reorderQty = suggestReorder(product.quantity);
    await updateProduct(product.id, { quantity: product.quantity + reorderQty });
    toast.success(`Restocked ${product.product_name} (+${reorderQty} units)`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Overview of your inventory and assets</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Products" value={products.length} icon={Package} variant="primary" description={`${products.reduce((s, p) => s + p.quantity, 0)} total units`} />
        <StatsCard title="Low Stock Items" value={lowStockItems.length} icon={AlertTriangle} variant="danger" description={lowStockItems.length > 0 ? "Requires attention" : "All stocked"} />
        <StatsCard title="Total Assets" value={assets.length} icon={Monitor} variant="success" description={`${activeAssets} active`} />
        <StatsCard title="Recent Activities" value={activities.length} icon={Activity} variant="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl shadow-card p-5">
          <h2 className="font-semibold text-foreground mb-4">Stock Levels</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stockData}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="quantity" fill="hsl(217, 91%, 53%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl shadow-card p-5">
          <h2 className="font-semibold text-foreground mb-4">Inventory by Category</h2>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl shadow-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-destructive" />
              Low Stock — Quick Reorder
            </h2>
            {lowStockItems.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => navigate("/inventory")}>View All</Button>
            )}
          </div>
          {lowStockItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">All products are well-stocked. 🎉</p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {lowStockItems.map(p => (
                <div key={p.id} className="flex items-center justify-between rounded-lg border p-3 gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{p.product_name}</p>
                    <p className="text-xs text-muted-foreground">{p.category} · {p.supplier_name || "No supplier"}</p>
                  </div>
                  <Badge variant="destructive" className="shrink-0">{p.quantity} left</Badge>
                  <Button size="sm" variant="outline" className="shrink-0 text-xs gap-1" onClick={() => handleQuickReorder(p)}>
                    <TrendingUp className="h-3 w-3" />
                    +{suggestReorder(p.quantity)}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card rounded-xl shadow-card p-5">
          <h2 className="font-semibold text-foreground mb-3">Recent Activity</h2>
          <div className="space-y-2">
            {activities.slice(0, 6).map(a => (
              <div key={a.id} className="flex items-start gap-3 rounded-lg border p-3">
                <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${a.type === "alert" ? "bg-destructive" : a.type === "asset" ? "bg-success" : "bg-primary"}`} />
                <div className="min-w-0">
                  <p className="text-sm text-foreground">{a.message}</p>
                  <p className="text-xs text-muted-foreground">{a.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
