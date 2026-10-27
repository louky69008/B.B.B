import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { Send, Sparkles, ArrowLeft, EyeOff, Ghost, Check, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/chat/$id")({ component: ChatRoom });

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

function ChatRoom() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const { config } = useSubscription();
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const [icebreakers, setIcebreakers] = useState<string[]>([]);
  const [loadingIB, setLoadingIB] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const { data: conv } = useQuery({
    queryKey: ["conv", id],
    queryFn: async () => {
      const { data } = await supabase.from("conversations").select("user1_id, user2_id").eq("id", id).maybeSingle();
      return data;
    },
  });

  const otherId = conv ? (conv.user1_id === user?.id ? conv.user2_id : conv.user1_id) : null;

  const { data: other } = useQuery({
    queryKey: ["other-profile", otherId],
    enabled: !!otherId,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("id, pseudo, photo_url, bio, anonymous_mode").eq("id", otherId!).maybeSingle();
      return data;
    },
  });

  const { data: messages } = useQuery({
    queryKey: ["messages", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages").select("*").eq("conversation_id", id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Message[];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel(`messages:${id}`)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${id}` },
        (payload) => {
          qc.setQueryData<Message[]>(["messages", id], (prev) => {
            const m = payload.new as Message;
            if (prev?.some((x) => x.id === m.id)) return prev;
            return [...(prev ?? []), m];
          });
        }
      ).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id, qc]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (e: React.FormEvent, override?: string) => {
    e.preventDefault();
    const content = (override ?? text).trim();
    if (!content || !user) return;
    setText("");
    setIcebreakers([]);
    const { error } = await supabase
      .from("messages")
      .insert({ conversation_id: id, sender_id: user.id, content });
    if (error) toast.error(error.message);
  };

  const generateIcebreakers = async () => {
    if (!config.icebreakersAI) {
      toast.error("Réservé aux abonnés — passez Premium pour débloquer ✨");
      return;
    }
    setLoadingIB(true);
    try {
      const { data, error } = await supabase.functions.invoke("icebreakers", {
        body: {
          otherPseudo: other?.anonymous_mode ? "Anonyme" : other?.pseudo,
          otherBio: other?.bio ?? "",
        },
      });
      if (error) throw error;
      setIcebreakers(data.suggestions ?? []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur IA");
    } finally {
      setLoadingIB(false);
    }
  };

  const otherDisplay = other?.anonymous_mode ? "Anonyme" : other?.pseudo ?? "…";

  return (
    <main className="min-h-screen bg-black text-white flex justify-center">
      <div className="relative w-full max-w-[420px] flex flex-col h-screen">
        {/* Header */}
        <header className="flex items-center gap-3 px-3 py-3 border-b border-neutral-800 bg-black/95 backdrop-blur sticky top-0 z-10">
          <Link to="/app/chat" className="p-1"><ArrowLeft className="size-5" /></Link>
          <div className="size-9 rounded-full overflow-hidden bg-neutral-800 shrink-0">
            {other?.anonymous_mode ? (
              <div className="size-full flex items-center justify-center bg-neutral-700">
                <EyeOff className="size-4 text-neutral-300" />
              </div>
            ) : other?.photo_url ? (
              <img src={other.photo_url} alt="" className="size-full object-cover" />
            ) : null}
          </div>
          <div className="flex-1 min-w-0">
            {!other?.anonymous_mode && otherId ? (
              <Link to="/app/profile/$id" params={{ id: otherId }} className="font-semibold">{otherDisplay}</Link>
            ) : (
              <span className="font-semibold">{otherDisplay}</span>
            )}
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
          {messages?.length === 0 && (
            <div className="text-center text-neutral-500 text-sm mt-8">
              Aucun message — brisez la glace 👋
            </div>
          )}
          {messages?.map((m) => {
            const mine = m.sender_id === user?.id;
            // Snap request
            if (m.content === "__snap_request__") {
              const alreadyAnswered = messages.some(
                (x) => new Date(x.created_at) > new Date(m.created_at) &&
                  x.sender_id !== m.sender_id &&
                  (x.content.startsWith("__snap_accept__") || x.content === "__snap_decline__")
              );
              return (
                <div key={m.id} className="flex justify-center">
                  <div className="max-w-[85%] w-full rounded-2xl px-4 py-3 bg-gradient-to-br from-yellow-400/10 to-yellow-200/5 border border-yellow-400/40 text-center space-y-2">
                    <div className="flex items-center justify-center gap-2 text-yellow-300 text-sm font-semibold">
                      <Ghost className="size-4" />
                      {mine ? "Tu as demandé son Snapchat" : "Demande de Snapchat 👻"}
                    </div>
                    {!mine && !alreadyAnswered && (
                      <>
                        <div className="flex justify-center gap-1.5 py-1">
                          <span className="size-1.5 rounded-full bg-yellow-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="size-1.5 rounded-full bg-yellow-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="size-1.5 rounded-full bg-yellow-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={async () => {
                              const handle = window.prompt("Ton pseudo Snapchat :")?.trim();
                              if (!handle) return;
                              await supabase.from("messages").insert({ conversation_id: id, sender_id: user!.id, content: `__snap_accept__:${handle}` });
                            }}
                            className="flex-1 h-9 rounded-full bg-yellow-400 text-black text-sm font-semibold flex items-center justify-center gap-1"
                          >
                            <Check className="size-4" /> Accepter
                          </button>
                          <button
                            onClick={async () => {
                              await supabase.from("messages").insert({ conversation_id: id, sender_id: user!.id, content: "__snap_decline__" });
                            }}
                            className="flex-1 h-9 rounded-full bg-neutral-800 border border-neutral-700 text-sm flex items-center justify-center gap-1"
                          >
                            <X className="size-4" /> Refuser
                          </button>
                        </div>
                      </>
                    )}
                    {mine && !alreadyAnswered && (
                      <p className="text-xs text-neutral-400">En attente de sa réponse…</p>
                    )}
                  </div>
                </div>
              );
            }
            if (m.content.startsWith("__snap_accept__")) {
              const handle = m.content.replace("__snap_accept__:", "");
              return (
                <div key={m.id} className="flex justify-center">
                  <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-yellow-400/15 border border-yellow-400/50 text-center">
                    <div className="flex items-center justify-center gap-2 text-yellow-300 text-sm font-semibold mb-1">
                      <Ghost className="size-4" /> Snapchat partagé
                    </div>
                    <a href={`https://www.snapchat.com/add/${encodeURIComponent(handle)}`} target="_blank" rel="noreferrer" className="text-white font-mono underline">
                      @{handle}
                    </a>
                  </div>
                </div>
              );
            }
            if (m.content === "__snap_decline__") {
              return (
                <div key={m.id} className="flex justify-center">
                  <div className="max-w-[85%] rounded-2xl px-4 py-2 bg-neutral-900 border border-neutral-800 text-center text-xs text-neutral-400">
                    Demande de Snap refusée
                  </div>
                </div>
              );
            }
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                  mine ? "bg-yellow-400 text-black" : "bg-neutral-900 border border-neutral-800"
                }`}>
                  {m.content}
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>

        {/* Icebreakers */}
        {icebreakers.length > 0 && (
          <div className="px-3 py-2 border-t border-neutral-800 space-y-1.5 bg-neutral-950">
            <p className="text-[11px] uppercase tracking-wider text-neutral-500">Suggestions IA</p>
            {icebreakers.map((ib, i) => (
              <button
                key={i}
                onClick={(e) => send(e as any, ib)}
                className="block w-full text-left text-sm px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800"
              >
                {ib}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form onSubmit={send} className="flex gap-2 px-3 py-3 border-t border-neutral-800 bg-black sticky bottom-0">
          <button
            type="button"
            onClick={generateIcebreakers}
            disabled={loadingIB}
            className="size-10 shrink-0 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center disabled:opacity-50"
            title="Icebreakers IA"
          >
            <Sparkles className={`size-4 ${loadingIB ? "animate-pulse text-yellow-400" : "text-neutral-300"}`} />
          </button>
          <button
            type="button"
            onClick={async () => {
              if (!user) return;
              await supabase.from("messages").insert({ conversation_id: id, sender_id: user.id, content: "__snap_request__" });
            }}
            className="size-10 shrink-0 rounded-full bg-yellow-400/15 border border-yellow-400/50 flex items-center justify-center"
            title="Demander Snapchat"
          >
            <Ghost className="size-4 text-yellow-300" />
          </button>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Message…"
            maxLength={2000}
            autoFocus
            className="flex-1 min-w-0 h-10 rounded-full bg-neutral-900 border border-neutral-700 px-4 text-sm text-white placeholder:text-neutral-500 outline-none focus:border-yellow-400"
          />
          <button type="submit" disabled={!text.trim()} className="size-10 shrink-0 rounded-full bg-yellow-400 text-black flex items-center justify-center disabled:opacity-50">
            <Send className="size-4" />
          </button>
        </form>
      </div>
    </main>
  );
}
