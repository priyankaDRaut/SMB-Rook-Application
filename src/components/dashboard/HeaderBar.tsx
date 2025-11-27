import React, { useMemo } from 'react';
import { LogOut, Settings, UserCircle, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { useClinic } from '@/contexts/ClinicContext';
import { useKPIContext } from '@/contexts/KPIContext';
import { format } from 'date-fns';

interface HeaderBarProps {
  dateRange: string;
  setDateRange: (range: string) => void;
}

export const HeaderBar = ({ dateRange, setDateRange }: HeaderBarProps) => {
  const { isDark } = useTheme();
  const { userData, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { currentClinic } = useClinic();

  // Get current path
  const path = location.pathname;
  const isClinicPage = path.startsWith('/clinics/') && path.split('/').length > 2;
  const clinicId = isClinicPage ? path.split('/')[2] : null;
  const isDashboardPage = path === '/dashboard';
  const isClinicsPage = path === '/clinics';
  const isFinancialPage = path === '/financial';
  
  // Remove API call from HeaderBar to prevent duplicate requests
  // The actual clinic data is fetched in the ClinicDetails component
  // const { clinicDetailsData } = useClinicDetails({...});

  // Get current page name
  const getCurrentPageName = () => {
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/clinics') return 'Clinics';
    if (isClinicPage && clinicId) {
      // Use clinic name from context if available, otherwise show a generic label
      return currentClinic?.clinicName || 'Clinic Details';
    }
    if (path === '/financial') return 'Financial';
    if (path === '/profile') return 'Profile';
    if (path === '/settings') return 'Settings';
    return 'Dashboard';
  };

  // Get KPI data from context (available on dashboard and clinics pages)
  let kpiContext;
  try {
    kpiContext = useKPIContext();
  } catch {
    // Context not available on pages without KPIProvider
    kpiContext = null;
  }
  
  // Get current month for display - use from KPI context if available, otherwise use current date
  const currentMonth = kpiContext?.filters?.selectedMonth 
    ? format(kpiContext.filters.selectedMonth, 'MMM yyyy')
    : format(new Date(), 'MMM yyyy');
  
  // Format currency for display
  const formatCurrency = (value: number | undefined) => {
    if (!value) return '₹0';
    
    if (value >= 10000000) { // 1 crore or more
      return `₹${(value / 10000000).toFixed(2)}Cr`;
    } else if (value >= 100000) { // 1 lakh or more
      return `₹${(value / 100000).toFixed(2)}L`;
    } else if (value >= 1000) { // 1 thousand or more
      return `₹${(value / 1000).toFixed(2)}K`;
    } else {
      return `₹${value.toFixed(0)}`;
    }
  };
  
  // Use network-level KPI data from context on all pages where KPIProvider is available
  const totalRevenue = formatCurrency(kpiContext?.networkRevenue);
  const networkARRFormatted = formatCurrency(kpiContext?.networkARR);

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
      duration: 3000,
    });
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (userData?.firstName) {
      // For "Gulshan Saluja", extract first letter of each word
      const nameParts = userData.firstName.split(' ');
      if (nameParts.length >= 2) {
        return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
      } else {
        return userData.firstName.charAt(0).toUpperCase();
      }
    }
    return 'U';
  };

  return (
    <header className="bg-background border-b border-border shadow-lg w-full">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left section with page name */}
        <div className="flex items-center">
          <h1 className="text-lg font-medium text-gray-700 dark:text-gray-300">
            {getCurrentPageName()}
          </h1>
        </div>

        {/* Right section with total revenue, toggle, and user profile */}
        <div className="flex items-center space-x-4">
          {/* Total Network Revenue and Network ARR Display */}
          <div className="flex items-center space-x-4">
            {/* Total Network Revenue */}
            <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-2 rounded-lg shadow-sm">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Total Network Revenue ({currentMonth}):
              </span>
              <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                {totalRevenue}
              </span>
            </div>
            
            {/* Network ARR */}
            <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-2 rounded-lg shadow-sm">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Network ARR ({currentMonth}):
              </span>
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                {networkARRFormatted}
              </span>
            </div>
          </div>

          {/* Theme Toggle Button */}
          <ThemeToggle />

          {/* Divider */}
          <div className="h-6 w-px bg-border" />

          {/* User Profile Section */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 h-auto p-2 hover:bg-muted">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-purple-100 text-purple-800 font-medium text-sm">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-normal leading-none text-gray-700 dark:text-gray-300">
                    {userData?.firstName || 'User'}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userData?.firstName || 'User'}</p>
                  <p className="text-xs leading-none text-muted-foreground">{userData?.emailAddress || ''}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleProfileClick}>
                <UserCircle className="mr-2 h-4 w-4" />
                <span>My Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSettingsClick}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-blue-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
