
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Plus, Share2, Mail, MapPin, Calendar, User } from "lucide-react";

interface Review {
  id: string;
  reviewerName: string;
  reviewerContact?: string;
  rating: number;
  text: string;
  date: string;
  location: string;
  type: 'boarding' | 'sitting' | 'veterinary' | 'landlord' | 'other';
}

interface ReviewsSectionProps {
  petData: {
    name: string;
    reviews?: Review[];
  };
}

export const ReviewsSection = ({ petData }: ReviewsSectionProps) => {
  const [reviews] = useState<Review[]>(petData.reviews || [
    {
      id: '1',
      reviewerName: 'Sarah Johnson',
      reviewerContact: 'sarah@example.com',
      rating: 5,
      text: 'Luna was an absolute joy to have staying with us! She was well-behaved, house-trained, and got along perfectly with our other pets. Would definitely welcome her back anytime.',
      date: '2024-02-15',
      location: 'Denver, CO',
      type: 'boarding'
    },
    {
      id: '2',
      reviewerName: 'Mountain View Veterinary',
      reviewerContact: 'info@mvvet.com',
      rating: 5,
      text: 'Luna is one of our favorite patients! Always calm during examinations, responds well to handling, and her owner keeps excellent care records. A model pet patient.',
      date: '2024-01-20',
      location: 'Boulder, CO',
      type: 'veterinary'
    },
    {
      id: '3',
      reviewerName: 'Mike & Jenny Wilson',
      rating: 4,
      text: 'Luna stayed with us for a week while her family was traveling. She was friendly, clean, and very well-trained. Only minor issue was she gets a bit anxious during thunderstorms, but overall excellent!',
      date: '2023-12-10',
      location: 'Fort Collins, CO',
      type: 'sitting'
    }
  ]);

  const averageRating = reviews.length 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'boarding': return 'bg-blue-100 text-blue-800';
      case 'sitting': return 'bg-green-100 text-green-800';
      case 'veterinary': return 'bg-purple-100 text-purple-800';
      case 'landlord': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRequestReview = () => {
    console.log("Opening review request form...");
    // This would open a modal or form to request a new review
  };

  const handleShareReviews = () => {
    console.log("Sharing reviews...");
    // This would generate a shareable link
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
                {averageRating.toFixed(1)}
              </span>
            </div>
            <div className="text-blue-100">
              <p className="text-lg font-semibold">{reviews.length} Reviews</p>
              <p className="text-sm">from trusted sources</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id} className="border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-shadow">
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
                  <Badge variant="outline" className={getTypeColor(review.type)}>
                    {review.type}
                  </Badge>
                </div>
              </div>

              <p className="text-gray-700 mb-4 leading-relaxed">{review.text}</p>

              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(review.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{review.location}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
