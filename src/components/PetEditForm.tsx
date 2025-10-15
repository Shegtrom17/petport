import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useKeyboardAwareLayout } from "@/hooks/useKeyboardAwareLayout";
import { updatePetBasicInfo, updatePetMedical } from "@/services/petService";
import { Loader2 } from "lucide-react";
import { sanitizeText, validateTextLength, containsSuspiciousContent } from "@/utils/inputSanitizer";
import { PrivacyToggle } from "@/components/PrivacyToggle";
import { PetTransferDialog } from "@/components/PetTransferDialog";
import { PetDeleteDialog } from "@/components/PetDeleteDialog";
import { supabase } from "@/integrations/supabase/client";
import { VoiceRecorder } from "@/components/VoiceRecorder";

import { getSpeciesConfig, getSpeciesOptions } from "@/utils/speciesConfig";

interface Contact {
  id?: string;
  contact_name: string;
  contact_phone: string;
  contact_type: string;
}

interface PetData {
  id: string;
  user_id: string;
  name: string;
  breed: string;
  species: string;
  age: string;
  weight: string;
  height?: string;
  sex: string;
  microchipId: string;
  registrationNumber?: string;
  petport_id: string;
  bio: string;
  notes: string;
  state: string;
  county: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  // Medical information
  medicalAlert?: boolean;
  medicalConditions?: string;
  medical_alert?: boolean;
  medical_conditions?: string;
  // Organization information
  organizationName?: string;
  organizationEmail?: string;
  organizationPhone?: string;
  organizationWebsite?: string;
  adoptionStatus?: string;
  adoptionInstructions?: string;
}

interface PetEditFormProps {
  petData: PetData;
  onSave: () => void;
  onCancel: () => void;
  togglePetPublicVisibility?: (petId: string, isPublic: boolean) => void;
}

