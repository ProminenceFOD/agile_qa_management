import { useState, useEffect } from 'react';
import { SprintForm } from './SprintForm';
import { ReleaseForm } from './ReleaseForm';
import { NotificationModal } from './NotificationModal';
import { SprintDetailView } from './SprintDetailView';
import { Plus, Calendar, List, Package, Eye, Target } from 'lucide-react';

interface Sprint {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  goal: string;
  capacity: number;
  committed: number;
  completed: number;
  status: 'Planning' | 'Active' | 'Completed';
  release?: string;
  stories: string[];
  retrospective?: {
    whatWentWell: string[];
    whatDidntGo: string[];
    actionItems: string[];
  };
}

interface Release {
  id: string;
  name: string;
  version: string;
  targetDate: Date;
  status: 'Planning' | 'In Progress' | 'Released';
  sprints: string[];
  features: string[];
}

export function SprintManagement() {
  const [viewMode, setViewMode] = useState<'calendar' | 'list' | 'releases'>(
    'list'
  );
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
  const [showSprintForm, setShowSprintForm] = useState(false);
  const [showReleaseForm, setShowReleaseForm] = useState(false);
  const [notification, setNotification] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success' as const,
  });

  const [sprints, setSprints] = useState<Sprint[]>([
    {
      id: 'SPR-012',
      name: 'Sprint 12',
      startDate: new Date('2026-04-14'),
      endDate: new Date('2026-04-25'),
      goal: 'Complete payment gateway and authentication features',
      capacity: 35,
      committed: 32,
      completed: 28,
      status: 'Active',
      release: 'v2.1',
      stories: ['US-101', 'US-102', 'US-103', 'US-105'],
      retrospective: undefined,
    },
    {
      id: 'SPR-013',
      name: 'Sprint 13',
      startDate: new Date('2026-04-28'),
      endDate: new Date('2026-05-09'),
      goal: 'User profile features and search improvements',
      capacity: 30,
      committed: 25,
      completed: 0,
      status: 'Planning',
      release: 'v2.1',
      stories: ['US-104', 'US-106'],
    },
    {
      id: 'SPR-011',
      name: 'Sprint 11',
      startDate: new Date('2026-03-31'),
      endDate: new Date('2026-04-11'),
      goal: 'Dashboard analytics and reporting',
      capacity: 32,
      committed: 30,
      completed: 30,
      status: 'Completed',
      release: 'v2.0',
      stories: ['US-103'],
      retrospective: {
        whatWentWell: [
          'Team collaboration was excellent',
          'All stories completed on time',
          'Code quality improved',
        ],
        whatDidntGo: [
          'Some technical debt accumulated',
          'Testing was rushed at the end',
        ],
        actionItems: [
          'Allocate time for technical debt in next sprint',
          'Start testing earlier in the sprint',
        ],
      },
    },
  ]);

  const [releases, setReleases] = useState<Release[]>([
    {
      id: 'REL-2.1',
      name: 'Version 2.1',
      version: 'v2.1.0',
      targetDate: new Date('2026-05-15'),
      status: 'In Progress',
      sprints: ['SPR-012', 'SPR-013'],
      features: ['Payment Gateway', 'Enhanced Authentication', 'User Profiles'],
    },
    {
      id: 'REL-2.0',
      name: 'Version 2.0',
      version: 'v2.0.0',
      targetDate: new Date('2026-04-15'),
      status: 'Released',
      sprints: ['SPR-010', 'SPR-011'],
      features: ['Dashboard Redesign', 'Analytics Engine'],
    },
  ]);

  const getStatusColor = (status: Sprint['status']) => {
    switch (status) {
      case 'Planning':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Completed':
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getReleaseStatusColor = (status: Release['status']) => {
    switch (status) {
      case 'Planning':
        return 'bg-indigo-100 text-indigo-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Released':
        return 'bg-green-100 text-green-800';
    }
  };

  const getDaysRemaining = (endDate: Date) => {
    const today = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const activeSprint = sprints.find((s) => s.status === 'Active');

  const handleCreateSprint = (
    sprint: Omit<Sprint, 'id' | 'committed' | 'completed' | 'stories'>
  ) => {
    const newSprint: Sprint = {
      ...sprint,
      id: `SPR-${String(sprints.length + 1).padStart(3, '0')}`,
      committed: 0,
      completed: 0,
      stories: [],
    };
    setSprints([...sprints, newSprint]);
    setShowSprintForm(false);
    setNotification({
      isOpen: true,
      title: 'Success',
      message: `Sprint ${newSprint.name} created successfully!`,
      type: 'success',
    });
  };

  const handleCreateRelease = (release: Omit<Release, 'id' | 'sprints'>) => {
    const newRelease: Release = {
      ...release,
      id: `REL-${release.version}`,
      sprints: [],
    };
    setReleases([...releases, newRelease]);
    setShowReleaseForm(false);
    setNotification({
      isOpen: true,
      title: 'Success',
      message: `Release ${newRelease.name} created successfully!`,
      type: 'success',
    });
  };

  // Listen for quick create trigger
  useEffect(() => {
    const quickCreate = localStorage.getItem('aqms_quick_create');
    if (quickCreate === 'sprint') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowSprintForm(true);
      localStorage.removeItem('aqms_quick_create');
    }
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Sprint & Release Management</h1>
          <p className="text-gray-600">Plan and track sprints and releases</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSprintForm(true)}
            className="btn btn-primary btn-lg bg-gradient-to-r from-indigo-600 to-indigo-600 hover:from-indigo-700 hover:to-indigo-700 shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Sprint
          </button>
          <button
            onClick={() => setShowReleaseForm(true)}
            className="btn btn-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl hover:scale-105 transition-all text-white"
          >
            <Plus className="w-4 h-4" />
            Create Release
          </button>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setViewMode('list')}
          className={`btn ${
            viewMode === 'list' ? 'btn-primary' : 'btn-secondary'
          }`}
        >
          <List className="w-4 h-4" />
          Sprint List
        </button>
        <button
          onClick={() => setViewMode('calendar')}
          className={`btn ${
            viewMode === 'calendar' ? 'btn-primary' : 'btn-secondary'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Calendar View
        </button>
        <button
          onClick={() => setViewMode('releases')}
          className={`btn ${
            viewMode === 'releases' ? 'btn-primary' : 'btn-secondary'
          }`}
        >
          <Package className="w-4 h-4" />
          Releases
        </button>
      </div>

      {/* Active Sprint Highlight */}
      {activeSprint && viewMode === 'list' && (
        <div className="mb-6 bg-gradient-to-r from-green-50 to-indigo-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="w-6 h-6 text-green-600" />
              <div>
                <h2 className="text-xl font-medium text-gray-900">
                  Active Sprint: {activeSprint.name}
                </h2>
                <p className="text-gray-600">{activeSprint.goal}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                {getDaysRemaining(activeSprint.endDate)} days left
              </div>
              <div className="text-sm text-gray-600">
                Ends {new Date(activeSprint.endDate).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Capacity</div>
              <div className="text-2xl font-bold text-gray-900">
                {activeSprint.capacity} pts
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Committed</div>
              <div className="text-2xl font-bold text-indigo-600">
                {activeSprint.committed} pts
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Completed</div>
              <div className="text-2xl font-bold text-green-600">
                {activeSprint.completed} pts
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Progress</span>
              <span className="text-sm font-medium text-gray-900">
                {(
                  (activeSprint.completed / activeSprint.committed) *
                  100
                ).toFixed(0)}
                %
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full transition-all"
                style={{
                  width: `${(activeSprint.completed / activeSprint.committed) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Sprint List View */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm text-gray-700">
                  Sprint
                </th>
                <th className="px-6 py-4 text-left text-sm text-gray-700">
                  Goal
                </th>
                <th className="px-6 py-4 text-center text-sm text-gray-700">
                  Status
                </th>
                <th className="px-6 py-4 text-center text-sm text-gray-700">
                  Duration
                </th>
                <th className="px-6 py-4 text-center text-sm text-gray-700">
                  Capacity
                </th>
                <th className="px-6 py-4 text-center text-sm text-gray-700">
                  Committed
                </th>
                <th className="px-6 py-4 text-center text-sm text-gray-700">
                  Completed
                </th>
                <th className="px-6 py-4 text-center text-sm text-gray-700">
                  Velocity
                </th>
                <th className="px-6 py-4 text-center text-sm text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sprints.map((sprint) => {
                const velocity =
                  sprint.status === 'Completed' ? sprint.completed : 0;
                return (
                  <tr key={sprint.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {sprint.name}
                      </div>
                      <div className="text-xs text-gray-500">{sprint.id}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {sprint.goal}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full border text-xs ${getStatusColor(sprint.status)}`}
                      >
                        {sprint.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      {new Date(sprint.startDate).toLocaleDateString()} -{' '}
                      {new Date(sprint.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-900">
                      {sprint.capacity}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-indigo-600">
                      {sprint.committed}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-green-600">
                      {sprint.completed}
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-medium text-gray-900">
                      {velocity > 0 ? velocity : '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setSelectedSprint(sprint)}
                        className="btn btn-primary btn-sm"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl mb-4 text-gray-800">Sprint Timeline</h2>
          <div className="space-y-4">
            {sprints.map((sprint, index) => {
              const duration = Math.ceil(
                (new Date(sprint.endDate).getTime() -
                  new Date(sprint.startDate).getTime()) /
                  (1000 * 60 * 60 * 24)
              );
              return (
                <div key={sprint.id} className="relative">
                  <div className="flex items-center gap-4">
                    <div className="w-32 text-sm text-gray-600">
                      {sprint.name}
                    </div>
                    <div className="flex-1 relative h-12 bg-gray-100 rounded">
                      <div
                        className={`absolute h-full rounded flex items-center px-3 text-white text-sm ${
                          sprint.status === 'Active'
                            ? 'bg-green-500'
                            : sprint.status === 'Completed'
                              ? 'bg-gray-400'
                              : 'bg-indigo-500'
                        }`}
                        style={{ width: '100%' }}
                      >
                        <span className="truncate">{sprint.goal}</span>
                        <span className="ml-auto text-xs">{duration}d</span>
                      </div>
                    </div>
                    <div className="w-24 text-xs text-gray-600 text-right">
                      {new Date(sprint.startDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Releases View */}
      {viewMode === 'releases' && (
        <div className="space-y-6">
          {releases.map((release) => (
            <div
              key={release.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-medium text-gray-900">
                      {release.name}
                    </h2>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${getReleaseStatusColor(release.status)}`}
                    >
                      {release.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Version: {release.version}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Target Release</div>
                  <div className="text-lg font-medium text-gray-900">
                    {new Date(release.targetDate).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Features
                </h3>
                <div className="flex flex-wrap gap-2">
                  {release.features.map((feature, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-50 border border-purple-200 rounded-full text-sm text-purple-800"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Sprints
                </h3>
                <div className="flex gap-2">
                  {release.sprints.map((sprintId) => {
                    const sprint = sprints.find((s) => s.id === sprintId);
                    return sprint ? (
                      <span
                        key={sprintId}
                        className="px-3 py-1 bg-indigo-50 border border-indigo-200 rounded text-sm text-indigo-800"
                      >
                        {sprint.name}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sprint Form Modal */}
      {showSprintForm && (
        <SprintForm
          onClose={() => setShowSprintForm(false)}
          onSubmit={handleCreateSprint}
          releases={releases.map((r) => ({ id: r.id, name: r.name }))}
        />
      )}

      {/* Release Form Modal */}
      {showReleaseForm && (
        <ReleaseForm
          onClose={() => setShowReleaseForm(false)}
          onSubmit={handleCreateRelease}
        />
      )}

      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />

      {/* Sprint Detail View */}
      {selectedSprint && (
        <SprintDetailView
          sprint={{
            id: selectedSprint.id,
            name: selectedSprint.name,
            goal: selectedSprint.goal,
            startDate: selectedSprint.startDate.toISOString(),
            endDate: selectedSprint.endDate.toISOString(),
            status: selectedSprint.status,
            velocity: selectedSprint.completed,
            capacity: selectedSprint.capacity,
            stories: [],
            completedStories: selectedSprint.completed,
            releaseId: selectedSprint.releaseId,
          }}
          onClose={() => setSelectedSprint(null)}
          releaseName={
            releases.find((r) => r.id === selectedSprint.releaseId)?.name
          }
        />
      )}
    </div>
  );
}
