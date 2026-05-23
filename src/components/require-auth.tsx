import { useEffect, type ReactNode } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["onboarding-check", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("age, city, photo_url, gender_identity")
        .eq("id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }
    if (profileLoading) return;
    const incomplete =
      !profile ||
      !profile.age ||
      !profile.city ||
      !profile.photo_url ||
      !profile.gender_identity;
    if (incomplete && pathname !== "/app/onboarding") {
      navigate({ to: "/app/onboarding" });
    }
  }, [loading, user, profile, profileLoading, pathname, navigate]);

  if (loading) {
    return <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">…</div>;
  }
  if (!user) return null;
  return <>{children}</>;
}
