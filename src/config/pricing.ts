export const PRICING = {
  plans: [
    { id: "monthly", name: "Monthly", priceCents: 199, interval: "month", priceText: "$1.99/month", includes: "Includes 1 pet account" },
    { id: "yearly", name: "Yearly", priceCents: 1499, interval: "year", priceText: "$14.99/year", includes: "Includes 1 pet account" },
  ],
  addons: [
    { 
      id: "additional-pets", 
      name: "Additional Pet Accounts",
      getTierPrice: (quantity: number) => {
        return 399; // $3.99/year per pet - simplified flat rate
      },
      getTierText: (quantity: number) => {
        return "$3.99/year per pet";
      },
      description: "Add capacity for more pets",
      maxQuantity: 20,
    },
  ],
} as const;
