import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Upload, Download, Plus, Eye } from "lucide-react";
import { useState } from "react";

interface GalleryPhoto {
  url: string;
  caption: string;
}

interface PetGallerySectionProps {
  petData: {
    name: string;
    galleryPhotos?: GalleryPhoto[];
  };
}

export const PetGallerySection = ({ petData }: PetGallerySectionProps) => {
  const [capturedPhotos, setCapturedPhotos] = useState<File[]>([]);

  const handleUploadPhoto = () => {
    console.log("Opening photo upload dialog...");
    // Photo upload would be implemented here
  };

  const handleDownloadGallery = () => {
    console.log("Downloading gallery as PDF...");
    // PDF generation would be implemented here
  };

  const handleCapturePhoto = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        console.log("Gallery photo captured:", file.name);
        setCapturedPhotos(prev => [...prev, file]);
        // Here you would typically upload the photo to your gallery
        // For now, we'll just add it to the local state
      }
    };
    
    input.click();
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
              <Button onClick={handleUploadPhoto} variant="secondary" size="sm" className="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm">
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Add Photo</span>
                <span className="sm:hidden">Add</span>
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
            onClick={handleUploadPhoto}
          >
            <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Click to upload photos or drag and drop</p>
            <p className="text-sm text-gray-500 mb-4">Supports JPG, PNG, HEIC up to 10MB each</p>
            <div className="flex justify-center space-x-2 sm:space-x-3">
              <Button 
                className="bg-gradient-to-r from-navy-900 to-navy-800 text-gold-500 border border-gold-500/30 px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUploadPhoto();
                }}
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Choose Files</span>
                <span className="sm:hidden">Upload</span>
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white border-0 px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCapturePhoto();
                }}
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
              <Badge variant="outline" className="border-navy-800 text-navy-800 text-xs px-2 py-1">
                {(petData.galleryPhotos?.length || 0) + capturedPhotos.length} Photos
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {((petData.galleryPhotos && petData.galleryPhotos.length > 0) || capturedPhotos.length > 0) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Existing gallery photos */}
              {petData.galleryPhotos?.map((photo, index) => (
                <div key={`existing-${index}`} className="space-y-3">
                  <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 shadow-md hover:shadow-lg transition-shadow">
                    <img 
                      src={photo.url} 
                      alt={`${petData.name} gallery photo ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-700 font-medium">Photo {index + 1}</p>
                    <p className="text-sm text-gray-600 mt-1">{photo.caption}</p>
                  </div>
                </div>
              ))}
              
              {/* Newly captured photos */}
              {capturedPhotos.map((photo, index) => (
                <div key={`captured-${index}`} className="space-y-3">
                  <div className="aspect-square rounded-lg overflow-hidden border-2 border-green-400 shadow-md hover:shadow-lg transition-shadow">
                    <img 
                      src={URL.createObjectURL(photo)} 
                      alt={`${petData.name} captured photo ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <p className="text-sm text-green-700 font-medium flex items-center">
                      <Camera className="w-4 h-4 mr-2" />
                      New Capture {index + 1}
                    </p>
                    <p className="text-xs text-green-600 mt-1">Ready to save</p>
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
                  onClick={handleUploadPhoto}
                  className="bg-gradient-to-r from-navy-900 to-navy-800 text-gold-500 border border-gold-500/30 px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Upload First Photo</span>
                  <span className="sm:hidden">Upload</span>
                </Button>
                <Button 
                  onClick={handleCapturePhoto}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm"
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
