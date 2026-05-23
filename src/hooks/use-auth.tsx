import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type Ctx = {
  user: User | null;
  session: Session | null;
  loading: boolean;
};

const AuthCtx = createContext<Ctx>({ user: null, session: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up listener BEFORE getting session (per Supabase guidance)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Heartbeat — update last_seen every minute
  useEffect(() => {
    if (!session?.user) return;
    const ping = async () => {
      await supabase.from("profiles").update({ last_seen: new Date().toISOString() }).eq("id", session.user.id);
    };
    ping();
    const id = setInterval(ping, 60_000);
    return () => clearInterval(id);
  }, [session?.user?.id]);

  return (
    <AuthCtx.Provider value={{ user: session?.user ?? null, session, loading }}>{children}</AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
