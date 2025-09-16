/**
 * Button styling utilities for consistent azure (#5691af) buttons with white text
 */

export const azureButtonClasses = {
  // Primary azure button - solid background
  primary: "bg-brand-primary text-white hover:bg-brand-primary-dark hover:text-white focus-visible:ring-brand-primary",
  
  // Outline azure button - transparent background with azure border
  outline: "border-brand-primary text-brand-primary bg-transparent hover:bg-brand-primary hover:text-white hover:border-brand-primary",
  
  // Secondary azure button - same as primary for consistency
  secondary: "bg-brand-primary text-white hover:bg-brand-primary-dark hover:text-white focus-visible:ring-brand-primary",
  
  // Ghost azure button - minimal styling
  ghost: "text-brand-primary hover:bg-brand-primary/10 hover:text-brand-primary",
}

/**
 * Get azure button classes for a specific variant
 */
export const getAzureButtonClasses = (variant: 'primary' | 'outline' | 'secondary' | 'ghost' = 'primary') => {
  return azureButtonClasses[variant]
}

/**
 * Quick fix function to apply azure styling to any button element
 */
export const applyAzureButtonStyling = (element: HTMLButtonElement, variant: 'primary' | 'outline' | 'secondary' | 'ghost' = 'primary') => {
  const classes = getAzureButtonClasses(variant).split(' ')
  element.classList.add(...classes)
}