
import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Upload, Download, Eye, Trash2, Loader2, Camera, Shield, Syringe, Receipt, Heart, FileArchive, FolderOpen, IdCard, Plane, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { DocumentShareDialog } from "@/components/DocumentShareDialog";
import { DocumentViewer } from "@/components/DocumentViewer";
import { useOverlayStore } from "@/stores/overlayStore";

// Helper to save current tab before risky actions
const saveLastTab = async () => {
  localStorage.setItem('pp_last_tab_last', 'documents');
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) {
      localStorage.setItem(`pp_last_tab_${user.id}`, 'documents');
    }
  } catch {}
};


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
  petName: string; // Add pet name prop
  documents: Document[];
  onDocumentDeleted: () => void;
}

const DOCUMENT_CATEGORIES = [
  { value: 'insurance', label: 'Insurance', icon: Shield },
  { value: 'vaccinations', label: 'Vaccinations', icon: Syringe },
  { value: 'medical', label: 'Medical Records', icon: Heart },
  { value: 'medication', label: 'Medication', icon: FileText },
  { value: 'invoices', label: 'Invoices', icon: Receipt },
  { value: 'registrations', label: 'Registrations', icon: IdCard },
  { value: 'travel_docs', label: 'Travel Docs', icon: Plane },
  { value: 'misc', label: 'Misc/Other', icon: FolderOpen },
];

const getCategoryInfo = (category: string) => {
  return (
    DOCUMENT_CATEGORIES.find((cat) => cat.value === category) ||
    DOCUMENT_CATEGORIES.find((cat) => cat.value === 'misc')!
  );
};

