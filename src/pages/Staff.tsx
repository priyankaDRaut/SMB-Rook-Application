
import React from 'react';
import { DoctorStaffMetricsSection } from '../components/dashboard/DoctorStaffMetricsSection';
import { ConsultDoctorsSection } from '../components/dashboard/ConsultDoctorsSection';
import { TreatmentPerformanceSection } from '../components/dashboard/TreatmentPerformanceSection';

const Staff = () => {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Staff & Doctors</h1>
        <p className="text-gray-600">Monitor doctor performance, consultations, and treatment analytics.</p>
      </div>

      <DoctorStaffMetricsSection />
      <ConsultDoctorsSection />
      <TreatmentPerformanceSection />
    </div>
  );
};

export default Staff;
