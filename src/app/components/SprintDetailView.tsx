import { X, Calendar, Target, TrendingUp, CheckCircle, Clock } from 'lucide-react';

interface Sprint {
  id: string;
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  status: 'Planning' | 'Active' | 'Completed' | 'Cancelled';
  velocity: number;
  capacity: number;
  stories?: string[];
  completedStories?: number;
  releaseId?: string;
}

interface SprintDetailViewProps {
  sprint: Sprint;
  onClose: () => void;
  releaseName?: string;
}

export function SprintDetailView({ sprint, onClose, releaseName }: SprintDetailViewProps) {
  const startDate = new Date(sprint.startDate);
  const endDate = new Date(sprint.endDate);
  const today = new Date();
  const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysElapsed = Math.max(0, Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  const progressPercentage = sprint.status === 'Completed' ? 100 : Math.min(100, (daysElapsed / duration) * 100);

  const getStatusColor = (status: Sprint['status']) => {
    switch (status) {
      case 'Planning':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600';
      case 'Active':
        return 'bg-green-100 dark:bg-green-950/35 text-green-800 dark:text-green-200 border-green-300 dark:border-green-850';
      case 'Completed':
        return 'bg-indigo-100 dark:bg-indigo-950/35 text-indigo-800 dark:text-indigo-200 border-indigo-300 dark:border-indigo-850';
      case 'Cancelled':
        return 'bg-red-100 dark:bg-red-950/35 text-red-800 dark:text-red-200 border-red-300 dark:border-red-850';
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose}></div>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800 rounded-t-lg flex-shrink-0">
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{sprint.name}</h2>
              <div className="flex items-center gap-3 mt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(sprint.status)}`}>
                  {sprint.status}
                </span>
                {releaseName && (
                  <span className="px-3 py-1 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40 rounded-full text-sm text-purple-800 dark:text-purple-200">
                    Release: {releaseName}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
            {/* Sprint Goal */}
            <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-indigo-900 dark:text-indigo-200 mb-1">Sprint Goal</h3>
                  <p className="text-indigo-800 dark:text-indigo-300">{sprint.goal}</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Timeline</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Start Date</div>
                  <div className="font-medium text-gray-900 dark:text-white">{startDate.toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">End Date</div>
                  <div className="font-medium text-gray-900 dark:text-white">{endDate.toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Duration</div>
                  <div className="font-medium text-gray-900 dark:text-white">{duration} days</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Days Remaining</div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {sprint.status === 'Completed' ? 'Completed' : sprint.status === 'Planning' ? 'Not started' : `${daysRemaining} days`}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              {sprint.status !== 'Planning' && sprint.status !== 'Cancelled' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Time Progress</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{Math.round(progressPercentage)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-indigo-500 h-2 rounded-full transition-all"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Velocity</span>
                </div>
                <div className="text-2xl font-semibold text-gray-900 dark:text-white">{sprint.velocity}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Story points</div>
              </div>

              <div className="bg-white dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Capacity</span>
                </div>
                <div className="text-2xl font-semibold text-gray-900 dark:text-white">{sprint.capacity}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Available points</div>
              </div>

              <div className="bg-white dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Stories</span>
                </div>
                <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {sprint.completedStories || 0} / {sprint.stories?.length || 0}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Completed</div>
              </div>
            </div>

            {/* Stories List (if available) */}
            {sprint.stories && sprint.stories.length > 0 && (
              <div className="bg-white dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Sprint Stories</h3>
                <div className="space-y-2">
                  {sprint.stories.map((storyId, index) => (
                    <div
                      key={storyId}
                      className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-900/50 rounded border border-gray-200 dark:border-gray-750"
                    >
                      <span className="font-mono text-sm text-gray-600 dark:text-gray-400">{storyId}</span>
                      <span className="text-sm text-gray-700 dark:text-gray-300">Story {index + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end bg-gray-50 dark:bg-gray-800 rounded-b-lg flex-shrink-0">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
