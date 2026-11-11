import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  MessageCircle,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { ReportButton } from "@/components/report-button";
import { BlockButton } from "@/components/block-button";
import { ProtectedPhoto } from "@/components/protected-photo";

export const Route = createFileRoute("/app/profile/$id")({ component: ProfileDetail });

function isOnline(last_seen: string, hide: boolean) {
  if (hide) return false;
  const age = Date.now() - new Date(last_seen).getTime();
  return age >= 0 && age < 5 * 60_000;
}

function ProfileDetail() {
  const { id } = Route.useParams();
  return <MemberProfile key={id} id={id} />;
}

function MemberProfile({ id }: { id: string }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [photoIdx, setPhotoIdx] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  const {
    data: profile,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["profile", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .maybeSingle();
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

  const { data: liked, isSuccess: canLike } = useQuery({
    queryKey: ["liked", user?.id, id],
    enabled: !!user && user.id !== id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("likes")
        .select("id")
        .eq("liker_id", user!.id)
        .eq("liked_id", id)
        .maybeSingle();
      if (error) throw error;
      return !!data;
    },
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Non connecté");
      if (liked) {
        const { error } = await supabase
          .from("likes")
          .delete()
          .eq("liker_id", user.id)
          .eq("liked_id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("likes").insert({ liker_id: user.id, liked_id: id });
        if (error) throw error;
        // Check match
        const { data: match } = await supabase
          .from("matches")
          .select("conversation_id")
          .or(
            `and(user1_id.eq.${user.id},user2_id.eq.${id}),and(user1_id.eq.${id},user2_id.eq.${user.id})`,
          )
          .maybeSingle();
        if (match?.conversation_id) {
          toast.success("💖 C'est un match !", {
            action: {
              label: "Discuter",
              onClick: () =>
                navigate({ to: "/app/chat/$id", params: { id: match.conversation_id! } }),
            },
          });
        }
      }
    },
    onSuccess: () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: ["liked", user?.id, id] }),
        qc.invalidateQueries({ queryKey: ["my-likes", user?.id] }),
        qc.invalidateQueries({ queryKey: ["matches", user?.id] }),
        qc.invalidateQueries({ queryKey: ["match-count", user?.id] }),
      ]),
    onError: (e: Error) => toast.error(e.message),
  });

  const startChat = async () => {
    if (!user) return;
    const [a, b] = [user.id, id].sort();
    const existing = await supabase
      .from("conversations")
      .select("id")
      .eq("user1_id", a)
      .eq("user2_id", b)
      .maybeSingle();
    let convId = existing.data?.id;
    if (!convId) {
      const created = await supabase
        .from("conversations")
        .insert({ user1_id: a, user2_id: b })
        .select("id")
        .single();
      if (created.error) {
        toast.error(created.error.message);
        return;
      }
      convId = created.data.id;
    }
    navigate({ to: "/app/chat/$id", params: { id: convId } });
  };

  if (isLoading || !profile) {
    return (
      <main className="min-h-svh bg-background p-6 text-foreground">
        <div className="mx-auto max-w-4xl">
          <Link
            to="/app/grid"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary"
          >
            <ArrowLeft className="size-4" aria-hidden="true" /> Découvrir
          </Link>
          <p
            className="mt-6 rounded-2xl bg-secondary p-5 text-sm text-muted-foreground"
            role={isError ? "alert" : "status"}
          >
            {isLoading
              ? "Chargement du profil…"
              : isError
                ? "Le profil n’a pas pu être chargé."
                : "Profil introuvable"}
          </p>
        </div>
      </main>
    );
  }

  const isMe = user?.id === profile.id;
  const allPhotos = [profile.photo_url, ...(photos?.map((photo) => photo.url) ?? [])].filter(
    (url): url is string => Boolean(url),
  );
  const activePhoto = Math.min(photoIdx, Math.max(0, allPhotos.length - 1));
  const currentPhoto = allPhotos[activePhoto];
  const online = isOnline(profile.last_seen, profile.hide_status);
  const details = [
    { label: "Pronoms", value: profile.pronouns },
    { label: "Identité", value: profile.gender_identity?.replaceAll("_", " ") },
    { label: "Âge", value: profile.age != null ? `${profile.age} ans` : null },
    { label: "Ville", value: profile.city },
  ].filter((detail) => detail.value);
  const heroControl =
    "grid size-10 place-items-center rounded-full bg-white/95 text-foreground shadow-sm transition hover:bg-white disabled:opacity-40";

  return (
    <main className="min-h-svh bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-4 py-5 sm:px-7 sm:py-8 lg:px-10">
        <div className="grid items-start gap-6 lg:grid-cols-[1.08fr_1fr] lg:gap-8">
          <div>
            <div ref={heroRef} className="relative">
              <div className="relative isolate aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-secondary sm:rounded-[2rem]">
                {currentPhoto ? (
                  <ProtectedPhoto
                    src={currentPhoto}
                    ownerId={profile.id}
                    ownerPseudo={profile.pseudo}
                    alt={`Photo de ${profile.pseudo}`}
                    className="size-full"
                  />
                ) : (
                  <div className="grid size-full place-items-center bg-linear-to-br from-secondary to-accent text-primary/60">
                    <User className="size-20" aria-hidden="true" />
                  </div>
                )}

                <div
                  className="pointer-events-none absolute inset-0 bg-linear-to-t from-slate-950/95 via-slate-950/10 via-40% to-transparent"
                  aria-hidden="true"
                />

                <Link
                  to="/app/grid"
                  aria-label="Retour à Découvrir"
                  className={`absolute top-3.5 left-3.5 ${heroControl}`}
                >
                  <ArrowLeft className="size-5" aria-hidden="true" />
                </Link>

                {allPhotos.length > 1 && (
                  <>
                    <div
                      className="absolute top-4 left-1/2 flex max-w-[52%] -translate-x-1/2 gap-1.5 rounded-full bg-slate-950/50 px-2.5 py-2 backdrop-blur-sm"
                      aria-hidden="true"
                    >
                      {allPhotos.map((url, index) => (
                        <span
                          key={`${url}-${index}`}
                          className={`size-1.5 rounded-full ${index === activePhoto ? "bg-white" : "bg-white/40"}`}
                        />
                      ))}
                    </div>
                    <span className="sr-only" aria-live="polite">
                      Photo {activePhoto + 1} sur {allPhotos.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPhotoIdx(activePhoto - 1)}
                      disabled={activePhoto === 0}
                      aria-label="Photo précédente"
                      className={`absolute top-1/2 left-3 -translate-y-1/2 ${heroControl}`}
                    >
                      <ChevronLeft className="size-5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhotoIdx(activePhoto + 1)}
                      disabled={activePhoto === allPhotos.length - 1}
                      aria-label="Photo suivante"
                      className={`absolute top-1/2 right-3 -translate-y-1/2 ${heroControl}`}
                    >
                      <ChevronRight className="size-5" aria-hidden="true" />
                    </button>
                  </>
                )}

                <div
                  className={`absolute inset-x-0 bottom-0 px-5 text-white sm:px-7 ${isMe ? "pb-5" : "pb-11"}`}
                >
                  {online && (
                    <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-slate-950/50 px-2.5 py-1 text-xs font-semibold backdrop-blur-sm">
                      <span className="size-2 rounded-full bg-emerald-400" aria-hidden="true" /> En
                      ligne
                    </p>
                  )}
                  <h1 className="font-display text-3xl leading-none sm:text-4xl">
                    {profile.pseudo}
                    {profile.age != null && <span className="font-semibold">, {profile.age}</span>}
                  </h1>
                  {profile.city && (
                    <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-white/90">
                      <MapPin className="size-4 shrink-0" aria-hidden="true" /> {profile.city}
                    </p>
                  )}
                </div>
              </div>

              {!isMe && (
                <div className="absolute right-5 -bottom-6 z-10 flex gap-2.5 sm:right-7">
                  <button
                    type="button"
                    onClick={() => likeMutation.mutate()}
                    disabled={!canLike || likeMutation.isPending}
                    aria-pressed={Boolean(liked)}
                    aria-label={liked ? "Retirer le like" : "Liker le profil"}
                    className="grid size-13 place-items-center rounded-full border border-border bg-white text-neon-magenta shadow-(--shadow-surface) transition hover:bg-secondary disabled:opacity-60"
                  >
                    <Heart className={`size-6 ${liked ? "fill-current" : ""}`} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={startChat}
                    aria-label="Envoyer un message"
                    className="grid size-13 place-items-center rounded-full bg-primary text-primary-foreground shadow-(--shadow-neon) transition hover:bg-[var(--primary-hover)]"
                  >
                    <MessageCircle className="size-6" aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className={`space-y-4 ${isMe ? "" : "mt-4 lg:mt-0"}`}>
            {(profile.bio || details.length > 0) && (
              <section
                className="rounded-3xl border border-border bg-secondary p-5 sm:p-6"
                aria-labelledby="about-profile"
              >
                <h2 id="about-profile" className="font-display text-xl">
                  À propos
                </h2>
                {profile.bio && (
                  <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
                )}
                {details.length > 0 && (
                  <dl className="mt-4 grid grid-cols-2 gap-x-5 gap-y-3">
                    {details.map(({ label, value }) => (
                      <div key={label}>
                        <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
                        <dd className="mt-0.5 text-sm font-semibold break-words">{value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </section>
            )}

            {(photos?.length ?? 0) > 0 && (
              <section
                className="rounded-3xl border border-border bg-card p-5 sm:p-6"
                aria-labelledby="profile-gallery"
              >
                <h2 id="profile-gallery" className="mb-3 font-display text-xl">
                  Galerie
                </h2>
                <div className="grid grid-cols-3 gap-2">
                  {allPhotos.map((url, index) => (
                    <button
                      key={`${url}-${index}`}
                      type="button"
                      onClick={() => {
                        setPhotoIdx(index);
                        heroRef.current?.scrollIntoView({ block: "nearest" });
                      }}
                      aria-label={`Voir la photo ${index + 1}`}
                      aria-pressed={index === activePhoto}
                      className={`aspect-square overflow-hidden rounded-xl bg-secondary ${index === activePhoto ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}
                    >
                      <ProtectedPhoto
                        src={url}
                        ownerId={profile.id}
                        ownerPseudo={profile.pseudo}
                        watermarkDensity={120}
                        className="size-full"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              </section>
            )}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-1 [&_.fixed]:text-white">
              <ReportButton
                targetUserId={profile.id}
                className="min-h-10 !text-muted-foreground hover:!text-destructive"
              />
              <BlockButton
                targetUserId={profile.id}
                className="min-h-10 !text-muted-foreground hover:!text-destructive"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
