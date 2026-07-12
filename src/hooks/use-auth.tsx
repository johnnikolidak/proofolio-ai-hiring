import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type ProfileRole = "candidate" | "company" | "university" | "admin";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: ProfileRole;
  company_name: string | null;
  avatar_url: string | null;
};

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function loadProfileAndAdmin(userId: string): Promise<{ profile: Profile | null; isAdmin: boolean }> {
  const [{ data: profileRow }, { data: roleRow }] = await Promise.all([
    supabase.from("profiles").select("id,email,full_name,role,company_name,avatar_url").eq("id", userId).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle(),
  ]);
  return {
    profile: (profileRow as Profile | null) ?? null,
    isAdmin: !!roleRow,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      if (!mounted) return;
      setSession(next);
      if (next?.user) {
        setTimeout(() => {
          loadProfileAndAdmin(next.user.id).then(({ profile, isAdmin }) => {
            if (!mounted) return;
            setProfile(profile);
            setIsAdmin(isAdmin);
          });
        }, 0);
      } else {
        setProfile(null);
        setIsAdmin(false);
      }
      if (event === "INITIAL_SESSION") setLoading(false);
    });

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      if (data.session?.user) {
        loadProfileAndAdmin(data.session.user.id).then(({ profile, isAdmin }) => {
          if (!mounted) return;
          setProfile(profile);
          setIsAdmin(isAdmin);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    if (!session?.user) return;
    const { profile, isAdmin } = await loadProfileAndAdmin(session.user.id);
    setProfile(profile);
    setIsAdmin(isAdmin);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile,
        isAdmin,
        loading,
        refreshProfile,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
