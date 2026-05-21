import { addMonths } from 'date-fns';

/** India-style fiscal quarters: Q1 Apr–Jun, Q2 Jul–Sep, Q3 Oct–Dec, Q4 Jan–Mar */
export const FISCAL_QUARTER_LABELS = ['Apr-Jun', 'Jul-Sep', 'Oct-Dec', 'Jan-Mar'] as const;

export type FiscalQuarter = 1 | 2 | 3 | 4;

export interface FiscalQuarterInfo {
  quarter: FiscalQuarter;
  label: (typeof FISCAL_QUARTER_LABELS)[number];
  /** Calendar year of the first month in this quarter (Q4 uses FY start + 1). */
  startMonth: number;
  startYear: number;
  /** April year that starts the containing financial year. */
  fiscalYearStart: number;
  /** Year shown in UI labels (Q4 = fiscalYearStart + 1). */
  displayYear: number;
}

export const FISCAL_QUARTER_BUCKETS = [
  { quarter: 1 as const, name: 'Q1 (Apr-Jun)' as const, start: 3, end: 5 },
  { quarter: 2 as const, name: 'Q2 (Jul-Sep)' as const, start: 6, end: 8 },
  { quarter: 3 as const, name: 'Q3 (Oct-Dec)' as const, start: 9, end: 11 },
  { quarter: 4 as const, name: 'Q4 (Jan-Mar)' as const, start: 0, end: 2 },
] as const;

/** FY start year: Apr–Dec → calendar year; Jan–Mar → previous calendar year. */
export function getFiscalYearStartYear(date: Date): number {
  const month = date.getMonth();
  const year = date.getFullYear();
  return month >= 3 ? year : year - 1;
}

export function getFiscalQuarterFromDate(date: Date): FiscalQuarterInfo {
  const month = date.getMonth();
  const year = date.getFullYear();
  const fiscalYearStart = getFiscalYearStartYear(date);

  if (month >= 3 && month <= 5) {
    return {
      quarter: 1,
      label: 'Apr-Jun',
      startMonth: 3,
      startYear: year,
      fiscalYearStart,
      displayYear: fiscalYearStart,
    };
  }
  if (month >= 6 && month <= 8) {
    return {
      quarter: 2,
      label: 'Jul-Sep',
      startMonth: 6,
      startYear: year,
      fiscalYearStart,
      displayYear: fiscalYearStart,
    };
  }
  if (month >= 9 && month <= 11) {
    return {
      quarter: 3,
      label: 'Oct-Dec',
      startMonth: 9,
      startYear: year,
      fiscalYearStart,
      displayYear: fiscalYearStart,
    };
  }

  const q4Year = fiscalYearStart + 1;
  return {
    quarter: 4,
    label: 'Jan-Mar',
    startMonth: 0,
    startYear: q4Year,
    fiscalYearStart,
    displayYear: q4Year,
  };
}

export function formatFiscalQuarterLabel(date: Date): string {
  const { quarter, label, displayYear } = getFiscalQuarterFromDate(date);
  return `Q${quarter} (${label} ${displayYear})`;
}

export function formatFiscalQuarterBucketLabel(
  fiscalYearStart: number,
  quarter: FiscalQuarter
): string {
  const label = FISCAL_QUARTER_LABELS[quarter - 1];
  const displayYear = quarter === 4 ? fiscalYearStart + 1 : fiscalYearStart;
  return `Q${quarter} (${label} ${displayYear})`;
}

/** True when row belongs to FY starting `fiscalYearStart` (Apr–Mar). */
export function rowMatchesFiscalYear(
  row: { year?: number | null; monthIndex?: number | null },
  fiscalYearStart: number
): boolean {
  if (row.year == null || row.monthIndex == null) return true;
  return (
    (row.year === fiscalYearStart && row.monthIndex >= 3) ||
    (row.year === fiscalYearStart + 1 && row.monthIndex <= 2)
  );
}

/** True when row belongs to a specific fiscal quarter within FY `fiscalYearStart`. */
export function rowMatchesFiscalQuarter(
  row: { year?: number | null; monthIndex?: number | null },
  fiscalYearStart: number,
  quarterStartMonth: number,
  quarterEndMonth: number
): boolean {
  if (row.year == null || row.monthIndex == null) return false;
  if (quarterStartMonth >= 3) {
    return (
      row.year === fiscalYearStart &&
      row.monthIndex >= quarterStartMonth &&
      row.monthIndex <= quarterEndMonth
    );
  }
  return (
    row.year === fiscalYearStart + 1 &&
    row.monthIndex >= quarterStartMonth &&
    row.monthIndex <= quarterEndMonth
  );
}

export function fiscalQuarterStartDate(date: Date): Date {
  const { startMonth, startYear } = getFiscalQuarterFromDate(date);
  return new Date(startYear, startMonth, 1);
}

export function addFiscalQuarters(date: Date, quartersDelta: number): Date {
  return addMonths(fiscalQuarterStartDate(date), quartersDelta * 3);
}

export function previousFiscalQuarterStart(date: Date): Date {
  return addFiscalQuarters(date, -1);
}

/** GMT/UTC range for KPI/clinic APIs (matches existing monthly boundary convention). */
export function getFiscalQuarterUtcRange(date: Date): { startDate: number; endDate: number } {
  const { startMonth, startYear } = getFiscalQuarterFromDate(date);
  return {
    startDate: Date.UTC(startYear, startMonth, 0, 18, 30, 0, 0),
    endDate: Date.UTC(startYear, startMonth + 3, 0, 18, 29, 0, 0),
  };
}
