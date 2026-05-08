// Test login flow with correct admin credentials
console.log('=== TESTING REAL ADMIN LOGIN ===');

const testRealLogin = async () => {
  try {
    console.log('1. Testing login with correct admin credentials...');
    
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'vengalavishnu2005@gmail.com', // Correct admin email
        password: 'admin123' // Common password
      })
    });

    if (!response.ok) {
      console.log('❌ Login failed:', response.status, await response.text());
      return;
    }

    const data = await response.json();
    console.log('✅ Login successful!');
    console.log('✅ User:', data.user);
    console.log('✅ AccessToken received:', !!data.accessToken);
    console.log('✅ RefreshToken received:', !!data.refreshToken);
    
    // Store tokens like frontend does
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    
    console.log('✅ Tokens stored in localStorage');
    
    // Test member API with fresh token
    console.log('\n2. Testing member API with fresh admin token...');
    const memberResponse = await fetch('http://localhost:5000/api/users/members', {
      headers: {
        'Authorization': `Bearer ${data.accessToken}`
      }
    });
    
    if (memberResponse.ok) {
      const memberData = await memberResponse.json();
      console.log('✅ Member API successful!');
      console.log('✅ Members returned:', memberData.members?.length || 0);
      console.log('✅ First member stats:', memberData.members?.[0]?.stats);
      console.log('✅ Total stats:', memberData.stats);
    } else {
      console.log('❌ Member API failed:', memberResponse.status);
      console.log('❌ Error:', await memberResponse.text());
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
};

testRealLogin();
