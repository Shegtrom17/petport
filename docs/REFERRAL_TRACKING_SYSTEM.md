# Referral Tracking System - Complete Documentation

## Overview
Multi-layer referral tracking system that ensures attribution even when cookies/localStorage fail. **Only pays commissions for completed $14.99 yearly subscriptions.**

## Payment Rules (CRITICAL)
✅ **Commission ONLY created when:**
1. User completes Stripe checkout (payment succeeds)
2. User purchases **yearly plan** ($14.99) - monthly does NOT qualify
3. Stripe webhook confirms subscription is active

❌ **NO commission if:**
- User clicks link but doesn't sign up
- User signs up but doesn't subscribe
- User subscribes but chooses monthly plan
- User's payment fails
- Subscription is not for the yearly plan

## Three-Layer Tracking System

### Layer 1: Client-Side Storage (Primary)
When user lands on `https://petport.app/?ref=REF-C091B2`:

**Stores in 3 places:**
1. `localStorage.petport_referral` (survives browser close)
2. `sessionStorage.petport_referral` (survives page refresh)
3. Cookie `petport_referral` (30-day expiry, works across domains)

**Code:** `src/hooks/useReferralCode.ts` lines 11-32

**Console logs:**
- `[Referral] Code captured and stored in localStorage, sessionStorage, and cookie: REF-C091B2`
- `[Referral] Current stored code: { localStorage, cookie }`

### Layer 2: Server-Side Visit Tracking (Backup)
Immediately after storing client-side, calls edge function to log the visit.

**Edge Function:** `supabase/functions/track-referral-visit/index.ts`

**Database:** `referral_visits` table stores:
- `referral_code` (REF-C091B2)
- `ip_address` (for matching later)
- `user_agent` (browser info)
- `visited_at` (timestamp)
- `converted_user_id` (NULL until signup)
- `converted_at` (NULL until conversion)
- `plan_type` (NULL until we know)

**Console logs:**
- `[Referral] Visit tracked on server`
- `[TRACK-REFERRAL-VISIT] Visit tracked: { referral_code, ip_address }`

### Layer 3: Stripe Metadata (Most Reliable)
When user clicks "Start Free Trial", referral code is passed to Stripe.

**Flow:**
1. `PricingSection` reads referral code from cookie/localStorage
2. Console logs: `[PricingSection] Starting checkout with: { plan, referralCode }`
3. Calls `public-create-checkout` with `referral_code` in body
4. Edge function logs: `[PUBLIC-CREATE-CHECKOUT] Request: { plan, referral_code }`
5. Stripe checkout session created with `metadata: { referral_code }`
6. **If yearly plan:** Applies REFERRAL10 coupon (10% off)

## Commission Creation Flow

### Step 1: User Completes Payment
Stripe sends webhook: `customer.subscription.created`

### Step 2: Webhook Checks Eligibility
**File:** `supabase/functions/stripe-webhook/index.ts` lines 207-307

**Requirements checked:**
- ✅ Subscription status = 'active'
- ✅ Plan interval = 'year' (NOT month)
- ✅ Referral code exists (from metadata OR fallback tracking)

### Step 3a: Primary Method (Stripe Metadata)
If `subscription.metadata.referral_code` exists:
1. Find blank referral record with this code
2. Update with `referred_user_id`
3. Set `trial_completed_at` (7 days from now)
4. Set `referred_plan_interval: 'year'`
5. Status stays 'pending'

**Console logs:**
- `[STRIPE-WEBHOOK] Processing referral code for yearly subscription`
- `[STRIPE-WEBHOOK] Referral linked successfully`

### Step 3b: Fallback Method (Server-Side Tracking)
If NO metadata but it's a yearly plan:
1. Query `referral_visits` for recent visits (last 7 days)
2. Find most recent unconverted visit
3. Link that referral code to the user
4. Mark visit as converted with `plan_type: 'yearly'`

**Console logs:**
- `[STRIPE-WEBHOOK] No referral code in metadata, checking server-side tracking`
- `[STRIPE-WEBHOOK] Found recent referral visit`
- `[STRIPE-WEBHOOK] Referral linked via server-side tracking fallback`

### Step 4: Commission Approval
**38 days after trial ends:**
- Edge function `approve-referrals` runs (cron job)
- Changes status: `pending` → `approved`
- Shows in referrer's dashboard

### Step 5: Payout
When admin runs "Process All Approved Payouts":
- Transfers $2.00 to referrer's Stripe Connect account
- Changes status: `approved` → `paid`
- Requires referrer completed Stripe onboarding

## Monthly Plans - Why They Don't Get Commissions

**Monthly plan checkout:**
- Still stores referral code in cookies/localStorage/server ✓
- Still passes to Stripe metadata ✓
- Webhook receives `planInterval: 'month'`
- **Line 209 check fails:** `if (referralCode && status === 'active' && planInterval === 'year')`
- **Line 247 check fails:** `else if (status === 'active' && planInterval === 'year')`
- **Result:** No referral record updated, no commission created

**Why this is correct:**
- You only want to pay $2.00 for $14.99 yearly subscriptions
- Monthly subscriptions ($1.99) don't qualify
- Commission percentage makes sense: $2 / $14.99 = 13.3%

