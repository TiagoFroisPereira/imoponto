import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useAdminLogs() {
  const { user } = useAuth();

  const logAction = async (
    actionType: string,
    targetUserId?: string,
    targetEntityId?: string,
    details?: Record<string, unknown>
  ) => {
    if (!user) return;
    const { error } = await supabase.from("admin_logs").insert({
      admin_id: user.id,
      action_type: actionType,
      target_user_id: targetUserId || null,
      target_entity_id: targetEntityId || null,
      details: details || {},
    } as any);
    if (error) console.error("[AdminLog] Error:", error);
  };

  return { logAction };
}
