import { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertTriangle, Circle, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { BurnDownStoryView } from './BurnDownStoryView';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { setData, getData } from '../utils/supabaseStorage';

type QualityState = 'Tested' | 'Testing' | 'Bugs Found' | 'Not Started';

interface StoryItem {
  id: string;
  title: string;
  state: QualityState;
  dayCompleted?: number;
  description?: string;
  notes?: string;
}

const defaultBurndownStories: StoryItem[] = [
  {
    id: 'US-101',
    title: 'User Authentication System',
    state: 'Tested',
    dayCompleted: 2,
  },
  {
    id: 'US-102',
    title: 'Dashboard Layout',
    state: 'Tested',
    dayCompleted: 3,
  },
  {
    id: 'US-103',
    title: 'Data Export Feature',
    state: 'Tested',
    dayCompleted: 4,
  },
  {
    id: 'US-104',
    title: 'Search Functionality',
    state: 'Tested',
    dayCompleted: 5,
  },
  {
    id: 'US-105',
    title: 'User Profile Management',
    state: 'Tested',
    dayCompleted: 5,
  },
  {
    id: 'US-106',
    title: 'Notification System',
    state: 'Tested',
    dayCompleted: 6,
  },
  {
    id: 'US-107',
    title: 'Report Generation',
    state: 'Testing',
  },
  {
    id: 'US-108',
    title: 'API Integration',
    state: 'Bugs Found',
  },
];

export function QualityBurnDown() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'list' | 'view'>('list');
  const [selectedStory, setSelectedStory] = useState<StoryItem | null>(null);
  const sprintDays = 10;
  const currentDay = 6;
  const sprintEndDate = '2026-05-02';

  const { data: stories, setData: setStories } = useSupabaseData<StoryItem[]>('aqms_burndown_stories', defaultBurndownStories);

  const updateStoryState = (id: string, newState: QualityState) => {
    setStories(stories.map(story =>
      story.id === id
        ? {
            ...story,
            state: newState,
            dayCompleted: newState === 'Tested' ? currentDay : undefined,
          }
        : story
    ));
    if (selectedStory && selectedStory.id === id) {
      setSelectedStory({
        ...selectedStory,
        state: newState,
        dayCompleted: newState === 'Tested' ? currentDay : undefined,
      });
    }
  };

  const handleViewStory = (story: StoryItem) => {
    setSelectedStory(story);
    setViewMode('view');
  };

  const handleBack = () => {
    setViewMode('list');
    setSelectedStory(null);
  };


  const getStateColor = (state: QualityState) => {
    switch (state) {
      case 'Tested':
        return 'badge-success';
      case 'Testing':
        return 'badge-info';
      case 'Bugs Found':
        return 'badge-warning';
      case 'Not Started':
        return 'badge-neutral';
    }
  };

  const stateCounts = {
    'Tested': stories.filter(s => s.state === 'Tested').length,
    'Testing': stories.filter(s => s.state === 'Testing').length,
    'Bugs Found': stories.filter(s => s.state === 'Bugs Found').length,
    'Not Started': stories.filter(s => s.state === 'Not Started').length,
  };

  const daysRemaining = sprintDays - currentDay;
  const storiesRemaining = stateCounts['Testing'] + stateCounts['Bugs Found'] + stateCounts['Not Started'];
  const storiesCompleted = stateCounts['Tested'];

  // Calculate sprint trajectory and health
  const totalStories = stories.length;
  const idealProgress = (currentDay / sprintDays) * totalStories;
  const actualProgress = storiesCompleted;
  const completionRate = currentDay > 0 ? storiesCompleted / currentDay : 0;
  const projectedCompletion = completionRate * sprintDays;
  const projectedRemainingDays = completionRate > 0 ? storiesRemaining / completionRate : Infinity;

  // Determine sprint health status
  type SprintHealth = 'On Track' | 'At Risk' | 'Behind Schedule' | 'Critical';
  let sprintHealth: SprintHealth;
  let healthColor: string;
  let healthIcon: string;
  let healthMessage: string;

  if (actualProgress >= idealProgress * 0.9) {
    // Within 10% of ideal progress
    sprintHealth = 'On Track';
    healthColor = 'bg-green-100 border-green-500 text-green-900';
    healthIcon = '✅';
    healthMessage = 'Sprint is progressing well. Current velocity suggests on-time completion.';
  } else if (actualProgress >= idealProgress * 0.7 && projectedRemainingDays <= daysRemaining * 1.2) {
    // Slightly behind but recoverable
    sprintHealth = 'At Risk';
    healthColor = 'bg-yellow-100 border-yellow-500 text-yellow-900';
    healthIcon = '⚠️';
    healthMessage = 'Sprint is behind schedule but recoverable with focused effort.';
  } else if (projectedRemainingDays <= daysRemaining * 1.5) {
    // Significantly behind
    sprintHealth = 'Behind Schedule';
    healthColor = 'bg-orange-100 border-orange-500 text-orange-900';
    healthIcon = '⏰';
    healthMessage = 'Sprint is significantly behind. Consider descoping or extending timeline.';
  } else {
    // Critically behind, unlikely to complete
    sprintHealth = 'Critical';
    healthColor = 'bg-red-100 border-red-500 text-red-900';
    healthIcon = '🚨';
    healthMessage = 'Sprint is critically behind schedule. Immediate intervention required.';
  }

  const burnDownData = Array.from({ length: sprintDays + 1 }, (_, i) => {
    const day = i;
    const testedByDay = stories.filter(s => s.dayCompleted !== undefined && s.dayCompleted <= day).length;
    const idealCompleted = (day / sprintDays) * totalStories;
    const projectedCompleted = day <= currentDay ? testedByDay : completionRate * day;

    return {
      day,
      tested: day <= currentDay ? testedByDay : null,
      ideal: idealCompleted,
      projected: projectedCompleted,
      total: stories.length,
      remaining: stories.length - (day <= currentDay ? testedByDay : projectedCompleted),
    };
  });

  const maxHeight = 200;

  const getRoleMessage = () => {
    if (user?.role === 'QA Engineer') {
      return 'You can update story quality states as testing progresses.';
    } else if (user?.role === 'Scrum Master') {
      return 'Monitor sprint progress and quality metrics.';
    } else {
      return 'View-only access. Track testing progress and sprint health.';
    }
  };

  if (viewMode === 'view' && selectedStory) {
    return (
      <BurnDownStoryView
        story={selectedStory}
        onUpdateState={updateStoryState}
        onBack={handleBack}
      />
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div>
          <h1 className="text-3xl mb-2">Quality Burn-Down Tracker</h1>
          <p className="text-gray-600">
            Real-time trajectory tracking with four sprint health states (On Track, At Risk, Behind Schedule, Critical)
            and automated deadline prediction based on current velocity
          </p>
        </div>
        <div className="mt-3 bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-2 text-sm text-indigo-800">
          <strong>{user?.role}:</strong> {getRoleMessage()}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card fade-in p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-3xl font-bold text-green-700 mb-1">{stateCounts['Tested']}</div>
              <div className="text-sm text-green-600 font-medium">Tested</div>
            </div>
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
        </div>
        <div className="card fade-in p-4 bg-gradient-to-br from-indigo-50 to-indigo-50 border-indigo-200">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-3xl font-bold text-indigo-700 mb-1">{stateCounts['Testing']}</div>
              <div className="text-sm text-indigo-600 font-medium">Testing</div>
            </div>
            <Clock className="w-10 h-10 text-indigo-600" />
          </div>
        </div>
        <div className="card fade-in p-4 bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-3xl font-bold text-orange-700 mb-1">{stateCounts['Bugs Found']}</div>
              <div className="text-sm text-orange-600 font-medium">Bugs Found</div>
            </div>
            <AlertTriangle className="w-10 h-10 text-orange-600" />
          </div>
        </div>
        <div className="card fade-in p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-3xl font-bold text-gray-700 mb-1">{stateCounts['Not Started']}</div>
              <div className="text-sm text-gray-600 font-medium">Not Started</div>
            </div>
            <Circle className="w-10 h-10 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Sprint Health Indicator */}
      <div className={`mb-6 border-l-4 rounded-lg p-6 ${healthColor}`}>
        <div className="flex items-start gap-4">
          <div className="text-4xl">{healthIcon}</div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-semibold">Sprint Status: {sprintHealth}</h3>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-white bg-opacity-50">
                Day {currentDay} of {sprintDays}
              </span>
            </div>
            <p className="text-sm mb-4 opacity-90">{healthMessage}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="opacity-75 mb-1">Progress</div>
                <div className="font-semibold">{storiesCompleted} / {totalStories} stories</div>
                <div className="text-xs opacity-75">{Math.round((storiesCompleted / totalStories) * 100)}% complete</div>
              </div>
              <div>
                <div className="opacity-75 mb-1">Velocity</div>
                <div className="font-semibold">{completionRate.toFixed(1)} stories/day</div>
                <div className="text-xs opacity-75">{currentDay > 0 ? 'Current pace' : 'Not started'}</div>
              </div>
              <div>
                <div className="opacity-75 mb-1">Projected Completion</div>
                <div className="font-semibold">{Math.round(projectedCompletion)} stories</div>
                <div className="text-xs opacity-75">
                  {projectedCompletion >= totalStories ? 'All stories' : `${totalStories - Math.round(projectedCompletion)} at risk`}
                </div>
              </div>
              <div>
                <div className="opacity-75 mb-1">Days Remaining</div>
                <div className="font-semibold">{daysRemaining} days</div>
                <div className="text-xs opacity-75">
                  {projectedRemainingDays === Infinity ? 'No progress yet' : `Need ${projectedRemainingDays.toFixed(1)} days`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Sprint Trajectory</h3>
          <div className="relative" style={{ height: '240px' }}>
            <svg width="100%" height="100%" viewBox="0 0 500 240" preserveAspectRatio="none">
              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map((percent) => (
                <line
                  key={percent}
                  x1="0"
                  y1={240 - (percent / 100) * 220}
                  x2="500"
                  y2={240 - (percent / 100) * 220}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
              ))}

              {/* Ideal burndown line (diagonal from 0 to total) */}
              <line
                x1="0"
                y1="240"
                x2="500"
                y2="20"
                stroke="#9ca3af"
                strokeWidth="2"
                strokeDasharray="5,5"
              />

              {/* Actual progress line */}
              <polyline
                points={burnDownData
                  .filter((d) => d.tested !== null)
                  .map((d, i) => {
                    const x = (d.day / sprintDays) * 500;
                    const y = 240 - (d.tested! / totalStories) * 220;
                    return `${x},${y}`;
                  })
                  .join(' ')}
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
              />

              {/* Projected trajectory line */}
              <polyline
                points={burnDownData
                  .filter((d) => d.day >= currentDay)
                  .map((d) => {
                    const x = (d.day / sprintDays) * 500;
                    const y = 240 - (d.projected / totalStories) * 220;
                    return `${x},${y}`;
                  })
                  .join(' ')}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2"
                strokeDasharray="5,5"
              />

              {/* Current day marker */}
              <line
                x1={(currentDay / sprintDays) * 500}
                y1="0"
                x2={(currentDay / sprintDays) * 500}
                y2="240"
                stroke="#6366f1"
                strokeWidth="2"
                strokeDasharray="3,3"
              />
            </svg>
          </div>
          <div className="mt-4 flex items-center justify-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-gray-400" style={{ borderTop: '2px dashed' }}></div>
              <span className="text-gray-600">Ideal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-green-500"></div>
              <span className="text-gray-600">Actual</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-orange-500" style={{ borderTop: '2px dashed' }}></div>
              <span className="text-gray-600">Projected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-indigo-500" style={{ borderTop: '2px dashed' }}></div>
              <span className="text-gray-600">Today</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Quality State Distribution</h3>
          <div className="space-y-3">
            {Object.entries(stateCounts).map(([state, count]) => {
              const percentage = (count / stories.length) * 100;
              return (
                <div key={state}>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-700">{state}</span>
                    <span className="text-gray-600">{count} stories</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${getStateColor(state as QualityState)}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="card overflow-auto max-h-[600px] custom-scrollbar mb-6">
        <table className="table-modern w-full">
          <thead>
            <tr>
              <th className="px-6 py-4 text-left text-gray-700">Story ID</th>
              <th className="px-6 py-4 text-left text-gray-700">Title</th>
              <th className="px-6 py-4 text-center text-gray-700">Quality State</th>
              <th className="px-6 py-4 text-center text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {stories.map((story) => (
              <tr key={story.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <span className="font-medium text-gray-900">{story.id}</span>
                </td>
                <td className="px-6 py-4 text-gray-700">{story.title}</td>
                <td className="text-center">
                  <span className={`badge ${getStateColor(story.state)}`}>
                    {story.state}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleViewStory(story)}
                      className="btn btn-secondary btn-sm"
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </button>
                    <button
                      onClick={() => updateStoryState(story.id, 'Testing')}
                      disabled={story.state === 'Testing' || user?.role !== 'QA Engineer'}
                      className="btn btn-primary btn-sm"
                    >
                      Testing
                    </button>
                    <button
                      onClick={() => updateStoryState(story.id, 'Bugs Found')}
                      disabled={story.state === 'Bugs Found' || user?.role !== 'QA Engineer'}
                      className="px-3 py-1.5 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-xs font-medium transition-colors"
                    >
                      Bug Found
                    </button>
                    <button
                      onClick={() => updateStoryState(story.id, 'Tested')}
                      disabled={story.state === 'Tested' || user?.role !== 'QA Engineer'}
                      className="btn btn-success btn-sm"
                    >
                      Tested
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
