import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, addMonths, subMonths } from 'date-fns';
import { useClinic } from '@/contexts/ClinicContext';
import { useClinicDetails } from '@/hooks/use-clinic-details';
import { useCapexDetail } from '@/hooks/use-capex-detail';
import { useCapexExpensesList } from '@/hooks/use-capex-expenses-list';

const CAPEX_TABLE_COLUMNS: Array<{ header: string; keys: string[] }> = [
  { header: 'No.', keys: ['no'] },
  { header: 'Expense Category', keys: ['expenseCategory'] },
  { header: 'Expense Type', keys: ['expenseType'] },
  { header: 'Vendor', keys: ['vendor.vendorName'] },
  { header: 'Amount', keys: ['cost'] },
  { header: 'Payment Mode', keys: ['modeOfPayment'] },
  { header: 'Note', keys: ['notes'] },
  { header: 'Date', keys: ['toDate'] },
];

function getNestedValue(row: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, row);
}

function getCapexValueByKeys(row: Record<string, unknown>, keys: string[]): unknown {
  for (const key of keys) {
    const value = key.includes('.') ? getNestedValue(row, key) : row[key];
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }
  return undefined;
}

function formatCapexTableCell(
  key: string,
  value: unknown,
  formatCurrency: (n: number) => string
): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') {
    const lower = key.toLowerCase();
    if ((lower.includes('date') || lower.includes('time')) && value > 1e11) {
      return new Date(value).toLocaleDateString('en-GB');
    }
    if (
      lower.includes('amount') ||
      lower.includes('total') ||
      lower.includes('price') ||
      lower.includes('cost') ||
      lower.includes('revenue') ||
      lower === 'value'
    ) {
      return formatCurrency(value);
    }
    return String(value);
  }
  if (typeof value === 'string') {
    const lower = key.toLowerCase();
    if (lower.includes('date') || lower.includes('time')) {
      const maybeEpoch = Number(value);
      if (!Number.isNaN(maybeEpoch) && maybeEpoch > 1e11) {
        return new Date(maybeEpoch).toLocaleDateString('en-GB');
      }
      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toLocaleDateString('en-GB');
      }
    }
    return value;
  }
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

