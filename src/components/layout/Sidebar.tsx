import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRole } from '@/contexts/RoleContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Building2,
  Users,
  UserCheck,
  GraduationCap,
  FileText,
  Package,
  Megaphone,
  Settings,
  TrendingUp,
  Calendar,
  User,
  LogOut,
  Menu,
  DollarSign,
  Building
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  allowedRoles: string[];
}

interface SidebarProps {
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
}

const sidebarItems: SidebarItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    allowedRoles: ['super-admin']
  },
  {
    name: 'Clinics',
    href: '/clinics',
    icon: Building,
    allowedRoles: ['super-admin', 'smilebird-admin', 'clinic-admin']
  },
  // {
  //   name: 'Financial',
  //   href: '/financial',
  //   icon: DollarSign,
  //   allowedRoles: ['super-admin', 'smilebird-admin']
  // },
  // Temporarily hidden pages - uncomment when needed
  // {
  //   name: 'Staff',
  //   href: '/staff',
  //   icon: Users,
  //   allowedRoles: ['super-admin']
  // },
  // {
  //   name: 'Staff Management',
  //   href: '/staff-management',
  //   icon: UserCheck,
  //   allowedRoles: ['super-admin']
  // },
  // {
  //   name: 'Training LMS',
  //   href: '/training-lms',
  //   icon: GraduationCap,
  //   allowedRoles: ['super-admin']
  // },
  // {
  //   name: 'SOP Tracker',
  //   href: '/sop-tracker',
  //   icon: FileText,
  //   allowedRoles: ['super-admin']
  // },
  // {
  //   name: 'Inventory Matrix',
  //   href: '/inventory-matrix',
  //   icon: Package,
  //   allowedRoles: ['super-admin']
  // },
  // {
  //   name: 'Marketing',
  //   href: '/marketing',
  //   icon: Megaphone,
  //   allowedRoles: ['super-admin']
  // },
  // {
  //   name: 'Operations',
  //   href: '/operations',
  //   icon: Settings,
  //   allowedRoles: ['super-admin']
  // },
  // {
  //   name: 'Growth',
  //   href: '/growth',
  //   icon: TrendingUp,
  //   allowedRoles: ['super-admin']
  // },
  // {
  //   name: 'Calendar',
  //   href: '/calendar',
  //   icon: Calendar,
  //   allowedRoles: ['super-admin']
  // }
];

export const Sidebar = ({ isExpanded, setIsExpanded }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userRole } = useRole();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(`${href}/`);
  };

  const filteredItems = sidebarItems.filter(item => 
    item.allowedRoles.includes(userRole)
  );

  return (
    <div 
      className={cn(
        "h-full bg-background border-r-2 flex flex-col shadow-2xl transition-all duration-300",
        isExpanded ? "w-56" : "w-16"
      )} 
      style={{ borderColor: '#e5e5e5' }}
    >
      {/* Logo/Brand */}
      <div className="h-16 flex items-center justify-center border-b border-border px-2">
        <div className={cn("flex items-center justify-center", isExpanded ? "w-14 h-14" : "w-14 h-14")}>
          <img 
            src="/root-logo.png" 
            alt="Smilebird Logo" 
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Menu Toggle Button */}
      <div className="py-2 px-2 border-b border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full h-12 flex items-center justify-start px-3 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 transition-colors duration-200"
          title={isExpanded ? "Collapse Menu" : "Expand Menu"}
        >
          <Menu className="h-5 w-5 flex-shrink-0" />
          {isExpanded && <span className="ml-3 text-sm font-medium">Menu</span>}
        </Button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-4 px-2 space-y-2">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.name}
              variant="ghost"
              size="sm"
              onClick={() => navigate(item.href)}
              className={cn(
                "w-full h-12 flex items-center justify-start px-3 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 transition-colors duration-200",
                isActive(item.href) && "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
              )}
              title={item.name}
            >
              {item.name === 'Clinics' ? (
                <img 
                  src="/architecture.png" 
                  alt="Clinics" 
                  className="h-5 w-5 flex-shrink-0 object-contain"
                />
              ) : item.name === 'Financial' ? (
                <img 
                  src="/money.png" 
                  alt="Financial" 
                  className="h-5 w-5 flex-shrink-0 object-contain"
                />
              ) : (
                <Icon className="h-7 w-7 flex-shrink-0" />
              )}
              {isExpanded && <span className="ml-3 text-sm font-medium whitespace-nowrap">{item.name}</span>}
            </Button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-border p-2 space-y-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/profile')}
          className={cn(
            "w-full h-12 flex items-center justify-start px-3 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 transition-colors duration-200",
            isActive('/profile') && "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
          )}
          title="Profile"
        >
          <User className="h-5 w-5 flex-shrink-0" />
          {isExpanded && <span className="ml-3 text-sm font-medium">Profile</span>}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/settings')}
          className={cn(
            "w-full h-12 flex items-center justify-start px-3 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 transition-colors duration-200",
            isActive('/settings') && "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
          )}
          title="Settings"
        >
          <Settings className="h-5 w-5 flex-shrink-0" />
          {isExpanded && <span className="ml-3 text-sm font-medium">Settings</span>}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full h-12 flex items-center justify-start px-3 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 text-destructive transition-colors duration-200"
          title="Logout"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {isExpanded && <span className="ml-3 text-sm font-medium">Logout</span>}
        </Button>
      </div>
    </div>
  );
};

