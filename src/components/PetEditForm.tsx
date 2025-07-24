
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { updatePetBasicInfo, updatePetContacts } from "@/services/petService";
import { Loader2 } from "lucide-react";

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
}

interface PetEditFormProps {
  petData: PetData;
  onSave: () => void;
  onCancel: () => void;
}

export const PetEditForm = ({ petData, onSave, onCancel }: PetEditFormProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

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
    petCaretaker: petData.petCaretaker || ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
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

    // Prepare update data with only changed fields
    const updateData = {
      name: formData.name.trim(),
      breed: formData.breed.trim(),
      species: formData.species.trim(),
      age: formData.age.trim(),
      weight: formData.weight.trim(),
      microchip_id: formData.microchipId.trim(),
      bio: formData.bio.trim(),
      notes: formData.notes.trim(),
      state: formData.state.trim(),
      county: formData.county.trim(),
    };

    // Call service layer to update pet basic info
    const basicUpdateSuccess = await updatePetBasicInfo(petData.id, updateData);

    // Prepare contact data
    const contactData = {
      vet_contact: formData.vetContact.trim(),
      emergency_contact: formData.emergencyContact.trim(),
      second_emergency_contact: formData.secondEmergencyContact.trim(),
      pet_caretaker: formData.petCaretaker.trim(),
    };

    // Call service layer to update pet contacts
    const contactUpdateSuccess = await updatePetContacts(petData.id, contactData);

    if (basicUpdateSuccess && contactUpdateSuccess) {
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
