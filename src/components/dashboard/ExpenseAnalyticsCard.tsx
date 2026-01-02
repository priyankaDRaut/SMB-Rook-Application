import React, { useMemo, useState } from 'react';
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
import { format } from 'date-fns';
import { useExpenseAnalytics } from '@/hooks/use-expense-analytics';
import { useParams } from 'react-router-dom';
import { useClinic } from '@/contexts/ClinicContext';

interface ExpenseAnalyticsCardProps {
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

const COLORS = [
  '#1E40AF', // Blue 800 - Dark Blue
  '#3B82F6', // Blue 600 - Primary Blue
  '#60A5FA', // Blue 400 - Medium Blue
  '#93C5FD', // Blue 300 - Light Blue
  '#DBEAFE', // Blue 200 - Very Light Blue
  '#1E3A8A', // Blue 900 - Deep Blue
  '#2563EB', // Blue 700 - Rich Blue
  '#7C3AED', // Blue 500 - Bright Blue
  '#A78BFA', // Blue 400 - Soft Blue
  '#C7D2FE'  // Blue 100 - Pale Blue
];

export const ExpenseAnalyticsCard: React.FC<ExpenseAnalyticsCardProps> = ({ dateRange, clinicId: clinicIdProp }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPaymentMode, setSelectedPaymentMode] = useState('All Payment Modes');
  const [selectedExpenseType, setSelectedExpenseType] = useState('All Expense Types');
  const fallbackDateRange = useMemo<DateRange>(() => {
    const now = new Date();
    const year = now.getUTCFullYear();
    const monthIndex = now.getUTCMonth();
    return {
      from: new Date(Date.UTC(year, monthIndex, 1)),
      to: new Date(Date.UTC(year, monthIndex + 1, 0)),
    };
  }, []);

  // Derive effective date range (prefer prop if provided)
  const effectiveDateRange = dateRange ?? fallbackDateRange;

  const { startDate, endDate } = useMemo(() => {
    if (!effectiveDateRange?.from || !effectiveDateRange?.to) {
      return { startDate: undefined, endDate: undefined };
    }

    const from = effectiveDateRange.from;
    const to = effectiveDateRange.to;

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
  }, [effectiveDateRange]);

  const { clinicName } = useParams<{ clinicName: string }>();
  const { currentClinic } = useClinic();
  const clinicId = clinicIdProp || clinicName || currentClinic?.clinicId || '';

  // Fetch real expense analytics data from API
  const { expenseAnalyticsData, loading, error } = useExpenseAnalytics({
    clinicId,
    startDate,
    endDate,
  });

  const apiSummary = expenseAnalyticsData?.data?.expenseBreakdown ?? [];
  const apiRecent = expenseAnalyticsData?.data?.recentExpenses ?? [];

  const expenseTypeOptions = useMemo(() => {
    const types = new Set<string>();

    apiSummary.forEach((item) => {
      if (item.expenseType) {
        types.add(item.expenseType);
      }
    });

    apiRecent.forEach((item) => {
      if (item.expenseType) {
        types.add(item.expenseType);
      }
    });

    return Array.from(types).sort();
  }, [apiSummary, apiRecent]);

  const paymentModeOptions = useMemo(() => {
    const modes = new Set<string>();

    apiRecent.forEach((item) => {
      if (item.paymentMode) {
        modes.add(item.paymentMode);
      }
    });

    return Array.from(modes).sort();
  }, [apiRecent]);

