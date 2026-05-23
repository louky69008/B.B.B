import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RequireAuth } from "@/components/require-auth";
import { useScreenshotGuard } from "@/hooks/use-screenshot-guard";

function AppLayout() {
  useScreenshotGuard();
  return (
    <RequireAuth>
      <Outlet />
    </RequireAuth>
  );
}

export const Route = createFileRoute("/app")({
  component: AppLayout,
});
