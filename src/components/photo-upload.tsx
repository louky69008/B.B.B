import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";

type Props = {
  userId: string;
  onUploaded: (url: string) => void;
  children?: React.ReactNode;
  className?: string;
};

export async function uploadProfilePhoto(userId: string, file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Fichier image requis");
  if (file.size > 10 * 1024 * 1024) throw new Error("Image trop lourde (max 10 Mo)");
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("profile-photos").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("profile-photos").getPublicUrl(path);
  return data.publicUrl;
}

export function PhotoUpload({ userId, onUploaded, children, className }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handleFile = async (file: File) => {
    setBusy(true);
    try {
      const url = await uploadProfilePhoto(userId, file);
      onUploaded(url);
      toast.success("Photo ajoutée");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleClick = () => {
    const ok = window.confirm(
      "Règles photos :\n\n" +
        "• Aucune nudité visible (sexe, poitrine, fesses nues)\n" +
        "• Aucun mineur, aucune photo prise sans consentement\n" +
        "• Pas de coordonnées, ni de pub\n\n" +
        "Les photos non conformes sont supprimées et peuvent entraîner un bannissement.\n\n" +
        "Je confirme que ma photo respecte ces règles.",
    );
    if (ok) inputRef.current?.click();
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
      <button
        type="button"
        disabled={busy}
        onClick={handleClick}
        className={
          className ??
          "h-12 px-5 rounded-full bg-yellow-400 text-black font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
        }
      >
        {busy ? <Loader2 className="size-5 animate-spin" /> : <Upload className="size-5" />}
        {children ?? (busy ? "Envoi…" : "Choisir une photo")}
      </button>
    </>
  );
}
