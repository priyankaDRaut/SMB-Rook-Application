
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const OperationalMetricsSection = () => {
  const appointmentData = [
    { day: 'Mon', scheduled: 45, attended: 38, noShows: 7 },
    { day: 'Tue', scheduled: 52, attended: 47, noShows: 5 },
    { day: 'Wed', scheduled: 48, attended: 41, noShows: 7 },
    { day: 'Thu', scheduled: 56, attended: 49, noShows: 7 },
    { day: 'Fri', scheduled: 43, attended: 39, noShows: 4 },
    { day: 'Sat', scheduled: 38, attended: 35, noShows: 3 }
  ];

  const waitingTimeData = [
    { clinic: 'Andheri', avgWait: 12 },
    { clinic: 'Bandra', avgWait: 8 },
    { clinic: 'Pune Central', avgWait: 15 },
    { clinic: 'Koramangala', avgWait: 18 },
    { clinic: 'Whitefield', avgWait: 10 }
  ];

  return (
    <section>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Operational Metrics</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Appointments vs No-Shows */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Weekly Appointments vs No-Shows</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={appointmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="attended" fill="#3b82f6" name="Attended" />
                <Bar dataKey="noShows" fill="#ef4444" name="No Shows" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Operational KPIs */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">No-Show Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">12.8%</div>
              <p className="text-sm text-gray-500">This week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Equipment Uptime</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">98.5%</div>
              <p className="text-sm text-gray-500">All clinics</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cleanliness Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">4.8/5</div>
              <p className="text-sm text-gray-500">Audit average</p>
            </CardContent>
          </Card>
        </div>

        {/* Average Waiting Time */}
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Average Waiting Time by Clinic (minutes)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={waitingTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="clinic" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} min`, 'Avg Waiting Time']} />
                <Bar dataKey="avgWait" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
