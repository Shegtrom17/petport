# Pre-MetaTags Safety Patch Snapshot – October 22, 2025

## Build Status: STABLE WITH KNOWN ISSUE

**Snapshot Date:** October 22, 2025  
**Build Version:** Pre-MetaTags Safety Patch  
**Critical Issue:** Help page crashes due to MetaTags component receiving relative URL

---

## 🚨 Known Issues

### CRITICAL: Help Page Crash
- **Issue:** `/help` route throws `TypeError: Failed to construct 'URL': Invalid URL`
- **Root Cause:** `MetaTags` component at line 25 cannot parse relative URL `/help`
- **Error Location:** `src/components/MetaTags.tsx:25:79`
- **Impact:** Help page inaccessible to all users
- **Workaround:** None currently
- **Fix Planned:** MetaTags URL resolution hardening + absolute URL enforcement

### MINOR: Supabase 400 Error on Non-Pet Pages
- **Issue:** `id=eq.%3ApetId` query returns 400 on pages without pet context
- **Impact:** Console noise, no functional impact
- **Priority:** Low

---

## 📁 Application Architecture

### Frontend Stack
- **Framework:** React 18.3.1 + TypeScript
- **Build Tool:** Vite
- **Routing:** React Router DOM 6.26.2
- **Styling:** Tailwind CSS + shadcn/ui components
- **State Management:** Zustand 5.0.7 + TanStack Query 5.56.2
- **Mobile:** Capacitor 7.4.3 (iOS + Android)

### Backend Stack (Lovable Cloud/Supabase)
- **Database:** PostgreSQL via Supabase
- **Auth:** Supabase Auth (email, Google)
- **Storage:** Supabase Storage + Cloudflare R2 (OG images)
- **Edge Functions:** Supabase Edge Functions (Deno)
- **Payments:** Stripe integration
- **AI Features:** Lovable AI Gateway (gemini-2.5-flash)

---

## 🗂️ Key File Structure

```
src/
├── pages/
│   ├── Index.tsx                    # Main pet profile hub (tabbed navigation)
│   ├── Landing.tsx                  # Marketing landing page
│   ├── Auth.tsx                     # Sign in/up page
│   ├── Profile.tsx                  # User settings & billing
│   ├── Help.tsx                     # ⚠️ CRASHES - MetaTags URL issue
│   ├── AddPet.tsx                   # New pet creation
│   ├── Billing.tsx                  # Subscription management
│   ├── Subscribe.tsx                # Checkout flow
│   ├── PublicProfile.tsx            # Shareable pet profile
│   ├── PublicResume.tsx             # Shareable pet resume
│   ├── PublicMissingPet.tsx         # Lost pet alert page
│   ├── PublicGallery.tsx            # Shareable photo gallery
│   ├── PublicCareInstructions.tsx   # Shareable care guide
│   ├── PublicTravelMap.tsx          # Shareable travel map
│   ├── Demo*.tsx                    # Live demo pages (Finnegan)
│   ├── NotFound.tsx                 # 404 page
│   ├── Privacy.tsx                  # Privacy policy
│   ├── Terms.tsx                    # Terms of service
│   └── DataDeletion.tsx             # GDPR data deletion info
│
├── components/
│   ├── MetaTags.tsx                 # ⚠️ SEO meta tags - URL parsing bug
│   ├── AppHeader.tsx                # Top navigation bar
│   ├── PetHeader.tsx                # Pet-specific header
│   ├── PWALayout.tsx                # Main app wrapper
│   ├── ProtectedRoute.tsx           # Auth guard component
│   ├── ErrorBoundary.tsx            # Global error boundary
│   ├── SafeErrorBoundary.tsx        # Safe fallback boundary
│   ├── NavigationTabs.tsx           # Pet profile tabs
│   ├── PetProfileContent.tsx        # Main profile display
│   ├── QuickShareHub.tsx            # Sharing interface
│   ├── LostPetButton.tsx            # Missing pet alert trigger
│   └── [100+ other components]
│
├── hooks/
│   ├── usePetData.ts                # Pet data fetching & caching
│   ├── useUserSettings.ts           # User preferences
│   ├── useAuthKeepAlive.ts          # Session refresh logic
│   ├── useIsMobile.ts               # Responsive detection
│   └── [12+ other hooks]
│
├── utils/
│   ├── domainUtils.ts               # Domain enforcement (petport.app)
│   ├── appSharing.ts                # Native share API
│   ├── imageCompression.ts          # Image optimization
│   ├── qrShare.ts                   # QR code generation
│   └── [20+ other utilities]
│
├── services/
│   ├── petService.ts                # Pet CRUD operations
│   ├── careInstructionsService.ts   # Care guide operations
│   ├── pdfService.ts                # PDF generation
│   └── clientPdfService.ts          # Client-side PDF
│
├── context/
│   ├── AuthContext.tsx              # Global auth state
│   └── ThemeContext.tsx             # Dark/light mode
│
└── config/
    ├── featureFlags.ts              # ⚠️ testMode: true (not production ready)
    ├── pricing.ts                   # Stripe pricing config
    └── payments.ts                  # Payment constants
```