export const PetEditForm = ({ petData, onSave, onCancel, togglePetPublicVisibility }: PetEditFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { bottomOffset } = useKeyboardAwareLayout();
  const [formData, setFormData] = useState<PetData>(petData);
  const [isSaving, setIsSaving] = useState(false);
  const [isOrgUser, setIsOrgUser] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);

  // Check organization membership and fetch contacts
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      
      try {
        // Check organization membership
        const [membershipsRes, ownedOrgsRes] = await Promise.all([
          supabase.from('organization_members').select('id').eq('user_id', user.id).limit(1),
          supabase.from('organizations').select('id').eq('owner_id', user.id).limit(1),
        ]);
        
        const hasOrg = (membershipsRes.data && membershipsRes.data.length > 0) || 
                      (ownedOrgsRes.data && ownedOrgsRes.data.length > 0);
        setIsOrgUser(!!hasOrg);

        // Fetch contacts
        const { data: contactsData, error: contactsError } = await supabase
          .from('pet_contacts')
          .select('*')
          .eq('pet_id', petData.id);
        
        if (!contactsError && contactsData) {
          setContacts(contactsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
  }, [user?.id, petData.id]);

  // Auto-save form data to localStorage as user types
  useEffect(() => {
    if (user && formData && formData.id) {
      localStorage.setItem(`petDraft-edit-${formData.id}-${user.id}`, JSON.stringify(formData));
    }
  }, [formData, user]);

  // Restore form data ONLY on initial mount (not when petData updates)
  useEffect(() => {
    if (!user || !petData.id) return;
    
    const savedKey = `petDraft-edit-${petData.id}-${user.id}`;
    const savedData = localStorage.getItem(savedKey);
    
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // Only restore if it's newer than the original petData
        if (new Date(parsedData.updated_at || 0) >= new Date(petData.updated_at || 0)) {
          setFormData(parsedData);
        }
      } catch (error) {
        console.error('Error restoring form data:', error);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ONLY run once on mount, never again

  // Sync medical alert data from petData to formData (supports snake_case from DB)
  useEffect(() => {
    const incomingAlert = petData.medicalAlert ?? petData.medical_alert;
    const incomingConditions = petData.medicalConditions ?? petData.medical_conditions;

    setFormData(prev => ({
      ...prev,
      medicalAlert:
        typeof incomingAlert === 'boolean'
          ? incomingAlert
          : (prev.medicalAlert ?? false),
      medicalConditions:
        typeof incomingConditions === 'string'
          ? incomingConditions
          : (prev.medicalConditions ?? '')
    }));
  }, [petData.medicalAlert, petData.medical_alert, petData.medicalConditions, petData.medical_conditions]);

  const speciesConfig = useMemo(() => {
    return getSpeciesConfig(formData.species);
  }, [formData.species]);

  const speciesOptions = useMemo(() => {
    return getSpeciesOptions();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSwitchChange = (field: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [field]: checked }));
  };

  const handleContactChange = (contactType: string, field: 'contact_name' | 'contact_phone', value: string) => {
    setContacts(prev => {
      const existingIndex = prev.findIndex(c => c.contact_type === contactType);
      
      if (existingIndex >= 0) {
        // Update existing contact
        const updated = [...prev];
        updated[existingIndex] = { 
          ...updated[existingIndex], 
          [field]: value,
          // Ensure both fields exist
          contact_name: field === 'contact_name' ? value : (updated[existingIndex].contact_name || ''),
          contact_phone: field === 'contact_phone' ? value : (updated[existingIndex].contact_phone || '')
        };
        return updated;
      } else {
        // Create new contact with both fields initialized
        const newContact: Contact = {
          contact_name: field === 'contact_name' ? value : '',
          contact_phone: field === 'contact_phone' ? value : '',
          contact_type: contactType
        };
        return [...prev, newContact];
      }
    });
  };

  const updateContacts = async () => {
    try {
      // Delete existing contacts for this pet
      await supabase
        .from('pet_contacts')
        .delete()
        .eq('pet_id', petData.id);

      // Insert updated contacts - only insert if at least phone is provided
      const contactsToInsert = contacts
        .filter(contact => {
          const hasPhone = contact.contact_phone && contact.contact_phone.trim();
          const hasName = contact.contact_name && contact.contact_name.trim();
          // Save if either phone or name exists
          return hasPhone || hasName;
        })
        .map(contact => ({
          pet_id: petData.id,
          contact_name: sanitizeText((contact.contact_name || '').trim()),
          contact_phone: sanitizeText((contact.contact_phone || '').trim()),
          contact_type: contact.contact_type
        }));

      if (contactsToInsert.length > 0) {
        console.log('Saving contacts:', contactsToInsert); // Debug log
        const { error } = await supabase
          .from('pet_contacts')
          .insert(contactsToInsert);
        
        if (error) {
          console.error('Contact insert error:', error);
          throw error;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error updating contacts:', error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateTextLength(formData.name, 100) ||
        !validateTextLength(formData.bio, 1000) ||
        !validateTextLength(formData.notes, 500) ||
        formData.name.trim().length === 0) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please check your inputs for proper length.",
      });
      return;
    }

    if (containsSuspiciousContent(formData.name) ||
        containsSuspiciousContent(formData.bio) ||
        containsSuspiciousContent(formData.notes)) {
      toast({
        variant: "destructive",
        title: "Invalid Content",
        description: "Please remove any inappropriate content.",
      });
      return;
    }

    setIsSaving(true);
    
    try {
      // Update basic pet information
      const updateData = {
        name: sanitizeText(formData.name.trim()),
        breed: sanitizeText(formData.breed.trim()),
        species: sanitizeText(formData.species.trim()),
        age: sanitizeText(formData.age.trim()),
        weight: sanitizeText(formData.weight.trim()),
        height: sanitizeText(formData.height?.trim() || ''),
        sex: sanitizeText(formData.sex.trim()),
        microchip_id: sanitizeText(formData.microchipId.trim()),
        registration_number: sanitizeText(formData.registrationNumber?.trim() || ''),
        bio: sanitizeText(formData.bio.trim()),
        notes: sanitizeText(formData.notes.trim()),
        state: sanitizeText(formData.state.trim()),
        county: sanitizeText(formData.county.trim()),
        organization_name: sanitizeText(formData.organizationName?.trim() || ''),
        organization_email: sanitizeText(formData.organizationEmail?.trim() || ''),
        organization_phone: sanitizeText(formData.organizationPhone?.trim() || ''),
        organization_website: sanitizeText(formData.organizationWebsite?.trim() || ''),
        adoption_status: formData.adoptionStatus || 'not_available',
        adoption_instructions: sanitizeText(formData.adoptionInstructions?.trim() || ''),
      };

      const basicUpdateSuccess = await updatePetBasicInfo(petData.id, updateData);

      // Update medical information
      const medicalData = {
        medical_alert: formData.medicalAlert || false,
        medical_conditions: sanitizeText(formData.medicalConditions?.trim() || ''),
      };

      const medicalUpdateSuccess = await updatePetMedical(petData.id, medicalData);

      // Update contacts
      const contactsUpdateSuccess = await updateContacts();

      if (basicUpdateSuccess && medicalUpdateSuccess && contactsUpdateSuccess) {
        // Clear localStorage after successful save
        if (user) {
          localStorage.removeItem(`petDraft-edit-${petData.id}-${user.id}`);
        }
        toast({
          title: "Success",
          description: "Pet profile updated successfully!",
        });
        onSave();
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
        <CardTitle className="text-xl font-sans text-foreground border-b-2 border-gold-500 pb-2">
          ⚙️ Profile Management Hub
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Pet Profile */}
          <div>
            <h3 className="text-lg font-sans text-foreground mb-4">Profile Management Hub</h3>
            <p className="text-xs text-muted-foreground mb-4">This is the core of your pet's profile. Complete this section for professional PDFs and optimal sharing quality.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Pet Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="species">Species</Label>
                <Select value={formData.species} onValueChange={(value) => handleSelectChange("species", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select species" />
                  </SelectTrigger>
                  <SelectContent>
                    {speciesOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="breed">Breed</Label>
                <Input id="breed" name="breed" value={formData.breed} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="age">Age</Label>
                <Input id="age" name="age" value={formData.age} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="weight">Weight</Label>
                <Input id="weight" name="weight" value={formData.weight} onChange={handleChange} />
              </div>
              {speciesConfig.showHeight && (
                <div>
                  <Label htmlFor="height">Height</Label>
                  <Input id="height" name="height" value={formData.height || ''} onChange={handleChange} />
                </div>
              )}
              <div>
                <Label htmlFor="sex">Sex</Label>
                <Select value={formData.sex} onValueChange={(value) => handleSelectChange("sex", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sex" />
                  </SelectTrigger>
                  <SelectContent>
                    {speciesConfig.sexOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="microchipId">Microchip ID</Label>
                <Input id="microchipId" name="microchipId" value={formData.microchipId} onChange={handleChange} />
              </div>
              {speciesConfig.showRegistration && (
                <div>
                  <Label htmlFor="registrationNumber">Registration Number</Label>
                  <Input id="registrationNumber" name="registrationNumber" value={formData.registrationNumber || ''} onChange={handleChange} />
                </div>
              )}
              <div>
                <Label htmlFor="state">State</Label>
                <Input id="state" name="state" value={formData.state} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="county">County</Label>
                <Input id="county" name="county" value={formData.county} onChange={handleChange} />
              </div>
            </div>
            
            <div className="mt-4">
              <Label htmlFor="bio">Bio</Label>
              <div className="relative">
                <Textarea id="bio" name="bio" value={formData.bio} onChange={handleChange} className="min-h-20" />
                <VoiceRecorder
                  onTranscript={(text) => setFormData(prev => ({ ...prev, bio: text }))}
                  disabled={isSaving}
                />
              </div>
            </div>
            
            <div className="mt-4">
              <Label htmlFor="notes">Description & Unique Traits</Label>
              <div className="relative">
                <Textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} className="min-h-20" placeholder="Additional notes, unique traits, special needs, or distinctive characteristics" />
                <VoiceRecorder
                  onTranscript={(text) => setFormData(prev => ({ ...prev, notes: text }))}
                  disabled={isSaving}
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-inter text-foreground mb-4">Contact Information</h3>
            <div className="space-y-4">
              {['emergency', 'emergency_secondary', 'veterinary', 'caretaker'].map((type) => {
                const contact = contacts.find(c => c.contact_type === type);
                const isEmergency = type.includes('emergency');
                return (
                  <div key={type} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`${type}_name`} className={isEmergency ? "text-red-600" : "text-[#5691af]"}>
                        {type === 'emergency' ? 'Emergency Contact Name' :
                         type === 'emergency_secondary' ? 'Secondary Emergency Contact Name' :
                         type === 'veterinary' ? 'Veterinary Contact Name' :
                         'Pet Caretaker Name'}
                      </Label>
                      <Input
                        id={`${type}_name`}
                        value={contact?.contact_name || ''}
                        onChange={(e) => handleContactChange(type, 'contact_name', e.target.value)}
                        placeholder="Enter contact name"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`${type}_phone`} className={isEmergency ? "text-red-600" : "text-[#5691af]"}>
                        {type === 'emergency' ? 'Emergency Contact Phone (tap to call)' :
                         type === 'emergency_secondary' ? 'Secondary Emergency Contact Phone (tap to call)' :
                         type === 'veterinary' ? 'Veterinary Contact Phone (tap to call)' :
                         'Pet Caretaker Phone (tap to call)'}
                      </Label>
                      <Input
                        id={`${type}_phone`}
                        value={contact?.contact_phone || ''}
                        onChange={(e) => handleContactChange(type, 'contact_phone', e.target.value)}
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Medical Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-inter text-foreground mb-4">Medical Information</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="medicalAlert"
                  checked={formData.medicalAlert || false}
                  onCheckedChange={(checked) => handleSwitchChange("medicalAlert", checked)}
                />
                <Label htmlFor="medicalAlert">Medical Alert</Label>
              </div>
              <div>
                <Label htmlFor="medicalConditions">Medical Conditions</Label>
                <div className="relative">
                  <Textarea
                    id="medicalConditions"
                    name="medicalConditions"
                    value={formData.medicalConditions || ''}
                    onChange={handleChange}
                    className="min-h-20"
                  />
                  <VoiceRecorder
                    onTranscript={(text) => setFormData(prev => ({ ...prev, medicalConditions: text }))}
                    disabled={isSaving}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Organization Information */}
          {isOrgUser && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-inter text-foreground mb-4">Organization Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="organizationName">Organization Name</Label>
                  <Input
                    id="organizationName"
                    name="organizationName"
                    value={formData.organizationName || ''}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="organizationEmail">Organization Email</Label>
                  <Input
                    id="organizationEmail"
                    name="organizationEmail"
                    type="email"
                    value={formData.organizationEmail || ''}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="organizationPhone">Organization Phone</Label>
                  <Input
                    id="organizationPhone"
                    name="organizationPhone"
                    value={formData.organizationPhone || ''}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="organizationWebsite">Organization Website</Label>
                  <Input
                    id="organizationWebsite"
                    name="organizationWebsite"
                    value={formData.organizationWebsite || ''}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="adoptionStatus">Adoption Status</Label>
                  <Select value={formData.adoptionStatus || 'not_available'} onValueChange={(value) => handleSelectChange("adoptionStatus", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select adoption status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="adopted">Adopted</SelectItem>
                      <SelectItem value="not_available">Not Available</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-4">
                <Label htmlFor="adoptionInstructions">Adoption Instructions</Label>
                <Textarea
                  id="adoptionInstructions"
                  name="adoptionInstructions"
                  value={formData.adoptionInstructions || ''}
                  onChange={handleChange}
                  className="min-h-20"
                />
              </div>
            </div>
          )}

          {/* Privacy Settings */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-inter text-foreground mb-4">Privacy Settings</h3>
            <PrivacyToggle
              isPublic={petData.is_public}
              onToggle={async (isPublic) => {
                if (togglePetPublicVisibility) {
                  togglePetPublicVisibility(petData.id, isPublic);
                }
                return true;
              }}
            />
          </div>

          {/* Ownership & Danger Zone */}
          <div className="border-t pt-6" id="ownership-settings">
            <h3 className="text-lg font-inter text-foreground mb-4">Ownership & Danger Zone</h3>
            <p className="text-xs text-muted-foreground mb-4">Transfer account to another petport user. This action is permanent and cannot be undone.</p>
            <div className="flex flex-wrap gap-3">
              <PetTransferDialog
                petId={petData.id}
                petName={petData.name}
              />
              <PetDeleteDialog
                petId={petData.id}
                petName={petData.name}
                onPetDeleted={() => {
                  // Handle pet deletion - navigate away or update parent
                  window.location.href = '/';
                }}
              />
            </div>
          </div>

          {/* Action Buttons - Keyboard-aware sticky positioning */}
          <div 
            className="sticky bottom-0 keyboard-aware-transform flex gap-4 pt-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 -mx-4 -mb-4 border-t"
            style={{ 
              transform: bottomOffset > 0 ? `translateY(-${bottomOffset}px)` : 'none',
              transition: 'transform 0.15s ease-out'
            }}
          >
            <Button type="submit" disabled={isSaving} className="text-white">
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};