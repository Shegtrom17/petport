# 🔒 SHARE + PDF HUB BACKUP (Oct 2025)
This document lists the working files and functions before merging QuickShareHub and PetPDFGenerator.

## Core Files
- src/components/QuickShareHub.tsx (731 lines)
- src/components/PetPDFGenerator.tsx (788 lines)
- src/services/clientPdfService.ts (1,945 lines)
- src/services/pdfService.ts (423 lines)
- src/utils/appSharing.ts (78 lines)
- src/utils/domainUtils.ts

## Critical Functions
- generateShareURL()
- generatePublicProfileUrl()
- generatePublicMissingUrl()
- generatePublicCareUrl()
- sharePDFBlob()
- generateClientPetPDF()

## Key Implementation Details

### URL Generation Strategy
- **Direct URLs**: Used for Copy, SMS, Email (better UX for humans)
- **Edge Function URLs**: Used for Facebook, Messenger (better OG tags for social platforms)
- **Domain-aware**: Uses `generateShareURL()` from domainUtils.ts

### PDF Sharing Flow
1. Try Web Share API with file sharing (mobile)
2. Fallback to storage upload + signed URL
3. Final fallback to temporary download URL

### QuickShareHub Pages
- Emergency Profile (`/emergency/${petId}`)
- Care & Handling (`/care/${petId}`)
- Pet Resume (`/resume/${petId}`)
- Portrait Gallery (`/gallery/${petId}`)
- General Profile (`/profile/${petId}`)
- Lost Pet Flyer (`/missing-pet/${petId}`)

### PetPDFGenerator Types
- Emergency Profile (always available)
- General Profile (always available)
- Care & Handling (conditional on care data)
- Pet Resume (conditional on resume data)
- Lost Pet Flyer (always available)
- Portrait Gallery (conditional on gallery photos)

⚠️ **If links or PDFs stop working after merge, restore these files from this commit or the previous working state.**

---

**Last verified working:** Before QuickShareHub + PetPDFGenerator merge  
**Created:** 2025-10-10
