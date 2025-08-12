import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { createPet, fetchUserPets } from "@/services/petService";
import { supabase } from "@/integrations/supabase/client";
import { PWALayout } from "@/components/PWALayout";
import { AppHeader } from "@/components/AppHeader";
import { getSpeciesConfig, getSpeciesOptions } from "@/utils/speciesConfig";
import { PRICING } from "@/config/pricing";
import { InfoIcon } from "lucide-react";

export default function AddPet() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [petLimit, setPetLimit] = useState<number>(0);
  const [currentPetCount, setCurrentPetCount] = useState<number>(0);
  const [canAddPet, setCanAddPet] = useState<boolean>(true);
  const [isLoadingLimits, setIsLoadingLimits] = useState(true);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  
  const [petData, setPetData] = useState({
    name: "",
    species: "",
    breed: "",
    age: "",
    weight: "",
    height: "",
    sex: "",
    microchip_id: "",
    registration_number: "",
    bio: "",
    notes: ""
  });

  const speciesConfig = useMemo(() => getSpeciesConfig(petData.species), [petData.species]);
  const speciesOptions = useMemo(() => getSpeciesOptions(), []);

  // Check pet limits on page load
  useEffect(() => {
    const checkPetLimits = async () => {
      if (!user) {
        setIsLoadingLimits(false);
        return;
      }

      try {
        // Get current pet count
        const userPets = await fetchUserPets();
        setCurrentPetCount(userPets.length);

        // Get user pet limit
        const { data: petLimit } = await supabase.rpc('get_user_pet_limit', {
          user_uuid: user.id
        });
        setPetLimit(petLimit || 0);

        // Check if user can add more pets
        const { data: canAdd } = await supabase.rpc('can_user_add_pet', {
          user_uuid: user.id
        });
        
        setCanAddPet(canAdd || false);
        
        // Show upgrade prompt if at limit
        if (!canAdd) {
          setShowUpgradePrompt(true);
        }
        
      } catch (error) {
        console.error('Error checking pet limits:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to verify pet limits. Please try again.",
          duration: 5000,
        });
      } finally {
        setIsLoadingLimits(false);
      }
    };

    checkPetLimits();
  }, [user, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPetData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setPetData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation - name is required
    if (!petData.name.trim()) {
      toast({
        variant: "destructive",
        title: "Name is required",
        description: "Please provide a name for your pet."
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const petId = await createPet(petData);
      
      if (petId) {
        toast({
          title: "Success!",
          description: `${petData.name} has been added to your pets.`,
        });
        navigate("/");
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create pet. Please try again."
        });
      }
    } catch (error) {
      console.error("Error creating pet:", error);
      toast({
        variant: "destructive",
        title: "Error Creating Pet",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpgradeClick = () => {
    // Save form data to localStorage as fallback
    if (petData.name.trim()) {
      localStorage.setItem('addPetFormData', JSON.stringify(petData));
    }
    navigate('/billing');
  };

  // Restore form data if returning from billing
  useEffect(() => {
    const savedData = localStorage.getItem('addPetFormData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setPetData(parsedData);
        localStorage.removeItem('addPetFormData');
        toast({
          title: "Form data restored",
          description: "Your pet information has been restored.",
          duration: 3000,
        });
      } catch (error) {
        console.error('Error restoring form data:', error);
      }
    }
  }, [toast]);

  // Show loading spinner while checking limits
  if (isLoadingLimits) {
    return (
      <PWALayout>
        <AppHeader title="Add New Pet" showBack />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-navy-100 py-8">
          <main className="max-w-4xl mx-auto px-4 py-8">
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardContent className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="animate-spin h-8 w-8 border-4 border-theme-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Checking pet limits...</p>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </PWALayout>
    );
  }

  return (
    <PWALayout>
      <AppHeader title="Add New Pet" showBack />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-navy-100 py-8">
        <main className="max-w-4xl mx-auto px-4 py-8">
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">Add a New Pet</CardTitle>
                {petLimit > 0 && (
                  <div className="text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                    Pet {currentPetCount + 1} of {petLimit}
                  </div>
                )}
              </div>
              
              {/* Upgrade Prompt - shown at limit */}
              {showUpgradePrompt && !canAddPet && (
                <Alert className="mt-4 border-blue-200 bg-blue-50">
                  <InfoIcon className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <div className="space-y-3">
                      <p>
                        <strong>You've reached your pet limit ({currentPetCount}/{petLimit}).</strong>
                      </p>
                      <p>
                        Add more pet accounts to your subscription:
                      </p>
                      <div className="space-y-2 text-sm">
                        {PRICING.addons.map((addon) => (
                          <div key={addon.id} className="flex justify-between">
                            <span>+{addon.count} pet{addon.count > 1 ? 's' : ''}</span>
                            <span className="font-medium">{addon.priceText}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-3 pt-2">
                        <Button 
                          onClick={handleUpgradeClick}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          size="sm"
                        >
                          Upgrade Now
                        </Button>
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => navigate('/')}
                        >
                          Go Back
                        </Button>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardHeader>
            <CardContent>
              {/* Hide form if user can't add pets */}
              {!canAddPet ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Please upgrade your subscription to add more pets.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Pet Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={petData.name}
                      onChange={handleChange}
                      placeholder="Pet name"
                      required
                    />
                  </div>

                   {/* Species */}
                   <div className="space-y-2">
                     <Label htmlFor="species">Species</Label>
                     <Select
                       value={petData.species}
                       onValueChange={(value) => handleSelectChange("species", value)}
                     >
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

                  {/* Breed */}
                  <div className="space-y-2">
                    <Label htmlFor="breed">Breed</Label>
                    <Input
                      id="breed"
                      name="breed"
                      value={petData.breed}
                      onChange={handleChange}
                      placeholder="Breed"
                    />
                  </div>

                  {/* Age */}
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      name="age"
                      value={petData.age}
                      onChange={handleChange}
                      placeholder="Age (e.g., 3 years)"
                    />
                  </div>

                   {/* Weight */}
                   <div className="space-y-2">
                     <Label htmlFor="weight">{speciesConfig.weightLabel}</Label>
                     <Input
                       id="weight"
                       name="weight"
                       value={petData.weight}
                       onChange={handleChange}
                       placeholder={speciesConfig.weightPlaceholder}
                     />
                   </div>

                   {/* Height - conditionally shown */}
                   {speciesConfig.showHeight && (
                     <div className="space-y-2">
                       <Label htmlFor="height">{speciesConfig.heightLabel}</Label>
                       <Input
                         id="height"
                         name="height"
                         value={petData.height}
                         onChange={handleChange}
                         placeholder={speciesConfig.heightPlaceholder}
                       />
                     </div>
                   )}

                   {/* Sex */}
                   <div className="space-y-2">
                     <Label htmlFor="sex">Sex</Label>
                     <Select
                       value={petData.sex}
                       onValueChange={(value) => handleSelectChange("sex", value)}
                     >
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

                   {/* Microchip ID */}
                   <div className="space-y-2">
                     <Label htmlFor="microchip_id">Microchip ID</Label>
                     <Input
                       id="microchip_id"
                       name="microchip_id"
                       value={petData.microchip_id}
                       onChange={handleChange}
                       placeholder="Microchip ID"
                     />
                   </div>

                   {/* Registration Number - conditionally shown */}
                   {speciesConfig.showRegistration && (
                     <div className="space-y-2">
                       <Label htmlFor="registration_number">Registration</Label>
                       <Input
                         id="registration_number"
                         name="registration_number"
                         value={petData.registration_number}
                         onChange={handleChange}
                         placeholder={speciesConfig.registrationPlaceholder}
                       />
                     </div>
                   )}
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={petData.bio}
                    onChange={handleChange}
                    placeholder="Tell us about your pet"
                    rows={4}
                  />
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={petData.notes}
                    onChange={handleChange}
                    placeholder="Additional notes (e.g., special needs, behavior)"
                    rows={3}
                  />
                </div>

                <div className="pt-4 flex justify-end space-x-4">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => navigate("/")}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-navy-900 to-navy-800 hover:from-navy-800 hover:to-navy-700 text-gold-500 border border-gold-500/30"
                  >
                    {isSubmitting ? "Creating..." : "Create Pet Port"}
                  </Button>
                 </div>
               </form>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </PWALayout>
  );
}