import { useState } from 'react';
import { Download, BarChart3, Calendar } from 'lucide-react';
import { useSupabaseData } from '../hooks/useSupabaseData';

interface Story {
  id: string;
  title: string;
  acceptanceCriteria?: boolean;
  qaSignOff?: boolean;
  pmApproval?: boolean;
}

interface Bug {
  id: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  createdAt: Date;
  resolvedAt?: Date;
}

interface TestCase {
  id: string;
  status: 'Pass' | 'Fail' | 'Blocked' | 'Not Run';
  linkedStory?: string;
}

export function Reports() {
  const [activeReport, setActiveReport] = useState<'coverage' | 'defects' | 'velocity'>('coverage');
  const [dateRange, setDateRange] = useState<'7days' | '30days' | '90days' | 'custom'>('30days');
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Load data from Supabase
  const { data: stories } = useSupabaseData<Story[]>('aqms_stories', []);
  const { data: bugs } = useSupabaseData<Bug[]>('aqms_bugs', []);
  const { data: testCases } = useSupabaseData<TestCase[]>('aqms_test_cases', []);

  // Test Coverage Metrics
  const totalStories = stories.length;
  const storiesWithTests = stories.filter(s =>
    testCases.some(tc => tc.linkedStory === s.id)
  ).length;
  const coveragePercentage = totalStories > 0 ? Math.round((storiesWithTests / totalStories) * 100) : 0;
  const totalTestCases = testCases.length;

  // Defect Metrics
  const totalBugs = bugs.length;
  const openBugs = bugs.filter(b => b.status === 'Open' || b.status === 'In Progress').length;
  const criticalBugs = bugs.filter(b => b.severity === 'Critical' && b.status !== 'Closed').length;
  const resolvedBugs = bugs.filter(b => b.status === 'Resolved' || b.status === 'Closed');
  const avgResolutionTime = resolvedBugs.length > 0
    ? Math.round(
        resolvedBugs.reduce((sum, bug) => {
          if (bug.resolvedAt) {
            const resolvedDate = new Date(bug.resolvedAt);
            const createdDate = new Date(bug.createdAt);
            const days = Math.abs(resolvedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
            return sum + days;
          }
          return sum;
        }, 0) / resolvedBugs.length
      )
    : 0;

  const handleExportReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      dateRange: dateRange === 'custom' ? `${customStartDate} to ${customEndDate}` : dateRange,
      coverage: {
        totalStories,
        storiesWithTests,
        coveragePercentage,
        totalTestCases,
      },
      defects: {
        totalBugs,
        openBugs,
        criticalBugs,
        avgResolutionTime,
      },
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aqms-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Reports & Analytics</h1>
          <p className="text-gray-600">Comprehensive quality metrics and insights</p>
        </div>
        <button
          onClick={handleExportReport}
          className="btn btn-primary btn-lg bg-gradient-to-r from-indigo-600 to-indigo-600 hover:from-indigo-700 hover:to-indigo-700 shadow-lg hover:shadow-xl hover:scale-105 transition-all"
        >
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Report Type Tabs */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setActiveReport('coverage')}
          className={`btn ${
            activeReport === 'coverage' ? 'btn-primary' : 'btn-secondary'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Test Coverage
        </button>
        <button
          onClick={() => setActiveReport('defects')}
          className={`btn ${
            activeReport === 'defects' ? 'btn-primary' : 'btn-secondary'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Defect Metrics
        </button>
        <button
          onClick={() => setActiveReport('velocity')}
          className={`btn ${
            activeReport === 'velocity' ? 'btn-primary' : 'btn-secondary'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Sprint Velocity
        </button>
      </div>

      {/* Date Range Selector */}
      <div className="mb-6">
        <div className="flex gap-2 mb-3">
          {(['7days', '30days', '90days'] as const).map(range => (
            <button
              key={range}
              onClick={() => {
                setDateRange(range);
                setShowCustomDatePicker(false);
              }}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                dateRange === range
                  ? 'bg-green-500 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {range === '7days' ? 'Last 7 Days' : range === '30days' ? 'Last 30 Days' : 'Last 90 Days'}
            </button>
          ))}
          <button
            onClick={() => {
              setDateRange('custom');
              setShowCustomDatePicker(!showCustomDatePicker);
            }}
            className={`px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
              dateRange === 'custom'
                ? 'bg-green-500 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Custom Range
          </button>
        </div>

        {/* Custom Date Range Picker */}
        {showCustomDatePicker && (
          <div className="bg-white border border-gray-300 rounded-lg p-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700 font-medium">From:</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700 font-medium">To:</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            {customStartDate && customEndDate && (
              <span className="text-sm text-gray-600">
                ({Math.ceil((new Date(customEndDate).getTime() - new Date(customStartDate).getTime()) / (1000 * 60 * 60 * 24))} days)
              </span>
            )}
          </div>
        )}
      </div>

      {/* Test Coverage Report */}
      {activeReport === 'coverage' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-sm text-gray-600 mb-1">Total Stories</div>
              <div className="text-3xl mb-1">{totalStories}</div>
            </div>
            <div className="bg-green-50 rounded-lg shadow-sm border border-green-200 p-6">
              <div className="text-sm text-gray-600 mb-1">Stories with Tests</div>
              <div className="text-3xl text-green-600 mb-1">{storiesWithTests}</div>
            </div>
            <div className="bg-indigo-50 rounded-lg shadow-sm border border-indigo-200 p-6">
              <div className="text-sm text-gray-600 mb-1">Coverage</div>
              <div className="text-3xl text-indigo-600 mb-1">{coveragePercentage}%</div>
            </div>
            <div className="bg-purple-50 rounded-lg shadow-sm border border-purple-200 p-6">
              <div className="text-sm text-gray-600 mb-1">Total Test Cases</div>
              <div className="text-3xl text-purple-600 mb-1">{totalTestCases}</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg text-gray-800 mb-4">Test Coverage by Story</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-gray-700">Story ID</th>
                    <th className="px-6 py-3 text-left text-gray-700">Title</th>
                    <th className="px-6 py-3 text-center text-gray-700">Test Cases</th>
                    <th className="px-6 py-3 text-center text-gray-700">Coverage Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stories.map(story => {
                    const linkedTestCount = testCases.filter(tc => tc.linkedStory === story.id).length;
                    return (
                      <tr key={story.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{story.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{story.title}</td>
                        <td className="px-6 py-4 text-center text-sm">{linkedTestCount}</td>
                        <td className="px-6 py-4 text-center">
                          {linkedTestCount > 0 ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs">
                              ✓ Covered
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs">
                              ✗ Not Covered
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Defect Metrics Report */}
      {activeReport === 'defects' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-sm text-gray-600 mb-1">Total Bugs</div>
              <div className="text-3xl mb-1">{totalBugs}</div>
            </div>
            <div className="bg-red-50 rounded-lg shadow-sm border border-red-200 p-6">
              <div className="text-sm text-gray-600 mb-1">Open Bugs</div>
              <div className="text-3xl text-red-600 mb-1">{openBugs}</div>
            </div>
            <div className="bg-orange-50 rounded-lg shadow-sm border border-orange-200 p-6">
              <div className="text-sm text-gray-600 mb-1">Critical Bugs</div>
              <div className="text-3xl text-orange-600 mb-1">{criticalBugs}</div>
            </div>
            <div className="bg-indigo-50 rounded-lg shadow-sm border border-indigo-200 p-6">
              <div className="text-sm text-gray-600 mb-1">Avg Resolution</div>
              <div className="text-3xl text-indigo-600 mb-1">{avgResolutionTime}d</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg text-gray-800 mb-4">Bugs by Severity</h3>
              <div className="space-y-3">
                {(['Critical', 'High', 'Medium', 'Low'] as const).map(severity => {
                  const count = bugs.filter(b => b.severity === severity).length;
                  const percentage = totalBugs > 0 ? Math.round((count / totalBugs) * 100) : 0;
                  return (
                    <div key={severity}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700">{severity}</span>
                        <span className="text-sm text-gray-600">{count} ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            severity === 'Critical' ? 'bg-red-500' :
                            severity === 'High' ? 'bg-orange-500' :
                            severity === 'Medium' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg text-gray-800 mb-4">Bugs by Status</h3>
              <div className="space-y-3">
                {(['Open', 'In Progress', 'Resolved', 'Closed'] as const).map(status => {
                  const count = bugs.filter(b => b.status === status).length;
                  const percentage = totalBugs > 0 ? Math.round((count / totalBugs) * 100) : 0;
                  return (
                    <div key={status}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700">{status}</span>
                        <span className="text-sm text-gray-600">{count} ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            status === 'Open' ? 'bg-red-500' :
                            status === 'In Progress' ? 'bg-yellow-500' :
                            status === 'Resolved' ? 'bg-indigo-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Sprint Velocity Report */}
      {activeReport === 'velocity' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg text-gray-800 mb-4">Sprint Velocity Trends</h3>
          <div className="space-y-6">
            {[
              { sprint: 'Sprint 12', planned: 39, completed: 16, velocity: 41 },
              { sprint: 'Sprint 11', planned: 35, completed: 30, velocity: 86 },
              { sprint: 'Sprint 10', planned: 40, completed: 38, velocity: 95 },
            ].map(data => (
              <div key={data.sprint} className="border-b border-gray-200 pb-4 last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{data.sprint}</span>
                  <span className="text-sm text-gray-600">Velocity: {data.velocity}%</span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div className="text-sm text-gray-600">
                    Planned: <span className="font-medium text-gray-900">{data.planned} points</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Completed: <span className="font-medium text-gray-900">{data.completed} points</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${
                      data.velocity >= 80 ? 'bg-green-500' :
                      data.velocity >= 60 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(data.velocity, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
