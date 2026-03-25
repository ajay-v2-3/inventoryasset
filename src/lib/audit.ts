import { supabase } from "@/integrations/supabase/client";

export async function logAudit(
  action: string,
  details: Record<string, unknown> = {}
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("audit_log").insert({
    user_id: user.id,
    action,
    details,
  });
}
