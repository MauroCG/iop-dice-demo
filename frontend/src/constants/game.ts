export const ROUND_DURATION_SECONDS = 30;
export const ROLLING_DURATION_SECONDS = 3;
export const RESOLVING_DURATION_SECONDS = 3;

export const BET_AMOUNT_USD = 0.10;
export const HOUSE_FEE_PERCENTAGE = 0.10; // 10% fee to the house

export interface NumberOdds {
  number: number;
  combinations: number; // out of 36
  probabilityPercent: number;
  multiplier: number;
}

export const DICE_ODDS_TABLE: Record<number, NumberOdds> = {
  2: { number: 2, combinations: 1, probabilityPercent: 2.78, multiplier: 30 },
  3: { number: 3, combinations: 2, probabilityPercent: 5.56, multiplier: 15 },
  4: { number: 4, combinations: 3, probabilityPercent: 8.33, multiplier: 10 },
  5: { number: 5, combinations: 4, probabilityPercent: 11.11, multiplier: 7.5 },
  6: { number: 6, combinations: 5, probabilityPercent: 13.89, multiplier: 6 },
  7: { number: 7, combinations: 6, probabilityPercent: 16.67, multiplier: 5 },
  8: { number: 8, combinations: 5, probabilityPercent: 13.89, multiplier: 6 },
  9: { number: 9, combinations: 4, probabilityPercent: 11.11, multiplier: 7.5 },
  10: { number: 10, combinations: 3, probabilityPercent: 8.33, multiplier: 10 },
  11: { number: 11, combinations: 2, probabilityPercent: 5.56, multiplier: 15 },
  12: { number: 12, combinations: 1, probabilityPercent: 2.78, multiplier: 30 },
};

export const VALID_DICE_NUMBERS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;
