function roundCurrency(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function clampNumber(value, min = 0, max = Number.POSITIVE_INFINITY) {
  const num = Number(value) || 0;
  return Math.min(Math.max(num, min), max);
}

function calculatePricing({ items = [], discount = 0, gstRate = 0 } = {}) {
  const subtotal = roundCurrency(
    items.reduce((sum, item) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 0;
      return sum + price * quantity;
    }, 0)
  );

  const normalizedDiscount = roundCurrency(clampNumber(discount, 0, subtotal));
  const taxableAmount = roundCurrency(Math.max(subtotal - normalizedDiscount, 0));
  const normalizedGstRate = roundCurrency(clampNumber(gstRate, 0, 100));
  const gstAmount = roundCurrency((taxableAmount * normalizedGstRate) / 100);
  const totalAmount = roundCurrency(taxableAmount + gstAmount);

  return {
    subtotal,
    discount: normalizedDiscount,
    gstRate: normalizedGstRate,
    taxableAmount,
    gstAmount,
    totalAmount,
  };
}

module.exports = {
  calculatePricing,
  roundCurrency,
};
