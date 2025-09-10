/**
 * Pet Data Validation Utilities
 * Determines if a pet profile has complete "Pet Profile" information for optimal output
 */

export interface PetData {
  microchip_id?: string | null;
  microchipId?: string | null;
  sex?: string | null;
  breed?: string | null;
  species?: string | null;
  age?: string | null;
  weight?: string | null;
  registration_number?: string | null;
  registrationNumber?: string | null;
  name?: string | null;
}

export interface ProfileCompletenessResult {
  isComplete: boolean;
  missingCriticalFields: string[];
  missingOptionalFields: string[];
  completionScore: number; // 0-100
  qualityLevel: 'incomplete' | 'basic' | 'good' | 'complete';
}

// Critical fields required for professional PDFs and sharing
const CRITICAL_FIELDS = [
  { key: ['microchip_id', 'microchipId'], label: 'Microchip ID' },
  { key: ['sex'], label: 'Sex' },
  { key: ['breed'], label: 'Breed' },
  { key: ['species'], label: 'Species' }
];

// Important but not critical fields
const IMPORTANT_FIELDS = [
  { key: ['age'], label: 'Age' },
  { key: ['weight'], label: 'Weight' },
  { key: ['registration_number', 'registrationNumber'], label: 'Registration Number' }
];

/**
 * Checks if a field has a meaningful value (not empty, null, or just whitespace)
 */
const hasValue = (value: string | null | undefined): boolean => {
  return value !== null && value !== undefined && value.toString().trim() !== '';
};

/**
 * Gets the value from a pet object using multiple possible field names
 */
const getFieldValue = (pet: PetData, fieldKeys: string[]): string | null => {
  for (const key of fieldKeys) {
    const value = (pet as any)[key];
    if (hasValue(value)) {
      return value.toString().trim();
    }
  }
  return null;
};

/**
 * Analyzes pet profile completeness for Pet Profile fields
 */
export const analyzeProfileCompleteness = (pet: PetData | null | undefined): ProfileCompletenessResult => {
  if (!pet) {
    return {
      isComplete: false,
      missingCriticalFields: CRITICAL_FIELDS.map(f => f.label),
      missingOptionalFields: IMPORTANT_FIELDS.map(f => f.label),
      completionScore: 0,
      qualityLevel: 'incomplete'
    };
  }

  // Check critical fields
  const missingCriticalFields: string[] = [];
  const completeCriticalFields: string[] = [];
  
  CRITICAL_FIELDS.forEach(field => {
    const value = getFieldValue(pet, field.key);
    if (!hasValue(value)) {
      missingCriticalFields.push(field.label);
    } else {
      completeCriticalFields.push(field.label);
    }
  });

  // Check important fields
  const missingOptionalFields: string[] = [];
  const completeOptionalFields: string[] = [];
  
  IMPORTANT_FIELDS.forEach(field => {
    const value = getFieldValue(pet, field.key);
    if (!hasValue(value)) {
      missingOptionalFields.push(field.label);
    } else {
      completeOptionalFields.push(field.label);
    }
  });

  // Calculate completion score
  const totalFields = CRITICAL_FIELDS.length + IMPORTANT_FIELDS.length;
  const completeFields = completeCriticalFields.length + completeOptionalFields.length;
  const completionScore = Math.round((completeFields / totalFields) * 100);

  // Determine quality level
  let qualityLevel: 'incomplete' | 'basic' | 'good' | 'complete';
  const hasCriticalFields = missingCriticalFields.length === 0;
  const hasAllFields = missingCriticalFields.length === 0 && missingOptionalFields.length === 0;

  if (hasAllFields) {
    qualityLevel = 'complete';
  } else if (hasCriticalFields && completeOptionalFields.length >= 1) {
    qualityLevel = 'good';
  } else if (hasCriticalFields) {
    qualityLevel = 'basic';
  } else {
    qualityLevel = 'incomplete';
  }

  return {
    isComplete: missingCriticalFields.length === 0,
    missingCriticalFields,
    missingOptionalFields,
    completionScore,
    qualityLevel
  };
};

/**
 * Checks if pet profile is ready for professional PDF generation
 */
export const isPetReadyForPDF = (pet: PetData | null | undefined): boolean => {
  const analysis = analyzeProfileCompleteness(pet);
  return analysis.isComplete;
};

/**
 * Gets user-friendly message about profile completeness
 */
export const getCompletionMessage = (pet: PetData | null | undefined): string => {
  const analysis = analyzeProfileCompleteness(pet);
  
  if (analysis.qualityLevel === 'complete') {
    return "Your pet's profile is complete and ready for professional sharing!";
  }
  
  if (analysis.qualityLevel === 'good') {
    return `Great! Your profile is ${analysis.completionScore}% complete. Consider adding: ${analysis.missingOptionalFields.join(', ')}.`;
  }
  
  if (analysis.qualityLevel === 'basic') {
    return `Your profile has the essentials. Add ${analysis.missingOptionalFields.join(', ')} for an even better experience.`;
  }
  
  const missingFields = [...analysis.missingCriticalFields, ...analysis.missingOptionalFields];
  return `Complete your Pet Profile (${missingFields.join(', ')}) for optimal PDFs and sharing links.`;
};

/**
 * Gets the primary missing field for targeted user guidance
 */
export const getPrimaryMissingField = (pet: PetData | null | undefined): string | null => {
  const analysis = analyzeProfileCompleteness(pet);
  return analysis.missingCriticalFields[0] || analysis.missingOptionalFields[0] || null;
};