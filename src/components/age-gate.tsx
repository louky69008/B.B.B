import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { ShieldAlert } from "lucide-react";

const STORAGE_KEY = "bbb_age_gate_v1";

export function AgeGate() {
  const [open, setOpen] = useState(false);
  const [adult, setAdult] = useState(false);
  const [explicit, setExplicit] = useState(false);
  const [noNudity, setNoNudity] = useState(false);

  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const v = localStorage.getItem(STORAGE_KEY);
      if (!v) setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  if (!open) return null;
  const canEnter = adult && explicit && noNudity;

  const accept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ at: new Date().toISOString() }));
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  const leave = () => {
    if (typeof window !== "undefined") {
      window.location.href = "https://www.google.com";
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(12px)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
    >
      <div className="w-full max-w-md rounded-3xl border border-yellow-400/40 bg-neutral-950 p-6 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-yellow-400/15">
            <ShieldAlert className="size-6 text-yellow-400" />
          </div>
          <div>
            <h2 id="age-gate-title" className="text-xl font-bold text-white">
              Réservé aux adultes (18+)
            </h2>
            <p className="text-xs text-neutral-400">Contrôle d'entrée obligatoire</p>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-neutral-200">
          Ce site s'adresse <strong>uniquement aux personnes majeures</strong>. Il peut contenir un
          <strong> langage explicite</strong> à caractère sexuel destiné à une communauté adulte
          consentante. <strong>Aucune nudité publique n'est tolérée</strong> sur les profils ou les
          contenus visibles sans connexion.
        </p>

        <div className="mt-5 space-y-3 text-sm text-neutral-200">
          <label className="flex cursor-pointer items-start gap-2">
            <Checkbox
              checked={adult}
              onCheckedChange={(v) => setAdult(v === true)}
              className="mt-0.5"
            />
            <span>
              Je certifie avoir <strong>18 ans ou plus</strong>.
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-2">
            <Checkbox
              checked={explicit}
              onCheckedChange={(v) => setExplicit(v === true)}
              className="mt-0.5"
            />
            <span>
              J'accepte d'être exposé·e à du <strong>langage explicite</strong> entre adultes
              consentants.
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-2">
            <Checkbox
              checked={noNudity}
              onCheckedChange={(v) => setNoNudity(v === true)}
              className="mt-0.5"
            />
            <span>
              Je comprends que la <strong>nudité publique est interdite</strong> et que tout abus
              peut être signalé puis sanctionné.
            </span>
          </label>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <button
            disabled={!canEnter}
            onClick={accept}
            className="h-12 rounded-full bg-yellow-400 font-bold text-black transition disabled:cursor-not-allowed disabled:opacity-40"
          >
            Entrer
          </button>
          <button
            onClick={leave}
            className="h-10 rounded-full text-sm text-neutral-400 hover:text-white"
          >
            J'ai moins de 18 ans — quitter
          </button>
        </div>

        <p className="mt-4 text-[11px] leading-relaxed text-neutral-500">
          En entrant, vous reconnaissez avoir lu et accepté ces conditions. Votre choix est
          enregistré localement sur cet appareil.
        </p>
      </div>
    </div>
  );
}
