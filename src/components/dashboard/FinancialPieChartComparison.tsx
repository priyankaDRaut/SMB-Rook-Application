import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { useClinicPerformanceComparison } from '@/hooks/use-clinic-performance-comparison';

interface ClinicData {
  name: string;
  revenue: number;
  ebitda: number;
  netProfit: number;
  expenses: number;
}

const METRICS = [
  { id: 'revenue', label: 'Revenue', color: '#1E40AF' },
  { id: 'ebitda', label: 'EBITDA', color: '#3B82F6' },
  { id: 'netProfit', label: 'Net Profit', color: '#60A5FA' },
  { id: 'expenses', label: 'Expenses', color: '#93C5FD' }
];

const COLORS = {
  revenue: '#1E40AF',
  ebitda: '#3B82F6',
  netProfit: '#60A5FA',
  expenses: '#93C5FD'
};

interface FinancialPieChartComparisonProps {
  selectedMonth: Date;
  onMonthChange: (date: Date) => void;
}

export const FinancialPieChartComparison = ({
  selectedMonth,
  onMonthChange
}: FinancialPieChartComparisonProps) => {
  // State for temporary date selection before applying
  const [tempSelectedMonth, setTempSelectedMonth] = React.useState<Date>(selectedMonth);
  const [isDatePickerOpen, setIsDatePickerOpen] = React.useState(false);

  // Convert selected month to API period format
  const getApiPeriod = (date: Date) => {
    const now = new Date();
    if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
      return 'current-month';
    }
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  const apiPeriod = getApiPeriod(selectedMonth);
  const { clinicPerformanceData, loading, error, isUsingFallbackData } = useClinicPerformanceComparison({
    period: apiPeriod
  });

  // Handle apply button click
  const handleApplyDate = () => {
    onMonthChange(tempSelectedMonth);
    setIsDatePickerOpen(false);
  };

  // Update temp date when selectedMonth prop changes
  React.useEffect(() => {
    setTempSelectedMonth(selectedMonth);
  }, [selectedMonth]);

  // Get available clinics from API data
  const availableClinics = React.useMemo(() => {
    if (!clinicPerformanceData?.data) return [];
    return clinicPerformanceData.data.map(clinic => clinic.clinicName);
  }, [clinicPerformanceData]);

  const [clinic1, setClinic1] = React.useState<string>('');
  const [clinic2, setClinic2] = React.useState<string>('');

  // Set default clinics when data is available
  React.useEffect(() => {
    if (availableClinics.length >= 2) {
      if (!clinic1) setClinic1(availableClinics[0]);
      if (!clinic2) setClinic2(availableClinics[1]);
    }
  }, [availableClinics, clinic1, clinic2]);

  // Get clinic data from API response
  const getClinicData = (clinicName: string): ClinicData | null => {
    if (!clinicPerformanceData?.data) return null;
    
    const clinic = clinicPerformanceData.data.find(c => c.clinicName === clinicName);
    if (!clinic) return null;

    // Calculate expenses as revenue - ebitda (simplified calculation)
    const expenses = clinic.revenue - clinic.ebitda;

    return {
      name: clinic.clinicName,
      revenue: clinic.revenue / 100000, // Convert to lakhs for display
      ebitda: clinic.ebitda / 100000,
      netProfit: clinic.netProfit / 100000,
      expenses: expenses / 100000
    };
  };

  const clinic1Data = React.useMemo(() => getClinicData(clinic1), [clinic1, clinicPerformanceData]);
  const clinic2Data = React.useMemo(() => getClinicData(clinic2), [clinic2, clinicPerformanceData]);

  const formatValue = (value: number) => `₹${(value / 100000).toFixed(2)}L`;

  const getMetricData = (clinicData: ClinicData) => {
    return Object.entries(COLORS).map(([key, color]) => ({
      name: METRICS.find(m => m.id === key)?.label || key,
      value: Number(clinicData[key as keyof ClinicData]),
      color
    }));
  };

  const renderPieChart = (clinicData: ClinicData | null, clinicName: string) => {
    if (!clinicData) {
      return (
        <Card>
          <CardHeader className="border-b border-border">
            <CardTitle className="text-lg font-semibold">
              {clinicName}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[400px] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <p>No data available for {clinicName}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    const data = getMetricData(clinicData);
    const total = data.reduce((sum, item) => sum + Number(item.value), 0);

    // Calculate percentages for each metric
    const dataWithPercentages = data.map(item => ({
      ...item,
      percentage: ((Number(item.value) / total) * 100).toFixed(1)
    }));

    return (
      <Card>
        <CardHeader className="border-b border-border">
          <CardTitle className="text-lg font-semibold">
            {clinicName}
            {isUsingFallbackData && (
              <span className="text-xs text-muted-foreground ml-2">(Mock Data)</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-[400px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataWithPercentages}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={140}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {dataWithPercentages.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke="currentColor"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <text
                  x={200}
                  y={190}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-muted-foreground text-sm font-medium"
                >
                  Total Value
                </text>
                <text
                  x={200}
                  y={220}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-foreground text-lg font-bold"
                >
                  {formatValue(total)}
                </text>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0];
                      const value = Number(data.value);
                      const metricName = data.name;
                      const percentage = data.payload.percentage;
                      
                      return (
                        <div className="bg-card border border-border rounded-lg shadow-sm p-3">
                          <p className="font-medium text-card-foreground">{metricName}</p>
                          <p className="text-muted-foreground">{formatValue(value)}</p>
                          <p className="text-muted-foreground">{percentage}% of total</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  formatter={(value: string) => {
                    const item = dataWithPercentages.find(d => d.name === value);
                    return (
                      <span className="text-muted-foreground">
                        {value} ({item?.percentage}%)
                      </span>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Show loading state
  if (loading && !clinicPerformanceData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Loading Clinic Performance Data</h2>
              <p className="text-muted-foreground">Please wait while we fetch the comparison data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !clinicPerformanceData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-red-600">Error Loading Data</h2>
              <p className="text-muted-foreground">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={clinic1} onValueChange={setClinic1}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Select first clinic" />
            </SelectTrigger>
            <SelectContent>
              {availableClinics.map((clinic) => (
                <SelectItem 
                  key={clinic} 
                  value={clinic}
                  className="hover:bg-accent hover:text-accent-foreground"
                >
                  {clinic}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={clinic2} onValueChange={setClinic2}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Select second clinic" />
            </SelectTrigger>
            <SelectContent>
              {availableClinics.map((clinic) => (
                <SelectItem 
                  key={clinic} 
                  value={clinic}
                  className="hover:bg-accent hover:text-accent-foreground"
                >
                  {clinic}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full sm:w-[200px] justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(selectedMonth, 'MMMM yyyy')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <div className="p-4">
              <Calendar
                mode="single"
                selected={tempSelectedMonth}
                onSelect={(date) => date && setTempSelectedMonth(date)}
                initialFocus
              />
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDatePickerOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleApplyDate}
                >
                  Apply
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderPieChart(clinic1Data, clinic1)}
        {renderPieChart(clinic2Data, clinic2)}
      </div>
    </div>
  );
}; 