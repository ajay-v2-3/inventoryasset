import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ClipboardList, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Navigate } from "react-router-dom";

interface AuditEntry {
  id: string;
  user_id: string;
  action: string;
  details: Record<string, unknown>;
  created_at: string;
  user_name?: string;
}

const ACTION_COLORS: Record<string, string> = {
  login: "default",
  signup: "default",
  role_change: "destructive",
  logout: "secondary",
};

export default function AuditLog() {
  const { role } = useAuth();
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role !== "admin") return;

    const fetchLogs = async () => {
      setLoading(true);
      const { data: logs, error: logErr } = await supabase
        .from("audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name");

      if (logErr) {
        setLoading(false);
        return;
      }

      const nameMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) ?? []);

      setEntries(
        (logs ?? []).map(l => ({
          ...l,
          details: (l.details as Record<string, unknown>) ?? {},
          user_name: nameMap.get(l.user_id) ?? "Unknown",
        }))
      );
      setLoading(false);
    };

    fetchLogs();
  }, [role]);

  if (role !== "admin") return <Navigate to="/" replace />;

  const filtered = entries.filter(e => {
    const matchesSearch =
      (e.user_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      e.action.toLowerCase().includes(search.toLowerCase());
    const matchesAction = actionFilter === "all" || e.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const uniqueActions = [...new Set(entries.map(e => e.action))];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-primary" /> Activity Audit Log
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Track user logins, role changes, and key actions</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by user or action..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-36 h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              {uniqueActions.map(a => (
                <SelectItem key={a} value={a}>{a.replace("_", " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead className="hidden md:table-cell">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No audit entries found</TableCell></TableRow>
              ) : filtered.map(e => (
                <TableRow key={e.id}>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {new Date(e.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-foreground text-sm">{e.user_name}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={(ACTION_COLORS[e.action] as "default" | "destructive" | "secondary") ?? "outline"}>
                      {e.action.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-xs text-muted-foreground max-w-xs truncate">
                    {Object.keys(e.details).length > 0 ? JSON.stringify(e.details) : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-card p-5">
        <h2 className="font-semibold text-foreground text-sm mb-2">Summary</h2>
        <div className="flex flex-wrap gap-4 text-sm">
          {uniqueActions.map(a => (
            <span key={a} className="text-muted-foreground">
              {a.replace("_", " ")}: <strong className="text-foreground">{entries.filter(e => e.action === a).length}</strong>
            </span>
          ))}
          <span className="text-muted-foreground">Total: <strong className="text-foreground">{entries.length}</strong></span>
        </div>
      </div>
    </div>
  );
}
