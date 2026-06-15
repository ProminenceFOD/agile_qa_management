import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Play, Eye, Edit3, Search, Filter, TrendingUp, Plus, FilterX } from 'lucide-react';
import { TestCaseForm } from './TestCaseForm';
import { TestCaseView } from './TestCaseView';
import { TestCaseExecute } from './TestCaseExecute';
import { BugReportForm } from './BugReportForm';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { useAuth } from '../contexts/AuthContext';
import { Pagination } from './Pagination';
import { getData, setData } from '../utils/supabaseStorage';

type TestStatus = 'Pass' | 'Fail' | 'Blocked' | 'Not Run';
type TestType = 'Functional' | 'Regression' | 'Integration' | 'Smoke' | 'Performance';

interface TestCase {
  id: string;
  title: string;
  description: string;
  type: TestType;
  steps: string[];
  expectedResults: string[];
  status: TestStatus;
  assignedTo?: string;
  linkedStory?: string;
  lastRun?: Date;
  executionTime?: number;
  priority: 'High' | 'Medium' | 'Low';
  moduleId?: string;
  isDraft?: boolean;
}

interface Bug {
  id: string;
  title: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Fixed' | 'Verified' | 'Closed' | 'Reopened';
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
}

interface TestCasesProps {
  highlightedItemId?: string | null;
}

