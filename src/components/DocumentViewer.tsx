import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink } from "lucide-react";

interface DocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  documentUrl: string;
  documentName: string;
}

export const DocumentViewer = ({ 
  isOpen, 
  onClose, 
  documentUrl, 
  documentName 
}: DocumentViewerProps) => {
  const isPDF = documentUrl.toLowerCase().includes('.pdf');
  
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = documentUrl;
    link.download = documentName;
    link.click();
  };

  const handleOpenNewTab = () => {
    window.open(documentUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="truncate">{documentName}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm" onClick={handleOpenNewTab}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in New Tab
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 min-h-0">
          {isPDF ? (
            <iframe
              src={documentUrl}
              className="w-full h-full border-0 rounded"
              title={documentName}
              style={{ minHeight: '400px' }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded">
              <img 
                src={documentUrl} 
                alt={documentName}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
