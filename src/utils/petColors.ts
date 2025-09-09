// Utility for generating consistent pet colors based on pet names
export const getPetBackgroundColor = (petName: string): string => {
  // Enhanced palette with muted azure/aqua and sophisticated earth tones
  const colorPalette = [
    '#8da4b5', // muted azure (matches brand)
    '#7ba3b8', // soft aqua
    '#a3b18a', // sage green
    '#9ca3af', // gray-blue
    '#b5c4d1', // light azure
    '#d4a373', // warm clay
    '#a8b5c0', // steel blue-gray
    '#e5e7eb', // light stone
  ];

  // Simple hash function to get consistent color for each pet name
  const hash = petName
    .toLowerCase()
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  return colorPalette[hash % colorPalette.length];
};