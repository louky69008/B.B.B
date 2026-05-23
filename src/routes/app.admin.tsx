import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, Shield, AlertTriangle, Ban, Clock } from "lucide-react";

export const Route = createFileRoute("/app/admin")({ component: Admin });

function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: isAdmin, isLoading: roleLoading } = useQuery({
    queryKey: ["is-admin", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user!.id);
      return (data ?? []).some((r) => r.role === "admin");
    },
  });

  useEffect(() => {
    if (!roleLoading && isAdmin === false) navigate({ to: "/app/grid" });
  }, [roleLoading, isAdmin, navigate]);

  const { data: reports } = useQuery({
    queryKey: ["admin-reports"],
    enabled: isAdmin === true,
    queryFn: async () => {
      const { data } = await supabase
        .from("reports")
        .select("*")
        .in("status", ["open", "reviewing"])
        .order("created_at", { ascending: false });
      const ids = Array.from(new Set([
        ...(data ?? []).map((r) => r.reporter_id),
        ...(data ?? []).map((r) => r.target_user_id).filter(Boolean),
      ]));
      const { data: profs } = ids.length
        ? await supabase.from("profiles").select("id, pseudo, photo_url").in("id", ids)
        : { data: [] as any[] };
      const byId = new Map((profs ?? []).map((p) => [p.id, p]));
      return (data ?? []).map((r) => ({
        ...r,
        reporter: byId.get(r.reporter_id),
        target: r.target_user_id ? byId.get(r.target_user_id) : null,
      }));
    },
  });

  if (roleLoading || isAdmin === false) {
    return <main className="min-h-screen bg-black text-neutral-500 p-8">…</main>;
  }

  const sanction = async (report: any, kind: string) => {
    if (!report.target_user_id) { toast.error("Pas de cible utilisateur"); return; }
    const expires =
      kind === "ban_24h" ? new Date(Date.now() + 24 * 3600_000).toISOString() :
      kind === "ban_30d" ? new Date(Date.now() + 30 * 24 * 3600_000).toISOString() :
      kind === "ban_life" ? null : null;
    const { error } = await supabase.from("sanctions").insert({
      user_id: report.target_user_id,
      kind,
      reason: `Signalement: ${report.category}`,
      related_report_id: report.id,
      issued_by: user!.id,
      expires_at: expires,
    });
    if (error) { toast.error(error.message); return; }
    await supabase.from("reports").update({
      status: "resolved",
      reviewed_by: user!.id,
      reviewed_at: new Date().toISOString(),
      resolution_note: `Sanction: ${kind}`,
    }).eq("id", report.id);
    qc.invalidateQueries({ queryKey: ["admin-reports"] });
    toast.success("Sanction appliquée");
  };

  const dismiss = async (report: any) => {
    await supabase.from("reports").update({
      status: "dismissed",
      reviewed_by: user!.id,
      reviewed_at: new Date().toISOString(),
    }).eq("id", report.id);
    qc.invalidateQueries({ queryKey: ["admin-reports"] });
  };

  return (
    <main className="min-h-screen bg-black text-white flex justify-center">
      <div className="w-full max-w-[420px] pb-24">
        <header className="flex items-center gap-3 px-4 py-3 border-b border-neutral-800 sticky top-0 bg-black/95 backdrop-blur z-10">
          <Link to="/app/grid" className="p-1"><ArrowLeft className="size-5" /></Link>
          <Shield className="size-5 text-yellow-400" />
          <h1 className="text-lg font-bold">Modération</h1>
        </header>

        <div className="p-4">
          <h2 className="text-xs uppercase tracking-wider text-neutral-500 mb-3">
            Signalements en attente ({reports?.length ?? 0})
          </h2>
          {reports?.length === 0 && (
            <p className="text-center text-neutral-500 mt-12">Tout est calme. Bon travail 🌿</p>
          )}
          <div className="space-y-3">
            {reports?.map((r: any) => (
              <div key={r.id} className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span className="uppercase tracking-wider">{r.target_kind} · {r.category}</span>
                  <span>{new Date(r.created_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}</span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <div className="text-[10px] uppercase text-neutral-500">Signalé par</div>
                    <div className="font-medium">{r.reporter?.pseudo ?? r.reporter_id.slice(0, 8)}</div>
                  </div>
                  {r.target && (
                    <div>
                      <div className="text-[10px] uppercase text-red-300">Cible</div>
                      <div className="font-medium">{r.target.pseudo}</div>
                    </div>
                  )}
                </div>

                {r.description && <p className="mt-3 text-sm text-neutral-300 italic">"{r.description}"</p>}

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button onClick={() => sanction(r, "warning")}
                    className="h-10 rounded-full bg-yellow-400/20 border border-yellow-400/40 text-yellow-200 text-xs font-medium flex items-center justify-center gap-1">
                    <AlertTriangle className="size-3" />Avertir
                  </button>
                  <button onClick={() => sanction(r, "ban_24h")}
                    className="h-10 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-200 text-xs font-medium flex items-center justify-center gap-1">
                    <Clock className="size-3" />Ban 24h
                  </button>
                  <button onClick={() => sanction(r, "ban_30d")}
                    className="h-10 rounded-full bg-red-500/20 border border-red-500/40 text-red-200 text-xs font-medium flex items-center justify-center gap-1">
                    <Ban className="size-3" />Ban 30j
                  </button>
                  <button onClick={() => sanction(r, "ban_life")}
                    className="h-10 rounded-full bg-red-700 text-white text-xs font-bold flex items-center justify-center gap-1">
                    <Ban className="size-3" />Ban à vie
                  </button>
                </div>
                <button onClick={() => dismiss(r)}
                  className="mt-2 w-full h-9 rounded-full bg-neutral-800 text-neutral-400 text-xs">
                  Rejeter (pas d'infraction)
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
