// Species-specific configuration for form fields and labels

export interface SpeciesFieldConfig {
  weightLabel: string;
  weightPlaceholder: string;
  heightLabel: string;
  heightPlaceholder: string;
  showHeight: boolean;
  showRegistration: boolean;
  registrationPlaceholder: string;
  sexOptions: { value: string; label: string }[];
}

const defaultSexOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "unknown", label: "Unknown" }
];

export const getSpeciesConfig = (species: string): SpeciesFieldConfig => {
  const normalizedSpecies = species.toLowerCase();

  switch (normalizedSpecies) {
    case "horse":
      return {
        weightLabel: "Weight (optional)",
        weightPlaceholder: "1,200 lbs (optional - many owners don't know exact weight)",
        heightLabel: "Height",
        heightPlaceholder: "15.2 hands",
        showHeight: true,
        showRegistration: true,
        registrationPlaceholder: "Registration papers, breed registry, etc.",
        sexOptions: [
          { value: "mare", label: "Mare" },
          { value: "gelding", label: "Gelding" },
          { value: "stallion", label: "Stallion" },
          { value: "filly", label: "Filly" },
          { value: "colt", label: "Colt" },
          { value: "unknown", label: "Unknown" }
        ]
      };

    case "dog":
      return {
        weightLabel: "Weight",
        weightPlaceholder: "65 lbs",
        heightLabel: "Height at shoulder",
        heightPlaceholder: "24 inches",
        showHeight: true,
        showRegistration: true,
        registrationPlaceholder: "AKC number, breed registry, etc.",
        sexOptions: [
          { value: "male", label: "Male" },
          { value: "female", label: "Female" },
          { value: "neutered_male", label: "Neutered Male" },
          { value: "spayed_female", label: "Spayed Female" },
          { value: "unknown", label: "Unknown" }
        ]
      };

    case "cat":
      return {
        weightLabel: "Weight",
        weightPlaceholder: "12 lbs",
        heightLabel: "Height",
        heightPlaceholder: "10 inches",
        showHeight: false, // Most cat owners don't track height
        showRegistration: true,
        registrationPlaceholder: "Breed registry, pedigree papers, etc.",
        sexOptions: [
          { value: "male", label: "Male" },
          { value: "female", label: "Female" },
          { value: "neutered_male", label: "Neutered Male" },
          { value: "spayed_female", label: "Spayed Female" },
          { value: "unknown", label: "Unknown" }
        ]
      };

    default:
      return {
        weightLabel: "Weight",
        weightPlaceholder: "Enter weight",
        heightLabel: "Height",
        heightPlaceholder: "Enter height",
        showHeight: false,
        showRegistration: false,
        registrationPlaceholder: "Registration number",
        sexOptions: defaultSexOptions
      };
  }
};

export const getSpeciesOptions = () => [
  { value: "dog", label: "Dog" },
  { value: "cat", label: "Cat" },
  { value: "horse", label: "Horse" },
  { value: "bird", label: "Bird" },
  { value: "reptile", label: "Reptile" },
  { value: "fish", label: "Fish" },
  { value: "rabbit", label: "Rabbit" },
  { value: "other", label: "Other" }
];