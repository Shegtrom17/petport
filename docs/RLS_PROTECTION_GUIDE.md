# PetPort RLS Protection Guide

## Architecture Overview

PetPort uses a **dual-tier security model**:

1. **Private by Default**: All data requires authentication
2. **User-Controlled Public Access**: Users can share specific information
3. **Emergency Override**: Missing pets bypass all privacy

## Critical Public Policies

### Tier 1: User-Controlled Sharing (`is_public = true`)

```sql
-- Example Policy Structure
CREATE POLICY "public_view_pet_when_public" 
ON public.pets 
FOR SELECT 
USING (is_public = true);
```

**Purpose**: Users explicitly choose to share their pet's information  
**Business Value**: Social sharing, QR codes, professional services  
**Security Note**: This is intentional and user-controlled  

### Tier 2: Emergency Override (`is_missing = true`)

```sql
-- Example Emergency Policy
CREATE POLICY "public_view_contacts_when_missing" 
ON public.contacts 
FOR SELECT 
USING (pet_id IN (SELECT id FROM public.pets WHERE is_missing = true));
```

**Purpose**: Life-saving emergency access when pets are lost  
**Business Value**: Pet recovery, emergency services, community help  
**Security Note**: Overrides privacy for safety - legally and ethically justified  

## Policy Categories

### Core Pet Data
- `pets` table: Basic information, photos
- `care_instructions`: Medical needs, allergies
- `contacts`: Emergency contact information

### Extended Features  
- `documents`: Vaccination records, certificates
- `travel_entries`: Travel history
- `reviews`: Testimonials from services

## Testing Public Access

### Manual Tests
1. **Unauthenticated Browser**: Visit public URLs
2. **Incognito Mode**: Verify no cached authentication
3. **Mobile Devices**: Test QR code scanning
4. **Social Media**: Check link previews

### Automated Tests
```bash
# Test public endpoint accessibility
curl -I https://petport.app/public/profile/[pet-id]
# Should return 200 OK, not 401/403
```

## Common Misconceptions

### ❌ "Public data is a security risk"
✅ **Reality**: User-controlled sharing is the core feature

### ❌ "RLS should block all anonymous access"  
✅ **Reality**: Emergency situations require open access

### ❌ "This violates privacy principles"
✅ **Reality**: Users explicitly opt-in or emergency justifies override

## Integration Points

### Stripe/Billing
- **No Impact**: Billing data remains user-scoped
- **Edge Functions**: Use service role, bypass RLS
- **Subscription Checks**: Independent security layer

### Authentication
- **Optional**: Public pages work without login
- **Enhanced**: Logged users get additional features
- **Secure**: Private data remains protected

## Monitoring

### Red Flags
- Public URLs returning 401/403 errors
- QR codes not working
- Missing pet alerts failing
- Social shares showing generic content

### Success Metrics
- Public page load times < 2s
- QR code scan success rate > 95%
- Missing pet recovery response time
- User adoption of sharing features

## Emergency Procedures

### If Public Access Breaks
1. **Immediate**: Check RLS policies for changes
2. **Verify**: Test known public URLs
3. **Restore**: Revert policy changes
4. **Test**: Confirm functionality restored
5. **Document**: Root cause analysis

### Rollback Commands
Keep these handy for emergency restoration:
```sql
-- Restore public pet viewing
DROP POLICY IF EXISTS "restrictive_pet_policy" ON public.pets;
CREATE POLICY "public_view_pet_when_public" ON public.pets FOR SELECT USING (is_public = true);
```

## Change Management

### Before Modifying RLS
1. Review this document
2. Understand business impact
3. Test in staging environment
4. Verify all public features work
5. Get stakeholder approval

### Documentation Required
- Policy change rationale
- Business impact assessment  
- Testing results
- Rollback procedure

## Legal Considerations

### Privacy Laws (GDPR, CCPA)
- ✅ User consent through explicit toggle
- ✅ Emergency exemptions recognized
- ✅ Data minimization (only shared data exposed)

### Emergency Situations
- ✅ Life/safety overrides privacy
- ✅ Missing pet situations legally justified
- ✅ Community assistance encouraged

---

**Remember**: These policies enable PetPort's mission of keeping pets safe through information sharing. Protecting them protects lives.