
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star, Plus, Share2, Mail, MapPin, Calendar, User, Edit, Send, X } from "lucide-react";
import { ReviewsEditForm } from "@/components/ReviewsEditForm";
import { useToast } from "@/hooks/use-toast";
import { PrivacyHint } from "@/components/PrivacyHint";
import { SocialShareButtons } from "@/components/SocialShareButtons";

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
    is_public?: boolean;
  };
  onUpdate?: () => void;
}

export const ReviewsSection = ({ petData, onUpdate }: ReviewsSectionProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [requestForm, setRequestForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const { toast } = useToast();

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
    setIsRequestModalOpen(true);
  };

  const handleSendReviewRequest = () => {
    if (!requestForm.name.trim() || (!requestForm.email.trim() && !requestForm.phone.trim())) {
      toast({
        title: "Missing Information",
        description: "Please provide a name and either an email or phone number.",
        variant: "destructive",
      });
      return;
    }

    console.log("Sending review request:", {
      petName: petData.name,
      petId: petData.id,
      recipient: requestForm
    });

    // Here you would implement the actual sending logic
    // For now, we'll just show a success message and reset the form
    toast({
      title: "Review Request Sent",
      description: `A review request has been sent to ${requestForm.name} for ${petData.name}.`,
    });

    // Reset form and close modal
    setRequestForm({ name: '', email: '', phone: '', message: '' });
    setIsRequestModalOpen(false);
  };

  const openShareDialog = () => {
    if (!petData.is_public) {
      toast({
        title: "Profile Not Public",
        description: "Your pet's profile must be public to share reviews. Please enable public sharing first.",
        variant: "destructive",
      });
      return;
    }
    setIsShareModalOpen(true);
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
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-4 gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-bold mb-2">Reviews & References</h2>
              <p className="text-blue-100 text-sm md:text-base">Trusted feedback from hosts, vets, and caregivers</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <div
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center space-x-2 p-2 text-white hover:text-blue-200 hover:scale-110 transition-all cursor-pointer"
                role="button"
                tabIndex={0}
                aria-label="Edit reviews"
                onKeyDown={(e) => e.key === 'Enter' && setIsEditModalOpen(true)}
              >
                <Edit className="w-4 h-4" />
                <span className="text-sm">Edit</span>
              </div>
              <div
                onClick={handleRequestReview}
                className="flex items-center space-x-2 p-2 text-white hover:text-blue-200 hover:scale-110 transition-all cursor-pointer"
                role="button"
                tabIndex={0}
                aria-label="Request review"
                onKeyDown={(e) => e.key === 'Enter' && handleRequestReview()}
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">Request Review</span>
              </div>
              <div
                onClick={openShareDialog}
                className="flex items-center space-x-2 p-2 text-white hover:text-blue-200 hover:scale-110 transition-all cursor-pointer"
                role="button"
                tabIndex={0}
                aria-label="Share reviews"
                onKeyDown={(e) => e.key === 'Enter' && openShareDialog()}
              >
                <Share2 className="w-4 h-4" />
                <span className="text-sm">Share</span>
              </div>
            </div>
          </div>

          {/* Rating Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 p-4 bg-white/10 rounded-lg backdrop-blur-sm gap-4 sm:gap-0">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 md:w-6 md:h-6 ${
                      star <= averageRating ? 'text-yellow-400 fill-current' : 'text-gray-400'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xl md:text-2xl font-bold text-yellow-400">
                {reviews.length > 0 ? averageRating.toFixed(1) : "0.0"}
              </span>
            </div>
            <div className="text-blue-100">
              <p className="text-base md:text-lg font-semibold">{reviews.length} Reviews</p>
              <p className="text-sm">from trusted sources</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Hint for sharing */}
      {!petData.is_public && (
        <PrivacyHint
          isPublic={petData.is_public || false}
          feature="sharing reviews"
          variant="inline"
          showToggle={true}
          petId={petData.id}
          onUpdate={onUpdate}
        />
      )}

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
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-navy-900 truncate">{review.reviewerName}</h4>
                      {review.reviewerContact && (
                        <p className="text-sm text-gray-600 flex items-center space-x-1">
                          <Mail className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{review.reviewerContact}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col sm:items-end gap-2">
                    <div className="flex items-center space-x-1">
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

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  {review.date && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span>{review.date}</span>
                    </div>
                  )}
                  {review.location && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
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
          <CardContent className="p-6 md:p-8 text-center">
            <Star className="w-10 h-10 md:w-12 md:h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-blue-900 mb-2">No Reviews Yet</h3>
            <p className="text-blue-700 mb-4">
              Start building {petData.name}'s reputation by adding your first review or reference
            </p>
            <Button onClick={() => setIsEditModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add First Review
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Request New Review */}
      <Card className="border-2 border-dashed border-blue-300 bg-blue-50/50">
        <CardContent className="p-6 md:p-8 text-center">
          <Plus className="w-10 h-10 md:w-12 md:h-12 text-blue-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Request a New Review</h3>
          <p className="text-blue-700 mb-4">
            Ask a recent host, sitter, or service provider to share their experience with {petData.name}
          </p>
          <Button onClick={handleRequestReview} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
            <Mail className="w-4 h-4 mr-2" />
            Send Review Request
          </Button>
        </CardContent>
      </Card>

      {/* Review Request Modal */}
      <Dialog open={isRequestModalOpen} onOpenChange={setIsRequestModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request a Review for {petData.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="recipient-name">Reviewer Name *</Label>
              <Input
                id="recipient-name"
                placeholder="e.g., Sarah Johnson"
                value={requestForm.name}
                onChange={(e) => setRequestForm({...requestForm, name: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="recipient-email">Email Address</Label>
              <Input
                id="recipient-email"
                type="email"
                placeholder="e.g., sarah@example.com"
                value={requestForm.email}
                onChange={(e) => setRequestForm({...requestForm, email: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="recipient-phone">Phone Number</Label>
              <Input
                id="recipient-phone"
                type="tel"
                placeholder="e.g., (555) 123-4567"
                value={requestForm.phone}
                onChange={(e) => setRequestForm({...requestForm, phone: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="custom-message">Custom Message (Optional)</Label>
              <Textarea
                id="custom-message"
                placeholder="Hi Sarah! Could you please leave a review about your experience with Luna? Thanks!"
                value={requestForm.message}
                onChange={(e) => setRequestForm({...requestForm, message: e.target.value})}
                rows={3}
              />
            </div>

            <p className="text-sm text-gray-600">
              * Either email or phone number is required
            </p>

            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsRequestModalOpen(false)}
                className="flex-1"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button 
                onClick={handleSendReviewRequest}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Modal */}
      <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Share Reviews & References</DialogTitle>
          </DialogHeader>
          <SocialShareButtons
            petName={petData.name}
            petId={petData.id}
            context="reviews"
            defaultOpenOptions={false}
            shareUrlOverride={`${window.location.origin}/reviews/${petData.id}`}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
