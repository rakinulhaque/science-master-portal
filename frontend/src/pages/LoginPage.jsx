import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { useLoginMutation } from '../store/api/authApi';
import { setCredentials } from '../store/slices/authSlice';
import { PhoneIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const LoginPage = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const [login, { isLoading }] = useLoginMutation();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!phoneNumber || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const result = await login({ phoneNumber, password }).unwrap();
      dispatch(setCredentials(result));
    } catch (err) {
      setError('Login failed. Incorrect phone number or password.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="card p-8">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">☀</span>
              </div>
              <h1 className="ml-2 text-2xl font-bold text-primary-600">SUNRISE</h1>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Student Management Portal</h2>
            <p className="text-gray-600">Log in to continue</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Phone Number Field */}
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <PhoneIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="input-field pl-10"
                  placeholder="01234567890"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center text-red-600 text-sm">
                <LockClosedIcon className="h-4 w-4 mr-2" />
                {error}
              </div>
            )}

            {/* Forgot Password Link */}
            <div className="flex items-center">
              <button
                type="button"
                className="text-blue-600 hover:text-blue-500 text-sm font-medium"
              >
                🔵 Forgot password?
              </button>
            </div>

            {/* Login Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary px-8 py-2 flex items-center"
              >
                {isLoading ? 'Logging in...' : 'Log in'}
                <span className="ml-2">→</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
