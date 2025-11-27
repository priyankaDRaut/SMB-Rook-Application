// API Debug Utility
export const testApiConnectivity = async () => {
  console.log('🔍 Testing API Connectivity...');
  
  const testUrls = [
    'https://adminapiprod.healthcoco.com/healthco2admin/oauth/token',
    'https://adminapiprod.healthcoco.com/oauth/token',
    'https://adminapiprod.healthcoco.com/healthco2admin/api/v1/oauth/token',
    'https://adminapiprod.healthcoco.com/api/oauth/token',
    'https://adminapiprod.healthcoco.com/healthco2admin/api/v1/login/admin/7020757368'
  ];

  for (const url of testUrls) {
    try {
      console.log(`Testing: ${url}`);
      
      // Test with OPTIONS first to check if endpoint exists
      const optionsResponse = await fetch(url, {
        method: 'OPTIONS',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      console.log(`✅ ${url} - OPTIONS Status: ${optionsResponse.status}`);
      
      // Test with POST for OAuth endpoints
      if (url.includes('oauth/token')) {
        const postResponse = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          },
          body: new URLSearchParams({
            grant_type: 'password',
            client_id: 'healthco2admin@16',
            client_secret: 'S5HA45KM5M3QX0KKG1',
            username: '7020757368',
            password: 'test'
          }).toString()
        });
        console.log(`✅ ${url} - POST Status: ${postResponse.status}`);
        
        if (!postResponse.ok) {
          const errorText = await postResponse.text();
          console.log(`❌ ${url} - Error Response:`, errorText);
        }
      }
    } catch (error) {
      console.error(`❌ ${url} - Error:`, error);
    }
  }
  
  // Test clinic details endpoint specifically
  console.log('🔍 Testing Clinic Details API...');
  const clinicDetailsUrl = 'https://adminapiprod.healthcoco.com/healthco2admin/api/v1/dashboard/clinics/smilebird-andheri?startDate=1756665000000&endDate=1759170600000&access_token=c652301f-9b7e-4726-8ca3-f8a13c2883b8';
  
  try {
    console.log(`Testing clinic details: ${clinicDetailsUrl}`);
    const response = await fetch(clinicDetailsUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ Clinic Details API Status: ${response.status}`);
    console.log(`✅ Clinic Details API Headers:`, Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Clinic Details API Response:', data);
      console.log('✅ Response structure:', {
        hasData: !!data,
        hasDataField: !!data?.data,
        count: data?.count,
        dataKeys: data?.data ? Object.keys(data.data) : [],
        dataListLength: data?.dataList?.length
      });
    } else {
      const errorText = await response.text();
      console.log(`❌ Clinic Details API Error:`, errorText);
    }
  } catch (error) {
    console.error(`❌ Clinic Details API Error:`, error);
  }
};

export const logEnvironmentInfo = () => {
  console.log('🌍 Environment Info:');
  console.log('NODE_ENV:', import.meta.env.MODE);
  console.log('DEV:', import.meta.env.DEV);
  console.log('PROD:', import.meta.env.PROD);
  console.log('Base URL:', window.location.origin);
  console.log('User Agent:', navigator.userAgent);
};

// Test production authentication specifically
export const testProductionAuth = async () => {
  console.log('🔍 Testing Production Authentication...');
  
  const testCredentials = [
    { username: '7972521805', password: 'admin', description: 'Production credentials' },
    { username: '7020757368', password: 'admin', description: 'QA credentials' }
  ];
  
  for (const cred of testCredentials) {
    console.log(`Testing with ${cred.description}: ${cred.username}`);
    
    try {
      const response = await fetch('https://adminapiprod.healthcoco.com/healthco2admin/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'User-Agent': 'smilebird-dashboard/1.0'
        },
        body: new URLSearchParams({
          grant_type: 'password',
          client_id: 'healthco2admin@16',
          client_secret: 'S5HA45KM5M3QX0KKG1',
          username: cred.username,
          password: cred.password
        }).toString()
      });
      
      console.log(`Status: ${response.status} ${response.statusText}`);
      console.log(`Headers:`, Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Success! Response:', data);
        return data;
      } else {
        const errorData = await response.json().catch(() => null);
        console.log('❌ Error Response:', errorData);
      }
    } catch (error) {
      console.error(`❌ Network Error:`, error);
    }
  }
};

// Test if production API endpoints exist
export const testProductionEndpoints = async () => {
  console.log('🔍 Testing Production API Endpoints...');
  
  // First get an access token
  let accessToken = null;
  try {
    const authResponse = await fetch('https://adminapiprod.healthcoco.com/healthco2admin/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams({
        grant_type: 'password',
        client_id: 'healthco2admin@16',
        client_secret: 'S5HA45KM5M3QX0KKG1',
        username: '7972521805',
        password: 'admin'
      }).toString()
    });
    
    if (authResponse.ok) {
      const authData = await authResponse.json();
      accessToken = authData.access_token;
      console.log('✅ Got access token:', accessToken?.substring(0, 20) + '...');
    } else {
      console.log('❌ Failed to get access token');
      return;
    }
  } catch (error) {
    console.error('❌ Auth error:', error);
    return;
  }
  
  // Test various endpoints
  const endpoints = [
    '/healthco2admin/api/v1/dashboard/clinics',
    '/healthco2admin/api/v1/dashboard/clinic-financials',
    '/healthco2admin/api/v1/dashboard/clinic-performance-comparison',
    '/healthco2admin/api/v1/dashboard/kpis',
    '/healthco2admin/api/v1/dashboard/company-financials'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing endpoint: ${endpoint}`);
      // Add date parameters for clinics endpoint
      const dateParams = endpoint.includes('/clinics') ? '&startDate=1756665000000&endDate=1759170600000' : '';
      const response = await fetch(`https://adminapiprod.healthcoco.com${endpoint}?access_token=${accessToken}${dateParams}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      console.log(`Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${endpoint} - Success! Data structure:`, {
          hasData: !!data?.data,
          count: data?.count,
          dataKeys: data?.data ? Object.keys(data.data) : []
        });
      } else {
        console.log(`❌ ${endpoint} - Failed`);
      }
    } catch (error) {
      console.error(`❌ ${endpoint} - Error:`, error);
    }
  }
};
