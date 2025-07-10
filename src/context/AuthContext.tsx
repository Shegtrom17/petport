import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { cleanupAuthState } from "@/utils/authCleanup";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    console.log("AuthProvider: Setting up auth state listener");
    
    // Listen for auth changes first
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("AuthProvider: Auth state changed", { event, session });
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Check active session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log("AuthProvider: Initial session check", { session, error });
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      console.log("AuthProvider: Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log("AuthProvider: Attempting sign in", { email });
      setIsLoading(true);
      
      // Clean up any existing auth state first
      cleanupAuthState();
      
      // Try to sign out globally first
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.log("AuthProvider: Global signout failed (continuing anyway)", err);
      }
      
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error("AuthProvider: Sign in error", error);
        throw error;
      }
      console.log("AuthProvider: Sign in successful");
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
    } catch (error: any) {
      console.error("AuthProvider: Sign in failed", error);
      toast({
        variant: "destructive",
        title: "Error signing in",
        description: error.message || "Please try again.",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      console.log("AuthProvider: Attempting sign up", { email, fullName });
      setIsLoading(true);
      
      // Clean up any existing auth state first
      cleanupAuthState();
      
      // Try to sign out globally first
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.log("AuthProvider: Global signout failed during signup (continuing anyway)", err);
      }
      
      const redirectUrl = `${window.location.origin}/`;
      console.log("AuthProvider: Using redirect URL", redirectUrl);
      
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName
          }
        }
      });
      
      console.log("AuthProvider: Sign up response", { data, error });
      
      if (error) {
        console.error("AuthProvider: Sign up error", error);
        throw error;
      }
      
      console.log("AuthProvider: Sign up successful", data);
      toast({
        title: "Account created!",
        description: "Please check your email for verification.",
      });
    } catch (error: any) {
      console.error("AuthProvider: Sign up failed", error);
      toast({
        variant: "destructive",
        title: "Error signing up",
        description: error.message || "Please try again.",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log("AuthProvider: Attempting sign out");
      setIsLoading(true);
      
      // Clean up auth state first
      cleanupAuthState();
      
      await supabase.auth.signOut({ scope: 'global' });
      console.log("AuthProvider: Sign out successful");
      
      // Force page reload to ensure clean state
      window.location.href = '/auth';
      
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error: any) {
      console.error("AuthProvider: Sign out failed", error);
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: error.message || "Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
