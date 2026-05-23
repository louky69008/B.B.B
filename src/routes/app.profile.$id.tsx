import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Heart, MessageCircle, ArrowLeft, ChevronLeft, ChevronRight, Circle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/profile/$id")({ component: ProfileDetail });

function isOnline(last_seen: string, hide: boolean) {
  if (hide) return false;
  return (Date.now() - new Date(last_seen).getTime()) / 1000 < 60 * 5;
}

function ProfileDetail() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [photoIdx, setPhotoIdx] = useState(0);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: photos } = useQuery({
    queryKey: ["profile-photos", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profile_photos")
        .select("id, url")
        .eq("user_id", id)
        .order("position", { ascending: true });
      return data ?? [];
    },
  });

  const { data: liked } = useQuery({
    queryKey: ["liked", user?.id, id],
    enabled: !!user && user.id !== id,
    queryFn: async () => {
      const { data } = await supabase
        .from("likes")
        .select("id")
        .eq("liker_id", user!.id)
        .eq("liked_id", id)
        .maybeSingle();
      return !!data;
    },
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Non connecté");
      if (liked) {
        await supabase.from("likes").delete().eq("liker_id", user.id).eq("liked_id", id);
      } else {
        const { error } = await supabase.from("likes").insert({ liker_id: user.id, liked_id: id });
        if (error) throw error;
        // Check match
        const { data: match } = await supabase
          .from("matches")
          .select("conversation_id")
          .or(`and(user1_id.eq.${user.id},user2_id.eq.${id}),and(user1_id.eq.${id},user2_id.eq.${user.id})`)
          .maybeSingle();
        if (match?.conversation_id) {
          toast.success("💖 C'est un match !", {
            action: { label: "Discuter", onClick: () => navigate({ to: "/app/chat/$id", params: { id: match.conversation_id! } }) },
          });
        }
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["liked", user?.id, id] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const startChat = async () => {
    if (!user) return;
    const [a, b] = [user.id, id].sort();
    const existing = await supabase.from("conversations").select("id").eq("user1_id", a).eq("user2_id", b).maybeSingle();
    let convId = existing.data?.id;
    if (!convId) {
      const created = await supabase.from("conversations").insert({ user1_id: a, user2_id: b }).select("id").single();
      if (created.error) { toast.error(created.error.message); return; }
      convId = created.data.id;
    }
    navigate({ to: "/app/chat/$id", params: { id: convId } });
  };

  if (isLoading) return <main className="min-h-screen bg-black text-neutral-400 p-8">…</main>;
  if (!profile) return <main className="min-h-screen bg-black text-white p-8">Profil introuvable</main>;

  const isMe = user?.id === profile.id;
  const allPhotos = [profile.photo_url, ...(photos?.map(p => p.url) ?? [])].filter(Boolean) as string[];
  const currentPhoto = allPhotos[photoIdx] ?? null;
  const online = isOnline(profile.last_seen, profile.hide_status);

  return (
    <main className="min-h-screen bg-black flex justify-center">
      <div className="relative w-full max-w-[420px] bg-black text-white pb-24">
        {/* Photo principale */}
        <div className="relative w-full aspect-square bg-neutral-900">
          {currentPhoto ? (
            <img src={currentPhoto} alt={profile.pseudo} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

          {/* Back */}
          <button onClick={() => navigate({ to: "/app/grid" })} className="absolute top-3 left-3 size-9 rounded-full bg-black/50 backdrop-blur flex items-center justify-center">
            <ArrowLeft className="size-5" />
          </button>

          {/* Photo nav */}
          {allPhotos.length > 1 && (
            <>
              <button onClick={() => setPhotoIdx((i) => Math.max(0, i - 1))} className="absolute left-2 top-1/2 -translate-y-1/2 size-9 rounded-full bg-black/40 backdrop-blur flex items-center justify-center">
                <ChevronLeft className="size-5" />
              </button>
              <button onClick={() => setPhotoIdx((i) => Math.min(allPhotos.length - 1, i + 1))} className="absolute right-2 top-1/2 -translate-y-1/2 size-9 rounded-full bg-black/40 backdrop-blur flex items-center justify-center">
                <ChevronRight className="size-5" />
              </button>
              <div className="absolute top-3 left-1/2 -translate-x-1/2 flex gap-1">
                {allPhotos.map((_, i) => (
                  <Circle key={i} className={`size-2 ${i === photoIdx ? "fill-white text-white" : "text-white/40"}`} />
                ))}
              </div>
            </>
          )}

          {/* Info en bas */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-center gap-2 mb-1">
              {online && <span className="w-2.5 h-2.5 rounded-full bg-green-500 ring-2 ring-black" />}
              <h1 className="text-2xl font-bold">{profile.pseudo}</h1>
              {profile.age && <span className="text-xl text-white/80">, {profile.age}</span>}
            </div>
            {profile.city && <p className="text-sm text-white/70">{profile.city}</p>}
          </div>
        </div>

        {/* Bio + meta */}
        <div className="p-4 space-y-4">
          {profile.bio && (
            <div className="rounded-2xl bg-neutral-900 p-4">
              <p className="text-sm whitespace-pre-wrap text-neutral-200">{profile.bio}</p>
            </div>
          )}

          <div className="rounded-2xl bg-neutral-900 p-4 grid grid-cols-2 gap-3 text-sm">
            {profile.pronouns && <Info label="Pronoms" value={profile.pronouns} />}
            {profile.gender_identity && <Info label="Identité" value={profile.gender_identity.replace("_", " ")} />}
            {profile.age && <Info label="Âge" value={`${profile.age} ans`} />}
            {profile.city && <Info label="Ville" value={profile.city} />}
          </div>

          {/* Album thumbs */}
          {(photos?.length ?? 0) > 0 && (
            <div>
              <h2 className="text-xs uppercase tracking-wider text-neutral-500 mb-2">Album</h2>
              <div className="grid grid-cols-3 gap-1">
                {allPhotos.map((url, i) => (
                  <button key={i} onClick={() => setPhotoIdx(i)} className={`aspect-square overflow-hidden rounded-lg ${i === photoIdx ? "ring-2 ring-yellow-400" : ""}`}>
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action bar */}
        {!isMe && (
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] bg-black/95 backdrop-blur border-t border-neutral-800 p-3 pb-6 flex gap-2 z-30">
            <button
              onClick={() => likeMutation.mutate()}
              disabled={likeMutation.isPending}
              className={`flex-1 h-12 rounded-full flex items-center justify-center gap-2 font-semibold transition ${
                liked ? "bg-pink-600 text-white" : "bg-neutral-900 text-white border border-neutral-700"
              }`}
            >
              <Heart className={`size-5 ${liked ? "fill-white" : ""}`} />
              {liked ? "Liké" : "Like"}
            </button>
            <button
              onClick={startChat}
              className="flex-1 h-12 rounded-full bg-yellow-400 text-black font-semibold flex items-center justify-center gap-2"
            >
              <MessageCircle className="size-5" />
              Message
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-neutral-500">{label}</p>
      <p className="text-neutral-200">{value}</p>
    </div>
  );
}
