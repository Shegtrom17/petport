import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { generateFreeLostPetFlyer } from "@/services/freeFlyerService";

export const FreeLostPetFlyerGenerator = () => {
  const [petName, setPetName] = useState("");
  const [species, setSpecies] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image must be smaller than 10MB");
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!petName.trim()) {
      toast.error("Please enter your pet's name");
      return;
    }
    if (!species) {
      toast.error("Please select a species");
      return;
    }
    if (!contactPhone.trim()) {
      toast.error("Please enter your contact phone");
      return;
    }
    if (!photoFile) {
      toast.error("Please upload a photo of your pet");
      return;
    }

    setIsGenerating(true);

    try {
      await generateFreeLostPetFlyer({
        petName: petName.trim(),
        species,
        contactPhone: contactPhone.trim(),
        photoFile
      });

      toast.success("Lost pet flyer generated successfully!");
    } catch (error) {
      console.error("Error generating flyer:", error);
      toast.error("Failed to generate flyer. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="border-2 border-destructive/20 shadow-lg">
      <CardContent className="p-6 md:p-8">
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column - Form Fields */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="pet-name">Pet Name *</Label>
                <Input
                  id="pet-name"
                  placeholder="e.g., Max"
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  maxLength={50}
                />
              </div>

              <div>
                <Label htmlFor="species">Species *</Label>
                <Select value={species} onValueChange={setSpecies}>
                  <SelectTrigger id="species">
                    <SelectValue placeholder="Select species" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dog">Dog</SelectItem>
                    <SelectItem value="Cat">Cat</SelectItem>
                    <SelectItem value="Bird">Bird</SelectItem>
                    <SelectItem value="Rabbit">Rabbit</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="contact-phone">Contact Phone *</Label>
                <Input
                  id="contact-phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  maxLength={20}
                />
              </div>
            </div>

            {/* Right Column - Photo Upload */}
            <div className="space-y-4">
              <Label htmlFor="pet-photo">Pet Photo *</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                {photoPreview ? (
                  <div className="space-y-2">
                    <img 
                      src={photoPreview} 
                      alt="Preview" 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setPhotoFile(null);
                        setPhotoPreview(null);
                      }}
                    >
                      Remove Photo
                    </Button>
                  </div>
                ) : (
                  <label htmlFor="pet-photo" className="cursor-pointer block py-8">
                    <div className="text-muted-foreground">
                      <p className="font-medium">Click to upload photo</p>
                      <p className="text-sm mt-1">Max 10MB - JPG, PNG</p>
                    </div>
                    <Input
                      id="pet-photo"
                      type="file"
                      accept="image/jpeg,image/png,image/jpg"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              size="lg"
              className="w-full bg-destructive hover:bg-destructive/90"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating Flyer...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-5 w-5" />
                  Generate Free Lost Pet Flyer
                </>
              )}
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground pt-2">
            <p>No signup required • Instant download • Free forever</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