  const filteredRecentExpenses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return apiRecent.filter((expense) => {
      const matchesType =
        selectedExpenseType === 'All Expense Types' ||
        expense.expenseType === selectedExpenseType;

      const matchesPaymentMode =
        selectedPaymentMode === 'All Payment Modes' ||
        expense.paymentMode === selectedPaymentMode;

      if (!matchesType || !matchesPaymentMode) return false;

      if (!query) return true;

      const type = (expense.expenseType ?? '').toLowerCase();
      const vendor = (expense.vendor ?? '').toLowerCase();
      const note = (expense.note ?? '').toLowerCase();

      return (
        type.includes(query) ||
        vendor.includes(query) ||
        note.includes(query)
      );
    });
  }, [apiRecent, searchQuery, selectedExpenseType, selectedPaymentMode]);

  const filteredSummary = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return apiSummary.filter((item) => {
      const matchesType =
        selectedExpenseType === 'All Expense Types' ||
        item.expenseType === selectedExpenseType;

      if (!matchesType) return false;

      if (!query) return true;

      return item.expenseType.toLowerCase().includes(query);
    });
  }, [apiSummary, searchQuery, selectedExpenseType]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Expenses Detail View</h1>
        {expenseAnalyticsData && (
          <div className="text-right text-sm text-gray-600 dark:text-gray-300 space-y-1">
            <div>
              <span className="font-medium">Total Expenses: </span>
              <span>{formatIndianCurrency(expenseAnalyticsData.data.totalExpenses)}</span>
            </div>
            <div>
              <span className="font-medium">Expense Ratio: </span>
              <span>{expenseAnalyticsData.data.expenseRatio.toFixed(2)}%</span>
            </div>
          </div>
        )}
        {/* <div className="text-sm text-muted-foreground">
          Month:{' '}
          <span className="font-medium text-foreground">
            {effectiveDateRange?.from ? format(effectiveDateRange.from, 'MMM yyyy') : '-'}
          </span>
        </div> */}
      </div>

      {/* Filters Row */}
      <Card className="w-full">
        <CardContent className="p-6">
          {loading && (
            <div className="mb-4 text-sm text-blue-600">
              Loading expense analytics...
            </div>
          )}
          {error && (
            <div className="mb-4 text-sm text-red-600">
              Error loading expense analytics: {error}
            </div>
          )}
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-3 items-center flex-1">
              <Input
                placeholder="Search By Expense Type, Vendor"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-80"
              />
              <Select value={selectedExpenseType} onValueChange={setSelectedExpenseType}>
                <SelectTrigger className="w-48">
                  <SelectValue>{selectedExpenseType}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Expense Types">All Expense Types</SelectItem>
                  {expenseTypeOptions.map((type) => (
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
                  {paymentModeOptions.map((mode) => (
                    <SelectItem key={mode} value={mode}>
                      {mode}
                    </SelectItem>
                  ))}
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

            {/* Table View */}
            <TabsContent value="table" className="space-y-4">
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-800">
                      <TableHead className="font-semibold">No.</TableHead>
                      <TableHead className="font-semibold">Expense Type</TableHead>
                      <TableHead className="font-semibold">Vendor</TableHead>
                      <TableHead className="font-semibold">Amount</TableHead>
                      <TableHead className="font-semibold">Payment Mode</TableHead>
                      <TableHead className="font-semibold">Note</TableHead>
                      <TableHead className="font-semibold">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecentExpenses.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center text-muted-foreground py-4"
                        >
                          No expenses available for the selected filters.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRecentExpenses.map((expense, index) => (
                        <TableRow key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <TableCell>{index + 1}</TableCell>
                        <TableCell>{expense.expenseType}</TableCell>
                        <TableCell>{expense.vendor}</TableCell>
                        <TableCell className="font-medium">{formatIndianCurrency(expense.amount)}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {expense.paymentMode}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{expense.note || '-'}</TableCell>
                        <TableCell>{expense.date}</TableCell>
                      </TableRow>
                      ))
                    )}
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
                      data={filteredSummary}
                      dataKey="totalCost"
                      nameKey="expenseType"
                      cx="50%"
                      cy="50%"
                      outerRadius={160}
                      innerRadius={80}
                      paddingAngle={2}
                      label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                      labelLine={true}
                    >
                      {filteredSummary.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]}
                          stroke="#ffffff"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [
                        formatIndianCurrency(value as number), 
                        name
                      ]}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        padding: '12px',
                        fontSize: '14px'
                      }}
                      labelStyle={{
                        color: '#374151',
                        fontWeight: '600',
                        marginBottom: '4px'
                      }}
                    />
                    <Legend 
                      layout="vertical"
                      verticalAlign="middle"
                      align="right"
                      wrapperStyle={{
                        paddingLeft: '20px',
                        fontSize: '12px'
                      }}
                      formatter={(value, entry, index) => [
                        <span style={{ color: COLORS[index % COLORS.length] }}>
                          {value}
                        </span>,
                        <span style={{ color: '#6B7280', marginLeft: '8px' }}>
                          {formatIndianCurrency(filteredSummary[index]?.totalCost || 0)}
                        </span>
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Summary Statistics */}
              <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
                {filteredSummary.map((item, index) => (
                  <div 
                    key={item.expenseType}
                    className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {item.expenseType}
                      </span>
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {formatIndianCurrency(item.totalCost)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {item.percentage.toFixed(1)}% of total
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Bar Chart */}
            <TabsContent value="bar">
              <div className="h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filteredSummary} margin={{ top: 20, right: 30, left: 20, bottom: 120 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="expenseType" 
                      angle={-45}
                      textAnchor="end"
                      height={140}
                      interval={0}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis />
                    <Tooltip formatter={(value) => formatIndianCurrency(value as number)} />
                    <Legend />
                    <Bar dataKey="totalCost" fill="#3B82F6" name="Total Cost" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Detailed Expense Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Detailed Expense Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters for Detailed Analysis */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-3 items-center flex-1">
              <Input
                placeholder="Search By Expense Type, Vendor"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-80"
              />
              <Select value={selectedExpenseType} onValueChange={setSelectedExpenseType}>
                <SelectTrigger className="w-48">
                  <SelectValue>{selectedExpenseType}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Expense Types">All Expense Types</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Consultant">Consultant</SelectItem>
                  <SelectItem value="Clinical">Clinical</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedPaymentMode} onValueChange={setSelectedPaymentMode}>
                <SelectTrigger className="w-48">
                  <SelectValue>{selectedPaymentMode}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Payment Modes">All Payment Modes</SelectItem>
                  <SelectItem value="IMPS">IMPS</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
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
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-800">
                  <TableHead className="font-semibold">No.</TableHead>
                  <TableHead className="font-semibold">Expense Type</TableHead>
                  <TableHead className="font-semibold">Total Cost</TableHead>
                  <TableHead className="font-semibold">Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSummary.map((expense, index) => (
                  <TableRow key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{expense.expenseType}</TableCell>
                    <TableCell className="font-medium">{formatIndianCurrency(expense.totalCost)}</TableCell>
                    <TableCell>
                      <span className="font-medium">{expense.percentage.toFixed(2)}%</span>
                    </TableCell>
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