## Manual Admin Override

If tracking fails for a valid yearly subscriber, admin can manually link:

**Admin UI:** `/referrals` page → "Manually Link Referral" section

**Edge Function:** `supabase/functions/admin-link-referral/index.ts`

**Requirements:**
1. User must be admin
2. Referred user must have active yearly subscription
3. Referral code must have NULL referred_user_id

**Input:**
- Referral Code: `REF-C091B2`
- Referred User Email: `sue@petport.app`

**Action:**
- Verifies yearly subscription
- Links referral record
- Sets trial_completed_at correctly
- Calculates approval date (38 days later)

## Testing Checklist

### Test 1: Full Happy Path
1. ✅ Click referral link `https://petport.app/?ref=REF-C091B2`
2. ✅ Check console: code stored in 3 places
3. ✅ Check console: server visit tracked
4. ✅ Click "Start Free Trial" → Select Yearly
5. ✅ Check console: referral code passed to checkout
6. ✅ Complete Stripe payment
7. ✅ Check webhook logs: referral linked
8. ✅ Check database: referral record has referred_user_id
9. ✅ Verify status = 'pending', referred_plan_interval = 'year'

### Test 2: Cookie Persistence
1. ✅ Click referral link
2. ✅ Close browser completely
3. ✅ Reopen browser, go to petport.app
4. ✅ Click pricing
5. ✅ Verify console shows referral code from cookie
6. ✅ Complete checkout
7. ✅ Verify referral linked

### Test 3: Server-Side Fallback
1. ✅ Click referral link (visit tracked)
2. ✅ Clear all cookies and localStorage
3. ✅ Immediately complete yearly signup
4. ✅ Check webhook logs: fallback method used
5. ✅ Verify referral linked via recent visit

### Test 4: Monthly Plan Exclusion
1. ✅ Click referral link
2. ✅ Select **Monthly** plan
3. ✅ Complete Stripe payment
4. ✅ Check webhook logs: referral code in metadata
5. ✅ Verify NO referral record created (planInterval check fails)
6. ✅ Check database: referral still has NULL referred_user_id

### Test 5: Manual Admin Override
1. ✅ User signs up with yearly (but tracking failed)
2. ✅ Admin goes to `/referrals`
3. ✅ Enters referral code + user email
4. ✅ Clicks "Link Referral"
5. ✅ Verify success message with approval date
6. ✅ Check database: referral linked correctly

## Database Schema

### `referrals` table
- `referral_code`: 'REF-C091B2'
- `referrer_user_id`: UUID (who gets paid)
- `referred_user_id`: UUID (who signed up) - NULL until conversion
- `referred_plan_interval`: 'year' | 'month' - only 'year' gets commission
- `commission_status`: 'pending' | 'approved' | 'paid'
- `commission_amount`: 200 (cents = $2.00)
- `trial_completed_at`: timestamp (7 days after signup)

### `referral_visits` table (NEW)
- `referral_code`: 'REF-C091B2'
- `ip_address`: User's IP (for matching)
- `user_agent`: Browser info
- `visited_at`: When they clicked the link
- `converted_user_id`: NULL until they subscribe (yearly only)
- `converted_at`: When subscription completed
- `plan_type`: 'yearly' | 'monthly' | NULL

## Console Log Reference

**Success indicators:**
- `[Referral] Code captured and stored`
- `[Referral] Visit tracked on server`
- `[PricingSection] Referral code check: { finalCode: 'REF-C091B2' }`
- `[PUBLIC-CREATE-CHECKOUT] Request: { plan: 'yearly', referral_code: 'REF-C091B2' }`
- `[STRIPE-WEBHOOK] Processing referral code for yearly subscription`
- `[STRIPE-WEBHOOK] Referral linked successfully`

**Warning indicators:**
- `[Referral] Failed to track visit` - Server tracking failed (not critical)
- `[STRIPE-WEBHOOK] Referral code not found or already used` - Invalid code
- `[STRIPE-WEBHOOK] No recent referral visits found for fallback` - All layers failed

## Why This System is Robust

1. **Triple client-side redundancy** - localStorage + sessionStorage + cookie
2. **Server-side backup** - Even if all client storage fails, we log the visit
3. **Stripe metadata priority** - Most reliable source, checked first
4. **7-day fallback window** - Can match visits up to a week old
5. **Only pays for yearly** - Hard-coded check in webhook (lines 209, 247)
6. **Admin manual override** - Final safety net for legitimate cases

## Why Sue's Referral Failed (Original Issue)

**What happened:**
1. ✅ Sue clicked referral link
2. ✅ Email client opened in preview pane
3. ❌ Preview pane didn't execute JavaScript (no storage)
4. ❌ When Sue clicked "open in browser", new session started
5. ❌ No referral code in URL anymore
6. ❌ Server-side tracking didn't exist yet
7. ✅ Sue completed yearly checkout successfully
8. ❌ No referral code in Stripe metadata
9. ❌ No commission created

**Now fixed with:**
- Cookie storage (more reliable than localStorage for email links)
- Server-side tracking logs the visit before JavaScript fails
- Fallback matching within 7-day window
- Admin manual override for edge cases
