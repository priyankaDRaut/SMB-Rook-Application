import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, addMonths, subMonths } from 'date-fns';
import { useClinic } from '@/contexts/ClinicContext';
import { useClinicDetails } from '@/hooks/use-clinic-details';
import { useOpexDetail } from '@/hooks/use-opex-detail';
import { useOpexExpensesList } from '@/hooks/use-opex-expenses-list';

const OPEX_TABLE_COLUMNS: Array<{ header: string; keys: string[] }> = [
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

function getOpexValueByKeys(row: Record<string, unknown>, keys: string[]): unknown {
  for (const key of keys) {
    const value = key.includes('.') ? getNestedValue(row, key) : row[key];
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }
  return undefined;
}

function formatOpexTableCell(
  key: string,
  value: unknown,
  formatCurrency: (n: number) => string
): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') {
    const lower = key.toLowerCase();
    if ((lower.includes('date') || lower.includes('time')) && value > 1e11) {
      try {
        return new Date(value).toLocaleDateString('en-GB');
      } catch {
        return String(value);
      }
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
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}

const OperationalExpenseAnalytics = () => {
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
  const [opexListPage, setOpexListPage] = useState(0);

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
    // Run again next frame in case layout finishes after first paint.
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

  const { opexDetailData, loading, error } = useOpexDetail({
    clinicId: clinicName || '',
    startDate,
    endDate,
  });

  const {
    opexList,
    loading: opexListLoading,
    error: opexListError,
  } = useOpexExpensesList({
    locationId: clinicName || '',
    fromDate: startDate,
    toDate: endDate,
    page: opexListPage,
    size: 10,
  });

  useEffect(() => {
    setOpexListPage(0);
  }, [selectedMonth]);

  const opex = opexDetailData?.data;
  const expenseDistribution = opex?.expenseDistribution ?? [];
  const categoryBreakdown = opex?.categoryBreakdown ?? [];
  const monthlyTrends = opex?.monthlyTrends ?? [];
  const categoryComparison = opex?.categoryComparison ?? [];

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

  const totalExpense = useMemo(() => {
    return expenseDistribution.reduce((sum: number, item: any) => sum + (Number(item?.amount) || 0), 0);
  }, [expenseDistribution]);

  const opexListRows = opexList?.rows;

  // Keep on-chart labels only for the largest slices to avoid overlap.
  const labelCategorySet = useMemo(() => {
    const sorted = [...expenseDistribution]
      .sort((a: any, b: any) => (Number(b?.amount) || 0) - (Number(a?.amount) || 0))
      .slice(0, 5)
      .map((i: any) => i?.category)
      .filter(Boolean);
    return new Set<string>(sorted as string[]);
  }, [expenseDistribution]);

  const renderPieLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, payload, percent } = props;
    const category = payload?.category as string | undefined;
    if (!category || !labelCategorySet.has(category)) return null;
    if (percent < 0.06) return null;

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.65;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    const shortCategory = category.length > 18 ? `${category.slice(0, 18)}…` : category;
    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
        fontWeight={600}
      >
        {`${shortCategory} ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const renderPieTooltip = ({ active, payload }: any) => {
    if (!active || !payload || payload.length === 0) return null;
    const amount = Number(payload?.[0]?.value) || 0;
    const category = payload?.[0]?.payload?.category ?? '';
    const pct = totalExpense ? (amount / totalExpense) * 100 : 0;

    return (
      <div className="rounded-lg border border-border bg-background px-3 py-2 shadow-md">
        <div className="text-sm font-semibold text-foreground">{category}</div>
        <div className="mt-1 text-xs text-muted-foreground">
          {formatCurrency(amount)} • {pct.toFixed(1)}%
        </div>
      </div>
    );
  };

  const renderPieLegend = ({ payload }: any) => {
    if (!payload || payload.length === 0) return null;
    return (
      <div className="max-h-[420px] overflow-auto pr-2">
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => {
            const category = entry?.value ?? '';
            const amount = Number(entry?.payload?.amount) || 0;
            const pct = totalExpense ? (amount / totalExpense) * 100 : 0;
            return (
              <div key={`${category}-${index}`} className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-2">
                  <span
                    className="mt-1 h-2.5 w-2.5 flex-none rounded-full"
                    style={{ backgroundColor: entry?.color }}
                  />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-foreground">{category}</div>
                    <div className="text-xs text-muted-foreground">{pct.toFixed(1)}%</div>
                  </div>
                </div>
                <div className="flex-none text-sm font-semibold text-foreground">{formatCurrency(amount)}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
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
              Operational Expense Analysis
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Day-to-day operational costs breakdown
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
          
          <Button variant="outline" size="sm" className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Total Operational Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading && <div className="text-sm text-blue-700 dark:text-blue-300">Loading...</div>}
            {error && <div className="text-sm text-red-600">Error: {error}</div>}
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {formatCurrency(opex?.totalOpexExpenses ?? 0)}
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
              {formatCurrency(opex?.averageMonthly ?? 0)}
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
              {(opex?.growthRate ?? 0).toFixed(1)}%
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
          <TabsTrigger value="opex-details">OPEX Details</TabsTrigger>
          <TabsTrigger value="trends">Monthly Trends</TabsTrigger>
          <TabsTrigger value="comparison">Category Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="breakdown" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Expense Table (full width) */}
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
                    {categoryBreakdown.map((item, index) => (
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
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Pie Chart (full width for clarity) */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-blue-800 dark:text-blue-200">
                  Expense Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex h-[520px] flex-col gap-6 lg:flex-row">
                  <div className="min-h-[320px] flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expenseDistribution}
                          cx="50%"
                          cy="50%"
                          nameKey="category"
                          dataKey="amount"
                          innerRadius={70}
                          outerRadius={160}
                          paddingAngle={2}
                          labelLine={false}
                          label={renderPieLabel}
                        >
                          {expenseDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={renderPieTooltip} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="lg:w-[360px]">
                    <div className="mb-2 text-sm font-semibold text-foreground">
                      Breakdown (scroll)
                    </div>
                    <ResponsiveContainer width="100%" height={480}>
                      <PieChart>
                        <Legend
                          layout="vertical"
                          verticalAlign="top"
                          align="left"
                          content={renderPieLegend}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-3 text-xs text-muted-foreground">
                      Total: <span className="font-medium text-foreground">{formatCurrency(totalExpense)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-800 dark:text-blue-200">
                Monthly Operational Expense Trends
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
                  <Bar dataKey="opexExpenses" fill="#3b82f6" name="Operational Expenses" />
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

        <TabsContent value="opex-details" className="space-y-6">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-blue-800 dark:text-blue-200">
                OPEX Details
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Paginated operational expense records for the selected month.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {opexListLoading && (opexListRows ?? []).length === 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading OPEX details...
                </div>
              )}
              {opexListError && (
                <div className="text-sm text-red-600">Error: {opexListError}</div>
              )}
              {!opexListLoading && !opexListError && (opexListRows ?? []).length === 0 && (
                <div className="text-sm text-muted-foreground">No records for this period.</div>
              )}
              {!opexListError && (opexListRows ?? []).length > 0 && (
                <div className="relative overflow-x-auto rounded-md border">
                  {opexListLoading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/70 backdrop-blur-[1px]">
                      <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground shadow-sm">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading  data...
                      </div>
                    </div>
                  )}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {OPEX_TABLE_COLUMNS.map((col) => (
                          <TableHead key={col.header}>{col.header}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(opexListRows ?? []).map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                          {OPEX_TABLE_COLUMNS.map((col) => (
                            <TableCell key={col.header} className="max-w-[280px] truncate font-medium">
                              {col.header === 'No.'
                                ? opexListPage * (opexList?.size ?? 10) + rowIndex + 1
                                : formatOpexTableCell(
                                    col.header,
                                    getOpexValueByKeys(row, col.keys),
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
              {opexList && !opexListLoading && opexList.totalElements > 0 && (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-muted-foreground">
                    Showing page {opexList.page + 1} of {opexList.totalPages} ({opexList.totalElements}{' '}
                    total)
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={opexListPage <= 0 || opexListLoading}
                      onClick={() => setOpexListPage((p) => Math.max(0, p - 1))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={
                        opexListLoading || opexListPage + 1 >= opexList.totalPages
                      }
                      onClick={() => setOpexListPage((p) => p + 1)}
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

export default OperationalExpenseAnalytics;
