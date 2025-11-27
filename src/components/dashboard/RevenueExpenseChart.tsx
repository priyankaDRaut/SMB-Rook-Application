import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useRevenueExpense } from '@/hooks/use-revenue-expense';
import { Loader2 } from 'lucide-react';

export const RevenueExpenseChart = () => {
  // Use the revenue vs expense hook to get real data
  const { revenueExpenseData, loading, error, isUsingFallbackData } = useRevenueExpense({
    months: 6 // Get last 6 months of data
  });

  // Transform API data for charts - only use real API data
  const chartData = React.useMemo(() => {
    if (!revenueExpenseData?.data) {
      return []; // Return empty array if no API data
    }
    
    return revenueExpenseData.data.map(item => ({
      month: item.month,
      revenue: item.revenue,
      expenses: item.expenses
    }));
  }, [revenueExpenseData]);

  // Show loading state
  if (loading && !revenueExpenseData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue vs Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Loading Financial Data</h3>
                <p className="text-muted-foreground">Please wait while we fetch the revenue and expense data...</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (error && !revenueExpenseData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue vs Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Revenue vs Expenses</CardTitle>
          {isUsingFallbackData && (
            <span className="text-xs text-muted-foreground bg-yellow-100 px-2 py-1 rounded">
              Using Mock Data
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02}/>
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis 
                  tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `₹${(value / 100000).toFixed(2)}L`, 
                    name === 'revenue' ? 'Revenue' : 'Expenses'
                  ]}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Legend 
                  formatter={(value) => value === 'revenue' ? '→ Revenue' : '→ Expenses'}
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
                  name="revenue"
                />
                <Area 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorExpenses)"
                  dot={false}
                  activeDot={{ r: 6, fill: '#ef4444' }}
                  name="expenses"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <p>No revenue and expense data available</p>
              <p className="text-sm">Data will appear when API provides this information</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