export function TestCases({ highlightedItemId }: TestCasesProps = {}) {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit' | 'execute'>('list');
  const [selectedTest, setSelectedTest] = useState<TestCase | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<TestStatus | 'All'>('All');
  const [filterType, setFilterType] = useState<TestType | 'All'>('All');
  const [filterAssignedTo, setFilterAssignedTo] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTest, setEditingTest] = useState<TestCase | null>(null);
  const [showBugForm, setShowBugForm] = useState(false);
  const [bugPreFillData, setBugPreFillData] = useState<{
    testCase: TestCase;
    notes: string;
  } | null>(null);

  const defaultTestCases: TestCase[] = [
    {
      id: 'TC-001',
      title: 'Login with valid credentials',
      description: 'Verify user can login with correct email and password',
      type: 'Functional',
      steps: [
        'Navigate to login page',
        'Enter valid email: test@example.com',
        'Enter valid password',
        'Click login button',
      ],
      expectedResults: [
        'Login page is displayed',
        'Email field accepts the input',
        'Password field accepts the input and masks it',
        'User is redirected to dashboard',
      ],
      status: 'Pass',
      assignedTo: 'Damilola Ogunlade',
      linkedStory: 'US-101',
      lastRun: new Date('2026-04-25'),
      executionTime: 45,
      priority: 'High',
    },
    {
      id: 'TC-002',
      title: 'Payment processing with valid card',
      description: 'Verify payment processes successfully',
      type: 'Integration',
      steps: [
        'Add items to cart',
        'Proceed to checkout',
        'Enter valid card details',
        'Submit payment',
      ],
      expectedResults: [
        'Items are added to cart successfully',
        'Checkout page loads with cart items',
        'Card details form accepts valid input',
        'Payment successful, order confirmation shown',
      ],
      status: 'Fail',
      assignedTo: 'Damilola Ogunlade',
      linkedStory: 'US-105',
      lastRun: new Date('2026-04-24'),
      executionTime: 120,
      priority: 'High',
    },
    {
      id: 'TC-003',
      title: 'Dashboard loads within 2 seconds',
      description: 'Performance test for dashboard',
      type: 'Performance',
      steps: [
        'Login as user',
        'Measure dashboard load time',
      ],
      expectedResults: [
        'User successfully logs in',
        'Dashboard loads in under 2 seconds',
      ],
      status: 'Pass',
      assignedTo: 'Linda Thompson',
      linkedStory: 'US-101',
      lastRun: new Date('2026-04-23'),
      executionTime: 30,
      priority: 'Medium',
    },
    {
      id: 'TC-004',
      title: 'Profile update validation',
      description: 'Test profile update with invalid data',
      type: 'Functional',
      steps: [
        'Navigate to profile',
        'Enter invalid email format',
        'Click save',
      ],
      expectedResults: [
        'Profile page loads successfully',
        'Invalid email format is entered',
        'Error message shown, profile not updated',
      ],
      status: 'Not Run',
      assignedTo: 'Michael Brown',
      linkedStory: 'US-105',
      priority: 'Low',
    },
  ];

  // Use Supabase for persistent storage
  const { data: testCasesRaw, setData: setTestCases, loading: testCasesLoading } = useSupabaseData<TestCase[]>('aqms_test_cases', defaultTestCases);
  const { data: bugs, setData: setBugs } = useSupabaseData<Bug[]>('aqms_bugs', []);

  // Ensure all test cases have required arrays (for backwards compatibility)
  const testCases = testCasesRaw.map(tc => ({
    ...tc,
    steps: tc.steps || [],
    expectedResults: tc.expectedResults || [],
  }));

  // Show loading state if data isn't ready
  if (testCasesLoading || !testCases) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <div className="skeleton skeleton-title mb-2"></div>
          <div className="skeleton skeleton-text w-1/3"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          {[...Array(6)].map((_, i) => (
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

  const getStatusColor = (status: TestStatus) => {
    switch (status) {
      case 'Pass':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Fail':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Blocked':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Not Run':
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getTypeColor = (type: TestType) => {
    switch (type) {
      case 'Functional':
        return 'bg-indigo-100 text-indigo-800';
      case 'Regression':
        return 'bg-purple-100 text-purple-800';
      case 'Integration':
        return 'bg-indigo-100 text-indigo-800';
      case 'Smoke':
        return 'bg-gray-100 text-gray-800';
      case 'Performance':
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const allAssignedTesters = Array.from(new Set(testCases.map(t => t.assignedTo).filter(Boolean))) as string[];

  const filteredTests = testCases.filter(test => {
    const matchesSearch = searchQuery === '' ||
      test.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'All' || test.status === filterStatus;
    const matchesType = filterType === 'All' || test.type === filterType;
    const matchesAssignedTo = filterAssignedTo === 'All' || test.assignedTo === filterAssignedTo;
    return matchesSearch && matchesStatus && matchesType && matchesAssignedTo;
  });

  // Natural sort test cases by ID (active TC-XXX first, then draft REC-TC-XXX, all naturally ordered)
  const sortedTests = [...filteredTests].sort((a, b) => {
    const chunkify = (str: string) => {
      const chunks: (string | number)[] = [];
      const regex = /(\d+)|(\D+)/g;
      let match;
      while ((match = regex.exec(str)) !== null) {
        if (match[1] !== undefined) {
          chunks.push(parseInt(match[1], 10));
        } else {
          chunks.push(match[2]);
        }
      }
      return chunks;
    };

    const isDraftA = a.isDraft || a.id.startsWith('REC-');
    const isDraftB = b.isDraft || b.id.startsWith('REC-');
    if (isDraftA !== isDraftB) {
      return isDraftA ? 1 : -1;
    }

    const chunksA = chunkify(a.id);
    const chunksB = chunkify(b.id);

    const minLength = Math.min(chunksA.length, chunksB.length);
    for (let i = 0; i < minLength; i++) {
      const chunkA = chunksA[i];
      const chunkB = chunksB[i];

      if (typeof chunkA === 'number' && typeof chunkB === 'number') {
        if (chunkA !== chunkB) {
          return chunkA - chunkB;
        }
      } else {
        const strA = String(chunkA);
        const strB = String(chunkB);
        if (strA !== strB) {
          return strA.localeCompare(strB);
        }
      }
    }
    return chunksA.length - chunksB.length;
  });

  // Calculate pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTests = sortedTests.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus, filterType, filterAssignedTo]);

  // Listen for quick create trigger
  useEffect(() => {
    const quickCreate = localStorage.getItem('aqms_quick_create');
    if (quickCreate === 'test') {
      setShowCreateForm(true);
      localStorage.removeItem('aqms_quick_create');
    }
  }, []);

  // Auto-deduplicate and migrate legacy test case IDs on load
  useEffect(() => {
    if (testCasesRaw && testCasesRaw.length > 0) {
      let hasChange = false;
      const idMigrations = new Map<string, string>();
      const seenContents = new Set<string>();
      const filteredList: TestCase[] = [];

      // 1. Remove exact duplicate test cases (same title, description, steps, expectedResults)
      testCasesRaw.forEach(tc => {
        const stepsStr = (tc.steps || []).join('|');
        const expectedStr = (tc.expectedResults || []).join('|');
        const signature = `${tc.title}::${tc.description}::${stepsStr}::${expectedStr}`;

        if (seenContents.has(signature)) {
          hasChange = true;
          console.log(`[Deduplicate] Removing exact duplicate test case: ${tc.id} (${tc.title})`);
          return; // Skip/discard
        }

        seenContents.add(signature);
        filteredList.push(tc);
      });

      // 2. Identify legacy IDs (e.g. containing timestamps or not matching standard sequential formats)
      // Standard sequential format: TC-XXX or REC-TC-XXX where XXX is a 1-5 digit number.
      const isLegacyId = (id: string) => {
        const match = id.match(/^(?:REC-)?TC-(\d+)$/);
        if (!match) return true; // Doesn't match sequential format at all
        const num = parseInt(match[1], 10);
        return num >= 1000; // Too large (timestamp or bloated IDs from loops)
      };

      const seenIds = new Set<string>();

      // Single pass: Migrate legacy IDs and resolve clashes
      const updatedList = filteredList.map(tc => {
        let currentId = tc.id;
        let idChanged = false;
        const isDraft = tc.isDraft || tc.status === 'Draft' || currentId.startsWith('REC-');

        // If it is a legacy ID, migrate it to a sequential ID
        if (isLegacyId(currentId)) {
          // Find next available sequential number
          const existingNumbers = [...seenIds]
            .map(id => {
              const match = id.match(/^(?:REC-)?TC-(\d+)$/);
              return match ? parseInt(match[1], 10) : 0;
            })
            .filter(n => n > 0 && n < 1000);
          
          // Also check all remaining clean IDs in filteredList so we don't collide with them!
          const remainingNumbers = filteredList
            .map(x => x.id)
            .filter(id => !isLegacyId(id))
            .map(id => {
              const match = id.match(/^(?:REC-)?TC-(\d+)$/);
              return match ? parseInt(match[1], 10) : 0;
            })
            .filter(n => n > 0 && n < 1000);

          const allNumbers = [...existingNumbers, ...remainingNumbers];
          const nextNum = allNumbers.length > 0 ? Math.max(...allNumbers) + 1 : 1;
          const newId = isDraft
            ? `REC-TC-${String(nextNum).padStart(3, '0')}`
            : `TC-${String(nextNum).padStart(3, '0')}`;
          
          console.log(`[Migrate] Converting legacy test case ID ${currentId} to sequential ${newId}`);
          idMigrations.set(currentId, newId);
          currentId = newId;
          idChanged = true;
          hasChange = true;
        }

        // If it clashes with an already seen ID, rename it
        if (seenIds.has(currentId)) {
          const existingNumbers = [...seenIds]
            .map(id => {
              const match = id.match(/^(?:REC-)?TC-(\d+)$/);
              return match ? parseInt(match[1], 10) : 0;
            })
            .filter(n => n > 0 && n < 1000);

          // Also check all remaining clean IDs in filteredList
          const remainingNumbers = filteredList
            .map(x => x.id)
            .filter(id => !isLegacyId(id))
            .map(id => {
              const match = id.match(/^(?:REC-)?TC-(\d+)$/);
              return match ? parseInt(match[1], 10) : 0;
            })
            .filter(n => n > 0 && n < 1000);

          const allNumbers = [...existingNumbers, ...remainingNumbers];
          const nextNum = allNumbers.length > 0 ? Math.max(...allNumbers) + 1 : 1;
          const newId = isDraft
            ? `REC-TC-${String(nextNum).padStart(3, '0')}`
            : `TC-${String(nextNum).padStart(3, '0')}`;
          
          console.log(`[Deduplicate] Renaming clashing test case ID ${currentId} to ${newId}`);
          if (idChanged) {
            // Update the mapping to the final ID if it was also legacy
            for (const [key, val] of idMigrations.entries()) {
              if (val === currentId) {
                idMigrations.set(key, newId);
              }
            }
          } else {
            idMigrations.set(tc.id, newId);
          }
          currentId = newId;
          hasChange = true;
        }

        seenIds.add(currentId);
        return {
          ...tc,
          id: currentId,
          isDraft: isDraft,
          status: tc.status === 'Draft' ? 'Not Run' : tc.status
        };
      });

      if (hasChange) {
        setTestCases(updatedList);

        // If legacy IDs were migrated, update execution history references as well
        if (idMigrations.size > 0) {
          getData('aqms_test_execution_history').then(executions => {
            if (executions && Array.isArray(executions)) {
              let execChanged = false;
              const updatedExecutions = executions.map(ex => {
                if (idMigrations.has(ex.testCaseId)) {
                  execChanged = true;
                  const newId = idMigrations.get(ex.testCaseId)!;
                  console.log(`[Migrate] Updating execution history reference: ${ex.testCaseId} -> ${newId}`);
                  return { ...ex, testCaseId: newId };
                }
                return ex;
              });

              if (execChanged) {
                setData('aqms_test_execution_history', updatedExecutions);
              }
            }
          });
        }
      }
    }
  }, [testCasesRaw, setTestCases]);

  const stats = {
    total: testCases.filter(t => !t.isDraft).length,
    pass: testCases.filter(t => !t.isDraft && t.status === 'Pass').length,
    fail: testCases.filter(t => !t.isDraft && t.status === 'Fail').length,
    blocked: testCases.filter(t => !t.isDraft && t.status === 'Blocked').length,
    notRun: testCases.filter(t => !t.isDraft && t.status === 'Not Run').length,
  };

  const passRate = (stats.total - stats.notRun) > 0 ? ((stats.pass / (stats.total - stats.notRun)) * 100).toFixed(1) : 0;

  const handleCreateTestCase = (testCase: Omit<TestCase, 'id' | 'lastRun' | 'executionTime'>) => {
    const existingNumbers = testCases
      .map(tc => {
        const match = tc.id.match(/^(?:REC-)?TC-(\d+)$/);
        return match ? parseInt(match[1]) : 0;
      })
      .filter(n => n > 0 && n < 1000000);

    const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
    const finalId = `TC-${String(nextNumber).padStart(3, '0')}`;

    const newTestCase: TestCase = {
      ...testCase,
      id: finalId,
    };
    setTestCases([...testCases, newTestCase]);
    setShowCreateForm(false);
    toast.success(`Test case ${newTestCase.id} has been created successfully!`);
  };

  const handleEditTestCase = (testCase: Omit<TestCase, 'id' | 'lastRun' | 'executionTime'>) => {
    if (editingTest) {
      let finalId = editingTest.id;
      let finalIsDraft = testCase.isDraft;

      if (editingTest.isDraft && finalIsDraft === false) {
        const existingNumbers = testCases
          .filter(tc => !tc.isDraft)
          .map(tc => {
            const match = tc.id.match(/^(?:REC-)?TC-(\d+)$/);
            return match ? parseInt(match[1]) : 0;
          })
          .filter(n => n > 0 && n < 1000000);

        const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
        finalId = `TC-${String(nextNumber).padStart(3, '0')}`;
      }

      const updatedTestCase: TestCase = {
        ...testCase,
        id: finalId,
        isDraft: finalIsDraft,
        lastRun: editingTest.lastRun,
        executionTime: editingTest.executionTime,
      };

      setTestCases(testCases.map(tc => tc.id === editingTest.id ? updatedTestCase : tc));
      setEditingTest(null);

      if (editingTest.isDraft && finalIsDraft === false) {
        toast.success(`Test case approved and assigned ID ${finalId}`);
      } else {
        toast.success(`Test case ${updatedTestCase.id} has been updated successfully!`);
      }
    }
  };

  const handleApproveTestCase = (draftTestCase: TestCase) => {
    const existingNumbers = testCases
      .filter(tc => !tc.isDraft)
      .map(tc => {
        const match = tc.id.match(/^(?:REC-)?TC-(\d+)$/);
        return match ? parseInt(match[1]) : 0;
      })
      .filter(n => n > 0 && n < 1000000);

    const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
    const finalId = `TC-${String(nextNumber).padStart(3, '0')}`;

    const approvedTestCase: TestCase = {
      ...draftTestCase,
      id: finalId,
      isDraft: false,
      status: 'Not Run',
    };

    setTestCases(testCases.map(tc => tc.id === draftTestCase.id ? approvedTestCase : tc));
    toast.success(`Test case approved and assigned ID ${finalId}`);
  };

  const handleRejectTestCase = (draftId: string) => {
    setTestCases(testCases.filter(tc => tc.id !== draftId));
    toast.success('AI suggestion discarded');
  };

  const handleApproveAllDrafts = () => {
    const drafts = testCases.filter(tc => tc.isDraft);
    if (drafts.length === 0) return;

    const existingNumbers = testCases
      .filter(tc => !tc.isDraft)
      .map(tc => {
        const match = tc.id.match(/^(?:REC-)?TC-(\d+)$/);
        return match ? parseInt(match[1]) : 0;
      })
      .filter(n => n > 0 && n < 1000000);

    let nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;

    const updatedTestCases = testCases.map(tc => {
      if (tc.isDraft) {
        const finalId = `TC-${String(nextNumber).padStart(3, '0')}`;
        nextNumber++;
        return {
          ...tc,
          id: finalId,
          isDraft: false,
          status: 'Not Run' as TestStatus,
        };
      }
      return tc;
    });

    setTestCases(updatedTestCases);
    toast.success(`Approved all ${drafts.length} suggested test cases!`);
  };

  const handleViewTest = (test: TestCase) => {
    setSelectedTest(test);
    setViewMode('execute');
  };

  const handleExecuteTest = (result: TestStatus, notes?: string) => {
    if (selectedTest) {
      if (selectedTest.isDraft) {
        toast.error("Cannot execute a draft test case. Please approve it first.");
        return;
      }
      const updatedTest: TestCase = {
        ...selectedTest,
        status: result,
        lastRun: new Date(),
        executionTime: Math.floor(Math.random() * 120) + 30, // Random execution time for demo
      };
      setTestCases(testCases.map(tc => tc.id === selectedTest.id ? updatedTest : tc));
      setViewMode('list');
      setSelectedTest(null);
    }
  };

  const handleCreateBugFromTest = (testCase: TestCase, notes: string) => {
    // Store the pre-fill data and show the bug form
    setBugPreFillData({ testCase, notes });
    setShowBugForm(true);
    // Keep the execute view open until bug is created
  };

  const handleBugSubmit = (bug: Omit<Bug, 'id' | 'createdAt'>) => {
    const newBug: Bug = {
      ...bug,
      id: `BUG-${String((bugs || []).length + 1).padStart(3, '0')}`,
      createdAt: new Date(),
    };

    if (bugs) {
      setBugs([...bugs, newBug]);
    }

    // Close the bug form
    setShowBugForm(false);
    setBugPreFillData(null);

    // Show success message
    toast.success(`Bug ${newBug.id} has been created and linked to test case ${bugPreFillData?.testCase.id}`);

    // Update the test to mark it as failed (if not already done)
    if (selectedTest) {
      const updatedTest: TestCase = {
        ...selectedTest,
        status: 'Fail',
        lastRun: new Date(),
        executionTime: Math.floor(Math.random() * 120) + 30,
      };
      setTestCases(testCases.map(tc => tc.id === selectedTest.id ? updatedTest : tc));
    }

    // Close the execute view
    setViewMode('list');
    setSelectedTest(null);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Test Cases Management</h1>
          <p className="text-gray-600">Organize and execute test cases</p>
        </div>
        <div className="flex gap-3">
          {testCases.some(tc => tc.isDraft) && (
            <button
              onClick={handleApproveAllDrafts}
              className="px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
            >
              ✓ Approve All Suggestions ({testCases.filter(tc => tc.isDraft).length})
            </button>
          )}
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl hover:from-green-700 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Test Case
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        <div className="card fade-in p-4">
          <div className="text-2xl font-bold text-gray-900 mb-1">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Tests</div>
        </div>
        <div className="card fade-in p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <div className="text-2xl font-bold text-green-700 mb-1">{stats.pass}</div>
          <div className="text-sm text-green-600">Passed</div>
        </div>
        <div className="card fade-in p-4 bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
          <div className="text-2xl font-bold text-red-700 mb-1">{stats.fail}</div>
          <div className="text-sm text-red-600">Failed</div>
        </div>
        <div className="card fade-in p-4 bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
          <div className="text-2xl font-bold text-orange-700 mb-1">{stats.blocked}</div>
          <div className="text-sm text-orange-600">Blocked</div>
        </div>
        <div className="card fade-in p-4 bg-gray-50">
          <div className="text-2xl font-bold text-gray-700 mb-1">{stats.notRun}</div>
          <div className="text-sm text-gray-600">Not Run</div>
        </div>
        <div className="card fade-in p-4 bg-gradient-to-br from-indigo-50 to-indigo-50 border-indigo-200">
          <div className="text-2xl font-bold text-indigo-700 mb-1 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            {passRate}%
          </div>
          <div className="text-sm text-indigo-600">Pass Rate</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 card p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search test cases..."
              className="input"
            />
          </div>
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="input"
            >
              <option value="All">All Statuses</option>
              <option value="Pass">Pass</option>
              <option value="Fail">Fail</option>
              <option value="Blocked">Blocked</option>
              <option value="Not Run">Not Run</option>
            </select>
          </div>
          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="input"
            >
              <option value="All">All Types</option>
              <option value="Functional">Functional</option>
              <option value="Regression">Regression</option>
              <option value="Integration">Integration</option>
              <option value="Smoke">Smoke</option>
              <option value="Performance">Performance</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="relative">
            <select
              value={filterAssignedTo}
              onChange={(e) => setFilterAssignedTo(e.target.value)}
              className="input"
            >
              <option value="All">All Assigned Testers</option>
              {allAssignedTesters.map(tester => (
                <option key={tester} value={tester}>{tester}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
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
              setFilterStatus('All');
              setFilterType('All');
              setFilterAssignedTo('All');
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-800 border border-indigo-300 dark:border-indigo-600 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
          >
            <FilterX className="w-4 h-4" />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Test Cases Table */}
      <div className="card overflow-auto max-h-[600px] custom-scrollbar">
        <table className="table-modern w-full">
          <thead>
            <tr>
              <th>Test ID</th>
              <th>Title</th>
              <th className="text-center">Type</th>
              <th className="text-center">Priority</th>
              <th className="text-center">Status</th>
              <th className="text-center">Assigned</th>
              <th className="text-center">Story</th>
              <th className="text-center">Last Run</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTests.map((test) => {
              const isHighlighted = highlightedItemId === test.id;
              const rowClassName = isHighlighted
                ? 'bg-indigo-100 dark:bg-indigo-900 ring-2 ring-indigo-500 animate-pulse'
                : test.isDraft
                ? 'bg-purple-50/30 dark:bg-purple-950/10 border-l-4 border-purple-500/70'
                : '';
              return (
              <tr
                key={test.id}
                className={rowClassName}
              >
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{test.id}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{test.title}</td>
                <td className="text-center">
                  <span className={`badge ${getTypeColor(test.type)}`}>
                    {test.type}
                  </span>
                </td>
                <td className="text-center">
                  <span className={`badge ${test.priority === 'High' ? 'badge-error' : test.priority === 'Medium' ? 'badge-warning' : 'badge-neutral'}`}>
                    {test.priority}
                  </span>
                </td>
                <td className="text-center">
                  <span className={`badge ${test.isDraft ? 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/40 dark:text-purple-200' : getStatusColor(test.status)}`}>
                    {test.isDraft ? 'AI Sug.' : test.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-xs text-gray-600">
                  {test.assignedTo ? test.assignedTo.split(' ').map(n => n[0]).join('') : '-'}
                </td>
                <td className="px-4 py-3 text-center text-sm text-indigo-600">
                  {test.linkedStory || '-'}
                </td>
                <td className="px-4 py-3 text-center text-xs text-gray-600">
                  {test.lastRun ? new Date(test.lastRun).toLocaleDateString() : '-'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-center gap-2">
                    {test.isDraft ? (
                      <>
                        <button
                          onClick={() => handleApproveTestCase(test)}
                          className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-750 transition-colors text-xs font-medium flex items-center gap-1"
                          title="Approve & save test case"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => {
                            setSelectedTest(test);
                            setViewMode('view');
                          }}
                          className="px-3 py-1.5 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors text-xs font-medium flex items-center gap-1"
                          title="View details"
                        >
                          <Eye className="w-3 h-3" />
                          View
                        </button>
                        <button
                          onClick={() => handleRejectTestCase(test.id)}
                          className="px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-650 transition-colors text-xs font-medium flex items-center gap-1"
                          title="Reject suggestion"
                        >
                          ✕ Reject
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setSelectedTest(test);
                            setViewMode('execute');
                          }}
                          className="px-3 py-1.5 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-xs font-medium flex items-center gap-1"
                          title="Execute test case"
                        >
                          <Play className="w-3 h-3" />
                          Run
                        </button>
                        <button
                          onClick={() => {
                            setSelectedTest(test);
                            setViewMode('view');
                          }}
                          className="px-3 py-1.5 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors text-xs font-medium flex items-center gap-1"
                          title="View details"
                        >
                          <Eye className="w-3 h-3" />
                          View
                        </button>
                        <button
                          onClick={() => setEditingTest(test)}
                          className="px-3 py-1.5 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-xs font-medium flex items-center gap-1"
                          title="Edit test case"
                        >
                          <Edit3 className="w-3 h-3" />
                          Edit
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
            })}
          </tbody>
        </table>

        <Pagination
          currentPage={currentPage}
          totalItems={filteredTests.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>

      {/* View Test Case */}
      {viewMode === 'view' && selectedTest && (
        <TestCaseView
          testCase={selectedTest}
          onClose={() => {
            setViewMode('list');
            setSelectedTest(null);
          }}
          onExecute={() => setViewMode('execute')}
          onEdit={() => {
            setEditingTest(selectedTest);
            setViewMode('list');
            setSelectedTest(null);
          }}
          onApprove={() => {
            handleApproveTestCase(selectedTest);
            setViewMode('list');
            setSelectedTest(null);
          }}
          onReject={() => {
            handleRejectTestCase(selectedTest.id);
            setViewMode('list');
            setSelectedTest(null);
          }}
        />
      )}

      {/* Execute Test Case */}
      {viewMode === 'execute' && selectedTest && (
        <TestCaseExecute
          testCase={selectedTest}
          onClose={() => {
            setViewMode('list');
            setSelectedTest(null);
          }}
          onComplete={handleExecuteTest}
          onCreateBug={handleCreateBugFromTest}
        />
      )}

      {/* Create Test Case Form */}
      {showCreateForm && (
        <TestCaseForm
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleCreateTestCase}
        />
      )}

      {/* Edit Test Case Form */}
      {editingTest && (
        <TestCaseForm
          onClose={() => setEditingTest(null)}
          onSubmit={handleEditTestCase}
          testCase={editingTest}
        />
      )}

      {/* Create Bug from Failed Test */}
      {showBugForm && bugPreFillData && user && (
        <div className="fixed inset-0 z-[60]">
          <BugReportFormWithPreFill
            onClose={() => {
              setShowBugForm(false);
              setBugPreFillData(null);
            }}
            onSubmit={handleBugSubmit}
            currentUser={user.name}
            preFillData={{
              title: `Failed Test: ${bugPreFillData.testCase.title}`,
              description: `This bug was created from failed test case ${bugPreFillData.testCase.id}.\n\nTest Description: ${bugPreFillData.testCase.description}\n\nTest Notes: ${bugPreFillData.notes || 'No additional notes'}`,
              linkedStory: bugPreFillData.testCase.linkedStory || '',
              severity: 'High' as const,
              steps: bugPreFillData.testCase.steps,
              expectedBehavior: bugPreFillData.testCase.expectedResults.join('\n'),
              actualBehavior: 'Test failed. See test notes for details.',
            }}
          />
        </div>
      )}
    </div>
  );
}

// Wrapper component for BugReportForm with pre-filled data
function BugReportFormWithPreFill({
  onClose,
  onSubmit,
  currentUser,
  preFillData,
}: {
  onClose: () => void;
  onSubmit: (bug: any) => void;
  currentUser: string;
  preFillData: {
    title: string;
    description: string;
    linkedStory: string;
    severity: 'Critical' | 'High' | 'Medium' | 'Low';
    steps: string[];
    expectedBehavior: string;
    actualBehavior: string;
  };
}) {
  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[60]" onClick={onClose}></div>
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800 rounded-t-lg flex-shrink-0">
            <div>
              <h2 className="text-2xl text-gray-900 dark:text-white mb-1">Create Bug from Failed Test</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pre-filled with test case information</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl flex-shrink-0"
            >
              ×
            </button>
          </div>
          <BugReportFormContent
            onClose={onClose}
            onSubmit={onSubmit}
            currentUser={currentUser}
            initialData={preFillData}
          />
        </div>
      </div>
    </>
  );
}

// Helper component to pass initial data to the form
function BugReportFormContent({
  onClose,
  onSubmit,
  currentUser,
  initialData,
}: {
  onClose: () => void;
  onSubmit: (bug: any) => void;
  currentUser: string;
  initialData: any;
}) {
  const [formData, setFormData] = useState({
    title: initialData.title,
    description: initialData.description,
    severity: initialData.severity,
    linkedStory: initialData.linkedStory,
    assignedTo: '',
    assignedDeveloper: '',
    assignedTester: currentUser,
    expectedBehavior: initialData.expectedBehavior,
    actualBehavior: initialData.actualBehavior,
    environment: 'Testing',
  });

  const [steps, setSteps] = useState<string[]>(initialData.steps);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const bug = {
      ...formData,
      foundBy: currentUser,
      status: 'Open' as const,
      steps,
    };

    onSubmit(bug);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
      <div className="p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
        <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 rounded-lg p-4">
          <p className="text-sm text-indigo-800 dark:text-indigo-200">
            <strong>Note:</strong> This form has been pre-filled with information from the failed test case.
            You can edit any field before submitting.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Bug Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 bg-white dark:bg-gray-750 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={5}
            className="w-full px-3 py-2 bg-white dark:bg-gray-750 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Severity <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.severity}
              onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
              className="w-full px-3 py-2 bg-white dark:bg-gray-750 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Linked Story
            </label>
            <input
              type="text"
              value={formData.linkedStory}
              onChange={(e) => setFormData({ ...formData, linkedStory: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-gray-750 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="US-XXX"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Steps to Reproduce <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {steps.map((step, index) => (
              <div key={index} className="flex gap-2">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </span>
                <input
                  type="text"
                  value={step}
                  onChange={(e) => {
                    const newSteps = [...steps];
                    newSteps[index] = e.target.value;
                    setSteps(newSteps);
                  }}
                  className="flex-1 px-3 py-2 bg-white dark:bg-gray-750 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Expected Behavior <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.expectedBehavior}
            onChange={(e) => setFormData({ ...formData, expectedBehavior: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 bg-white dark:bg-gray-750 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Actual Behavior <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.actualBehavior}
            onChange={(e) => setFormData({ ...formData, actualBehavior: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 bg-white dark:bg-gray-750 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Assign Developer
            </label>
            <select
              value={formData.assignedDeveloper}
              onChange={(e) => setFormData({ ...formData, assignedDeveloper: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-gray-750 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Unassigned</option>
              <option value="James Anderson">James Anderson</option>
              <option value="David Martinez">David Martinez</option>
              <option value="Robert Taylor">Robert Taylor</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Environment
            </label>
            <select
              value={formData.environment}
              onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-gray-750 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Development">Development</option>
              <option value="Testing">Testing</option>
              <option value="Staging">Staging</option>
              <option value="Production">Production</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 bg-white dark:bg-gray-800 rounded-b-lg flex-shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
        >
          Create Bug
        </button>
      </div>
    </form>
  );
}
