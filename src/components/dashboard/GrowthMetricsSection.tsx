
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const GrowthMetricsSection = () => {
  const zoneGrowthData = [
    { zone: 'West', q1: 15, q2: 18, q3: 22, q4: 25 },
    { zone: 'South', q1: 12, q2: 14, q3: 16, q4: 19 },
    { zone: 'North', q1: 8, q2: 10, q3: 13, q4: 15 },
    { zone: 'East', q1: 5, q2: 7, q3: 9, q4: 11 }
  ];

  const pipelineClinics = [
    { name: 'Smilebird Gurgaon', zone: 'North', status: 'Site Finalization', timeline: 'Q2 2024' },
    { name: 'Smilebird Hyderabad', zone: 'South', status: 'Interior Work', timeline: 'Q1 2024' },
    { name: 'Smilebird Kolkata', zone: 'East', status: 'Planning', timeline: 'Q3 2024' },
    { name: 'Smilebird Thane', zone: 'West', status: 'Equipment Installation', timeline: 'Jan 2024' }
  ];

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'Site Finalization': 'bg-blue-100 text-blue-800',
      'Interior Work': 'bg-blue-200 text-blue-900',
      'Planning': 'bg-blue-50 text-blue-700',
      'Equipment Installation': 'bg-blue-300 text-blue-950'
    };
    
    return (
      <Badge className={statusColors[status as keyof typeof statusColors]}>
        {status}
      </Badge>
    );
  };

  return (
    <section>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Growth Metrics</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Clinics Live */}
        <Card>
          <CardHeader>
            <CardTitle>Clinics Currently Live</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">12</div>
              <p className="text-gray-500">Active Locations</p>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-semibold">West Zone</div>
                  <div className="text-blue-600">6 clinics</div>
                </div>
                <div>
                  <div className="font-semibold">South Zone</div>
                  <div className="text-blue-600">4 clinics</div>
                </div>
                <div>
                  <div className="font-semibold">North Zone</div>
                  <div className="text-blue-600">2 clinics</div>
                </div>
                <div>
                  <div className="font-semibold">East Zone</div>
                  <div className="text-blue-600">0 clinics</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Growth by Zone */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Quarterly Revenue Growth by Zone (₹L)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={zoneGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="zone" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="q1" fill="#3b82f6" name="Q1" />
                <Bar dataKey="q2" fill="#60a5fa" name="Q2" />
                <Bar dataKey="q3" fill="#93c5fd" name="Q3" />
                <Bar dataKey="q4" fill="#bfdbfe" name="Q4" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pipeline Clinics */}
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Pipeline Clinics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {pipelineClinics.map((clinic, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <h4 className="font-semibold mb-2">{clinic.name}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Status:</span>
                      {getStatusBadge(clinic.status)}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Timeline:</span>
                      <span className="text-sm font-medium text-blue-600">{clinic.timeline}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Growth Target 2024</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">18</div>
                  <div className="text-sm text-blue-700">Target Clinics</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">6</div>
                  <div className="text-sm text-blue-700">Remaining</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">67%</div>
                  <div className="text-sm text-blue-700">Progress</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
