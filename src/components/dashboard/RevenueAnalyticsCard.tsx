import React, { useState } from 'react';
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
import { Download, Calendar } from 'lucide-react';
import { DateRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

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
  
  // Use the revenue analytics hook to get real data
  const { revenueAnalyticsData, loading, error, isUsingFallbackData } = useRevenueAnalytics({
    clinicId: '677d3679f8ec817ffe72fb95',
    startDate: 1756665000000,
    endDate: 1759170600000
  });
  const [selectedPaymentMode, setSelectedPaymentMode] = useState('All Payment Modes');
  const [selectedTreatmentType, setSelectedTreatmentType] = useState('All Treatment Types');
  const [dateRangeState, setDateRangeState] = useState<DateRange | undefined>({
    from: new Date(2025, 5, 10), // Jun 10, 2025
    to: new Date(2025, 6, 10), // Jul 10, 2025
  });

  // Sample revenue summary data
  const revenueSummary = [
    { treatmentType: 'Surgery', totalRevenue: 95000, percentage: 28.36 },
    { treatmentType: 'Diagnostics', totalRevenue: 45000, percentage: 12.68 },
    { treatmentType: 'General Checkup', totalRevenue: 25000, percentage: 7.05 }
  ];

  // Calculate total revenue
  const totalRevenue = revenueSummary.reduce((sum, item) => sum + item.totalRevenue, 0);

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardContent className="p-6">
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
                  <SelectItem value="Surgery">Surgery</SelectItem>
                  <SelectItem value="Diagnostics">Diagnostics</SelectItem>
                  <SelectItem value="General Checkup">General Checkup</SelectItem>
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
                      <TableHead className="font-semibold">Treatment Type</TableHead>
                      <TableHead className="font-semibold">Total Revenue</TableHead>
                      <TableHead className="font-semibold">Percentage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {revenueSummary.map((revenue, index) => (
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
                      data={revenueSummary}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={200}
                      fill="#8884d8"
                      dataKey="totalRevenue"
                      nameKey="treatmentType"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {revenueSummary.map((entry, index) => (
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
                    data={revenueSummary} 
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