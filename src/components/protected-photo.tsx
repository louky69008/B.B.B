import { useEffect, useRef, useState, type ImgHTMLAttributes } from "react";
import { useIsUltra } from "@/hooks/use-is-ultra";

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src: string | null | undefined;
  ownerId?: string | null;
  ownerPseudo?: string | null;
  /** Force the watermark on/off regardless of the owner's tier. */
  forceWatermark?: boolean;
  className?: string;
  /** Density of the watermark tile (smaller = more repeats). */
  watermarkDensity?: number;
  rounded?: string;
  /** Hide the visible "Photo protégée" lock label — still blurs to black on screenshot. */
  silent?: boolean;
};

/**
 * Image wrapper used to display user photos in the app.
 *
 * - Deters reuse: disables drag, right-click, text-selection, save-image gestures.
 * - Blurs the photo as soon as the tab/window loses focus to break native
 *   screenshot tools (limited but standard deterrent — true screenshot blocking
 *   is not possible in a web browser).
 * - If the photo owner has the **Ultra** subscription (or `forceWatermark` is
 *   set), overlays a repeating diagonal watermark with their pseudo so the
 *   photo cannot be reused without showing the brand of its owner.
 */
export function ProtectedPhoto({
  src,
  ownerId,
  ownerPseudo,
  forceWatermark,
  className,
  watermarkDensity = 180,
  rounded,
  alt = "",
  silent = false,
  ...imgProps
}: Props) {
  const isUltra = useIsUltra(ownerId);
  const showWatermark = forceWatermark ?? isUltra;
  const [hidden, setHidden] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Blur on tab switch / window blur (deters screen capture tools)
  useEffect(() => {
    const onVis = () => setHidden(document.visibilityState !== "visible");
    const onBlur = () => setHidden(true);
    const onFocus = () => setHidden(false);
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  const stop = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const wmLabel = (ownerPseudo || "Kindly").toUpperCase();

  return (
    <div
      ref={wrapRef}
      className={`relative overflow-hidden ${rounded ?? ""} ${className ?? ""}`}
      onContextMenu={stop}
      onDragStart={stop}
      style={
        {
          userSelect: "none",
          WebkitUserSelect: "none",
          WebkitTouchCallout: "none",
          WebkitUserDrag: "none",
        } as React.CSSProperties
      }
    >
      {src ? (
        <img
          {...imgProps}
          src={src}
          alt={alt}
          draggable={false}
          onContextMenu={stop}
          onDragStart={stop}
          className="w-full h-full object-cover pointer-events-none select-none"
          style={
            {
              transition: "filter 200ms ease",
              filter: hidden ? "blur(36px) brightness(0.4)" : "none",
              WebkitUserDrag: "none",
            } as React.CSSProperties
          }
        />
      ) : (
        <div className="w-full h-full bg-neutral-900" />
      )}

      {/* Transparent click-blocker — prevents long-press "Save image" on mobile */}
      <div
        className="absolute inset-0"
        onContextMenu={stop}
        onDragStart={stop}
        style={{ pointerEvents: "none" }}
      />

      {showWatermark && src && !hidden && (
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(
              `<svg xmlns='http://www.w3.org/2000/svg' width='${watermarkDensity}' height='${watermarkDensity}'>
                 <text x='50%' y='50%' fill='white' fill-opacity='0.35'
                       font-family='Inter, system-ui, sans-serif' font-size='13' font-weight='700'
                       text-anchor='middle' transform='rotate(-30 ${watermarkDensity / 2} ${watermarkDensity / 2})'>
                   @${wmLabel} · KINDLY
                 </text>
               </svg>`,
            )}")`,
            mixBlendMode: "overlay",
          }}
        />
      )}

      {hidden && !silent && (
        <div className="absolute inset-0 flex items-center justify-center text-[10px] uppercase tracking-widest text-white/60 bg-black/40">
          🔒 Photo protégée
        </div>
      )}

      {hidden && silent && <div className="absolute inset-0 bg-black" />}
    </div>
  );
}
