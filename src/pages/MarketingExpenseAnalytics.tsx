import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, addMonths, subMonths } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { useClinic } from '@/contexts/ClinicContext';
import { useClinicDetails } from '@/hooks/use-clinic-details';
import { useMarketingDetail } from '@/hooks/use-marketing-detail';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';

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

const COLORS = ['#3b82f6', '#2563eb', '#1d4ed8', '#1e40af'];

const formatCurrency = (amount: number) => {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return formatter.format(amount);
};

const formatPercent = (value: number) => `${value.toFixed(2)}%`;

const formatRatio = (value: number) => value.toFixed(2);

const MarketingExpenseAnalytics = () => {
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

  const [selectedMonth, setSelectedMonth] = useState<Date>(() =>
    getMonthFromQuery(searchParams.get('month'))
  );
  const [tempMonth, setTempMonth] = useState<Date>(selectedMonth);
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>(() => {
    const from = parseQueryDate(searchParams.get('fromDate'));
    const to = parseQueryDate(searchParams.get('toDate'));
    if (from && to) return { from, to };
    return undefined;
  });
  const customRangeActive = Boolean(customDateRange?.from && customDateRange?.to);

  useEffect(() => {
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
    endDate: memoizedDateRange.endDate,
  });

  const clinic = clinicDetailsData?.data;

  useEffect(() => {
    if (clinic?.clinicName) {
      setCurrentClinic({
        clinicId: clinic.clinicId,
        clinicName: clinic.clinicName,
        revenue: clinic.revenue,
        netIncome: clinic.netIncome,
      });
    }
  }, [clinic, setCurrentClinic]);

  useEffect(() => {
    return () => setCurrentClinic(null);
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

  const { marketingDetailData, loading, error } = useMarketingDetail({
    clinicId: clinicName || '',
    startDate,
    endDate,
  });

  const marketing = marketingDetailData?.data;

  const spendBreakdown = useMemo(
    () => [
      {
        channel: 'Digital Ads',
        amount: marketing?.digitalAdsMarketingSpend ?? 0,
      },
      {
        channel: 'Offline',
        amount: marketing?.offlineMarketingSpend ?? 0,
      },
      {
        channel: 'Insurance Led',
        amount: marketing?.insuranceLedMarketingSpend ?? 0,
      },
    ],
    [marketing]
  );

  const spendBreakdownWithPercent = useMemo(() => {
    const total = marketing?.overallMarketingSpend ?? 0;
    return spendBreakdown.map((item) => ({
      ...item,
      percentage: total > 0 ? (item.amount / total) * 100 : 0,
    }));
  }, [spendBreakdown, marketing?.overallMarketingSpend]);

  const cppBreakdown = useMemo(
    () => [
      { channel: 'Overall', amount: marketing?.cppViaOverallMarketingSpend ?? 0 },
      { channel: 'Digital Ads', amount: marketing?.cppViaDigitalAdsMarketingSpend ?? 0 },
      { channel: 'Insurance Led', amount: marketing?.cppViaInsuranceLedMarketingSpend ?? 0 },
    ],
    [marketing]
  );

  const attributionData = useMemo(
    () => [
      {
        channel: 'Overall',
        percent: marketing?.marketingAttributedRevenuePercent ?? 0,
      },
      {
        channel: 'Digital',
        percent: marketing?.digitalMarketingAttributedRevenuePercent ?? 0,
      },
      {
        channel: 'Insurance',
        percent: marketing?.insuranceMarketingAttributedRevenuePercent ?? 0,
      },
    ],
    [marketing]
  );

  const paybackData = useMemo(
    () => [
      { channel: 'Overall', ratio: marketing?.marketingPaybackRatioOverall ?? 0 },
      { channel: 'Online', ratio: marketing?.marketingPaybackRatioOnline ?? 0 },
      { channel: 'Offline', ratio: marketing?.marketingPaybackRatioOffline ?? 0 },
      { channel: 'Insurance', ratio: marketing?.marketingPaybackRatioInsurance ?? 0 },
    ],
    [marketing]
  );

  const hasMarketingData = Boolean(
    marketing &&
      (marketing.overallMarketingSpend > 0 ||
        marketing.digitalAdsMarketingSpend > 0 ||
        marketing.offlineMarketingSpend > 0 ||
        marketing.insuranceLedMarketingSpend > 0 ||
        marketing.marketingAttributedRevenuePercent > 0 ||
        marketing.digitalMarketingAttributedRevenuePercent > 0 ||
        marketing.insuranceMarketingAttributedRevenuePercent > 0 ||
        marketing.cppViaOverallMarketingSpend > 0 ||
        marketing.cppViaDigitalAdsMarketingSpend > 0 ||
        marketing.cppViaInsuranceLedMarketingSpend > 0 ||
        marketing.marketingPaybackRatioOverall > 0 ||
        marketing.marketingPaybackRatioOnline > 0 ||
        marketing.marketingPaybackRatioOffline > 0 ||
        marketing.marketingPaybackRatioInsurance > 0)
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/clinics/${clinicName}`)}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Marketing Expense Analysis
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Marketing and promotional spend details
            </p>
            <p className="text-sm text-muted-foreground">
              Selected month: {format(selectedMonth, 'MMM yyyy')}
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
        </div>
      </div>

      {loading && (
        <div className="text-sm text-blue-600">Loading marketing analytics...</div>
      )}
      {error && (
        <div className="text-sm text-red-600">Error loading marketing analytics: {error}</div>
      )}

      {!loading && !error && !hasMarketingData ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-blue-800 dark:text-blue-200">Marketing Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex min-h-[240px] items-center justify-center rounded-md border bg-muted/20">
              <p className="text-lg font-medium text-muted-foreground">No Data Available</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Overall Marketing Spend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {formatCurrency(marketing?.overallMarketingSpend ?? 0)}
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">Selected period</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Marketing Attributed Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {formatPercent(marketing?.marketingAttributedRevenuePercent ?? 0)}
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">Of total revenue</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  CPP (Overall)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {formatCurrency(marketing?.cppViaOverallMarketingSpend ?? 0)}
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">Cost per patient</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Payback Ratio (Overall)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {formatRatio(marketing?.marketingPaybackRatioOverall ?? 0)}
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">Marketing ROI proxy</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="spend" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
              <TabsTrigger value="spend">Spend Breakdown</TabsTrigger>
              <TabsTrigger value="attribution">Revenue Attribution</TabsTrigger>
              <TabsTrigger value="cpp">Cost Per Patient</TabsTrigger>
              <TabsTrigger value="payback">Payback Ratios</TabsTrigger>
            </TabsList>

            <TabsContent value="spend" className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-blue-800 dark:text-blue-200">
                      Marketing Spend by Channel
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Channel</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="text-right">Share</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {spendBreakdownWithPercent.map((item) => (
                          <TableRow key={item.channel}>
                            <TableCell className="font-medium">{item.channel}</TableCell>
                            <TableCell className="text-right font-semibold text-blue-600 dark:text-blue-400">
                              {formatCurrency(item.amount)}
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                {item.percentage.toFixed(2)}%
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-blue-800 dark:text-blue-200">
                      Spend Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <PieChart>
                        <Pie
                          data={spendBreakdown.filter((item) => item.amount > 0)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          nameKey="channel"
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={150}
                          fill="#8884d8"
                          dataKey="amount"
                        >
                          {spendBreakdown.map((entry, index) => (
                            <Cell key={`cell-${entry.channel}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="attribution">
              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-800 dark:text-blue-200">
                    Marketing Attributed Revenue %
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={attributionData} margin={{ bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="channel" />
                      <YAxis tickFormatter={(value) => `${value}%`} />
                      <Tooltip formatter={(value) => formatPercent(Number(value))} />
                      <Legend />
                      <Bar dataKey="percent" fill="#3b82f6" name="Attributed Revenue %" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cpp">
              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-800 dark:text-blue-200">
                    Cost Per Patient by Channel
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Channel</TableHead>
                        <TableHead className="text-right">CPP</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cppBreakdown.map((item) => (
                        <TableRow key={item.channel}>
                          <TableCell className="font-medium">{item.channel}</TableCell>
                          <TableCell className="text-right font-semibold text-blue-600 dark:text-blue-400">
                            {formatCurrency(item.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payback">
              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-800 dark:text-blue-200">
                    Marketing Payback Ratios
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={paybackData} margin={{ bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="channel" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatRatio(Number(value))} />
                      <Legend />
                      <Bar dataKey="ratio" fill="#2563eb" name="Payback Ratio" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default MarketingExpenseAnalytics;
