import { useState, useMemo } from 'react';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { Eye, X, ArrowRight } from 'lucide-react';
import { defaultStories, defaultTestCases, defaultBugs, Story, TestCase, Bug } from '../utils/defaultData';

type ViewMode = 'matrix' | 'coverage' | 'gaps';

interface TraceabilityMatrixProps {
  onNavigate?: (tab: string, itemId?: string) => void;
}

export function TraceabilityMatrix({ onNavigate }: TraceabilityMatrixProps = {}) {
  const [viewMode, setViewMode] = useState<ViewMode>('matrix');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const { data: stories } = useSupabaseData<Story[]>('aqms_stories', defaultStories);
  const { data: testCases } = useSupabaseData<TestCase[]>('aqms_test_cases', defaultTestCases);
  const { data: bugs } = useSupabaseData<Bug[]>('aqms_bugs', defaultBugs);

  const traceabilityData = useMemo(() => {
    return stories.map(story => {
      const linkedTests = testCases.filter(tc => tc.linkedStory === story.id && !tc.isDraft);
      const linkedBugs = bugs.filter(bug => bug.linkedStory === story.id);

      const totalTests = linkedTests.length;
      const passedTests = linkedTests.filter(tc => tc.status === 'Pass').length;
      const failedTests = linkedTests.filter(tc => tc.status === 'Fail').length;
      const blockedTests = linkedTests.filter(tc => tc.status === 'Blocked').length;

      const criticalBugs = linkedBugs.filter(b => b.severity === 'Critical' && b.status !== 'Resolved').length;
      const activeBugs = linkedBugs.filter(b => b.status !== 'Resolved' && b.status !== 'Closed').length;

      const coverageScore = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
      const hasGaps = totalTests === 0 || failedTests > 0 || blockedTests > 0 || criticalBugs > 0;

      return {
        story,
        linkedTests,
        linkedBugs,
        metrics: {
          totalTests,
          passedTests,
          failedTests,
          blockedTests,
          activeBugs,
          criticalBugs,
          coverageScore,
          hasGaps,
        },
      };
    });
  }, [stories, testCases, bugs]);

  const filteredData = useMemo(() => {
    let data = traceabilityData;

    if (filterStatus !== 'all') {
      if (filterStatus === 'with-gaps') {
        data = data.filter(item => item.metrics.hasGaps);
      } else if (filterStatus === 'no-tests') {
        data = data.filter(item => item.metrics.totalTests === 0);
      } else if (filterStatus === 'failing-tests') {
        data = data.filter(item => item.metrics.failedTests > 0);
      } else if (filterStatus === 'with-bugs') {
        data = data.filter(item => item.metrics.activeBugs > 0);
      }
    }

    if (searchTerm) {
      data = data.filter(item =>
        item.story.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.story.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return data;
  }, [traceabilityData, filterStatus, searchTerm]);

  const overallMetrics = useMemo(() => {
    const totalStories = stories.length;
    const storiesWithTests = traceabilityData.filter(item => item.metrics.totalTests > 0).length;
    const storiesWithGaps = traceabilityData.filter(item => item.metrics.hasGaps).length;
    const storiesFullyCovered = traceabilityData.filter(
      item => item.metrics.totalTests > 0 && item.metrics.coverageScore === 100
    ).length;
    const totalActiveTestCases = testCases.filter(tc => !tc.isDraft);
    const totalBugs = bugs.length;

    // Calculate actual executed test pass rate (passed / executed tests)
    const passedTestsCount = totalActiveTestCases.filter(tc => tc.status === 'Pass').length;
    const notRunTestsCount = totalActiveTestCases.filter(tc => tc.status === 'Not Run').length;
    const executedTestsCount = totalActiveTestCases.length - notRunTestsCount;
    
    const avgPassRate = executedTestsCount > 0
      ? Math.round((passedTestsCount / executedTestsCount) * 100)
      : 0;

    return {
      totalStories,
      storiesWithTests,
      storiesWithGaps,
      storiesFullyCovered,
      totalTestCases: totalActiveTestCases.length,
      totalBugs,
      avgCoverage: avgPassRate, // Using execution-based pass rate
      testCoverageRate: totalStories > 0 ? Math.round((storiesWithTests / totalStories) * 100) : 0,
    };
  }, [traceabilityData, stories, testCases, bugs]);

  const getCoverageColor = (score: number) => {
    if (score === 100) return 'bg-green-500';
    if (score >= 75) return 'bg-indigo-500';
    if (score >= 50) return 'bg-yellow-500';
    if (score > 0) return 'bg-orange-500';
    return 'bg-gray-300';
  };

  const getStatusColor = (hasGaps: boolean) => {
    return hasGaps ? 'bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-300' : 'bg-green-100 text-green-800 dark:bg-green-950/20 dark:text-green-300';
  };

  const getDistributionColorStyles = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-green-50 border-green-200 dark:bg-green-950/10 dark:border-green-900/50';
      case 'blue':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-950/10 dark:border-blue-900/50';
      case 'yellow':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/10 dark:border-yellow-900/50';
      case 'orange':
        return 'bg-orange-50 border-orange-200 dark:bg-orange-950/10 dark:border-orange-900/50';
      case 'red':
        return 'bg-red-50 border-red-200 dark:bg-red-950/10 dark:border-red-900/50';
      default:
        return 'bg-gray-50 border-gray-200 dark:bg-gray-900/50 dark:border-gray-800';
    }
  };

  const getDistributionTextColorStyles = (color: string) => {
    switch (color) {
      case 'green': return 'text-green-700 dark:text-green-400';
      case 'blue': return 'text-blue-700 dark:text-blue-400';
      case 'yellow': return 'text-yellow-700 dark:text-yellow-400';
      case 'orange': return 'text-orange-700 dark:text-orange-400';
      case 'red': return 'text-red-700 dark:text-red-400';
      default: return 'text-gray-700 dark:text-gray-400';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl mb-2 text-gray-900 dark:text-white">Requirements Traceability Matrix</h1>
        <p className="text-gray-650 dark:text-gray-400">End-to-end coverage from requirements to tests to defects</p>
      </div>

      {/* View Mode Tabs */}
      <div className="mb-6 flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {[
          { id: 'matrix', label: 'Traceability Matrix' },
          { id: 'coverage', label: 'Coverage Analysis' },
          { id: 'gaps', label: 'Coverage Gaps' },
        ].map(view => (
          <button
            key={view.id}
            onClick={() => setViewMode(view.id as ViewMode)}
            className={`px-4 py-2 border-b-2 transition-colors font-medium ${
              viewMode === view.id
                ? 'border-indigo-500 text-indigo-650 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            {view.label}
          </button>
        ))}
      </div>

      {/* Overall Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/50 rounded-lg p-4">
          <div className="text-2xl font-bold mb-1 text-indigo-700 dark:text-indigo-400">{overallMetrics.testCoverageRate}%</div>
          <div className="text-gray-650 dark:text-gray-400 text-sm">Stories with Test Coverage</div>
          <div className="text-xs text-indigo-655 dark:text-indigo-400/80 mt-1">
            {overallMetrics.storiesWithTests}/{overallMetrics.totalStories} Stories
          </div>
        </div>
        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50 rounded-lg p-4">
          <div className="text-2xl font-bold mb-1 text-green-700 dark:text-green-400">{overallMetrics.avgCoverage}%</div>
          <div className="text-gray-650 dark:text-gray-400 text-sm">Avg Test Pass Rate</div>
          <div className="text-xs text-green-655 dark:text-green-400/80 mt-1">
            {overallMetrics.storiesFullyCovered} Fully Covered
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-lg p-4">
          <div className="text-2xl font-bold mb-1 text-red-700 dark:text-red-400">{overallMetrics.storiesWithGaps}</div>
          <div className="text-gray-650 dark:text-gray-400 text-sm">Coverage Gaps</div>
          <div className="text-xs text-red-655 dark:text-red-400/80 mt-1">
            Require attention
          </div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50 rounded-lg p-4">
          <div className="text-2xl font-bold mb-1 text-purple-700 dark:text-purple-400">{overallMetrics.totalTestCases}</div>
          <div className="text-gray-650 dark:text-gray-400 text-sm">Total Test Cases</div>
          <div className="text-xs text-purple-655 dark:text-purple-400/80 mt-1">
            {overallMetrics.totalBugs} Bugs Tracked
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 flex gap-4 items-center flex-wrap">
        <input
          type="text"
          placeholder="Search stories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg flex-1 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Stories</option>
          <option value="with-gaps">With Coverage Gaps</option>
          <option value="no-tests">No Test Cases</option>
          <option value="failing-tests">Failing Tests</option>
          <option value="with-bugs">With Active Bugs</option>
        </select>
      </div>

      {/* Traceability Matrix View */}
      {viewMode === 'matrix' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-gray-700 dark:text-gray-300 font-semibold w-32">Story ID</th>
                  <th className="px-6 py-4 text-left text-gray-700 dark:text-gray-300 font-semibold">Story Title</th>
                  <th className="px-6 py-4 text-center text-gray-700 dark:text-gray-300 font-semibold">Test Cases</th>
                  <th className="px-6 py-4 text-center text-gray-700 dark:text-gray-300 font-semibold">Pass Rate</th>
                  <th className="px-6 py-4 text-center text-gray-700 dark:text-gray-300 font-semibold">Bugs</th>
                  <th className="px-6 py-4 text-center text-gray-700 dark:text-gray-300 font-semibold">Coverage Status</th>
                  <th className="px-6 py-4 text-center text-gray-700 dark:text-gray-300 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredData.map(item => (
                  <tr key={item.story.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900 dark:text-white">{item.story.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900 dark:text-white font-medium">{item.story.title}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Status: {item.story.status} |
                        QA: {item.story.qaSignOff ? '✓' : '✗'} |
                        PM: {item.story.pmApproval ? '✓' : '✗'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm text-gray-900 dark:text-white font-medium">{item.metrics.totalTests} total</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {item.metrics.passedTests}P / {item.metrics.failedTests}F / {item.metrics.blockedTests}B
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getCoverageColor(item.metrics.coverageScore)}`}
                            style={{ width: `${item.metrics.coverageScore}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{item.metrics.coverageScore}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div>
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${
                          item.metrics.activeBugs > 0 ? 'bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-300' : 'bg-green-100 text-green-800 dark:bg-green-950/20 dark:text-green-300'
                        }`}>
                          {item.metrics.activeBugs} Active
                        </span>
                      </div>
                      {item.metrics.criticalBugs > 0 && (
                        <div className="text-xs text-red-650 dark:text-red-400 font-semibold mt-1">
                          {item.metrics.criticalBugs} Critical
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.metrics.hasGaps)}`}>
                        {item.metrics.hasGaps ? 'Has Gaps' : 'Complete'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="btn btn-primary btn-sm flex items-center justify-center gap-1 mx-auto"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Coverage Analysis View */}
      {viewMode === 'coverage' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Coverage Distribution</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[
                { label: '100% Covered', count: traceabilityData.filter(i => i.metrics.coverageScore === 100).length, color: 'green' },
                { label: '75-99% Covered', count: traceabilityData.filter(i => i.metrics.coverageScore >= 75 && i.metrics.coverageScore < 100).length, color: 'blue' },
                { label: '50-74% Covered', count: traceabilityData.filter(i => i.metrics.coverageScore >= 50 && i.metrics.coverageScore < 75).length, color: 'yellow' },
                { label: '1-49% Covered', count: traceabilityData.filter(i => i.metrics.coverageScore > 0 && i.metrics.coverageScore < 50).length, color: 'orange' },
                { label: 'No Coverage', count: traceabilityData.filter(i => i.metrics.coverageScore === 0).length, color: 'red' },
              ].map(item => (
                <div key={item.label} className={`border rounded-lg p-4 transition-all duration-200 hover:shadow-sm ${getDistributionColorStyles(item.color)}`}>
                  <div className={`text-3xl font-bold mb-1 ${getDistributionTextColorStyles(item.color)}`}>{item.count}</div>
                  <div className="text-sm text-gray-650 dark:text-gray-300 font-medium">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Test Type Distribution</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {['Functional', 'Regression', 'Integration', 'Smoke', 'Performance'].map(type => {
                const count = testCases.filter(tc => tc.type === type).length;
                return (
                  <div key={type} className="bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="text-2xl font-bold mb-1 text-gray-900 dark:text-white">{count}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">{type}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {testCases.length > 0 ? Math.round((count / testCases.length) * 100) : 0}% of total
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/50 rounded-lg p-4">
            <h4 className="text-indigo-900 dark:text-indigo-300 font-semibold mb-2 flex items-center gap-1.5">📊 Coverage Insights</h4>
            <ul className="text-sm text-indigo-950 dark:text-indigo-400 space-y-2 list-none pl-0">
              <li>
                • <strong>{overallMetrics.storiesWithTests}</strong> out of <strong>{overallMetrics.totalStories}</strong> stories have test coverage ({overallMetrics.testCoverageRate}%)
              </li>
              <li>
                • <strong>{traceabilityData.filter(i => i.metrics.totalTests === 0).length}</strong> stories have zero test cases - priority for test creation
              </li>
              <li>
                • <strong>{traceabilityData.filter(i => i.metrics.failedTests > 0).length}</strong> stories have failing tests - require immediate attention
              </li>
              <li>
                • Average <strong>{testCases.length > 0 ? (testCases.length / Math.max(overallMetrics.storiesWithTests, 1)).toFixed(1) : 0}</strong> test cases per story
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Coverage Gaps View */}
      {viewMode === 'gaps' && (
        <div className="space-y-4">
          <div className="bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500 p-4 rounded-r-lg">
            <h3 className="text-red-800 dark:text-red-400 font-semibold mb-1">Coverage Gaps Requiring Attention</h3>
            <p className="text-sm text-red-750 dark:text-red-300">
              {traceabilityData.filter(i => i.metrics.hasGaps).length} stories have coverage gaps that need to be addressed
            </p>
          </div>

          {traceabilityData.filter(i => i.metrics.hasGaps).map(item => (
            <div key={item.story.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{item.story.id}: {item.story.title}</h4>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Status: {item.story.status}</div>
                </div>
                <span className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-350 rounded-full text-xs font-semibold">
                  Gap Detected
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded p-3">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Test Coverage</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {item.metrics.totalTests} tests ({item.metrics.coverageScore}% pass rate)
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded p-3">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Failed/Blocked Tests</div>
                  <div className="text-lg font-semibold text-red-650 dark:text-red-400">
                    {item.metrics.failedTests + item.metrics.blockedTests} issues
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded p-3">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Active Bugs</div>
                  <div className="text-lg font-semibold text-red-650 dark:text-red-400">
                    {item.metrics.activeBugs} ({item.metrics.criticalBugs} critical)
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-950/15 border border-yellow-250 dark:border-yellow-900/30 rounded p-3">
                <div className="font-semibold text-yellow-800 dark:text-yellow-400 mb-2">Recommendations:</div>
                <ul className="text-sm text-yellow-950 dark:text-yellow-400/90 space-y-1 list-none pl-0">
                  {item.metrics.totalTests === 0 && (
                    <li>⚠️ No test cases linked - create comprehensive test coverage</li>
                  )}
                  {item.metrics.failedTests > 0 && (
                    <li>❌ {item.metrics.failedTests} failing tests - investigate and resolve failures</li>
                  )}
                  {item.metrics.blockedTests > 0 && (
                    <li>🚫 {item.metrics.blockedTests} blocked tests - remove blockers to continue testing</li>
                  )}
                  {item.metrics.criticalBugs > 0 && (
                    <li>🐛 {item.metrics.criticalBugs} critical bugs - prioritize bug resolution before release</li>
                  )}
                  {item.metrics.activeBugs > 0 && item.metrics.criticalBugs === 0 && (
                    <li>🐛 {item.metrics.activeBugs} active bugs - address before final sign-off</li>
                  )}
                </ul>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setSelectedItem(item)}
                  className="btn btn-secondary btn-sm flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Details
                </button>
              </div>
            </div>
          ))}

          {traceabilityData.filter(i => i.metrics.hasGaps).length === 0 && (
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50 rounded-lg p-8 text-center">
              <span className="text-5xl mb-3 block">✅</span>
              <h3 className="text-xl text-gray-900 dark:text-white font-semibold mb-2">No Coverage Gaps Detected!</h3>
              <p className="text-gray-655 dark:text-gray-400">
                All stories have adequate test coverage with no failing tests or critical bugs.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Story Detailed Overlay Modal */}
      {selectedItem && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-[60] transition-opacity duration-200"
            onClick={() => setSelectedItem(null)}
          ></div>
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-250 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 flex-shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg text-indigo-600 dark:text-indigo-400">{selectedItem.story.id}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      selectedItem.story.priority === 'Critical' ? 'bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-300' :
                      selectedItem.story.priority === 'High' ? 'bg-orange-100 text-orange-800 dark:bg-orange-950/30 dark:text-orange-300' :
                      selectedItem.story.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-300' :
                      'bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-300'
                    }`}>
                      {selectedItem.story.priority}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">| {selectedItem.story.sprint || 'No Sprint'}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-1">{selectedItem.story.title}</h3>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-1 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Close details"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
                {/* Description */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Description</h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm bg-gray-50 dark:bg-gray-900/30 p-4 rounded-lg border border-gray-100 dark:border-gray-800">
                    {selectedItem.story.description || 'No description provided.'}
                  </p>
                </div>

                {/* Acceptance Criteria */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Acceptance Criteria</h4>
                  <div className="text-gray-750 dark:text-gray-300 leading-relaxed text-sm bg-gray-50 dark:bg-gray-900/30 p-4 rounded-lg border border-gray-100 dark:border-gray-800 whitespace-pre-line font-mono">
                    {selectedItem.story.criteriaDetails || 'No acceptance criteria details defined.'}
                  </div>
                </div>

                {/* Sign-offs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-semibold uppercase tracking-wider">Status</div>
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">{selectedItem.story.status}</div>
                  </div>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-semibold uppercase tracking-wider">QA Sign-Off</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`w-2 h-2 rounded-full ${selectedItem.story.qaSignOff ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <span className="font-semibold text-sm text-gray-900 dark:text-white">
                        {selectedItem.story.qaSignOff ? '✓ Signed Off' : '✗ Pending'}
                      </span>
                    </div>
                  </div>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-semibold uppercase tracking-wider">PM Approval</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`w-2 h-2 rounded-full ${selectedItem.story.pmApproval ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <span className="font-semibold text-sm text-gray-900 dark:text-white">
                        {selectedItem.story.pmApproval ? '✓ Approved' : '✗ Pending'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Linked Test Cases */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Linked Test Cases ({selectedItem.linkedTests.length})
                  </h4>
                  {selectedItem.linkedTests.length > 0 ? (
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-900/35 border-b border-gray-200 dark:border-gray-700 text-left text-gray-650 dark:text-gray-300">
                          <tr>
                            <th className="px-4 py-2 font-semibold">Test ID</th>
                            <th className="px-4 py-2 font-semibold">Title</th>
                            <th className="px-4 py-2 font-semibold">Type</th>
                            <th className="px-4 py-2 font-semibold text-center">Execution</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-150 dark:divide-gray-750">
                          {selectedItem.linkedTests.map((tc: TestCase) => (
                            <tr key={tc.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/10">
                              <td className="px-4 py-2 font-semibold text-gray-900 dark:text-white">{tc.id}</td>
                              <td className="px-4 py-2 text-gray-750 dark:text-gray-300 font-medium">{tc.title}</td>
                              <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{tc.type}</td>
                              <td className="px-4 py-2 text-center">
                                <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${
                                  tc.status === 'Pass' ? 'bg-green-100 text-green-800 dark:bg-green-950/20 dark:text-green-300' :
                                  tc.status === 'Fail' ? 'bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-300 animate-pulse' :
                                  tc.status === 'Blocked' ? 'bg-orange-100 text-orange-800 dark:bg-orange-950/20 dark:text-orange-300' :
                                  'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                                }`}>
                                  {tc.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="bg-orange-50 dark:bg-orange-950/15 border border-orange-200 dark:border-orange-900/30 rounded-lg p-4 text-sm text-orange-850 dark:text-orange-400 flex items-center gap-2">
                      <span>⚠️</span>
                      <span>No test cases linked to this story. We recommend creating test coverages before dev sign-off.</span>
                    </div>
                  )}
                </div>

                {/* Linked Defects */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Linked Defects ({selectedItem.linkedBugs.length})
                  </h4>
                  {selectedItem.linkedBugs.length > 0 ? (
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-900/35 border-b border-gray-200 dark:border-gray-700 text-left text-gray-650 dark:text-gray-300">
                          <tr>
                            <th className="px-4 py-2 font-semibold">Bug ID</th>
                            <th className="px-4 py-2 font-semibold">Title</th>
                            <th className="px-4 py-2 font-semibold">Severity</th>
                            <th className="px-4 py-2 font-semibold">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-150 dark:divide-gray-750">
                          {selectedItem.linkedBugs.map((bug: Bug) => (
                            <tr key={bug.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/10">
                              <td className="px-4 py-2 font-semibold text-gray-900 dark:text-white">{bug.id}</td>
                              <td className="px-4 py-2 text-gray-750 dark:text-gray-300 font-medium">{bug.title}</td>
                              <td className="px-4 py-2">
                                <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${
                                  bug.severity === 'Critical' ? 'bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-300' :
                                  bug.severity === 'High' ? 'bg-orange-100 text-orange-800 dark:bg-orange-950/20 dark:text-orange-300' :
                                  bug.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/20 dark:text-yellow-300' :
                                  'bg-green-100 text-green-800 dark:bg-green-950/20 dark:text-green-300'
                                }`}>
                                  {bug.severity}
                                </span>
                              </td>
                              <td className="px-4 py-2">
                                <span className="text-gray-700 dark:text-gray-300 font-medium">{bug.status}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="bg-green-50 dark:bg-green-950/15 border border-green-200 dark:border-green-900/30 rounded-lg p-4 text-sm text-green-850 dark:text-green-400 flex items-center gap-2">
                      <span>✅</span>
                      <span>No defects linked to this story. Quality standards fully satisfied.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-250 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-900/50 flex-shrink-0">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-gray-150 dark:bg-gray-700 rounded-lg hover:bg-gray-250 dark:hover:bg-gray-650 transition-colors font-medium text-sm"
                >
                  Close
                </button>
                {onNavigate && (
                  <button
                    onClick={() => {
                      onNavigate('validator', selectedItem.story.id);
                      setSelectedItem(null);
                    }}
                    className="px-6 py-2 text-white bg-indigo-500 rounded-lg hover:bg-indigo-650 transition-colors font-medium text-sm flex items-center gap-1.5"
                  >
                    Go to Validator
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
