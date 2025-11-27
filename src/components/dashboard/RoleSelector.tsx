
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRole, UserRole } from '@/contexts/RoleContext';

export const RoleSelector = () => {
  const { userRole, setUserRole, clinicId, setClinicId } = useRole();

  const roleOptions = [
    { value: 'super-admin', label: 'Super Admin' },
    { value: 'smilebird-admin', label: 'Smilebird Admin' },
    { value: 'clinic-admin', label: 'Clinic Admin' },
  ];

  const clinicOptions = [
    { value: 'andheri', label: 'Smilebird Andheri' },
    { value: 'bandra', label: 'Smilebird Bandra' },
    { value: 'pune-central', label: 'Smilebird Pune Central' },
    { value: 'koramangala', label: 'Smilebird Koramangala' },
    { value: 'whitefield', label: 'Smilebird Whitefield' },
  ];

  return (
    <div className="flex items-center space-x-3">
      <Select value={userRole} onValueChange={(value: UserRole) => setUserRole(value)}>
        <SelectTrigger className="w-36 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          {roleOptions.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value}
              className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {userRole === 'clinic-admin' && (
        <Select value={clinicId} onValueChange={setClinicId}>
          <SelectTrigger className="w-44 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
            <SelectValue placeholder="Select Clinic" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            {clinicOptions.map((option) => (
              <SelectItem 
                key={option.value} 
                value={option.value}
                className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};
