import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  TrendingUp,
  Users,
  IndianRupee,
  Calendar,
  Activity,
  Download,
  FileText,
  Search,
  ChevronDown,
  Star,
  StarHalf,
  UserPlus,
  UserCheck,
  Percent,
  Building2,
  Stethoscope,
  Target,
  Loader2,
  TrendingDown,
  MapPin,
  Map
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { ComposedChart, Bar, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Legend, AreaChart, Area } from 'recharts';
import { ClinicFilters } from '../components/dashboard/ClinicFilters';
import type { FilterState } from '../components/dashboard/ClinicFilters';
import { ClinicComparisonKPICard } from '../components/dashboard/ClinicComparisonKPICard';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { BarChart, LineChart } from 'recharts';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Tooltip as TooltipUI,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useClinicDetails, type ClinicDetailsApiResponse } from '@/hooks/use-clinic-details';
import { usePerformanceMetrics, type PerformanceMetricsData } from '@/hooks/use-performance-metrics';
import { useMonthlySummary, type MonthlySummaryData } from '@/hooks/use-monthly-summary';
import { useClinic } from '@/contexts/ClinicContext';

interface ClinicMetrics {
  month: string;
  revenue: number;
  expense: number;
  profit: number;
  oldPatients: number;
  newPatients: number;
  totalFootfall: number;
}

