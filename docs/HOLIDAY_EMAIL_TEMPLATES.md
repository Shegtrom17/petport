# Holiday Email Templates Guide

This document outlines the Postmark email templates needed for the Gift Membership holiday mode feature.

## Template Toggle System

The system uses the `HOLIDAY_MODE` environment variable to switch between standard and holiday templates:
- **Standard templates**: Used when `HOLIDAY_MODE=false` (default)
- **Holiday templates**: Used when `HOLIDAY_MODE=true` (November-January)

## Template Naming Convention

All templates follow the pattern: `{base-name}` or `{base-name}-holiday`

Example:
- Standard: `gift-notification`
- Holiday: `gift-notification-holiday`

## Required Postmark Templates

### 1. Gift Purchase Confirmation
**Standard Template ID**: `gift-purchase-confirmation`  
**Holiday Template ID**: `gift-purchase-confirmation-holiday`

**Purpose**: Sent to purchaser after successful payment

**Variables**:
```json
{
  "sender_name": "John Doe",
  "recipient_email": "friend@example.com",
  "gift_message": "Hope your pets love PetPort!",
  "gift_code": "ABC12345",
  "redemption_link": "https://petport.app/redeem?code=ABC12345",
  "expires_at": "December 25, 2025"
}
```

**Holiday Subject**: `🎁 Your PetPort Gift Has Been Sent!`

**Holiday Email Ideas**:
- Red ribbon banner with PetPort logo in white/gold
- "You've gifted a year of pawsitivity!" heading
- Gift box or wrapped present imagery
- Festive colors: red, gold, forest green
- Snow or winter-themed decorative elements

---

### 2. Gift Notification (Recipient)
**Standard Template ID**: `gift-notification`  
**Holiday Template ID**: `gift-notification-holiday`

**Purpose**: Sent to recipient with redemption link

**Variables**:
```json
{
  "sender_name": "John Doe",
  "recipient_email": "friend@example.com",
  "recipient_name": "Jane Smith",
  "gift_message": "Hope your pets love PetPort!",
  "redemption_link": "https://petport.app/redeem?code=ABC12345",
  "gift_code": "ABC12345",
  "expires_at": "December 25, 2025"
}
```

**Holiday Subject**: `🎁 You've Been Gifted PetPort — A Year of Pawsitivity!`

**Holiday Email Design**:

**Header**:
- Red ribbon banner across top
- PetPort logo in white or gold
- Snowflake or paw print decorative elements

**Body**:
```
🎄 You've Been Gifted PetPort! 🎁

Finn and friends are wagging their tails! {{sender_name}} sent you a year 
of PetPort — the simplest way to keep your pet's story, care, and adventures 
in one place.

{{#if gift_message}}
Personal Message: "{{gift_message}}"
{{/if}}

🎁 Your Gift Includes:
• 12 months of unlimited pet profiles
• Care instructions & emergency contacts
• Medical records & vaccination tracking
• Beautiful photo galleries
• Travel maps & story streams
• Lost pet alert system

[Redeem My Gift 🎄]  ← Azure or gold button

Your gift code: {{gift_code}}
Expires: {{expires_at}}

🐾 Learn More About PetPort
[Visit PetPort.app] ← Link styled as text button
```

**Footer**:
- "Happy Holidays from the PetPort family!"
- Social links with festive icons
- Standard PetPort footer in muted holiday colors

---

### 3. Gift Activated
**Standard Template ID**: `gift-activated`  
**Holiday Template ID**: `gift-activated-holiday`

**Purpose**: Sent after recipient redeems gift

**Variables**:
```json
{
  "recipient_email": "friend@example.com",
  "recipient_name": "Jane Smith",
  "sender_name": "John Doe",
  "expires_at": "December 25, 2026"
}
```

**Holiday Subject**: `🎉 Your PetPort Gift Is Now Active!`

**Holiday Email Ideas**:
- Green "Success" banner with checkmark
- "Your gift has been unwrapped!" heading
- Celebrate with festive imagery
- Next steps for getting started

---

### 4. Gift Renewal Reminders

#### 60 Days Before Expiry
**Standard Template ID**: `gift-renewal-reminder-60`  
**Holiday Template ID**: `gift-renewal-reminder-60-holiday`

#### 30 Days Before Expiry
**Standard Template ID**: `gift-renewal-reminder-30`  
**Holiday Template ID**: `gift-renewal-reminder-30-holiday`

