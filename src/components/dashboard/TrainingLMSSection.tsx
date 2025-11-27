
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { GraduationCap, Clock, AlertTriangle, MapPin } from 'lucide-react';

const trainingMetrics = [
  { title: 'Training Completion Rate', value: '87.2%', change: '+5.3%', icon: GraduationCap, color: 'text-blue-600' },
  { title: 'Avg Training Hours / Staff', value: '24.5 hrs', change: '+2.1 hrs', icon: Clock, color: 'text-blue-600' },
  { title: 'Overdue Trainings', value: '12', change: '-3', icon: AlertTriangle, color: 'text-blue-500' },
  { title: 'Lowest Completion Zone', value: 'Zone C', change: '78.3%', icon: MapPin, color: 'text-blue-700' },
];

const trainingHoursData = [
  { name: 'Dr. Wilson', hours: 32 },
  { name: 'Dr. Chen', hours: 28 },
  { name: 'L. Rodriguez', hours: 24 },
  { name: 'Dr. Davis', hours: 30 },
  { name: 'J. Thompson', hours: 18 },
  { name: 'Dr. Martinez', hours: 26 },
];

const clinicSOPProgress = [
  { clinic: 'Smilebird Downtown', completion: 95 },
  { clinic: 'Smilebird Mall', completion: 88 },
  { clinic: 'Smilebird West', completion: 92 },
  { clinic: 'Smilebird East', completion: 78 },
  { clinic: 'Smilebird North', completion: 85 },
];

export const TrainingLMSSection = () => {
  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {trainingMetrics.map((metric) => (
          <Card key={metric.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  <p className={`text-sm ${metric.change.startsWith('+') ? 'text-green-600' : metric.change.startsWith('-') ? 'text-red-600' : 'text-gray-600'}`}>
                    {metric.change}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Training Hours Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Training Hours per Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                hours: {
                  label: "Training Hours",
                  color: "#3B82F6",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trainingHoursData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="hours" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* SOP Module Completion */}
        <Card>
          <CardHeader>
            <CardTitle>SOP Module Completion by Clinic</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {clinicSOPProgress.map((clinic, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">{clinic.clinic}</span>
                  <span className="text-sm text-gray-600">{clinic.completion}%</span>
                </div>
                <Progress value={clinic.completion} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
