
import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'super-admin' | 'smilebird-admin' | 'clinic-admin';

interface RoleContextType {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  clinicId?: string;
  setClinicId: (id: string) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const useRole = () => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};

export const RoleProvider = ({ children }: { children: React.ReactNode }) => {
  // Set default role to super-admin for development
  const [userRole, setUserRole] = useState<UserRole>('super-admin');
  const [clinicId, setClinicId] = useState<string>('');

  // Load role from localStorage on mount
  useEffect(() => {
    const savedRole = localStorage.getItem('userRole') as UserRole;
    const savedClinicId = localStorage.getItem('clinicId');
    
    // For development, always ensure there's a role
    if (savedRole) {
      setUserRole(savedRole);
    } else {
      // Set default role in localStorage
      localStorage.setItem('userRole', 'super-admin');
    }
    
    if (savedClinicId) {
      setClinicId(savedClinicId);
    }
  }, []);

  // Save role to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('userRole', userRole);
  }, [userRole]);

  useEffect(() => {
    if (clinicId) {
      localStorage.setItem('clinicId', clinicId);
    }
  }, [clinicId]);

  return (
    <RoleContext.Provider value={{ userRole, setUserRole, clinicId, setClinicId }}>
      {children}
    </RoleContext.Provider>
  );
};
