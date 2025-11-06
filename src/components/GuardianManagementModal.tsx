import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Copy, Mail, Trash2, Shield } from "lucide-react";
import { formatPhoneNumber } from "@/utils/phoneFormatter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const guardianSchema = z.object({
  guardian_name: z.string().min(2, "Name must be at least 2 characters"),
  guardian_email: z.string().email("Invalid email address"),
  guardian_phone: z.string().optional(),
  authorization_level: z.enum(["medical_only", "full_custody"]),
  financial_limit: z.number().min(0).default(0),
  special_instructions: z.string().optional(),
});

type GuardianFormData = z.infer<typeof guardianSchema>;

interface GuardianManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  petId: string;
  petName: string;
}

export const GuardianManagementModal = ({
  isOpen,
  onClose,
  petId,
  petName,
}: GuardianManagementModalProps) => {
  const [existingGuardian, setExistingGuardian] = useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Defer to after render so DOM is ready
      setTimeout(() => {
        try {
          const el = contentRef.current;
          const viewport = {
            innerWidth: window.innerWidth,
            innerHeight: window.innerHeight,
            devicePixelRatio: window.devicePixelRatio,
            screenWidth: window.screen?.width,
            screenHeight: window.screen?.height,
          };
          console.log('[GuardianModal] Viewport', viewport);
          if (el) {
            const rect = el.getBoundingClientRect();
            console.log('[GuardianModal] Dialog rect', {
              width: rect.width,
              height: rect.height,
              scrollWidth: el.scrollWidth,
              clientWidth: el.clientWidth,
              overflowX: el.scrollWidth > el.clientWidth,
            });
          }
        } catch (e) {
          console.log('[GuardianModal] Measure error', e);
        }
      }, 0);
    }
  }, [isOpen]);

  const form = useForm<GuardianFormData>({
    resolver: zodResolver(guardianSchema),
    defaultValues: {
      guardian_name: "",
      guardian_email: "",
      guardian_phone: "",
      authorization_level: "medical_only",
      financial_limit: 0,
      special_instructions: "",
    },
  });

  useEffect(() => {
    if (isOpen && petId) {
      fetchExistingGuardian();
    }
  }, [isOpen, petId]);

  const fetchExistingGuardian = async () => {
    const { data, error } = await supabase
      .from("pet_guardians")
      .select("*")
      .eq("pet_id", petId)
      .maybeSingle();

    if (data) {
      setExistingGuardian(data);
      form.reset({
        guardian_name: data.guardian_name,
        guardian_email: data.guardian_email,
        guardian_phone: data.guardian_phone || "",
        authorization_level: data.authorization_level as "medical_only" | "full_custody",
        financial_limit: data.financial_limit,
        special_instructions: data.special_instructions || "",
      });
    } else {
      setExistingGuardian(null);
      form.reset();
    }
  };

  const onSubmit = async (values: GuardianFormData) => {
    setIsLoading(true);
    try {
      if (existingGuardian) {
        const { error } = await supabase
          .from("pet_guardians")
          .update(values)
          .eq("id", existingGuardian.id);

        if (error) throw error;
        toast.success("Guardian updated successfully");
      } else {
        const insertData = {
          guardian_name: values.guardian_name,
          guardian_email: values.guardian_email,
          guardian_phone: values.guardian_phone,
          authorization_level: values.authorization_level,
          financial_limit: values.financial_limit,
          special_instructions: values.special_instructions,
          pet_id: petId,
        };

        const { error } = await supabase
          .from("pet_guardians")
          .insert([insertData]);

        if (error) throw error;
        toast.success("Guardian created successfully");
      }

      await fetchExistingGuardian();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!existingGuardian) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("pet_guardians")
        .delete()
        .eq("id", existingGuardian.id);

      if (error) throw error;

      toast.success("Guardian removed");
      setExistingGuardian(null);
      form.reset();
      setShowDeleteDialog(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyGuardianLink = () => {
    if (!existingGuardian) return;
    const link = `${window.location.origin}/guardian/${petId}/${existingGuardian.access_token}`;
    navigator.clipboard.writeText(link);
    toast.success("Guardian link copied to clipboard");
  };

  const sendGuardianEmail = async () => {
    if (!existingGuardian) return;
    
    setIsLoading(true);
    try {
      const guardianLink = `${window.location.origin}/guardian/${petId}/${existingGuardian.access_token}`;
      
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          type: 'pet_guardian',
          recipientEmail: existingGuardian.guardian_email,
          petName: petName,
          petId: petId,
          guardianLink: guardianLink,
          guardianName: existingGuardian.guardian_name,
          shareUrl: guardianLink,
          senderName: 'Pet Owner'
        }
      });

      if (error) throw error;
      toast.success(`Guardian email sent to ${existingGuardian.guardian_email}`);
    } catch (error: any) {
      console.error('Error sending guardian email:', error);
      toast.error("Failed to send email: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent ref={contentRef} className="max-w-[calc(100vw-1rem)] sm:max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden break-words">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Pet Legacy Guardian - {petName}
            </DialogTitle>
            <DialogDescription>
              Designate a trusted person to care for {petName} in case of emergency or
              long-term incapacitation.
            </DialogDescription>
          </DialogHeader>

          <Alert className="bg-muted border-muted-foreground/20">
            <AlertDescription className="text-sm">
              <strong>Important:</strong> This feature provides view-only access to your pet's information. It does not transfer legal ownership or account control. For complete account transfer, please ensure your guardian has your login credentials and that proper legal arrangements (will, power of attorney, etc.) are in place. PetPort cannot facilitate ownership transfers without legal authorization.
            </AlertDescription>
          </Alert>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
              <FormField
                control={form.control}
                name="guardian_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Guardian's Name *</FormLabel>
                    <FormControl>
                      <Input className="text-sm" placeholder="Jane Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="guardian_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Guardian's Email *</FormLabel>
                      <FormControl>
                        <Input
                          className="text-sm"
                          type="email"
                          placeholder="jane@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="guardian_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Guardian's Phone</FormLabel>
                      <FormControl>
                        <Input 
                          className="text-sm"
                          placeholder="(555) 123-4567" 
                          {...field}
                          onChange={(e) => {
                            const formatted = formatPhoneNumber(e.target.value);
                            field.onChange(formatted);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="authorization_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Authorization Level *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="medical_only">
                          Medical Only - Can authorize emergency medical care
                        </SelectItem>
                        <SelectItem value="full_custody">
                          Full Custody - Can take ownership and make all decisions
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="financial_limit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emergency Medical Spending Limit ($)</FormLabel>
                    <FormControl>
                      <Input
                        className="text-sm"
                        type="number"
                        placeholder="1000"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Maximum amount guardian can spend without contacting you
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="special_instructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special Instructions</FormLabel>
                    <FormControl>
                      <Textarea
                        className="text-sm"
                        placeholder="Any additional care notes or important information for the guardian..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2 pt-4">
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-brand-primary hover:bg-brand-primary-dark text-white"
                >
                  {existingGuardian ? "Update Guardian" : "Save Guardian"}
                </Button>

                {existingGuardian && (
                  <>
                    <Button
                      type="button"
                      onClick={copyGuardianLink}
                      className="bg-brand-primary hover:bg-brand-primary-dark text-white"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Link
                    </Button>
                    <Button
                      type="button"
                      onClick={sendGuardianEmail}
                      disabled={isLoading}
                      className="bg-brand-primary hover:bg-brand-primary-dark text-white"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Send Email
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-white"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </>
                )}
              </div>
            </form>
          </Form>

          {existingGuardian && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Guardian Link:</strong> Share this secure link with your guardian.
                They can access it anytime without a login.
              </p>
              <p className="text-xs text-muted-foreground mt-2 break-all">
                {window.location.origin}/guardian/{petId}/{existingGuardian.access_token}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Guardian?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the guardian designation for {petName}.
              The guardian link will no longer work.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isLoading}>
              Remove Guardian
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
