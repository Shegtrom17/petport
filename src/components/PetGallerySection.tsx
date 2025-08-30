import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Camera, Upload, Download, Plus, Eye, Trash2, Edit2, X, Loader2, Share2, CheckSquare, Square, Copy, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { uploadGalleryPhoto, uploadMultipleGalleryPhotos, deleteGalleryPhoto, updateGalleryPhotoCaption } from "@/services/petService";
import { compressMultipleImages, formatFileSize } from "@/utils/imageCompression";
import { generateClientPetPDF } from "@/services/clientPdfService";
import { SocialShareButtons } from "@/components/SocialShareButtons";
import { useIsMobile } from "@/hooks/useIsMobile";

const MAX_GALLERY_PHOTOS = 12;

interface GalleryPhoto {
  id: string;
  url: string;
  caption: string | null;
}

interface PetGallerySectionProps {
  petData: {
    id: string;
    name: string;
    gallery_photos?: GalleryPhoto[];
  };
  onUpdate: () => void;
}

export const PetGallerySection = ({ petData, onUpdate }: PetGallerySectionProps) => {
  const [uploading, setUploading] = useState(false);
  const [editingCaption, setEditingCaption] = useState<string | null>(null);
  const [editCaptionValue, setEditCaptionValue] = useState("");
  const [isGalleryPDFDialogOpen, setIsGalleryPDFDialogOpen] = useState(false);
  const [generatedGalleryPdfBlob, setGeneratedGalleryPdfBlob] = useState<Blob | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isShareSheetOpen, setIsShareSheetOpen] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const galleryPhotos = petData.gallery_photos || [];
  const remainingSlots = MAX_GALLERY_PHOTOS - galleryPhotos.length;
  const isLimitReached = galleryPhotos.length >= MAX_GALLERY_PHOTOS;

  // Helper functions
  const togglePhotoSelection = (photoId: string) => {
    setSelectedPhotos(prev =>
      prev.includes(photoId)
        ? prev.filter(id => id !== photoId)
        : [...prev, photoId]
    );
  };

  const selectAllPhotos = () => {
    if (selectedPhotos.length === galleryPhotos.length) {
      setSelectedPhotos([]);
    } else {
      setSelectedPhotos(galleryPhotos.map(photo => photo.id));
    }
  };

  const generateShareableUrl = () => {
    const baseUrl = `${window.location.origin}/gallery/${petData.id}`;
    if (selectedPhotos.length > 0 && selectedPhotos.length < galleryPhotos.length) {
      return `${baseUrl}?photos=${selectedPhotos.join(',')}`;
    }
    return baseUrl;
  };

  const getShareButtonText = () => {
    if (selectedPhotos.length === 0) {
      return `Share all (${galleryPhotos.length})`;
    }
    return `Share selected (${selectedPhotos.length})`;
  };

  const handleCopyLink = async () => {
    const url = generateShareableUrl();
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied!",
        description: "Gallery link has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again or manually copy the URL.",
        variant: "destructive",
      });
    }
  };

  const handlePreview = () => {
    const url = generateShareableUrl();
    window.open(url, '_blank');
  };

  const handleStartSelection = () => {
    setIsSelectionMode(true);
    setSelectedPhotos([]);
  };

  const handleCancelSelection = () => {
    setIsSelectionMode(false);
    setSelectedPhotos([]);
  };

  const handleShareAction = () => {
    setIsShareSheetOpen(true);
  };

  // Upload functions
  const handleUploadPhotos = () => {
    if (isLimitReached) {
      toast({
        title: "Photo limit reached",
        description: `Maximum of ${MAX_GALLERY_PHOTOS} photos allowed per pet. Delete some photos to add new ones.`,
        variant: "destructive",
      });
      return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    
    input.onchange = async (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      if (files.length === 0) return;

      let filesToUpload = files.slice(0, remainingSlots);
      if (files.length > remainingSlots) {
        toast({
          title: `Limited to ${remainingSlots} photos`,
          description: `Only uploading ${remainingSlots} out of ${files.length} selected photos due to ${MAX_GALLERY_PHOTOS} photo limit.`,
        });
      }

      setUploading(true);
      try {
        const compressionResults = await compressMultipleImages(filesToUpload, {
          maxWidth: 1200,
          maxHeight: 1200,
          quality: 0.85,
          maxSizeKB: 800
        });
        
        const compressedFiles = compressionResults.map(result => result.file);
        const result = await uploadMultipleGalleryPhotos(petData.id, compressedFiles);
        
        if (result.success) {
          toast({
            title: "Photos uploaded successfully",
            description: `${result.uploaded} photo(s) added to gallery`,
          });
          onUpdate();
        } else {
          toast({
            title: "Some photos failed to upload",
            description: `${result.uploaded} uploaded, ${result.failed} failed`,
            variant: "destructive",
          });
          if (result.uploaded > 0) onUpdate();
        }
      } catch (error) {
        toast({
          title: "Upload failed",
          description: "Failed to upload photos. Please try again.",
          variant: "destructive",
        });
      } finally {
        setUploading(false);
      }
    };
    
    input.click();
  };

  const handleCapturePhoto = () => {
    if (isLimitReached) {
      toast({
        title: "Photo limit reached",
        description: `Maximum of ${MAX_GALLERY_PHOTOS} photos allowed per pet. Delete some photos to add new ones.`,
        variant: "destructive",
      });
      return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setUploading(true);
      try {
        const compressionResults = await compressMultipleImages([file], {
          maxWidth: 1200,
          maxHeight: 1200,
          quality: 0.85,
          maxSizeKB: 800
        });
        
        const compressedFile = compressionResults[0].file;
        const success = await uploadGalleryPhoto(petData.id, compressedFile, `Captured on ${new Date().toLocaleDateString()}`);
        
        if (success) {
          toast({
            title: "Photo captured",
            description: "Photo added to gallery",
          });
          onUpdate();
        } else {
          toast({
            title: "Capture failed",
            description: "Failed to save captured photo",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Capture failed",
          description: "Failed to capture photo. Please try again.",
          variant: "destructive",
        });
      } finally {
        setUploading(false);
      }
    };
    
    input.click();
  };

  const handleDeletePhoto = async (photoId: string, photoUrl: string) => {
    try {
      const success = await deleteGalleryPhoto(photoId, photoUrl);
      
      if (success) {
        toast({
          title: "Photo deleted",
          description: "Photo removed from gallery",
        });
        onUpdate();
      } else {
        toast({
          title: "Delete failed",
          description: "Failed to delete photo",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Failed to delete photo. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveCaption = async (photoId: string) => {
    try {
      const success = await updateGalleryPhotoCaption(photoId, editCaptionValue);
      
      if (success) {
        toast({
          title: "Caption updated",
          description: "Photo caption saved successfully",
        });
        setEditingCaption(null);
        setEditCaptionValue("");
        onUpdate();
      } else {
        toast({
          title: "Update failed",
          description: "Failed to update caption",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update caption. Please try again.",
        variant: "destructive",
      });
    }
  };

  const startEditingCaption = (photoId: string, currentCaption: string | null) => {
    setEditingCaption(photoId);
    setEditCaptionValue(currentCaption || "");
  };

  const cancelEditingCaption = () => {
    setEditingCaption(null);
    setEditCaptionValue("");
  };

  const showGalleryPDFOptions = () => {
    if (!galleryPhotos || galleryPhotos.length === 0) {
      toast({
        title: "No Photos Available",
        description: "Add some photos to your gallery before generating a PDF.",
        variant: "destructive",
      });
      return;
    }
    setIsGalleryPDFDialogOpen(true);
    setGeneratedGalleryPdfBlob(null);
  };

  const handleGalleryPDFAction = async (action: 'view' | 'download') => {
    setIsGeneratingPDF(true);
    try {
      const result = await generateClientPetPDF(petData, 'gallery');
      
      if (result.success && result.blob) {
        setGeneratedGalleryPdfBlob(result.blob);
        
        if (action === 'download') {
          const fileName = `${petData.name}_Photo_Gallery.pdf`;
          const a = document.createElement('a');
          a.href = URL.createObjectURL(result.blob);
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(a.href);
          
          toast({
            title: "Download Started",
            description: `${petData.name}'s photo gallery PDF is downloading.`,
          });
          
          setIsGalleryPDFDialogOpen(false);
        }
      } else {
        throw new Error(result.error || 'Failed to generate gallery PDF');
      }
    } catch (error) {
      console.error('Gallery PDF generation error:', error);
      toast({
        title: "Error",
        description: "Failed to generate gallery PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with guidance */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-navy-900 to-navy-800 text-white">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <Camera className="w-8 h-8 text-yellow-400" />
                <h2 className="text-2xl font-bold">Pet Photo Gallery</h2>
              </div>
              <p className="text-blue-100 text-sm leading-relaxed mt-2">
                Upload clear photos that show your pet's unique markings, size, or special features. 
                These help hosts, vets, and rescuers identify your pet quickly and accurately.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-4 sm:justify-end">
              <div 
                onClick={handleUploadPhotos}
                className={`cursor-pointer flex items-center justify-center text-white hover:text-yellow-300 hover:scale-110 transition-all duration-200 text-xs sm:text-base px-2 sm:px-4 py-2 ${(uploading || isLimitReached) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Plus className="w-3 h-3 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{uploading ? "Uploading..." : "Add Photos"}</span>
                <span className="sm:hidden">{uploading ? "..." : "Add"}</span>
              </div>
              <div 
                onClick={showGalleryPDFOptions}
                className="cursor-pointer flex items-center justify-center text-white hover:text-yellow-300 hover:scale-110 transition-all duration-200 text-xs sm:text-base px-2 sm:px-4 py-2"
              >
                <Download className="w-3 h-3 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Download PDF</span>
                <span className="sm:hidden">PDF</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Area with Camera Capture */}
      <Card className="border-0 shadow-lg bg-passport-section-bg backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="w-5 h-5 text-blue-600" />
            <span>Upload New Photos</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-navy-800 transition-colors cursor-pointer"
            onClick={handleUploadPhotos}
          >
            <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">
              {isLimitReached ? "Photo limit reached - delete photos to add new ones" : "Click to upload photos or drag and drop"}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              {isLimitReached 
                ? `Maximum ${MAX_GALLERY_PHOTOS} photos per pet` 
                : `${remainingSlots} slots remaining • Supports JPG, PNG, HEIC up to 10MB each`
              }
            </p>
            <div className="flex justify-center space-x-2 sm:space-x-3">
              <Button 
                className="bg-gradient-to-r from-navy-900 to-navy-800 text-gold-500 border border-gold-500/30 px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUploadPhotos();
                }}
                disabled={uploading || isLimitReached}
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{uploading ? "Uploading..." : "Choose Files"}</span>
                <span className="sm:hidden">{uploading ? "..." : "Upload"}</span>
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white border-0 px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCapturePhoto();
                }}
                disabled={uploading || isLimitReached}
              >
                <Camera className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">📸 Capture Moment</span>
                <span className="sm:hidden">📸 Capture</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Photo Gallery Grid */}
      <Card className="border-0 shadow-lg bg-passport-section-bg backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-blue-600" />
              <span>{petData.name}'s Photo Gallery</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge 
                variant={isLimitReached ? "destructive" : "outline"} 
                className={isLimitReached ? "text-xs px-2 py-1" : "border-navy-800 text-navy-800 text-xs px-2 py-1"}
              >
                {galleryPhotos.length}/{MAX_GALLERY_PHOTOS} Photos
              </Badge>
            </div>
          </CardTitle>
          
          {/* Improved Share Controls */}
          {galleryPhotos.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              {!isSelectionMode ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-900 mb-2">Share Gallery</h4>
                    <p className="text-sm text-blue-700">Share all photos or select specific ones to create a custom gallery link.</p>
                  </div>
                  <div className="flex gap-2">
                    <Sheet open={isShareSheetOpen} onOpenChange={setIsShareSheetOpen}>
                      <SheetTrigger asChild>
                        <Button 
                          size="sm" 
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => setSelectedPhotos([])}
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          <span className="text-responsive-sm">Share all ({galleryPhotos.length})</span>
                        </Button>
                      </SheetTrigger>
                    </Sheet>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleStartSelection}
                    >
                      <CheckSquare className="w-4 h-4 mr-2" />
                      <span className="text-responsive-sm">Select photos</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Button
                        onClick={selectAllPhotos}
                        variant="outline"
                        size="sm"
                      >
                        {selectedPhotos.length === galleryPhotos.length ? (
                          <>
                            <CheckSquare className="w-4 h-4 mr-1" />
                            Deselect All
                          </>
                        ) : (
                          <>
                            <Square className="w-4 h-4 mr-1" />
                            Select All
                          </>
                        )}
                      </Button>
                      
                      {selectedPhotos.length > 0 && (
                        <Badge variant="secondary" className="text-xs px-2 py-1">
                          {selectedPhotos.length} selected
                        </Badge>
                      )}
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelSelection}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <Sheet open={isShareSheetOpen} onOpenChange={setIsShareSheetOpen}>
                      <SheetTrigger asChild>
                        <Button 
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          disabled={selectedPhotos.length === 0}
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          {getShareButtonText()}
                        </Button>
                      </SheetTrigger>
                    </Sheet>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleCopyLink}
                      disabled={selectedPhotos.length === 0}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy link
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handlePreview}
                      disabled={selectedPhotos.length === 0}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                  
                  <p className="text-xs text-blue-600">
                    💡 Tap photos below to select them, then use the share options above
                  </p>
                </div>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent>
          {galleryPhotos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryPhotos.map((photo, index) => (
                <div key={photo.id} className="space-y-3">
                  <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 shadow-md hover:shadow-lg transition-shadow group">
                    <img 
                      src={photo.url} 
                      alt={`${petData.name} gallery photo ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Selection checkbox */}
                    {isSelectionMode && (
                      <div className="absolute top-2 left-2">
                        <Button
                          size="sm"
                          variant={selectedPhotos.includes(photo.id) ? "default" : "secondary"}
                          className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                          onClick={() => togglePhotoSelection(photo.id)}
                        >
                          {selectedPhotos.includes(photo.id) ? (
                            <CheckSquare className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    )}
                    
                    {/* Action buttons overlay */}
                    <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                        onClick={() => startEditingCaption(photo.id, photo.caption)}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-8 w-8 p-0 bg-red-500/90 hover:bg-red-600"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Photo</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this photo? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeletePhoto(photo.id, photo.url)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  
                  {/* Caption area */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-700 font-medium mb-2">Photo {index + 1}</p>
                    {editingCaption === photo.id ? (
                      <div className="space-y-2">
                        <Label htmlFor={`caption-${photo.id}`} className="text-xs text-gray-600">
                          Photo Description
                        </Label>
                        <Input
                          id={`caption-${photo.id}`}
                          value={editCaptionValue}
                          onChange={(e) => setEditCaptionValue(e.target.value)}
                          placeholder="Describe this photo..."
                          className="text-sm"
                        />
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleSaveCaption(photo.id)}
                            className="text-xs px-3 py-1"
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEditingCaption}
                            className="text-xs px-3 py-1"
                          >
                            <X className="w-3 h-3 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="min-h-[20px]">
                        {photo.caption ? (
                          <p className="text-sm text-gray-600">{photo.caption}</p>
                        ) : (
                          <p className="text-xs text-gray-400 italic">No description</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No photos uploaded yet</p>
              <div className="flex justify-center space-x-2 sm:space-x-3">
                <Button 
                  onClick={handleUploadPhotos}
                  className="bg-gradient-to-r from-navy-900 to-navy-800 text-gold-500 border border-gold-500/30 px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm"
                  disabled={uploading || isLimitReached}
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">{uploading ? "Uploading..." : "Upload First Photo"}</span>
                  <span className="sm:hidden">{uploading ? "..." : "Upload"}</span>
                </Button>
                <Button 
                  onClick={handleCapturePhoto}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm"
                  disabled={uploading || isLimitReached}
                >
                  <Camera className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">📸 Take Photo</span>
                  <span className="sm:hidden">📸 Photo</span>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mobile sticky bottom bar when in selection mode */}
      {isMobile && isSelectionMode && galleryPhotos.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-50">
          <div className="bg-white border border-blue-200 rounded-lg p-3 shadow-lg">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleCancelSelection}
                  variant="outline"
                >
                  <X className="w-4 h-4" />
                </Button>
                <span className="text-sm font-medium">
                  {selectedPhotos.length} selected
                </span>
              </div>
              
              <div className="flex gap-2">
                <Sheet open={isShareSheetOpen} onOpenChange={setIsShareSheetOpen}>
                  <SheetTrigger asChild>
                    <Button 
                      size="sm"
                      disabled={selectedPhotos.length === 0}
                    >
                      <Share2 className="w-4 h-4 mr-1" />
                      Share
                    </Button>
                  </SheetTrigger>
                </Sheet>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleCopyLink}
                  disabled={selectedPhotos.length === 0}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Sheet */}
      <Sheet open={isShareSheetOpen} onOpenChange={setIsShareSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Share Gallery</SheetTitle>
          </SheetHeader>
          
          <div className="space-y-4 mt-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">
                {selectedPhotos.length === 0 
                  ? `Sharing all ${galleryPhotos.length} photos`
                  : `Sharing ${selectedPhotos.length} selected photos`
                }
              </h4>
              <p className="text-sm text-blue-700">
                Recipients will see {selectedPhotos.length === 0 ? 'the complete gallery' : 'only your selected photos'} when they visit the link.
              </p>
            </div>

            <SocialShareButtons
              petName={petData.name}
              petId={petData.id}
              context="profile"
              shareUrlOverride={generateShareableUrl()}
              compact={false}
            />

            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-gray-500">
                💡 <strong>Email sharing:</strong> If you don't have email configured, the system will open your device's default email app with a pre-filled message.
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Photo Guidelines */}
      <Card className="border-0 shadow-lg bg-passport-section-bg backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg">Photo Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Recommended Photos:</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Unique markings or patterns</li>
                <li>• Full body standing view</li>
                <li>• Close-up of distinguishing features</li>
                <li>• Different angles showing size/build</li>
                <li>• Any scars or distinctive marks</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Photo Tips:</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Use good lighting (natural light preferred)</li>
                <li>• Keep photos clear and in focus</li>
                <li>• Show true colors accurately</li>
                <li>• Include size reference when helpful</li>
                <li>• Add descriptive captions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gallery PDF Options Dialog */}
      <Dialog open={isGalleryPDFDialogOpen} onOpenChange={setIsGalleryPDFDialogOpen}>
        <DialogContent className="max-w-md bg-[#f8f8f8]">
          <DialogHeader>
            <DialogTitle className="font-bold text-navy-900 border-b-2 border-gold-500 pb-2">
              Photo Gallery PDF Options
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {!generatedGalleryPdfBlob && !isGeneratingPDF && (
              <div className="space-y-3">
                <p className="text-sm text-navy-600 text-center">
                  Choose how you'd like to use {petData.name}'s photo gallery PDF:
                </p>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => handleGalleryPDFAction('view')}
                    variant="outline"
                    className="border-gold-500 text-gold-600 hover:bg-gold-50"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View PDF
                  </Button>
                  <Button
                    onClick={() => handleGalleryPDFAction('download')}
                    className="bg-gradient-to-r from-gold-500 to-gold-400 text-navy-900 hover:from-gold-400 hover:to-gold-300"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
            )}
            
            {isGeneratingPDF && (
              <div className="text-center py-6">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-gold-500" />
                <p className="text-navy-600">Generating photo gallery PDF...</p>
              </div>
            )}
            
            {generatedGalleryPdfBlob && !isGeneratingPDF && (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border border-gold-500/30 shadow-sm">
                  <h4 className="font-bold text-navy-900 mb-3">
                    Photo Gallery PDF
                  </h4>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <Button
                      onClick={() => {
                        const url = URL.createObjectURL(generatedGalleryPdfBlob);
                        window.open(url, '_blank')?.focus();
                        URL.revokeObjectURL(url);
                      }}
                      variant="outline"
                      className="border-gold-500 text-gold-600 hover:bg-gold-50"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View PDF
                    </Button>
                    <Button
                      onClick={() => {
                        const fileName = `${petData.name}_Photo_Gallery.pdf`;
                        const a = document.createElement('a');
                        a.href = URL.createObjectURL(generatedGalleryPdfBlob);
                        a.download = fileName;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(a.href);
                      }}
                      className="bg-gradient-to-r from-gold-500 to-gold-400 text-navy-900 hover:from-gold-400 hover:to-gold-300"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
