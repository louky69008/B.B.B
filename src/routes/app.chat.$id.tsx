import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

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
  const { t } = useI18n();
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const { data: messages } = useQuery({
    queryKey: ["messages", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Message[];
    },
  });

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel(`messages:${id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${id}` },
        (payload) => {
          qc.setQueryData<Message[]>(["messages", id], (prev) => {
            const m = payload.new as Message;
            if (prev?.some((x) => x.id === m.id)) return prev;
            return [...(prev ?? []), m];
          });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id, qc]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !user) return;
    const content = text.trim();
    setText("");
    const { error } = await supabase
      .from("messages")
      .insert({ conversation_id: id, sender_id: user.id, content });
    if (error) console.error(error);
  };

  return (
    <main className="mx-auto flex h-[calc(100vh-3.5rem)] max-w-2xl flex-col px-4">
      <div className="flex-1 space-y-2 overflow-y-auto py-4">
        {messages?.map((m) => {
          const mine = m.sender_id === user?.id;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                  mine ? "bg-primary text-primary-foreground" : "bg-card border border-border"
                }`}
              >
                {m.content}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      <form onSubmit={send} className="flex gap-2 border-t border-border py-3">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("type_message")}
          maxLength={2000}
        />
        <Button type="submit" size="icon" disabled={!text.trim()}>
          <Send className="size-4" />
        </Button>
      </form>
    </main>
  );
}
