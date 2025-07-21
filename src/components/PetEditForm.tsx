
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface PetData {
  id: string;
  name: string;
  breed: string;
  age: string;
  weight: string;
  microchipId: string;
  petPortId: string;
  petPassId: string;
  photoUrl: string;
  fullBodyPhotoUrl: string;
  vetContact: string;
  emergencyContact: string;
  secondEmergencyContact: string;
  petCaretaker: string;
  lastVaccination: string;
  badges: string[];
  medications: string[];
  notes: string;
  state?: string;
  county?: string;
  species?: string;
  supportAnimalStatus?: string | null;
  medicalAlert: boolean;
  medicalConditions?: string;
  medicalEmergencyDocument?: string | null;
  galleryPhotos?: Array<{ url: string; caption: string; }>;
  user_id?: string;
  bio?: string;
}

interface PetEditFormProps {
  petData: PetData;
  onSave: (updatedData: PetData) => void;
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
    vetContact: petData.vetContact || "",
    emergencyContact: petData.emergencyContact || "",
    secondEmergencyContact: petData.secondEmergencyContact || "",
    petCaretaker: petData.petCaretaker || "",
    lastVaccination: petData.lastVaccination || "",
    medicalConditions: petData.medicalConditions || "",
    supportAnimalStatus: petData.supportAnimalStatus || "none",
    bio: petData.bio || ""
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

  const updatedPetData: PetData = {
    ...petData, // Spread existing data
    ...formData, // Override with new form data
    // Ensure required fields have fallbacks
    species: formData.species || "",
    state: formData.state || "",
    county: formData.county || "",
    supportAnimalStatus: formData.supportAnimalStatus || null
  };

  onSave(updatedPetData);
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="vetContact">Veterinarian Contact</Label>
            <Input type="text" id="vetContact" name="vetContact" value={formData.vetContact} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="emergencyContact">Emergency Contact</Label>
            <Input type="text" id="emergencyContact" name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} />
          </div>
        </div>

        <div>
          <Label htmlFor="secondEmergencyContact">Second Emergency Contact</Label>
          <Input type="text" id="secondEmergencyContact" name="secondEmergencyContact" value={formData.secondEmergencyContact} onChange={handleChange} />
        </div>

        <div>
          <Label htmlFor="petCaretaker">Pet Caretaker</Label>
          <Input type="text" id="petCaretaker" name="petCaretaker" value={formData.petCaretaker} onChange={handleChange} />
        </div>

        <div>
          <Label htmlFor="lastVaccination">Last Vaccination Date</Label>
          <Input type="text" id="lastVaccination" name="lastVaccination" value={formData.lastVaccination} onChange={handleChange} />
        </div>

        <div>
          <Label htmlFor="medicalConditions">Medical Conditions</Label>
          <Textarea id="medicalConditions" name="medicalConditions" value={formData.medicalConditions} onChange={handleChange} />
        </div>

        <div>
          <Label htmlFor="supportAnimalStatus">Support Animal Status</Label>
          <Select 
            value={formData.supportAnimalStatus}
            onValueChange={(value) => handleSelectChange("supportAnimalStatus", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Certified Therapy Dog">Certified Therapy Dog</SelectItem>
              <SelectItem value="Emotional Support Animal">Emotional Support Animal</SelectItem>
              <SelectItem value="Service Animal">Service Animal</SelectItem>
              <SelectItem value="none">None</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <Button 
            onClick={handleSubmit}
            disabled={isSaving}
            className="flex-1 bg-gradient-to-r from-navy-900 to-navy-800 hover:from-navy-800 hover:to-navy-700 text-gold-500 border border-gold-500/30 px-3 sm:px-4 py-2 text-sm sm:text-base"
          >
            <span className="hidden sm:inline">{isSaving ? "Saving..." : "Save Changes"}</span>
            <span className="sm:hidden">{isSaving ? "Saving..." : "Save"}</span>
          </Button>
          <Button 
            onClick={onCancel}
            variant="outline"
            className="flex-1 border-navy-900 text-navy-900 hover:bg-navy-50 px-3 sm:px-4 py-2 text-sm sm:text-base"
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
