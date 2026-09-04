function remainingUpi(total, cashAmount) {
  const t = Math.max(0, Math.round(Number(total) || 0));
  const cash = Math.max(0, Math.round(Number(cashAmount) || 0));
  return Math.max(0, t - cash);
}

function normalizeSplitPayment(total, splitPayment) {
  const t = Math.max(0, Math.round(Number(total) || 0));
  const cashAmount = Math.min(
    t,
    Math.max(0, Math.round(Number(splitPayment?.cashAmount) || 0))
  );
  return {
    cashAmount,
    upiAmount: remainingUpi(t, cashAmount),
  };
}

module.exports = { remainingUpi, normalizeSplitPayment };
