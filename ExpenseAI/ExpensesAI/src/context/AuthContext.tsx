import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface LocalUser {
  uid: string;
  email: string;
}

interface AuthContextValue {
  user: LocalUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateEmail: (newEmail: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const mapUser = (user: User | null): LocalUser | null =>
  user
    ? {
        uid: user.id,
        email: user.email ?? "",
      }
    : null;

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize the current Supabase session on app start.
    const init = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Failed to get Supabase session:", error.message);
      }
      console.log("[AuthProvider] init session:", data?.session ?? null);
      try {
        // expose for quick runtime inspection
        (window as any).__AUTH_DEBUG = { when: Date.now(), event: 'init', session: data?.session ?? null };
      } catch {}
      setUser(mapUser(data.session?.user ?? null));
      setLoading(false);
    };

    init();

    // Keep React state in sync with Supabase authentication events.
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[AuthProvider] onAuthStateChange:", event, session ?? null);
      try {
        (window as any).__AUTH_DEBUG = { when: Date.now(), event, session: session ?? null };
      } catch {}
      setUser(mapUser(session?.user ?? null));
      setLoading(false);
    });

    return () => (data as any)?.subscription?.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    if (!data.session || !data.user) throw new Error("Unable to sign in. Please check your credentials.");
    console.log('[AuthProvider] signIn success, user:', data.user, 'session:', data.session);
    try { (window as any).__AUTH_DEBUG = { when: Date.now(), event: 'signIn', user: data.user, session: data.session }; } catch {}
    setUser(mapUser(data.user));
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw new Error(error.message);

    // If the user is immediately signed in, persist the session.
    setUser(mapUser(data.session?.user ?? null));
    return Boolean(data.session);
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) throw new Error(error.message);
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
    console.log('[AuthProvider] signOut called');
    try { (window as any).__AUTH_DEBUG = { when: Date.now(), event: 'signOut' }; } catch {}
    setUser(null);
  };

  const updateEmail = async (newEmail: string) => {
    if (!user) throw new Error("No authenticated user.");
    const { data, error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) throw new Error(error.message);
    setUser(mapUser(data.user));
  };

  const updatePassword = async (newPassword: string) => {
    if (!user) throw new Error("No authenticated user.");
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw new Error(error.message);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    if (error) throw new Error(error.message);
  };

  const value: AuthContextValue = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    logout: signOut,
    updateEmail,
    updatePassword,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
