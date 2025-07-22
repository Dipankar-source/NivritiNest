import { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle, AlertCircle, Shield, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

// Reusable FormInput component
const FormInput = ({ icon, type, placeholder, value, onChange, label, id, showPassword, togglePassword, helperText }) => {
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
          autoComplete={
            id === 'email' ? 'email' : 
            id === 'name' ? 'name' : 
            id === 'password' ? 'new-password' : 
            id === 'confirmPassword' ? 'new-password' : ''
          }
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
      {helperText && <p className="text-xs text-gray-500">{helperText}</p>}
    </div>
  );
};

// Alert component
const Alert = ({ type, message }) => {
  if (!message) return null;
  
  const Icon = type === 'error' ? AlertCircle : CheckCircle;
  const bgColor = type === 'error' ? 'bg-red-50' : 'bg-green-50';
  const textColor = type === 'error' ? 'text-red-600' : 'text-green-600';
  
  return (
    <div className={`flex items-center p-3 ${bgColor} ${textColor} rounded-lg`}>
      <Icon className="w-5 h-5 mr-2" />
      <span>{message}</span>
    </div>
  );
};

// Password strength indicator
const PasswordStrengthIndicator = ({ password }) => {
  const getStrength = (pass) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/\d/.test(pass)) score += 1;
    if (/[!@#$%^&*]/.test(pass)) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    return score;
  };
  
  const strength = getStrength(password);
  const widthPercent = (strength / 4) * 100;
  
  let strengthColor = 'bg-red-500';
  let strengthText = 'Weak';
  
  if (strength >= 3) {
    strengthColor = 'bg-green-500';
    strengthText = 'Strong';
  } else if (strength >= 2) {
    strengthColor = 'bg-yellow-500';
    strengthText = 'Medium';
  }
  
  return (
    <div className="mt-1">
      <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${strengthColor} transition-all duration-300`} 
          style={{ width: `${widthPercent}%` }}
        ></div>
      </div>
      <p className="text-xs mt-1 text-gray-500">Password strength: <span className="font-medium">{strengthText}</span></p>
    </div>
  );
};

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeRole, setActiveRole] = useState('warden');
  const navigate = useNavigate();

  const validateForm = () => {
    setError('');
    
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const storedUsers = JSON.parse(localStorage.getItem('hostelUsers') || '[]');
      const userExists = storedUsers.some(user => user.email.toLowerCase() === email.toLowerCase());
      
      if (userExists) {
        setError('An account with this email already exists');
        return;
      }

      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password,
        role: activeRole,
        createdAt: new Date().toISOString()
      };

      await new Promise(resolve => setTimeout(resolve, 1000));
      localStorage.setItem('hostelUsers', JSON.stringify([...storedUsers, newUser]));

      setSuccess('Account created successfully! Redirecting...');
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      setError('Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleRegister = (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const { name, email, picture } = decoded;

      const storedUsers = JSON.parse(localStorage.getItem('hostelUsers') || '[]');
      const userExists = storedUsers.some(user => user.email.toLowerCase() === email.toLowerCase());
      
      if (userExists) {
        setError('An account with this Google email already exists');
        return;
      }

      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        picture,
        role: activeRole,
        createdAt: new Date().toISOString(),
        isGoogleAuth: true
      };

      localStorage.setItem('hostelUsers', JSON.stringify([...storedUsers, newUser]));
      setSuccess('Google registration successful! Redirecting...');
      setTimeout(() => navigate('/'), 1500);
    } catch (error) {
      setError('Google registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-center relative">
            <button 
              onClick={() => navigate(-1)}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-blue-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-white">Create Account</h1>
            <p className="text-blue-100 mt-1">Join our hostel management system</p>
          </div>

          {/* Role Selection */}
          <div className="flex border-b">
            <button
              type="button"
              onClick={() => setActiveRole('admin')}
              className={`flex-1 py-3 px-4 text-center font-medium text-sm ${activeRole === 'admin' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <div className="flex items-center justify-center gap-2">
                <Shield className="w-4 h-4" />
                Admin
              </div>
            </button>
            <button
              type="button"
              onClick={() => setActiveRole('warden')}
              className={`flex-1 py-3 px-4 text-center font-medium text-sm ${activeRole === 'warden' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <div className="flex items-center justify-center gap-2">
                <User className="w-4 h-4" />
                Warden
              </div>
            </button>
            <button
              type="button"
              onClick={() => setActiveRole('guard')}
              className={`flex-1 py-3 px-4 text-center font-medium text-sm ${activeRole === 'guard' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <div className="flex items-center justify-center gap-2">
                <Key className="w-4 h-4" />
                Guard
              </div>
            </button>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleRegister} className="p-6 space-y-6">
            <Alert type="error" message={error} />
            <Alert type="success" message={success} />

            <FormInput
              icon={User}
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={setName}
              label="Full Name"
              id="name"
            />

            <FormInput
              icon={Mail}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={setEmail}
              label="Email Address"
              id="email"
            />

            <div className="space-y-2">
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
                helperText="Must be at least 8 characters with uppercase, number, and special character"
              />
              {password && <PasswordStrengthIndicator password={password} />}
            </div>

            <FormInput
              icon={Lock}
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={setConfirmPassword}
              label="Confirm Password"
              id="confirmPassword"
              showPassword={showPassword}
              togglePassword={() => setShowPassword(!showPassword)}
            />

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="text-gray-700">
                  I agree to the <a href="#" className="text-blue-600 hover:underline">Terms</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-75"
            >
              {isSubmitting ? 'Creating Account...' : `Register as ${activeRole}`}
            </button>

            <div className="flex items-center">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-3 text-sm text-gray-500">Or register with</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleRegister}
                onError={() => setError('Google registration failed')}
                text="signup_with"
                shape="rectangular"
                size="medium"
              />
            </div>
          </form>

          <div className="px-6 pb-6 text-center text-sm text-gray-500">
            <p>Already have an account?{' '}
              <button 
                onClick={() => navigate('/')}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;