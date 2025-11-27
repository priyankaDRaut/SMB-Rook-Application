
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const DoctorStaffMetricsSection = () => {
  const doctorUtilizationData = [
    { doctor: 'Dr. Sharma', utilization: 92 },
    { doctor: 'Dr. Patel', utilization: 87 },
    { doctor: 'Dr. Gupta', utilization: 78 },
    { doctor: 'Dr. Reddy', utilization: 65 },
    { doctor: 'Dr. Kumar', utilization: 89 }
  ];

  const leaderboardData = [
    { rank: 1, name: 'Dr. Sharma', clinic: 'Andheri', revenue: '₹12.8L', patients: 487 },
    { rank: 2, name: 'Dr. Kumar', clinic: 'Whitefield', revenue: '₹11.2L', patients: 432 },
    { rank: 3, name: 'Dr. Patel', clinic: 'Bandra', revenue: '₹10.9L', patients: 398 }
  ];

  const getBadgeColor = (utilization: number) => {
    if (utilization >= 85) return 'bg-blue-100 text-blue-800';
    if (utilization >= 70) return 'bg-blue-200 text-blue-900';
    return 'bg-blue-300 text-blue-950';
  };

  return (
    <section>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Doctor & Staff Metrics</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Doctor Utilization */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Doctor Utilization Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={doctorUtilizationData} layout="horizontal" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="doctor" type="category" />
                <Tooltip formatter={(value) => [`${value}%`, 'Utilization']} />
                <Bar dataKey="utilization" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Staff Metrics */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Staff Retention</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">94.2%</div>
              <p className="text-sm text-gray-500">Last 12 months</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Training Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">156</div>
              <p className="text-sm text-gray-500">Avg per staff/month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">SOP Adherence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">91%</div>
              <p className="text-sm text-gray-500">Audit score</p>
            </CardContent>
          </Card>
        </div>

        {/* Doctor Leaderboard */}
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Doctor Performance Leaderboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leaderboardData.map((doctor) => (
                <div key={doctor.rank} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                      {doctor.rank}
                    </div>
                    <div>
                      <h4 className="font-semibold">{doctor.name.startsWith('Dr.') ? doctor.name : `Dr. ${doctor.name}`}</h4>
                      <p className="text-sm text-gray-500">{doctor.clinic}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className="font-semibold">{doctor.revenue}</div>
                      <div className="text-sm text-gray-500">Revenue</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{doctor.patients}</div>
                      <div className="text-sm text-gray-500">Patients</div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">
                      Top Performer
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
