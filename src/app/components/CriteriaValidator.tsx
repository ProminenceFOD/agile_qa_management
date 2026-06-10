import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Eye, Edit3, Trash2, Plus, Search, Filter, FileText, Lock, CheckCircle, FilterX } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { StoryForm } from './StoryForm';
import { StoryView } from './StoryView';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { Pagination } from './Pagination';
import { Modal } from './Modal';

type Priority = 'Critical' | 'High' | 'Medium' | 'Low';

interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: Date;
}

interface ActivityLog {
  id: string;
  action: string;
  user: string;
  timestamp: Date;
}

interface Story {
  id: string;
  title: string;
  description: string;
  acceptanceCriteria: boolean;
  qaSignOff: boolean;
  pmApproval: boolean;
  criteriaDetails: string;
  assignedQAReviewer?: string;
  assignedDeveloper?: string;
  assignedTester?: string;
  priority: Priority;
  storyPoints?: number;
  sprint?: string;
  dependencies?: string[];
  comments?: Comment[];
  activityLog?: ActivityLog[];
  createdAt: Date;
  updatedAt: Date;
}

type ViewMode = 'list' | 'view' | 'create' | 'edit';

interface CriteriaValidatorProps {
  highlightedItemId?: string | null;
  onNavigate?: (tab: string, itemId?: string) => void;
}

