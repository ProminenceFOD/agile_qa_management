import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { CriteriaValidator } from './components/CriteriaValidator';
import { RiskMatrix } from './components/RiskMatrix';
import { QualityBurnDown } from './components/QualityBurnDown';
import { Dashboard as DashboardOverview } from './components/Dashboard';
import { TestCases } from './components/TestCases';
import { BugTracker } from './components/BugTracker';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { SprintManagement } from './components/SprintManagement';
import { Attachments } from './components/Attachments';
import { UserManagement } from './components/UserManagement';
import { KanbanBoard } from './components/KanbanBoard';
import { Login } from './components/Login';
import { Signup } from './components/Signup';
import { NotificationBell } from './components/NotificationBell';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useNotifications } from './hooks/useNotifications';
import { Reports } from './components/Reports';
import { Notifications } from './components/Notifications';
import { TestExecutionHistory } from './components/TestExecutionHistory';
import { DataManagement } from './components/DataManagement';
import { AuditTrail } from './components/AuditTrail';
import { BulkOperations } from './components/BulkOperations';
import { TraceabilityMatrix } from './components/TraceabilityMatrix';
import { ReleaseReadiness } from './components/ReleaseReadiness';
import { TeamPerformance } from './components/TeamPerformance';
import { TestRecommendations } from './components/TestRecommendations';
import { DocumentationViewer } from './components/DocumentationViewer';
import { Sidebar } from './components/Sidebar';
import './utils/fixServerUsers'; // Load server fix utility
import { overrideRolePermissions, loadUserOverrides } from './utils/permissions';
import { getData } from './utils/supabaseStorage';

// Suppress findDOMNode deprecation warning from third-party libraries
const originalError = console.error;
console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('findDOMNode')) {
    return;
  }
  originalError.call(console, ...args);
};

type TabType = 'dashboard' | 'kanban' | 'validator' | 'risk' | 'burndown' | 'tests' | 'bugs' | 'charts' | 'sprints' | 'attachments' | 'users' | 'reports' | 'notifications' | 'testhistory' | 'data' | 'audit' | 'bulk' | 'traceability' | 'release' | 'team' | 'recommendations';

function AppDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    clearAll,
  } = useNotifications();

  // Load saved role permissions and user overrides, and prefetch storage data
  useEffect(() => {
    // 1. Load role permissions
    getData('aqms_role_permissions').then(saved => {
      if (saved) overrideRolePermissions(saved);
    });

    // 2. Load user-level permission overrides
    loadUserOverrides();

    // 3. Prefetch critical data to populate localStorage cache (fixes iframe storage clear)
    const prefetch = async () => {
      const keys = ['aqms_stories', 'aqms_bugs', 'aqms_test_cases', 'aqms_users'];
      for (const key of keys) {
        try {
          const data = await getData(key);
          if (data) {
            localStorage.setItem(key, typeof data === 'string' ? data : JSON.stringify(data));
          }
        } catch (e) {
          console.warn(`[App] Failed to prefetch ${key}:`, e);
        }
      }
    };
    prefetch();
  }, []);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    { key: '1', ctrl: true, description: 'Go to Dashboard', action: () => setActiveTab('dashboard') },
    { key: '2', ctrl: true, description: 'Go to Kanban Board', action: () => setActiveTab('kanban') },
    { key: '3', ctrl: true, description: 'Go to Validator', action: () => setActiveTab('validator') },
    { key: '4', ctrl: true, description: 'Go to Risk Matrix', action: () => setActiveTab('risk') },
    { key: '5', ctrl: true, description: 'Go to Burn-Down', action: () => setActiveTab('burndown') },
    { key: '6', ctrl: true, description: 'Go to Test Cases', action: () => setActiveTab('tests') },
    { key: '7', ctrl: true, description: 'Go to Bugs', action: () => setActiveTab('bugs') },
    { key: '8', ctrl: true, description: 'Go to Analytics', action: () => setActiveTab('charts') },
    { key: '9', ctrl: true, description: 'Go to Sprints', action: () => setActiveTab('sprints') },
    { key: '0', ctrl: true, description: 'Go to Users', action: () => setActiveTab('users') },
    { key: 'a', ctrl: true, description: 'Go to Audit Trail', action: () => setActiveTab('audit') },
    { key: 'b', ctrl: true, description: 'Go to Bulk Operations', action: () => setActiveTab('bulk') },
    { key: 'e', ctrl: true, description: 'Go to Data Management', action: () => setActiveTab('data') },
    { key: 'g', ctrl: true, description: 'Go to Traceability Matrix', action: () => setActiveTab('traceability') },
    { key: 'i', ctrl: true, description: 'Go to Test Recommendations', action: () => setActiveTab('recommendations') },
    { key: 'k', ctrl: true, description: 'Go to Release Readiness', action: () => setActiveTab('release') },
    { key: 'm', ctrl: true, description: 'Go to Team Performance', action: () => setActiveTab('team') },
    { key: 'o', ctrl: true, description: 'Go to Reports', action: () => setActiveTab('reports') },
    { key: 'q', ctrl: true, description: 'Go to Notifications', action: () => setActiveTab('notifications') },
    { key: 'u', ctrl: true, description: 'Go to Test History', action: () => setActiveTab('testhistory') },
    { key: 'd', ctrl: true, shift: true, description: 'Toggle dark mode', action: toggleTheme },
    { key: '?', shift: true, description: 'Show shortcuts', action: () => setShowShortcuts(true) },
  ]);


  const getPageTitle = (tab: TabType): string => {
    const titles: Record<TabType, string> = {
      dashboard: 'Dashboard',
      kanban: 'Kanban Board',
      validator: 'Stories',
      risk: 'Risk Matrix',
      burndown: 'Burn-Down Chart',
      tests: 'Test Cases',
      bugs: 'Bug Tracker',
      charts: 'Analytics',
      sprints: 'Sprint Management',
      attachments: 'Attachments',
      users: 'User Management',
      reports: 'Reports & Analytics',
      notifications: 'Notifications',
      testhistory: 'Test Execution History',
      data: 'Data Management',
      audit: 'Audit Trail',
      bulk: 'Bulk Operations',
      traceability: 'Traceability Matrix',
      release: 'Release Readiness',
      team: 'Team Performance',
      recommendations: 'AI Test Recommendations'
    };
    return titles[tab] || 'AQMS';
  };

  // Handle navigation from recommendations
  const handleNavigateToItem = (tab: string, itemId?: string) => {
    setActiveTab(tab as TabType);
    if (itemId) {
      setHighlightedItemId(itemId);
      // Clear highlight after 3 seconds
      setTimeout(() => setHighlightedItemId(null), 3000);
    }
  };

  // Calculate real counts from stored data
  const [bugCount, setBugCount] = useState(0);
  const [storyCount, setStoryCount] = useState(0);
  const [testCount, setTestCount] = useState(0);

  useEffect(() => {
    // Update counts from localStorage/Supabase data
    const updateCounts = () => {
      try {
        const stories = JSON.parse(localStorage.getItem('aqms_stories') || '[]');
        const bugs = JSON.parse(localStorage.getItem('aqms_bugs') || '[]');
        const tests = JSON.parse(localStorage.getItem('aqms_test_cases') || '[]');

        setStoryCount(stories.length);
        setBugCount(bugs.length);
        setTestCount(tests.length);
      } catch (error) {
        console.error('Error loading counts:', error);
      }
    };

    updateCounts();

    // Update counts when tab changes (in case data was modified)
    const interval = setInterval(updateCounts, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Toaster position="top-right" richColors closeButton />

      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        mobileOpen={mobileMenuOpen}
        onMobileToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        bugCount={bugCount}
        storyCount={storyCount}
        testCount={testCount}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />

      {/* Main Content Area */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm sticky top-0 z-35">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white lg:hidden"
                  title="Toggle menu"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <h1 className="text-2xl text-gray-900 dark:text-white">{getPageTitle(activeTab)}</h1>
              </div>
              <div className="flex items-center gap-4">
                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  title="Toggle dark mode (Ctrl+D)"
                >
                  {theme === 'light' ? '🌙' : '☀️'}
                </button>

                {/* Notifications */}
                <NotificationBell
                  notifications={notifications}
                  onMarkAsRead={markAsRead}
                  onMarkAllAsRead={markAllAsRead}
                  onClearAll={clearAll}
                />

                {/* Keyboard Shortcuts */}
                <button
                  onClick={() => setShowShortcuts(true)}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  title="Keyboard shortcuts (?)"
                >
                  ⌨️
                </button>

                {/* Documentation */}
                <button
                  onClick={() => setShowDocumentation(true)}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  title="Documentation"
                >
                  📖
                </button>

                <div className="text-right">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Logged in as</div>
                  <div className="font-medium text-gray-900 dark:text-white">{user?.name}</div>
                  <div className="text-xs text-indigo-600 dark:text-indigo-400">{user?.role}</div>
                  {user?.organizationName && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">{user.organizationName}</div>
                  )}
                </div>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="py-8">
        {activeTab === 'dashboard' && <DashboardOverview />}
        {activeTab === 'kanban' && <KanbanBoard />}
        {activeTab === 'validator' && <CriteriaValidator highlightedItemId={highlightedItemId} onNavigate={handleNavigateToItem} />}
        {activeTab === 'risk' && <RiskMatrix highlightedItemId={highlightedItemId} />}
        {activeTab === 'burndown' && <QualityBurnDown />}
        {activeTab === 'tests' && <TestCases highlightedItemId={highlightedItemId} />}
        {activeTab === 'bugs' && <BugTracker highlightedItemId={highlightedItemId} />}
        {activeTab === 'charts' && <AnalyticsDashboard />}
        {activeTab === 'sprints' && <SprintManagement />}
        {activeTab === 'attachments' && <Attachments />}
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'reports' && <Reports />}
        {activeTab === 'notifications' && <Notifications />}
        {activeTab === 'testhistory' && <TestExecutionHistory />}
        {activeTab === 'data' && <DataManagement />}
        {activeTab === 'audit' && <AuditTrail />}
        {activeTab === 'bulk' && <BulkOperations />}
        {activeTab === 'traceability' && <TraceabilityMatrix />}
        {activeTab === 'release' && <ReleaseReadiness />}
        {activeTab === 'team' && <TeamPerformance />}
        {activeTab === 'recommendations' && <TestRecommendations onNavigate={handleNavigateToItem} />}

        </main>

        {/* Documentation Viewer */}
        <DocumentationViewer
          isOpen={showDocumentation}
          onClose={() => setShowDocumentation(false)}
        />

        {/* Keyboard Shortcuts Modal */}
        <KeyboardShortcutsModal
          isOpen={showShortcuts}
          onClose={() => setShowShortcuts(false)}
        />
      </div>
    </div>
  );
}

