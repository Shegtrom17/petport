// Utility for generating consistent pet colors based on pet names
export const getPetBackgroundColor = (petName: string): string => {
  // Earth-tone palette - muted, sophisticated colors
  const earthPalette = [
    '#9ca3af', // gray
    '#a3b18a', // sage  
    '#d4a373', // clay
    '#e5e7eb', // stone
    '#b9a191', // taupe
  ];

  // Simple hash function to get consistent color for each pet name
  const hash = petName
    .toLowerCase()
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  return earthPalette[hash % earthPalette.length];
};