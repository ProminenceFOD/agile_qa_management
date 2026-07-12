import { useState } from 'react';
import { useSupabaseData } from '../hooks/useSupabaseData';

type TestStatus = 'Pass' | 'Fail' | 'Blocked' | 'Not Run';

interface TestExecution {
  id: string;
  testCaseId: string;
  testCaseTitle: string;
  status: TestStatus;
  executedBy: string;
  executedAt: Date;
  duration?: number; // in seconds
  notes?: string;
  bugsFound?: string[]; // Bug IDs found during this execution
}

export function TestExecutionHistory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | TestStatus>('All');
  const [filterTestCase, setFilterTestCase] = useState<string>('All');

  const defaultExecutions: TestExecution[] = [
    {
      id: 'EXEC-001',
      testCaseId: 'TC-001',
      testCaseTitle: 'Login with valid credentials',
      status: 'Pass',
      executedBy: 'Damilola Ogunlade',
      executedAt: new Date('2026-04-26T10:30:00'),
      duration: 45,
      notes: 'All steps passed successfully',
    },
    {
      id: 'EXEC-002',
      testCaseId: 'TC-002',
      testCaseTitle: 'Add item to cart',
      status: 'Fail',
      executedBy: 'Emily Chen',
      executedAt: new Date('2026-04-26T11:15:00'),
      duration: 120,
      notes: 'Cart total calculation incorrect',
      bugsFound: ['BUG-015'],
    },
    {
      id: 'EXEC-003',
      testCaseId: 'TC-003',
      testCaseTitle: 'Checkout process',
      status: 'Blocked',
      executedBy: 'Linda Thompson',
      executedAt: new Date('2026-04-26T14:00:00'),
      duration: 30,
      notes: 'Payment gateway unavailable',
    },
    {
      id: 'EXEC-004',
      testCaseId: 'TC-001',
      testCaseTitle: 'Login with valid credentials',
      status: 'Pass',
      executedBy: 'Emily Chen',
      executedAt: new Date('2026-04-25T09:20:00'),
      duration: 42,
    },
    {
      id: 'EXEC-005',
      testCaseId: 'TC-004',
      testCaseTitle: 'User profile update',
      status: 'Pass',
      executedBy: 'Jessica Williams',
      executedAt: new Date('2026-04-25T15:45:00'),
      duration: 90,
    },
    {
      id: 'EXEC-006',
      testCaseId: 'TC-002',
      testCaseTitle: 'Add item to cart',
      status: 'Fail',
      executedBy: 'Damilola Ogunlade',
      executedAt: new Date('2026-04-24T13:30:00'),
      duration: 110,
      notes: 'Same calculation bug',
      bugsFound: ['BUG-015'],
    },
  ];

  // Use Supabase for persistent storage
  const {
    data: executions,
    setData: setExecutions,
    loading: executionsLoading,
  } = useSupabaseData<TestExecution[]>(
    'aqms_test_execution_history',
    defaultExecutions
  );

  // Show loading state if data isn't ready
  if (executionsLoading || !executions) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-purple-500 mb-4"></div>
          <p className="text-gray-600">
            Loading test execution history from database...
          </p>
        </div>
      </div>
    );
  }

  const uniqueTestCases = Array.from(
    new Set(executions.map((e) => e.testCaseId))
  );

  const filteredExecutions = executions.filter((ex) => {
    const matchesSearch =
      searchQuery === '' ||
      ex.testCaseId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.testCaseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.executedBy.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'All' || ex.status === filterStatus;
    const matchesTestCase =
      filterTestCase === 'All' || ex.testCaseId === filterTestCase;

    return matchesSearch && matchesStatus && matchesTestCase;
  });

  const getStatusColor = (status: TestStatus) => {
    switch (status) {
      case 'Pass':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'Fail':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'Blocked':
        return 'bg-orange-100 text-orange-800 border border-orange-200';
      case 'Not Run':
        return 'bg-gray-100 text-gray-600 border border-gray-200';
    }
  };

  const totalExecutions = executions.length;
  const passRate =
    executions.length > 0
      ? Math.round(
          (executions.filter((e) => e.status === 'Pass').length /
            executions.length) *
            100
        )
      : 0;
  const avgDuration =
    executions.filter((e) => e.duration).length > 0
      ? Math.round(
          executions
            .filter((e) => e.duration)
            .reduce((sum, e) => sum + (e.duration || 0), 0) /
            executions.filter((e) => e.duration).length
        )
      : 0;

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl mb-2">Test Execution History</h1>
        <p className="text-gray-600">
          Complete history of all test case executions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Total Executions</div>
          <div className="text-2xl">{totalExecutions}</div>
        </div>
        <div className="bg-green-50 rounded-lg shadow-sm border border-green-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Pass Rate</div>
          <div className="text-2xl text-green-600">{passRate}%</div>
        </div>
        <div className="bg-indigo-50 rounded-lg shadow-sm border border-indigo-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Avg Duration</div>
          <div className="text-2xl text-indigo-600">{avgDuration}s</div>
        </div>
        <div className="bg-red-50 rounded-lg shadow-sm border border-red-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Bugs Found</div>
          <div className="text-2xl text-red-600">
            {
              Array.from(new Set(executions.flatMap((e) => e.bugsFound || [])))
                .length
            }
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by test case or executor..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Test Case
            </label>
            <select
              value={filterTestCase}
              onChange={(e) => setFilterTestCase(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="All">All Test Cases</option>
              {uniqueTestCases.map((tcId) => (
                <option key={tcId} value={tcId}>
                  {tcId}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value as 'All' | TestStatus)
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="All">All Statuses</option>
              <option value="Pass">Pass</option>
              <option value="Fail">Fail</option>
              <option value="Blocked">Blocked</option>
              <option value="Not Run">Not Run</option>
            </select>
          </div>
        </div>
      </div>

      {/* Execution History Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-gray-700">
                  Execution ID
                </th>
                <th className="px-6 py-3 text-left text-gray-700">Test Case</th>
                <th className="px-6 py-3 text-center text-gray-700">Status</th>
                <th className="px-6 py-3 text-left text-gray-700">
                  Executed By
                </th>
                <th className="px-6 py-3 text-left text-gray-700">
                  Executed At
                </th>
                <th className="px-6 py-3 text-center text-gray-700">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-gray-700">Notes</th>
                <th className="px-6 py-3 text-center text-gray-700">Bugs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredExecutions.map((ex) => (
                <tr key={ex.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                    {ex.id}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {ex.testCaseId}
                    </div>
                    <div className="text-sm text-gray-500">
                      {ex.testCaseTitle}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded text-xs ${getStatusColor(ex.status)}`}
                    >
                      {ex.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {ex.executedBy}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(ex.executedAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700">
                    {ex.duration ? `${ex.duration}s` : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                    {ex.notes || '-'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {ex.bugsFound && ex.bugsFound.length > 0 ? (
                      <div className="flex flex-wrap gap-1 justify-center">
                        {ex.bugsFound.map((bugId) => (
                          <span
                            key={bugId}
                            className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs"
                          >
                            {bugId}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredExecutions.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No execution history found matching your search criteria
          </div>
        )}
      </div>
    </div>
  );
}
