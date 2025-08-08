
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { updatePetBasicInfo, updatePetContacts, updatePetMedical } from "@/services/petService";
import { Loader2 } from "lucide-react";
import { sanitizeText, validateTextLength, containsSuspiciousContent } from "@/utils/inputSanitizer";
import { PrivacyToggle } from "@/components/PrivacyToggle";
import { supabase } from "@/integrations/supabase/client";
import { featureFlags } from "@/config/featureFlags";

interface PetData {
  id: string;
  user_id: string;
  name: string;
  breed: string;
  species: string;
  age: string;
  weight: string;
  microchipId: string;
  petport_id: string;
  bio: string;
  notes: string;
  state: string;
  county: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  // Contact information
  vetContact?: string;
  emergencyContact?: string;
  secondEmergencyContact?: string;
  petCaretaker?: string;
  // Medical information
  medicalAlert?: boolean;
  medicalConditions?: string;
  // Organization information
  organizationName?: string;
  organizationEmail?: string;
  organizationPhone?: string;
  organizationWebsite?: string;
  customLogoUrl?: string;
  adoptionStatus?: string;
  adoptionInstructions?: string;
}

interface PetEditFormProps {
  petData: PetData;
  onSave: () => void;
  onCancel: () => void;
  togglePetPublicVisibility?: (petId: string, isPublic: boolean) => Promise<boolean>;
}

