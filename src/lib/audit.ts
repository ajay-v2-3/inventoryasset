import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

export async function logAudit(
  action: string,
  details: Record<string, Json> = {}
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("audit_log").insert([{
    user_id: user.id,
    action,
    details: details as Json,
  }]);
}
