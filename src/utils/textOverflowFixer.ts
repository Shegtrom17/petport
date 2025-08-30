// Utility functions to help fix text overflow across the PWA

export const getResponsiveTextClass = (originalClass: string): string => {
  const responsiveMap: Record<string, string> = {
    'text-xs': 'text-responsive-xs',
    'text-sm': 'text-responsive-sm', 
    'text-base': 'text-responsive-base',
    'text-lg': 'text-responsive-lg',
    'text-xl': 'text-responsive-xl',
    'text-2xl': 'text-responsive-2xl',
    'text-3xl': 'text-responsive-3xl',
  };
  
  return responsiveMap[originalClass] || originalClass;
};

export const addSafeTextClasses = (className: string): string => {
  return `${className} text-wrap-safe container-safe`;
};

export const createSafeButtonClasses = (baseClasses: string): string => {
  return `${baseClasses} text-wrap-safe overflow-hidden min-w-0`;
};

export const createSafeContainerClasses = (baseClasses: string): string => {
  return `${baseClasses} container-safe overflow-wrap-anywhere`;
};

// Common responsive text size combinations
export const responsiveTextSizes = {
  button: 'text-responsive-sm',
  buttonSmall: 'text-responsive-xs', 
  buttonLarge: 'text-responsive-base',
  badge: 'text-responsive-xs',
  label: 'text-responsive-sm',
  body: 'text-responsive-base',
  heading: 'text-responsive-lg',
  title: 'text-responsive-xl',
  display: 'text-responsive-2xl',
};

// Fix common overflow patterns
export const fixButtonOverflow = (content: string) => {
  // For very long button text, truncate with ellipsis
  if (content.length > 20) {
    return content.substring(0, 17) + '...';
  }
  return content;
};

export const createResponsiveSpanClasses = (size: keyof typeof responsiveTextSizes = 'body') => {
  return `${responsiveTextSizes[size]} text-wrap-safe inline-block max-w-full`;
};