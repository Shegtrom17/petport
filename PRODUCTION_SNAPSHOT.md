# PetPort Production Snapshot
**Date:** 2025-10-21  
**Status:** ✅ All Systems Operational  
**Purpose:** Preserve current working state before future feature additions

---

## 🎯 Critical Systems Overview

### ✅ Working Features
- OG image generation and social media previews
- PDF generation (client-side via pdf-lib)
- QuickShare Hub functionality
- Email relay via Postmark
- Stripe billing integration
- Cloudflare R2 storage for OG images
- Public link routing
- Contact forms and message relay
- QR code generation
- Missing pet alerts
- Authentication and RLS policies

---

## 🔌 External Integrations

### Cloudflare R2 Storage
**Purpose:** OG image storage for social media previews  
**Domain:** petport.app  
**Bucket:** Configured for OG images  
**Status:** ✅ Active

**Edge Function:** `upload-og-image`
- Location: `supabase/functions/upload-og-image/index.ts`
- Secrets Required: `CLOUDFLARE_R2_*` (configured)
- References: Used by share functions

### Postmark Email Service
**Purpose:** Transactional emails and contact relay  
**Status:** ✅ Active  
**Secrets:**
- `POSTMARK_API_KEY` ✓
- `POSTMARK_BROADCAST_STREAM` ✓

**Edge Functions Using Postmark:**
- `send-email` - General email sending
- `send-relay-email` - Contact form relay (verify_jwt: false)
- `receive-email` - Inbound email handling
- `emergency-share` - Emergency contact notifications
- `missing-pet-share` - Lost pet alerts
- `care-instructions-share` - Care info sharing
- `profile-share` - Profile sharing
- `resume-share` - Resume/credentials sharing
- `travel-share` - Travel map sharing
- `gallery-share` - Gallery sharing

### Stripe Payment Integration
**Purpose:** Subscription management and billing  
**Status:** ✅ Active  
**Secrets:**
- `STRIPE_SECRET_KEY` ✓
- `STRIPE_SECRET_KEY_TEST` ✓
- `STRIPE_WEBHOOK_SECRET` ✓

**Edge Functions Using Stripe:**
- `create-checkout` - Checkout session creation
- `create-payment` - Payment processing
- `create-setup-intent` - Payment method setup
- `customer-portal` - Customer self-service portal
- `purchase-addons` - Additional pet slots
- `verify-checkout` - Checkout verification
- `stripe-webhook` - Webhook event handling
- `stripe-connect-onboard` - Connect onboarding
- `stripe-connect-status` - Connect status check
- `public-create-checkout` - Public checkout (no auth)

### Supabase Configuration
**Project ID:** `dxghbhujugsfmaecilrq`  
**URL:** `https://dxghbhujugsfmaecilrq.supabase.co`  
**Status:** ✅ Active

**Storage Buckets:**
- `pet_photos` (public) - Pet profile images
- `pet_documents` (public) - Document uploads
- `pet_pdfs` (public) - Generated PDFs
- `shared_exports` (private) - Temporary exports
- `og-images` (public) - OG image fallback (note: Cloudflare R2 is primary)

---

## 📡 Edge Functions Inventory

### Share Functions (All verify_jwt: false for public access)
| Function | Purpose | Auth Required |
|----------|---------|---------------|
| `profile-share` | Generate OG image for profile sharing | No |
| `emergency-share` | Emergency contact sharing | No |
| `missing-pet-share` | Lost pet alert sharing | No |
| `care-instructions-share` | Care info sharing | No |
| `resume-share` | Credentials sharing | No |
| `travel-share` | Travel map sharing | No |
| `gallery-share` | Gallery sharing | No |
| `upload-og-image` | Upload to Cloudflare R2 | No |

### AI Assistant Functions (All verify_jwt: true)
| Function | Purpose | Auth Required |
|----------|---------|---------------|
| `bio-assistant` | AI bio generation | Yes |
| `care-assistant` | AI care instructions | Yes |
| `medical-assistant` | AI medical info | Yes |
| `travel-assistant` | AI travel suggestions | Yes |
| `transcribe-audio` | Audio transcription | Yes |

### Payment Functions
| Function | Purpose | Auth Required |
|----------|---------|---------------|
| `check-subscription` | Verify subscription status | Yes |
| `create-checkout` | Create checkout session | Yes |
| `public-create-checkout` | Public checkout (referrals) | No |
| `verify-checkout` | Verify checkout completion | Yes |
| `purchase-addons` | Buy additional pet slots | Yes |
| `verify-addons` | Verify addon purchase | Yes |
| `customer-portal` | Stripe customer portal | Yes |
| `stripe-webhook` | Process Stripe events | No |

