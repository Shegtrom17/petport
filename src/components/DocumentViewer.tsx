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
  const safeUrl = documentUrl ?? '';
  const isPDF = safeUrl.toLowerCase().includes('.pdf');
  
  const handleDownload = () => {
    if (!safeUrl) return;
    const link = document.createElement('a');
    link.href = safeUrl;
    link.download = documentName || 'document';
    link.click();
  };

const handleOpenNewTab = () => {
  if (!safeUrl) return;
  window.open(safeUrl, '_blank', 'noopener,noreferrer');
};

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] h-[95vh] md:h-[90vh] flex flex-col p-3 md:p-6">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <span className="truncate text-sm md:text-base">{documentName}</span>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm" onClick={handleOpenNewTab}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Open
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 min-h-0 overflow-auto">
{isPDF ? (
            <object
              data={safeUrl}
              type="application/pdf"
              className="w-full h-full min-h-[600px] md:min-h-[500px]"
              title={documentName}
            >
              <iframe
                src={safeUrl}
                className="w-full h-full min-h-[600px] md:min-h-[500px] border-0"
                title={documentName}
              />
            </object>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted rounded">
              <img 
                src={safeUrl} 
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
