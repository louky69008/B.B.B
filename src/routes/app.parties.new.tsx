import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/app/parties/new")({ component: NewParty });

function NewParty() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [practices, setPractices] = useState<string[]>([]);
  const [fullChill, setFullChill] = useState(false);
  const [f, setF] = useState({
    title: "", description: "", address: "", access_code: "", floor: "",
    city: "", starts_at: "", max_participants: "10",
    is_paid: false, price: "", rules: "", warnings: "",
  });
  const set = (k: keyof typeof f, v: any) => setF((p) => ({ ...p, [k]: v }));

  const PRACTICE_OPTIONS = [
    "Safe", "Capote", "BBK", "Sous PrEP", "TasP/U=U",
    "Suce", "Branle", "Actif", "Passif", "Versa",
    "Kiss", "Massage", "Naked party", "Sling", "Group",
    "Poppers OK", "Sans poppers", "Sans chems",
  ];

  const togglePractice = (p: string) =>
    setPractices((cur) => (cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p]));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.info("Crée un compte pour publier ta soirée"); navigate({ to: "/auth" }); return; }
    setBusy(true);
    const { data, error } = await supabase.from("parties").insert({
      host_id: user.id,
      title: f.title.trim(),
      description: f.description.trim(),
      address: f.address.trim(),
      access_code: f.access_code.trim() || null,
      floor: f.floor.trim() || null,
      city: f.city.trim(),
      starts_at: new Date(f.starts_at).toISOString(),
      max_participants: Number(f.max_participants),
      is_paid: f.is_paid,
      price_cents: f.is_paid && f.price ? Math.round(Number(f.price) * 100) : null,
      rules: f.rules.trim(),
      warnings: f.warnings.trim(),
      practices: fullChill ? [] : practices,
      full_chill_out: fullChill,
    }).select("id").single();
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Soirée publiée !");
    navigate({ to: "/app/parties/$id", params: { id: data.id } });
  };

  return (
    <main className="min-h-screen bg-black text-white flex justify-center">
      <div className="w-full max-w-[420px] pb-24">
        <header className="flex items-center gap-3 px-4 py-3 border-b border-neutral-800 sticky top-0 bg-black/95 backdrop-blur z-10">
          <Link to="/app/parties" className="p-1"><ArrowLeft className="size-5" /></Link>
          <h1 className="text-lg font-bold">Nouvelle soirée appart'</h1>
        </header>

        <form onSubmit={submit} className="p-4 space-y-4">
          <div>
            <Label className="text-neutral-300">Titre</Label>
            <Input required value={f.title} onChange={(e) => set("title", e.target.value)}
              placeholder="Ex: After chill chez moi" maxLength={80}
              className="bg-neutral-900 border-neutral-700 text-white" />
          </div>
          <div>
            <Label className="text-neutral-300">Présentation</Label>
            <Textarea required value={f.description} onChange={(e) => set("description", e.target.value)}
              placeholder="Ce que tu attends, l'ambiance, ce que tu cherches…" rows={4} maxLength={1000}
              className="bg-neutral-900 border-neutral-700 text-white" />
          </div>
          <div>
            <Label className="text-neutral-300">Adresse</Label>
            <Input required value={f.address} onChange={(e) => set("address", e.target.value)}
              placeholder="Visible uniquement après acceptation"
              className="bg-neutral-900 border-neutral-700 text-white" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-neutral-300">Étage</Label>
              <Input value={f.floor} onChange={(e) => set("floor", e.target.value)}
                className="bg-neutral-900 border-neutral-700 text-white" />
            </div>
            <div>
              <Label className="text-neutral-300">Code</Label>
              <Input value={f.access_code} onChange={(e) => set("access_code", e.target.value)}
                className="bg-neutral-900 border-neutral-700 text-white" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-neutral-300">Ville</Label>
              <Input required value={f.city} onChange={(e) => set("city", e.target.value)}
                className="bg-neutral-900 border-neutral-700 text-white" />
            </div>
            <div>
              <Label className="text-neutral-300">Max participants</Label>
              <Input type="number" min={2} max={50} required value={f.max_participants}
                onChange={(e) => set("max_participants", e.target.value)}
                className="bg-neutral-900 border-neutral-700 text-white" />
            </div>
          </div>
          <div>
            <Label className="text-neutral-300">Date & heure</Label>
            <Input type="datetime-local" required value={f.starts_at} onChange={(e) => set("starts_at", e.target.value)}
              className="bg-neutral-900 border-neutral-700 text-white" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={f.is_paid} onCheckedChange={(v) => set("is_paid", v === true)} />
            Entrée payante
          </label>
          {f.is_paid && (
            <Input type="number" step="0.5" min={0} value={f.price} onChange={(e) => set("price", e.target.value)}
              placeholder="Prix en €" className="bg-neutral-900 border-neutral-700 text-white" />
          )}
          <div>
            <Label className="text-neutral-300">Règles (optionnel)</Label>
            <Textarea value={f.rules} onChange={(e) => set("rules", e.target.value)} rows={2} maxLength={500}
              placeholder="Ce que tu veux, ce que tu ne veux pas…"
              className="bg-neutral-900 border-neutral-700 text-white" />
          </div>
          <div>
            <Label className="text-neutral-300">Mises en garde (optionnel)</Label>
            <Textarea value={f.warnings} onChange={(e) => set("warnings", e.target.value)} rows={2} maxLength={300}
              className="bg-neutral-900 border-neutral-700 text-white" />
          </div>

          <div className="space-y-2 pt-2 border-t border-neutral-800">
            <Label className="text-neutral-300">Ambiance / pratiques</Label>
            <label className="flex items-center gap-2 text-sm bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2">
              <Checkbox checked={fullChill} onCheckedChange={(v) => setFullChill(v === true)} />
              <span className="font-medium">🔥 Full chill out</span>
              <span className="text-xs text-neutral-400">(open sur beaucoup de choses)</span>
            </label>
            {!fullChill && (
              <div className="flex flex-wrap gap-2 pt-1">
                {PRACTICE_OPTIONS.map((p) => {
                  const on = practices.includes(p);
                  return (
                    <button
                      type="button"
                      key={p}
                      onClick={() => togglePractice(p)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                        on
                          ? "bg-yellow-400 text-black border-yellow-400"
                          : "bg-neutral-900 text-neutral-300 border-neutral-700"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            )}
            <p className="text-[11px] text-neutral-500">
              Sois clair sur ce que tu attends — chacun reste libre et responsable.
            </p>
          </div>

          <button disabled={busy} className="w-full h-12 rounded-full bg-yellow-400 text-black font-bold disabled:opacity-50">
            Publier la soirée appart'
          </button>
        </form>
      </div>
    </main>
  );
}
