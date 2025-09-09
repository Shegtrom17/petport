// Utility for generating consistent pet colors based on pet names
export const getPetBackgroundColor = (petName: string): string => {
  // Enhanced palette with vibrant muted azure/aqua and sophisticated colors
  const colorPalette = [
    '#5691af', // brand azure (more vibrant)
    '#4a8db8', // deeper aqua
    '#6ba3c1', // lighter azure  
    '#7bb3d1', // soft blue-azure
    '#a3b18a', // sage green
    '#8db4a8', // sage-aqua
    '#d4a373', // warm clay
    '#b5a68a', // warm taupe
  ];

  // Simple hash function to get consistent color for each pet name
  const hash = petName
    .toLowerCase()
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  return colorPalette[hash % colorPalette.length];
};