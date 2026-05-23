import { useEffect } from "react";
import { toast } from "sonner";

/**
 * Global anti-screenshot / anti-reuse guard for the authenticated app.
 *
 * IMPORTANT — browsers can NOT truly block screenshots. This applies the
 * standard deterrents the platform allows:
 *   - disables global right-click and drag-and-drop
 *   - intercepts Ctrl/Cmd+S, Ctrl/Cmd+P, Ctrl/Cmd+Shift+S, PrintScreen
 *   - tries to clear the clipboard right after a PrintScreen keypress
 *   - shows a toast warning the user that screenshots are not allowed
 *
 * Individual <img> elements are additionally hardened via <ProtectedPhoto>,
 * which also blurs photos when the tab loses focus.
 */
export function useScreenshotGuard() {
  useEffect(() => {
    const warn = () => toast.warning("Capture d'écran interdite dans Kindly");

    const onContext = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      // Allow context menu inside form inputs / textareas
      if (target && /INPUT|TEXTAREA/.test(target.tagName)) return;
      e.preventDefault();
    };

    const onDrag = (e: DragEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.tagName === "IMG") e.preventDefault();
    };

    const onKey = async (e: KeyboardEvent) => {
      const cmd = e.ctrlKey || e.metaKey;
      // Save / Print / Print-Screen / DevTools-style screenshot
      if (
        (cmd && ["s", "p"].includes(e.key.toLowerCase())) ||
        (cmd && e.shiftKey && ["s", "p"].includes(e.key.toLowerCase())) ||
        e.key === "PrintScreen"
      ) {
        e.preventDefault();
        warn();
        // Best-effort: overwrite the clipboard after PrintScreen
        try {
          if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(
              "⛔ Capture bloquée par Kindly",
            );
          }
        } catch {
          /* clipboard write may be blocked — ignore */
        }
      }
    };

    document.addEventListener("contextmenu", onContext);
    document.addEventListener("dragstart", onDrag);
    document.addEventListener("keydown", onKey);
    document.addEventListener("keyup", onKey);
    return () => {
      document.removeEventListener("contextmenu", onContext);
      document.removeEventListener("dragstart", onDrag);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("keyup", onKey);
    };
  }, []);
}
