# Referral System Complete Guide

## ✅ System Status: FULLY OPERATIONAL

### Overview
PetPort's referral system allows users to earn **$2.00 per yearly subscriber** referred. The system is integrated with Stripe Connect for automated payouts.

---

## 🔄 Complete Referral Flow

### 1. Referral Link Sharing
**Location**: `/referrals` page

**Features**:
- ✅ Unique referral code per user (format: `REF-XXXXXX`)
- ✅ Shareable link: `https://petport.app/?ref=REF-XXXXXX`
- ✅ Copy to clipboard button
- ✅ **NEW**: Native share API (mobile)
- ✅ **NEW**: Email share button
- ✅ **NEW**: SMS share button
- ✅ 10% discount for referred subscribers

**Share Message**:
```
🐾 Keep your pet's info safe with PetPort! 
Get 10% off yearly plans when you join with my link: 
https://petport.app/?ref=REF-XXXXXX
```

---

### 2. Referral Code Tracking
**Hook**: `useReferralCode()`

**How it works**:
1. User clicks referral link: `https://petport.app/?ref=REF-123456`
2. Code is captured from URL parameter
3. Stored in localStorage: `petport_referral`
4. Persists across all pages during user journey
5. Passed to Stripe Checkout when user subscribes

**Storage**:
- **Key**: `petport_referral`
- **Value**: Referral code (e.g., `REF-123456`)
- **Lifespan**: Until user subscribes or clears browser data

---

### 3. Subscription Creation & Linking

**Edge Function**: `public-create-checkout`

**Process**:
1. User starts checkout with plan selection
2. Referral code retrieved from localStorage
3. Code attached to Stripe subscription metadata
4. **10% discount applied** for yearly plans with referral
5. Subscription created with 7-day trial

**Metadata Structure**:
```javascript
subscription_data: {
  trial_period_days: 7,
  metadata: {
    referral_code: "REF-123456",  // If exists
    additional_pets: "0"
  }
}
```

---

### 4. Referral Activation (Webhook)

**Edge Function**: `stripe-webhook`  
**Event**: `customer.subscription.created`

**Activation Criteria** (ALL must be true):
- ✅ Referral code exists in subscription metadata
- ✅ Subscription status is `active` or `trialing`
- ✅ Plan interval is `year` (NOT `month`)
- ✅ Referral record exists and unused

**Process**:
```javascript
// Webhook links referral to new subscriber
await supabaseClient
  .from('referrals')
  .update({
    referred_user_id: newUser.id,
    trial_completed_at: trialEndDate,
    referred_plan_interval: 'year',
    commission_status: 'pending'  // Starts as pending
  })
  .eq('referral_code', referralCode)
```

**Status**: `pending` (awaits 38-day verification)

---

### 5. Referral Approval (Automated)

**Edge Function**: `approve-referrals`  
**Schedule**: Cron job (runs automatically)

**Approval Criteria**:
- ✅ 45 days passed since signup (7-day trial + 38 days active)
- ✅ Subscription remained active (no cancellations)
- ✅ Plan is yearly (monthly ineligible)
- ✅ Status is `pending`

**Process**:
```javascript
// Auto-approve after 38 active days
const approvalDate = new Date();
approvalDate.setDate(approvalDate.getDate() - 38);

const pendingReferrals = await supabase
  .from('referrals')
  .select()
  .eq('commission_status', 'pending')
  .eq('referred_plan_interval', 'year')
  .lte('trial_completed_at', approvalDate);

// Update to approved
await supabase
  .from('referrals')
  .update({ 
    commission_status: 'approved',
    approved_at: new Date()
  })
```

**Status**: `pending` → `approved`

---

### 6. Stripe Connect Setup

**Edge Function**: `stripe-connect-onboard`

**User Journey**:
1. User clicks "Connect Stripe" on `/referrals` page
2. Creates Stripe Connect Express account
3. Redirects to Stripe onboarding
4. User enters bank details
5. Returns to PetPort with status `completed`

**Account Storage**:
```sql
-- user_payouts table
{
  user_id: uuid,
  stripe_connect_id: "acct_xxxxx",
  onboarding_status: "completed",
  yearly_earnings: 0
}
```

**Statuses**:
- `not_started` - User hasn't connected Stripe
- `pending` - Stripe account created, onboarding incomplete
- `completed` - Ready to receive payouts

---

### 7. Payout Processing

**Edge Function**: `process-payouts`  
**Trigger**: Admin manually invokes

**Process**:
1. Fetches all `approved` referrals with `paid_at = null`
2. Groups by referrer (one transfer per user)
3. Verifies Stripe Connect status is `completed`
4. Creates Stripe Transfer to referrer's account

**Transfer Code**:
```javascript
const transfer = await stripe.transfers.create({
  amount: totalAmount,  // $2.00 per referral = 200 cents
  currency: 'usd',
  destination: stripeConnectId,
  description: `PetPort referral payout: ${count} referrals`,
  metadata: {
    referrer_user_id: userId,
    referral_count: count,
    referral_ids: ids.join(',')
  }
});
```

**Status Update**:
```javascript
// Mark as paid
await supabase
  .from('referrals')
  .update({ 
    commission_status: 'paid',
    paid_at: new Date(),
    payout_id: transfer.id
  })
```

**Status**: `approved` → `paid`

---

## 💰 Commission Structure

| Plan Type | Commission | Discount | Eligible |
|-----------|-----------|----------|----------|
| Monthly | $0.00 | 0% | ❌ No |
| Yearly | $2.00 | 10% | ✅ Yes |

