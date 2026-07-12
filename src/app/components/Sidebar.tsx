import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Trello,
  FileText,
  Target,
  TrendingDown,
  TestTube,
  Bug,
  BarChart3,
  Calendar,
  FileBarChart,
  History,
  Shield,
  Layers,
  Database,
  GitBranch,
  Rocket,
  Network,
  Users as UsersIcon,
  Brain,
  Users,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Search,
  Plus,
  Star,
  Clock,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { canAccessTab } from '../utils/permissions';

type TabType =
  | 'dashboard'
  | 'kanban'
  | 'validator'
  | 'risk'
  | 'burndown'
  | 'tests'
  | 'bugs'
  | 'charts'
  | 'sprints'
  | 'attachments'
  | 'users'
  | 'reports'
  | 'notifications'
  | 'testhistory'
  | 'data'
  | 'audit'
  | 'bulk'
  | 'traceability'
  | 'release'
  | 'team'
  | 'recommendations';

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  mobileOpen: boolean;
  onMobileToggle: () => void;
  bugCount?: number;
  storyCount?: number;
  testCount?: number;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

const menuItems = [
  {
    section: 'Overview',
    items: [
      {
        key: 'dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        shortcut: 'Ctrl+1',
        hasNotification: false,
      },
      {
        key: 'kanban',
        label: 'Kanban Board',
        icon: Trello,
        shortcut: 'Ctrl+2',
        hasNotification: false,
      },
    ],
  },
  {
    section: 'Quality Management',
    items: [
      {
        key: 'validator',
        label: 'Stories',
        icon: FileText,
        shortcut: 'Ctrl+3',
        hasNotification: true,
        notificationKey: 'stories',
      },
      {
        key: 'tests',
        label: 'Test Cases',
        icon: TestTube,
        shortcut: 'Ctrl+6',
        hasNotification: true,
        notificationKey: 'tests',
      },
      {
        key: 'bugs',
        label: 'Bugs',
        icon: Bug,
        shortcut: 'Ctrl+7',
        hasNotification: true,
        notificationKey: 'bugs',
      },
      {
        key: 'risk',
        label: 'Risk Matrix',
        icon: Target,
        shortcut: 'Ctrl+4',
        hasNotification: false,
      },
      {
        key: 'burndown',
        label: 'Burn-Down',
        icon: TrendingDown,
        shortcut: 'Ctrl+5',
        hasNotification: false,
      },
    ],
  },
  {
    section: 'Analytics & Reports',
    items: [
      {
        key: 'charts',
        label: 'Analytics',
        icon: BarChart3,
        shortcut: 'Ctrl+8',
        hasNotification: false,
      },
      {
        key: 'reports',
        label: 'Reports',
        icon: FileBarChart,
        shortcut: 'Ctrl+O',
        hasNotification: false,
      },
      {
        key: 'testhistory',
        label: 'Test History',
        icon: History,
        shortcut: 'Ctrl+U',
        hasNotification: false,
      },
      {
        key: 'team',
        label: 'Team Performance',
        icon: UsersIcon,
        shortcut: 'Ctrl+M',
        hasNotification: false,
      },
    ],
  },
  {
    section: 'Planning & Workflow',
    items: [
      {
        key: 'sprints',
        label: 'Sprints',
        icon: Calendar,
        shortcut: 'Ctrl+9',
        hasNotification: false,
      },
      {
        key: 'traceability',
        label: 'Traceability',
        icon: GitBranch,
        shortcut: 'Ctrl+G',
        hasNotification: false,
      },
      {
        key: 'release',
        label: 'Release Readiness',
        icon: Rocket,
        shortcut: 'Ctrl+K',
        hasNotification: false,
      },
      {
        key: 'recommendations',
        label: 'AI Recommend',
        icon: Brain,
        shortcut: 'Ctrl+I',
        hasNotification: false,
      },
    ],
  },
  {
    section: 'Administration',
    items: [
      {
        key: 'audit',
        label: 'Audit Trail',
        icon: Shield,
        shortcut: 'Ctrl+A',
        hasNotification: false,
      },
      {
        key: 'bulk',
        label: 'Bulk Operations',
        icon: Layers,
        shortcut: 'Ctrl+B',
        hasNotification: false,
      },
      {
        key: 'data',
        label: 'Data Management',
        icon: Database,
        shortcut: 'Ctrl+E',
        hasNotification: false,
      },
      {
        key: 'users',
        label: 'Users',
        icon: Users,
        shortcut: 'Ctrl+0',
        hasNotification: false,
      },
    ],
  },
];

