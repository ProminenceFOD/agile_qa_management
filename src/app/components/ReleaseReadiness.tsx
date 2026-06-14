import { useState, useMemo } from 'react';
import { useSupabaseData } from '../hooks/useSupabaseData';

interface Story {
  id: string;
  title: string;
  status: string;
  storyPoints: number;
  sprint: string;
  qaSignOff: boolean;
  pmApproval: boolean;
  linkedBugs?: string[];
  moduleId?: string;
}

interface Bug {
  id: string;
  title: string;
  severity: string;
  status: string;
  linkedStory?: string;
  moduleId?: string;
}

interface TestCase {
  id: string;
  title: string;
  status: string;
  linkedStory?: string;
  type: string;
  moduleId?: string;
  isDraft?: boolean;
}

interface Module {
  id: string;
  name: string;
  riskLevel: string;
  defectFrequency: number;
  businessImpact: number;
}

type ScorecardCriteria = 'excellent' | 'good' | 'warning' | 'critical';

export function ReleaseReadiness() {
  const [selectedSprint, setSelectedSprint] = useState<string>('Sprint 13');
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const { data: stories } = useSupabaseData<Story[]>('aqms_stories', []);
  const { data: bugs } = useSupabaseData<Bug[]>('aqms_bugs', []);
  const { data: testCases } = useSupabaseData<TestCase[]>('aqms_test_cases', []);
  const { data: modules } = useSupabaseData<Module[]>('aqms_modules', []);

  const sprints = useMemo(() => {
    return Array.from(new Set(stories.map(s => s.sprint).filter(Boolean))).sort();
  }, [stories]);

  const releaseMetrics = useMemo(() => {
    const sprintStories = stories.filter(s => s.sprint === selectedSprint);
    const allStories = selectedSprint === 'All Sprints' ? stories : sprintStories;

    // Story completion metrics
    const totalStories = allStories.length;
    const completedStories = allStories.filter(s => s.status === 'Done').length;
    const approvedStories = allStories.filter(s => s.qaSignOff && s.pmApproval).length;
    const completionRate = totalStories > 0 ? Math.round((completedStories / totalStories) * 100) : 0;
    const approvalRate = totalStories > 0 ? Math.round((approvedStories / totalStories) * 100) : 0;

    // Bug metrics
    const storyIds = allStories.map(s => s.id);
    const relatedBugs = bugs.filter(b => !b.linkedStory || storyIds.includes(b.linkedStory));
    const criticalBugs = relatedBugs.filter(b => b.severity === 'Critical' && b.status !== 'Resolved' && b.status !== 'Closed').length;
    const highBugs = relatedBugs.filter(b => b.severity === 'High' && b.status !== 'Resolved' && b.status !== 'Closed').length;
    const totalOpenBugs = relatedBugs.filter(b => b.status !== 'Resolved' && b.status !== 'Closed').length;

    // Test metrics
    const relatedTests = testCases.filter(tc => (!tc.linkedStory || storyIds.includes(tc.linkedStory)) && !tc.isDraft);
    const totalTests = relatedTests.length;
    const passedTests = relatedTests.filter(tc => tc.status === 'Pass').length;
    const failedTests = relatedTests.filter(tc => tc.status === 'Fail').length;
    const blockedTests = relatedTests.filter(tc => tc.status === 'Blocked').length;
    const testPassRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

    // Test coverage
    const storiesWithTests = allStories.filter(s =>
      relatedTests.some(tc => tc.linkedStory === s.id)
    ).length;
    const testCoverage = totalStories > 0 ? Math.round((storiesWithTests / totalStories) * 100) : 0;

    // Risk assessment
    const highRiskModules = modules.filter(m => m.riskLevel === 'High').length;
    const highRiskCoverage = modules
      .filter(m => m.riskLevel === 'High')
      .filter(module => {
        // Find stories belonging to this module
        const moduleStories = stories.filter(s => s.moduleId === module.id);
        const storyIds = new Set(moduleStories.map(s => s.id));
        // Check if there are regression tests specifically for this module's stories or directly linked to the module
        return relatedTests.some(tc => 
          (tc.moduleId === module.id || (tc.linkedStory && storyIds.has(tc.linkedStory))) && 
          tc.type === 'Regression'
        );
      }).length;

    // Code quality indicators
    const storiesInBugState = allStories.filter(s => s.status === 'Bugs Found').length;
    const storiesInTesting = allStories.filter(s => s.status === 'In Testing').length;

    return {
      totalStories,
      completedStories,
      approvedStories,
      completionRate,
      approvalRate,
      criticalBugs,
      highBugs,
      totalOpenBugs,
      totalTests,
      passedTests,
      failedTests,
      blockedTests,
      testPassRate,
      testCoverage,
      highRiskModules,
      highRiskCoverage,
      storiesInBugState,
      storiesInTesting,
      storiesWithTests,
    };
  }, [stories, bugs, testCases, modules, selectedSprint]);

  const getCriteriaStatus = (metric: string, value: number): ScorecardCriteria => {
    const thresholds: Record<string, { excellent: number; good: number; warning: number }> = {
      completion: { excellent: 100, good: 90, warning: 75 },
      approval: { excellent: 100, good: 95, warning: 85 },
      testPass: { excellent: 95, good: 85, warning: 70 },
      testCoverage: { excellent: 90, good: 75, warning: 60 },
    };

    const threshold = thresholds[metric];
    if (!threshold) return 'warning';

    if (value >= threshold.excellent) return 'excellent';
    if (value >= threshold.good) return 'good';
    if (value >= threshold.warning) return 'warning';
    return 'critical';
  };

  const getStatusColor = (status: ScorecardCriteria) => {
    switch (status) {
      case 'excellent':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'good':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
    }
  };

  const getStatusIcon = (status: ScorecardCriteria) => {
    switch (status) {
      case 'excellent':
        return '✅';
      case 'good':
        return '👍';
      case 'warning':
        return '⚠️';
      case 'critical':
        return '🚫';
    }
  };

  const overallReadiness = useMemo(() => {
    const scores = {
      completion: getCriteriaStatus('completion', releaseMetrics.completionRate),
      approval: getCriteriaStatus('approval', releaseMetrics.approvalRate),
      testPass: getCriteriaStatus('testPass', releaseMetrics.testPassRate),
      testCoverage: getCriteriaStatus('testCoverage', releaseMetrics.testCoverage),
    };

    const criticalCount = Object.values(scores).filter(s => s === 'critical').length;
    const warningCount = Object.values(scores).filter(s => s === 'warning').length;

    if (criticalCount > 0 || releaseMetrics.criticalBugs > 0) return 'critical';
    if (warningCount > 1 || releaseMetrics.highBugs > 2) return 'warning';
    if (warningCount === 1) return 'good';
    return 'excellent';
  }, [releaseMetrics]);

  const blockersForRelease = useMemo(() => {
    const blockers: { id: string; type: string; severity: string; description: string }[] = [];

    if (releaseMetrics.criticalBugs > 0) {
      blockers.push({
        id: 'critical-bugs',
        type: 'Critical Bugs',
        severity: 'critical',
        description: `${releaseMetrics.criticalBugs} critical bugs must be resolved before release`,
      });
    }

    if (releaseMetrics.completionRate < 100) {
      blockers.push({
        id: 'incomplete-stories',
        type: 'Incomplete Stories',
        severity: releaseMetrics.completionRate < 75 ? 'critical' : 'warning',
        description: `${releaseMetrics.totalStories - releaseMetrics.completedStories} stories not completed`,
      });
    }

    if (releaseMetrics.approvalRate < 100) {
      blockers.push({
        id: 'missing-approvals',
        type: 'Missing Approvals',
        severity: releaseMetrics.approvalRate < 85 ? 'critical' : 'warning',
        description: `${releaseMetrics.totalStories - releaseMetrics.approvedStories} stories lack QA/PM approval`,
      });
    }

    if (releaseMetrics.failedTests > 0) {
      blockers.push({
        id: 'failed-tests',
        type: 'Failed Tests',
        severity: 'critical',
        description: `${releaseMetrics.failedTests} tests are failing`,
      });
    }

    if (releaseMetrics.blockedTests > 0) {
      blockers.push({
        id: 'blocked-tests',
        type: 'Blocked Tests',
        severity: 'warning',
        description: `${releaseMetrics.blockedTests} tests are blocked`,
      });
    }

    if (releaseMetrics.testCoverage < 75) {
      blockers.push({
        id: 'low-coverage',
        type: 'Low Test Coverage',
        severity: releaseMetrics.testCoverage < 60 ? 'critical' : 'warning',
        description: `Only ${releaseMetrics.testCoverage}% test coverage (target: 75%+)`,
      });
    }

    if (releaseMetrics.highBugs > 5) {
      blockers.push({
        id: 'high-bugs',
        type: 'High Severity Bugs',
        severity: 'warning',
        description: `${releaseMetrics.highBugs} high severity bugs open`,
      });
    }

    return blockers.sort((a, b) => {
      const order = { critical: 0, warning: 1 };
      return order[a.severity as keyof typeof order] - order[b.severity as keyof typeof order];
    });
  }, [releaseMetrics]);

  const readinessScore = useMemo(() => {
    const weights = {
      completion: 25,
      approval: 20,
      testPass: 25,
      testCoverage: 15,
      bugs: 15,
    };

    const bugScore = releaseMetrics.criticalBugs === 0
      ? (releaseMetrics.totalOpenBugs === 0 ? 100 : Math.max(0, 100 - releaseMetrics.totalOpenBugs * 10))
      : 0;

    const totalScore =
      (releaseMetrics.completionRate * weights.completion +
        releaseMetrics.approvalRate * weights.approval +
        releaseMetrics.testPassRate * weights.testPass +
        releaseMetrics.testCoverage * weights.testCoverage +
        bugScore * weights.bugs) /
      100;

    return Math.round(totalScore);
  }, [releaseMetrics]);

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Release Readiness Scorecard</h1>
          <p className="text-gray-600">Consolidated quality health check before deployment</p>
        </div>
        <select
          value={selectedSprint}
          onChange={(e) => setSelectedSprint(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700"
        >
          <option value="All Sprints">All Sprints</option>
          {sprints.map(sprint => (
            <option key={sprint} value={sprint}>
              {sprint}
            </option>
          ))}
        </select>
      </div>

      {/* Overall Readiness Score */}
      <div className={`mb-8 border-2 rounded-lg p-8 text-center ${
        overallReadiness === 'excellent' ? 'bg-green-50 border-green-300' :
        overallReadiness === 'good' ? 'bg-indigo-50 border-indigo-300' :
        overallReadiness === 'warning' ? 'bg-yellow-50 border-yellow-300' :
        'bg-red-50 border-red-300'
      }`}>
        <div className="text-6xl mb-4">{getStatusIcon(overallReadiness)}</div>
        <h2 className="text-4xl font-bold mb-2 text-gray-900">{readinessScore}%</h2>
        <div className="text-xl text-gray-700 mb-4">
          {overallReadiness === 'excellent' && 'Ready for Release'}
          {overallReadiness === 'good' && 'Mostly Ready - Minor Items Pending'}
          {overallReadiness === 'warning' && 'Not Ready - Multiple Issues'}
          {overallReadiness === 'critical' && 'Blocked - Critical Issues'}
        </div>
        <div className="text-sm text-gray-600">
          Release readiness score based on completion, approvals, test results, and defect status
        </div>
      </div>

      {/* Release Blockers */}
      {blockersForRelease.length > 0 && (
        <div className="mb-8 bg-red-50 border-l-4 border-red-500 p-6 rounded">
          <h3 className="text-lg font-medium text-red-800 mb-4">
            🚫 Release Blockers ({blockersForRelease.length})
          </h3>
          <div className="space-y-3">
            {blockersForRelease.map(blocker => (
              <div key={blocker.id} className="bg-white border border-red-200 rounded p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{blocker.type}</div>
                    <div className="text-sm text-gray-700 mt-1">{blocker.description}</div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    blocker.severity === 'critical' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {blocker.severity === 'critical' ? 'Must Fix' : 'Should Fix'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Story Completion */}
        <div className={`border-2 rounded-lg p-6 ${getStatusColor(getCriteriaStatus('completion', releaseMetrics.completionRate))}`}>
          <div className="flex items-start justify-between mb-4">
            <div className="text-3xl">{getStatusIcon(getCriteriaStatus('completion', releaseMetrics.completionRate))}</div>
            <div className="text-3xl font-bold">{releaseMetrics.completionRate}%</div>
          </div>
          <div className="text-sm font-medium mb-1">Story Completion</div>
          <div className="text-xs opacity-75">
            {releaseMetrics.completedStories}/{releaseMetrics.totalStories} stories done
          </div>
          <div className="mt-3 pt-3 border-t border-current opacity-50">
            <div className="text-xs">
              Target: 100% | Good: 90%+ | Warning: 75%+
            </div>
          </div>
        </div>

        {/* Approval Rate */}
        <div className={`border-2 rounded-lg p-6 ${getStatusColor(getCriteriaStatus('approval', releaseMetrics.approvalRate))}`}>
          <div className="flex items-start justify-between mb-4">
            <div className="text-3xl">{getStatusIcon(getCriteriaStatus('approval', releaseMetrics.approvalRate))}</div>
            <div className="text-3xl font-bold">{releaseMetrics.approvalRate}%</div>
          </div>
          <div className="text-sm font-medium mb-1">QA/PM Approval</div>
          <div className="text-xs opacity-75">
            {releaseMetrics.approvedStories}/{releaseMetrics.totalStories} approved
          </div>
          <div className="mt-3 pt-3 border-t border-current opacity-50">
            <div className="text-xs">
              Target: 100% | Good: 95%+ | Warning: 85%+
            </div>
          </div>
        </div>

        {/* Test Pass Rate */}
        <div className={`border-2 rounded-lg p-6 ${getStatusColor(getCriteriaStatus('testPass', releaseMetrics.testPassRate))}`}>
          <div className="flex items-start justify-between mb-4">
            <div className="text-3xl">{getStatusIcon(getCriteriaStatus('testPass', releaseMetrics.testPassRate))}</div>
            <div className="text-3xl font-bold">{releaseMetrics.testPassRate}%</div>
          </div>
          <div className="text-sm font-medium mb-1">Test Pass Rate</div>
          <div className="text-xs opacity-75">
            {releaseMetrics.passedTests}/{releaseMetrics.totalTests} tests passing
          </div>
          <div className="mt-3 pt-3 border-t border-current opacity-50">
            <div className="text-xs">
              Target: 95%+ | Good: 85%+ | Warning: 70%+
            </div>
          </div>
        </div>

        {/* Test Coverage */}
        <div className={`border-2 rounded-lg p-6 ${getStatusColor(getCriteriaStatus('testCoverage', releaseMetrics.testCoverage))}`}>
          <div className="flex items-start justify-between mb-4">
            <div className="text-3xl">{getStatusIcon(getCriteriaStatus('testCoverage', releaseMetrics.testCoverage))}</div>
            <div className="text-3xl font-bold">{releaseMetrics.testCoverage}%</div>
          </div>
          <div className="text-sm font-medium mb-1">Test Coverage</div>
          <div className="text-xs opacity-75">
            {releaseMetrics.storiesWithTests}/{releaseMetrics.totalStories} stories tested
          </div>
          <div className="mt-3 pt-3 border-t border-current opacity-50">
            <div className="text-xs">
              Target: 90%+ | Good: 75%+ | Warning: 60%+
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Bug Status */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg mb-4 text-gray-900 flex items-center gap-2">
            <span>🐛</span> Defect Status
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Critical Bugs</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                releaseMetrics.criticalBugs === 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {releaseMetrics.criticalBugs}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">High Severity</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                releaseMetrics.highBugs === 0 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
              }`}>
                {releaseMetrics.highBugs}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Open</span>
              <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                {releaseMetrics.totalOpenBugs}
              </span>
            </div>
          </div>
        </div>

        {/* Testing Status */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg mb-4 text-gray-900 flex items-center gap-2">
            <span>🧪</span> Testing Status
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Passed</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                {releaseMetrics.passedTests}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Failed</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                releaseMetrics.failedTests === 0 ? 'bg-gray-100 text-gray-600' : 'bg-red-100 text-red-800'
              }`}>
                {releaseMetrics.failedTests}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Blocked</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                releaseMetrics.blockedTests === 0 ? 'bg-gray-100 text-gray-600' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {releaseMetrics.blockedTests}
              </span>
            </div>
          </div>
        </div>

        {/* Workflow Status */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg mb-4 text-gray-900 flex items-center gap-2">
            <span>📊</span> Workflow Status
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">In Testing</span>
              <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                {releaseMetrics.storiesInTesting}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Bugs Found</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                releaseMetrics.storiesInBugState === 0 ? 'bg-gray-100 text-gray-600' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {releaseMetrics.storiesInBugState}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">High Risk Modules</span>
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                {releaseMetrics.highRiskModules}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Go/No-Go Decision Support */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg mb-4 text-gray-900">📋 Go/No-Go Decision Criteria</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">✅ Ready to Release If:</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className={releaseMetrics.completionRate === 100 ? 'text-green-600' : 'text-gray-400'}>
                  {releaseMetrics.completionRate === 100 ? '✓' : '○'}
                </span>
                <span>All stories completed (currently {releaseMetrics.completionRate}%)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className={releaseMetrics.approvalRate === 100 ? 'text-green-600' : 'text-gray-400'}>
                  {releaseMetrics.approvalRate === 100 ? '✓' : '○'}
                </span>
                <span>All stories QA/PM approved (currently {releaseMetrics.approvalRate}%)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className={releaseMetrics.criticalBugs === 0 ? 'text-green-600' : 'text-gray-400'}>
                  {releaseMetrics.criticalBugs === 0 ? '✓' : '○'}
                </span>
                <span>Zero critical bugs (currently {releaseMetrics.criticalBugs})</span>
              </li>
              <li className="flex items-start gap-2">
                <span className={releaseMetrics.failedTests === 0 ? 'text-green-600' : 'text-gray-400'}>
                  {releaseMetrics.failedTests === 0 ? '✓' : '○'}
                </span>
                <span>Zero failing tests (currently {releaseMetrics.failedTests})</span>
              </li>
              <li className="flex items-start gap-2">
                <span className={releaseMetrics.testPassRate >= 95 ? 'text-green-600' : 'text-gray-400'}>
                  {releaseMetrics.testPassRate >= 95 ? '✓' : '○'}
                </span>
                <span>Test pass rate ≥95% (currently {releaseMetrics.testPassRate}%)</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-3">🚫 Cannot Release If:</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className={releaseMetrics.criticalBugs > 0 ? 'text-red-600' : 'text-gray-400'}>
                  {releaseMetrics.criticalBugs > 0 ? '✗' : '○'}
                </span>
                <span>Any critical bugs open ({releaseMetrics.criticalBugs} found)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className={releaseMetrics.failedTests > 0 ? 'text-red-600' : 'text-gray-400'}>
                  {releaseMetrics.failedTests > 0 ? '✗' : '○'}
                </span>
                <span>Tests failing ({releaseMetrics.failedTests} failures)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className={releaseMetrics.completionRate < 75 ? 'text-red-600' : 'text-gray-400'}>
                  {releaseMetrics.completionRate < 75 ? '✗' : '○'}
                </span>
                <span>Completion rate below 75% (currently {releaseMetrics.completionRate}%)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className={releaseMetrics.testCoverage < 60 ? 'text-red-600' : 'text-gray-400'}>
                  {releaseMetrics.testCoverage < 60 ? '✗' : '○'}
                </span>
                <span>Test coverage below 60% (currently {releaseMetrics.testCoverage}%)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className={releaseMetrics.approvalRate < 85 ? 'text-red-600' : 'text-gray-400'}>
                  {releaseMetrics.approvalRate < 85 ? '✗' : '○'}
                </span>
                <span>Approval rate below 85% (currently {releaseMetrics.approvalRate}%)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Recommendation */}
      <div className={`mt-6 border-2 rounded-lg p-6 ${
        overallReadiness === 'excellent' ? 'bg-green-50 border-green-300' :
        overallReadiness === 'good' ? 'bg-indigo-50 border-indigo-300' :
        overallReadiness === 'warning' ? 'bg-yellow-50 border-yellow-300' :
        'bg-red-50 border-red-300'
      }`}>
        <h3 className="text-lg font-medium mb-2 text-gray-900">
          {overallReadiness === 'excellent' && '✅ Recommendation: GO FOR RELEASE'}
          {overallReadiness === 'good' && '👍 Recommendation: GO WITH MINOR CAUTIONS'}
          {overallReadiness === 'warning' && '⚠️ Recommendation: DELAY RELEASE'}
          {overallReadiness === 'critical' && '🚫 Recommendation: NO-GO - CRITICAL BLOCKERS'}
        </h3>
        <p className="text-sm text-gray-700">
          {overallReadiness === 'excellent' &&
            'All quality gates passed. The release meets all criteria and is ready for production deployment.'}
          {overallReadiness === 'good' &&
            'Most quality gates passed with minor items pending. Recommend go-ahead with close monitoring post-release.'}
          {overallReadiness === 'warning' &&
            'Multiple quality issues detected. Recommend addressing highlighted issues before release to avoid production incidents.'}
          {overallReadiness === 'critical' &&
            `Critical blockers prevent release. Must resolve: ${blockersForRelease.filter(b => b.severity === 'critical').map(b => b.type).join(', ')}.`}
        </p>
      </div>
    </div>
  );
}
