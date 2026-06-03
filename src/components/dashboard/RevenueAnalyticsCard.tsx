import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRevenueAnalytics } from '@/hooks/use-revenue-analytics';
import { useClinic } from '@/contexts/ClinicContext';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download } from 'lucide-react';
import { DateRange } from "react-day-picker";

interface RevenueAnalyticsCardProps {
  dateRange?: DateRange;
  clinicId?: string;
}

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

const SUMMARY_BREAKDOWN_LABELS = new Set([
  'Total Revenue',
  'Average Monthly',
  'Growth Rate',
  'Net Margin',
]);

export const RevenueAnalyticsCard: React.FC<RevenueAnalyticsCardProps> = ({ dateRange, clinicId: clinicIdProp }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { clinicName } = useParams<{ clinicName: string }>();
  const { currentClinic } = useClinic();

  // Resolve clinicId from explicit prop first, then ClinicContext, then route param (named `clinicName` in routes).
  const clinicId = clinicIdProp || currentClinic?.clinicId || clinicName || undefined;

  // Convert the incoming date range to start/end timestamps (UTC)
  const { startDate, endDate } = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) {
      return { startDate: undefined, endDate: undefined };
    }

    const from = dateRange.from;
    const to = dateRange.to;

    const startDateUtc = Date.UTC(
      from.getUTCFullYear(),
      from.getUTCMonth(),
      from.getUTCDate(),
      18,
      30,
      0,
      0
    );

    const endDateUtc = Date.UTC(
      to.getUTCFullYear(),
      to.getUTCMonth(),
      to.getUTCDate(),
      18,
      29,
      0,
      0
    );

    return { startDate: startDateUtc, endDate: endDateUtc };
  }, [dateRange]);

  // Use the revenue analytics hook to get real data
  const { revenueAnalyticsData, loading, error } = useRevenueAnalytics({
    clinicId,
    startDate,
    endDate,
  });
  const [selectedPaymentMode, setSelectedPaymentMode] = useState('All Payment Modes');
  const [selectedTreatmentType, setSelectedTreatmentType] = useState('All Treatment Types');
  const [detailsPage, setDetailsPage] = useState(1);
  const detailsPageSize = 10;

  const apiBreakdown = revenueAnalyticsData?.data?.revenueBreakdown ?? [];
  const recentTransactions = revenueAnalyticsData?.data?.recentTransactions ?? [];

  const treatmentBreakdown = useMemo(
    () =>
      apiBreakdown.filter(
        (item) => !SUMMARY_BREAKDOWN_LABELS.has(item.treatmentType ?? '')
      ),
    [apiBreakdown]
  );

  const treatmentTypeOptions = useMemo(() => {
    const types = new Set<string>();

    treatmentBreakdown.forEach((item) => {
      if (item.treatmentType) {
        types.add(item.treatmentType);
      }
    });

    recentTransactions.forEach((tx) => {
      if (tx.treatmentType) {
        types.add(tx.treatmentType);
      }
    });

    return Array.from(types).sort();
  }, [treatmentBreakdown, recentTransactions]);

  const filteredRevenueSummary = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return treatmentBreakdown
      .map((item) => ({
        treatmentType: item.treatmentType ?? 'Unknown',
        totalRevenue: item.totalRevenue,
        percentage: item.percentage,
      }))
      .filter((item) => {
        const matchesTreatment =
          selectedTreatmentType === 'All Treatment Types' ||
          item.treatmentType === selectedTreatmentType;

        if (!matchesTreatment) return false;

        if (!query) return true;
        return item.treatmentType.toLowerCase().includes(query);
      });
  }, [treatmentBreakdown, searchQuery, selectedTreatmentType]);

  // Label only the largest slices on the chart; full list lives in the legend.
  const pieLabelTreatmentSet = useMemo(
    () =>
      new Set(
        [...filteredRevenueSummary]
          .sort((a, b) => b.totalRevenue - a.totalRevenue)
          .slice(0, 5)
          .map((item) => item.treatmentType)
      ),
    [filteredRevenueSummary]
  );

  const renderPieLabel = (props: {
    cx?: number;
    cy?: number;
    midAngle?: number;
    outerRadius?: number;
    payload?: { treatmentType?: string };
    percent?: number;
  }) => {
    const { cx = 0, cy = 0, midAngle = 0, outerRadius = 0, payload, percent = 0 } = props;
    const treatmentType = payload?.treatmentType;
    if (!treatmentType || !pieLabelTreatmentSet.has(treatmentType) || percent < 0.05) {
      return null;
    }

    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.12;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const shortName =
      treatmentType.length > 22 ? `${treatmentType.slice(0, 22)}…` : treatmentType;

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

  const filteredTransactions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return recentTransactions.filter((tx) => {
      const treatmentRaw = tx.treatmentType ?? 'Unknown';

      const matchesTreatment =
        selectedTreatmentType === 'All Treatment Types' ||
        treatmentRaw === selectedTreatmentType;

      if (!matchesTreatment) return false;

      const treatment = treatmentRaw.toLowerCase();
      if (!query) return true;
      return treatment.includes(query);
    });
  }, [recentTransactions, searchQuery, selectedTreatmentType]);

  const totalDetailsItems = filteredTransactions.length;
  const totalDetailsPages = Math.max(1, Math.ceil(totalDetailsItems / detailsPageSize));

  const paginatedTransactions = useMemo(() => {
    const startIndex = (detailsPage - 1) * detailsPageSize;
    const endIndex = startIndex + detailsPageSize;
    return filteredTransactions.slice(startIndex, endIndex);
  }, [detailsPage, detailsPageSize, filteredTransactions]);

  // Reset pagination when search query or treatment filter changes, or data set changes
  useEffect(() => {
    setDetailsPage(1);
  }, [searchQuery, selectedTreatmentType, recentTransactions.length]);

  const revenueSummary = revenueAnalyticsData?.data;
  const totalRevenue = revenueSummary?.totalRevenue ?? 0;
  const averageMonthly = revenueSummary?.averageMonthlyRevenue ?? revenueSummary?.averageMonthly ?? 0;
  const revenueInsurancePendingFromPatients = revenueSummary?.revenueInsurancePendingFromPatients ?? 0;
  const averageMonthlyRevenueInsurancePending = revenueSummary?.averageMonthlyRevenueInsurancePending ?? 0;
  const averageMonthlyRevenueSelfPay = revenueSummary?.averageMonthlyRevenueSelfPay ?? 0;
  const revenueSelfPay = revenueSummary?.revenueSelfPay ?? 0;
  const doctorLedRevenue = revenueSummary?.doctorLedRevenue ?? 0;
  const doctorLedRevenuePercent = revenueSummary?.doctorLedRevenuePercent ?? 0;
  const insuranceLedRevenue = revenueSummary?.insuranceLedRevenue ?? 0;
  const insuranceLedRevenuePercent = revenueSummary?.insuranceLedRevenuePercent ?? 0;
  const marketingLedRevenue = revenueSummary?.marketingLedRevenue ?? 0;
  const marketingLedRevenuePercent = revenueSummary?.marketingLedRevenuePercent ?? 0;
  const growthRate = revenueSummary?.growthRate ?? 0;
  const netMargin = revenueSummary?.netMargin ?? 0;
  const ebitda =
    revenueSummary?.ebitda ??
    (totalRevenue > 0 && netMargin ? (totalRevenue * netMargin) / 100 : 0);

  const revenueMetrics = useMemo(
    () => [
      { title: 'Total Revenue', value: formatIndianCurrency(totalRevenue), sub: 'Current month' },
      { title: 'Average Monthly Revenue', value: formatIndianCurrency(averageMonthly), sub: 'Last 10 months' },
      { title: 'Growth Rate', value: `${growthRate.toFixed(2)}%`, sub: 'Selected period' },
      {
        title: 'EBITDA',
        value: `${formatIndianCurrency(ebitda)} (${netMargin.toFixed(1)}%)`,
        sub: 'Net margin for selected period',
      },
      {
        title: 'Self Pay Revenue',
        value: formatIndianCurrency(revenueSelfPay),
        sub: `Avg ${formatIndianCurrency(averageMonthlyRevenueSelfPay)}`,
      },
      {
        title: 'Insurance Revenue (Pending)',
        value: formatIndianCurrency(revenueInsurancePendingFromPatients),
        sub: `Avg ${formatIndianCurrency(averageMonthlyRevenueInsurancePending)}`,
      },
      {
        title: 'Doctor Led Revenue',
        value: `${formatIndianCurrency(doctorLedRevenue)} (${doctorLedRevenuePercent.toFixed(2)}%)`,
        sub: 'Selected period',
      },
      {
        title: 'Marketing Led Revenue',
        value: `${formatIndianCurrency(marketingLedRevenue)} (${marketingLedRevenuePercent.toFixed(2)}%)`,
        sub: 'Selected period',
      },
      {
        title: 'Insurance Led Revenue',
        value: `${formatIndianCurrency(insuranceLedRevenue)} (${insuranceLedRevenuePercent.toFixed(2)}%)`,
        sub: 'Selected period',
      },
    ],
    [
      totalRevenue,
      averageMonthly,
      growthRate,
      ebitda,
      netMargin,
      revenueSelfPay,
      averageMonthlyRevenueSelfPay,
      revenueInsurancePendingFromPatients,
      averageMonthlyRevenueInsurancePending,
      doctorLedRevenue,
      doctorLedRevenuePercent,
      marketingLedRevenue,
      marketingLedRevenuePercent,
      insuranceLedRevenue,
      insuranceLedRevenuePercent,
    ]
  );

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border">
          <CardTitle className="text-xl font-semibold text-foreground">
            Revenue Overview (API)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {loading && <div className="text-sm text-blue-600 mb-4">Loading revenue analytics...</div>}
          {error && (
            <div className="text-sm text-red-600 mb-4">Error loading revenue analytics: {error}</div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {revenueMetrics.map((metric) => (
              <div
                key={metric.title}
                className="bg-card border border-border rounded-lg p-4"
              >
                <div className="text-sm text-foreground font-medium">{metric.title}</div>
                <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1 leading-snug">
                  {metric.value}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{metric.sub}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardContent className="p-6">
          {loading && (
            <div className="mb-4 text-sm text-blue-600">
              Loading revenue analytics...
            </div>
          )}
          {error && (
            <div className="mb-4 text-sm text-red-600">
              Error loading revenue analytics: {error}
            </div>
          )}
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-3 items-center flex-1">
              <Input
                placeholder="Search by treatment type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-80"
              />
              <Select value={selectedTreatmentType} onValueChange={setSelectedTreatmentType}>
                <SelectTrigger className="w-48">
                  <SelectValue>{selectedTreatmentType}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Treatment Types">All Treatment Types</SelectItem>
                  {treatmentTypeOptions.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedPaymentMode} onValueChange={setSelectedPaymentMode}>
                <SelectTrigger className="w-48">
                  <SelectValue>{selectedPaymentMode}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Payment Modes">All Payment Modes</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="IMPS">IMPS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex gap-2">
                <Download size={16} />
                Export to Excel
              </Button>
              <Button variant="outline" size="sm" className="flex gap-2">
                <Download size={16} />
                Export All Data
              </Button>
            </div> */}
          </div>

          <Tabs defaultValue="table" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="table">Table View</TabsTrigger>
              <TabsTrigger value="pie">Pie Chart</TabsTrigger>
              <TabsTrigger value="bar">Bar Chart</TabsTrigger>
            </TabsList>

            {/* Table View - Revenue Breakdown by Treatment */}
            <TabsContent value="table" className="space-y-4">
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-800">
                      <TableHead className="font-semibold">No.</TableHead>
                      <TableHead className="font-semibold">Treatment Type</TableHead>
                      <TableHead className="font-semibold">Total Revenue</TableHead>
                      <TableHead className="font-semibold">Percentage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRevenueSummary.map((revenue, index) => (
                      <TableRow key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="text-blue-600 dark:text-blue-400 font-medium">{revenue.treatmentType}</TableCell>
                        <TableCell className="font-medium">{formatIndianCurrency(revenue.totalRevenue)}</TableCell>
                        <TableCell>
                          <span className="font-medium">{revenue.percentage.toFixed(2)}%</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Pie Chart */}
            <TabsContent value="pie">
              <div className="h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 20, right: 220, bottom: 20, left: 20 }}>
                    <Pie
                      data={filteredRevenueSummary}
                      cx="38%"
                      cy="50%"
                      labelLine
                      outerRadius={160}
                      fill="#8884d8"
                      dataKey="totalRevenue"
                      nameKey="treatmentType"
                      label={renderPieLabel}
                    >
                      {filteredRevenueSummary.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const row = payload[0].payload as {
                          treatmentType: string;
                          totalRevenue: number;
                          percentage: number;
                        };
                        return (
                          <div className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-md dark:border-gray-700 dark:bg-gray-900">
                            <p className="font-semibold text-gray-800 dark:text-gray-100">
                              {row.treatmentType}
                            </p>
                            <p className="text-gray-600 dark:text-gray-300">
                              {formatIndianCurrency(row.totalRevenue)} ({row.percentage.toFixed(1)}%)
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
                        maxHeight: 460,
                        overflowY: 'auto',
                      }}
                      formatter={(value) => {
                        const item = filteredRevenueSummary.find(
                          (row) => row.treatmentType === value
                        );
                        if (!item) return value;
                        return `${value} (${item.percentage.toFixed(1)}%)`;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            {/* Bar Chart */}
            <TabsContent value="bar">
              <div className="h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={filteredRevenueSummary} 
                    margin={{ top: 20, right: 30, left: 20, bottom: 120 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="treatmentType" 
                      angle={-45}
                      textAnchor="end"
                      height={140}
                      interval={0}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [formatIndianCurrency(value as number), 'Total Revenue']}
                      labelStyle={{ color: '#374151' }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="totalRevenue" 
                      fill="#3b82f6" 
                      name="Total Revenue"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}; 