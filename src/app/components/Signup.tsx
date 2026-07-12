import { useState } from 'react';
import { useAuth, UserRole } from '../contexts/AuthContext';

interface SignupProps {
  onSwitchToLogin: () => void;
}

export function Signup({ onSwitchToLogin }: SignupProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!name || !email || !organizationName || !password || !confirmPassword) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    // First user signing up becomes Administrator and creates organization
    const success = await signup(
      email,
      password,
      name,
      'Administrator' as UserRole,
      organizationName
    );
    setLoading(false);

    if (!success) {
      setError('An account with this email already exists');
    }
  };

  return (
    <div
      className="min-h-screen flex font-sans relative bg-cover bg-center"
      style={{ backgroundImage: "url('/login_hero.png')" }}
    >
      {/* Mobile Dark Overlays (Covered on desktop/tablet by the split panes) */}
      <div className="absolute inset-0 bg-indigo-900/80 mix-blend-multiply mobile-overlay-responsive"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent mobile-overlay-responsive"></div>

      {/* Left Pane - Hero Section (Hidden on mobile, split-screen on desktop/tablet) */}
      <div
        className="hidden hero-pane-responsive text-white p-6 md:p-12 flex-col justify-between relative bg-cover bg-center overflow-hidden border-r border-indigo-900/10"
        style={{ backgroundImage: "url('/login_hero.png')" }}
      >
        {/* Dark/color overlays for readability */}
        <div className="absolute inset-0 bg-indigo-900/65 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/80 to-transparent"></div>

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-8 md:mb-16 text-xs md:text-sm font-semibold tracking-wider text-indigo-100">
            <div className="bg-white/20 p-1.5 rounded backdrop-blur-sm border border-white/10 shadow-sm">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                ></path>
              </svg>
            </div>
            AQMS
          </div>

          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 leading-tight text-white drop-shadow-lg">
            Agile QA
            <br />
            Management
            <br />
            System
          </h1>
          <p className="text-indigo-50 text-xs md:text-sm lg:text-lg max-w-md drop-shadow font-medium">
            Create your organization's workspace to begin enforcing quality
            criteria and eliminating bottlenecks.
          </p>
        </div>

        {/* Feature List in Glassmorphism Card */}
        <div className="space-y-2 md:space-y-4 text-indigo-50 text-[10px] md:text-xs lg:text-sm relative z-10 bg-white/10 p-4 md:p-6 lg:p-7 rounded-xl md:rounded-2xl backdrop-blur-md border border-white/20 shadow-2xl mt-4">
          {/* Feature 1 */}
          <div className="flex items-start gap-2 md:gap-4">
            <div className="bg-white/10 p-1 md:p-2 rounded-lg border border-white/10 shrink-0 mt-0.5">
              <svg
                className="w-3.5 h-3.5 md:w-5 md:h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                ></path>
              </svg>
            </div>
            <div>
              <span className="font-bold tracking-wide block text-white text-[12px] md:text-sm lg:text-[15px] mb-0.5">
                Invite Your Team
              </span>
              <span className="text-indigo-200/90 leading-relaxed font-normal">
                Bring developers, QA engineers, and PMs together in one unified
                platform.
              </span>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex items-start gap-2 md:gap-4">
            <div className="bg-white/10 p-1 md:p-2 rounded-lg border border-white/10 shrink-0 mt-0.5">
              <svg
                className="w-3.5 h-3.5 md:w-5 md:h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                ></path>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                ></path>
              </svg>
            </div>
            <div>
              <span className="font-bold tracking-wide block text-white text-[12px] md:text-sm lg:text-[15px] mb-0.5">
                Configure Workflows
              </span>
              <span className="text-indigo-200/90 leading-relaxed font-normal">
                Set up custom sign-off requirements and risk matrices tailored
                to your pipeline.
              </span>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex items-start gap-2 md:gap-4">
            <div className="bg-white/10 p-1 md:p-2 rounded-lg border border-white/10 shrink-0 mt-0.5">
              <svg
                className="w-3.5 h-3.5 md:w-5 md:h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                ></path>
              </svg>
            </div>
            <div>
              <span className="font-bold tracking-wide block text-white text-[12px] md:text-sm lg:text-[15px] mb-0.5">
                Achieve Quality
              </span>
              <span className="text-indigo-200/90 leading-relaxed font-normal">
                Replace manual status updates with real-time, automated quality
                tracking.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Pane */}
      <div className="w-full form-pane-responsive flex items-center justify-center p-4 sm:p-6 md:p-12 overflow-y-auto relative z-10">
        <div className="w-full max-w-md my-8 bg-white p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-100 form-card-responsive">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
              Create Workspace
            </h2>
            <p className="text-gray-500">
              Set up your AQMS organization and admin account
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
            autoComplete="off"
          >
            {/* Honeypot/Autofill traps to aggressively prevent browser auto-population */}
            <input
              type="email"
              name="fake-email"
              id="fake-email"
              style={{ display: 'none' }}
              aria-hidden="true"
              autoComplete="off"
            />
            <input
              type="password"
              name="fake-password"
              id="fake-password"
              style={{ display: 'none' }}
              aria-hidden="true"
              autoComplete="new-password"
            />

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="name"
                className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2"
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="off"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-colors"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2"
              >
                Email Address
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
              <label
                htmlFor="organizationName"
                className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2"
              >
                Organization Name
              </label>
              <input
                id="organizationName"
                type="text"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                autoComplete="off"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-colors"
                placeholder="Your Company Name"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                You will be configured as the super administrator of this
                workspace.
              </p>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
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
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                        clipRule="evenodd"
                      />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  className="w-full px-4 py-3 pr-12 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  title={
                    showConfirmPassword ? 'Hide password' : 'Show password'
                  }
                >
                  {showConfirmPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                        clipRule="evenodd"
                      />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
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
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 space-y-4 text-center">
            <p className="text-gray-500 text-sm">
              Already have an account?{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-indigo-600 hover:text-indigo-800 font-semibold hover:underline"
              >
                Sign in
              </button>
            </p>

            <div className="bg-[#f0f4f8] border border-blue-100 rounded-xl p-4 text-left">
              <span className="text-blue-800 font-bold text-xs uppercase tracking-wider block mb-1">
                💡 Team Invitations
              </span>
              <p className="text-gray-600 text-xs leading-relaxed">
                After creating your organization, you can invite team members
                from the <strong>User Management</strong> section. They'll
                receive an invitation to join your workspace with roles like QA
                Engineer, Product Manager, etc.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
