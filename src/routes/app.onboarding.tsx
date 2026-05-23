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
  { v: "travesti", label: "Travesti / Trav" },
  { v: "drag", label: "Drag" },
  { v: "non_binaire", label: "Non-binaire" },
  { v: "genderfluid", label: "Genderfluid" },
  { v: "genderqueer", label: "Genderqueer" },
  { v: "agender", label: "Agender" },
  { v: "two_spirit", label: "Two-Spirit" },
  { v: "intersexe", label: "Intersexe" },
  { v: "autre", label: "Autre" },
];
const PRONOUNS = ["il/lui", "elle/la", "iel/ellui", "they/them", "il/elle", "autre"];
const ORIENTATIONS = [
  { v: "gay", label: "Gay" },
  { v: "homosexuel", label: "Homosexuel" },
  { v: "bi", label: "Bisexuel" },
  { v: "pan", label: "Pansexuel" },
  { v: "queer", label: "Queer" },
  { v: "hetero_curieux", label: "Hétéro curieux" },
  { v: "hetero", label: "Hétéro" },
  { v: "demisexuel", label: "Demisexuel" },
  { v: "asexuel", label: "Asexuel" },
  { v: "fluide", label: "Fluide / Sexofluide" },
  { v: "autre", label: "Autre / préfère ne pas dire" },
];

const TERMS_VERSION = "2026-05-23";

function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [form, setForm] = useState({
    pseudo: "",
    gender_identity: "homme_cis",
    pronouns: "il/lui",
    orientation: "gay",
    age: "",
    city: "",
    photo_url: "",
    bio: "",
  });

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const steps = [
    {
      title: "Règles d'utilisation",
      subtitle: "À lire et accepter avant d'entrer. Tu ne pourras pas revenir en arrière sans accepter.",
      valid: () => acceptedTerms,
      body: (
        <div className="space-y-4">
          <div className="max-h-[55vh] overflow-y-auto rounded-2xl bg-neutral-900 border border-neutral-800 p-4 text-sm text-neutral-300 space-y-3">
            <p className="font-semibold text-white">En utilisant Prism Connect, tu t'engages à :</p>
            <ul className="space-y-2 list-disc pl-5">
              <li><b className="text-white">Avoir 18 ans ou plus.</b> Toute fausse déclaration entraîne un bannissement immédiat et définitif.</li>
              <li><b className="text-white">Respecter chaque membre</b> peu importe son identité de genre, son orientation, son origine, son corps, son statut sérologique ou sa séropositivité.</li>
              <li><b className="text-white">Aucun harcèlement</b>, insulte, menace, racisme, transphobie, sérophobie, grossophobie, validisme ou discrimination — sanctions progressives (avertissement, 24h, 30j, à vie) avec bannissement de l'appareil.</li>
              <li><b className="text-white">Aucun contenu illégal</b> : mineurs, violence non consentie, drogues, prostitution, contenu volé.</li>
              <li><b className="text-white">Consentement obligatoire</b> avant tout échange de photo intime. Le partage non consenti d'images privées (revenge porn) est un délit et entraîne un signalement aux autorités.</li>
              <li><b className="text-white">Soirées / rencontres IRL</b> : tu es seul responsable de tes choix et de ta sécurité. Préviens un proche, vérifie le profil, refuse si tu n'es pas à l'aise. L'app n'est pas responsable des événements organisés entre membres.</li>
              <li><b className="text-white">Signalement</b> : utilise le bouton signaler dès qu'un comportement te semble inapproprié. Les modérateurs interviennent.</li>
              <li><b className="text-white">Pas d'usurpation d'identité</b>, pas de faux profil, pas de spam, pas de promotion commerciale sans accord.</li>
            </ul>
            <p className="font-semibold text-white pt-2">Sanctions</p>
            <p>Toute violation peut entraîner : avertissement → suspension 24h → suspension 30j → bannissement à vie de ton compte ET de ton appareil (impossible de recréer un compte).</p>
            <p className="font-semibold text-white pt-2">Responsabilité</p>
            <p>Prism Connect met à disposition une plateforme de mise en relation. Les échanges, rencontres et soirées se font sous l'entière responsabilité des utilisateurs. L'éditeur ne pourra être tenu responsable des comportements, dommages ou incidents survenant entre membres.</p>
            <p className="text-xs text-neutral-500 pt-2">Version {TERMS_VERSION} — En cochant, tu confirmes avoir lu et accepté ces règles ainsi que les CGU et la politique de confidentialité.</p>
          </div>
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-1 size-5 accent-yellow-400"
            />
            <span className="text-sm text-white">J'ai 18 ans ou plus et j'accepte les règles d'utilisation, les CGU et la politique de confidentialité.</span>
          </label>
        </div>
      ),
    },
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
    if (!acceptedTerms) { toast.error("Tu dois accepter les règles d'utilisation."); setStep(0); return; }
    setBusy(true);
    const { error } = await supabase.from("profiles").update({
      pseudo: form.pseudo.trim(),
      gender_identity: form.gender_identity,
      pronouns: form.pronouns,
      age: Number(form.age),
      city: form.city.trim(),
      photo_url: form.photo_url.trim(),
      bio: form.bio.trim() || null,
      terms_accepted_at: new Date().toISOString(),
      terms_version: TERMS_VERSION,
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
