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

  const clinicRevenue = clinic?.revenue ?? 0;

  const resolveRevenueAmount = (amount?: number, percent?: number) => {
    if (amount != null && amount > 0) return amount;
    if (clinicRevenue > 0 && percent) return (clinicRevenue * percent) / 100;
    return amount ?? 0;
  };

  const formatRevenueWithPercent = (amount?: number, percent?: number) => {
    const revenue = resolveRevenueAmount(amount, percent);
    const pct = percent ?? 0;
    return pct > 0
      ? `${formatCurrency(revenue)} (${pct.toFixed(2)}%)`
      : formatCurrency(revenue);
  };

  const attributionData = useMemo(
    () => [
      {
        channel: 'Overall Marketing Revenue',
        percent: marketing?.marketingAttributedRevenuePercent ?? 0,
        revenue: resolveRevenueAmount(undefined, marketing?.marketingAttributedRevenuePercent),
      },
      {
        channel: 'Digital Marketing Revenue',
        percent: marketing?.digitalMarketingAttributedRevenuePercent ?? 0,
        revenue: resolveRevenueAmount(
          marketing?.marketingLedRevenue,
          marketing?.digitalMarketingAttributedRevenuePercent
        ),
      },
      {
        channel: 'Insurance Marketing Revenue',
        percent: marketing?.insuranceMarketingAttributedRevenuePercent ?? 0,
        revenue: resolveRevenueAmount(
          marketing?.insuranceLedRevenue,
          marketing?.insuranceMarketingAttributedRevenuePercent
        ),
      },
      {
        channel: 'Doctor Led',
        percent: marketing?.doctorLedRevenuePercent ?? 0,
        revenue: marketing?.doctorLedRevenue ?? 0,
      },
      {
        channel: 'Marketing Led',
        percent: marketing?.marketingLedRevenuePercent ?? 0,
        revenue: marketing?.marketingLedRevenue ?? 0,
      },
      {
        channel: 'Insurance Led',
        percent: marketing?.insuranceLedRevenuePercent ?? 0,
        revenue: marketing?.insuranceLedRevenue ?? 0,
      },
      {
        channel: 'Referral',
        percent: marketing?.referralRevenuePercent ?? 0,
        revenue: marketing?.referralRevenue ?? 0,
      },
    ],
    [marketing, clinicRevenue]
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

  const marketingSpendMetrics = useMemo(
    () => [
      { title: 'Overall Marketing Spend', value: formatCurrency(marketing?.overallMarketingSpend ?? 0) },
      { title: 'Digital Ads Marketing Spend', value: formatCurrency(marketing?.digitalAdsMarketingSpend ?? 0) },
      { title: 'Offline Marketing Spend', value: formatCurrency(marketing?.offlineMarketingSpend ?? 0) },
      { title: 'Insurance Led Marketing Spend', value: formatCurrency(marketing?.insuranceLedMarketingSpend ?? 0) },
      { title: 'CPP (Overall)', value: formatCurrency(marketing?.cppViaOverallMarketingSpend ?? 0) },
      { title: 'CPP (Digital Ads)', value: formatCurrency(marketing?.cppViaDigitalAdsMarketingSpend ?? 0) },
      {
        title: 'CPP (Insurance Led)',
        value: formatCurrency(marketing?.cppViaInsuranceLedMarketingSpend ?? 0),
      },
    ],
    [marketing]
  );

  const marketingPaybackMetrics = useMemo(
    () => [
      { title: 'Overall Payback Ratio', value: formatRatio(marketing?.marketingPaybackRatioOverall ?? 0) },
      { title: 'Online Payback Ratio', value: formatRatio(marketing?.marketingPaybackRatioOnline ?? 0) },
      { title: 'Offline Payback Ratio', value: formatRatio(marketing?.marketingPaybackRatioOffline ?? 0) },
      { title: 'Insurance Payback Ratio', value: formatRatio(marketing?.marketingPaybackRatioInsurance ?? 0) },
    ],
    [marketing]
  );

  const LED_REVENUE_CHANNELS = new Set([
    'Doctor Led',
    'Marketing Led',
    'Insurance Led',
    'Referral',
  ]);

  const marketingAttributionSummaryMetrics = useMemo(
    () =>
      attributionData
        .filter((item) => !LED_REVENUE_CHANNELS.has(item.channel))
        .map((item) => ({
          title: item.channel,
          value: formatRevenueWithPercent(item.revenue, item.percent),
        })),
    [attributionData, clinicRevenue]
  );

  const marketingLedRevenueMetrics = useMemo(
    () =>
      attributionData
        .filter((item) => LED_REVENUE_CHANNELS.has(item.channel))
        .map((item) => ({
          title: item.channel,
          value: formatRevenueWithPercent(item.revenue, item.percent),
        })),
    [attributionData, clinicRevenue]
  );

  const spendPieData = useMemo(
    () => spendBreakdownWithPercent.filter((item) => item.amount > 0),
    [spendBreakdownWithPercent]
  );

  const pieLabelChannelSet = useMemo(
    () =>
      new Set(
        [...spendPieData]
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 5)
          .map((item) => item.channel)
      ),
    [spendPieData]
  );

  const renderSpendPieLabel = (props: {
    cx?: number;
    cy?: number;
    midAngle?: number;
    outerRadius?: number;
    payload?: { channel?: string };
    percent?: number;
  }) => {
    const { cx = 0, cy = 0, midAngle = 0, outerRadius = 0, payload, percent = 0 } = props;
    const channel = payload?.channel;
    if (!channel || !pieLabelChannelSet.has(channel) || percent < 0.05) {
      return null;
    }

    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.12;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const shortName = channel.length > 22 ? `${channel.slice(0, 22)}…` : channel;

    return (
      <text
        x={x}
        y={y}
        fill="#374151"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={11}
        fontWeight={600}
      >
        {`${shortName} ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const renderMetricGrid = (
    metrics: { title: string; value: string }[],
    subtitle = `${format(selectedMonth, 'MMM yyyy')}`,
    gridClassName = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
  ) => (
    <div className={gridClassName}>
      {metrics.map((metric) => (
        <div
          key={metric.title}
          className="bg-card border border-border rounded-lg p-4"
        >
          <div className="text-sm text-foreground font-medium">{metric.title}</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {metric.value}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        </div>
      ))}
    </div>
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
        marketing.marketingPaybackRatioInsurance > 0 ||
        (marketing.doctorLedRevenue ?? 0) > 0 ||
        (marketing.marketingLedRevenue ?? 0) > 0 ||
        (marketing.insuranceLedRevenue ?? 0) > 0 ||
        (marketing.doctorLedRevenuePercent ?? 0) > 0 ||
        (marketing.marketingLedRevenuePercent ?? 0) > 0 ||
        (marketing.insuranceLedRevenuePercent ?? 0) > 0 ||
        (marketing.referralRevenue ?? 0) > 0 ||
        (marketing.referralRevenuePercent ?? 0) > 0)
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
          <Card className="bg-card border-border">
            <CardHeader className="pb-4 border-b border-border">
              <CardTitle className="text-xl font-semibold text-foreground">
                Marketing Spend
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {renderMetricGrid(marketingSpendMetrics)}
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-4 border-b border-border">
              <CardTitle className="text-xl font-semibold text-foreground">
                Payback Ratios
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {renderMetricGrid(marketingPaybackMetrics, `${format(selectedMonth, 'MMM yyyy')}`)}
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-4 border-b border-border">
              <CardTitle className="text-xl font-semibold text-foreground">
                Revenue
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {renderMetricGrid(
                marketingAttributionSummaryMetrics,
                `${format(selectedMonth, 'MMM yyyy')}`,
                'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
              )}
              {renderMetricGrid(
                marketingLedRevenueMetrics,
                `${format(selectedMonth, 'MMM yyyy')}`,
                'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'
              )}
            </CardContent>
          </Card>

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
                      <PieChart margin={{ top: 20, right: 200, bottom: 20, left: 20 }}>
                        <Pie
                          data={spendPieData}
                          cx="38%"
                          cy="50%"
                          labelLine
                          nameKey="channel"
                          label={renderSpendPieLabel}
                          outerRadius={130}
                          fill="#8884d8"
                          dataKey="amount"
                        >
                          {spendPieData.map((entry, index) => (
                            <Cell key={`cell-${entry.channel}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            const row = payload[0].payload as {
                              channel: string;
                              amount: number;
                              percentage: number;
                            };
                            return (
                              <div className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-md dark:border-gray-700 dark:bg-gray-900">
                                <p className="font-semibold text-gray-800 dark:text-gray-100">
                                  {row.channel}
                                </p>
                                <p className="text-gray-600 dark:text-gray-300">
                                  {formatCurrency(row.amount)} ({row.percentage.toFixed(1)}%)
                                </p>
                              </div>
                            );
                          }}
                        />
                        <Legend
                          layout="vertical"
                          verticalAlign="middle"
                          align="right"
                          wrapperStyle={{
                            paddingLeft: 12,
                            fontSize: 11,
                            maxHeight: 360,
                            overflowY: 'auto',
                          }}
                          formatter={(value) => {
                            const item = spendPieData.find((row) => row.channel === value);
                            if (!item) return value;
                            return `${value} (${item.percentage.toFixed(1)}%)`;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="attribution">
              <div className="grid grid-cols-1 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-blue-800 dark:text-blue-200">
                      Revenue Attribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Channel</TableHead>
                          <TableHead className="text-right">Revenue</TableHead>
                          <TableHead className="text-right">Share</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {attributionData.map((item) => (
                          <TableRow key={item.channel}>
                            <TableCell className="font-medium">{item.channel}</TableCell>
                            <TableCell className="text-right font-semibold text-blue-600 dark:text-blue-400">
                              {formatCurrency(item.revenue)}
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                {item.percent.toFixed(2)}%
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
                      Marketing Attributed Revenue %
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={attributionData} margin={{ bottom: 80 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="channel"
                          angle={-30}
                          textAnchor="end"
                          height={90}
                          interval={0}
                          tick={{ fontSize: 11 }}
                        />
                        <YAxis tickFormatter={(value) => `${value}%`} />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            const row = payload[0].payload as {
                              channel: string;
                              revenue: number;
                              percent: number;
                            };
                            return (
                              <div className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-md dark:border-gray-700 dark:bg-gray-900">
                                <p className="font-semibold text-gray-800 dark:text-gray-100">
                                  {row.channel}
                                </p>
                                <p className="text-gray-600 dark:text-gray-300">
                                  {formatCurrency(row.revenue)} ({row.percent.toFixed(2)}%)
                                </p>
                              </div>
                            );
                          }}
                        />
                        <Legend />
                        <Bar
                          dataKey="percent"
                          fill="#3b82f6"
                          name="Attributed Revenue %"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
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