function AuthenticatedApp() {
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const { user, loading } = useAuth();

  console.log('[AuthenticatedApp] user:', user, 'loading:', loading);

  useEffect(() => {
    try {
      // Force clear session cache to prevent stale data
      const session = localStorage.getItem('aqms_session');
      if (session) {
        try {
          const sessionData = JSON.parse(session);
          // Check if session has qa@aqms.com with wrong role
          if (sessionData.user?.email === 'qa@aqms.com' && sessionData.user?.role !== 'Administrator') {
            console.log('[App] Detected stale session for qa@aqms.com - clearing...');
            localStorage.removeItem('aqms_session');
            // Force page reload to re-authenticate
            window.location.reload();
            return;
          }
        } catch (e) {
          console.warn('[App] Invalid session data, clearing...');
          localStorage.removeItem('aqms_session');
        }
      }

      const existingUsers = JSON.parse(localStorage.getItem('aqms_users') || '[]');

      // Define demo users with all required fields
      const requiredDemoUsers = [
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
          lastActive: new Date('2026-04-26T14:30:00'),
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
          id: 'USR-003',
          title: 'Lead Scrum Master',
          status: 'Active',
          joinedDate: new Date('2026-01-10'),
          isActive: true
        },
      ];

      if (existingUsers.length === 0) {
        // No users exist, create demo users
        console.log('[App] Creating initial demo users...');
        localStorage.setItem('aqms_users', JSON.stringify(requiredDemoUsers));
      } else {
        // Ensure all demo users exist and are up-to-date
        let needsUpdate = false;
        requiredDemoUsers.forEach(demoUser => {
          const existingUserIndex = existingUsers.findIndex((u: any) => u.email === demoUser.email);
          if (existingUserIndex === -1) {
            // User doesn't exist, add them
            existingUsers.push(demoUser);
            needsUpdate = true;
          } else {
            // User exists - force update critical fields to ensure consistency
            const existingUser = existingUsers[existingUserIndex];

            // Always update these fields for demo users to keep them in sync
            if (existingUser.role !== demoUser.role) {
              existingUser.role = demoUser.role;
              needsUpdate = true;
            }
            if (existingUser.organizationName !== demoUser.organizationName) {
              existingUser.organizationName = demoUser.organizationName;
              needsUpdate = true;
            }
            if (existingUser.title !== demoUser.title) {
              existingUser.title = demoUser.title;
              needsUpdate = true;
            }
            if (existingUser.canSignOffQA !== demoUser.canSignOffQA) {
              existingUser.canSignOffQA = demoUser.canSignOffQA;
              needsUpdate = true;
            }
            if (existingUser.canSignOffPM !== demoUser.canSignOffPM) {
              existingUser.canSignOffPM = demoUser.canSignOffPM;
              needsUpdate = true;
            }
            if (!existingUser.password) {
              existingUser.password = demoUser.password;
              needsUpdate = true;
            }
            if (!existingUser.organizationId) {
              existingUser.organizationId = demoUser.organizationId;
              needsUpdate = true;
            }
          }
        });

        if (needsUpdate) {
          console.log('[App] Updating demo users with correct data...');
          localStorage.setItem('aqms_users', JSON.stringify(existingUsers));
        }
      }
    } catch (error) {
      console.error('Error initializing users:', error);
      // Force reset on error
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
          isActive: true
        },
      ];
      localStorage.setItem('aqms_users', JSON.stringify(demoUsers));
    }
  }, []);

  // Show loading screen while checking for remembered user
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-500 mb-4"></div>
          <h2 className="text-2xl text-gray-700">Loading AQMS...</h2>
        </div>
      </div>
    );
  }

  try {
    if (user) {
      console.log('[AuthenticatedApp] Rendering AppDashboard for user:', user.email);
      return <AppDashboard />;
    }

    console.log('[AuthenticatedApp] Rendering auth view:', authView);
    return authView === 'login' ? (
      <Login onSwitchToSignup={() => setAuthView('signup')} />
    ) : (
      <Signup onSwitchToLogin={() => setAuthView('login')} />
    );
  } catch (error) {
    console.error('[AuthenticatedApp] Render error:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">Render Error</h2>
          <p className="text-gray-700 mb-4">Something went wrong. Please try refreshing.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-600"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
}

export default function App() {
  // Version: 1.0.2 - Indigo theme applied
  try {
    return (
      <AuthProvider>
        <ThemeProvider>
          <AuthenticatedApp />
        </ThemeProvider>
      </AuthProvider>
    );
  } catch (error) {
    console.error('[App] Fatal error:', error);
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Application Error</h1>
          <p className="text-gray-700 mb-4">
            The application encountered an error. Please refresh the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
}