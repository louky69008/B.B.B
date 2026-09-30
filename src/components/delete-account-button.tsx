import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Trash2, X, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { deleteMyAccount } from "@/lib/account.functions";
import { supabase } from "@/integrations/supabase/client";

const CONFIRM = "SUPPRIMER";

export function DeleteAccountButton() {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const run = useServerFn(deleteMyAccount);
  const navigate = useNavigate();

  const submit = async () => {
    if (confirm !== CONFIRM) return;
    setBusy(true);
    try {
      await run();
      await supabase.auth.signOut();
      toast.success("Compte supprimé. À bientôt peut-être.");
      navigate({ to: "/" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-full border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300 hover:bg-red-500/20"
      >
        <Trash2 className="size-4" />
        Supprimer mon compte
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70"
          onClick={() => !busy && setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[420px] space-y-4 rounded-t-3xl border-t border-red-500/40 bg-neutral-950 p-5"
          >
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-bold text-white">
                <AlertTriangle className="size-5 text-red-400" />
                Suppression définitive
              </h3>
              <button onClick={() => !busy && setOpen(false)} disabled={busy}>
                <X className="size-5 text-neutral-400" />
              </button>
            </div>

            <p className="text-sm text-neutral-300">
              Cette action est <strong>immédiate et irréversible</strong>. Seront supprimés :
            </p>
            <ul className="ml-5 list-disc text-sm text-neutral-400">
              <li>ton profil, photos et album</li>
              <li>tes likes, matches et conversations</li>
              <li>tes soirées appart' et participations</li>
              <li>tes signalements émis et ton abonnement</li>
              <li>ton compte d'authentification</li>
            </ul>

            <div>
              <label className="text-xs text-neutral-400">
                Tape <span className="font-mono font-bold text-red-300">{CONFIRM}</span> pour
                confirmer
              </label>
              <Input
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder={CONFIRM}
                className="mt-1 border-neutral-700 bg-neutral-900 text-white"
                disabled={busy}
              />
            </div>

            <button
              onClick={submit}
              disabled={confirm !== CONFIRM || busy}
              className="h-12 w-full rounded-full bg-red-500 font-bold text-white disabled:opacity-40"
            >
              {busy ? "Suppression…" : "Supprimer définitivement"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
