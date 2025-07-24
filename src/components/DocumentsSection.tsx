
import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Download, Eye, Trash2, Loader2, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Document {
  id: string;
  name: string;
  type: string;
  upload_date: string;
  size: string;
  file_url: string;
}

interface DocumentsSectionProps {
  petId: string;
  documents: Document[];
  onDocumentDeleted: () => void;
}

export const DocumentsSection = ({ petId, documents, onDocumentDeleted }: DocumentsSectionProps) => {
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);
  const [viewingDocId, setViewingDocId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  
  // Refs for the hidden file inputs
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleViewDocument = async (doc: Document) => {
    setViewingDocId(doc.id);
    
    try {
      // Open document in new tab
      const newWindow = window.open(doc.file_url, '_blank');
      
      if (!newWindow) {
        throw new Error('Popup blocked or failed to open');
      }
      
      toast({
        title: "Success",
        description: `Opening ${doc.name}...`,
      });
      
    } catch (error) {
      console.error("Error viewing document:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to open document. Please try again.",
      });
    } finally {
      setViewingDocId(null);
    }
  };

  const handleDeleteDocument = async (doc: Document) => {
    setDeletingDocId(doc.id);
    
    try {
      console.log("Deleting document:", doc.name, "ID:", doc.id);
      
      // First, delete the file from storage
      const fileName = doc.file_url.split('/').pop();
      if (fileName) {
        console.log("Deleting file from storage:", fileName);
        const { error: storageError } = await supabase.storage
          .from('pet_documents')
          .remove([fileName]);
        
        if (storageError) {
          console.error("Storage deletion error:", storageError);
          // Continue with database deletion even if storage fails
        }
      }
      
      // Then delete the record from the database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', doc.id);
      
      if (dbError) {
        console.error("Database deletion error:", dbError);
        throw dbError;
      }
      
      toast({
        title: "Success",
        description: `${doc.name} has been deleted successfully.`,
      });
      
      onDocumentDeleted();
      
    } catch (error) {
      console.error("Error deleting document:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete document. Please try again.",
      });
    } finally {
      setDeletingDocId(null);
    }
  };

  const handleCameraCapture = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const handleFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDocumentCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await uploadDocument(file, 'camera-capture');
    }
    // Reset the input
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await uploadDocument(file, 'file-upload');
    }
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadDocument = async (file: File, source: string) => {
    setIsUploading(true);
    
    try {
      console.log(`Uploading document from ${source}:`, file.name);
      
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${petId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('pet_documents')
        .upload(fileName, file);
      
      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('pet_documents')
        .getPublicUrl(fileName);
      
      // Save document record to database
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          pet_id: petId,
          name: file.name,
          type: file.type || 'application/octet-stream',
          file_url: publicUrl,
          size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
          upload_date: new Date().toLocaleDateString()
        });
      
      if (dbError) {
        console.error("Database error:", dbError);
        throw dbError;
      }
      
      toast({
        title: "Success",
        description: `Document "${file.name}" uploaded successfully!`,
      });
      
      onDocumentDeleted(); // Refresh the document list
      
    } catch (error) {
      console.error("Error uploading document:", error);
      toast({
        variant: "destructive",
        title: "Upload Error",
        description: "Failed to upload document. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="border-0 shadow-lg bg-passport-section-bg backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="w-5 h-5 text-navy-900" />
            <span>Upload Documents</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-navy-300 rounded-lg p-4 md:p-8 text-center bg-navy-50/50">
            <Upload className="w-8 h-8 md:w-12 md:h-12 text-navy-600 mx-auto mb-2 md:mb-4" />
            <p className="text-base md:text-lg font-medium text-gray-700 mb-2">
              Capture or upload documents
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Supported formats: PDF, JPG, PNG (Max 10MB)
            </p>
            
            {/* Hidden file inputs */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleDocumentCapture}
              className="hidden"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={handleCameraCapture}
                disabled={isUploading}
                className="bg-gradient-to-r from-navy-900 to-navy-800 text-gold-500 hover:from-navy-800 hover:to-navy-700 border border-gold-500/30"
              >
                <Camera className="w-4 h-4 mr-2" />
                {isUploading ? "Uploading..." : "📸 Capture Photo"}
              </Button>
              <Button 
                onClick={handleFileUpload}
                disabled={isUploading}
                variant="outline"
                className="border-navy-300 text-navy-700 hover:bg-navy-50"
              >
                <Upload className="w-4 h-4 mr-2" />
                {isUploading ? "Uploading..." : "Choose Files"}
              </Button>
            </div>
            
            {isUploading && (
              <div className="mt-4 flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span className="text-sm text-gray-600">Uploading document...</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Document List */}
      <Card className="border-0 shadow-lg bg-passport-section-bg backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-navy-900" />
            <span>Stored Documents</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {documents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No documents uploaded yet</p>
                <p className="text-sm">Use the camera or file upload above to add documents</p>
              </div>
            ) : (
              documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors gap-3 sm:gap-0"
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate">{doc.name}</p>
                      <p className="text-sm text-gray-500 truncate">
                        {doc.type} • {doc.size} • Uploaded {doc.upload_date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="hover:bg-navy-50 text-navy-800 px-1 sm:px-2 text-xs sm:text-sm"
                      onClick={() => handleViewDocument(doc)}
                      disabled={viewingDocId === doc.id}
                    >
                      {viewingDocId === doc.id ? (
                        <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                      ) : (
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                      )}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="hover:bg-navy-50 text-navy-800 px-1 sm:px-2 text-xs sm:text-sm"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = doc.file_url;
                        link.download = doc.name;
                        link.click();
                      }}
                    >
                      <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="hover:bg-red-50 text-red-600"
                      onClick={() => handleDeleteDocument(doc)}
                      disabled={deletingDocId === doc.id}
                    >
                      {deletingDocId === doc.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
