export const PRICING = {
  plans: [
    { id: "monthly", name: "Monthly", priceCents: 199, interval: "month", priceText: "$1.99/month", includes: "Includes 1 pet account" },
    { id: "yearly", name: "Yearly", priceCents: 1299, interval: "year", priceText: "$12.99/year", includes: "Includes 1 pet account" },
  ],
  addons: [
    { id: "addon-1", count: 1, priceCents: 199, priceText: "$1.99/year" },
    { id: "addon-3", count: 3, priceCents: 599, priceText: "$5.99/year" },
    { id: "addon-5", count: 5, priceCents: 799, priceText: "$7.99/year" },
  ],
} as const;
