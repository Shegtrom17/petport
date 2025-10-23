import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserX, Send, Wifi } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { isIOSDevice } from "@/utils/iosDetection";

// Retry configuration
const MAX_RETRIES = 2;
const INITIAL_TIMEOUT = 45000; // 45 seconds
const RETRY_DELAYS = [2000, 5000]; // 2s, 5s

// Retry logic with exponential backoff and timeout
async function invokeWithRetry<T>(
  fn: () => Promise<T>,
  timeout: number,
  retries: number = MAX_RETRIES,
  attempt: number = 0
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Request timeout")), timeout)
  );

  try {
    console.log(`[TRANSFER] Attempt ${attempt + 1}/${retries + 1}, timeout: ${timeout}ms`);
    const startTime = Date.now();
    const result = await Promise.race([fn(), timeoutPromise]);
    const duration = Date.now() - startTime;
    console.log(`[TRANSFER] Success in ${duration}ms`);
    return result;
  } catch (error) {
    const isTimeout = error instanceof Error && error.message === "Request timeout";
    console.error(`[TRANSFER] Attempt ${attempt + 1} failed:`, error);

    if (attempt < retries) {
      const delay = RETRY_DELAYS[attempt] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
      console.log(`[TRANSFER] Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return invokeWithRetry(fn, timeout, retries, attempt + 1);
    }

    throw error;
  }
}

interface PetTransferDialogProps {
  petId: string;
  petName: string;
}

export const PetTransferDialog = ({ petId, petName }: PetTransferDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<string>("");
  const { toast } = useToast();
  const isIOS = isIOSDevice();

  const handleTransfer = async () => {
    if (!recipientEmail.trim()) {
      toast({ title: "Email required", description: "Please enter the recipient's email address.", variant: "destructive" });
      return;
    }

    setLoading(true);
    setLoadingStage("Sending transfer request...");
    
    const startTime = Date.now();
    console.log(`[TRANSFER-UI] Starting transfer for ${petName} (iOS: ${isIOS})`);

    try {
      // Use retry logic with timeout
      const { data, error } = await invokeWithRetry(
        async () => {
          // Update loading stage for longer waits
          const elapsed = Date.now() - startTime;
          if (elapsed > 10000) setLoadingStage("Still processing...");
          if (elapsed > 25000) setLoadingStage("Almost done...");

          return await supabase.functions.invoke("transfer-pet", {
            body: {
              action: "create",
              pet_id: petId,
              to_email: recipientEmail.trim(),
              message: message.trim() || undefined,
            },
          });
        },
        INITIAL_TIMEOUT
      );

      const duration = Date.now() - startTime;
      console.log(`[TRANSFER-UI] Completed in ${duration}ms`);

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
      setLoadingStage("");
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[TRANSFER-UI] Failed after ${duration}ms (iOS: ${isIOS}):`, error);

      // Provide detailed error feedback
      let errorTitle = "Transfer failed";
      let errorDescription = "An unexpected error occurred. Please try again.";

      if (error instanceof Error) {
        if (error.message === "Request timeout") {
          errorTitle = isIOS ? "Connection timeout (iOS)" : "Connection timeout";
          errorDescription = isIOS 
            ? "The request took too long. This can happen on iOS with slower connections. Please check your internet connection and try again."
            : "The request took too long. Please check your internet connection and try again.";
        } else if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
          errorTitle = "Network error";
          errorDescription = "Unable to connect. Please check your internet connection and try again.";
        } else {
          errorDescription = error.message;
        }
      }

      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive",
      });
      
      setLoadingStage("");
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
          {isIOS && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
              <Wifi className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800">
                <strong>iOS tip:</strong> Transfers may take a moment on iOS. Please keep this page open until the transfer completes.
              </p>
            </div>
          )}
          
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

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>Important:</strong> This will permanently transfer ownership of {petName} to another registered PetPort user. 
              The recipient must have an active PetPort subscription to accept the transfer. You will lose access to this pet's profile.
            </p>
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
                <>{loadingStage || "Sending..."}</>
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