export const DocumentsSection = ({ petId, petName, documents, onDocumentDeleted }: DocumentsSectionProps) => {
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);
  const [viewingDocId, setViewingDocId] = useState<string | null>(null);
  const [shareDialogDoc, setShareDialogDoc] = useState<Document | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('misc');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [viewerDocument, setViewerDocument] = useState<Document | null>(null);
  const { toast } = useToast();
  const overlayStore = useOverlayStore();
  
  // Refs for the hidden file inputs
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Detect Android for special handling
  const isAndroid = /Android/i.test(navigator.userAgent);

  const handleViewDocument = async (doc: Document, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
    saveLastTab();
    setViewingDocId(doc.id);
    
    try {
      // First, try to open in new window (best experience)
      const newWindow = window.open(doc.file_url, '_blank', 'noopener,noreferrer');
      
      // If popup is blocked or fails, use inline viewer as fallback
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        console.log('Popup blocked - using inline viewer fallback');
        setViewerDocument(doc);
        toast({
          title: "Opening Document",
          description: "Popup blocked. Opening in viewer...",
        });
      } else {
        toast({
          title: "Success",
          description: `Opening ${doc.name}...`,
        });
      }
    } catch (error) {
      console.error("Error viewing document:", error);
      // Fallback to inline viewer on any error
      setViewerDocument(doc);
      toast({
        title: "Opening in Viewer",
        description: "Opening document in modal viewer.",
      });
    } finally {
      setViewingDocId(null);
    }
  };

  const handleDeleteDocument = async (doc: Document, e?: React.MouseEvent) => {
    // Prevent event propagation to avoid swipe navigation
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
    await saveLastTab(); // Save tab before deletion
    
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
      
      // Allow UI to refresh before triggering parent re-render
      setTimeout(() => {
        onDocumentDeleted(); // Call on all platforms
      }, 300);
      
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

  const handleShareDocument = (doc: Document, e?: React.MouseEvent) => {
    // Prevent event propagation to avoid swipe navigation
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
    console.log("Opening share dialog for document:", doc.name);
    setShareDialogDoc(doc);
  };

  const handleCameraCapture = (e?: React.MouseEvent) => {
    // Prevent event propagation to avoid swipe navigation
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const handleFileUpload = (e?: React.MouseEvent) => {
    // Prevent event propagation to avoid swipe navigation
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDocumentCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await saveLastTab(); // Save tab before upload
      await uploadDocument(file, 'camera-capture');
    }
    // Reset the input - longer delay on Android
    if (cameraInputRef.current) {
      if (isAndroid) {
        setTimeout(() => {
          if (cameraInputRef.current) cameraInputRef.current.value = '';
        }, 300);
      } else {
        cameraInputRef.current.value = '';
      }
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    // Stop event propagation to prevent swipe navigation
    event.stopPropagation();
    event.preventDefault();
    
    const file = event.target.files?.[0];
    if (file) {
      console.log('[File Select] Selected file:', {
        name: file.name,
        size: file.size,
        type: file.type,
        isAndroid,
        possibleDriveUri: isAndroid && file.size === 0
      });
      await saveLastTab(); // Save tab before upload
      await uploadDocument(file, 'file-upload');
    }
    // Reset the input - longer delay on Android
    if (fileInputRef.current) {
      if (isAndroid) {
        setTimeout(() => {
          if (fileInputRef.current) fileInputRef.current.value = '';
        }, 300);
      } else {
        fileInputRef.current.value = '';
      }
    }
  };

  // Helper function to detect Android Drive URIs and guide user
  const resolveFileForUpload = async (file: File): Promise<Blob> => {
    // On Android, detect Drive/cloud files immediately
    if (isAndroid && file.size === 0) {
      console.log('[Android] Cloud storage file detected - cannot access directly');
      
      // Show helpful guidance immediately
      toast({
        title: "Cloud File Detected",
        description: "This file is stored in Google Drive. Please download it to your device first, then upload from your Downloads folder.",
        variant: "destructive",
        duration: 8000,
      });
      
      // Throw specific error to stop upload process
      throw new Error('CLOUD_FILE_DETECTED');
    }
    
    return file;
  };

  const uploadDocument = async (file: File, source: string) => {
    await saveLastTab(); // Save tab before upload
    setIsUploading(true);
    document.body.setAttribute("data-uploading", "true");
    
    try {
      console.log(`Uploading document from ${source}:`, file.name, 'Category:', selectedCategory);
      
      // Resolve file content (handles Android Drive URIs)
      const fileToUpload = await resolveFileForUpload(file);
      
      // Check if file is empty after resolution
      if (fileToUpload.size === 0) {
        throw new Error('File is empty or could not be read');
      }
      
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${petId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('pet_documents')
        .upload(fileName, fileToUpload);
      
      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('pet_documents')
        .getPublicUrl(fileName);
      
      // Save document record to database with category
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          pet_id: petId,
          name: file.name,
          type: selectedCategory, // Store category instead of MIME type
          file_url: publicUrl,
          size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
          upload_date: new Date().toLocaleDateString()
        });
      
      if (dbError) {
        console.error("Database error:", dbError);
        throw dbError;
      }
      
      const categoryLabel = getCategoryInfo(selectedCategory).label;
      toast({
        title: "Success",
        description: `Document "${file.name}" uploaded to ${categoryLabel} successfully!`,
      });
      
      // Save current tab before refresh to prevent redirect
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        localStorage.setItem(`pp_last_tab_${user.id}`, 'documents');
      }
      
      onDocumentDeleted(); // Refresh the document list on all platforms
      
    } catch (error: any) {
      console.error("Error uploading document:", error);
      
      // Don't show generic error for cloud files - specific toast already shown
      if (error instanceof Error && error.message === 'CLOUD_FILE_DETECTED') {
        return;
      }
      
      toast({
        variant: "destructive",
        title: "Upload Error",
        description: error instanceof Error ? error.message : "Failed to upload document. Please try again.",
      });
    } finally {
      setIsUploading(false);
      document.body.removeAttribute("data-uploading");
    }
  };

  // Filter documents based on selected filter
  const filteredDocuments = filterCategory === 'all' 
    ? documents 
    : documents.filter(doc => doc.type === filterCategory);

  return (
    <div className="space-y-6">

      {/* Privacy Info */}
      <Card className="border-0 shadow-lg bg-green-50 border-l-4 border-green-500">
        <CardContent className="p-4">
          <p className="text-green-800 text-sm font-medium">
            🔒 <strong>Privacy Note:</strong> Documents are always private regardless of your profile visibility setting. Only you can view and manage your pet's documents.
          </p>
        </CardContent>
      </Card>

      {/* Upload Section */}
      <Card className="border-0 shadow-lg bg-passport-section-bg backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="w-5 h-5 text-brand-primary" />
            <span>Upload Documents or Capture Doc Photos</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-muted rounded-lg p-4 md:p-8 text-center bg-muted/30">
            <Upload className="w-8 h-8 md:w-12 md:h-12 text-brand-primary mx-auto mb-2 md:mb-4" />
            <p className="text-base md:text-lg font-medium text-gray-700 mb-2">
              Capture or upload documents
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Supported formats: PDF, JPG, PNG (Max 10MB)
            </p>
            
            {/* Category Selection */}
            <div className="mb-6 max-w-xs mx-auto" data-touch-safe>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Category
              </label>
              <Select 
                value={selectedCategory} 
                onValueChange={setSelectedCategory}
                onOpenChange={(open) => {
                  if (open) overlayStore.open();
                  else overlayStore.close();
                }}
              >
                <SelectTrigger className="w-full bg-white border-border" data-touch-safe>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-white border-border z-50" data-touch-safe>
                  {DOCUMENT_CATEGORIES.map((category) => {
                    const IconComponent = category.icon;
                    return (
                      <SelectItem key={category.value} value={category.value}>
                        <div className="flex items-center gap-2">
                          <IconComponent className="w-4 h-4" />
                          {category.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            
            {/* Hidden file inputs */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/jpeg,image/png"
              capture="environment"
              onChange={handleDocumentCapture}
              onClick={(e) => e.stopPropagation()}
              className="hidden"
              data-touch-safe
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={handleFileSelect}
              onClick={(e) => e.stopPropagation()}
              className="hidden"
              data-touch-safe
            />
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={(e) => handleCameraCapture(e)}
                disabled={isUploading}
                className="bg-brand-primary hover:bg-brand-primary-dark text-white border border-white/20"
                data-touch-safe
              >
                <Camera className="w-4 h-4 mr-2" />
                {isUploading ? "Uploading..." : "Capture Photo"}
              </Button>
              <Button 
                onClick={(e) => handleFileUpload(e)}
                disabled={isUploading}
                className="bg-[#5691af] hover:bg-[#4a7d99] text-white border-0 text-sm"
                data-touch-safe
              >
                <Upload className="w-4 h-4 mr-2" />
                {isUploading ? "Uploading..." : "Upload Document"}
              </Button>
            </div>
            
            <div className="text-xs mt-3 px-4 text-center space-y-1">
              <p className="text-gray-500">
                Tip: Use "Upload Document" for PDFs or files from Drive, and "Capture Photo" for pictures of receipts or records.
              </p>
              <p className="text-amber-600 dark:text-amber-400 font-medium">
                📱 Android users: Files from Google Drive must be downloaded to your device first, then uploaded from Downloads.
              </p>
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
          <CardTitle className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <span>Stored Documents</span>
            <div className="flex items-center gap-2 w-full sm:w-auto" data-touch-safe>
              <label className="text-sm font-medium text-gray-700">Filter:</label>
              <Select 
                value={filterCategory} 
                onValueChange={setFilterCategory}
                onOpenChange={(open) => {
                  if (open) overlayStore.open();
                  else overlayStore.close();
                }}
              >
                <SelectTrigger className="flex-1 sm:w-40 bg-white border-border" data-touch-safe>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-border z-50" data-touch-safe>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <FileArchive className="w-4 h-4" />
                      All Categories
                    </div>
                  </SelectItem>
                  {DOCUMENT_CATEGORIES.map((category) => {
                    const IconComponent = category.icon;
                    return (
                      <SelectItem key={category.value} value={category.value}>
                        <div className="flex items-center gap-2">
                          <IconComponent className="w-4 h-4" />
                          {category.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>
                  {documents.length === 0 
                    ? "No documents uploaded yet" 
                    : filterCategory === 'all' 
                      ? "No documents found"
                      : `No ${getCategoryInfo(filterCategory).label.toLowerCase()} documents found`
                  }
                </p>
                <p className="text-sm">
                  {documents.length === 0 
                    ? "Use the camera or file upload above to add documents"
                    : "Try a different category filter"
                  }
                </p>
              </div>
            ) : (
              filteredDocuments.map((doc) => {
                const categoryInfo = getCategoryInfo(doc.type);
                const IconComponent = categoryInfo.icon;
                return (
                <div
                  key={doc.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors gap-3 sm:gap-0"
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-5 h-5 text-brand-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 truncate">{doc.name}</p>
                        <span className="px-2 py-1 text-xs bg-muted text-foreground rounded-full flex-shrink-0">
                          {categoryInfo.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {doc.size} • Uploaded {doc.upload_date}
                      </p>
                    </div>
                  </div>
                   <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0" data-touch-safe>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="hover:bg-muted text-foreground px-1 sm:px-2 text-xs sm:text-sm"
                      onClick={(e) => handleViewDocument(doc, e)}
                      disabled={viewingDocId === doc.id}
                      title="View document"
                      data-touch-safe
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
                      className="hover:bg-muted text-foreground px-1 sm:px-2 text-xs sm:text-sm"
                      onClick={async (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        await saveLastTab(); // Save tab before download
                        const link = document.createElement('a');
                        link.href = doc.file_url;
                        link.download = doc.name;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      title="Download document"
                      data-touch-safe
                    >
                      <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="hover:bg-muted text-foreground px-1 sm:px-2 text-xs sm:text-sm"
                      onClick={(e) => handleShareDocument(doc, e)}
                      title="Share document"
                      data-touch-safe
                    >
                      <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="hover:bg-red-50 text-red-600 px-1 sm:px-2 text-xs sm:text-sm"
                      onClick={(e) => handleDeleteDocument(doc, e)}
                      disabled={deletingDocId === doc.id}
                      data-touch-safe
                    >
                      {deletingDocId === doc.id ? (
                        <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      )}
                    </Button>
                  </div>
                </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Document Share Dialog */}
      {shareDialogDoc && (
        <DocumentShareDialog
          document={shareDialogDoc}
          petName={petName}
          petId={petId}
          isOpen={!!shareDialogDoc}
          onClose={() => setShareDialogDoc(null)}
        />
      )}

      {/* Document Viewer Modal - Popup blocker fallback */}
      {viewerDocument && (
        <DocumentViewer
          isOpen={!!viewerDocument}
          onClose={() => setViewerDocument(null)}
          documentUrl={viewerDocument.file_url}
          documentName={viewerDocument.name}
        />
      )}
    </div>
  );
};