---

## 🔧 Configuration Files

### Feature Flags (`src/config/featureFlags.ts`)
```typescript
export const featureFlags = {
  testMode: true,                    // ⚠️ MUST SET TO FALSE FOR PRODUCTION
  enablePullToRefresh: true,
  enableAIAssistants: true,
  enableReferrals: true,
  enableCertifications: true,
  enableReviews: true,
  enableTravelMap: true,
  maxPhotosPerGallery: 50,
  maxDocuments: 20,
  maxPetsBasic: 1,
  maxPetsPremium: 5,
  maxPetsOrg: 999,
};
```

### Capacitor (`capacitor.config.ts`)
```typescript
server: {
  url: 'https://c2db7d2d-7448-4eaf-945e-d804d3aeaccc.lovableproject.com',
  cleartext: true,
  androidScheme: 'https'
}
```
⚠️ **Must update to production domain before mobile release**

### Routing (`src/App.tsx`)
- Last edit: Removed `ProtectedRoute` wrapper from `/help` (line 160)
- Issue persists due to `MetaTags` component crash, not routing

---

## 🔐 Security & Permissions

### Row Level Security (RLS)
- ✅ Enabled on all user-facing tables
- ✅ Pets, documents, gallery, care instructions protected
- ✅ Public sharing respects `is_public` flags
- ⚠️ Run `supabase--linter` before production deploy

### Authentication Flow
- Email/password via Supabase Auth
- Google OAuth configured
- Session refresh via `AuthKeepAliveWrapper`
- Token stored in localStorage (Supabase default)

### API Keys & Secrets
- `LOVABLE_API_KEY` - AI Gateway access
- `STRIPE_SECRET_KEY` - Payment processing
- `SUPABASE_URL` & `SUPABASE_ANON_KEY` - Database access
- `CLOUDFLARE_R2_*` - OG image storage (production domain)

---

## 💳 Payment Integration

### Stripe Configuration
- **Mode:** Production keys configured
- **Products:**
  - Basic Plan: Free (1 pet)
  - Premium Plan: $4.99/month (5 pets)
  - Organization Plan: Custom pricing
- **Add-ons:**
  - Extra Pet Slot: $1.99 one-time
  - Lost Pet Alert: $2.99 one-time
- **Webhooks:** Configured via `stripe-webhook` edge function

### Subscription Features
- Grace period: 7 days after expiration
- Auto-suspend after grace period
- Reactivation flow via `/reactivate`
- Customer portal via Stripe

---

## 🚀 Edge Functions (Supabase)

