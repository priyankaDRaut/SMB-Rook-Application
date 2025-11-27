import React, { useState } from 'react';
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
import { Download, Calendar } from 'lucide-react';
import { DateRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ExpenseData {
  id: number;
  expenseType: string;
  vendor: string;
  amount: number;
  paymentMode: string;
  note?: string;
  date: string;
}

interface ExpenseSummary {
  expenseType: string;
  totalCost: number;
  percentage: number;
}

interface ExpenseAnalyticsCardProps {
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

export const ExpenseAnalyticsCard: React.FC<ExpenseAnalyticsCardProps> = ({ dateRange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPaymentMode, setSelectedPaymentMode] = useState('All Payment Modes');
  const [selectedExpenseType, setSelectedExpenseType] = useState('All Expense Types');
  const [dateRangeState, setDateRangeState] = useState<DateRange | undefined>({
    from: new Date(2025, 5, 10), // Jun 10, 2025
    to: new Date(2025, 6, 10), // Jul 10, 2025
  });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>(dateRangeState);

  // Sample expense data matching the reference
  const expenseData: ExpenseData[] = [
    { id: 1, expenseType: 'Marketing And Branding Expense', vendor: 'Google India Pvt Ltd', amount: 5000, paymentMode: 'IMPS', date: '02/07/2025' },
    { id: 2, expenseType: 'Marketing And Branding Expense', vendor: 'Im Corporation', amount: 394, paymentMode: 'IMPS', note: 'IMPS Payment For marketing', date: '30/06/2025' },
    { id: 3, expenseType: 'Consultant Fees', vendor: 'Dr Shreya', amount: 3000, paymentMode: 'IMPS', note: 'Doctor Consultant Fees (IMPS Payment)', date: '30/06/2025' },
    { id: 4, expenseType: 'Consultant Fees', vendor: 'Dr. Simran', amount: 5000, paymentMode: 'IMPS', note: 'Doctor Consultant Fees (IMPS Payment)', date: '30/06/2025' },
    { id: 5, expenseType: 'Consultant Fees', vendor: 'Dr. Siddhi', amount: 20000, paymentMode: 'IMPS', note: 'Doctor Consultant Fees (IMPS Payment)', date: '30/06/2025' },
    { id: 6, expenseType: 'Clinical Instruments', vendor: 'Invisalign India Pvt Ltd', amount: 25000, paymentMode: 'IMPS', date: '30/06/2025' },
    { id: 7, expenseType: 'Consultant Fees', vendor: 'Dr Jignesh', amount: 5000, paymentMode: 'IMPS', note: 'Doctor Consultant Fees (IMPS Payment)', date: '30/06/2025' },
  ];

  // Sample summary data for charts
  const expenseSummary: ExpenseSummary[] = [
    { expenseType: 'Consultant Fees', totalCost: 46000, percentage: 33.20 },
    { expenseType: 'Clinical Instruments', totalCost: 45000, percentage: 32.48 },
    { expenseType: 'Marketing And Branding Expense', totalCost: 27394, percentage: 19.77 },
    { expenseType: 'Salaries - Medical Assistants', totalCost: 10000, percentage: 7.22 },
    { expenseType: 'Consumables - Medical Supplies', totalCost: 4213, percentage: 3.04 },
  ];

  const handleApplyDateRange = () => {
    setDateRangeState(tempDateRange);
    setIsDatePickerOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header with Date Range */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Expenses Detail View</h1>
        <div className="flex items-center gap-2">
          <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[300px] justify-start text-left font-normal",
                  !dateRangeState && "text-muted-foreground"
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {dateRangeState?.from ? (
                  dateRangeState.to ? (
                    <>
                      {format(dateRangeState.from, "LLL dd, y")} -{" "}
                      {format(dateRangeState.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRangeState.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-3">
                <CalendarComponent
                  initialFocus
                  mode="range"
                  defaultMonth={tempDateRange?.from}
                  selected={tempDateRange}
                  onSelect={setTempDateRange}
                  numberOfMonths={2}
                />
                <div className="flex justify-end pt-3 border-t">
                  <Button onClick={handleApplyDateRange} size="sm">
                    Apply
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Filters Row */}
      <Card className="w-full">
        <CardContent className="p-6">
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
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex gap-2">
                <Download size={16} />
                Export to Excel
              </Button>
              <Button variant="outline" size="sm" className="flex gap-2">
                <Download size={16} />
                Export All Data
              </Button>
            </div>
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
                    {expenseData.map((expense) => (
                      <TableRow key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <TableCell>{expense.id}</TableCell>
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
                      data={expenseSummary}
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
                      {expenseSummary.map((entry, index) => (
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
                          {formatIndianCurrency(expenseSummary[index]?.totalCost || 0)}
                        </span>
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Summary Statistics */}
              <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
                {expenseSummary.map((item, index) => (
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
                  <BarChart data={expenseSummary} margin={{ top: 20, right: 30, left: 20, bottom: 120 }}>
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
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex gap-2">
                <Download size={16} />
                Export to Excel
              </Button>
              <Button variant="outline" size="sm" className="flex gap-2">
                <Download size={16} />
                Export All Data
              </Button>
            </div>
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
                {expenseSummary.map((expense, index) => (
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