### System Functions
| Function | Purpose | Auth Required |
|----------|---------|---------------|
| `generate-pet-pdf` | PDF generation (DISABLED - uses client-side) | No |
| `transfer-pet` | Transfer pet ownership | Yes |
| `create-referral` | Create referral code | No |
| `approve-referrals` | Admin approval | No |
| `suspend-expired-grace` | Cron job for suspensions | No |

---

## 📄 PDF Generation System

### Current Implementation: Client-Side
**Library:** `pdf-lib` (v1.17.1)  
**Service:** `src/services/clientPdfService.ts`  
**Status:** ✅ Active and working

**Edge Function Status:**
- `generate-pet-pdf` is **DISABLED** (returns 503 error)
- Forced fallback to client-side generation
- Location: `supabase/functions/generate-pet-pdf/index.ts`

**PDF Types Supported:**
1. `emergency` - Emergency contact info
2. `full` - Complete profile
3. `lost_pet` - Missing pet flyer
4. `care` - Care instructions
5. `gallery` - Photo gallery
6. `resume` - Professional credentials

**Type Resolution:**
- Centralized in: `src/utils/pdfType.ts`
- Function: `resolvePdfType(input: string): PDFType`
- Handles synonyms and fallbacks

---

## 🌐 Domain & URL Configuration

### Base URLs
**Production:** `https://petport.app`  
**Supabase:** `https://dxghbhujugsfmaecilrq.supabase.co`  
**Edge Functions:** `https://dxghbhujugsfmaecilrq.supabase.co/functions/v1`

### Public Routes (No Auth Required)
```
/public-profile/:id       - Public pet profile
/public-missing/:id       - Missing pet page
/public-care/:id          - Care instructions
/public-resume/:id        - Professional resume
/public-reviews/:id       - Reviews/testimonials
/public-gallery/:id       - Photo gallery
/public-travel/:id        - Travel map
/public-emergency/:id     - Emergency profile
```

### Share URL Generation
**Utility:** `src/utils/domainUtils.ts`

```typescript
getBaseURL()              // Returns correct base URL by environment
getEdgeFunctionBaseURL()  // Returns Supabase function URL
generateShareURL()        // Creates social share URLs with cache-busting
```

### Environment Detection
```typescript
// Production
if (window.location.hostname === 'petport.app')

// Test/Preview
if (window.location.hostname.includes('lovableproject.com'))

// Local Development
if (window.location.hostname === 'localhost')
```

---

## 🖼️ OG Image System

### Implementation
**Primary Storage:** Cloudflare R2 (petport.app domain)  
**Fallback Storage:** Supabase og-images bucket  
**Upload Function:** `upload-og-image`

### OG Image Assets (Fallback)
```
/public/og/general-og.png
/public/og/resume-og-1mb.png
/public/og/resume-og-hd.png
/public/og/resume-og-v1.png
/src/assets/og-fallback-preview.png
/src/assets/og-image.png
/src/assets/og-lostpet-preview.png
/src/assets/og-profile-preview.png
/src/assets/og-resume-preview.png
```

### Social Share Preview
**Component:** `src/components/MetaTags.tsx`  
**Features:**
- Dynamic OG image selection by page type
- Twitter card support
- Facebook preview optimization
- Proper meta tag structure

---

## 🔐 Security & RLS Policies

### CRITICAL: Do Not Modify Public Access Policies
**Documentation:** `SECURITY_README.md`, `docs/RLS_PROTECTION_GUIDE.md`

### Public Access (Intentional Design)
**19 policies provide essential public access:**

#### User-Controlled Sharing (`is_public = true`)
- `public_view_pet_when_public`
- `public_view_care_instructions_when_public`
- `public_view_documents_when_public`
- `public_view_travel_when_public`
- `public_view_reviews_when_public`

#### Emergency Override (`is_missing = true`)
- `public_view_pet_when_missing`
- `public_view_contacts_when_missing`
- `missing_pet_override_*` policies

### Database Functions (Security Definer)
```sql
is_pet_missing(pet_uuid)           -- Check if pet is reported missing
is_user_subscription_active()      -- Verify subscription status
get_user_pet_limit()               -- Get pet slot limit
can_user_add_pet()                 -- Check if can add another pet
handle_lost_pet_data_upsert()      -- Update missing pet data
handle_care_instructions_upsert()  -- Update care instructions
```

---

## 📧 Email Relay System

### Contact Owner Flow
1. **User clicks "Contact Owner"** on public page
2. **Modal opens:** `src/components/ContactOwnerModal.tsx`
3. **Edge function called:** `send-relay-email`
4. **Postmark delivers** to pet owner's account email
5. **Owner replies** directly to sender's email

### Privacy Protection
- Owner's email **never exposed** publicly
- Sender provides their email for direct replies
- Relay system preserves both parties' privacy

### Alert Message (Current)
**Location:** `src/components/PetEditForm.tsx` (lines 506-513)

