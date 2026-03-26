import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { logAudit } from "@/lib/audit";
import { Shield, Users, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Navigate } from "react-router-dom";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UserWithRole {
  user_id: string;
  full_name: string | null;
  created_at: string;
  role: "admin" | "staff";
}

export default function AdminPanel() {
  const { role, user } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [pendingChange, setPendingChange] = useState<{ userId: string; newRole: "admin" | "staff"; name: string } | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    const { data: profiles, error: pErr } = await supabase.from("profiles").select("user_id, full_name, created_at");
    const { data: roles, error: rErr } = await supabase.from("user_roles").select("user_id, role");

    if (pErr || rErr) { toast.error("Failed to load users"); setLoading(false); return; }

    const roleMap = new Map(roles?.map(r => [r.user_id, r.role]) ?? []);
    setUsers((profiles ?? []).map(p => ({
      user_id: p.user_id,
      full_name: p.full_name,
      created_at: p.created_at,
      role: (roleMap.get(p.user_id) as "admin" | "staff") ?? "staff",
    })));
    setLoading(false);
  };

  useEffect(() => { if (role === "admin") fetchUsers(); }, [role]);

  const confirmRoleChange = async () => {
    if (!pendingChange) return;
    const { userId, newRole } = pendingChange;
    const { error } = await supabase.from("user_roles").update({ role: newRole }).eq("user_id", userId);
    if (error) {
      toast.error("Failed to update role");
    } else {
      toast.success("Role updated");
      logAudit("role_change", { target_user: userId, new_role: newRole });
      setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, role: newRole } : u));
    }
    setPendingChange(null);
  };

  if (role !== "admin") return <Navigate to="/" replace />;

  const filtered = users.filter(u =>
    (u.full_name ?? "").toLowerCase().includes(search.toLowerCase()) || u.user_id.includes(search)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" /> Admin Panel
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Manage users and their roles</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by name..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="bg-card rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead className="hidden md:table-cell">Joined</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Change Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No users found</TableCell></TableRow>
              ) : filtered.map(u => (
                <TableRow key={u.user_id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{u.full_name || "Unnamed"}</p>
                      <p className="text-xs text-muted-foreground font-mono">{u.user_id.slice(0, 8)}…</p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                    {new Date(u.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                      {u.role === "admin" && <Shield className="h-3 w-3 mr-1" />}
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {u.user_id === user?.id ? (
                      <span className="text-xs text-muted-foreground">You</span>
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-xs text-muted-foreground">Staff</span>
                        <Switch
                          checked={u.role === "admin"}
                          onCheckedChange={(checked) =>
                            setPendingChange({
                              userId: u.user_id,
                              newRole: checked ? "admin" : "staff",
                              name: u.full_name || "Unnamed",
                            })
                          }
                        />
                        <span className="text-xs text-muted-foreground">Admin</span>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-card p-5">
        <div className="flex items-center gap-2 mb-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold text-foreground text-sm">Role Summary</h2>
        </div>
        <div className="flex gap-4 text-sm">
          <span className="text-muted-foreground">Admins: <strong className="text-foreground">{users.filter(u => u.role === "admin").length}</strong></span>
          <span className="text-muted-foreground">Staff: <strong className="text-foreground">{users.filter(u => u.role === "staff").length}</strong></span>
          <span className="text-muted-foreground">Total: <strong className="text-foreground">{users.length}</strong></span>
        </div>
      </div>

      <AlertDialog open={!!pendingChange} onOpenChange={() => setPendingChange(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Role Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change <strong>{pendingChange?.name}</strong>'s role to <strong>{pendingChange?.newRole}</strong>?
              {pendingChange?.newRole === "admin" && " This will grant full administrative privileges."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRoleChange}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
