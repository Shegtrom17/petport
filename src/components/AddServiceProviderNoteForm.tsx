import { useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2, Send, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AddServiceProviderNoteFormProps {
  petId: string;
  petName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const AddServiceProviderNoteForm = ({ petId, petName, onSuccess, onCancel }: AddServiceProviderNoteFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serviceDate, setServiceDate] = useState<Date>();
  const [formData, setFormData] = useState({
    provider_name: "",
    provider_email: "",
    provider_phone: "",
    provider_type: "",
    service_type: "",
    observations: "",
    recommendations: "",
    next_appointment_suggestion: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.provider_name.trim() || !formData.provider_type || !formData.service_type.trim() || !serviceDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("service_provider_notes")
        .insert({
          pet_id: petId,
          provider_name: formData.provider_name.trim(),
          provider_email: formData.provider_email.trim() || null,
          provider_phone: formData.provider_phone.trim() || null,
          provider_type: formData.provider_type,
          service_date: format(serviceDate, 'yyyy-MM-dd'),
          service_type: formData.service_type.trim(),
          observations: formData.observations.trim() || null,
          recommendations: formData.recommendations.trim() || null,
          next_appointment_suggestion: formData.next_appointment_suggestion.trim() || null,
          is_visible: true
        });

      if (error) throw error;

      toast.success("Service note added successfully!");
      
      // Reset form
      setFormData({
        provider_name: "",
        provider_email: "",
        provider_phone: "",
        provider_type: "",
        service_type: "",
        observations: "",
        recommendations: "",
        next_appointment_suggestion: ""
      });
      setServiceDate(undefined);

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error submitting service note:", error);
      toast.error("Failed to submit service note");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Service Provider Note for {petName}</CardTitle>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Tip:</strong> Reference external documents in your notes. For example: "Examined Finn today. Right hip X-rays show early arthritis. Recommend joint supplements and weight management. X-rays available from clinic - please add to Documents section for future reference."
          </AlertDescription>
        </Alert>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Provider Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="provider_name">Provider Name *</Label>
              <Input
                id="provider_name"
                value={formData.provider_name}
                onChange={(e) => setFormData({ ...formData, provider_name: e.target.value })}
                placeholder="Dr. Smith"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="provider_type">Provider Type *</Label>
              <Select
                value={formData.provider_type}
                onValueChange={(value) => setFormData({ ...formData, provider_type: value })}
              >
                <SelectTrigger id="provider_type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="veterinarian">Veterinarian</SelectItem>
                  <SelectItem value="farrier">Farrier</SelectItem>
                  <SelectItem value="groomer">Groomer</SelectItem>
                  <SelectItem value="trainer">Trainer</SelectItem>
                  <SelectItem value="behaviorist">Behaviorist</SelectItem>
                  <SelectItem value="chiropractor">Chiropractor</SelectItem>
                  <SelectItem value="dentist">Dentist</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="provider_email">Email</Label>
              <Input
                id="provider_email"
                type="email"
                value={formData.provider_email}
                onChange={(e) => setFormData({ ...formData, provider_email: e.target.value })}
                placeholder="provider@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="provider_phone">Phone</Label>
              <Input
                id="provider_phone"
                type="tel"
                value={formData.provider_phone}
                onChange={(e) => setFormData({ ...formData, provider_phone: e.target.value })}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          {/* Service Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="service_date">Service Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !serviceDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {serviceDate ? format(serviceDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={serviceDate}
                    onSelect={setServiceDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="service_type">Service Type *</Label>
              <Input
                id="service_type"
                value={formData.service_type}
                onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                placeholder="e.g., Annual checkup, Training session"
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="observations">Observations/Notes</Label>
            <Textarea
              id="observations"
              value={formData.observations}
              onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
              placeholder="Detailed observations about the pet's condition, behavior, progress. For X-rays, lab results, or images, mention they're available and owner can add to Documents section."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recommendations">Recommendations for Owner</Label>
            <Textarea
              id="recommendations"
              value={formData.recommendations}
              onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
              placeholder="Any recommendations, follow-up care, or instructions..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="next_appointment">Next Appointment Suggestion</Label>
            <Input
              id="next_appointment"
              value={formData.next_appointment_suggestion}
              onChange={(e) => setFormData({ ...formData, next_appointment_suggestion: e.target.value })}
              placeholder="e.g., 6 months, Next spring, As needed"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Note
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};