/**
 * India-style financial year: 1 Apr → 31 Mar.
 * Returns 1 April of the FY that contains `date`.
 */
export function aprilFirstOfFinancialYearContaining(date: Date): Date {
  const y = date.getFullYear();
  const m = date.getMonth();
  const startYear = m >= 3 ? y : y - 1;
  return new Date(startYear, 3, 1);
}

/**
 * `aprilFirstFYStart` should be 1 April of the FY start year (e.g. 2026 for FY 2026-27).
 * Displays as FY (2026-27).
 */
export function formatFinancialYearAprMarLabel(aprilFirstFYStart: Date): string {
  const y = aprilFirstFYStart.getFullYear();
  return `FY (${y}-${String(y + 1).slice(-2)})`;
}