### Active Functions
```
- approve-referrals           # Admin referral approval
- bio-assistant              # AI bio generation
- care-assistant             # AI care instructions
- care-instructions-share    # Email care guides
- check-subscription         # Subscription status check
- create-checkout            # Stripe checkout session
- create-payment             # One-time payments
- create-referral            # Referral program
- create-setup-intent        # Payment method setup
- create-subscription-with-user # New user + subscription
- customer-portal            # Stripe portal access
- emergency-share            # Email emergency profile
- gallery-share              # Email gallery links
- generate-pet-pdf           # Server-side PDF generation
- link-subscriber            # Link Stripe customer to user
- medical-assistant          # AI medical insights
- missing-pet-share          # Email lost pet alerts
- notify-care-update         # Care update notifications
- notify-sighting            # Lost pet sighting alerts
- profile-share              # Email profile links
- public-create-checkout     # Public checkout (no auth)
- purchase-addons            # Add-on purchases
- receive-email              # Inbound email handler
- resume-share               # Email resume links
- send-email                 # Outbound email sender
- send-relay-email           # Email relay service
- setup-stripe-products      # Initialize Stripe products
- setup-stripe-webhook       # Configure Stripe webhook
- stripe-connect-onboard     # Stripe Connect flow
- stripe-connect-status      # Connect status check
- stripe-webhook             # Stripe event handler
- suspend-expired-grace      # Auto-suspend expired accounts
- transcribe-audio           # Audio transcription (AI)
- transfer-pet               # Pet ownership transfer
- travel-assistant           # AI travel recommendations
- travel-share               # Email travel maps
- upload-og-image            # ⚠️ MISSING - Cloudflare R2 upload
- verify-addons              # Verify add-on purchases
- verify-checkout            # Verify checkout completion
```

---

## 🌐 Domain & Sharing Configuration

### Production Domain
- **Primary:** `petport.app`
- **Test/Preview:** `c2db7d2d-7448-4eaf-945e-d804d3aeaccc.lovableproject.com`

### OG Image Configuration
- **Storage:** Cloudflare R2 bucket (petport.app domain)
- **Edge Function:** `upload-og-image` (NOT YET IMPLEMENTED)
- **Fallback:** Unused Supabase `og-images` bucket (should be removed)

### Dynamic Sharing URLs
⚠️ **Current Issue:** Hardcoded Lovable preview domain in multiple locations
- `src/components/AppShareButton.tsx:169` - Hardcoded URL
- Should use environment-based domain from feature flags

---

## 🎨 Design System

### Theme Configuration (`src/index.css`)
- CSS custom properties for colors
- HSL color space for semantic tokens
- Dark/light mode support via `next-themes`
- Tailwind configured in `tailwind.config.ts`

### Color Tokens
```css
--primary: [main brand color]
--secondary: [accent color]
--background: [page background]
--foreground: [text color]
--muted: [subtle backgrounds]
--accent: [highlights]
--destructive: [error states]
```

### Component Library
- shadcn/ui components (customized)
- lucide-react icons
- Custom variants defined in each component

---

## 📱 Mobile App (PWA + Native)

### Progressive Web App
- Service worker registered: `public/sw.js`
- Manifest: `public/manifest.json`
- Install prompt: `PWAInstallPrompt` component
- Offline support: Basic caching

### Native Capabilities (Capacitor)
- iOS app configured
- Android app configured
- Native share API via `useEmailSharing` hook
- Haptic feedback via `HapticButton` component
- Back button handling via `useAndroidBackButton`

---

## 🧪 Testing & Quality

### Error Boundaries
- `ErrorBoundary.tsx` - Comprehensive error catching
- `SafeErrorBoundary.tsx` - Fallback safety net
- Both wrap main app in `App.tsx`

### Console Logs
- Auth state changes logged
- Session refresh logged
- Navigation logged
- ⚠️ 400 error on non-pet pages (minor)

### Known Limitations
- No automated tests configured
- No CI/CD pipeline
- Manual testing only

---

## 📊 Database Schema (Supabase)

### Core Tables
```
- pets                       # Pet profiles
- users                      # User accounts
- subscribers                # Subscription records
- gallery_photos             # Pet photo gallery
- documents                  # Uploaded documents
- care_instructions          # Care guides
- pet_resume                 # Professional resume data
- certifications             # Pet certifications
- training_records           # Training history
- achievements               # Notable achievements
- experiences                # Work/activity history
- reviews                    # Pet reviews/references
- travel_pins                # Travel history map pins
- lost_pets                  # Missing pet alerts
- sightings                  # Lost pet sighting reports
- care_updates               # Care instruction updates
- emergency_contacts         # Emergency contact info
- veterinary_contacts        # Vet clinic info
- medical_info               # Medical records
- referrals                  # Referral program data
```

