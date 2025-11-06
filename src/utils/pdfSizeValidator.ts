import { toast } from '@/hooks/use-toast';

const MAX_PDF_SIZE_MB = 8; // Safe threshold accounting for base64 overhead
const MAX_PDF_SIZE_BYTES = MAX_PDF_SIZE_MB * 1024 * 1024;

export interface PDFSizeValidationResult {
  isValid: boolean;
  sizeInMB: number;
  exceedsLimit: boolean;
}

export const validatePDFSize = (blob: Blob): PDFSizeValidationResult => {
  const sizeInMB = blob.size / (1024 * 1024);
  const exceedsLimit = blob.size > MAX_PDF_SIZE_BYTES;
  
  return {
    isValid: !exceedsLimit,
    sizeInMB: parseFloat(sizeInMB.toFixed(2)),
    exceedsLimit
  };
};

export const showPDFSizeError = (sizeInMB: number): void => {
  toast({
    title: "File Too Large for Email",
    description: `This PDF is ${sizeInMB}MB. Files over 8MB cannot be emailed. Please download and share manually.`,
    variant: "destructive",
    duration: 8000
  });
};
