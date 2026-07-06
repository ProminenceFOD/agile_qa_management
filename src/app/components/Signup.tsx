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
    const success = await signup(email, password, name, 'Administrator' as UserRole, organizationName);
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
      <div className="absolute inset-0 bg-indigo-900/80 mix-blend-multiply xs:hidden"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent xs:hidden"></div>

      {/* Left Pane - Hero Section (Hidden on mobile, split-screen on desktop/tablet) */}
      <div 
        className="hidden xs:flex xs:w-4/12 md:w-5/12 text-white p-6 md:p-12 flex-col justify-between relative bg-cover bg-center overflow-hidden border-r border-indigo-900/10"
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
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
            </div>
            AQMS
          </div>
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 leading-tight text-white drop-shadow-lg">
            Agile QA<br />Management<br />System
          </h1>
          <p className="text-indigo-50 text-xs md:text-sm lg:text-lg max-w-md drop-shadow font-medium">
            The gatekeeper for your deployment pipeline. Enforce quality criteria, prioritize testing risks, and eliminate sprint bottlenecks.
          </p>
        </div>

        {/* Feature List in Glassmorphism Card */}
        <div className="space-y-2 md:space-y-4 text-indigo-50 text-[10px] md:text-xs lg:text-sm relative z-10 bg-white/10 p-4 md:p-6 lg:p-7 rounded-xl md:rounded-2xl backdrop-blur-md border border-white/20 shadow-2xl mt-4">
          <div className="flex items-start gap-2 md:gap-4">
            <div className="bg-white/10 p-1 md:p-2 rounded-lg border border-white/10 shrink-0 mt-0.5">
              <svg className="w-3.5 h-3.5 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            </div>
            <div>
              <span className="font-bold tracking-wide block text-white text-[12px] md:text-sm lg:text-[15px] mb-0.5">Criteria Validator</span>
              <span className="text-indigo-200/90 leading-relaxed font-normal">Enforce QA & PM sign-offs at the codebase level. Stories with missing approvals are locked out of the dev queue automatically.</span>
            </div>
          </div>
          <div className="flex items-start gap-2 md:gap-4">
            <div className="bg-white/10 p-1 md:p-2 rounded-lg border border-white/10 shrink-0 mt-0.5">
              <svg className="w-3.5 h-3.5 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div>
              <span className="font-bold tracking-wide block text-white text-[12px] md:text-sm lg:text-[15px] mb-0.5">Risk-Prioritization Matrix</span>
              <span className="text-indigo-200/90 leading-relaxed font-normal">Optimize test coverage dynamically. Core modules like Payment/Auth trigger full regression, while minor fixes receive fast visual checks.</span>
            </div>
          </div>
          <div className="flex items-start gap-2 md:gap-4">
            <div className="bg-white/10 p-1 md:p-2 rounded-lg border border-white/10 shrink-0 mt-0.5">
              <svg className="w-3.5 h-3.5 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            </div>
            <div>
              <span className="font-bold tracking-wide block text-white text-[12px] md:text-sm lg:text-[15px] mb-0.5">Quality Burn-Down</span>
              <span className="text-indigo-200/90 leading-relaxed font-normal">Replaces simple status updates with 4 real-time states and automated bottleneck alerts to prevent end-of-sprint delays.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Pane */}
      <div className="w-full xs:w-8/12 md:w-7/12 xs:bg-[#f9fafa] flex items-center justify-center p-4 sm:p-6 md:p-12 overflow-y-auto relative z-10">
        <div className="w-full max-w-md my-8 bg-white p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-100 xs:border-none xs:shadow-none xs:p-0 xs:bg-transparent">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Create Workspace</h2>
            <p className="text-gray-500">Set up your AQMS organization and admin account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            {/* Honeypot/Autofill traps to aggressively prevent browser auto-population */}
            <input type="email" name="fake-email" id="fake-email" style={{ display: 'none' }} aria-hidden="true" autoComplete="off" />
            <input type="password" name="fake-password" id="fake-password" style={{ display: 'none' }} aria-hidden="true" autoComplete="new-password" />
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
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
              <label htmlFor="email" className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
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
              <label htmlFor="organizationName" className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
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
                You will be configured as the super administrator of this workspace.
              </p>
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

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
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
                  title={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
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
              <span className="text-blue-800 font-bold text-xs uppercase tracking-wider block mb-1">💡 Team Invitations</span>
              <p className="text-gray-600 text-xs leading-relaxed">
                After creating your organization, you can invite team members from the <strong>User Management</strong> section. They'll receive an invitation to join your workspace with roles like QA Engineer, Product Manager, etc.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