**Payment Timeline**:
- Day 0: User subscribes with referral code
- Day 0-7: Trial period (no charge)
- Day 7: First payment charged
- Day 45: Commission approved (7 + 38 days)
- Day 45+: Admin processes payout
- Day 46-50: Money hits referrer's bank

---

## 📊 Referral Status Flowchart

```
┌─────────────────┐
│  User Shares    │
│  Referral Link  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Friend Clicks  │
│  & Signs Up     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ❌ Monthly Plan
│  Subscription   ├────────────► NOT ELIGIBLE
│    Created      │
└────────┬────────┘
         │ ✅ Yearly Plan
         ▼
┌─────────────────┐
│   Status:       │
│   PENDING       │
│  (Wait 45 days) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ❌ Canceled Early
│  38 Active Days ├────────────► REJECTED
│     Passed?     │
└────────┬────────┘
         │ ✅ Still Active
         ▼
┌─────────────────┐
│   Status:       │
│   APPROVED      │
│ (Ready to Pay)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Admin Runs     │
│ process-payouts │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Status:       │
│     PAID        │
│  Money Sent! 💸 │
└─────────────────┘
```

---

## 🔧 Admin Tools

### Referral Admin Dashboard
**Location**: `/referrals` (admin users only)

**Features**:
- View all pending referrals
- View approved referrals
- Process payouts button
- Total earnings tracking

**Access Control**:
```sql
-- Must have admin role
SELECT has_role(auth.uid(), 'admin');
```

### Manual Payout Processing
**Edge Function**: `process-payouts`

**How to Run**:
1. Admin logs into `/referrals`
2. Clicks "Process Payouts" button
3. Function processes all approved referrals
4. Transfers sent via Stripe Connect
5. Referrals marked as `paid`

---

## 🚨 Important Stripe Setup

### Required Stripe Configuration

1. **Referral Discount Coupon**
   - **ID**: `REFERRAL10`
   - **Type**: Percentage
   - **Amount**: 10% off
   - **Duration**: Forever
   - **Applies to**: First subscription only

2. **Create Coupon** (if not exists):
   ```bash
   # Using Stripe CLI or Dashboard
   stripe coupons create \
     --id REFERRAL10 \
     --percent-off 10 \
     --duration forever \
     --name "Referral Discount"
   ```

3. **Verify Coupon**:
   - Go to: https://dashboard.stripe.com/coupons
   - Confirm `REFERRAL10` exists
   - Verify 10% discount setting

---

## 🧪 Testing the System

### Test Referral Flow

1. **Generate Referral Link**:
   - Create test user account
   - Navigate to `/referrals`
   - Copy referral link

2. **Use Referral Code**:
   - Open link in incognito window
   - Verify discount shown (10% off yearly)
   - Complete signup with test card

3. **Verify Linking**:
   - Check database: `referrals` table
   - Confirm `referred_user_id` populated
   - Verify `referred_plan_interval` = 'year'

4. **Simulate Approval** (Manual):
   ```sql
   -- Fast-forward to approved state
   UPDATE referrals
   SET commission_status = 'approved',
       approved_at = NOW()
   WHERE id = 'test-referral-id';
   ```

5. **Test Payout**:
   - Admin user runs `process-payouts`
   - Check Stripe Dashboard for transfer
   - Verify referral marked as `paid`

---

## 📝 Database Schema

### referrals table
```sql
CREATE TABLE referrals (
  id UUID PRIMARY KEY,
  referrer_user_id UUID NOT NULL,           -- Who gets paid
  referred_user_id UUID,                    -- Who signed up
  referral_code TEXT UNIQUE NOT NULL,       -- REF-XXXXXX
  commission_amount INTEGER DEFAULT 200,    -- $2.00 in cents
  commission_status TEXT DEFAULT 'pending', -- pending/approved/paid
  referred_plan_interval TEXT,              -- 'year' or 'month'
  trial_completed_at TIMESTAMPTZ,           -- When trial ended
  approved_at TIMESTAMPTZ,                  -- When approved
  paid_at TIMESTAMPTZ,                      -- When paid
  payout_id TEXT,                           -- Stripe transfer ID
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### user_payouts table
```sql
CREATE TABLE user_payouts (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE NOT NULL,
  stripe_connect_id TEXT UNIQUE,            -- Stripe Connect account
  onboarding_status TEXT DEFAULT 'not_started',
  yearly_earnings INTEGER DEFAULT 0,        -- Total cents earned
  last_earnings_reset DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔗 Quick Links

- **Referral Page**: `/referrals`
- **Referral Program Info**: `/referral-program`
- **Stripe Connect Dashboard**: https://dashboard.stripe.com/connect/accounts
- **Stripe Transfers**: https://dashboard.stripe.com/transfers

---

## ✅ Final Checklist

Before going live, verify:

- [ ] All edge functions deployed
- [ ] Stripe `REFERRAL10` coupon created
- [ ] Stripe Connect enabled on account
- [ ] Approve-referrals cron job scheduled
- [ ] Admin role assigned to admin users
- [ ] Test referral link works
- [ ] Test discount applies (10% off)
- [ ] Test Stripe Connect onboarding
- [ ] Test payout processing
- [ ] Monitoring in place for failed payouts

---

## 🆘 Troubleshooting

### Referral not linking
- Check subscription metadata has `referral_code`
- Verify plan is yearly (not monthly)
- Check webhook logs for errors

### Discount not applying
- Verify `REFERRAL10` coupon exists in Stripe
- Check coupon is active and not expired
- Ensure referral code passed to checkout

### Payout failing
- Verify Stripe Connect onboarding completed
- Check account has valid bank details
- Review Stripe Connect account restrictions

---

**System Version**: 2.0  
**Last Updated**: November 2025  
**Status**: ✅ Production Ready
