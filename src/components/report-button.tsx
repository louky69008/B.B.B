import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Flag, X } from "lucide-react";

const CATEGORIES = [
  { v: "harassment", label: "Harcèlement / menaces" },
  { v: "inappropriate", label: "Contenu inapproprié" },
  { v: "fake", label: "Faux profil" },
  { v: "minor", label: "Mineur suspecté" },
  { v: "spam", label: "Spam / arnaque" },
  { v: "other", label: "Autre" },
];

export function ReportButton({
  targetUserId,
  targetKind = "profile",
  targetId,
  className = "",
}: {
  targetUserId?: string;
  targetKind?: "profile" | "party" | "message";
  targetId?: string;
  className?: string;
}) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("harassment");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!user) return;
    setBusy(true);
    const { error } = await supabase.from("reports").insert({
      reporter_id: user.id,
      target_user_id: targetUserId,
      target_kind: targetKind,
      target_id: targetId,
      category,
      description: description.trim(),
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Signalement envoyé. Merci, l'équipe va l'examiner.");
    setOpen(false);
    setDescription("");
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`flex items-center gap-1 text-xs text-neutral-400 hover:text-red-300 ${className}`}
      >
        <Flag className="size-3.5" /> Signaler
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
                <Flag className="size-4 text-red-400" />
                Signaler
              </h3>
              <button onClick={() => setOpen(false)}>
                <X className="size-5 text-neutral-400" />
              </button>
            </div>
            <div className="space-y-1.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c.v}
                  onClick={() => setCategory(c.v)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm ${
                    category === c.v
                      ? "bg-yellow-400 text-black font-medium"
                      : "bg-neutral-900 text-white border border-neutral-800"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Détails (optionnel)…"
              rows={3}
              maxLength={500}
              className="bg-neutral-900 border-neutral-700 text-white"
            />
            <button
              onClick={submit}
              disabled={busy}
              className="w-full h-11 rounded-full bg-red-500 text-white font-bold disabled:opacity-50"
            >
              Envoyer le signalement
            </button>
          </div>
        </div>
      )}
    </>
  );
}
