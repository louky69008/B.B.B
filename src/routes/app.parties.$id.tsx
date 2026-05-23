import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, MapPin, Calendar, Users, Euro, Send, LogOut, Check, X, Lock } from "lucide-react";

export const Route = createFileRoute("/app/parties/$id")({ component: PartyDetail });

function PartyDetail() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: party } = useQuery({
    queryKey: ["party", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("parties").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
  });

  const { data: myRequest } = useQuery({
    queryKey: ["party-req", id, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("party_requests")
        .select("*").eq("party_id", id).eq("requester_id", user!.id).maybeSingle();
      return data;
    },
  });

  const { data: amParticipant } = useQuery({
    queryKey: ["party-part", id, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("party_participants")
        .select("id").eq("party_id", id).eq("user_id", user!.id).maybeSingle();
      return !!data;
    },
  });

  if (!party) return <main className="min-h-screen bg-black text-neutral-500 p-8">…</main>;

  const isHost = user?.id === party.host_id;
  const hasAccess = isHost || amParticipant;

  return (
    <main className="min-h-screen bg-black text-white flex justify-center">
      <div className="w-full max-w-[420px] pb-24">
        <header className="flex items-center gap-3 px-4 py-3 border-b border-neutral-800 sticky top-0 bg-black/95 backdrop-blur z-10">
          <Link to="/app/parties" className="p-1"><ArrowLeft className="size-5" /></Link>
          <h1 className="text-base font-bold flex-1 truncate">{party.title}</h1>
        </header>

        <div className="p-4 space-y-4">
          {/* Meta */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 space-y-2 text-sm">
            <div className="flex items-center gap-2"><Calendar className="size-4 text-yellow-400" />
              {new Date(party.starts_at).toLocaleString("fr-FR", { dateStyle: "full", timeStyle: "short" })}
            </div>
            <div className="flex items-center gap-2"><MapPin className="size-4 text-yellow-400" />
              {hasAccess
                ? `${party.address}${party.floor ? `, étage ${party.floor}` : ""}${party.access_code ? ` (code ${party.access_code})` : ""}`
                : <span className="text-neutral-400 flex items-center gap-1"><Lock className="size-3" />{party.city} — adresse visible après acceptation</span>}
            </div>
            <div className="flex items-center gap-2"><Users className="size-4 text-yellow-400" />{party.max_participants} participants max</div>
            {party.is_paid && party.price_cents && (
              <div className="flex items-center gap-2 text-yellow-400">
                <Euro className="size-4" />Entrée : {(party.price_cents / 100).toFixed(2)}€
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
            <h3 className="text-xs uppercase tracking-wider text-neutral-500 mb-2">À propos</h3>
            <p className="text-sm whitespace-pre-wrap">{party.description}</p>
            {party.rules && (
              <>
                <h3 className="text-xs uppercase tracking-wider text-neutral-500 mt-4 mb-2">Règles</h3>
                <p className="text-sm whitespace-pre-wrap">{party.rules}</p>
              </>
            )}
            {party.warnings && (
              <>
                <h3 className="text-xs uppercase tracking-wider text-red-400 mt-4 mb-2">Mises en garde</h3>
                <p className="text-sm whitespace-pre-wrap text-red-200">{party.warnings}</p>
              </>
            )}
          </div>

          {/* Actions */}
          {!isHost && !amParticipant && (
            <RequestAccessCard partyId={id} existing={myRequest} hostId={party.host_id} />
          )}

          {isHost && <HostRequestsPanel partyId={id} maxParts={party.max_participants} />}

          {hasAccess && <GroupChat partyId={id} />}

          {amParticipant && !isHost && <LeaveButton partyId={id} />}
        </div>
      </div>
    </main>
  );
}

function RequestAccessCard({ partyId, existing, hostId }: { partyId: string; existing: any; hostId: string }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  if (existing?.status === "pending") {
    return (
      <div className="rounded-2xl bg-yellow-400/10 border border-yellow-400/40 p-4 text-sm text-yellow-200">
        Demande en attente. L'hôte va te répondre.
      </div>
    );
  }
  if (existing?.status === "rejected") {
    return (
      <div className="rounded-2xl bg-red-500/10 border border-red-500/40 p-4 text-sm text-red-200">
        Demande refusée par l'hôte.
      </div>
    );
  }

  const send = async () => {
    if (!user) return;
    setBusy(true);
    const { error } = await supabase.from("party_requests").insert({
      party_id: partyId, requester_id: user.id, message: msg.trim(),
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Demande envoyée à l'hôte");
    qc.invalidateQueries({ queryKey: ["party-req", partyId, user.id] });
  };

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
      <h3 className="font-bold mb-2">Demander à rejoindre</h3>
      <Textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={3} maxLength={500}
        placeholder="Présente-toi à l'hôte (qui tu es, pourquoi tu veux venir…)"
        className="bg-neutral-900 border-neutral-700 text-white" />
      <button disabled={busy || msg.trim().length < 5} onClick={send}
        className="mt-3 w-full h-11 rounded-full bg-yellow-400 text-black font-bold disabled:opacity-50">
        Envoyer la demande
      </button>
    </div>
  );
}

function HostRequestsPanel({ partyId, maxParts }: { partyId: string; maxParts: number }) {
  const qc = useQueryClient();
  const { data: requests } = useQuery({
    queryKey: ["party-requests", partyId],
    queryFn: async () => {
      const { data } = await supabase.from("party_requests")
        .select("id, requester_id, message, status, created_at")
        .eq("party_id", partyId).order("created_at", { ascending: false });
      const ids = (data ?? []).map((r) => r.requester_id);
      if (ids.length === 0) return data ?? [];
      const { data: profs } = await supabase.from("profiles").select("id, pseudo, photo_url, age").in("id", ids);
      const byId = new Map((profs ?? []).map((p) => [p.id, p]));
      return (data ?? []).map((r) => ({ ...r, profile: byId.get(r.requester_id) }));
    },
  });

  const decide = async (req: any, accept: boolean) => {
    if (accept) {
      const { error: addErr } = await supabase.from("party_participants").insert({
        party_id: partyId, user_id: req.requester_id,
      });
      if (addErr && !addErr.message.includes("duplicate")) { toast.error(addErr.message); return; }
    }
    await supabase.from("party_requests").update({ status: accept ? "accepted" : "rejected" }).eq("id", req.id);
    qc.invalidateQueries({ queryKey: ["party-requests", partyId] });
    toast.success(accept ? "Accepté" : "Refusé");
  };

  const pending = requests?.filter((r: any) => r.status === "pending") ?? [];

  return (
    <div className="rounded-2xl border border-yellow-400/40 bg-yellow-400/5 p-4">
      <h3 className="font-bold mb-3">Demandes ({pending.length})</h3>
      {pending.length === 0 && <p className="text-sm text-neutral-400">Aucune demande en attente.</p>}
      <div className="space-y-2">
        {pending.map((r: any) => (
          <div key={r.id} className="rounded-xl bg-neutral-900 p-3 text-sm">
            <div className="flex items-center gap-2 mb-2">
              {r.profile?.photo_url && <img src={r.profile.photo_url} alt="" className="size-9 rounded-full object-cover" />}
              <div className="flex-1">
                <div className="font-medium">{r.profile?.pseudo ?? "?"}{r.profile?.age && `, ${r.profile.age}`}</div>
              </div>
            </div>
            {r.message && <p className="text-neutral-300 italic">"{r.message}"</p>}
            <div className="flex gap-2 mt-2">
              <button onClick={() => decide(r, true)}
                className="flex-1 h-9 rounded-full bg-emerald-500 text-black font-medium flex items-center justify-center gap-1">
                <Check className="size-4" />Accepter
              </button>
              <button onClick={() => decide(r, false)}
                className="flex-1 h-9 rounded-full bg-neutral-800 text-white font-medium flex items-center justify-center gap-1">
                <X className="size-4" />Refuser
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GroupChat({ partyId }: { partyId: string }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const { data: messages } = useQuery({
    queryKey: ["party-msgs", partyId],
    queryFn: async () => {
      const { data } = await supabase.from("party_messages")
        .select("id, sender_id, content, photo_url, created_at")
        .eq("party_id", partyId).order("created_at");
      const ids = Array.from(new Set((data ?? []).map((m) => m.sender_id)));
      const { data: profs } = ids.length
        ? await supabase.from("profiles").select("id, pseudo, photo_url").in("id", ids)
        : { data: [] as any[] };
      const byId = new Map((profs ?? []).map((p) => [p.id, p]));
      return (data ?? []).map((m) => ({ ...m, sender: byId.get(m.sender_id) }));
    },
    refetchInterval: 4000,
  });

  const { data: participants } = useQuery({
    queryKey: ["party-participants", partyId],
    queryFn: async () => {
      const { data: pp } = await supabase.from("party_participants")
        .select("user_id").eq("party_id", partyId);
      const ids = (pp ?? []).map((p) => p.user_id);
      if (ids.length === 0) return [];
      const { data } = await supabase.from("profiles").select("id, pseudo, photo_url").in("id", ids);
      return data ?? [];
    },
  });

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages?.length]);

  const send = async () => {
    if (!text.trim() || !user) return;
    const content = text.trim();
    setText("");
    const { error } = await supabase.from("party_messages").insert({
      party_id: partyId, sender_id: user.id, content,
    });
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["party-msgs", partyId] });
  };

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 overflow-hidden">
      <div className="px-4 py-3 border-b border-neutral-800">
        <h3 className="font-bold">Tchat de groupe</h3>
        <div className="flex -space-x-2 mt-2">
          {participants?.slice(0, 8).map((p) => (
            p.photo_url ? <img key={p.id} src={p.photo_url} alt={p.pseudo}
              className="size-7 rounded-full object-cover border-2 border-neutral-900" />
            : <div key={p.id} className="size-7 rounded-full bg-neutral-700 border-2 border-neutral-900" />
          ))}
          {participants && participants.length > 8 && (
            <div className="size-7 rounded-full bg-neutral-800 text-[10px] flex items-center justify-center border-2 border-neutral-900">
              +{participants.length - 8}
            </div>
          )}
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto p-3 space-y-2">
        {messages?.length === 0 && <p className="text-center text-xs text-neutral-500 py-6">Sois le premier à écrire 👋</p>}
        {messages?.map((m) => {
          const mine = m.sender_id === user?.id;
          return (
            <div key={m.id} className={`flex gap-2 ${mine ? "justify-end" : ""}`}>
              {!mine && (m.sender?.photo_url
                ? <img src={m.sender.photo_url} className="size-7 rounded-full object-cover" alt="" />
                : <div className="size-7 rounded-full bg-neutral-700" />)}
              <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                mine ? "bg-yellow-400 text-black" : "bg-neutral-800 text-white"}`}>
                {!mine && <div className="text-[10px] opacity-70 mb-0.5">{m.sender?.pseudo}</div>}
                {m.content}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <div className="border-t border-neutral-800 p-2 flex gap-2">
        <Input value={text} onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Message au groupe…"
          className="bg-neutral-900 border-neutral-700 text-white" />
        <button onClick={send} className="size-10 shrink-0 rounded-full bg-yellow-400 text-black flex items-center justify-center">
          <Send className="size-4" />
        </button>
      </div>
    </div>
  );
}

function LeaveButton({ partyId }: { partyId: string }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const leave = async () => {
    if (!user) return;
    if (!confirm("Quitter cette soirée ?")) return;
    await supabase.from("party_participants").delete()
      .eq("party_id", partyId).eq("user_id", user.id);
    qc.invalidateQueries({ queryKey: ["party-part", partyId, user.id] });
    toast.success("Tu as quitté la soirée");
  };
  return (
    <button onClick={leave} className="w-full h-11 rounded-full bg-neutral-900 border border-red-500/40 text-red-300 flex items-center justify-center gap-2">
      <LogOut className="size-4" />Quitter la soirée
    </button>
  );
}
