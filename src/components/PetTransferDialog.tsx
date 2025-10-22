import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserX, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { isIOSDevice } from "@/utils/iosDetection";

interface PetTransferDialogProps {
  petId: string;
  petName: string;
}

export const PetTransferDialog = ({ petId, petName }: PetTransferDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const isIOS = isIOSDevice();

  const handleTransfer = async () => {
    if (!recipientEmail.trim()) {
      toast({ title: "Email required", description: "Please enter the recipient's email address.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("transfer-pet", {
        body: {
          action: "create",
          pet_id: petId,
          to_email: recipientEmail.trim(),
          message: message.trim() || undefined,
        },
      });

      if (error || !data?.ok) {
        throw new Error(error?.message || "Transfer failed");
      }

      toast({
        title: "Transfer initiated",
        description: `Transfer request sent to ${recipientEmail}. They will receive an email with acceptance instructions.`,
      });

      setIsOpen(false);
      setRecipientEmail("");
      setMessage("");
    } catch (error) {
      toast({
        title: "Transfer failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-responsive-xs text-orange-700 border-orange-700/20 hover:bg-orange-700/5">
          <UserX className="w-3 h-3 mr-1" />
          <span className="text-responsive-xs whitespace-nowrap">Transfer Pet</span>
        </Button>
      </DialogTrigger>
      <DialogContent className={isIOS 
        ? "sm:max-w-md max-h-[75vh] !bottom-[5%] !top-auto !translate-y-0 pb-[calc(env(safe-area-inset-bottom)+1rem)]" 
        : "sm:max-w-md"
      }>
        <DialogHeader>
          <DialogTitle>Transfer {petName}'s account to another petport user</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>Important:</strong> This will permanently transfer ownership of {petName} to another registered PetPort user. 
              The recipient must have an active PetPort subscription to accept the transfer. You will lose access to this pet's profile.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="recipient-email">Recipient Email Address</Label>
            <Input
              id="recipient-email"
              type="email"
              placeholder="recipient@example.com"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="transfer-message">Message (Optional)</Label>
            <Textarea
              id="transfer-message"
              placeholder="Add a personal message for the recipient..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleTransfer}
              disabled={loading}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {loading ? (
                <>Sending...</>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Transfer
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};