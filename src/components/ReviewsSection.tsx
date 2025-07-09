
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Star, Plus, Share2, Mail, MapPin, Calendar, User, Edit } from "lucide-react";
import { ReviewsEditForm } from "@/components/ReviewsEditForm";

interface Review {
  id?: string;
  reviewerName: string;
  reviewerContact?: string;
  rating: number;
  text?: string;
  date?: string;
  location?: string;
  type?: 'boarding' | 'sitting' | 'veterinary' | 'training' | 'grooming' | 'other';
}

interface ReviewsSectionProps {
  petData: {
    id: string;
    name: string;
    reviews?: Review[];
  };
  onUpdate?: () => void;
}

export const ReviewsSection = ({ petData, onUpdate }: ReviewsSectionProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Use actual reviews from petData or show empty state
  const reviews = petData.reviews && petData.reviews.length > 0 ? petData.reviews : [];

  const averageRating = reviews.length 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'boarding': return 'bg-blue-100 text-blue-800';
      case 'sitting': return 'bg-green-100 text-green-800';
      case 'veterinary': return 'bg-purple-100 text-purple-800';
      case 'training': return 'bg-orange-100 text-orange-800';
      case 'grooming': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRequestReview = () => {
    console.log("Review request functionality not yet implemented");
    // Placeholder - this functionality could be implemented later
  };

  const handleShareReviews = () => {
    console.log("Share reviews functionality not yet implemented");
    // Placeholder - this functionality could be implemented later
  };

  const handleEditSave = () => {
    setIsEditModalOpen(false);
    if (onUpdate) {
      onUpdate();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Summary */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-navy-900 to-navy-800 text-white">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Reviews & References</h2>
              <p className="text-blue-100">Trusted feedback from hosts, vets, and caregivers</p>
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={() => setIsEditModalOpen(true)} 
                variant="secondary" 
                size="sm"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button onClick={handleRequestReview} variant="secondary" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Request Review
              </Button>
              <Button onClick={handleShareReviews} variant="secondary" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          {/* Rating Summary */}
          <div className="flex items-center space-x-6 p-4 bg-white/10 rounded-lg backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-6 h-6 ${
                      star <= averageRating ? 'text-yellow-400 fill-current' : 'text-gray-400'
                    }`}
                  />
                ))}
              </div>
              <span className="text-2xl font-bold text-yellow-400">
                {reviews.length > 0 ? averageRating.toFixed(1) : "0.0"}
              </span>
            </div>
            <div className="text-blue-100">
              <p className="text-lg font-semibold">{reviews.length} Reviews</p>
              <p className="text-sm">from trusted sources</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Reviews & References</DialogTitle>
          </DialogHeader>
          <ReviewsEditForm
            petData={petData}
            onSave={handleEditSave}
            onCancel={() => setIsEditModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review, index) => (
            <Card key={review.id || index} className="border-0 shadow-lg bg-passport-section-bg backdrop-blur-sm hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-navy-900">{review.reviewerName}</h4>
                      {review.reviewerContact && (
                        <p className="text-sm text-gray-600 flex items-center space-x-1">
                          <Mail className="w-3 h-3" />
                          <span>{review.reviewerContact}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1 mb-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    {review.type && (
                      <Badge variant="outline" className={getTypeColor(review.type)}>
                        {review.type}
                      </Badge>
                    )}
                  </div>
                </div>

                {review.text && (
                  <p className="text-gray-700 mb-4 leading-relaxed">{review.text}</p>
                )}

                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  {review.date && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{review.date}</span>
                    </div>
                  )}
                  {review.location && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{review.location}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Empty State */
        <Card className="border-2 border-dashed border-blue-300 bg-blue-50/50">
          <CardContent className="p-8 text-center">
            <Star className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-blue-900 mb-2">No Reviews Yet</h3>
            <p className="text-blue-700 mb-4">
              Start building {petData.name}'s reputation by adding your first review or reference
            </p>
            <Button onClick={() => setIsEditModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add First Review
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Request New Review */}
      <Card className="border-2 border-dashed border-blue-300 bg-blue-50/50">
        <CardContent className="p-8 text-center">
          <Plus className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Request a New Review</h3>
          <p className="text-blue-700 mb-4">
            Ask a recent host, sitter, or service provider to share their experience with {petData.name}
          </p>
          <Button onClick={handleRequestReview} className="bg-blue-600 hover:bg-blue-700">
            <Mail className="w-4 h-4 mr-2" />
            Send Review Request
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
