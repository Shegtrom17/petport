import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { cleanupAuthState } from '@/utils/authCleanup';
import { useToast } from '@/components/ui/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  status: "loading" | "authenticated" | "unauthenticated";
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");
  const [hasInitialized, setHasInitialized] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    console.log("Auth: Setting up auth state listener");
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth: Auth state changed", { event, session: !!session, userId: session?.user?.id });
        
        // Update state synchronously
        setSession(session);
        setUser(session?.user ?? null);
        
        // Update status based on session
        if (session?.user) {
          setStatus("authenticated");
        } else {
          setStatus("unauthenticated");
        }
        
        // Only set loading to false after we've initialized at least once
        if (!hasInitialized) {
          setHasInitialized(true);
          setIsLoading(false);
        }
        
        // Handle profile creation for new signups
        if (event === 'SIGNED_IN' && session?.user) {
          // Defer profile operations to prevent deadlocks
          setTimeout(async () => {
            try {
              // Check if profile exists
              const { data: existingProfile } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', session.user.id)
                .maybeSingle();
              // If no profile exists, create one
              if (!existingProfile) {
                console.log("Auth: Creating profile for new user");
                const { error: profileError } = await supabase
                  .from('profiles')
                  .insert({
                    id: session.user.id,
                    email: session.user.email!,
                    full_name: session.user.user_metadata?.full_name || ''
                  });
                if (profileError) {
                  console.error("Auth: Error creating profile:", profileError);
                } else {
                  console.log("Auth: Profile created successfully");
                }
              }
            } catch (error) {
              console.error("Auth: Error handling profile:", error);
            }
          }, 0);
        }

        // Always refresh subscription status when we have a session
        if (session?.user) {
          setTimeout(async () => {
            try {
              await supabase.functions.invoke('check-subscription');
            } catch (err) {
              console.warn('Auth: check-subscription failed', err);
            }
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("Auth: Error getting session:", error);
      }
      console.log("Auth: Initial session check", { session: !!session, userId: session?.user?.id });
      setSession(session);
      setUser(session?.user ?? null);
      
      // Set initial status based on session
      if (session?.user) {
        setStatus("authenticated");
      } else {
        setStatus("unauthenticated");
      }
      
      // Initialize loading state
      setHasInitialized(true);
      setIsLoading(false);
    });

    return () => {
      console.log("Auth: Cleaning up auth listener");
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Auth: Starting sign in process");
      
      // Clean up any existing auth state
      cleanupAuthState();
      
      // Attempt global sign out first
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.log("Auth: Global signout failed (this is okay):", err);
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Auth: Sign in error:", error);
        // Don't show toast here - let the calling component handle it
        throw error;
      }

      console.log("Auth: Sign in successful");
      toast({
        title: "Welcome back!",
        description: "You have been signed in successfully.",
      });
      
      // Force page refresh for clean state
      setTimeout(() => {
        window.location.href = '/app';
      }, 500);
      
    } catch (error) {
      console.error("Auth: Sign in error caught:", error);
      throw error;
    }
  };


  const signOut = async () => {
    try {
      console.log("Auth: Starting sign out process");
      
      // Clean up auth state first
      cleanupAuthState();
      
      // Attempt global sign out
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.log("Auth: Global signout failed (continuing anyway):", err);
      }
      
      console.log("Auth: Sign out completed");
      
      // Force page refresh for clean state
      window.location.href = '/auth';
      
    } catch (error) {
      console.error("Auth: Sign out error:", error);
      // Even if signout fails, redirect to auth page
      window.location.href = '/auth';
    }
  };

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    status,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
