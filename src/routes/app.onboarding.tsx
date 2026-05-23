import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft, Check, X } from "lucide-react";
import { PhotoUpload } from "@/components/photo-upload";

export const Route = createFileRoute("/app/onboarding")({ component: Onboarding });

const GENDERS = [
  { v: "homme_cis", label: "Homme cis" },
  { v: "homme_trans", label: "Homme trans" },
  { v: "femme_trans", label: "Femme trans" },
  { v: "non_binaire", label: "Non-binaire" },
  { v: "genderfluid", label: "Genderfluid" },
  { v: "agender", label: "Agender" },
  { v: "autre", label: "Autre" },
];
const PRONOUNS = ["il/lui", "elle/la", "iel/ellui", "they/them", "autre"];

function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    pseudo: "",
    gender_identity: "homme_cis",
    pronouns: "il/lui",
    age: "",
    city: "",
    photo_url: "",
    bio: "",
  });

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const steps = [
    {
      title: "Ton pseudo",
      subtitle: "C'est comme ça que les autres te verront.",
      valid: () => form.pseudo.trim().length >= 2,
      body: (
        <Input
          autoFocus
          value={form.pseudo}
          onChange={(e) => set("pseudo", e.target.value)}
          placeholder="Pseudo"
          maxLength={30}
          className="bg-neutral-900 border-neutral-700 text-white h-14 text-lg"
        />
      ),
    },
    {
      title: "Ton identité",
      subtitle: "Tu peux la changer à tout moment. Aucune discrimination tolérée.",
      valid: () => !!form.gender_identity && !!form.pronouns,
      body: (
        <div className="space-y-3">
          <div>
            <Label className="text-neutral-400 text-xs">Identité de genre</Label>
            <Select value={form.gender_identity} onValueChange={(v) => set("gender_identity", v)}>
              <SelectTrigger className="bg-neutral-900 border-neutral-700 text-white h-12"><SelectValue /></SelectTrigger>
              <SelectContent>{GENDERS.map((g) => <SelectItem key={g.v} value={g.v}>{g.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-neutral-400 text-xs">Pronoms</Label>
            <Select value={form.pronouns} onValueChange={(v) => set("pronouns", v)}>
              <SelectTrigger className="bg-neutral-900 border-neutral-700 text-white h-12"><SelectValue /></SelectTrigger>
              <SelectContent>{PRONOUNS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
      ),
    },
    {
      title: "Âge & ville",
      subtitle: "L'âge est obligatoire (18+). Tu peux le masquer plus tard.",
      valid: () => {
        const n = Number(form.age);
        return n >= 18 && n <= 120 && form.city.trim().length >= 2;
      },
      body: (
        <div className="space-y-3">
          <Input type="number" min={18} max={120} value={form.age} onChange={(e) => set("age", e.target.value)}
            placeholder="Âge" className="bg-neutral-900 border-neutral-700 text-white h-14 text-lg" />
          <Input value={form.city} onChange={(e) => set("city", e.target.value)}
            placeholder="Ville" className="bg-neutral-900 border-neutral-700 text-white h-14 text-lg" />
        </div>
      ),
    },
    {
      title: "Ta photo",
      subtitle: "Choisis une photo depuis ton appareil (optionnel). Tu pourras en ajouter d'autres ensuite.",
      valid: () => true,
      body: (
        <div className="space-y-3 flex flex-col items-center">
          {form.photo_url ? (
            <div className="relative aspect-square w-48 rounded-2xl overflow-hidden bg-neutral-900">
              <img src={form.photo_url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => set("photo_url", "")}
                className="absolute top-2 right-2 size-8 rounded-full bg-black/70 flex items-center justify-center"
              >
                <X className="size-4" />
              </button>
            </div>
          ) : (
            <div className="aspect-square w-48 rounded-2xl bg-neutral-900 border-2 border-dashed border-neutral-700 flex items-center justify-center text-neutral-500 text-sm">
              Aucune photo
            </div>
          )}
          {user && (
            <PhotoUpload userId={user.id} onUploaded={(url) => set("photo_url", url)}>
              {form.photo_url ? "Changer la photo" : "Choisir une photo"}
            </PhotoUpload>
          )}
        </div>
      ),
    },
    {
      title: "Ta bio (optionnel)",
      subtitle: "Présente-toi en quelques mots.",
      valid: () => true,
      body: (
        <Textarea value={form.bio} onChange={(e) => set("bio", e.target.value)} maxLength={500} rows={5}
          placeholder="Qui es-tu, ce que tu cherches…"
          className="bg-neutral-900 border-neutral-700 text-white text-base" />
      ),
    },
  ];

  const current = steps[step];
  const isLast = step === steps.length - 1;

  const finish = async () => {
    if (!user) return;
    setBusy(true);
    const { error } = await supabase.from("profiles").update({
      pseudo: form.pseudo.trim(),
      gender_identity: form.gender_identity,
      pronouns: form.pronouns,
      age: Number(form.age),
      city: form.city.trim(),
      photo_url: form.photo_url.trim(),
      bio: form.bio.trim() || null,
    }).eq("id", user.id);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Bienvenue !");
    navigate({ to: "/app/grid" });
  };

  return (
    <main className="min-h-screen w-full bg-black text-white flex justify-center">
      <div className="w-full max-w-[420px] min-h-screen flex flex-col px-5 pt-6 pb-8">
        {/* Progress */}
        <div className="flex gap-1.5 mb-8">
          {steps.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-yellow-400" : "bg-neutral-800"}`} />
          ))}
        </div>

        <div className="flex-1 flex flex-col">
          <h1 className="text-3xl font-bold tracking-tight">{current.title}</h1>
          <p className="text-sm text-neutral-400 mt-2 mb-8">{current.subtitle}</p>
          <div>{current.body}</div>
        </div>

        <div className="flex gap-3 pt-6">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)}
              className="h-14 px-5 rounded-full bg-neutral-900 border border-neutral-700 text-white flex items-center gap-2">
              <ArrowLeft className="size-4" />
            </button>
          )}
          <button
            disabled={!current.valid() || busy}
            onClick={() => (isLast ? finish() : setStep(step + 1))}
            className="flex-1 h-14 rounded-full bg-yellow-400 text-black font-bold flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {isLast ? (<>Terminer <Check className="size-5" /></>) : (<>Continuer <ArrowRight className="size-5" /></>)}
          </button>
        </div>
      </div>
    </main>
  );
}
