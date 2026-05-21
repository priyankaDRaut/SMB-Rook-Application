export type NetworkKpiAnalysisType =
  | 'monthly'
  | 'quarterly'
  | 'yearly'
  | 'financial_year'
  | 'comparison';

/**
 * Annualize period network revenue into ARR run-rate for the selected analysis window.
 * Monthly/comparison: ×12, quarterly: ×4, yearly/financial year: as-is.
 */
export function annualizeNetworkRevenueToARR(
  revenue: number | undefined,
  analysisType: NetworkKpiAnalysisType = 'monthly'
): number | undefined {
  if (revenue == null || !Number.isFinite(revenue)) {
    return undefined;
  }

  switch (analysisType) {
    case 'quarterly':
      return revenue * 4;
    case 'yearly':
    case 'financial_year':
      return revenue * 1;
    case 'monthly':
    case 'comparison':
    default:
      return revenue * 12;
  }
}

/**
 * Prefer API ARR when revenue is unavailable; otherwise derive from period revenue
 * so ARR tracks monthly / quarterly / yearly filters like total network revenue.
 */
export function resolveNetworkARR(
  revenue: number | undefined,
  apiArr: number | undefined,
  analysisType: NetworkKpiAnalysisType = 'monthly'
): number | undefined {
  const fromRevenue = annualizeNetworkRevenueToARR(revenue, analysisType);
  if (fromRevenue != null) {
    return fromRevenue;
  }
  return apiArr;
}
