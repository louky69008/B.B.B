import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Supprime définitivement le compte de l'utilisateur courant :
 * 1) RPC `delete_my_account` purge les données applicatives (RLS-safe).
 * 2) supabaseAdmin supprime la ligne auth.users.
 */
export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { error: rpcError } = await supabase.rpc("delete_my_account");
    if (rpcError) throw new Error(rpcError.message);

    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authError) throw new Error(authError.message);

    return { ok: true };
  });
