import { createFileRoute, Link } from "@tanstack/react-router";
import { BottomNav } from "@/components/bottom-nav";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, X, Crown, LogOut } from "lucide-react";
import type { ProfileForm } from "@/lib/types";
import { PhotoUpload } from "@/components/photo-upload";
import { DeleteAccountButton } from "@/components/delete-account-button";

export const Route = createFileRoute("/app/me")({ component: Me });

const GENDERS = [
  "homme_cis",
  "femme_trans",
  "homme_trans",
  "travesti",
  "drag",
  "non_binaire",
  "genderfluid",
  "genderqueer",
  "agender",
  "two_spirit",
  "intersexe",
  "autre",
];
const PRONOUNS = ["il/lui", "elle/la", "iel/ellui", "they/them", "il/elle", "autre"];
const ORIENTATIONS = [
  "gay",
  "homosexuel",
  "bi",
  "pan",
  "queer",
  "hetero_curieux",
  "hetero",
  "demisexuel",
  "asexuel",
  "fluide",
  "autre",
];

function Me() {
  const { user } = useAuth();
  const { tier, config } = useSubscription();
  const qc = useQueryClient();

  const { data, refetch } = useQuery({
    queryKey: ["me", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: photos } = useQuery({
    queryKey: ["my-photos", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("profile_photos")
        .select("id, url, position")
        .eq("user_id", user!.id)
        .order("position");
      return data ?? [];
    },
  });

  const [form, setForm] = useState<ProfileForm | null>(null);
  useEffect(() => {
    if (data) setForm(data as ProfileForm);
  }, [data]);

  if (!form) return <main className="min-h-screen bg-black text-neutral-400 p-8">…</main>;

  const save = async () => {
    const { error } = await supabase
      .from("profiles")
      .update({
        pseudo: form.pseudo,
        bio: form.bio,
        gender_identity: form.gender_identity,
        pronouns: form.pronouns,
        orientation: form.orientation,
        age: form.age ? Number(form.age) : null,
        city: form.city,
        photo_url: form.photo_url,
        hide_status: form.hide_status,
        anonymous_mode: form.anonymous_mode,
      })
      .eq("id", user!.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Profil mis à jour");
    refetch();
  };

  const addPhoto = async (url: string) => {
    const { error } = await supabase.from("profile_photos").insert({
      user_id: user!.id,
      url,
      position: photos?.length ?? 0,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    qc.invalidateQueries({ queryKey: ["my-photos", user!.id] });
  };

  const removePhoto = async (id: string) => {
    await supabase.from("profile_photos").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["my-photos", user!.id] });
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };
  const set = (k: keyof ProfileForm, v: ProfileForm[keyof ProfileForm]) =>
    setForm({ ...form, [k]: v });

  return (
    <main className="min-h-screen bg-black text-white flex justify-center">
      <div className="w-full max-w-[420px] pb-24">
        <header className="flex items-center gap-3 px-3 py-3 border-b border-neutral-800 sticky top-0 bg-black/95 backdrop-blur z-10">
          <Link to="/app/grid" className="p-1">
            <ArrowLeft className="size-5" />
          </Link>
          <h1 className="text-lg font-bold flex-1">Mon profil</h1>
          <button onClick={logout} className="text-xs text-neutral-400 flex items-center gap-1">
            <LogOut className="size-4" /> Quitter
          </button>
        </header>

        {/* Abonnement */}
        <Link
          to="/app/subscribe"
          className="block mx-3 mt-3 rounded-2xl bg-gradient-to-br from-yellow-400/20 to-pink-500/10 border border-yellow-400/40 p-4"
        >
          <div className="flex items-center gap-2">
            <Crown className="size-5 text-yellow-400" />
            <span className="font-bold">{config.name}</span>
            {tier === "free" && (
              <span className="ml-auto text-xs text-yellow-300">Voir les offres →</span>
            )}
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            {config.profileLimit === -1
              ? "Profils illimités"
              : `Jusqu'à ${config.profileLimit} profils`}
            {config.icebreakersAI && " · IA icebreakers"}
            {config.incognito && " · Mode invisible"}
          </p>
        </Link>

        <div className="p-3 space-y-4">
          <div>
            <Label className="text-neutral-300">Pseudo</Label>
            <Input
              value={form.pseudo ?? ""}
              onChange={(e) => set("pseudo", e.target.value)}
              className="bg-neutral-900 border-neutral-700 text-white"
            />
          </div>
          <div>
            <Label className="text-neutral-300">Photo principale</Label>
            <div className="flex items-center gap-3 mt-2">
              <div className="size-20 rounded-xl overflow-hidden bg-neutral-900 shrink-0">
                {form.photo_url ? (
                  <img src={form.photo_url} alt="" className="w-full h-full object-cover" />
                ) : null}
              </div>
              <PhotoUpload
                userId={user!.id}
                onUploaded={(url) => set("photo_url", url)}
                className="h-10 px-4 rounded-full bg-yellow-400 text-black font-semibold flex items-center gap-2 text-sm"
              >
                {form.photo_url ? "Changer" : "Choisir"}
              </PhotoUpload>
            </div>
          </div>

          {/* Album */}
          <div>
            <Label className="text-neutral-300">Album</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {photos?.map((p) => (
                <div
                  key={p.id}
                  className="relative aspect-square rounded-lg overflow-hidden bg-neutral-900"
                >
                  <img src={p.url} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removePhoto(p.id)}
                    className="absolute top-1 right-1 size-6 rounded-full bg-black/70 flex items-center justify-center"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-2">
              <PhotoUpload
                userId={user!.id}
                onUploaded={(url) => addPhoto(url)}
                className="h-10 px-4 rounded-full bg-neutral-900 border border-neutral-700 text-white font-medium flex items-center gap-2 text-sm w-full justify-center"
              >
                Ajouter une photo
              </PhotoUpload>
            </div>
          </div>

          <div>
            <Label className="text-neutral-300">Bio</Label>
            <Textarea
              value={form.bio ?? ""}
              onChange={(e) => set("bio", e.target.value)}
              maxLength={500}
              rows={4}
              className="bg-neutral-900 border-neutral-700 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-neutral-300">Identité</Label>
              <Select
                value={form.gender_identity ?? ""}
                onValueChange={(v) => set("gender_identity", v)}
              >
                <SelectTrigger className="bg-neutral-900 border-neutral-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GENDERS.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-neutral-300">Pronoms</Label>
              <Select value={form.pronouns ?? ""} onValueChange={(v) => set("pronouns", v)}>
                <SelectTrigger className="bg-neutral-900 border-neutral-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRONOUNS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-neutral-300">Âge</Label>
              <Input
                type="number"
                min={18}
                max={120}
                value={form.age ?? ""}
                onChange={(e) => set("age", e.target.value)}
                className="bg-neutral-900 border-neutral-700 text-white"
              />
            </div>
            <div>
              <Label className="text-neutral-300">Ville</Label>
              <Input
                value={form.city ?? ""}
                onChange={(e) => set("city", e.target.value)}
                className="bg-neutral-900 border-neutral-700 text-white"
              />
            </div>
            <div className="col-span-2">
              <Label className="text-neutral-300">Orientation sexuelle</Label>
              <Select
                value={form.orientation ?? "gay"}
                onValueChange={(v) => set("orientation", v)}
              >
                <SelectTrigger className="bg-neutral-900 border-neutral-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORIENTATIONS.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-neutral-300">
            <Checkbox
              checked={!!form.hide_status}
              onCheckedChange={(v) => set("hide_status", v === true)}
            />
            Masquer mon statut "en ligne"
          </label>
          <label className="flex items-center gap-2 text-sm text-neutral-300">
            <Checkbox
              checked={!!form.anonymous_mode}
              onCheckedChange={(v) => set("anonymous_mode", v === true)}
            />
            Mode anonyme dans les chats (pseudo et photo masqués)
          </label>

          <button
            onClick={save}
            className="w-full h-12 rounded-full bg-yellow-400 text-black font-bold"
          >
            Enregistrer
          </button>

          <div className="pt-6 mt-4 border-t border-neutral-800">
            <h2 className="text-xs uppercase tracking-wider text-neutral-500 mb-2">
              Zone sensible
            </h2>
            <p className="text-xs text-neutral-400 mb-3">
              La suppression efface immédiatement et définitivement ton compte, ton profil, tes
              photos, tes conversations et tes likes. Aucune récupération possible.
            </p>
            <DeleteAccountButton />
          </div>
        </div>
      </div>
      <BottomNav />
    </main>
  );
}
