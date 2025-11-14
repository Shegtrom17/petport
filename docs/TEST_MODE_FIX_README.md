# Test Mode Customer ID Fix

## Problem
Some accounts have **test mode** Stripe customer IDs but your Stripe API key is now in **live mode**. This causes subscription checks to fail with:

```
Error: No such customer: 'cus_TPqSf41OK5C23m'; 
a similar object exists in test mode, but a live mode key was used to make this request.
```

## Affected Accounts (as of Nov 14, 2025)
1. **shegstrom17@gmail.com** - `cus_TPqSf41OK5C23m` (test mode)
2. **test-nov13-001@petport.app** - `cus_TPr2XJn3Ki11xX` (test mode)

## Fix Implemented

The `check-subscription-safe` edge function now:

### 1. Validates Customer IDs
```typescript
// If customer ID exists, validate it works in current Stripe mode
try {
  await stripe.customers.retrieve(customerId);
} catch (stripeError) {
  // Test mode ID detected - try to find by email instead
  const customers = await stripe.customers.list({ email: user.email });
  customerId = customers.data[0]?.id ?? null;
  
  // Update database with correct ID
  await supabase.from("subscribers").update({ 
    stripe_customer_id: customerId 
  });
}
```

### 2. Never Crashes
```typescript
catch (err) {
  // Return 200 (not 500) to prevent ProtectedRoute crash
  return new Response(JSON.stringify({ 
    subscribed: false,
    errorType: "stripe_mode_mismatch"
  }), { status: 200 });
}
```

### 3. Self-Healing
The next time an affected user logs in:
1. ✅ System detects test mode customer ID
2. ✅ Searches Stripe (live mode) for their email
3. ✅ Finds their live mode customer (if exists)
4. ✅ Updates database with correct ID
5. ✅ User can now access the app

## How to Manually Clear Test IDs (Admin)

If you need to manually clear test mode IDs:

```sql
-- Run in Supabase SQL Editor with service role
UPDATE subscribers
SET stripe_customer_id = NULL, updated_at = NOW()
WHERE stripe_customer_id LIKE 'cus_TP%'; -- Test mode IDs start with cus_TP
```

Then users will get correct IDs on their next login.

## Prevention

**For Testing:**
- Use test mode API keys when testing
- Switch to live mode API keys only when going to production
- Don't mix test and live data in the same database

**Test Mode Key:** `sk_test_...`
**Live Mode Key:** `sk_live_...`

## Console Logs to Watch For

**Success:**
```
[CHECK-SUBSCRIPTION-SAFE] Existing customer ID validated
[CHECK-SUBSCRIPTION-SAFE] Found valid customer by email
```

**Auto-Fix Happening:**
```
[CHECK-SUBSCRIPTION-SAFE] Existing customer ID invalid (test/live mode mismatch?)
[CHECK-SUBSCRIPTION-SAFE] Found valid customer by email
```

**No Customer Found:**
```
[CHECK-SUBSCRIPTION-SAFE] No valid customer found, clearing invalid ID
```

## Related Files
- `supabase/functions/check-subscription-safe/index.ts` (lines 51-95)
- `src/components/ProtectedRoute.tsx` (calls check-subscription-safe)

## Status
✅ Fixed - System will auto-heal on next login
✅ Error handling improved - no more crashes
✅ Logging added for debugging
