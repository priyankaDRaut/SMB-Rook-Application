
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Area, AreaChart } from 'recharts';
import { format } from 'date-fns';
import { useFinancialOverview } from '@/hooks/use-financial-overview';
import { useClinicPerformanceComparison } from '@/hooks/use-clinic-performance-comparison';

interface FinancialOverviewSectionProps {
  clinicId?: string;
  period?: string;
}

export const FinancialOverviewSection = ({ clinicId, period }: FinancialOverviewSectionProps) => {
  const currentMonth = new Date();
  
  // Fetch financial overview data
  const { financialOverviewData, loading: overviewLoading, error: overviewError } = useFinancialOverview({
    clinicId,
    period
  });

  // Fetch clinic performance comparison data for profitability drilldowns
  const { clinicPerformanceData, loading: performanceLoading } = useClinicPerformanceComparison({
    period
  });
  
  // Process financial overview data
  const financialData = useMemo(() => {
    if (!financialOverviewData?.data) {
      return {
        totalRevenue: 0,
        totalExpenses: 0,
        totalProfit: 0,
        profitPercentage: 0,
        ebitdaPercentage: 0
      };
    }

    const data = financialOverviewData.data;
    const ebitdaPercentage = data.totalRevenue > 0 ? ((data.totalRevenue - data.totalExpenses) / data.totalRevenue) * 100 : 0;

    return {
      totalRevenue: data.totalRevenue / 100000, // Convert to lakhs
      totalExpenses: data.totalExpenses / 100000,
      totalProfit: data.totalProfit / 100000,
      profitPercentage: data.profitPercentage,
      ebitdaPercentage
    };
  }, [financialOverviewData]);

  // Process clinic performance data for profitability drilldowns
  const { topClinics, bottomClinics } = useMemo(() => {
    if (!clinicPerformanceData?.data) {
      return {
        topClinics: [],
        bottomClinics: []
      };
    }

    const clinics = clinicPerformanceData.data
      .map(clinic => ({
        name: clinic.clinicName,
        revenue: `₹${(clinic.revenue / 100000).toFixed(2)}L`,
        ebitda: `${((clinic.ebitda / clinic.revenue) * 100).toFixed(0)}%`,
        ebitdaValue: clinic.ebitda / clinic.revenue
      }))
      .sort((a, b) => b.ebitdaValue - a.ebitdaValue);

    const topCount = Math.min(3, Math.ceil(clinics.length / 2));
    const topClinics = clinics.slice(0, topCount);
    const bottomClinics = clinics.slice(-Math.min(2, clinics.length - topCount));

    return { topClinics, bottomClinics };
  }, [clinicPerformanceData]);

  // Revenue trend data (API-only). Use dataList if the backend provides a time-series.
  const revenueTrendData = useMemo(() => {
    const list = financialOverviewData?.dataList;
    if (!Array.isArray(list)) return [];

    return list
      .map((row: any) => {
        const month =
          row?.month ??
          row?.label ??
          row?.period ??
          row?.name ??
          '';
        const revenue =
          row?.totalRevenue ??
          row?.revenue ??
          row?.totalNetworkRevenue ??
          0;

        return {
          month: String(month),
          revenue: Number(revenue) / 100000, // lakhs
        };
      })
      .filter((d) => d.month && Number.isFinite(d.revenue));
  }, [financialOverviewData]);

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Financial Overview</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing data for: <span className="font-medium text-blue-600 dark:text-blue-400">{format(currentMonth, 'MMMM yyyy')}</span>
        </p>
      </div>
      <div className="space-y-6">
        {/* Revenue Trend - Full Width */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">Monthly Revenue Trend</CardTitle>
            <p className="text-xs text-gray-500 dark:text-gray-400">Data for {format(currentMonth, 'MMMM yyyy')}</p>
          </CardHeader>
          <CardContent>
            {revenueTrendData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                No revenue trend data available from API.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueTrendData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" className="text-gray-600 dark:text-gray-400" />
                  <YAxis className="text-gray-600 dark:text-gray-400" />
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
                    formatter={(value) => [`₹${value}L`, 'Revenue']} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    dot={false}
                    activeDot={{ r: 6, fill: '#3b82f6' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Two Column Grid for EBITDA and Profitability */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* EBITDA Summary */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-100">EBITDA Summary</CardTitle>
              <p className="text-xs text-gray-500 dark:text-gray-400">Current month: {format(currentMonth, 'MMMM yyyy')}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Main EBITDA Display */}
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                    {overviewLoading ? '...' : `${financialData.ebitdaPercentage.toFixed(1)}%`}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Current EBITDA</div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Target: 20%</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      Gap: {overviewLoading ? '...' : `${(20 - financialData.ebitdaPercentage).toFixed(1)}%`}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 relative">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                      style={{ width: `${Math.min(100, (financialData.ebitdaPercentage / 20) * 100)}%` }}
                    ></div>
                    <div className="absolute top-0 right-0 w-0.5 h-3 bg-gray-400" style={{ left: '95%' }}></div>
                  </div>
                </div>

                {/* Additional Metrics Grid */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                      {overviewLoading ? '...' : `₹${(financialData.totalProfit / 100000).toFixed(2)}L`}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Total Profit</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                      {overviewLoading ? '...' : `+${financialData.profitPercentage.toFixed(1)}%`}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Profit Margin</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                      {overviewLoading ? '...' : `₹${(financialData.totalRevenue / 100000).toFixed(2)}L`}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Total Revenue</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                      {overviewLoading ? '...' : `₹${(financialData.totalExpenses / 100000).toFixed(2)}L`}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Total Expenses</div>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center justify-center pt-2">
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                    financialData.ebitdaPercentage >= 20 
                      ? 'bg-green-50 dark:bg-green-900/20' 
                      : financialData.ebitdaPercentage >= 15 
                      ? 'bg-yellow-50 dark:bg-yellow-900/20' 
                      : 'bg-red-50 dark:bg-red-900/20'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      financialData.ebitdaPercentage >= 20 
                        ? 'bg-green-500' 
                        : financialData.ebitdaPercentage >= 15 
                        ? 'bg-yellow-500' 
                        : 'bg-red-500'
                    }`}></div>
                    <span className={`text-sm font-medium ${
                      financialData.ebitdaPercentage >= 20 
                        ? 'text-green-700 dark:text-green-300' 
                        : financialData.ebitdaPercentage >= 15 
                        ? 'text-yellow-700 dark:text-yellow-300' 
                        : 'text-red-700 dark:text-red-300'
                    }`}>
                      {financialData.ebitdaPercentage >= 20 
                        ? 'Target Achieved' 
                        : financialData.ebitdaPercentage >= 15 
                        ? 'Near Target' 
                        : 'Needs Improvement'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profitability Drilldowns */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-100">Profitability Drilldowns</CardTitle>
              <p className="text-xs text-gray-500 dark:text-gray-400">Performance for {format(currentMonth, 'MMMM yyyy')}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">Top Performers</h4>
                  <div className="space-y-2">
                    {performanceLoading ? (
                      <div className="text-center py-4 text-gray-500">Loading...</div>
                    ) : topClinics.length > 0 ? (
                      topClinics.map((clinic, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                          <span className="text-sm text-gray-900 dark:text-gray-100">{clinic.name}</span>
                          <div className="text-right">
                            <div className="font-semibold text-gray-900 dark:text-gray-100">{clinic.revenue}</div>
                            <div className="text-sm text-blue-600 dark:text-blue-400">{clinic.ebitda} EBITDA</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-500">No data available</div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-red-600 dark:text-red-400 mb-2">Needs Attention</h4>
                  <div className="space-y-2">
                    {performanceLoading ? (
                      <div className="text-center py-4 text-gray-500">Loading...</div>
                    ) : bottomClinics.length > 0 ? (
                      bottomClinics.map((clinic, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                          <span className="text-sm text-gray-900 dark:text-gray-100">{clinic.name}</span>
                          <div className="text-right">
                            <div className="font-semibold text-gray-900 dark:text-gray-100">{clinic.revenue}</div>
                            <div className="text-sm text-red-600 dark:text-red-400">{clinic.ebitda} EBITDA</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-500">No data available</div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
