import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Tells whether the given user has an active "ultra" subscription.
 * Used to decide if their photos must be displayed with a watermark.
 */
export function useIsUltra(userId: string | null | undefined) {
  const { data } = useQuery({
    queryKey: ["is_ultra", userId],
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("is_ultra", {
        _user_id: userId!,
      });
      if (error) return false;
      return Boolean(data);
    },
  });
  return Boolean(data);
}
