import { useState, useEffect } from 'react';
import { defaultBugs } from '../utils/defaultData';
import { toast } from 'sonner';
import { Bug as BugIcon, Eye, Edit3, Plus, Search, Filter, AlertCircle, TrendingUp, FilterX } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { BugReportForm } from './BugReportForm';
import { BugView } from './BugView';
import { BugEditForm } from './BugEditForm';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { Modal } from './Modal';
import { useModal } from '../hooks/useModal';
import { Pagination } from './Pagination';

type BugSeverity = 'Critical' | 'High' | 'Medium' | 'Low';
type BugStatus = 'Open' | 'In Progress' | 'Fixed' | 'Verified' | 'Closed' | 'Reopened';

interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: Date | string;
  edited?: boolean;
}

interface Bug {
  id: string;
  title: string;
  description: string;
  severity: BugSeverity;
  status: BugStatus;
  linkedStory?: string;
  foundBy: string;
  assignedTo?: string;
  assignedDeveloper?: string;
  assignedTester?: string;
  createdAt: Date;
  resolvedAt?: Date;
  steps: string[];
  expectedBehavior: string;
  actualBehavior: string;
  environment?: string;
  attachments?: string[];
  comments?: Comment[];
}

interface BugTrackerProps {
  highlightedItemId?: string | null;
}