export function CriteriaValidator({ highlightedItemId, onNavigate }: CriteriaValidatorProps) {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<Priority | 'All'>('All');
  const [filterSprint, setFilterSprint] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Ready' | 'Locked'>('All');
  const [filterAssignedDeveloper, setFilterAssignedDeveloper] = useState<string>('All');
  const [filterAssignedTester, setFilterAssignedTester] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingStoryId, setDeletingStoryId] = useState<string | null>(null);

  const defaultStories: Story[] = [
    {
      id: 'US-101',
      title: 'User Authentication - Login Flow',
      description: 'As a user, I want to securely log into the system using my email and password.',
      acceptanceCriteria: true,
      qaSignOff: true,
      pmApproval: true,
      criteriaDetails: 'Given a valid user account\nWhen I enter correct credentials\nThen I should be redirected to the dashboard\nAnd my session should be maintained',
      assignedQAReviewer: 'Damilola Ogunlade (Head of QA)',
      assignedDeveloper: 'James Martinez',
      assignedTester: 'Damilola Ogunlade',
      priority: 'Critical',
      storyPoints: 8,
      sprint: 'Sprint 12',
      dependencies: [],
      comments: [],
      activityLog: [],
      createdAt: new Date('2026-04-15'),
      updatedAt: new Date('2026-04-20'),
    },
    {
      id: 'US-102',
      title: 'Payment Gateway Integration',
      description: 'As a user, I want to make payments through Stripe for my purchases.',
      acceptanceCriteria: true,
      qaSignOff: false,
      pmApproval: true,
      criteriaDetails: 'Given I have items in cart\nWhen I proceed to checkout\nThen I should see Stripe payment form\nAnd payment should process securely',
      assignedQAReviewer: 'Damilola Ogunlade (Head of QA)',
      assignedDeveloper: '',
      assignedTester: '',
      priority: 'Critical',
      storyPoints: 13,
      sprint: 'Sprint 12',
      dependencies: [],
      comments: [],
      activityLog: [],
      createdAt: new Date('2026-04-16'),
      updatedAt: new Date('2026-04-22'),
    },
    {
      id: 'US-103',
      title: 'Dashboard Analytics Widget',
      description: 'As an admin, I want to view real-time analytics on my dashboard.',
      acceptanceCriteria: true,
      qaSignOff: true,
      pmApproval: false,
      criteriaDetails: 'Given I am logged in as admin\nWhen I access the dashboard\nThen I should see analytics widgets\nAnd data should update in real-time',
      assignedQAReviewer: 'Damilola Ogunlade (Head of QA)',
      assignedDeveloper: '',
      priority: 'High',
      storyPoints: 5,
      sprint: 'Sprint 12',
      dependencies: ['US-101'],
      comments: [],
      activityLog: [],
      createdAt: new Date('2026-04-14'),
      updatedAt: new Date('2026-04-21'),
    },
    {
      id: 'US-104',
      title: 'User Profile Update Feature',
      description: 'As a user, I want to update my profile information including name, email, and avatar.',
      acceptanceCriteria: false,
      qaSignOff: false,
      pmApproval: false,
      criteriaDetails: '',
      assignedQAReviewer: '',
      priority: 'Medium',
      storyPoints: 3,
      sprint: 'Sprint 13',
      dependencies: [],
      comments: [],
      activityLog: [],
      createdAt: new Date('2026-04-18'),
      updatedAt: new Date('2026-04-18'),
    },
    {
      id: 'US-105',
      title: 'Email Notification System',
      description: 'As a user, I want to receive email notifications for important account activities.',
      acceptanceCriteria: true,
      qaSignOff: true,
      pmApproval: true,
      criteriaDetails: 'Given an important account event occurs\nWhen the event is triggered\nThen I should receive an email notification\nAnd the email should contain relevant details',
      assignedQAReviewer: 'Damilola Ogunlade (Head of QA)',
      assignedDeveloper: 'Maria Rodriguez',
      assignedTester: 'Linda Thompson',
      priority: 'High',
      storyPoints: 8,
      sprint: 'Sprint 12',
      dependencies: [],
      comments: [],
      activityLog: [],
      createdAt: new Date('2026-04-13'),
      updatedAt: new Date('2026-04-23'),
    },
    {
      id: 'US-106',
      title: 'Search Functionality Enhancement',
      description: 'As a user, I want to improved search with filters and sorting options.',
      acceptanceCriteria: true,
      qaSignOff: false,
      pmApproval: false,
      criteriaDetails: 'Given I am on the search page\nWhen I enter a search query\nThen results should be filtered and sortable\nAnd search should be performant',
      assignedQAReviewer: 'Damilola Ogunlade (Head of QA)',
      assignedDeveloper: '',
      assignedTester: '',
      priority: 'Low',
      storyPoints: 2,
      sprint: 'Sprint 13',
      dependencies: [],
      comments: [],
      activityLog: [],
      createdAt: new Date('2026-04-19'),
      updatedAt: new Date('2026-04-19'),
    },
  ];

  // Use Supabase for persistent storage
  const { data: stories, setData: setStories, loading: storiesLoading } = useSupabaseData<Story[]>('aqms_stories', defaultStories);
  const { data: usersList } = useSupabaseData<any[]>('aqms_users', []);

  // Listen for quick create trigger
  useEffect(() => {
    const quickCreate = localStorage.getItem('aqms_quick_create');
    if (quickCreate === 'story') {
      setViewMode('create');
      setSelectedStory(null);
      localStorage.removeItem('aqms_quick_create');
    }
  }, []);

  // Show loading state immediately if data isn't ready
  if (storiesLoading || !stories) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-500 mb-4"></div>
          <p className="text-gray-600">Loading stories from database...</p>
        </div>
      </div>
    );
  }

  const toggleQASignOff = (id: string) => {
    console.log('[CriteriaValidator] toggleQASignOff called for:', id);
    console.trace('[CriteriaValidator] Call stack:'); // This will show us WHO called this function

    const story = stories.find(s => s.id === id);
    if (!story) return;

    // Don't allow toggle if no QA reviewer is assigned
    if (!story.assignedQAReviewer) {
      console.log('[CriteriaValidator] No QA reviewer assigned, showing alert');
      toast.error('Please assign a QA Reviewer before attempting to sign off.');
      return;
    }

    // Check if current user is the assigned QA reviewer
    const isAssignedReviewer = story.assignedQAReviewer &&
      story.assignedQAReviewer.includes(user?.name || '');

    if (!isAssignedReviewer) {
      toast.error(`Only the assigned QA Reviewer (${story.assignedQAReviewer}) can sign off on this story.`);
      return;
    }

    const newQASignOff = !story.qaSignOff;
    console.log(`[CriteriaValidator] Toggling QA sign-off for ${id}: ${story.qaSignOff} → ${newQASignOff}`);

    // Validate acceptance criteria before allowing sign-off
    if (newQASignOff) {
      if (!story.acceptanceCriteria) {
        toast.error('Cannot sign off: Acceptance Criteria checkbox must be checked');
        return;
      }
      // Strip HTML tags for validation
      const plainText = story.criteriaDetails ? story.criteriaDetails.replace(/<[^>]*>/g, '').trim() : '';
      if (!plainText || plainText.length < 20) {
        toast.error('Cannot sign off: Acceptance Criteria details are missing or incomplete (minimum 20 characters)');
        return;
      }
      // Check for placeholder text
      const lowerCriteria = plainText.toLowerCase();
      if (lowerCriteria.includes('todo') || lowerCriteria.includes('tbd') || lowerCriteria === 'given\nwhen\nthen') {
        toast.error('Cannot sign off: Acceptance Criteria contains placeholder text (TODO/TBD/template only)');
        return;
      }
      // Validate Given/When/Then format is actually filled in
      if (!lowerCriteria.includes('given') || !lowerCriteria.includes('when') || !lowerCriteria.includes('then')) {
        toast.error('Cannot sign off: Acceptance Criteria must follow Given/When/Then format');
        return;
      }
    }

    setStories(stories.map(s => {
      if (s.id === id) {
        // If removing QA sign-off, clear assignments (quality gate enforcement)
        if (!newQASignOff) {
          return { ...s, qaSignOff: newQASignOff, assignedDeveloper: '', assignedTester: '' };
        }
        return { ...s, qaSignOff: newQASignOff };
      }
      return s;
    }));
    if (selectedStory && selectedStory.id === id) {
      const newQASignOff = !selectedStory.qaSignOff;
      setSelectedStory({
        ...selectedStory,
        qaSignOff: newQASignOff,
        assignedDeveloper: !newQASignOff ? '' : selectedStory.assignedDeveloper,
        assignedTester: !newQASignOff ? '' : selectedStory.assignedTester,
      });
    }
  };

  const togglePMApproval = (id: string) => {
    // Check if user has PM sign-off authority
    const storedUsers = usersList || [];
    const currentPM = storedUsers.find((u: any) => u.email === user?.email && u.role === 'Product Manager');

    console.log('[CriteriaValidator] PM Approval attempt:', {
      userId: user?.email,
      userRole: user?.role,
      currentPM: currentPM,
      hasPermission: currentPM?.canSignOffPM,
    });

    if (!currentPM || !currentPM.canSignOffPM) {
      toast.error('You do not have PM approval authority. Only authorized Product Managers can approve stories.');
      return;
    }

    const story = stories.find(s => s.id === id);
    if (!story) return;

    const newPMApproval = !story.pmApproval;
    console.log(`[CriteriaValidator] Toggling PM approval for ${id}: ${story.pmApproval} → ${newPMApproval}`);

    // Validate acceptance criteria before allowing approval
    if (newPMApproval) {
      if (!story.acceptanceCriteria) {
        toast.error('Cannot approve: Acceptance Criteria checkbox must be checked');
        return;
      }
      // Strip HTML tags for validation
      const plainText = story.criteriaDetails ? story.criteriaDetails.replace(/<[^>]*>/g, '').trim() : '';
      if (!plainText || plainText.length < 20) {
        toast.error('Cannot approve: Acceptance Criteria details are missing or incomplete (minimum 20 characters)');
        return;
      }
      // Check for placeholder text
      const lowerCriteria = plainText.toLowerCase();
      if (lowerCriteria.includes('todo') || lowerCriteria.includes('tbd') || lowerCriteria === 'given\nwhen\nthen') {
        toast.error('Cannot approve: Acceptance Criteria contains placeholder text (TODO/TBD/template only)');
        return;
      }
      // Validate Given/When/Then format is actually filled in
      if (!lowerCriteria.includes('given') || !lowerCriteria.includes('when') || !lowerCriteria.includes('then')) {
        toast.error('Cannot approve: Acceptance Criteria must follow Given/When/Then format');
        return;
      }
      // Validate title and description are filled
      if (!story.title || story.title.trim().length < 10) {
        toast.error('Cannot approve: Story title is missing or too short (minimum 10 characters)');
        return;
      }
      if (!story.description || story.description.trim().length < 20) {
        toast.error('Cannot approve: Story description is missing or incomplete (minimum 20 characters)');
        return;
      }
    }

    setStories(stories.map(story => {
      if (story.id === id) {
        const newPMApproval = !story.pmApproval;
        // If removing PM approval, clear assignments (quality gate enforcement)
        if (!newPMApproval) {
          return { ...story, pmApproval: newPMApproval, assignedDeveloper: '', assignedTester: '' };
        }
        return { ...story, pmApproval: newPMApproval };
      }
      return story;
    }));
    if (selectedStory && selectedStory.id === id) {
      const newPMApproval = !selectedStory.pmApproval;
      setSelectedStory({
        ...selectedStory,
        pmApproval: newPMApproval,
        assignedDeveloper: !newPMApproval ? '' : selectedStory.assignedDeveloper,
        assignedTester: !newPMApproval ? '' : selectedStory.assignedTester,
      });
    }
  };

  const handleAssignDeveloper = (developer: string) => {
    if (!selectedStory) return;

    setStories(stories.map(s =>
      s.id === selectedStory.id ? { ...s, assignedDeveloper: developer } : s
    ));
    setSelectedStory({ ...selectedStory, assignedDeveloper: developer });
  };

  const handleAssignTester = (tester: string) => {
    if (!selectedStory) return;

    setStories(stories.map(s =>
      s.id === selectedStory.id ? { ...s, assignedTester: tester } : s
    ));
    setSelectedStory({ ...selectedStory, assignedTester: tester });
  };

  const isReadyForDev = (story: Story) => {
    return story.acceptanceCriteria && story.qaSignOff && story.pmApproval;
  };

  const getRoleMessage = () => {
    const storedUsers = usersList || [];
    const currentUserData = storedUsers.find((u: any) => u.email === user?.email);

    if (user?.role === 'QA Engineer') {
      if (currentUserData?.canSignOffQA) {
        return 'You have QA sign-off authority. You can sign off on stories where you are assigned as the QA Reviewer.';
      }
      return 'You do not have QA sign-off authority. Contact an administrator to grant permissions.';
    } else if (user?.role === 'Product Manager') {
      if (currentUserData?.canSignOffPM) {
        return 'You have PM approval authority. You can approve stories for development.';
      }
      return 'You do not have PM approval authority. Contact an administrator to grant permissions.';
    } else {
      return 'View-only access. Contact QA or PM to update sign-offs.';
    }
  };

  const handleViewStory = (story: Story) => {
    setSelectedStory(story);
    setViewMode('view');
  };

  const handleCreateStory = () => {
    setSelectedStory(null);
    setViewMode('create');
  };

  const handleEditStory = (story?: Story) => {
    if (story) {
      setSelectedStory(story);
    }
    setViewMode('edit');
  };

  const handleSaveStory = (story: Story) => {
    console.log('[CriteriaValidator] handleSaveStory called for:', story.id, {
      qaSignOff: story.qaSignOff,
      pmApproval: story.pmApproval,
      acceptanceCriteria: story.acceptanceCriteria,
      assignedQAReviewer: story.assignedQAReviewer,
    });

    if (viewMode === 'create') {
      const newStories = [...stories, story];
      setStories(newStories);
      // useSupabaseData handles saving automatically
      console.log('[CriteriaValidator] New story created and saved');
      toast.success(`Story ${story.id} created successfully`);
    } else if (viewMode === 'edit') {
      const updatedStories = stories.map(s => (s.id === story.id ? story : s));
      setStories(updatedStories);
      // useSupabaseData handles saving automatically
      console.log('[CriteriaValidator] Story updated and saved');
      toast.success(`Story ${story.id} updated successfully`);
    }

    console.log('[CriteriaValidator] Changing view mode to list');
    setViewMode('list');
    setSelectedStory(null);
  };

  const handleCancel = () => {
    setViewMode('list');
    setSelectedStory(null);
  };

  const handleDeleteStory = (id: string) => {
    setDeletingStoryId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteStory = () => {
    if (deletingStoryId) {
      setStories(stories.filter(s => s.id !== deletingStoryId));
      toast.success('Story deleted successfully');
    }
    setShowDeleteConfirm(false);
    setDeletingStoryId(null);
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'High':
        return 'bg-orange-100 text-orange-800 border border-orange-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'Low':
        return 'bg-green-100 text-green-800 border border-green-200';
    }
  };

  // Filter and search logic
  const filteredStories = stories.filter(story => {
    const matchesSearch = searchQuery === '' ||
      story.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority = filterPriority === 'All' || story.priority === filterPriority;
    const matchesSprint = filterSprint === 'All' || story.sprint === filterSprint;
    const matchesDeveloper = filterAssignedDeveloper === 'All' || story.assignedDeveloper === filterAssignedDeveloper;
    const matchesTester = filterAssignedTester === 'All' || story.assignedTester === filterAssignedTester;

    let matchesStatus = true;
    if (filterStatus === 'Ready') {
      matchesStatus = isReadyForDev(story);
    } else if (filterStatus === 'Locked') {
      matchesStatus = !isReadyForDev(story);
    }

    return matchesSearch && matchesPriority && matchesSprint && matchesStatus && matchesDeveloper && matchesTester;
  });

  const allSprints = Array.from(new Set(stories.map(s => s.sprint).filter(Boolean))) as string[];
  const allDevelopers = Array.from(new Set(stories.map(s => s.assignedDeveloper).filter(Boolean))) as string[];
  const allTesters = Array.from(new Set(stories.map(s => s.assignedTester).filter(Boolean))) as string[];

  // Calculate pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStories = filteredStories.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterPriority, filterSprint, filterStatus, filterAssignedDeveloper, filterAssignedTester]);

  if (viewMode === 'view' && selectedStory) {
    return (
      <StoryView
        story={selectedStory}
        onEdit={() => handleEditStory()}
        onBack={handleCancel}
        onToggleQA={
          user?.role === 'QA Engineer'
            ? () => toggleQASignOff(selectedStory.id)
            : undefined
        }
        onTogglePM={
          user?.role === 'Product Manager'
            ? () => togglePMApproval(selectedStory.id)
            : undefined
        }
        onAssignDeveloper={handleAssignDeveloper}
        onAssignTester={handleAssignTester}
        onNavigate={onNavigate}
      />
    );
  }

  if (viewMode === 'create' || viewMode === 'edit') {
    return (
      <StoryForm
        story={selectedStory || undefined}
        onSave={handleSaveStory}
        onCancel={handleCancel}
        mode={viewMode}
        existingStories={stories}
      />
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl mb-2">Criteria Validator</h1>
          <p className="text-gray-600">Story-by-story quality gate enforcement</p>
          <div className="mt-3 bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-2 text-sm text-indigo-800">
            <strong>{user?.role}:</strong> {getRoleMessage()}
          </div>
        </div>
        <button
          onClick={handleCreateStory}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Story
        </button>
      </div>

      {/* Stats Cards - Moved to top for visibility */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card fade-in p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-green-700 mb-1">{stories.filter(isReadyForDev).length}</div>
              <div className="text-sm text-green-600 font-medium">Ready for Dev</div>
            </div>
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
        </div>
        <div className="card fade-in p-4 bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-red-700 mb-1">{stories.filter(s => !isReadyForDev(s)).length}</div>
              <div className="text-sm text-red-600 font-medium">Locked Stories</div>
            </div>
            <Lock className="w-10 h-10 text-red-600" />
          </div>
        </div>
        <div className="card fade-in p-4 bg-gradient-to-br from-indigo-50 to-indigo-50 border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-indigo-700 mb-1">{stories.length}</div>
              <div className="text-sm text-indigo-600 font-medium">Total Stories</div>
            </div>
            <FileText className="w-10 h-10 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* Quality Gate Enforcement Notice */}
      <div className="mb-6 bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-orange-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-orange-900">Quality Gate Enforcement Active</h3>
            <div className="mt-2 text-sm text-orange-800">
              <p>✅ <strong>Workflow:</strong> Acceptance Criteria → QA Sign-Off → PM Approval → Developer/Tester Assignment → Ready for Dev</p>
              <p className="mt-1">🔒 Stories cannot be assigned to developers or testers until BOTH QA sign-off and PM approval are completed.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 card p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-sm text-gray-700 mb-1">Search</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by ID, title, or description..."
                className="input"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Priority</label>
            <div className="relative">
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as any)}
                className="input"
              >
                <option value="All">All Priorities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Sprint</label>
            <div className="relative">
              <select
                value={filterSprint}
                onChange={(e) => setFilterSprint(e.target.value)}
                className="input"
              >
                <option value="All">All Sprints</option>
                {allSprints.map(sprint => (
                  <option key={sprint} value={sprint}>{sprint}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Status</label>
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="input"
              >
                <option value="All">All</option>
                <option value="Ready">Ready for Dev</option>
                <option value="Locked">Locked</option>
              </select>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Assigned Developer</label>
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
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Assigned Tester</label>
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
              setFilterPriority('All');
              setFilterSprint('All');
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

      <div className="card overflow-auto max-h-[600px] custom-scrollbar">
        <table className="table-modern">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th className="text-center">Priority</th>
              <th className="text-center">Points</th>
              <th className="text-center">Sprint</th>
              <th className="text-center">QA Rev</th>
              <th className="text-center">Dev</th>
              <th className="text-center">Tester</th>
              <th className="text-center">AC</th>
              <th className="text-center">QA Sign</th>
              <th className="text-center">PM</th>
              <th className="text-center">Status</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedStories.map((story) => {
              const ready = isReadyForDev(story);
              const isHighlighted = highlightedItemId === story.id;
              return (
                <tr
                  key={story.id}
                  className={`
                    ${isHighlighted ? 'bg-indigo-100 dark:bg-indigo-900 ring-2 ring-indigo-500 animate-pulse' : ready ? '' : 'bg-red-50'}
                  `}
                >
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-900 text-sm">{story.id}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-700 text-sm">{story.title}</td>
                  <td className="text-center">
                    <span className={`badge ${getPriorityColor(story.priority)}`}>
                      {story.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-700">
                    {story.storyPoints || '-'}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">
                    {story.sprint || '-'}
                  </td>
                  <td className="px-4 py-3 text-center text-xs">
                    {story.assignedQAReviewer ? (
                      <span className="text-purple-700 font-medium" title={story.assignedQAReviewer}>
                        {story.assignedQAReviewer.split(' ').slice(0, 2).map(n => n[0]).join('')}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-xs">
                    {ready ? (
                      story.assignedDeveloper ? (
                        <span className="text-gray-700">{story.assignedDeveloper.split(' ').map(n => n[0]).join('')}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )
                    ) : (
                      <span className="text-red-600" title="Blocked: Requires QA sign-off and PM approval">🔒</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-xs">
                    {ready ? (
                      story.assignedTester ? (
                        <span className="text-gray-700">{story.assignedTester.split(' ').map(n => n[0]).join('')}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )
                    ) : (
                      <span className="text-red-600" title="Blocked: Requires QA sign-off and PM approval">🔒</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {story.acceptanceCriteria ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">
                        ✓
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs">
                        ✗
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {(() => {
                      const isAssignedReviewer = story.assignedQAReviewer &&
                        story.assignedQAReviewer.includes(user?.name || '');
                      const canSignOff = user?.role === 'QA Engineer' && isAssignedReviewer;

                      return (
                        <button
                          onClick={() => toggleQASignOff(story.id)}
                          disabled={!canSignOff}
                          title={!isAssignedReviewer ? `Only ${story.assignedQAReviewer || 'assigned QA reviewer'} can sign off` : ''}
                          className={`inline-flex items-center px-2 py-1 rounded-full transition-colors text-xs ${
                            story.qaSignOff
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          } ${!canSignOff ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {story.qaSignOff ? '✓' : '○'}
                        </button>
                      );
                    })()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {(() => {
                      const storedUsers = usersList || [];
                      const currentPM = storedUsers.find((u: any) => u.email === user?.email && u.role === 'Product Manager');
                      const canApprove = currentPM && currentPM.canSignOffPM;

                      return (
                        <button
                          onClick={() => togglePMApproval(story.id)}
                          disabled={!canApprove}
                          title={!canApprove && user?.role === 'Product Manager' ? 'You do not have PM approval authority' : ''}
                          className={`inline-flex items-center px-2 py-1 rounded-full transition-colors text-xs ${
                            story.pmApproval
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          } ${!canApprove ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {story.pmApproval ? '✓' : '○'}
                        </button>
                      );
                    })()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {ready ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-500 text-white text-xs">
                        ✓ Ready
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-500 text-white text-xs">
                        🔒 Locked
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2 flex-wrap">
                      <button
                        onClick={() => handleViewStory(story)}
                        className="btn btn-primary btn-sm"
                        title="View story details"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </button>
                      <button
                        onClick={() => handleEditStory(story)}
                        className="btn btn-secondary btn-sm"
                        title="Edit story"
                      >
                        <Edit3 className="w-3 h-3" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteStory(story.id)}
                        className="btn btn-danger btn-sm"
                        title="Delete story"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
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
          totalItems={filteredStories.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>

      {/* Delete Story Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeletingStoryId(null);
        }}
        title="Delete Story"
        message="Are you sure you want to delete this story? This action cannot be undone."
        type="danger"
        onConfirm={confirmDeleteStory}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
