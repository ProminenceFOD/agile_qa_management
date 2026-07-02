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

  const handleDemoClick = (email: string) => {
    setEmail(email);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen flex font-sans">
      {/* Left Pane */}
      <div className="hidden lg:flex lg:w-5/12 bg-indigo-600 text-white p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-16 text-sm font-semibold tracking-wider text-gray-200">
            <div className="bg-white/20 p-1.5 rounded">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
            </div>
            AQMS
          </div>
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Agile QA<br />Management<br />System
          </h1>
          <p className="text-indigo-200 text-lg max-w-md">
            Submit, track, and manage software quality assurance processes across all projects and teams.
          </p>
        </div>

        <div className="space-y-6 mt-12">
          {/* Card 1 */}
          <div className="flex gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-all cursor-default">
            <div className="bg-indigo-500/50 p-3 rounded-lg h-fit shadow-inner">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1 text-base tracking-wide">Intuitive Bug Tracking</h3>
              <p className="text-indigo-200 text-sm leading-relaxed">
                Log, categorize, and prioritize issues seamlessly. Our intelligent dashboard keeps your team focused on what matters most.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="flex gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-all cursor-default">
            <div className="bg-indigo-500/50 p-3 rounded-lg h-fit shadow-inner">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1 text-base tracking-wide">Real-time Traceability</h3>
              <p className="text-indigo-200 text-sm leading-relaxed">
                Link test cases to requirements and bugs instantly. Generate comprehensive traceability matrices with a single click.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="flex gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-all cursor-default">
            <div className="bg-indigo-500/50 p-3 rounded-lg h-fit shadow-inner">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1 text-base tracking-wide">Advanced Analytics</h3>
              <p className="text-indigo-200 text-sm leading-relaxed">
                Visualize test coverage, bug resolution rates, and team performance through customizable, rich dashboards.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Pane */}
      <div className="w-full lg:w-7/12 bg-[#f9fafa] flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Sign in</h2>
            <p className="text-gray-500">Welcome back to AQMS</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-colors"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  className="w-full px-4 py-3 pr-12 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white font-medium py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-10">
            <div className="relative flex items-center py-5">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink-0 mx-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Click to Fill Demo Account</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button onClick={() => handleDemoClick('qa@aqms.com')} type="button" className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-lg hover:border-indigo-600 hover:shadow-md transition-all group">
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold mb-3 group-hover:scale-105 transition-transform">QA</div>
                <span className="text-sm font-bold text-gray-800">Admin</span>
                <span className="text-[11px] text-gray-500 text-center leading-tight mt-1">Damilola O.</span>
              </button>
              <button onClick={() => handleDemoClick('pm@aqms.com')} type="button" className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-lg hover:border-indigo-600 hover:shadow-md transition-all group">
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold mb-3 group-hover:scale-105 transition-transform">PM</div>
                <span className="text-sm font-bold text-gray-800">Manager</span>
                <span className="text-[11px] text-gray-500 text-center leading-tight mt-1">Sarah J.</span>
              </button>
              <button onClick={() => handleDemoClick('sm@aqms.com')} type="button" className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-lg hover:border-indigo-600 hover:shadow-md transition-all group">
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold mb-3 group-hover:scale-105 transition-transform">SM</div>
                <span className="text-sm font-bold text-gray-800">Master</span>
                <span className="text-[11px] text-gray-500 text-center leading-tight mt-1">Mike W.</span>
              </button>
            </div>
            
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={handleResetUsers}
                className="text-xs text-gray-400 hover:text-gray-600 underline decoration-gray-300 underline-offset-2"
              >
                Reset Demo Data
              </button>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500">
              No account?{' '}
              <button onClick={onSwitchToSignup} className="font-bold text-indigo-600 hover:underline">
                Register here
              </button>
            </p>
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