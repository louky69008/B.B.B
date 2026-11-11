import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useBlockedIds } from "@/hooks/use-blocks";
import { supabase } from "@/integrations/supabase/client";

export function useMatches() {
  const { user } = useAuth();
  const { data: blockedIds, isPending: blocksPending, isError: blocksError } = useBlockedIds();
  const blocked = blockedIds ? [...blockedIds].sort() : [];
  const query = useQuery({
    queryKey: ["matches", user?.id, blocked],
    enabled: !!user && !!blockedIds && !blocksError,
    refetchInterval: 30_000,
    queryFn: async () => {
      let matches = supabase
        .from("matches")
        .select("id, user1_id, user2_id, conversation_id")
        .or(`user1_id.eq.${user!.id},user2_id.eq.${user!.id}`)
        .order("created_at", { ascending: false });
      if (blocked.length) {
        const ids = `(${blocked.join(",")})`;
        matches = matches.not("user1_id", "in", ids).not("user2_id", "in", ids);
      }
      const { data: rows, error } = await matches;
      if (error) throw error;
      if (!rows.length) return [];

      const otherId = (row: (typeof rows)[number]) =>
        row.user1_id === user!.id ? row.user2_id : row.user1_id;
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, pseudo, photo_url, anonymous_mode, age")
        .in("id", rows.map(otherId));
      if (profileError) throw profileError;
      const profilesById = new Map(profiles.map((profile) => [profile.id, profile]));
      return rows.map((row) => ({
        id: row.id,
        conversationId: row.conversation_id,
        otherId: otherId(row),
        other: profilesById.get(otherId(row)),
      }));
    },
  });

  return {
    matches: blockedIds && !blocksError ? query.data : undefined,
    isPending: blocksPending || (!!blockedIds && query.isPending),
    isError: blocksError || query.isError,
  };
}
