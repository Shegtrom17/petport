# Demo Pages Configuration Guide

## Overview

This project now uses **LIVE data** for demo pages, showcasing Finnegan's real PetPort profile as the brand mascot.

## Current Setup

### ✅ Demo Resume (`/demo/resume`)
- **Type**: **LIVE** - Fetches real data from database
- **Pet**: Finnegan (ID: `297d1397-c876-4075-bf24-41ee1862853a`)
- **Banner**: "✨ Live Demo – Real PetPort Whiteboard"
- **Features**:
  - Real photos from Finnegan's profile
  - Actual certifications, training, achievements
  - Live reviews (5-star from Sheri and Britt)
  - Automatically updates when Finnegan's profile changes
  - All photos display properly from Supabase storage

### ✅ Demo Lost Pet (`/demo/missing-pet`)
- **Type**: **STATIC** - Uses frozen data from `finnDemoData.ts`
- **Pet**: Finnegan
- **Banner**: "✨ Demo - This is NOT a real missing pet alert"
- **Features**:
  - 12 gallery photos in responsive grid (2/3/4 column layout)
  - Real lost pet data (last seen Oct 14, 2025, Andover MN)
  - $400 reward information
  - QR code for sharing
  - Emergency contacts
  - SEO-optimized (kept static for performance)

## Photo Handling

### Resume Photos
- **Source**: Live from Supabase storage
- **URLs**: Direct from `https://dxghbhujugsfmaecilrq.supabase.co/storage/v1/object/public/pet_photos/`
- **Count**: 1 profile photo + 12 gallery photos
- **Format**: Display automatically via `fetchPetDetails()` service

### Lost Pet Photos
- **Source**: Static URLs in `finnDemoData.ts`
- **Gallery Grid**: 
  - Mobile: 2 columns
  - Tablet: 3 columns  
  - Desktop: 4 columns
- **All 12 photos**: Fully displayed with captions
- **Enhancement**: Hover effects, border highlights, tap to enlarge ready

## Switching to Full Live (Optional)

If you want BOTH pages to be live:

1. **Lost Pet Live Option**:
   - Direct users to: `/missing/${FINNEGAN_ID}` instead of `/demo/missing-pet`
   - The `PublicMissingPet` page already shows all 12 photos
   - Updates automatically from database

2. **Benefits of Live**:
   - No need to manually sync static data
   - Always shows latest photos and information
   - Gallery photos automatically included

3. **Benefits of Current Static**:
   - Faster page load (no database query)
   - Better SEO (pre-rendered content)
   - Won't accidentally show "found" status if you test the lost pet feature

## Finnegan's Data

**PetPort ID**: PP-2025-001  
**Breed**: Wheaten Terrier (**IMPORTANT**: This is correct, not Labradoodle)  
**Status**: Therapy Dog (certified)  
**Photos**: 12 high-quality gallery images  
**Reviews**: 2 five-star references  

## Marketing Value

This setup showcases:
- ✅ Real platform in action (not mock data)
- ✅ Professional therapy dog credentials
- ✅ Authentic user testimonials
- ✅ Complete photo gallery capabilities
- ✅ Emergency/lost pet preparedness
- ✅ The brand mascot (Finnegan) as living proof of concept

## File Locations

- **Demo Resume**: `src/pages/DemoResume.tsx` (live data)
- **Demo Lost Pet**: `src/pages/DemoMissingPet.tsx` (static data)
- **Live Resume**: `src/pages/PublicResume.tsx` (template)
- **Live Lost Pet**: `src/pages/PublicMissingPet.tsx` (template)
- **Static Data**: `src/data/finnDemoData.ts`
- **Data Service**: `src/services/petService.ts`

## Next Steps

1. ✅ Resume now pulls live data with banner
2. ✅ Lost Pet shows all 12 gallery photos
3. ✅ Both pages display correctly
4. Consider: Add "View Live Version" link on static Lost Pet demo?
5. Consider: A/B test static vs live for Lost Pet page SEO

---

**Last Updated**: 2025-10-12  
**Finnegan Status**: Active Therapy Dog, Brand Mascot 🐾