export function Sidebar({
  activeTab,
  onTabChange,
  mobileOpen,
  onMobileToggle,
  bugCount = 0,
  storyCount = 0,
  testCount = 0,
  collapsed,
  onCollapsedChange,
}: SidebarProps) {
  const { user: currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  // Generate organization initials from organization name
  const getOrgInitials = (orgName?: string) => {
    if (!orgName) return 'AQ';
    return orgName
      .split(' ')
      .filter((word) => word.length > 0)
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 3);
  };
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const orgId = currentUser?.organizationId || 'demo-org';

  const [favorites, setFavorites] = useState<string[]>(() => {
    const session = localStorage.getItem('aqms_session');
    const currentOrgId = session
      ? JSON.parse(session).user?.organizationId || 'demo-org'
      : 'demo-org';
    const saved = localStorage.getItem(`${currentOrgId}_aqms_favorites`);
    return saved ? JSON.parse(saved) : ['dashboard', 'validator', 'bugs'];
  });
  const [recentPages, setRecentPages] = useState<string[]>(() => {
    const session = localStorage.getItem('aqms_session');
    const currentOrgId = session
      ? JSON.parse(session).user?.organizationId || 'demo-org'
      : 'demo-org';
    const saved = localStorage.getItem(`${currentOrgId}_aqms_recent`);
    return saved ? JSON.parse(saved) : [];
  });

  // Close quick create menu when clicking outside
  useEffect(() => {
    const handleClick = () => setShowQuickCreate(false);
    if (showQuickCreate) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [showQuickCreate]);

  // Track recent pages
  useEffect(() => {
    if (!recentPages.includes(activeTab)) {
      const updated = [
        activeTab,
        ...recentPages.filter((p) => p !== activeTab),
      ].slice(0, 5);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRecentPages(updated);
      localStorage.setItem(`${orgId}_aqms_recent`, JSON.stringify(updated));
    }
  }, [activeTab, orgId]);

  // Save favorites
  useEffect(() => {
    localStorage.setItem(`${orgId}_aqms_favorites`, JSON.stringify(favorites));
  }, [favorites, orgId]);

  const toggleFavorite = (key: string) => {
    setFavorites((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const getNotificationCount = (key: string) => {
    if (key === 'bugs') return bugCount;
    if (key === 'validator') return storyCount;
    if (key === 'tests') return testCount;
    return 0;
  };

  const filteredSections = menuItems
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) =>
          item.label.toLowerCase().includes(searchQuery.toLowerCase()) &&
          canAccessTab(currentUser?.role, item.key)
      ),
    }))
    .filter((section) => section.items.length > 0);

  const handleItemClick = (key: TabType) => {
    onTabChange(key);
    // Auto-close on mobile after selecting a menu item
    if (window.innerWidth < 1024 && mobileOpen) {
      onMobileToggle();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={onMobileToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-40
        ${collapsed ? 'w-16' : 'w-64'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex flex-col h-full">
          {/* Header with Logo */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                  {getOrgInitials(currentUser?.organizationName)}
                </div>
                {!collapsed && (
                  <div className="flex flex-col min-w-0">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">
                      AQMS
                    </h2>
                    {currentUser?.organizationName && (
                      <p
                        className="text-xs text-gray-600 dark:text-gray-400 truncate"
                        title={currentUser.organizationName}
                      >
                        {currentUser.organizationName}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Collapse button */}
              <button
                onClick={() => onCollapsedChange(!collapsed)}
                className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex-shrink-0"
                title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <span className="text-xl font-light">
                  {collapsed ? '»' : '«'}
                </span>
              </button>
            </div>
          </div>

          {/* Quick Create Button */}
          {!collapsed && (
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowQuickCreate(!showQuickCreate);
                  }}
                  className="w-full btn btn-primary justify-center"
                >
                  <Plus className="w-4 h-4" />
                  Quick Create
                </button>
                {showQuickCreate && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-1 z-50"
                  >
                    <button
                      onClick={() => {
                        onTabChange('validator');
                        setShowQuickCreate(false);
                        // Trigger create mode by setting a flag in localStorage
                        localStorage.setItem('aqms_quick_create', 'story');
                        setTimeout(
                          () => localStorage.removeItem('aqms_quick_create'),
                          100
                        );
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-sm text-gray-700 dark:text-gray-300"
                    >
                      New Story
                    </button>
                    <button
                      onClick={() => {
                        onTabChange('bugs');
                        setShowQuickCreate(false);
                        localStorage.setItem('aqms_quick_create', 'bug');
                        setTimeout(
                          () => localStorage.removeItem('aqms_quick_create'),
                          100
                        );
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-sm text-gray-700 dark:text-gray-300"
                    >
                      New Bug
                    </button>
                    <button
                      onClick={() => {
                        onTabChange('tests');
                        setShowQuickCreate(false);
                        localStorage.setItem('aqms_quick_create', 'test');
                        setTimeout(
                          () => localStorage.removeItem('aqms_quick_create'),
                          100
                        );
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-sm text-gray-700 dark:text-gray-300"
                    >
                      New Test Case
                    </button>
                    <button
                      onClick={() => {
                        onTabChange('sprints');
                        setShowQuickCreate(false);
                        localStorage.setItem('aqms_quick_create', 'sprint');
                        setTimeout(
                          () => localStorage.removeItem('aqms_quick_create'),
                          100
                        );
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-sm text-gray-700 dark:text-gray-300"
                    >
                      New Sprint
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Search */}
          {!collapsed && (
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search pages..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-2 scrollbar-thin">
            {/* Favorites Section */}
            {!collapsed && favorites.length > 0 && !searchQuery && (
              <div className="mb-6">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Favorites
                </div>
                <div className="space-y-1">
                  {favorites.map((favKey) => {
                    const item = menuItems
                      .flatMap((s) => s.items)
                      .find((i) => i.key === favKey);
                    if (!item) return null;
                    const Icon = item.icon;
                    const isActive = activeTab === item.key;
                    const count = getNotificationCount(item.key);

                    return (
                      <button
                        key={item.key}
                        onClick={() => handleItemClick(item.key as TabType)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-indigo-500 text-white'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 flex-shrink-0 ${isActive ? '' : 'text-gray-500 dark:text-gray-400'}`}
                        />
                        <span className="flex-1 text-left text-sm">
                          {item.label}
                        </span>
                        {count > 0 && !isActive && (
                          <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                            {count}
                          </span>
                        )}
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recent Pages */}
            {!collapsed && recentPages.length > 0 && !searchQuery && (
              <div className="mb-6">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Recent
                </div>
                <div className="space-y-1">
                  {recentPages.slice(0, 3).map((recentKey) => {
                    const item = menuItems
                      .flatMap((s) => s.items)
                      .find((i) => i.key === recentKey);
                    if (!item) return null;
                    const Icon = item.icon;
                    const isActive = activeTab === item.key;

                    return (
                      <button
                        key={item.key}
                        onClick={() => handleItemClick(item.key as TabType)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-indigo-500 text-white'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 flex-shrink-0 ${isActive ? '' : 'text-gray-500 dark:text-gray-400'}`}
                        />
                        <span className="flex-1 text-left text-sm">
                          {item.label}
                        </span>
                        <Clock className="w-4 h-4 text-gray-400" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* All Pages */}
            {filteredSections.map((section, idx) => (
              <div key={idx} className="mb-6">
                {!collapsed && (
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {section.section}
                  </div>
                )}
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.key;
                    const isFavorite = favorites.includes(item.key);
                    const count = item.hasNotification
                      ? getNotificationCount(item.key)
                      : 0;

                    return (
                      <div key={item.key} className="relative group">
                        <button
                          onClick={() => handleItemClick(item.key as TabType)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                            isActive
                              ? 'bg-indigo-500 text-white'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                          title={
                            collapsed
                              ? `${item.label} (${item.shortcut})`
                              : item.shortcut
                          }
                        >
                          <Icon
                            className={`w-5 h-5 flex-shrink-0 ${isActive ? '' : 'text-gray-500 dark:text-gray-400'}`}
                          />
                          {!collapsed && (
                            <>
                              <span className="flex-1 text-left text-sm">
                                {item.label}
                              </span>
                              {count > 0 && !isActive && (
                                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                                  {count}
                                </span>
                              )}
                              <span className="text-xs opacity-60">
                                {item.shortcut.replace('Ctrl+', '⌘')}
                              </span>
                            </>
                          )}
                          {collapsed && count > 0 && (
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                          )}
                        </button>
                        {!collapsed && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(item.key);
                            }}
                            className="absolute right-2 top-2.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Star
                              className={`w-4 h-4 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`}
                            />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}
