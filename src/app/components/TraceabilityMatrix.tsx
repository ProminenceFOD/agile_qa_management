import { useState, useMemo } from 'react';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { Eye } from 'lucide-react';

interface Story {
  id: string;
  title: string;
  acceptanceCriteria?: string[];
  qaSignOff: boolean;
  pmApproval: boolean;
  status: string;
}

interface TestCase {
  id: string;
  title: string;
  linkedStory?: string;
  status: string;
  type: string;
}

interface Bug {
  id: string;
  title: string;
  linkedStory?: string;
  severity: string;
  status: string;
}

type ViewMode = 'matrix' | 'coverage' | 'gaps';

export function TraceabilityMatrix() {
  const [viewMode, setViewMode] = useState<ViewMode>('matrix');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: stories } = useSupabaseData<Story[]>('aqms_stories', []);
  const { data: testCases } = useSupabaseData<TestCase[]>('aqms_test_cases', []);
  const { data: bugs } = useSupabaseData<Bug[]>('aqms_bugs', []);

  const traceabilityData = useMemo(() => {
    return stories.map(story => {
      const linkedTests = testCases.filter(tc => tc.linkedStory === story.id);
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
    const totalTestCases = testCases.length;
    const totalBugs = bugs.length;
    const avgCoverage = totalStories > 0
      ? Math.round(traceabilityData.reduce((sum, item) => sum + item.metrics.coverageScore, 0) / totalStories)
      : 0;

    return {
      totalStories,
      storiesWithTests,
      storiesWithGaps,
      storiesFullyCovered,
      totalTestCases,
      totalBugs,
      avgCoverage,
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
    return hasGaps ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800';
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Requirements Traceability Matrix</h1>
        <p className="text-gray-600">End-to-end coverage from requirements to tests to defects</p>
      </div>

      {/* View Mode Tabs */}
      <div className="mb-6 flex gap-2 border-b border-gray-200">
        {[
          { id: 'matrix', label: 'Traceability Matrix' },
          { id: 'coverage', label: 'Coverage Analysis' },
          { id: 'gaps', label: 'Coverage Gaps' },
        ].map(view => (
          <button
            key={view.id}
            onClick={() => setViewMode(view.id as ViewMode)}
            className={`px-4 py-2 border-b-2 transition-colors ${
              viewMode === view.id
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {view.label}
          </button>
        ))}
      </div>

      {/* Overall Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <div className="text-2xl mb-1">{overallMetrics.testCoverageRate}%</div>
          <div className="text-gray-600 text-sm">Stories with Test Coverage</div>
          <div className="text-xs text-indigo-600 mt-1">
            {overallMetrics.storiesWithTests}/{overallMetrics.totalStories} Stories
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-2xl mb-1">{overallMetrics.avgCoverage}%</div>
          <div className="text-gray-600 text-sm">Avg Test Pass Rate</div>
          <div className="text-xs text-green-600 mt-1">
            {overallMetrics.storiesFullyCovered} Fully Covered
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-2xl mb-1">{overallMetrics.storiesWithGaps}</div>
          <div className="text-gray-600 text-sm">Coverage Gaps</div>
          <div className="text-xs text-red-600 mt-1">
            Require attention
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-2xl mb-1">{overallMetrics.totalTestCases}</div>
          <div className="text-gray-600 text-sm">Total Test Cases</div>
          <div className="text-xs text-purple-600 mt-1">
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
          className="px-4 py-2 border border-gray-300 rounded-lg flex-1 min-w-[200px]"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
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
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-gray-700 w-32">Story ID</th>
                  <th className="px-6 py-4 text-left text-gray-700">Story Title</th>
                  <th className="px-6 py-4 text-center text-gray-700">Test Cases</th>
                  <th className="px-6 py-4 text-center text-gray-700">Pass Rate</th>
                  <th className="px-6 py-4 text-center text-gray-700">Bugs</th>
                  <th className="px-6 py-4 text-center text-gray-700">Coverage Status</th>
                  <th className="px-6 py-4 text-center text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredData.map(item => (
                  <tr key={item.story.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">{item.story.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900">{item.story.title}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Status: {item.story.status} |
                        QA: {item.story.qaSignOff ? '✓' : '✗'} |
                        PM: {item.story.pmApproval ? '✓' : '✗'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm text-gray-900">{item.metrics.totalTests} total</div>
                      <div className="text-xs text-gray-500">
                        {item.metrics.passedTests}P / {item.metrics.failedTests}F / {item.metrics.blockedTests}B
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getCoverageColor(item.metrics.coverageScore)}`}
                            style={{ width: `${item.metrics.coverageScore}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{item.metrics.coverageScore}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div>
                        <span className={`inline-flex px-2 py-1 rounded text-xs ${
                          item.metrics.activeBugs > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {item.metrics.activeBugs} Active
                        </span>
                      </div>
                      {item.metrics.criticalBugs > 0 && (
                        <div className="text-xs text-red-600 mt-1">
                          {item.metrics.criticalBugs} Critical
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm ${getStatusColor(item.metrics.hasGaps)}`}>
                        {item.metrics.hasGaps ? 'Has Gaps' : 'Complete'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="btn btn-primary btn-sm">
                        <Eye className="w-3 h-3" />
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
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg mb-4 text-gray-900">Coverage Distribution</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[
                { label: '100% Covered', count: traceabilityData.filter(i => i.metrics.coverageScore === 100).length, color: 'green' },
                { label: '75-99% Covered', count: traceabilityData.filter(i => i.metrics.coverageScore >= 75 && i.metrics.coverageScore < 100).length, color: 'blue' },
                { label: '50-74% Covered', count: traceabilityData.filter(i => i.metrics.coverageScore >= 50 && i.metrics.coverageScore < 75).length, color: 'yellow' },
                { label: '1-49% Covered', count: traceabilityData.filter(i => i.metrics.coverageScore > 0 && i.metrics.coverageScore < 50).length, color: 'orange' },
                { label: 'No Coverage', count: traceabilityData.filter(i => i.metrics.coverageScore === 0).length, color: 'red' },
              ].map(item => (
                <div key={item.label} className={`bg-${item.color}-50 border border-${item.color}-200 rounded-lg p-4`}>
                  <div className="text-3xl mb-1">{item.count}</div>
                  <div className="text-sm text-gray-600">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg mb-4 text-gray-900">Test Type Distribution</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {['Functional', 'Regression', 'Integration', 'Smoke', 'Performance'].map(type => {
                const count = testCases.filter(tc => tc.type === type).length;
                return (
                  <div key={type} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="text-2xl mb-1">{count}</div>
                    <div className="text-sm text-gray-600">{type}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {testCases.length > 0 ? Math.round((count / testCases.length) * 100) : 0}% of total
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <h4 className="text-gray-800 mb-2">📊 Coverage Insights</h4>
            <ul className="text-sm text-gray-700 space-y-2">
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
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <h3 className="text-red-800 font-medium mb-2">Coverage Gaps Requiring Attention</h3>
            <p className="text-sm text-red-700">
              {traceabilityData.filter(i => i.metrics.hasGaps).length} stories have coverage gaps that need to be addressed
            </p>
          </div>

          {traceabilityData.filter(i => i.metrics.hasGaps).map(item => (
            <div key={item.story.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-lg font-medium text-gray-900">{item.story.id}: {item.story.title}</h4>
                  <div className="text-sm text-gray-500 mt-1">Status: {item.story.status}</div>
                </div>
                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                  Gap Detected
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-50 rounded p-3">
                  <div className="text-xs text-gray-600 mb-1">Test Coverage</div>
                  <div className="text-lg font-medium">
                    {item.metrics.totalTests} tests ({item.metrics.coverageScore}% pass rate)
                  </div>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <div className="text-xs text-gray-600 mb-1">Failed/Blocked Tests</div>
                  <div className="text-lg font-medium text-red-600">
                    {item.metrics.failedTests + item.metrics.blockedTests} issues
                  </div>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <div className="text-xs text-gray-600 mb-1">Active Bugs</div>
                  <div className="text-lg font-medium text-red-600">
                    {item.metrics.activeBugs} ({item.metrics.criticalBugs} critical)
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <div className="font-medium text-gray-800 mb-2">Recommendations:</div>
                <ul className="text-sm text-gray-700 space-y-1">
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
            </div>
          ))}

          {traceabilityData.filter(i => i.metrics.hasGaps).length === 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
              <span className="text-5xl mb-3 block">✅</span>
              <h3 className="text-xl text-gray-900 mb-2">No Coverage Gaps Detected!</h3>
              <p className="text-gray-600">
                All stories have adequate test coverage with no failing tests or critical bugs.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
