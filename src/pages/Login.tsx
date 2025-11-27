
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Navigate } from 'react-router-dom';
import { testApiConnectivity, logEnvironmentInfo } from '@/lib/api-debug';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{ phone?: string; password?: string; otp?: string }>({});
  
  const { isAuthenticated, getGrantToken, requestOTP, verifyOTP } = useAuth();
  const { isDark } = useTheme();
  const { toast } = useToast();

  // Debug API connectivity on component mount
  useEffect(() => {
    logEnvironmentInfo();
    testApiConnectivity();
  }, []);

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const validateForm = () => {
    const newErrors: { phone?: string; password?: string; otp?: string } = {};
    
    if (!phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    
    if (!showOtpInput && !password) {
      newErrors.password = 'Password is required';
    }

    if (showOtpInput && !otp) {
      newErrors.otp = 'OTP is required';
    } else if (showOtpInput && !/^\d{6}$/.test(otp)) {
      newErrors.otp = 'Please enter a valid 6-digit OTP';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGetOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Get grant token
      const accessToken = await getGrantToken(phone, password);
      
      // Step 2: Request OTP
      const otpRequested = await requestOTP(phone, accessToken);
      
      if (otpRequested) {
        setShowOtpInput(true);
        toast({
          title: "OTP Sent",
          description: "Please check your phone for the OTP.",
        });
      }
    } catch (error) {
      let errorMessage = "Failed to send OTP";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await verifyOTP(phone, otp);
      
      if (response.data) {
        toast({
          title: "Login successful",
          description: `Welcome back, ${response.data.firstName}!`,
        });
      }
    } catch (error) {
      let errorMessage = "Failed to verify OTP";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Logo Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 items-center justify-center p-12 relative overflow-hidden">
        {/* Smilebird Logo */}
        <div className="flex items-center justify-center">
          <img 
            src="/root-logo.png"
            alt="Smilebird Dashboard Logo" 
            className="w-full h-auto max-w-4xl object-contain"
          />
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-gray-900">
        <div className="w-full max-w-md space-y-8">
          <div>
            <div className="text-center mb-6">
              <img 
                src="/root-logo.png" 
                alt="Smilebird Logo" 
                className="h-40 w-auto mx-auto mb-4"
              />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {showOtpInput ? 'Enter OTP' : 'Welcome Back'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {showOtpInput 
                ? 'Please enter the OTP sent to your phone'
                : 'Enter your phone number and password to access your account'}
            </p>
          </div>

          <form onSubmit={showOtpInput ? handleVerifyOTP : handleGetOTP} className="space-y-6">
            {/* Phone Field */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300 font-medium">
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`w-full h-12 px-4 rounded-lg border-2 ${errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800`}
                placeholder="Enter your 10-digit phone number"
                disabled={showOtpInput}
                maxLength={10}
              />
              {errors.phone && (
                <p className="text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            {!showOtpInput ? (
              /* Password Field */
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 dark:text-gray-300 font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full h-12 px-4 rounded-lg border-2 ${errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800`}
                  placeholder="Enter your password"
                />
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password}</p>
                )}
              </div>
            ) : (
              /* OTP Field */
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-gray-700 dark:text-gray-300 font-medium">
                  OTP
                </Label>
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className={`w-full h-12 px-4 rounded-lg border-2 ${errors.otp ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800`}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                />
                {errors.otp && (
                  <p className="text-sm text-red-600">{errors.otp}</p>
                )}
              </div>
            )}

            {!showOtpInput && (
              /* Remember Me and Forgot Password */
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label htmlFor="remember" className="text-sm text-gray-600 dark:text-gray-400">
                    Remember me
                  </Label>
                </div>
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Forgot your password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-base"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>{showOtpInput ? 'Verifying OTP...' : 'Sending OTP...'}</span>
                </div>
              ) : (
                showOtpInput ? 'Verify OTP' : 'Sign In'
              )}
            </Button>

            {showOtpInput && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowOtpInput(false)}
                  className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Back to Login
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
