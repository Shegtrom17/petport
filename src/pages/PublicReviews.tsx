import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MetaTags } from "@/components/MetaTags";
import { fetchPetDetails } from "@/services/petService";
import { Star, X } from "lucide-react";

interface PublicReviewsData {
  id: string;
  name: string;
  is_public?: boolean;
  photoUrl?: string;
  reviews?: Array<{
    reviewerName: string;
    reviewerContact?: string | null;
    rating: number;
    text?: string | null;
    date?: string | null;
    location?: string | null;
  }>;
}

export default function PublicReviews() {
  const { petId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<PublicReviewsData | null>(null);
  const [loading, setLoading] = useState(true);

  const handleClose = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  useEffect(() => {
    const load = async () => {
      if (!petId) return;
      const pet = await fetchPetDetails(petId);
      setData(pet);
      setLoading(false);
    };
    load();
  }, [petId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!data || data.is_public === false) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-xl w-full">
          <CardHeader>
            <CardTitle>Reviews Unavailable</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This pet's reviews are not publicly available.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const avg = data.reviews && data.reviews.length
    ? (data.reviews.reduce((s, r) => s + (r.rating || 0), 0) / data.reviews.length).toFixed(1)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-cream-50">
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
        title={`${data.name} Reviews & References | PetPort`}
        description={`Read reviews and references for ${data.name}.`}
        url={`${window.location.origin}/reviews/${data.id}`}
      />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <header className="text-center mb-8">
          {data.photoUrl && (
            <div className="mb-6">
              <img 
                src={data.photoUrl} 
                alt={data.name}
                className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-sage-200"
              />
            </div>
          )}
          <h1 className="text-3xl font-extrabold tracking-tight text-navy-900">
            {data.name} – Reviews & References
          </h1>
          {avg && (
            <div className="mt-3 flex items-center justify-center gap-2 text-yellow-700">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className={`w-5 h-5 ${i <= Math.round(parseFloat(avg)) ? 'text-yellow-500 fill-current' : 'text-yellow-300'}`} />
              ))}
              <span className="font-semibold">{avg}/5.0</span>
            </div>
          )}
        </header>

        {data.reviews && data.reviews.length > 0 ? (
          <div className="space-y-4">
            {data.reviews.map((r, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle className="text-navy-900 text-base">
                    {r.reviewerName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-yellow-700">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className={`w-4 h-4 ${i <= r.rating ? 'text-yellow-500 fill-current' : 'text-yellow-300'}`} />
                    ))}
                    {r.location && <span className="text-sm text-muted-foreground">• {r.location}</span>}
                    {r.date && <span className="text-sm text-muted-foreground">• {r.date}</span>}
                  </div>
                  {r.text && <p className="text-sm">{r.text}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-6 text-center text-muted-foreground">
              No reviews yet.
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
