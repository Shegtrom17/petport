import { useState } from "react";
import { Mail, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { sanitizeText, validateEmail, containsSuspiciousContent } from "@/utils/inputSanitizer";
import { toast } from "sonner";

interface ContactOwnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  petId: string;
  petName: string;
  pageType: 'missing' | 'profile' | 'resume' | 'care' | 'gallery';
}

export const ContactOwnerModal = ({ 
  isOpen, 
  onClose, 
  petId, 
  petName, 
  pageType 
}: ContactOwnerModalProps) => {
  const [formData, setFormData] = useState({
    senderName: '',
    senderEmail: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate name
    const cleanName = sanitizeText(formData.senderName);
    if (!cleanName || cleanName.length < 1) {
      newErrors.senderName = 'Name is required';
    } else if (cleanName.length > 100) {
      newErrors.senderName = 'Name must be less than 100 characters';
    } else if (containsSuspiciousContent(cleanName)) {
      newErrors.senderName = 'Name contains invalid characters';
    }

    // Validate email
    if (!formData.senderEmail) {
      newErrors.senderEmail = 'Email is required';
    } else if (!validateEmail(formData.senderEmail)) {
      newErrors.senderEmail = 'Please enter a valid email address';
    }

    // Validate message
    const cleanMessage = sanitizeText(formData.message);
    if (!cleanMessage || cleanMessage.length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    } else if (cleanMessage.length > 1000) {
      newErrors.message = 'Message must be less than 1000 characters';
    } else if (containsSuspiciousContent(cleanMessage)) {
      newErrors.message = 'Message contains invalid content';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const { data, error } = await supabase.functions.invoke('send-relay-email', {
        body: {
          petId,
          senderName: formData.senderName,
          senderEmail: formData.senderEmail,
          message: formData.message,
          pageType,
          ipAddress: null // Client-side can't reliably get IP
        }
      });

      if (error) {
        console.error('Error sending message:', error);
        
        // Handle specific error types
        if (error.message?.includes('Rate limit')) {
          toast.error("You've sent too many messages. Please try again in an hour.");
        } else if (error.message?.includes('not found')) {
          toast.error("Unable to send message. Pet information not found.");
        } else {
          toast.error("Failed to send message. Please try again later.");
        }
        return;
      }

      // Success!
      setSubmitSuccess(true);
      toast.success(`Message sent to ${petName}'s owner!`);
      
      // Auto-close after 3 seconds
      setTimeout(() => {
        handleClose();
      }, 3000);

    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error("Failed to send message. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ senderName: '', senderEmail: '', message: '' });
    setErrors({});
    setSubmitSuccess(false);
    onClose();
  };

  const remainingChars = 1000 - formData.message.length;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#5691af]" />
            Contact {petName}'s Owner
          </DialogTitle>
          <DialogDescription>
            Send a secure message through PetPort's relay system
          </DialogDescription>
        </DialogHeader>

        {submitSuccess ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Message Sent!</h3>
            <p className="text-muted-foreground">
              {petName}'s owner will receive your message via email and can reply directly to you.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Privacy Alert */}
            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-sm text-blue-900">
                🔒 Your message will be sent through PetPort's secure relay system 
                to the owner's registered email address. The owner's email is never 
                exposed publicly, and they can reply directly to you at {formData.senderEmail || 'your email'}.
              </AlertDescription>
            </Alert>

            {/* Your Name */}
            <div className="space-y-2">
              <Label htmlFor="senderName">
                Your Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="senderName"
                placeholder="John Doe"
                value={formData.senderName}
                onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                maxLength={100}
                className={errors.senderName ? 'border-red-500' : ''}
              />
              {errors.senderName && (
                <p className="text-sm text-red-500">{errors.senderName}</p>
              )}
            </div>

            {/* Your Email */}
            <div className="space-y-2">
              <Label htmlFor="senderEmail">
                Your Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="senderEmail"
                type="email"
                placeholder="you@example.com"
                value={formData.senderEmail}
                onChange={(e) => setFormData({ ...formData, senderEmail: e.target.value })}
                className={errors.senderEmail ? 'border-red-500' : ''}
              />
              <p className="text-xs text-muted-foreground">
                The owner can reply directly to this address
              </p>
              {errors.senderEmail && (
                <p className="text-sm text-red-500">{errors.senderEmail}</p>
              )}
            </div>

            {/* Message */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="message">
                  Message <span className="text-red-500">*</span>
                </Label>
                <span className={`text-xs ${remainingChars < 100 ? 'text-orange-500' : 'text-muted-foreground'}`}>
                  {remainingChars} characters remaining
                </span>
              </div>
              <Textarea
                id="message"
                placeholder="I think I saw your pet near..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                maxLength={1000}
                rows={6}
                className={errors.message ? 'border-red-500' : ''}
              />
              {errors.message && (
                <p className="text-sm text-red-500">{errors.message}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
                variant="azure"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
