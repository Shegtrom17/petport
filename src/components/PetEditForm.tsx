
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Camera, Save, X } from "lucide-react";

interface PetData {
  id: string;
  name: string;
  breed: string;
  age: string;
  weight: string;
  microchipId: string;
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
}

interface PetEditFormProps {
  petData: PetData;
  onSave: () => void;
  onCancel: () => void;
}

export const PetEditForm = ({ petData, onSave, onCancel }: PetEditFormProps) => {
  const [formData, setFormData] = useState({
    ...petData,
    // Ensure no null values that cause React warnings
    notes: petData.notes || '',
    medicalConditions: petData.medicalConditions || '',
    vetContact: petData.vetContact || '',
    emergencyContact: petData.emergencyContact || '',
    secondEmergencyContact: petData.secondEmergencyContact || '',
    petCaretaker: petData.petCaretaker || '',
    lastVaccination: petData.lastVaccination || '',
    photoUrl: petData.photoUrl || '',
    fullBodyPhotoUrl: petData.fullBodyPhotoUrl || '',
    microchipId: petData.microchipId || '',
    state: petData.state || '',
    county: petData.county || ''
  });
  
  const [photoPreview, setPhotoPreview] = useState(formData.photoUrl);
  const [fullBodyPreview, setFullBodyPreview] = useState(formData.fullBodyPhotoUrl);

  const handlePhotoCapture = (event: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'fullBody') => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (type === 'profile') {
          setPhotoPreview(result);
          setFormData(prev => ({ ...prev, photoUrl: result }));
        } else {
          setFullBodyPreview(result);
          setFormData(prev => ({ ...prev, fullBodyPhotoUrl: result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    console.log("Saving pet data:", formData);
    onSave();
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 border-gold-500/30 bg-[#f8f8f8]">
        <CardHeader>
          <CardTitle className="text-xl font-serif text-navy-900 border-b-2 border-gold-500 pb-2">
            Edit Pet Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Pet Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="breed">Breed</Label>
              <Input
                id="breed"
                value={formData.breed}
                onChange={(e) => setFormData(prev => ({ ...prev, breed: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                value={formData.age}
                onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="weight">Weight</Label>
              <Input
                id="weight"
                value={formData.weight}
                onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
              />
            </div>
          </div>

          {/* Photo Upload Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-serif text-navy-900">Pet Photos</h3>
            
            {/* Profile Photo */}
            <div className="space-y-2">
              <Label>Profile Photo</Label>
              <div className="flex items-center space-x-4">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gold-500/50">
                  <img 
                    src={photoPreview || "/placeholder.svg"} 
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    capture="user"
                    onChange={(e) => handlePhotoCapture(e, 'profile')}
                    id="profileCamera"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('profileCamera')?.click()}
                    className="border-navy-900 text-navy-900"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Take New Photo
                  </Button>
                </div>
              </div>
            </div>

            {/* Full Body Photo */}
            <div className="space-y-2">
              <Label>Full Body Photo</Label>
              <div className="flex items-center space-x-4">
                <div className="w-24 h-16 rounded overflow-hidden border-2 border-gold-500/50">
                  <img 
                    src={fullBodyPreview || "/placeholder.svg"} 
                    alt="Full body preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => handlePhotoCapture(e, 'fullBody')}
                    id="fullBodyCamera"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('fullBodyCamera')?.click()}
                    className="border-navy-900 text-navy-900"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Take New Photo
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-serif text-navy-900">Contact Information</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="emergencyContact">Primary Emergency Contact</Label>
                <Input
                  id="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="secondEmergencyContact">Secondary Emergency Contact</Label>
                <Input
                  id="secondEmergencyContact"
                  value={formData.secondEmergencyContact}
                  onChange={(e) => setFormData(prev => ({ ...prev, secondEmergencyContact: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="vetContact">Veterinarian Contact</Label>
                <Input
                  id="vetContact"
                  value={formData.vetContact}
                  onChange={(e) => setFormData(prev => ({ ...prev, vetContact: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-serif text-navy-900">Medical Information</h3>
            <div className="flex items-center space-x-2">
              <Switch
                id="medicalAlert"
                checked={formData.medicalAlert}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, medicalAlert: checked }))}
              />
              <Label htmlFor="medicalAlert">Medical Alert</Label>
            </div>
            {formData.medicalAlert && (
              <div>
                <Label htmlFor="medicalConditions">Medical Conditions</Label>
                <Textarea
                  id="medicalConditions"
                  value={formData.medicalConditions}
                  onChange={(e) => setFormData(prev => ({ ...prev, medicalConditions: e.target.value }))}
                  placeholder="Describe any medical conditions or alerts..."
                />
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Behavioral Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any special notes about your pet's behavior, preferences, etc."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gold-500/30">
            <Button
              onClick={onCancel}
              variant="outline"
              className="border-navy-900 text-navy-900"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-navy-900 to-navy-800 text-gold-500 hover:from-navy-800 hover:to-navy-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
