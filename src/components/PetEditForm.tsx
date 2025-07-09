
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  updatePetContacts, 
  updatePetMedical, 
  uploadPetPhotos, 
  uploadGalleryPhoto, 
  uploadDocument,
  updatePetBasicInfo
} from "@/services/petService";
import { Upload, FileText, Camera, Stethoscope, Phone, X, MapPin, Loader2 } from "lucide-react";

interface PetEditFormProps {
  petData: any;
  onSave: () => void;
  onCancel: () => void;
}

export const PetEditForm = ({ petData, onSave, onCancel }: PetEditFormProps) => {
  const { register, handleSubmit, watch, setValue, formState: { isDirty } } = useForm({
    defaultValues: {
      // Basic info
      notes: petData.notes || "",
      state: petData.state || "",
      county: petData.county || "",
      // Contact info
      vetContact: petData.vetContact || "",
      emergencyContact: petData.emergencyContact || "",
      secondEmergencyContact: petData.secondEmergencyContact || "",
      petCaretaker: petData.petCaretaker || "",
      // Medical info
      medicalAlert: petData.medicalAlert || false,
      medicalConditions: petData.medicalConditions || "",
      medications: petData.medications?.join(", ") || "",
      lastVaccination: petData.lastVaccination || "",
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [fullBodyPhoto, setFullBodyPhoto] = useState<File | null>(null);
  const [galleryPhoto, setGalleryPhoto] = useState<File | null>(null);
  const [galleryCaption, setGalleryCaption] = useState("");
  const [document, setDocument] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState("vaccination");
  const { toast } = useToast();

  const medicalAlert = watch("medicalAlert");

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    
    try {
      console.log("Starting form submission with data:", data);

      // Update basic pet information (notes, state, county)
      const basicInfoSuccess = await updatePetBasicInfo(petData.id, {
        notes: data.notes,
        state: data.state,
        county: data.county,
      });

      if (!basicInfoSuccess) {
        throw new Error("Failed to update basic information");
      }
      console.log("Basic info updated successfully");

      // Update contacts - including emergency contacts
      const contactSuccess = await updatePetContacts(petData.id, {
        vet_contact: data.vetContact,
        emergency_contact: data.emergencyContact,
        second_emergency_contact: data.secondEmergencyContact,
        pet_caretaker: data.petCaretaker,
      });

      if (!contactSuccess) {
        throw new Error("Failed to update contact information");
      }
      console.log("Contacts updated successfully");

      // Update medical information
      const medicalSuccess = await updatePetMedical(petData.id, {
        medical_alert: data.medicalAlert,
        medical_conditions: data.medicalConditions,
        medications: data.medications ? data.medications.split(",").map((m: string) => m.trim()).filter(m => m) : [],
        last_vaccination: data.lastVaccination,
      });

      if (!medicalSuccess) {
        throw new Error("Failed to update medical information");
      }
      console.log("Medical info updated successfully");

      // Upload photos if provided
      if (profilePhoto || fullBodyPhoto) {
        console.log("Uploading photos...");
        const photoSuccess = await uploadPetPhotos(petData.id, {
          profilePhoto: profilePhoto || undefined,
          fullBodyPhoto: fullBodyPhoto || undefined,
        });

        if (!photoSuccess) {
          throw new Error("Failed to upload photos");
        }
        console.log("Photos uploaded successfully!");
      }

      // Upload gallery photo if provided
      if (galleryPhoto) {
        console.log("Uploading gallery photo...");
        const gallerySuccess = await uploadGalleryPhoto(petData.id, galleryPhoto, galleryCaption);
        if (!gallerySuccess) {
          throw new Error("Failed to upload gallery photo");
        }
        console.log("Gallery photo uploaded successfully!");
      }

      // Upload document if provided
      if (document) {
        console.log("Uploading document...");
        const docSuccess = await uploadDocument(petData.id, document, documentType);
        if (!docSuccess) {
          throw new Error("Failed to upload document");
        }
        console.log("Document uploaded successfully!");
      }

      toast({
        title: "Success",
        description: "Pet information updated successfully!",
      });

      onSave();
    } catch (error) {
      console.error("Error updating pet:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update pet information",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Basic Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  {...register("state")}
                  placeholder="California"
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="county">County</Label>
                <Input
                  id="county"
                  {...register("county")}
                  placeholder="Los Angeles County"
                  disabled={isLoading}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                {...register("notes")}
                placeholder="Behavioral notes, special instructions, etc."
                rows={3}
                disabled={isLoading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Phone className="w-5 h-5" />
              <span>Contact Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vetContact">Veterinarian Contact</Label>
                <Input
                  id="vetContact"
                  {...register("vetContact")}
                  placeholder="Dr. Smith - (555) 123-4567"
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="petCaretaker">Pet Caretaker</Label>
                <Input
                  id="petCaretaker"
                  {...register("petCaretaker")}
                  placeholder="John Doe"
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input
                  id="emergencyContact"
                  {...register("emergencyContact")}
                  placeholder="(555) 987-6543"
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="secondEmergencyContact">Second Emergency Contact</Label>
                <Input
                  id="secondEmergencyContact"
                  {...register("secondEmergencyContact")}
                  placeholder="(555) 456-7890"
                  disabled={isLoading}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medical Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Stethoscope className="w-5 h-5" />
              <span>Medical Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="medicalAlert"
                checked={medicalAlert}
                onCheckedChange={(checked) => setValue("medicalAlert", checked)}
                disabled={isLoading}
              />
              <Label htmlFor="medicalAlert">Medical Alert</Label>
            </div>
            
            {medicalAlert && (
              <div>
                <Label htmlFor="medicalConditions">Medical Conditions</Label>
                <Textarea
                  id="medicalConditions"
                  {...register("medicalConditions")}
                  placeholder="Describe any medical conditions..."
                  disabled={isLoading}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="medications">Current Medications</Label>
                <Textarea
                  id="medications"
                  {...register("medications")}
                  placeholder="Medication 1, Medication 2, ..."
                  rows={3}
                  disabled={isLoading}
                />
                <p className="text-sm text-gray-500 mt-1">Separate medications with commas</p>
              </div>
              <div>
                <Label htmlFor="lastVaccination">Last Vaccination</Label>
                <Input
                  id="lastVaccination"
                  {...register("lastVaccination")}
                  placeholder="March 2024"
                  disabled={isLoading}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Photo Uploads */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Camera className="w-5 h-5" />
              <span>Photo Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="profilePhoto">Profile Photo</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="profilePhoto"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      console.log("Profile photo selected:", file?.name);
                      setProfilePhoto(file);
                    }}
                    disabled={isLoading}
                  />
                  {profilePhoto && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setProfilePhoto(null)}
                      disabled={isLoading}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="fullBodyPhoto">Full Body Photo</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="fullBodyPhoto"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      console.log("Full body photo selected:", file?.name);
                      setFullBodyPhoto(file);
                    }}
                    disabled={isLoading}
                  />
                  {fullBodyPhoto && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFullBodyPhoto(null)}
                      disabled={isLoading}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <Label htmlFor="galleryPhoto">Add Gallery Photo</Label>
              <div className="space-y-2">
                <Input
                  id="galleryPhoto"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    console.log("Gallery photo selected:", file?.name);
                    setGalleryPhoto(file);
                  }}
                  disabled={isLoading}
                />
                <Input
                  placeholder="Photo caption (optional)"
                  value={galleryCaption}
                  onChange={(e) => setGalleryCaption(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Document Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Document Upload</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="document">Upload Document</Label>
                <Input
                  id="document"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    console.log("Document selected:", file?.name);
                    setDocument(file);
                  }}
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="documentType">Document Type</Label>
                <select
                  id="documentType"
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                >
                  <option value="vaccination">Vaccination Record</option>
                  <option value="certificate">Certificate</option>
                  <option value="medical">Medical Record</option>
                  <option value="license">License</option>
                  <option value="insurance">Insurance</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
