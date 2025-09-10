export const PRICING = {
  plans: [
    { id: "monthly", name: "Monthly", priceCents: 199, interval: "month", priceText: "$1.99/month", includes: "Includes 1 pet account" },
    { id: "yearly", name: "Yearly", priceCents: 1299, interval: "year", priceText: "$12.99/year", includes: "Includes 1 pet account" },
  ],
  addons: [
    { 
      id: "additional-pets", 
      name: "Additional Pet Accounts",
      getTierPrice: (quantity: number) => {
        if (quantity >= 5) return 260; // $2.60/slot for 5+
        return 399; // $3.99/slot for 1-4
      },
      getTierText: (quantity: number) => {
        if (quantity >= 5) return "$2.60/year per pet";
        return "$3.99/year per pet";
      },
      description: "Add capacity for more pets",
      maxQuantity: 20,
      tierBreakpoint: 5
    },
  ],
} as const;
