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
import { format, subMonths } from 'date-fns';
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
    isComparisonMode: false,
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
  const [performanceTimeFilter, setPerformanceTimeFilter] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [patientTrendsTimeFilter, setPatientTrendsTimeFilter] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [revenueVsExpensesTimeFilter, setRevenueVsExpensesTimeFilter] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  // Year dropdown should affect ONLY the Performance Metrics table.
  const [performanceTableYear, setPerformanceTableYear] = useState<number>(new Date().getFullYear());
  const performanceYearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    // Always include "one more year" (next year) at the top, then current and previous years.
    return [currentYear + 1, currentYear, currentYear - 1, currentYear - 2];
  }, []);

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

  // Primary month range (used by Clinic Details API; compare month is sent separately via query params)
  const primaryMonthDateRange = useMemo(() => {
    const primaryDate = filters.selectedMonth || new Date();
    const year = primaryDate.getUTCFullYear();
    const month = primaryDate.getUTCMonth();

    return {
      // IST 12:00 AM on the 1st = previous day 18:30 UTC
      startDate: Date.UTC(year, month, 0, 18, 30, 0, 0),
      // End of month at 11:59 PM GMT
      endDate: Date.UTC(year, month + 1, 0, 18, 29, 0, 0)
    };
  }, [filters.selectedMonth]);

  // Charts/KPIs should follow the clinic-level selected month year, not the Performance Metrics table year dropdown.
  const chartsYear = useMemo(() => {
    const base = filters.selectedMonth || new Date();
    return base.getUTCFullYear();
  }, [filters.selectedMonth]);

  // Performance Metrics table API range: full selected year (UTC)
  const performanceMetricsTableDateRange = useMemo(() => {
    return {
      // Jan 1st 00:00 UTC
      startDate: Date.UTC(performanceTableYear, 0, 1, 0, 0, 0, 0),
      // Dec 31st 18:29 UTC (per backend expectation)
      endDate: Date.UTC(performanceTableYear, 11, 31, 18, 29, 0, 0),
    };
  }, [performanceTableYear]);

  // Charts/KPIs API range: full charts year (UTC)
  const performanceMetricsChartsDateRange = useMemo(() => {
    return {
      startDate: Date.UTC(chartsYear, 0, 1, 0, 0, 0, 0),
      endDate: Date.UTC(chartsYear, 11, 31, 18, 29, 0, 0),
    };
  }, [chartsYear]);

  // Use the clinic details API hook with date parameters
  const { clinicDetailsData, loading, error, isUsingFallbackData: clinicDetailsFallback } = useClinicDetails({
    clinicId: clinicName,
    startDate: primaryMonthDateRange.startDate,
    endDate: primaryMonthDateRange.endDate
  });

  // Debug logging
  console.log('🔍 Clinic Details Debug:', {
    clinicName,
    clinicId: clinicName,
    startDate: primaryMonthDateRange.startDate,
    endDate: primaryMonthDateRange.endDate,
    startDateFormatted: new Date(primaryMonthDateRange.startDate).toISOString(),
    endDateFormatted: new Date(primaryMonthDateRange.endDate).toISOString(),
    isCompareMonth: !!filters.isComparisonMode,
    compareMonth: filters.isComparisonMode && filters.comparisonMonth
      ? format(filters.comparisonMonth, 'yyyy-MM')
      : undefined,
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

  // Performance Metrics table data (driven by the year dropdown)
  const {
    performanceData: performanceTableData,
    loading: performanceTableLoading,
    error: performanceTableError,
    isUsingFallbackData: isUsingFallbackData
  } = usePerformanceMetrics({
    clinicId: clinicName,
    startDate: performanceMetricsTableDateRange.startDate.toString(),
    endDate: performanceMetricsTableDateRange.endDate.toString()
  });

  // Charts/KPIs data (driven by the clinic-level selected month year)
  const {
    performanceData: performanceChartsData,
    loading: performanceChartsLoading,
    error: performanceChartsError
  } = usePerformanceMetrics({
    clinicId: clinicName,
    startDate: performanceMetricsChartsDateRange.startDate.toString(),
    endDate: performanceMetricsChartsDateRange.endDate.toString()
  });

  // Use the monthly summary API hook - tied to the selected month filter
  const selectedMonthDate = filters.selectedMonth || new Date();
  const { monthlySummaryData, loading: monthlySummaryLoading, error: monthlySummaryError, isUsingFallbackData: monthlySummaryFallback } = useMonthlySummary({
    clinicId: clinicName,
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
    if (!performanceTableData?.data) return [];
    
    console.log('🔄 Transforming performance data:', {
      rawDataLength: performanceTableData.data.length,
      timeFilter: performanceTimeFilter,
      year: performanceTableYear,
      firstItem: performanceTableData.data[0],
      allMonths: performanceTableData.data.map(item => item.month)
    });
    
    const monthKeyToIndex: Record<string, number> = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
    };

    const indexToMonthKey = (idx: number) =>
      (['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][idx] ?? '');

    const parseMonthInfo = (raw: string | null | undefined) => {
      const value = (raw ?? '').trim();
      const lower = value.toLowerCase();

      // Formats we commonly see:
      // - "January" / "Jan"
      // - "Dec 2025"
      // - "2025-12" or "2025-12-01"
      // - "12/2025"
      let monthIndex: number | undefined;
      let year: number | undefined;

      // yyyy-mm or yyyy-mm-dd
      const isoMatch = lower.match(/^(\d{4})-(\d{1,2})(?:-\d{1,2})?$/);
      if (isoMatch) {
        year = Number(isoMatch[1]);
        monthIndex = Number(isoMatch[2]) - 1;
      }

      // mm/yyyy
      const slashMatch = lower.match(/^(\d{1,2})\/(\d{4})$/);
      if (!isoMatch && slashMatch) {
        monthIndex = Number(slashMatch[1]) - 1;
        year = Number(slashMatch[2]);
      }

      // Month name at start (Jan, January, Dec 2025, etc.)
      if (monthIndex == null) {
        const firstToken = value.split(/[\s-]+/)[0] ?? '';
        const tokenLower = firstToken.toLowerCase();
        const tokenKey = tokenLower.slice(0, 3);
        if (tokenKey in monthKeyToIndex) {
          monthIndex = monthKeyToIndex[tokenKey];
        }
      }

      // Year anywhere in string
      if (year == null) {
        const yearMatch = value.match(/\b(20\d{2})\b/);
        if (yearMatch) year = Number(yearMatch[1]);
      }

      const monthKey = monthIndex != null ? indexToMonthKey(monthIndex) : (value.slice(0, 3) || value);
      return { monthIndex, monthKey, year };
    };

    const transformedData = performanceTableData.data
      .map((item: PerformanceMetricsData) => {
        const info = parseMonthInfo(item.month);
        const totalVisistedPatient =
          typeof item.totalVisistedPatient === 'number' ? item.totalVisistedPatient : 0;
        const totalVisitedPatient =
          typeof item.totalVisitedPatient === 'number'
            ? item.totalVisitedPatient
            : typeof item.totalVisistedPatient === 'number'
              ? item.totalVisistedPatient
              : item.totalFootfall;
        const uniqueVistedPatient =
          typeof item.uniqueVisitedPatient === 'number' ? item.uniqueVisitedPatient : 0;
        return {
          month: item.month, // keep original for display
          monthKey: info.monthKey, // normalized month key (Jan..Dec) for matching/grouping
          monthIndex: info.monthIndex, // 0..11 when detectable
          year: info.year,
          fullMonth: item.month,
          expenses: item.expenses,
          revenue: item.revenue,
          newPatients: item.newPatients,
          returningPatients: item.returningPatients,
          totalFootfall: item.totalFootfall,
          totalVisistedPatient: item.totalVisistedPatient,
          totalVisitedPatient,
          uniqueVistedPatient: item.uniqueVisitedPatient,
          totalVisistedPatients: item.totalVisistedPatients,

          netProfit: item.netProfit
        };
      })
      // If API returns multiple years, keep only the selected year when it’s detectable.
      .filter((row) => (row.year != null ? row.year === performanceTableYear : true));

    if (performanceTimeFilter === 'quarterly') {
      const quarterBuckets: Array<{ name: 'Q1 (Jan-Mar)' | 'Q2 (Apr-Jun)' | 'Q3 (Jul-Sep)' | 'Q4 (Oct-Dec)'; start: number; end: number }> = [
        { name: 'Q1 (Jan-Mar)', start: 0, end: 2 },  // Jan–Mar
        { name: 'Q2 (Apr-Jun)', start: 3, end: 5 },  // Apr–Jun
        { name: 'Q3 (Jul-Sep)', start: 6, end: 8 },  // Jul–Sep
        { name: 'Q4 (Oct-Dec)', start: 9, end: 11 }  // Oct–Dec
      ];

      return quarterBuckets.map((q) => {
        const quarterData = transformedData.filter((row) => {
          if (row.monthIndex != null) return row.monthIndex >= q.start && row.monthIndex <= q.end;
          // Fallback: use normalized monthKey
          const idx = monthKeyToIndex[(row.monthKey || '').toLowerCase()] ?? -1;
          return idx >= q.start && idx <= q.end;
        });

        return {
          month: q.name,
          expenses: quarterData.reduce((sum, item) => sum + item.expenses, 0),
          revenue: quarterData.reduce((sum, item) => sum + item.revenue, 0),
          newPatients: quarterData.reduce((sum, item) => sum + item.newPatients, 0),
          returningPatients: quarterData.reduce((sum, item) => sum + item.returningPatients, 0),
          totalFootfall: quarterData.reduce((sum, item) => sum + item.totalFootfall, 0),
          totalVisistedPatient: quarterData.reduce((sum, item) => sum + (item.totalVisistedPatient ?? 0), 0),
          totalVisitedPatient: quarterData.reduce((sum, item) => sum + (item.totalVisitedPatient ?? item.totalVisistedPatient ?? 0), 0),
          uniqueVistedPatient: quarterData.reduce((sum, item) => sum + (item.uniqueVistedPatient ?? 0), 0),
          netProfit: quarterData.reduce((sum, item) => sum + item.netProfit, 0)
        };
      });
    } else if (performanceTimeFilter === 'yearly') {
      // Sum all months into yearly total
      const yearlyTotal = transformedData.reduce((acc, item) => ({
        month: performanceTableYear.toString(),
        expenses: acc.expenses + item.expenses,
        revenue: acc.revenue + item.revenue,
        newPatients: acc.newPatients + item.newPatients,
        returningPatients: acc.returningPatients + item.returningPatients,
        totalFootfall: acc.totalFootfall + item.totalFootfall,
        totalVisistedPatient: (acc.totalVisistedPatient ?? 0) + (item.totalVisistedPatient ?? 0),
        totalVisitedPatient: (acc.totalVisitedPatient ?? 0) + (item.totalVisitedPatient ?? item.totalVisistedPatient ?? 0),
        uniqueVistedPatient: (acc.uniqueVistedPatient ?? 0) + (item.uniqueVistedPatient ?? 0),
        netProfit: acc.netProfit + item.netProfit
      }), {
        month: performanceTableYear.toString(),
        expenses: 0,
        revenue: 0,
        newPatients: 0,
        returningPatients: 0,
        totalFootfall: 0,
        totalVisistedPatient: 0,
        totalVisitedPatient: 0,
        uniqueVistedPatient: 0,
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
  }, [performanceTableData, performanceTimeFilter, performanceTableYear]);

  // Filter data based on search query
  const filteredMonthlyData = useMemo(() => {
    if (!searchQuery.trim()) return monthlyData;
    
    return monthlyData.filter(item => 
      item.month.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [monthlyData, searchQuery]);

  // Revenue vs Expenses chart should be independent of Performance Metrics table filter.
  const revenueVsExpensesData = useMemo(() => {
    if (!performanceChartsData?.data) return [];

    const monthKeyToIndex: Record<string, number> = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
    };

    const indexToMonthKey = (idx: number) =>
      (['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][idx] ?? '');

    const parseMonthInfo = (raw: string | null | undefined) => {
      const value = (raw ?? '').trim();
      const lower = value.toLowerCase();

      let monthIndex: number | undefined;
      let year: number | undefined;

      const isoMatch = lower.match(/^(\d{4})-(\d{1,2})(?:-\d{1,2})?$/);
      if (isoMatch) {
        year = Number(isoMatch[1]);
        monthIndex = Number(isoMatch[2]) - 1;
      }

      const slashMatch = lower.match(/^(\d{1,2})\/(\d{4})$/);
      if (!isoMatch && slashMatch) {
        monthIndex = Number(slashMatch[1]) - 1;
        year = Number(slashMatch[2]);
      }

      if (monthIndex == null) {
        const firstToken = value.split(/[\s-]+/)[0] ?? '';
        const tokenKey = firstToken.toLowerCase().slice(0, 3);
        if (tokenKey in monthKeyToIndex) {
          monthIndex = monthKeyToIndex[tokenKey];
        }
      }

      if (year == null) {
        const yearMatch = value.match(/\b(20\d{2})\b/);
        if (yearMatch) year = Number(yearMatch[1]);
      }

      const monthKey = monthIndex != null ? indexToMonthKey(monthIndex) : (value.slice(0, 3) || value);
      return { monthIndex, monthKey, year };
    };

    const transformedData = performanceChartsData.data
      .map((item: PerformanceMetricsData) => {
        const info = parseMonthInfo(item.month);
        return {
          month: item.month,
          monthKey: info.monthKey,
          monthIndex: info.monthIndex,
          year: info.year,
          expenses: item.expenses,
          revenue: item.revenue
        };
      })
      .filter((row) => (row.year != null ? row.year === chartsYear : true));

    if (revenueVsExpensesTimeFilter === 'quarterly') {
      const quarterBuckets: Array<{ name: 'Q1 (Jan-Mar)' | 'Q2 (Apr-Jun)' | 'Q3 (Jul-Sep)' | 'Q4 (Oct-Dec)'; start: number; end: number }> = [
        { name: 'Q1 (Jan-Mar)', start: 0, end: 2 },
        { name: 'Q2 (Apr-Jun)', start: 3, end: 5 },
        { name: 'Q3 (Jul-Sep)', start: 6, end: 8 },
        { name: 'Q4 (Oct-Dec)', start: 9, end: 11 }
      ];

      return quarterBuckets.map((q) => {
        const quarterData = transformedData.filter((row) => {
          if (row.monthIndex != null) return row.monthIndex >= q.start && row.monthIndex <= q.end;
          const idx = monthKeyToIndex[(row.monthKey || '').toLowerCase()] ?? -1;
          return idx >= q.start && idx <= q.end;
        });

        return {
          month: q.name,
          expenses: quarterData.reduce((sum, item) => sum + item.expenses, 0),
          revenue: quarterData.reduce((sum, item) => sum + item.revenue, 0),
        };
      });
    }

    if (revenueVsExpensesTimeFilter === 'yearly') {
      const yearlyTotal = transformedData.reduce((acc, item) => ({
        month: chartsYear.toString(),
        expenses: acc.expenses + item.expenses,
        revenue: acc.revenue + item.revenue,
      }), {
        month: chartsYear.toString(),
        expenses: 0,
        revenue: 0,
      });

      return [yearlyTotal];
    }

    // monthly
    return transformedData.map((row) => ({
      month: row.monthKey || row.month,
      expenses: row.expenses,
      revenue: row.revenue
    }));
  }, [performanceChartsData, revenueVsExpensesTimeFilter, chartsYear]);

  const filteredRevenueVsExpensesData = useMemo(() => {
    if (!searchQuery.trim()) return revenueVsExpensesData;
    return revenueVsExpensesData.filter((item: any) =>
      (item.month ?? '').toString().toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [revenueVsExpensesData, searchQuery]);

  // Patient Trends chart needs its own independent time filter/dataset.
  const patientTrendsData = useMemo(() => {
    if (!performanceChartsData?.data) return [];

    const monthKeyToIndex: Record<string, number> = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
    };

    const indexToMonthKey = (idx: number) =>
      (['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][idx] ?? '');

    const parseMonthInfo = (raw: string | null | undefined) => {
      const value = (raw ?? '').trim();
      const lower = value.toLowerCase();

      let monthIndex: number | undefined;
      let year: number | undefined;

      const isoMatch = lower.match(/^(\d{4})-(\d{1,2})(?:-\d{1,2})?$/);
      if (isoMatch) {
        year = Number(isoMatch[1]);
        monthIndex = Number(isoMatch[2]) - 1;
      }

      const slashMatch = lower.match(/^(\d{1,2})\/(\d{4})$/);
      if (!isoMatch && slashMatch) {
        monthIndex = Number(slashMatch[1]) - 1;
        year = Number(slashMatch[2]);
      }

      if (monthIndex == null) {
        const firstToken = value.split(/[\s-]+/)[0] ?? '';
        const tokenKey = firstToken.toLowerCase().slice(0, 3);
        if (tokenKey in monthKeyToIndex) {
          monthIndex = monthKeyToIndex[tokenKey];
        }
      }

      if (year == null) {
        const yearMatch = value.match(/\b(20\d{2})\b/);
        if (yearMatch) year = Number(yearMatch[1]);
      }

      const monthKey = monthIndex != null ? indexToMonthKey(monthIndex) : (value.slice(0, 3) || value);
      return { monthIndex, monthKey, year };
    };

    const transformedData = performanceChartsData.data
      .map((item: PerformanceMetricsData) => {
        const info = parseMonthInfo(item.month);
        return {
          month: item.month,
          monthKey: info.monthKey,
          monthIndex: info.monthIndex,
          year: info.year,
          expenses: item.expenses,
          revenue: item.revenue,
          newPatients: item.newPatients,
          returningPatients: item.returningPatients,
          totalFootfall: item.totalFootfall,
          netProfit: item.netProfit
        };
      })
      .filter((row) => (row.year != null ? row.year === chartsYear : true));

    if (patientTrendsTimeFilter === 'quarterly') {
      const quarterBuckets: Array<{ name: 'Q1 (Jan-Mar)' | 'Q2 (Apr-Jun)' | 'Q3 (Jul-Sep)' | 'Q4 (Oct-Dec)'; start: number; end: number }> = [
        { name: 'Q1 (Jan-Mar)', start: 0, end: 2 },  // Jan–Mar
        { name: 'Q2 (Apr-Jun)', start: 3, end: 5 },  // Apr–Jun
        { name: 'Q3 (Jul-Sep)', start: 6, end: 8 },  // Jul–Sep
        { name: 'Q4 (Oct-Dec)', start: 9, end: 11 }  // Oct–Dec
      ];

      return quarterBuckets.map((q) => {
        const quarterData = transformedData.filter((row) => {
          if (row.monthIndex != null) return row.monthIndex >= q.start && row.monthIndex <= q.end;
          const idx = monthKeyToIndex[(row.monthKey || '').toLowerCase()] ?? -1;
          return idx >= q.start && idx <= q.end;
        });

        return {
          month: q.name,
          expenses: quarterData.reduce((sum, item) => sum + item.expenses, 0),
          revenue: quarterData.reduce((sum, item) => sum + item.revenue, 0),
          newPatients: quarterData.reduce((sum, item) => sum + item.newPatients, 0),
          returningPatients: quarterData.reduce((sum, item) => sum + item.returningPatients, 0),
          totalFootfall: quarterData.reduce((sum, item) => sum + item.totalFootfall, 0),
          netProfit: quarterData.reduce((sum, item) => sum + item.netProfit, 0)
        };
      });
    }

    if (patientTrendsTimeFilter === 'yearly') {
      const yearlyTotal = transformedData.reduce((acc, item) => ({
        month: chartsYear.toString(),
        expenses: acc.expenses + item.expenses,
        revenue: acc.revenue + item.revenue,
        newPatients: acc.newPatients + item.newPatients,
        returningPatients: acc.returningPatients + item.returningPatients,
        totalFootfall: acc.totalFootfall + item.totalFootfall,
        netProfit: acc.netProfit + item.netProfit
      }), {
        month: chartsYear.toString(),
        expenses: 0,
        revenue: 0,
        newPatients: 0,
        returningPatients: 0,
        totalFootfall: 0,
        netProfit: 0
      });

      return [yearlyTotal];
    }

    // monthly
    return transformedData.map((row) => ({
      month: row.monthKey || row.month,
      expenses: row.expenses,
      revenue: row.revenue,
      newPatients: row.newPatients,
      returningPatients: row.returningPatients,
      totalFootfall: row.totalFootfall,
      netProfit: row.netProfit
    }));
  }, [performanceChartsData, patientTrendsTimeFilter, chartsYear]);

  const filteredPatientTrendsData = useMemo(() => {
    if (!searchQuery.trim()) return patientTrendsData;
    return patientTrendsData.filter((item: any) =>
      (item.month ?? '').toString().toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [patientTrendsData, searchQuery]);

  // Deterministic KPI data generation based on month
  const getKPIData = useMemo(() => {
    return (month: Date) => {
      if (!clinic) return null;

      const monthStr = format(month, 'MMM');
      const monthData = monthlyData.find((data: any) => data.monthKey === monthStr);
      
      if (!monthData) return {
        revenue: clinic.revenue,
        expenses: clinic.revenue * 0.75, // Estimate expenses as 75% of revenue
        netIncome: clinic.netIncome,
        profitAmount: clinic.netIncome * 0.4, // 40% profit share
        patients: clinic.totalPatient,
        footfall: clinic.footfall,
        newPatients: clinic.newPatients,
        returningPatients: clinic.returning,
        totalVisitedPatients: clinic.totalVisitedPatients ?? 0,
        uniqueVistedPatients: clinic.uniqueVisitedPatient ?? 0,
      };

      return {
        revenue: monthData.revenue,
        expenses: monthData.expenses,
        netIncome: monthData.revenue - monthData.expenses,
        profitAmount: (monthData.revenue - monthData.expenses) * 0.4, // 40% profit share
        patients: monthData.newPatients + monthData.returningPatients,
        footfall: monthData.totalFootfall,
        newPatients: monthData.newPatients,
        returningPatients: monthData.returningPatients,
        // Not available in performance metrics payload; use clinic details API values for the selected range.
        totalVisitedPatients: clinic.totalVisitedPatients ?? 0,
        uniqueVistedPatient: clinic.uniqueVisitedPatient ?? 0,
      };
    };
  }, [clinic, monthlyData]);

  // Cache KPI data
  const primaryKPIData = useMemo(() => 
    getKPIData(filters.selectedMonth),
    [getKPIData, filters.selectedMonth]
  );

  const previousMonth = useMemo(
    () => subMonths(filters.selectedMonth, 1),
    [filters.selectedMonth]
  );

  const secondaryKPIData = useMemo(() => 
    getKPIData(previousMonth),
    [getKPIData, previousMonth]
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

        {/* Expense Analysis card temporarily disabled */}
        {false && (
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
        )}

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
    (performanceChartsLoading && !performanceChartsData) ||
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
  if ((error && !clinic) || (performanceChartsError && !performanceChartsData)) {
    return (
      <div className="p-6">
        <div className="text-center space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">Failed to Load Data</h1>
            {error && <p className="text-blue-600 dark:text-blue-400 mt-2">Clinic Details: {error}</p>}
            {performanceChartsError && <p className="text-blue-600 dark:text-blue-400 mt-2">Performance Metrics: {performanceChartsError}</p>}
            <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded border text-left">
              <h3 className="font-semibold text-sm mb-2">Debug Information:</h3>
              <div className="text-xs space-y-1">
                <p>Clinic ID: {clinicName || ''}</p>
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

  // Patient Breakdown uses the page-level selected month; no separate date filter.

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
        enableComparison={false}
        contextData={contextData}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {(performanceChartsLoading || monthlySummaryLoading) && (
          <>
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </>
        )}
        {!performanceChartsLoading && primaryKPIData && (
          <>
            <ClinicComparisonKPICard
              title="Revenue"
              primaryValue={primaryKPIData?.revenue || 0}
              secondaryValue={secondaryKPIData?.revenue || 0}
              primaryDate={format(filters.selectedMonth, 'MMM yyyy')}
              secondaryDate=""
              change={calculateChange(primaryKPIData?.revenue || 0, secondaryKPIData?.revenue || 0)}
              changeLabel="vs previous"
              showChangeRow={false}
              icon={<IndianRupee className="h-4 w-4" />}
              valueFormatter={(value) => `₹${(value / 100000).toFixed(2)}L`}
            />

            <ClinicComparisonKPICard
              title="Net Income"
              primaryValue={primaryKPIData?.netIncome || 0}
              secondaryValue={secondaryKPIData?.netIncome || 0}
              primaryDate={format(filters.selectedMonth, 'MMM yyyy')}
              secondaryDate=""
              change={calculateChange(primaryKPIData?.netIncome || 0, secondaryKPIData?.netIncome || 0)}
              changeLabel="vs previous"
              showChangeRow={false}
              icon={<TrendingUp className="h-4 w-4" />}
              valueFormatter={(value) => `₹${(value / 100000).toFixed(2)}L`}
            />

            <ClinicComparisonKPICard
              title="New Patients"
              primaryValue={primaryKPIData?.newPatients || 0}
              secondaryValue={secondaryKPIData?.newPatients || 0}
              primaryDate={format(filters.selectedMonth, 'MMM yyyy')}
              secondaryDate=""
              change={calculateChange(primaryKPIData?.newPatients || 0, secondaryKPIData?.newPatients || 0)}
              changeLabel="vs previous"
              showChangeRow={false}
              icon={<UserPlus className="h-4 w-4" />}
              valueFormatter={(value) => value.toString()}
            />

            <ClinicComparisonKPICard
              title="Total Visited Patients"
              primaryValue={primaryKPIData?.totalVisitedPatients || 0}
              secondaryValue={secondaryKPIData?.totalVisitedPatients || 0}
              primaryDate={format(filters.selectedMonth, 'MMM yyyy')}
              secondaryDate=""
              change={calculateChange(primaryKPIData?.totalVisitedPatients || 0, secondaryKPIData?.totalVisitedPatients || 0)}
              changeLabel="vs previous"
              showChangeRow={false}
              icon={<Users className="h-4 w-4" />}
              valueFormatter={(value) => value.toString()}
            />

            <ClinicComparisonKPICard
              title="Unique Visited Patients"
              primaryValue={primaryKPIData?.uniqueVistedPatients || 0}
              secondaryValue={secondaryKPIData?.uniqueVistedPatients || 0}
              primaryDate={format(filters.selectedMonth, 'MMM yyyy')}
              secondaryDate=""
              change={calculateChange(primaryKPIData?.uniqueVistedPatients || 0, secondaryKPIData?.uniqueVistedPatients || 0)}
              changeLabel="vs previous"
              showChangeRow={false}
              icon={<UserCheck className="h-4 w-4" />}
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
          </CardHeader>
          <CardContent className="p-6">
            {(performanceChartsLoading || monthlySummaryLoading) && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Skeleton className="col-span-2 h-20" />
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              {/* Total Footfall */}
              <div className="col-span-2 bg-card border border-border rounded-lg p-4">
                <div className="text-sm text-foreground font-medium">Visited Patients</div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {primaryKPIData?.totalVisitedPatients || 0}
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

              {/* Unique Visited Patients */}
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm text-foreground font-medium">
                  <UserCheck className="h-4 w-4" />
                  Unique Visited Patients
                </div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {primaryKPIData?.uniqueVistedPatients || 0}
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
              Revenue vs Expenses (OPEX)
            </CardTitle>
            <Select
              value={revenueVsExpensesTimeFilter}
              onValueChange={(value: 'monthly' | 'quarterly' | 'yearly') => setRevenueVsExpensesTimeFilter(value)}
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
          </CardHeader>
          <CardContent className="pt-6">
            {(performanceChartsLoading || monthlySummaryLoading) && (
              <Skeleton className="h-[300px] w-full mb-4" />
            )}
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredRevenueVsExpensesData}>
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
                        return [formattedValue, 'OPEX Expenses'];
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
            <Select
              value={patientTrendsTimeFilter}
              onValueChange={(value: 'monthly' | 'quarterly' | 'yearly') => setPatientTrendsTimeFilter(value)}
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
          </CardHeader>
          <CardContent className="pt-6">
            {(performanceChartsLoading || monthlySummaryLoading) && (
              <Skeleton className="h-[300px] w-full mb-4" />
            )}
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredPatientTrendsData}>
                  <defs>
                    <linearGradient id="colorNewPatients" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(215, 90%, 60%)" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="hsl(215, 90%, 60%)" stopOpacity={0.02}/>
                    </linearGradient>
                    <linearGradient id="coloruniqueVistedPatient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(215, 25%, 60%)" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="hsl(215, 25%, 60%)" stopOpacity={0.02}/>
                    </linearGradient>
                    <linearGradient id="colorTotalVisitedPatients" x1="0" y1="0" x2="0" y2="1">
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
                      } else if (name === 'uniqueVistedPatient') {
                        return [value, 'Unique Visited Patients'];
                      } else if (name === 'totalVisitedPatients') {
                        return [value, 'Total Visited Patients'];
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
                    dataKey="uniqueVistedPatient"
                    name="Unique Visited Patients"
                    stroke="hsl(215, 25%, 60%)"
                    strokeWidth={3}
                    fill="url(#coloruniqueVistedPatient)"
                    dot={false}
                    activeDot={{ r: 6, fill: 'hsl(215, 25%, 60%)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="totalVisitedPatients"
                    name="Total Visited Patients"
                    stroke="hsl(215, 90%, 35%)"
                    strokeWidth={3}
                    fill="url(#colorTotalVisitedPatients)"
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
              Performance Metrics ({performanceTableYear})
          </CardTitle>
            {isUsingFallbackData ? (
              <div className="flex items-center gap-2 px-3 py-1 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <span className="text-xs text-orange-600 dark:text-orange-400">Using fallback data</span>
              </div>
            ) : performanceTableData ? (
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
              value={performanceTableYear.toString()} 
              onValueChange={(value: string) => {
                const year = parseInt(value);
                console.log('🔄 Performance year changed to:', year);
                setPerformanceTableYear(year);
              }}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {performanceYearOptions.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
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
                  <TableHead className="text-right">Visited Patients</TableHead>
                  <TableHead className="text-right">Unique Visited Patients</TableHead>
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
                    <TableCell className="text-right">{data.totalVisitedPatient}</TableCell>
                    <TableCell className="text-right">{data.uniqueVistedPatient}</TableCell>
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