```tsx
<strong>Your Privacy Is Protected:</strong><br />
When someone uses "Contact Owner" on your pet's public pages, 
PetPort delivers their message to your account email—the one 
you signed up with—without ever showing it publicly.
The sender provides their own email so you can reply directly 
and safely.
```

---

## 🧭 Navigation Structure

### Bottom Tab Navigation
**Component:** `src/components/BottomTabNavigation.tsx`  
**Order Configuration:** `src/features/navigation/tabOrder.ts`

**Default Order:**
1. App (Home)
2. Learn
3. Help
4. Profile

### Mobile Menu
**Component:** `src/components/MobileNavigationMenu.tsx`  
**Features:**
- Swipe navigation
- Touch-optimized
- Android back button support

### Desktop Navigation
**Component:** `src/components/NavigationTabs.tsx`  
**Layout:** Horizontal tabs with active state

---

## 🎨 Design System

### Theme Configuration
**Files:**
- `src/index.css` - CSS custom properties (HSL colors)
- `tailwind.config.ts` - Tailwind theme extension

### Color Tokens (All HSL)
```css
--primary
--primary-glow
--secondary
--accent
--background
--foreground
--muted
--muted-foreground
--border
--gradient-primary
--gradient-subtle
--shadow-elegant
--shadow-glow
```

### Component Library
**Base:** shadcn/ui components (customized)  
**Location:** `src/components/ui/`

**Key Components:**
- `azure-button.tsx` - Primary action buttons
- `guidance-hint.tsx` - User hints
- `profile-completion-hint.tsx` - Profile progress
- `safe-text.tsx` - Sanitized text display
- `section-header.tsx` - Consistent section headers

---

## 📱 Mobile & PWA Features

### Capacitor Configuration
**File:** `capacitor.config.ts`  
**Server URL:** Currently set to Lovable preview  
**Note:** Change to `https://petport.app` before mobile deployment

### PWA Support
**Manifest:** `public/manifest.json`  
**Service Worker:** `public/sw.js`  
**Icons:**
- `icon-192-maskable.png`
- `icon-512-maskable.png`
- `facebook-app-icon-1024.png`

### Mobile Components
- `src/hooks/useIsMobile.ts` - Mobile detection
- `src/hooks/useIsTouchDevice.ts` - Touch detection
- `src/hooks/useAndroidBackButton.ts` - Android navigation
- `src/hooks/useKeyboardHandler.ts` - Keyboard management
- `src/components/HapticButton.tsx` - Touch feedback

---

## 🚀 Feature Flags

**File:** `src/config/featureFlags.ts`

```typescript
{
  testMode: true,  // ⚠️ CHANGE TO FALSE FOR PRODUCTION
  enableAIFeatures: true,
  enableMapFeatures: true,
  enableBilling: true,
  enableReferrals: true
}
```

**Impact of testMode:**
- Affects billing gates
- UI element visibility
- Domain configuration for sharing

---

## 📊 Key Data Flows

### 1. Pet Profile Creation
```
User Form → petService.ts → Supabase pets table
         → Photo upload → pet_photos storage bucket
         → Document upload → pet_documents bucket
```

### 2. Share Flow
```
User clicks Share → QuickShareHub component
                 → AppShareButton
                 → Native Share API / Clipboard
                 → Edge function generates OG image
                 → Upload to Cloudflare R2
                 → Return share URL
```

### 3. PDF Generation
```
User requests PDF → clientPdfService.ts
                 → Fetch pet data from Supabase
                 → Generate PDF with pdf-lib
                 → Download/Share blob
                 → Optional: Upload to pet_pdfs bucket
```

### 4. Contact Form
```
Public user fills form → ContactOwnerModal
                      → send-relay-email edge function
                      → Postmark API
                      → Owner's account email
                      → contact_messages table (log)
```

### 5. Missing Pet Alert
```
Owner marks missing → lost_pet_data table update
                   → Public access enabled (RLS override)
                   → missing-pet-share edge function
                   → Email notifications
                   → Public page accessible
```

---

## 🔧 Critical Dependencies

### Frontend (package.json)
```json
{
  "@supabase/supabase-js": "^2.58.0",
  "pdf-lib": "^1.17.1",
  "react": "^18.3.1",
  "react-router-dom": "^6.26.2",
  "@stripe/stripe-js": "^7.9.0",
  "@stripe/react-stripe-js": "^4.0.2",
  "react-qr-code": "^2.0.18",
  "leaflet": "^1.9.4",
  "jspdf": "^3.0.1"
}
```

### Backend (Edge Functions)
```typescript
// Deno dependencies
"https://deno.land/std@0.190.0/http/server.ts"
"https://deno.land/x/xhr@0.1.0/mod.ts"
"npm:resend@2.0.0"  // Postmark alternative
```

---

## 📝 Database Schema Summary

