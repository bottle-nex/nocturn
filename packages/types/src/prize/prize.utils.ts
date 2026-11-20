/// <reference lib="es2020.bigint" />

// Keep in sync with NocturnData::FEES and create_quiz.rs in the contract.
export const PRIZE_FEE_PERCENT = 1;
export const USDC_BASE_UNITS = 1_000_000;

export function isValidPrizePercentages(
  percentages: readonly number[],
): boolean {
  return (
    percentages.length > 0 &&
    percentages.every((p) => Number.isFinite(p) && p >= 0 && p <= 100) &&
    Math.abs(percentages.reduce((sum, p) => sum + p, 0) - 100) <= 0.01
  );
}

// Parse the decimal representation, including scientific notation, without
// introducing floating-point rounding into token amounts or percentage weights.
function decimalRatio(value: number): {
  numerator: bigint;
  denominator: bigint;
} {
  const [coefficient = "0", exponent = "0"] = value.toString().split("e");
  const decimals = coefficient.split(".")[1]?.length ?? 0;
  const scale = decimals - Number(exponent);
  const digits = BigInt(coefficient.replace(".", ""));
  const power = BigInt(`1${"0".repeat(Math.abs(scale))}`);
  return scale >= 0
    ? { numerator: digits, denominator: power }
    : {
        numerator: digits * power,
        denominator: BigInt(1),
      };
}

export function getNetPrizePoolBaseUnits(prizePool: number): bigint {
  if (!Number.isFinite(prizePool) || prizePool < 0) {
    throw new Error("Prize pool must be finite and non-negative");
  }
  const { numerator, denominator } = decimalRatio(prizePool);
  const gross = (numerator * BigInt(USDC_BASE_UNITS)) / denominator;
  if (gross > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new Error("Prize pool exceeds safe token precision");
  }
  // The deployed contract divides before multiplying; preserve that order.
  const fee = (gross / BigInt(100)) * BigInt(PRIZE_FEE_PERCENT);
  return gross - fee;
}

export function allocatePrizes<T extends { percentage: number }>(
  prizePool: number,
  distributions: readonly T[],
): (T & { amount: number; amountBaseUnits: bigint })[] {
  if (distributions.length === 0) return [];
  if (!isValidPrizePercentages(distributions.map((d) => d.percentage))) {
    throw new Error(
      "Prize percentages must be finite, between 0 and 100, and sum to 100",
    );
  }
  const net = getNetPrizePoolBaseUnits(prizePool);
  const ratios = distributions.map((distribution) => ({
    distribution,
    ...decimalRatio(distribution.percentage),
  }));
  const scale = ratios.reduce(
    (largest, ratio) =>
      ratio.denominator > largest ? ratio.denominator : largest,
    BigInt(1),
  );
  const weighted = ratios.map((ratio) => ({
    distribution: ratio.distribution,
    weight: ratio.numerator * (scale / ratio.denominator),
  }));
  const total = weighted.reduce((sum, { weight }) => sum + weight, BigInt(0));

  // Normalize accepted totals within the existing tolerance, then floor each
  // allocation. Any indivisible base units remain in escrow.
  return weighted.map(({ distribution, weight }) => {
    const amountBaseUnits = (net * weight) / total;
    return {
      ...distribution,
      amountBaseUnits,
      amount: Number(amountBaseUnits) / USDC_BASE_UNITS,
    };
  });
}
