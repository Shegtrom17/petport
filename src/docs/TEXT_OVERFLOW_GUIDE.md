# Text Overflow Prevention Guide

## Overview
This guide provides comprehensive solutions to prevent text overflow issues across your PWA. All components have been updated with responsive text sizing and safe overflow handling.

## New CSS Utilities

### Responsive Text Sizes
These classes automatically scale based on viewport size:
- `text-responsive-xs` - Scales from 0.625rem to 0.75rem
- `text-responsive-sm` - Scales from 0.75rem to 0.875rem  
- `text-responsive-base` - Scales from 0.875rem to 1rem
- `text-responsive-lg` - Scales from 1rem to 1.125rem
- `text-responsive-xl` - Scales from 1.125rem to 1.25rem
- `text-responsive-2xl` - Scales from 1.25rem to 1.5rem
- `text-responsive-3xl` - Scales from 1.5rem to 1.875rem

### Text Wrapping & Overflow
- `text-wrap-safe` - Enables proper word wrapping and hyphenation
- `text-ellipsis-2` - Truncates text to 2 lines with ellipsis
- `text-ellipsis-3` - Truncates text to 3 lines with ellipsis
- `container-safe` - Prevents container overflow with safe min-width
- `flex-safe` - Safe flex item that won't cause overflow

### Button-Specific Classes
- `btn-text-responsive` - Responsive button text that truncates on overflow
- `btn-text-responsive-wrap` - Responsive button text that wraps instead of truncating

## New React Components

### SafeText Component
Main component for preventing text overflow:

```tsx
import { SafeText } from "@/components/ui/safe-text";

// Basic usage
<SafeText>Your content here</SafeText>

// With size control
<SafeText size="lg">Larger responsive text</SafeText>

// With truncation
<SafeText truncate={2}>Text that truncates after 2 lines</SafeText>

// As different HTML element
<SafeText as="h2" size="xl">Heading text</SafeText>
```

### Specialized Components

#### SafeButtonText
For button content that needs overflow protection:
```tsx
import { SafeButtonText } from "@/components/ui/safe-text";

<Button>
  <SafeButtonText>Long button text that won't overflow</SafeButtonText>
</Button>
```

#### SafeBadgeText  
For badge content:
```tsx
import { SafeBadgeText } from "@/components/ui/safe-text";

<Badge>
  <SafeBadgeText>Badge content</SafeBadgeText>
</Badge>
```

#### SafeCardText
For card content with proper text handling:
```tsx
import { SafeCardText } from "@/components/ui/safe-text";

<Card>
  <SafeCardText heading>Card Title</SafeCardText>
  <SafeCardText>Card body content that wraps properly</SafeCardText>
</Card>
```

## Updated Core Components

### Button Component
- Now uses responsive text sizing
- Automatically prevents overflow
- Wraps text safely instead of creating overflow

### Badge Component  
- Uses responsive text sizing
- Prevents text overflow with ellipsis
- Maintains consistent appearance across screen sizes

### Bottom Navigation
- Tab labels now use responsive text
- Multi-line text support for longer labels
- Proper text wrapping on mobile

## Quick Fixes for Existing Components

### Method 1: Add Utility Classes
Add these classes to existing elements:
```tsx
// Before
<span className="text-sm">Some text</span>

// After  
<span className="text-responsive-sm text-wrap-safe">Some text</span>
```

### Method 2: Use createSafeTextClasses Helper
```tsx
import { createSafeTextClasses } from "@/components/ui/safe-text";

<span className={createSafeTextClasses("text-sm font-medium")}>
  Safe text content
</span>
```

### Method 3: Replace with SafeText Component
```tsx
// Before
<span className="text-sm text-gray-600">Description</span>

// After
<SafeText size="sm" className="text-gray-600">Description</SafeText>
```

## Common Problem Areas & Solutions

### Long Button Text
```tsx
// Problem: Button text overflows
<Button className="text-sm">Really Long Button Text That Overflows</Button>

// Solution 1: Use SafeButtonText
<Button>
  <SafeButtonText>Really Long Button Text That Overflows</SafeButtonText>
</Button>

// Solution 2: Add responsive classes
<Button className="btn-text-responsive">Really Long Button Text</Button>
```

### Card Content Overflow
```tsx
// Problem: Card content overflows
<CardContent>
  <p className="text-sm">Long content that might overflow the card boundaries</p>
</CardContent>

// Solution: Use SafeCardText or add safe classes
<CardContent className="card-content-safe">
  <SafeCardText>Long content that might overflow the card boundaries</SafeCardText>
</CardContent>
```

### Navigation Labels
```tsx
// Problem: Tab labels get cut off
<span className="text-xs">{longTabName}</span>

// Solution: Use responsive text with ellipsis
<SafeText size="xs" truncate={2} className="text-center">
  {longTabName}
</SafeText>
```

## Testing Your Fixes

1. **Desktop Testing**: Resize browser window from 1920px down to 1024px
2. **Mobile Testing**: Test on actual devices or browser dev tools at 375px, 414px, 768px
3. **Text Length Testing**: Use longer text strings to test boundaries
4. **Multi-language Testing**: Test with longer languages like German or Finnish

## Performance Notes

- Responsive text classes use `clamp()` which is well-supported in modern browsers
- Text wrapping utilities use native CSS properties for optimal performance  
- Components are lightweight and don't impact bundle size significantly

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support  
- Safari: Full support (iOS 13+)
- Older browsers: Graceful fallback to base font sizes

The responsive text sizing and overflow prevention is now active across your entire PWA!