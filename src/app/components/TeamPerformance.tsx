import { useState, useMemo } from 'react';
import { useSupabaseData } from '../hooks/useSupabaseData';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface Story {
  id: string;
  assignedTo?: string;
  status: string;
  storyPoints: number;
  sprint: string;
  qaSignOff: boolean;
  pmApproval: boolean;
  createdAt?: string;
  completedAt?: string;
}

interface Bug {
  id: string;
  assignedTo?: string;
  reportedBy?: string;
  severity: string;
  status: string;
  createdAt?: string;
  resolvedAt?: string;
}

interface TestCase {
  id: string;
  assignedTo?: string;
  status: string;
  executionTime?: number;
  lastRun?: Date;
}

type ViewMode = 'overview' | 'individual' | 'quality' | 'productivity';

export function TeamPerformance() {
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [selectedSprint, setSelectedSprint] = useState<string>('All Sprints');
  const [selectedMember, setSelectedMember] = useState<string>('');

  const { data: stories } = useSupabaseData<Story[]>('aqms_stories', []);
  const { data: bugs } = useSupabaseData<Bug[]>('aqms_bugs', []);
  const { data: testCases } = useSupabaseData<TestCase[]>('aqms_test_cases', []);

  const teamMembers = useMemo(() => {
    const members = new Set<string>();
    stories.forEach(s => s.assignedTo && members.add(s.assignedTo));
    bugs.forEach(b => b.assignedTo && members.add(b.assignedTo));
    testCases.forEach(tc => tc.assignedTo && members.add(tc.assignedTo));
    return Array.from(members).sort();
  }, [stories, bugs, testCases]);

  const sprints = useMemo(() => {
    return ['All Sprints', ...Array.from(new Set(stories.map(s => s.sprint).filter(Boolean))).sort()];
  }, [stories]);

  const teamMetrics = useMemo(() => {
    return teamMembers.map(member => {
      const memberStories = stories.filter(s =>
        s.assignedTo === member && (selectedSprint === 'All Sprints' || s.sprint === selectedSprint)
      );
      const memberBugs = bugs.filter(b =>
        b.assignedTo === member && (selectedSprint === 'All Sprints' || true)
      );
      const memberTests = testCases.filter(tc => tc.assignedTo === member);

      const completedStories = memberStories.filter(s => s.status === 'Done').length;
      const totalPoints = memberStories.reduce((sum, s) => sum + (s.storyPoints || 0), 0);
      const completedPoints = memberStories
        .filter(s => s.status === 'Done')
        .reduce((sum, s) => sum + (s.storyPoints || 0), 0);

      const approvedStories = memberStories.filter(s => s.qaSignOff && s.pmApproval).length;
      const bugsCreated = bugs.filter(b => b.reportedBy === member).length;
      const bugsResolved = memberBugs.filter(b => b.status === 'Resolved' || b.status === 'Closed').length;

      const passedTests = memberTests.filter(tc => tc.status === 'Pass').length;
      const totalTests = memberTests.length;
      const testPassRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

      const avgExecutionTime = memberTests
        .filter(tc => tc.executionTime)
        .reduce((sum, tc) => sum + (tc.executionTime || 0), 0) / memberTests.filter(tc => tc.executionTime).length || 0;

      const qualityScore = Math.round(
        (testPassRate * 0.4 +
          (memberStories.length > 0 ? (approvedStories / memberStories.length) * 100 : 0) * 0.4 +
          (memberBugs.length > 0 ? (bugsResolved / memberBugs.length) * 100 : 100) * 0.2)
      );

      const productivityScore = Math.round(
        completedPoints / Math.max(memberStories.length, 1)
      );

      return {
        name: member,
        totalStories: memberStories.length,
        completedStories,
        completedPoints,
        totalPoints,
        velocity: completedPoints,
        approvedStories,
        approvalRate: memberStories.length > 0 ? Math.round((approvedStories / memberStories.length) * 100) : 0,
        bugsCreated,
        bugsAssigned: memberBugs.length,
        bugsResolved,
        bugResolutionRate: memberBugs.length > 0 ? Math.round((bugsResolved / memberBugs.length) * 100) : 0,
        totalTests,
        passedTests,
        testPassRate,
        avgExecutionTime: Math.round(avgExecutionTime),
        qualityScore,
        productivityScore,
      };
    });
  }, [teamMembers, stories, bugs, testCases, selectedSprint]);

  const selectedMemberData = useMemo(() => {
    if (!selectedMember) return null;
    return teamMetrics.find(m => m.name === selectedMember);
  }, [selectedMember, teamMetrics]);

  const teamTotals = useMemo(() => {
    return {
      totalStories: teamMetrics.reduce((sum, m) => sum + m.totalStories, 0),
      completedStories: teamMetrics.reduce((sum, m) => sum + m.completedStories, 0),
      totalVelocity: teamMetrics.reduce((sum, m) => sum + m.velocity, 0),
      avgQualityScore: teamMetrics.length > 0
        ? Math.round(teamMetrics.reduce((sum, m) => sum + m.qualityScore, 0) / teamMetrics.length)
        : 0,
      totalBugsResolved: teamMetrics.reduce((sum, m) => sum + m.bugsResolved, 0),
      totalTests: teamMetrics.reduce((sum, m) => sum + m.totalTests, 0),
    };
  }, [teamMetrics]);

  const performanceRankings = useMemo(() => {
    return {
      byVelocity: [...teamMetrics].sort((a, b) => b.velocity - a.velocity),
      byQuality: [...teamMetrics].sort((a, b) => b.qualityScore - a.qualityScore),
      byTestPass: [...teamMetrics].sort((a, b) => b.testPassRate - a.testPassRate),
      byApproval: [...teamMetrics].sort((a, b) => b.approvalRate - a.approvalRate),
    };
  }, [teamMetrics]);

  const COLORS = ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Team Performance Analytics</h1>
          <p className="text-gray-600">Individual and team productivity & quality metrics</p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedSprint}
            onChange={(e) => setSelectedSprint(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
          >
            {sprints.map(sprint => (
              <option key={sprint} value={sprint}>
                {sprint}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="mb-6 flex gap-2 border-b border-gray-200">
        {[
          { id: 'overview', label: 'Team Overview' },
          { id: 'individual', label: 'Individual Performance' },
          { id: 'quality', label: 'Quality Metrics' },
          { id: 'productivity', label: 'Productivity' },
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

      {/* Team Overview */}
      {viewMode === 'overview' && (
        <div className="space-y-6">
          {/* Team Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-lg p-4">
              <div className="text-sm text-indigo-600 mb-1">Team Velocity</div>
              <div className="text-3xl mb-1">{teamTotals.totalVelocity}</div>
              <div className="text-xs text-indigo-600">Story Points Completed</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
              <div className="text-sm text-green-600 mb-1">Avg Quality Score</div>
              <div className="text-3xl mb-1">{teamTotals.avgQualityScore}%</div>
              <div className="text-xs text-green-600">Team Average</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
              <div className="text-sm text-purple-600 mb-1">Stories Completed</div>
              <div className="text-3xl mb-1">{teamTotals.completedStories}</div>
              <div className="text-xs text-purple-600">Out of {teamTotals.totalStories} Total</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
              <div className="text-sm text-orange-600 mb-1">Bugs Resolved</div>
              <div className="text-3xl mb-1">{teamTotals.totalBugsResolved}</div>
              <div className="text-xs text-orange-600">Team Total</div>
            </div>
          </div>

          {/* Velocity Comparison */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg mb-4 text-gray-900">Team Member Velocity Comparison</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={teamMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completedPoints" name="Completed Points" fill="#3b82f6" />
                <Bar dataKey="totalPoints" name="Total Assigned Points" fill="#94a3b8" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Quality vs Productivity Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg mb-4 text-gray-900">Quality Scores</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={teamMetrics} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="qualityScore" name="Quality Score">
                    {teamMetrics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg mb-4 text-gray-900">Test Pass Rates</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={teamMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="testPassRate" name="Test Pass Rate %" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Performers */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg mb-4 text-gray-900">🏆 Top Performers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Highest Velocity</h4>
                <div className="space-y-2">
                  {performanceRankings.byVelocity.slice(0, 3).map((member, index) => (
                    <div key={member.name} className="flex items-center gap-3 p-2 bg-indigo-50 rounded">
                      <span className="text-2xl">{['🥇', '🥈', '🥉'][index]}</span>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{member.name}</div>
                        <div className="text-sm text-gray-600">{member.velocity} points</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Highest Quality Score</h4>
                <div className="space-y-2">
                  {performanceRankings.byQuality.slice(0, 3).map((member, index) => (
                    <div key={member.name} className="flex items-center gap-3 p-2 bg-green-50 rounded">
                      <span className="text-2xl">{['🥇', '🥈', '🥉'][index]}</span>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{member.name}</div>
                        <div className="text-sm text-gray-600">{member.qualityScore}% quality score</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Individual Performance */}
      {viewMode === 'individual' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Team Member</label>
            <select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
            >
              <option value="">-- Select a team member --</option>
              {teamMembers.map(member => (
                <option key={member} value={member}>
                  {member}
                </option>
              ))}
            </select>
          </div>

          {selectedMemberData ? (
            <>
              {/* Individual Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <div className="text-sm text-indigo-600 mb-1">Velocity</div>
                  <div className="text-3xl mb-1">{selectedMemberData.velocity}</div>
                  <div className="text-xs text-indigo-600">Story Points</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-sm text-green-600 mb-1">Quality Score</div>
                  <div className="text-3xl mb-1">{selectedMemberData.qualityScore}%</div>
                  <div className="text-xs text-green-600">Overall Quality</div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="text-sm text-purple-600 mb-1">Test Pass Rate</div>
                  <div className="text-3xl mb-1">{selectedMemberData.testPassRate}%</div>
                  <div className="text-xs text-purple-600">{selectedMemberData.passedTests}/{selectedMemberData.totalTests}</div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="text-sm text-orange-600 mb-1">Bug Resolution</div>
                  <div className="text-3xl mb-1">{selectedMemberData.bugResolutionRate}%</div>
                  <div className="text-xs text-orange-600">{selectedMemberData.bugsResolved} Resolved</div>
                </div>
              </div>

              {/* Performance Radar Chart */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg mb-4 text-gray-900">Performance Profile - {selectedMember}</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={[
                    { metric: 'Velocity', value: Math.min(selectedMemberData.velocity, 100) },
                    { metric: 'Quality', value: selectedMemberData.qualityScore },
                    { metric: 'Test Pass', value: selectedMemberData.testPassRate },
                    { metric: 'Approval', value: selectedMemberData.approvalRate },
                    { metric: 'Bug Resolution', value: selectedMemberData.bugResolutionRate },
                  ]}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis domain={[0, 100]} />
                    <Radar name={selectedMember} dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Detailed Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg mb-4 text-gray-900">Story Metrics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Stories</span>
                      <span className="font-medium">{selectedMemberData.totalStories}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Completed</span>
                      <span className="font-medium text-green-600">{selectedMemberData.completedStories}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Approved</span>
                      <span className="font-medium text-indigo-600">{selectedMemberData.approvedStories}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Approval Rate</span>
                      <span className="font-medium">{selectedMemberData.approvalRate}%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg mb-4 text-gray-900">Bug Metrics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bugs Created (Reported)</span>
                      <span className="font-medium">{selectedMemberData.bugsCreated}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bugs Assigned</span>
                      <span className="font-medium">{selectedMemberData.bugsAssigned}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bugs Resolved</span>
                      <span className="font-medium text-green-600">{selectedMemberData.bugsResolved}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Resolution Rate</span>
                      <span className="font-medium">{selectedMemberData.bugResolutionRate}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Insights */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <h4 className="text-gray-800 mb-2">📊 Performance Insights</h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>
                    • <strong>Velocity:</strong> {selectedMemberData.velocity} points{' '}
                    {selectedMemberData.velocity >= teamTotals.totalVelocity / teamMetrics.length
                      ? '(Above team average ✓)'
                      : '(Below team average)'}
                  </li>
                  <li>
                    • <strong>Quality:</strong> {selectedMemberData.qualityScore}%{' '}
                    {selectedMemberData.qualityScore >= teamTotals.avgQualityScore
                      ? '(Above team average ✓)'
                      : '(Below team average)'}
                  </li>
                  <li>
                    • <strong>Test Performance:</strong> {selectedMemberData.testPassRate}% pass rate{' '}
                    {selectedMemberData.testPassRate >= 85 ? '(Excellent ✓)' : '(Needs improvement)'}
                  </li>
                  {selectedMemberData.avgExecutionTime > 0 && (
                    <li>
                      • <strong>Avg Test Execution:</strong> {selectedMemberData.avgExecutionTime}ms per test
                    </li>
                  )}
                </ul>
              </div>
            </>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
              <p className="text-gray-600">Please select a team member to view their performance metrics.</p>
            </div>
          )}
        </div>
      )}

      {/* Quality Metrics */}
      {viewMode === 'quality' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg mb-4 text-gray-900">Quality Metrics Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-700">Team Member</th>
                    <th className="px-4 py-3 text-center text-gray-700">Quality Score</th>
                    <th className="px-4 py-3 text-center text-gray-700">Test Pass Rate</th>
                    <th className="px-4 py-3 text-center text-gray-700">Approval Rate</th>
                    <th className="px-4 py-3 text-center text-gray-700">Bug Resolution</th>
                    <th className="px-4 py-3 text-center text-gray-700">Tests Run</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {performanceRankings.byQuality.map(member => (
                    <tr key={member.name} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{member.name}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex px-3 py-1 rounded-full text-sm ${
                          member.qualityScore >= 90 ? 'bg-green-100 text-green-800' :
                          member.qualityScore >= 75 ? 'bg-indigo-100 text-indigo-800' :
                          member.qualityScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {member.qualityScore}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                member.testPassRate >= 90 ? 'bg-green-500' :
                                member.testPassRate >= 75 ? 'bg-indigo-500' :
                                'bg-yellow-500'
                              }`}
                              style={{ width: `${member.testPassRate}%` }}
                            ></div>
                          </div>
                          <span className="text-sm">{member.testPassRate}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">{member.approvalRate}%</td>
                      <td className="px-4 py-3 text-center">{member.bugResolutionRate}%</td>
                      <td className="px-4 py-3 text-center">{member.totalTests}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quality Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-2xl mb-1">
                {teamMetrics.filter(m => m.qualityScore >= 90).length}
              </div>
              <div className="text-sm text-gray-600">Excellent Quality (90%+)</div>
            </div>
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <div className="text-2xl mb-1">
                {teamMetrics.filter(m => m.qualityScore >= 75 && m.qualityScore < 90).length}
              </div>
              <div className="text-sm text-gray-600">Good Quality (75-89%)</div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="text-2xl mb-1">
                {teamMetrics.filter(m => m.qualityScore < 75).length}
              </div>
              <div className="text-sm text-gray-600">Needs Improvement (&lt;75%)</div>
            </div>
          </div>
        </div>
      )}

      {/* Productivity */}
      {viewMode === 'productivity' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg mb-4 text-gray-900">Productivity Metrics</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-700">Team Member</th>
                    <th className="px-4 py-3 text-center text-gray-700">Stories</th>
                    <th className="px-4 py-3 text-center text-gray-700">Completed</th>
                    <th className="px-4 py-3 text-center text-gray-700">Velocity</th>
                    <th className="px-4 py-3 text-center text-gray-700">Bugs Fixed</th>
                    <th className="px-4 py-3 text-center text-gray-700">Tests Written</th>
                    <th className="px-4 py-3 text-center text-gray-700">Avg Test Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {performanceRankings.byVelocity.map(member => (
                    <tr key={member.name} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{member.name}</td>
                      <td className="px-4 py-3 text-center">{member.totalStories}</td>
                      <td className="px-4 py-3 text-center text-green-600">{member.completedStories}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                          {member.velocity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">{member.bugsResolved}</td>
                      <td className="px-4 py-3 text-center">{member.totalTests}</td>
                      <td className="px-4 py-3 text-center text-sm text-gray-600">
                        {member.avgExecutionTime > 0 ? `${member.avgExecutionTime}ms` : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Velocity Trends */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg mb-4 text-gray-900">Velocity Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceRankings.byVelocity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completedStories" name="Stories Completed" fill="#22c55e" />
                <Bar dataKey="bugsResolved" name="Bugs Resolved" fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
