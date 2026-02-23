import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { useLoginMutation } from '../store/api/authApi';
import { setCredentials } from '../store/slices/authSlice';
import {
  PhoneIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';
import PocketCoachLogo from '../components/common/PocketCoachLogo';

const LoginPage = () => {
  const [mobile, setMobile] = useState('');
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

    if (!mobile || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const result = await login({ mobile, password }).unwrap();
      dispatch(setCredentials(result));
    } catch (err) {
      setError('Login failed. Incorrect phone number or password.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg ring-1 ring-black/5 p-8">
          {/* Wordmark / Logo */}
          <div className="mb-2">
            <div className="flex items-center space-x-2">
              <PocketCoachLogo size="medium" />
            </div>
          </div>

          {/* Title + subtitle */}
          <h2 className="text-xl font-semibold text-gray-900">Student Management Portal</h2>
          <p className="text-sm text-gray-600 mt-1">Log in to continue</p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Phone */}
            <div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <PhoneIcon className="h-5 w-5 text-gray-400" />
                </span>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="Enter your phone number"
                  className="w-full rounded-lg border-0 bg-gray-100 text-gray-900 placeholder-gray-500 pl-10 pr-3 py-3 focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-lg border-0 bg-gray-100 text-gray-900 placeholder-gray-500 pl-10 pr-10 py-3 focus:ring-2 focus:ring-primary-500"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="text-sm text-red-600 flex items-center">
                <LockClosedIcon className="h-4 w-4 mr-2" />
                {error}
              </div>
            )}

            {/* Footer row: forgot + CTA */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                <QuestionMarkCircleIcon className="h-5 w-5 mr-1" />
                Forgot password?
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center px-6 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-70"
              >
                {isLoading ? 'Logging in…' : 'Log in'}
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
