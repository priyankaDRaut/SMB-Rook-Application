
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area } from 'recharts';

export const DetailedFinancialSection = () => {
  const [zoneFilter, setZoneFilter] = useState('All Zones');
  const [timeFilter, setTimeFilter] = useState('Current Month');

  // Network aggregated financial data by zone
  const networkFinancialData = [
    {
      zone: 'West Zone',
      clinics: 3,
      revenue: 21.1,
      expenses: {
        rent: 5.2,
        hr: 5.7,
        marketing: 2.2,
        equipment: 1.3,
        utilities: 1.0,
        others: 1.1
      },
      totalExpenses: 16.5,
      ebitda: 4.6,
      ebitdaPercent: 22,
      capex: 4.1,
      profitabilityStatus: 'Profitable'
    },
    {
      zone: 'South Zone',
      clinics: 2,
      revenue: 11.1,
      expenses: {
        rent: 2.7,
        hr: 3.3,
        marketing: 1.1,
        equipment: 0.7,
        utilities: 0.5,
        others: 0.5
      },
      totalExpenses: 8.8,
      ebitda: 2.3,
      ebitdaPercent: 21,
      capex: 2.1,
      profitabilityStatus: 'Profitable'
    }
  ];

  const monthlyEbitdaData = [
    { month: 'Jan', ebitda: 15.2 },
    { month: 'Feb', ebitda: 16.8 },
    { month: 'Mar', ebitda: 14.1 },
    { month: 'Apr', ebitda: 18.9 },
    { month: 'May', ebitda: 17.6 },
    { month: 'Jun', ebitda: 19.4 }
  ];

  const filteredData = networkFinancialData.filter(zone => {
    const matchesZone = zoneFilter === 'All Zones' || zone.zone.includes(zoneFilter);
    return matchesZone;
  });

  const getProfitabilityBadge = (status: string) => {
    const colors = {
      'Profitable': 'bg-blue-100 text-blue-800',
      'Break-even': 'bg-blue-200 text-blue-900',
      'Loss': 'bg-blue-300 text-blue-950'
    };
    
    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {status}
      </Badge>
    );
  };

  const getEbitdaColor = (percent: number) => {
    if (percent >= 25) return 'text-blue-600';
    if (percent >= 15) return 'text-blue-500';
    return 'text-blue-700';
  };

  // Calculate expense breakdown for network (aggregated)
  const networkExpenseBreakdown = {
    rent: filteredData.reduce((sum, zone) => sum + zone.expenses.rent, 0),
    hr: filteredData.reduce((sum, zone) => sum + zone.expenses.hr, 0),
    marketing: filteredData.reduce((sum, zone) => sum + zone.expenses.marketing, 0),
    equipment: filteredData.reduce((sum, zone) => sum + zone.expenses.equipment, 0),
    utilities: filteredData.reduce((sum, zone) => sum + zone.expenses.utilities, 0),
    others: filteredData.reduce((sum, zone) => sum + zone.expenses.others, 0)
  };

  const expenseBreakdownData = [
    { name: 'Rent', value: Number(networkExpenseBreakdown.rent.toFixed(1)), color: '#1E40AF' },
    { name: 'HR/Salaries', value: Number(networkExpenseBreakdown.hr.toFixed(1)), color: '#3B82F6' },
    { name: 'Marketing', value: Number(networkExpenseBreakdown.marketing.toFixed(1)), color: '#60A5FA' },
    { name: 'Equipment', value: Number(networkExpenseBreakdown.equipment.toFixed(1)), color: '#93C5FD' },
    { name: 'Utilities', value: Number(networkExpenseBreakdown.utilities.toFixed(1)), color: '#DBEAFE' },
    { name: 'Others', value: Number(networkExpenseBreakdown.others.toFixed(1)), color: '#EFF6FF' }
  ];

  return (
    <section>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Detailed Financial Analysis</h2>
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Monthly EBITDA Trend */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Network Monthly EBITDA Trend (₹L)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyEbitdaData}>
                <defs>
                  <linearGradient id="colorEbitda" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#eab308" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#eab308" stopOpacity={0.02}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    padding: '8px 12px',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                  labelStyle={{
                    color: '#374151',
                    fontWeight: '600',
                    marginBottom: '4px'
                  }}
                  formatter={(value) => [`₹${value}L`, 'Network EBITDA']} 
                />
                <Area 
                  type="monotone" 
                  dataKey="ebitda" 
                  stroke="#eab308" 
                  strokeWidth={3}
                  fill="url(#colorEbitda)"
                  dot={false}
                  activeDot={{ r: 6, fill: '#eab308' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Network Expense Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Network Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={expenseBreakdownData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  labelLine={false}
                >
                  {expenseBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    padding: '8px 12px',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                  labelStyle={{
                    color: '#374151',
                    fontWeight: '600',
                    marginBottom: '4px'
                  }}
                  formatter={(value) => [`₹${(Number(value) / 100000).toFixed(2)}L`, 'Amount']} 
                />
                <Legend 
                  layout="vertical" 
                  align="right" 
                  verticalAlign="middle"
                  formatter={(value) => <span className="text-sm text-gray-600">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Zone-wise Network Financial Table */}
        <Card className="xl:col-span-3">
          <CardHeader>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
              <CardTitle>Zone-wise Network Performance</CardTitle>
              
              {/* Filters */}
              <div className="flex space-x-2">
                <Select value={zoneFilter} onValueChange={setZoneFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Zones">All Zones</SelectItem>
                    <SelectItem value="West">West</SelectItem>
                    <SelectItem value="South">South</SelectItem>
                    <SelectItem value="North">North</SelectItem>
                    <SelectItem value="East">East</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={timeFilter} onValueChange={setTimeFilter}>
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Current Month">Current Month</SelectItem>
                    <SelectItem value="Last Month">Last Month</SelectItem>
                    <SelectItem value="Last Quarter">Last Quarter</SelectItem>
                    <SelectItem value="YTD">Year to Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Zone</TableHead>
                    <TableHead>Clinics</TableHead>
                    <TableHead>Monthly Revenue (₹L)</TableHead>
                    <TableHead>Total Expenses (₹L)</TableHead>
                    <TableHead>EBITDA (₹L)</TableHead>
                    <TableHead>EBITDA %</TableHead>
                    <TableHead>CapEx (₹L)</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((zone, index) => (
                    <TableRow key={index} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{zone.zone}</TableCell>
                      <TableCell>{zone.clinics}</TableCell>
                      <TableCell className="font-semibold text-blue-600">₹{zone.revenue}L</TableCell>
                      <TableCell className="font-semibold text-red-600">₹{zone.totalExpenses}L</TableCell>
                      <TableCell className="font-semibold">₹{zone.ebitda}L</TableCell>
                      <TableCell>
                        <span className={`font-semibold ${getEbitdaColor(zone.ebitdaPercent)}`}>
                          {zone.ebitdaPercent}%
                        </span>
                      </TableCell>
                      <TableCell>₹{zone.capex}L</TableCell>
                      <TableCell>{getProfitabilityBadge(zone.profitabilityStatus)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary Cards */}
        <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div>
                <p className="text-sm text-gray-600">Total Network Revenue</p>
                <p className="text-2xl font-bold text-blue-600">₹32.2L</p>
                <p className="text-xs text-green-600">+15% vs last month</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div>
                <p className="text-sm text-gray-600">Total Network Expenses</p>
                <p className="text-2xl font-bold text-red-600">₹25.3L</p>
                <p className="text-xs text-red-600">+8% vs last month</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div>
                <p className="text-sm text-gray-600">Network EBITDA</p>
                <p className="text-2xl font-bold text-green-600">₹6.9L</p>
                <p className="text-xs text-green-600">21% margin</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div>
                <p className="text-sm text-gray-600">Total CapEx</p>
                <p className="text-2xl font-bold text-purple-600">₹6.2L</p>
                <p className="text-xs text-gray-600">Equipment & Setup</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
