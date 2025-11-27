
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { CheckCircle, Clock, XCircle, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

const sopCategories = [
  { name: 'Cleanliness SOP', description: 'Sanitization and hygiene protocols' },
  { name: 'Patient Handling SOP', description: 'Patient care and communication standards' },
  { name: 'Billing SOP', description: 'Payment processing and documentation' },
  { name: 'Appointment SOP', description: 'Scheduling and confirmation procedures' },
];

const clinicSOPData = [
  {
    clinic: 'Smilebird Downtown',
    cleanliness: { status: 'Complete', score: 95 },
    patientHandling: { status: 'Complete', score: 92 },
    billing: { status: 'Pending', score: 78 },
    appointment: { status: 'Complete', score: 88 },
  },
  {
    clinic: 'Smilebird Mall',
    cleanliness: { status: 'Complete', score: 88 },
    patientHandling: { status: 'Complete', score: 85 },
    billing: { status: 'Complete', score: 90 },
    appointment: { status: 'Pending', score: 75 },
  },
  {
    clinic: 'Smilebird West',
    cleanliness: { status: 'Not Started', score: 45 },
    patientHandling: { status: 'Pending', score: 68 },
    billing: { status: 'Complete', score: 92 },
    appointment: { status: 'Complete', score: 85 },
  },
];

const zoneComparisonData = [
  { subject: 'Cleanliness', 'Zone A': 92, 'Zone B': 85, 'Zone C': 78 },
  { subject: 'Patient Handling', 'Zone A': 88, 'Zone B': 82, 'Zone C': 75 },
  { subject: 'Billing', 'Zone A': 95, 'Zone B': 88, 'Zone C': 80 },
  { subject: 'Appointments', 'Zone A': 90, 'Zone B': 85, 'Zone C': 72 },
];

export const SOPTrackerSection = () => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Complete': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'Pending': return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'Not Started': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Complete': return 'border-green-200 bg-green-50';
      case 'Pending': return 'border-yellow-200 bg-yellow-50';
      case 'Not Started': return 'border-red-200 bg-red-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* SOP Categories Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {sopCategories.map((category) => (
          <Card key={category.name}>
            <CardContent className="p-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">{category.name}</h3>
                <p className="text-sm text-gray-600">{category.description}</p>
                <Button variant="outline" size="sm" className="w-full mt-4">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Documents
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Clinic SOP Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Clinic SOP Adherence Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {clinicSOPData.map((clinic) => (
              <div key={clinic.clinic} className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">{clinic.clinic}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className={`p-4 rounded-lg border-2 ${getStatusColor(clinic.cleanliness.status)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Cleanliness</span>
                      {getStatusIcon(clinic.cleanliness.status)}
                    </div>
                    <div className="text-sm text-gray-600">Score: {clinic.cleanliness.score}%</div>
                  </div>
                  <div className={`p-4 rounded-lg border-2 ${getStatusColor(clinic.patientHandling.status)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Patient Handling</span>
                      {getStatusIcon(clinic.patientHandling.status)}
                    </div>
                    <div className="text-sm text-gray-600">Score: {clinic.patientHandling.score}%</div>
                  </div>
                  <div className={`p-4 rounded-lg border-2 ${getStatusColor(clinic.billing.status)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Billing</span>
                      {getStatusIcon(clinic.billing.status)}
                    </div>
                    <div className="text-sm text-gray-600">Score: {clinic.billing.score}%</div>
                  </div>
                  <div className={`p-4 rounded-lg border-2 ${getStatusColor(clinic.appointment.status)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Appointments</span>
                      {getStatusIcon(clinic.appointment.status)}
                    </div>
                    <div className="text-sm text-gray-600">Score: {clinic.appointment.score}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Zone Comparison Radar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>SOP Adherence Comparison Across Zones</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              zoneA: {
                label: "Zone A",
                color: "#1E40AF",
              },
              zoneB: {
                label: "Zone B",
                color: "#3B82F6",
              },
              zoneC: {
                label: "Zone C",
                color: "#60A5FA",
              },
            }}
            className="h-[400px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={zoneComparisonData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="Zone A" dataKey="Zone A" stroke="#1E40AF" fill="#1E40AF" fillOpacity={0.1} />
                <Radar name="Zone B" dataKey="Zone B" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.1} />
                <Radar name="Zone C" dataKey="Zone C" stroke="#60A5FA" fill="#60A5FA" fillOpacity={0.1} />
                <ChartTooltip content={<ChartTooltipContent />} />
              </RadarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};
