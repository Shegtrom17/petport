export const PRICING = {
  plans: [
    { id: "monthly", name: "Monthly", priceCents: 199, interval: "month", priceText: "$1.99/month", includes: "Includes 1 pet account" },
    { id: "yearly", name: "Yearly", priceCents: 1299, interval: "year", priceText: "$12.99/year", includes: "Includes 1 pet account" },
  ],
  addons: [
    { 
      id: "addon-individual", 
      name: "Additional Pet Account",
      priceCents: 399, 
      priceText: "$3.99/year", 
      description: "Add as many as you need",
      maxQuantity: 10
    },
    { 
      id: "addon-bundle", 
      name: "Foster & Multi-Pet Bundle",
      count: 5, 
      priceCents: 1299, 
      priceText: "$12.99/year", 
      description: "Perfect for foster families & multi-pet households",
      savings: "Save $7"
    },
  ],
} as const;
