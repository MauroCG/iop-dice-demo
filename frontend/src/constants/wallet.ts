export const DEMO_PAYMENT_POINTERS = [
  { pointer: '$ilp.rafiki.money/alice', label: 'Alice ($ilp.rafiki.money/alice)' },
  { pointer: '$ilp.gatehub.net/bob', label: 'Bob ($ilp.gatehub.net/bob)' },
  { pointer: '$ilp.chimoney.io/charlie', label: 'Charlie ($ilp.chimoney.io/charlie)' },
] as const;

export const PRESET_GRANT_AMOUNTS = [1.00, 3.00, 5.00, 10.00] as const;
export const DEFAULT_GRANT_AMOUNT = 5.00;
