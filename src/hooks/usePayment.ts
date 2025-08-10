import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

export function usePayment() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const createPayment = async (productType: string = 'pet_slot', quantity: number = 1) => {
    try {
      setIsLoading(true);
      console.log(`🛒 Creating payment for ${quantity} ${productType}(s)`);

      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { 
          product_type: productType,
          quantity: quantity
        }
      });

      if (error) {
        console.error('❌ Payment creation error:', error);
        throw error;
      }

      if (data?.url) {
        console.log('✅ Payment URL received, opening Stripe checkout');
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
        
        toast({
          title: "Payment initiated",
          description: "Redirecting to secure payment...",
        });
      } else {
        throw new Error('No payment URL received');
      }

    } catch (error: any) {
      console.error('❌ Payment error:', error);
      toast({
        title: "Payment Error",
        description: error.message || 'Failed to create payment',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createPayment,
    isLoading
  };
}