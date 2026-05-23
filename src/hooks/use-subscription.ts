import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { getTierConfig, type Tier } from "@/lib/subscriptions";

export function useSubscription() {
  const { user } = useAuth();
  const { data } = useQuery({
    queryKey: ["subscription", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("subscriptions")
        .select("tier, expires_at")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (!data) return { tier: "free" as Tier, expires_at: null };
      // Vérif expiration
      if (data.expires_at && new Date(data.expires_at).getTime() < Date.now()) {
        return { tier: "free" as Tier, expires_at: null };
      }
      return data as { tier: Tier; expires_at: string | null };
    },
  });
  const tier = data?.tier ?? "free";
  return { tier, config: getTierConfig(tier), expiresAt: data?.expires_at ?? null };
}
