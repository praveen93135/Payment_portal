export const products = [
  {
    id: "starter",
    name: "Starter Access",
    description: "A simple test product for learning Stripe Checkout.",
    amountMinor: 49900,
    currency: "inr"
  },
  {
    id: "pro",
    name: "Pro Access",
    description: "A higher-value test product for payment history practice.",
    amountMinor: 149900,
    currency: "inr"
  }
];

export function findProductById(productId) {
  return products.find((product) => product.id === productId);
}
