import { FileText, CheckCircle, Lock, Zap, TrendingUp } from 'lucide-react';
import { defaultStories } from '../utils/defaultData';
import { useAuth } from '../contexts/AuthContext';
import { useSupabaseData } from '../hooks/useSupabaseData';

export function Dashboard() {
  const { user } = useAuth();


  // Load stories from Supabase using same hook as CriteriaValidator
  const { data: stories } = useSupabaseData<any[]>('aqms_stories', defaultStories);

  const modules = [
    { name: 'Payment Gateway', riskLevel: 'High' },
    { name: 'Authentication', riskLevel: 'High' },
    { name: 'User Profile', riskLevel: 'Medium' },
    { name: 'Dashboard', riskLevel: 'Medium' },
    { name: 'Email Notifications', riskLevel: 'Low' },
    { name: 'Search', riskLevel: 'Low' },
  ];

  const burndownStories = [
    { id: 'US-101', state: 'Tested' },
    { id: 'US-102', state: 'Testing' },
    { id: 'US-103', state: 'Bugs Found' },
    { id: 'US-105', state: 'Tested' },
  ];

  // Calculate metrics
  const totalStories = stories.length;
  const readyForDev = stories.filter(s => s.acceptanceCriteria && s.qaSignOff && s.pmApproval).length;
  const lockedStories = totalStories - readyForDev;
  const criticalStories = stories.filter(s => s.priority === 'Critical').length;

  const totalModules = modules.length;
  const highRiskModules = modules.filter(m => m.riskLevel === 'High').length;

  const testedStories = burndownStories.filter(s => s.state === 'Tested').length;
  const testingStories = burndownStories.filter(s => s.state === 'Testing').length;
  const bugsFound = burndownStories.filter(s => s.state === 'Bugs Found').length;

  const totalStoryPoints = stories.reduce((sum, s) => sum + (s.storyPoints || 0), 0);
  const completedPoints = stories.filter(s => s.qaSignOff && s.pmApproval).reduce((sum, s) => sum + (s.storyPoints || 0), 0);

  // Research-specific metrics
  const storiesAwaitingQAReview = stories.filter(s => !s.qaSignOff && s.acceptanceCriteria);
  const storiesAwaitingPMApproval = stories.filter(s => s.qaSignOff && !s.pmApproval);
  const storiesWithoutQAReviewer = stories.filter(s => !s.assignedQAReviewer);
  const activeSprintStories = stories.filter(s => s.sprint === 'Sprint 12');
  const activeSprintReady = activeSprintStories.filter(s => s.acceptanceCriteria && s.qaSignOff && s.pmApproval).length;

  // Sprint breakdown
  const sprintData = stories.reduce((acc: any, story) => {
    const sprint = story.sprint || 'Unassigned';
    if (!acc[sprint]) {
      acc[sprint] = { total: 0, ready: 0, locked: 0 };
    }
    acc[sprint].total++;
    if (story.acceptanceCriteria && story.qaSignOff && story.pmApproval) {
      acc[sprint].ready++;
    } else {
      acc[sprint].locked++;
    }
    return acc;
  }, {});

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome back, {user?.name}!</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card fade-in p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Stories</h3>
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{totalStories}</div>
          <div className="text-sm text-gray-500">{totalStoryPoints} story points</div>
        </div>

        <div className="card fade-in p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Ready for Dev</h3>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-green-700 mb-1">{readyForDev}</div>
          <div className="text-sm text-green-600">{((readyForDev / totalStories) * 100).toFixed(0)}% of total</div>
        </div>

        <div className="card fade-in p-6 bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Locked Stories</h3>
            <Lock className="w-8 h-8 text-red-600" />
          </div>
          <div className="text-3xl font-bold text-red-700 mb-1">{lockedStories}</div>
          <div className="text-sm text-red-600">{criticalStories} critical priority</div>
        </div>

        <div className="card fade-in p-6 bg-gradient-to-br from-indigo-50 to-indigo-50 border-indigo-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Sprint Velocity</h3>
            <Zap className="w-8 h-8 text-indigo-600" />
          </div>
          <div className="text-3xl font-bold text-indigo-700 mb-1 flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            {completedPoints}
          </div>
          <div className="text-sm text-indigo-600">of {totalStoryPoints} points</div>
        </div>
      </div>

      {/* Quality Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Quality Burn-Down Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium">Tested</span>
              <span className="badge badge-success">{testedStories}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium">Testing</span>
              <span className="badge badge-info">{testingStories}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium">Bugs Found</span>
              <span className="badge badge-warning">{bugsFound}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium">Not Started</span>
              <span className="badge badge-neutral">
                {burndownStories.length - testedStories - testingStories - bugsFound}
              </span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Risk Assessment Summary</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700 font-medium">High Risk Modules</span>
                <span className="badge badge-error">
                  {highRiskModules}
                </span>
              </div>
              {modules.filter(m => m.riskLevel === 'High').length > 0 && (
                <div className="space-y-2 ml-4 max-h-32 overflow-y-auto">
                  {modules.filter(m => m.riskLevel === 'High').map(module => (
                    <div key={module.name} className="flex items-center gap-2 text-sm">
                      <span className="text-red-500">⚠️</span>
                      <span className="text-gray-700">{module.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700 font-medium">Medium Risk</span>
                <span className="badge badge-warning">
                  {modules.filter(m => m.riskLevel === 'Medium').length}
                </span>
              </div>
              {modules.filter(m => m.riskLevel === 'Medium').length > 0 && (
                <div className="space-y-2 ml-4 max-h-32 overflow-y-auto">
                  {modules.filter(m => m.riskLevel === 'Medium').map(module => (
                    <div key={module.name} className="flex items-center gap-2 text-sm">
                      <span className="text-yellow-500">⚠</span>
                      <span className="text-gray-700">{module.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700">Low Risk</span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full border border-green-200">
                  {modules.filter(m => m.riskLevel === 'Low').length}
                </span>
              </div>
              {modules.filter(m => m.riskLevel === 'Low').length > 0 && (
                <div className="space-y-2 ml-4 max-h-32 overflow-y-auto">
                  {modules.filter(m => m.riskLevel === 'Low').map(module => (
                    <div key={module.name} className="flex items-center gap-2 text-sm">
                      <span className="text-green-500">✓</span>
                      <span className="text-gray-700">{module.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="text-sm text-gray-500 mt-4 pt-3 border-t border-gray-200">
              Total modules under assessment: {totalModules}
            </div>
          </div>
        </div>
      </div>

      {/* Sprint Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h3 className="text-lg mb-4 text-gray-800">Sprint Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-gray-700">Sprint</th>
                <th className="px-6 py-3 text-center text-gray-700">Total Stories</th>
                <th className="px-6 py-3 text-center text-gray-700">Ready</th>
                <th className="px-6 py-3 text-center text-gray-700">Locked</th>
                <th className="px-6 py-3 text-center text-gray-700">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Object.entries(sprintData).map(([sprint, data]: [string, any]) => (
                <tr key={sprint} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{sprint}</td>
                  <td className="px-6 py-4 text-center text-gray-700">{data.total}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded">{data.ready}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded">{data.locked}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${(data.ready / data.total) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">
                        {((data.ready / data.total) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quality Gate Workflow Status */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg mb-4 text-gray-800">🎯 Quality Gate Workflow Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Awaiting QA Review</div>
            <div className="text-2xl font-bold text-orange-600">{storiesAwaitingQAReview.length}</div>
            <div className="text-xs text-gray-500 mt-1">Need sign-off from QA Reviewer</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Awaiting PM Approval</div>
            <div className="text-2xl font-bold text-purple-600">{storiesAwaitingPMApproval.length}</div>
            <div className="text-xs text-gray-500 mt-1">QA approved, need PM sign-off</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">No QA Reviewer</div>
            <div className="text-2xl font-bold text-red-600">{storiesWithoutQAReviewer.length}</div>
            <div className="text-xs text-gray-500 mt-1">Missing QA Reviewer assignment</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Active Sprint Health</div>
            <div className="text-2xl font-bold text-green-600">
              {activeSprintStories.length > 0 ? Math.round((activeSprintReady / activeSprintStories.length) * 100) : 0}%
            </div>
            <div className="text-xs text-gray-500 mt-1">{activeSprintReady} of {activeSprintStories.length} ready</div>
          </div>
        </div>
      </div>

      {/* QA Reviewer Bottleneck Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg mb-4 text-gray-800">👤 QA Reviewer Queue</h3>
          {storiesAwaitingQAReview.length > 0 ? (
            <div className="space-y-3">
              {storiesAwaitingQAReview.map(story => (
                <div key={story.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div>
                    <div className="font-medium text-gray-900">{story.id}</div>
                    <div className="text-xs text-gray-600">
                      Reviewer: {story.assignedQAReviewer || 'Not assigned'}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    story.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                    story.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {story.priority}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              ✅ No stories waiting for QA review
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg mb-4 text-gray-800">📋 PM Approval Queue</h3>
          {storiesAwaitingPMApproval.length > 0 ? (
            <div className="space-y-3">
              {storiesAwaitingPMApproval.map(story => (
                <div key={story.id} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div>
                    <div className="font-medium text-gray-900">{story.id}</div>
                    <div className="text-xs text-green-600">✓ QA Approved</div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    story.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                    story.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {story.priority}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              ✅ No stories waiting for PM approval
            </div>
          )}
        </div>
      </div>

      {/* Action Items */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg mb-4 text-gray-800">⚠️ Action Required</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          {lockedStories > 0 && (
            <li>• {lockedStories} stories are locked and need QA/PM sign-off</li>
          )}
          {criticalStories > 0 && (
            <li>• {criticalStories} critical priority stories require attention</li>
          )}
          {bugsFound > 0 && (
            <li>• {bugsFound} stories have bugs that need to be resolved</li>
          )}
          {highRiskModules > 0 && (
            <li>• {highRiskModules} high-risk modules need full regression testing</li>
          )}
          {storiesWithoutQAReviewer.length > 0 && (
            <li>• {storiesWithoutQAReviewer.length} stories missing QA Reviewer assignment</li>
          )}
          {storiesAwaitingQAReview.length > 0 && (
            <li>• {storiesAwaitingQAReview.length} stories awaiting QA Reviewer sign-off</li>
          )}
          {storiesAwaitingPMApproval.length > 0 && (
            <li>• {storiesAwaitingPMApproval.length} stories ready for PM approval</li>
          )}
        </ul>
      </div>
    </div>
  );
}
