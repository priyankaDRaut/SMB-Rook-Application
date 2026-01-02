import React, { useEffect, useMemo, useState } from 'react';
import { useRevenueAnalytics } from '@/hooks/use-revenue-analytics';
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

export const RevenueAnalyticsCard: React.FC<RevenueAnalyticsCardProps> = ({ dateRange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const clinicId = '';

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
      0,
      0,
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

  const treatmentTypeOptions = useMemo(() => {
    const types = new Set<string>();

    apiBreakdown.forEach((item) => {
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
  }, [apiBreakdown, recentTransactions]);

  const filteredRevenueSummary = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return apiBreakdown
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
  }, [apiBreakdown, searchQuery, selectedTreatmentType]);

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

  // Calculate total revenue
  const totalRevenue =
    revenueAnalyticsData?.data?.totalRevenue ??
    filteredRevenueSummary.reduce((sum, item) => sum + item.totalRevenue, 0);

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
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
                  <PieChart>
                    <Pie
                      data={filteredRevenueSummary}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={200}
                      fill="#8884d8"
                      dataKey="totalRevenue"
                      nameKey="treatmentType"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {filteredRevenueSummary.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [formatIndianCurrency(value as number), 'Revenue']}
                      labelStyle={{ color: '#374151' }}
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