#### 7 Days Before Expiry
**Standard Template ID**: `gift-renewal-reminder-7`  
**Holiday Template ID**: `gift-renewal-reminder-7-holiday`

**Purpose**: Remind recipients to renew before expiry

**Variables**:
```json
{
  "recipient_email": "friend@example.com",
  "recipient_name": "Jane Smith",
  "expires_at": "December 25, 2025",
  "days_remaining": 60
}
```

**Holiday Subject**: `🎁 Your PetPort Gift Expires in {{days_remaining}} Days`

**Holiday Email Ideas**:
- Countdown timer visual
- "Keep the gift going" messaging
- Special holiday renewal discount (optional)

---

### 5. Gift Expired
**Standard Template ID**: `gift-expired`  
**Holiday Template ID**: `gift-expired-holiday`

**Purpose**: Notify recipient when gift membership expires

**Variables**:
```json
{
  "recipient_email": "friend@example.com",
  "recipient_name": "Jane Smith",
  "expires_at": "December 25, 2025"
}
```

**Holiday Subject**: `Your PetPort Gift Membership Has Expired`

**Holiday Email Ideas**:
- Gentle reminder with "We miss you!" tone
- Highlight what they'll lose access to
- Easy reactivation button
- Special "come back" offer (optional)

---

## Shared Template Variables

All templates use these variables:

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `sender_name` | string | No | Name of gift purchaser |
| `recipient_email` | string | Yes | Recipient's email |
| `recipient_name` | string | No | Recipient's name |
| `gift_message` | string | No | Personal message from sender |
| `redemption_link` | string | Yes* | Full URL to redeem gift |
| `gift_code` | string | Yes* | 8-character gift code |
| `expires_at` | string | Yes | Expiration date (formatted) |
| `days_remaining` | number | No | Days until expiration (reminders only) |

*Required for applicable templates

---

## Holiday Design Guidelines

### Colors
- **Primary Holiday**: `#c41e3a` (Christmas red)
- **Secondary Holiday**: `#d4af37` (Gold)
- **Accent Holiday**: `#0f5e3a` (Forest green)
- **Background**: `#fef9f3` (Warm cream)

### Typography
- Festive but readable fonts
- Avoid overly decorative fonts for body text
- Use holiday emojis sparingly (🎁 🎄 🐾)

### Imagery
- Snow/winter elements (not too heavy)
- Pet-themed holiday imagery (pets in scarves, etc.)
- Gift boxes and ribbons
- PetPort logo adapted with holiday colors

### Tone
- Warm and joyful
- Pet-focused ("pawsitivity", "tails wagging")
- Generous and inclusive
- Professional yet festive

---

## Creating Templates in Postmark

1. **Log in to Postmark Dashboard**: https://account.postmarkapp.com/
2. **Navigate to Templates**: Server → Templates
3. **Create New Template**: Click "Create Template"
4. **Name**: Use exact naming convention (e.g., `gift-notification-holiday`)
5. **Subject**: Use provided holiday subject lines
6. **HTML Content**: Design using Postmark's template editor
7. **Add Variables**: Use Mustache syntax `{{variable_name}}`
8. **Test**: Use "Send Test Email" with sample data
9. **Activate**: Set template as active

---

## Testing Checklist

- [ ] Create all 10 templates (5 standard + 5 holiday)
- [ ] Set `HOLIDAY_MODE=false` in Supabase
- [ ] Test gift purchase → verify standard template
- [ ] Test gift notification → verify standard template
- [ ] Set `HOLIDAY_MODE=true` in Supabase
- [ ] Test gift purchase → verify holiday template
- [ ] Test gift notification → verify holiday template
- [ ] Verify all template variables render correctly
- [ ] Check responsive design on mobile
- [ ] Test with/without optional variables (gift_message, sender_name)

---

## Activating Holiday Mode

**To Enable** (November):
1. Go to Supabase Dashboard → Project Settings → Edge Functions → Secrets
2. Find `HOLIDAY_MODE` secret
3. Change value to `true`
4. Save

**To Disable** (January):
1. Same steps as above
2. Change value to `false`
3. Save

**Effect**: Immediate - all new gift emails will use holiday templates

---

## Future Enhancements

Consider adding templates for:
- Other holidays (Valentine's Day, Mother's Day)
- Birthday gift notifications
- Anniversary reminders
- Seasonal themes (Spring, Summer, Fall)
