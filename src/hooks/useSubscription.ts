import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface SubscriptionData {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
  pet_limit: number;
  additional_pets: number;
  total_pet_limit: number;
}

export function useSubscription() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<SubscriptionData>({
    subscribed: false,
    subscription_tier: null,
    subscription_end: null,
    pet_limit: 0,
    additional_pets: 0,
    total_pet_limit: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const checkSubscription = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      console.debug('[Subscription] Checking subscription...');
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (error) throw error as any;

      console.debug('[Subscription] Received data:', data);
      setSubscription(data as SubscriptionData);
      toast({ title: "Subscription", description: "Status refreshed" });
    } catch (error: any) {
      console.error('Error checking subscription:', error);
      toast({
        title: "Subscription error",
        description: error?.message || "Failed to check subscription status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  const createCheckout = useCallback(async (planType: 'monthly' | 'yearly', additionalPets = 0) => {
    if (!user) return;

    setIsLoading(true);
    try {
      console.debug('[Subscription] Creating checkout', { planType, additionalPets });
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planType, additionalPets },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (error) throw error as any;

      toast({ title: "Redirecting to Stripe", description: "Checkout will open in a new tab" });
      // Open Stripe checkout in a new tab
      window.open((data as any).url, '_blank');
    } catch (error: any) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Checkout error",
        description: error?.message || "Failed to create checkout session",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  const openCustomerPortal = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      console.debug('[Subscription] Opening customer portal');
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (error) throw error as any;

      toast({ title: "Opening Stripe Portal", description: "Portal will open in a new tab" });
      // Open customer portal in a new tab
      window.open((data as any).url, '_blank');
    } catch (error: any) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Portal error",
        description: error?.message || "Failed to open customer portal",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  // Check subscription on mount and when user changes
  useEffect(() => {
    if (user) {
      checkSubscription();
    }
  }, [user, checkSubscription]);

  return {
    subscription,
    isLoading,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
  };
}