const ClinicDetails = () => {
  const { clinicName } = useParams<{ clinicName: string }>();
  const navigate = useNavigate();
  const { setCurrentClinic } = useClinic();
  const [filters, setFilters] = useState<FilterState>({
    selectedMonth: new Date(),
    comparisonMonth: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    analysisType: 'monthly',
    clinicStatus: 'All',
    revenueCategory: 'All',
    operatoriesRange: 'All',
    clinicName: '',
    city: '',
    zone: '',
    specialty: 'General Medicine', // Default specialty since not in API
    doctor: ''
  });
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'MMMM yyyy'));
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ClinicMetrics;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [selectedBreakdownMonth, setSelectedBreakdownMonth] = useState<Date>(new Date());
  const [performanceTimeFilter, setPerformanceTimeFilter] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [performanceYear, setPerformanceYear] = useState<number>(new Date().getFullYear());
  const [isBreakdownDatePickerOpen, setIsBreakdownDatePickerOpen] = useState(false);
  const [tempBreakdownMonth, setTempBreakdownMonth] = useState<Date>(selectedBreakdownMonth);

  const handleNavigateToAnalytics = (type: 'expense' | 'revenue' | 'operational' | 'capex') => {
    // Navigate to the respective analytics page with clinic context
    if (type === 'expense') {
      navigate(`/clinics/${clinicName}/expense`);
    } else if (type === 'revenue') {
      navigate(`/clinics/${clinicName}/revenue`);
    } else if (type === 'operational') {
      navigate(`/clinics/${clinicName}/operational`);
    } else if (type === 'capex') {
      navigate(`/clinics/${clinicName}/capex`);
    }
  };

  // Memoize date range based on the selected month (and comparison month, if any)
  // This ensures API calls are refreshed whenever the user changes month(s)
  const memoizedDateRange = useMemo(() => {
    const primaryDate = filters.selectedMonth || new Date();
    const comparisonDate =
      filters.isComparisonMode && filters.comparisonMonth
        ? filters.comparisonMonth
        : null;

    // Determine earliest and latest months we need data for
    const startDateRef =
      comparisonDate && comparisonDate < primaryDate ? comparisonDate : primaryDate;
    const endDateRef =
      comparisonDate && comparisonDate > primaryDate ? comparisonDate : primaryDate;

    // Calculate start/end timestamps in GMT/UTC so API always receives GMT-based values
    const startYear = startDateRef.getUTCFullYear();
    const startMonth = startDateRef.getUTCMonth();
    const endYear = endDateRef.getUTCFullYear();
    const endMonth = endDateRef.getUTCMonth();

    return {
      startDate: Date.UTC(startYear, startMonth, 1),
      // End of month at 11:59 PM GMT
      endDate: Date.UTC(endYear, endMonth + 1, 0, 23, 59, 0, 0)
    };
  }, [filters.selectedMonth, filters.comparisonMonth, filters.isComparisonMode]);

  // Use the clinic details API hook with date parameters
  const { clinicDetailsData, loading, error, isUsingFallbackData: clinicDetailsFallback } = useClinicDetails({
    clinicId: clinicName || '677d3679f8ec817ffe72fb95',
    startDate: memoizedDateRange.startDate,
    endDate: memoizedDateRange.endDate
  });

  // Debug logging
  console.log('🔍 Clinic Details Debug:', {
    clinicName,
    clinicId: clinicName || '677d3679f8ec817ffe72fb95',
    startDate: memoizedDateRange.startDate,
    endDate: memoizedDateRange.endDate,
    startDateFormatted: new Date(memoizedDateRange.startDate).toISOString(),
    endDateFormatted: new Date(memoizedDateRange.endDate).toISOString(),
    hasData: !!clinicDetailsData,
    hasClinicData: !!clinicDetailsData?.data,
    loading,
    error,
    isUsingFallbackData: clinicDetailsFallback,
    clinicData: clinicDetailsData?.data,
    responseStructure: {
      count: clinicDetailsData?.count,
      hasDataField: !!clinicDetailsData?.data,
      dataListLength: clinicDetailsData?.dataList?.length
    }
  });

  // Extract clinic data from API response
  const clinic = clinicDetailsData?.data;

  // Update clinic context when data is loaded
  useEffect(() => {
    if (clinic && clinic.clinicName) {
      setCurrentClinic({
        clinicId: clinic.clinicId,
        clinicName: clinic.clinicName,
        revenue: clinic.revenue,
        netIncome: clinic.netIncome
      });
    }
  }, [clinic, setCurrentClinic]);

  // Cleanup clinic context when component unmounts
  useEffect(() => {
    return () => {
      setCurrentClinic(null);
    };
  }, [setCurrentClinic]);

  // Use the performance metrics API hook - tied to the selected month range
  const { performanceData, loading: performanceLoading, error: performanceError, isUsingFallbackData } = usePerformanceMetrics({
    clinicId: clinicName || '677d3679f8ec817ffe72fb95',
    startDate: memoizedDateRange.startDate.toString(),
    endDate: memoizedDateRange.endDate.toString()
  });

  // Use the monthly summary API hook - tied to the selected month filter
  const selectedMonthDate = filters.selectedMonth || new Date();
  const { monthlySummaryData, loading: monthlySummaryLoading, error: monthlySummaryError, isUsingFallbackData: monthlySummaryFallback } = useMonthlySummary({
    clinicId: clinicName || 'smilebird-andheri',
    month: selectedMonthDate.getMonth() + 1, // 1-12
    year: selectedMonthDate.getFullYear()
  });

  // Debug logging for monthly summary
  console.log('📊 Monthly Summary Debug:', {
    hasData: !!monthlySummaryData,
    loading: monthlySummaryLoading,
    error: monthlySummaryError,
    isUsingFallbackData: monthlySummaryFallback,
    month: selectedMonthDate.getMonth() + 1,
    year: selectedMonthDate.getFullYear()
  });

  // Transform performance metrics data based on the selected time filter
  const monthlyData = useMemo(() => {
    if (!performanceData?.data) return [];
    
    console.log('🔄 Transforming performance data:', {
      rawDataLength: performanceData.data.length,
      timeFilter: performanceTimeFilter,
      year: performanceYear,
      firstItem: performanceData.data[0],
      allMonths: performanceData.data.map(item => item.month)
    });
    
    // Convert month names to short format for consistency with charts
    const monthMap: { [key: string]: string } = {
      'January': 'Jan', 'February': 'Feb', 'March': 'Mar', 'April': 'Apr',
      'May': 'May', 'June': 'Jun', 'July': 'Jul', 'August': 'Aug',
      'September': 'Sep', 'October': 'Oct', 'November': 'Nov', 'December': 'Dec'
    };
    
    const transformedData = performanceData.data.map((item: PerformanceMetricsData) => ({
      month: monthMap[item.month] || item.month,
      fullMonth: item.month,
      expenses: item.expenses,
      revenue: item.revenue,
      newPatients: item.newPatients,
      returningPatients: item.returningPatients,
      totalFootfall: item.totalFootfall,
      netProfit: item.netProfit
    }));

    if (performanceTimeFilter === 'quarterly') {
      // Group by quarters
      const quarters = [
        { name: 'Q1', months: ['Jan', 'Feb', 'Mar'] },
        { name: 'Q2', months: ['Apr', 'May', 'Jun'] },
        { name: 'Q3', months: ['Jul', 'Aug', 'Sep'] },
        { name: 'Q4', months: ['Oct', 'Nov', 'Dec'] }
      ];
      
      return quarters.map(quarter => {
        const quarterData = transformedData.filter(item => quarter.months.includes(item.month));
        return {
          month: quarter.name,
          expenses: quarterData.reduce((sum, item) => sum + item.expenses, 0),
          revenue: quarterData.reduce((sum, item) => sum + item.revenue, 0),
          newPatients: quarterData.reduce((sum, item) => sum + item.newPatients, 0),
          returningPatients: quarterData.reduce((sum, item) => sum + item.returningPatients, 0),
          totalFootfall: quarterData.reduce((sum, item) => sum + item.totalFootfall, 0),
          netProfit: quarterData.reduce((sum, item) => sum + item.netProfit, 0)
        };
      });
    } else if (performanceTimeFilter === 'yearly') {
      // Sum all months into yearly total
      const yearlyTotal = transformedData.reduce((acc, item) => ({
        month: performanceYear.toString(),
        expenses: acc.expenses + item.expenses,
        revenue: acc.revenue + item.revenue,
        newPatients: acc.newPatients + item.newPatients,
        returningPatients: acc.returningPatients + item.returningPatients,
        totalFootfall: acc.totalFootfall + item.totalFootfall,
        netProfit: acc.netProfit + item.netProfit
      }), {
        month: performanceYear.toString(),
        expenses: 0,
        revenue: 0,
        newPatients: 0,
        returningPatients: 0,
        totalFootfall: 0,
        netProfit: 0
      });
      
      return [yearlyTotal];
    }
    
    // Default: monthly view
    const result = transformedData;
    console.log('✨ Final transformed data:', {
      filter: performanceTimeFilter,
      resultLength: result.length,
      firstItem: result[0],
      allItems: result.map(item => ({ month: item.month, revenue: item.revenue }))
    });
    return result;
  }, [performanceData, performanceTimeFilter, performanceYear]);

  // Filter data based on search query
  const filteredMonthlyData = useMemo(() => {
    if (!searchQuery.trim()) return monthlyData;
    
    return monthlyData.filter(item => 
      item.month.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [monthlyData, searchQuery]);

  // Deterministic KPI data generation based on month
  const getKPIData = useMemo(() => {
    return (month: Date) => {
      if (!clinic) return null;

      const monthStr = format(month, 'MMM');
      const monthData = monthlyData.find(data => data.month === monthStr);
      
      if (!monthData) return {
        revenue: clinic.revenue,
        expenses: clinic.revenue * 0.75, // Estimate expenses as 75% of revenue
        netIncome: clinic.netIncome,
        profitAmount: clinic.netIncome * 0.4, // 40% profit share
        patients: clinic.totalPatient,
        footfall: clinic.footfall,
        newPatients: clinic.newPatients,
        returningPatients: clinic.returning
      };

      return {
        revenue: monthData.revenue,
        expenses: monthData.expenses,
        netIncome: monthData.revenue - monthData.expenses,
        profitAmount: (monthData.revenue - monthData.expenses) * 0.4, // 40% profit share
        patients: monthData.newPatients + monthData.returningPatients,
        footfall: monthData.totalFootfall,
        newPatients: monthData.newPatients,
        returningPatients: monthData.returningPatients
      };
    };
  }, [clinic, monthlyData]);

  // Cache KPI data
  const primaryKPIData = useMemo(() => 
    getKPIData(filters.selectedMonth),
    [getKPIData, filters.selectedMonth]
  );

  const secondaryKPIData = useMemo(() => 
    filters.comparisonMonth ? getKPIData(filters.comparisonMonth) : null,
    [getKPIData, filters.comparisonMonth]
  );

  useEffect(() => {
    if (clinic) {
      setFilters(prev => ({
        ...prev,
        clinicName: clinic.clinicName,
        city: 'Mumbai', // Default city since not in API
        zone: 'West', // Default zone since not in API
        specialty: 'General Medicine', // Default specialty since not in API
        doctor: clinic.doctorInCharge
      }));
    }
  }, [clinic]);

  // Helper function to format currency in Indian style
  const formatIndianCurrency = (amount: number) => {
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    return formatter.format(amount);
  };

  const renderFinancialCards = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-200 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg group"
          onClick={() => handleNavigateToAnalytics('revenue')}
        >
          <CardHeader>
            <CardTitle className="text-lg group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
              Revenue Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Revenue streams from all services
              </div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                ₹{(primaryKPIData?.revenue ? (primaryKPIData.revenue / 100000).toFixed(2) : '0.00')}L
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-200 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg group"
          onClick={() => handleNavigateToAnalytics('expense')}
        >
          <CardHeader>
            <CardTitle className="text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Expense Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Complete expense breakdown
              </div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                ₹{(primaryKPIData?.expenses ? (primaryKPIData.expenses / 100000).toFixed(2) : '0.00')}L
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-200 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg group"
          onClick={() => handleNavigateToAnalytics('operational')}
        >
          <CardHeader>
            <CardTitle className="text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Operational Expense Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Day-to-day operational costs
              </div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                ₹{((primaryKPIData?.expenses ? primaryKPIData.expenses * 0.6 : 0) / 100000).toFixed(2)}L
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-200 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg group"
          onClick={() => handleNavigateToAnalytics('capex')}
        >
          <CardHeader>
            <CardTitle className="text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Capex Expense Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Capital expenditure investments
              </div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                ₹{((primaryKPIData?.expenses ? primaryKPIData.expenses * 0.4 : 0) / 100000).toFixed(2)}L
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Loading state - show full-page loader only on initial load
  const isInitialLoading =
    (loading && !clinicDetailsData) ||
    (performanceLoading && !performanceData) ||
    (monthlySummaryLoading && !monthlySummaryData);

  if (isInitialLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Loading Clinic Details</h2>
              <p className="text-muted-foreground">Please wait while we fetch the clinic information and performance metrics...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if ((error && !clinic) || (performanceError && !performanceData)) {
    return (
      <div className="p-6">
        <div className="text-center space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">Failed to Load Data</h1>
            {error && <p className="text-blue-600 dark:text-blue-400 mt-2">Clinic Details: {error}</p>}
            {performanceError && <p className="text-blue-600 dark:text-blue-400 mt-2">Performance Metrics: {performanceError}</p>}
            <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded border text-left">
              <h3 className="font-semibold text-sm mb-2">Debug Information:</h3>
              <div className="text-xs space-y-1">
                <p>Clinic ID: {clinicName || 'smilebird-andheri'}</p>
                <p>Has API Response: {clinicDetailsData ? 'Yes' : 'No'}</p>
                <p>Has Clinic Data: {clinicDetailsData?.data ? 'Yes' : 'No'}</p>
                <p>Response Count: {clinicDetailsData?.count || 'N/A'}</p>
                <p>Using Fallback: {clinicDetailsFallback ? 'Yes' : 'No'}</p>
              </div>
            </div>
            <p className="text-sm text-blue-500 dark:text-blue-400 mt-1">
              Please check your network connection or contact support.
            </p>
          </div>
          <Button 
            onClick={() => navigate('/clinics')}
            className="mt-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Clinics
          </Button>
        </div>
      </div>
    );
  }

  // Clinic not found state
  if (!clinic) {
    return (
      <div className="p-6">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">Clinic Not Found</h1>
          <p className="text-muted-foreground">The clinic you're looking for doesn't exist or has been moved.</p>
          <Button 
            onClick={() => navigate('/clinics')}
            className="mt-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Clinics
          </Button>
        </div>
      </div>
    );
  }

  const netIncome = clinic.revenue - (clinic.revenue * 0.75);
  const smilebiroProfitAmount = (netIncome * 40) / 100;

  const calculateChange = (primary: number, secondary: number) => {
    if (secondary === 0) return 0;
    return ((primary - secondary) / secondary) * 100;
  };

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleApplyBreakdownDate = () => {
    setSelectedBreakdownMonth(tempBreakdownMonth);
    setIsBreakdownDatePickerOpen(false);
  };

  const chartConfig = {
    expenses: {
      label: "Expenses",
      color: "#60A5FA",
    },
    revenue: {
      label: "Revenue",
      color: "#10B981",
    },
    newPatients: {
      label: "New Patients",
      color: "#14B8A6",
    },
    returningPatients: {
      label: "Returning Patients",
      color: "#8B5CF6",
    },
  };

  const contextData = {
    clinicName: clinic.clinicName,
    city: 'Mumbai',
    zone: 'West',
    specialty: 'General Medicine',
    doctor: clinic.doctorInCharge
  };

  const FootfallTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    
    return (
      <div className="bg-card px-3 py-2 border border-border rounded-lg shadow-sm">
        <p className="text-sm text-muted-foreground mb-1">{label}</p>
        {payload.map((entry: any) => (
          <p
            key={entry.dataKey}
            className="text-sm font-medium"
            style={{ color: entry.color }}
          >
            {entry.value}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/clinics')}
            className="hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Clinics
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{clinic?.clinicName || 'Clinic'}</h1>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {/* Badge removed as per requirement */}
        </div>
      </div>

      {/* Filters */}
      <ClinicFilters
        onFiltersChange={handleFiltersChange}
        contextData={contextData}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {(performanceLoading || monthlySummaryLoading) && (
          <>
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </>
        )}
        {!performanceLoading && primaryKPIData && (
          <>
            <ClinicComparisonKPICard
              title="Revenue"
              primaryValue={primaryKPIData?.revenue || 0}
              secondaryValue={secondaryKPIData?.revenue || 0}
              primaryDate={format(filters.selectedMonth, 'MMM yyyy')}
              secondaryDate={filters.comparisonMonth ? format(filters.comparisonMonth, 'MMM yyyy') : ''}
              change={calculateChange(primaryKPIData?.revenue || 0, secondaryKPIData?.revenue || 0)}
              changeLabel={filters.comparisonMonth ? `vs ${format(filters.comparisonMonth, 'MMM yyyy')}` : 'vs previous'}
              icon={<IndianRupee className="h-4 w-4" />}
              valueFormatter={(value) => `₹${(value / 100000).toFixed(2)}L`}
            />

            <ClinicComparisonKPICard
              title="Net Income"
              primaryValue={primaryKPIData?.netIncome || 0}
              secondaryValue={secondaryKPIData?.netIncome || 0}
              primaryDate={format(filters.selectedMonth, 'MMM yyyy')}
              secondaryDate={filters.comparisonMonth ? format(filters.comparisonMonth, 'MMM yyyy') : ''}
              change={calculateChange(primaryKPIData?.netIncome || 0, secondaryKPIData?.netIncome || 0)}
              changeLabel={filters.comparisonMonth ? `vs ${format(filters.comparisonMonth, 'MMM yyyy')}` : 'vs previous'}
              icon={<TrendingUp className="h-4 w-4" />}
              valueFormatter={(value) => `₹${(value / 100000).toFixed(2)}L`}
            />

            <ClinicComparisonKPICard
              title="Total Patients"
              primaryValue={primaryKPIData?.patients || 0}
              secondaryValue={secondaryKPIData?.patients || 0}
              primaryDate={format(filters.selectedMonth, 'MMM yyyy')}
              secondaryDate={filters.comparisonMonth ? format(filters.comparisonMonth, 'MMM yyyy') : ''}
              change={calculateChange(primaryKPIData?.patients || 0, secondaryKPIData?.patients || 0)}
              changeLabel={filters.comparisonMonth ? `vs ${format(filters.comparisonMonth, 'MMM yyyy')}` : 'vs previous'}
              icon={<Users className="h-4 w-4" />}
              valueFormatter={(value) => value.toString()}
            />

            <ClinicComparisonKPICard
              title="Total Footfall"
              primaryValue={primaryKPIData?.footfall || 0}
              secondaryValue={secondaryKPIData?.footfall || 0}
              primaryDate={format(filters.selectedMonth, 'MMM yyyy')}
              secondaryDate={filters.comparisonMonth ? format(filters.comparisonMonth, 'MMM yyyy') : ''}
              change={calculateChange(primaryKPIData?.footfall || 0, secondaryKPIData?.footfall || 0)}
              changeLabel={filters.comparisonMonth ? `vs ${format(filters.comparisonMonth, 'MMM yyyy')}` : 'vs previous'}
              icon={<Activity className="h-4 w-4" />}
              valueFormatter={(value) => value.toString()}
            />
          </>
        )}
      </div>

      {/* Patient Breakdown and Clinic Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Patient Breakdown Card */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border">
            <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Users className="h-5 w-5" />
              Patient Breakdown
            </CardTitle>
            <Popover open={isBreakdownDatePickerOpen} onOpenChange={setIsBreakdownDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[200px] justify-start text-left font-normal"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {format(selectedBreakdownMonth, 'MMMM yyyy')}
                  <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <div className="p-3">
                  <CalendarComponent
                    mode="single"
                    selected={tempBreakdownMonth}
                    onSelect={(date) => date && setTempBreakdownMonth(date)}
                    initialFocus
                  />
                  <div className="flex justify-end pt-3 border-t">
                    <Button onClick={handleApplyBreakdownDate} size="sm">
                      Apply
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </CardHeader>
          <CardContent className="p-6">
            {(performanceLoading || monthlySummaryLoading) && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Skeleton className="col-span-2 h-20" />
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              {/* Total Footfall */}
              <div className="col-span-2 bg-card border border-border rounded-lg p-4">
                <div className="text-sm text-foreground font-medium">Total Footfall</div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {primaryKPIData?.footfall || 0}
                </div>
              </div>

              {/* New Patients */}
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm text-foreground font-medium">
                  <UserPlus className="h-4 w-4" />
                  New Patients
                </div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {primaryKPIData?.newPatients || 0}
                </div>
              </div>

              {/* Returning Patients */}
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm text-foreground font-medium">
                  <UserCheck className="h-4 w-4" />
                  Returning
                </div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {primaryKPIData?.returningPatients || 0}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clinic Information Card */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Clinic Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading && !clinic && (
              <div className="space-y-3 mb-4">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-6 w-1/3" />
              </div>
            )}
            <div className="space-y-4">
              {/* Doctor in Charge */}
              <div className="flex items-center justify-between py-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Doctor-in-Charge</span>
                </div>
                <span className="font-medium text-foreground">Dr. {clinic.doctorInCharge}</span>
              </div>

              {/* Operatories */}
              <div className="flex items-center justify-between py-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Operatories</span>
                </div>
                <span className="font-medium text-foreground">{clinic.operatories}</span>
              </div>

              {/* City */}
              <div className="flex items-center justify-between py-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">City</span>
                </div>
                <span className="font-medium text-foreground">{clinic.city}</span>
              </div>

              {/* Zone */}
              <div className="flex items-center justify-between py-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <Map className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Zone</span>
                </div>
                <span className="font-medium text-foreground">{clinic.zone}</span>
              </div>

              {/* Specialty */}
              <div className="flex items-center justify-between py-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Specialty</span>
                </div>
                <Badge className="bg-[#DCEBFE] text-blue-800 dark:bg-[#DCEBFE] dark:text-blue-800">
                  {clinic.specialty}
                </Badge>
              </div>

              {/* Locality */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Locality</span>
                </div>
                <span className="font-medium text-foreground">{clinic.locality}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue vs Expenses Chart */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border">
            <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
              <IndianRupee className="h-5 w-5 text-primary" />
              Revenue vs Expenses
            </CardTitle>
            <Select defaultValue="monthly">
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="pt-6">
            {(performanceLoading || monthlySummaryLoading) && (
              <Skeleton className="h-[300px] w-full mb-4" />
            )}
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredMonthlyData}>
                  <defs>
                    <linearGradient id="colorRevenueClinic" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.02}/>
                    </linearGradient>
                    <linearGradient id="colorExpensesClinic" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0.02}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
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
                    formatter={(value, name) => {
                      const formattedValue = `₹${(value as number / 100000).toFixed(2)}L`;
                      if (name === 'revenue') {
                        return [formattedValue, 'Revenue'];
                      } else if (name === 'expenses') {
                        return [formattedValue, 'Expenses'];
                      }
                      return [formattedValue, name];
                    }}
                  />
                  <Legend />
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted opacity-30" />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    fill="url(#colorRevenueClinic)"
                    dot={false}
                    activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    name="Expenses"
                    stroke="hsl(var(--destructive))"
                    strokeWidth={3}
                    fill="url(#colorExpensesClinic)"
                    dot={false}
                    activeDot={{ r: 6, fill: 'hsl(var(--destructive))' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Patient Trends Chart */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border">
            <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Patient Trends
            </CardTitle>
            <Select defaultValue="monthly">
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="pt-6">
            {(performanceLoading || monthlySummaryLoading) && (
              <Skeleton className="h-[300px] w-full mb-4" />
            )}
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredMonthlyData}>
                  <defs>
                    <linearGradient id="colorNewPatients" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(215, 90%, 60%)" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="hsl(215, 90%, 60%)" stopOpacity={0.02}/>
                    </linearGradient>
                    <linearGradient id="colorReturningPatients" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(215, 25%, 60%)" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="hsl(215, 25%, 60%)" stopOpacity={0.02}/>
                    </linearGradient>
                    <linearGradient id="colorTotalFootfall" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(215, 90%, 35%)" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="hsl(215, 90%, 35%)" stopOpacity={0.02}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
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
                    formatter={(value, name) => {
                      if (name === 'newPatients') {
                        return [value, 'New Patients'];
                      } else if (name === 'returningPatients') {
                        return [value, 'Returning Patients'];
                      } else if (name === 'totalFootfall') {
                        return [value, 'Total Footfall'];
                      }
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted opacity-30" />
                  <Area
                    type="monotone"
                    dataKey="newPatients"
                    name="New Patients"
                    stroke="hsl(215, 90%, 60%)"
                    strokeWidth={3}
                    fill="url(#colorNewPatients)"
                    dot={false}
                    activeDot={{ r: 6, fill: 'hsl(215, 90%, 60%)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="returningPatients"
                    name="Returning Patients"
                    stroke="hsl(215, 25%, 60%)"
                    strokeWidth={3}
                    fill="url(#colorReturningPatients)"
                    dot={false}
                    activeDot={{ r: 6, fill: 'hsl(215, 25%, 60%)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="totalFootfall"
                    name="Total Footfall"
                    stroke="hsl(215, 90%, 35%)"
                    strokeWidth={3}
                    fill="url(#colorTotalFootfall)"
                    dot={false}
                    activeDot={{ r: 6, fill: 'hsl(215, 90%, 35%)' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Cards */}
      {renderFinancialCards()}

      {/* Performance Metrics Table */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-4">
          <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
              Performance Metrics ({performanceYear})
          </CardTitle>
            {isUsingFallbackData ? (
              <div className="flex items-center gap-2 px-3 py-1 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <span className="text-xs text-orange-600 dark:text-orange-400">Using fallback data</span>
              </div>
            ) : performanceData ? (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <span className="text-xs text-blue-600 dark:text-blue-400">Live API data</span>
              </div>
            ) : null}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
            <Input
              placeholder="Search metrics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-xs"
            />
              {searchQuery && (
                <span className="text-xs text-muted-foreground">
                  {filteredMonthlyData.length} of {monthlyData.length} records
                </span>
              )}
            </div>
            <Select 
              value={performanceYear.toString()} 
              onValueChange={(value: string) => {
                const year = parseInt(value);
                console.log('🔄 Performance year changed to:', year);
                setPerformanceYear(year);
              }}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
              </SelectContent>
            </Select>
            <Select 
              value={performanceTimeFilter} 
              onValueChange={(value: 'monthly' | 'quarterly' | 'yearly') => {
                console.log('🔄 Performance time filter changed to:', value);
                setPerformanceTimeFilter(value);
              }}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="relative overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Expenses</TableHead>
                  <TableHead className="text-right">Net Profit</TableHead>
                  <TableHead className="text-right">New Patients</TableHead>
                  <TableHead className="text-right">Returning Patients</TableHead>
                  <TableHead className="text-right">Total Footfall</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMonthlyData.map((data, index) => (
                  <TableRow key={data.month}>
                    <TableCell className="font-medium">{data.month}</TableCell>
                    <TableCell className="text-right">₹{(data.revenue / 100000).toFixed(2)}L</TableCell>
                    <TableCell className="text-right">₹{(data.expenses / 100000).toFixed(2)}L</TableCell>
                    <TableCell className="text-right">
                      <span className={cn(
                        "font-medium",
                        (data.netProfit || (data.revenue - data.expenses)) > 0 
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-blue-500 dark:text-blue-400"
                      )}>
                        ₹{((data.netProfit || (data.revenue - data.expenses)) / 100000).toFixed(2)}L
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{data.newPatients}</TableCell>
                    <TableCell className="text-right">{data.returningPatients}</TableCell>
                    <TableCell className="text-right">{data.totalFootfall}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClinicDetails;
