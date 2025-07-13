import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Camera, Upload } from "lucide-react";

interface PetEditFormProps {
  petId: string;
  petData: any;
  onUpdate: () => void;
  onClose: () => void;
}

export const PetEditForm = ({ petId, petData, onUpdate, onClose }: PetEditFormProps) => {
  const [formData, setFormData] = useState({
    name: petData?.name || "",
    breed: petData?.breed || "",
    species: petData?.species || "",
    age: petData?.age || "",
    weight: petData?.weight || "",
    bio: petData?.bio || "",
    notes: petData?.notes || "",
    state: petData?.state || "",
    county: petData?.county || "",
    microchip_id: petData?.microchip_id || "",
  });
  
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [fullBodyPhoto, setFullBodyPhoto] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string>("");
  const [fullBodyPreview, setFullBodyPreview] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (petData?.photoUrl) {
      setProfilePreview(petData.photoUrl);
    }
    if (petData?.fullBodyPhotoUrl) {
      setFullBodyPreview(petData.fullBodyPhotoUrl);
    }
  }, [petData]);

  const handleFilePreview = (file: File, setPreview: (url: string) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setPreview(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePhoto(file);
      handleFilePreview(file, setProfilePreview);
    }
  };

  const handleFullBodyPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFullBodyPhoto(file);
      handleFilePreview(file, setFullBodyPreview);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const uploadPhoto = async (file: File, folder: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}-${Date.now()}.${fileExt}`;
    const filePath = `${petId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('pet_photos')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('pet_photos')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Update basic pet information
      const { error: petError } = await supabase
        .from('pets')
        .update(formData)
        .eq('id', petId);

      if (petError) throw petError;

      // Handle photo uploads
      let profilePhotoUrl = profilePreview;
      let fullBodyPhotoUrl = fullBodyPreview;

      if (profilePhoto) {
        profilePhotoUrl = await uploadPhoto(profilePhoto, 'profile');
      }

      if (fullBodyPhoto) {
        fullBodyPhotoUrl = await uploadPhoto(fullBodyPhoto, 'full-body');
      }

      // Update or insert photo URLs
      if (profilePhotoUrl || fullBodyPhotoUrl) {
        const { error: photoError } = await supabase
          .from('pet_photos')
          .upsert({
            pet_id: petId,
            photo_url: profilePhotoUrl,
            full_body_photo_url: fullBodyPhotoUrl,
          });

        if (photoError) throw photoError;
      }

      toast({
        title: "Success!",
        description: "Pet information updated successfully.",
      });

      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating pet:', error);
      toast({
        title: "Error",
        description: "Failed to update pet information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Edit Pet Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Photo Upload Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile Photo */}
              <div className="space-y-3">
                <Label>Profile Photo</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  {profilePreview ? (
                    <img 
                      src={profilePreview} 
                      alt="Profile preview" 
                      className="w-32 h-32 object-cover rounded-full mx-auto mb-3"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <Camera className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      capture="user"
                      onChange={handleProfilePhotoChange}
                      id="profileCamera"
                      className="hidden"
                    />
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm"
                      onClick={() => document.getElementById('profileCamera')?.click()}
                      className="mr-2"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Take Photo
                    </Button>
                    
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePhotoChange}
                      id="profileUpload"
                      className="hidden"
                    />
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm"
                      onClick={() => document.getElementById('profileUpload')?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                </div>
              </div>

              {/* Full Body Photo */}
              <div className="space-y-3">
                <Label>Full Body Photo</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  {fullBodyPreview ? (
                    <img 
                      src={fullBodyPreview} 
                      alt="Full body preview" 
                      className="w-32 h-40 object-cover rounded-lg mx-auto mb-3"
                    />
                  ) : (
                    <div className="w-32 h-40 bg-gray-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                      <Camera className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFullBodyPhotoChange}
                      id="fullBodyCamera"
                      className="hidden"
                    />
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm"
                      onClick={() => document.getElementById('fullBodyCamera')?.click()}
                      className="mr-2"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Take Photo
                    </Button>
                    
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFullBodyPhotoChange}
                      id="fullBodyUpload"
                      className="hidden"
                    />
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm"
                      onClick={() => document.getElementById('fullBodyUpload')?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="species">Species</Label>
                <Input
                  id="species"
                  name="species"
                  value={formData.species}
                  onChange={handleInputChange}
                  placeholder="e.g., Dog, Cat, Horse"
                />
              </div>
              <div>
                <Label htmlFor="breed">Breed</Label>
                <Input
                  id="breed"
                  name="breed"
                  value={formData.breed}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  placeholder="e.g., 3 years, 8 months"
                />
              </div>
              <div>
                <Label htmlFor="weight">Weight</Label>
                <Input
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  placeholder="e.g., 45 lbs, 20 kg"
                />
              </div>
              <div>
                <Label htmlFor="microchip_id">Microchip ID</Label>
                <Input
                  id="microchip_id"
                  name="microchip_id"
                  value={formData.microchip_id}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Location Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="county">County/Region</Label>
                <Input
                  id="county"
                  name="county"
                  value={formData.county}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Bio and Notes */}
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Tell us about your pet's personality..."
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="notes">Special Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Important information about your pet..."
                rows={3}
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
