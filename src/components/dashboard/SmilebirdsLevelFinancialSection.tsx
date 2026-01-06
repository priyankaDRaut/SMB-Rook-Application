import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  ComposedChart
} from 'recharts';
import { format } from 'date-fns';
import { Download, FileText, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { FinancialAnalyticsDialog } from './FinancialAnalyticsDialog';
import { FinancialFilters } from './FinancialFilters';
import { useCompanyFinancials } from '@/hooks/use-company-financials';
import { useClinicPerformanceComparison } from '@/hooks/use-clinic-performance-comparison';

interface FinancialTableRow {
  clinicName: string;
  zone: string;
  specialty: string;
  revenue: number;
  profitShare: number;
  capEx: number;
  ebitda: number;
  ebitdaPercentage: number;
  netProfit: number;
  breakevenStatus: 'Achieved' | 'Not Achieved' | 'Near';
}

interface ComparisonMetric {
  id: string;
  label: string;
  value: string;
  format: (value: number) => string;
}

const comparisonMetrics: ComparisonMetric[] = [
  {
    id: 'revenue',
    label: 'Revenue',
    value: 'revenue',
    format: (value) => `₹${(value / 100000).toFixed(2)}L`
  },
  {
    id: 'ebitda',
    label: 'EBITDA',
    value: 'ebitda',
    format: (value) => `₹${(value / 100000).toFixed(2)}L`
  },
  {
    id: 'netProfit',
    label: 'Net Profit',
    value: 'netProfit',
    format: (value) => `₹${(value / 100000).toFixed(2)}L`
  },
  {
    id: 'expense',
    label: 'Expenses',
    value: 'expense',
    format: (value) => `₹${(value / 100000).toFixed(2)}L`
  }
];

export const SmilebirdsLevelFinancialSection = () => {
  // Filter states
  const [filters, setFilters] = useState({
    selectedMonth: new Date(),
    comparisonMonth: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    analysisType: 'monthly' as 'monthly' | 'comparison',
    category: 'All',
    type: 'All',
    zone: 'All',
    clinic: 'All'
  });

  // New state for chart view options
  const [comparisonType, setComparisonType] = useState<'clinics' | 'zones'>('clinics');
  const [comparisonMetric, setComparisonMetric] = useState<'revenue' | 'expense' | 'netIncome'>('revenue');

  // New state for comparison section
  const [selectedMetric, setSelectedMetric] = useState<ComparisonMetric>(comparisonMetrics[0]);
  const [clinicSelectorOpen, setClinicSelectorOpen] = useState(false);

  // Analytics dialog states
  const [analyticsDialogOpen, setAnalyticsDialogOpen] = useState(false);
  const [analyticsType, setAnalyticsType] = useState<'expense' | 'revenue'>('expense');

  // Transform FinancialFilters to API period format
  const getApiPeriod = (filterState: {
    selectedMonth: Date;
    comparisonMonth?: Date;
    analysisType: 'monthly' | 'comparison';
    category: string;
    type: string;
    zone: string;
    clinic: string;
  }) => {
    // Check if it's current month and return simple period for current month
    const now = new Date();
    const isCurrentMonth = filterState.selectedMonth.getMonth() === now.getMonth() && 
                          filterState.selectedMonth.getFullYear() === now.getFullYear();
    
    if (isCurrentMonth && filterState.category === 'All' && filterState.type === 'All' && 
        filterState.zone === 'All' && filterState.clinic === 'All') {
      return 'current-month';
    }
    
    // Generate period with month-year format
    const monthYear = format(filterState.selectedMonth, 'yyyy-MM');
    
    // Add filter context for more specific API calls
    const contextParts = [];
    if (filterState.category !== 'All') contextParts.push(filterState.category.toLowerCase().replace(' ', '-'));
    if (filterState.type !== 'All') contextParts.push(filterState.type.toLowerCase().replace(' ', '-'));
    if (filterState.zone !== 'All') contextParts.push(filterState.zone.toLowerCase());
    if (filterState.clinic !== 'All') contextParts.push(filterState.clinic.toLowerCase().replace(' ', '-'));
    
    const context = contextParts.length > 0 ? `-${contextParts.join('-')}` : '';
    return `${monthYear}${context}`;
  };

  // Generate the API period parameter
  const apiPeriod = getApiPeriod(filters);
  
  console.log('🔧 Company Financials API Integration:', {
    filters,
    generatedPeriod: apiPeriod,
    timestamp: new Date().toISOString()
  });

  // Use the company financials API hook with transformed filters
  const { companyFinancialsData, loading: financialsLoading, error: financialsError, isUsingFallbackData } = useCompanyFinancials({
    period: apiPeriod
  });

  // Use the clinic performance comparison API hook
  const { clinicPerformanceData, loading: clinicPerformanceLoading, error: clinicPerformanceError, isUsingFallbackData: isUsingClinicFallbackData } = useClinicPerformanceComparison({
    period: apiPeriod
  });

  // Company revenue trend (API-only). Use dataList if backend provides a time-series.
  const companyRevenueData = useMemo(() => {
    const list = companyFinancialsData?.dataList;
    if (!Array.isArray(list)) return [];

    return list
      .map((row: any, idx: number) => {
        const month =
          row?.month ??
          row?.label ??
          row?.period ??
          row?.name ??
          `M${idx + 1}`;

        const totalRevenue = Number(
          row?.totalRevenue ??
          row?.revenue ??
          row?.totalNetworkRevenue ??
          0
        );

        const ebitda = Number(
          row?.ebitda ??
          row?.netIncome ??
          row?.ebit ??
          0
        );

        const ebitdaPercentage = totalRevenue > 0 ? (ebitda / totalRevenue) * 100 : 0;

        return {
          month: String(month),
          mainRevenue: totalRevenue / 100000, // lakhs
          additionalRevenue: 0,
          totalRevenue: totalRevenue / 100000, // lakhs
          ebitda: ebitda / 100000, // lakhs
          ebitdaPercentage,
          change: null,
        };
      })
      .filter((d) => d.month);
  }, [companyFinancialsData]);

  // Transform API data to financial table format
  const financialTableData: FinancialTableRow[] = useMemo(() => {
    if (!clinicPerformanceData?.data) {
      // API-only mode: no mock fallback.
      return [];
    }

    return clinicPerformanceData.data.map(clinic => {
      const ebitdaPercentage = clinic.revenue > 0 ? (clinic.ebitda / clinic.revenue) * 100 : 0;
      const breakevenStatus: 'Achieved' | 'Not Achieved' | 'Near' = 
        clinic.netProfit > 0 ? 'Achieved' : 
        clinic.netProfit > -100000 ? 'Near' : 'Not Achieved';

      return {
        clinicName: clinic.clinicName,
        zone: clinic.zone,
        specialty: clinic.specialty,
        revenue: clinic.revenue,
        profitShare: clinic.profitShare,
        capEx: clinic.capex,
        ebitda: clinic.ebitda,
        ebitdaPercentage: Math.round(ebitdaPercentage),
        netProfit: clinic.netProfit,
        breakevenStatus
      };
    });
  }, [clinicPerformanceData]);

  const costBreakdownData = [
    { category: 'Internal Costs', amount: 18.5, breakdown: 'HR, Training, Admin, Licenses' },
    { category: 'External Costs', amount: 12.3, breakdown: '3rd-party, SB Ops, CapEx' },
  ];

  // Transform API data to match the expected format
  const kpiData = useMemo(() => {
    if (!companyFinancialsData?.data) {
      console.log('🔄 Using fallback KPI data - no API data available');
      // Fallback data while loading or on error
      return {
        totalRevenue: 45.2,
        totalCosts: 30.8,
        ebit: 14.4,
        interest: 2.1,
        taxes: 3.6,
        netIncome: 8.7
      };
    }

    const apiData = companyFinancialsData.data;
    const transformedData = {
      totalRevenue: apiData.totalRevenue / 100000, // Convert to lakhs for display
      totalCosts: apiData.totalCosts / 100000,
      ebit: apiData.ebit / 100000,
      interest: apiData.interest / 100000,
      taxes: apiData.taxes / 100000,
      netIncome: apiData.netIncome / 100000
    };
    
    console.log('✨ Transformed KPI data:', {
      apiPeriod,
      selectedMonth: format(filters.selectedMonth, 'MMM yyyy'),
      activeFilters: {
        category: filters.category,
        type: filters.type,
        zone: filters.zone,
        clinic: filters.clinic
      },
      period: apiData.period,
      rawData: apiData,
      transformedData
    });
    
    return transformedData;
  }, [companyFinancialsData]);

  const internalCosts = [
    { name: 'HR Salaries', amount: 8.2, percentage: 44.3 },
    { name: 'Training & Development', amount: 2.1, percentage: 11.4 },
    { name: 'Admin Operations', amount: 3.8, percentage: 20.5 },
    { name: 'Software Licenses', amount: 1.9, percentage: 10.3 },
    { name: 'Internal Staff Ops', amount: 2.5, percentage: 13.5 }
  ];

  const externalCosts = [
    { name: '3rd-party Vendors', amount: 4.8, percentage: 39.0 },
    { name: 'SB Operational Fees', amount: 3.2, percentage: 26.0 },
    { name: 'Shared Clinic Services', amount: 2.7, percentage: 22.0 },
    { name: 'CapEx & Equipment', amount: 1.6, percentage: 13.0 }
  ];

  const [isFilterApplying, setIsFilterApplying] = useState(false);

  const handleFiltersChange = (newFilters: typeof filters, isLoading?: boolean) => {
    if (isLoading) {
      setIsFilterApplying(true);
    }
    console.log('🔄 Financial filters changed:', {
      oldFilters: filters,
      newFilters,
      oldPeriod: getApiPeriod(filters),
      newPeriod: getApiPeriod(newFilters)
    });
    setFilters(newFilters);
  };

  // Reset filter applying state when data is loaded
  React.useEffect(() => {
    if (isFilterApplying && !clinicPerformanceLoading && clinicPerformanceData) {
      setIsFilterApplying(false);
    }
  }, [isFilterApplying, clinicPerformanceLoading, clinicPerformanceData]);

  // Custom tooltip formatter for revenue chart
  const revenueTooltipFormatter = (value: number, name: string) => {
    const formattedValue = `₹${value}L`;
    const displayName = {
      mainRevenue: 'Main Revenue',
      additionalRevenue: 'Additional Revenue',
      totalRevenue: 'Total Revenue'
    }[name];
    return [formattedValue, displayName];
  };

  // Custom tooltip formatter for EBITDA chart
  const ebitdaTooltipFormatter = (value: number, name: string) => {
    if (name === 'ebitda') return [`₹${value}L`, 'EBITDA'];
    if (name === 'ebitdaPercentage') return [`${value}%`, 'EBITDA %'];
    return [value, name];
  };

  const handleExport = (type: 'csv' | 'pdf') => {
    // Implement export functionality
    console.log(`Exporting as ${type}`);
  };

  // Prepare comparison data based on selections
  const comparisonData = useMemo(() => {
    return financialTableData.map(clinicData => {
      return {
        clinicName: clinicData.clinicName,
        [selectedMetric.value]: clinicData[selectedMetric.value as keyof FinancialTableRow],
      };
    }).filter(Boolean);
  }, [selectedMetric, financialTableData]);

  // Show loading state for initial load
  if ((financialsLoading || clinicPerformanceLoading) && !companyFinancialsData) {
    return (
      <section className="space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Loading Company Financials</h2>
              <p className="text-muted-foreground">Please wait while we fetch the financial data...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Smilebird Company Financials</h2>
          <p className="text-gray-600 dark:text-gray-400">Comprehensive company-level financial overview</p>
        </div>
        <div className="flex items-center gap-4">
          {/* API Status Indicator */}
          {financialsLoading ? (
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <span className="text-xs text-blue-600 dark:text-blue-400">Loading...</span>
            </div>
          ) : isUsingFallbackData ? (
            <div className="flex items-center gap-2 px-3 py-1 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <span className="text-xs text-orange-600 dark:text-orange-400">Using fallback data</span>
            </div>
                      ) : companyFinancialsData ? (
              <div className="flex items-center gap-2 px-3 py-1 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <span className="text-xs text-green-600 dark:text-green-400">
                  Live API data - Period: {apiPeriod}
                </span>
              </div>
            ) : null}

          {/* Active Filters Indicator */}
          {(filters.category !== 'All' || filters.type !== 'All' || filters.zone !== 'All' || filters.clinic !== 'All') && (
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <span className="text-xs text-blue-600 dark:text-blue-400">
                Active Filters: {[
                  filters.category !== 'All' ? filters.category : null,
                  filters.type !== 'All' ? filters.type : null,
                  filters.zone !== 'All' ? filters.zone : null,
                  filters.clinic !== 'All' ? filters.clinic : null
                ].filter(Boolean).join(', ')}
              </span>
            </div>
          )}


        </div>
      </div>

      {/* Compact Financial Filters */}
      <FinancialFilters onFiltersChange={handleFiltersChange} />

      {/* Enhanced KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-all duration-200 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Revenue
              <span className="ml-2 text-xs text-gray-500">
                ({format(filters.selectedMonth, 'MMM yyyy')})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {financialsLoading ? (
              <div className="text-2xl font-bold text-gray-400 animate-pulse">Loading...</div>
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">₹{(kpiData.totalRevenue / 100000).toFixed(2)}L</div>
                <div className="flex items-center mt-2">
                  <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    +12.5%
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">vs last month</span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {((kpiData.totalRevenue / (kpiData.totalRevenue + kpiData.totalCosts)) * 100).toFixed(1)}% of total income
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Costs</CardTitle>
          </CardHeader>
          <CardContent>
            {financialsLoading ? (
              <div className="text-2xl font-bold text-gray-400 animate-pulse">Loading...</div>
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">₹{(kpiData.totalCosts / 100000).toFixed(2)}L</div>
                <div className="flex items-center mt-2">
                  <div className="flex items-center text-sm text-red-600 dark:text-red-400">
                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                    </svg>
                    +8.2%
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">vs last month</span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {((kpiData.totalCosts / kpiData.totalRevenue) * 100).toFixed(1)}% of revenue
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">EBITDA</CardTitle>
          </CardHeader>
          <CardContent>
            {financialsLoading ? (
              <div className="text-2xl font-bold text-gray-400 animate-pulse">Loading...</div>
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">₹{(kpiData.ebitda / 100000).toFixed(2)}L</div>
                <div className="flex items-center mt-2">
                  <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    +18.7%
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">vs last month</span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {((kpiData.ebitda / kpiData.totalRevenue) * 100).toFixed(1)}% margin
                </div>
              </>
            )}
          </CardContent>
        </Card>


        <Card className="hover:shadow-lg transition-all duration-200 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Net Income</CardTitle>
          </CardHeader>
          <CardContent>
            {financialsLoading ? (
              <div className="text-2xl font-bold text-gray-400 animate-pulse">Loading...</div>
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">₹{(kpiData.netIncome / 100000).toFixed(2)}L</div>
                <div className="flex items-center mt-2">
                  <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    +22.1%
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">vs last month</span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {((kpiData.netIncome / kpiData.totalRevenue) * 100).toFixed(1)}% margin
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Expense and Revenue Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-200 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg group"
          onClick={() => {
            setAnalyticsType('expense');
            setAnalyticsDialogOpen(true);
          }}
        >
          <CardHeader>
            <CardTitle className="text-lg font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Company Expense Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Complete expense breakdown across all operations
              </div>
              {financialsLoading ? (
                <div className="text-3xl font-bold text-gray-400 animate-pulse">Loading...</div>
              ) : (
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  ₹{(kpiData.totalCosts / 100000).toFixed(2)}L
                </div>
              )}
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Expense Ratio: <span className="font-semibold text-blue-600 dark:text-blue-400">{((kpiData.totalCosts / kpiData.totalRevenue) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-200 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg group"
          onClick={() => {
            setAnalyticsType('revenue');
            setAnalyticsDialogOpen(true);
          }}
        >
          <CardHeader>
            <CardTitle className="text-lg font-semibold group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
              Company Revenue Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Revenue streams from all operations
              </div>
              {financialsLoading ? (
                <div className="text-3xl font-bold text-gray-400 animate-pulse">Loading...</div>
              ) : (
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  ₹{(kpiData.totalRevenue / 100000).toFixed(2)}L
                </div>
              )}
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Net Margin: <span className="font-semibold text-green-600 dark:text-green-400">{((kpiData.netIncome / kpiData.totalRevenue) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Breakdown Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Revenue Breakdown</CardTitle>
            <p className="text-sm text-muted-foreground">Monthly revenue breakdown (₹L)</p>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={companyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="opacity-30" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    axisLine={{ stroke: '#E5E7EB' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    axisLine={{ stroke: '#E5E7EB' }}
                  />
                <Tooltip 
                  contentStyle={{ 
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value, name) => {
                      const formattedValue = `₹${value}L`;
                      const displayName = {
                        mainRevenue: 'Main Revenue',
                        additionalRevenue: 'Additional Revenue'
                      }[name] || name;
                      return [formattedValue, displayName];
                  }}
                />
                  <Legend />
                  <Bar
                    dataKey="mainRevenue"
                    stackId="revenue"
                    fill="#3b82f6"
                  name="Main Revenue"
                    radius={[0, 0, 0, 0]}
                />
                <Bar 
                  dataKey="additionalRevenue" 
                    stackId="revenue"
                    fill="#7dd3fc"
                  name="Additional Revenue"
                    radius={[4, 4, 0, 0]}
                />
                </BarChart>
            </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* EBITDA Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">EBITDA Performance</CardTitle>
            <p className="text-sm text-muted-foreground">Monthly EBITDA values (₹L)</p>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={companyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="opacity-30" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    axisLine={{ stroke: '#E5E7EB' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    axisLine={{ stroke: '#E5E7EB' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value, name) => {
                      if (name === 'ebitda') return [`₹${value}L`, 'EBITDA'];
                      return [value, name];
                    }}
                  />
                  <Bar
                    dataKey="ebitda"
                    fill="#4ade80"
                    name="EBITDA"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
                  </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Data Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Financial Performance by Clinic
            {isUsingClinicFallbackData && (
              <span className="text-xs text-muted-foreground ml-2">(Mock Data)</span>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            </div>
        </CardHeader>
        <CardContent>
          {clinicPerformanceLoading && !clinicPerformanceData ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center space-y-2">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                <p className="text-sm text-muted-foreground">Loading clinic performance data...</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto relative">
              {/* Loading Overlay */}
              {(isFilterApplying || clinicPerformanceLoading) && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-md">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Loading financial data...</p>
                  </div>
                </div>
              )}
              <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Clinic</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Zone</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Specialty</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">Revenue</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">Profit Share</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">CapEx</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">EBITDA</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">Net Profit</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">Status</th>
                </tr>
              </thead>
              <tbody>
                {financialTableData.map((row, index) => (
                  <tr
                    key={row.clinicName}
                    className={cn(
                      "hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors",
                      index % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50/50 dark:bg-gray-800/30"
                    )}
                  >
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{row.clinicName}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{row.zone}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{row.specialty}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-100">
                      ₹{(row.revenue / 100000).toFixed(2)}L
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-100">
                      {row.profitShare}%
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-100">
                      ₹{(row.capEx / 100000).toFixed(2)}L
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-gray-900 dark:text-gray-100">
                          ₹{(row.ebitda / 100000).toFixed(2)}L
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {row.ebitdaPercentage}%
                        </span>
            </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-100">
                      ₹{(row.netProfit / 100000).toFixed(2)}L
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Badge
                        className={cn(
                          "mx-auto",
                          row.breakevenStatus === 'Achieved' && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
                          row.breakevenStatus === 'Near' && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
                          row.breakevenStatus === 'Not Achieved' && "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                        )}
                      >
                        {row.breakevenStatus}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analytics Dialog */}
      <FinancialAnalyticsDialog
        isOpen={analyticsDialogOpen}
        onClose={() => setAnalyticsDialogOpen(false)}
        type={analyticsType}
      />
    </section>
  );
};
