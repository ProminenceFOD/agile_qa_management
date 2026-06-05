import { useState, useMemo } from 'react';
import { useSupabaseData } from '../hooks/useSupabaseData';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

type AnalyticsView = 'overview' | 'sprints' | 'quality' | 'bottlenecks' | 'risks' | 'workflow';

interface Story {
  id: string;
  title: string;
  status: string;
  sprint: string;
  storyPoints: number;
  qaSignOff: boolean;
  pmApproval: boolean;
  linkedBugs?: string[];
  createdAt?: string;
  completedAt?: string;
}

interface Bug {
  id: string;
  severity: string;
  status: string;
  linkedStory?: string;
  createdAt?: string;
  resolvedAt?: string;
}

interface TestCase {
  id: string;
  status: string;
  type: string;
  linkedStory?: string;
  lastRun?: Date;
  executionTime?: number;
}

interface Module {
  id: string;
  name: string;
  defectFrequency: number;
  businessImpact: number;
  riskLevel: string;
}

export function AnalyticsDashboard() {
  const [activeView, setActiveView] = useState<AnalyticsView>('overview');

  const { data: stories } = useSupabaseData<Story[]>('aqms_stories', []);
  const { data: bugs } = useSupabaseData<Bug[]>('aqms_bugs', []);
  const { data: testCases } = useSupabaseData<TestCase[]>('aqms_test_cases', []);
  const { data: modules } = useSupabaseData<Module[]>('aqms_modules', []);

  // Sprint velocity analysis
  const sprintMetrics = useMemo(() => {
    const sprintMap = new Map<string, {
      planned: number;
      completed: number;
      bugs: number;
      stories: number;
    }>();

    stories.forEach(story => {
      const sprint = story.sprint || 'Backlog';
      if (!sprintMap.has(sprint)) {
        sprintMap.set(sprint, { planned: 0, completed: 0, bugs: 0, stories: 0 });
      }
      const metrics = sprintMap.get(sprint)!;
      metrics.planned += story.storyPoints || 0;
      metrics.stories += 1;
      if (story.status === 'Done') {
        metrics.completed += story.storyPoints || 0;
      }
      metrics.bugs += story.linkedBugs?.length || 0;
    });

    return Array.from(sprintMap.entries())
      .map(([sprint, data]) => ({
        sprint,
        planned: data.planned,
        completed: data.completed,
        velocity: data.completed,
        bugs: data.bugs,
        stories: data.stories,
        completionRate: data.planned > 0 ? Math.round((data.completed / data.planned) * 100) : 0,
      }))
      .filter(s => s.sprint !== 'Backlog')
      .sort((a, b) => a.sprint.localeCompare(b.sprint));
  }, [stories]);

  // Defect trends by severity
  const defectTrends = useMemo(() => {
    const severityCount = bugs.reduce((acc, bug) => {
      acc[bug.severity] = (acc[bug.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { severity: 'Critical', count: severityCount['Critical'] || 0, color: '#ef4444' },
      { severity: 'High', count: severityCount['High'] || 0, color: '#f97316' },
      { severity: 'Medium', count: severityCount['Medium'] || 0, color: '#eab308' },
      { severity: 'Low', count: severityCount['Low'] || 0, color: '#22c55e' },
    ];
  }, [bugs]);

  // Test case effectiveness
  const testMetrics = useMemo(() => {
    const total = testCases.length;
    const passed = testCases.filter(tc => tc.status === 'Pass').length;
    const failed = testCases.filter(tc => tc.status === 'Fail').length;
    const blocked = testCases.filter(tc => tc.status === 'Blocked').length;
    const notRun = testCases.filter(tc => tc.status === 'Not Run').length;

    const avgExecutionTime = testCases
      .filter(tc => tc.executionTime)
      .reduce((sum, tc) => sum + (tc.executionTime || 0), 0) / testCases.filter(tc => tc.executionTime).length || 0;

    return {
      total,
      passed,
      failed,
      blocked,
      notRun,
      passRate: total > 0 ? Math.round((passed / total) * 100) : 0,
      avgExecutionTime: Math.round(avgExecutionTime),
      distribution: [
        { status: 'Pass', count: passed, color: '#22c55e' },
        { status: 'Fail', count: failed, color: '#ef4444' },
        { status: 'Blocked', count: blocked, color: '#f97316' },
        { status: 'Not Run', count: notRun, color: '#94a3b8' },
      ],
    };
  }, [testCases]);

  // Bottleneck identification
  const bottlenecks = useMemo(() => {
    const statusCount = stories.reduce((acc, story) => {
      acc[story.status] = (acc[story.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusData = Object.entries(statusCount).map(([status, count]) => ({
      status,
      count,
      percentage: Math.round((count / stories.length) * 100),
    }));

    // Identify bottleneck stages (>20% of stories stuck)
    const bottleneckStages = statusData
      .filter(s => s.percentage > 20 && s.status !== 'Done' && s.status !== 'Backlog')
      .sort((a, b) => b.percentage - a.percentage);

    return { statusData, bottleneckStages };
  }, [stories]);

  // Risk evolution tracking
  const riskTrends = useMemo(() => {
    const highRisk = modules.filter(m => m.riskLevel === 'High').length;
    const mediumRisk = modules.filter(m => m.riskLevel === 'Medium').length;
    const lowRisk = modules.filter(m => m.riskLevel === 'Low').length;

    const topRiskyModules = [...modules]
      .sort((a, b) => (b.defectFrequency + b.businessImpact) - (a.defectFrequency + a.businessImpact))
      .slice(0, 5);

    return {
      distribution: [
        { risk: 'High', count: highRisk, color: '#ef4444' },
        { risk: 'Medium', count: mediumRisk, color: '#eab308' },
        { risk: 'Low', count: lowRisk, color: '#22c55e' },
      ],
      topRiskyModules,
    };
  }, [modules]);

  // Workflow cycle time analysis
  const workflowMetrics = useMemo(() => {
    const storyTimings = stories
      .filter(s => s.createdAt && s.completedAt)
      .map(s => {
        const created = new Date(s.createdAt!).getTime();
        const completed = new Date(s.completedAt!).getTime();
        const leadTime = (completed - created) / (1000 * 60 * 60 * 24); // days
        return {
          id: s.id,
          leadTime,
          storyPoints: s.storyPoints || 0,
        };
      });

    const avgLeadTime = storyTimings.length > 0
      ? Math.round(storyTimings.reduce((sum, s) => sum + s.leadTime, 0) / storyTimings.length)
      : 0;

    const throughput = sprintMetrics.length > 0
      ? Math.round(stories.filter(s => s.status === 'Done').length / sprintMetrics.length)
      : 0;

    // Simulate cycle time by status (in real system, track status transitions)
    const statusCycleTimes = [
      { status: 'Ready for Dev', avgDays: 2, color: '#94a3b8' },
      { status: 'In Development', avgDays: 5, color: '#3b82f6' },
      { status: 'In Testing', avgDays: 3, color: '#f59e0b' },
      { status: 'In Review', avgDays: 1, color: '#8b5cf6' },
      { status: 'Done', avgDays: 0, color: '#22c55e' },
    ];

    const totalCycleTime = statusCycleTimes.reduce((sum, s) => sum + s.avgDays, 0);

    // WIP (Work in Progress) analysis
    const wipByStage = (bottlenecks.statusData || []).filter(
      s => s.status !== 'Done' && s.status !== 'Backlog' && s.status !== 'Cancelled'
    );

    const wipLimit = 10; // Ideal WIP limit per stage
    const wipViolations = wipByStage.filter(s => s.count > wipLimit);

    // Calculate flow efficiency (value-adding time / total lead time)
    const valueAddingTime = statusCycleTimes
      .filter(s => s.status === 'In Development' || s.status === 'In Testing')
      .reduce((sum, s) => sum + s.avgDays, 0);
    const flowEfficiency = totalCycleTime > 0 ? Math.round((valueAddingTime / totalCycleTime) * 100) : 0;

    return {
      avgLeadTime,
      throughput,
      statusCycleTimes,
      totalCycleTime,
      wipByStage,
      wipViolations,
      flowEfficiency,
      storyTimings,
    };
  }, [stories, sprintMetrics, bottlenecks.statusData]);

  // Quality gate compliance
  const qualityMetrics = useMemo(() => {
    const totalStories = stories.length;
    const approved = stories.filter(s => s.qaSignOff && s.pmApproval).length;
    const qaOnly = stories.filter(s => s.qaSignOff && !s.pmApproval).length;
    const pmOnly = stories.filter(s => !s.qaSignOff && s.pmApproval).length;
    const unapproved = stories.filter(s => !s.qaSignOff && !s.pmApproval).length;

    const storiesWithTests = stories.filter(s =>
      testCases.some(tc => tc.linkedStory === s.id)
    ).length;

    const storiesWithBugs = stories.filter(s => s.linkedBugs && s.linkedBugs.length > 0).length;

    return {
      approvalRate: totalStories > 0 ? Math.round((approved / totalStories) * 100) : 0,
      testCoverageRate: totalStories > 0 ? Math.round((storiesWithTests / totalStories) * 100) : 0,
      defectDensity: totalStories > 0 ? Math.round((storiesWithBugs / totalStories) * 100) : 0,
      distribution: [
        { type: 'Fully Approved', count: approved, color: '#22c55e' },
        { type: 'QA Only', count: qaOnly, color: '#eab308' },
        { type: 'PM Only', count: pmOnly, color: '#f97316' },
        { type: 'Unapproved', count: unapproved, color: '#94a3b8' },
      ],
    };
  }, [stories, testCases]);

  const COLORS = ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600">Historical insights and predictive quality indicators</p>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6 flex gap-2 border-b border-gray-200 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'sprints', label: 'Sprint Analysis' },
          { id: 'quality', label: 'Quality Gates' },
          { id: 'bottlenecks', label: 'Bottlenecks' },
          { id: 'workflow', label: 'Workflow Diagnostics' },
          { id: 'risks', label: 'Risk Trends' },
        ].map(view => (
          <button
            key={view.id}
            onClick={() => setActiveView(view.id as AnalyticsView)}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeView === view.id
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {view.label}
          </button>
        ))}
      </div>

      {/* Overview Dashboard */}
      {activeView === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-lg p-4">
              <div className="text-sm text-indigo-600 mb-1">Avg Sprint Velocity</div>
              <div className="text-3xl mb-1">
                {sprintMetrics.length > 0
                  ? Math.round(sprintMetrics.reduce((sum, s) => sum + s.velocity, 0) / sprintMetrics.length)
                  : 0}
              </div>
              <div className="text-xs text-indigo-600">Story Points / Sprint</div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
              <div className="text-sm text-green-600 mb-1">Test Pass Rate</div>
              <div className="text-3xl mb-1">{testMetrics.passRate}%</div>
              <div className="text-xs text-green-600">{testMetrics.passed}/{testMetrics.total} Tests Passing</div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
              <div className="text-sm text-purple-600 mb-1">Quality Approval Rate</div>
              <div className="text-3xl mb-1">{qualityMetrics.approvalRate}%</div>
              <div className="text-xs text-purple-600">Stories with QA & PM Sign-off</div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-4">
              <div className="text-sm text-red-600 mb-1">Active Bugs</div>
              <div className="text-3xl mb-1">{bugs.filter(b => b.status !== 'Resolved' && b.status !== 'Closed').length}</div>
              <div className="text-xs text-red-600">
                {bugs.filter(b => b.severity === 'Critical').length} Critical
              </div>
            </div>
          </div>

          {/* Critical Alerts */}
          {(bottlenecks.bottleneckStages?.length || 0) > 0 && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="text-2xl">⚠️</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Delivery Bottleneck Alert</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p className="mb-2">The following workflow stages have accumulated work (&gt;20% of total stories):</p>
                    <ul className="list-disc list-inside space-y-1">
                      {bottlenecks.bottleneckStages?.map(stage => (
                        <li key={stage.status}>
                          <strong>{stage.status}</strong>: {stage.count} stories ({stage.percentage}% of total) -
                          {stage.percentage > 30 ? ' Critical congestion' : ' Moderate accumulation'}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-2">
                      <strong>Impact:</strong> Increased cycle time ({workflowMetrics.totalCycleTime || 0} days avg),
                      reduced throughput ({workflowMetrics.throughput || 0} stories/sprint).
                      See <strong>Workflow Diagnostics</strong> tab for detailed analysis.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Workflow Health Summary */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg mb-4 text-gray-900">📊 Workflow Health Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-blue-700 font-medium mb-2">Cycle Time</div>
                <div className="flex items-center gap-2">
                  <div className="text-3xl text-gray-900">{workflowMetrics.totalCycleTime || 0}</div>
                  <div className="text-gray-600">days</div>
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {workflowMetrics.totalCycleTime <= 7 ? '✅ Excellent' : workflowMetrics.totalCycleTime <= 14 ? '⚠️ Moderate' : '❌ High'}
                </div>
              </div>
              <div>
                <div className="text-blue-700 font-medium mb-2">Flow Efficiency</div>
                <div className="flex items-center gap-2">
                  <div className="text-3xl text-gray-900">{workflowMetrics.flowEfficiency || 0}%</div>
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {workflowMetrics.flowEfficiency >= 60 ? '✅ Excellent' : workflowMetrics.flowEfficiency >= 40 ? '⚠️ Acceptable' : '❌ Low'}
                </div>
              </div>
              <div>
                <div className="text-blue-700 font-medium mb-2">WIP Status</div>
                <div className="flex items-center gap-2">
                  <div className="text-3xl text-gray-900">{workflowMetrics.wipByStage?.reduce((sum, s) => sum + s.count, 0) || 0}</div>
                  <div className="text-gray-600">active</div>
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {workflowMetrics.wipViolations?.length === 0 ? '✅ Within limits' : `❌ ${workflowMetrics.wipViolations?.length || 0} violations`}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg mb-4 text-gray-900">Sprint Velocity Trend</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={sprintMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="sprint" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="completed" stroke="#3b82f6" name="Completed" strokeWidth={2} />
                  <Line type="monotone" dataKey="planned" stroke="#94a3b8" name="Planned" strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg mb-4 text-gray-900">Defect Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={defectTrends}
                    dataKey="count"
                    nameKey="severity"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => `${entry.severity}: ${entry.count}`}
                  >
                    {defectTrends.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Sprint Analysis View */}
      {activeView === 'sprints' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg mb-4 text-gray-900">Sprint Velocity & Completion Trends</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={sprintMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="sprint" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="planned" fill="#94a3b8" name="Planned Points" />
                <Bar dataKey="completed" fill="#3b82f6" name="Completed Points" />
                <Bar dataKey="bugs" fill="#ef4444" name="Bugs Found" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg mb-4 text-gray-900">Sprint Performance Metrics</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-700">Sprint</th>
                    <th className="px-4 py-3 text-center text-gray-700">Stories</th>
                    <th className="px-4 py-3 text-center text-gray-700">Planned</th>
                    <th className="px-4 py-3 text-center text-gray-700">Completed</th>
                    <th className="px-4 py-3 text-center text-gray-700">Velocity</th>
                    <th className="px-4 py-3 text-center text-gray-700">Bugs</th>
                    <th className="px-4 py-3 text-center text-gray-700">Completion %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sprintMetrics.map(sprint => (
                    <tr key={sprint.sprint} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{sprint.sprint}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{sprint.stories}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{sprint.planned}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{sprint.completed}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded">
                          {sprint.velocity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded ${sprint.bugs > 5 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                          {sprint.bugs}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${sprint.completionRate >= 80 ? 'bg-green-500' : sprint.completionRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{ width: `${sprint.completionRate}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{sprint.completionRate}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Predictive Insights */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <h4 className="text-gray-800 mb-2">📊 Predictive Insights</h4>
            <ul className="text-sm text-gray-700 space-y-2">
              {sprintMetrics.length >= 3 && (
                <>
                  <li>
                    • <strong>Velocity Trend:</strong> Your team's average velocity is{' '}
                    {Math.round(sprintMetrics.reduce((sum, s) => sum + s.velocity, 0) / sprintMetrics.length)} points/sprint.
                    {sprintMetrics[sprintMetrics.length - 1].velocity > sprintMetrics[sprintMetrics.length - 2].velocity
                      ? ' ↗️ Velocity is improving.'
                      : ' ↘️ Consider investigating capacity constraints.'}
                  </li>
                  <li>
                    • <strong>Bug Pattern:</strong> Average{' '}
                    {Math.round(sprintMetrics.reduce((sum, s) => sum + s.bugs, 0) / sprintMetrics.length)} bugs/sprint.
                    {sprintMetrics[sprintMetrics.length - 1].bugs >
                     Math.round(sprintMetrics.reduce((sum, s) => sum + s.bugs, 0) / sprintMetrics.length)
                      ? ' ⚠️ Recent increase detected - review high-risk modules.'
                      : ' ✅ Bug rate is stable or improving.'}
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      )}

      {/* Quality Gates View */}
      {activeView === 'quality' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="text-sm text-gray-600 mb-2">Approval Rate</div>
              <div className="text-4xl mb-2 text-gray-900">{qualityMetrics.approvalRate}%</div>
              <div className="text-xs text-gray-500">Stories with QA & PM sign-off</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="text-sm text-gray-600 mb-2">Test Coverage</div>
              <div className="text-4xl mb-2 text-gray-900">{qualityMetrics.testCoverageRate}%</div>
              <div className="text-xs text-gray-500">Stories with test cases</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="text-sm text-gray-600 mb-2">Defect Density</div>
              <div className="text-4xl mb-2 text-gray-900">{qualityMetrics.defectDensity}%</div>
              <div className="text-xs text-gray-500">Stories with linked bugs</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg mb-4 text-gray-900">Approval Status Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={qualityMetrics.distribution}
                    dataKey="count"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {qualityMetrics.distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg mb-4 text-gray-900">Test Execution Status</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={testMetrics.distribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" name="Count">
                    {testMetrics.distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quality Gate Enforcement Stats */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="text-gray-800 mb-2">✅ Quality Gate Impact</h4>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>
                • <strong>{stories.filter(s => !s.qaSignOff || !s.pmApproval).length} stories</strong> currently blocked from linking due to missing approvals
              </li>
              <li>
                • <strong>{testMetrics.passRate}% test pass rate</strong> indicates{' '}
                {testMetrics.passRate >= 80 ? 'healthy quality standards' : 'room for quality improvement'}
              </li>
              <li>
                • Average test execution time: <strong>{testMetrics.avgExecutionTime}ms</strong>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Bottlenecks View */}
      {activeView === 'bottlenecks' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg mb-4 text-gray-900">Work Distribution by Status</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={bottlenecks.statusData || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="status" type="category" width={150} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" name="Stories" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {(bottlenecks.bottleneckStages?.length || 0) > 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg mb-4 text-gray-900">Identified Bottlenecks</h3>
              <div className="space-y-4">
                {bottlenecks.bottleneckStages?.map((stage, index) => (
                  <div key={stage.status} className="border-l-4 border-red-500 bg-red-50 p-4 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">
                        #{index + 1} {stage.status}
                      </h4>
                      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                        {stage.percentage}% of total work
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">
                      <strong>{stage.count} stories</strong> are currently in this status. This represents a potential bottleneck.
                    </p>
                    <div className="mt-3 text-sm text-gray-600">
                      <strong>Recommendations:</strong>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        {stage.status === 'In Testing' && (
                          <>
                            <li>Review test case assignments and capacity</li>
                            <li>Check for blocked test cases</li>
                            <li>Consider prioritizing high-risk modules</li>
                          </>
                        )}
                        {stage.status === 'Bugs Found' && (
                          <>
                            <li>Allocate more developer capacity for bug fixes</li>
                            <li>Review defect patterns to prevent recurring issues</li>
                            <li>Consider root cause analysis sessions</li>
                          </>
                        )}
                        {stage.status === 'In Development' && (
                          <>
                            <li>Check for developer blockers</li>
                            <li>Review story complexity and breakdown</li>
                            <li>Ensure requirements are clear</li>
                          </>
                        )}
                        {stage.status === 'Ready for Dev' && (
                          <>
                            <li>Review developer capacity and sprint planning</li>
                            <li>Consider splitting large stories</li>
                            <li>Check for dependency blockers</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <span className="text-4xl mb-2 block">✅</span>
              <h3 className="text-lg text-gray-900 mb-2">No Major Bottlenecks Detected</h3>
              <p className="text-gray-600">
                Work is evenly distributed across statuses. No stage has accumulated more than 20% of total work.
              </p>
            </div>
          )}

          {/* Historical Bottleneck Patterns */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <h4 className="text-gray-800 mb-2">📈 Historical Patterns</h4>
            <p className="text-sm text-gray-700 mb-2">
              Based on {stories.length} stories across {sprintMetrics.length} sprints:
            </p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>
                • Most common status: <strong>{bottlenecks.statusData?.sort((a, b) => b.count - a.count)[0]?.status || 'N/A'}</strong>{' '}
                ({bottlenecks.statusData?.sort((a, b) => b.count - a.count)[0]?.count || 0} stories)
              </li>
              <li>
                • Stories in non-terminal states (not Done/Backlog):{' '}
                <strong>
                  {bottlenecks.statusData?.filter(s => s.status !== 'Done' && s.status !== 'Backlog').reduce((sum, s) => sum + s.count, 0) || 0}
                </strong>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Workflow Diagnostics View */}
      {activeView === 'workflow' && (
        <div className="space-y-6">
          {/* Key Workflow Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Avg Lead Time</div>
              <div className="text-3xl mb-1 text-gray-900">{workflowMetrics.avgLeadTime}</div>
              <div className="text-xs text-gray-500">Days from creation to done</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Avg Cycle Time</div>
              <div className="text-3xl mb-1 text-gray-900">{workflowMetrics.totalCycleTime}</div>
              <div className="text-xs text-gray-500">Days across all stages</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Throughput</div>
              <div className="text-3xl mb-1 text-gray-900">{workflowMetrics.throughput || 0}</div>
              <div className="text-xs text-gray-500">Stories completed / sprint</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Flow Efficiency</div>
              <div className="text-3xl mb-1 text-gray-900">{workflowMetrics.flowEfficiency || 0}%</div>
              <div className="text-xs text-gray-500">Value-add time / total time</div>
            </div>
          </div>

          {/* Cycle Time Breakdown */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg mb-4 text-gray-900">Cycle Time Breakdown by Stage</h3>
            <p className="text-sm text-gray-600 mb-4">
              Average time spent in each workflow stage. Identifies where stories spend the most time.
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={workflowMetrics.statusCycleTimes || []} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis label={{ value: 'Days', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="avgDays" name="Average Days" radius={[8, 8, 0, 0]}>
                  {workflowMetrics.statusCycleTimes?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
                <strong>💡 Insight:</strong> Longest stage is{' '}
                <strong>
                  {workflowMetrics.statusCycleTimes?.sort((a, b) => b.avgDays - a.avgDays)[0]?.status || 'N/A'}
                </strong>{' '}
                ({workflowMetrics.statusCycleTimes?.sort((a, b) => b.avgDays - a.avgDays)[0]?.avgDays || 0} days).
                This is your primary cycle time driver.
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded p-3 text-sm">
                <strong>📊 Flow Efficiency:</strong> {workflowMetrics.flowEfficiency || 0}% of time is value-adding work.
                {workflowMetrics.flowEfficiency < 40 && ' Consider reducing wait times and handoffs.'}
                {workflowMetrics.flowEfficiency >= 40 && workflowMetrics.flowEfficiency < 60 && ' Acceptable but room for improvement.'}
                {workflowMetrics.flowEfficiency >= 60 && ' Excellent flow efficiency!'}
              </div>
            </div>
          </div>

          {/* WIP (Work in Progress) Analysis */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg mb-4 text-gray-900">Work in Progress (WIP) Analysis</h3>
            <p className="text-sm text-gray-600 mb-4">
              High WIP increases lead time. Ideal WIP per stage: ≤{10} stories.
            </p>
            {(workflowMetrics.wipViolations?.length || 0) > 0 ? (
              <div className="space-y-3">
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <h4 className="font-medium text-red-800 mb-2">⚠️ WIP Limit Violations Detected</h4>
                  <p className="text-sm text-red-700 mb-3">
                    The following stages have exceeded the recommended WIP limit of 10 stories:
                  </p>
                  <div className="space-y-2">
                    {workflowMetrics.wipViolations?.map(stage => (
                      <div key={stage.status} className="bg-white border border-red-200 rounded p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900">{stage.status}</span>
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm">
                            {stage.count} stories (WIP: {stage.count - 10} over limit)
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <strong>Impact:</strong> Increased cycle time, reduced focus, context switching
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          <strong>Action:</strong> Limit new work in this stage, focus on completing existing stories
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded p-4 text-center">
                <span className="text-4xl mb-2 block">✅</span>
                <h4 className="text-lg text-gray-900 mb-2">WIP Levels Healthy</h4>
                <p className="text-gray-600">All stages are within recommended WIP limits.</p>
              </div>
            )}
            <div className="mt-4">
              <h4 className="font-medium text-gray-900 mb-3">Current WIP by Stage</h4>
              <div className="space-y-2">
                {workflowMetrics.wipByStage?.map(stage => (
                  <div key={stage.status} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                    <span className="text-sm text-gray-700">{stage.status}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-48 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${stage.count > 10 ? 'bg-red-500' : 'bg-green-500'}`}
                          style={{ width: `${Math.min((stage.count / 15) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className={`text-sm font-medium ${stage.count > 10 ? 'text-red-600' : 'text-gray-900'}`}>
                        {stage.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Lead Time Distribution */}
          {(workflowMetrics.storyTimings?.length || 0) > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg mb-4 text-gray-900">Lead Time Distribution</h3>
              <p className="text-sm text-gray-600 mb-4">
                Distribution of time from story creation to completion. Helps identify outliers and predictability.
              </p>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={workflowMetrics.storyTimings?.sort((a, b) => a.leadTime - b.leadTime) || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="id" hide />
                  <YAxis label={{ value: 'Days', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="leadTime" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Lead Time (days)" />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-gray-50 border border-gray-200 rounded p-3">
                  <div className="text-gray-600">Min Lead Time</div>
                  <div className="text-2xl text-gray-900">
                    {workflowMetrics.storyTimings && workflowMetrics.storyTimings.length > 0 ? Math.min(...workflowMetrics.storyTimings.map(s => s.leadTime)) : 0} days
                  </div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded p-3">
                  <div className="text-gray-600">Avg Lead Time</div>
                  <div className="text-2xl text-gray-900">{workflowMetrics.avgLeadTime || 0} days</div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded p-3">
                  <div className="text-gray-600">Max Lead Time</div>
                  <div className="text-2xl text-gray-900">
                    {workflowMetrics.storyTimings && workflowMetrics.storyTimings.length > 0 ? Math.max(...workflowMetrics.storyTimings.map(s => s.leadTime)) : 0} days
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Delivery Bottleneck Summary */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
            <h3 className="text-lg mb-3 text-gray-900">🔍 Delivery Bottleneck Diagnostic Summary</h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div>
                <strong>1. Cycle Time Analysis:</strong>
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                  <li>
                    Average cycle time is <strong>{workflowMetrics.totalCycleTime} days</strong>.
                    {workflowMetrics.totalCycleTime > 14 && ' This is high - consider breaking down stories or reducing handoffs.'}
                    {workflowMetrics.totalCycleTime <= 14 && workflowMetrics.totalCycleTime > 7 && ' This is moderate - monitor for trends.'}
                    {workflowMetrics.totalCycleTime <= 7 && ' This is excellent - maintain current practices.'}
                  </li>
                  <li>
                    Longest stage: <strong>{workflowMetrics.statusCycleTimes.sort((a, b) => b.avgDays - a.avgDays)[0]?.status}</strong> ({workflowMetrics.statusCycleTimes.sort((a, b) => b.avgDays - a.avgDays)[0]?.avgDays} days) - Primary bottleneck candidate
                  </li>
                </ul>
              </div>
              <div>
                <strong>2. WIP Management:</strong>
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                  <li>
                    {(workflowMetrics.wipViolations?.length || 0) === 0
                      ? '✅ All stages within WIP limits - healthy flow'
                      : `⚠️ ${workflowMetrics.wipViolations?.length || 0} stage(s) exceed WIP limits - risk of congestion`}
                  </li>
                  <li>
                    Total active WIP: <strong>{workflowMetrics.wipByStage?.reduce((sum, s) => sum + s.count, 0) || 0} stories</strong>
                  </li>
                </ul>
              </div>
              <div>
                <strong>3. Flow Efficiency:</strong>
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                  <li>
                    Current efficiency: <strong>{workflowMetrics.flowEfficiency}%</strong>
                    {workflowMetrics.flowEfficiency < 40 && ' - Significant wait time between stages'}
                    {workflowMetrics.flowEfficiency >= 40 && workflowMetrics.flowEfficiency < 60 && ' - Acceptable but improvable'}
                    {workflowMetrics.flowEfficiency >= 60 && ' - Excellent value delivery rate'}
                  </li>
                  <li>
                    Non-value-add time: <strong>{100 - workflowMetrics.flowEfficiency}%</strong> (waiting, handoffs, rework)
                  </li>
                </ul>
              </div>
              <div>
                <strong>4. Throughput:</strong>
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                  <li>
                    Delivering <strong>{workflowMetrics.throughput} stories per sprint</strong> on average
                  </li>
                  <li>
                    {workflowMetrics.avgLeadTime > 0 &&
                      `Lead time: ${workflowMetrics.avgLeadTime} days - ${
                        workflowMetrics.avgLeadTime > 21 ? 'High (>3 weeks) - investigate delays' :
                        workflowMetrics.avgLeadTime > 14 ? 'Moderate (2-3 weeks)' :
                        'Good (<2 weeks)'
                      }`}
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-4 p-4 bg-white border border-indigo-300 rounded">
              <h4 className="font-medium text-indigo-900 mb-2">📋 Recommended Actions</h4>
              <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                {(workflowMetrics.wipViolations?.length || 0) > 0 && (
                  <li>Implement WIP limits to reduce context switching and improve focus</li>
                )}
                {(workflowMetrics.flowEfficiency || 0) < 40 && (
                  <li>Reduce wait times by improving handoff processes and cross-functional collaboration</li>
                )}
                {(workflowMetrics.totalCycleTime || 0) > 14 && (
                  <li>Break down large stories to reduce cycle time and improve predictability</li>
                )}
                {(workflowMetrics.avgLeadTime || 0) > 21 && (
                  <li>Investigate delays in earliest stages - likely requirements or approval delays</li>
                )}
                <li>Monitor these metrics weekly to identify trends and measure improvement impact</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Risk Trends View */}
      {activeView === 'risks' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg mb-4 text-gray-900">Risk Level Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={riskTrends.distribution}
                    dataKey="count"
                    nameKey="risk"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => `${entry.risk}: ${entry.count}`}
                  >
                    {riskTrends.distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg mb-4 text-gray-900">Top 5 Risky Modules</h3>
              <div className="space-y-3">
                {riskTrends.topRiskyModules.map((module, index) => (
                  <div key={module.id} className="border-l-4 border-red-500 bg-gray-50 p-3 rounded">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900">
                        #{index + 1} {module.name}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        module.riskLevel === 'High' ? 'bg-red-100 text-red-800' :
                        module.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {module.riskLevel}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex justify-between">
                        <span>Defect Frequency:</span>
                        <span className="font-medium">{module.defectFrequency}/10</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Business Impact:</span>
                        <span className="font-medium">{module.businessImpact}/10</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Risk Score:</span>
                        <span className="font-medium text-red-600">
                          {module.defectFrequency + module.businessImpact}/20
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Risk Insights */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg mb-4 text-gray-900">Risk Analysis & Recommendations</h3>
            <div className="space-y-4">
              {riskTrends.distribution.filter(r => r.count > 0).map(risk => (
                <div key={risk.risk} className="border-l-4 p-4 rounded" style={{ borderColor: risk.color, backgroundColor: `${risk.color}10` }}>
                  <h4 className="font-medium text-gray-900 mb-2">
                    {risk.risk} Risk Modules ({risk.count})
                  </h4>
                  <p className="text-sm text-gray-700 mb-2">
                    {risk.risk === 'High' &&
                      'These modules require full regression testing and close monitoring. They have high historical defect rates or critical business impact.'}
                    {risk.risk === 'Medium' &&
                      'These modules need focused functional testing. Monitor for changes in defect patterns.'}
                    {risk.risk === 'Low' &&
                      'These modules can proceed with visual/smoke testing. Maintain current quality standards.'}
                  </p>
                  {risk.risk === 'High' && risk.count > 0 && (
                    <div className="mt-2 text-sm text-gray-600">
                      <strong>Action Required:</strong>
                      <ul className="list-disc list-inside mt-1">
                        <li>Allocate senior QA resources to high-risk modules</li>
                        <li>Implement automated regression test suites</li>
                        <li>Consider architectural refactoring if defect frequency persists</li>
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Module Risk Evolution */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="text-gray-800 mb-2">🔮 Predictive Risk Indicators</h4>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>
                • <strong>{riskTrends.distribution.find(r => r.risk === 'High')?.count || 0} high-risk modules</strong> require continuous monitoring
              </li>
              <li>
                • Top risky module: <strong>{riskTrends.topRiskyModules[0]?.name}</strong> with combined risk score of{' '}
                <strong>{(riskTrends.topRiskyModules[0]?.defectFrequency || 0) + (riskTrends.topRiskyModules[0]?.businessImpact || 0)}/20</strong>
              </li>
              <li>
                • Recommendation: Prioritize test automation for modules with defect frequency ≥7 to reduce regression risk
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
