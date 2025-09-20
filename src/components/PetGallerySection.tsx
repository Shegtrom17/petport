import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Camera, Upload, Download, Plus, Eye, Trash2, Edit2, X, Loader2, Share2, CheckSquare, Square, Copy, ExternalLink, GripVertical, Star } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { uploadGalleryPhoto, uploadMultipleGalleryPhotos, deleteGalleryPhoto, updateGalleryPhotoCaption, reorderGalleryPhotos } from "@/services/petService";
import { compressMultipleImages, formatFileSize } from "@/utils/imageCompression";
import { generateClientPetPDF } from "@/services/clientPdfService";
import { SocialShareButtons } from "@/components/SocialShareButtons";
import { useIsMobile } from "@/hooks/useIsMobile";
import { featureFlags, GALLERY_CONFIG } from '@/config/featureFlags';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GalleryLightbox } from "@/components/GalleryLightbox";
import { useLongPress } from "@/hooks/useLongPress";

const MAX_GALLERY_PHOTOS = GALLERY_CONFIG.MAX_PHOTOS;

interface GalleryPhoto {
  id: string;
  url: string;
  caption: string | null;
  position?: number;
}

interface PetGallerySectionProps {
  petData: {
    id: string;
    name: string;
    gallery_photos?: GalleryPhoto[];
  };
  onUpdate: () => void;
  handlePetUpdate?: () => Promise<void>;
}

