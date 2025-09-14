import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EmailShareData {
  type: 'profile' | 'care' | 'credentials' | 'resume' | 'reviews' | 'review_request' | 'missing_pet';
  recipientEmail: string;
  recipientName?: string;
  petName: string;
  petId: string;
  shareUrl: string;
  petPhoto?: string;
  customMessage?: string;
  senderName?: string;
}

export const useEmailSharing = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendEmail = async (data: EmailShareData): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const { data: result, error } = await supabase.functions.invoke('send-email', {
        body: data
      });

      if (error) {
        throw error;
      }

      if (result?.success) {
        toast({
          title: "Email sent successfully!",
          description: `${data.petName}'s ${data.type} has been shared with ${data.recipientEmail}`,
        });
        return true;
      } else {
        throw new Error(result?.error || 'Failed to send email');
      }
    } catch (error: any) {
      console.error('Email sending failed:', error);
      
      // Fallback to mailto
      const subject = encodeURIComponent(`${data.petName}'s PetPort ${data.type}`);
      const body = encodeURIComponent(
        `Hi ${data.recipientName || ''},\n\n` +
        `I wanted to share ${data.petName}'s ${data.type} with you.\n\n` +
        (data.customMessage ? `"${data.customMessage}"\n\n` : '') +
        `You can view it here: ${data.shareUrl}\n\n` +
        `Best regards,\n${data.senderName || 'PetPort User'}`
      );
      
      window.location.href = `mailto:${data.recipientEmail}?subject=${subject}&body=${body}`;
      
      toast({
        title: "Email service unavailable",
        description: "Opened your default email client as fallback",
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendEmail,
    isLoading
  };
};