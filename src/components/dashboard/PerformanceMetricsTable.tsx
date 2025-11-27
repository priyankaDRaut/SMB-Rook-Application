import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePerformanceMetrics } from '@/hooks/use-performance-metrics';
import { Loader2 } from 'lucide-react';

export const PerformanceMetricsTable = () => {
  // Use the performance metrics hook to get real data
  const { performanceData, loading, error, isUsingFallbackData } = usePerformanceMetrics();

  // Show loading state
  if (loading && !performanceData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics (2025)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Loading Performance Data</h3>
                <p className="text-muted-foreground">Please wait while we fetch the performance metrics...</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (error && !performanceData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics (2025)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-red-600">Error Loading Data</h3>
                <p className="text-muted-foreground">{error}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (value: number) => `₹${(value / 100000).toFixed(2)}L`;
  const formatNumber = (value: number) => value.toLocaleString();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Performance Metrics (2025)</CardTitle>
          {isUsingFallbackData && (
            <span className="text-xs text-muted-foreground bg-yellow-100 px-2 py-1 rounded">
              Using Mock Data
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {performanceData?.data && performanceData.data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Month</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Revenue</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Expenses</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Net Profit</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">New Patients</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Returning Patients</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Total Footfall</th>
                </tr>
              </thead>
              <tbody>
                {performanceData.data.map((row, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{row.month}</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(row.revenue)}</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(row.expenses)}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={row.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(row.netProfit)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">{formatNumber(row.newPatients)}</td>
                    <td className="py-3 px-4 text-right">{formatNumber(row.returningPatients)}</td>
                    <td className="py-3 px-4 text-right">{formatNumber(row.totalFootfall)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <p>No performance metrics data available</p>
              <p className="text-sm">Data will appear when API provides this information</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
