import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { createPet } from "@/services/petService";
import { PWALayout } from "@/components/PWALayout";
import { AppHeader } from "@/components/AppHeader";

export default function AddPet() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [petData, setPetData] = useState({
    name: "",
    species: "",
    breed: "",
    age: "",
    weight: "",
    microchip_id: "",
    bio: "",
    notes: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPetData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setPetData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("=== ADD PET FORM SUBMISSION START ===");
    console.log("AddPet: Starting form submission");
    console.log("AddPet: Pet data:", JSON.stringify(petData, null, 2));
    
    setIsSubmitting(true);

    try {
      // Ensure at least the name is provided
      if (!petData.name.trim()) {
        console.log("AddPet: Name validation failed");
        toast({
          variant: "destructive",
          title: "Name is required",
          description: "Please provide a name for your pet."
        });
        setIsSubmitting(false);
        return;
      }

      console.log("AddPet: Calling createPet service");
      const petId = await createPet(petData);
      console.log("AddPet: createPet returned:", petId);
      
      if (petId) {
        console.log("AddPet: SUCCESS - Pet created with ID:", petId);
        toast({
          title: "Success!",
          description: `${petData.name} has been added to your pets.`,
        });
        console.log("AddPet: Navigating to home page");
        navigate("/");
      } else {
        console.log("AddPet: ERROR - createPet returned null/undefined");
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create pet. Please check the console logs for details."
        });
      }
    } catch (error) {
      console.error("=== ADD PET FORM ERROR ===");
      console.error("AddPet: Error during pet creation:", error);
      console.error("AddPet: Error details:", {
        message: error instanceof Error ? error.message : 'Unknown error',
        type: typeof error,
        constructor: error?.constructor?.name
      });
      console.error("=== ADD PET FORM ERROR END ===");
      
      toast({
        variant: "destructive",
        title: "Error Creating Pet",
        description: error instanceof Error ? error.message : "Something went wrong. Please check the console logs and try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PWALayout>
      <AppHeader title="Add New Pet" showBack />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-navy-100 py-8">
        <main className="max-w-4xl mx-auto px-4 py-8">
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Add a New Pet</CardTitle>
            </CardHeader>
            <CardContent>
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
                        <SelectItem value="dog">Dog</SelectItem>
                        <SelectItem value="cat">Cat</SelectItem>
                        <SelectItem value="bird">Bird</SelectItem>
                        <SelectItem value="horse">Horse</SelectItem>
                        <SelectItem value="rabbit">Rabbit</SelectItem>
                        <SelectItem value="reptile">Reptile</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
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
                    <Label htmlFor="weight">Weight</Label>
                    <Input
                      id="weight"
                      name="weight"
                      value={petData.weight}
                      onChange={handleChange}
                      placeholder="Weight (e.g., 65 lbs)"
                    />
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
            </CardContent>
          </Card>
        </main>
      </div>
    </PWALayout>
  );
}