export function BugTracker({ highlightedItemId }: BugTrackerProps = {}) {
  const { user } = useAuth();
  const { modalState, showAlert, showSuccess, showConfirm, closeModal } = useModal();
  const [showReportForm, setShowReportForm] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'view' | 'edit'>('list');
  const [selectedBug, setSelectedBug] = useState<Bug | null>(null);

  // Use Supabase for persistent storage (shares data with KanbanBoard)

  const { data: bugs, setData: setBugs, loading: bugsLoading } = useSupabaseData<Bug[]>('aqms_bugs', defaultBugs);

  // Listen for quick create trigger
  useEffect(() => {
    const quickCreate = localStorage.getItem('aqms_quick_create');
    if (quickCreate === 'bug') {
      setShowReportForm(true);
      localStorage.removeItem('aqms_quick_create');
    }
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<BugSeverity | 'All'>('All');
  const [filterStatus, setFilterStatus] = useState<BugStatus | 'All'>('All');
  const [filterAssignedDeveloper, setFilterAssignedDeveloper] = useState<string>('All');
  const [filterAssignedTester, setFilterAssignedTester] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Show loading state immediately if data isn't ready
  if (bugsLoading || !bugs) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <div className="skeleton skeleton-title mb-2"></div>
          <div className="skeleton skeleton-text w-1/3"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card p-4">
              <div className="skeleton skeleton-title mb-2"></div>
              <div className="skeleton skeleton-text w-2/3"></div>
            </div>
          ))}
        </div>

        <div className="card p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton skeleton-button"></div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="p-4 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton h-12"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getSeverityColor = (severity: BugSeverity) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getStatusColor = (status: BugStatus) => {
    switch (status) {
      case 'Open':
        return 'bg-red-500 text-white';
      case 'In Progress':
        return 'bg-indigo-500 text-white';
      case 'Fixed':
        return 'bg-purple-500 text-white';
      case 'Verified':
        return 'bg-green-500 text-white';
      case 'Closed':
        return 'bg-gray-500 text-white';
      case 'Reopened':
        return 'bg-orange-500 text-white';
    }
  };

  const allDevelopers = Array.from(new Set(bugs.map(b => b.assignedDeveloper).filter(Boolean))) as string[];
  const allTesters = Array.from(new Set(bugs.map(b => b.assignedTester).filter(Boolean))) as string[];

  const filteredBugs = bugs.filter(bug => {
    const matchesSearch = searchQuery === '' ||
      bug.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bug.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = filterSeverity === 'All' || bug.severity === filterSeverity;
    const matchesStatus = filterStatus === 'All' || bug.status === filterStatus;
    const matchesDeveloper = filterAssignedDeveloper === 'All' || bug.assignedDeveloper === filterAssignedDeveloper;
    const matchesTester = filterAssignedTester === 'All' || bug.assignedTester === filterAssignedTester;
    return matchesSearch && matchesSeverity && matchesStatus && matchesDeveloper && matchesTester;
  }).sort((a, b) => {
    // Extract numeric part from bug IDs (e.g., "BUG-001" -> 1, "BUG-123" -> 123)
    const getNumericId = (id: string) => {
      const match = id.match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    };
    return getNumericId(a.id) - getNumericId(b.id);
  });

  // Calculate pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBugs = filteredBugs.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterSeverity, filterStatus, filterAssignedDeveloper, filterAssignedTester]);

  const stats = {
    total: bugs.length,
    open: bugs.filter(b => b.status === 'Open').length,
    inProgress: bugs.filter(b => b.status === 'In Progress').length,
    fixed: bugs.filter(b => b.status === 'Fixed').length,
    critical: bugs.filter(b => b.severity === 'Critical' && b.status !== 'Closed').length,
  };

  const handleReportBug = (bug: Omit<Bug, 'id' | 'createdAt'>) => {
    const newBug: Bug = {
      ...bug,
      id: `BUG-${String(bugs.length + 1).padStart(3, '0')}`,
      createdAt: new Date(),
    };
    setBugs([newBug, ...bugs]);
    setShowReportForm(false);
    toast.success(`Bug ${newBug.id} has been reported successfully!`);
  };

  const handleViewBug = (bug: Bug) => {
    setSelectedBug(bug);
    setViewMode('view');
  };

  const handleEditBug = (bug: Bug) => {
    setSelectedBug(bug);
    setViewMode('edit');
  };

  const handleUpdateBug = (updatedBug: Bug) => {
    setBugs(bugs.map(b => b.id === updatedBug.id ? updatedBug : b));
    setViewMode('list');
    setSelectedBug(null);
    toast.success(`Bug ${updatedBug.id} has been updated successfully!`);
  };

  const handleAssignDeveloper = (bugId: string, developer: string) => {
    setBugs(bugs.map(b => b.id === bugId ? { ...b, assignedDeveloper: developer || undefined } : b));
    if (selectedBug && selectedBug.id === bugId) {
      setSelectedBug({ ...selectedBug, assignedDeveloper: developer || undefined });
    }
  };

  const handleAssignTester = (bugId: string, tester: string) => {
    setBugs(bugs.map(b => b.id === bugId ? { ...b, assignedTester: tester || undefined } : b));
    if (selectedBug && selectedBug.id === bugId) {
      setSelectedBug({ ...selectedBug, assignedTester: tester || undefined });
    }
  };

  const handleUpdateComments = (bugId: string, updatedComments: Comment[]) => {
    setBugs(bugs.map(b => b.id === bugId ? { ...b, comments: updatedComments } : b));
    if (selectedBug && selectedBug.id === bugId) {
      setSelectedBug({ ...selectedBug, comments: updatedComments });
    }
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedBug(null);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Bug Tracker</h1>
          <p className="text-gray-600">Track and manage defects</p>
        </div>
        <button
          onClick={() => setShowReportForm(true)}
          className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl hover:from-red-700 hover:to-rose-700 transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
        >
          <BugIcon className="w-5 h-5" />
          Report Bug
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="card fade-in p-4">
          <div className="text-2xl font-bold text-gray-900 mb-1">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Bugs</div>
        </div>
        <div className="card fade-in p-4 bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
          <div className="text-2xl font-bold text-red-700 mb-1">{stats.open}</div>
          <div className="text-sm text-red-600">Open</div>
        </div>
        <div className="card fade-in p-4 bg-gradient-to-br from-indigo-50 to-indigo-50 border-indigo-200">
          <div className="text-2xl font-bold text-indigo-700 mb-1">{stats.inProgress}</div>
          <div className="text-sm text-indigo-600">In Progress</div>
        </div>
        <div className="card fade-in p-4 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <div className="text-2xl font-bold text-purple-700 mb-1">{stats.fixed}</div>
          <div className="text-sm text-purple-600">Fixed</div>
        </div>
        <div className="card fade-in p-4 bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
          <div className="text-2xl font-bold text-orange-700 mb-1 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {stats.critical}
          </div>
          <div className="text-sm text-orange-600">Critical Open</div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 card p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search bugs..."
              className="input"
            />
          </div>
          <div className="relative">
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value as any)}
              className="input"
            >
              <option value="All">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="input"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Fixed">Fixed</option>
              <option value="Verified">Verified</option>
              <option value="Closed">Closed</option>
              <option value="Reopened">Reopened</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="relative">
            <select
              value={filterAssignedDeveloper}
              onChange={(e) => setFilterAssignedDeveloper(e.target.value)}
              className="input"
            >
              <option value="All">All Developers</option>
              {allDevelopers.map(dev => (
                <option key={dev} value={dev}>{dev}</option>
              ))}
            </select>
          </div>
          <div className="relative">
            <select
              value={filterAssignedTester}
              onChange={(e) => setFilterAssignedTester(e.target.value)}
              className="input"
            >
              <option value="All">All Testers</option>
              {allTesters.map(tester => (
                <option key={tester} value={tester}>{tester}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterSeverity('All');
              setFilterStatus('All');
              setFilterAssignedDeveloper('All');
              setFilterAssignedTester('All');
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-800 border border-indigo-300 dark:border-indigo-600 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
          >
            <FilterX className="w-4 h-4" />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Bugs Table */}
      <div className="card overflow-auto max-h-[600px] custom-scrollbar">
        <table className="table-modern w-full">
          <thead>
            <tr>
              <th>Bug ID</th>
              <th>Title</th>
              <th className="text-center">Severity</th>
              <th className="text-center">Status</th>
              <th className="text-center">Story</th>
              <th className="text-center">Found By</th>
              <th className="text-center">Assigned</th>
              <th className="text-center">Age</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedBugs.map((bug) => {
              const age = Math.floor((new Date().getTime() - new Date(bug.createdAt).getTime()) / (1000 * 60 * 60 * 24));
              const isHighlighted = highlightedItemId === bug.id;
              return (
                <tr
                  key={bug.id}
                  className={isHighlighted ? 'bg-indigo-100 dark:bg-indigo-900 ring-2 ring-indigo-500 animate-pulse' : ''}
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{bug.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{bug.title}</td>
                  <td className="text-center">
                    <span className={`badge ${getSeverityColor(bug.severity)}`}>
                      {bug.severity}
                    </span>
                  </td>
                  <td className="text-center">
                    <span className={`badge ${getStatusColor(bug.status)}`}>
                      {bug.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-indigo-600">
                    {bug.linkedStory || '-'}
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-gray-600">
                    {bug.foundBy.split(' ').map(n => n[0]).join('')}
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-gray-600">
                    {bug.assignedTo ? bug.assignedTo.split(' ').map(n => n[0]).join('') : '-'}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">{age}d</td>
                  <td className="text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleViewBug(bug)}
                        className="btn btn-primary btn-sm"
                        title="View bug details"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </button>
                      <button
                        onClick={() => handleEditBug(bug)}
                        className="btn btn-secondary btn-sm"
                        title="Edit bug"
                      >
                        <Edit3 className="w-3 h-3" />
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <Pagination
          currentPage={currentPage}
          totalItems={filteredBugs.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>

      {/* Bug Report Form Modal */}
      {showReportForm && (
        <BugReportForm
          onClose={() => setShowReportForm(false)}
          onSubmit={handleReportBug}
          currentUser={user?.name || 'Unknown'}
        />
      )}

      {/* Bug View Modal */}
      {viewMode === 'view' && selectedBug && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={handleBackToList}
          ></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
              <BugView
                bug={selectedBug}
                onBack={handleBackToList}
                onEdit={() => setViewMode('edit')}
                onAssignDeveloper={(developer) => handleAssignDeveloper(selectedBug.id, developer)}
                onAssignTester={(tester) => handleAssignTester(selectedBug.id, tester)}
                onUpdateComments={handleUpdateComments}
              />
            </div>
          </div>
        </>
      )}

      {/* Bug Edit Form Modal */}
      {viewMode === 'edit' && selectedBug && (
        <BugEditForm
          bug={selectedBug}
          onClose={handleBackToList}
          onSubmit={handleUpdateBug}
        />
      )}

      {/* Modal */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        onConfirm={modalState.onConfirm}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
      />
    </div>
  );
}
