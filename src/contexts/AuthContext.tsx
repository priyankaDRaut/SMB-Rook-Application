import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

interface UserData {
  id: string;
  firstName: string;
  emailAddress: string;
  mobileNumber: string;
  userState: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  userData: UserData | null;
  accessToken: string | null;
  getGrantToken: (phone: string, password: string) => Promise<string>;
  requestOTP: (phone: string, accessToken: string) => Promise<boolean>;
  verifyOTP: (phone: string, otp: string) => Promise<any>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('user_data');
    return !!(token && user);
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserData | null>(() => {
    const user = localStorage.getItem('user_data');
    return user ? JSON.parse(user) : null;
  });
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    return localStorage.getItem('auth_token');
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const getGrantToken = async (phone: string, password: string): Promise<string> => {
    try {
      console.log('Requesting grant token for phone:', phone);
      
      // Try different OAuth endpoint patterns
      const oauthUrls = [
        'https://adminapiprod.healthcoco.com/healthco2admin/oauth/token',
        'https://adminapiprod.healthcoco.com/oauth/token',
        'https://adminapiprod.healthcoco.com/healthco2admin/api/v1/oauth/token',
        'https://adminapiprod.healthcoco.com/api/oauth/token'
      ];
      
      let lastError = null;
      
      for (const oauthUrl of oauthUrls) {
        try {
          console.log(`Trying OAuth URL: ${oauthUrl}`);
          
          const response = await fetch(
            oauthUrl,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                'User-Agent': 'smilebird-dashboard/1.0',
                'Origin': window.location.origin
              },
              body: new URLSearchParams({
                grant_type: 'password',
                client_id: 'healthco2admin@16',
                client_secret: 'S5HA45KM5M3QX0KKG1',
                username: phone,
                password: password
              }).toString()
            }
          );
          
          console.log(`Response status for ${oauthUrl}:`, response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log('Grant token response:', data);
            
            if (data.access_token) {
              setAccessToken(data.access_token);
              localStorage.setItem('auth_token', data.access_token);
              return data.access_token;
            } else {
              throw new Error('No access token received');
            }
          } else {
            const errorData = await response.json().catch(() => null);
            console.error(`Grant token error for ${oauthUrl}:`, errorData);
            console.error(`Response headers:`, Object.fromEntries(response.headers.entries()));
            console.error(`Response status:`, response.status, response.statusText);
            lastError = errorData?.message || errorData?.error_description || `HTTP ${response.status}: ${response.statusText}`;
            
            // If it's a 404, try the next URL
            if (response.status === 404) {
              continue;
            }
            
            // For other errors, show the error and stop trying
            toast({
              title: "Login Failed",
              description: errorData?.message || `Server error: ${response.status}`,
              variant: "destructive",
            });
            throw new Error(errorData?.message || `Server error: ${response.status}`);
          }
        } catch (error) {
          console.error(`Error trying ${oauthUrl}:`, error);
          lastError = error instanceof Error ? error.message : 'Unknown error';
          
          // If it's a network error, try the next URL
          if (error instanceof TypeError) {
            continue;
          }
          
          // For other errors, stop trying
          throw error;
        }
      }
      
      // If we get here, all URLs failed
      toast({
        title: "Login Failed",
        description: `All OAuth endpoints failed. Last error: ${lastError}`,
        variant: "destructive",
      });
      throw new Error(`All OAuth endpoints failed. Last error: ${lastError}`);
      
    } catch (error) {
      console.error('Failed to get grant token:', error);
      throw error;
    }
  };

  const requestOTP = async (phone: string, accessToken: string): Promise<boolean> => {
    try {
      console.log('Requesting OTP for phone:', phone, 'with token:', accessToken);
      
      // Use direct API URL for OTP request (no proxy needed)
      const otpUrl = `https://adminapiprod.healthcoco.com/healthco2admin/api/v1/login/admin/${phone}?access_token=${accessToken}`;
      
      const response = await fetch(
        otpUrl,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('OTP request response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('OTP request error:', errorData);
        toast({
          title: "OTP Request Failed",
          description: errorData?.message || "Failed to send OTP. Please try again.",
          variant: "destructive",
        });
        throw new Error(errorData?.message || 'Failed to send OTP');
      }

      const data = await response.json();
      console.log('OTP request response:', data);
      
      toast({
        title: "OTP Sent",
        description: "Please check your phone for the OTP code.",
      });
      
      return data.data || data.success || true;
    } catch (error) {
      console.error('Failed to request OTP:', error);
      throw error;
    }
  };

  const verifyOTP = async (phone: string, otp: string) => {
    try {
      console.log('Verifying OTP for phone:', phone, 'OTP:', otp, 'with token:', accessToken);
      
      if (!accessToken) {
        throw new Error('No access token available');
      }

      // Use direct API URL for OTP verification (no proxy needed)
      const baseOtpUrl = `https://adminapiprod.healthcoco.com/healthco2admin/api/v1/otp/admin/${phone}/${otp}/verify`;
      
      // Try both methods - first with query parameter
      let response = await fetch(
        `${baseOtpUrl}?access_token=${accessToken}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('OTP verify response status:', response.status);

      // If first method fails with 401, try with Authorization header
      if (!response.ok && response.status === 401) {
        console.log('Trying with Authorization header...');
        response = await fetch(
          baseOtpUrl,
          {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );
      }

      // If still failing, try with both query param and header
      if (!response.ok && response.status === 401) {
        console.log('Trying with both query param and Authorization header...');
        response = await fetch(
          `${baseOtpUrl}?access_token=${accessToken}`,
          {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('OTP verify error:', errorData);
        toast({
          title: "OTP Verification Failed",
          description: errorData?.message || "Invalid OTP. Please try again.",
          variant: "destructive",
        });
        throw new Error(errorData?.message || `OTP verification failed (${response.status})`);
      }

      const data = await response.json();
      console.log('OTP verify response:', data);
      
      if (data.data) {
        setUserData(data.data);
        setIsAuthenticated(true);
        localStorage.setItem('user_data', JSON.stringify(data.data));
        toast({
          title: "Welcome Back!",
          description: `Successfully logged in as ${data.data.firstName}`,
        });
        navigate('/dashboard');
      } else if (data.success) {
        // Handle different response formats
        setIsAuthenticated(true);
        toast({
          title: "Welcome Back!",
          description: "Successfully logged in",
        });
        navigate('/dashboard');
      }

      return data;
    } catch (error) {
      console.error('Failed to verify OTP:', error);
      throw error;
    }
  };

  const logout = () => {
    // Clear all auth-related state
    setIsAuthenticated(false);
    setUserData(null);
    setAccessToken(null);
    
    // Clear any auth-related items from localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    
    // Redirect to home page
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      userData,
      accessToken,
      getGrantToken,
      requestOTP,
      verifyOTP,
      logout, 
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};