### Core Tables
- `pets` - Pet profiles (RLS: owner + public when `is_public = true`)
- `pet_photos` - Profile images
- `gallery_photos` - Gallery images
- `documents` - Uploaded documents
- `care_instructions` - Care guides
- `contacts` - Emergency contacts
- `lost_pet_data` - Missing pet info
- `reviews` - Testimonials
- `training` - Training records
- `certifications` - Professional certs
- `experiences` - Work experience
- `achievements` - Awards/achievements
- `map_pins` - Travel map pins
- `travel_entries` - Travel history

### Subscription Tables
- `subscribers` - Subscription status
- `orders` - Purchase history
- `referrals` - Referral tracking
- `user_payouts` - Referral earnings

### System Tables
- `profiles` - User profiles
- `issues` - Bug reports
- `contact_messages` - Contact form logs
- `webhook_events` - Stripe webhook logs
- `email_preferences` - Email opt-outs

---

## ⚠️ Pre-Production Checklist

Before going live (testMode: false):

### Required Changes
1. ✅ Set `testMode: false` in `src/config/featureFlags.ts`
2. ✅ Update `capacitor.config.ts` server URL to `https://petport.app`
3. ✅ Update hardcoded URLs in `src/components/AppShareButton.tsx` (line 169)
4. ✅ Implement environment-based domain configuration
5. ✅ Verify all Cloudflare R2 secrets configured
6. ✅ Test OG image generation end-to-end
7. ✅ Verify Postmark domain validated
8. ✅ Test all share functions with production domain
9. ✅ Verify Stripe webhook endpoint
10. ✅ Test missing pet emergency override

### Verification Tests
- [ ] Facebook share shows petport.app (not supabase.co)
- [ ] OG images load from Cloudflare R2
- [ ] PDF download works
- [ ] Email relay delivers to correct address
- [ ] QR codes redirect properly
- [ ] Public pages accessible without auth
- [ ] Missing pet contacts visible
- [ ] Stripe checkout completes

---

## 📞 Support & Documentation

### Key Documentation Files
- `SECURITY_README.md` - RLS policy explanation
- `docs/RLS_PROTECTION_GUIDE.md` - Detailed security guide
- `docs/DEPLOYMENT_CHECKLIST.md` - Pre-deployment verification
- `docs/TEXT_OVERFLOW_GUIDE.md` - UI text handling
- `DEMO_PAGES_GUIDE.md` - Demo page information
- `src/BACKUP_SHARE_LOGIC_README.md` - Share logic backup

### Configuration Files
- `.env` - Environment variables
- `supabase/config.toml` - Edge function settings
- `capacitor.config.ts` - Mobile app config
- `tailwind.config.ts` - Design system
- `vite.config.ts` - Build configuration

---

## 🎯 Known Working State

**Last Verified:** 2025-10-21  
**Status:** ✅ All systems operational

### Confirmed Working
- ✅ OG image generation (Cloudflare R2)
- ✅ PDF generation (client-side)
- ✅ Email relay (Postmark)
- ✅ Stripe billing
- ✅ Public link routing
- ✅ Contact forms
- ✅ QR code generation
- ✅ Missing pet alerts
- ✅ AI assistants
- ✅ Share functionality
- ✅ Navigation (mobile + desktop)
- ✅ Authentication & RLS
- ✅ Document uploads
- ✅ Gallery management
- ✅ Travel map
- ✅ Referral system

### Recent Changes
- Updated privacy alert in `PetEditForm.tsx` (lines 506-513)
- Exact wording: "Your Privacy Is Protected..."

---

## 🔒 Restore Instructions

### If Something Breaks
1. **Use Lovable History Tab**
   - Click History (top of chat)
   - Find this snapshot date: 2025-10-21
   - Click to restore exact state

2. **Manual Restoration**
   - This document contains all configurations
   - Cross-reference with current code
   - Restore specific sections as needed

3. **Critical Files Backup**
   - Edge function configs in `supabase/config.toml`
   - Feature flags in `src/config/featureFlags.ts`
   - Domain utils in `src/utils/domainUtils.ts`
   - PDF service in `src/services/clientPdfService.ts`

---

## 📌 Pinned Issues & Notes

### Do Not Modify
- ❌ RLS policies (breaks public sharing)
- ❌ Edge function verify_jwt settings
- ❌ PDF generation fallback logic
- ❌ Email relay endpoint URLs
- ❌ Cloudflare R2 bucket references

### Safe to Modify
- ✅ UI components (as long as props remain compatible)
- ✅ Styling (design tokens only)
- ✅ Alert/hint text content
- ✅ Navigation order (via tabOrder.ts)
- ✅ Feature flag values (when ready)

---

**End of Snapshot**  
*This document represents the exact working state of PetPort as of 2025-10-21.*  
*Preserve this file for reference when making future changes.*