export const PetEditForm = ({ petData, onSave, onCancel, togglePetPublicVisibility }: PetEditFormProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isOrgUser, setIsOrgUser] = useState(false);

  // Determine if current user is part of any organization (owner or member)
  useEffect(() => {
    let active = true;
    const checkOrgStatus = async () => {
      if (!user?.id) return;
      try {
        const [membershipsRes, ownedOrgsRes] = await Promise.all([
          supabase.from('organization_members').select('id').eq('user_id', user.id).limit(1),
          supabase.from('organizations').select('id').eq('owner_id', user.id).limit(1),
        ]);
        if (membershipsRes.error || ownedOrgsRes.error) {
          console.warn('Org check error', membershipsRes.error || ownedOrgsRes.error);
        }
        const hasOrg = (membershipsRes.data && membershipsRes.data.length > 0) || (ownedOrgsRes.data && ownedOrgsRes.data.length > 0);
        if (active) setIsOrgUser(!!hasOrg);
      } catch (e) {
        console.warn('Org check exception', e);
      }
    };
    checkOrgStatus();
    return () => { active = false; };
  }, [user?.id]);
  const [formData, setFormData] = useState({
    name: petData.name || "",
    breed: petData.breed || "",
    age: petData.age || "",
    weight: petData.weight || "",
    microchipId: petData.microchipId || "",
    species: petData.species || "",
    state: petData.state || "",
    county: petData.county || "",
    notes: petData.notes || "",
    bio: petData.bio || "",
    // Contact information
    vetContact: petData.vetContact || "",
    emergencyContact: petData.emergencyContact || "",
    secondEmergencyContact: petData.secondEmergencyContact || "",
    petCaretaker: petData.petCaretaker || "",
    // Medical information
    medicalAlert: petData.medicalAlert || false,
    medicalConditions: petData.medicalConditions || "",
    // Organization information
    organizationName: petData.organizationName || "",
    organizationEmail: petData.organizationEmail || "",
    organizationPhone: petData.organizationPhone || "",
    organizationWebsite: petData.organizationWebsite || "",
    adoptionStatus: petData.adoptionStatus || "not_available",
    adoptionInstructions: petData.adoptionInstructions || ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Security: Check for suspicious content
    if (containsSuspiciousContent(value)) {
      toast({
        variant: "destructive",
        title: "Invalid Input",
        description: "The input contains invalid characters. Please remove any script tags or suspicious content.",
      });
      return;
    }
    
    // Security: Validate text length (max 1000 chars for most fields, 5000 for bio/notes)
    const maxLength = (name === 'bio' || name === 'notes') ? 5000 : 1000;
    if (!validateTextLength(value, maxLength)) {
      toast({
        variant: "destructive", 
        title: "Input Too Long",
        description: `${name} must be less than ${maxLength} characters.`,
      });
      return;
    }
    
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prevData => ({
      ...prevData,
      [name]: checked
    }));
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!petData?.id) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Pet ID is missing. Cannot save changes.",
    });
    return;
  }

  setIsSaving(true);

  try {
    // Basic validation
    if (!formData.name.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Pet name is required.",
      });
      return;
    }

    // Prepare update data with only changed fields - sanitize all inputs
    const updateData = {
      name: sanitizeText(formData.name.trim()),
      breed: sanitizeText(formData.breed.trim()),
      species: sanitizeText(formData.species.trim()),
      age: sanitizeText(formData.age.trim()),
      weight: sanitizeText(formData.weight.trim()),
      microchip_id: sanitizeText(formData.microchipId.trim()),
      bio: sanitizeText(formData.bio.trim()),
      notes: sanitizeText(formData.notes.trim()),
      state: sanitizeText(formData.state.trim()),
      county: sanitizeText(formData.county.trim()),
      // Organization fields
      organization_name: sanitizeText(formData.organizationName.trim()),
      organization_email: sanitizeText(formData.organizationEmail.trim()),
      organization_phone: sanitizeText(formData.organizationPhone.trim()),
      organization_website: sanitizeText(formData.organizationWebsite.trim()),
      adoption_status: formData.adoptionStatus,
      adoption_instructions: sanitizeText(formData.adoptionInstructions.trim()),
    };

    // Call service layer to update pet basic info
    const basicUpdateSuccess = await updatePetBasicInfo(petData.id, updateData);

    // Prepare contact data - sanitize all inputs
    const contactData = {
      vet_contact: sanitizeText(formData.vetContact.trim()),
      emergency_contact: sanitizeText(formData.emergencyContact.trim()),
      second_emergency_contact: sanitizeText(formData.secondEmergencyContact.trim()),
      pet_caretaker: sanitizeText(formData.petCaretaker.trim()),
    };

    // Call service layer to update pet contacts
    const contactUpdateSuccess = await updatePetContacts(petData.id, contactData);

    // Prepare medical data
    const medicalData = {
      medical_alert: formData.medicalAlert,
      medical_conditions: sanitizeText(formData.medicalConditions.trim()),
    };

    // Call service layer to update pet medical info
    const medicalUpdateSuccess = await updatePetMedical(petData.id, medicalData);

    if (basicUpdateSuccess && contactUpdateSuccess && medicalUpdateSuccess) {
      toast({
        title: "Success",
        description: "Pet profile updated successfully!",
      });
      onSave(); // Trigger parent to refresh data
    } else {
      throw new Error("Update failed");
    }
  } catch (error) {
    console.error("Error updating pet:", error);
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to update pet profile. Please try again.",
    });
  } finally {
    setIsSaving(false);
  }
};


  return (
    <Card className="bg-[#f8f8f8] shadow-md">
      <CardHeader>
        <CardTitle className="text-xl font-serif text-navy-900 border-b-2 border-gold-500 pb-2">
          ✏️ Edit Pet Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Pet Name</Label>
            <Input type="text" id="name" name="name" value={formData.name} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="breed">Breed</Label>
            <Input type="text" id="breed" name="breed" value={formData.breed} onChange={handleChange} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="age">Age</Label>
            <Input type="text" id="age" name="age" value={formData.age} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="weight">Weight</Label>
            <Input type="text" id="weight" name="weight" value={formData.weight} onChange={handleChange} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="microchipId">Microchip ID</Label>
            <Input type="text" id="microchipId" name="microchipId" value={formData.microchipId} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="species">Species</Label>
            <Input type="text" id="species" name="species" value={formData.species} onChange={handleChange} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="state">State</Label>
            <Input type="text" id="state" name="state" value={formData.state} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="county">County</Label>
            <Input type="text" id="county" name="county" value={formData.county} onChange={handleChange} />
          </div>
        </div>

        <div>
          <Label htmlFor="notes">Behavioral Notes</Label>
          <Textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} />
        </div>

        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" name="bio" value={formData.bio} onChange={handleChange} />
        </div>

        {/* Medical Information Section */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-serif text-navy-900 mb-4">Medical Information</h3>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Switch
                id="medicalAlert"
                checked={formData.medicalAlert}
                onCheckedChange={(checked) => handleSwitchChange('medicalAlert', checked)}
              />
              <Label htmlFor="medicalAlert" className="text-sm font-medium">
                Medical Alert - This pet has medical conditions requiring immediate attention
              </Label>
            </div>
            
            {formData.medicalAlert && (
              <div>
                <Label htmlFor="medicalConditions">Medical Conditions & Instructions</Label>
                <Textarea 
                  id="medicalConditions" 
                  name="medicalConditions" 
                  value={formData.medicalConditions} 
                  onChange={handleChange}
                  placeholder="Describe medical conditions, medications, and emergency instructions..."
                  className="mt-1"
                />
              </div>
            )}
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-serif text-navy-900 mb-4">Contact Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="emergencyContact">Primary Emergency Contact</Label>
              <Input 
                type="text" 
                id="emergencyContact" 
                name="emergencyContact" 
                value={formData.emergencyContact} 
                onChange={handleChange}
                placeholder="Name and phone number" 
              />
            </div>
            <div>
              <Label htmlFor="secondEmergencyContact">Secondary Emergency Contact</Label>
              <Input 
                type="text" 
                id="secondEmergencyContact" 
                name="secondEmergencyContact" 
                value={formData.secondEmergencyContact} 
                onChange={handleChange}
                placeholder="Name and phone number" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vetContact">Veterinarian Contact</Label>
              <Input 
                type="text" 
                id="vetContact" 
                name="vetContact" 
                value={formData.vetContact} 
                onChange={handleChange}
                placeholder="Vet name and phone number" 
              />
            </div>
            <div>
              <Label htmlFor="petCaretaker">Pet Caretaker</Label>
              <Input 
                type="text" 
                id="petCaretaker" 
                name="petCaretaker" 
                value={formData.petCaretaker} 
                onChange={handleChange}
                placeholder="Caretaker name and contact" 
              />
            </div>
          </div>
        </div>

        {/* Organization Information Section - visible to organization members only */}
        {(isOrgUser || featureFlags.testMode) && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-serif text-navy-900 mb-4">Rescue, Shelter, or Foster Program (Optional)</h3>
            {featureFlags.testMode && !isOrgUser && (
              <p className="text-xs text-muted-foreground mb-2">Visible due to Test Mode; changes may be restricted by server policies.</p>
            )}
            <p className="text-sm text-gray-600 mb-1">
              Complete this section if this pet is managed by a rescue organization, shelter, or foster program.
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Foster caregivers: it’s okay to leave this blank — you can still transfer to adopters without an organization.
            </p>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="organizationName">Rescue/Shelter/Foster Program Name</Label>
                <Input 
                  type="text" 
                  id="organizationName" 
                  name="organizationName" 
                  value={formData.organizationName} 
                  onChange={handleChange}
                  placeholder="e.g., Happy Tails Rescue, City Animal Shelter" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="organizationEmail">Rescue/Shelter/Foster Email</Label>
                  <Input 
                    type="email" 
                    id="organizationEmail" 
                    name="organizationEmail" 
                    value={formData.organizationEmail} 
                    onChange={handleChange}
                    placeholder="contact@rescue.org" 
                  />
                </div>
                <div>
                  <Label htmlFor="organizationPhone">Rescue/Shelter/Foster Phone</Label>
                  <Input 
                    type="tel" 
                    id="organizationPhone" 
                    name="organizationPhone" 
                    value={formData.organizationPhone} 
                    onChange={handleChange}
                    placeholder="(555) 123-4567" 
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="organizationWebsite">Rescue/Shelter/Foster Website</Label>
                <Input 
                  type="url" 
                  id="organizationWebsite" 
                  name="organizationWebsite" 
                  value={formData.organizationWebsite} 
                  onChange={handleChange}
                  placeholder="https://www.rescue.org" 
                />
              </div>

              <div>
                <Label htmlFor="adoptionStatus">Adoption Status</Label>
                <Select 
                  value={formData.adoptionStatus} 
                  onValueChange={(value) => handleSelectChange('adoptionStatus', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select adoption status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_available">Not Available for Adoption</SelectItem>
                    <SelectItem value="available">Available for Adoption</SelectItem>
                    <SelectItem value="pending">Adoption Pending</SelectItem>
                    <SelectItem value="adopted">Adopted</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.adoptionStatus === 'available' && (
                <div>
                  <Label htmlFor="adoptionInstructions">Adoption Instructions</Label>
                  <Textarea 
                    id="adoptionInstructions" 
                    name="adoptionInstructions" 
                    value={formData.adoptionInstructions} 
                    onChange={handleChange}
                    placeholder="Provide instructions for potential adopters on how to inquire about this pet..."
                    className="mt-1"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Privacy Settings */}
        {togglePetPublicVisibility && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-serif text-navy-900 mb-4">Privacy Settings</h3>
            <PrivacyToggle
              isPublic={petData.is_public || false}
              onToggle={(isPublic) => togglePetPublicVisibility(petData.id, isPublic)}
            />
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <Button 
            onClick={handleSubmit}
            disabled={isSaving}
            className="flex-1 bg-gradient-to-r from-navy-900 to-navy-800 hover:from-navy-800 hover:to-navy-700 text-gold-500 border border-gold-500/30 px-3 sm:px-4 py-2 text-sm sm:text-base"
          >
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            <span className="hidden sm:inline">{isSaving ? "Saving..." : "Save Changes"}</span>
            <span className="sm:hidden">{isSaving ? "Saving..." : "Save"}</span>
          </Button>
          <Button 
            onClick={onCancel}
            variant="outline"
            disabled={isSaving}
            className="flex-1 border-navy-900 text-navy-900 hover:bg-navy-50 px-3 sm:px-4 py-2 text-sm sm:text-base"
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
