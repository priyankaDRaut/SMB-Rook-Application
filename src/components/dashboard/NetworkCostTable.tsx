import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { CalendarIcon, Download, FileText } from 'lucide-react';

interface CostData {
  category: string;
  subCategory: string;
  description: string;
  cost: number;
  percentageOfTotal: number;
  trend: {
    percentage: number;
    note?: string;
  };
}

interface NetworkCostTableProps {
  selectedMonth: Date;
  onMonthChange: (date: Date) => void;
}

export const NetworkCostTable = ({ selectedMonth, onMonthChange }: NetworkCostTableProps) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [tempSelectedMonth, setTempSelectedMonth] = useState(selectedMonth);

  // Sample data - replace with actual data from your backend
  const costData: CostData[] = [
    {
      category: 'Staff',
      subCategory: 'Doctors',
      description: 'Salaries and benefits for medical practitioners',
      cost: 5.2,
      percentageOfTotal: 28.7,
      trend: { percentage: 12, note: 'New specialist joined' }
    },
    {
      category: 'Staff',
      subCategory: 'Admin Staff',
      description: 'Front desk and administrative personnel',
      cost: 2.8,
      percentageOfTotal: 15.5,
      trend: { percentage: -3 }
    },
    {
      category: 'Utilities',
      subCategory: 'Electricity',
      description: 'Power consumption for equipment and facilities',
      cost: 1.5,
      percentageOfTotal: 8.3,
      trend: { percentage: 5, note: 'Summer AC usage' }
    },
    {
      category: 'Utilities',
      subCategory: 'Water & Waste',
      description: 'Water supply and medical waste disposal',
      cost: 0.8,
      percentageOfTotal: 4.4,
      trend: { percentage: 0 }
    },
    {
      category: 'Equipment',
      subCategory: 'Maintenance',
      description: 'Regular equipment servicing and repairs',
      cost: 2.1,
      percentageOfTotal: 11.6,
      trend: { percentage: 15, note: 'Annual maintenance' }
    },
    {
      category: 'Equipment',
      subCategory: 'New Purchases',
      description: 'New medical equipment and diagnostic tools',
      cost: 3.2,
      percentageOfTotal: 17.7,
      trend: { percentage: 200, note: 'Digital X-ray upgrade' }
    },
    {
      category: 'Marketing',
      subCategory: 'Digital Ads',
      description: 'Social media and Google Ads campaigns',
      cost: 1.8,
      percentageOfTotal: 9.9,
      trend: { percentage: -8, note: 'Optimized ad spend' }
    },
    {
      category: 'Other',
      subCategory: 'Insurance',
      description: 'Professional liability and property insurance',
      cost: 0.7,
      percentageOfTotal: 3.9,
      trend: { percentage: 2 }
    }
  ];

  const [sortConfig, setSortConfig] = useState<{
    key: keyof CostData;
    direction: 'asc' | 'desc';
  } | null>(null);

  const totalCost = costData.reduce((sum, item) => sum + item.cost, 0);

  const handleSort = (key: keyof CostData) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedData = [...costData].sort((a, b) => {
    if (!sortConfig) return 0;

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortConfig.direction === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return 0;
  });

  const formatTrend = (percentage: number) => {
    if (percentage === 0) return '0%';
    return `${percentage > 0 ? '+' : ''}${percentage}%`;
  };

  const exportToCSV = () => {
    const headers = ['Category', 'Sub-Category', 'Description', 'Cost (₹L)', '% of Total', 'Trend'];
    const rows = costData.map(item => [
      item.category,
      item.subCategory,
      item.description,
      item.cost.toFixed(1),
      item.percentageOfTotal.toFixed(1),
      formatTrend(item.trend.percentage)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `network-costs-${format(selectedMonth, 'MMM-yyyy')}.csv`;
    link.click();
  };

  const handleApplyDate = () => {
    onMonthChange(tempSelectedMonth);
    setIsDatePickerOpen(false);
  };

  // Reset temp selection when popover opens
  React.useEffect(() => {
    if (isDatePickerOpen) {
      setTempSelectedMonth(selectedMonth);
    }
  }, [isDatePickerOpen, selectedMonth]);

  return (
    <Card className="rounded-lg shadow-sm bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Network Cost Analysis
          </CardTitle>
          <div className="flex items-center space-x-3">
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-9 px-4 py-2"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedMonth, 'MMMM yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <div className="p-3">
                  <Calendar
                    mode="single"
                    selected={tempSelectedMonth}
                    onSelect={(date) => date && setTempSelectedMonth(date)}
                    initialFocus
                  />
                  <div className="flex justify-end pt-3 border-t">
                    <Button onClick={handleApplyDate} size="sm">
                      Apply
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-9 px-4 py-2">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={exportToCSV}>
                  <FileText className="mr-2 h-4 w-4" />
                  Export as CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200 dark:border-gray-700">
                <TableHead className="w-[120px] font-semibold">Category</TableHead>
                <TableHead className="w-[140px] font-semibold">Sub-Category</TableHead>
                <TableHead className="min-w-[200px] font-semibold">Description</TableHead>
                <TableHead className="text-right font-semibold">Cost (₹L)</TableHead>
                <TableHead className="text-right w-[100px] font-semibold">% of Total</TableHead>
                <TableHead className="text-right min-w-[120px] font-semibold">Trend vs Last Month</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((item, index) => (
                <TableRow key={index} className="border-b border-gray-100 dark:border-gray-800">
                  <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                    {item.category}
                  </TableCell>
                  <TableCell>{item.subCategory}</TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-400">
                    {item.description}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ₹{(item.cost / 100000).toFixed(2)}L
                  </TableCell>
                  <TableCell className="text-right">
                    {item.percentageOfTotal.toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-right">
                    {formatTrend(item.trend.percentage)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                <TableCell colSpan={3} className="font-semibold text-gray-900 dark:text-gray-100">
                  Total Network Cost
                </TableCell>
                <TableCell className="text-right font-semibold text-gray-900 dark:text-gray-100">
                  ₹{(totalCost / 100000).toFixed(2)}L
                </TableCell>
                <TableCell className="text-right font-semibold text-gray-900 dark:text-gray-100">
                  100%
                </TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}; 