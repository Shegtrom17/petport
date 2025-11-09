import React from 'react';
import QRCode from 'react-qr-code';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Download } from 'lucide-react';
import { shareQRCode } from '@/utils/qrShare';

interface PublicPageQRCodeProps {
  url: string;
  petName: string;
  pageType: string;
  color?: string;
  title?: string;
  description?: string;
}

export const PublicPageQRCode: React.FC<PublicPageQRCodeProps> = ({
  url,
  petName,
  pageType,
  color = '#000000',
  title,
  description
}) => {
  const handleShareQR = () => {
    shareQRCode(url, petName, pageType, color);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-center flex items-center justify-center gap-2">
          <QrCode className="h-5 w-5" />
          {title || `Scan to View ${petName}'s ${pageType}`}
        </CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground text-center mt-2">
            {description}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <div className="bg-white p-4 rounded-lg shadow-inner border-2 border-gray-200">
            <QRCode 
              value={url} 
              size={200}
              fgColor={color}
              bgColor="#ffffff"
            />
          </div>
        </div>
        
        <div className="flex justify-center">
          <Button
            onClick={handleShareQR}
            variant="outline"
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Share QR Code
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
