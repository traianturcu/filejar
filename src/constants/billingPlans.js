export const billingPlans = [
  {
    id: "free", // it's important that the free plan has the id "free" and that it exists
    name: "Free",
    description: "A free plan with basic features.",
    benefits: ["Feature 1", "Feature 2", "Feature 3"],
    price: "Free",
  },
  {
    id: "pro",
    name: "Pro",
    description: "A pro plan with advanced features.",
    benefits: ["Feature 1", "Feature 2", "Feature 3", "Feature 4"],
    price: "$9.99",
    amount: 9.99,
    trialDays: 14,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "An enterprise plan with all features.",
    benefits: ["Feature 1", "Feature 2", "Feature 3", "Feature 4", "Feature 5"],
    price: "$99.99",
    amount: 99.99,
    trialDays: 14,
  },
];