### Storage Buckets
```
- pet-photos                 # Pet profile images
- documents                  # User-uploaded files
- gallery                    # Gallery photos
- og-images                  # ⚠️ UNUSED - should remove
```

---

## 🔜 Pending Production Requirements

### MUST DO Before Going Live
1. ✅ Fix MetaTags URL parsing bug (NEXT STEP)
2. ⚠️ Set `featureFlags.testMode = false`
3. ⚠️ Implement `upload-og-image` edge function
4. ⚠️ Update Capacitor server URL to production domain
5. ⚠️ Update hardcoded URLs in sharing components
6. ⚠️ Remove unused Supabase `og-images` bucket
7. ⚠️ Run Supabase linter for security audit
8. ⚠️ Test all payment flows end-to-end
9. ⚠️ Verify all edge functions in production
10. ⚠️ Test mobile app builds (iOS + Android)

### SHOULD DO (Post-Launch Improvements)
- Add automated testing
- Implement error tracking (Sentry, LogRocket, etc.)
- Set up CI/CD pipeline
- Performance monitoring
- Analytics integration
- Rate limiting on edge functions
- Comprehensive logging strategy

---

## 📝 Recent Changes Log

### October 22, 2025 (This Snapshot)
- **Changed:** Removed `ProtectedRoute` wrapper from `/help` route
- **Impact:** Route unprotected, but page still crashes due to MetaTags
- **File:** `src/App.tsx:160`

### Earlier Changes (from PRODUCTION_SNAPSHOT.md)
- Cloudflare R2 integration for OG images configured
- Test mode active for feature flags
- Stripe production keys configured
- Multiple edge functions deployed
- PWA setup complete

---

## 🎯 Next Steps (Immediate)

### 1. Apply MetaTags Safety Patch
- Update `src/pages/Help.tsx` - Use absolute URL in MetaTags
- Update `src/components/MetaTags.tsx` - Add URL resolution helper
- Update `src/components/AppHeader.tsx` - Show help icon always
- Update `src/components/PetHeader.tsx` - Show help icon always

### 2. Verify Fix
- Test `/help` page loads without errors
- Test help icon appears when logged out
- Clear service worker cache
- Hard refresh and verify

### 3. Address Production Readiness
- Follow "MUST DO" checklist above
- Run security audit
- Test payment flows
- Update documentation

---

## 📚 Documentation References

### Internal Docs
- `PRODUCTION_SNAPSHOT.md` - Original production status
- `DEPLOYMENT_CHECKLIST.md` - Pre-launch checklist
- `RLS_PROTECTION_GUIDE.md` - Security guidelines
- `SECURITY_README.md` - Security best practices
- `DEMO_PAGES_GUIDE.md` - Demo page documentation
- `src/docs/TEXT_OVERFLOW_GUIDE.md` - UI guidelines
- `src/BACKUP_SHARE_LOGIC_README.md` - Sharing logic backup

### External Resources
- [Lovable Docs](https://docs.lovable.dev/)
- [Supabase Docs](https://supabase.com/docs)
- [Capacitor Docs](https://capacitorjs.com/docs)
- [Stripe Docs](https://stripe.com/docs)

---

## 🔒 Security Notes

### Data Protection
- RLS enabled on all user tables
- Public sharing requires explicit `is_public` flag
- Authentication required for sensitive operations
- File uploads validated and sanitized

### API Security
- Supabase RLS policies enforced
- Edge functions use service role key securely
- Stripe webhooks validated via signature
- No sensitive data in client-side code

### Known Security Considerations
- Run linter before production
- Review all RLS policies manually
- Verify no data leaks in public pages
- Test authentication flows thoroughly

---

## 📞 Support & Contact

### For Development Issues
- Check console logs first
- Review error boundaries
- Verify Supabase connection
- Check feature flags configuration

### For Production Issues
- Monitor edge function logs
- Check Stripe webhook logs
- Review Supabase analytics
- Verify domain configuration

---

**End of Snapshot**

This snapshot represents the exact state of PetPort before applying the MetaTags safety patch on October 22, 2025. Use this as a reference point for rollback if needed.
