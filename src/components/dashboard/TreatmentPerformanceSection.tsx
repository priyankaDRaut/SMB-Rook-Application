
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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const TreatmentPerformanceSection = () => {
  const [zoneFilter, setZoneFilter] = useState('All Zones');
  const [clinicFilter, setClinicFilter] = useState('All Clinics');

  const treatmentRevenueData = [
    { treatment: 'Consultation', revenue: 142 },
    { treatment: 'Checkup', revenue: 98 },
  ];

  const treatmentDetailData = [
    {
      treatment: 'Surgery',
      avgRevenue: 18000,
      count: 89,
      zone: 'West',
      clinic: 'Bandra',
      growth: '+8%'
    },
    {
      treatment: 'Consultation',
      avgRevenue: 35000,
      count: 67,
      zone: 'South',
      clinic: 'Koramangala',
      growth: '+15%'
    },
    {
      treatment: 'Diagnostics',
      avgRevenue: 8500,
      count: 134,
      zone: 'West',
      clinic: 'Pune Central',
      growth: '+5%'
    },
    {
      treatment: 'Checkup',
      avgRevenue: 1200,
      count: 289,
      zone: 'All',
      clinic: 'Multiple',
      growth: '+3%'
    },
    {
      treatment: 'Medication',
      avgRevenue: 3500,
      count: 78,
      zone: 'South',
      clinic: 'Whitefield',
      growth: '+18%'
    },
    {
      treatment: 'Emergency Care',
      avgRevenue: 800,
      count: 198,
      zone: 'All',
      clinic: 'Multiple',
      growth: '-2%'
    },
    {
      treatment: 'Preventive Care',
      avgRevenue: 650,
      count: 324,
      zone: 'All',
      clinic: 'Multiple',
      growth: '+1%'
    },
    {
      treatment: 'Surgery',
      avgRevenue: 15000,
      count: 50,
      zone: 'All',
      clinic: 'Multiple',
      growth: '+10%'
    }
  ];

  const zonePerformanceData = [
    { zone: 'West', revenue: 485, treatments: 1240 },
    { zone: 'South', revenue: 342, treatments: 890 },
    { zone: 'North', revenue: 256, treatments: 650 },
    { zone: 'East', revenue: 189, treatments: 480 }
  ];

  const filteredTreatmentData = treatmentDetailData.filter(treatment => {
    const matchesZone = zoneFilter === 'All Zones' || treatment.zone === zoneFilter || treatment.zone === 'All';
    const matchesClinic = clinicFilter === 'All Clinics' || treatment.clinic === clinicFilter || treatment.clinic === 'Multiple';
    
    return matchesZone && matchesClinic;
  });

  const getGrowthColor = (growth: string) => {
    if (growth.startsWith('+')) return 'text-blue-600';
    if (growth.startsWith('-')) return 'text-blue-500';
    return 'text-blue-700';
  };

  return (
    <section>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Treatment-wise Performance</h2>
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue by Treatment Chart */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Revenue per Treatment Type (₹L)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={treatmentRevenueData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="treatment" type="category" width={100} />
                <Tooltip formatter={(value) => [`₹${value}L`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Zone Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Zone Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {zonePerformanceData.map((zone, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold">{zone.zone} Zone</h4>
                    <span className="text-lg font-bold text-blue-600">₹{zone.revenue}L</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>Total Treatments: {zone.treatments}</div>
                    <div>Avg per Treatment: ₹{Math.round((zone.revenue * 100000) / zone.treatments)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Treatment Detail Table */}
        <Card className="xl:col-span-3">
          <CardHeader>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
              <CardTitle>Treatment Performance Details</CardTitle>
              
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

                <Select value={clinicFilter} onValueChange={setClinicFilter}>
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Clinics">All Clinics</SelectItem>
                    <SelectItem value="Andheri">Andheri</SelectItem>
                    <SelectItem value="Bandra">Bandra</SelectItem>
                    <SelectItem value="Koramangala">Koramangala</SelectItem>
                    <SelectItem value="Whitefield">Whitefield</SelectItem>
                    <SelectItem value="Pune Central">Pune Central</SelectItem>
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
                    <TableHead>Treatment Name</TableHead>
                    <TableHead>Avg Revenue (₹)</TableHead>
                    <TableHead>Count</TableHead>
                    <TableHead>Total Revenue (₹L)</TableHead>
                    <TableHead>Zone</TableHead>
                    <TableHead>Top Clinic</TableHead>
                    <TableHead>Growth</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTreatmentData.map((treatment, index) => (
                    <TableRow key={index} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{treatment.treatment}</TableCell>
                      <TableCell className="font-semibold">₹{treatment.avgRevenue.toLocaleString()}</TableCell>
                      <TableCell>{treatment.count}</TableCell>
                      <TableCell className="font-semibold text-blue-600">
                        ₹{((treatment.avgRevenue * treatment.count) / 100000).toFixed(2)}L
                      </TableCell>
                      <TableCell>{treatment.zone}</TableCell>
                      <TableCell>{treatment.clinic}</TableCell>
                      <TableCell>
                        <span className={`font-semibold ${getGrowthColor(treatment.growth)}`}>
                          {treatment.growth}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
