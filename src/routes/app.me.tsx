import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/app/me")({ component: Me });

const GENDERS = ["homme_cis", "femme_trans", "homme_trans", "non_binaire", "genderfluid", "agender", "autre"];
const PRONOUNS = ["il/lui", "elle/la", "iel/ellui", "they/them", "autre"];

function Me() {
  const { user } = useAuth();
  const { t } = useI18n();
  const { data, refetch } = useQuery({
    queryKey: ["me", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user!.id).single();
      if (error) throw error;
      return data;
    },
  });

  const [form, setForm] = useState<any>(null);
  useEffect(() => { if (data) setForm(data); }, [data]);

  if (!form) return <main className="px-4 py-8 text-muted-foreground">…</main>;

  const save = async () => {
    const { error } = await supabase
      .from("profiles")
      .update({
        pseudo: form.pseudo,
        bio: form.bio,
        gender_identity: form.gender_identity,
        pronouns: form.pronouns,
        age: form.age ? Number(form.age) : null,
        city: form.city,
        photo_url: form.photo_url,
        hide_status: form.hide_status,
      })
      .eq("id", user!.id);
    if (error) { toast.error(error.message); return; }
    toast.success(t("profile_updated"));
    refetch();
  };

  const set = (k: string, v: any) => setForm({ ...form, [k]: v });

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold">{t("nav_me")}</h1>
      <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
        <div>
          <Label>{t("pseudo")}</Label>
          <Input value={form.pseudo ?? ""} onChange={(e) => set("pseudo", e.target.value)} />
        </div>
        <div>
          <Label>{t("photo_url")}</Label>
          <Input value={form.photo_url ?? ""} onChange={(e) => set("photo_url", e.target.value)} placeholder="https://…" />
        </div>
        <div>
          <Label>{t("bio")}</Label>
          <Textarea value={form.bio ?? ""} onChange={(e) => set("bio", e.target.value)} maxLength={500} rows={4} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>{t("gender")}</Label>
            <Select value={form.gender_identity ?? ""} onValueChange={(v) => set("gender_identity", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {GENDERS.map((g) => <SelectItem key={g} value={g}>{g.replace("_", " ")}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{t("pronouns")}</Label>
            <Select value={form.pronouns ?? ""} onValueChange={(v) => set("pronouns", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PRONOUNS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{t("age")}</Label>
            <Input type="number" min={18} max={120} value={form.age ?? ""} onChange={(e) => set("age", e.target.value)} />
          </div>
          <div>
            <Label>{t("city")}</Label>
            <Input value={form.city ?? ""} onChange={(e) => set("city", e.target.value)} />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={!!form.hide_status} onCheckedChange={(v) => set("hide_status", v === true)} />
          {t("hide_status")}
        </label>
        <Button onClick={save} className="w-full">{t("save")}</Button>
      </div>
    </main>
  );
}
