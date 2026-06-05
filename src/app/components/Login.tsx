import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { NotificationModal } from './NotificationModal';

interface LoginProps {
  onSwitchToSignup: () => void;
}

export function Login({ onSwitchToSignup }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState({ isOpen: false, title: '', message: '', type: 'success' as const });
  const { login } = useAuth();

  const handleResetUsers = () => {
    const demoUsers = [
      {
        email: 'qa@aqms.com',
        password: 'password123',
        name: 'Damilola Ogunlade',
        role: 'Administrator',
        organizationId: 'demo-org',
        organizationName: 'AQMS Demo Organization',
        canSignOffQA: true,
        canSignOffPM: true,
        id: 'USR-001',
        title: 'Head of QA / Administrator',
        status: 'Active',
        joinedDate: new Date('2026-01-15'),
        lastActive: new Date(),
        storiesAssigned: 12,
        bugsAssigned: 8,
        isActive: true
      },
      {
        email: 'pm@aqms.com',
        password: 'password123',
        name: 'Sarah Johnson',
        role: 'Product Manager',
        organizationId: 'demo-org',
        organizationName: 'AQMS Demo Organization',
        canSignOffPM: true,
        id: 'USR-002',
        title: 'Senior Product Manager',
        status: 'Active',
        joinedDate: new Date('2026-01-10'),
        isActive: true
      },
      {
        email: 'sm@aqms.com',
        password: 'password123',
        name: 'Mike Williams',
        role: 'Scrum Master',
        organizationId: 'demo-org',
        organizationName: 'AQMS Demo Organization',
        id: 'USR-003',
        title: 'Lead Scrum Master',
        status: 'Active',
        joinedDate: new Date('2026-01-10'),
        isActive: true
      },
    ];
    localStorage.setItem('aqms_users', JSON.stringify(demoUsers));
    setError('');
    setNotification({
      isOpen: true,
      title: 'Success',
      message: 'Demo users have been reset! You can now sign in.',
      type: 'success',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    const success = await login(email, password, rememberMe);
    setLoading(false);

    if (!success) {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your AQMS account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="you@company.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-indigo-500 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="remember-me" className="ml-2 text-sm text-gray-700">
              Remember me for 30 days
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-500 text-white py-3 rounded-lg hover:bg-indigo-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={onSwitchToSignup}
              className="text-indigo-500 hover:text-indigo-600"
            >
              Sign up
            </button>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500">Demo credentials:</p>
            <button
              type="button"
              onClick={handleResetUsers}
              className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition-colors"
              title="Click if you can't sign in"
            >
              Reset Users
            </button>
          </div>
          <div className="space-y-2 text-xs text-gray-600">
            <div className="bg-gray-50 px-3 py-2 rounded">
              <strong>QA Engineer:</strong> qa@aqms.com / password123
            </div>
            <div className="bg-gray-50 px-3 py-2 rounded">
              <strong>Product Manager:</strong> pm@aqms.com / password123
            </div>
            <div className="bg-gray-50 px-3 py-2 rounded">
              <strong>Scrum Master:</strong> sm@aqms.com / password123
            </div>
          </div>
        </div>
      </div>

      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
    </div>
  );
}