export const PetGallerySection = ({ petData, onUpdate, handlePetUpdate }: PetGallerySectionProps) => {
  const [uploading, setUploading] = useState(false);
  const [editingCaption, setEditingCaption] = useState<string | null>(null);
  const [editCaptionValue, setEditCaptionValue] = useState("");
  const [isGalleryPDFDialogOpen, setIsGalleryPDFDialogOpen] = useState(false);
  const [generatedGalleryPdfBlob, setGeneratedGalleryPdfBlob] = useState<Blob | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isShareSheetOpen, setIsShareSheetOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isDragMode, setIsDragMode] = useState(false);
  const [reorderingHint, setReorderingHint] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const galleryPhotos = (petData.gallery_photos || []).sort((a, b) => (a.position || 0) - (b.position || 0));
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

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(galleryPhotos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update positions
    const updatedPhotos = items.map((photo, index) => ({
      ...photo,
      position: index + 1
    }));

    try {
      await reorderGalleryPhotos(petData.id, updatedPhotos.map(p => ({ id: p.id, position: p.position! })));
        toast({
          title: "Photos reordered",
          description: "Photo order saved successfully. First four photos will appear in lost pet flyers.",
        });
      onUpdate();
    } catch (error) {
      toast({
        title: "Failed to reorder",
        description: "Please try again.",
        variant: "destructive",
      });
    }
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
    
    // For view action, open window immediately to avoid popup blockers
    let viewWindow: Window | null = null;
    if (action === 'view') {
      viewWindow = window.open('', '_blank');
      if (viewWindow) {
        viewWindow.document.write('<html><head><title>Loading PDF...</title></head><body><div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:Arial,sans-serif;"><div>Loading PDF...</div></div></body></html>');
      }
    }
    
    try {
      // Refresh pet data before generating PDF
      if (handlePetUpdate) {
        await handlePetUpdate();
      }
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
        } else if (action === 'view') {
          const pdfUrl = URL.createObjectURL(result.blob);
          if (viewWindow && !viewWindow.closed) {
            viewWindow.location.href = pdfUrl;
          } else {
            // Fallback if popup was blocked
            window.open(pdfUrl, '_blank');
          }
          
          toast({
            title: "PDF Opened",
            description: `${petData.name}'s photo gallery PDF opened in new tab.`,
          });
          
          setIsGalleryPDFDialogOpen(false);
        }
      } else {
        throw new Error(result.error || 'Failed to generate gallery PDF');
      }
    } catch (error) {
      console.error('Gallery PDF generation error:', error);
      
      // Close the loading window if view failed
      if (action === 'view' && viewWindow && !viewWindow.closed) {
        viewWindow.close();
      }
      
      toast({
        title: "Error",
        description: "Failed to generate gallery PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Lightbox functions
  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setIsDragMode(false);
  };

  // Set as cover (move to position 1)
  const setAsCover = async (photoId: string) => {
    const photoIndex = galleryPhotos.findIndex(p => p.id === photoId);
    if (photoIndex === -1) return;

    const items = Array.from(galleryPhotos);
    const [movedPhoto] = items.splice(photoIndex, 1);
    items.unshift(movedPhoto);

    // Update positions
    const updatedPhotos = items.map((photo, index) => ({
      ...photo,
      position: index + 1
    }));

    try {
      await reorderGalleryPhotos(petData.id, updatedPhotos.map(p => ({ id: p.id, position: p.position! })));
      toast({
        title: "Cover photo updated",
        description: "Photo moved to the first position for lost pet flyers.",
      });
      onUpdate();
    } catch (error) {
      toast({
        title: "Failed to set cover",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  // Long press handlers
  const longPressHandlers = useLongPress({
    onLongPress: () => {
      setIsDragMode(true);
      setReorderingHint(true);
      setTimeout(() => setReorderingHint(false), 2000);
    },
    delay: 400,
  });

  return (
    <div className="space-y-6">
      {/* Header with guidance */}
      <Card className="border-0 shadow-xl bg-brand-primary text-white">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <Camera className="w-8 h-8 text-yellow-400" />
                <h2 className="text-2xl font-bold">Pet Photo Gallery</h2>
              </div>
              <p className="text-blue-100 text-sm leading-relaxed mt-2">
                Upload clear photos that show your pet's unique markings, size, or special features. 
                The first four photos will be used for lost pet flyers. Drag to reorder.
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
              <div 
                onClick={handleShareAction}
                className={`cursor-pointer flex items-center justify-center text-white hover:text-yellow-300 hover:scale-110 transition-all duration-200 text-xs sm:text-base px-2 sm:px-4 py-2 ${galleryPhotos.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Share2 className="w-3 h-3 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Share Gallery</span>
                <span className="sm:hidden">Share</span>
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
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-brand-primary transition-colors cursor-pointer"
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
                className="bg-brand-primary hover:bg-brand-primary-dark text-white border border-white/20 px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm"
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
                className="bg-brand-primary hover:bg-brand-primary-dark text-white border-0 px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm"
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
            
            {/* Profile Completion Hint - moved outside flex container */}
            <div className="mt-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  💡 <strong>Tip:</strong> Complete your pet's Pet Profile section (via Edit button) for professional PDFs and optimal sharing quality.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Photo Gallery Grid */}
      <Card className="border-0 shadow-lg bg-passport-section-bg backdrop-blur-sm" data-gallery-area>
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-blue-600" />
              <span>{petData.name}'s Photo Gallery</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge 
                variant={isLimitReached ? "destructive" : "outline"} 
                className={isLimitReached ? "text-xs px-2 py-1" : "border-brand-primary text-brand-primary text-xs px-2 py-1"}
              >
                {galleryPhotos.length}/{MAX_GALLERY_PHOTOS} Photos
              </Badge>
              {galleryPhotos.length > 1 && !isSelectionMode && (
                <span className="text-xs text-gray-500">• Drag & drop to reorder</span>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {galleryPhotos.length > 0 ? (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="gallery-photos">
                {(provided) => (
                  <div 
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {galleryPhotos.map((photo, index) => (
                      <Draggable key={photo.id} draggableId={photo.id} index={index} isDragDisabled={isSelectionMode}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...(!isSelectionMode ? provided.dragHandleProps : {})}
                            className={`relative group rounded-lg overflow-hidden border-2 ${
                              snapshot.isDragging ? 'shadow-lg z-50' : 'transition-all duration-200'
                            } ${
                              isSelectionMode 
                                ? selectedPhotos.includes(photo.id)
                                  ? 'border-brand-primary bg-brand-primary/10'
                                  : 'border-gray-200 hover:border-gray-300'
                                : 'border-gray-200 hover:border-brand-primary hover:shadow-md cursor-grab active:cursor-grabbing'
                            }`}
                            style={{
                              touchAction: 'auto',
                              userSelect: 'none',
                              WebkitUserSelect: 'none',
                              ...provided.draggableProps.style
                            }}
                          >
                            {/* Drag Handle */}
                            {!isSelectionMode && (
                              <div 
                                className={`absolute top-2 right-2 z-20 bg-black/70 rounded p-1 transition-opacity ${
                                  isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                }`}
                                style={{ touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none' }}
                              >
                                <GripVertical className="w-4 h-4 text-white" />
                              </div>
                            )}

                            {/* Position Badge */}
                            <div className="absolute top-2 left-2 bg-brand-primary text-white text-xs px-2 py-1 rounded-full font-bold">
                              {index + 1}
                            </div>

                            {/* Lost Flyer Badge for first four photos */}
                            {index < 4 && (
                              <div className="absolute top-8 left-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-bold">
                                Lost Flyer
                              </div>
                            )}

                            <img 
                              src={photo.url} 
                              alt={photo.caption || `${petData.name} photo ${index + 1}`}
                              className="w-full h-48 object-cover"
                              style={{ touchAction: 'pan-x pan-y pinch-zoom' }}
                            />
                            
                            {/* Selection Overlay */}
                            {isSelectionMode && (
                              <div 
                                className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center cursor-pointer"
                                onClick={() => togglePhotoSelection(photo.id)}
                              >
                                {selectedPhotos.includes(photo.id) ? (
                                  <CheckSquare className="w-8 h-8 text-brand-primary" />
                                ) : (
                                  <Square className="w-8 h-8 text-white" />
                                )}
                              </div>
                            )}
                            
                            {/* Photo Controls */}
                            {!isSelectionMode && (
                              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                                  onClick={() => startEditingCaption(photo.id, photo.caption)}
                                >
                                  <Edit2 className="w-3 h-3" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      className="h-8 w-8 p-0 bg-red-500/90 hover:bg-red-600"
                                    >
                                      <Trash2 className="w-3 h-3" />
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
                            )}
                            
                            {/* Caption Overlay */}
                            {photo.caption && !editingCaption && (
                              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-2">
                                <p className="text-sm truncate">{photo.caption}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            <div className="text-center py-8">
              <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No photos in gallery yet</p>
              <Button 
                onClick={handleUploadPhotos}
                className="bg-brand-primary hover:bg-brand-primary-dark text-white"
                disabled={uploading}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Photo
              </Button>
            </div>
          )}

          {/* Guidance for photo ordering */}
          {galleryPhotos.length > 1 && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                💡 <strong>Long-press and drag</strong> to reorder photos. The first four photos (#1-#4) will be used in lost pet flyers. Tap photos to zoom.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gallery PDF Dialog */}
      <Dialog open={isGalleryPDFDialogOpen} onOpenChange={setIsGalleryPDFDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full"></div>
              <span>Photo Gallery PDF</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {!generatedGalleryPdfBlob ? (
              <>
                <p className="text-sm text-gray-600">
                  Generate a professional PDF document featuring all photos from {petData.name}'s gallery.
                </p>
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => handleGalleryPDFAction('view')}
                    disabled={isGeneratingPDF}
                    className="flex-1 border-amber-400 text-amber-600 hover:bg-amber-50 hover:border-amber-500"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View PDF
                  </Button>
                  <Button
                    onClick={() => handleGalleryPDFAction('download')}
                    disabled={isGeneratingPDF}
                    className="flex-1"
                  >
                    {isGeneratingPDF ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                    {isGeneratingPDF ? "Generating..." : "Download PDF"}
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-green-600 mb-4">PDF generated successfully!</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsGalleryPDFDialogOpen(false)}
                    className="flex-1"
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Caption Editing Dialog */}
      {editingCaption && (
        <Dialog open={!!editingCaption} onOpenChange={(open) => !open && cancelEditingCaption()}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Photo Caption</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="caption">Caption</Label>
                <Input
                  id="caption"
                  value={editCaptionValue}
                  onChange={(e) => setEditCaptionValue(e.target.value)}
                  placeholder="Enter a caption for this photo..."
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={cancelEditingCaption}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleSaveCaption(editingCaption)}
                  className="flex-1"
                >
                  Save Caption
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Share Sheet */}
      <Sheet open={isShareSheetOpen} onOpenChange={setIsShareSheetOpen}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center space-x-2">
              <Share2 className="w-5 h-5" />
              <span>Share Photo Gallery</span>
            </SheetTitle>
          </SheetHeader>
          
          <div className="mt-6 space-y-4">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={handleCopyLink}
                variant="outline"
                className="flex items-center justify-center space-x-2"
              >
                <Copy className="w-4 h-4" />
                <span>Copy Link</span>
              </Button>
              <Button
                onClick={handlePreview}
                variant="outline"
                className="flex items-center justify-center space-x-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Preview</span>
              </Button>
            </div>

            {/* Photo Selection */}
            {galleryPhotos.length > 1 && (
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">Photos to share</span>
                  {!isSelectionMode ? (
                    <Button
                      onClick={handleStartSelection}
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                    >
                      Select Photos
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button
                        onClick={selectAllPhotos}
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                      >
                        {selectedPhotos.length === galleryPhotos.length ? 'Clear All' : 'Select All'}
                      </Button>
                      <Button
                        onClick={handleCancelSelection}
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                      >
                        Done
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {isSelectionMode 
                    ? `${selectedPhotos.length} of ${galleryPhotos.length} photos selected`
                    : `Sharing all ${galleryPhotos.length} photos`
                  }
                </p>
              </div>
            )}

            {/* Social Share Buttons */}
            <div className="border-t pt-4">
              <SocialShareButtons
                petName={petData.name}
                petId={petData.id}
                context="gallery"
                compact={true}
                shareUrlOverride={generateShareableUrl()}
              />
            </div>

            {/* Share URL Display */}
            <div className="border-t pt-4">
              <Label className="text-sm font-medium">Share URL</Label>
              <div className="mt-2 p-3 bg-muted rounded-md">
                <p className="text-xs text-muted-foreground break-all">
                  {generateShareableUrl()}
                </p>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Gallery Lightbox */}
      <GalleryLightbox
        photos={galleryPhotos}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={closeLightbox}
      />
    </div>
  );
};