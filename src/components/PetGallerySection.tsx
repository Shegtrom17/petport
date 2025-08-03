import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Camera, Upload, Download, Plus, Eye, Trash2, Edit2, X } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { uploadGalleryPhoto, uploadMultipleGalleryPhotos, deleteGalleryPhoto, updateGalleryPhotoCaption } from "@/services/petService";

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
  const { toast } = useToast();

  const galleryPhotos = petData.gallery_photos || [];
  const remainingSlots = MAX_GALLERY_PHOTOS - galleryPhotos.length;
  const isLimitReached = galleryPhotos.length >= MAX_GALLERY_PHOTOS;

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

      // Limit files to remaining slots
      const filesToUpload = files.slice(0, remainingSlots);
      if (files.length > remainingSlots) {
        toast({
          title: `Limited to ${remainingSlots} photos`,
          description: `Only uploading ${remainingSlots} out of ${files.length} selected photos due to ${MAX_GALLERY_PHOTOS} photo limit.`,
        });
      }

      setUploading(true);
      try {
        const result = await uploadMultipleGalleryPhotos(petData.id, filesToUpload);
        
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
        const success = await uploadGalleryPhoto(petData.id, file, `Captured on ${new Date().toLocaleDateString()}`);
        
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

  const handleDownloadGallery = () => {
    toast({
      title: "Feature coming soon",
      description: "Gallery PDF export will be available soon",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with guidance */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-navy-900 to-navy-800 text-white">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-3 flex-1">
              <Camera className="w-8 h-8 text-yellow-400" />
              <div>
                <h2 className="text-2xl font-bold mb-2">Pet Photo Gallery</h2>
                <p className="text-blue-100 text-sm leading-relaxed">
                  Upload clear photos that show your pet's unique markings, size, or special features. 
                  These help hosts, vets, and rescuers identify your pet quickly and accurately.
                </p>
              </div>
            </div>
            <div className="flex space-x-1 sm:space-x-2">
              <Button 
                onClick={handleUploadPhotos} 
                variant="secondary" 
                size="sm" 
                className="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm"
                disabled={uploading || isLimitReached}
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{uploading ? "Uploading..." : "Add Photos"}</span>
                <span className="sm:hidden">{uploading ? "..." : "Add"}</span>
              </Button>
              <Button onClick={handleDownloadGallery} variant="secondary" size="sm" className="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm">
                <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Download PDF</span>
                <span className="sm:hidden">PDF</span>
              </Button>
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
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-blue-600" />
                <span>{petData.name}'s Photo Gallery</span>
              </div>
              <Badge 
                variant={isLimitReached ? "destructive" : "outline"} 
                className={isLimitReached ? "text-xs px-2 py-1" : "border-navy-800 text-navy-800 text-xs px-2 py-1"}
              >
                {galleryPhotos.length}/{MAX_GALLERY_PHOTOS} Photos
              </Badge>
            </div>
          </CardTitle>
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
    </div>
  );
};
