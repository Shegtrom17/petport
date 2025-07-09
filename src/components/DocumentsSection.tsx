
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Download, Eye, Trash2, Loader2 } from "lucide-react";
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
  const { toast } = useToast();

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
              Drag and drop files here, or click to browse
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Supported formats: PDF, JPG, PNG (Max 10MB)
            </p>
            <Button className="bg-gradient-to-r from-navy-900 to-navy-800 text-gold-500 hover:from-navy-800 hover:to-navy-700 border border-gold-500/30 w-full sm:w-auto">
              Choose Files
            </Button>
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
            {documents.map((doc) => (
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
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <Button variant="ghost" size="sm" className="hover:bg-navy-50 text-navy-800">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="hover:bg-navy-50 text-navy-800">
                    <Download className="w-4 h-4" />
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
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
