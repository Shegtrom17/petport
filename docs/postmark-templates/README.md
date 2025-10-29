# Postmark Email Templates for Gift Memberships

This directory contains HTML email templates for PetPort's gift membership system. All templates have been generated according to the specifications in `HOLIDAY_EMAIL_TEMPLATES.md`.

## Template Files

### Standard Templates (HOLIDAY_MODE=false)
1. `gift-notification.html` - Sent to recipient with redemption link
2. `gift-purchase-confirmation.html` - Sent to purchaser after payment
3. `gift-activated.html` - Sent after recipient redeems gift
4. `gift-renewal-reminder.html` - Used for 60, 30, and 7-day reminders
5. `gift-expired.html` - Sent when membership expires

### Holiday Templates (HOLIDAY_MODE=true)
1. `gift-notification-holiday.html`
2. `gift-purchase-confirmation-holiday.html`
3. `gift-activated-holiday.html`
4. `gift-renewal-reminder-holiday.html`
5. `gift-expired-holiday.html`

## How to Add Templates to Postmark

### Step 1: Access Postmark Dashboard
1. Go to https://account.postmarkapp.com/
2. Select your server (same one used for existing transactional emails)
3. Navigate to **Templates** in the sidebar

### Step 2: Create Each Template

For each template file:

1. Click **"Create Template"**
2. Enter the **Template Alias** (must match exactly):
   - Standard: `gift-notification`, `gift-purchase-confirmation`, etc.
   - Holiday: `gift-notification-holiday`, `gift-purchase-confirmation-holiday`, etc.

3. Set the **Subject Line**:
   - gift-notification: `🎁 You've Been Gifted PetPort!`
   - gift-notification-holiday: `🎁 You've Been Gifted PetPort — A Year of Pawsitivity!`
   - gift-purchase-confirmation: `✅ Gift Purchase Confirmed - PetPort`
   - gift-purchase-confirmation-holiday: `🎁 Your PetPort Gift Has Been Sent!`
   - gift-activated: `✅ Welcome to PetPort - Your Gift Membership Is Active`
   - gift-activated-holiday: `🎉 Your PetPort Gift Is Now Active!`
   - gift-renewal-reminder: `🎁 Your PetPort Gift Expires in {{days_remaining}} Days`
   - gift-renewal-reminder-holiday: `🎁 Your PetPort Gift Expires in {{days_remaining}} Days`
   - gift-expired: `Your PetPort Gift Membership Has Expired`
   - gift-expired-holiday: `Your PetPort Gift Membership Has Expired`

4. Copy the **HTML content** from the corresponding `.html` file
5. Paste into Postmark's HTML editor
6. Click **"Save Template"**
7. Test with sample data using Postmark's preview feature

### Step 3: Template Variables

All templates use Mustache syntax for variables. Postmark will automatically handle these:

```
{{sender_name}}
{{recipient_email}}
{{recipient_name}}
{{gift_message}}
{{redemption_link}}
{{gift_code}}
{{expires_at}}
{{days_remaining}}
```

### Step 4: Test Each Template

1. In Postmark, click **"Send Test Email"** on each template
2. Fill in sample data:
   ```json
   {
     "sender_name": "John Doe",
     "recipient_email": "test@example.com",
     "recipient_name": "Jane Smith",
     "gift_message": "Hope your pets love PetPort!",
     "redemption_link": "https://petport.app/redeem?code=TEST123",
     "gift_code": "TEST123",
     "expires_at": "December 25, 2025",
     "days_remaining": 30
   }
   ```
3. Send to your own email to verify rendering
4. Check on desktop, mobile, Gmail, Outlook, etc.

## Activating Holiday Mode

### Enable Holiday Templates (November-January)
```bash
# In Supabase Dashboard:
# Project Settings → Edge Functions → Secrets
# Find: HOLIDAY_MODE
# Set to: true
```

### Disable Holiday Templates (February-October)
```bash
# Same location
# Set HOLIDAY_MODE to: false
```

## Template Notes

### Renewal Reminders
The same template (`gift-renewal-reminder.html` or `-holiday.html`) is used for all three reminder intervals:
- 60 days before expiration
- 30 days before expiration
- 7 days before expiration

The `{{days_remaining}}` variable automatically adjusts the message.

### Design Features

**Standard Templates:**
- Purple/blue gradient headers
- Clean, professional design
- Focused on functionality

**Holiday Templates:**
- Red/gold/green festive colors
- Holiday emojis and decorative elements
- Warmer, more celebratory tone
- Special holiday footer messages

### Browser Compatibility

All templates use:
- Table-based layouts (best email client support)
- Inline CSS styles
- Linear gradients with fallback colors
- Responsive design for mobile devices

## Troubleshooting

### Templates Not Working?
1. Verify Template Alias matches exactly (case-sensitive)
2. Check that `HOLIDAY_MODE` environment variable is set correctly
3. Verify Postmark API key is configured in Supabase secrets
4. Check edge function logs for template selection

### Variables Not Rendering?
1. Ensure Mustache syntax is correct: `{{variable_name}}`
2. Check that edge function is passing all required variables
3. Test with Postmark's preview feature to isolate issues

### Styling Issues?
1. Test in multiple email clients (Gmail, Outlook, Apple Mail)
2. Use Postmark's preview feature to check rendering
3. Verify inline CSS is present (external stylesheets don't work in emails)

## Support

For questions about:
- **Template design**: See `HOLIDAY_EMAIL_TEMPLATES.md`
- **Edge function integration**: Check `supabase/functions/send-gift-email/index.ts`
- **Postmark API**: https://postmarkapp.com/support
