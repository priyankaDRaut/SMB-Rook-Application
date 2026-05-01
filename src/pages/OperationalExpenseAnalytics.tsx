import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, addMonths, subMonths } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { useClinic } from '@/contexts/ClinicContext';
import { useAuth } from '@/contexts/AuthContext';
import { useClinicDetails } from '@/hooks/use-clinic-details';
import { useOpexDetail } from '@/hooks/use-opex-detail';
import { useOpexExpensesList } from '@/hooks/use-opex-expenses-list';
import { makeApiRequest, API_CONFIG } from '@/lib/api-config';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import * as XLSX from 'xlsx';

function parseQueryDate(param: string | null): Date | undefined {
  if (!param) return undefined;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(param);
  if (!match) return undefined;
  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);
  if (monthIndex < 0 || monthIndex > 11 || day < 1 || day > 31) return undefined;
  return new Date(Date.UTC(year, monthIndex, day));
}

function formatUtcYmd(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

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
  const [searchParams, setSearchParams] = useSearchParams();

  const getMonthFromQuery = (monthParam: string | null): Date => {
    if (monthParam) {
      const match = /^(\d{4})-(\d{2})$/.exec(monthParam);
      if (match) {
        const year = Number(match[1]);
        const monthIndex = Number(match[2]) - 1;
        if (monthIndex >= 0 && monthIndex <= 11) {
          return new Date(Date.UTC(year, monthIndex, 1));
        }
      }
    }

    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  };

  const [selectedMonth, setSelectedMonth] = useState<Date>(() => {
    // Initialize from query param when available; fallback to current month.
    return getMonthFromQuery(searchParams.get('month'));
  });
  const [tempMonth, setTempMonth] = useState<Date>(selectedMonth);
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>(() => {
    const from = parseQueryDate(searchParams.get('fromDate'));
    const to = parseQueryDate(searchParams.get('toDate'));
    if (from && to) return { from, to };
    return undefined;
  });
  const customRangeActive = Boolean(customDateRange?.from && customDateRange?.to);
  const [opexListPage, setOpexListPage] = useState(0);
  const [isExportingOpex, setIsExportingOpex] = useState(false);
  const { accessToken } = useAuth();

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
  const { startDate, endDate, memoizedDateRange } = useMemo(() => {
    if (customRangeActive && customDateRange?.from && customDateRange?.to) {
      const from = customDateRange.from;
      const to = customDateRange.to;
      const range = {
        startDate: Date.UTC(
          from.getUTCFullYear(),
          from.getUTCMonth(),
          from.getUTCDate(),
          18,
          30,
          0,
          0
        ),
        endDate: Date.UTC(
          to.getUTCFullYear(),
          to.getUTCMonth(),
          to.getUTCDate(),
          18,
          29,
          0,
          0
        ),
      };
      return { ...range, memoizedDateRange: range };
    }

    const year = selectedMonth.getUTCFullYear();
    const monthIndex = selectedMonth.getUTCMonth();
    const startOfMonth = Date.UTC(year, monthIndex, 0, 18, 30, 0, 0);
    const endOfMonth = Date.UTC(year, monthIndex + 1, 0, 18, 29, 0, 0);
    const range = { startDate: startOfMonth, endDate: endOfMonth };
    return { ...range, memoizedDateRange: range };
  }, [selectedMonth, customRangeActive, customDateRange?.from, customDateRange?.to]);

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

  const handleApplyMonth = () => {
    setSelectedMonth(new Date(Date.UTC(tempMonth.getUTCFullYear(), tempMonth.getUTCMonth(), 1)));
    setIsMonthPickerOpen(false);
  };

  useEffect(() => {
    const month = format(selectedMonth, 'yyyy-MM');
    if (searchParams.get('month') === month) return;

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('month', month);
    setSearchParams(nextParams, { replace: true });
  }, [selectedMonth, searchParams, setSearchParams]);

  useEffect(() => {
    const from = customDateRange?.from;
    const to = customDateRange?.to;
    const nextParams = new URLSearchParams(searchParams);

    if (from && to) {
      const fromStr = formatUtcYmd(from);
      const toStr = formatUtcYmd(to);
      if (
        searchParams.get('fromDate') === fromStr &&
        searchParams.get('toDate') === toStr
      ) {
        return;
      }
      nextParams.set('fromDate', fromStr);
      nextParams.set('toDate', toStr);
    } else {
      if (!searchParams.get('fromDate') && !searchParams.get('toDate')) return;
      nextParams.delete('fromDate');
      nextParams.delete('toDate');
    }

    setSearchParams(nextParams, { replace: true });
  }, [customDateRange?.from, customDateRange?.to, searchParams, setSearchParams]);

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
  }, [selectedMonth, startDate, endDate]);

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

  const buildOpexSheetData = (rows: Record<string, unknown>[]) => {
    const headers = OPEX_TABLE_COLUMNS.map((col) => col.header);
    const bodyRows = rows.map((row, rowIndex) =>
      OPEX_TABLE_COLUMNS.map((col) => {
        const cellValue =
          col.header === 'No.'
            ? rowIndex + 1
            : formatOpexTableCell(col.header, getOpexValueByKeys(row, col.keys), formatCurrency);
        return cellValue;
      })
    );
    return [headers, ...bodyRows];
  };

  const downloadOpexAsXlsx = (rows: Record<string, unknown>[]) => {
    const sheetData = buildOpexSheetData(rows);
    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'OPEX Details');
    const monthLabel = format(selectedMonth, 'MMM-yyyy');
    const clinicNameLabel = clinic?.clinicName || clinicName || 'clinic';
    XLSX.writeFile(workbook, `opex-details-clinic-${clinicNameLabel}-${monthLabel}.xlsx`);
  };

  const normalizeOpexExportRows = (raw: unknown): Record<string, unknown>[] => {
    const payload = raw as Record<string, unknown> | null | undefined;
    const inner = (payload?.data ?? payload) as Record<string, unknown> | undefined;
    const candidates = [inner?.content, payload?.content, inner?.dataList, payload?.dataList, inner?.data, payload?.data];
    for (const candidate of candidates) {
      if (Array.isArray(candidate)) {
        return candidate.map((row) =>
          row && typeof row === 'object' && !Array.isArray(row)
            ? (row as Record<string, unknown>)
            : { value: row as unknown }
        );
      }
    }
    return [];
  };

  const getRowDateValue = (row: Record<string, unknown>): number => {
    const rawDate = getOpexValueByKeys(row, ['toDate', 'date', 'expenseDate']);
    if (typeof rawDate === 'number') return rawDate;
    if (typeof rawDate === 'string') {
      const asNumber = Number(rawDate);
      if (!Number.isNaN(asNumber) && asNumber > 1e11) return asNumber;
      const parsed = new Date(rawDate).getTime();
      return Number.isNaN(parsed) ? Number.MAX_SAFE_INTEGER : parsed;
    }
    return Number.MAX_SAFE_INTEGER;
  };

  const handleExportAllOpex = async () => {
    if (!accessToken || !clinicName) return;
    const totalCount = Number(opexList?.totalElements) || 0;

    setIsExportingOpex(true);
    try {
      if (totalCount === 0) {
        downloadOpexAsXlsx([]);
        return;
      }

      const exportSize = totalCount;

      const firstPageRaw = await makeApiRequest(API_CONFIG.ENDPOINTS.OPEX_EXPENSES_LIST, accessToken, {
        locationId: clinicName,
        fromDate: startDate,
        toDate: endDate,
        page: 0,
        size: exportSize,
      });

      const firstPayload = firstPageRaw as Record<string, unknown> | undefined;
      const firstInner = (firstPayload?.data ?? firstPayload) as Record<string, unknown> | undefined;
      const totalPages = Number(firstInner?.totalPages ?? firstPayload?.totalPages ?? 1) || 1;
      let allRows = normalizeOpexExportRows(firstPageRaw);

      for (let page = 1; page < totalPages; page += 1) {
        const pageRaw = await makeApiRequest(API_CONFIG.ENDPOINTS.OPEX_EXPENSES_LIST, accessToken, {
          locationId: clinicName,
          fromDate: startDate,
          toDate: endDate,
          page,
          size: exportSize,
        });
        allRows = allRows.concat(normalizeOpexExportRows(pageRaw));
      }

      const monthFilteredRows = [...allRows];
      monthFilteredRows.sort((a, b) => getRowDateValue(a) - getRowDateValue(b));
      downloadOpexAsXlsx(monthFilteredRows);
    } catch (exportError) {
      console.error('Failed to export OPEX details:', exportError);
    } finally {
      setIsExportingOpex(false);
    }
  };

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
        
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <DatePickerWithRange
            className="[&_button]:h-9 [&_button]:min-w-[220px] [&_button]:w-auto"
            date={customDateRange ?? { from: undefined, to: undefined }}
            setDate={(range) => {
              if (range?.from && range?.to) {
                setCustomDateRange({ from: range.from, to: range.to });
              } else if (range?.from || range?.to) {
                setCustomDateRange(range);
              } else {
                setCustomDateRange(undefined);
              }
            }}
          />
          {customRangeActive && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 text-muted-foreground"
              onClick={() => setCustomDateRange(undefined)}
            >
              Clear range
            </Button>
          )}
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
                className="h-9 min-w-[180px] w-[280px] justify-start text-left font-normal"
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
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-blue-800 dark:text-blue-200">
                  OPEX Details
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                  onClick={handleExportAllOpex}
                  disabled={isExportingOpex || opexListLoading || !!opexListError}
                >
                  {isExportingOpex ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  <span>{isExportingOpex ? 'Exporting...' : 'Export'}</span>
                </Button>
              </div>
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
