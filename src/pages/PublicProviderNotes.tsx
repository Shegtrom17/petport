import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X, CheckCircle } from "lucide-react";
import { fetchPetDetails } from '@/services/petService';
import { supabase } from "@/integrations/supabase/client";
import { MetaTags } from "@/components/MetaTags";
import { AddServiceProviderNoteForm } from "@/components/AddServiceProviderNoteForm";

interface Pet {
  id: string;
  name: string;
  species: string;
  breed?: string;
  is_public: boolean;
  photoUrl?: string;
}

const PublicProviderNotes = () => {
  const { petId } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const isValidUUID = (id: string) => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);

  const handleClose = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!petId || petId.startsWith(':') || !isValidUUID(petId)) {
        setError('Invalid or missing pet ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch pet details
        const petDetails = await fetchPetDetails(petId);
        if (!petDetails) {
          setError('Pet profile not found');
          setLoading(false);
          return;
        }

        // Check if pet profile is public
        if (!petDetails.is_public) {
          setError('This pet profile is not publicly accessible');
          setLoading(false);
          return;
        }

        // Fetch pet photo
        const { data: photoData } = await supabase
          .from('pet_photos')
          .select('photo_url')
          .eq('pet_id', petId)
          .single();

        setPet({
          ...petDetails,
          photoUrl: photoData?.photo_url
        });

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load pet profile');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [petId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-navy-900 mb-2">
              {error || 'Not Available'}
            </h2>
            <p className="text-navy-600">
              {error === 'Invalid or missing pet ID' && 'This link is invalid or incomplete.'}
              {error === 'Pet profile not found' && 'The pet profile you\'re looking for doesn\'t exist.'}
              {error === 'This pet profile is not publicly accessible' && 'This pet\'s profile is private.'}
              {error === 'Failed to load pet profile' && 'There was an error loading the profile. Please try again later.'}
            </p>
            <Button onClick={handleClose} className="mt-4">
              Close
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-navy-900 mb-2">
              Note Submitted!
            </h2>
            <p className="text-navy-600 mb-4">
              Thank you for adding a service note for {pet.name}. The owner will be able to view your note shortly.
            </p>
            <Button onClick={handleClose} className="mt-4">
              Close
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Close Button */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="bg-white/80 hover:bg-white shadow-md"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <MetaTags
        title={`Add Service Note for ${pet.name} | PetPort`}
        description={`Add a professional service note for ${pet.name}`}
        image="https://pub-a7c2c18b8d6143b9a256105ef44f2da0.r2.dev/carehandling-og.png"
        url={`${window.location.origin}/provider-notes/${pet.id}`}
      />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          {pet.photoUrl && (
            <div className="mb-6">
              <img 
                src={pet.photoUrl} 
                alt={pet.name}
                className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-purple-200"
              />
            </div>
          )}
          <h1 className="text-3xl font-sans font-bold text-navy-900 mb-2">
            Add Service Note for {pet.name}
          </h1>
          <p className="text-navy-600">
            {pet.breed && `${pet.breed} • `}{pet.species}
          </p>
        </div>

        {/* Info Alert */}
        <Alert className="mb-6 border-purple-200 bg-purple-50">
          <AlertDescription className="text-sm">
            <strong>For Service Providers:</strong> Add your professional notes about {pet.name}'s 
            service, health observations, training progress, or recommendations for the owner.
          </AlertDescription>
        </Alert>

        {/* Form */}
        <AddServiceProviderNoteForm
          petId={pet.id}
          petName={pet.name}
          onSuccess={() => setSubmitted(true)}
        />

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-navy-500">
            This service note will be visible to {pet.name}'s owner.
          </p>
          <p className="text-sm text-navy-500 mt-2">
            Powered by{" "}
            <a 
              href={window.location.origin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              PetPort.app
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicProviderNotes;