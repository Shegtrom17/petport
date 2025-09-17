# PetPort Deployment Checklist

## Pre-Deployment Security Verification

### 🔒 RLS Policy Protection Check

Before ANY deployment, verify these critical policies exist and function:

#### ✅ User-Controlled Public Access Policies

**Pets Table**
- [ ] `public_view_pet_when_public` - Basic pet information
- [ ] `public_view_pet_when_missing` - Emergency missing pet access

**Care Instructions**  
- [ ] `public_view_care_instructions_when_public` - Medical info when shared
- [ ] `public_view_care_instructions_when_missing` - Emergency medical access

**Documents**
- [ ] `public_view_documents_when_public` - Certificates when shared  
- [ ] `public_view_documents_when_missing` - Emergency documents

**Travel History**
- [ ] `public_view_travel_when_public` - Travel records when shared

**Reviews & Contacts**
- [ ] `public_view_reviews_when_public` - Service reviews
- [ ] `public_view_contacts_when_missing` - Emergency contacts

#### ✅ Policy Verification Commands

```sql
-- Check all public policies exist
SELECT schemaname, tablename, policyname, permissive, cmd, qual 
FROM pg_policies 
WHERE policyname LIKE '%public%' OR policyname LIKE '%missing%'
ORDER BY tablename, policyname;

-- Should return 19+ policies
```

### 🧪 Functional Testing

#### Public Profile Access
- [ ] Visit `/public/profile/[valid-pet-id]` without authentication
- [ ] Verify pet name, photo, and basic info load
- [ ] Check that private pets return appropriate message
- [ ] Confirm public pets show all shared sections

#### Missing Pet Emergency Access  
- [ ] Visit `/public/missing/[missing-pet-id]` without authentication
- [ ] Verify emergency contact information displays
- [ ] Check that location/description shows
- [ ] Confirm missing pet banner appears

#### QR Code Functionality
- [ ] Generate QR code for public pet
- [ ] Scan with mobile device camera
- [ ] Verify direct navigation to public profile
- [ ] Test QR codes for missing pets

#### Social Media Sharing
- [ ] Share public profile URL on Facebook
- [ ] Verify OG image and description appear
- [ ] Test WhatsApp/SMS link previews
- [ ] Check Twitter card functionality

### 🔐 Security Verification

#### Authentication Independence
- [ ] Public pages load in incognito mode
- [ ] No authentication redirects for public content
- [ ] Private data remains protected
- [ ] User login enhances but doesn't gate public features

#### Data Isolation
- [ ] Public pets show only shared information
- [ ] Private pets remain completely hidden
- [ ] Cross-user data access properly blocked
- [ ] Emergency access limited to missing pets only

### ⚡ Performance Testing

#### Load Times
- [ ] Public pages load in < 2 seconds
- [ ] QR code redirects respond quickly
- [ ] Social media crawlers get fast responses
- [ ] Mobile performance acceptable

#### Database Performance
- [ ] RLS policies don't cause slow queries
- [ ] Public access doesn't impact auth users
- [ ] Edge function performance stable
- [ ] Storage access times reasonable

### 📱 Mobile & PWA Testing

#### Installation
- [ ] PWA installs correctly on iOS/Android
- [ ] Public links work in installed app
- [ ] QR scanning functions properly
- [ ] Push notifications (if enabled) work

#### Sharing Features
- [ ] Native share sheet includes public URLs
- [ ] Copy link functionality works
- [ ] Email/SMS sharing includes public links
- [ ] Social app integration functional

### 🚨 Emergency Scenario Testing

#### Missing Pet Workflow
- [ ] Mark pet as missing
- [ ] Verify public access immediately available
- [ ] Test emergency contact display
- [ ] Confirm privacy override functions
- [ ] Check missing pet PDF generation

#### Recovery Simulation
- [ ] Test community member access to missing pet
- [ ] Verify contact information reachable
- [ ] Check location/description accuracy
- [ ] Simulate found pet reporting

### 💳 Payment Integration Verification

#### Stripe Functionality
- [ ] Billing operations unaffected by RLS changes
- [ ] Subscription checks work properly
- [ ] Edge functions maintain service role access
- [ ] Payment webhooks process correctly

### 📊 Monitoring Setup

#### Error Tracking
- [ ] 404/403 errors on public URLs monitored
- [ ] RLS policy violations logged
- [ ] Public page performance tracked
- [ ] User experience metrics captured

### 🔄 Rollback Preparation

#### Backup Verification
- [ ] Current RLS policies documented
- [ ] Rollback scripts prepared and tested
- [ ] Database migration rollback ready
- [ ] Contact information for emergency support

---

## Deployment Approval

**Only proceed with deployment after ALL items are checked.**

### Final Verification
- [ ] All public policies active and tested
- [ ] Public URLs accessible without authentication  
- [ ] Missing pet emergency access functional
- [ ] QR codes and social sharing work
- [ ] Performance meets requirements
- [ ] Security verification complete

### Stakeholder Sign-off
- [ ] Development team approval
- [ ] Security review completed  
- [ ] Business stakeholder confirmation
- [ ] Emergency rollback plan approved

---

**Remember**: PetPort's core value is information sharing for pet safety. This checklist ensures that functionality remains intact while maintaining appropriate security.