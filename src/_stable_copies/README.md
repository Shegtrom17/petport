# Stable Copies Folder
This folder holds the last-known working versions of critical files.

Files verified Oct 2025:
- imageCompression.ts ✅
- PetGallerySection.tsx (next for inspection)
- PetProfileCard.tsx (next for inspection)

### 1️⃣ /src/supabase/index.html

<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">

Must remain exactly as written. 
Do NOT add user-scalable=no or maximum-scale. 
Those trigger tiny fonts, screen jumps, and zoom blow-ups on iOS.
