import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Share2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PDFPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  pdfBlob: Blob | null;
  fileName: string;
  petName: string;
  onShare?: () => void;
  onDownload?: () => void;
  title?: string;
}

export const PDFPreviewDialog = ({ 
  isOpen, 
  onClose, 
  pdfBlob, 
  fileName, 
  petName,
  onShare,
  onDownload,
  title = "PDF Preview"
}: PDFPreviewDialogProps) => {
  const { toast } = useToast();
  const [pdfUrl, setPdfUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (pdfBlob && isOpen) {
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
      
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [pdfBlob, isOpen]);

  const handleDownload = () => {
    if (pdfBlob) {
      if (onDownload) {
        onDownload();
      } else {
        // Default download behavior
        const a = document.createElement('a');
        a.href = URL.createObjectURL(pdfBlob);
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
        
        toast({
          title: "Download Started",
          description: `${fileName} is downloading.`,
        });
      }
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare();
    }
  };

  const handleOpenInNewTab = () => {
    if (pdfUrl) {
      // Create a new window/tab with the PDF
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${fileName}</title>
              <style>
                body { margin: 0; padding: 0; }
                iframe { width: 100vw; height: 100vh; border: none; }
              </style>
            </head>
            <body>
              <iframe src="${pdfUrl}" type="application/pdf"></iframe>
            </body>
          </html>
        `);
        newWindow.document.close();
      } else {
        toast({
          title: "Popup Blocked",
          description: "Please allow popups to view PDF in a new tab, or use download instead.",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center justify-between">
            <span>{title}</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenInNewTab}
                className="hidden sm:flex"
              >
                Open in New Tab
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              {onShare && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 min-h-0 bg-muted rounded-lg overflow-hidden">
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              title={`${petName} PDF Preview`}
              className="w-full h-full border-0"
              style={{ minHeight: '500px' }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <p>Loading PDF preview...</p>
                <p className="text-sm mt-2">If the preview doesn't load, try downloading the PDF instead.</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};