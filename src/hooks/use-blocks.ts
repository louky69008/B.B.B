import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

/**
 * Returns a Set of user IDs that are blocked in either direction
 * (I blocked them OR they blocked me). Used to hide all interactions.
 */
export function useBlockedIds() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["blocks", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("blocks").select("blocker_id, blocked_id");
      if (error) throw error;
      const ids = new Set<string>();
      for (const b of data ?? []) {
        if (b.blocker_id === user!.id) ids.add(b.blocked_id);
        if (b.blocked_id === user!.id) ids.add(b.blocker_id);
      }
      return ids;
    },
  });
}
