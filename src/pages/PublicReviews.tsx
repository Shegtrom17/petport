import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MetaTags } from "@/components/MetaTags";
import { fetchPetDetails } from "@/services/petService";
import { AddReviewForm } from "@/components/AddReviewForm";
import { Star, X, MessageSquare } from "lucide-react";
import { smoothScrollIntoViewIfNeeded } from "@/utils/smoothScroll";
import { supabase } from "@/integrations/supabase/client";

interface PublicReviewsData {
  id: string;
  name: string;
  is_public?: boolean;
  photoUrl?: string;
  reviews?: Array<{
    id?: string;
    reviewerName: string;
    reviewerContact?: string | null;
    rating: number;
    text?: string | null;
    date?: string | null;
    location?: string | null;
    response?: {
      id: string;
      response_text: string;
      created_at: string;
    } | null;
  }>;
}

export default function PublicReviews() {
  const { petId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<PublicReviewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddReview, setShowAddReview] = useState(false);
  const reviewFormRef = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const loadPetData = async () => {
    if (!petId) return;
    const pet = await fetchPetDetails(petId);
    
    // Fetch responses for reviews
    if (pet?.reviews && pet.reviews.length > 0) {
      const reviewIds = pet.reviews.map((r: any) => r.id).filter(Boolean);
      
      if (reviewIds.length > 0) {
        const { data: responses } = await supabase
          .from('review_responses')
          .select('*')
          .in('review_id', reviewIds);

        pet.reviews = pet.reviews.map((review: any) => ({
          ...review,
          response: responses?.find((r: any) => r.review_id === review.id) || null
        }));
      }
    }
    
    setData(pet);
    setLoading(false);
  };

  const handleOpenReviewForm = () => {
    setShowAddReview(true);
    setTimeout(() => {
      if (reviewFormRef.current) {
        smoothScrollIntoViewIfNeeded(reviewFormRef.current);
      }
    }, 100);
  };

  const handleReviewSuccess = () => {
    setShowAddReview(false);
    loadPetData();
  };

  useEffect(() => {
    loadPetData();
  }, [petId]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('add_review') === 'true') {
      setShowAddReview(true);
    }
  }, []);

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

        {/* Leave a Review Button */}
        {!showAddReview && (
          <div className="text-center mb-6">
            <Button 
              onClick={handleOpenReviewForm}
              className="bg-gold-500 hover:bg-gold-600 text-white"
            >
              <Star className="w-4 h-4 mr-2" />
              Leave a Review for {data.name}
            </Button>
          </div>
        )}

        {/* Review Form */}
        {showAddReview && (
          <div ref={reviewFormRef} className="mb-6">
            <Card className="border-gold-500/30 bg-gold-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-navy-900">
                  <Star className="w-5 h-5 text-gold-500" />
                  Leave a Review for {data.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AddReviewForm 
                  petId={data.id} 
                  petName={data.name} 
                  onClose={() => setShowAddReview(false)}
                  onSuccess={handleReviewSuccess}
                />
              </CardContent>
            </Card>
          </div>
        )}

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
                  
                  {/* Owner Response */}
                  {r.response && (
                    <div className="mt-3 p-3 bg-azure/5 border-l-4 border-azure rounded-r-lg">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="w-3 h-3 text-azure mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-azure mb-1">
                            Response from {data.name}'s Owner
                          </p>
                          <p className="text-sm text-gray-700">{r.response.response_text}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <Star className="w-12 h-12 text-gold-400 mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">
                No reviews yet. Be the first to share your experience with {data.name}!
              </p>
              {!showAddReview && (
                <Button 
                  onClick={handleOpenReviewForm}
                  className="bg-gold-500 hover:bg-gold-600 text-white"
                >
                  <Star className="w-4 h-4 mr-2" />
                  Write First Review
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