const CapexExpenseAnalytics = () => {
  const { clinicName } = useParams<{ clinicName: string }>();
  const navigate = useNavigate();
  const { setCurrentClinic } = useClinic();
  const [selectedMonth, setSelectedMonth] = useState<Date>(() => {
    // Anchor at first day of the current month (UTC) to avoid timezone drift.
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  });
  const [tempMonth, setTempMonth] = useState<Date>(selectedMonth);
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [capexListPage, setCapexListPage] = useState(0);

  // Ensure this analytics page always opens at the top.
  useEffect(() => {
    // AppLayout uses an internal scrollable <main>, so reset both
    // window and any scrollable ancestor to guarantee top position.
    const scrollToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

      const mainScrollContainer = document.querySelector('main.overflow-y-auto');
      if (mainScrollContainer instanceof HTMLElement) {
        mainScrollContainer.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      }
    };

    scrollToTop();
    const rafId = window.requestAnimationFrame(scrollToTop);
    return () => window.cancelAnimationFrame(rafId);
  }, []);

  // Fetch clinic details to get the clinic name for navbar
  const memoizedDateRange = useMemo(() => {
    const year = selectedMonth.getUTCFullYear();
    const monthIndex = selectedMonth.getUTCMonth();

    // Use GMT/UTC-based timestamps for API
    const startOfMonth = Date.UTC(year, monthIndex, 0, 18, 30, 0, 0);
    // End of month at 18:29 UTC (per backend expectation)
    const endOfMonth = Date.UTC(year, monthIndex + 1, 0, 18, 29, 0, 0);
    
    return {
      startDate: startOfMonth,
      endDate: endOfMonth
    };
  }, [selectedMonth]);

  const { clinicDetailsData } = useClinicDetails({
    clinicId: clinicName || '',
    startDate: memoizedDateRange.startDate,
    endDate: memoizedDateRange.endDate
  });

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

  const { startDate, endDate } = useMemo(() => {
    const year = selectedMonth.getUTCFullYear();
    const monthIndex = selectedMonth.getUTCMonth();

    const startDateUtc = Date.UTC(year, monthIndex, 0, 18, 30, 0, 0);
    const endDateUtc = Date.UTC(year, monthIndex + 1, 0, 18, 29, 0, 0);

    return { startDate: startDateUtc, endDate: endDateUtc };
  }, [selectedMonth]);

  const handleApplyMonth = () => {
    setSelectedMonth(new Date(Date.UTC(tempMonth.getUTCFullYear(), tempMonth.getUTCMonth(), 1)));
    setIsMonthPickerOpen(false);
  };

  const { capexDetailData, loading, error } = useCapexDetail({
    clinicId: clinicName || '',
    startDate,
    endDate,
  });

  const {
    capexList,
    loading: capexListLoading,
    error: capexListError,
  } = useCapexExpensesList({
    locationId: clinicName || '',
    fromDate: startDate,
    toDate: endDate,
    page: capexListPage,
    size: 10,
  });

  useEffect(() => {
    setCapexListPage(0);
  }, [selectedMonth]);

  const capex = capexDetailData?.data;
  const capexDistribution = capex?.capexDistribution ?? [];
  const categoryBreakdown = capex?.categoryBreakdown ?? [];
  const monthlyTrends = capex?.monthlyTrends ?? [];
  const categoryComparison = capex?.categoryComparison ?? [];
  const capexListRows = capexList?.rows;

  const COLORS = ['#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a', '#172554'];

  const formatCurrency = (amount: number) => {
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return formatter.format(amount);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Capex Expense Analysis
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Capital expenditure investments breakdown
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Popover
            open={isMonthPickerOpen}
            onOpenChange={(open) => {
              setIsMonthPickerOpen(open);
              if (open) setTempMonth(selectedMonth);
            }}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[280px] justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(selectedMonth, 'MMM yyyy')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <div className="p-4 w-72 space-y-3">
                <div className="text-sm font-medium text-center">Select month</div>
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTempMonth((prev) => subMonths(prev, 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="text-center">
                    <div className="font-medium">{format(tempMonth, 'MMMM')}</div>
                    <div className="text-sm text-muted-foreground">{format(tempMonth, 'yyyy')}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTempMonth((prev) => addMonths(prev, 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <Button onClick={handleApplyMonth} className="w-full">
                  Apply
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          
          {/* <Button variant="outline" size="sm" className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button> */}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Total Capex Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading && <div className="text-sm text-blue-700 dark:text-blue-300">Loading...</div>}
            {error && <div className="text-sm text-red-600">Error: {error}</div>}
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {formatCurrency(capex?.totalCapexExpenses ?? 0)}
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              Current month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Average Monthly
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {formatCurrency(capex?.averageMonthly ?? 0)}
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              Last 10 months
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Growth Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {(capex?.growthRate ?? 0).toFixed(1)}%
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              vs last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="breakdown" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="breakdown">Expense Breakdown</TabsTrigger>
          <TabsTrigger value="capex-details">CAPEX Details</TabsTrigger>
          <TabsTrigger value="trends">Monthly Trends</TabsTrigger>
          <TabsTrigger value="comparison">Category Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="breakdown" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Expense Table (full width, first) */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-blue-800 dark:text-blue-200">
                  Detailed Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Percentage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categoryBreakdown.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          No breakdown available.
                        </TableCell>
                      </TableRow>
                    ) : (
                      categoryBreakdown.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.category}</TableCell>
                          <TableCell className="text-right font-semibold text-blue-600 dark:text-blue-400">
                            {formatCurrency(item.amount)}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {(item.percentage ?? 0).toFixed(2)}%
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Pie Chart (full width, second) */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-blue-800 dark:text-blue-200">
                  Capex Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={520}>
                  <PieChart>
                    {capexDistribution.length === 0 ? (
                      <text
                        x="50%"
                        y="50%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-muted-foreground"
                      >
                        No distribution data
                      </text>
                    ) : (
                      <Pie
                        data={capexDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        nameKey="category"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={170}
                        fill="#8884d8"
                        dataKey="amount"
                      >
                        {capexDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    )}
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-800 dark:text-blue-200">
                Monthly Capex Expense Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Bar dataKey="capexExpenses" fill="#3b82f6" name="Capex Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-800 dark:text-blue-200">
                Category Performance Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={categoryComparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Bar dataKey="amount" fill="#3b82f6" name="Amount" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="capex-details" className="space-y-6">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-blue-800 dark:text-blue-200">
                CAPEX Details
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Paginated capital expense records for the selected month.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {capexListLoading && (capexListRows ?? []).length === 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading CAPEX details...
                </div>
              )}
              {capexListError && (
                <div className="text-sm text-red-600">Error: {capexListError}</div>
              )}
              {!capexListLoading && !capexListError && (capexListRows ?? []).length === 0 && (
                <div className="text-sm text-muted-foreground">No records for this period.</div>
              )}
              {!capexListError && (capexListRows ?? []).length > 0 && (
                <div className="relative overflow-x-auto rounded-md border">
                  {capexListLoading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/70 backdrop-blur-[1px]">
                      <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground shadow-sm">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading next page...
                      </div>
                    </div>
                  )}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {CAPEX_TABLE_COLUMNS.map((col) => (
                          <TableHead key={col.header}>{col.header}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(capexListRows ?? []).map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                          {CAPEX_TABLE_COLUMNS.map((col) => (
                            <TableCell key={col.header} className="max-w-[280px] truncate font-medium">
                              {col.header === 'No.'
                                ? capexListPage * (capexList?.size ?? 10) + rowIndex + 1
                                : formatCapexTableCell(
                                    col.header,
                                    getCapexValueByKeys(row, col.keys),
                                    formatCurrency
                                  )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              {capexList && !capexListLoading && capexList.totalElements > 0 && (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-muted-foreground">
                    Showing page {capexList.page + 1} of {capexList.totalPages} ({capexList.totalElements}{' '}
                    total)
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={capexListPage <= 0 || capexListLoading}
                      onClick={() => setCapexListPage((p) => Math.max(0, p - 1))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={capexListLoading || capexListPage + 1 >= capexList.totalPages}
                      onClick={() => setCapexListPage((p) => p + 1)}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CapexExpenseAnalytics;
