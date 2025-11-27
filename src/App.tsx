
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AppLayout } from "./components/layout/AppLayout";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { ClinicProvider } from "./contexts/ClinicContext";
import { KPIProvider } from "@/contexts/KPIContext";
import Dashboard from "./pages/Dashboard";
import Clinics from "./pages/Clinics";
import ClinicDetails from "./pages/ClinicDetails";
import Financial from "./pages/Financial";
// Temporarily hidden imports - uncomment when needed
// import Staff from "./pages/Staff";
// import StaffManagement from "./pages/StaffManagement";
// import TrainingLMS from "./pages/TrainingLMS";
// import SOPTracker from "./pages/SOPTracker";
// import InventoryMatrix from "./pages/InventoryMatrix";
// import Marketing from "./pages/Marketing";
// import Operations from "./pages/Operations";
// import Growth from "./pages/Growth";
// import Calendar from "./pages/Calendar";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import { RoleProvider } from "./contexts/RoleContext";
import { ExpenseAnalytics } from "./pages/ExpenseAnalytics";
import { RevenueAnalytics } from "./pages/RevenueAnalytics";
import OperationalExpenseAnalytics from "./pages/OperationalExpenseAnalytics";
import CapexExpenseAnalytics from "./pages/CapexExpenseAnalytics";
import { HomeRedirect } from "./components/auth/HomeRedirect";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <RoleProvider>
            <AuthProvider>
              <ClinicProvider>
                <TooltipProvider>
                <Toaster />
                <Sonner />
                <KPIProvider>
                <Routes>
                {/* Public routes */}
                <Route path="/" element={<HomeRedirect />} />
                <Route path="/login" element={<Login />} />


                {/* Protected routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute allowedRoles={['super-admin']}>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                
                {/* Super Admin and Smilebird Admin routes */}
                <Route path="/financial" element={
                  <ProtectedRoute allowedRoles={['super-admin', 'smilebird-admin']}>
                    <AppLayout><Financial /></AppLayout>
                  </ProtectedRoute>
                } />
                
                {/* All authenticated users can access clinics */}
                <Route path="/clinics" element={
                  <ProtectedRoute>
                    <AppLayout><Clinics /></AppLayout>
                  </ProtectedRoute>
                } />
                <Route path="/clinics/:clinicName" element={
                  <ProtectedRoute>
                    <AppLayout><ClinicDetails /></AppLayout>
                  </ProtectedRoute>
                } />
                <Route path="/clinics/:clinicName/expense" element={
                  <ProtectedRoute>
                    <AppLayout><ExpenseAnalytics /></AppLayout>
                  </ProtectedRoute>
                } />
                <Route path="/clinics/:clinicName/revenue" element={
                  <ProtectedRoute>
                    <AppLayout><RevenueAnalytics /></AppLayout>
                  </ProtectedRoute>
                } />
                <Route path="/clinics/:clinicName/operational" element={
                  <ProtectedRoute>
                    <AppLayout><OperationalExpenseAnalytics /></AppLayout>
                  </ProtectedRoute>
                } />
                <Route path="/clinics/:clinicName/capex" element={
                  <ProtectedRoute>
                    <AppLayout><CapexExpenseAnalytics /></AppLayout>
                  </ProtectedRoute>
                } />
                
                {/* Profile and Settings routes - accessible to all authenticated users */}
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <AppLayout><Profile /></AppLayout>
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <AppLayout><Settings /></AppLayout>
                  </ProtectedRoute>
                } />
                
                {/* Super Admin only routes - Temporarily hidden */}
                {/* <Route path="/staff" element={
                  <ProtectedRoute allowedRoles={['super-admin']}>
                    <AppLayout><Staff /></AppLayout>
                  </ProtectedRoute>
                } /> */}
                {/* <Route path="/staff-management" element={
                  <ProtectedRoute allowedRoles={['super-admin']}>
                    <AppLayout><StaffManagement /></AppLayout>
                  </ProtectedRoute>
                } /> */}
                {/* <Route path="/training-lms" element={
                  <ProtectedRoute allowedRoles={['super-admin']}>
                    <AppLayout><TrainingLMS /></AppLayout>
                  </ProtectedRoute>
                } /> */}
                {/* <Route path="/sop-tracker" element={
                  <ProtectedRoute allowedRoles={['super-admin']}>
                    <AppLayout><SOPTracker /></AppLayout>
                  </ProtectedRoute>
                } /> */}
                {/* <Route path="/inventory-matrix" element={
                  <ProtectedRoute allowedRoles={['super-admin']}>
                    <AppLayout><InventoryMatrix /></AppLayout>
                  </ProtectedRoute>
                } /> */}
                {/* <Route path="/marketing" element={
                  <ProtectedRoute allowedRoles={['super-admin']}>
                    <AppLayout><Marketing /></AppLayout>
                  </ProtectedRoute>
                } /> */}
                {/* <Route path="/operations" element={
                  <ProtectedRoute allowedRoles={['super-admin']}>
                    <AppLayout><Operations /></AppLayout>
                  </ProtectedRoute>
                } /> */}
                {/* <Route path="/growth" element={
                  <ProtectedRoute allowedRoles={['super-admin']}>
                    <AppLayout><Growth /></AppLayout>
                  </ProtectedRoute>
                } /> */}
                {/* <Route path="/calendar" element={
                  <ProtectedRoute allowedRoles={['super-admin']}>
                    <AppLayout><Calendar /></AppLayout>
                  </ProtectedRoute>
                } /> */}
                
                <Route path="*" element={<NotFound />} />
                </Routes>
                </KPIProvider>
                </TooltipProvider>
              </ClinicProvider>
            </AuthProvider>
          </RoleProvider>
        </ThemeProvider>
    </BrowserRouter>
  </QueryClientProvider>
  );
};

export default App;
