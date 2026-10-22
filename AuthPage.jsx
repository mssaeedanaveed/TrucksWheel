import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';

export default function AuthPage() {
  const [mode, setMode] = useState('signin');
  const [view, setView] = useState('auth');
  const [userType, setUserType] = useState('buyer'); // 'buyer' or 'seller'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleProfilePicChange = (e) => {
    // Preview profile picture without actually saving it
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Only update preview, don't save the actual file
        setProfilePicPreview(URL.createObjectURL(file));
      };
      reader.readAsDataURL(file);
    }
  };

  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // Debug: Log location state and search params
  console.log('AuthPage - location.state:', location.state);
  console.log('AuthPage - searchParams:', Object.fromEntries(searchParams.entries()));
  
  // Get the redirect URL from location state or search params
  const from = location.state?.from?.pathname || searchParams.get('redirect') || '/';
  const message = location.state?.message || '';
  
  console.log('AuthPage - from:', from);
  console.log('AuthPage - message:', message);

  const [loginError, setLoginError] = useState('');

  const handleLogin = async (email, password) => {
    try {
      setLoginError('');
      
      // First try logging in as seller
      let response = await fetch('http://localhost:3000/api/seller/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      let userType = 'seller';
      
      // If seller login fails, try buyer login
      if (!response.ok) {
        response = await fetch('http://localhost:3000/api/buyer/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        userType = 'buyer';
      }

      const data = await response.json();

      if (!response.ok) {
        setLoginError(data.error || 'Login failed. Please check your credentials.');
        return false;
      }

      // Store user data in localStorage
      const userData = data.user || data; // Handle different response formats
      const userToStore = {
        id: userData.id,
        email: userData.email,
        name: userData.name || userData.email.split('@')[0],
        userType
      };
      
      localStorage.setItem('user', JSON.stringify(userToStore));
      
      // Notify other components about the login
      window.dispatchEvent(new Event('storage'));
      
      // Redirect to the intended URL or home
      const redirectTo = from || '/';
      
      console.log('Login successful, redirecting to:', redirectTo);
      navigate(redirectTo, { replace: true });
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('An error occurred during login. Please try again.');
      return false;
    }
  };

  const handleRegister = async (userData) => {
    try {
      setError('');
      const endpoint = userType === 'buyer' 
        ? 'http://localhost:3000/api/buyer/register' 
        : 'http://localhost:3000/api/seller/register';
      
      console.log('Registering with endpoint:', endpoint);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Auto-login after successful registration
      console.log('Registration successful, attempting login...');
      await handleLogin(userData.email, userData.password);
      
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'An error occurred during registration');
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    
    // Handle login
    if (mode === 'signin') {
      if (!email || !password) {
        setError('Please enter both email and password');
        return;
      }
      
      await handleLogin(email, password);
      return;
    }
    
    // Form validation for signup
    if (mode === 'signup') {
      // Basic validation
      if (!name || !email || !phone || !password) {
        setError('All fields are required');
        return;
      }
      
      if (password !== confirmPassword) {
        setError("Passwords don't match!");
        return;
      }
      
      if (!acceptTerms) {
        setError('You must accept the terms and conditions');
        return;
      }
      
      // Prepare user data
      const userData = {
        name,
        email,
        phone,
        password
      };
      
      // Call the registration handler
      await handleRegister(userData);
      
      // Clear form on successful registration
      setName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setConfirmPassword('');
      setMode('signin');
    }
    
    // For sign in (existing code)
    import('./ProtectedRoute').then(({ setAuth }) => {
      setAuth(true);
      navigate(redirectUrl);
    });
  };
  
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div style={{
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      padding: '2rem 0',
    }}>
      <main style={{
        minHeight: 'auto',
        padding: '2rem',
        maxWidth: 720,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: ' #ffffff',
        borderRadius: '12px',
        boxShadow: '10px 10px 10px rgba(0,0,0,0.1)'
      }}>
      {view === 'auth' ? (
        <>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>Welcome</h1>
          <p style={{ color: '#64748b', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Sign in to your account or create a new one.</p>

          <div style={{ display: 'flex', gap: 6, marginBottom: '0.5rem' }}>
            <button
              onClick={() => setMode('signin')}
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                border: mode === 'signin' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                background: mode === 'signin' ? '#eff6ff' : 'white',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('signup')}
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                border: mode === 'signup' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                background: mode === 'signup' ? '#eff6ff' : 'white',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{
            display: 'grid',
            gap: 10,
            background: 'white',
            padding: '6px 16px 10px',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            maxHeight: '70vh',
            overflowY: 'auto',
            scrollbarWidth: 'thin',
          }}>
            {mode === 'signup' ? (
              <>
                {/* User Type Selector */}
                <div className="field" style={{ display: 'grid', gap: 6 }}>
                  <label style={{ fontWeight: 700 }}>I am a</label>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setUserType('buyer')}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        border: `2px solid ${userType === 'buyer' ? '#2563eb' : '#cbd5e1'}`,
                        background: userType === 'buyer' ? '#eff6ff' : 'white',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Buyer
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserType('seller')}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        border: `2px solid ${userType === 'seller' ? '#2563eb' : '#cbd5e1'}`,
                        background: userType === 'seller' ? '#eff6ff' : 'white',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Seller
                    </button>
                  </div>
                </div>

                {/* Row 1: Email (full width) */}
                <div className="field" style={{ display: 'grid', gap: 6 }}>
                  <label htmlFor="email" style={{ fontWeight: 700 }}>E-mail</label>
                  <input 
                    id="email" 
                    type="email" 
                    placeholder="ex: myname@example.com" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    style={{ padding: '12px 14px', borderRadius: 8, border: '1px solid #cbd5e1' }} 
                    required
                  />
                </div>

                {/* Row 2: Full Name | Phone */}
                <div className="grid-2">
                  <div className="field" style={{ display: 'grid', gap: 6 }}>
                    <label htmlFor="name" style={{ fontWeight: 700 }}>Full Name</label>
                    <input 
                      id="name" 
                      type="text" 
                      placeholder="John Doe" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      style={{ padding: '12px 14px', borderRadius: 8, border: '1px solid #cbd5e1' }} 
                      required
                    />
                  </div>
                  <div className="field" style={{ display: 'grid', gap: 6 }}>
                    <label htmlFor="phone" style={{ fontWeight: 700 }}>Phone Number</label>
                    <input 
                      id="phone" 
                      type="tel" 
                      placeholder="0300-1234567" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                      style={{ padding: '12px 14px', borderRadius: 8, border: '1px solid #cbd5e1' }} 
                      required
                    />
                  </div>
                </div>

                {/* Row 3: Password (left) | Confirm Password (right) */}
                <div className="grid-2">
                  <div className="field" style={{ display: 'grid', gap: 6 }}>
                    <label htmlFor="password" style={{ fontWeight: 700 }}>Password</label>
                    <input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} style={{ padding: '12px 14px', borderRadius: 8, border: '1px solid #cbd5e1' }} />
                  </div>
                  <div className="field" style={{ display: 'grid', gap: 6 }}>
                    <label htmlFor="confirm" style={{ fontWeight: 700 }}>Confirm Password</label>
                    <input id="confirm" type="password" placeholder="Re-type password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={{ padding: '12px 14px', borderRadius: 8, border: '1px solid #cbd5e1' }} />
                  </div>
                </div>

                {/* Row 4: Profile Picture Upload */}
                <div className="field" style={{ display: 'grid', gap: 6 }}>
                  <label style={{ fontWeight: 700 }}>Profile Picture</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div 
                      onClick={triggerFileInput}
                      style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        backgroundColor: '#f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        border: '2px dashed #cbd5e1',
                      }}
                    >
                      {profilePicPreview ? (
                        <img 
                          src={profilePicPreview} 
                          alt="Profile preview" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      ) : (
                        <span style={{ color: '#64748b', fontSize: '12px', textAlign: 'center' }}>
                          Click to upload
                        </span>
                      )}
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleProfilePicChange}
                      accept="image/*"
                      style={{ display: 'none' }}
                    />
                    <span style={{ color: '#64748b', fontSize: '14px' }}>
                      {profilePic ? profilePic.name : 'Upload a profile picture (optional)'}
                    </span>
                  </div>
                </div>

                {/* Row 5: Create Account (left) | Terms (right) */}
                <div className="grid-2" style={{ alignItems: 'center' }}>
                  <div>
                    <button type="submit" style={{
                      padding: '12px 16px',
                      borderRadius: 10,
                      border: '1px solid #2563eb',
                      background: '#2563eb',
                      color: 'white',
                      fontWeight: 800,
                      cursor: 'pointer',
                      width: '100%'
                    }}>Create Account</button>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#334155' }}>
                      <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} />
                      <span>I agree to the <a href="#" style={{ color: '#2563eb', textDecoration: 'none' }}>Terms & Conditions</a></span>
                    </label>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="field" style={{ display: 'grid', gap: 6 }}>
                  <label htmlFor="email" style={{ fontWeight: 700 }}>Email</label>
                  <input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: '12px 14px', borderRadius: 8, border: '1px solid #cbd5e1' }} />
                </div>
                <div className="field" style={{ display: 'grid', gap: 6 }}>
                  <label htmlFor="password" style={{ fontWeight: 700 }}>Password</label>
                  <input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} style={{ padding: '12px 14px', borderRadius: 8, border: '1px solid #cbd5e1' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="checkbox" />
                    <span>Remember me</span>
                  </label>
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); setView('forgot'); }}
                    style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}
                  >
                    Forgot password?
                  </a>
                </div>
                
                {loginError && (
                  <div style={{ 
                    color: '#ef4444', 
                    backgroundColor: '#fef2f2',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    marginTop: '1rem',
                    fontSize: '0.875rem'
                  }}>
                    {loginError}
                  </div>
                )}

                <button type="submit" style={{
                  padding: '12px 16px',
                  borderRadius: 10,
                  border: '1px solid #2563eb',
                  background: '#2563eb',
                  color: 'white',
                  fontWeight: 800,
                  cursor: 'pointer',
                  width: '100%',
                  marginTop: '1rem'
                }}>
                  Sign In
                </button>
              </>
            )}
          </form>
          <style>{`
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
            .field input { height: 46px; }
            @media (max-width: 640px) { .grid-2 { grid-template-columns: 1fr; } }
          `}</style>
        </>
      ) : (
        <div style={{ background: 'white', padding: 16, border: '1px solid #e2e8f0', borderRadius: 12 }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 8 }}>Reset password</h2>
          <p style={{ color: '#64748b', marginBottom: 12 }}>Enter your email address and we will send you a reset link.</p>
          <div style={{ display: 'grid', gap: 10 }}>
            <div style={{ display: 'grid', gap: 6 }}>
              <label htmlFor="reset-email" style={{ fontWeight: 600 }}>Email</label>
              <input id="reset-email" type="email" placeholder="you@example.com" style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1' }} />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button type="button" style={{
                padding: '10px 14px',
                borderRadius: 10,
                border: 'none',
                background: '#2563eb',
                color: 'white',
                fontWeight: 800,
                cursor: 'pointer',
              }}>Send reset link</button>
              <button type="button" onClick={() => setView('auth')} style={{
                padding: '10px 14px',
                borderRadius: 10,
                border: '1px solid #cbd5e1',
                background: 'white',
                color: '#0f172a',
                fontWeight: 700,
                cursor: 'pointer',
              }}>Back to sign in</button>
            </div>
          </div>
        </div>
      )}
      </main>
    </div>
  );
}
