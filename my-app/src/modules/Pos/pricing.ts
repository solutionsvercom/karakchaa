export type PricingItem = {
  price: number;
  quantity: number;
};

export type PricingSummary = {
  subtotal: number;
  discount: number;
  gstRate: number;
  taxableAmount: number;
  gstAmount: number;
  total: number;
};

const roundCurrency = (value: number) => Math.round((Number(value) || 0) * 100) / 100;

const clampNumber = (value: number, min = 0, max = Number.POSITIVE_INFINITY) => {
  const nextValue = Number(value) || 0;
  return Math.min(Math.max(nextValue, min), max);
};

export function calculatePricing(
  items: PricingItem[],
  discountType: "percentage" | "flat" = "percentage",
  discountValue = 0,
  gstRate = 0
): PricingSummary {
  const subtotal = roundCurrency(
    items.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0)
  );
  
  // Calculate discount based on type
  let computedDiscount = 0;
  if (discountType === "percentage") {
    const rawVal = clampNumber(discountValue, 0, 100);
    computedDiscount = (subtotal * rawVal) / 100;
  } else {
    computedDiscount = discountValue;
  }
  
  const normalizedDiscount = roundCurrency(clampNumber(computedDiscount, 0, subtotal));
  const taxableAmount = roundCurrency(Math.max(subtotal - normalizedDiscount, 0));
  const normalizedGstRate = roundCurrency(clampNumber(gstRate, 0, 100));
  const gstAmount = roundCurrency((taxableAmount * normalizedGstRate) / 100);
  const total = roundCurrency(taxableAmount + gstAmount);

  return {
    subtotal,
    discount: normalizedDiscount,
    gstRate: normalizedGstRate,
    taxableAmount,
    gstAmount,
    total,
  };
}
