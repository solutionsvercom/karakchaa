export type SplitBillHalves = {
  cashAmount: number;
  upiAmount: number;
};

export function remainingUpi(total: number, cashAmount: number): number {
  const t = Math.max(0, Math.round(Number(total) || 0));
  const cash = Math.max(0, Math.round(Number(cashAmount) || 0));
  return Math.max(0, t - cash);
}

export function splitFromCash(
  total: number,
  cashAmount: number
): SplitBillHalves {
  const t = Math.max(0, Math.round(Number(total) || 0));
  const cash = Math.min(t, Math.max(0, Math.round(Number(cashAmount) || 0)));
  return { cashAmount: cash, upiAmount: remainingUpi(t, cash) };
}

export function formatSplitPaymentLabel(
  split?: SplitBillHalves | null
): string {
  if (!split) return "Split (Cash + UPI)";
  return `Split · Cash ₹${split.cashAmount} + UPI ₹${split.upiAmount}`;
}
