import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Ban, X } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

export function BlockButton({
  targetUserId,
  className = "",
  redirectTo,
}: {
  targetUserId: string;
  className?: string;
  /** Where to send the user after a successful block (defaults to /app/grid). */
  redirectTo?: string;
}) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const { data: alreadyBlocked } = useQuery({
    queryKey: ["block-state", user?.id, targetUserId],
    enabled: !!user && !!targetUserId && user.id !== targetUserId,
    queryFn: async () => {
      const { data } = await supabase
        .from("blocks")
        .select("id")
        .eq("blocker_id", user!.id)
        .eq("blocked_id", targetUserId)
        .maybeSingle();
      return !!data;
    },
  });

  const blockMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Non connecté");
      const { error } = await supabase
        .from("blocks")
        .insert({ blocker_id: user.id, blocked_id: targetUserId });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Utilisateur bloqué. Il n'apparaîtra plus.");
      // Invalidate everything that depends on the blocked user
      qc.invalidateQueries({ queryKey: ["blocks", user?.id] });
      qc.invalidateQueries({ queryKey: ["conversations", user?.id] });
      qc.invalidateQueries({ queryKey: ["profiles-grid"] });
      qc.invalidateQueries({ queryKey: ["my-likes", user?.id] });
      qc.invalidateQueries({ queryKey: ["match-count", user?.id] });
      setOpen(false);
      navigate({ to: redirectTo ?? "/app/grid" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const unblockMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Non connecté");
      const { error } = await supabase
        .from("blocks")
        .delete()
        .eq("blocker_id", user.id)
        .eq("blocked_id", targetUserId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Utilisateur débloqué.");
      qc.invalidateQueries({ queryKey: ["blocks", user?.id] });
      qc.invalidateQueries({ queryKey: ["block-state", user?.id, targetUserId] });
      qc.invalidateQueries({ queryKey: ["profiles-grid"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!user || user.id === targetUserId) return null;

  if (alreadyBlocked) {
    return (
      <button
        onClick={() => unblockMutation.mutate()}
        disabled={unblockMutation.isPending}
        className={`flex items-center gap-1 text-xs text-neutral-400 hover:text-white disabled:opacity-50 ${className}`}
      >
        <Ban className="size-3.5" /> Débloquer
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`flex items-center gap-1 text-xs text-neutral-400 hover:text-red-300 ${className}`}
      >
        <Ban className="size-3.5" /> Bloquer
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-[420px] bg-neutral-950 border-t border-neutral-800 rounded-t-3xl p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center">
              <h3 className="font-bold flex items-center gap-2">
                <Ban className="size-4 text-red-400" />
                Bloquer cet utilisateur ?
              </h3>
              <button onClick={() => setOpen(false)}>
                <X className="size-5 text-neutral-400" />
              </button>
            </div>
            <ul className="text-sm text-neutral-300 space-y-1.5 list-disc list-inside">
              <li>Il disparaît immédiatement de ta grille et de tes messages.</li>
              <li>Vos likes et match éventuels sont supprimés.</li>
              <li>Vos conversations sont masquées des deux côtés.</li>
              <li>Tu pourras le débloquer plus tard depuis son profil.</li>
            </ul>
            <div className="flex gap-2">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 h-11 rounded-full border border-neutral-700 text-white text-sm"
              >
                Annuler
              </button>
              <button
                onClick={() => blockMutation.mutate()}
                disabled={blockMutation.isPending}
                className="flex-1 h-11 rounded-full bg-red-500 text-white font-bold disabled:opacity-50"
              >
                Bloquer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
