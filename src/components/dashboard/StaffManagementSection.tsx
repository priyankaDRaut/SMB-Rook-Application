
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Users, TrendingDown, UserCheck, UserPlus } from 'lucide-react';

const staffMetrics = [
  { title: 'Total Active Staff', value: '284', change: '+12', icon: Users, color: 'text-blue-600' },
  { title: 'Staff Attrition Rate', value: '8.2%', change: '-2.1%', icon: TrendingDown, color: 'text-blue-500' },
  { title: 'Doctor Retention Rate', value: '94.5%', change: '+1.2%', icon: UserCheck, color: 'text-blue-700' },
  { title: 'Onboarded This Month', value: '15', change: '+5', icon: UserPlus, color: 'text-blue-600' },
];

const staffData = [
  { name: 'Dr. Sarah Wilson', role: 'Senior Physician', zone: 'Zone A', attendance: '98%', lastLogin: '2 hours ago', status: 'Active' },
  { name: 'Dr. Michael Chen', role: 'Cardiologist', zone: 'Zone B', attendance: '95%', lastLogin: '1 day ago', status: 'Active' },
  { name: 'Lisa Rodriguez', role: 'Medical Assistant', zone: 'Zone A', attendance: '92%', lastLogin: '3 hours ago', status: 'Active' },
  { name: 'John Thompson', role: 'Receptionist', zone: 'Zone C', attendance: '88%', lastLogin: '1 week ago', status: 'On Leave' },
  { name: 'Dr. Emily Davis', role: 'General Physician', zone: 'Zone B', attendance: '97%', lastLogin: '4 hours ago', status: 'Active' },
];

const attritionData = [
  { name: 'Zone A', value: 12, fill: '#3B82F6' },
  { name: 'Zone B', value: 8, fill: '#60A5FA' },
  { name: 'Zone C', value: 15, fill: '#93C5FD' },
  { name: 'Zone D', value: 6, fill: '#DBEAFE' },
];

export const StaffManagementSection = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-blue-600 bg-blue-100';
      case 'On Leave': return 'text-blue-500 bg-blue-50';
      case 'Resigned': return 'text-blue-700 bg-blue-200';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {staffMetrics.map((metric) => (
          <Card key={metric.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  <p className={`text-sm ${metric.change.startsWith('+') ? 'text-blue-600' : 'text-blue-500'}`}>
                    {metric.change} from last month
                  </p>
                </div>
                <div className={`p-3 rounded-full bg-gray-100 ${metric.color}`}>
                  <metric.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Staff Table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Staff Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Zone</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffData.map((staff, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{staff.name}</TableCell>
                    <TableCell>{staff.role}</TableCell>
                    <TableCell>{staff.zone}</TableCell>
                    <TableCell>{staff.attendance}</TableCell>
                    <TableCell>{staff.lastLogin}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(staff.status)}`}>
                        {staff.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Attrition Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Attrition by Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                attrition: {
                  label: "Attrition Rate",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={attritionData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {attritionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
