/**
 * Pet Data Safety Utilities
 * Prevents crashes from null/undefined pet fields
 */

export const safePetField = (value: string | null | undefined, fallback: string = ''): string => {
  return value?.trim() || fallback;
};

export const safeLowerCase = (value: string | null | undefined): string => {
  return (value ?? '').toLowerCase();
};

export const safeSpecies = (species: string | null | undefined): string => {
  return safePetField(species, 'pet');
};

export const safeBreed = (breed: string | null | undefined): string => {
  return safePetField(breed, 'Unknown breed');
};

export const isPetDataComplete = (pet: any): boolean => {
  return !!(
    pet?.name?.trim() &&
    pet?.species?.trim()
  );
};

export const getPetTypeLabel = (species: string | null | undefined): string => {
  const safe = safeLowerCase(species);
  switch (safe) {
    case 'dog': return 'Dog';
    case 'cat': return 'Cat';
    case 'horse': return 'Horse';
    default: return 'Pet';
  }
};
