import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';
import { ClinicFilters } from './ClinicFilters';
import { FilterState } from '@/types/dashboard';
import { ClinicComparisonKPICard, ClinicKPICard } from './ClinicComparisonKPICard';
import { IndianRupee, TrendingUp, Activity, Users, Building2, Target } from 'lucide-react';
import { NetworkCostTable } from './NetworkCostTable';
import { format } from 'date-fns';
import { FinancialAnalyticsDialog } from './FinancialAnalyticsDialog';
import { useClinicFinancials } from '@/hooks/use-clinic-financials';

export const ClinicLevelFinancialSection = () => {
  const [filters, setFilters] = useState<FilterState>({
    selectedMonth: new Date(),
    comparisonMonth: null,
    isComparisonMode: false,
    clinicStatus: 'All',
    revenueCategory: 'All',
    operatoriesRange: 'All',
    clinicName: '',
    city: '',
    zone: '',
    specialty: '',
    doctor: ''
  });

  // Analytics dialog states
  const [analyticsDialogOpen, setAnalyticsDialogOpen] = useState(false);
  const [analyticsType, setAnalyticsType] = useState<'expense' | 'revenue'>('expense');

  // --- API Integration ---
  // Helper to get date range for API
  const getDateRange = (date: Date) => {
    const year = date.getUTCFullYear();
    const monthIndex = date.getUTCMonth();

    // Use GMT/UTC-based timestamps for API
    const startOfMonth = Date.UTC(year, monthIndex, 0, 18, 30, 0, 0);
    // End of month at 11:59 PM GMT
    const endOfMonth = Date.UTC(year, monthIndex + 1, 0, 18, 29, 0, 0);

    return {
      startDate: startOfMonth.toString(),
      endDate: endOfMonth.toString()
    };
  };
  // Use clinicName as clinicId (or fallback to)
  const clinicId = filters.clinicName;
  const { startDate, endDate } = getDateRange(filters.selectedMonth);
  const { clinicFinancialsData, loading: apiLoading, error: apiError, isUsingFallbackData } = useClinicFinancials({
    clinicId,
    startDate,
    endDate
  });

  // Transform API data for display
  const kpiData = clinicFinancialsData?.data
    ? {
        totalRevenue: clinicFinancialsData.data.totalRevenue / 100000,
        totalCosts: clinicFinancialsData.data.totalCosts / 100000,
        netIncome: clinicFinancialsData.data.netIncome / 100000,
        ebit: clinicFinancialsData.data.ebit / 100000,
        interest: clinicFinancialsData.data.interest / 100000,
        taxes: clinicFinancialsData.data.taxes / 100000,
        period: clinicFinancialsData.data.period
      }
    : null;

  // Generate dynamic financial data based on filters
  const generateFinancialData = (month: Date) => {
    const baseMultiplier = 0.8 + Math.random() * 0.4;
    const seasonalMultiplier = Math.sin((month.getMonth() + 1) * Math.PI / 6) * 0.15 + 1;
    const finalMultiplier = baseMultiplier * seasonalMultiplier;
    
    return {
      totalRevenue: 30.2 * finalMultiplier,
      totalCosts: 22.8 * finalMultiplier,
      netIncome: 7.4 * finalMultiplier,
      totalClinics: 5,
      profitMargin: ((7.4 * finalMultiplier) / (30.2 * finalMultiplier)) * 100,
      costs: { 
        staff: 12.5 * finalMultiplier, 
        utilities: 3.1 * finalMultiplier, 
        equipment: 3.8 * finalMultiplier, 
        marketing: 2.4 * finalMultiplier, 
        other: 1.0 * finalMultiplier 
      }
    };
  };

  const generateMonthlyRevenueData = (selectedMonth: Date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const year = selectedMonth.getFullYear();
    
    return months.map(month => ({
      month,
      revenue: 26.8 + Math.random() * 8,
      expenses: 20.2 + Math.random() * 6,
      profit: 6.6 + Math.random() * 2.8
    }));
  };

  const primaryData = generateFinancialData(filters.selectedMonth);
  const secondaryData = filters.comparisonMonth ? generateFinancialData(filters.comparisonMonth) : null;
  const monthlyRevenueData = generateMonthlyRevenueData(filters.selectedMonth);

  const calculateChange = (primary: number, secondary: number) => {
    if (secondary === 0) return 0;
    return ((primary - secondary) / secondary) * 100;
  };

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const costBreakdownData = [
    { category: 'Staff', amount: primaryData.costs.staff, color: '#3b82f6' },
    { category: 'Utilities', amount: primaryData.costs.utilities, color: '#06b6d4' },
    { category: 'Equipment', amount: primaryData.costs.equipment, color: '#10b981' },
    { category: 'Marketing', amount: primaryData.costs.marketing, color: '#f59e0b' },
    { category: 'Other', amount: primaryData.costs.other, color: '#8b5cf6' },
  ];

  const totalCosts = Object.values(primaryData.costs).reduce((sum, cost) => sum + cost, 0);

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Clinic Network Financial Overview</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Financial metrics for {format(filters.selectedMonth, 'MMMM yyyy')}
            {filters.isComparisonMode && filters.comparisonMonth && (
              <span> vs {format(filters.comparisonMonth, 'MMMM yyyy')}</span>
            )}
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">Network Size</div>
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{primaryData.totalClinics} Clinics</div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="space-y-4">
        <ClinicFilters
          onFiltersChange={handleFiltersChange}
          showContextLabels={false}
        />
      </div>

      {/* Key Network Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filters.isComparisonMode && secondaryData && filters.comparisonMonth ? (
          <>
            <ClinicComparisonKPICard
              title="Total Network Revenue"
              primaryValue={primaryData.totalRevenue}
              secondaryValue={secondaryData.totalRevenue}
              primaryDate={filters.selectedMonth}
              secondaryDate={filters.comparisonMonth}
              change={calculateChange(primaryData.totalRevenue, secondaryData.totalRevenue)}
              changeLabel="revenue change"
              icon={<IndianRupee className="h-4 w-4" />}
              valueFormatter={(value) => `₹${(value / 100000).toFixed(2)}L`}
            />
            <ClinicComparisonKPICard
              title="Total Network Costs"
              primaryValue={totalCosts}
              secondaryValue={Object.values(secondaryData.costs).reduce((sum, cost) => sum + cost, 0)}
              primaryDate={filters.selectedMonth}
              secondaryDate={filters.comparisonMonth}
              change={calculateChange(totalCosts, Object.values(secondaryData.costs).reduce((sum, cost) => sum + cost, 0))}
              changeLabel="cost change"
              icon={<TrendingUp className="h-4 w-4" />}
              valueFormatter={(value) => `₹${(value / 100000).toFixed(2)}L`}
            />
            <ClinicComparisonKPICard
              title="Net Income"
              primaryValue={primaryData.netIncome}
              secondaryValue={secondaryData.netIncome}
              primaryDate={filters.selectedMonth}
              secondaryDate={filters.comparisonMonth}
              change={calculateChange(primaryData.netIncome, secondaryData.netIncome)}
              changeLabel="income change"
              icon={<Users className="h-4 w-4" />}
              valueFormatter={(value) => `₹${(value / 100000).toFixed(2)}L`}
            />
            <ClinicComparisonKPICard
              title="Profit Margin"
              primaryValue={primaryData.profitMargin}
              secondaryValue={secondaryData.profitMargin}
              primaryDate={filters.selectedMonth}
              secondaryDate={filters.comparisonMonth}
              change={calculateChange(primaryData.profitMargin, secondaryData.profitMargin)}
              changeLabel="margin change"
              icon={<Target className="h-4 w-4" />}
              valueFormatter={(value) => `${value.toFixed(1)}%`}
            />
          </>
        ) : (
          <>
            <ClinicKPICard
              title="Total Network Revenue"
              value={`₹${(primaryData.totalRevenue / 100000).toFixed(2)}L`}
              change={8.5}
              changeLabel="vs last month"
              icon={<IndianRupee className="h-4 w-4" />}
              selectedMonth={filters.selectedMonth}
            />
            <ClinicKPICard
              title="Total Network Costs"
              value={`₹${(totalCosts / 100000).toFixed(2)}L`}
              change={-3.2}
              changeLabel="vs last month"
              icon={<TrendingUp className="h-4 w-4" />}
              selectedMonth={filters.selectedMonth}
            />
            <ClinicKPICard
              title="Net Income"
              value={`₹${(primaryData.netIncome / 100000).toFixed(2)}L`}
              change={12.4}
              changeLabel="vs last month"
              icon={<Users className="h-4 w-4" />}
              selectedMonth={filters.selectedMonth}
            />
            <ClinicKPICard
              title="Profit Margin"
              value={`${primaryData.profitMargin.toFixed(1)}%`}
              change={2.8}
              changeLabel="vs last month"
              icon={<Target className="h-4 w-4" />}
              selectedMonth={filters.selectedMonth}
            />
          </>
        )}
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
              Clinic Network Expense Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Complete expense breakdown across clinic network
              </div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                ₹{(totalCosts / 100000).toFixed(2)}L
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Expense Ratio: <span className="font-semibold text-blue-600 dark:text-blue-400">{((totalCosts / primaryData.totalRevenue) * 100).toFixed(1)}%</span>
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
              Clinic Network Revenue Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Revenue streams from clinic network
              </div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                ₹{(primaryData.totalRevenue / 100000).toFixed(2)}L
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Net Margin: <span className="font-semibold text-green-600 dark:text-green-400">{((primaryData.netIncome / primaryData.totalRevenue) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Network Revenue Trend */}
        <Card className="rounded-xl shadow-md bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-200 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">
              Network Revenue Trend
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                - {format(filters.selectedMonth, 'yyyy')}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyRevenueData}>
                <defs>
                  <linearGradient id="colorNetworkRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02}/>
                  </linearGradient>
                  <linearGradient id="colorNetworkExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02}/>
                  </linearGradient>
                  <linearGradient id="colorNetworkProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.02}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  axisLine={{ stroke: '#E5E7EB' }}
                />
                <YAxis 
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  axisLine={{ stroke: '#E5E7EB' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    padding: '8px 12px',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                  labelStyle={{
                    color: '#374151',
                    fontWeight: '600',
                    marginBottom: '4px'
                  }}
                  formatter={(value, name) => [
                    `₹${((value as number) / 100000).toFixed(2)}L`, 
                    name === 'revenue' ? 'Revenue' : 
                    name === 'expenses' ? 'Expenses' : 'Profit'
                  ]}
                  labelFormatter={(label) => `${label} ${format(filters.selectedMonth, 'yyyy')}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorNetworkRevenue)"
                  dot={false}
                  activeDot={{ r: 6, fill: '#3b82f6' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorNetworkExpenses)"
                  dot={false}
                  activeDot={{ r: 6, fill: '#ef4444' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorNetworkProfit)"
                  dot={false}
                  activeDot={{ r: 6, fill: '#10b981' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Network Cost Breakdown */}
        <Card className="rounded-xl shadow-md bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-200 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">
              Network Cost Breakdown
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                - {format(filters.selectedMonth, 'MMMM yyyy')}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={costBreakdownData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="category" 
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  axisLine={{ stroke: '#E5E7EB' }}
                />
                <YAxis 
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  axisLine={{ stroke: '#E5E7EB' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    padding: '8px 12px',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                  labelStyle={{
                    color: '#374151',
                    fontWeight: '600',
                    marginBottom: '4px'
                  }}
                  formatter={(value) => [`₹${((value as number) / 100000).toFixed(2)}L`, 'Cost']}
                  labelFormatter={(label) => `${label} - ${format(filters.selectedMonth, 'MMM yyyy')}`}
                />
                <Bar 
                  dataKey="amount" 
                  fill="#3b82f6" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Network Cost Analysis */}
      <NetworkCostTable 
        selectedMonth={filters.selectedMonth}
        onMonthChange={(date) => setFilters({ ...filters, selectedMonth: date })}
      />

      {/* Network Performance Summary */}
      <Card className="rounded-xl shadow-md bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-200 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100">
            Network Performance Summary
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
              - {format(filters.selectedMonth, 'MMMM yyyy')}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ₹{((primaryData.totalRevenue / primaryData.totalClinics) / 100000).toFixed(2)}L
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Average Revenue per Clinic</div>
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                {format(filters.selectedMonth, 'MMM yyyy')}
              </div>
            </div>
            <div className="text-center p-4 bg-blue-200 dark:bg-blue-800/20 rounded-lg hover:bg-blue-300 dark:hover:bg-blue-700/30 transition-colors">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ₹{((primaryData.netIncome / primaryData.totalClinics) / 100000).toFixed(2)}L
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Average Profit per Clinic</div>
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                {format(filters.selectedMonth, 'MMM yyyy')}
              </div>
            </div>
            <div className="text-center p-4 bg-blue-300 dark:bg-blue-700/20 rounded-lg hover:bg-blue-400 dark:hover:bg-blue-600/30 transition-colors">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ₹{((totalCosts / primaryData.totalClinics) / 100000).toFixed(2)}L
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Average Costs per Clinic</div>
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                {format(filters.selectedMonth, 'MMM yyyy')}
              </div>
            </div>
          </div>
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
