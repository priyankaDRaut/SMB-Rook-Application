import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Calendar } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DateRange } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useClinic } from '@/contexts/ClinicContext';
import { useClinicDetails } from '@/hooks/use-clinic-details';

const CapexExpenseAnalytics = () => {
  const { clinicName } = useParams<{ clinicName: string }>();
  const navigate = useNavigate();
  const { setCurrentClinic } = useClinic();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2025, 5, 10), // Jun 10, 2025
    to: new Date(2025, 6, 10), // Jul 10, 2025
  });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Fetch clinic details to get the clinic name for navbar
  const memoizedDateRange = useMemo(() => {
    const currentDateForRange = new Date();
    const startOfMonth = new Date(currentDateForRange.getFullYear(), currentDateForRange.getMonth(), 1);
    const endOfMonth = new Date(currentDateForRange.getFullYear(), currentDateForRange.getMonth() + 1, 0);
    
    return {
      startDate: startOfMonth.getTime(),
      endDate: endOfMonth.getTime()
    };
  }, []);

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

  // Sample data for capex expenses
  const capexExpenseData = [
    { category: 'Medical Equipment', amount: 800000, percentage: 40.0 },
    { category: 'IT Infrastructure', amount: 300000, percentage: 15.0 },
    { category: 'Furniture & Fixtures', amount: 250000, percentage: 12.5 },
    { category: 'Building Improvements', amount: 400000, percentage: 20.0 },
    { category: 'Software Licenses', amount: 150000, percentage: 7.5 },
    { category: 'Security Systems', amount: 100000, percentage: 5.0 },
  ];

  const monthlyTrendData = [
    { month: 'Jan', amount: 1200000 },
    { month: 'Feb', amount: 800000 },
    { month: 'Mar', amount: 1500000 },
    { month: 'Apr', amount: 600000 },
    { month: 'May', amount: 2000000 },
    { month: 'Jun', amount: 900000 },
    { month: 'Jul', amount: 1100000 },
    { month: 'Aug', amount: 700000 },
    { month: 'Sep', amount: 1300000 },
    { month: 'Oct', amount: 2000000 },
  ];

  const totalCapexExpenses = capexExpenseData.reduce((sum, item) => sum + item.amount, 0);

  const COLORS = ['#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a', '#172554'];

  const formatCurrency = (amount: number) => {
    return `₹${(amount / 100000).toFixed(2)}L`;
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
              {clinicName} - Capital expenditure investments breakdown
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[280px] justify-start text-left font-normal"
              >
                <Calendar className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
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
              Total Capex Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {formatCurrency(totalCapexExpenses)}
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
              {formatCurrency(1200000)}
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
              +15.2%
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              vs last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="breakdown" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="breakdown">Expense Breakdown</TabsTrigger>
          <TabsTrigger value="trends">Monthly Trends</TabsTrigger>
          <TabsTrigger value="comparison">Category Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="breakdown" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-800 dark:text-blue-200">
                  Capex Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={capexExpenseData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="amount"
                    >
                      {capexExpenseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Expense Table */}
            <Card>
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
                    {capexExpenseData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.category}</TableCell>
                        <TableCell className="text-right font-semibold text-blue-600 dark:text-blue-400">
                          {formatCurrency(item.amount)}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {item.percentage}%
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
                <BarChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Bar dataKey="amount" fill="#3b82f6" name="Capex Expenses" />
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
                <BarChart data={capexExpenseData}>
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
      </Tabs>
    </div>
  );
};

export default CapexExpenseAnalytics;
