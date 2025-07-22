import { useState, useEffect } from 'react';
import { Lock, Mail, Eye, EyeOff, UserPlus, AlertCircle, User, Shield, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import * as jwt_decode from 'jwt-decode';

// Reusable Input component
const FormInput = ({ icon, type, placeholder, value, onChange, label, id, showPassword, togglePassword }) => {
  const Icon = icon;
  const isPasswordField = id.toLowerCase().includes('password');
  
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          id={id}
          name={id}
          type={isPasswordField ? (showPassword ? 'text' : 'password') : type}
          autoComplete={id === 'email' ? 'email' : id === 'password' ? 'current-password' : ''}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder={placeholder}
        />
        {isPasswordField && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={togglePassword}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

// Alert component for showing errors and success messages
const Alert = ({ type, message }) => {
  if (!message) return null;
  
  const Icon = type === 'error' ? AlertCircle : AlertCircle;
  const bgColor = type === 'error' ? 'bg-red-50' : 'bg-green-50';
  const textColor = type === 'error' ? 'text-red-600' : 'text-green-600';
  
  return (
    <div className={`flex items-center p-3 ${bgColor} ${textColor} rounded-lg`}>
      <Icon className="w-5 h-5 mr-2" />
      <span>{message}</span>
    </div>
  );
};

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);
  const [activeRole, setActiveRole] = useState('admin'); // 'admin', 'warden', 'guard'
  const navigate = useNavigate();

  // Load users from local storage on component mount
  useEffect(() => {
    // Check if user was remembered from previous session
    const rememberedUser = localStorage.getItem('hostelRememberedUser');
    if (rememberedUser) {
      const parsedUser = JSON.parse(rememberedUser);
      setEmail(parsedUser.email || '');
      setPassword(parsedUser.password || '');
      setRememberMe(true);
      setActiveRole(parsedUser.role || 'admin');
    }
    
    // Load all users
    const storedUsers = localStorage.getItem('hostelUsers');
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    }
    setIsLoading(false);
  }, []);

  const validateForm = () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    // Form validation
    if (!validateForm()) return;

    // Check if user exists with the correct role
    const user = users.find(u => 
      u.email.toLowerCase() === email.toLowerCase() && 
      u.role === activeRole
    );
    
    if (!user) {
      setError(`No ${activeRole} account found with this email`);
      return;
    }

    // Check password
    if (user.password !== password) {
      setError('Incorrect password');
      return;
    }

    // Handle remember me
    if (rememberMe) {
      localStorage.setItem('hostelRememberedUser', JSON.stringify({
        email: email,
        password: password,
        role: activeRole
      }));
    } else {
      localStorage.removeItem('hostelRememberedUser');
    }

    // Successful login
    const userToStore = { ...user };
    delete userToStore.password; // Don't store password in session
    localStorage.setItem('hostelCurrentUser', JSON.stringify(userToStore));
    
    // Redirect based on role
    switch(activeRole) {
      case 'admin':
        navigate('/dashboard');
        break;
      case 'warden':
        navigate('/dashboard');
        break;
      case 'guard':
        navigate('/dashboard');
        break;
      default:
        navigate('/dashboard');
    }
  };

  const handleGoogleLoginSuccess = (credentialResponse) => {
    try {
      const decoded = jwt_decode.jwtDecode(credentialResponse.credential);
      const { email, name, picture } = decoded;

      // Find user with this email and the active role
      const user = users.find(u => 
        u.email.toLowerCase() === email.toLowerCase() && 
        u.role === activeRole
      );

      if (!user) {
        setError(`No ${activeRole} account found with this Google email`);
        return;
      }

      // Successful login
      const userToStore = { 
        ...user,
        name: name,
        picture: picture
      };
      delete userToStore.password;
      localStorage.setItem('hostelCurrentUser', JSON.stringify(userToStore));
      
      // Redirect based on role
      switch(activeRole) {
        case 'admin':
          navigate('/dashboard');
          break;
        case 'warden':
          navigate('/dashboard');
          break;
        case 'guard':
          navigate('/dashboard');
          break;
        default:
          navigate('/dashboard');
      }
    } catch (error) {
      setError('Google login failed. Please try again.');
      console.error('Google login error:', error);
    }
  };

  const handleGoogleLoginFailure = () => {
    setError('Google login failed. Please try again.');
  };

  const handleCreateAccount = () => {
    navigate('/register');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-center">
            <h1 className="text-2xl font-bold text-white">Hostel Management</h1>
            <p className="text-blue-100 mt-1">Sign in to your account</p>
          </div>

          {/* Role Selection */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveRole('admin')}
              className={`flex-1 py-3 px-4 text-center font-medium text-sm ${activeRole === 'admin' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <div className="flex items-center justify-center gap-2">
                <Shield className="w-4 h-4" />
                Admin
              </div>
            </button>
            <button
              onClick={() => setActiveRole('warden')}
              className={`flex-1 py-3 px-4 text-center font-medium text-sm ${activeRole === 'warden' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <div className="flex items-center justify-center gap-2">
                <User className="w-4 h-4" />
                Warden
              </div>
            </button>
            <button
              onClick={() => setActiveRole('guard')}
              className={`flex-1 py-3 px-4 text-center font-medium text-sm ${activeRole === 'guard' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <div className="flex items-center justify-center gap-2">
                <Key className="w-4 h-4" />
                Guard
              </div>
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="p-6 space-y-6">
            <Alert type="error" message={error} />

            {/* Email Field */}
            <FormInput
              icon={Mail}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={setEmail}
              label="Email Address"
              id="email"
              showPassword={false}
            />

            {/* Password Field */}
            <FormInput
              icon={Lock}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={setPassword}
              label="Password"
              id="password"
              showPassword={showPassword}
              togglePassword={() => setShowPassword(!showPassword)}
            />

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <button 
                  type="button"
                  onClick={() => navigate('/forgot-password')} 
                  className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Sign in as {activeRole}
              </button>
            </div>

            {/* Google Login */}
            <div className="flex items-center">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-3 text-sm text-gray-500">Or continue with</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleLoginSuccess}
                onError={handleGoogleLoginFailure}
                useOneTap
                text="signin_with"
                shape="rectangular"
                size="medium"
                logo_alignment="left"
              />
            </div>
          </form>

          {/* Create Account */}
          <div className="px-6 pb-6">
            <button
              onClick={handleCreateAccount}
              className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Create new account
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Hostel Management System. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;