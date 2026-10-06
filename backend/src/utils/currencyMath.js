/**
 * Scale-Agnostic Financial Math Module using BigInt.
 * Prevents IEEE-754 floating point rounding errors across multi-currency assets (e.g. COP scale 0, USD scale 2).
 */

/**
 * Converts a decimal or integer amount to BigInt base units according to scale.
 * e.g., 0.10 USD with scale 2 -> 10n
 *       420 COP with scale 0 -> 420n
 *       5.50 EUR with scale 2 -> 550n
 */
export function toBaseUnits(amount, scale = 2) {
  if (typeof amount === 'bigint') return amount;
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) throw new Error(`Monto inválido para conversión a unidades base: ${amount}`);
  const multiplier = 10 ** scale;
  return BigInt(Math.round(num * multiplier));
}

/**
 * Converts BigInt base units back to a number with proper decimal scale.
 * e.g., 10n with scale 2 -> 0.10
 *       420n with scale 0 -> 420
 */
export function fromBaseUnits(baseUnits, scale = 2) {
  const b = typeof baseUnits === 'bigint' ? baseUnits : BigInt(baseUnits);
  const divisor = 10 ** scale;
  return Number(b) / divisor;
}

/**
 * Calculates the exact house cut (default 10%) using BigInt integer arithmetic.
 * Returns { houseFeeBaseUnits, netPoolBaseUnits }
 */
export function calculateHouseCut(totalPoolBaseUnits, feePercentage = 10) {
  const pool = typeof totalPoolBaseUnits === 'bigint' ? totalPoolBaseUnits : BigInt(totalPoolBaseUnits);
  if (pool <= 0n) {
    return { houseFeeBaseUnits: 0n, netPoolBaseUnits: 0n };
  }
  const feePct = BigInt(feePercentage);
  const houseFeeBaseUnits = (pool * feePct) / 100n;
  const netPoolBaseUnits = pool - houseFeeBaseUnits;
  return { houseFeeBaseUnits, netPoolBaseUnits };
}

/**
 * Splits net prize pool equally across matching winners.
 * Returns { payoutPerWinnerBaseUnits, remainderBaseUnits }
 */
export function splitPoolEqually(netPoolBaseUnits, winnerCount) {
  const pool = typeof netPoolBaseUnits === 'bigint' ? netPoolBaseUnits : BigInt(netPoolBaseUnits);
  if (winnerCount <= 0 || pool <= 0n) {
    return { payoutPerWinnerBaseUnits: 0n, remainderBaseUnits: pool };
  }
  const count = BigInt(winnerCount);
  const payoutPerWinnerBaseUnits = pool / count;
  const remainderBaseUnits = pool % count;
  return { payoutPerWinnerBaseUnits, remainderBaseUnits };
}
