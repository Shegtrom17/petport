-- =====================================================
-- STRIPE REFERRAL COUPON SETUP GUIDE
-- =====================================================
-- This file contains the SQL/instructions to create 
-- the required Stripe coupon for referral discounts
-- =====================================================

/*
  MANUAL SETUP REQUIRED IN STRIPE DASHBOARD:
  
  1. Navigate to: https://dashboard.stripe.com/coupons
  
  2. Click "New" button to create coupon
  
  3. Configure with these settings:
     - ID: REFERRAL10 (EXACTLY this - case sensitive!)
     - Name: "Referral Discount - 10% Off Yearly Plans"
     - Type: Percentage
     - Percent Off: 10%
     - Duration: Forever
     - Max Redemptions: (leave unlimited)
     - Currency: USD
     - Applies to: All subscriptions
     
  4. Click "Create Coupon"
  
  5. Verify coupon appears in list
*/

-- =====================================================
-- ALTERNATIVE: Using Stripe CLI
-- =====================================================

/*
  If you have Stripe CLI installed, run this command:

  stripe coupons create \
    --id REFERRAL10 \
    --percent-off 10 \
    --duration forever \
    --name "Referral Discount - 10% Off Yearly Plans" \
    --currency usd

  Verify creation:
  
  stripe coupons retrieve REFERRAL10
*/

-- =====================================================
-- VERIFICATION QUERY (Run in Supabase SQL Editor)
-- =====================================================

-- Check if referral code is being used in checkouts
SELECT 
  COUNT(*) as referral_checkouts,
  COUNT(CASE WHEN referred_plan_interval = 'year' THEN 1 END) as yearly_referrals,
  COUNT(CASE WHEN commission_status = 'approved' THEN 1 END) as approved_commissions,
  COUNT(CASE WHEN paid_at IS NOT NULL THEN 1 END) as paid_commissions,
  SUM(CASE WHEN paid_at IS NOT NULL THEN commission_amount ELSE 0 END) / 100.0 as total_paid_usd
FROM referrals
WHERE referred_user_id IS NOT NULL;

-- =====================================================
-- TEST COUPON APPLICATION
-- =====================================================

/*
  To test if coupon works:
  
  1. Generate a referral link from /referrals page
  2. Open in incognito: https://petport.app/?ref=REF-XXXXXX
  3. Click "Get Started" on landing page
  4. Select "Yearly Plan"
  5. Verify pricing shows:
     - Original: $14.99/year
     - Discount: -$1.50 (10%)
     - Final: $13.49/year
  6. Complete test checkout
  
  If discount doesn't show:
  - Check coupon exists in Stripe Dashboard
  - Verify coupon ID is exactly "REFERRAL10"
  - Check edge function logs for errors
  - Confirm referral code in localStorage
*/

-- =====================================================
-- MONITORING QUERIES
-- =====================================================

-- View recent referral activity
SELECT 
  r.referral_code,
  r.created_at as referral_created,
  r.referred_plan_interval,
  r.commission_status,
  r.approved_at,
  r.paid_at,
  r.commission_amount / 100.0 as commission_usd,
  referrer.email as referrer_email,
  referred.email as referred_email
FROM referrals r
LEFT JOIN auth.users referrer ON r.referrer_user_id = referrer.id
LEFT JOIN auth.users referred ON r.referred_user_id = referred.id
WHERE r.referred_user_id IS NOT NULL
ORDER BY r.created_at DESC
LIMIT 20;

-- Check referrers awaiting payout
SELECT 
  u.email as referrer_email,
  COUNT(*) as approved_referrals,
  SUM(r.commission_amount) / 100.0 as pending_payout_usd,
  up.stripe_connect_id,
  up.onboarding_status
FROM referrals r
JOIN auth.users u ON r.referrer_user_id = u.id
LEFT JOIN user_payouts up ON r.referrer_user_id = up.user_id
WHERE r.commission_status = 'approved'
  AND r.paid_at IS NULL
GROUP BY u.email, up.stripe_connect_id, up.onboarding_status
ORDER BY pending_payout_usd DESC;

-- =====================================================
-- END OF SETUP GUIDE
-- =====================================================
